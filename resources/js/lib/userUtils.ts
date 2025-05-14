import { UserRole, roleLabels } from '@/types/user';

/**
 * Format số điện thoại theo chuẩn Việt Nam
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Xóa các ký tự không phải số
  const cleanedPhone = phone.replace(/\D/g, '');

  // Định dạng số điện thoại
  if (cleanedPhone.length === 10) {
    return cleanedPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }

  return phone;
}

/**
 * Lấy tên hiển thị cho vai trò
 */
export function getRoleName(role: UserRole): string {
  return roleLabels[role] || role;
}

/**
 * Lấy class CSS cho badge vai trò
 */
export function getRoleClassName(role: UserRole): string {
  const roleClasses: Record<UserRole, string> = {
    'DM': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'SM': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'SL': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'SA': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return roleClasses[role] || '';
}

/**
 * Các tùy chọn sắp xếp nhân viên
 */
export enum SortOption {
  NEWEST = 'created_at_desc',
  OLDEST = 'created_at_asc',
  NAME_ASC = 'full_name_asc',
  NAME_DESC = 'full_name_desc',
  ROLE_ASC = 'position_asc',
  ROLE_DESC = 'position_desc',
}

/**
 * Lấy label hiển thị cho tùy chọn sắp xếp
 */
export function getSortLabel(option: SortOption): string {
  const labels: Record<SortOption, string> = {
    [SortOption.NEWEST]: 'Mới nhất',
    [SortOption.OLDEST]: 'Cũ nhất',
    [SortOption.NAME_ASC]: 'Tên A-Z',
    [SortOption.NAME_DESC]: 'Tên Z-A',
    [SortOption.ROLE_ASC]: 'Vai trò tăng dần',
    [SortOption.ROLE_DESC]: 'Vai trò giảm dần',
  };
  return labels[option];
}

/**
 * Kiểm tra xem người dùng có quyền admin không
 */
export function isAdmin(role: UserRole): boolean {
  return ['DM', 'SM'].includes(role);
}

/**
 * Kiểm tra xem người dùng có quyền staff không
 */
export function isStaff(role: UserRole): boolean {
  return ['SL', 'SA'].includes(role);
}

/**
 * Format thời gian đăng nhập cuối
 */
export function formatLastLogin(lastLogin: string | undefined): string {
  if (!lastLogin) return 'Chưa đăng nhập';

  const date = new Date(lastLogin);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
