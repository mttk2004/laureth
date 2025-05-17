<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class PurchaseOrderSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $managers = User::whereIn('position', ['SM', 'DM'])->get();
    $suppliers = Supplier::all();
    $mainWarehouse = Warehouse::where('is_main', true)->first();
    $products = Product::all();

    // Tạo 10 đơn nhập hàng
    for ($i = 0; $i < 10; $i++) {
      $manager = $managers->random();
      $supplier = $suppliers->random();

      // Tạo đơn nhập hàng
      $purchaseOrder = PurchaseOrder::factory()->make([
        'supplier_id' => $supplier->id,
        'warehouse_id' => $mainWarehouse->id,
        'user_id' => $manager->id,
      ]);

      $purchaseOrder->save();

      // Thêm 5-10 sản phẩm vào đơn nhập hàng
      $selectedProducts = $products->random(rand(5, 10));
      $totalAmount = 0;

      foreach ($selectedProducts as $product) {
        $quantity = rand(1, 3) * 10; // Số lượng sản phẩm nhập vào đơn hàng từ 10 đến 30
        $purchasePrice = $product->price * 0.6; // Giá nhập khoảng 60% giá bán
        $sellingPrice = $product->price;

        PurchaseOrderItem::create([
          'purchase_order_id' => $purchaseOrder->id,
          'product_id' => $product->id,
          'quantity' => $quantity,
          'purchase_price' => $purchasePrice,
          'selling_price' => $sellingPrice,
        ]);

        $totalAmount += $purchasePrice * $quantity;

        // Luôn cập nhật số lượng trong kho khi tạo đơn hàng
        $inventoryItem = $mainWarehouse->inventoryItems()
          ->where('product_id', $product->id)
          ->first();

        if ($inventoryItem) {
          $inventoryItem->quantity += $quantity;
          $inventoryItem->save();
        } else {
          $mainWarehouse->inventoryItems()->create([
            'product_id' => $product->id,
            'quantity' => $quantity,
          ]);
        }
      }

      // Cập nhật tổng tiền đơn hàng
      $purchaseOrder->total_amount = $totalAmount;
      $purchaseOrder->save();
    }
  }
}
