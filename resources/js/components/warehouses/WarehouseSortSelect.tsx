import BaseSortSelect from '@/components/common/BaseSortSelect';
import { WarehouseSortOption, WarehouseSortOptionLabels } from '@/types/warehouse';

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
