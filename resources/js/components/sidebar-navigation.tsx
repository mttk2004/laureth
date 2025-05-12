import { cn } from '@/lib/utils';
import { User, UserRole } from '@/types/user';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Box,
    Calendar,
    ClipboardList,
    Home,
    Layers,
    Package,
    ShoppingBag,
    Store,
    User as UserIcon,
    Users
} from 'lucide-react';
import { ReactNode } from 'react';

interface SidebarLinkProps {
    href: string;
    label: string;
    icon: ReactNode;
    active?: boolean;
}

const SidebarLink = ({ href, label, icon, active = false }: SidebarLinkProps) => {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
            )}
        >
            <span className="h-5 w-5">{icon}</span>
            <span>{label}</span>
        </Link>
    );
};

// Định nghĩa các liên kết cho từng vai trò
const roleLinks: Record<UserRole, SidebarLinkProps[]> = {
    'DM': [
        { href: '/dashboard', label: 'Tổng quan', icon: <Home /> },
        { href: '/stores', label: 'Cửa hàng', icon: <Store /> },
        { href: '/users', label: 'Nhân viên', icon: <Users /> },
        { href: '/products', label: 'Sản phẩm', icon: <Package /> },
        { href: '/warehouses', label: 'Kho hàng', icon: <Box /> },
        { href: '/transfers', label: 'Chuyển kho', icon: <Layers /> },
        { href: '/reports', label: 'Báo cáo', icon: <BarChart3 /> },
    ],
    'SM': [
        { href: '/dashboard', label: 'Tổng quan', icon: <Home /> },
        { href: '/store', label: 'Cửa hàng', icon: <Store /> },
        { href: '/staff', label: 'Nhân viên', icon: <Users /> },
        { href: '/inventory', label: 'Kho hàng', icon: <Box /> },
        { href: '/orders', label: 'Đơn hàng', icon: <ShoppingBag /> },
        { href: '/shifts', label: 'Ca làm việc', icon: <Calendar /> },
        { href: '/store-reports', label: 'Báo cáo', icon: <BarChart3 /> },
    ],
    'SL': [
        { href: '/dashboard', label: 'Tổng quan', icon: <Home /> },
        { href: '/pos', label: 'Bán hàng', icon: <ShoppingBag /> },
        { href: '/shift', label: 'Ca làm việc', icon: <Calendar /> },
        { href: '/check-inventory', label: 'Kiểm tra kho', icon: <Box /> },
        { href: '/shift-reports', label: 'Báo cáo ca', icon: <ClipboardList /> },
        { href: '/profile', label: 'Thông tin cá nhân', icon: <UserIcon /> },
    ],
    'SA': [
        { href: '/dashboard', label: 'Tổng quan', icon: <Home /> },
        { href: '/pos', label: 'Bán hàng', icon: <ShoppingBag /> },
        { href: '/products-list', label: 'Sản phẩm', icon: <Package /> },
        { href: '/attendance', label: 'Chấm công', icon: <Calendar /> },
        { href: '/profile', label: 'Thông tin cá nhân', icon: <UserIcon /> },
    ],
};

interface SidebarNavigationProps {
    user: User;
    className?: string;
}

export default function SidebarNavigation({ user, className }: SidebarNavigationProps) {
    const { url } = usePage();
    const links = roleLinks[user.position] || [];

    console.log('SidebarNavigation - user position:', user.position);

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {links.map((link) => (
                <SidebarLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    icon={link.icon}
                    active={url.startsWith(link.href)}
                />
            ))}
        </div>
    );
}
