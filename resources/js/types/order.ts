export enum PaymentMethod {
    CASH = 'cash',
    CARD = 'card',
    TRANSFER = 'transfer',
}

export enum OrderStatus {
    COMPLETED = 'completed',
    CANCELED = 'canceled',
    PENDING = 'pending',
}

export interface Order {
    id: string;
    order_date: string;
    total_amount: number;
    discount_amount: number;
    final_amount: number;
    payment_method: PaymentMethod;
    status: OrderStatus;
    user_id: string;
    store_id: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface OrderItem {
    id: number;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    updated_at: string;
}

export enum OrderSortOption {
    NEWEST = 'order_date_desc',
    OLDEST = 'order_date_asc',
    AMOUNT_ASC = 'final_amount_asc',
    AMOUNT_DESC = 'final_amount_desc',
}

export const OrderSortOptionLabels: Record<OrderSortOption, string> = {
    [OrderSortOption.NEWEST]: 'Mới nhất',
    [OrderSortOption.OLDEST]: 'Cũ nhất',
    [OrderSortOption.AMOUNT_ASC]: 'Giá trị tăng dần',
    [OrderSortOption.AMOUNT_DESC]: 'Giá trị giảm dần',
};
