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
   * Tạo đơn nhập hàng mới
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
        'status' => 'pending',
      ]);

      // Tạo chi tiết đơn nhập hàng
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

        PurchaseOrderItem::create([
          'purchase_order_id' => $purchaseOrder->id,
          'product_id' => $item['product_id'],
          'quantity' => $item['quantity'],
          'purchase_price' => $item['purchase_price'],
          'selling_price' => $item['selling_price'],
        ]);
      }

      // Cập nhật đơn hàng thành đã nhận
      $this->receivePurchaseOrder($purchaseOrder);

      return $purchaseOrder;
    });
  }

  /**
   * Xử lý khi nhận đơn hàng
   *
   * @param PurchaseOrder $purchaseOrder Đơn nhập hàng cần xử lý
   * @return bool
   */
  public function receivePurchaseOrder(PurchaseOrder $purchaseOrder)
  {
    return DB::transaction(function () use ($purchaseOrder) {
      // Cập nhật trạng thái đơn hàng
      $purchaseOrder->update(['status' => 'received']);

      // Cập nhật kho
      $items = PurchaseOrderItem::where('purchase_order_id', $purchaseOrder->id)->get();

      foreach ($items as $item) {
        // Kiểm tra xem sản phẩm đã có trong kho chưa
        $inventoryItem = InventoryItem::where('warehouse_id', $purchaseOrder->warehouse_id)
          ->where('product_id', $item->product_id)
          ->first();

        if ($inventoryItem) {
          // Cập nhật số lượng sản phẩm
          $inventoryItem->update([
            'quantity' => $inventoryItem->quantity + $item->quantity,
          ]);
        } else {
          // Thêm sản phẩm mới vào kho
          InventoryItem::create([
            'warehouse_id' => $purchaseOrder->warehouse_id,
            'product_id' => $item->product_id,
            'quantity' => $item->quantity,
          ]);
        }
      }

      return true;
    });
  }
}
