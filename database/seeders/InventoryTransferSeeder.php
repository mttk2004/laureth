<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\InventoryTransfer;
use App\Models\Product;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class InventoryTransferSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $mainWarehouse = Warehouse::where('is_main', true)->first();
    $storeWarehouses = Warehouse::where('is_main', false)->get();
    $products = Product::all();

    $managers = User::whereIn('position', ['SM', 'DM'])->get();
    $requesters = User::whereIn('position', ['SM', 'SL'])->get();

    // Tạo 20 yêu cầu chuyển kho
    for ($i = 0; $i < 20; $i++) {
      $requester = $requesters->random();
      $approver = $managers->random();

      // 80% chuyển từ kho chính đến kho cửa hàng, 20% chuyển ngược lại
      $isToStoreWarehouse = rand(1, 100) <= 80;

      if ($isToStoreWarehouse) {
        $sourceWarehouse = $mainWarehouse;
        $destinationWarehouse = $storeWarehouses->random();
      } else {
        $sourceWarehouse = $storeWarehouses->random();
        $destinationWarehouse = $mainWarehouse;
      }

      // Tìm sản phẩm có trong kho nguồn
      $inventoryItems = InventoryItem::where('warehouse_id', $sourceWarehouse->id)
        ->where('quantity', '>', 10)
        ->get();

      if ($inventoryItems->isEmpty()) {
        continue;
      }

      // Chọn một sản phẩm ngẫu nhiên
      $inventoryItem = $inventoryItems->random();
      $product = Product::find($inventoryItem->product_id);

      // Số lượng chuyển
      $quantity = rand(5, min(10, $inventoryItem->quantity - 5));

      // Trạng thái
      $status = $this->getRandomStatus();

      $transfer = InventoryTransfer::create([
        'source_warehouse_id' => $sourceWarehouse->id,
        'destination_warehouse_id' => $destinationWarehouse->id,
        'requested_by' => $requester->id,
        'approved_by' => $status !== 'pending' ? $approver->id : null,
        'product_id' => $product->id,
        'quantity' => $quantity,
        'status' => $status,
      ]);

      // Nếu đã completed, thì cập nhật số lượng trong kho
      if ($status === 'completed') {
        // Giảm số lượng ở kho nguồn
        $inventoryItem->quantity -= $quantity;
        $inventoryItem->save();

        // Tăng số lượng ở kho đích
        $destinationItem = InventoryItem::firstOrNew([
          'warehouse_id' => $destinationWarehouse->id,
          'product_id' => $product->id,
        ]);

        $destinationItem->quantity = ($destinationItem->quantity ?? 0) + $quantity;
        $destinationItem->save();
      }
    }
  }

  /**
   * Get a random status with appropriate weights
   */
  private function getRandomStatus(): string
  {
    $statuses = [
      'pending' => 20,
      'approved' => 10,
      'rejected' => 5,
      'completed' => 65,
    ];

    $random = rand(1, 100);
    $threshold = 0;

    foreach ($statuses as $status => $weight) {
      $threshold += $weight;
      if ($random <= $threshold) {
        return $status;
      }
    }

    return 'completed';
  }
}
