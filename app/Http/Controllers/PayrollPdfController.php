<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\User;
use App\Services\PayrollPdfService;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class PayrollPdfController extends Controller
{
  protected $pdfService;

  public function __construct(PayrollPdfService $pdfService)
  {
    $this->pdfService = $pdfService;
  }

  /**
   * Tạo và tải xuống file PDF bảng lương mới nhất của người dùng hiện tại
   *
   * @return Response
   */
  public function downloadLatest()
  {
    $user = Auth::user();

    return $this->pdfService->generateLatestPayrollPdf($user);
  }

  /**
   * Tạo và tải xuống file PDF bảng lương theo ID
   *
   * @param int $payrollId ID của bảng lương
   * @return Response
   */
  public function download($payrollId)
  {
    $user = Auth::user();
    $payroll = Payroll::findOrFail($payrollId);

    // Kiểm tra quyền truy cập
    if ($payroll->user_id !== $user->id && $user->position !== 'DM') {
      abort(403, 'Bạn không có quyền truy cập bảng lương này');
    }

    return $this->pdfService->generatePayrollPdf($payroll);
  }
}
