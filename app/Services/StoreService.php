<?php

namespace App\Services;

use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StoreService
{
  /**
   * Lấy danh sách cửa hàng với bộ lọc và sắp xếp
   *
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getStores(array $filters = [], int $perPage = 10, string $sort = 'newest')
  {
    $query = Store::query()->with('manager');

    // Lọc theo quản lý
    if (isset($filters['manager_id']) && ! empty($filters['manager_id'])) {
      $query->where('manager_id', $filters['manager_id']);
    }

    // Lọc cửa hàng đã có quản lý
    if (isset($filters['has_manager']) && $filters['has_manager']) {
      $query->whereNotNull('manager_id');
    }

    // Lọc theo tên
    if (isset($filters['name']) && ! empty($filters['name'])) {
      $query->where('name', 'like', '%' . $filters['name'] . '%');
    }

    // Sắp xếp
    switch ($sort) {
      case 'newest':
        $query->orderBy('created_at', 'desc');
        break;
      case 'oldest':
        $query->orderBy('created_at', 'asc');
        break;
      case 'name_asc':
        $query->orderBy('name', 'asc');
        break;
      case 'name_desc':
        $query->orderBy('name', 'desc');
        break;
      case 'target_asc':
        $query->orderBy('monthly_target', 'asc');
        break;
      case 'target_desc':
        $query->orderBy('monthly_target', 'desc');
        break;
      default:
        $query->orderBy('created_at', 'desc');
        break;
    }

    return $query->paginate($perPage)->withQueryString();
  }

  /**
   * Tạo cửa hàng mới
   *
   * @return Store
   */
  public function createStore(array $data)
  {
    return DB::transaction(function () use ($data) {
      $store = Store::create($data);

      // Nếu cửa hàng mới được chỉ định manager_id
      if (!empty($data['manager_id'])) {
        // Cập nhật store_id của manager
        User::where('id', $data['manager_id'])->update(['store_id' => $store->id]);
      }

      return $store;
    });
  }

  /**
   * Cập nhật thông tin cửa hàng
   *
   * @return Store
   */
  public function updateStore(Store $store, array $data)
  {
    return DB::transaction(function () use ($store, $data) {
      $oldManagerId = $store->manager_id;
      $newManagerId = $data['manager_id'] ?? null;

      // Nếu có sự thay đổi quản lý
      if ($oldManagerId !== $newManagerId) {
        // 1. Nếu có manager cũ, cập nhật store_id = null
        if ($oldManagerId) {
          $oldManager = User::find($oldManagerId);
          if ($oldManager) {
            $oldManager->update(['store_id' => null]);
          }
        }

        // 2. Nếu có manager mới
        if ($newManagerId) {
          $newManager = User::find($newManagerId);

          if ($newManager) {
            // Nếu đó là nhân viên của cửa hàng (SL, SA) thì thăng cấp lên SM
            if (in_array($newManager->position, ['SL', 'SA'])) {
              $newManager->update([
                'position' => 'SM',
                'hourly_wage' => null,
                'base_salary' => 10000000, // Lương cơ bản mặc định
                'store_id' => $store->id
              ]);
            } else {
              // Nếu đã là SM, cập nhật store_id
              $newManager->update(['store_id' => $store->id]);
            }
          }
        }
      }

      $store->update($data);

      return $store;
    });
  }

  /**
   * Xóa cửa hàng
   *
   * @return bool
   */
  public function deleteStore(Store $store)
  {
    return DB::transaction(function () use ($store) {
      // Cập nhật nhân viên của cửa hàng này thành null (chờ phân công)
      User::where('store_id', $store->id)->update(['store_id' => null]);

      return $store->delete();
    });
  }
}
