<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait FilterSortTrait
{
  /**
   * Xử lý sắp xếp cho query builder
   *
   * @param Builder $query Query builder cần xử lý
   * @param string $sort Chuỗi sắp xếp với định dạng field_direction
   * @param array $validSortFields Mảng các trường hợp lệ để sắp xếp
   * @param string $defaultSortField Trường sắp xếp mặc định
   * @param string $defaultSortDirection Hướng sắp xếp mặc định
   * @return Builder Query builder sau khi được xử lý
   */
  protected function applySorting(
    Builder $query,
    string $sort,
    array $validSortFields = ['created_at', 'name'],
    string $defaultSortField = 'created_at',
    string $defaultSortDirection = 'desc'
  ): Builder {
    // Nếu sort có định dạng đặc biệt như 'newest', 'oldest', xử lý trước
    switch ($sort) {
      case 'newest':
        return $query->orderBy('created_at', 'desc');
      case 'oldest':
        return $query->orderBy('created_at', 'asc');
      case 'name_asc':
        return $query->orderBy('name', 'asc');
      case 'name_desc':
        return $query->orderBy('name', 'desc');
    }

    // Xử lý chuỗi sắp xếp có định dạng field_direction
    $sortParts = explode('_', $sort);

    // Nếu có đủ các phần để xác định trường và hướng sắp xếp
    if (count($sortParts) > 1) {
      $sortDirection = end($sortParts);

      // Xác định field bằng cách loại bỏ phần direction
      $sortField = str_replace("_{$sortDirection}", '', $sort);

      // Chỉ áp dụng nếu field hợp lệ và direction là asc hoặc desc
      if (in_array($sortField, $validSortFields) && in_array($sortDirection, ['asc', 'desc'])) {
        return $query->orderBy($sortField, $sortDirection);
      }
    }

    // Sắp xếp mặc định nếu không xác định được
    return $query->orderBy($defaultSortField, $defaultSortDirection);
  }

  /**
   * Áp dụng bộ lọc theo tên/từ khóa
   *
   * @param Builder $query Query builder cần xử lý
   * @param array $filters Mảng các bộ lọc
   * @param string $filterKey Khóa của bộ lọc cần áp dụng
   * @param array $searchFields Các trường cần tìm kiếm
   * @return Builder Query builder sau khi được xử lý
   */
  protected function applyNameFilter(
    Builder $query,
    array $filters,
    string $filterKey = 'name',
    array $searchFields = ['name']
  ): Builder {
    if (isset($filters[$filterKey]) && !empty($filters[$filterKey])) {
      $query->where(function ($q) use ($filters, $filterKey, $searchFields) {
        foreach ($searchFields as $index => $field) {
          if ($index === 0) {
            $q->where($field, 'like', '%' . $filters[$filterKey] . '%');
          } else {
            $q->orWhere($field, 'like', '%' . $filters[$filterKey] . '%');
          }
        }
      });
    }

    return $query;
  }

  /**
   * Áp dụng bộ lọc theo ID liên kết (như category_id, store_id)
   *
   * @param Builder $query Query builder cần xử lý
   * @param array $filters Mảng các bộ lọc
   * @param string $filterKey Khóa của bộ lọc cần áp dụng
   * @param string $field Tên trường cần lọc (mặc định là trùng với filterKey)
   * @return Builder Query builder sau khi được xử lý
   */
  protected function applyRelationFilter(
    Builder $query,
    array $filters,
    string $filterKey,
    ?string $field = null
  ): Builder {
    $field = $field ?? $filterKey;

    if (isset($filters[$filterKey]) && $filters[$filterKey] !== 'all' && !empty($filters[$filterKey])) {
      $query->where($field, $filters[$filterKey]);
    }

    return $query;
  }

  /**
   * Áp dụng bộ lọc theo giá trị boolean
   *
   * @param Builder $query Query builder cần xử lý
   * @param array $filters Mảng các bộ lọc
   * @param string $filterKey Khóa của bộ lọc cần áp dụng
   * @param string $field Tên trường cần lọc (mặc định là trùng với filterKey)
   * @return Builder Query builder sau khi được xử lý
   */
  protected function applyBooleanFilter(
    Builder $query,
    array $filters,
    string $filterKey,
    ?string $field = null
  ): Builder {
    $field = $field ?? $filterKey;

    if (isset($filters[$filterKey]) && $filters[$filterKey]) {
      $query->where($field, true);
    }

    return $query;
  }

  /**
   * Áp dụng bộ lọc theo khoảng giá trị (như price_min, price_max)
   *
   * @param Builder $query Query builder cần xử lý
   * @param array $filters Mảng các bộ lọc
   * @param string $field Tên trường cần lọc
   * @param string $minKey Khóa cho giá trị tối thiểu
   * @param string $maxKey Khóa cho giá trị tối đa
   * @return Builder Query builder sau khi được xử lý
   */
  protected function applyRangeFilter(
    Builder $query,
    array $filters,
    string $field,
    string $minKey,
    string $maxKey
  ): Builder {
    if (isset($filters[$minKey]) && !empty($filters[$minKey])) {
      $query->where($field, '>=', $filters[$minKey]);
    }

    if (isset($filters[$maxKey]) && !empty($filters[$maxKey])) {
      $query->where($field, '<=', $filters[$maxKey]);
    }

    return $query;
  }
}
