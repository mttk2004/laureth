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

interface BaseSortSelectProps {
  /**
   * Giá trị hiện tại của option sắp xếp
   */
  value: string;

  /**
   * Danh sách các option sắp xếp
   */
  options: SortOption[];

  /**
   * Callback khi thay đổi giá trị
   */
  onChange: (value: string) => void;

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

export default function BaseSortSelect({
  value,
  options,
  onChange,
  placeholder = 'Sắp xếp',
  width = 'w-[180px]',
  icon = 'arrowDownAZ',
}: BaseSortSelectProps) {
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

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger className={`${width} h-9`}>
          <div className="flex items-center gap-2">
            {getIcon()}
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
