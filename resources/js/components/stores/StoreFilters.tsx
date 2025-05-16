import { BaseFilterDialog, BaseFilterForm, BaseFilterRow } from '@/components/common';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { useState } from 'react';

interface FilterValues {
    manager_id?: string;
    has_manager?: boolean;
    no_manager?: boolean;
}

interface StoreFiltersProps {
    managers: User[];
    initialFilters: FilterValues;
    onApplyFilters: (filters: FilterValues) => void;
}

export default function StoreFilters({ managers, initialFilters, onApplyFilters }: StoreFiltersProps) {
    const [filters, setFilters] = useState<FilterValues>(initialFilters);

    const handleFilterChange = (key: keyof FilterValues, value: string | boolean | undefined) => {
        // Nếu đang bật "Chỉ hiện cửa hàng chưa có quản lý" và người dùng bật "Chỉ hiện cửa hàng đã có quản lý"
        if (key === 'has_manager' && value === true && filters.no_manager) {
            setFilters((prev) => ({
                ...prev,
                [key]: value,
                no_manager: undefined, // Tắt filter ngược lại
            }));
            return;
        }

        // Nếu đang bật "Chỉ hiện cửa hàng đã có quản lý" và người dùng bật "Chỉ hiện cửa hàng chưa có quản lý"
        if (key === 'no_manager' && value === true && filters.has_manager) {
            setFilters((prev) => ({
                ...prev,
                [key]: value,
                has_manager: undefined, // Tắt filter ngược lại
            }));
            return;
        }

        setFilters((prev) => ({
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
                        value={filters.manager_id || 'all_managers'}
                        onValueChange={(value) => handleFilterChange('manager_id', value === 'all_managers' ? undefined : value)}
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

                <BaseFilterRow label="Trạng thái quản lý" labelPosition="top">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="has-manager"
                                checked={!!filters.has_manager}
                                onCheckedChange={(checked) => handleFilterChange('has_manager', checked === true ? true : undefined)}
                                disabled={!!filters.no_manager}
                            />
                            <Label htmlFor="has-manager">Chỉ hiện cửa hàng đã có quản lý</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="no-manager"
                                checked={!!filters.no_manager}
                                onCheckedChange={(checked) => handleFilterChange('no_manager', checked === true ? true : undefined)}
                                disabled={!!filters.has_manager}
                            />
                            <Label htmlFor="no-manager">Chỉ hiện cửa hàng chưa có quản lý</Label>
                        </div>
                    </div>
                </BaseFilterRow>
            </BaseFilterForm>
        </BaseFilterDialog>
    );
}
