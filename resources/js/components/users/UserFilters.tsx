import { useState } from 'react';
import { Store, roleLabels } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BaseFilterDialog, BaseFilterForm, BaseFilterRow } from '@/components/common';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface UserFiltersProps {
  stores: Store[];
  initialFilters: {
    position?: string;
    store_id?: string;
    name?: string;
    unassigned?: boolean;
  };
  onApplyFilters: (filters: { position?: string; store_id?: string; name?: string; unassigned?: boolean }) => void;
}

export default function UserFilters({ stores, initialFilters, onApplyFilters }: UserFiltersProps) {
  const [filters, setFilters] = useState({
    position: initialFilters.position || 'all',
    store_id: initialFilters.store_id || 'all',
    name: initialFilters.name || '',
    unassigned: initialFilters.unassigned || false,
  });

  const handleSelectChange = (name: string, value: string) => {
    // Nếu đã chọn filter chưa phân công mà chọn một cửa hàng cụ thể, hãy tắt filter chưa phân công
    if (name === 'store_id' && value !== 'all' && filters.unassigned) {
      setFilters((prev) => ({ ...prev, [name]: value, unassigned: false }));
      return;
    }

    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    // Nếu đang chọn filter chưa phân công, hãy reset store_id về 'all'
    if (checked) {
      setFilters((prev) => ({ ...prev, unassigned: checked, store_id: 'all' }));
    } else {
      setFilters((prev) => ({ ...prev, unassigned: checked }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      position: 'all',
      store_id: 'all',
      name: '',
      unassigned: false,
    });
  };

  const handleApplyFilters = () => {
    const appliedFilters: { position?: string; store_id?: string; name?: string; unassigned?: boolean } = {};

    if (filters.position !== 'all') {
      appliedFilters.position = filters.position;
    }

    if (filters.store_id !== 'all') {
      appliedFilters.store_id = filters.store_id;
    }

    if (filters.name.trim()) {
      appliedFilters.name = filters.name.trim();
    }

    if (filters.unassigned) {
      appliedFilters.unassigned = true;
    }

    onApplyFilters(appliedFilters);
  };

  // Kiểm tra xem đã áp dụng filter nào chưa
  const hasActiveFilters = Boolean(initialFilters.position || initialFilters.store_id || initialFilters.name || initialFilters.unassigned);

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
        <BaseFilterRow label="Tên">
          <Input
            placeholder="Nhập tên nhân viên"
            name="name"
            value={filters.name}
            onChange={handleInputChange}
          />
        </BaseFilterRow>

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
            disabled={filters.unassigned}
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

        <BaseFilterRow label="">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="unassigned"
              checked={filters.unassigned}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="unassigned">Chỉ hiện nhân viên chưa phân công</Label>
          </div>
        </BaseFilterRow>
      </BaseFilterForm>
    </BaseFilterDialog>
  );
}
