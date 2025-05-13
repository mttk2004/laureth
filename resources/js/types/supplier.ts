export interface Supplier {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
