export enum PurchaseOrderStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export interface PurchaseOrder {
  id: number;
  supplier_id: number;
  warehouse_id: number;
  user_id: number;
  order_date: string;
  total_amount: number;
  status: PurchaseOrderStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  created_at: string;
  updated_at: string;
}
