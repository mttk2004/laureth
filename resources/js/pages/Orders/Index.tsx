import { OrderDetailDialog, OrderFilters, OrderSortSelect, OrderStatusBadge, PaymentMethodBadge } from '@/components/orders';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Order, OrderSortOption } from '@/types/order';
import { User } from '@/types/user';
import { Head, router } from '@inertiajs/react';
import { EyeIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';

interface OrderWithUser extends Order {
    user?: {
        id: string;
        full_name: string;
        email: string;
    };
}

interface Props {
    orders: {
        data: OrderWithUser[];
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
    filters?: {
        status?: string;
        payment_method?: string;
        date_from?: string;
        date_to?: string;
        user_id?: string;
    };
    sort?: string;
}

export default function OrdersIndex({ orders, user, filters = {}, sort = OrderSortOption.NEWEST }: Props) {
    // State cho dialog chi tiết đơn hàng
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Debug
    console.log('Orders data:', orders);

    // Kiểm tra dữ liệu orders
    const hasOrders = orders && orders.data && Array.isArray(orders.data);
    const hasPagination = orders && orders.links;

    // Xử lý thay đổi sắp xếp
    const handleSortChange = (sortOption: OrderSortOption) => {
        router.get(
            '/pos',
            { ...filters, sort: sortOption },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    // Xử lý áp dụng bộ lọc
    const handleApplyFilters = (newFilters: { status?: string; payment_method?: string; date_from?: string; date_to?: string; user_id?: string }) => {
        router.get(
            '/pos',
            { ...newFilters, sort },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    // Xử lý xem chi tiết đơn hàng
    const handleViewDetails = (orderId: string) => {
        setSelectedOrderId(orderId);
        setDetailDialogOpen(true);
    };

    // Xử lý khi cập nhật trạng thái đơn hàng thành công
    const handleOrderStatusUpdate = () => {
        // Refresh lại danh sách đơn hàng để hiển thị trạng thái mới
        router.reload({
            only: ['orders'],
        });
    };

    // Định nghĩa các cột cho bảng dữ liệu
    const columns = [
        {
            key: 'id',
            label: 'Mã đơn hàng',
            render: (item: OrderWithUser) => <span className="font-mono text-xs">{item.id.substring(0, 8)}...</span>,
        },
        {
            key: 'order_date',
            label: 'Ngày đặt hàng',
            render: (item: OrderWithUser) => formatDate(item.order_date),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: OrderWithUser) => <OrderStatusBadge status={item.status} />,
        },
        {
            key: 'payment_method',
            label: 'Phương thức thanh toán',
            render: (item: OrderWithUser) => <PaymentMethodBadge paymentMethod={item.payment_method} />,
        },
        {
            key: 'user',
            label: 'Nhân viên',
            render: (item: OrderWithUser) => <span>{item.user?.full_name || 'N/A'}</span>,
        },
        {
            key: 'final_amount',
            label: 'Tổng tiền',
            render: (item: OrderWithUser) => formatCurrency(item.final_amount),
        },
    ];

    // Định nghĩa thao tác cho từng dòng
    const renderActions = (item: OrderWithUser) => (
        <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item.id)}>
                <EyeIcon className="h-4 w-4" />
                <span className="sr-only">Chi tiết</span>
            </Button>
        </div>
    );

    // Chuyển đổi pagination từ Laravel sang định dạng của DataTable
    const paginationData = hasPagination
        ? {
              links: orders.links,
              from: orders.from,
              to: orders.to,
              total: orders.total,
          }
        : undefined;

    return (
        <AppLayout user={user}>
            <Head title="Quản lý đơn hàng" />

            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Đơn hàng</h1>
                    <div className="flex space-x-2">
                        <OrderSortSelect value={sort as OrderSortOption} onChange={handleSortChange} />
                        <OrderFilters initialFilters={filters} onApplyFilters={handleApplyFilters} currentUser={user} />
                        <Button onClick={() => router.visit('/pos/create')}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Tạo đơn hàng mới
                        </Button>
                    </div>
                </div>

                <DataTable columns={columns} data={hasOrders ? orders.data : []} actions={renderActions} pagination={paginationData} />

                <OrderDetailDialog
                    orderId={selectedOrderId}
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    onStatusUpdate={handleOrderStatusUpdate}
                    currentUser={user}
                />
            </div>
        </AppLayout>
    );
}
