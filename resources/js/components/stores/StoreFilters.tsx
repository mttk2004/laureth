import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { User } from '@/types/user';
import BaseFilterDialog from '@/components/common/BaseFilterDialog';
import BaseFilterForm, { BaseFilterRow } from '@/components/common/BaseFilterForm';

interface FilterValues {
  manager_id?: string;
  has_manager?: boolean;
}

interface StoreFiltersProps {
  managers: User[];
  initialFilters: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
}

export default function StoreFilters({ managers, initialFilters, onApplyFilters }: StoreFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  const handleFilterChange = (key: keyof FilterValues, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    const resetFilters: FilterValues = {};
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const hasActiveFilters = Object.keys(initialFilters).length > 0;

  return (
    <BaseFilterDialog
      title="Lọc cửa hàng"
      description="Chọn các tiêu chí để lọc danh sách cửa hàng"
      onApply={handleApply}
      onReset={handleReset}
      hasActiveFilters={hasActiveFilters}
      triggerText="Lọc cửa hàng"
    >
      <BaseFilterForm>
        <BaseFilterRow label="Quản lý" labelPosition="top">
          <Select
            value={filters.manager_id || "all_managers"}
            onValueChange={(value) => handleFilterChange('manager_id', value === "all_managers" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả quản lý" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_managers">Tất cả quản lý</SelectItem>
              {managers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BaseFilterRow>

        <BaseFilterRow label="" labelPosition="top">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-manager"
              checked={!!filters.has_manager}
              onCheckedChange={(checked) =>
                handleFilterChange('has_manager', checked === true ? true : undefined)
              }
            />
            <Label htmlFor="has-manager">Chỉ hiện cửa hàng đã có quản lý</Label>
          </div>
        </BaseFilterRow>
      </BaseFilterForm>
    </BaseFilterDialog>
  );
}
