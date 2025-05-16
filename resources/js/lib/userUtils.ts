import { UserRole, roleLabels } from '@/types/user';

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
