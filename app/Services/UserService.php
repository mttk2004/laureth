<?php

namespace App\Services;

use App\Models\User;
use App\Models\Store;
use Illuminate\Support\Facades\DB;

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

    // Lọc nhân viên chưa phân công
    if (isset($filters['unassigned']) && $filters['unassigned']) {
      $query->whereNull('store_id');
    }
    // Lọc theo cửa hàng (chỉ áp dụng nếu không lọc theo nhân viên chưa phân công)
    elseif (isset($filters['store_id']) && $filters['store_id'] !== 'all') {
      $query->where('store_id', $filters['store_id']);
    }

    // Lọc theo tên
    if (isset($filters['name']) && ! empty($filters['name'])) {
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
    // Bắt đầu transaction
    return DB::transaction(function () use ($data) {
      // Xử lý mật khẩu
      if (isset($data['password'])) {
        $data['password'] = bcrypt($data['password']);
      }

      // Xử lý các trường lương theo vị trí
      if ($data['position'] === 'SM') {
        $data['hourly_wage'] = null;

        // Nếu người dùng được tạo là SM và có store_id, cập nhật manager_id của store
        if (!empty($data['store_id'])) {
          $store = Store::find($data['store_id']);

          // Nếu cửa hàng đã có manager, hãy xóa vai trò manager của người đó
          if ($store && $store->manager_id) {
            $currentManager = User::find($store->manager_id);
            if ($currentManager) {
              // Reset vai trò của manager cũ
              $currentManager->update([
                'store_id' => null
              ]);
            }
          }
        }
      } elseif (in_array($data['position'], ['SL', 'SA'])) {
        $data['base_salary'] = null;
      }

      $user = User::create($data);

      // Nếu người dùng được tạo là SM và có store_id, cập nhật manager_id của store
      if ($data['position'] === 'SM' && !empty($data['store_id'])) {
        Store::where('id', $data['store_id'])->update(['manager_id' => $user->id]);
      }

      return $user;
    });
  }

  /**
   * Cập nhật thông tin người dùng
   *
   * @return User
   */
  public function updateUser(User $user, array $data)
  {
    // Bắt đầu transaction
    return DB::transaction(function () use ($user, $data) {
      $oldPosition = $user->position;
      $newPosition = $data['position'];
      $oldStoreId = $user->store_id;
      $newStoreId = $data['store_id'] ?? null;

      // Chỉ cập nhật mật khẩu nếu có nhập mới
      if (isset($data['password']) && ! empty($data['password'])) {
        $data['password'] = bcrypt($data['password']);
      } else {
        unset($data['password']);
      }

      // Xử lý thăng cấp từ SL/SA lên SM
      if (($oldPosition === 'SL' || $oldPosition === 'SA') && $newPosition === 'SM') {
        // Xóa lương theo giờ và chuyển sang lương cơ bản
        $data['hourly_wage'] = null;

        // Nếu store_id thay đổi hoặc giữ nguyên, kiểm tra và cập nhật manager
        if ($newStoreId) {
          $store = Store::find($newStoreId);
          if ($store) {
            // Nếu cửa hàng này đã có quản lý khác
            if ($store->manager_id && $store->manager_id !== $user->id) {
              $currentManager = User::find($store->manager_id);
              if ($currentManager) {
                // Reset store_id của manager cũ để họ không thuộc cửa hàng nữa
                $currentManager->update(['store_id' => null]);
              }
            }

            // Cập nhật manager_id của cửa hàng thành người dùng này
            $store->update(['manager_id' => $user->id]);
          }
        }
      }
      // Nếu người dùng đã là SM và muốn chuyển cửa hàng
      elseif ($oldPosition === 'SM' && $newPosition === 'SM' && $oldStoreId !== $newStoreId) {
        // Nếu người dùng là quản lý của cửa hàng cũ, reset manager_id
        $oldStore = Store::where('manager_id', $user->id)->first();
        if ($oldStore) {
          $oldStore->update(['manager_id' => null]);
        }

        // Đặt làm quản lý của cửa hàng mới
        if ($newStoreId) {
          $newStore = Store::find($newStoreId);
          if ($newStore) {
            // Nếu cửa hàng mới đã có quản lý khác
            if ($newStore->manager_id && $newStore->manager_id !== $user->id) {
              $currentManager = User::find($newStore->manager_id);
              if ($currentManager) {
                $currentManager->update(['store_id' => null]);
              }
            }

            // Cập nhật manager_id của cửa hàng mới
            $newStore->update(['manager_id' => $user->id]);
          }
        }
      }

      // Xử lý các trường lương theo vị trí
      if ($data['position'] === 'SM') {
        $data['hourly_wage'] = null;
      } elseif (in_array($data['position'], ['SL', 'SA'])) {
        $data['base_salary'] = null;
      }

      $user->update($data);

      return $user;
    });
  }

  /**
   * Xóa người dùng
   *
   * @return bool
   */
  public function deleteUser(User $user)
  {
    return DB::transaction(function () use ($user) {
      // Nếu người dùng là SM và đang quản lý cửa hàng
      if ($user->position === 'SM') {
        // Cập nhật manager_id của cửa hàng thành null
        Store::where('manager_id', $user->id)->update(['manager_id' => null]);
      }

      return $user->delete();
    });
  }
}
