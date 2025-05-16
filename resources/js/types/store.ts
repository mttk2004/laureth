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

export enum StoreSortOption {
    NEWEST = 'created_at_desc',
    OLDEST = 'created_at_asc',
    NAME_ASC = 'name_asc',
    NAME_DESC = 'name_desc',
    TARGET_ASC = 'target_asc',
    TARGET_DESC = 'target_desc',
}

export const StoreSortOptionLabels: Record<StoreSortOption, string> = {
    [StoreSortOption.NEWEST]: 'Mới nhất',
    [StoreSortOption.OLDEST]: 'Cũ nhất',
    [StoreSortOption.NAME_ASC]: 'Tên A-Z',
    [StoreSortOption.NAME_DESC]: 'Tên Z-A',
    [StoreSortOption.TARGET_ASC]: 'Mục tiêu tăng dần',
    [StoreSortOption.TARGET_DESC]: 'Mục tiêu giảm dần',
};
