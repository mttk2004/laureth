<?php

namespace App\Services;

use App\Models\User;

class UserService
{
  /**
   * Lấy danh sách sản phẩm với bộ lọc và sắp xếp
   *
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getUsers(array $filters = [], int $perPage = 10, string $sort = 'created_at_desc')
  {
    $query = User::query()->with('store');

    // Lọc theo vai trò
    if (isset($filters['position']) && $filters['position'] !== 'all') {
      $query->where('position', $filters['position']);
    }

    // Lọc theo cửa hàng
    if (isset($filters['store_id']) && $filters['store_id'] !== 'all') {
      $query->where('store_id', $filters['store_id']);
    }

    // Lọc theo tên
    if (isset($filters['name']) && !empty($filters['name'])) {
      $query->where(function ($q) use ($filters) {
        $q->where('full_name', 'like', '%' . $filters['name'] . '%')
          ->orWhere('email', 'like', '%' . $filters['name'] . '%');
      });
    }

    // Sắp xếp
    if ($sort) {
      // Phân tích tùy chọn sắp xếp (ví dụ: created_at_desc, name_asc)
      $sortParts = explode('_', $sort);
      if (count($sortParts) > 1) {
        $sortDirection = end($sortParts);
        $sortField = str_replace("_{$sortDirection}", '', $sort);

        // Đảm bảo chỉ áp dụng cho các trường sắp xếp hợp lệ
        if (in_array($sortField, ['created_at', 'full_name', 'position'])) {
          $direction = $sortDirection === 'asc' ? 'asc' : 'desc';
          $query->orderBy($sortField, $direction);
        }
      }
    } else {
      // Mặc định sắp xếp theo thời gian tạo, mới nhất trước
      $query->orderBy('created_at', 'desc');
    }

    return $query->paginate($perPage)->withQueryString();
  }

  /**
   * Tạo người dùng mới
   *
   * @return User
   */
  public function createUser(array $data)
  {
    // Xử lý mật khẩu
    if (isset($data['password'])) {
      $data['password'] = bcrypt($data['password']);
    }

    // Xử lý các trường lương theo vị trí
    if ($data['position'] === 'SM') {
      $data['hourly_wage'] = null;
    } elseif (in_array($data['position'], ['SL', 'SA'])) {
      $data['base_salary'] = null;
    }

    return User::create($data);
  }

  /**
   * Cập nhật thông tin người dùng
   *
   * @return User
   */
  public function updateUser(User $user, array $data)
  {
    // Chỉ cập nhật mật khẩu nếu có nhập mới
    if (isset($data['password']) && ! empty($data['password'])) {
      $data['password'] = bcrypt($data['password']);
    } else {
      unset($data['password']);
    }

    // Xử lý các trường lương theo vị trí
    if ($data['position'] === 'SM') {
      $data['hourly_wage'] = null;
    } elseif (in_array($data['position'], ['SL', 'SA'])) {
      $data['base_salary'] = null;
    }

    $user->update($data);

    return $user;
  }

  /**
   * Xóa người dùng
   *
   * @return bool
   */
  public function deleteUser(User $user)
  {
    return $user->delete();
  }
}
