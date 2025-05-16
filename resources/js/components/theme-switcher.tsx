import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';
import { MonitorSmartphone, Moon, Sun } from 'lucide-react';

interface ThemeSwitcherProps {
    className?: string;
}

export default function ThemeSwitcher({ className }: ThemeSwitcherProps) {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        // Chu kỳ: light -> dark -> system -> light
        const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
        setTheme(nextTheme);
    };

    // Xác định icon hiển thị
    const getIcon = () => {
        if (theme === 'light') {
            return <Moon className="h-5 w-5" />;
        } else if (theme === 'dark') {
            return <MonitorSmartphone className="h-5 w-5" />;
        } else {
            // Sử dụng icon màn hình khi ở chế độ system
            return <Sun className="h-5 w-5" />;
        }
    };

    const getTooltipText = () => {
        if (theme === 'light') {
            return 'Chuyển sang chế độ tối';
        } else if (theme === 'dark') {
            return 'Chuyển sang chế độ theo hệ thống';
        } else {
            return 'Chuyển sang chế độ sáng';
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            'border-border/40 bg-card hover:border-border/70 flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border transition-all',
                            className,
                        )}
                        aria-label={getTooltipText()}
                    >
                        {getIcon()}
                    </button>
                </TooltipTrigger>
                <TooltipContent>{getTooltipText()}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
