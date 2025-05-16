import { Store } from './store';

export interface Warehouse {
    id: number;
    name: string;
    is_main: boolean;
    store_id: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface WarehouseWithStore extends Warehouse {
    store?: Store | null;
}

export enum WarehouseSortOption {
    NEWEST = 'newest',
    OLDEST = 'oldest',
    NAME_ASC = 'name_asc',
    NAME_DESC = 'name_desc',
}

export const WarehouseSortOptionLabels: Record<WarehouseSortOption, string> = {
    [WarehouseSortOption.NEWEST]: 'Mới nhất',
    [WarehouseSortOption.OLDEST]: 'Cũ nhất',
    [WarehouseSortOption.NAME_ASC]: 'Tên A-Z',
    [WarehouseSortOption.NAME_DESC]: 'Tên Z-A',
};
