import React from 'react';
import BaseSortSelect from '@/components/common/BaseSortSelect';
import { SortOption, getSortLabel } from '@/lib/storeUtils';

interface StoreSortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function StoreSortSelect({ value, onChange }: StoreSortSelectProps) {
  const sortOptions = Object.values(SortOption).map(option => ({
    value: option,
    label: getSortLabel(option)
  }));

  const handleSortChange = (newValue: string) => {
    onChange(newValue as SortOption);
  };

  return (
    <BaseSortSelect
      value={value}
      options={sortOptions}
      onChange={handleSortChange}
      placeholder="Sắp xếp theo"
      icon="arrowUpDown"
    />
  );
}
