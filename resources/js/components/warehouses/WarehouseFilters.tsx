import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import BaseFilterDialog from '@/components/common/BaseFilterDialog';
import BaseFilterForm, { BaseFilterRow } from '@/components/common/BaseFilterForm';
import { Store } from '@/types/store';

interface FilterValues {
  name?: string;
  store_id?: string;
  is_main?: boolean;
}

interface WarehouseFiltersProps {
  stores: Store[];
  initialFilters: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
}

export default function WarehouseFilters({ stores, initialFilters, onApplyFilters }: WarehouseFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  const handleFilterChange = (key: keyof FilterValues, value: string | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
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
      title="Lọc kho"
      description="Chọn các tiêu chí để lọc danh sách kho"
      onApply={handleApply}
      onReset={handleReset}
      hasActiveFilters={hasActiveFilters}
      triggerText="Lọc kho"
    >
      <BaseFilterForm>
        <BaseFilterRow label="Cửa hàng" labelPosition="top">
          <Select
            value={filters.store_id || "all_stores"}
            onValueChange={(value) => handleFilterChange('store_id', value === "all_stores" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả cửa hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_stores">Tất cả cửa hàng</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BaseFilterRow>

        <BaseFilterRow label="Trạng thái kho" labelPosition="top">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-main"
                checked={!!filters.is_main}
                onCheckedChange={(checked) =>
                  handleFilterChange('is_main', checked === true ? true : undefined)
                }
                disabled={!!filters.is_main}
              />
              <Label htmlFor="is-main">Chỉ hiện kho chính</Label>
            </div>
          </div>
        </BaseFilterRow>
      </BaseFilterForm>
    </BaseFilterDialog>
  );
}
