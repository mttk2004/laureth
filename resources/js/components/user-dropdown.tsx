import { cn } from '@/lib/utils';
import { User, roleLabels } from '@/types/user';
import { Link, router } from '@inertiajs/react';
import { Bell, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useState } from 'react';

interface UserDropdownProps {
    user: User;
    className?: string;
}

export default function UserDropdown({ user, className }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);
    const closeDropdown = () => setIsOpen(false);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className={cn('relative', className)}>
            <button
                onClick={toggleDropdown}
                className="bg-secondary/50 hover:bg-secondary/70 flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm"
            >
                <span className="font-medium">{user.full_name}</span>
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                    <UserIcon className="h-4 w-4" />
                </div>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={closeDropdown} />
                    <div className="bg-card absolute top-full right-0 z-20 mt-1 w-64 rounded-md border p-1 shadow-md">
                        <div className="border-b p-3">
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-muted-foreground text-xs">{user.email}</p>
                            <div className="bg-primary/10 text-primary mt-1 rounded-xs px-2 py-1 text-xs font-medium">
                                {roleLabels[user.position]}
                            </div>
                        </div>

                        <div className="p-1">
                            <Link
                                href="/profile"
                                className="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm"
                                onClick={closeDropdown}
                            >
                                <Settings className="h-4 w-4" />
                                <span>Tài khoản của tôi</span>
                            </Link>

                            <Link
                                href="/notifications"
                                className="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm"
                                onClick={closeDropdown}
                            >
                                <Bell className="h-4 w-4" />
                                <span>Thông báo</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
