import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem } from '@/types/inventory_item';
import { Product } from '@/types/product';
import { WarehouseWithStore } from '@/types/warehouse';
import axios from 'axios';
import { PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

// Mở rộng loại InventoryItem với product
interface InventoryItemWithProduct extends InventoryItem {
    product?: Product;
}

interface CreateTransferDialogProps {
    allWarehouses: WarehouseWithStore[];
    onTransferCreated: () => void;
}

export default function CreateTransferDialog({ allWarehouses, onTransferCreated }: CreateTransferDialogProps) {
    const { addToast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedSourceWarehouse, setSelectedSourceWarehouse] = useState('');
    const [selectedDestinationWarehouse, setSelectedDestinationWarehouse] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [inventory, setInventory] = useState<InventoryItemWithProduct[]>([]);
    const [maxQuantity, setMaxQuantity] = useState(0);

    // Lấy inventory khi chọn source warehouse
    useEffect(() => {
        if (selectedSourceWarehouse) {
            fetchWarehouseInventory(selectedSourceWarehouse);
        } else {
            setInventory([]);
            setSelectedProduct('');
            setMaxQuantity(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSourceWarehouse]);

    // Cập nhật max quantity khi chọn sản phẩm
    useEffect(() => {
        if (selectedProduct) {
            const product = inventory.find((item) => item.product_id.toString() === selectedProduct);
            if (product) {
                setMaxQuantity(product.quantity);
                setQuantity(1);
            }
        } else {
            setMaxQuantity(0);
            setQuantity(1);
        }
    }, [selectedProduct, inventory]);

    // Lấy danh sách sản phẩm trong kho
    const fetchWarehouseInventory = async (warehouseId: string) => {
        try {
            setLoading(true);
            // Sử dụng đúng API endpoint từ InventoryTransferController
            const response = await axios.get(`/api/warehouses/${warehouseId}/inventory`);
            console.log('Inventory API response:', response.data);
            setInventory(response.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            addToast('Không thể lấy thông tin kho', 'error');
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setSelectedSourceWarehouse('');
        setSelectedDestinationWarehouse('');
        setSelectedProduct('');
        setQuantity(1);
        setMaxQuantity(0);
        setInventory([]);
    };

    // Tạo yêu cầu chuyển kho
    const handleCreateTransfer = async () => {
        if (!selectedSourceWarehouse || !selectedDestinationWarehouse || !selectedProduct || quantity <= 0) {
            addToast('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        if (quantity > maxQuantity) {
            addToast(`Số lượng không được vượt quá ${maxQuantity}`, 'error');
            return;
        }

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const response = await axios.post('/api/inventory-transfers', {
                source_warehouse_id: selectedSourceWarehouse,
                destination_warehouse_id: selectedDestinationWarehouse,
                product_id: selectedProduct,
                quantity: quantity,
            });

            addToast('Đã tạo yêu cầu chuyển kho thành công', 'success');
            setOpen(false);
            resetForm();
            onTransferCreated();
        } catch (error) {
            console.error('Error creating transfer:', error);
            addToast('Không thể tạo yêu cầu chuyển kho', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!newOpen) {
                    resetForm();
                }
                setOpen(newOpen);
            }}
        >
            <DialogTrigger asChild>
                <Button size="default" className="flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" /> Tạo yêu cầu mới
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo yêu cầu chuyển kho</DialogTitle>
                    <DialogDescription>Điền thông tin để tạo yêu cầu chuyển hàng giữa các kho</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="source_warehouse" className="text-right">
                            Kho nguồn
                        </Label>
                        <Select value={selectedSourceWarehouse} onValueChange={setSelectedSourceWarehouse} disabled={loading}>
                            <SelectTrigger id="source_warehouse" className="col-span-3">
                                <SelectValue placeholder="Chọn kho nguồn" />
                            </SelectTrigger>
                            <SelectContent>
                                {allWarehouses.map((warehouse) => (
                                    <SelectItem
                                        key={warehouse.id}
                                        value={warehouse.id.toString()}
                                        disabled={warehouse.id.toString() === selectedDestinationWarehouse}
                                    >
                                        {warehouse.name} {warehouse.store?.name ? `(${warehouse.store.name})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="destination_warehouse" className="text-right">
                            Kho đích
                        </Label>
                        <Select value={selectedDestinationWarehouse} onValueChange={setSelectedDestinationWarehouse} disabled={loading}>
                            <SelectTrigger id="destination_warehouse" className="col-span-3">
                                <SelectValue placeholder="Chọn kho đích" />
                            </SelectTrigger>
                            <SelectContent>
                                {allWarehouses.map((warehouse) => (
                                    <SelectItem
                                        key={warehouse.id}
                                        value={warehouse.id.toString()}
                                        disabled={warehouse.id.toString() === selectedSourceWarehouse}
                                    >
                                        {warehouse.name} {warehouse.store?.name ? `(${warehouse.store.name})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="product" className="text-right">
                            Sản phẩm
                        </Label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={!selectedSourceWarehouse || loading}>
                            <SelectTrigger id="product" className="col-span-3">
                                <SelectValue placeholder="Chọn sản phẩm" />
                            </SelectTrigger>
                            <SelectContent>
                                {inventory
                                    .filter((item) => item.quantity > 0)
                                    .map((item) => (
                                        <SelectItem key={item.product_id} value={item.product_id.toString()}>
                                            {item.product?.name} - Tồn kho: {item.quantity}
                                        </SelectItem>
                                    ))}
                                {inventory.length === 0 && <div className="text-muted-foreground p-2 text-sm">Không có sản phẩm nào trong kho</div>}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Số lượng
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="quantity"
                                type="number"
                                min={1}
                                max={maxQuantity}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                disabled={!selectedProduct || loading}
                            />
                            {selectedProduct && <p className="text-muted-foreground mt-1 text-xs">Tối đa: {maxQuantity}</p>}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleCreateTransfer}
                        disabled={
                            loading ||
                            !selectedSourceWarehouse ||
                            !selectedDestinationWarehouse ||
                            !selectedProduct ||
                            quantity <= 0 ||
                            quantity > maxQuantity
                        }
                    >
                        {loading ? 'Đang xử lý...' : 'Tạo yêu cầu'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
