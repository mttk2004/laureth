export type UserRole = 'DM' | 'SM' | 'SL' | 'SA';

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
