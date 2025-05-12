<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Tạo 1 kho chính
    Warehouse::factory()->main()->create();

    // Tạo kho cho mỗi cửa hàng
    $stores = Store::all();

    foreach ($stores as $store) {
      Warehouse::factory()->create([
        'store_id' => $store->id,
        'name' => 'Kho ' . $store->name
      ]);
    }
  }
}
