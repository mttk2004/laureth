<?php

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\Order;
use App\Models\Payroll;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class PayrollService extends BaseService
{
  /**
   * Lấy model class
   */
  protected function getModelClass(): string
  {
    return Payroll::class;
  }

  /**
   * Lấy danh sách các trường hợp lệ để sắp xếp
   */
  protected function getValidSortFields(): array
  {
    return ['created_at', 'final_amount', 'status'];
  }

  /**
   * Áp dụng các bộ lọc cho payroll
   */
  protected function applyFilters(Builder $query, array $filters): Builder
  {
    // Lọc theo tháng
    if (isset($filters['month']) && $filters['month'] !== 'all') {
      $query->where('month', $filters['month']);
    }

    // Lọc theo năm
    if (isset($filters['year']) && $filters['year'] !== 'all') {
      $query->where('year', $filters['year']);
    }

    // Lọc theo trạng thái
    if (isset($filters['status']) && $filters['status'] !== 'all') {
      $query->where('status', $filters['status']);
    }

    // Lọc theo cửa hàng
    if (isset($filters['store_id']) && $filters['store_id'] !== 'all') {
      $query->whereHas('user', function ($q) use ($filters) {
        $q->where('store_id', $filters['store_id']);
      });
    }

    // Lọc theo vai trò
    if (isset($filters['position']) && $filters['position'] !== 'all') {
      $query->whereHas('user', function ($q) use ($filters) {
        $q->where('position', $filters['position']);
      });
    }

    // Lọc theo tên nhân viên
    if (isset($filters['name']) && ! empty($filters['name'])) {
      $query->whereHas('user', function ($q) use ($filters) {
        $q->where('full_name', 'like', '%' . $filters['name'] . '%');
      });
    }

    return $query;
  }

  /**
   * Lấy danh sách bảng lương với bộ lọc và sắp xếp
   *
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getPayrolls(array $filters = [], int $perPage = 10, string $sort = 'created_at_desc')
  {
    return $this->getDataWithFilters($filters, $perPage, $sort, ['user.store']);
  }

  /**
   * Lấy tổng quan về bảng lương theo tháng/năm và tổng số tiền đã chi trả
   *
   * @return array
   */
  public function getPayrollSummary()
  {
    $currentMonth = date('n');
    $currentYear = date('Y');

    // Lấy tháng/năm duy nhất có trong hệ thống
    $periods = Payroll::select('month', 'year')
      ->distinct()
      ->orderBy('year', 'desc')
      ->orderBy('month', 'desc')
      ->get()
      ->map(function ($item) {
        return [
          'month' => $item->month,
          'year' => $item->year,
          'label' => $item->month . '/' . $item->year,
        ];
      });

    // Tính tổng số tiền lương đã chi trả (status = paid)
    $totalPaidAmount = Payroll::where('status', 'paid')
      ->sum('final_amount');

    // Tính tổng số tiền lương đang chờ duyệt (status = pending)
    $totalPendingAmount = Payroll::where('status', 'pending')
      ->sum('final_amount');

    // Thống kê theo vai trò người dùng
    $payrollByPosition = DB::table('payrolls')
      ->join('users', 'payrolls.user_id', '=', 'users.id')
      ->selectRaw('users.position, count(*) as count, sum(payrolls.final_amount) as total_amount')
      ->groupBy('users.position')
      ->get();

    return [
      'periods' => $periods,
      'totalPaidAmount' => $totalPaidAmount,
      'totalPendingAmount' => $totalPendingAmount,
      'payrollByPosition' => $payrollByPosition,
    ];
  }

  /**
   * Duyệt bảng lương
   *
   * @return Payroll
   */
  public function approvePayroll(Payroll $payroll)
  {
    return DB::transaction(function () use ($payroll) {
      $payroll->update([
        'status' => 'paid',
      ]);

      return $payroll;
    });
  }

  /**
   * Kiểm tra xem đã có bảng lương cho nhân viên trong tháng/năm cụ thể chưa
   */
  public function checkPayrollExists(string $userId, int $month, int $year): bool
  {
    return Payroll::where('user_id', $userId)
      ->where('month', $month)
      ->where('year', $year)
      ->exists();
  }

  /**
   * Tạo bảng lương cho một nhân viên
   */
  public function createPayrollForUser(User $user, int $month, int $year): Payroll
  {
    return DB::transaction(function () use ($user, $month, $year) {
      // Tính tổng số giờ làm việc
      $totalHours = $this->calculateTotalHours($user->id, $month, $year);

      // Tính lương cơ bản
      $baseAmount = $this->calculateBaseAmount($user, $totalHours);

      // Tính hoa hồng
      $commissionAmount = $this->calculateCommissionAmount($user, $month, $year);

      // Tính tổng lương
      $finalAmount = $baseAmount + $commissionAmount;

      // Tạo bảng lương mới
      return Payroll::create([
        'user_id' => $user->id,
        'month' => $month,
        'year' => $year,
        'base_amount' => $baseAmount,
        'total_hours' => $totalHours,
        'commission_amount' => $commissionAmount,
        'final_amount' => $finalAmount,
        'status' => 'pending',
      ]);
    });
  }

  /**
   * Tính tổng số giờ làm việc của nhân viên trong tháng
   */
  private function calculateTotalHours(string $userId, int $month, int $year): float
  {
    $totalHours = AttendanceRecord::where('user_id', $userId)
      ->whereMonth('check_in', $month)
      ->whereYear('check_in', $year)
      ->sum('total_hours');

    return $totalHours > 0 ? $totalHours : 0;
  }

  /**
   * Tính lương cơ bản dựa trên vai trò và số giờ làm việc
   */
  private function calculateBaseAmount(User $user, float $totalHours): float
  {
    if ($user->position === 'SL' || $user->position === 'SA') {
      // Nhân viên làm theo giờ
      return $user->hourly_wage * $totalHours;
    } else {
      // Quản lý hưởng lương cơ bản
      return $user->base_salary;
    }
  }

  /**
   * Tính hoa hồng dựa trên doanh số bán hàng
   */
  private function calculateCommissionAmount(User $user, int $month, int $year): float
  {
    if ($user->commission_rate <= 0) {
      return 0;
    }

    // Tính tổng doanh số bán hàng của nhân viên trong tháng
    $totalSales = Order::where('user_id', $user->id)
      ->where('status', 'completed')
      ->whereMonth('order_date', $month)
      ->whereYear('order_date', $year)
      ->sum('final_amount');

    return $totalSales * ($user->commission_rate / 100);
  }

  /**
   * Tạo bảng lương cho tất cả nhân viên trong tháng/năm cụ thể
   */
  public function generatePayrollsForMonth(int $month, int $year): int
  {
    $users = User::whereNotNull('store_id')->get();
    $count = 0;

    foreach ($users as $user) {
      if (!$this->checkPayrollExists($user->id, $month, $year)) {
        $this->createPayrollForUser($user, $month, $year);
        $count++;
      }
    }

    return $count;
  }
}
