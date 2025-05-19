<?php

namespace Tests\Feature;

use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test xem trang danh sách đơn hàng
     */
    public function test_user_can_view_orders_index(): void
    {
        $user = User::factory()->create([
            'position' => User::POSITION_SL,
        ]);

        $response = $this->actingAs($user)
            ->get('/pos');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($assert) => $assert
                ->component('Orders/Index')
                ->has('orders')
                ->has('user')
                ->has('filters')
                ->has('sort')
        );
    }

    /**
     * Test xem trang tạo đơn hàng mới
     */
    public function test_user_can_view_create_order_page(): void
    {
        $user = User::factory()->create([
            'position' => User::POSITION_SL,
        ]);

        $response = $this->actingAs($user)
            ->get('/pos/create');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($assert) => $assert
                ->component('Orders/Create')
                ->has('user')
                ->has('products')
        );
    }

    /**
     * Test tạo đơn hàng mới thành công
     */
    public function test_user_can_create_order(): void
    {
        // Tạo user
        $user = User::factory()->create([
            'position' => User::POSITION_SL,
        ]);

        // Tạo store và gán user vào store
        $store = Store::factory()->create();
        $user->update(['store_id' => $store->id]);

        // Tạo warehouse cho store
        $warehouse = Warehouse::factory()->create([
            'store_id' => $store->id,
        ]);

        // Tạo product
        $product = Product::factory()->create([
            'price' => 100000,
        ]);

        // Tạo inventory item cho product
        InventoryItem::factory()->create([
            'warehouse_id' => $warehouse->id,
            'product_id' => $product->id,
            'quantity' => 10,
        ]);

        // Dữ liệu đơn hàng
        $orderData = [
            'order_date' => now()->format('Y-m-d'),
            'total_amount' => 100000,
            'discount_amount' => 0,
            'final_amount' => 100000,
            'payment_method' => 'cash',
            'status' => 'completed',
            'store_id' => $store->id,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'unit_price' => 100000,
                    'total_price' => 100000,
                ],
            ],
        ];

        // Gửi request tạo đơn hàng
        $response = $this->actingAs($user)
            ->post('/pos', $orderData);

        // Kiểm tra redirect
        $response->assertRedirect('/pos');
        $response->assertSessionHas('success', 'Đơn hàng đã được tạo thành công.');

        // Kiểm tra dữ liệu đã được lưu vào database
        $this->assertDatabaseHas('orders', [
            'store_id' => $store->id,
            'user_id' => $user->id,
            'total_amount' => 100000,
            'discount_amount' => 0,
            'final_amount' => 100000,
            'payment_method' => 'cash',
            'status' => 'completed',
        ]);

        // Kiểm tra order item đã được tạo
        $order = Order::latest()->first();
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 100000,
            'total_price' => 100000,
        ]);

        // Kiểm tra số lượng tồn kho đã giảm
        $this->assertDatabaseHas('inventory_items', [
            'warehouse_id' => $warehouse->id,
            'product_id' => $product->id,
            'quantity' => 9,
        ]);
    }

    /**
     * Test validation khi tạo đơn hàng
     */
    public function test_order_validation(): void
    {
        $user = User::factory()->create([
            'position' => User::POSITION_SL,
        ]);

        // Gửi request với dữ liệu rỗng
        $response = $this->actingAs($user)
            ->post('/pos', []);

        // Kiểm tra validation errors
        $response->assertSessionHasErrors([
            'order_date',
            'total_amount',
            'discount_amount',
            'final_amount',
            'payment_method',
            'status',
            'store_id',
            'items',
        ]);
    }
}
