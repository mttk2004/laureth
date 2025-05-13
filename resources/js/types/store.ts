export interface Store {
  id: number;
  name: string;
  address: string;
  manager_id: number | null;
  monthly_target: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
