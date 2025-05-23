import { Label } from '@/components/ui/label';
import { ReactNode } from 'react';

interface BaseFilterRowProps {
    /**
     * Label của field
     */
    label: string;

    /**
     * Nội dung của field
     */
    children: ReactNode;

    /**
     * Vị trí của label: 'top' hoặc 'left'
     */
    labelPosition?: 'top' | 'left';

    /**
     * Class cho container khi labelPosition là 'left'
     */
    layoutClassName?: string;

    /**
     * Class cho label
     */
    labelClassName?: string;

    /**
     * Class cho phần content
     */
    contentClassName?: string;
}

/**
 * Hàng của form filter
 */
export function BaseFilterRow({
    label,
    children,
    labelPosition = 'left',
    layoutClassName = 'grid grid-cols-4 items-center gap-4',
    labelClassName = 'text-right',
    contentClassName = 'col-span-3',
}: BaseFilterRowProps) {
    if (labelPosition === 'top') {
        return (
            <div className="grid gap-2">
                <Label>{label}</Label>
                {children}
            </div>
        );
    }

    return (
        <div className={layoutClassName}>
            <Label className={labelClassName}>{label}</Label>
            <div className={contentClassName}>{children}</div>
        </div>
    );
}

interface BaseFilterFormProps {
    /**
     * Các hàng form con
     */
    children: ReactNode;

    /**
     * Khoảng cách giữa các hàng
     */
    gap?: string;
}

/**
 * Container cho form filter
 */
export function BaseFilterForm({ children, gap = 'gap-4' }: BaseFilterFormProps) {
    return <div className={`grid ${gap} py-4`}>{children}</div>;
}
