<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StaffController extends Controller
{
  private $userService;

  public function __construct(UserService $userService)
  {
    $this->userService = $userService;
  }

  /**
   * Hiển thị danh sách nhân viên của cửa hàng được quản lý bởi SM
   *
   * @return \Inertia\Response
   */
  public function index(Request $request)
  {
    $user = Auth::user();

    // Đảm bảo chỉ người dùng có quyền SM mới có thể truy cập
    if (!$user->isSm() || !$user->store_id) {
      abort(403, 'Không có quyền truy cập');
    }

    // Thêm store_id vào filters để chỉ lấy nhân viên của cửa hàng hiện tại
    $filters = $request->all();
    $filters['store_id'] = $user->store_id;

    // Lấy danh sách nhân viên đã lọc, sắp xếp và phân trang
    $staff = $this->userService->getUsers(
      $filters,
      10,
      $request->input('sort', 'created_at_desc')
    );

    // Lấy thông tin cửa hàng hiện tại
    $store = Store::find($user->store_id);

    return Inertia::render('Staff/Index', [
      'staff' => $staff,
      'user' => $user,
      'store' => $store,
      'filters' => $request->only(['position', 'name']),
      'sort' => $request->input('sort', 'created_at_desc'),
    ]);
  }

  /**
   * Hiển thị chi tiết của một nhân viên
   *
   * @param string $staffId
   * @return \Inertia\Response
   */
  public function show($staffId)
  {
    $user = Auth::user();

    // Đảm bảo chỉ người dùng có quyền SM mới có thể truy cập
    if (!$user->isSm() || !$user->store_id) {
      abort(403, 'Không có quyền truy cập');
    }

    // Tìm nhân viên theo ID
    $staff = User::findOrFail($staffId);

    // Kiểm tra xem nhân viên có thuộc cửa hàng của SM không
    if ($staff->store_id !== $user->store_id) {
      abort(403, 'Không có quyền truy cập thông tin nhân viên này');
    }

    return Inertia::render('Staff/Show', [
      'staff' => $staff,
      'user' => $user,
    ]);
  }
}
