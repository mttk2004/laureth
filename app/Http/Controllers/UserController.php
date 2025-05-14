<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Store;
use App\Models\User;
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

  /**
   * Hiển thị form tạo người dùng mới
   *
   * @return \Inertia\Response
   */
  public function create()
  {
    // Lấy danh sách cửa hàng để hiển thị trong dropdown
    $stores = Store::all();

    return Inertia::render('Users/Create', [
      'stores' => $stores,
      'user' => Auth::user(),
    ]);
  }

  /**
   * Lưu người dùng mới
   *
   * @param StoreUserRequest $request
   * @return \Illuminate\Http\RedirectResponse
   */
  public function store(StoreUserRequest $request)
  {
    // Xử lý tạo người dùng qua service
    $this->userService->createUser($request->validated());

    return redirect()->route('users.index')
      ->with('success', 'Người dùng đã được tạo thành công.');
  }

  /**
   * Hiển thị form chỉnh sửa người dùng
   *
   * @param  mixed  $userId
   * @return \Inertia\Response
   */
  public function edit($userId)
  {
    // Tìm người dùng theo ID truyền vào
    $user = User::findOrFail($userId);

    // Lấy danh sách cửa hàng để hiển thị trong dropdown
    $stores = Store::all();

    return Inertia::render('Users/Edit', [
      'editUser' => $user->load('store'),
      'stores' => $stores,
      'user' => Auth::user(),
    ]);
  }

  /**
   * Cập nhật thông tin người dùng
   *
   * @param  UpdateUserRequest  $request
   * @param  mixed  $userId
   * @return \Illuminate\Http\RedirectResponse
   */
  public function update(UpdateUserRequest $request, $userId)
  {
    // Tìm người dùng theo ID
    $user = User::findOrFail($userId);

    // Xử lý cập nhật người dùng qua service
    $this->userService->updateUser($user, $request->validated());

    return redirect()->route('users.index')
      ->with('success', 'Thông tin người dùng đã được cập nhật thành công.');
  }

  /**
   * Xóa người dùng
   *
   * @param  mixed  $userId
   * @return \Illuminate\Http\RedirectResponse
   */
  public function destroy($userId)
  {
    // Tìm người dùng theo ID
    $user = User::findOrFail($userId);

    // Xử lý xóa người dùng qua service
    $this->userService->deleteUser($user);

    return redirect()->route('users.index')
      ->with('success', 'Người dùng đã được xóa thành công.');
  }
}
