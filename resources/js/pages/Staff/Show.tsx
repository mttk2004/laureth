import { Button } from '@/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRoleBadge } from '@/components/users';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatLastLogin, formatPhoneNumber } from '@/lib';
import { User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

interface Props {
    user: User;
    staff: User;
}

export default function StaffShow({ user, staff }: Props) {
    // Quay lại trang danh sách nhân viên
    const handleBack = () => {
        router.visit('/staff');
    };

    return (
        <AppLayout user={user}>
            <Head title={`Thông tin nhân viên: ${staff.full_name}`} />

            <div>
                <div className="mb-6">
                    <Button variant="ghost" onClick={handleBack} className="mb-4">
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Quay lại danh sách
                    </Button>
                    <h1 className="text-2xl font-bold">Thông tin nhân viên</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cá nhân</CardTitle>
                            <CardDescription>Thông tin chi tiết về nhân viên</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Họ và tên</h3>
                                    <p className="text-base">{staff.full_name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Vai trò</h3>
                                    <div className="mt-1">
                                        <UserRoleBadge position={staff.position} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                                    <p className="text-base">{staff.email}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Số điện thoại</h3>
                                    <p className="text-base">{formatPhoneNumber(staff.phone)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Đăng nhập gần nhất</h3>
                                    <p className="text-base">{staff.last_login ? formatLastLogin(staff.last_login) : 'Chưa đăng nhập'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Ngày tạo tài khoản</h3>
                                    <p className="text-base">{new Date(staff.created_at).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin lương</CardTitle>
                            <CardDescription>Chi tiết về lương và hoa hồng</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {staff.position === 'SL' || staff.position === 'SA' ? (
                                <>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Lương theo giờ</h3>
                                        <p className="text-base">{staff.hourly_wage ? formatCurrency(staff.hourly_wage) : 'Chưa thiết lập'}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Lương cơ bản</h3>
                                        <p className="text-base">{staff.base_salary ? formatCurrency(staff.base_salary) : 'Chưa thiết lập'}</p>
                                    </div>
                                </>
                            )}

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Tỷ lệ hoa hồng</h3>
                                <p className="text-base">
                                    {staff.commission_rate !== undefined && staff.commission_rate !== null
                                        ? `${(staff.commission_rate * 100).toFixed(1)}%`
                                        : 'Không có'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
