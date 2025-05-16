<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Services\PurchaseOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
  private $purchaseOrderService;

  public function __construct(PurchaseOrderService $purchaseOrderService)
  {
    $this->purchaseOrderService = $purchaseOrderService;
  }

  /**
   * Hiển thị danh sách đơn nhập hàng
   *
   * @param Request $request
   * @return \Inertia\Response
   */
  public function index(Request $request)
  {
    // Lấy danh sách đơn nhập hàng đã lọc, sắp xếp và phân trang
    $purchaseOrders = $this->purchaseOrderService->getPurchaseOrders(
      $request->all(),
      10,
      $request->input('sort', 'created_at_desc')
    );

    // Lấy danh sách nhà cung cấp để hiển thị trong filter
    $suppliers = Supplier::all();

    // Lấy danh sách kho để hiển thị trong filter
    $warehouses = Warehouse::all();

    // Lấy thông tin user
    $user = Auth::user();

    return Inertia::render('PurchaseOrders/Index', [
      'purchaseOrders' => $purchaseOrders,
      'user' => $user,
      'suppliers' => $suppliers,
      'warehouses' => $warehouses,
      'filters' => $request->only(['supplier_id', 'warehouse_id', 'date_from', 'date_to']),
      'sort' => $request->input('sort', 'created_at_desc'),
    ]);
  }

  /**
   * Lấy chi tiết các sản phẩm trong đơn nhập hàng
   *
   * @param PurchaseOrder $purchaseOrder
   * @return JsonResponse
   */
  public function getItems(PurchaseOrder $purchaseOrder): JsonResponse
  {
    // Lấy chi tiết các sản phẩm trong đơn nhập hàng kèm theo thông tin sản phẩm
    $items = $this->purchaseOrderService->getPurchaseOrderItems($purchaseOrder);

    return response()->json($items);
  }
}
