<?php

namespace App\Services;

use App\Traits\FilterSortTrait;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

abstract class BaseService
{
  use FilterSortTrait;

  /**
   * Model class mà service này làm việc với
   *
   * @return string
   */
  abstract protected function getModelClass(): string;

  /**
   * Các trường hợp lệ cho việc sắp xếp
   *
   * @return array
   */
  protected function getValidSortFields(): array
  {
    return ['created_at', 'name'];
  }

  /**
   * Tạo query builder cơ bản với các relation được load
   *
   * @return Builder
   */
  protected function getBaseQuery(): Builder
  {
    // Khởi tạo model từ class name
    $modelClass = $this->getModelClass();

    // Tạo query builder
    return $modelClass::query();
  }

  /**
   * Tạo query với các relation
   *
   * @param array $relations Các relation cần eager load
   * @return Builder
   */
  protected function getQueryWithRelations(array $relations = []): Builder
  {
    $query = $this->getBaseQuery();

    if (!empty($relations)) {
      $query->with($relations);
    }

    return $query;
  }

  /**
   * Áp dụng các bộ lọc cơ bản cho query
   * Phương thức này nên được ghi đè bởi các lớp con
   *
   * @param Builder $query Query cần áp dụng bộ lọc
   * @param array $filters Các bộ lọc cần áp dụng
   * @return Builder
   */
  protected function applyFilters(Builder $query, array $filters): Builder
  {
    return $query;
  }

  /**
   * Lấy dữ liệu với bộ lọc, sắp xếp và phân trang
   *
   * @param array $filters Các bộ lọc cần áp dụng
   * @param int $perPage Số bản ghi mỗi trang
   * @param string $sort Cách sắp xếp
   * @param array $relations Các relation cần eager load
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getDataWithFilters(
    array $filters = [],
    int $perPage = 10,
    string $sort = 'created_at_desc',
    array $relations = []
  ) {
    // Tạo query builder với các relation
    $query = $this->getQueryWithRelations($relations);

    // Áp dụng các bộ lọc
    $query = $this->applyFilters($query, $filters);

    // Áp dụng sắp xếp
    $query = $this->applySorting(
      $query,
      $sort,
      $this->getValidSortFields(),
      'created_at',
      'desc'
    );

    // Phân trang và trả về kết quả
    return $query->paginate($perPage)->withQueryString();
  }
}
