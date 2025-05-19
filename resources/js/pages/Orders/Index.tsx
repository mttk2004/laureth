import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Order, OrderSortOption, OrderSortOptionLabels, OrderStatus, PaymentMethod } from '@/types/order';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { PlusIcon } from 'lucide-react';
import { BaseSortSelect } from '@/components/common/BaseSortSelect';
import { BaseFilterDialog } from '@/components/common/BaseFilterDialog';
import { BaseFilterForm } from '@/components/common/BaseFilterForm';
import AppLayout from '@/layouts/app-layout';

interface Props {
    orders: {
        data: Order[];
        meta: {
            current_page: number;
            last_page: number;
            from: number;
            to: number;
            total: number;
            per_page: number;
        };
    };
    user: User;
    filters?: Record<string, any>;
    sort?: string;
}

// Định nghĩa các trạng thái đơn hàng
const orderStatusLabels: Record<OrderStatus, string> = {
    [OrderStatus.COMPLETED]: 'Hoàn thành',
    [OrderStatus.CANCELED]: 'Đã hủy',
    [OrderStatus.PENDING]: 'Đang xử lý',
};

// Định nghĩa các phương thức thanh toán
const paymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'Tiền mặt',
    [PaymentMethod.CARD]: 'Thẻ',
    [PaymentMethod.TRANSFER]: 'Chuyển khoản',
};

// Component lọc đơn hàng
function OrderFilters({ initialFilters = {}, onApplyFilters }: { initialFilters: Record<string, any>, onApplyFilters: (filters: Record<string, any>) => void }) {
    const [filters, setFilters] = useState(initialFilters);

    const handleFilterChange = (field: string, value: any) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApply = () => {
        onApplyFilters(filters);
    };

    const handleReset = () => {
        const emptyFilters = {
            status: '',
            payment_method: '',
            date_from: '',
            date_to: '',
        };
        setFilters(emptyFilters);
        onApplyFilters(emptyFilters);
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== null && value !== undefined);

    return (
        <BaseFilterDialog
            title="Lọc đơn hàng"
            triggerText="Lọc đơn hàng"
            hasActiveFilters={hasActiveFilters}
            onApply={handleApply}
            onReset={handleReset}
        >
            <BaseFilterForm>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Trạng thái
                            </label>
                            <select
                                id="status"
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Tất cả trạng thái</option>
                                {Object.entries(orderStatusLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
                                Phương thức thanh toán
                            </label>
                            <select
                                id="payment_method"
                                value={filters.payment_method || ''}
                                onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Tất cả phương thức</option>
                                {Object.entries(paymentMethodLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="date_from" className="block text-sm font-medium text-gray-700">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                id="date_from"
                                value={filters.date_from || ''}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="date_to" className="block text-sm font-medium text-gray-700">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                id="date_to"
                                value={filters.date_to || ''}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </BaseFilterForm>
        </BaseFilterDialog>
    );
}

// Component sắp xếp đơn hàng
function OrderSortSelect({ value, onChange }: { value: OrderSortOption, onChange: (value: string) => void }) {
    return (
        <BaseSortSelect
            value={value}
            options={OrderSortOptionLabels}
            onChange={onChange}
        />
    );
}

export default function OrdersIndex({ orders, user, filters = {}, sort = OrderSortOption.NEWEST }: Props) {
    // Debug
    console.log('Orders data:', orders);

    // Kiểm tra dữ liệu orders
    const hasOrders = orders && orders.data && Array.isArray(orders.data);
    const hasPagination = orders && orders.meta;

    // Xử lý thay đổi sắp xếp
    const handleSortChange = (newSort: string) => {
        router.get('/pos', { ...filters, sort: newSort }, {
            preserveState: true,
            replace: true,
        });
    };

    // Xử lý áp dụng bộ lọc
    const handleApplyFilters = (newFilters: Record<string, any>) => {
        router.get('/pos', { ...newFilters, sort }, {
            preserveState: true,
            replace: true,
        });
    };

    // Xử lý xem chi tiết đơn hàng
    const handleViewDetails = (orderId: string) => {
        // TODO: Implement view details
        console.log(`View details for order ${orderId}`);
    };

    // Định nghĩa các cột cho bảng dữ liệu
    const columns = [
        {
            key: 'id',
            label: 'Mã đơn hàng',
            render: (item: Order) => <span className="font-mono text-xs">{item.id.substring(0, 8)}...</span>,
        },
        {
            key: 'order_date',
            label: 'Ngày đặt hàng',
            render: (item: Order) => formatDate(item.order_date),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: Order) => {
                const status = item.status;
                let badgeClass = 'bg-gray-100 text-gray-800';

                if (status === OrderStatus.COMPLETED) {
                    badgeClass = 'bg-green-100 text-green-800';
                } else if (status === OrderStatus.CANCELED) {
                    badgeClass = 'bg-red-100 text-red-800';
                } else if (status === OrderStatus.PENDING) {
                    badgeClass = 'bg-yellow-100 text-yellow-800';
                }

                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
                        {orderStatusLabels[status]}
                    </span>
                );
            },
        },
        {
            key: 'payment_method',
            label: 'Phương thức thanh toán',
            render: (item: Order) => paymentMethodLabels[item.payment_method as PaymentMethod],
        },
        {
            key: 'final_amount',
            label: 'Tổng tiền',
            render: (item: Order) => formatCurrency(item.final_amount),
        },
    ];

    // Định nghĩa thao tác cho từng dòng
    const renderActions = (item: Order) => (
        <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleViewDetails(item.id)}>
                Chi tiết
            </Button>
        </div>
    );

    // Chuyển đổi pagination từ Laravel sang định dạng của DataTable
    const paginationData = hasPagination ? {
        links: orders.meta.last_page > 1
            ? Array.from({ length: orders.meta.last_page + 2 }, (_, i) => {
                if (i === 0) return { url: null, label: '&laquo; Previous', active: false };
                if (i === orders.meta.last_page + 1) return { url: null, label: 'Next &raquo;', active: false };
                return {
                    url: `/pos?page=${i}`,
                    label: i.toString(),
                    active: i === orders.meta.current_page
                };
              })
            : [],
        from: orders.meta.from,
        to: orders.meta.to,
        total: orders.meta.total,
    } : undefined;

    return (
        <AppLayout user={user}>
            <Head title="Quản lý đơn hàng" />

            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Đơn hàng</h1>
                    <div className="flex space-x-2">
                        <OrderSortSelect value={sort as OrderSortOption} onChange={handleSortChange} />
                        <OrderFilters initialFilters={filters} onApplyFilters={handleApplyFilters} />
                        <Button onClick={() => router.visit('/pos/create')}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Tạo đơn hàng mới
                        </Button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={hasOrders ? orders.data : []}
                    actions={renderActions}
                    pagination={paginationData}
                />
            </div>
        </AppLayout>
    );
}
