import { Button, DataTable } from '@/components/ui';
import {
    CreateTransferDialog,
    StoreWarehouseFilters,
    TransferDetailDialog,
    TransferStatusBadge
} from '@/components/warehouses';
import AppLayout from '@/layouts/app-layout';
import { InventoryTransfer, Store, User, Warehouse, WarehouseWithStore } from '@/types';
import { EyeIcon } from 'lucide-react';
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { BaseSortSelect } from '@/components/common/BaseSortSelect';
import { formatDate } from '@/lib/utils';

// Mở rộng type InventoryTransfer để bao gồm các quan hệ
interface InventoryTransferWithRelations extends InventoryTransfer {
    sourceWarehouse?: {
        name: string;
        store?: {
            name: string;
        };
    };
    destinationWarehouse?: {
        name: string;
        store?: {
            name: string;
        };
    };
    product?: {
        name: string;
    };
    requestedBy?: {
        name: string;
    };
    approvedBy?: {
        name: string;
    };
}

interface Props {
    transfers: {
        data: InventoryTransferWithRelations[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        from: number;
        to: number;
        total: number;
    };
    storeWarehouses: Warehouse[];
    allWarehouses: WarehouseWithStore[];
    user: User;
    store: Store;
    filters?: {
        status?: string;
        source_warehouse_id?: string;
        destination_warehouse_id?: string;
    };
    sort?: string;
}

export default function WarehouseManagementIndex({
    transfers,
    storeWarehouses,
    allWarehouses,
    user,
    store,
    filters = {},
    sort = 'created_at_desc'
}: Props) {
    const [selectedTransfer, setSelectedTransfer] = useState<InventoryTransferWithRelations | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Xem chi tiết yêu cầu chuyển kho
    const handleViewTransfer = (transfer: InventoryTransferWithRelations) => {
        setSelectedTransfer(transfer);
        setDetailDialogOpen(true);
    };

    // Lọc và sắp xếp
    const handleApplyFilters = (newFilters: Record<string, string>) => {
        router.get(
            '/warehouse-management',
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

    const handleSortChange = (newSort: string) => {
        router.get(
            '/warehouse-management',
            {
                ...filters,
                sort: newSort,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    // Refresh data khi có thay đổi
    const handleTransferUpdated = () => {
        router.reload();
    };

    // Định nghĩa các cột trong bảng
    const columns = [
        {
            key: 'id',
            label: 'Mã YC',
            render: (transfer: InventoryTransferWithRelations) => (
                <div className="text-sm font-medium">#{transfer.id}</div>
            ),
        },
        {
            key: 'source_warehouse',
            label: 'Kho nguồn',
            render: (transfer: InventoryTransferWithRelations) => (
                <div className="text-sm">
                    {transfer.sourceWarehouse?.name}{' '}
                    {transfer.sourceWarehouse?.store?.name &&
                        <span className="text-xs text-gray-500">({transfer.sourceWarehouse.store.name})</span>
                    }
                </div>
            ),
        },
        {
            key: 'destination_warehouse',
            label: 'Kho đích',
            render: (transfer: InventoryTransferWithRelations) => (
                <div className="text-sm">
                    {transfer.destinationWarehouse?.name}{' '}
                    {transfer.destinationWarehouse?.store?.name &&
                        <span className="text-xs text-gray-500">({transfer.destinationWarehouse.store.name})</span>
                    }
                </div>
            ),
        },
        {
            key: 'product',
            label: 'Sản phẩm',
            render: (transfer: InventoryTransferWithRelations) => <div className="text-sm">{transfer.product?.name}</div>,
        },
        {
            key: 'quantity',
            label: 'Số lượng',
            render: (transfer: InventoryTransferWithRelations) => <div className="text-sm">{transfer.quantity}</div>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (transfer: InventoryTransferWithRelations) => <TransferStatusBadge status={transfer.status} />,
        },
        {
            key: 'created_at',
            label: 'Ngày tạo',
            render: (transfer: InventoryTransferWithRelations) => <div className="text-sm">{formatDate(transfer.created_at)}</div>,
        },
    ];

    // Các tùy chọn sắp xếp
    const sortOptions = [
        {
            value: 'created_at_desc',
            label: 'Mới nhất',
        },
        {
            value: 'created_at_asc',
            label: 'Cũ nhất',
        },
        {
            value: 'status_asc',
            label: 'Trạng thái (A-Z)',
        },
        {
            value: 'status_desc',
            label: 'Trạng thái (Z-A)',
        },
    ];

    return (
        <AppLayout user={user}>
            <Head title="Quản lý kho" />

            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý kho</h1>
                    <div className="flex space-x-2">
                        <BaseSortSelect value={sort} options={sortOptions} onChange={handleSortChange} />
                        <StoreWarehouseFilters
                            storeWarehouses={storeWarehouses}
                            allWarehouses={allWarehouses}
                            initialFilters={filters}
                            onApplyFilters={handleApplyFilters}
                        />
                        <CreateTransferDialog
                            storeWarehouses={storeWarehouses}
                            allWarehouses={allWarehouses}
                            onTransferCreated={handleTransferUpdated}
                        />
                    </div>
                </div>

                <DataTable
                    data={transfers.data}
                    columns={columns}
                    actions={(transfer: InventoryTransferWithRelations) => (
                        <div className="flex">
                            <Button variant="ghost" size="sm" onClick={() => handleViewTransfer(transfer)}>
                                <EyeIcon className="h-4 w-4" />
                                <span className="sr-only">Xem</span>
                            </Button>
                        </div>
                    )}
                    pagination={{
                        links: transfers.links,
                        from: transfers.from,
                        to: transfers.to,
                        total: transfers.total,
                    }}
                />

                <TransferDetailDialog
                    transfer={selectedTransfer}
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    onStatusUpdated={handleTransferUpdated}
                    currentUserStoreId={Number(store.id)}
                />
            </div>
        </AppLayout>
    );
}
