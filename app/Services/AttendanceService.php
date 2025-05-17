<?php

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

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
   * @param string $userId
   * @return mixed
   */
  public function getCurrentShift(string $userId)
  {
    $today = Carbon::today()->format('Y-m-d');

    return Shift::where('user_id', $userId)
      ->where('date', $today)
      ->with(['attendanceRecord'])
      ->first();
  }

  /**
   * Lấy lịch sử chấm công của nhân viên
   *
   * @param string $userId
   * @param int $limit
   * @return mixed
   */
  public function getAttendanceHistory(string $userId, int $limit = 10)
  {
    return AttendanceRecord::where('user_id', $userId)
      ->with(['shift'])
      ->orderBy('created_at', 'desc')
      ->paginate($limit);
  }

  /**
   * Chấm công giờ vào ca làm việc
   *
   * @param string $userId
   * @param int $shiftId
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

      if (!$shift) {
        return false;
      }

      // Kiểm tra đã có bản ghi chấm công cho ca này chưa
      $attendance = AttendanceRecord::where('shift_id', $shiftId)->first();

      if ($attendance && $attendance->check_in) {
        return false; // Đã chấm công vào rồi
      }

      // Tạo hoặc cập nhật bản ghi chấm công
      if (!$attendance) {
        $attendance = new AttendanceRecord([
          'user_id' => $userId,
          'shift_id' => $shiftId,
          'check_in' => Carbon::now(),
        ]);

        return $attendance->save();
      } else {
        return $attendance->update([
          'check_in' => Carbon::now(),
        ]);
      }
    });
  }

  /**
   * Chấm công giờ ra ca làm việc
   *
   * @param string $userId
   * @param int $shiftId
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

      if (!$attendance || !$attendance->check_in) {
        return false; // Chưa chấm công vào
      }

      if ($attendance->check_out) {
        return false; // Đã chấm công ra rồi
      }

      // Thời gian hiện tại
      $checkOut = Carbon::now();

      // Tính tổng thời gian làm việc (giờ)
      $totalHours = $checkOut->diffInMinutes($attendance->check_in) / 60;

      // Cập nhật giờ ra và tổng thời gian
      return $attendance->update([
        'check_out' => $checkOut,
        'total_hours' => $totalHours,
      ]);
    });
  }
}
