import React, { useState, ReactNode } from 'react';
import { FilterIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BaseFilterDialogProps<T> {
  /**
   * Tiêu đề của dialog lọc
   */
  title: string;

  /**
   * Mô tả chi tiết về dialog lọc
   */
  description?: string;

  /**
   * Các giá trị lọc ban đầu
   */
  initialFilters: T;

  /**
   * Nội dung của dialog lọc - các trường lọc
   */
  children: ReactNode;

  /**
   * Callback được gọi khi nhấn nút "Áp dụng"
   * @param filters Các giá trị lọc được áp dụng
   */
  onApplyFilters: (filters: Partial<T>) => void;

  /**
   * Callback được gọi khi nhấn nút "Đặt lại"
   * Mặc định sẽ đặt lại tất cả các giá trị về giá trị mặc định
   */
  onResetFilters?: () => void;

  /**
   * Các giá trị lọc mặc định để đặt lại khi nhấn "Đặt lại"
   */
  defaultFilters: T;

  /**
   * Kiểm tra xem có filter nào đang được áp dụng không
   * Mặc định sẽ kiểm tra nếu có bất kỳ giá trị khác mặc định
   */
  hasActiveFilters?: boolean;

  /**
   * Nhãn hiển thị trên nút lọc
   */
  buttonLabel?: string;

  /**
   * Nhãn hiển thị trên nút đặt lại
   */
  resetLabel?: string;

  /**
   * Nhãn hiển thị trên nút áp dụng
   */
  applyLabel?: string;

  /**
   * Kích thước của dialog
   */
  dialogWidth?: string;

  /**
   * Xử lý khi thay đổi các trường lọc
   */
  onFiltersChange: (filters: T) => void;

  /**
   * Các giá trị lọc hiện tại
   */
  filters: T;
}

export default function BaseFilterDialog<T extends Record<string, any>>({
  title,
  description = 'Chọn các điều kiện lọc bên dưới và nhấn "Áp dụng" để lọc danh sách.',
  initialFilters,
  children,
  onApplyFilters,
  onResetFilters,
  defaultFilters,
  hasActiveFilters,
  buttonLabel = 'Lọc',
  resetLabel = 'Xóa bộ lọc',
  applyLabel = 'Áp dụng',
  dialogWidth = 'sm:max-w-[425px]',
  onFiltersChange,
  filters,
}: BaseFilterDialogProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleResetFilters = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      onFiltersChange(defaultFilters);
    }
  };

  const handleApplyFilters = () => {
    // Chỉ gửi các giá trị khác mặc định
    const appliedFilters: Partial<T> = {};

    Object.keys(filters).forEach((key) => {
      // Kiểm tra nếu giá trị khác với giá trị mặc định hoặc nếu là 'all'
      if (filters[key] !== defaultFilters[key] &&
          (typeof filters[key] !== 'string' || filters[key] !== 'all')) {
        appliedFilters[key as keyof T] = filters[key];
      }
    });

    onApplyFilters(appliedFilters);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={hasActiveFilters ? "default" : "outline"}>
          <FilterIcon className="h-4 w-4 mr-2" />
          {buttonLabel} {hasActiveFilters && (
            <span className="ml-1 text-xs rounded-full bg-white text-primary w-4 h-4 flex justify-center items-center font-bold">
              !
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className={dialogWidth}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {children}
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResetFilters}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            {resetLabel}
          </Button>
          <Button type="button" onClick={handleApplyFilters}>
            {applyLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
