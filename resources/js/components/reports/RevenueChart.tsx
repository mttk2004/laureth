import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface RevenueChartProps {
    periodLabels: string[];
    revenueByPeriod: number[];
    expenseByPeriod: number[];
}

// Định nghĩa kiểu cho tooltip
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    label?: string;
}

export function RevenueChart({ periodLabels, revenueByPeriod, expenseByPeriod }: RevenueChartProps) {
    // Chuẩn bị dữ liệu cho biểu đồ
    const chartData = periodLabels.map((label, index) => ({
        name: label,
        'Doanh thu': revenueByPeriod[index] || 0,
        'Chi phí': expenseByPeriod[index] || 0,
        'Lợi nhuận': (revenueByPeriod[index] || 0) - (expenseByPeriod[index] || 0),
    }));

    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border-border rounded-md border p-2 text-sm shadow-sm">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
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
        <Card>
            <CardHeader>
                <CardTitle>Doanh thu và chi phí</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
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
                            <Bar dataKey="Doanh thu" fill="rgba(59, 130, 246, 0.8)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Chi phí" fill="rgba(239, 68, 68, 0.8)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Lợi nhuận" fill="rgba(16, 185, 129, 0.8)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
