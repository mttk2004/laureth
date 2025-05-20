<?php

namespace App\Services;

use App\Models\Shift;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ShiftManagerService extends BaseService
{
  /**
   * Lấy model class
   */
  protected function getModelClass(): string
  {
    return Shift::class;
  }

  /**
   * Lấy danh sách các trường hợp lệ để sắp xếp
   */
  protected function getValidSortFields(): array
  {
    return ['date', 'shift_type', 'status', 'created_at'];
  }

  /**
   * Lấy danh sách ca làm việc của cửa hàng trong tháng
   *
   * @param  string  $storeId  ID của cửa hàng
   * @param  int  $month  Tháng cần lấy ca làm việc
   * @param  int  $year  Năm cần lấy ca làm việc
   */
  public function getShiftsByStoreAndMonth(string $storeId, int $month, int $year): array
  {
    // Lấy ngày đầu tiên và ngày cuối cùng của tháng
    $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth()->format('Y-m-d');
    $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->format('Y-m-d');

    // Lấy danh sách ca làm việc trong tháng
    $shifts = Shift::where('store_id', $storeId)
      ->whereBetween('date', [$startDate, $endDate])
      ->with(['user', 'attendanceRecord'])
      ->orderBy('date')
      ->get();

    // Tổ chức ca làm việc theo ngày
    $shiftsByDate = [];
    foreach ($shifts as $shift) {
      $date = $shift->date->format('Y-m-d');
      if (!isset($shiftsByDate[$date])) {
        $shiftsByDate[$date] = [];
      }
      $shiftsByDate[$date][] = $shift;
    }

    // Tạo lịch đầy đủ cho tháng
    $calendar = [];
    $currentDate = Carbon::createFromDate($year, $month, 1);

    // Thêm các ngày trống vào đầu tháng
    $firstDayOfWeek = $currentDate->copy()->firstOfMonth()->dayOfWeek;
    for ($i = 0; $i < $firstDayOfWeek; $i++) {
      $calendar[] = [
        'date' => null,
        'shifts' => [],
        'isCurrentMonth' => false,
      ];
    }

    // Thêm các ngày trong tháng
    while ($currentDate->month == $month) {
      $dateString = $currentDate->format('Y-m-d');
      $calendar[] = [
        'date' => $dateString,
        'shifts' => $shiftsByDate[$dateString] ?? [],
        'isCurrentMonth' => true,
        'isToday' => $currentDate->isToday(),
      ];
      $currentDate->addDay();
    }

    // Thêm các ngày trống vào cuối tháng để hoàn thành lịch
    $lastDayOfWeek = $currentDate->copy()->subDay()->dayOfWeek;
    for ($i = $lastDayOfWeek + 1; $i < 7; $i++) {
      $calendar[] = [
        'date' => null,
        'shifts' => [],
        'isCurrentMonth' => false,
      ];
    }

    return [
      'calendar' => $calendar,
      'month' => $month,
      'year' => $year,
    ];
  }

  /**
   * Lấy danh sách nhân viên của cửa hàng
   *
   * @param  string  $storeId  ID của cửa hàng
   * @return \Illuminate\Database\Eloquent\Collection
   */
  public function getStoreStaff(string $storeId)
  {
    return User::where('store_id', $storeId)
      ->whereIn('position', [User::POSITION_SL, User::POSITION_SA])
      ->orderBy('position')
      ->orderBy('full_name')
      ->get();
  }

  /**
   * Tạo ca làm việc mới
   *
   * @param  array  $data  Dữ liệu ca làm việc
   * @param  string  $storeId  ID của cửa hàng
   * @return \App\Models\Shift
   */
  public function createShift(array $data, string $storeId)
  {
    // Kiểm tra xem nhân viên có thuộc cửa hàng không
    $user = User::where('id', $data['user_id'])
      ->where('store_id', $storeId)
      ->first();

    if (!$user) {
      throw new \Exception('Nhân viên không thuộc cửa hàng này');
    }

    // Kiểm tra xem ca làm việc đã tồn tại chưa
    $existingShift = Shift::where('user_id', $data['user_id'])
      ->where('date', $data['date'])
      ->where('shift_type', $data['shift_type'])
      ->first();

    if ($existingShift) {
      throw new \Exception('Ca làm việc đã tồn tại');
    }

    // Tạo ca làm việc mới
    return Shift::create([
      'user_id' => $data['user_id'],
      'date' => $data['date'],
      'shift_type' => $data['shift_type'],
      'store_id' => $storeId,
      'status' => 'planned',
    ]);
  }

  /**
   * Xóa ca làm việc
   *
   * @param  int  $shiftId  ID của ca làm việc
   * @return bool
   */
  public function deleteShift(int $shiftId)
  {
    $shift = Shift::findOrFail($shiftId);

    // Kiểm tra xem ca làm việc đã hoàn thành chưa
    if ($shift->status === 'completed') {
      throw new \Exception('Không thể xóa ca làm việc đã hoàn thành');
    }

    return $shift->delete();
  }

  /**
   * Tạo nhiều ca làm việc cùng lúc
   *
   * @param  array  $shiftsData  Dữ liệu các ca làm việc
   * @param  string  $storeId  ID của cửa hàng
   * @return array
   */
  public function createBulkShifts(array $shiftsData, string $storeId)
  {
    $created = 0;
    $skipped = 0;

    DB::beginTransaction();

    try {
      foreach ($shiftsData as $shiftData) {
        // Kiểm tra xem nhân viên có thuộc cửa hàng không
        $user = User::where('id', $shiftData['user_id'])
          ->where('store_id', $storeId)
          ->first();

        if (!$user) {
          $skipped++;
          continue;
        }

        // Kiểm tra xem ca làm việc đã tồn tại chưa
        $existingShift = Shift::where('user_id', $shiftData['user_id'])
          ->where('date', $shiftData['date'])
          ->where('shift_type', $shiftData['shift_type'])
          ->first();

        if ($existingShift) {
          $skipped++;
          continue;
        }

        // Tạo ca làm việc mới
        Shift::create([
          'user_id' => $shiftData['user_id'],
          'date' => $shiftData['date'],
          'shift_type' => $shiftData['shift_type'],
          'store_id' => $storeId,
          'status' => 'planned',
        ]);

        $created++;
      }

      DB::commit();

      return [
        'created' => $created,
        'skipped' => $skipped,
      ];
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Error creating bulk shifts: ' . $e->getMessage());
      throw $e;
    }
  }
}
