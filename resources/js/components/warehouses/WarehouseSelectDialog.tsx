import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Warehouse } from '@/types';
import { router } from '@inertiajs/react';

interface WarehouseSelectDialogProps {
    warehouses: Warehouse[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WarehouseSelectDialog({ warehouses, open, onOpenChange }: WarehouseSelectDialogProps) {
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);

    const handleSelectWarehouse = () => {
        if (selectedWarehouseId) {
            router.get(`/warehouses/${selectedWarehouseId}/purchase`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-lg">Chọn kho nhập hàng</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <RadioGroup value={selectedWarehouseId?.toString()} onValueChange={(value) => setSelectedWarehouseId(parseInt(value))}>
                        <div className="space-y-3">
                            {warehouses.map((warehouse) => (
                                <div key={warehouse.id} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50">
                                    <RadioGroupItem value={warehouse.id.toString()} id={`warehouse-${warehouse.id}`} />
                                    <Label htmlFor={`warehouse-${warehouse.id}`} className="flex-1 cursor-pointer">
                                        <div className="font-medium">{warehouse.name}</div>
                                        <div className="text-sm text-gray-500">{warehouse.address}</div>
                                        {warehouse.is_main && (
                                            <div className="mt-1">
                                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Kho chính</span>
                                            </div>
                                        )}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSelectWarehouse}
                        disabled={!selectedWarehouseId}
                    >
                        Tiếp tục
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
