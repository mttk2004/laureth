import { PropsWithChildren } from 'react';

import SidebarNavigation from '@/components/sidebar-navigation';
import { User, isAdminRole } from '@/types/user';
import AppHeader from '@/components/app-header';
import { ToastContainer } from '@/components/ui/toast';

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
                    <ToastContainer />
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
                <AppHeader user={user} />

                <div className="flex flex-1">
                    <aside className="w-56 border-r bg-muted/40">
                        <div className="flex flex-col gap-6 h-full pt-6">
                            <SidebarNavigation
                                user={user}
                                className="px-3 flex-1"
                            />

                            <div className="p-4 border-t text-xs text-muted-foreground space-y-1.5">
                                <p>Phát triển bởi:</p>
                                <p className="font-semibold">Mai Trần Tuấn Kiệt</p>
                            </div>
                        </div>
                    </aside>
                    <main className="flex-1 overflow-auto">
                        <div className="container p-6">
                            {children}
                        </div>
                    </main>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
}

function StaffLayout({ children, user }: PropsWithChildren<{ user: User }>) {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex min-h-screen flex-col">
                <AppHeader user={user} />

                <div className="flex flex-1">
                    <aside className="w-56 flex flex-col justify-between border-r bg-muted/20 p-4">
                        <SidebarNavigation user={user} />

                        <div className="p-4 border-t text-xs text-muted-foreground space-y-1.5">
                            <p>Phát triển bởi:</p>
                            <p className="font-semibold">Mai Trần Tuấn Kiệt</p>
                        </div>
                    </aside>
                    <main className="flex-1 overflow-auto">
                        <div className="container p-6">
                            {children}
                        </div>
                    </main>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
}
