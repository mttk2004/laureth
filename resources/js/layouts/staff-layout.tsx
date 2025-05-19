import SidebarNavigation from '@/components/sidebar-navigation';
import UserMenu from '@/components/user-menu';
import { cn } from '@/lib/utils';
import { User } from '@/types/user';
import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

interface StaffLayoutProps extends PropsWithChildren {
    user: User;
    title?: string;
    className?: string;
}

export default function StaffLayout({ children, user, title, className }: StaffLayoutProps) {
    return (
        <>
            <Head title={title ?? 'LAURETH Staff'} />
            <div className="bg-background flex min-h-screen">
                {/* Sidebar */}
                <div className="border-border fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-[#0f172a] p-4 text-white shadow-md lg:block">
                    <div className="flex h-full flex-col">
                        <div className="mb-8 flex items-center">
                            <h1 className="text-2xl font-bold">LAURETH</h1>
                        </div>

                        <SidebarNavigation user={user} className="flex-1" />

                        <div className="border-border/30 mt-auto border-t pt-4">
                            <UserMenu user={user} />
                        </div>
                    </div>
                </div>

                {/* Mobile header */}
                <div className="border-border bg-background fixed inset-x-0 top-0 z-40 h-16 border-b lg:hidden">
                    <div className="flex h-full items-center justify-between px-4">
                        <h1 className="text-xl font-bold">LAURETH</h1>

                        <UserMenu user={user} />
                    </div>
                </div>

                {/* Main content */}
                <main className={cn('flex-1 overflow-auto pb-16', 'pt-16 lg:pt-0 lg:pl-64', className)}>{children}</main>
            </div>
        </>
    );
}
