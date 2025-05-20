<?php

namespace App\Http\Controllers;

use App\Http\Requests\InventoryTransfer\StoreInventoryTransferRequest;
use App\Http\Requests\InventoryTransfer\UpdateInventoryTransferRequest;
use App\Models\InventoryItem;
use App\Models\InventoryTransfer;
use App\Models\Store;
use App\Models\Warehouse;
use App\Services\InventoryTransferService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InventoryTransferController extends Controller
{
  protected InventoryTransferService $inventoryTransferService;

  public function __construct(InventoryTransferService $inventoryTransferService)
  {
    $this->inventoryTransferService = $inventoryTransferService;
  }

  /**
   * Hiển thị trang quản lý chuyển kho cho Store Manager
   */
  public function index(Request $request)
  {
    // Lấy user hiện tại
    $user = Auth::user();

    // Lấy store của user hiện tại (SM chỉ quản lý một cửa hàng)
    $store = $user->store;

    if (!$store) {
      return redirect()->route('dashboard')->with('error', 'Bạn không được phân công quản lý cửa hàng nào.');
    }

    // Lấy danh sách kho thuộc cửa hàng
    $storeWarehouses = Warehouse::where('store_id', $store->id)->get();

    // Lấy id các kho của cửa hàng
    $warehouseIds = $storeWarehouses->pluck('id')->toArray();

    // Lấy danh sách tất cả kho (để có thể chọn kho đích)
    $allWarehouses = Warehouse::with('store')->get();

    // Filter và sắp xếp
    $filters = $request->only(['status', 'source_warehouse_id', 'destination_warehouse_id']);
    $sort = $request->input('sort', 'created_at_desc');

    // Lấy danh sách chuyển kho liên quan đến các kho của cửa hàng này
    $transfers = $this->inventoryTransferService->getFilteredTransfers(
      $warehouseIds,
      $filters,
      $sort,
      $user
    );

    return Inertia::render('StoreManager/WarehouseManagement/Index', [
      'transfers' => $transfers,
      'storeWarehouses' => $storeWarehouses,
      'allWarehouses' => $allWarehouses,
      'user' => $user,
      'store' => $store,
      'filters' => $filters,
      'sort' => $sort,
    ]);
  }

  /**
   * Lấy thông tin kho và sản phẩm trong kho
   */
  public function getWarehouseInventory(Warehouse $warehouse)
  {
    // Kiểm tra quyền truy cập
    $user = Auth::user();
    $store = $user->store;

    if (!$store || ($warehouse->store_id !== $store->id && !$user->hasRole('dm'))) {
      return response()->json(['error' => 'Không có quyền truy cập kho này'], 403);
    }

    // Lấy inventory có thông tin product
    $inventory = $warehouse->inventoryItems()->with('product')->get();

    return response()->json($inventory);
  }

  /**
   * Tạo yêu cầu chuyển kho mới
   */
  public function store(StoreInventoryTransferRequest $request)
  {
    $user = Auth::user();
    $data = $request->validated();

    // Kiểm tra xem người dùng có quyền với kho nguồn không
    $sourceWarehouse = Warehouse::findOrFail($data['source_warehouse_id']);
    $store = $user->store;

    if (!$store || ($sourceWarehouse->store_id !== $store->id && !$user->hasRole('dm'))) {
      return response()->json(['error' => 'Không có quyền tạo yêu cầu từ kho này'], 403);
    }

    // Thêm người yêu cầu
    $data['requested_by'] = $user->id;
    $data['status'] = 'pending';

    // Tạo yêu cầu chuyển kho
    $transfer = $this->inventoryTransferService->createTransfer($data);

    return response()->json([
      'message' => 'Yêu cầu chuyển kho đã được tạo thành công',
      'transfer' => $transfer
    ]);
  }

  /**
   * Cập nhật trạng thái yêu cầu chuyển kho
   */
  public function updateStatus(InventoryTransfer $inventoryTransfer, UpdateInventoryTransferRequest $request)
  {
    $user = Auth::user();
    $data = $request->validated();

    // Kiểm tra quyền truy cập
    $store = $user->store;
    $destinationWarehouse = $inventoryTransfer->destinationWarehouse;

    if (!$store || ($destinationWarehouse->store_id !== $store->id && !$user->hasRole('dm'))) {
      return response()->json(['error' => 'Không có quyền cập nhật yêu cầu này'], 403);
    }

    // Cập nhật trạng thái
    $data['approved_by'] = $user->id;
    $updatedTransfer = $this->inventoryTransferService->updateTransferStatus(
      $inventoryTransfer,
      $data['status'],
      $user->id
    );

    return response()->json([
      'message' => 'Trạng thái yêu cầu đã được cập nhật',
      'transfer' => $updatedTransfer
    ]);
  }
}
