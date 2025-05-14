import { router } from '@inertiajs/react';
import { PencilIcon } from 'lucide-react';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import UserRoleBadge from '@/components/users/UserRoleBadge';
import { formatPhoneNumber, formatLastLogin } from '@/lib/userUtils';
import { formatCurrency } from '@/lib/productUtils';

interface UserDetailDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailDialog({ user, open, onOpenChange }: UserDetailDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chi tiết nhân viên</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về {user.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center mb-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">
                {user.full_name.charAt(0)}
              </span>
            </div>
            <h3 className="text-lg font-semibold">{user.full_name}</h3>
            <UserRoleBadge role={user.position} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Email:</div>
            <div>{user.email}</div>

            <div className="font-medium">Số điện thoại:</div>
            <div>{formatPhoneNumber(user.phone)}</div>

            <div className="font-medium">Cửa hàng:</div>
            <div>{user.store?.name || 'Không có'}</div>

            {user.position === 'SL' || user.position === 'SA' ? (
              <>
                <div className="font-medium">Lương theo giờ:</div>
                <div>{user.hourly_wage ? formatCurrency(user.hourly_wage) + ' VNĐ/giờ' : 'Chưa cài đặt'}</div>

                <div className="font-medium">Hoa hồng:</div>
                <div>{user.commission_rate ? (user.commission_rate * 100).toFixed(1) + '%' : 'Chưa cài đặt'}</div>
              </>
            ) : (
              <>
                <div className="font-medium">Lương cơ bản:</div>
                <div>{user.base_salary ? formatCurrency(user.base_salary) + ' VNĐ' : 'Chưa cài đặt'}</div>
              </>
            )}

            <div className="font-medium">Đăng nhập cuối:</div>
            <div>{formatLastLogin(user.last_login)}</div>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={() => {
            if (user) {
              router.visit(`/users/${user.id}/edit`);
            }
          }}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
