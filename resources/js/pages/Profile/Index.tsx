import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserRoleBadge from '@/components/users/UserRoleBadge';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatLastLogin, formatPhoneNumber } from '@/lib';
import { User } from '@/types/user';
import { Head } from '@inertiajs/react';

interface PageProps {
    user: User;
}

export default function Profile({ user }: PageProps) {
    // Chuyển đổi tỷ lệ hoa hồng từ thập phân sang phần trăm
    const formattedCommissionRate = user.commission_rate ? `${user.commission_rate * 100}%` : 'Không áp dụng';

    return (
        <AppLayout user={user}>
            <Head title="Thông tin cá nhân" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Thông tin cá nhân</h1>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>Thông tin cá nhân của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                        <span className="text-xl font-medium text-blue-700">{user.full_name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">{user.full_name}</h2>
                                        <div className="flex items-center space-x-2">
                                            <UserRoleBadge role={user.position} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-muted-foreground">Email:</div>
                                        <div>{user.email}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-muted-foreground">Số điện thoại:</div>
                                        <div>{formatPhoneNumber(user.phone)}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-muted-foreground">Cửa hàng:</div>
                                        <div>{user.store?.name}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-muted-foreground">Đăng nhập cuối:</div>
                                        <div>{user.last_login ? formatLastLogin(user.last_login) : 'Chưa đăng nhập'}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin lương thưởng</CardTitle>
                            <CardDescription>Chi tiết về lương và hoa hồng của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-muted-foreground">Tỷ lệ hoa hồng:</div>
                                    <div>{formattedCommissionRate}</div>
                                </div>

                                {user.position === 'SM' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-muted-foreground">Lương cơ bản:</div>
                                        <div>{user.base_salary ? formatCurrency(user.base_salary) : 'Không áp dụng'}</div>
                                    </div>
                                )}

                                {['SL', 'SA'].includes(user.position) && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-muted-foreground">Lương theo giờ:</div>
                                        <div>{user.hourly_wage ? formatCurrency(user.hourly_wage) : 'Không áp dụng'}</div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 rounded-lg bg-blue-50 p-4">
                                <h3 className="font-medium text-blue-800">Thông tin lương</h3>
                                <p className="mt-2 text-sm text-blue-700">
                                    Lương của bạn được tính dựa trên vai trò và hiệu suất làm việc. Xem chi tiết lương và hoa hồng của bạn trong mục
                                    báo cáo lương.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Thông tin tài khoản</CardTitle>
                            <CardDescription>Chi tiết về tài khoản của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-muted-foreground">ID tài khoản:</div>
                                    <div>{user.id}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-muted-foreground">Ngày tạo tài khoản:</div>
                                    <div>{formatLastLogin(user.created_at)}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-muted-foreground">Cập nhật lần cuối:</div>
                                    <div>{formatLastLogin(user.updated_at)}</div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end">
                                <p className="text-sm text-gray-500">Liên hệ với quản lý để cập nhật thông tin cá nhân</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
