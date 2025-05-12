<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Chỉ tạo bản ghi chấm công cho các ca làm việc đã hoàn thành
    $completedShifts = Shift::where('status', 'completed')->get();

    foreach ($completedShifts as $shift) {
      $shiftDate = Carbon::parse($shift->date);

      // Tạo giờ bắt đầu dựa vào loại ca
      if ($shift->shift_type === 'A') {
        // Ca sáng: 8:00 - 16:00
        $checkIn = $shiftDate->copy()->hour(8)->minute(rand(0, 15)); // Check-in từ 8:00 - 8:15
        $checkOut = $shiftDate->copy()->hour(16)->minute(rand(0, 15)); // Check-out từ 16:00 - 16:15
      } else {
        // Ca chiều: 14:30 - 22:30
        $checkIn = $shiftDate->copy()->hour(14)->minute(30)->addMinutes(rand(0, 15)); // Check-in từ 14:30 - 14:45
        $checkOut = $shiftDate->copy()->hour(22)->minute(30)->addMinutes(rand(0, 15)); // Check-out từ 22:30 - 22:45
      }

      // Tính số giờ làm việc
      $totalHours = $checkOut->diffInMinutes($checkIn) / 60;

      AttendanceRecord::create([
        'user_id' => $shift->user_id,
        'shift_id' => $shift->id,
        'check_in' => $checkIn,
        'check_out' => $checkOut,
        'total_hours' => round($totalHours, 2),
      ]);
    }
  }
}
