import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { UserRole, roleLabels } from '@/types/user';
import { BarChart, DollarSign, Presentation, ShoppingCart } from 'lucide-react';

interface EmployeePerformance {
    id: string;
    full_name: string;
    position: UserRole;
    orders_count: number;
    total_sales: number;
    avg_order_value?: number;
    total_hours?: number;
}

interface EmployeePerformanceCardProps {
    topEmployeesBySales: EmployeePerformance[];
    topEmployeesByCount: EmployeePerformance[];
    topEmployeesByAvgOrder: EmployeePerformance[];
    employeePerformance: EmployeePerformance[];
}

export function EmployeePerformanceCard({
    topEmployeesBySales,
    topEmployeesByCount,
    topEmployeesByAvgOrder,
    employeePerformance,
}: EmployeePerformanceCardProps) {
    // Hàm chuyển đổi vai trò sang tiếng Việt sử dụng roleLabels từ types/user
    const translatePosition = (position: UserRole) => {
        return roleLabels[position] || position;
    };

    // Tạo chữ cái viết tắt từ tên nhân viên
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Kiểm tra xem dữ liệu có sẵn không
    const hasSalesData = Array.isArray(topEmployeesBySales) && topEmployeesBySales.length > 0;
    const hasCountData = Array.isArray(topEmployeesByCount) && topEmployeesByCount.length > 0;
    const hasAvgOrderData = Array.isArray(topEmployeesByAvgOrder) && topEmployeesByAvgOrder.length > 0;
    const hasPerformanceData = Array.isArray(employeePerformance) && employeePerformance.length > 0;

    // Component hiển thị khi không có dữ liệu
    const EmptySection = ({ title }: { title: string }) => (
        <div>
            <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium">{title}</h3>
            <div className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-sm">Không có dữ liệu</div>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nhân viên năng suất</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Nhân viên có doanh số cao nhất */}
                    {!hasSalesData ? (
                        <EmptySection title="Doanh số cao nhất" />
                    ) : (
                        <div>
                            <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium">
                                <BarChart className="h-4 w-4" />
                                Doanh số cao nhất
                            </h3>
                            <ul className="space-y-3">
                                {topEmployeesBySales.slice(0, 3).map((employee) => (
                                    <li key={employee.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{getInitials(employee.full_name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{employee.full_name}</p>
                                                <p className="text-muted-foreground text-xs">{translatePosition(employee.position)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">{formatCurrency(employee.total_sales)}</p>
                                            <p className="text-muted-foreground text-xs">{employee.orders_count} đơn hàng</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Nhân viên có số đơn cao nhất */}
                    {!hasCountData ? (
                        <EmptySection title="Số đơn cao nhất" />
                    ) : (
                        <div>
                            <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium">
                                <ShoppingCart className="h-4 w-4" />
                                Số đơn cao nhất
                            </h3>
                            <ul className="space-y-3">
                                {topEmployeesByCount.slice(0, 3).map((employee) => (
                                    <li key={employee.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{getInitials(employee.full_name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{employee.full_name}</p>
                                                <p className="text-muted-foreground text-xs">{translatePosition(employee.position)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">{employee.orders_count} đơn hàng</p>
                                            <p className="text-muted-foreground text-xs">
                                                TB: {formatCurrency(employee.total_sales / (employee.orders_count || 1))}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Nhân viên có giá trị đơn hàng trung bình cao nhất */}
                    {!hasAvgOrderData ? (
                        <EmptySection title="Giá trị đơn trung bình cao" />
                    ) : (
                        <div>
                            <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium">
                                <DollarSign className="h-4 w-4" />
                                Giá trị đơn trung bình cao
                            </h3>
                            <ul className="space-y-3">
                                {topEmployeesByAvgOrder.slice(0, 3).map((employee) => (
                                    <li key={employee.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{getInitials(employee.full_name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{employee.full_name}</p>
                                                <p className="text-muted-foreground text-xs">{translatePosition(employee.position)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">{formatCurrency(employee.avg_order_value || 0)}</p>
                                            <p className="text-muted-foreground text-xs">{employee.orders_count} đơn hàng</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Nhân viên có hiệu suất cao nhất */}
                    {!hasPerformanceData ? (
                        <EmptySection title="Hiệu suất cao nhất" />
                    ) : (
                        <div>
                            <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-medium">
                                <Presentation className="h-4 w-4" />
                                Hiệu suất cao nhất
                            </h3>
                            <ul className="space-y-3">
                                {employeePerformance.slice(0, 3).map((employee) => (
                                    <li key={employee.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{getInitials(employee.full_name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{employee.full_name}</p>
                                                <p className="text-muted-foreground text-xs">{translatePosition(employee.position)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">
                                                {formatCurrency(employee.total_sales / (employee.total_hours || 1))}/giờ
                                            </p>
                                            <p className="text-muted-foreground text-xs">{employee.total_hours || 0} giờ làm việc</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
