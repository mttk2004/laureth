<?php

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class SupplierService extends BaseService
{
    /**
     * Lấy model class
     */
    protected function getModelClass(): string
    {
        return Supplier::class;
    }

    /**
     * Lấy danh sách các trường hợp lệ để sắp xếp
     */
    protected function getValidSortFields(): array
    {
        return ['name'];
    }

    /**
     * Áp dụng các bộ lọc cho supplier
     */
    protected function applyFilters(Builder $query, array $filters): Builder
    {
        // Lọc theo tên
        $query = $this->applyNameFilter($query, $filters, 'name', ['name']);

        // Lọc theo số điện thoại
        if (isset($filters['phone']) && ! empty($filters['phone'])) {
            $query->where('phone', 'like', '%'.$filters['phone'].'%');
        }

        // Lọc theo email
        if (isset($filters['email']) && ! empty($filters['email'])) {
            $query->where('email', 'like', '%'.$filters['email'].'%');
        }

        return $query;
    }

    /**
     * Lấy danh sách nhà cung cấp với bộ lọc và sắp xếp
     *
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getSuppliers(array $filters = [], int $perPage = 10, string $sort = 'name_asc')
    {
        return $this->getDataWithFilters($filters, $perPage, $sort);
    }

    /**
     * Lấy danh sách nhà cung cấp kèm theo lịch sử đơn nhập hàng
     *
     * @param  array  $filters  Bộ lọc
     * @param  int  $perPage  Số mục trên mỗi trang
     * @param  string  $sort  Cách sắp xếp
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getSuppliersWithPurchaseOrders(array $filters = [], int $perPage = 10, string $sort = 'name_asc')
    {
        // Lấy query cơ bản với các bộ lọc và sắp xếp
        $query = $this->getQueryWithRelations([]);
        $query = $this->applyFilters($query, $filters);
        $query = $this->applySorting($query, $sort, $this->getValidSortFields(), 'name', 'asc');

        // Eagerly load purchase orders cho mỗi nhà cung cấp, giới hạn 5 đơn hàng gần nhất
        $query->with(['purchaseOrders' => function ($query) {
            $query->orderBy('created_at', 'desc')
                ->take(5);
        }]);

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Lấy thông tin chi tiết của nhà cung cấp kèm theo lịch sử đơn hàng
     *
     * @param  int  $supplierId
     * @return \App\Models\Supplier
     */
    public function getSupplierWithPurchaseOrders($supplierId)
    {
        // Lấy thông tin nhà cung cấp theo ID
        $supplier = Supplier::with(['purchaseOrders' => function ($query) {
            $query->orderBy('created_at', 'desc')
                ->take(5); // Giới hạn chỉ lấy 5 đơn hàng gần nhất
        }])->findOrFail($supplierId);

        return $supplier;
    }

    /**
     * Lấy thông tin chi tiết của một nhà cung cấp
     *
     * @param  int  $id
     * @return \App\Models\Supplier
     */
    public function getSupplier($id)
    {
        return Supplier::findOrFail($id);
    }

    /**
     * Tạo mới một nhà cung cấp
     *
     * @return \App\Models\Supplier
     */
    public function createSupplier(array $data)
    {
        DB::beginTransaction();

        try {
            // Tạo nhà cung cấp mới
            $supplier = new Supplier;
            $supplier->name = $data['name'];
            $supplier->phone = $data['phone'];
            $supplier->email = $data['email'];
            $supplier->save();

            DB::commit();

            return $supplier;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Cập nhật thông tin nhà cung cấp
     *
     * @param  int  $id
     * @return \App\Models\Supplier
     */
    public function updateSupplier($id, array $data)
    {
        DB::beginTransaction();

        try {
            // Tìm và cập nhật nhà cung cấp
            $supplier = Supplier::findOrFail($id);
            $supplier->name = $data['name'];
            $supplier->phone = $data['phone'];
            $supplier->email = $data['email'];
            $supplier->save();

            DB::commit();

            return $supplier;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Xóa nhà cung cấp
     *
     * @param  int  $id
     * @return bool
     */
    public function deleteSupplier($id)
    {
        DB::beginTransaction();

        try {
            // Kiểm tra xem có thể xóa hay không (ví dụ: nhà cung cấp có đơn hàng liên quan)
            $supplier = Supplier::findOrFail($id);

            // Nếu nhà cung cấp có đơn hàng, không cho phép xóa
            if ($supplier->purchaseOrders()->count() > 0) {
                throw new \Exception('Không thể xóa nhà cung cấp đã có đơn hàng liên quan');
            }

            $supplier->delete();

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
