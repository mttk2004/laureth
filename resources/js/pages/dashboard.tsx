import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

import AppLayout from '@/layouts/app-layout';
import { User } from '@/types/user';

interface DashboardProps {
    user: User;
}

export default function Dashboard({ user }: DashboardProps) {
    useEffect(() => {
        // Thực hiện các hành động khi trang dashboard được tải, ví dụ: lấy dữ liệu ban đầu
        console.log('Dashboard loaded for user:', user);
    }, [user]);

    // Kiểm tra xem user có tồn tại hay không
    if (!user) {
        return <div>Đang tải thông tin người dùng...</div>;
    }

    return (
        <AppLayout user={user}>
            <Head title="Bảng điều khiển" />

            <div className="py-4">
                <div className="mx-auto">
                    <h1 className="mb-6 text-2xl font-bold">Chào mừng, {user.name}</h1>

                    {user.role === 'DM' && <DMDashboard />}
                    {user.role === 'SM' && <SMDashboard />}
                    {user.role === 'SL' && <SLDashboard />}
                    {user.role === 'SA' && <SADashboard />}
                </div>
            </div>
        </AppLayout>
    );
}

// Dashboard cho quản lý chuỗi (District Manager)
function DMDashboard() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard title="Tổng quan doanh số" description="Xem báo cáo doanh số của tất cả cửa hàng" />
            <DashboardCard title="Quản lý cửa hàng" description="Quản lý thông tin và hoạt động của cửa hàng" />
            <DashboardCard title="Quản lý nhân viên" description="Quản lý thông tin và quyền hạn của nhân viên" />
            <DashboardCard title="Quản lý kho" description="Quản lý kho tổng và phê duyệt chuyển kho" />
            <DashboardCard title="Danh mục & sản phẩm" description="Quản lý danh mục và sản phẩm" />
            <DashboardCard title="Báo cáo tổng hợp" description="Xem báo cáo tổng hợp của hệ thống" />
        </div>
    );
}

// Dashboard cho quản lý cửa hàng (Store Manager)
function SMDashboard() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard title="Doanh số cửa hàng" description="Xem báo cáo doanh số của cửa hàng" />
            <DashboardCard title="Quản lý nhân viên" description="Quản lý nhân viên trong cửa hàng" />
            <DashboardCard title="Quản lý kho" description="Quản lý kho của cửa hàng" />
            <DashboardCard title="Đơn hàng" description="Quản lý đơn hàng của cửa hàng" />
            <DashboardCard title="Ca làm việc" description="Quản lý ca làm việc của nhân viên" />
            <DashboardCard title="Báo cáo" description="Xem báo cáo của cửa hàng" />
        </div>
    );
}

// Dashboard cho trưởng ca (Shift Leader)
function SLDashboard() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard title="Bán hàng" description="Tạo đơn hàng mới" />
            <DashboardCard title="Doanh số ca" description="Xem doanh số trong ca hiện tại" />
            <DashboardCard title="Kiểm tra tồn kho" description="Xem và kiểm tra tồn kho cửa hàng" />
            <DashboardCard title="Chấm công" description="Quản lý chấm công nhân viên trong ca" />
            <DashboardCard title="Thông tin cá nhân" description="Xem thông tin cá nhân và lương/hoa hồng" />
        </div>
    );
}

// Dashboard cho nhân viên bán hàng (Sales Associate)
function SADashboard() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard title="Bán hàng" description="Tạo đơn hàng mới" />
            <DashboardCard title="Sản phẩm" description="Xem thông tin sản phẩm và tồn kho" />
            <DashboardCard title="Chấm công" description="Check-in và check-out ca làm việc" />
            <DashboardCard title="Lịch làm việc" description="Xem lịch làm việc cá nhân" />
            <DashboardCard title="Thông tin cá nhân" description="Xem thông tin cá nhân và lương/hoa hồng" />
        </div>
    );
}

// Component thẻ hiển thị cho dashboard
function DashboardCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
