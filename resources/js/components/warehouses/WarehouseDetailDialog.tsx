import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib';
import { InventoryItem, Product, WarehouseWithStore } from '@/types';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { PencilIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InventoryItemWithProduct extends InventoryItem {
    product?: Product;
}

interface WarehouseDetailDialogProps {
    warehouse: WarehouseWithStore | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function WarehouseDetailDialog({ warehouse, open, onOpenChange }: WarehouseDetailDialogProps) {
    const [activeTab, setActiveTab] = useState('info');
    const [inventoryItems, setInventoryItems] = useState<InventoryItemWithProduct[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && warehouse) {
            setLoading(true);
            axios
                .get(`/api/warehouses/${warehouse.id}/inventory`)
                .then((response) => {
                    setInventoryItems(response.data);
                })
                .catch((error) => {
                    console.error('Không thể tải dữ liệu tồn kho:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [open, warehouse]);

    if (!warehouse) return null;

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
                    <DialogTitle className="text-xl font-semibold">Chi tiết kho</DialogTitle>
                    <DialogDescription className="mt-2 text-sm text-gray-600">Thông tin chi tiết và hàng tồn kho</DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4 grid grid-cols-2">
                        <TabsTrigger value="info">Thông tin</TabsTrigger>
                        <TabsTrigger value="inventory">Tồn kho</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="max-h-[50vh] space-y-4 overflow-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-md">Thông tin cơ bản</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="mb-2 text-xl font-medium">{warehouse.name}</div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="font-semibold">ID:</div>
                                        <div>{warehouse.id}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="font-semibold">Địa chỉ:</div>
                                        <div>{warehouse.address}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="font-semibold">Thuộc cửa hàng:</div>
                                        <div>{warehouse.store?.name ?? 'Không có cửa hàng'}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="font-semibold">Kho chính:</div>
                                        <div>{warehouse.is_main ? 'Có' : 'Không'}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="font-semibold">Ngày tạo:</div>
                                        <div>{formatDate(warehouse.created_at)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="inventory" className="max-h-[50vh] space-y-4 overflow-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-md">Hàng tồn kho</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-muted-foreground py-4 text-center italic">Đang tải dữ liệu...</div>
                                ) : inventoryItems && inventoryItems.length > 0 ? (
                                    <div className="space-y-4">
                                        {inventoryItems.map((item) => (
                                            <div key={item.id} className="rounded-md border p-3 text-sm">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="font-medium">{item.product?.name || 'Sản phẩm không xác định'}</div>
                                                    <Badge className="bg-blue-500">{item.quantity} sản phẩm</Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-1">
                                                    <div className="text-muted-foreground">ID sản phẩm:</div>
                                                    <div>{item.product_id}</div>

                                                    <div className="text-muted-foreground">Giá bán:</div>
                                                    <div>{item.product?.price ? formatCurrency(item.product.price) : 'N/A'}</div>

                                                    <div className="text-muted-foreground">Cập nhật lần cuối:</div>
                                                    <div>{formatDate(item.updated_at)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground py-4 text-center italic">Không có sản phẩm nào trong kho</div>
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
                            if (warehouse) {
                                router.visit(`/warehouses/${warehouse.id}/edit`);
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
