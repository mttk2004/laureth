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

    // Đảm bảo dữ liệu attendanceRecord được chuyển đổi đúng cách
    if ($currentShift && $currentShift->attendanceRecord) {
      // Chuyển đổi attendanceRecord thành mảng để tránh mất dữ liệu khi serialize
      $attendanceRecord = $currentShift->attendanceRecord->toArray();

      // Log để debug
      Log::info('Attendance record being sent to frontend', [
        'attendance_record' => $attendanceRecord
      ]);

      // Gán lại attendanceRecord đã chuyển đổi
      $currentShift->attendanceRecord = $attendanceRecord;
    }

    return Inertia::render('Attendance/Index', [
      'user' => $user,
      'currentShift' => $currentShift,
      'attendanceHistory' => $attendanceHistory,
      // Thêm các thuộc tính riêng để đảm bảo dữ liệu được truyền đúng
      'hasAttendanceRecord' => $currentShift && $currentShift->attendanceRecord ? true : false,
      'checkInTime' => $currentShift && $currentShift->attendanceRecord ? $currentShift->attendanceRecord['check_in'] : null,
      'checkOutTime' => $currentShift && $currentShift->attendanceRecord ? $currentShift->attendanceRecord['check_out'] : null,
    ]);
  }

  /**
   * Chấm công giờ vào
   *
   * @param CheckInRequest $request
   * @return \Illuminate\Http\JsonResponse
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

      // Lấy thông tin mới nhất sau khi check-in để trả về
      $currentShift = $this->attendanceService->getCurrentShift($user->id);

      // Kiểm tra dữ liệu trước khi trả về
      $hasAttendanceRecord = $currentShift && $currentShift->attendanceRecord !== null;
      $checkIn = $hasAttendanceRecord ? $currentShift->attendanceRecord->check_in : null;
      $checkOut = $hasAttendanceRecord ? $currentShift->attendanceRecord->check_out : null;

      Log::info('Check-in response data', [
        'has_current_shift' => $currentShift ? 'yes' : 'no',
        'has_attendance_record' => $hasAttendanceRecord ? 'yes' : 'no',
        'check_in' => $checkIn,
        'check_out' => $checkOut
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Chấm công vào ca làm việc thành công.',
        'data' => [
          'currentShift' => $currentShift,
          'has_attendance_record' => $hasAttendanceRecord,
          'check_in' => $checkIn,
          'check_out' => $checkOut,
        ]
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
   * @return \Illuminate\Http\JsonResponse
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

      // Lấy thông tin mới nhất sau khi check-out để trả về
      $currentShift = $this->attendanceService->getCurrentShift($user->id);

      // Kiểm tra dữ liệu trước khi trả về
      $hasAttendanceRecord = $currentShift && $currentShift->attendanceRecord !== null;
      $checkIn = $hasAttendanceRecord ? $currentShift->attendanceRecord->check_in : null;
      $checkOut = $hasAttendanceRecord ? $currentShift->attendanceRecord->check_out : null;

      Log::info('Check-out response data', [
        'has_current_shift' => $currentShift ? 'yes' : 'no',
        'has_attendance_record' => $hasAttendanceRecord ? 'yes' : 'no',
        'check_in' => $checkIn,
        'check_out' => $checkOut
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Chấm công ra ca làm việc thành công.',
        'data' => [
          'currentShift' => $currentShift,
          'has_attendance_record' => $hasAttendanceRecord,
          'check_in' => $checkIn,
          'check_out' => $checkOut,
        ]
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
