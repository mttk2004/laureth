<?php

namespace App\Services;

use App\Models\Store;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class WarehouseService extends BaseService
{
    /**
     * Lấy model class
     */
    protected function getModelClass(): string
    {
        return Warehouse::class;
    }

    /**
     * Lấy danh sách các trường hợp lệ để sắp xếp
     */
    protected function getValidSortFields(): array
    {
        return ['created_at', 'name'];
    }

    /**
     * Áp dụng các bộ lọc cho warehouse
     */
    protected function applyFilters(Builder $query, array $filters): Builder
    {
        // Lọc theo tên
        $query = $this->applyNameFilter($query, $filters, 'name', ['name']);

        // Lọc theo cửa hàng
        $query = $this->applyRelationFilter($query, $filters, 'store_id');

        // Lọc kho chưa có cửa hàng
        if (isset($filters['no_store']) && $filters['no_store']) {
            $query->whereNull('store_id');
        }

        // Lọc kho chính
        $query = $this->applyBooleanFilter($query, $filters, 'is_main');

        return $query;
    }

    /**
     * Lấy danh sách kho với bộ lọc và sắp xếp
     *
     * @param  array  $filters  Các bộ lọc cần áp dụng
     * @param  int  $perPage  Số bản ghi mỗi trang
     * @param  string  $sort  Cách sắp xếp
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getWarehouses(array $filters = [], int $perPage = 10, string $sort = 'newest')
    {
        return $this->getDataWithFilters($filters, $perPage, $sort, ['store']);
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
            if (! empty($data['manager_id'])) {
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
                                'store_id' => $store->id,
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
