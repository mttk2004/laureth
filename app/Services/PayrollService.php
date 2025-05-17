<?php

namespace App\Services;

use App\Models\Payroll;
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
                $q->where('full_name', 'like', '%'.$filters['name'].'%');
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
                    'label' => $item->month.'/'.$item->year,
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
}
