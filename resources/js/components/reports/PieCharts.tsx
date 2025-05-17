import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface PieChartDataItem {
    name: string;
    value: number;
}

interface PieChartsProps {
    revenueByStore: PieChartDataItem[];
    revenueByPaymentMethod: PieChartDataItem[];
    revenueByCategory: PieChartDataItem[];
    expenseDistribution: PieChartDataItem[];
}

// Định nghĩa kiểu cho tooltip
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: PieChartDataItem;
    }>;
}

export function PieCharts({
    revenueByStore,
    revenueByPaymentMethod,
    revenueByCategory,
    expenseDistribution
}: PieChartsProps) {
    // Màu sắc sử dụng RGB để đảm bảo hiển thị đúng
    const COLORS = [
        'rgba(59, 130, 246, 0.8)',   // Xanh dương
        'rgba(16, 185, 129, 0.8)',   // Xanh lá
        'rgba(239, 68, 68, 0.8)',    // Đỏ
        'rgba(245, 158, 11, 0.8)',   // Cam
        'rgba(139, 92, 246, 0.8)'    // Tím
    ];

    const renderPieChart = (data: PieChartDataItem[], title: string) => {
        // Giới hạn chỉ hiển thị top 5 phần tử, và gộp các phần tử còn lại vào "Khác"
        let chartData = [...data];
        if (chartData.length > 5) {
            const top5 = chartData.slice(0, 5);
            const otherSum = chartData.slice(5).reduce((sum, item) => sum + item.value, 0);
            chartData = [...top5, { name: 'Khác', value: otherSum }];
        }

        // Thêm kiểm tra dữ liệu trống
        const hasData = chartData.some(item => item.value > 0);

        // Nếu không có dữ liệu, hiển thị thông báo
        if (!hasData) {
            chartData = [{ name: 'Không có dữ liệu', value: 1 }];
        }

        const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
            if (active && payload && payload.length) {
                return (
                    <div className="bg-card border-border rounded-md border p-2 text-sm shadow-sm">
                        <p className="font-medium">{payload[0].name}</p>
                        <p>{formatCurrency(payload[0].value)}</p>
                        <p className="text-muted-foreground text-xs">
                            {hasData
                                ? `${Math.round((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100)}%`
                                : '0%'}
                        </p>
                    </div>
                );
            }
            return null;
        };

        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                        hasData ? `${name} ${(percent * 100).toFixed(0)}%` : name
                                    }
                                    labelLine={false}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={hasData ? COLORS[index % COLORS.length] : '#ccc'}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {renderPieChart(revenueByStore, 'Doanh thu theo cửa hàng')}
            {renderPieChart(expenseDistribution, 'Chi phí theo loại')}
            {renderPieChart(revenueByPaymentMethod, 'Doanh thu theo phương thức thanh toán')}
            {renderPieChart(revenueByCategory, 'Doanh thu theo danh mục')}
        </div>
    );
}
