import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface RevenueChartProps {
    periodLabels: string[];
    revenueByPeriod: number[];
    expenseByPeriod: number[];
}

export function RevenueChart({ periodLabels, revenueByPeriod, expenseByPeriod }: RevenueChartProps) {
    // Chuẩn bị dữ liệu cho biểu đồ
    const chartData = periodLabels.map((label, index) => ({
        name: label,
        'Doanh thu': revenueByPeriod[index] || 0,
        'Chi phí': expenseByPeriod[index] || 0,
        'Lợi nhuận': (revenueByPeriod[index] || 0) - (expenseByPeriod[index] || 0),
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border-border rounded-md border p-2 text-sm shadow-sm">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <p>
                                {entry.name}: {formatCurrency(entry.value)}
                            </p>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Doanh thu và chi phí</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis
                                tickFormatter={(value) => {
                                    if (value >= 1000000) {
                                        return `${Math.floor(value / 1000000)}M`;
                                    } else if (value >= 1000) {
                                        return `${Math.floor(value / 1000)}K`;
                                    }
                                    return value.toString();
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar
                                dataKey="Doanh thu"
                                fill="var(--chart-1)"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="Chi phí"
                                fill="var(--chart-2)"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="Lợi nhuận"
                                fill="var(--chart-3)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
