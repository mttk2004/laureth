<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Services\SupplierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SupplierController extends Controller
{
  protected SupplierService $supplierService;

  /**
   * Khởi tạo controller với supplier service
   */
  public function __construct(SupplierService $supplierService)
  {
    $this->supplierService = $supplierService;
  }

  /**
   * Hiển thị danh sách nhà cung cấp
   *
   * @return \Inertia\Response
   */
  public function index(Request $request)
  {
    // Lấy danh sách nhà cung cấp đã lọc, sắp xếp và phân trang
    $suppliers = $this->supplierService->getSuppliersWithPurchaseOrders(
      $request->all(),
      10,
      $request->input('sort', 'name_asc')
    );

    // Lấy thông tin user
    $user = Auth::user();

    return Inertia::render('Suppliers/Index', [
      'suppliers' => $suppliers,
      'user' => $user,
      'filters' => $request->only(['name', 'phone', 'email']),
      'sort' => $request->input('sort', 'name_asc'),
    ]);
  }

  /**
   * Hiển thị form tạo nhà cung cấp mới
   *
   * @return \Inertia\Response
   */
  public function create()
  {
    return Inertia::render('Suppliers/Create', [
      'user' => Auth::user(),
    ]);
  }

  /**
   * Lưu nhà cung cấp mới vào database
   *
   * @param StoreSupplierRequest $request
   * @return \Illuminate\Http\RedirectResponse
   */
  public function store(StoreSupplierRequest $request)
  {
    $data = $request->validated();

    $this->supplierService->createSupplier($data);

    return redirect()->route('suppliers.index')
      ->with('success', 'Nhà cung cấp đã được tạo thành công.');
  }

  /**
   * Hiển thị form chỉnh sửa nhà cung cấp
   *
   * @param int $id
   * @return \Inertia\Response
   */
  public function edit($id)
  {
    $supplier = $this->supplierService->getSupplier($id);

    return Inertia::render('Suppliers/Edit', [
      'supplier' => $supplier,
      'user' => Auth::user(),
    ]);
  }

  /**
   * Cập nhật thông tin nhà cung cấp
   *
   * @param UpdateSupplierRequest $request
   * @param int $id
   * @return \Illuminate\Http\RedirectResponse
   */
  public function update(UpdateSupplierRequest $request, $id)
  {
    $data = $request->validated();

    $this->supplierService->updateSupplier($id, $data);

    return redirect()->route('suppliers.index')
      ->with('success', 'Nhà cung cấp đã được cập nhật thành công.');
  }

  /**
   * Xóa nhà cung cấp
   *
   * @param int $id
   * @return \Illuminate\Http\RedirectResponse
   */
  public function destroy($id)
  {
    $this->supplierService->deleteSupplier($id);

    return redirect()->route('suppliers.index')
      ->with('success', 'Nhà cung cấp đã được xóa thành công.');
  }
}
