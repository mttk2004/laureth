import BaseSortSelect from '@/components/common/BaseSortSelect';
import { ProductSortOption, ProductSortOptionLabels } from '@/types/product';

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
