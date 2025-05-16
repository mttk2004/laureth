import BaseSortSelect from '@/components/common/BaseSortSelect';

enum Option {
  NEWEST = 'created_at_desc',
  OLDEST = 'created_at_asc',
  NAME_ASC = 'full_name_asc',
  NAME_DESC = 'full_name_desc',
}

const OptionLabels: Record<Option, string> = {
  [Option.NEWEST]: 'Mới nhất',
  [Option.OLDEST]: 'Cũ nhất',
  [Option.NAME_ASC]: 'Tên A-Z',
  [Option.NAME_DESC]: 'Tên Z-A',
};

interface UserSortSelectProps {
  value: Option;
  onChange: (value: Option) => void;
}

export default function UserSortSelect({ value, onChange }: UserSortSelectProps) {
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
