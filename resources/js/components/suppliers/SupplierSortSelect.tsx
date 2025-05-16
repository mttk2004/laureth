import BaseSortSelect from '@/components/common/BaseSortSelect';
import { SupplierSortOption, SupplierSortOptionLabels } from '@/types/supplier';

interface SupplierSortSelectProps {
  value: SupplierSortOption;
  onChange: (value: SupplierSortOption) => void;
}

export default function SupplierSortSelect({ value, onChange }: SupplierSortSelectProps) {
  return (
    <BaseSortSelect<SupplierSortOption>
      value={value}
      options={SupplierSortOption}
      labels={SupplierSortOptionLabels}
      onChange={onChange}
      placeholder="Sắp xếp theo"
      width="w-40"
      icon="arrowUpDown"
    />
  );
}
