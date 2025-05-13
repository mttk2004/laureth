export interface Product {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  category_id: number;
  price: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
