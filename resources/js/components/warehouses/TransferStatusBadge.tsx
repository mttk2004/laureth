import { Badge } from '@/components/ui/badge';
import { InventoryTransferStatus } from '@/types/inventory_transfer';
import { cn } from '@/lib/utils';

interface TransferStatusBadgeProps {
    status: string;
    className?: string;
}

export default function TransferStatusBadge({ status, className }: TransferStatusBadgeProps) {
    switch (status) {
        case InventoryTransferStatus.PENDING:
            return (
                <Badge variant="outline" className={cn('bg-yellow-100 text-yellow-800 border-yellow-200', className)}>
                    Đang chờ duyệt
                </Badge>
            );
        case InventoryTransferStatus.APPROVED:
            return (
                <Badge variant="outline" className={cn('bg-blue-100 text-blue-800 border-blue-200', className)}>
                    Đã duyệt
                </Badge>
            );
        case InventoryTransferStatus.REJECTED:
            return (
                <Badge variant="outline" className={cn('bg-red-100 text-red-800 border-red-200', className)}>
                    Đã từ chối
                </Badge>
            );
        case InventoryTransferStatus.COMPLETED:
            return (
                <Badge variant="outline" className={cn('bg-green-100 text-green-800 border-green-200', className)}>
                    Đã hoàn thành
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className={cn('bg-gray-100 text-gray-800 border-gray-200', className)}>
                    {status}
                </Badge>
            );
    }
}
