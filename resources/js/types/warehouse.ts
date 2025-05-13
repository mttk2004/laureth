export interface Warehouse {
  id: number;
  name: string;
  is_main: boolean;
  store_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
