import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib';
import { Payroll, PayrollStatus } from '@/types/payroll';
import { User } from '@/types/user';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { FileText, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PageProps {
    user: User;
}

export default function PayrollHistory({ user }: PageProps) {
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get('/api/payroll/history')
            .then((response) => {
                setPayrolls(response.data);
                setError(null);
            })
            .catch((error) => {
                console.error('Không thể tải lịch sử lương:', error);
                setError('Không thể tải lịch sử lương. Vui lòng thử lại sau.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Hàm tải xuống bảng lương PDF
    const downloadPayrollPdf = (payrollId: number) => {
        window.open(`/payroll/pdf/${payrollId}`, '_blank');
    };

    // Định nghĩa các cột cho bảng dữ liệu
    const columns = [
        {
            key: 'period',
            label: 'Kỳ lương',
            render: (item: Payroll) => (
                <span>
                    Tháng {item.month}/{item.year}
                </span>
            ),
        },
        {
            key: 'base_amount',
            label: 'Lương cơ bản',
            render: (item: Payroll) => formatCurrency(item.base_amount),
        },
        {
            key: 'commission_amount',
            label: 'Hoa hồng',
            render: (item: Payroll) => formatCurrency(item.commission_amount),
        },
        {
            key: 'final_amount',
            label: 'Tổng cộng',
            render: (item: Payroll) => <span className="font-semibold">{formatCurrency(item.final_amount)}</span>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: Payroll) => (
                <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        item.status === PayrollStatus.PAID ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}
                >
                    {item.status === PayrollStatus.PAID ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </span>
            ),
        },
    ];

    // Định nghĩa thao tác cho từng dòng
    const renderActions = (item: Payroll) => (
        <Button variant="ghost" size="sm" onClick={() => downloadPayrollPdf(item.id)} className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>In PDF</span>
        </Button>
    );

    return (
        <AppLayout user={user}>
            <Head title="Lịch sử lương" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Lịch sử lương</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lịch sử nhận lương</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex h-40 items-center justify-center">
                                <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
                                <span>Đang tải dữ liệu...</span>
                            </div>
                        ) : error ? (
                            <div className="rounded-md bg-red-50 p-4 text-center text-red-800">{error}</div>
                        ) : payrolls.length === 0 ? (
                            <div className="rounded-md bg-blue-50 p-4 text-center text-blue-800">Chưa có dữ liệu lương nào được ghi nhận.</div>
                        ) : (
                            <DataTable columns={columns} data={payrolls} actions={renderActions} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
