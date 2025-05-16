import { BaseFilterDialog, BaseFilterForm, BaseFilterRow } from '@/components/common';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface FilterOptions {
    name: string;
    phone: string;
    email: string;
}

interface SupplierFiltersProps {
    initialFilters: Partial<FilterOptions>;
    onApplyFilters: (filters: Partial<FilterOptions>) => void;
}

export default function SupplierFilters({ initialFilters, onApplyFilters }: SupplierFiltersProps) {
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        name: initialFilters.name || '',
        phone: initialFilters.phone || '',
        email: initialFilters.email || '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilterOptions((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const applyFilters = () => {
        onApplyFilters({
            name: filterOptions.name.trim() ? filterOptions.name.trim() : undefined,
            phone: filterOptions.phone.trim() ? filterOptions.phone.trim() : undefined,
            email: filterOptions.email.trim() ? filterOptions.email.trim() : undefined,
        });
    };

    const resetFilters = () => {
        setFilterOptions({
            name: '',
            phone: '',
            email: '',
        });
        onApplyFilters({});
    };

    const hasActiveFilters = Boolean(initialFilters.name || initialFilters.phone || initialFilters.email);

    return (
        <BaseFilterDialog
            title="Lọc nhà cung cấp"
            description="Chọn các tiêu chí để lọc danh sách nhà cung cấp."
            onApply={applyFilters}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
            triggerText="Lọc nhà cung cấp"
            dialogWidth="sm:max-w-md"
        >
            <BaseFilterForm>
                <BaseFilterRow label="Tên" labelPosition="top">
                    <Input placeholder="Nhập tên nhà cung cấp" name="name" value={filterOptions.name} onChange={handleInputChange} />
                </BaseFilterRow>

                <BaseFilterRow label="Số điện thoại" labelPosition="top">
                    <Input placeholder="Nhập số điện thoại" name="phone" value={filterOptions.phone} onChange={handleInputChange} />
                </BaseFilterRow>

                <BaseFilterRow label="Email" labelPosition="top">
                    <Input placeholder="Nhập địa chỉ email" name="email" value={filterOptions.email} onChange={handleInputChange} />
                </BaseFilterRow>
            </BaseFilterForm>
        </BaseFilterDialog>
    );
}
