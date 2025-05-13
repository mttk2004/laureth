export interface User {
    id: number;
    name: string;
    email: string;
    position: 'DM' | 'SM' | 'SL' | 'SA';
}

export interface Category {
    id: number;
    name: string;
}

export interface Supplier {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    code: string;
    name: string;
    description: string;
    price: number;
    category?: Category;
    supplier?: Supplier;
    created_at: string;
    updated_at: string;
}
