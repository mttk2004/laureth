<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Requests\OrderRequest;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\InventoryItem;

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

    // Tìm warehouse của cửa hàng
    $warehouse = Warehouse::where('store_id', $user->store_id)->first();

    if (!$warehouse) {
      return redirect()->route('pos.index')->with('error', 'Không tìm thấy kho hàng cho cửa hàng này.');
    }

    // Lấy danh sách sản phẩm có trong kho của cửa hàng
    $products = Product::whereHas('inventoryItems', function ($query) use ($warehouse) {
      $query->where('warehouse_id', $warehouse->id)
        ->where('quantity', '>', 0);
    })->with(['inventoryItems' => function ($query) use ($warehouse) {
      $query->where('warehouse_id', $warehouse->id);
    }])->get();

    return Inertia::render('Orders/Create', [
      'user' => $user,
      'products' => $products,
    ]);
  }

  /**
   * Lưu đơn hàng mới
   *
   * @param OrderRequest $request
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
}
