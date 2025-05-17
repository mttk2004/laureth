import { User } from '@/types/user';
import { PropsWithChildren } from 'react';
import { Head } from '@inertiajs/react';
import SidebarNavigation from '@/components/sidebar-navigation';
import { cn } from '@/lib/utils';
import UserMenu from '@/components/user-menu';

interface StaffLayoutProps extends PropsWithChildren {
  user: User;
  title?: string;
  className?: string;
}

export function StaffLayout({ children, user, title, className }: StaffLayoutProps) {
  return (
    <>
      <Head title={title ?? 'LAURETH Staff'} />
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-white p-4 border-r border-border shadow-md hidden lg:block">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-8">
              <h1 className="text-2xl font-bold">LAURETH</h1>
            </div>

            <SidebarNavigation user={user} className="flex-1" />

            <div className="mt-auto pt-4 border-t border-border/30">
              <UserMenu user={user} />
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="fixed top-0 inset-x-0 z-40 h-16 border-b border-border bg-background lg:hidden">
          <div className="flex items-center justify-between h-full px-4">
            <h1 className="text-xl font-bold">LAURETH</h1>

            <UserMenu user={user} />
          </div>
        </div>

        {/* Main content */}
        <main className={cn(
          "flex-1 overflow-auto pb-16",
          "lg:pl-64 pt-16 lg:pt-0",
          className
        )}>
          {children}
        </main>
      </div>
    </>
  );
}
