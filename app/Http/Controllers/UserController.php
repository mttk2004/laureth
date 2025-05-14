<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserController extends Controller
{
  private $userService;

  public function __construct(UserService $userService)
  {
    $this->userService = $userService;
  }

  /**
   * Hiển thị danh sách nhân viên
   *
   * @param Request $request
   * @return \Inertia\Response
   */
  public function index(Request $request)
  {
    // Lấy danh sách sản phẩm đã lọc, sắp xếp và phân trang
    $users = $this->userService->getUsers(
      $request->all(),
      10,
      $request->input('sort', 'created_at_desc')
    );

    // Lấy tất cả cửa hàng để hiển thị trong filter
    $stores = Store::all();

    // Lấy thông tin user
    $user = Auth::user();

    return Inertia::render('Users/Index', [
      'users' => $users,
      'user' => $user,
      'stores' => $stores,
      'filters' => $request->only(['position', 'store_id']),
      'sort' => $request->input('sort', 'created_at_desc'),
    ]);
  }
}
