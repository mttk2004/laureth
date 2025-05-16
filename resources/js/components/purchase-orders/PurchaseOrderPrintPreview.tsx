import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPhoneNumber } from '@/lib';
import { PurchaseOrder, PurchaseOrderItem, Product, Supplier, User, Warehouse } from '@/types';
import axios from 'axios';

interface PurchaseOrderItemWithProduct extends PurchaseOrderItem {
    product?: Product;
}

interface PurchaseOrderWithRelations extends PurchaseOrder {
    supplier?: Supplier;
    warehouse?: Warehouse;
    user?: User;
    items?: PurchaseOrderItemWithProduct[];
}

interface PurchaseOrderPrintPreviewProps {
    purchaseOrder: PurchaseOrderWithRelations | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PurchaseOrderPrintPreview({ purchaseOrder, open, onOpenChange }: PurchaseOrderPrintPreviewProps) {
    const [orderItems, setOrderItems] = useState<PurchaseOrderItemWithProduct[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && purchaseOrder) {
            setLoading(true);
            axios.get(`/api/purchase-orders/${purchaseOrder.id}/items`)
                .then(response => {
                    setOrderItems(response.data);
                })
                .catch(error => {
                    console.error('Không thể tải dữ liệu chi tiết đơn hàng:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [open, purchaseOrder]);

    // Hàm tải xuống PDF từ backend
    const handlePrint = () => {
        if (!purchaseOrder) return;

        // Sử dụng URL để tải xuống PDF
        const downloadUrl = `/purchase-orders/${purchaseOrder.id}/download`;

        // Mở URL trong tab mới (trình duyệt sẽ tự động tải xuống)
        window.open(downloadUrl, '_blank');

        // Đóng dialog sau khi đã bắt đầu tải xuống
        onOpenChange(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
    };

    if (!purchaseOrder) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-lg">Xem trước đơn nhập hàng</DialogTitle>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-y-auto p-4">
                    <div className="space-y-4 bg-white p-6">
                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between border-b pb-4">
                            <div>
                                <h1 className="text-xl font-bold">LAURETH</h1>
                                <p className="text-sm text-gray-500">Phụ kiện thời trang Laureth</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-lg font-semibold">ĐƠN NHẬP HÀNG</h2>
                                <p className="text-sm font-medium">#{purchaseOrder.id.toString().slice(-6)}</p>
                                <p className="text-sm text-gray-500">Ngày: {formatDate(purchaseOrder.order_date)}</p>
                            </div>
                        </div>

                        {/* Thông tin nhà cung cấp và kho */}
                        <div className="mb-6 grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="mb-2 text-sm font-semibold uppercase">Thông tin nhà cung cấp</h3>
                                {purchaseOrder.supplier ? (
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium">{purchaseOrder.supplier.name}</p>
                                        <p>SĐT: {formatPhoneNumber(purchaseOrder.supplier.phone)}</p>
                                        <p>Email: {purchaseOrder.supplier.email}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-gray-500">Không có thông tin nhà cung cấp</p>
                                )}
                            </div>
                            <div>
                                <h3 className="mb-2 text-sm font-semibold uppercase">Thông tin kho</h3>
                                {purchaseOrder.warehouse ? (
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium">{purchaseOrder.warehouse.name}</p>
                                        <p>Địa chỉ: {purchaseOrder.warehouse.address}</p>
                                        <p>Loại kho: {purchaseOrder.warehouse.is_main ? 'Kho chính' : 'Kho phụ'}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm italic text-gray-500">Không có thông tin kho</p>
                                )}
                            </div>
                        </div>

                        {/* Danh sách sản phẩm */}
                        <div className="mb-6">
                            <h3 className="mb-3 text-sm font-semibold uppercase">Chi tiết đơn hàng</h3>
                            {loading ? (
                                <p className="py-4 text-center text-sm italic text-gray-500">Đang tải dữ liệu...</p>
                            ) : orderItems && orderItems.length > 0 ? (
                                <div>
                                    <table className="w-full border-collapse text-sm">
                                        <thead className="bg-gray-50">
                                            <tr className="border-b">
                                                <th className="py-2 pl-2 text-left">STT</th>
                                                <th className="py-2 text-left">Sản phẩm</th>
                                                <th className="py-2 text-center">Số lượng</th>
                                                <th className="py-2 text-right">Đơn giá</th>
                                                <th className="py-2 pr-2 text-right">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderItems.map((item, index) => (
                                                <tr key={item.id} className="border-b">
                                                    <td className="py-2 pl-2 text-center">{index + 1}</td>
                                                    <td className="py-2">
                                                        <div>
                                                            <p className="font-medium">{item.product?.name || `Sản phẩm #${item.product_id}`}</p>
                                                            <p className="text-xs text-gray-500">Giá bán: {formatCurrency(item.selling_price)}</p>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 text-center">{item.quantity}</td>
                                                    <td className="py-2 text-right">{formatCurrency(item.purchase_price)}</td>
                                                    <td className="py-2 pr-2 text-right">{formatCurrency(item.purchase_price * item.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="mt-4 flex justify-end">
                                        <div className="w-1/3 space-y-2">
                                            <div className="flex justify-between border-b py-1">
                                                <span className="font-medium">Tổng số lượng:</span>
                                                <span>{orderItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span>
                                            </div>
                                            <div className="flex justify-between border-b py-1">
                                                <span className="font-medium">Tổng giá trị:</span>
                                                <span className="font-bold text-green-600">{formatCurrency(purchaseOrder.total_amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm italic text-gray-500">Không có sản phẩm nào trong đơn hàng</p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    <Button onClick={handlePrint}>
                        In PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
