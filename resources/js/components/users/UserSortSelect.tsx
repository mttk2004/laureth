import React from 'react';
import { SortOption, sortOptionLabels } from '@/lib/userUtils';
import BaseSortSelect from '@/components/common/BaseSortSelect';

interface UserSortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function UserSortSelect({ value, onChange }: UserSortSelectProps) {
  const options = Object.values(SortOption).map(option => ({
    value: option,
    label: sortOptionLabels[option]
  }));

  return (
    <BaseSortSelect
      value={value}
      options={options}
      onChange={(newValue) => onChange(newValue as SortOption)}
      placeholder="Sắp xếp"
      icon="arrowDownAZ"
    />
  );
}
