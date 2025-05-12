import { User, roleLabels } from '@/types/user';
import UserDropdown from './user-dropdown';
import ThemeSwitcher from './theme-switcher';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
    user: User;
    className?: string;
}

export default function AppHeader({ user, className }: AppHeaderProps) {
    return (
        <header className={cn("flex items-center justify-between border-b bg-card px-6 py-3", className)}>
            <div>
                <h2 className="text-lg font-semibold">LAURETH</h2>
                <p className="text-sm text-muted-foreground">{roleLabels[user.position]}</p>
            </div>

            <div className="flex items-center gap-3">
                <ThemeSwitcher />
                <UserDropdown user={user} />
            </div>
        </header>
    );
}
