import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { Store } from '@/types/store';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import DataTable from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import WarehouseFilters from '@/components/warehouses/WarehouseFilters';
import WarehouseSortSelect from '@/components/warehouses/WarehouseSortSelect';
import { SortOption } from '@/lib/storeUtils';
import { Warehouse, WarehouseWithStore } from '@/types/warehouse';
import WarehouseDetailDialog from '@/components/warehouses/WarehouseDetailDialog';
import DeleteWarehouseDialog from '@/components/warehouses/DeleteWarehouseDialog';

interface Props {
  warehouses: {
    data: WarehouseWithStore[];
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
  };
  user: User;
  stores: Store[];
  filters?: {
    name?: string;
    store_id?: string;
    is_main?: boolean;
  };
  sort?: string;
}

export default function WarehousesIndex({ warehouses, user, stores = [], filters = {}, sort = SortOption.NEWEST }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteWarehouseId, setDeleteWarehouseId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const { addToast } = useToast();

  const handleViewWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDetailDialogOpen(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    router.visit(`/warehouses/${warehouse.id}/edit`);
  };

  const openDeleteDialog = (warehouseId: number) => {
    setDeleteWarehouseId(warehouseId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteWarehouseId(null);
  };

  const handleDelete = () => {
    if (deleteWarehouseId) {
      router.delete(`/warehouses/${deleteWarehouseId}`, {
        onSuccess: () => {
          addToast('Kho đã được xóa thành công', 'success');
          closeDeleteDialog();
        },
        onError: () => {
          addToast('Không thể xóa kho', 'error');
          closeDeleteDialog();
        }
      });
    }
  };

  const handleApplyFilters = (newFilters: Partial<{
    name: string;
    store_id: string;
    is_main: boolean;
  }>) => {
    router.get('/warehouses', {
      ...newFilters,
      sort,
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const handleSortChange = (sortOption: SortOption) => {
    router.get('/warehouses', {
      ...filters,
      sort: sortOption,
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Tên cửa hàng',
      render: (warehouse: Warehouse) => (
        <div className="text-sm font-medium">{warehouse.name}</div>
      ),
    },
    {
      key: 'store_id',
      label: 'Cửa hàng',
      render: (warehouse: Warehouse) => (
        <div className="text-sm max-w-md truncate">{warehouse.store_id}</div>
      ),
    },
    {
      key: 'is_main',
      label: 'Kho chính',
      render: (warehouse: Warehouse) => (
        <div className="text-sm">
          {warehouse.is_main ? 'Có' : 'Không'}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      render: (warehouse: Warehouse) => (
        <div className="text-sm font-medium">
          {new Date(warehouse.created_at).toLocaleDateString('vi-VN')}
        </div>
      ),
    },
  ];

  return (
    <AppLayout user={user}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý kho</h1>
          <div className="flex space-x-2">
            <WarehouseSortSelect
              value={sort as SortOption}
              onChange={handleSortChange}
            />
            <WarehouseFilters
              stores={stores}
              initialFilters={filters}
              onApplyFilters={handleApplyFilters}
            />
            <Button onClick={() => router.visit('/warehouses/create')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm kho mới
            </Button>
          </div>
        </div>

        <DataTable
          data={warehouses.data}
          columns={columns}
          actions={(warehouse: Warehouse) => (
            <div className="flex">
              <Button variant="ghost" size="sm" onClick={() => handleViewWarehouse(warehouse)}>
                <EyeIcon className="h-4 w-4" />
                <span className="sr-only">Xem</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleEditWarehouse(warehouse)}>
                <PencilIcon className="h-4 w-4" />
                <span className="sr-only">Sửa</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(warehouse.id)}>
                <TrashIcon className="h-4 w-4 text-red-500" />
                <span className="sr-only">Xóa</span>
              </Button>
            </div>
          )}
          pagination={{
            links: warehouses.links,
            from: warehouses.from,
            to: warehouses.to,
            total: warehouses.total
          }}
        />

        <WarehouseDetailDialog
          warehouse={selectedWarehouse}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />

        <DeleteWarehouseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
        />
      </div>
    </AppLayout>
  );
}
