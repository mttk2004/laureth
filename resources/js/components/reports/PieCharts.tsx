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

export function PieCharts({
    revenueByStore,
    revenueByPaymentMethod,
    revenueByCategory,
    expenseDistribution
}: PieChartsProps) {
    const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

    const renderPieChart = (data: PieChartDataItem[], title: string) => {
        // Giới hạn chỉ hiển thị top 5 phần tử, và gộp các phần tử còn lại vào "Khác"
        let chartData = [...data];
        if (chartData.length > 5) {
            const top5 = chartData.slice(0, 5);
            const otherSum = chartData.slice(5).reduce((sum, item) => sum + item.value, 0);
            chartData = [...top5, { name: 'Khác', value: otherSum }];
        }

        const CustomTooltip = ({ active, payload }: any) => {
            if (active && payload && payload.length) {
                return (
                    <div className="bg-card border-border rounded-md border p-2 text-sm shadow-sm">
                        <p className="font-medium">{payload[0].name}</p>
                        <p>{formatCurrency(payload[0].value)}</p>
                        <p className="text-muted-foreground text-xs">
                            {Math.round((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100)}%
                        </p>
                    </div>
                );
            }
            return null;
        };

        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
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
        <>
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderPieChart(revenueByStore, 'Doanh thu theo cửa hàng')}
                {renderPieChart(expenseDistribution, 'Chi phí theo loại')}
            </div>
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderPieChart(revenueByPaymentMethod, 'Doanh thu theo phương thức thanh toán')}
                {renderPieChart(revenueByCategory, 'Doanh thu theo danh mục')}
            </div>
        </>
    );
}
