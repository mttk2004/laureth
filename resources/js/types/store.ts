export interface Store {
  id: string;
  name: string;
  address: string;
  manager_id: string | null;
  monthly_target: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
