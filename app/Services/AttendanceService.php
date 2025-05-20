<?php

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AttendanceService extends BaseService
{
  /**
   * Lấy model class
   */
  protected function getModelClass(): string
  {
    return AttendanceRecord::class;
  }

  /**
   * Lấy danh sách các trường hợp lệ để sắp xếp
   */
  protected function getValidSortFields(): array
  {
    return ['created_at', 'check_in', 'check_out', 'total_hours'];
  }

  /**
   * Lấy ca làm việc hiện tại của nhân viên
   *
   * @return mixed
   */
  public function getCurrentShift(string $userId)
  {
    $today = Carbon::today()->format('Y-m-d');

    // Tìm ca làm việc hôm nay
    $shift = DB::table('shifts')
      ->where('user_id', $userId)
      ->where('date', $today)
      ->first();

    if (! $shift) {
      // Log::info('No shift found for today', ['user_id' => $userId, 'date' => $today]);

      return null;
    }

    // Convert DB object to Shift model
    $shiftModel = Shift::find($shift->id);

    if (! $shiftModel) {
      // Log::info('Shift model not found', ['shift_id' => $shift->id]);

      return null;
    }

    // Lấy bản ghi chấm công mới nhất liên quan đến ca này
    // Sử dụng DB::table để tránh cache
    $attendance = DB::table('attendance_records')
      ->where('shift_id', $shiftModel->id)
      ->orderBy('updated_at', 'desc')
      ->first();

    if ($attendance) {
      // Convert DB object to AttendanceRecord model
      $attendanceModel = AttendanceRecord::find($attendance->id);

      // Kiểm tra xem attendance model có hợp lệ không
      if ($attendanceModel) {
        $shiftModel->setRelation('attendanceRecord', $attendanceModel);

        // Log để debug
        // Log::info('Found valid attendance record', [
        //   'shift_id' => $shiftModel->id,
        //   'attendance_id' => $attendanceModel->id,
        //   'check_in' => $attendanceModel->check_in,
        //   'check_out' => $attendanceModel->check_out,
        // ]);
      } else {
        // Nếu không tìm thấy model, đặt relation là null thay vì object rỗng
        $shiftModel->setRelation('attendanceRecord', null);

        // Log::warning('Attendance record found in DB but model not found', [
        //   'shift_id' => $shiftModel->id,
        //   'attendance_id' => $attendance->id,
        // ]);
      }
    } else {
      $shiftModel->setRelation('attendanceRecord', null);

      // Log::info('No attendance record found for shift', [
      //     'shift_id' => $shiftModel->id,
      // ]);
    }

    // Log để debug
    // Log::info('Current shift info', [
    //   'shift_id' => $shiftModel->id,
    //   'has_attendance' => $attendance ? 'yes' : 'no',
    //   'check_in' => $attendance ? $attendance->check_in : null,
    //   'check_out' => $attendance ? $attendance->check_out : null,
    // ]);

    return $shiftModel;
  }

  /**
   * Lấy lịch sử chấm công của nhân viên
   *
   * @return mixed
   */
  public function getAttendanceHistory(string $userId, int $limit = 10)
  {
    return AttendanceRecord::where('attendance_records.user_id', $userId)
      ->with(['shift'])
      ->join('shifts', 'attendance_records.shift_id', '=', 'shifts.id')
      ->select('attendance_records.*')
      ->orderBy('shifts.date', 'desc')
      ->orderBy('attendance_records.created_at', 'desc')
      ->paginate($limit);
  }

  /**
   * Chấm công giờ vào ca làm việc
   *
   * @return bool
   */
  public function checkIn(string $userId, int $shiftId)
  {
    // Bắt đầu transaction
    return DB::transaction(function () use ($userId, $shiftId) {
      // Kiểm tra ca làm việc có tồn tại và thuộc về nhân viên này không
      $shift = Shift::where('id', $shiftId)
        ->where('user_id', $userId)
        ->first();

      if (! $shift) {
        Log::warning('Check-in failed: Shift not found or not owned by user', [
          'user_id' => $userId,
          'shift_id' => $shiftId,
        ]);

        return false;
      }

      // Kiểm tra đã có bản ghi chấm công cho ca này chưa
      $attendance = AttendanceRecord::where('shift_id', $shiftId)->first();

      if ($attendance && $attendance->check_in) {
        Log::warning('Check-in failed: Already checked in', [
          'user_id' => $userId,
          'shift_id' => $shiftId,
          'attendance_id' => $attendance->id,
          'check_in' => $attendance->check_in,
        ]);

        return false; // Đã chấm công vào rồi
      }

      // Kiểm tra thời gian chấm công vào có hợp lệ không
      if (! $this->canCheckInNow($shift)) {
        Log::warning('Check-in failed: Invalid check-in time', [
          'user_id' => $userId,
          'shift_id' => $shiftId,
          'current_time' => Carbon::now()->toDateTimeString(),
          'shift_type' => $shift->shift_type,
          'shift_date' => $shift->date,
        ]);

        return false; // Không thể chấm công vào tại thời điểm này
      }

      // Tạo hoặc cập nhật bản ghi chấm công
      if (! $attendance) {
        $attendance = new AttendanceRecord([
          'user_id' => $userId,
          'shift_id' => $shiftId,
          'check_in' => Carbon::now(),
        ]);

        $result = $attendance->save();

        Log::info('New attendance record created', [
          'user_id' => $userId,
          'shift_id' => $shiftId,
          'attendance_id' => $attendance->id,
          'check_in' => $attendance->check_in,
          'success' => $result,
        ]);

        return $result;
      } else {
        $result = $attendance->update([
          'check_in' => Carbon::now(),
        ]);

        Log::info('Attendance record updated for check-in', [
          'user_id' => $userId,
          'shift_id' => $shiftId,
          'attendance_id' => $attendance->id,
          'check_in' => $attendance->check_in,
          'success' => $result,
        ]);

        return $result;
      }
    });
  }

  /**
   * Chấm công giờ ra ca làm việc
   *
   * @return bool
   */
  public function checkOut(string $userId, int $shiftId)
  {
    // Bắt đầu transaction
    return DB::transaction(function () use ($userId, $shiftId) {
      // Tìm bản ghi chấm công của ca này
      $attendance = AttendanceRecord::where('shift_id', $shiftId)
        ->where('user_id', $userId)
        ->first();

      if (! $attendance || ! $attendance->check_in) {
        Log::warning('Check-out failed: No check-in record found', [
          'user_id' => $userId,
          'shift_id' => $shiftId,
          'has_attendance' => $attendance ? 'yes' : 'no',
        ]);

        return false; // Chưa chấm công vào
      }

      if ($attendance->check_out) {
        Log::warning('Check-out failed: Already checked out', [
          'user_id' => $userId,
          'shift_id' => $shiftId,
          'attendance_id' => $attendance->id,
          'check_out' => $attendance->check_out,
        ]);

        return false; // Đã chấm công ra rồi
      }

      // Lấy thông tin ca làm việc
      $shift = Shift::find($shiftId);

      if (! $shift) {
        Log::warning('Check-out failed: Shift not found', [
          'user_id' => $userId,
          'shift_id' => $shiftId,
        ]);

        return false;
      }

      // Kiểm tra thời gian chấm công ra có hợp lệ không
      if (! $this->canCheckOutNow($shift)) {
        Log::warning('Check-out failed: Invalid check-out time', [
          'user_id' => $userId,
          'shift_id' => $shiftId,
          'current_time' => Carbon::now()->toDateTimeString(),
          'shift_type' => $shift->shift_type,
          'shift_date' => $shift->date,
        ]);

        return false; // Không thể chấm công ra tại thời điểm này
      }

      // Thời gian hiện tại
      $checkOut = Carbon::now();

      // Lấy thời gian check-in
      $checkIn = Carbon::parse($attendance->check_in);

      // Log để debug
      Log::info('Check-out time calculation', [
        'check_in' => $checkIn->toDateTimeString(),
        'check_out' => $checkOut->toDateTimeString(),
        'check_in_timestamp' => $checkIn->timestamp,
        'check_out_timestamp' => $checkOut->timestamp,
      ]);

      // Tính tổng thời gian làm việc (giờ)
      // Đảm bảo luôn lấy giá trị dương bằng cách dùng abs() hoặc sắp xếp lại thứ tự
      if ($checkOut->gt($checkIn)) {
        // Nếu check-out sau check-in (bình thường)
        $totalHours = $checkOut->diffInMinutes($checkIn) / 60;
      } else {
        // Nếu check-out trước check-in (bất thường, có thể do lỗi múi giờ)
        $totalHours = $checkIn->diffInMinutes($checkOut) / 60;
        Log::warning('Check-out time is earlier than check-in time', [
          'user_id' => $userId,
          'shift_id' => $shiftId,
          'check_in' => $checkIn->toDateTimeString(),
          'check_out' => $checkOut->toDateTimeString(),
        ]);
      }

      // Đảm bảo totalHours luôn là giá trị dương và làm tròn đến 1 chữ số thập phân
      $totalHours = round(abs($totalHours), 1);

      // Đảm bảo không vượt quá giới hạn của cột decimal(5, 1)
      if ($totalHours > 999.9) {
        $totalHours = 999.9;
        Log::warning('Total hours exceeded maximum value and was capped', [
          'user_id' => $userId,
          'shift_id' => $shiftId,
          'original_total_hours' => $totalHours,
          'capped_total_hours' => 999.9,
        ]);
      }

      // Log để debug
      Log::info('Total hours calculated', [
        'total_hours' => $totalHours,
      ]);

      // Cập nhật giờ ra và tổng thời gian
      $result = $attendance->update([
        'check_out' => $checkOut,
        'total_hours' => $totalHours,
      ]);

      Log::info('Attendance record updated for check-out', [
        'user_id' => $userId,
        'shift_id' => $shiftId,
        'attendance_id' => $attendance->id,
        'check_in' => $attendance->check_in,
        'check_out' => $checkOut,
        'total_hours' => $totalHours,
        'success' => $result,
      ]);

      return $result;
    });
  }

  /**
   * Lấy giờ bắt đầu và kết thúc ca dựa trên loại ca
   *
   * @return array [start_hour, start_minute, end_hour, end_minute]
   */
  private function getShiftHours(string $shiftType): array
  {
    // Ca A: 8h-16h
    if ($shiftType === 'A') {
      return [8, 0, 16, 0];
    }
    // Ca B: 14h30-22h30
    else {
      return [14, 30, 22, 30];
    }
  }

  /**
   * Kiểm tra xem có thể chấm công vào tại thời điểm hiện tại không
   * (sớm hơn tối đa 1 giờ so với giờ bắt đầu ca và trễ nhất 2 giờ sau giờ bắt đầu ca)
   */
  private function canCheckInNow(Shift $shift): bool
  {
    $now = Carbon::now();
    $shiftDate = Carbon::parse($shift->date);

    // Lấy giờ bắt đầu và kết thúc ca
    [$startHour, $startMinute, $endHour, $endMinute] = $this->getShiftHours($shift->shift_type);

    // Tạo thời gian bắt đầu ca với múi giờ hiện tại
    $shiftStart = Carbon::parse($shift->date)
      ->setHour($startHour)
      ->setMinute($startMinute)
      ->setSecond(0)
      ->setTimezone('Asia/Ho_Chi_Minh');

    // Tạo thời gian sớm nhất có thể chấm công (1 giờ trước giờ bắt đầu ca)
    $earliestCheckIn = $shiftStart->copy()->subHour();

    // Kiểm tra xem thời gian hiện tại có nằm trong khoảng cho phép không
    $canCheckIn = $now->greaterThanOrEqualTo($earliestCheckIn) && $now->lessThan($shiftStart->copy()->addHours(2));

    // Log để debug
    Log::info('Check-in time validation', [
      'now' => $now->toDateTimeString(),
      'now_timezone' => $now->timezone->getName(),
      'shift_date' => $shiftDate->toDateString(),
      'shift_type' => $shift->shift_type,
      'shift_start' => $shiftStart->toDateTimeString(),
      'shift_start_timezone' => $shiftStart->timezone->getName(),
      'earliest_check_in' => $earliestCheckIn->toDateTimeString(),
      'earliest_check_in_timezone' => $earliestCheckIn->timezone->getName(),
      'can_check_in' => $canCheckIn ? 'yes' : 'no',
    ]);

    return $canCheckIn;
  }

  /**
   * Kiểm tra xem có thể chấm công ra tại thời điểm hiện tại không
   * (trễ hơn tối đa 1 giờ so với giờ kết thúc ca và sớm nhất 2 giờ trước giờ kết thúc ca)
   */
  private function canCheckOutNow(Shift $shift): bool
  {
    $now = Carbon::now();
    $shiftDate = Carbon::parse($shift->date);

    // Lấy giờ bắt đầu và kết thúc ca
    [$startHour, $startMinute, $endHour, $endMinute] = $this->getShiftHours($shift->shift_type);

    // Tạo thời gian kết thúc ca với múi giờ hiện tại
    $shiftEnd = Carbon::parse($shift->date)
      ->setHour($endHour)
      ->setMinute($endMinute)
      ->setSecond(0)
      ->setTimezone('Asia/Ho_Chi_Minh');

    // Tạo thời gian trễ nhất có thể chấm công (1 giờ sau giờ kết thúc ca)
    $latestCheckOut = $shiftEnd->copy()->addHour();

    // IMPORTANT:
    // Cho phép chấm công ra bất kỳ lúc nào sau khi đã chấm công vào và trước thời gian kết thúc ca + 1 giờ
    // Bỏ điều kiện phải sau (kết thúc ca - 2 giờ)
    $canCheckOut = $now->greaterThanOrEqualTo($shiftEnd->copy()->subHours(2)) && $now->lessThanOrEqualTo($latestCheckOut);
    // $canCheckOut = $now->lessThanOrEqualTo($latestCheckOut);

    // Log để debug
    Log::info('Check-out time validation', [
      'now' => $now->toDateTimeString(),
      'now_timezone' => $now->timezone->getName(),
      'shift_date' => $shiftDate->toDateString(),
      'shift_type' => $shift->shift_type,
      'shift_end' => $shiftEnd->toDateTimeString(),
      'shift_end_timezone' => $shiftEnd->timezone->getName(),
      'latest_check_out' => $latestCheckOut->toDateTimeString(),
      'latest_check_out_timezone' => $latestCheckOut->timezone->getName(),
      'can_check_out' => $canCheckOut ? 'yes' : 'no',
    ]);

    return $canCheckOut;
  }
}
