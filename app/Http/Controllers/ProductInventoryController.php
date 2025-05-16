<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductInventoryController extends Controller
{
    /**
     * Lấy tổng số lượng của một sản phẩm trong tất cả các kho
     */
    public function getTotalInventory(Product $product): JsonResponse
    {
        // Tính tổng số lượng từ tất cả các kho
        $totalQuantity = InventoryItem::where('product_id', $product->id)
            ->sum('quantity');

        return response()->json([
            'product_id' => $product->id,
            'total_quantity' => $totalQuantity,
            'warehouses_count' => InventoryItem::where('product_id', $product->id)->count(),
        ]);
    }
}
