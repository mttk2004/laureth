import { Button, DataTable } from '@/components/ui';
import { DeleteWarehouseDialog, WarehouseDetailDialog, WarehouseFilters, WarehouseSortSelect } from '@/components/warehouses';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Store, User, WarehouseSortOption, WarehouseWithStore } from '@/types';
import { router } from '@inertiajs/react';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

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

export default function WarehousesIndex({ warehouses, user, stores = [], filters = {}, sort = WarehouseSortOption.NEWEST }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteWarehouseId, setDeleteWarehouseId] = useState<number | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseWithStore | null>(null);
    const { addToast } = useToast();

    const handleViewWarehouse = (warehouse: WarehouseWithStore) => {
        setSelectedWarehouse(warehouse);
        setDetailDialogOpen(true);
    };

    const handleEditWarehouse = (warehouse: WarehouseWithStore) => {
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
                },
            });
        }
    };

    const handleApplyFilters = (
        newFilters: Partial<{
            name: string;
            store_id: string;
            is_main: boolean;
        }>,
    ) => {
        router.get(
            '/warehouses',
            {
                ...newFilters,
                sort,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const handleSortChange = (sortOption: WarehouseSortOption) => {
        router.get(
            '/warehouses',
            {
                ...filters,
                sort: sortOption,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const columns = [
        {
            key: 'name',
            label: 'Tên kho',
            render: (warehouse: WarehouseWithStore) => <div className="text-sm font-medium">{warehouse.name}</div>,
        },
        {
            key: 'address',
            label: 'Địa chỉ',
            render: (warehouse: WarehouseWithStore) => <div className="max-w-md truncate text-sm">{warehouse.address}</div>,
        },
        {
            key: 'store_id',
            label: 'Thuộc cửa hàng',
            render: (warehouse: WarehouseWithStore) => <div className="max-w-md truncate text-sm">{warehouse.store?.name}</div>,
        },
    ];

    return (
        <AppLayout user={user}>
            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý kho</h1>
                    <div className="flex space-x-2">
                        <WarehouseSortSelect value={sort as WarehouseSortOption} onChange={handleSortChange} />
                        <WarehouseFilters stores={stores} initialFilters={filters} onApplyFilters={handleApplyFilters} />
                        <Button onClick={() => router.visit('/warehouses/create')}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Thêm kho mới
                        </Button>
                    </div>
                </div>

                <DataTable
                    data={warehouses.data}
                    columns={columns}
                    actions={(warehouse: WarehouseWithStore) => (
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
                        total: warehouses.total,
                    }}
                />

                <WarehouseDetailDialog warehouse={selectedWarehouse} open={detailDialogOpen} onOpenChange={setDetailDialogOpen} />

                <DeleteWarehouseDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
            </div>
        </AppLayout>
    );
}
