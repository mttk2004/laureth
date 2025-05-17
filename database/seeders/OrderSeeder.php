<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stores = Store::all();
        $salesPeople = User::whereIn('position', ['SA', 'SL'])->whereNotNull('store_id')->get();

        // Tạo 200 đơn hàng
        for ($i = 0; $i < 200; $i++) {
            $user = $salesPeople->random();
            $store = Store::find($user->store_id);

            // Tạo đơn hàng
            $order = Order::factory()->make([
                'user_id' => $user->id,
                'store_id' => $store->id,
            ]);

            $order->save();

            // Tìm sản phẩm có trong kho của cửa hàng
            $warehouseId = $store->warehouses()->first()->id ?? null;
            if (! $warehouseId) {
                continue;
            }

            $inventoryItems = InventoryItem::where('warehouse_id', $warehouseId)
                ->where('quantity', '>', 0)
                ->get();

            if ($inventoryItems->isEmpty()) {
                continue;
            }

            // Chọn ngẫu nhiên 1-5 sản phẩm cho đơn hàng
            $selectedItems = $inventoryItems->random(rand(1, min(5, $inventoryItems->count())));

            $totalAmount = 0;

            foreach ($selectedItems as $item) {
                $product = Product::find($item->product_id);
                $quantity = rand(1, min(3, $item->quantity));

                $unitPrice = $product->price;
                $totalPrice = $unitPrice * $quantity;

                // Tạo chi tiết đơn hàng
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ]);

                // Cập nhật số lượng trong kho
                if ($order->status === 'completed') {
                    $item->quantity -= $quantity;
                    $item->save();
                }

                $totalAmount += $totalPrice;
            }

            // Cập nhật tổng tiền đơn hàng
            $discountAmount = $order->discount_amount;
            $finalAmount = $totalAmount - $discountAmount;

            $order->total_amount = $totalAmount;
            $order->final_amount = $finalAmount;
            $order->save();
        }
    }
}
