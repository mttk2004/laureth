<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Warehouse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WarehousePurchaseService
{
  /**
   * Tạo đơn nhập hàng mới và cập nhật kho ngay lập tức
   *
   * @param Warehouse $warehouse Kho cần nhập hàng
   * @param array $data Dữ liệu đơn nhập hàng
   * @return PurchaseOrder
   */
  public function createPurchaseOrder(Warehouse $warehouse, array $data)
  {
    return DB::transaction(function () use ($warehouse, $data) {
      // Tính tổng tiền từ các sản phẩm
      $totalAmount = 0;
      foreach ($data['items'] as $item) {
        $totalAmount += $item['purchase_price'] * $item['quantity'];
      }

      // Tạo đơn nhập hàng mới
      $purchaseOrder = PurchaseOrder::create([
        'supplier_id' => $data['supplier_id'],
        'warehouse_id' => $warehouse->id,
        'user_id' => Auth::id(),
        'order_date' => $data['order_date'],
        'total_amount' => $totalAmount,
      ]);

      // Tạo chi tiết đơn nhập hàng và cập nhật kho
      foreach ($data['items'] as $item) {
        // Kiểm tra các trường bắt buộc
        if (
          empty($item['product_id']) ||
          !isset($item['quantity']) ||
          !isset($item['purchase_price']) ||
          !isset($item['selling_price'])
        ) {
          continue; // Skip sản phẩm không hợp lệ
        }

        // Kiểm tra giá trị hợp lệ
        if (
          $item['quantity'] <= 0 ||
          $item['purchase_price'] <= 0 ||
          $item['selling_price'] <= 0 ||
          $item['selling_price'] < $item['purchase_price']
        ) {
          continue; // Skip sản phẩm không hợp lệ
        }

        // Tạo chi tiết đơn nhập hàng
        PurchaseOrderItem::create([
          'purchase_order_id' => $purchaseOrder->id,
          'product_id' => $item['product_id'],
          'quantity' => $item['quantity'],
          'purchase_price' => $item['purchase_price'],
          'selling_price' => $item['selling_price'],
        ]);

        // Cập nhật kho ngay lập tức
        $this->updateInventory($warehouse->id, $item['product_id'], $item['quantity']);
      }

      return $purchaseOrder;
    });
  }

  /**
   * Cập nhật số lượng sản phẩm trong kho
   *
   * @param int $warehouseId ID của kho
   * @param string $productId ID của sản phẩm
   * @param int $quantity Số lượng cần thêm
   * @return void
   */
  private function updateInventory($warehouseId, $productId, $quantity)
  {
    // Kiểm tra xem sản phẩm đã có trong kho chưa
    $inventoryItem = InventoryItem::where('warehouse_id', $warehouseId)
      ->where('product_id', $productId)
      ->first();

    if ($inventoryItem) {
      // Cập nhật số lượng sản phẩm
      $inventoryItem->update([
        'quantity' => $inventoryItem->quantity + $quantity,
      ]);
    } else {
      // Thêm sản phẩm mới vào kho
      InventoryItem::create([
        'warehouse_id' => $warehouseId,
        'product_id' => $productId,
        'quantity' => $quantity,
      ]);
    }
  }
}
