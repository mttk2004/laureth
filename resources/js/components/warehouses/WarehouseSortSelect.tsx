import BaseSortSelect from '@/components/common/BaseSortSelect';

enum Option {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

const OptionLabels: Record<Option, string> = {
  [Option.NEWEST]: 'Mới nhất',
  [Option.OLDEST]: 'Cũ nhất',
  [Option.NAME_ASC]: 'Tên A-Z',
  [Option.NAME_DESC]: 'Tên Z-A',
};

interface WarehouseSortSelectProps {
  value: Option;
  onChange: (value: Option) => void;
}

export default function WarehouseSortSelect({ value, onChange }: WarehouseSortSelectProps) {
  return (
    <BaseSortSelect<Option>
      value={value}
      options={Option}
      labels={OptionLabels}
      onChange={onChange}
      placeholder="Sắp xếp theo"
      icon="arrowUpDown"
    />
  );
}
