export type UserRole = 'DM' | 'SM' | 'SL' | 'SA';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    store_id?: number; // ID cửa hàng mà người dùng thuộc về (SM, SL, SA)
    created_at: string;
    updated_at: string;
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
