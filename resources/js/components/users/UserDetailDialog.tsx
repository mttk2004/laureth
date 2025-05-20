import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatLastLogin, formatPhoneNumber } from '@/lib';
import { User, UserRole, roleLabels } from '@/types';
import { router } from '@inertiajs/react';
import { PencilIcon } from 'lucide-react';

interface UserDetailDialogProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserRole?: UserRole;
}

export default function UserDetailDialog({ user, open, onOpenChange, currentUserRole = 'DM' }: UserDetailDialogProps) {
    if (!user) return null;

    // Chuyển đổi tỷ lệ hoa hồng từ thập phân sang phần trăm
    const formattedCommissionRate = user.commission_rate ? `${user.commission_rate * 100}%` : 'Không áp dụng';

    // Chỉ DM mới có quyền chỉnh sửa người dùng
    const canEdit = currentUserRole === 'DM';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Chi tiết nhân viên</DialogTitle>
                    <DialogDescription className="mt-2 text-sm text-gray-600">Thông tin chi tiết về nhân viên</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                            <div className="bg-muted mr-4 flex h-14 w-14 items-center justify-center rounded-full">
                                <span className="text-lg font-medium">{user.full_name.charAt(0)}</span>
                            </div>
                            <div>
                                <div className="text-lg font-medium">{user.full_name}</div>
                                <div className="text-muted-foreground text-sm">{user.email}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">Vai trò:</div>
                            <div>{roleLabels[user.position]}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">Điện thoại:</div>
                            <div>{formatPhoneNumber(user.phone)}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">Cửa hàng:</div>
                            <div>{user.store?.name || 'Chưa phân công'}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">Hoa hồng:</div>
                            <div>{formattedCommissionRate}</div>
                        </div>

                        {user.position === 'SM' && (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">Lương cơ bản:</div>
                                <div>{user.base_salary ? formatCurrency(user.base_salary) : 'Không áp dụng'}</div>
                            </div>
                        )}

                        {['SL', 'SA'].includes(user.position) && (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">Lương theo giờ:</div>
                                <div>{user.hourly_wage ? formatCurrency(user.hourly_wage) : 'Không áp dụng'}</div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">Đăng nhập cuối:</div>
                            <div>{user.last_login ? formatLastLogin(user.last_login) : 'Chưa đăng nhập'}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">Ngày tạo:</div>
                            <div>{formatLastLogin(user.created_at)}</div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex space-x-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    {canEdit && (
                        <Button
                            onClick={() => {
                                if (user) {
                                    router.visit(`/users/${user.id}/edit`);
                                }
                            }}
                        >
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
