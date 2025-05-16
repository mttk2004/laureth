export type UserRole = 'DM' | 'SM' | 'SL' | 'SA';

import { Store } from './store';

export interface User {
  id: string;
  full_name: string;
  email: string;
  password: string;
  phone: string;
  position: UserRole;
  hourly_wage?: number;
  base_salary?: number;
  commission_rate?: number;
  store_id?: string;
  store?: Store;
  last_login?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Phân loại vai trò theo nhóm
export const isAdminRole = (role: UserRole): boolean => ['DM', 'SM'].includes(role);
export const isStaffRole = (role: UserRole): boolean => ['SL', 'SA'].includes(role);

// Mô tả vai trò bằng tiếng Việt
export const roleLabels: Record<UserRole, string> = {
    DM: 'Quản lý chuỗi',
    SM: 'Quản lý cửa hàng',
    SL: 'Trưởng ca',
    SA: 'Nhân viên bán hàng'
};



export enum UserSortOption {
  NEWEST = 'created_at_desc',
  OLDEST = 'created_at_asc',
  NAME_ASC = 'full_name_asc',
  NAME_DESC = 'full_name_desc',
}

export const UserSortOptionLabels: Record<UserSortOption, string> = {
  [UserSortOption.NEWEST]: 'Mới nhất',
  [UserSortOption.OLDEST]: 'Cũ nhất',
  [UserSortOption.NAME_ASC]: 'Tên A-Z',
  [UserSortOption.NAME_DESC]: 'Tên Z-A',
};
