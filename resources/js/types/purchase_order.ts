export interface PurchaseOrder {
    id: number;
    supplier_id: number;
    warehouse_id: number;
    user_id: string;
    order_date: string;
    total_amount: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface PurchaseOrderItem {
    id: number;
    purchase_order_id: string;
    product_id: string;
    quantity: number;
    purchase_price: number;
    selling_price: number;
    created_at: string;
    updated_at: string;
}

export enum PurchaseOrderSortOption {
    NEWEST = 'created_at_desc',
    OLDEST = 'created_at_asc',
    DATE_DESC = 'order_date_desc',
    DATE_ASC = 'order_date_asc',
    AMOUNT_DESC = 'total_amount_desc',
    AMOUNT_ASC = 'total_amount_asc',
}

export const PurchaseOrderSortOptionLabels: Record<PurchaseOrderSortOption, string> = {
    [PurchaseOrderSortOption.NEWEST]: 'Mới nhất',
    [PurchaseOrderSortOption.OLDEST]: 'Cũ nhất',
    [PurchaseOrderSortOption.DATE_DESC]: 'Ngày đặt hàng giảm dần',
    [PurchaseOrderSortOption.DATE_ASC]: 'Ngày đặt hàng tăng dần',
    [PurchaseOrderSortOption.AMOUNT_DESC]: 'Giá trị giảm dần',
    [PurchaseOrderSortOption.AMOUNT_ASC]: 'Giá trị tăng dần',
};
