import { PropsWithChildren } from 'react';

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

    // Redirect to appropriate layout based on user role
    if (isAdminRole(user.role)) {
        return <AdminLayout user={user}>{children}</AdminLayout>;
    } else {
        return <StaffLayout user={user}>{children}</StaffLayout>;
    }
}

function AdminLayout({ children, user }: PropsWithChildren<{ user: User }>) {
    return (
        <div className="min-h-screen bg-background">
            {/* Admin layout will be implemented here */}
            <div className="flex min-h-screen flex-col">
                <div className="flex flex-1">
                    <aside className="w-64 border-r bg-muted/40">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold">LAURETH - Admin</h2>
                            <p className="text-sm text-muted-foreground">{roleLabels[user.role]}</p>
                        </div>
                        {/* Sidebar navigation will go here */}
                    </aside>
                    <main className="flex-1 p-6">{children}</main>
                </div>
            </div>
        </div>
    );
}

function StaffLayout({ children, user }: PropsWithChildren<{ user: User }>) {
    return (
        <div className="min-h-screen bg-background">
            {/* Staff layout will be implemented here */}
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-card px-6 py-4">
                    <h2 className="text-lg font-semibold">LAURETH - Staff</h2>
                    <p className="text-sm text-muted-foreground">{roleLabels[user.role]}</p>
                </header>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
