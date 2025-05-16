import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeleteStoreDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export default function DeleteStoreDialog({ open, onOpenChange, onConfirm }: DeleteStoreDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xác nhận xóa cửa hàng</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xóa cửa hàng này? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
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
