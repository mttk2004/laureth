import { PropsWithChildren } from 'react';

import AppHeader from '@/components/app-header';
import SidebarNavigation from '@/components/sidebar-navigation';
import { ToastContainer } from '@/components/ui/toast';
import { User, isAdminRole } from '@/types/user';

interface AppLayoutProps {
    user?: User;
}

export default function AppLayout({ children, user }: PropsWithChildren<AppLayoutProps>) {
    // Hiển thị layout đơn giản nếu không có thông tin user
    if (!user) {
        return (
            <div className="bg-background min-h-screen">
                <div className="flex min-h-screen flex-col p-6">
                    {children}
                    <ToastContainer />
                </div>
            </div>
        );
    }

    // Log thông tin user để debug
    // console.log('App Layout user position:', user.position, 'isAdminRole:', isAdminRole(user.position));

    // Redirect to appropriate layout based on user position
    if (isAdminRole(user.position)) {
        return <AdminLayout user={user}>{children}</AdminLayout>;
    } else {
        return <StaffLayout user={user}>{children}</StaffLayout>;
    }
}

function AdminLayout({ children, user }: PropsWithChildren<{ user: User }>) {
    return (
        <div className="bg-background min-h-screen">
            <div className="flex min-h-screen flex-col">
                <AppHeader user={user} />

                <div className="flex flex-1">
                    <aside className="bg-muted/40 w-56 border-r">
                        <div className="flex h-full flex-col gap-6 pt-6">
                            <SidebarNavigation user={user} className="flex-1 px-3" />

                            <div className="text-muted-foreground space-y-1.5 border-t p-4 text-xs">
                                <p>Phát triển bởi:</p>
                                <p className="font-semibold">Mai Trần Tuấn Kiệt</p>
                            </div>
                        </div>
                    </aside>
                    <main className="flex-1 overflow-auto">
                        <div className="container p-6">{children}</div>
                    </main>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
}

function StaffLayout({ children, user }: PropsWithChildren<{ user: User }>) {
    return (
        <div className="bg-background min-h-screen">
            <div className="flex min-h-screen flex-col">
                <AppHeader user={user} />

                <div className="flex flex-1">
                    <aside className="bg-muted/20 flex w-56 flex-col justify-between border-r p-4">
                        <SidebarNavigation user={user} />

                        <div className="text-muted-foreground space-y-1.5 border-t p-4 text-xs">
                            <p>Phát triển bởi:</p>
                            <p className="font-semibold">Mai Trần Tuấn Kiệt</p>
                        </div>
                    </aside>
                    <main className="flex-1 overflow-auto">
                        <div className="container p-6">{children}</div>
                    </main>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
}
