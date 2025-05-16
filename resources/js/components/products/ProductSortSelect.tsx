import BaseSortSelect from '@/components/common/BaseSortSelect';

enum Option {
  NEWEST = 'created_at_desc',
  OLDEST = 'created_at_asc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
}

const OptionLabels: Record<Option, string> = {
  [Option.NEWEST]: 'Mới nhất',
  [Option.OLDEST]: 'Cũ nhất',
  [Option.NAME_ASC]: 'Tên A-Z',
  [Option.NAME_DESC]: 'Tên Z-A',
  [Option.PRICE_ASC]: 'Giá tăng dần',
  [Option.PRICE_DESC]: 'Giá giảm dần',
};

interface ProductSortSelectProps {
  value: Option;
  onChange: (value: Option) => void;
}

export default function ProductSortSelect({ value, onChange }: ProductSortSelectProps) {
  return (
    <BaseSortSelect<Option>
      value={value}
      options={Option}
      labels={OptionLabels}
      onChange={onChange}
      placeholder="Sắp xếp theo"
      width="w-40"
      icon="arrowUpDown"
    />
  );
}
