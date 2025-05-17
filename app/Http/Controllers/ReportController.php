<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ReportController extends Controller
{
  private $reportService;

  public function __construct(ReportService $reportService)
  {
    $this->reportService = $reportService;
  }

  /**
   * Hiển thị trang thống kê tổng quan
   *
   * @return \Inertia\Response
   */
  public function index(Request $request)
  {
    // Lấy tham số từ request hoặc sử dụng giá trị mặc định
    $period = $request->input('period', 'month');
    $year = $request->input('year', date('Y'));

    // Lấy tổng quan doanh thu
    $revenueSummary = $this->reportService->getRevenueSummary($period, $year);

    // Lấy tổng quan chi phí
    $expenseSummary = $this->reportService->getExpenseSummary($period, $year);

    // Lấy hiệu suất cửa hàng
    $storePerformance = $this->reportService->getStorePerformance($year);

    // Lấy hiệu suất sản phẩm (top 5)
    $productPerformance = $this->reportService->getProductPerformance($year, 5);

    // Ghi log để kiểm tra dữ liệu biểu đồ
    Log::info('Report controller data check:', [
      'revenueByStore' => $revenueSummary['revenueByStore'],
      'revenueByPaymentMethod' => $revenueSummary['revenueByPaymentMethod'],
      'revenueByCategory' => $revenueSummary['revenueByCategory'],
      'expenseDistribution' => $expenseSummary['expenseDistribution']
    ]);

    // Lấy thông tin user
    $user = Auth::user();

    // Danh sách năm (từ năm có dữ liệu đến hiện tại)
    $years = range(date('Y') - 4, date('Y'));

    return Inertia::render('Reports/Index', [
      'user' => $user,
      'revenueSummary' => $revenueSummary,
      'expenseSummary' => $expenseSummary,
      'storePerformance' => $storePerformance,
      'productPerformance' => $productPerformance,
      'period' => $period,
      'year' => (int)$year,
      'years' => $years,
    ]);
  }

  /**
   * API: Lấy thông tin tổng quan về doanh thu
   *
   * @return \Illuminate\Http\JsonResponse
   */
  public function getRevenueSummary(Request $request)
  {
    $period = $request->input('period', 'month');
    $year = $request->input('year', date('Y'));

    $data = $this->reportService->getRevenueSummary($period, $year);

    return response()->json($data);
  }

  /**
   * API: Lấy thông tin tổng quan về chi phí
   *
   * @return \Illuminate\Http\JsonResponse
   */
  public function getExpenseSummary(Request $request)
  {
    $period = $request->input('period', 'month');
    $year = $request->input('year', date('Y'));

    $data = $this->reportService->getExpenseSummary($period, $year);

    return response()->json($data);
  }

  /**
   * API: Lấy thông tin hiệu suất của các cửa hàng
   *
   * @return \Illuminate\Http\JsonResponse
   */
  public function getStorePerformance(Request $request)
  {
    $year = $request->input('year', date('Y'));

    $data = $this->reportService->getStorePerformance($year);

    return response()->json($data);
  }

  /**
   * API: Lấy thông tin hiệu suất của các sản phẩm
   *
   * @return \Illuminate\Http\JsonResponse
   */
  public function getProductPerformance(Request $request)
  {
    $year = $request->input('year', date('Y'));
    $limit = $request->input('limit', 10);

    $data = $this->reportService->getProductPerformance($year, $limit);

    return response()->json($data);
  }
}
