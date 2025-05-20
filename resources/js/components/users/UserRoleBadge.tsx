import { Badge } from '@/components/ui/badge';
import { UserRole, roleLabels } from '@/types/user';

interface UserRoleBadgeProps {
    role?: UserRole;
    position?: UserRole;
    className?: string;
}

export default function UserRoleBadge({ role, position, className = '' }: UserRoleBadgeProps) {
    // Lấy giá trị role từ prop position nếu role không được cung cấp
    const userRole = role || position;

    if (!userRole) {
        return null;
    }

    const getBadgeVariant = () => {
        switch (userRole) {
            case 'DM':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'SM':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'SL':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'SA':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Badge variant="outline" className={`${getBadgeVariant()} ${className}`}>
            {roleLabels[userRole]}
        </Badge>
    );
}
