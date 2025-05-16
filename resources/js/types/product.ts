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

export enum ProductSortOption {
    NEWEST = 'created_at_desc',
    OLDEST = 'created_at_asc',
    NAME_ASC = 'name_asc',
    NAME_DESC = 'name_desc',
    PRICE_ASC = 'price_asc',
    PRICE_DESC = 'price_desc',
}

export const ProductSortOptionLabels: Record<ProductSortOption, string> = {
    [ProductSortOption.NEWEST]: 'Mới nhất',
    [ProductSortOption.OLDEST]: 'Cũ nhất',
    [ProductSortOption.NAME_ASC]: 'Tên A-Z',
    [ProductSortOption.NAME_DESC]: 'Tên Z-A',
    [ProductSortOption.PRICE_ASC]: 'Giá tăng dần',
    [ProductSortOption.PRICE_DESC]: 'Giá giảm dần',
};
