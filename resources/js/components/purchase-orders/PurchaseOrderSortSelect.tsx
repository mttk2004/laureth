import { BaseSortSelect } from '@/components/common';
import { PurchaseOrderSortOption, PurchaseOrderSortOptionLabels } from '@/types';

interface PurchaseOrderSortSelectProps {
    value: PurchaseOrderSortOption;
    onChange: (value: PurchaseOrderSortOption) => void;
}

export function PurchaseOrderSortSelect({ value, onChange }: PurchaseOrderSortSelectProps) {
    return (
        <BaseSortSelect
            value={value}
            options={PurchaseOrderSortOption}
            labels={PurchaseOrderSortOptionLabels}
            onChange={onChange}
            placeholder="Sắp xếp theo"
            width="w-[200px]"
        />
    );
}
