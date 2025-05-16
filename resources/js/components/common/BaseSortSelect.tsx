import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowDownAZIcon, ArrowUpDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface BaseSortSelectProps<T extends string = string> {
  /**
   * Giá trị hiện tại của option sắp xếp
   */
  value: T;

  /**
   * Danh sách các option sắp xếp
   * Có thể là mảng các option hoặc một enum object
   */
  options: SortOption[] | Record<string, T>;

  /**
   * Map các label tương ứng với mỗi option
   * Chỉ cần thiết khi options là enum object
   */
  labels?: Record<string, string>;

  /**
   * Callback khi thay đổi giá trị
   */
  onChange: (value: T) => void;

  /**
   * Placeholder cho select
   */
  placeholder?: string;

  /**
   * Chiều rộng của select
   */
  width?: string;

  /**
   * Icon hiển thị (mặc định là ArrowDownAZ)
   */
  icon?: 'arrowDownAZ' | 'arrowUpDown' | 'none';
}

export default function BaseSortSelect<T extends string = string>({
  value,
  options,
  labels,
  onChange,
  placeholder = 'Sắp xếp',
  width = 'w-[180px]',
  icon = 'arrowDownAZ',
}: BaseSortSelectProps<T>) {
  const getIcon = () => {
    switch (icon) {
      case 'arrowDownAZ':
        return <ArrowDownAZIcon className="h-4 w-4" />;
      case 'arrowUpDown':
        return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
      case 'none':
        return null;
      default:
        return <ArrowDownAZIcon className="h-4 w-4" />;
    }
  };

  // Chuyển đổi options thành mảng nếu nó là enum object
  const sortOptions = Array.isArray(options)
    ? options
    : Object.values(options).map(option => ({
        value: option,
        label: labels?.[option] || option,
      }));

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={(val) => onChange(val as T)}
      >
        <SelectTrigger className={`${width} h-9`}>
          <div className="flex items-center gap-2">
            {getIcon()}
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
