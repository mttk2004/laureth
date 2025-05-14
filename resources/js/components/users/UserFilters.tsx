import React, { useState } from 'react';
import { Store } from '@/types/store';
import { roleLabels } from '@/types/user';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BaseFilterDialog from '@/components/common/BaseFilterDialog';
import BaseFilterForm, { BaseFilterRow } from '@/components/common/BaseFilterForm';

interface UserFiltersProps {
  stores: Store[];
  initialFilters: {
    position?: string;
    store_id?: string;
  };
  onApplyFilters: (filters: { position?: string; store_id?: string }) => void;
}

export default function UserFilters({ stores, initialFilters, onApplyFilters }: UserFiltersProps) {
  const [filters, setFilters] = useState({
    position: initialFilters.position || 'all',
    store_id: initialFilters.store_id || 'all',
  });

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      position: 'all',
      store_id: 'all',
    });
  };

  const handleApplyFilters = () => {
    const appliedFilters: { position?: string; store_id?: string } = {};

    if (filters.position !== 'all') {
      appliedFilters.position = filters.position;
    }

    if (filters.store_id !== 'all') {
      appliedFilters.store_id = filters.store_id;
    }

    onApplyFilters(appliedFilters);
  };

  // Kiểm tra xem đã áp dụng filter nào chưa
  const hasActiveFilters = Boolean(initialFilters.position || initialFilters.store_id);

  return (
    <BaseFilterDialog
      title="Lọc danh sách nhân viên"
      description="Chọn các điều kiện lọc bên dưới và nhấn 'Áp dụng' để lọc danh sách nhân viên."
      onApply={handleApplyFilters}
      onReset={handleResetFilters}
      hasActiveFilters={hasActiveFilters}
      triggerText="Lọc nhân viên"
    >
      <BaseFilterForm>
        <BaseFilterRow label="Vị trí">
          <Select
            value={filters.position}
            onValueChange={(value) => handleSelectChange('position', value)}
          >
            <SelectTrigger id="position">
              <SelectValue placeholder="Tất cả vị trí" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vị trí</SelectItem>
              <SelectItem value="SM">{roleLabels.SM}</SelectItem>
              <SelectItem value="SL">{roleLabels.SL}</SelectItem>
              <SelectItem value="SA">{roleLabels.SA}</SelectItem>
            </SelectContent>
          </Select>
        </BaseFilterRow>

        <BaseFilterRow label="Cửa hàng">
          <Select
            value={filters.store_id}
            onValueChange={(value) => handleSelectChange('store_id', value)}
          >
            <SelectTrigger id="store_id">
              <SelectValue placeholder="Tất cả cửa hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cửa hàng</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BaseFilterRow>
      </BaseFilterForm>
    </BaseFilterDialog>
  );
}
