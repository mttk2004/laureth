import React from 'react';
import { SortOption, getSortLabel } from '@/lib/productUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

interface ProductSortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function ProductSortSelect({ value, onChange }: ProductSortSelectProps) {
  return (
    <div className="flex items-center space-x-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select
        value={value}
        onValueChange={(val) => onChange(val as SortOption)}
      >
        <SelectTrigger className="w-40 cursor-pointer">
          <SelectValue placeholder="Sắp xếp theo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SortOption.NEWEST}>{getSortLabel(SortOption.NEWEST)}</SelectItem>
          <SelectItem value={SortOption.OLDEST}>{getSortLabel(SortOption.OLDEST)}</SelectItem>
          <SelectItem value={SortOption.NAME_ASC}>{getSortLabel(SortOption.NAME_ASC)}</SelectItem>
          <SelectItem value={SortOption.NAME_DESC}>{getSortLabel(SortOption.NAME_DESC)}</SelectItem>
          <SelectItem value={SortOption.PRICE_ASC}>{getSortLabel(SortOption.PRICE_ASC)}</SelectItem>
          <SelectItem value={SortOption.PRICE_DESC}>{getSortLabel(SortOption.PRICE_DESC)}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
