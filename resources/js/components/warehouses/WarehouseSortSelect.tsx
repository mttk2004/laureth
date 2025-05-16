import { BaseSortSelect } from '@/components/common';
import { WarehouseSortOption, WarehouseSortOptionLabels } from '@/types';

interface WarehouseSortSelectProps {
  value: WarehouseSortOption;
  onChange: (value: WarehouseSortOption) => void;
}

export default function WarehouseSortSelect({ value, onChange }: WarehouseSortSelectProps) {
  return (
    <BaseSortSelect<WarehouseSortOption>
      value={value}
      options={WarehouseSortOption}
      labels={WarehouseSortOptionLabels}
      onChange={onChange}
      placeholder="Sắp xếp theo"
      icon="arrowUpDown"
    />
  );
}
