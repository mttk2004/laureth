import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types/order';

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

// Định nghĩa các trạng thái đơn hàng
const orderStatusLabels: Record<OrderStatus, string> = {
    [OrderStatus.COMPLETED]: 'Hoàn thành',
    [OrderStatus.CANCELED]: 'Đã hủy',
    [OrderStatus.PENDING]: 'Đang xử lý',
};

export default function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
    const getBadgeVariant = () => {
        switch (status) {
            case OrderStatus.COMPLETED:
                return 'bg-green-100 text-green-800 border-green-200';
            case OrderStatus.CANCELED:
                return 'bg-red-100 text-red-800 border-red-200';
            case OrderStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Badge variant="outline" className={`${getBadgeVariant()} ${className}`}>
            {orderStatusLabels[status]}
        </Badge>
    );
}
