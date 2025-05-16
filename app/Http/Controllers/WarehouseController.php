<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWarehouseRequest;
use App\Http\Requests\UpdateWarehouseRequest;
use App\Models\Store;
use App\Models\Warehouse;
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

    /**
     * Hiển thị form tạo kho mới
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Lấy danh sách cửa hàng để hiển thị trong dropdown
        $stores = Store::all();

        return Inertia::render('Warehouses/Create', [
            'user' => Auth::user(),
            'stores' => $stores,
        ]);
    }

    /**
     * Lưu kho mới
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreWarehouseRequest $request)
    {
        // Xử lý tạo kho mới qua service
        $this->warehouseService->createWarehouse($request->validated());

        return redirect()->route('warehouses.index')
            ->with('success', 'Kho đã được tạo thành công.');
    }

    /**
     * Hiển thị form chỉnh sửa kho
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function edit($id)
    {
        // Tìm kho theo ID
        $warehouse = Warehouse::with('store')->findOrFail($id);

        // Lấy danh sách cửa hàng để hiển thị trong dropdown
        $stores = Store::all();

        return Inertia::render('Warehouses/Edit', [
            'warehouse' => $warehouse,
            'stores' => $stores,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Cập nhật thông tin kho
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(UpdateWarehouseRequest $request, $id)
    {
        // Tìm kho theo ID
        $warehouse = Warehouse::findOrFail($id);

        // Xử lý cập nhật kho qua service
        $this->warehouseService->updateWarehouse($warehouse, $request->validated());

        return redirect()->route('warehouses.index')
            ->with('success', 'Thông tin kho đã được cập nhật thành công.');
    }

    /**
     * Xóa kho
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        // Tìm kho theo ID
        $warehouse = Warehouse::findOrFail($id);

        // Xử lý xóa kho qua service
        $this->warehouseService->deleteWarehouse($warehouse);

        return redirect()->route('warehouses.index')
            ->with('success', 'Kho đã được xóa thành công.');
    }
}
