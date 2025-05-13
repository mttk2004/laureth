import React from 'react';
import { cn } from '@/lib/utils';
import { ProductStatus } from '@/types/product';
import { getStatusClassName, getStatusText } from '@/lib/productUtils';

interface ProductStatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

export default function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  return (
    <span
      className={cn(
        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
        getStatusClassName(status),
        className
      )}
    >
      {getStatusText(status)}
    </span>
  );
}
