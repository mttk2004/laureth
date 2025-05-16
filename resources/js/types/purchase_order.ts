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
