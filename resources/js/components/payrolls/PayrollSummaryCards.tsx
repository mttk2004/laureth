import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Payroll, PayrollStatus, PayrollSummary } from '@/types/payroll';
import { Calendar, CheckCircle, CircleDashed } from 'lucide-react';

interface PayrollSummaryCardsProps {
    summary: PayrollSummary;
    payrolls: Payroll[];
    selectedPeriod: string;
    onPeriodChange: (value: string) => void;
}

export function PayrollSummaryCards({ summary, payrolls, selectedPeriod, onPeriodChange }: PayrollSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng lương chờ duyệt</CardTitle>
                    <CircleDashed className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summary.totalPendingAmount)}</div>
                    <p className="text-muted-foreground text-xs">{payrolls.filter((p) => p.status === PayrollStatus.PENDING).length} phiếu lương</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng lương đã thanh toán</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summary.totalPaidAmount)}</div>
                    <p className="text-muted-foreground text-xs">{payrolls.filter((p) => p.status === PayrollStatus.PAID).length} phiếu lương</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Chọn kỳ lương</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn kỳ lương" />
                        </SelectTrigger>
                        <SelectContent>
                            {summary.periods.map((period) => (
                                <SelectItem key={`${period.month}_${period.year}`} value={`${period.month}_${period.year}`}>
                                    Tháng {period.month}/{period.year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
        </div>
    );
}
