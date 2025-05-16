import { cn } from '@/lib/utils';
import { User, UserRole } from '@/types/user';
import { Link, usePage } from '@inertiajs/react';
import { BarChart3, Box, Calendar, ClipboardList, DollarSign, Home, Layers, Package, Package2, ShoppingBag, Store, Users } from 'lucide-react';
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
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary',
            )}
        >
            <span className="h-5 w-5">{icon}</span>
            <span>{label}</span>
        </Link>
    );
};

// Định nghĩa các liên kết cho từng vai trò
const roleLinks: Record<UserRole, SidebarLinkProps[]> = {
    DM: [
        { href: '/dashboard', label: 'Tổng quan', icon: <Home className="h-5 w-5" /> },
        { href: '/stores', label: 'Cửa hàng', icon: <Store className="h-5 w-5" /> },
        { href: '/users', label: 'Nhân viên', icon: <Users className="h-5 w-5" /> },
        { href: '/products', label: 'Sản phẩm', icon: <Package className="h-5 w-5" /> },
        { href: '/suppliers', label: 'Nhà cung cấp', icon: <Package2 className="h-5 w-5" /> },
        { href: '/warehouses', label: 'Kho hàng', icon: <Box className="h-5 w-5" /> },
        { href: '/purchase-orders', label: 'Đơn nhập hàng', icon: <ClipboardList className="h-5 w-5" /> },
        { href: '/transfers', label: 'Duyệt chuyển kho', icon: <Layers className="h-5 w-5" /> },
        { href: '/payrolls', label: 'Duyệt lương', icon: <DollarSign className="h-5 w-5" /> },
        { href: '/reports', label: 'Báo cáo', icon: <BarChart3 className="h-5 w-5" /> },
    ],
    SM: [
        { href: '/dashboard', label: 'Tổng quan', icon: <Home className="h-5 w-5" /> },
        { href: '/staff', label: 'Nhân viên', icon: <Users className="h-5 w-5" /> },
        { href: '/inventory', label: 'Kho hàng', icon: <Box className="h-5 w-5" /> },
        { href: '/orders', label: 'Đơn hàng', icon: <ShoppingBag className="h-5 w-5" /> },
        { href: '/shifts', label: 'Ca làm việc', icon: <Calendar className="h-5 w-5" /> },
        { href: '/store-reports', label: 'Báo cáo', icon: <BarChart3 className="h-5 w-5" /> },
    ],
    SL: [
        { href: '/dashboard', label: 'Tổng quan', icon: <Home className="h-5 w-5" /> },
        { href: '/pos', label: 'Bán hàng', icon: <ShoppingBag className="h-5 w-5" /> },
        { href: '/attendance', label: 'Chấm công', icon: <Calendar className="h-5 w-5" /> },
        { href: '/shift', label: 'Ca làm việc', icon: <Calendar className="h-5 w-5" /> },
        { href: '/shift-reports', label: 'Báo cáo ca', icon: <ClipboardList className="h-5 w-5" /> },
    ],
    SA: [
        { href: '/dashboard', label: 'Tổng quan', icon: <Home className="h-5 w-5" /> },
        { href: '/pos', label: 'Bán hàng', icon: <ShoppingBag className="h-5 w-5" /> },
        { href: '/attendance', label: 'Chấm công', icon: <Calendar className="h-5 w-5" /> },
        { href: '/shift', label: 'Ca làm việc', icon: <Calendar className="h-5 w-5" /> },
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
                <SidebarLink key={link.href} href={link.href} label={link.label} icon={link.icon} active={url.startsWith(link.href)} />
            ))}
        </div>
    );
}
