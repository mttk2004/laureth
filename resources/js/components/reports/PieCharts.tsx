import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

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

export function PieCharts({ revenueByStore, revenueByPaymentMethod, revenueByCategory, expenseDistribution }: PieChartsProps) {
    // Ghi log dữ liệu nhận được từ backend
    console.log('PieCharts - revenueByStore:', revenueByStore);
    console.log('PieCharts - revenueByPaymentMethod:', revenueByPaymentMethod);
    console.log('PieCharts - revenueByCategory:', revenueByCategory);
    console.log('PieCharts - expenseDistribution:', expenseDistribution);

    // Sử dụng mã màu HEX rõ ràng thay vì CSS vars để đảm bảo hiển thị đúng
    const COLORS = [
        '#4B7BEC', // Xanh dương
        '#26DE81', // Xanh lá
        '#FD9644', // Cam
        '#EB3B5A', // Đỏ
        '#A55EEA', // Tím
        '#FFC312', // Vàng
        '#2C3E50', // Xanh đen
        '#3498DB', // Xanh dương nhạt
        '#E74C3C', // Đỏ nhạt
        '#1ABC9C', // Ngọc
    ];

    const renderPieChart = (data: PieChartDataItem[], title: string) => {
        // console.log(`renderPieChart - ${title} data:`, data);

        // Kiểm tra nếu data là null, undefined hoặc mảng rỗng
        if (!data || !Array.isArray(data) || data.length === 0) {
            // console.log(`renderPieChart - ${title} dữ liệu không hợp lệ:`, data);
            return renderEmptyChart(title);
        }

        // Giới hạn chỉ hiển thị top 5 phần tử, và gộp các phần tử còn lại vào "Khác"
        let chartData = [...data];
        if (chartData.length > 5) {
            const top5 = chartData.slice(0, 5);
            const otherSum = chartData.slice(5).reduce((sum, item) => sum + item.value, 0);
            if (otherSum > 0) {
                chartData = [...top5, { name: 'Khác', value: otherSum }];
            } else {
                chartData = top5;
            }
        }

        // Thêm kiểm tra dữ liệu trống
        const hasData = chartData.some((item) => item.value > 0);
        // console.log(`renderPieChart - ${title} hasData:`, hasData);

        // Nếu không có dữ liệu, hiển thị thông báo
        if (!hasData) {
            // console.log(`renderPieChart - ${title} không có dữ liệu`);
            return renderEmptyChart(title);
        }

        // console.log(`renderPieChart - ${title} chartData final:`, chartData);

        const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
            if (active && payload && payload.length) {
                // Nếu là dữ liệu "Không có dữ liệu" thì không hiển thị tooltip
                if (payload[0].name === 'Không có dữ liệu') {
                    return null;
                }
                return (
                    <div className="rounded-md border border-gray-200 bg-white p-2 text-sm text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                        <p className="font-medium">{payload[0].name}</p>
                        <p>{formatCurrency(payload[0].value)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                            {hasData ? `${Math.round((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100)}%` : '0%'}
                        </p>
                    </div>
                );
            }
            return null;
        };

        // Hàm tùy chỉnh để render nhãn
        const renderCustomizedLabel = (props: {
            cx: number;
            cy: number;
            midAngle: number;
            innerRadius: number;
            outerRadius: number;
            percent: number;
            name: string;
        }) => {
            const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;

            // Nếu là nội dung "Không có dữ liệu", chỉ hiển thị text
            if (name === 'Không có dữ liệu') {
                return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#888" fontSize={14}>
                        {name}
                    </text>
                );
            }

            // Tính toán vị trí nhãn
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);

            // Chỉ hiển thị nhãn khi phần trăm đủ lớn
            if (percent < 0.05) return null;

            return (
                <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
                    {`${name}: ${(percent * 100).toFixed(0)}%`}
                </text>
            );
        };

        return (
            <Card className="w-full overflow-hidden">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={hasData ? 45 : 0}
                                    outerRadius={hasData ? 90 : 60}
                                    paddingAngle={hasData ? 2 : 0}
                                    dataKey="value"
                                    label={renderCustomizedLabel}
                                    labelLine={hasData}
                                    isAnimationActive={true}
                                    animationDuration={800}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={hasData ? COLORS[index % COLORS.length] : '#e5e7eb'}
                                            stroke={hasData ? '#fff' : 'transparent'}
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                {hasData && (
                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        height={36}
                                        formatter={(value) => <span style={{ color: '#666', fontSize: '12px' }}>{value}</span>}
                                    />
                                )}
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Hàm hiển thị biểu đồ trống khi không có dữ liệu
    const renderEmptyChart = (title: string) => {
        const emptyData = [{ name: 'Không có dữ liệu', value: 1 }];

        return (
            <Card className="w-full overflow-hidden">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[300px] w-full flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                <Pie
                                    data={emptyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={60}
                                    paddingAngle={0}
                                    dataKey="value"
                                    isAnimationActive={false}
                                >
                                    <Cell fill="#e5e7eb" stroke="transparent" />
                                </Pie>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize={14}>
                                    Không có dữ liệu
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {renderPieChart(revenueByStore || [], 'Doanh thu theo cửa hàng')}
            {renderPieChart(expenseDistribution || [], 'Chi phí theo loại')}
            {renderPieChart(revenueByPaymentMethod || [], 'Doanh thu theo phương thức thanh toán')}
            {renderPieChart(revenueByCategory || [], 'Doanh thu theo danh mục')}
        </div>
    );
}
