import { OrderStatusBadge, PaymentMethodBadge } from '@/components/orders';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Order, OrderItem, OrderStatus } from '@/types/order';
import { User } from '@/types/user';
import axios from 'axios';
import { AlertCircle, Loader2Icon, PrinterIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrderWithDetails extends Order {
    user?: User;
    store?: {
        id: string;
        name: string;
    };
    items?: OrderItem[];
}

interface OrderItemWithProduct extends OrderItem {
    product?: {
        id: string;
        name: string;
    };
}

interface OrderDetailDialogProps {
    orderId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusUpdate?: () => void;
    currentUser: User;
}

export default function OrderDetailDialog({ orderId, open, onOpenChange, onStatusUpdate, currentUser }: OrderDetailDialogProps) {
    const [order, setOrder] = useState<OrderWithDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [orderItems, setOrderItems] = useState<OrderItemWithProduct[]>([]);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
    const { addToast } = useToast();
    const [error, setError] = useState<string | null>(null);

    // Kiểm tra xem người dùng hiện tại có phải là người tạo đơn hàng không
    const isOrderCreator = order?.user_id === currentUser.id;

    useEffect(() => {
        if (open && orderId) {
            setLoading(true);
            setError(null);
            axios
                .get(`/api/orders/${orderId}/details`)
                .then((response) => {
                    // Đảm bảo dữ liệu hiển thị chính xác
                    const orderData = response.data;

                    // Kiểm tra và tính lại final_amount nếu cần
                    const calculatedFinalAmount = orderData.total_amount - orderData.discount_amount;
                    if (Math.abs(orderData.final_amount - calculatedFinalAmount) > 0.01) {
                        console.warn('Phát hiện sai lệch trong final_amount, đang điều chỉnh để hiển thị chính xác');
                        orderData.final_amount = calculatedFinalAmount;
                    }

                    setOrder(orderData);
                    setSelectedStatus(orderData.status);

                    // Lấy chi tiết các sản phẩm trong đơn hàng
                    return axios.get(`/api/orders/${orderId}/items`);
                })
                .then((itemsResponse) => {
                    setOrderItems(itemsResponse.data);
                })
                .catch((error) => {
                    console.error('Không thể tải thông tin đơn hàng:', error);
                    addToast('Không thể tải thông tin đơn hàng', 'error');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setOrder(null);
            setOrderItems([]);
            setSelectedStatus(null);
            setError(null);
        }
    }, [open, orderId, addToast]);

    const handleUpdateStatus = () => {
        if (!order || !selectedStatus || selectedStatus === order.status) return;

        setUpdatingStatus(true);
        setError(null);
        axios
            .patch(`/api/orders/${order.id}/update-status`, { status: selectedStatus })
            .then(() => {
                addToast('Cập nhật trạng thái đơn hàng thành công', 'success');
                setOrder((prev) => (prev ? { ...prev, status: selectedStatus } : null));
                if (onStatusUpdate) onStatusUpdate();
            })
            .catch((error) => {
                console.error('Không thể cập nhật trạng thái đơn hàng:', error);
                if (error.response && error.response.status === 403) {
                    setError(error.response.data.message || 'Bạn không có quyền cập nhật đơn hàng này');
                } else {
                    addToast('Không thể cập nhật trạng thái đơn hàng', 'error');
                }
            })
            .finally(() => {
                setUpdatingStatus(false);
            });
    };

    const handlePrint = () => {
        if (!order) return;

        // Sử dụng URL để tải xuống PDF
        const downloadUrl = `/orders/${order.id}/download`;

        // Mở URL trong tab mới (trình duyệt sẽ tự động tải xuống)
        window.open(downloadUrl, '_blank');
    };

    // Lưu ý: Chúng ta tính toán final_amount trực tiếp khi hiển thị

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg md:max-w-2xl">
                    <div className="flex h-40 items-center justify-center">
                        <Loader2Icon className="text-primary h-8 w-8 animate-spin" />
                        <span className="ml-2">Đang tải thông tin đơn hàng...</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!order) return null;

    // Không cần biến displayFinalAmount vì chúng ta tính trực tiếp khi hiển thị

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                    <DialogDescription>
                        Mã đơn hàng: {order.id} | Ngày tạo: {formatDate(order.created_at)}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2">
                    {/* Cột trái - Thông tin đơn hàng */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-muted-foreground mb-2 text-sm font-medium">Thông tin đơn hàng</h3>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="font-medium">Ngày đặt:</div>
                                <div className="col-span-2">{formatDate(order.order_date)}</div>

                                <div className="font-medium">Trạng thái:</div>
                                <div className="col-span-2">
                                    <OrderStatusBadge status={order.status} />
                                </div>

                                <div className="font-medium">Thanh toán:</div>
                                <div className="col-span-2">
                                    <PaymentMethodBadge paymentMethod={order.payment_method} />
                                </div>

                                <div className="font-medium">Tổng tiền:</div>
                                <div className="col-span-2">{formatCurrency(order.total_amount)}</div>

                                <div className="font-medium">Giảm giá:</div>
                                <div className="col-span-2">{formatCurrency(order.discount_amount)}</div>

                                <div className="font-medium">Thanh toán:</div>
                                <div className="col-span-2 font-semibold">{formatCurrency(order.total_amount - order.discount_amount)}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-muted-foreground mb-2 text-sm font-medium">Thông tin khác</h3>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="font-medium">Cửa hàng:</div>
                                <div className="col-span-2">{order.store?.name || 'N/A'}</div>

                                <div className="font-medium">Nhân viên:</div>
                                <div className="col-span-2">{order.user?.full_name || 'N/A'}</div>
                            </div>
                        </div>

                        {order.status === 'pending' && isOrderCreator && (
                            <div>
                                <h3 className="text-muted-foreground mb-2 text-sm font-medium">Cập nhật trạng thái</h3>
                                <div className="flex items-center space-x-2">
                                    <Select value={selectedStatus || undefined} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={OrderStatus.PENDING}>Đang xử lý</SelectItem>
                                            <SelectItem value={OrderStatus.COMPLETED}>Hoàn thành</SelectItem>
                                            <SelectItem value={OrderStatus.CANCELED}>Đã hủy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleUpdateStatus} disabled={updatingStatus || selectedStatus === order.status} size="sm">
                                        {updatingStatus && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                                        Cập nhật
                                    </Button>
                                </div>
                            </div>
                        )}

                        {order.status === 'pending' && !isOrderCreator && (
                            <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Chỉ nhân viên tạo đơn ({order.user?.full_name}) mới có thể cập nhật trạng thái đơn hàng này.
                                </AlertDescription>
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Cột phải - Chi tiết sản phẩm */}
                    <div>
                        <h3 className="text-muted-foreground mb-2 text-sm font-medium">Chi tiết sản phẩm</h3>
                        <div className="max-h-[300px] overflow-y-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium whitespace-nowrap">Sản phẩm</th>
                                        <th className="px-4 py-2 text-right font-medium whitespace-nowrap">SL</th>
                                        <th className="px-4 py-2 text-right font-medium whitespace-nowrap">Đơn giá</th>
                                        <th className="px-4 py-2 text-right font-medium whitespace-nowrap">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orderItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2">{item.product?.name || `Sản phẩm #${item.product_id}`}</td>
                                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                                            <td className="px-4 py-2 text-right">{formatCurrency(item.total_price)}</td>
                                        </tr>
                                    ))}
                                    {orderItems.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-muted-foreground px-4 py-2 text-center">
                                                Không có dữ liệu sản phẩm
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    {order.status === 'completed' && (
                        <Button onClick={handlePrint}>
                            <PrinterIcon className="mr-2 h-4 w-4" />
                            In PDF
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
