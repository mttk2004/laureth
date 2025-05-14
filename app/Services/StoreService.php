<?php

namespace App\Services;

use App\Models\Store;

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
            $query->where('name', 'like', '%'.$filters['name'].'%');
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
        return Store::create($data);
    }

    /**
     * Cập nhật thông tin cửa hàng
     *
     * @return Store
     */
    public function updateStore(Store $store, array $data)
    {
        return $store->update($data);
    }

    /**
     * Xóa cửa hàng
     *
     * @return bool
     */
    public function deleteStore(Store $store)
    {
        return $store->delete();
    }
}
