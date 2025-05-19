import { Badge } from '@/components/ui/badge';
import { PaymentMethod } from '@/types/order';

interface PaymentMethodBadgeProps {
    paymentMethod: PaymentMethod;
    className?: string;
}

// Định nghĩa các phương thức thanh toán
const paymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'Tiền mặt',
    [PaymentMethod.CARD]: 'Thẻ',
    [PaymentMethod.TRANSFER]: 'Chuyển khoản',
};

export default function PaymentMethodBadge({ paymentMethod, className = '' }: PaymentMethodBadgeProps) {
    const getBadgeVariant = () => {
        switch (paymentMethod) {
            case PaymentMethod.CASH:
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case PaymentMethod.CARD:
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case PaymentMethod.TRANSFER:
                return 'bg-teal-100 text-teal-800 border-teal-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Badge variant="outline" className={`${getBadgeVariant()} ${className}`}>
            {paymentMethodLabels[paymentMethod]}
        </Badge>
    );
}
