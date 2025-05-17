import { PurchaseOrderDetailDialog, PurchaseOrderFilters, PurchaseOrderPrintPreview, PurchaseOrderSortSelect } from '@/components/purchase-orders';
import { DataTable } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { WarehouseSelectDialog } from '@/components/warehouses';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib';
import { PurchaseOrder, PurchaseOrderSortOption, Supplier, User, Warehouse } from '@/types';
import { Head, router } from '@inertiajs/react';
import { EyeIcon, PlusIcon, PrinterIcon } from 'lucide-react';
import { useState } from 'react';

interface PurchaseOrderWithRelations extends PurchaseOrder {
    supplier?: Supplier;
    warehouse?: Warehouse;
    user?: User;
}

interface Props {
    purchaseOrders: {
        data: PurchaseOrderWithRelations[];
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
    suppliers: Supplier[];
    warehouses: Warehouse[];
    filters?: {
        supplier_id?: string;
        warehouse_id?: string;
        date_from?: string;
        date_to?: string;
    };
    sort?: string;
}

export default function PurchaseOrdersIndex({
    purchaseOrders,
    user,
    suppliers = [],
    warehouses = [],
    filters = {},
    sort = PurchaseOrderSortOption.NEWEST,
}: Props) {
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [warehouseSelectDialogOpen, setWarehouseSelectDialogOpen] = useState(false);
    const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrderWithRelations | null>(null);

    const handleApplyFilters = (
        newFilters: Partial<{
            supplier_id: string;
            warehouse_id: string;
            date_from: string;
            date_to: string;
        }>,
    ) => {
        router.get(
            '/purchase-orders',
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

    const handleSortChange = (sortOption: PurchaseOrderSortOption) => {
        router.get(
            '/purchase-orders',
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

    const handleViewPurchaseOrder = (purchaseOrder: PurchaseOrderWithRelations) => {
        setSelectedPurchaseOrder(purchaseOrder);
        setDetailDialogOpen(true);
    };

    const handlePrintPurchaseOrder = (purchaseOrder: PurchaseOrderWithRelations) => {
        setSelectedPurchaseOrder(purchaseOrder);
        setPrintDialogOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
    };

    const columns = [
        {
            key: 'id',
            label: 'Mã đơn',
            render: (purchaseOrder: PurchaseOrderWithRelations) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">#{purchaseOrder.id.toString().slice(-6)}</span>
                    <span className="text-xs text-gray-500">{formatDate(purchaseOrder.order_date)}</span>
                </div>
            ),
        },
        {
            key: 'supplier',
            label: 'Nhà cung cấp',
            render: (purchaseOrder: PurchaseOrderWithRelations) => <div className="text-sm">{purchaseOrder.supplier?.name}</div>,
        },
        {
            key: 'warehouse',
            label: 'Kho',
            render: (purchaseOrder: PurchaseOrderWithRelations) => <div className="text-sm">{purchaseOrder.warehouse?.name}</div>,
        },
        {
            key: 'user',
            label: 'Người tạo',
            render: (purchaseOrder: PurchaseOrderWithRelations) => <div className="text-sm">{purchaseOrder.user?.full_name}</div>,
        },
        {
            key: 'total_amount',
            label: 'Tổng tiền',
            render: (purchaseOrder: PurchaseOrderWithRelations) => (
                <div className="text-right text-sm font-medium">{formatCurrency(purchaseOrder.total_amount)}</div>
            ),
        },
    ];

    return (
        <AppLayout user={user}>
            <Head title="Quản lý đơn nhập hàng" />

            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý đơn nhập hàng</h1>
                    <div className="flex space-x-2">
                        <PurchaseOrderSortSelect value={sort as PurchaseOrderSortOption} onChange={handleSortChange} />
                        <PurchaseOrderFilters
                            suppliers={suppliers}
                            warehouses={warehouses}
                            initialFilters={filters}
                            onApplyFilters={handleApplyFilters}
                        />
                        <Button onClick={() => setWarehouseSelectDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Nhập hàng
                        </Button>
                    </div>
                </div>

                <DataTable
                    data={purchaseOrders.data}
                    columns={columns}
                    actions={(purchaseOrder: PurchaseOrderWithRelations) => (
                        <div className="flex">
                            <Button variant="ghost" size="sm" onClick={() => handleViewPurchaseOrder(purchaseOrder)}>
                                <EyeIcon className="h-4 w-4" />
                                <span className="sr-only">Xem</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handlePrintPurchaseOrder(purchaseOrder)}>
                                <PrinterIcon className="h-4 w-4" />
                                <span className="sr-only">In</span>
                            </Button>
                        </div>
                    )}
                    pagination={{
                        links: purchaseOrders.links,
                        from: purchaseOrders.from,
                        to: purchaseOrders.to,
                        total: purchaseOrders.total,
                    }}
                />

                <PurchaseOrderDetailDialog purchaseOrder={selectedPurchaseOrder} open={detailDialogOpen} onOpenChange={setDetailDialogOpen} />

                <PurchaseOrderPrintPreview purchaseOrder={selectedPurchaseOrder} open={printDialogOpen} onOpenChange={setPrintDialogOpen} />

                <WarehouseSelectDialog warehouses={warehouses} open={warehouseSelectDialogOpen} onOpenChange={setWarehouseSelectDialogOpen} />
            </div>
        </AppLayout>
    );
}
