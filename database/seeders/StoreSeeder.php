<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Tạo 5 cửa hàng
    Store::factory(5)->create();

    // Lấy tất cả Store Manager
    $storeManagers = User::where('position', 'SM')->get();

    // Lấy tất cả cửa hàng
    $stores = Store::all();

    // Đảm bảo mỗi cửa hàng có một SM
    foreach ($stores as $index => $store) {
      if (isset($storeManagers[$index])) {
        // Gán SM cho cửa hàng
        $store->manager_id = $storeManagers[$index]->id;
        $store->save();

        // Gán store_id cho SM
        $storeManagers[$index]->store_id = $store->id;
        $storeManagers[$index]->save();
      }
    }

    // Gán các nhân viên SL và SA vào các cửa hàng
    $staff = User::whereIn('position', ['SA', 'SL'])->get();

    // Phân bổ nhân viên đều cho các cửa hàng
    foreach ($staff as $index => $employee) {
      $storeIndex = $index % $stores->count();
      $employee->store_id = $stores[$storeIndex]->id;
      $employee->save();
    }
  }
}
