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
import { WarehouseWithStore } from '@/types/warehouse';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WarehouseSelectDialogProps {
    warehouses: WarehouseWithStore[];
    triggerComponent: React.ReactNode;
    onSelect: (warehouseId: string) => void;
    title?: string;
    description?: string;
}

export default function WarehouseSelectDialog({
    warehouses,
    triggerComponent,
    onSelect,
    title = 'Chọn kho',
    description = 'Chọn kho để thực hiện thao tác',
}: WarehouseSelectDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');

    const handleConfirm = () => {
        if (!selectedWarehouse) return;
        onSelect(selectedWarehouse);
        setOpen(false);
        setSelectedWarehouse('');
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (!newOpen) {
                    setSelectedWarehouse('');
                }
            }}
        >
            <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="warehouse" className="text-right">
                            Kho
                        </Label>
                        <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                            <SelectTrigger id="warehouse" className="col-span-3">
                                <SelectValue placeholder="Chọn kho" />
                            </SelectTrigger>
                            <SelectContent>
                                {warehouses.map((warehouse) => (
                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                        {warehouse.name} {warehouse.store?.name ? `(${warehouse.store.name})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleConfirm} disabled={!selectedWarehouse}>
                        Xác nhận
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
