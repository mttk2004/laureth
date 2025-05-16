import BaseSortSelect from '@/components/common/BaseSortSelect';

enum Option {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

const OptionLabels: Record<Option, string> = {
  [Option.NAME_ASC]: 'Tên A-Z',
  [Option.NAME_DESC]: 'Tên Z-A',
};

interface SupplierSortSelectProps {
  value: Option;
  onChange: (value: Option) => void;
}

export default function SupplierSortSelect({ value, onChange }: SupplierSortSelectProps) {
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
