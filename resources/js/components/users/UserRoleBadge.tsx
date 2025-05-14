import React from 'react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/user';
import { getRoleName, getRoleClassName } from '@/lib/userUtils';

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

export default function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  return (
    <span
      className={cn(
        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
        getRoleClassName(role),
        className
      )}
    >
      {getRoleName(role)}
    </span>
  );
}
