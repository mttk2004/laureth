import BaseSortSelect from '@/components/common/BaseSortSelect';
import { StoreSortOption, StoreSortOptionLabels } from '@/types/store';

interface StoreSortSelectProps {
  value: StoreSortOption;
  onChange: (value: StoreSortOption) => void;
}

export default function StoreSortSelect({ value, onChange }: StoreSortSelectProps) {
  return (
    <BaseSortSelect<StoreSortOption>
      value={value}
      options={StoreSortOption}
      labels={StoreSortOptionLabels}
      onChange={onChange}
      placeholder="Sắp xếp theo"
      width="w-40"
      icon="arrowUpDown"
    />
  );
}
