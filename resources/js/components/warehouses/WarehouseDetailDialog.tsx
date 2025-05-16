import { router } from '@inertiajs/react';
import { PencilIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WarehouseWithStore } from '@/types';

interface WarehouseDetailDialogProps {
  warehouse: WarehouseWithStore | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WarehouseDetailDialog({ warehouse, open, onOpenChange }: WarehouseDetailDialogProps) {
  if (!warehouse) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Chi tiết kho</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về kho {warehouse.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Thông tin kho</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">ID:</div>
                <div className="col-span-2">{warehouse.id}</div>
                <div className="font-medium">Tên kho:</div>
                <div className="col-span-2">{warehouse.name}</div>
                <div className="font-medium">Cửa hàng:</div>
                <div className="col-span-2">{warehouse.store?.name ?? 'Không có cửa hàng'}</div>
                <div className="font-medium">Ngày tạo:</div>
                <div className="col-span-2">
                  {new Date(warehouse.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={() => {
            if (warehouse) {
              router.visit(`/warehouses/${warehouse.id}/edit`);
            }
          }}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
