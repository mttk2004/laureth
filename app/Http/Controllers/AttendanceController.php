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
        'attendance_record' => $attendanceRecord,
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
   * @return \Inertia\Response
   */
  public function checkIn(CheckInRequest $request)
  {
    $user = Auth::user();
    $validatedData = $request->validated();
    $shiftId = $validatedData['shift_id'];

    // Log::info('Processing check-in request', [
    //     'user_id' => $user->id,
    //     'shift_id' => $shiftId,
    // ]);

    $result = $this->attendanceService->checkIn($user->id, $shiftId);

    if ($result) {
      // Log::info('Check-in successful', [
      //     'user_id' => $user->id,
      //     'shift_id' => $shiftId,
      // ]);

      // Lấy thông tin mới nhất sau khi check-in để trả về
      $currentShift = $this->attendanceService->getCurrentShift($user->id);
      $attendanceHistory = $this->attendanceService->getAttendanceHistory($user->id);

      // Kiểm tra dữ liệu trước khi trả về
      $hasAttendanceRecord = $currentShift && $currentShift->attendanceRecord !== null;
      $checkInTime = $hasAttendanceRecord ? $currentShift->attendanceRecord->check_in : null;
      $checkOutTime = $hasAttendanceRecord ? $currentShift->attendanceRecord->check_out : null;

      // Log::info('Check-in response data', [
      //     'has_current_shift' => $currentShift ? 'yes' : 'no',
      //     'has_attendance_record' => $hasAttendanceRecord ? 'yes' : 'no',
      //     'check_in' => $checkInTime,
      //     'check_out' => $checkOutTime,
      // ]);

      // Đảm bảo dữ liệu attendanceRecord được chuyển đổi đúng cách
      if ($currentShift && $currentShift->attendanceRecord) {
        // Chuyển đổi attendanceRecord thành mảng để tránh mất dữ liệu khi serialize
        $attendanceRecord = $currentShift->attendanceRecord->toArray();
        // Gán lại attendanceRecord đã chuyển đổi
        $currentShift->attendanceRecord = $attendanceRecord;
      }

      return Inertia::render('Attendance/Index', [
        'user' => $user,
        'currentShift' => $currentShift,
        'attendanceHistory' => $attendanceHistory,
        'hasAttendanceRecord' => $hasAttendanceRecord,
        'checkInTime' => $checkInTime,
        'checkOutTime' => $checkOutTime,
        'success' => true,
        'message' => 'Chấm công vào ca làm việc thành công.',
      ])->with('success', 'Chấm công vào ca làm việc thành công.');
    } else {
      // Kiểm tra log để xác định lỗi cụ thể
      $latestLog = $this->getLatestAttendanceLog();
      $errorMessage = 'Không thể chấm công vào. Vui lòng thử lại sau.';

      // Xác định thông báo lỗi dựa trên log
      if (strpos($latestLog, 'Invalid check-in time') !== false) {
        $errorMessage = 'Bạn chỉ có thể chấm công vào sớm nhất 1 giờ trước giờ bắt đầu ca và muộn nhất 2 giờ sau giờ bắt đầu ca.';
      } elseif (strpos($latestLog, 'Already checked in') !== false) {
        $errorMessage = 'Bạn đã chấm công vào ca này rồi.';
      }

      // Log::warning('Check-in failed', [
      //     'user_id' => $user->id,
      //     'shift_id' => $shiftId,
      //     'error_message' => $errorMessage,
      // ]);

      // Lấy dữ liệu mới nhất và trả về view Inertia với thông báo lỗi
      $currentShift = $this->attendanceService->getCurrentShift($user->id);
      $attendanceHistory = $this->attendanceService->getAttendanceHistory($user->id);
      $hasAttendanceRecord = $currentShift && $currentShift->attendanceRecord ? true : false;
      $checkInTime = $currentShift && $currentShift->attendanceRecord ? $currentShift->attendanceRecord->check_in : null;
      $checkOutTime = $currentShift && $currentShift->attendanceRecord ? $currentShift->attendanceRecord->check_out : null;

      // Đảm bảo dữ liệu attendanceRecord được chuyển đổi đúng cách
      if ($currentShift && $currentShift->attendanceRecord) {
        // Chuyển đổi attendanceRecord thành mảng để tránh mất dữ liệu khi serialize
        $attendanceRecord = $currentShift->attendanceRecord->toArray();
        // Gán lại attendanceRecord đã chuyển đổi
        $currentShift->attendanceRecord = $attendanceRecord;
      }

      return Inertia::render('Attendance/Index', [
        'user' => $user,
        'currentShift' => $currentShift,
        'attendanceHistory' => $attendanceHistory,
        'hasAttendanceRecord' => $hasAttendanceRecord,
        'checkInTime' => $checkInTime,
        'checkOutTime' => $checkOutTime,
        'error' => $errorMessage,
      ])->with('error', $errorMessage);
    }
  }

  /**
   * Chấm công giờ ra
   *
   * @return \Inertia\Response
   */
  public function checkOut(CheckOutRequest $request)
  {
    $user = Auth::user();
    $validatedData = $request->validated();
    $shiftId = $validatedData['shift_id'];

    // Log::info('Processing check-out request', [
    //     'user_id' => $user->id,
    //     'shift_id' => $shiftId,
    // ]);

    $result = $this->attendanceService->checkOut($user->id, $shiftId);

    if ($result) {
      Log::info('Check-out successful', [
        'user_id' => $user->id,
        'shift_id' => $shiftId,
      ]);

      // Lấy thông tin mới nhất sau khi check-out để trả về
      $currentShift = $this->attendanceService->getCurrentShift($user->id);
      $attendanceHistory = $this->attendanceService->getAttendanceHistory($user->id);

      // Kiểm tra dữ liệu trước khi trả về
      $hasAttendanceRecord = $currentShift && $currentShift->attendanceRecord !== null;
      $checkInTime = $hasAttendanceRecord ? $currentShift->attendanceRecord->check_in : null;
      $checkOutTime = $hasAttendanceRecord ? $currentShift->attendanceRecord->check_out : null;

      Log::info('Check-out response data', [
        'has_current_shift' => $currentShift ? 'yes' : 'no',
        'has_attendance_record' => $hasAttendanceRecord ? 'yes' : 'no',
        'check_in' => $checkInTime,
        'check_out' => $checkOutTime,
      ]);

      // Đảm bảo dữ liệu attendanceRecord được chuyển đổi đúng cách
      if ($currentShift && $currentShift->attendanceRecord) {
        // Chuyển đổi attendanceRecord thành mảng để tránh mất dữ liệu khi serialize
        $attendanceRecord = $currentShift->attendanceRecord->toArray();
        // Gán lại attendanceRecord đã chuyển đổi
        $currentShift->attendanceRecord = $attendanceRecord;
      }

      return Inertia::render('Attendance/Index', [
        'user' => $user,
        'currentShift' => $currentShift,
        'attendanceHistory' => $attendanceHistory,
        'hasAttendanceRecord' => $hasAttendanceRecord,
        'checkInTime' => $checkInTime,
        'checkOutTime' => $checkOutTime,
        'success' => true,
        'message' => 'Chấm công ra ca làm việc thành công.',
      ])->with('success', 'Chấm công ra ca làm việc thành công.');
    } else {
      // Kiểm tra log để xác định lỗi cụ thể
      $latestLog = $this->getLatestAttendanceLog();
      $errorMessage = 'Không thể chấm công ra. Vui lòng thử lại sau.';

      // Xác định thông báo lỗi dựa trên log
      if (strpos($latestLog, 'Invalid check-out time') !== false) {
        $errorMessage = 'Bạn chỉ có thể chấm công ra sớm nhất 2 giờ trước giờ kết thúc ca và trễ nhất 1 giờ sau giờ kết thúc ca.';
      } elseif (strpos($latestLog, 'Already checked out') !== false) {
        $errorMessage = 'Bạn đã chấm công ra ca này rồi.';
      } elseif (strpos($latestLog, 'No check-in record found') !== false) {
        $errorMessage = 'Bạn chưa chấm công vào ca này.';
      }

      // Log::warning('Check-out failed', [
      //     'user_id' => $user->id,
      //     'shift_id' => $shiftId,
      //     'error_message' => $errorMessage,
      // ]);

      // Lấy dữ liệu mới nhất và trả về view Inertia với thông báo lỗi
      $currentShift = $this->attendanceService->getCurrentShift($user->id);
      $attendanceHistory = $this->attendanceService->getAttendanceHistory($user->id);
      $hasAttendanceRecord = $currentShift && $currentShift->attendanceRecord ? true : false;
      $checkInTime = $currentShift && $currentShift->attendanceRecord ? $currentShift->attendanceRecord->check_in : null;
      $checkOutTime = $currentShift && $currentShift->attendanceRecord ? $currentShift->attendanceRecord->check_out : null;

      // Đảm bảo dữ liệu attendanceRecord được chuyển đổi đúng cách
      if ($currentShift && $currentShift->attendanceRecord) {
        // Chuyển đổi attendanceRecord thành mảng để tránh mất dữ liệu khi serialize
        $attendanceRecord = $currentShift->attendanceRecord->toArray();
        // Gán lại attendanceRecord đã chuyển đổi
        $currentShift->attendanceRecord = $attendanceRecord;
      }

      return Inertia::render('Attendance/Index', [
        'user' => $user,
        'currentShift' => $currentShift,
        'attendanceHistory' => $attendanceHistory,
        'hasAttendanceRecord' => $hasAttendanceRecord,
        'checkInTime' => $checkInTime,
        'checkOutTime' => $checkOutTime,
        'error' => $errorMessage,
      ])->with('error', $errorMessage);
    }
  }

  /**
   * Lấy log mới nhất liên quan đến chấm công
   */
  private function getLatestAttendanceLog(): string
  {
    try {
      $logPath = storage_path('logs/laravel.log');
      if (file_exists($logPath)) {
        $logContent = file_get_contents($logPath);
        $lines = explode("\n", $logContent);
        $lines = array_filter($lines);
        $lines = array_reverse($lines);

        // Tìm log liên quan đến chấm công
        foreach ($lines as $line) {
          if (
            strpos($line, 'Check-in failed') !== false ||
            strpos($line, 'Check-out failed') !== false
          ) {
            return $line;
          }
        }
      }
    } catch (\Exception $e) {
      Log::error('Error reading log file: ' . $e->getMessage());
    }

    return '';
  }
}
