<?php

namespace Database\Seeders;

use App\Models\Shift;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ShiftSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $stores = Store::all();
    $users = User::whereIn('position', ['SA', 'SL'])->get();

    // Tạo lịch làm việc cho 14 ngày từ hiện tại
    for ($i = -7; $i <= 7; $i++) {
      $date = Carbon::now()->addDays($i)->format('Y-m-d');

      // Mỗi ngày tạo ca làm việc cho một số nhân viên
      foreach ($users as $user) {
        // Chỉ tạo ca làm cho nhân viên ở cửa hàng đã được gán
        if (!$user->store_id) {
          continue;
        }

        // Đảm bảo không tạo quá nhiều ca làm việc cho một nhân viên
        if (rand(0, 100) > 70) {
          continue;
        }

        // Chọn loại ca ngẫu nhiên (sáng hoặc chiều)
        $shiftType = rand(0, 1) ? 'A' : 'B';

        // Trạng thái tùy thuộc vào ngày
        $status = 'planned';
        if ($i < 0) { // Ngày trong quá khứ
          $status = rand(0, 10) > 1 ? 'completed' : 'absent'; // 90% completed, 10% absent
        }

        Shift::create([
          'shift_type' => $shiftType,
          'date' => $date,
          'user_id' => $user->id,
          'store_id' => $user->store_id,
          'status' => $status,
        ]);
      }
    }
  }
}
