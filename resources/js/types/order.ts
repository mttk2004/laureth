export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer'
}

export enum OrderStatus {
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  PENDING = 'pending'
}

export interface Order {
  id: number;
  order_date: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  user_id: number;
  store_id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}
