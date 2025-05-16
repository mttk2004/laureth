<?php

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class SupplierService extends BaseService
{
  /**
   * Lu1ea5y model class
   *
   * @return string
   */
  protected function getModelClass(): string
  {
    return Supplier::class;
  }

  /**
   * Lu1ea5y danh su00e1ch cu00e1c tru01b0u1eddng hu1ee3p lu1ec7 u0111u1ec3 su1eafp xu1ebfp
   *
   * @return array
   */
  protected function getValidSortFields(): array
  {
    return ['name'];
  }

  /**
   * u00c1p du1ee5ng cu00e1c bu1ed9 lu1ecdc cho supplier
   *
   * @param Builder $query
   * @param array $filters
   * @return Builder
   */
  protected function applyFilters(Builder $query, array $filters): Builder
  {
    // Lu1ecdc theo tu00ean
    $query = $this->applyNameFilter($query, $filters, 'name', ['name']);

    // Lu1ecdc theo su1ed1 u0111iu1ec7n thou1ea1i
    if (isset($filters['phone']) && ! empty($filters['phone'])) {
      $query->where('phone', 'like', '%' . $filters['phone'] . '%');
    }

    // Lu1ecdc theo email
    if (isset($filters['email']) && ! empty($filters['email'])) {
      $query->where('email', 'like', '%' . $filters['email'] . '%');
    }

    return $query;
  }

  /**
   * Lu1ea5y danh su00e1ch nhu00e0 cung cu1ea5p vu1edbi bu1ed9 lu1ecdc vu00e0 su1eafp xu1ebfp
   *
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getSuppliers(array $filters = [], int $perPage = 10, string $sort = 'name_asc')
  {
    return $this->getDataWithFilters($filters, $perPage, $sort);
  }

  /**
   * Lu1ea5y danh su00e1ch nhu00e0 cung cu1ea5p ku00e8m theo lu1ecbch su1eed u0111u01a1n nhu1eadp hu00e0ng
   *
   * @param array $filters Bu1ed9 lu1ecdc
   * @param int $perPage Su1ed1 mu1ee5c tru00ean mu1ed7i trang
   * @param string $sort Cu00e1ch su1eafp xu1ebfp
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getSuppliersWithPurchaseOrders(array $filters = [], int $perPage = 10, string $sort = 'name_asc')
  {
    // Lu1ea5y query cu01a1 bu1ea3n vu1edbi cu00e1c bu1ed9 lu1ecdc vu00e0 su1eafp xu1ebfp
    $query = $this->getQueryWithRelations([]);
    $query = $this->applyFilters($query, $filters);
    $query = $this->applySorting($query, $sort, $this->getValidSortFields(), 'name', 'asc');

    // Eagerly load purchase orders cho mu1ed7i nhu00e0 cung cu1ea5p, giu1edbi hu1ea1n 5 u0111u01a1n hu00e0ng gu1ea7n nhu1ea5t
    $query->with(['purchaseOrders' => function ($query) {
      $query->orderBy('created_at', 'desc')
        ->take(5);
    }]);

    return $query->paginate($perPage)->withQueryString();
  }

  /**
   * Lu1ea5y thu00f4ng tin chi tiu1ebft cu1ee7a nhu00e0 cung cu1ea5p ku00e8m theo lu1ecbch su1eed u0111u01a1n hu00e0ng
   *
   * @param int $supplierId
   * @return \App\Models\Supplier
   */
  public function getSupplierWithPurchaseOrders($supplierId)
  {
    // Lu1ea5y thu00f4ng tin nhu00e0 cung cu1ea5p theo ID
    $supplier = Supplier::with(['purchaseOrders' => function ($query) {
      $query->orderBy('created_at', 'desc')
        ->take(5); // Giu1edbi hu1ea1n chu1ec9 lu1ea5y 5 u0111u01a1n hu00e0ng gu1ea7n nhu1ea5t
    }])->findOrFail($supplierId);

    return $supplier;
  }

  /**
   * Lu1ea5y thu00f4ng tin chi tiu1ebft cu1ee7a mu1ed9t nhu00e0 cung cu1ea5p
   *
   * @param int $id
   * @return \App\Models\Supplier
   */
  public function getSupplier($id)
  {
    return Supplier::findOrFail($id);
  }

  /**
   * Tu1ea1o mu1edbi mu1ed9t nhu00e0 cung cu1ea5p
   *
   * @param array $data
   * @return \App\Models\Supplier
   */
  public function createSupplier(array $data)
  {
    DB::beginTransaction();

    try {
      // Tu1ea1o nhu00e0 cung cu1ea5p mu1edbi
      $supplier = new Supplier();
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
   * Cu1eadp nhu1eadt thu00f4ng tin nhu00e0 cung cu1ea5p
   *
   * @param int $id
   * @param array $data
   * @return \App\Models\Supplier
   */
  public function updateSupplier($id, array $data)
  {
    DB::beginTransaction();

    try {
      // Tu00ecm vu00e0 cu1eadp nhu1eadt nhu00e0 cung cu1ea5p
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
   * Xu00f3a nhu00e0 cung cu1ea5p
   *
   * @param int $id
   * @return bool
   */
  public function deleteSupplier($id)
  {
    DB::beginTransaction();

    try {
      // Kiu1ec3m tra xem cu00f3 thu1ec3 xu00f3a hay khu00f4ng (vu00ed du1ee5: nhu00e0 cung cu1ea5p cu00f3 u0111u01a1n hu00e0ng liu00ean quan)
      $supplier = Supplier::findOrFail($id);

      // Nu1ebfu nhu00e0 cung cu1ea5p cu00f3 u0111u01a1n hu00e0ng, khu00f4ng cho phu00e9p xu00f3a
      if ($supplier->purchaseOrders()->count() > 0) {
        throw new \Exception('Khu00f4ng thu1ec3 xu00f3a nhu00e0 cung cu1ea5p u0111u00e3 cu00f3 u0111u01a1n hu00e0ng liu00ean quan');
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
