import { BaseSortSelect } from '@/components/common';
import { OrderSortOption, OrderSortOptionLabels } from '@/types/order';

interface OrderSortSelectProps {
    value: OrderSortOption;
    onChange: (value: OrderSortOption) => void;
}

export default function OrderSortSelect({ value, onChange }: OrderSortSelectProps) {
    return (
        <BaseSortSelect<OrderSortOption>
            value={value}
            options={OrderSortOption}
            labels={OrderSortOptionLabels}
            onChange={onChange}
            placeholder="Sắp xếp theo"
            icon="arrowUpDown"
        />
    );
}
