import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface StorePerformance {
    id: string;
    name: string;
    actualRevenue: number;
    revenueTarget: number;
    percentageComplete: number;
    manager: string;
}

interface StorePerformanceTableProps {
    stores: StorePerformance[];
}

export function StorePerformanceTable({ stores }: StorePerformanceTableProps) {
    const hasStores = stores && stores.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Hiệu suất cửa hàng</CardTitle>
            </CardHeader>
            <CardContent>
                {hasStores ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cửa hàng</TableHead>
                                    <TableHead>Quản lý</TableHead>
                                    <TableHead className="hidden md:table-cell">Doanh thu</TableHead>
                                    <TableHead className="hidden md:table-cell">Chỉ tiêu</TableHead>
                                    <TableHead>Tiến độ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stores.map((store) => (
                                    <TableRow key={store.id}>
                                        <TableCell className="font-medium">{store.name}</TableCell>
                                        <TableCell>{store.manager}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {formatCurrency(store.actualRevenue)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {formatCurrency(store.revenueTarget)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium">
                                                        {store.percentageComplete.toFixed(0)}%
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {formatCurrency(store.actualRevenue)} / {formatCurrency(store.revenueTarget)}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={store.percentageComplete > 100 ? 100 : store.percentageComplete}
                                                    className="h-2 w-full"
                                                    indicatorColor={getIndicatorColor(store.percentageComplete)}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        Không có dữ liệu cửa hàng
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function getIndicatorColor(percentage: number): string {
    if (percentage >= 100) return 'bg-emerald-500';
    if (percentage >= 75) return 'bg-lime-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
}
