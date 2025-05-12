import { usePage } from '@inertiajs/react';
import { User, UserRole, isAdminRole, isStaffRole } from '@/types/user';

interface AuthPageProps {
    auth: {
        user: User | null;
    };
}

export function useAuth() {
    const { auth } = usePage().props as unknown as AuthPageProps;
    const user = auth.user;

    return {
        user,
        isLoggedIn: !!user,

        // Kiểm tra vai trò
        isAdmin: user ? isAdminRole(user.position) : false,
        isStaff: user ? isStaffRole(user.position) : false,

        // Kiểm tra vai trò cụ thể
        hasRole: (role: UserRole | UserRole[]) => {
            if (!user) return false;

            if (Array.isArray(role)) {
                return role.includes(user.position);
            }

            return user.position === role;
        },

        // Kiểm tra quyền hạn (sẽ cài đặt chi tiết sau)
        can: (permission: string) => {
            if (!user) return false;

            // Ví dụ về các quyền theo vai trò
            const rolePermissions: Record<UserRole, string[]> = {
                DM: ['manage_all', 'view_all_stores', 'manage_users', 'manage_products', 'approve_transfers'],
                SM: ['manage_store', 'view_store_data', 'manage_store_inventory', 'manage_store_staff'],
                SL: ['sell', 'view_shift_data', 'manage_shift', 'check_inventory'],
                SA: ['sell', 'check_inventory', 'view_personal_data']
            };

            return rolePermissions[user.position]?.includes(permission) || false;
        }
    };
}
