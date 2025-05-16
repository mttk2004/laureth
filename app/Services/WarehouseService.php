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
   * Tạo kho mới
   *
   * @param array $data Dữ liệu kho mới
   * @return Warehouse
   */
  public function createWarehouse(array $data)
  {
    return DB::transaction(function () use ($data) {
      $warehouse = Warehouse::create($data);
      return $warehouse;
    });
  }

  /**
   * Cập nhật thông tin kho
   *
   * @param Warehouse $warehouse Kho cần cập nhật
   * @param array $data Dữ liệu cập nhật
   * @return Warehouse
   */
  public function updateWarehouse(Warehouse $warehouse, array $data)
  {
    return DB::transaction(function () use ($warehouse, $data) {
      $warehouse->update($data);
      return $warehouse;
    });
  }

  /**
   * Xóa kho
   *
   * @param Warehouse $warehouse Kho cần xóa
   * @return bool
   */
  public function deleteWarehouse(Warehouse $warehouse)
  {
    return DB::transaction(function () use ($warehouse) {
      return $warehouse->delete();
    });
  }
}
