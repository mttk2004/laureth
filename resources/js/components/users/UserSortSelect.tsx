import { BaseSortSelect } from '@/components/common';
import { UserSortOption, UserSortOptionLabels } from '@/types';

interface UserSortSelectProps {
  value: UserSortOption;
  onChange: (value: UserSortOption) => void;
}

export default function UserSortSelect({ value, onChange }: UserSortSelectProps) {
  return (
    <BaseSortSelect<UserSortOption>
      value={value}
      options={UserSortOption}
      labels={UserSortOptionLabels}
      onChange={onChange}
      placeholder="Sắp xếp theo"
      icon="arrowUpDown"
    />
  );
}
