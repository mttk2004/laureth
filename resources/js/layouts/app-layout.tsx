import { PropsWithChildren } from 'react';

import SidebarNavigation from '@/components/sidebar-navigation';
import UserDropdown from '@/components/user-dropdown';
import { cn } from '@/lib/utils';
import { User, isAdminRole, roleLabels } from '@/types/user';

interface AppLayoutProps {
    user?: User;
}

export default function AppLayout({ children, user }: PropsWithChildren<AppLayoutProps>) {
    // Hiển thị layout đơn giản nếu không có thông tin user
    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <div className="flex min-h-screen flex-col p-6">
                    {children}
                </div>
            </div>
        );
    }

    // Log thông tin user để debug
    console.log('App Layout user position:', user.position, 'isAdminRole:', isAdminRole(user.position));

    // Redirect to appropriate layout based on user position
    if (isAdminRole(user.position)) {
        return <AdminLayout user={user}>{children}</AdminLayout>;
    } else {
        return <StaffLayout user={user}>{children}</StaffLayout>;
    }
}

function AdminLayout({ children, user }: PropsWithChildren<{ user: User }>) {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex min-h-screen flex-col">
                <div className="flex flex-1">
                    <aside className="w-64 border-r bg-muted/40">
                        <div className="flex flex-col gap-6 h-full">
                            <div className="p-6 border-b">
                                <h2 className="text-lg font-semibold">LAURETH - Admin</h2>
                                <p className="text-sm text-muted-foreground">{roleLabels[user.position]}</p>
                            </div>

                            <SidebarNavigation
                                user={user}
                                className="px-3 flex-1"
                            />

                            <div className="p-4 border-t">
                                <UserDropdown user={user} />
                            </div>
                        </div>
                    </aside>
                    <main className="flex-1 overflow-auto">
                        <div className="container p-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

function StaffLayout({ children, user }: PropsWithChildren<{ user: User }>) {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-card px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">LAURETH - Staff</h2>
                            <p className="text-sm text-muted-foreground">{roleLabels[user.position]}</p>
                        </div>
                        <UserDropdown user={user} />
                    </div>
                </header>

                <div className="flex flex-1">
                    <aside className={cn("w-64 border-r bg-muted/20 p-4")}>
                        <SidebarNavigation user={user} />
                    </aside>
                    <main className="flex-1 overflow-auto">
                        <div className="container p-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
