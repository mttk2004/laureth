import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { InventoryTransferStatus } from '@/types/inventory_transfer';

interface TransferStatusBadgeProps {
    status: string;
    className?: string;
}

export default function TransferStatusBadge({ status, className }: TransferStatusBadgeProps) {
    switch (status) {
        case InventoryTransferStatus.PENDING:
            return (
                <Badge variant="outline" className={cn('border-yellow-200 bg-yellow-100 text-yellow-800', className)}>
                    Đang chờ duyệt
                </Badge>
            );
        case InventoryTransferStatus.APPROVED:
            return (
                <Badge variant="outline" className={cn('border-blue-200 bg-blue-100 text-blue-800', className)}>
                    Đã duyệt
                </Badge>
            );
        case InventoryTransferStatus.REJECTED:
            return (
                <Badge variant="outline" className={cn('border-red-200 bg-red-100 text-red-800', className)}>
                    Đã từ chối
                </Badge>
            );
        case InventoryTransferStatus.COMPLETED:
            return (
                <Badge variant="outline" className={cn('border-green-200 bg-green-100 text-green-800', className)}>
                    Đã hoàn thành
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className={cn('border-gray-200 bg-gray-100 text-gray-800', className)}>
                    {status}
                </Badge>
            );
    }
}
