import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeleteSupplierDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export default function DeleteSupplierDialog({ open, onOpenChange, onConfirm }: DeleteSupplierDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xóa nhà cung cấp</DialogTitle>
                    <DialogDescription>Bạn có chắc chắn muốn xóa nhà cung cấp này? Hành động này không thể hoàn tác.</DialogDescription>
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
