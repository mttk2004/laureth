<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckInRequest;
use App\Http\Requests\CheckOutRequest;
use App\Services\AttendanceService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AttendanceController extends Controller
{
  private $attendanceService;

  public function __construct(AttendanceService $attendanceService)
  {
    $this->attendanceService = $attendanceService;
  }

  /**
   * Hiển thị trang chấm công
   *
   * @return \Inertia\Response
   */
  public function index()
  {
    $user = Auth::user();

    // Lấy ca làm việc hôm nay của nhân viên
    $currentShift = $this->attendanceService->getCurrentShift($user->id);

    // Lấy lịch sử chấm công của nhân viên
    $attendanceHistory = $this->attendanceService->getAttendanceHistory($user->id);

    return Inertia::render('Attendance/Index', [
      'user' => $user,
      'currentShift' => $currentShift,
      'attendanceHistory' => $attendanceHistory,
    ]);
  }

  /**
   * Chấm công giờ vào
   *
   * @param CheckInRequest $request
   * @return \Illuminate\Http\RedirectResponse
   */
  public function checkIn(CheckInRequest $request)
  {
    $user = Auth::user();
    $validatedData = $request->validated();
    $shiftId = $validatedData['shift_id'];

    $result = $this->attendanceService->checkIn($user->id, $shiftId);

    if ($result) {
      // Lấy thông tin mới nhất sau khi check-in
      $currentShift = $this->attendanceService->getCurrentShift($user->id);
      $attendanceHistory = $this->attendanceService->getAttendanceHistory($user->id);

      return redirect()->route('attendance.index')
        ->with('success', 'Chấm công vào ca làm việc thành công.')
        ->with('currentShift', $currentShift)
        ->with('attendanceHistory', $attendanceHistory);
    } else {
      return redirect()->route('attendance.index')
        ->with('error', 'Không thể chấm công vào. Vui lòng thử lại sau.');
    }
  }

  /**
   * Chấm công giờ ra
   *
   * @param CheckOutRequest $request
   * @return \Illuminate\Http\RedirectResponse
   */
  public function checkOut(CheckOutRequest $request)
  {
    $user = Auth::user();
    $validatedData = $request->validated();
    $shiftId = $validatedData['shift_id'];

    $result = $this->attendanceService->checkOut($user->id, $shiftId);

    if ($result) {
      // Lấy thông tin mới nhất sau khi check-out
      $currentShift = $this->attendanceService->getCurrentShift($user->id);
      $attendanceHistory = $this->attendanceService->getAttendanceHistory($user->id);

      return redirect()->route('attendance.index')
        ->with('success', 'Chấm công ra ca làm việc thành công.')
        ->with('currentShift', $currentShift)
        ->with('attendanceHistory', $attendanceHistory);
    } else {
      return redirect()->route('attendance.index')
        ->with('error', 'Không thể chấm công ra. Vui lòng thử lại sau.');
    }
  }
}
