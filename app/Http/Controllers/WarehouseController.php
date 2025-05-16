<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Services\WarehouseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    private $warehouseService;

    public function __construct(WarehouseService $warehouseService)
    {
        $this->warehouseService = $warehouseService;
    }

    /**
     * Hiển thị danh sách kho
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Lấy danh sách kho đã lọc, sắp xếp và phân trang
        $warehouses = $this->warehouseService->getWarehouses(
            $request->all(),
            10,
            $request->input('sort', 'created_at_desc')
        );

        // Lấy tất cả cửa hàng để hiển thị trong filter
        $stores = Store::all();

        // Lấy thông tin user
        $user = Auth::user();

        return Inertia::render('Warehouses/Index', [
            'warehouses' => $warehouses,
            'user' => $user,
            'stores' => $stores,
            'filters' => $request->only(['name', 'store_id', 'is_main']),
            'sort' => $request->input('sort', 'created_at_desc'),
        ]);
    }
}
