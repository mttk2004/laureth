import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FilterIcon, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface BaseFilterDialogProps {
    /**
     * Tiêu đề của dialog
     */
    title: string;

    /**
     * Mô tả ngắn gọn cho dialog
     */
    description?: string;

    /**
     * Nội dung filter, được truyền vào dưới dạng các component con
     */
    children: ReactNode;

    /**
     * Hàm xử lý khi nhấn nút áp dụng filter
     */
    onApply: () => void;

    /**
     * Hàm xử lý khi nhấn nút xóa filter
     */
    onReset: () => void;

    /**
     * Có filter đang active hay không (để hiển thị badge)
     */
    hasActiveFilters?: boolean;

    /**
     * Text hiển thị trên nút trigger
     */
    triggerText?: string;

    /**
     * Width của dialog
     */
    dialogWidth?: 'sm:max-w-[425px]' | 'sm:max-w-md' | 'sm:max-w-lg';
}

export function BaseFilterDialog({
    title,
    description,
    children,
    onApply,
    onReset,
    hasActiveFilters = false,
    triggerText = 'Lọc',
    dialogWidth = 'sm:max-w-[425px]',
}: BaseFilterDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleApply = () => {
        onApply();
        setIsOpen(false);
    };

    const handleReset = () => {
        onReset();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={hasActiveFilters ? 'default' : 'outline'}>
                    <FilterIcon className="mr-2 h-4 w-4" />
                    {triggerText}
                    {hasActiveFilters && (
                        <span className="text-primary ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs font-bold">!</span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className={dialogWidth}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                <div className="grid gap-4 py-4">{children}</div>

                <DialogFooter className="flex sm:justify-between">
                    <Button type="button" variant="ghost" onClick={handleReset} className="gap-1">
                        <X className="h-4 w-4" />
                        Xóa bộ lọc
                    </Button>
                    <Button type="button" onClick={handleApply}>
                        Áp dụng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
