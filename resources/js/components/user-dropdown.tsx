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
        <div className={cn("relative", className)}>
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-2 text-sm hover:bg-secondary/70"
            >
                <span className="font-medium">{user.full_name}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserIcon className="h-4 w-4" />
                </div>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={closeDropdown}
                    />
                    <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-md border bg-card p-1 shadow-md">
                        <div className="border-b p-3">
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            <div className="mt-1 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                                {roleLabels[user.position]}
                            </div>
                        </div>

                        <div className="p-1">
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                                onClick={closeDropdown}
                            >
                                <Settings className="h-4 w-4" />
                                <span>Tài khoản của tôi</span>
                            </Link>

                            <Link
                                href="/notifications"
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
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
