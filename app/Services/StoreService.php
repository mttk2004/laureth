<?php

namespace App\Services;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class StoreService extends BaseService
{
  /**
   * Lu1ea5y model class
   *
   * @return string
   */
  protected function getModelClass(): string
  {
    return Store::class;
  }

  /**
   * Lu1ea5y danh su00e1ch cu00e1c tru01b0u1eddng hu1ee3p lu1ec7 u0111u1ec3 su1eafp xu1ebfp
   *
   * @return array
   */
  protected function getValidSortFields(): array
  {
    return ['created_at', 'name', 'monthly_target'];
  }

  /**
   * u00c1p du1ee5ng cu00e1c bu1ed9 lu1ecdc cho store
   *
   * @param Builder $query
   * @param array $filters
   * @return Builder
   */
  protected function applyFilters(Builder $query, array $filters): Builder
  {
    // Lu1ecdc theo quu1ea3n lu00fd
    if (isset($filters['manager_id']) && ! empty($filters['manager_id'])) {
      $query->where('manager_id', $filters['manager_id']);
    }

    // Lu1ecdc cu1eeda hu00e0ng u0111u00e3 cu00f3 quu1ea3n lu00fd
    if (isset($filters['has_manager']) && $filters['has_manager']) {
      $query->whereNotNull('manager_id');
    }

    // Lu1ecdc cu1eeda hu00e0ng chu01b0a cu00f3 quu1ea3n lu00fd
    if (isset($filters['no_manager']) && $filters['no_manager']) {
      $query->whereNull('manager_id');
    }

    // Lu1ecdc theo tu00ean
    $query = $this->applyNameFilter($query, $filters, 'name', ['name']);

    return $query;
  }

  /**
   * Lu1ea5y danh su00e1ch cu1eeda hu00e0ng vu1edbi bu1ed9 lu1ecdc vu00e0 su1eafp xu1ebfp
   *
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getStores(array $filters = [], int $perPage = 10, string $sort = 'newest')
  {
    return $this->getDataWithFilters($filters, $perPage, $sort, ['manager']);
  }

  /**
   * Tu1ea1o cu1eeda hu00e0ng mu1edbi
   *
   * @return Store
   */
  public function createStore(array $data)
  {
    return DB::transaction(function () use ($data) {
      $store = Store::create($data);

      // Nu1ebfu cu1eeda hu00e0ng mu1edbi u0111u01b0u1ee3c chu1ec9 u0111u1ecbnh manager_id
      if (!empty($data['manager_id'])) {
        // Cu1eadp nhu1eadt store_id cu1ee7a manager
        User::where('id', $data['manager_id'])->update(['store_id' => $store->id]);
      }

      return $store;
    });
  }

  /**
   * Cu1eadp nhu1eadt thu00f4ng tin cu1eeda hu00e0ng
   *
   * @return Store
   */
  public function updateStore(Store $store, array $data)
  {
    return DB::transaction(function () use ($store, $data) {
      $oldManagerId = $store->manager_id;
      $newManagerId = $data['manager_id'] ?? null;

      // Nu1ebfu cu00f3 su1ef1 thay u0111u1ed5i quu1ea3n lu00fd
      if ($oldManagerId !== $newManagerId) {
        // 1. Nu1ebfu cu00f3 manager cu0169, cu1eadp nhu1eadt store_id = null
        if ($oldManagerId) {
          $oldManager = User::find($oldManagerId);
          if ($oldManager) {
            $oldManager->update(['store_id' => null]);
          }
        }

        // 2. Nu1ebfu cu00f3 manager mu1edbi
        if ($newManagerId) {
          $newManager = User::find($newManagerId);

          if ($newManager) {
            // Nu1ebfu u0111u00f3 lu00e0 nhu00e2n viu00ean cu1ee7a cu1eeda hu00e0ng (SL, SA) thu00ec thu0103ng cu1ea5p lu00ean SM
            if (in_array($newManager->position, ['SL', 'SA'])) {
              $newManager->update([
                'position' => 'SM',
                'hourly_wage' => null,
                'base_salary' => 10000000, // Lu01b0u01a1ng cu01a1 bu1ea3n mu1eb7c u0111u1ecbnh
                'store_id' => $store->id
              ]);
            } else {
              // Nu1ebfu u0111u00e3 lu00e0 SM, cu1eadp nhu1eadt store_id
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
   * Xu00f3a cu1eeda hu00e0ng
   *
   * @return bool
   */
  public function deleteStore(Store $store)
  {
    return DB::transaction(function () use ($store) {
      // Cu1eadp nhu1eadt nhu00e2n viu00ean cu1ee7a cu1eeda hu00e0ng nu00e0y thu00e0nh null (chu1edd phu00e2n cu00f4ng)
      User::where('store_id', $store->id)->update(['store_id' => null]);

      return $store->delete();
    });
  }
}
