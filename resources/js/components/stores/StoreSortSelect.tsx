import BaseSortSelect from '@/components/common/BaseSortSelect';

enum Option {
  NEWEST = 'created_at_desc',
  OLDEST = 'created_at_asc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  TARGET_ASC = 'target_asc',
  TARGET_DESC = 'target_desc',
}

const OptionLabels: Record<Option, string> = {
  [Option.NEWEST]: 'Mới nhất',
  [Option.OLDEST]: 'Cũ nhất',
  [Option.NAME_ASC]: 'Tên A-Z',
  [Option.NAME_DESC]: 'Tên Z-A',
  [Option.TARGET_ASC]: 'Mục tiêu tăng dần',
  [Option.TARGET_DESC]: 'Mục tiêu giảm dần',
};

interface StoreSortSelectProps {
  value: Option;
  onChange: (value: Option) => void;
}

export default function StoreSortSelect({ value, onChange }: StoreSortSelectProps) {
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
