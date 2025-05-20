<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\InventoryTransfer;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

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
    $query = InventoryTransfer::query()
      ->with(['sourceWarehouse.store', 'destinationWarehouse.store', 'product', 'requestedBy', 'approvedBy'])
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

    return $query->paginate(10)->withQueryString();
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
   * @param int $approvedById ID người duyệt
   * @return InventoryTransfer
   */
  public function updateTransferStatus(InventoryTransfer $transfer, string $status, int $approvedById): InventoryTransfer
  {
    // Không cho phép cập nhật nếu đã hoàn thành hoặc từ chối
    if ($transfer->status === 'completed' || $transfer->status === 'rejected') {
      throw new \Exception('Không thể cập nhật yêu cầu đã hoàn thành hoặc bị từ chối');
    }

    // Xử lý trong transaction để đảm bảo tính nhất quán dữ liệu
    return DB::transaction(function () use ($transfer, $status, $approvedById) {
      // Cập nhật thông tin người duyệt và trạng thái
      $transfer->approved_by = $approvedById;
      $transfer->status = $status;
      $transfer->save();

      // Nếu trạng thái là completed, thực hiện chuyển kho
      if ($status === 'completed') {
        $this->processTransfer($transfer);
      }

      return $transfer->fresh(['sourceWarehouse.store', 'destinationWarehouse.store', 'product', 'requestedBy', 'approvedBy']);
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
