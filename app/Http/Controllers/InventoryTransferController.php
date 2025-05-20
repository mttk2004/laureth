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
use Illuminate\Support\Facades\Log;
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

    Log::info('Accessing inventory transfer index page', [
      'user_id' => $user->id,
      'user_position' => $user->position
    ]);

    // Lấy store của user hiện tại (SM chỉ quản lý một cửa hàng)
    $store = $user->store;

    if (!$store) {
      Log::warning('User has no assigned store', ['user_id' => $user->id]);
      return redirect()->route('dashboard')->with('error', 'Bạn không được phân công quản lý cửa hàng nào.');
    }

    // Lấy danh sách kho thuộc cửa hàng
    $storeWarehouses = Warehouse::where('store_id', $store->id)->get();

    // Lấy id các kho của cửa hàng
    $warehouseIds = $storeWarehouses->pluck('id')->toArray();

    Log::info('Store warehouses', [
      'store_id' => $store->id,
      'warehouse_count' => count($warehouseIds),
      'warehouse_ids' => $warehouseIds
    ]);

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

    Log::info('Rendering inventory transfer page', [
      'transfer_count' => $transfers->count(),
      'filters' => $filters
    ]);

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

    Log::info('Get warehouse inventory', [
      'user_id' => $user->id,
      'warehouse_id' => $warehouse->id,
      'store_id' => $store ? $store->id : null
    ]);

    if (!$store || ($warehouse->store_id !== $store->id && !$user->hasRole('dm'))) {
      Log::warning('Unauthorized warehouse inventory access', [
        'user_id' => $user->id,
        'warehouse_id' => $warehouse->id
      ]);
      return response()->json(['error' => 'Không có quyền truy cập kho này'], 403);
    }

    // Lấy inventory có thông tin product
    $inventory = $warehouse->inventoryItems()->with('product')->get();

    Log::info('Warehouse inventory items count', [
      'warehouse_id' => $warehouse->id,
      'item_count' => $inventory->count()
    ]);

    return response()->json($inventory);
  }

  /**
   * Tạo yêu cầu chuyển kho mới
   */
  public function store(StoreInventoryTransferRequest $request)
  {
    $user = Auth::user();
    $data = $request->validated();

    Log::info('Creating inventory transfer', [
      'user_id' => $user->id,
      'source_warehouse_id' => $data['source_warehouse_id'],
      'destination_warehouse_id' => $data['destination_warehouse_id'],
      'product_id' => $data['product_id'],
      'quantity' => $data['quantity']
    ]);

    // Kiểm tra xem người dùng có quyền với kho nguồn không
    $sourceWarehouse = Warehouse::findOrFail($data['source_warehouse_id']);
    $store = $user->store;

    if (!$store || ($sourceWarehouse->store_id !== $store->id && !$user->hasRole('dm'))) {
      Log::warning('Unauthorized inventory transfer creation', [
        'user_id' => $user->id,
        'source_warehouse_id' => $sourceWarehouse->id
      ]);
      return response()->json(['error' => 'Không có quyền tạo yêu cầu từ kho này'], 403);
    }

    // Thêm người yêu cầu
    $data['requested_by'] = $user->id;
    $data['status'] = 'pending';

    // Tạo yêu cầu chuyển kho
    $transfer = $this->inventoryTransferService->createTransfer($data);

    Log::info('Inventory transfer created', [
      'transfer_id' => $transfer->id
    ]);

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

    Log::info('Updating inventory transfer status', [
      'user_id' => $user->id,
      'transfer_id' => $inventoryTransfer->id,
      'new_status' => $data['status']
    ]);

    // Kiểm tra quyền truy cập
    $store = $user->store;
    $destinationWarehouse = $inventoryTransfer->destinationWarehouse;

    if (!$store || ($destinationWarehouse->store_id !== $store->id && !$user->hasRole('dm'))) {
      Log::warning('Unauthorized inventory transfer status update', [
        'user_id' => $user->id,
        'transfer_id' => $inventoryTransfer->id,
        'warehouse_id' => $destinationWarehouse->id
      ]);
      return response()->json(['error' => 'Không có quyền cập nhật yêu cầu này'], 403);
    }

    // Cập nhật trạng thái
    $data['approved_by'] = $user->id;
    $updatedTransfer = $this->inventoryTransferService->updateTransferStatus(
      $inventoryTransfer,
      $data['status'],
      $user->id
    );

    Log::info('Inventory transfer status updated successfully', [
      'transfer_id' => $updatedTransfer->id,
      'status' => $updatedTransfer->status
    ]);

    return response()->json([
      'message' => 'Trạng thái yêu cầu đã được cập nhật',
      'transfer' => $updatedTransfer
    ]);
  }

  /**
   * Lấy chi tiết yêu cầu chuyển kho
   */
  public function getTransferDetail(InventoryTransfer $inventoryTransfer)
  {
    $user = Auth::user();
    $store = $user->store;

    Log::info('Getting inventory transfer details', [
      'user_id' => $user->id,
      'transfer_id' => $inventoryTransfer->id
    ]);

    // Kiểm tra quyền truy cập
    if (!$store && !$user->hasRole('dm')) {
      Log::warning('Unauthorized inventory transfer detail access', [
        'user_id' => $user->id,
        'transfer_id' => $inventoryTransfer->id
      ]);
      return response()->json(['error' => 'Không có quyền truy cập'], 403);
    }

    if ($store) {
      $warehouseIds = Warehouse::where('store_id', $store->id)->pluck('id')->toArray();
      if (!in_array($inventoryTransfer->source_warehouse_id, $warehouseIds) && !in_array($inventoryTransfer->destination_warehouse_id, $warehouseIds)) {
        Log::warning('User trying to access transfer not related to their store', [
          'user_id' => $user->id,
          'transfer_id' => $inventoryTransfer->id,
          'user_store_id' => $store->id
        ]);
        return response()->json(['error' => 'Không có quyền truy cập yêu cầu này'], 403);
      }
    }

    // Lấy chi tiết với eager loading
    $transfer = InventoryTransfer::with([
      'sourceWarehouse' => function ($query) {
        $query->withTrashed()->with(['store' => function ($q) {
          $q->withTrashed();
        }]);
      },
      'destinationWarehouse' => function ($query) {
        $query->withTrashed()->with(['store' => function ($q) {
          $q->withTrashed();
        }]);
      },
      'product' => function ($query) {
        $query->withTrashed();
      },
      'requestedBy' => function ($query) {
        $query->withTrashed();
      },
      'approvedBy' => function ($query) {
        $query->withTrashed();
      }
    ])->findOrFail($inventoryTransfer->id);

    // Chuyển đổi các quan hệ thành định dạng đồng nhất cho frontend
    $responseData = [
      'id' => $transfer->id,
      'source_warehouse_id' => $transfer->source_warehouse_id,
      'destination_warehouse_id' => $transfer->destination_warehouse_id,
      'source_warehouse' => $transfer->sourceWarehouse ? [
        'id' => $transfer->sourceWarehouse->id,
        'name' => $transfer->sourceWarehouse->name,
        'store' => $transfer->sourceWarehouse->store ? [
          'id' => $transfer->sourceWarehouse->store->id,
          'name' => $transfer->sourceWarehouse->store->name
        ] : null
      ] : null,
      'destination_warehouse' => $transfer->destinationWarehouse ? [
        'id' => $transfer->destinationWarehouse->id,
        'name' => $transfer->destinationWarehouse->name,
        'store' => $transfer->destinationWarehouse->store ? [
          'id' => $transfer->destinationWarehouse->store->id,
          'name' => $transfer->destinationWarehouse->store->name
        ] : null
      ] : null,
      'requested_by' => $transfer->requestedBy ? [
        'id' => $transfer->requestedBy->id,
        'name' => $transfer->requestedBy->name,
        'full_name' => $transfer->requestedBy->full_name ?? $transfer->requestedBy->name
      ] : null,
      'approved_by' => $transfer->approvedBy ? [
        'id' => $transfer->approvedBy->id,
        'name' => $transfer->approvedBy->name,
        'full_name' => $transfer->approvedBy->full_name ?? $transfer->approvedBy->name
      ] : null,
      'product' => $transfer->product ? [
        'id' => $transfer->product->id,
        'name' => $transfer->product->name
      ] : null,
      'product_id' => $transfer->product_id,
      'quantity' => $transfer->quantity,
      'status' => $transfer->status,
      'created_at' => $transfer->created_at,
      'updated_at' => $transfer->updated_at
    ];

    Log::info('Inventory transfer detail loaded', [
      'transfer_id' => $transfer->id,
    ]);

    // Ghi log chi tiết dữ liệu trả về
    Log::debug('Transfer detail data sent to frontend', $responseData);

    return response()->json($responseData);
  }
}
