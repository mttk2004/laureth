<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWarehousePurchaseRequest;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Services\WarehousePurchaseService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WarehousePurchaseController extends Controller
{
    private $warehousePurchaseService;

    public function __construct(WarehousePurchaseService $warehousePurchaseService)
    {
        $this->warehousePurchaseService = $warehousePurchaseService;
    }

    /**
     * Hiển thị form tạo đơn nhập hàng mới
     *
     * @return \Inertia\Response
     */
    public function create(Warehouse $warehouse)
    {
        // Lấy danh sách nhà cung cấp
        $suppliers = Supplier::all();

        // Lấy danh sách sản phẩm
        $products = Product::with('category')->where('status', 'active')->get();

        return Inertia::render('Warehouses/Purchase', [
            'warehouse' => $warehouse->load('store'),
            'suppliers' => $suppliers,
            'products' => $products,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Lưu đơn nhập hàng mới
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreWarehousePurchaseRequest $request, Warehouse $warehouse)
    {
        // Xử lý tạo đơn nhập hàng qua service
        $this->warehousePurchaseService->createPurchaseOrder($warehouse, $request->validated());

        return redirect()->route('warehouses.index')
            ->with('success', 'Nhập hàng thành công');
    }
}
