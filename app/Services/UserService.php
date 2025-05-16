<?php

namespace App\Services;

use App\Models\User;
use App\Models\Store;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class UserService extends BaseService
{
  /**
   * Lu1ea5y model class
   *
   * @return string
   */
  protected function getModelClass(): string
  {
    return User::class;
  }

  /**
   * Lu1ea5y danh su00e1ch cu00e1c tru01b0u1eddng hu1ee3p lu1ec7 u0111u1ec3 su1eafp xu1ebfp
   *
   * @return array
   */
  protected function getValidSortFields(): array
  {
    return ['created_at', 'full_name', 'position'];
  }

  /**
   * u00c1p du1ee5ng cu00e1c bu1ed9 lu1ecdc cho user
   *
   * @param Builder $query
   * @param array $filters
   * @return Builder
   */
  protected function applyFilters(Builder $query, array $filters): Builder
  {
    // Lu1ecdc theo vai tru00f2
    $query = $this->applyRelationFilter($query, $filters, 'position');

    // Lu1ecdc nhu00e2n viu00ean chu01b0a phu00e2n cu00f4ng
    if (isset($filters['unassigned']) && $filters['unassigned']) {
      $query->whereNull('store_id');
    }
    // Lu1ecdc theo cu1eeda hu00e0ng (chu1ec9 u00e1p du1ee5ng nu1ebfu khu00f4ng lu1ecdc theo nhu00e2n viu00ean chu01b0a phu00e2n cu00f4ng)
    elseif (isset($filters['store_id']) && $filters['store_id'] !== 'all') {
      $query->where('store_id', $filters['store_id']);
    }

    // Lu1ecdc theo tu00ean
    $query = $this->applyNameFilter($query, $filters, 'name', ['full_name', 'email']);

    return $query;
  }

  /**
   * Lu1ea5y danh su00e1ch su1ea3n phu1ea9m vu1edbi bu1ed9 lu1ecdc vu00e0 su1eafp xu1ebfp
   *
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getUsers(array $filters = [], int $perPage = 10, string $sort = 'created_at_desc')
  {
    return $this->getDataWithFilters($filters, $perPage, $sort, ['store']);
  }

  /**
   * Tu1ea1o ngu01b0u1eddi du00f9ng mu1edbi
   *
   * @return User
   */
  public function createUser(array $data)
  {
    // Bu1eaft u0111u1ea7u transaction
    return DB::transaction(function () use ($data) {
      // Xu1eed lu00fd mu1eadt khu1ea9u
      if (isset($data['password'])) {
        $data['password'] = bcrypt($data['password']);
      }

      // Xu1eed lu00fd cu00e1c tru01b0u1eddng lu01b0u01a1ng theo vu1ecb tru00ed
      if ($data['position'] === 'SM') {
        $data['hourly_wage'] = null;

        // Nu1ebfu ngu01b0u1eddi du00f9ng u0111u01b0u1ee3c tu1ea1o lu00e0 SM vu00e0 cu00f3 store_id, cu1eadp nhu1eadt manager_id cu1ee7a store
        if (!empty($data['store_id'])) {
          $store = Store::find($data['store_id']);

          // Nu1ebfu cu1eeda hu00e0ng u0111u00e3 cu00f3 manager, hu00e3y xu00f3a vai tru00f2 manager cu1ee7a ngu01b0u1eddi u0111u00f3
          if ($store && $store->manager_id) {
            $currentManager = User::find($store->manager_id);
            if ($currentManager) {
              // Reset vai tru00f2 cu1ee7a manager cu0169
              $currentManager->update([
                'store_id' => null
              ]);
            }
          }
        }
      } elseif (in_array($data['position'], ['SL', 'SA'])) {
        $data['base_salary'] = null;
      }

      $user = User::create($data);

      // Nu1ebfu ngu01b0u1eddi du00f9ng u0111u01b0u1ee3c tu1ea1o lu00e0 SM vu00e0 cu00f3 store_id, cu1eadp nhu1eadt manager_id cu1ee7a store
      if ($data['position'] === 'SM' && !empty($data['store_id'])) {
        Store::where('id', $data['store_id'])->update(['manager_id' => $user->id]);
      }

      return $user;
    });
  }

  /**
   * Cu1eadp nhu1eadt thu00f4ng tin ngu01b0u1eddi du00f9ng
   *
   * @return User
   */
  public function updateUser(User $user, array $data)
  {
    // Bu1eaft u0111u1ea7u transaction
    return DB::transaction(function () use ($user, $data) {
      $oldPosition = $user->position;
      $newPosition = $data['position'];
      $oldStoreId = $user->store_id;
      $newStoreId = $data['store_id'] ?? null;

      // Chu1ec9 cu1eadp nhu1eadt mu1eadt khu1ea9u nu1ebfu cu00f3 nhu1eadp mu1edbi
      if (isset($data['password']) && ! empty($data['password'])) {
        $data['password'] = bcrypt($data['password']);
      } else {
        unset($data['password']);
      }

      // Xu1eed lu00fd thu0103ng cu1ea5p tu1eeb SL/SA lu00ean SM
      if (($oldPosition === 'SL' || $oldPosition === 'SA') && $newPosition === 'SM') {
        // Xu00f3a lu01b0u01a1ng theo giu1edd vu00e0 chuyu1ec3n sang lu01b0u01a1ng cu01a1 bu1ea3n
        $data['hourly_wage'] = null;

        // Nu1ebfu store_id thay u0111u1ed5i hou1eb7c giu1eef nguyu00ean, kiu1ec3m tra vu00e0 cu1eadp nhu1eadt manager
        if ($newStoreId) {
          $store = Store::find($newStoreId);
          if ($store) {
            // Nu1ebfu cu1eeda hu00e0ng nu00e0y u0111u00e3 cu00f3 quu1ea3n lu00fd khu00e1c
            if ($store->manager_id && $store->manager_id !== $user->id) {
              $currentManager = User::find($store->manager_id);
              if ($currentManager) {
                // Reset store_id cu1ee7a manager cu0169 u0111u1ec3 hu1ecd khu00f4ng thuu1ed9c cu1eeda hu00e0ng nu1eefa
                $currentManager->update(['store_id' => null]);
              }
            }

            // Cu1eadp nhu1eadt manager_id cu1ee7a cu1eeda hu00e0ng thu00e0nh ngu01b0u1eddi du00f9ng nu00e0y
            $store->update(['manager_id' => $user->id]);
          }
        }
      }
      // Nu1ebfu ngu01b0u1eddi du00f9ng u0111u00e3 lu00e0 SM vu00e0 muu1ed1n chuyu1ec3n cu1eeda hu00e0ng
      elseif ($oldPosition === 'SM' && $newPosition === 'SM' && $oldStoreId !== $newStoreId) {
        // Nu1ebfu ngu01b0u1eddi du00f9ng lu00e0 quu1ea3n lu00fd cu1ee7a cu1eeda hu00e0ng cu0169, reset manager_id
        $oldStore = Store::where('manager_id', $user->id)->first();
        if ($oldStore) {
          $oldStore->update(['manager_id' => null]);
        }

        // u0110u1eb7t lu00e0m quu1ea3n lu00fd cu1ee7a cu1eeda hu00e0ng mu1edbi
        if ($newStoreId) {
          $newStore = Store::find($newStoreId);
          if ($newStore) {
            // Nu1ebfu cu1eeda hu00e0ng mu1edbi u0111u00e3 cu00f3 quu1ea3n lu00fd khu00e1c
            if ($newStore->manager_id && $newStore->manager_id !== $user->id) {
              $currentManager = User::find($newStore->manager_id);
              if ($currentManager) {
                $currentManager->update(['store_id' => null]);
              }
            }

            // Cu1eadp nhu1eadt manager_id cu1ee7a cu1eeda hu00e0ng mu1edbi
            $newStore->update(['manager_id' => $user->id]);
          }
        }
      }

      // Xu1eed lu00fd cu00e1c tru01b0u1eddng lu01b0u01a1ng theo vu1ecb tru00ed
      if ($data['position'] === 'SM') {
        $data['hourly_wage'] = null;
      } elseif (in_array($data['position'], ['SL', 'SA'])) {
        $data['base_salary'] = null;
      }

      $user->update($data);

      return $user;
    });
  }

  /**
   * Xu00f3a ngu01b0u1eddi du00f9ng
   *
   * @return bool
   */
  public function deleteUser(User $user)
  {
    return DB::transaction(function () use ($user) {
      // Nu1ebfu ngu01b0u1eddi du00f9ng lu00e0 SM vu00e0 u0111ang quu1ea3n lu00fd cu1eeda hu00e0ng
      if ($user->position === 'SM') {
        // Cu1eadp nhu1eadt manager_id cu1ee7a cu1eeda hu00e0ng thu00e0nh null
        Store::where('manager_id', $user->id)->update(['manager_id' => null]);
      }

      return $user->delete();
    });
  }
}
