import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpDown, ArrowUpIcon, Calendar, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
    totalRevenue: number;
    totalExpenses: number;
    totalStores: number;
    selectedYear: number;
    selectedPeriod: string;
    onPeriodChange: (period: string) => void;
    onYearChange: (year: number) => void;
    years: number[];
}

export function SummaryCards({ totalRevenue, totalExpenses, selectedYear, selectedPeriod, onPeriodChange, onYearChange, years }: SummaryCardsProps) {
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <ArrowUpIcon className="h-3 w-3 text-emerald-500" />
                        <span>Tăng 12% so với kỳ trước</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng chi phí</CardTitle>
                    <ArrowUpDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        <span>Tăng 5% so với kỳ trước</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lợi nhuận</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(profit)}</div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <TrendingDown className="h-3 w-3 text-amber-500" />
                        <span>Biên lợi nhuận: {profitMargin.toFixed(1)}%</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Thời gian</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <select
                            className="border-border w-full rounded-md border p-2 text-sm"
                            value={selectedPeriod}
                            onChange={(e) => onPeriodChange(e.target.value)}
                        >
                            <option value="month">Theo tháng</option>
                            <option value="quarter">Theo quý</option>
                            <option value="year">Theo năm</option>
                        </select>
                        <select
                            className="border-border w-full rounded-md border p-2 text-sm"
                            value={selectedYear}
                            onChange={(e) => onYearChange(Number(e.target.value))}
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    Năm {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
