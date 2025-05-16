import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatPhoneNumber } from '@/lib';
import { PurchaseOrder, PurchaseOrderStatus, Supplier } from '@/types';
import { router } from '@inertiajs/react';
import { PencilIcon } from 'lucide-react';
import { useState } from 'react';

interface SupplierWithPurchaseOrders extends Supplier {
    purchase_orders?: PurchaseOrder[];
}

interface SupplierDetailDialogProps {
    supplier: SupplierWithPurchaseOrders | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SupplierDetailDialog({ supplier, open, onOpenChange }: SupplierDetailDialogProps) {
    const [activeTab, setActiveTab] = useState('info');

    if (!supplier) return null;

    // Hiển thị badge theo trạng thái đơn hàng
    const getStatusBadge = (status: PurchaseOrderStatus) => {
        switch (status) {
            case PurchaseOrderStatus.PENDING:
                return <Badge className="bg-yellow-500">Chờ xử lý</Badge>;
            case PurchaseOrderStatus.RECEIVED:
                return <Badge className="bg-green-500">Đã nhận</Badge>;
            case PurchaseOrderStatus.CANCELLED:
                return <Badge className="bg-red-500">Đã hủy</Badge>;
            default:
                return <Badge className="bg-gray-500">Không xác định</Badge>;
        }
    };

    // Format ngày hiển thị
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Chi tiết nhà cung cấp</DialogTitle>
                    <DialogDescription className="mt-2 text-sm text-gray-600">
                        Thông tin chi tiết và lịch sử giao dịch với nhà cung cấp
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4 grid grid-cols-2">
                        <TabsTrigger value="info">Thông tin</TabsTrigger>
                        <TabsTrigger value="orders">Lịch sử đơn hàng</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="max-h-[50vh] space-y-4 overflow-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-md">Thông tin cơ bản</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="mb-2 text-xl font-medium">{supplier.name}</div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="font-semibold">ID:</div>
                                        <div>{supplier.id}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="font-semibold">Số điện thoại:</div>
                                        <div>{formatPhoneNumber(supplier.phone)}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="font-semibold">Email:</div>
                                        <div>{supplier.email}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="orders" className="max-h-72 space-y-4 overflow-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-md">Lịch sử đơn nhập hàng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {supplier.purchase_orders && supplier.purchase_orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {supplier.purchase_orders.map((order) => (
                                            <div key={order.id} className="rounded-md border p-3 text-sm">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="font-medium">Đơn hàng #{order.id}</div>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <div className="grid grid-cols-2 gap-1">
                                                    <div className="text-muted-foreground">Ngày đặt:</div>
                                                    <div>{formatDate(order.order_date)}</div>

                                                    <div className="text-muted-foreground">Tổng giá trị:</div>
                                                    <div>{formatCurrency(order.total_amount)}</div>

                                                    <div className="text-muted-foreground">Ngày tạo:</div>
                                                    <div>{formatDate(order.created_at)}</div>
                                                </div>
                                                <div className="mt-2">
                                                    <Button variant="outline" size="sm" onClick={() => router.visit(`/purchase-orders/${order.id}`)}>
                                                        Xem chi tiết
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground py-4 text-center italic">Không có lịch sử đơn nhập hàng</div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex space-x-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    <Button
                        onClick={() => {
                            if (supplier) {
                                router.visit(`/suppliers/${supplier.id}/edit`);
                            }
                        }}
                    >
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
