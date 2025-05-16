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

    const handlePrint = async () => {
        if (!purchaseOrder) return;

        // Tạo một cửa sổ mới hoàn toàn tách biệt để tránh xung đột CSS
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            console.error('Popup bị chặn, vui lòng cho phép popup cho trang web này');
            return;
        }

        // Chuẩn bị nội dung HTML thuần cho cửa sổ mới
        const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const formattedDate = new Date(purchaseOrder.order_date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });

        // Tạo HTML thuần không phụ thuộc vào CSS bên ngoài
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Đơn nhập hàng #${purchaseOrder.id.toString().slice(-6)}</title>
                <meta charset="utf-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #000;
                        background-color: #fff;
                    }
                    .print-container {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #e0e0e0;
                        margin-bottom: 20px;
                    }
                    .company-name {
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .document-title {
                        font-size: 18px;
                        font-weight: bold;
                        text-align: right;
                    }
                    .document-number {
                        font-size: 14px;
                        text-align: right;
                    }
                    .document-date {
                        font-size: 14px;
                        color: #666;
                        text-align: right;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    .section {
                        margin-bottom: 20px;
                    }
                    .section-title {
                        font-size: 14px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-bottom: 8px;
                    }
                    .info-text {
                        font-size: 14px;
                        line-height: 1.5;
                    }
                    .info-name {
                        font-weight: bold;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    th {
                        background-color: #f3f4f6;
                        text-align: left;
                        padding: 8px;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    th.center { text-align: center; }
                    th.right { text-align: right; }
                    td {
                        padding: 8px;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    td.center { text-align: center; }
                    td.right { text-align: right; }
                    .product-name {
                        font-weight: bold;
                    }
                    .product-price {
                        font-size: 12px;
                        color: #666;
                    }
                    .total-section {
                        display: flex;
                        justify-content: flex-end;
                    }
                    .total-container {
                        width: 300px;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    .total-label {
                        font-weight: bold;
                    }
                    .total-value {
                        font-weight: bold;
                        color: #047857;
                    }
                    .footer {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        margin-top: 30px;
                    }
                    .signature-box {
                        text-align: center;
                    }
                    .signature-title {
                        font-weight: bold;
                        margin-bottom: 40px;
                    }
                    .signature-line {
                        margin-top: 40px;
                        color: #666;
                    }
                    .no-print-button {
                        background-color: #0066ff;
                        color: white;
                        border: none;
                        padding: 10px 15px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                    @media print {
                        .no-print-button {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="header">
                        <div>
                            <h1 class="company-name">LAURETH</h1>
                            <p>Phụ kiện thời trang Laureth</p>
                        </div>
                        <div>
                            <h2 class="document-title">ĐƠN NHẬP HÀNG</h2>
                            <p class="document-number">#${purchaseOrder.id.toString().slice(-6)}</p>
                            <p class="document-date">Ngày: ${formattedDate}</p>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div class="section">
                            <h3 class="section-title">Thông tin nhà cung cấp</h3>
                            ${purchaseOrder.supplier ? `
                                <div class="info-text">
                                    <p class="info-name">${purchaseOrder.supplier.name}</p>
                                    <p>SĐT: ${formatPhoneNumber(purchaseOrder.supplier.phone)}</p>
                                    <p>Email: ${purchaseOrder.supplier.email}</p>
                                </div>
                            ` : `
                                <p class="info-text">Không có thông tin nhà cung cấp</p>
                            `}
                        </div>

                        <div class="section">
                            <h3 class="section-title">Thông tin kho</h3>
                            ${purchaseOrder.warehouse ? `
                                <div class="info-text">
                                    <p class="info-name">${purchaseOrder.warehouse.name}</p>
                                    <p>Địa chỉ: ${purchaseOrder.warehouse.address}</p>
                                    <p>Loại kho: ${purchaseOrder.warehouse.is_main ? 'Kho chính' : 'Kho phụ'}</p>
                                </div>
                            ` : `
                                <p class="info-text">Không có thông tin kho</p>
                            `}
                        </div>
                    </div>

                    <div class="section">
                        <h3 class="section-title">Chi tiết đơn hàng</h3>
                        ${loading ? `
                            <p>Đang tải dữ liệu...</p>
                        ` : orderItems && orderItems.length > 0 ? `
                            <table>
                                <thead>
                                    <tr>
                                        <th style="width: 5%;">STT</th>
                                        <th style="width: 45%;">Sản phẩm</th>
                                        <th class="center" style="width: 15%;">Số lượng</th>
                                        <th class="right" style="width: 15%;">Đơn giá</th>
                                        <th class="right" style="width: 20%;">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${orderItems.map((item, index) => `
                                        <tr>
                                            <td class="center">${index + 1}</td>
                                            <td>
                                                <div>
                                                    <p class="product-name">${item.product?.name || `Sản phẩm #${item.product_id}`}</p>
                                                    <p class="product-price">Giá bán: ${formatCurrency(item.selling_price)}</p>
                                                </div>
                                            </td>
                                            <td class="center">${item.quantity}</td>
                                            <td class="right">${formatCurrency(item.purchase_price)}</td>
                                            <td class="right">${formatCurrency(item.purchase_price * item.quantity)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>

                            <div class="total-section">
                                <div class="total-container">
                                    <div class="total-row">
                                        <span class="total-label">Tổng số lượng:</span>
                                        <span>${totalQuantity} sản phẩm</span>
                                    </div>
                                    <div class="total-row">
                                        <span class="total-label">Tổng giá trị:</span>
                                        <span class="total-value">${formatCurrency(purchaseOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <p>Không có sản phẩm nào trong đơn hàng</p>
                        `}
                    </div>

                    <div class="footer">
                        <div class="signature-box">
                            <p class="signature-title">Người giao hàng</p>
                            <p class="signature-line">(Ký, ghi rõ họ tên)</p>
                        </div>
                        <div class="signature-box">
                            <p class="signature-title">Người nhận hàng</p>
                            <p>${purchaseOrder.user?.full_name || ''}</p>
                            <p class="signature-line">(Ký, ghi rõ họ tên)</p>
                        </div>
                    </div>

                    <button onclick="window.print(); setTimeout(() => window.close(), 500);" class="no-print-button">
                        In PDF
                    </button>
                </div>

                <script>
                    // Tự động in sau khi trang đã load xong
                    window.onload = () => {
                        setTimeout(() => {
                            // Chuyển đổi qua PDF thay vì in trực tiếp
                            const element = document.querySelector('.print-container');
                            const opt = {
                                margin: 10,
                                filename: 'don-nhap-hang-${purchaseOrder.id.toString().slice(-6)}.pdf',
                                image: { type: 'jpeg', quality: 0.98 },
                                html2canvas: { scale: 2 },
                                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                            };

                            // Nhúng script html2pdf từ CDN
                            const script = document.createElement('script');
                            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                            script.onload = () => {
                                // Sau khi script đã load, xuất PDF
                                html2pdf()
                                    .set(opt)
                                    .from(element)
                                    .save()
                                    .then(() => {
                                        // Đóng cửa sổ sau khi xuất PDF
                                        setTimeout(() => window.close(), 1000);
                                    });
                            };
                            document.body.appendChild(script);
                        }, 1000);
                    };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
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
                    <DialogTitle className="text-lg">Xem trước khi in đơn nhập hàng</DialogTitle>
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

                        {/* Footer */}
                        <div className="mt-8 grid grid-cols-2 text-sm">
                            <div className="text-center">
                                <p className="font-medium">Người giao hàng</p>
                                <p className="mt-8 text-gray-500">(Ký, ghi rõ họ tên)</p>
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Người nhận hàng</p>
                                <p className="mt-1 text-gray-500">{purchaseOrder.user?.full_name}</p>
                                <p className="mt-8 text-gray-500">(Ký, ghi rõ họ tên)</p>
                            </div>
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
