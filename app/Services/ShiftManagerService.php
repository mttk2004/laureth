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

        // Tự động cập nhật trạng thái các ca làm việc trong quá khứ mà chưa được chấm công
        $this->updatePastShiftsStatus($storeId, $startDate, $endDate);

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
            if (! isset($shiftsByDate[$date])) {
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
     * Tự động cập nhật trạng thái các ca làm việc trong quá khứ
     * Nếu ca làm việc đã qua mà vẫn ở trạng thái "planned" và không có bản ghi chấm công
     * thì cập nhật thành "absent" (vắng mặt)
     *
     * @param  string  $storeId  ID của cửa hàng
     * @param  string  $startDate  Ngày bắt đầu
     * @param  string  $endDate  Ngày kết thúc
     */
    private function updatePastShiftsStatus(string $storeId, string $startDate, string $endDate): void
    {
        $now = Carbon::now();
        $today = $now->format('Y-m-d');

        // Log thông tin debug
        Log::info('ShiftManager: Updating past shifts status', [
            'store_id' => $storeId,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'current_time' => $now->toDateTimeString(),
            'timezone' => $now->timezone->getName(),
        ]);

        // Tìm các ca làm việc trong quá khứ mà vẫn ở trạng thái "planned"
        $pastShifts = Shift::where('store_id', $storeId)
            ->whereBetween('date', [$startDate, $endDate])
            ->where('status', 'planned')
            ->get();

        // Log số lượng ca làm việc cần kiểm tra
        Log::info('ShiftManager: Found shifts to check', [
            'count' => $pastShifts->count(),
            'shift_ids' => $pastShifts->pluck('id')->toArray(),
        ]);

        foreach ($pastShifts as $shift) {
            $shiftDate = Carbon::parse($shift->date);
            $isToday = $shiftDate->format('Y-m-d') === $today;

            // Xác định giờ kết thúc ca làm việc
            $endHour = $shift->shift_type === 'A' ? 16 : 22; // Ca A: 8-16h, Ca B: 14:30-22:30
            $endMinute = $shift->shift_type === 'A' ? 0 : 30;

            // Tạo thời điểm kết thúc ca làm việc
            $shiftEndTime = Carbon::parse($shift->date)->setHour($endHour)->setMinute($endMinute)->setSecond(0);

            // Kiểm tra xem ca làm việc đã kết thúc chưa
            $shiftHasEnded = $now->greaterThan($shiftEndTime);

            // Log thông tin chi tiết về ca làm việc
            Log::info('ShiftManager: Checking shift', [
                'shift_id' => $shift->id,
                'date' => $shift->date,
                'shift_type' => $shift->shift_type,
                'shift_end_time' => $shiftEndTime->toDateTimeString(),
                'is_today' => $isToday,
                'shift_has_ended' => $shiftHasEnded,
                'is_past_day' => $shiftDate->lessThan($now->startOfDay()),
            ]);

            // Nếu ca làm việc đã kết thúc (ngày trong quá khứ hoặc hôm nay nhưng đã qua giờ kết thúc)
            if ($shiftDate->lessThan($now->startOfDay()) || ($isToday && $shiftHasEnded)) {
                // Kiểm tra xem có bản ghi chấm công không
                $hasAttendance = DB::table('attendance_records')
                    ->where('shift_id', $shift->id)
                    ->exists();

                Log::info('ShiftManager: Shift has ended check', [
                    'shift_id' => $shift->id,
                    'has_attendance' => $hasAttendance,
                ]);

                // Nếu không có bản ghi chấm công, cập nhật thành "absent"
                if (! $hasAttendance) {
                    $shift->status = 'absent';
                    $result = $shift->save();

                    // Log kết quả cập nhật
                    Log::info('ShiftManager: Updated shift to absent', [
                        'shift_id' => $shift->id,
                        'success' => $result,
                    ]);
                }
            }
        }
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

        if (! $user) {
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

                if (! $user) {
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
            Log::error('Error creating bulk shifts: '.$e->getMessage());
            throw $e;
        }
    }
}
