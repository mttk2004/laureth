export interface Warehouse {
  id: number;
  name: string;
  is_main: boolean;
  store_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
