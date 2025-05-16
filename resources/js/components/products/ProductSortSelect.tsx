import { BaseSortSelect } from '@/components/common';
import { ProductSortOption, ProductSortOptionLabels } from '@/types';

interface ProductSortSelectProps {
  value: ProductSortOption;
  onChange: (value: ProductSortOption) => void;
}

export default function ProductSortSelect({ value, onChange }: ProductSortSelectProps) {
  return (
    <BaseSortSelect<ProductSortOption>
      value={value}
      options={ProductSortOption}
      labels={ProductSortOptionLabels}
      onChange={onChange}
      placeholder="Sắp xếp theo"
      width="w-40"
      icon="arrowUpDown"
    />
  );
}
