<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Store;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
