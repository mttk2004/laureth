import { Button, DataTable } from '@/components/ui';
import {
    CreateTransferDialog,
    StoreWarehouseFilters,
    TransferDetailDialog,
    TransferStatusBadge
} from '@/components/warehouses';
import AppLayout from '@/layouts/app-layout';
import { InventoryTransfer, InventoryTransferStatus, Store, User, Warehouse, WarehouseWithStore } from '@/types';
import { EyeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { BaseSortSelect } from '@/components/common/BaseSortSelect';
import { formatDate } from '@/lib/utils';
import axios from 'axios';

// Interface cho dữ liệu chi tiết từ API
interface TransferDetailResponse {
    id: number;
    source_warehouse_id: number;
    destination_warehouse_id: number;
    source_warehouse?: {
        id: number;
        name: string;
        store?: {
            id: number;
            name: string;
        };
    };
    destination_warehouse?: {
        id: number;
        name: string;
        store?: {
            id: number;
            name: string;
        };
    };
    requested_by?: {
        id: string;
        name: string;
        full_name: string;
    };
    approved_by?: {
        id: string;
        name: string;
        full_name: string;
    };
    product?: {
        id: string;
        name: string;
    };
    product_id: string;
    quantity: number;
    status: InventoryTransferStatus;
    created_at: string;
    updated_at: string;
}

interface Props {
    transfers: {
        data: InventoryTransfer[];
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

// Cập nhật props cho TransferDetailDialog để sử dụng TransferDetailResponse
interface TransferDetailDialogProps {
    transfer: TransferDetailResponse | null;
    selectedTransfer: TransferDetailResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusUpdated: () => void;
    currentUserStoreId: number;
}

// Khai báo lại component TransferDetailDialog với props mới
const EnhancedTransferDetailDialog = (TransferDetailDialog as unknown) as React.FC<TransferDetailDialogProps>;

export default function WarehouseManagementIndex({
    transfers,
    storeWarehouses,
    allWarehouses,
    user,
    store,
    filters = {},
    sort = 'created_at_desc'
}: Props) {
    const [selectedTransfer, setSelectedTransfer] = useState<TransferDetailResponse | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [transferList, setTransferList] = useState<TransferDetailResponse[]>([]);

    // Log dữ liệu gốc từ server
    useEffect(() => {
        console.log('Original transfers from server:', transfers);
    }, [transfers]);

    // Chuyển đổi danh sách transfers từ server khi component được mount
    useEffect(() => {
        if (transfers?.data) {
            console.log('Original transfers data structure:', {
                firstItem: transfers.data[0] || 'No items',
                hasSourceWarehouse: transfers.data[0]?.sourceWarehouse !== undefined,
                hasDestinationWarehouse: transfers.data[0]?.destinationWarehouse !== undefined,
                fullDataSample: JSON.stringify(transfers.data[0])
            });

            // Map từ InventoryTransfer sang TransferDetailResponse
            const mappedTransfers = transfers.data.map(transfer => {
                // Log chi tiết từng transfer
                console.log(`Processing transfer #${transfer.id} raw data:`, transfer);

                // Kiểm tra cấu trúc dữ liệu của transfer.sourceWarehouse và transfer.destinationWarehouse
                const sourceWarehousePresent = transfer.sourceWarehouse !== undefined;
                const destinationWarehousePresent = transfer.destinationWarehouse !== undefined;

                console.log(`Transfer #${transfer.id} relationships:`, {
                    sourceWarehousePresent,
                    destinationWarehousePresent,
                    sourceWarehouseData: transfer.sourceWarehouse,
                    destinationWarehouseData: transfer.destinationWarehouse,
                    sourceStoreName: transfer.sourceWarehouse?.store?.name,
                    destinationStoreName: transfer.destinationWarehouse?.store?.name
                });

                // Có thể dữ liệu đã được chuyển đổi sang snake_case bởi server
                const sourceWarehouse = transfer.sourceWarehouse || transfer.source_warehouse;
                const destinationWarehouse = transfer.destinationWarehouse || transfer.destination_warehouse;
                const requestedBy = transfer.requestedBy || transfer.requested_by;
                const approvedBy = transfer.approvedBy || transfer.approved_by;

                // Chuyển đổi sang định dạng API
                return {
                    id: transfer.id,
                    source_warehouse_id: transfer.source_warehouse_id,
                    destination_warehouse_id: transfer.destination_warehouse_id,
                    source_warehouse: sourceWarehouse,
                    destination_warehouse: destinationWarehouse,
                    requested_by: requestedBy,
                    approved_by: approvedBy,
                    product: transfer.product,
                    product_id: transfer.product_id,
                    quantity: transfer.quantity,
                    status: transfer.status,
                    created_at: transfer.created_at,
                    updated_at: transfer.updated_at
                } as TransferDetailResponse;
            });

            setTransferList(mappedTransfers);
            console.log('Mapped transfer list:', mappedTransfers);
        }
    }, [transfers]);

    // Xem chi tiết yêu cầu chuyển kho
    const handleViewTransfer = async (transfer: TransferDetailResponse) => {
        try {
            // Fetch chi tiết từ API trước khi mở dialog
            const response = await axios.get(`/api/inventory-transfers/${transfer.id}`);
            if (response.data) {
                setSelectedTransfer(response.data);
                console.log('Detail API response:', response.data);
            } else {
                setSelectedTransfer(transfer);
            }
        } catch (error) {
            console.error('Error fetching transfer detail:', error);
            // Nếu có lỗi, vẫn hiển thị dữ liệu từ bảng
            setSelectedTransfer(transfer);
        } finally {
            setDetailDialogOpen(true);
        }
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

    // Hàm helper để lấy tên kho nguồn/đích với tên cửa hàng
    const getWarehouseName = (warehouse?: { name?: string; store?: { name?: string } } | null) => {
        if (!warehouse) return 'Không xác định';

        const name = warehouse.name || 'Không xác định';
        const storeName = warehouse.store?.name;

        return storeName ? `${name} (${storeName})` : name;
    };

    // Định nghĩa các cột trong bảng
    const columns = [
        {
            key: 'id',
            label: 'Mã YC',
            render: (transfer: TransferDetailResponse) => (
                <div className="text-sm font-medium">#{transfer.id}</div>
            ),
        },
        {
            key: 'source_warehouse',
            label: 'Kho nguồn',
            render: (transfer: TransferDetailResponse) => (
                <div className="text-sm">
                    {getWarehouseName(transfer.source_warehouse)}
                </div>
            ),
        },
        {
            key: 'destination_warehouse',
            label: 'Kho đích',
            render: (transfer: TransferDetailResponse) => (
                <div className="text-sm">
                    {getWarehouseName(transfer.destination_warehouse)}
                </div>
            ),
        },
        {
            key: 'product',
            label: 'Sản phẩm',
            render: (transfer: TransferDetailResponse) => <div className="text-sm">{transfer.product?.name || 'Không xác định'}</div>,
        },
        {
            key: 'quantity',
            label: 'Số lượng',
            render: (transfer: TransferDetailResponse) => <div className="text-sm">{transfer.quantity}</div>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (transfer: TransferDetailResponse) => <TransferStatusBadge status={transfer.status} />,
        },
        {
            key: 'created_at',
            label: 'Ngày tạo',
            render: (transfer: TransferDetailResponse) => <div className="text-sm">{formatDate(transfer.created_at)}</div>,
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
                    data={transferList}
                    columns={columns}
                    actions={(transfer: TransferDetailResponse) => (
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

                <EnhancedTransferDetailDialog
                    transfer={selectedTransfer}
                    selectedTransfer={selectedTransfer}
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    onStatusUpdated={handleTransferUpdated}
                    currentUserStoreId={Number(store.id)}
                />
            </div>
        </AppLayout>
    );
}
