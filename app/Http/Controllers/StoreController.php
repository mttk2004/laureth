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
            'filters' => $request->only(['manager_id', 'has_manager', 'no_manager']),
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
        // Lấy danh sách quản lý hiện có và chưa được phân công
        $availableManagers = User::where('position', 'SM')
            ->whereNull('store_id')
            ->get();

        return Inertia::render('Stores/Create', [
            'managers' => $availableManagers,
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

        // Lấy danh sách quản lý tiềm năng:
        // 1. Các SM chưa được phân công (store_id = null)
        // 2. Các nhân viên (SL, SA) thuộc cửa hàng này (có thể thăng cấp)
        // 3. SM hiện tại của cửa hàng (nếu có)
        $potentialManagers = User::where(function ($query) {
            // Các SM chưa được phân công
            $query->where('position', 'SM')
                ->whereNull('store_id');
        })
            ->orWhere(function ($query) use ($storeId) {
                // Các nhân viên thuộc cửa hàng này
                $query->whereIn('position', ['SL', 'SA'])
                    ->where('store_id', $storeId);
            })
            ->orWhere(function ($query) use ($store) {
                // SM hiện tại của cửa hàng (nếu có)
                if ($store->manager_id) {
                    $query->where('id', $store->manager_id);
                }
            })
            ->get();

        return Inertia::render('Stores/Edit', [
            'editStore' => $store,
            'managers' => $potentialManagers,
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
