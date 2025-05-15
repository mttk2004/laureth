import React from 'react';
import { SortOption, getSortLabel } from '@/lib/supplierUtils';
import BaseSortSelect from '@/components/common/BaseSortSelect';

interface SupplierSortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SupplierSortSelect({ value, onChange }: SupplierSortSelectProps) {
  const options = [
    { value: SortOption.NAME_ASC, label: getSortLabel(SortOption.NAME_ASC) },
    { value: SortOption.NAME_DESC, label: getSortLabel(SortOption.NAME_DESC) },
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
