<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStoreRequest;
use App\Http\Requests\UpdateStoreRequest;
use App\Models\Store;
use App\Models\User;
use App\Services\StoreService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StoreController extends Controller
{
    private $storeService;

    public function __construct(StoreService $storeService)
    {
        $this->storeService = $storeService;
    }

    /**
     * Hiển thị danh sách cửa hàng
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Lấy danh sách cửa hàng đã lọc, sắp xếp và phân trang
        $stores = $this->storeService->getStores(
            $request->all(),
            10,
            $request->input('sort', 'newest')
        );

        // Lấy danh sách quản lý (chỉ lấy SM)
        $managers = User::where('position', 'SM')->get();

        // Lấy thông tin user
        $user = Auth::user();

        return Inertia::render('Stores/Index', [
            'stores' => $stores,
            'user' => $user,
            'managers' => $managers,
            'filters' => $request->only(['manager_id', 'has_manager']),
            'sort' => $request->input('sort', 'newest'),
        ]);
    }

    /**
     * Hiển thị form tạo cửa hàng mới
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Lấy danh sách quản lý (chỉ lấy SM)
        $managers = User::where('position', 'SM')->get();

        return Inertia::render('Stores/Create', [
            'managers' => $managers,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Lưu cửa hàng mới
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreStoreRequest $request)
    {
        // Xử lý tạo người dùng qua service
        $this->storeService->createStore($request->validated());

        return redirect()->route('stores.index')
            ->with('success', 'Cửa hàng đã được tạo thành công.');
    }

    /**
     * Hiển thị form chỉnh sửa cửa hàng
     *
     * @param  mixed  $storeId
     * @return \Inertia\Response
     */
    public function edit($storeId)
    {
        // Tìm cửa hàng theo ID truyền vào
        $store = Store::with('manager')->findOrFail($storeId);

        // Lấy danh sách các SM để chọn quản lý
        $managers = User::where('position', 'SM')->get();

        return Inertia::render('Stores/Edit', [
            'editStore' => $store,
            'managers' => $managers,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Cập nhật thông tin cửa hàng
     *
     * @param  mixed  $storeId
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(UpdateStoreRequest $request, $storeId)
    {
        // Tìm cửa hàng theo ID
        $store = Store::findOrFail($storeId);

        // Xử lý cập nhật cửa hàng qua service
        $this->storeService->updateStore($store, $request->validated());

        return redirect()->route('stores.index')
            ->with('success', 'Thông tin cửa hàng đã được cập nhật thành công.');
    }

    /**
     * Xóa cửa hàng
     *
     * @param  mixed  $storeId
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($storeId)
    {
        // Tìm cửa hàng theo ID
        $store = Store::findOrFail($storeId);

        // Xử lý xóa cửa hàng qua service
        $this->storeService->deleteStore($store);

        return redirect()->route('stores.index')
            ->with('success', 'Cửa hàng đã được xóa thành công.');
    }
}
