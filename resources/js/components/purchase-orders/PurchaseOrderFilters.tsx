import { BaseFilterDialog, BaseFilterForm, BaseFilterRow } from '@/components/common';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Supplier, Warehouse } from '@/types';
import { useState } from 'react';

interface PurchaseOrderFiltersProps {
    suppliers: Supplier[];
    warehouses: Warehouse[];
    initialFilters: {
        supplier_id?: string;
        warehouse_id?: string;
        date_from?: string;
        date_to?: string;
    };
    onApplyFilters: (filters: { supplier_id?: string; warehouse_id?: string; date_from?: string; date_to?: string }) => void;
}

export function PurchaseOrderFilters({ suppliers, warehouses, initialFilters, onApplyFilters }: PurchaseOrderFiltersProps) {
    const [filters, setFilters] = useState({
        supplier_id: initialFilters.supplier_id || 'all',
        warehouse_id: initialFilters.warehouse_id || 'all',
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || '',
    });

    const handleChange = (name: string, value: string) => {
        setFilters({
            ...filters,
            [name]: value,
        });
    };

    const hasActiveFilters = filters.supplier_id !== 'all' || filters.warehouse_id !== 'all' || !!filters.date_from || !!filters.date_to;

    const handleReset = () => {
        setFilters({
            supplier_id: 'all',
            warehouse_id: 'all',
            date_from: '',
            date_to: '',
        });
        onApplyFilters({});
    };

    const prepareFiltersForSubmit = () => {
        const result: Record<string, string> = {};

        if (filters.supplier_id !== 'all') {
            result.supplier_id = filters.supplier_id;
        }

        if (filters.warehouse_id !== 'all') {
            result.warehouse_id = filters.warehouse_id;
        }

        if (filters.date_from) {
            result.date_from = filters.date_from;
        }

        if (filters.date_to) {
            result.date_to = filters.date_to;
        }

        return result;
    };

    return (
        <BaseFilterDialog
            title="Lọc đơn nhập hàng"
            description="Chọn các điều kiện lọc dưới đây"
            onApply={() => onApplyFilters(prepareFiltersForSubmit())}
            onReset={handleReset}
            hasActiveFilters={hasActiveFilters}
            dialogWidth="sm:max-w-md"
            triggerText="Lọc đơn nhập hàng"
        >
            <BaseFilterForm>
                <BaseFilterRow label="Nhà cung cấp">
                    <Select value={filters.supplier_id} onValueChange={(value) => handleChange('supplier_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tất cả nhà cung cấp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                            {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                    {supplier.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </BaseFilterRow>

                <BaseFilterRow label="Kho">
                    <Select value={filters.warehouse_id} onValueChange={(value) => handleChange('warehouse_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tất cả kho" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả kho</SelectItem>
                            {warehouses.map((warehouse) => (
                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                    {warehouse.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </BaseFilterRow>

                <BaseFilterRow label="Từ ngày">
                    <Input type="date" value={filters.date_from} onChange={(e) => handleChange('date_from', e.target.value)} />
                </BaseFilterRow>

                <BaseFilterRow label="Đến ngày">
                    <Input type="date" value={filters.date_to} onChange={(e) => handleChange('date_to', e.target.value)} />
                </BaseFilterRow>
            </BaseFilterForm>
        </BaseFilterDialog>
    );
}
