<?php

namespace App\Services;

use App\Models\User;

class UserService
{
  /**
   * Lấy danh sách sản phẩm với bộ lọc và sắp xếp
   *
   * @param array $filters
   * @param int $perPage
   * @param string $sort
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


    // Sắp xếp
    if ($sort) {
      // Phân tích tùy chọn sắp xếp (ví dụ: created_at_desc, name_asc)
      $sortParts = explode('_', $sort);
      if (count($sortParts) > 1) {
        $sortDirection = end($sortParts);
        $sortField = str_replace("_{$sortDirection}", '', $sort);

        // Đảm bảo chỉ áp dụng cho các trường sắp xếp hợp lệ
        if (in_array($sortField, ['created_at', 'full_name', 'email', 'phone', 'position', 'store_id'])) {
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
}
