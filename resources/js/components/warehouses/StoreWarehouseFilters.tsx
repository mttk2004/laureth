import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { InventoryTransferStatus } from '@/types/inventory_transfer';
import { Warehouse, WarehouseWithStore } from '@/types/warehouse';
import { FilterIcon } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StoreWarehouseFiltersProps {
    storeWarehouses: Warehouse[];
    allWarehouses: WarehouseWithStore[];
    initialFilters: {
        status?: string;
        source_warehouse_id?: string;
        destination_warehouse_id?: string;
    };
    onApplyFilters: (filters: Record<string, string>) => void;
}

export default function StoreWarehouseFilters({
    storeWarehouses,
    allWarehouses,
    initialFilters,
    onApplyFilters,
}: StoreWarehouseFiltersProps) {
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: initialFilters.status || 'all',
        source_warehouse_id: initialFilters.source_warehouse_id || 'all',
        destination_warehouse_id: initialFilters.destination_warehouse_id || 'all',
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        onApplyFilters(filters);
        setOpen(false);
    };

    const handleReset = () => {
        const resetFilters = {
            status: 'all',
            source_warehouse_id: 'all',
            destination_warehouse_id: 'all',
        };
        setFilters(resetFilters);
        onApplyFilters(resetFilters);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex gap-2 items-center">
                    <FilterIcon className="h-4 w-4" /> Lọc
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Lọc theo điều kiện</DialogTitle>
                    <DialogDescription>Chọn các điều kiện lọc cho danh sách chuyển kho</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Trạng thái
                        </Label>
                        <Select
                            value={filters.status}
                            onValueChange={(value) => handleFilterChange('status', value)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value={InventoryTransferStatus.PENDING}>Đang chờ duyệt</SelectItem>
                                <SelectItem value={InventoryTransferStatus.APPROVED}>Đã duyệt</SelectItem>
                                <SelectItem value={InventoryTransferStatus.REJECTED}>Đã từ chối</SelectItem>
                                <SelectItem value={InventoryTransferStatus.COMPLETED}>Đã hoàn thành</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="source_warehouse_id" className="text-right">
                            Kho nguồn
                        </Label>
                        <Select
                            value={filters.source_warehouse_id}
                            onValueChange={(value) => handleFilterChange('source_warehouse_id', value)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn kho nguồn" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {storeWarehouses.map((warehouse) => (
                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                        {warehouse.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="destination_warehouse_id" className="text-right">
                            Kho đích
                        </Label>
                        <Select
                            value={filters.destination_warehouse_id}
                            onValueChange={(value) => handleFilterChange('destination_warehouse_id', value)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn kho đích" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {allWarehouses.map((warehouse) => (
                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                        {warehouse.name} {warehouse.store?.name ? `(${warehouse.store.name})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleReset}>
                        Đặt lại
                    </Button>
                    <Button onClick={handleApply}>Áp dụng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
