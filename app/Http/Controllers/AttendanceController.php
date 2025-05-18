<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckInRequest;
use App\Http\Requests\CheckOutRequest;
use App\Services\AttendanceService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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

    // Log để debug
    Log::info('Attendance index data', [
      'user_id' => $user->id,
      'has_current_shift' => $currentShift ? 'yes' : 'no',
      'has_attendance_record' => $currentShift && $currentShift->attendanceRecord ? 'yes' : 'no',
      'check_in' => $currentShift && $currentShift->attendanceRecord ? $currentShift->attendanceRecord->check_in : null,
      'check_out' => $currentShift && $currentShift->attendanceRecord ? $currentShift->attendanceRecord->check_out : null,
    ]);

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

    Log::info('Processing check-in request', [
      'user_id' => $user->id,
      'shift_id' => $shiftId
    ]);

    $result = $this->attendanceService->checkIn($user->id, $shiftId);

    if ($result) {
      Log::info('Check-in successful', [
        'user_id' => $user->id,
        'shift_id' => $shiftId
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Chấm công vào ca làm việc thành công.'
      ]);
    } else {
      Log::warning('Check-in failed', [
        'user_id' => $user->id,
        'shift_id' => $shiftId
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Không thể chấm công vào. Vui lòng thử lại sau.'
      ], 422);
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

    Log::info('Processing check-out request', [
      'user_id' => $user->id,
      'shift_id' => $shiftId
    ]);

    $result = $this->attendanceService->checkOut($user->id, $shiftId);

    if ($result) {
      Log::info('Check-out successful', [
        'user_id' => $user->id,
        'shift_id' => $shiftId
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Chấm công ra ca làm việc thành công.'
      ]);
    } else {
      Log::warning('Check-out failed', [
        'user_id' => $user->id,
        'shift_id' => $shiftId
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Không thể chấm công ra. Vui lòng thử lại sau.'
      ], 422);
    }
  }
}
