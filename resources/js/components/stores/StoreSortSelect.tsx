import React from 'react';
import { ChevronDownIcon, ArrowUpDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortOption, getSortLabel } from '@/lib/storeUtils';

interface StoreSortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function StoreSortSelect({ value, onChange }: StoreSortSelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <ArrowUpDownIcon className="h-3.5 w-3.5 mr-1" />
          <span>Sắp xếp</span>
          <ChevronDownIcon className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.values(SortOption).map((option) => (
          <DropdownMenuItem
            key={option}
            className={value === option ? 'bg-muted font-medium' : ''}
            onClick={() => onChange(option)}
          >
            {getSortLabel(option)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
