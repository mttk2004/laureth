<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class OrderService extends BaseService
{
  /**
   * Lấy model class
   */
  protected function getModelClass(): string
  {
    return Order::class;
  }

  /**
   * Lấy danh sách các trường hợp lệ để sắp xếp
   */
  protected function getValidSortFields(): array
  {
    return ['created_at', 'order_date', 'final_amount'];
  }

  /**
   * Áp dụng các bộ lọc cho đơn hàng
   */
  protected function applyFilters(Builder $query, array $filters): Builder
  {
    // Lọc theo cửa hàng
    $query = $this->applyRelationFilter($query, $filters, 'store_id');

    // Lọc theo người tạo
    $query = $this->applyRelationFilter($query, $filters, 'user_id');

    // Lọc theo trạng thái
    $query = $this->applyRelationFilter($query, $filters, 'status');

    // Lọc theo phương thức thanh toán
    $query = $this->applyRelationFilter($query, $filters, 'payment_method');

    // Lọc theo khoảng thời gian
    if (isset($filters['date_from']) && !empty($filters['date_from'])) {
      $query->where('order_date', '>=', $filters['date_from'] . ' 00:00:00');
    }

    if (isset($filters['date_to']) && !empty($filters['date_to'])) {
      $query->where('order_date', '<=', $filters['date_to'] . ' 23:59:59');
    }

    return $query;
  }

  /**
   * Lấy danh sách đơn hàng với bộ lọc và sắp xếp
   *
   * @param array $filters Các bộ lọc cần áp dụng
   * @param int $perPage Số bản ghi mỗi trang
   * @param string $sort Cách sắp xếp
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getOrders(array $filters = [], int $perPage = 10, string $sort = 'order_date_desc')
  {
    return $this->getDataWithFilters(
      $filters,
      $perPage,
      $sort,
      ['user', 'store']
    );
  }

  /**
   * Lấy chi tiết các sản phẩm trong đơn hàng
   */
  public function getOrderItems(Order $order)
  {
    return $order->items()->with('product')->get();
  }

  /**
   * Lấy đơn hàng với đầy đủ thông tin liên quan
   */
  public function getOrderWithRelations(Order $order)
  {
    return $order->load(['user', 'store', 'items.product']);
  }
}
