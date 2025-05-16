import { router } from '@inertiajs/react';
import { PencilIcon } from 'lucide-react';
import { User, roleLabels } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatPhoneNumber, formatLastLogin, formatCurrency } from '@/lib';

interface UserDetailDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  if (!user) return null;

  // Chuyển đổi tỷ lệ hoa hồng từ thập phân sang phần trăm
  const formattedCommissionRate = user.commission_rate
    ? `${user.commission_rate * 100}%`
    : 'Không áp dụng';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Chi tiết nhân viên</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Thông tin chi tiết về nhân viên
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mr-4">
                <span className="text-lg font-medium">
                  {user.full_name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="text-lg font-medium">{user.full_name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Vai trò:</div>
              <div>{roleLabels[user.position]}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Điện thoại:</div>
              <div>{formatPhoneNumber(user.phone)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Cửa hàng:</div>
              <div>{user.store?.name || 'Chưa phân công'}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Hoa hồng:</div>
              <div>{formattedCommissionRate}</div>
            </div>

            {user.position === 'SM' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Lương cơ bản:</div>
                <div>{user.base_salary ? formatCurrency(user.base_salary) : 'Không áp dụng'}</div>
              </div>
            )}

            {['SL', 'SA'].includes(user.position) && (
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Lương theo giờ:</div>
                <div>{user.hourly_wage ? formatCurrency(user.hourly_wage) : 'Không áp dụng'}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Đăng nhập cuối:</div>
              <div>{user.last_login ? formatLastLogin(user.last_login) : 'Chưa đăng nhập'}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">Ngày tạo:</div>
              <div>{formatLastLogin(user.created_at)}</div>
            </div>
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
