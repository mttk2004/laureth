<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $warehouses = Warehouse::all();
    $products = Product::all();
    $mainWarehouse = Warehouse::where('is_main', true)->first();

    // Thêm tất cả sản phẩm vào kho chính
    foreach ($products as $product) {
      InventoryItem::create([
        'warehouse_id' => $mainWarehouse->id,
        'product_id' => $product->id,
        'quantity' => rand(50, 200),
      ]);
    }

    // Thêm một số sản phẩm ngẫu nhiên vào mỗi kho cửa hàng
    foreach ($warehouses->where('is_main', false) as $warehouse) {
      // Chọn ngẫu nhiên 60-80% sản phẩm để thêm vào kho của cửa hàng
      $randomProducts = $products->random(ceil($products->count() * rand(60, 80) / 100));

      foreach ($randomProducts as $product) {
        InventoryItem::create([
          'warehouse_id' => $warehouse->id,
          'product_id' => $product->id,
          'quantity' => rand(5, 30),
        ]);
      }
    }
  }
}
