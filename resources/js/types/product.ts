export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  category_id: number;
  price: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
}
