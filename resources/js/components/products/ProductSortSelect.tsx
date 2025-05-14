import React from 'react';
import { SortOption, getSortLabel } from '@/lib/productUtils';
import BaseSortSelect from '@/components/common/BaseSortSelect';

interface ProductSortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function ProductSortSelect({ value, onChange }: ProductSortSelectProps) {
  const options = [
    { value: SortOption.NEWEST, label: getSortLabel(SortOption.NEWEST) },
    { value: SortOption.OLDEST, label: getSortLabel(SortOption.OLDEST) },
    { value: SortOption.NAME_ASC, label: getSortLabel(SortOption.NAME_ASC) },
    { value: SortOption.NAME_DESC, label: getSortLabel(SortOption.NAME_DESC) },
    { value: SortOption.PRICE_ASC, label: getSortLabel(SortOption.PRICE_ASC) },
    { value: SortOption.PRICE_DESC, label: getSortLabel(SortOption.PRICE_DESC) },
  ];

  return (
    <BaseSortSelect
      value={value}
      options={options}
      onChange={(val) => onChange(val as SortOption)}
      placeholder="Sắp xếp theo"
      width="w-40"
      icon="arrowUpDown"
    />
  );
}
