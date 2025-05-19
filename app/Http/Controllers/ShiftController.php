<?php

namespace App\Http\Controllers;

use App\Services\ShiftService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ShiftController extends Controller
{
  private $shiftService;

  public function __construct(ShiftService $shiftService)
  {
    $this->shiftService = $shiftService;
  }

  /**
   * Hiển thị trang ca làm việc cho nhân viên
   *
   * @param Request $request
   * @return \Inertia\Response
   */
  public function index(Request $request)
  {
    $user = Auth::user();

    // Lấy tháng và năm từ request hoặc sử dụng tháng hiện tại
    $month = $request->input('month', now()->month);
    $year = $request->input('year', now()->year);

    // Lấy danh sách ca làm việc của nhân viên trong tháng
    $shifts = $this->shiftService->getShiftsByUserAndMonth($user->id, $month, $year);

    // Lấy thông tin tổng quan về ca làm việc
    $summary = $this->shiftService->getShiftSummary($user->id, $month, $year);

    return Inertia::render('Shift/Index', [
      'user' => $user,
      'shifts' => $shifts,
      'summary' => $summary,
      'filters' => [
        'month' => $month,
        'year' => $year,
      ],
    ]);
  }
}
