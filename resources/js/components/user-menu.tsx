import { User } from '@/types/user';
import { Link } from '@inertiajs/react';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative w-full flex items-center justify-start gap-2 px-2 hover:bg-white/10">
          <UserIcon className="h-5 w-5" />
          <span className="text-sm font-medium line-clamp-1">{user.full_name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={route('profile.edit')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Cài đặt tài khoản</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={route('logout')}
            method="post"
            as="button"
            className="cursor-pointer w-full text-left"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng xuất</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
