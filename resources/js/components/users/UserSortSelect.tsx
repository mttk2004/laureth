import React from 'react';
import { ArrowDownAZIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortOption, sortOptionLabels } from '@/lib/userUtils';

interface UserSortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function UserSortSelect({ value, onChange }: UserSortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={(newValue) => onChange(newValue as SortOption)}
      >
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            <ArrowDownAZIcon className="h-4 w-4" />
            <SelectValue placeholder="Sắp xếp" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {Object.values(SortOption).map((option) => (
            <SelectItem key={option} value={option}>
              {sortOptionLabels[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
