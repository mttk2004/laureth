import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DeleteProductDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
