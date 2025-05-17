import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatPhoneNumber } from '@/lib';
import { Product, PurchaseOrder, PurchaseOrderItem, Supplier, User, Warehouse } from '@/types';
import axios from 'axios';
import { PrinterIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PurchaseOrderItemWithProduct extends PurchaseOrderItem {
    product?: Product;
}

interface PurchaseOrderWithRelations extends PurchaseOrder {
    supplier?: Supplier;
    warehouse?: Warehouse;
    user?: User;
    items?: PurchaseOrderItemWithProduct[];
}

interface PurchaseOrderDetailDialogProps {
    purchaseOrder: PurchaseOrderWithRelations | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PurchaseOrderDetailDialog({ purchaseOrder, open, onOpenChange }: PurchaseOrderDetailDialogProps) {
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState<PurchaseOrderWithRelations | null>(null);

    useEffect(() => {
        if (open && purchaseOrder) {
            setLoading(true);
            // Lấy thông tin đầy đủ của đơn nhập hàng từ API
            axios
                .get(`/api/purchase-orders/${purchaseOrder.id}/details`)
                .then((response) => {
                    setOrderDetails(response.data);
                })
                .catch((error) => {
                    console.error('Không thể tải thông tin chi tiết đơn hàng:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setOrderDetails(null);
        }
    }, [open, purchaseOrder]);

    const handlePrint = () => {
        if (!purchaseOrder) return;

        // Sử dụng URL để tải xuống PDF
        const downloadUrl = `/purchase-orders/${purchaseOrder.id}/download`;

        // Mở URL trong tab mới (trình duyệt sẽ tự động tải xuống)
        window.open(downloadUrl, '_blank');
    };

    // Sử dụng dữ liệu từ orderDetails nếu có, nếu không sử dụng purchaseOrder ban đầu
    const displayOrder = orderDetails || purchaseOrder;

    if (!displayOrder) return null;

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
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Chi tiết đơn nhập hàng</DialogTitle>
                    <DialogDescription className="mt-2 text-sm text-gray-600">
                        Đơn nhập hàng #{displayOrder.id.toString().slice(-6)} - Ngày {formatDate(displayOrder.order_date)}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-10 text-center">
                        <div className="text-muted-foreground">Đang tải dữ liệu...</div>
                    </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="mb-4 grid grid-cols-2">
                            <TabsTrigger value="info">Thông tin đơn hàng</TabsTrigger>
                            <TabsTrigger value="items">Chi tiết sản phẩm</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="max-h-[60vh] space-y-4 overflow-auto">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-md">Thông tin cơ bản</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 text-sm">
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="mb-2 text-xl font-medium">Đơn nhập hàng #{displayOrder.id.toString().slice(-6)}</div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="font-semibold">Ngày đặt hàng:</div>
                                            <div>{formatDate(displayOrder.order_date)}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="font-semibold">Tổng giá trị:</div>
                                            <div className="font-medium text-green-600">{formatCurrency(displayOrder.total_amount)}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="font-semibold">Ngày tạo:</div>
                                            <div>{formatDate(displayOrder.created_at)}</div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="mb-2 font-medium">Thông tin nhà cung cấp</h3>
                                        {displayOrder.supplier ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="font-semibold">Tên nhà cung cấp:</div>
                                                <div>{displayOrder.supplier.name}</div>

                                                <div className="font-semibold">Số điện thoại:</div>
                                                <div>{formatPhoneNumber(displayOrder.supplier.phone)}</div>

                                                <div className="font-semibold">Email:</div>
                                                <div>{displayOrder.supplier.email}</div>
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground italic">Không có thông tin nhà cung cấp</div>
                                        )}
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="mb-2 font-medium">Thông tin kho</h3>
                                        {displayOrder.warehouse ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="font-semibold">Tên kho:</div>
                                                <div>{displayOrder.warehouse.name}</div>

                                                <div className="font-semibold">Địa chỉ:</div>
                                                <div>{displayOrder.warehouse.address}</div>

                                                <div className="font-semibold">Kho chính:</div>
                                                <div>{displayOrder.warehouse.is_main ? 'Có' : 'Không'}</div>
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground italic">Không có thông tin kho</div>
                                        )}
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="mb-2 font-medium">Thông tin người tạo</h3>
                                        {displayOrder.user ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="font-semibold">Họ tên:</div>
                                                <div>{displayOrder.user.full_name}</div>

                                                <div className="font-semibold">Email:</div>
                                                <div>{displayOrder.user.email}</div>

                                                <div className="font-semibold">Số điện thoại:</div>
                                                <div>{formatPhoneNumber(displayOrder.user.phone)}</div>
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground italic">Không có thông tin người tạo</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="items" className="max-h-[60vh] space-y-4 overflow-auto">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-md">Danh sách sản phẩm</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {orderDetails && orderDetails.items && orderDetails.items.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="bg-muted grid grid-cols-12 gap-2 rounded-md border px-3 py-2 text-xs font-medium">
                                                <div className="col-span-5">Sản phẩm</div>
                                                <div className="col-span-2 text-center">Số lượng</div>
                                                <div className="col-span-2 text-right">Giá mua</div>
                                                <div className="col-span-3 text-right">Thành tiền</div>
                                            </div>
                                            {orderDetails.items.map((item) => (
                                                <div key={item.id} className="grid grid-cols-12 gap-2 rounded-md border p-3 text-sm">
                                                    <div className="col-span-5">
                                                        <div className="font-medium">{item.product?.name || `Sản phẩm #${item.product_id}`}</div>
                                                        <div className="text-muted-foreground text-xs">
                                                            Giá bán: {formatCurrency(item.selling_price)}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <Badge className="bg-blue-500">{item.quantity}</Badge>
                                                    </div>
                                                    <div className="col-span-2 text-right">{formatCurrency(item.purchase_price)}</div>
                                                    <div className="col-span-3 text-right font-medium">
                                                        {formatCurrency(item.purchase_price * item.quantity)}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-end border-t pt-4">
                                                <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                                                    <div className="text-right font-medium">Tổng số lượng:</div>
                                                    <div className="text-right font-medium">
                                                        {orderDetails.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                                                    </div>
                                                    <div className="text-right font-semibold">Tổng giá trị:</div>
                                                    <div className="text-right font-semibold text-green-600">
                                                        {formatCurrency(displayOrder.total_amount)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground py-4 text-center italic">Không có sản phẩm nào trong đơn hàng</div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}

                <DialogFooter className="flex space-x-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    <Button onClick={handlePrint}>
                        <PrinterIcon className="mr-2 h-4 w-4" />
                        In PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
