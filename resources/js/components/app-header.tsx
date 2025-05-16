import { cn } from '@/lib/utils';
import { User, roleLabels } from '@/types/user';
import ThemeSwitcher from './theme-switcher';
import UserDropdown from './user-dropdown';

interface AppHeaderProps {
    user: User;
    className?: string;
}

export default function AppHeader({ user, className }: AppHeaderProps) {
    return (
        <header className={cn('bg-card flex items-center justify-between border-b px-6 py-3', className)}>
            <div>
                <h2 className="text-lg font-semibold">LAURETH</h2>
                <p className="text-muted-foreground text-sm">{roleLabels[user.position]}</p>
            </div>

            <div className="flex items-center gap-3">
                <ThemeSwitcher />
                <UserDropdown user={user} />
            </div>
        </header>
    );
}
