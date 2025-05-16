export interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  deleted_at?: string;
}

export enum SupplierSortOption {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

export const SupplierSortOptionLabels: Record<SupplierSortOption, string> = {
  [SupplierSortOption.NAME_ASC]: 'Tên A-Z',
  [SupplierSortOption.NAME_DESC]: 'Tên Z-A',
};
