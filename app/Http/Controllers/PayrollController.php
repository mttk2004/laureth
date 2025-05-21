<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApprovePayrollRequest;
use App\Http\Requests\GeneratePayrollRequest;
use App\Models\Payroll;
use App\Models\Store;
use App\Services\PayrollService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PayrollController extends Controller
{
  private $payrollService;

  public function __construct(PayrollService $payrollService)
  {
    $this->payrollService = $payrollService;
  }

  /**
   * Hiển thị trang quản lý lương
   *
   * @return \Inertia\Response
   */
  public function index(Request $request)
  {
    // Lấy danh sách bảng lương đã lọc, sắp xếp và phân trang
    $payrolls = $this->payrollService->getPayrolls(
      $request->all(),
      12,
      $request->input('sort', 'created_at_desc')
    );

    // Lấy thông tin tổng quan về bảng lương
    $summary = $this->payrollService->getPayrollSummary();

    // Lấy danh sách cửa hàng để hiển thị trong filter
    $stores = Store::all();

    // Lấy tab đang được chọn từ request
    $activeTab = $request->input('activeTab', 'byStore');

    return Inertia::render('Payrolls/Index', [
      'payrolls' => $payrolls,
      'summary' => $summary,
      'stores' => $stores,
      'user' => Auth::user(),
      'filters' => $request->only(['month', 'year', 'status', 'store_id', 'position', 'name']),
      'sort' => $request->input('sort', 'created_at_desc'),
      'activeTab' => $activeTab,
    ]);
  }

  /**
   * Hiển thị form tạo bảng lương
   *
   * @return \Inertia\Response
   */
  public function create()
  {
    // Chỉ DM mới có quyền tạo bảng lương
    if (Auth::user()->position !== 'DM') {
      abort(403, 'Bạn không có quyền thực hiện hành động này.');
    }

    $currentDate = Carbon::now();

    return Inertia::render('Payrolls/Create', [
      'user' => Auth::user(),
      'currentMonth' => $currentDate->month,
      'currentYear' => $currentDate->year,
    ]);
  }

  /**
   * Tạo bảng lương cho tháng/năm chỉ định
   *
   * @return \Illuminate\Http\RedirectResponse
   */
  public function generate(GeneratePayrollRequest $request)
  {
    // Chỉ DM mới có quyền tạo bảng lương
    if (Auth::user()->position !== 'DM') {
      abort(403, 'Bạn không có quyền thực hiện hành động này.');
    }

    $validatedData = $request->validated();
    $month = (int) $validatedData['month'];
    $year = (int) $validatedData['year'];

    $count = $this->payrollService->generatePayrollsForMonth($month, $year);

    return redirect()->route('payrolls.index')
      ->with('success', "Đã tạo {$count} bảng lương mới cho tháng {$month}/{$year}");
  }

  /**
   * Duyệt bảng lương
   *
   * @return \Illuminate\Http\RedirectResponse
   */
  public function approve(ApprovePayrollRequest $request, Payroll $payroll)
  {
    // Chỉ DM mới có quyền duyệt lương
    if (Auth::user()->position !== 'DM') {
      abort(403, 'Bạn không có quyền thực hiện hành động này.');
    }

    $this->payrollService->approvePayroll($payroll);

    // Chuyển hướng về trang danh sách
    return redirect()->route('payrolls.index')
      ->with('success', 'Đã duyệt thanh toán lương thành công.');
  }
}
