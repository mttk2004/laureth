<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;

class WarehouseInventoryController extends Controller
{
    /**
     * Lấy danh sách tồn kho của một kho hàng
     */
    public function getInventory(Warehouse $warehouse): JsonResponse
    {
        // Lấy danh sách inventory items kèm theo thông tin sản phẩm
        $inventoryItems = $warehouse->inventoryItems()->with('product')->get();

        return response()->json($inventoryItems);
    }
}
