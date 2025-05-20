<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\InventoryTransfer;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryTransferService
{
  /**
   * Lấy danh sách chuyển kho được lọc theo điều kiện
   *
   * @param array $warehouseIds Danh sách id kho
   * @param array $filters Các điều kiện lọc
   * @param string $sort Trường và hướng sắp xếp
   * @param User $user Người dùng hiện tại
   * @return LengthAwarePaginator
   */
  public function getFilteredTransfers(array $warehouseIds, array $filters, string $sort, User $user): LengthAwarePaginator
  {
    Log::info('Getting filtered transfers', [
      'warehouse_ids' => $warehouseIds,
      'filters' => $filters,
      'sort' => $sort,
      'user_id' => $user->id
    ]);

    $query = InventoryTransfer::query()
      ->with([
        'sourceWarehouse' => function ($query) {
          $query->withTrashed()->with(['store' => function ($q) {
            $q->withTrashed();
          }]);
        },
        'destinationWarehouse' => function ($query) {
          $query->withTrashed()->with(['store' => function ($q) {
            $q->withTrashed();
          }]);
        },
        'product' => function ($query) {
          $query->withTrashed();
        },
        'requestedBy' => function ($query) {
          $query->withTrashed();
        },
        'approvedBy' => function ($query) {
          $query->withTrashed();
        }
      ])
      ->where(function ($query) use ($warehouseIds) {
        $query->whereIn('source_warehouse_id', $warehouseIds)
          ->orWhereIn('destination_warehouse_id', $warehouseIds);
      });

    // Áp dụng các bộ lọc
    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (!empty($filters['source_warehouse_id']) && $filters['source_warehouse_id'] !== 'all') {
      $query->where('source_warehouse_id', $filters['source_warehouse_id']);
    }

    if (!empty($filters['destination_warehouse_id']) && $filters['destination_warehouse_id'] !== 'all') {
      $query->where('destination_warehouse_id', $filters['destination_warehouse_id']);
    }

    // Áp dụng sắp xếp
    if ($sort === 'created_at_desc') {
      $query->orderBy('created_at', 'desc');
    } elseif ($sort === 'created_at_asc') {
      $query->orderBy('created_at', 'asc');
    } elseif ($sort === 'status_asc') {
      $query->orderBy('status', 'asc');
    } elseif ($sort === 'status_desc') {
      $query->orderBy('status', 'desc');
    }

    $result = $query->paginate(10)->withQueryString();

    // Kiểm tra và ghi log chi tiết các kết quả
    Log::info('Transfers result count: ' . $result->count(), [
      'total' => $result->total()
    ]);

    // Ghi log mẫu đầu tiên để debug
    if ($result->count() > 0) {
      $firstItem = $result->items()[0];
      Log::debug('First transfer item for debugging', [
        'id' => $firstItem->id,
        'source_warehouse' => $firstItem->sourceWarehouse ? [
          'id' => $firstItem->sourceWarehouse->id,
          'name' => $firstItem->sourceWarehouse->name,
          'store' => $firstItem->sourceWarehouse->store ? [
            'id' => $firstItem->sourceWarehouse->store->id,
            'name' => $firstItem->sourceWarehouse->store->name
          ] : null
        ] : null,
        'destination_warehouse' => $firstItem->destinationWarehouse ? [
          'id' => $firstItem->destinationWarehouse->id,
          'name' => $firstItem->destinationWarehouse->name,
          'store' => $firstItem->destinationWarehouse->store ? [
            'id' => $firstItem->destinationWarehouse->store->id,
            'name' => $firstItem->destinationWarehouse->store->name
          ] : null
        ] : null,
        'product' => $firstItem->product ? [
          'id' => $firstItem->product->id,
          'name' => $firstItem->product->name
        ] : null,
        'requestedBy' => $firstItem->requestedBy ? [
          'id' => $firstItem->requestedBy->id,
          'name' => $firstItem->requestedBy->name,
          'full_name' => $firstItem->requestedBy->full_name ?? null
        ] : null,
        'approvedBy' => $firstItem->approvedBy ? [
          'id' => $firstItem->approvedBy->id,
          'name' => $firstItem->approvedBy->name,
          'full_name' => $firstItem->approvedBy->full_name ?? null
        ] : null
      ]);
    }

    return $result;
  }

  /**
   * Tạo yêu cầu chuyển kho mới
   *
   * @param array $data Dữ liệu chuyển kho
   * @return InventoryTransfer
   */
  public function createTransfer(array $data): InventoryTransfer
  {
    // Tạo yêu cầu chuyển kho mới
    return InventoryTransfer::create($data);
  }

  /**
   * Cập nhật trạng thái yêu cầu chuyển kho
   *
   * @param InventoryTransfer $transfer Yêu cầu chuyển kho
   * @param string $status Trạng thái mới (approved, rejected, completed)
   * @param string $approvedById ID người duyệt
   * @return InventoryTransfer
   */
  public function updateTransferStatus(InventoryTransfer $transfer, string $status, string $approvedById): InventoryTransfer
  {
    Log::info('Updating transfer status', [
      'transfer_id' => $transfer->id,
      'old_status' => $transfer->status,
      'new_status' => $status,
      'approved_by' => $approvedById
    ]);

    // Không cho phép cập nhật nếu đã hoàn thành hoặc từ chối
    if ($transfer->status === 'completed' || $transfer->status === 'rejected') {
      Log::warning('Cannot update transfer that is already completed or rejected', [
        'transfer_id' => $transfer->id,
        'current_status' => $transfer->status
      ]);
      throw new \Exception('Không thể cập nhật yêu cầu đã hoàn thành hoặc bị từ chối');
    }

    // Xử lý trong transaction để đảm bảo tính nhất quán dữ liệu
    return DB::transaction(function () use ($transfer, $status, $approvedById) {
      // Cập nhật thông tin người duyệt và trạng thái
      $transfer->approved_by = $approvedById;
      $transfer->status = $status;
      $transfer->save();

      Log::info('Transfer status updated', [
        'transfer_id' => $transfer->id,
        'new_status' => $status
      ]);

      // Nếu trạng thái là completed, thực hiện chuyển kho
      if ($status === 'completed') {
        $this->processTransfer($transfer);
      }

      $refreshedTransfer = $transfer->fresh([
        'sourceWarehouse' => function ($query) {
          $query->withTrashed()->with(['store' => function ($q) {
            $q->withTrashed();
          }]);
        },
        'destinationWarehouse' => function ($query) {
          $query->withTrashed()->with(['store' => function ($q) {
            $q->withTrashed();
          }]);
        },
        'product' => function ($query) {
          $query->withTrashed();
        },
        'requestedBy' => function ($query) {
          $query->withTrashed();
        },
        'approvedBy' => function ($query) {
          $query->withTrashed();
        }
      ]);

      // Ghi log chi tiết dữ liệu cập nhật
      Log::debug('Updated transfer data', [
        'id' => $refreshedTransfer->id,
        'source_warehouse' => $refreshedTransfer->sourceWarehouse ? [
          'id' => $refreshedTransfer->sourceWarehouse->id,
          'name' => $refreshedTransfer->sourceWarehouse->name,
          'store' => $refreshedTransfer->sourceWarehouse->store ? [
            'id' => $refreshedTransfer->sourceWarehouse->store->id,
            'name' => $refreshedTransfer->sourceWarehouse->store->name
          ] : null
        ] : null,
        'destination_warehouse' => $refreshedTransfer->destinationWarehouse ? [
          'id' => $refreshedTransfer->destinationWarehouse->id,
          'name' => $refreshedTransfer->destinationWarehouse->name,
          'store' => $refreshedTransfer->destinationWarehouse->store ? [
            'id' => $refreshedTransfer->destinationWarehouse->store->id,
            'name' => $refreshedTransfer->destinationWarehouse->store->name
          ] : null
        ] : null,
        'requested_by' => $refreshedTransfer->requestedBy ? [
          'id' => $refreshedTransfer->requestedBy->id,
          'name' => $refreshedTransfer->requestedBy->name
        ] : null,
        'approved_by' => $refreshedTransfer->approvedBy ? [
          'id' => $refreshedTransfer->approvedBy->id,
          'name' => $refreshedTransfer->approvedBy->name
        ] : null
      ]);

      return $refreshedTransfer;
    });
  }

  /**
   * Thực hiện việc chuyển kho
   *
   * @param InventoryTransfer $transfer Yêu cầu chuyển kho
   * @return void
   */
  private function processTransfer(InventoryTransfer $transfer): void
  {
    // Kiểm tra tồn kho nguồn
    $sourceInventory = InventoryItem::where('warehouse_id', $transfer->source_warehouse_id)
      ->where('product_id', $transfer->product_id)
      ->first();

    if (!$sourceInventory || $sourceInventory->quantity < $transfer->quantity) {
      throw new \Exception('Số lượng sản phẩm trong kho nguồn không đủ');
    }

    // Giảm số lượng ở kho nguồn
    $sourceInventory->quantity -= $transfer->quantity;
    $sourceInventory->save();

    // Tăng số lượng ở kho đích
    $destinationInventory = InventoryItem::firstOrNew([
      'warehouse_id' => $transfer->destination_warehouse_id,
      'product_id' => $transfer->product_id,
    ]);

    if (!$destinationInventory->exists) {
      $destinationInventory->quantity = 0;
    }

    $destinationInventory->quantity += $transfer->quantity;
    $destinationInventory->save();
  }
}
