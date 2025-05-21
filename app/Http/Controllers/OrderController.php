<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrderRequest;
use App\Http\Requests\OrderStatusUpdateRequest;
use App\Models\Order;
use App\Models\Product;
use App\Models\Warehouse;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrderController extends Controller
{
  private $orderService;

  public function __construct(OrderService $orderService)
  {
    $this->orderService = $orderService;
  }

  /**
   * Hiển thị danh sách đơn hàng
   *
   * @return \Inertia\Response
   */
  public function index(Request $request)
  {
    // Lấy người dùng hiện tại
    $user = Auth::user();

    // Thiết lập bộ lọc mặc định theo cửa hàng của nhân viên
    $filters = $request->all();
    if ($user->store_id) {
      $filters['store_id'] = $user->store_id;
    }

    // Lấy danh sách đơn hàng đã lọc, sắp xếp và phân trang
    $orders = $this->orderService->getOrders(
      $filters,
      10,
      $request->input('sort', 'order_date_desc')
    );

    return Inertia::render('Orders/Index', [
      'orders' => $orders,
      'user' => $user,
      'filters' => $request->only(['store_id', 'status', 'payment_method', 'date_from', 'date_to']),
      'sort' => $request->input('sort', 'order_date_desc'),
    ]);
  }

  /**
   * Hiển thị form tạo đơn hàng mới
   *
   * @return \Inertia\Response
   */
  public function create()
  {
    $user = Auth::user();
    Log::info('Đang tạo đơn hàng mới cho user:', ['user_id' => $user->id, 'store_id' => $user->store_id]);

    // Lấy danh sách warehouse_ids của cửa hàng
    $warehouseIds = Warehouse::where('store_id', $user->store_id)
      ->pluck('id')
      ->toArray();

    Log::info('Danh sách warehouse_ids:', ['warehouse_ids' => $warehouseIds]);

    if (empty($warehouseIds)) {
      Log::warning('Không tìm thấy kho hàng cho cửa hàng', ['store_id' => $user->store_id]);

      return redirect()->route('pos.index')->with('error', 'Không tìm thấy kho hàng cho cửa hàng này.');
    }

    // So sánh với tổng số lượng trong tất cả các kho
    $totalInventoryCheck = DB::table('inventory_items')
      ->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
      ->groupBy('product_id')
      ->get();

    Log::info('Kiểm tra tổng số lượng trong TẤT CẢ các kho:', ['total_inventory_check' => $totalInventoryCheck]);

    // Kiểm tra số lượng tồn kho trong các kho của cửa hàng
    $storeInventoryCheck = DB::table('inventory_items')
      ->join('warehouses', 'inventory_items.warehouse_id', '=', 'warehouses.id')
      ->where('warehouses.store_id', $user->store_id)
      ->where('inventory_items.quantity', '>', 0)
      ->select('inventory_items.product_id', DB::raw('SUM(inventory_items.quantity) as store_quantity'))
      ->groupBy('inventory_items.product_id')
      ->get();

    Log::info('Kiểm tra số lượng tồn kho trong các kho của CỬA HÀNG:', ['store_inventory_check' => $storeInventoryCheck]);

    // So sánh chi tiết từng sản phẩm
    foreach ($totalInventoryCheck as $totalItem) {
      $storeItem = $storeInventoryCheck->firstWhere('product_id', $totalItem->product_id);
      $storeQuantity = $storeItem ? $storeItem->store_quantity : 0;

      Log::info("So sánh số lượng sản phẩm {$totalItem->product_id}:", [
        'total_quantity' => $totalItem->total_quantity,
        'store_quantity' => $storeQuantity,
        'difference' => $totalItem->total_quantity - $storeQuantity,
      ]);
    }

    // Lấy danh sách sản phẩm có trong kho của cửa hàng
    $productIds = $storeInventoryCheck->pluck('product_id')->toArray();

    Log::info('Danh sách product_ids có số lượng > 0 trong cửa hàng:', ['product_ids' => $productIds, 'count' => count($productIds)]);

    // Lấy thông tin chi tiết của sản phẩm
    $products = Product::whereIn('id', $productIds)->get();

    Log::info('Số lượng sản phẩm lấy được:', ['count' => $products->count()]);

    // Chuẩn bị dữ liệu để hiển thị
    $productsWithInventory = [];
    foreach ($products as $product) {
      // Lấy tổng số lượng từ kết quả kiểm tra trước đó
      $inventoryItem = $storeInventoryCheck->firstWhere('product_id', $product->id);
      $totalItem = $totalInventoryCheck->firstWhere('product_id', $product->id);

      $storeQuantity = $inventoryItem ? $inventoryItem->store_quantity : 0;
      $totalQuantity = $totalItem ? $totalItem->total_quantity : 0;

      Log::info("Chi tiết số lượng của sản phẩm {$product->name}:", [
        'store_quantity' => $storeQuantity,
        'total_quantity' => $totalQuantity,
      ]);

      if ($storeQuantity > 0) {
        $productData = $product->toArray();

        // Thêm trường inventoryItems (camelCase) cho frontend
        $productData['inventoryItems'] = [
          [
            'id' => 0,
            'warehouse_id' => $warehouseIds[0],
            'product_id' => $product->id,
            'quantity' => $storeQuantity,
          ],
        ];

        Log::info('Đã tạo inventoryItems cho sản phẩm', [
          'product_id' => $product->id,
          'inventory_item' => $productData['inventoryItems'][0],
        ]);

        $productsWithInventory[] = $productData;
      }
    }

    Log::info('Số lượng sản phẩm sau khi xử lý:', ['count' => count($productsWithInventory)]);

    // Kiểm tra cấu trúc dữ liệu cuối cùng
    foreach ($productsWithInventory as $index => $product) {
      Log::info("Sản phẩm cuối cùng {$index}:", [
        'id' => $product['id'],
        'name' => $product['name'],
        'inventoryItems_count' => isset($product['inventoryItems']) ? count($product['inventoryItems']) : 0,
        'quantity' => isset($product['inventoryItems'][0]) ? $product['inventoryItems'][0]['quantity'] : 'không có',
      ]);
    }

    return Inertia::render('Orders/Create', [
      'user' => $user,
      'products' => $productsWithInventory,
    ]);
  }

  /**
   * Lưu đơn hàng mới
   *
   * @return \Illuminate\Http\RedirectResponse
   */
  public function store(OrderRequest $request)
  {
    $user = Auth::user();
    $data = $request->validated();

    // Thêm thông tin người tạo và cửa hàng
    $data['user_id'] = $user->id;
    $data['store_id'] = $user->store_id;

    $order = $this->orderService->createOrder($data);

    return redirect()->route('pos.index')->with('success', 'Đơn hàng đã được tạo thành công.');
  }

  /**
   * Lấy chi tiết các sản phẩm trong đơn hàng
   */
  public function getItems(Order $order): JsonResponse
  {
    $items = $this->orderService->getOrderItems($order);

    return response()->json($items);
  }

  /**
   * Lấy thông tin đầy đủ của đơn hàng
   */
  public function getDetails(Order $order): JsonResponse
  {
    $orderDetails = $this->orderService->getOrderWithRelations($order);

    return response()->json($orderDetails);
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  public function updateStatus(Order $order, OrderStatusUpdateRequest $request): JsonResponse
  {
    // Kiểm tra xem người dùng hiện tại có phải là người tạo đơn hàng không
    $currentUser = Auth::user();

    if ($currentUser->id !== $order->user_id) {
      return response()->json([
        'success' => false,
        'message' => 'Bạn không có quyền cập nhật đơn hàng này. Chỉ nhân viên tạo đơn mới có thể cập nhật.',
      ], 403);
    }

    $data = $request->validated();
    $updatedOrder = $this->orderService->updateOrderStatus($order, $data['status']);

    return response()->json([
      'success' => true,
      'message' => 'Cập nhật trạng thái đơn hàng thành công',
      'order' => $updatedOrder,
    ]);
  }
}
