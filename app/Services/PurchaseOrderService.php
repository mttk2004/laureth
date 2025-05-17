<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class PurchaseOrderService extends BaseService
{
    /**
     * Lấy model class
     */
    protected function getModelClass(): string
    {
        return PurchaseOrder::class;
    }

    /**
     * Lấy danh sách các trường hợp lệ để sắp xếp
     */
    protected function getValidSortFields(): array
    {
        return ['created_at', 'order_date', 'total_amount'];
    }

    /**
     * Áp dụng các bộ lọc cho đơn nhập hàng
     */
    protected function applyFilters(Builder $query, array $filters): Builder
    {
        // Lọc theo nhà cung cấp
        $query = $this->applyRelationFilter($query, $filters, 'supplier_id');

        // Lọc theo kho
        $query = $this->applyRelationFilter($query, $filters, 'warehouse_id');

        // Lọc theo người tạo
        $query = $this->applyRelationFilter($query, $filters, 'user_id');

        // Lọc theo khoảng thời gian
        if (isset($filters['date_from']) && ! empty($filters['date_from'])) {
            $query->where('order_date', '>=', $filters['date_from'].' 00:00:00');
        }

        if (isset($filters['date_to']) && ! empty($filters['date_to'])) {
            $query->where('order_date', '<=', $filters['date_to'].' 23:59:59');
        }

        return $query;
    }

    /**
     * Lấy danh sách đơn nhập hàng với bộ lọc và sắp xếp
     *
     * @param  array  $filters  Các bộ lọc cần áp dụng
     * @param  int  $perPage  Số bản ghi mỗi trang
     * @param  string  $sort  Cách sắp xếp
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getPurchaseOrders(array $filters = [], int $perPage = 10, string $sort = 'created_at_desc')
    {
        return $this->getDataWithFilters(
            $filters,
            $perPage,
            $sort,
            ['supplier', 'warehouse', 'user']
        );
    }

    /**
     * Lấy chi tiết các sản phẩm trong đơn nhập hàng
     */
    public function getPurchaseOrderItems(PurchaseOrder $purchaseOrder): Collection
    {
        // Lấy các mục trong đơn hàng kèm theo thông tin sản phẩm
        return $purchaseOrder->items()->with('product')->get();
    }

    /**
     * Lấy đơn nhập hàng với đầy đủ thông tin liên quan
     */
    public function getPurchaseOrderWithRelations(PurchaseOrder $purchaseOrder): PurchaseOrder
    {
        // Lấy đơn hàng với các mối quan hệ liên quan
        return $purchaseOrder->load(['supplier', 'warehouse', 'user', 'items.product']);
    }
}
