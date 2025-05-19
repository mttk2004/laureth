<?php

namespace App\Services;

use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ShiftService extends BaseService
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
     * Lấy danh sách ca làm việc của nhân viên trong tháng
     *
     * @param  string  $userId  ID của nhân viên
     * @param  int  $month  Tháng cần lấy ca làm việc
     * @param  int  $year  Năm cần lấy ca làm việc
     */
    public function getShiftsByUserAndMonth(string $userId, int $month, int $year): array
    {
        // Lấy ngày đầu tiên và ngày cuối cùng của tháng
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth()->format('Y-m-d');
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->format('Y-m-d');

        // Tự động cập nhật trạng thái các ca làm việc trong quá khứ mà chưa được chấm công
        $this->updatePastShiftsStatus($userId, $startDate, $endDate);

        // Lấy danh sách ca làm việc trong tháng
        $shifts = Shift::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->with(['attendanceRecord'])
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
     * @param  string  $userId  ID của nhân viên
     * @param  string  $startDate  Ngày bắt đầu
     * @param  string  $endDate  Ngày kết thúc
     */
    private function updatePastShiftsStatus(string $userId, string $startDate, string $endDate): void
    {
        $now = Carbon::now();
        $today = $now->format('Y-m-d');

        // Tìm các ca làm việc trong quá khứ mà vẫn ở trạng thái "planned"
        $pastShifts = Shift::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->where('status', 'planned')
            ->get();

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

            // Nếu ca làm việc đã kết thúc (ngày trong quá khứ hoặc hôm nay nhưng đã qua giờ kết thúc)
            if ($shiftDate->lessThan($now->startOfDay()) || ($isToday && $shiftHasEnded)) {
                // Kiểm tra xem có bản ghi chấm công không
                $hasAttendance = DB::table('attendance_records')
                    ->where('shift_id', $shift->id)
                    ->exists();

                // Nếu không có bản ghi chấm công, cập nhật thành "absent"
                if (! $hasAttendance) {
                    $shift->status = 'absent';
                    $shift->save();

                    // Log để debug
                    Log::info("Updated shift {$shift->id} to absent. Date: {$shift->date}, Type: {$shift->shift_type}, End time: {$shiftEndTime}");
                }
            }
        }
    }

    /**
     * Lấy thông tin tổng quan về ca làm việc của nhân viên
     *
     * @param  string  $userId  ID của nhân viên
     * @param  int  $month  Tháng cần lấy thông tin
     * @param  int  $year  Năm cần lấy thông tin
     */
    public function getShiftSummary(string $userId, int $month, int $year): array
    {
        // Lấy ngày đầu tiên và ngày cuối cùng của tháng
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth()->format('Y-m-d');
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->format('Y-m-d');

        // Tổng số ca làm việc trong tháng
        $totalShifts = Shift::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->count();

        // Số ca đã hoàn thành
        $completedShifts = Shift::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        // Số ca đã vắng mặt
        $absentShifts = Shift::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->where('status', 'absent')
            ->count();

        // Số ca còn lại trong tháng
        $remainingShifts = Shift::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->where('status', 'planned')
            ->where('date', '>=', Carbon::today()->format('Y-m-d'))
            ->count();

        // Tổng số giờ làm việc trong tháng
        $totalHours = DB::table('attendance_records')
            ->join('shifts', 'attendance_records.shift_id', '=', 'shifts.id')
            ->where('shifts.user_id', $userId)
            ->whereBetween('shifts.date', [$startDate, $endDate])
            ->sum('attendance_records.total_hours');

        // Danh sách các tháng có ca làm việc
        $availableMonths = DB::table('shifts')
            ->where('user_id', $userId)
            ->selectRaw('MONTH(date) as month, YEAR(date) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => (int) $item->month,
                    'year' => (int) $item->year,
                    'label' => Carbon::createFromDate($item->year, $item->month, 1)->format('m/Y'),
                ];
            });

        return [
            'totalShifts' => $totalShifts,
            'completedShifts' => $completedShifts,
            'absentShifts' => $absentShifts,
            'remainingShifts' => $remainingShifts,
            'totalHours' => $totalHours,
            'availableMonths' => $availableMonths,
        ];
    }
}
