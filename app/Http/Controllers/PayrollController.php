<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApprovePayrollRequest;
use App\Models\Payroll;
use App\Models\Store;
use App\Services\PayrollService;
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

    return Inertia::render('Payrolls/Index', [
      'payrolls' => $payrolls,
      'summary' => $summary,
      'stores' => $stores,
      'user' => Auth::user(),
      'filters' => $request->only(['month', 'year', 'status', 'store_id', 'position', 'name']),
      'sort' => $request->input('sort', 'created_at_desc'),
    ]);
  }

  /**
   * Duyệt bảng lương
   *
   * @param  \App\Models\Payroll  $payroll
   * @return \Illuminate\Http\RedirectResponse
   */
  public function approve(ApprovePayrollRequest $request, Payroll $payroll)
  {
    // Chỉ DM mới có quyền duyệt lương
    if (Auth::user()->position !== 'DM') {
      abort(403, 'Bạn không có quyền thực hiện hành động này.');
    }

    $this->payrollService->approvePayroll($payroll);

    return redirect()->route('payrolls.index')
      ->with('success', 'Đã duyệt thanh toán lương thành công.');
  }
}
