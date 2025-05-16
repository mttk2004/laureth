import { getStatusClassName, getStatusText } from '@/lib/productUtils';
import { cn } from '@/lib/utils';
import { ProductStatus } from '@/types/product';

interface ProductStatusBadgeProps {
    status: ProductStatus;
    className?: string;
}

export default function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
    return (
        <span className={cn('inline-flex rounded-full px-2 text-xs leading-5 font-semibold', getStatusClassName(status), className)}>
            {getStatusText(status)}
        </span>
    );
}
