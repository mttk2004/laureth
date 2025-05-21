<?php

namespace App\Http\Controllers;

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
}
