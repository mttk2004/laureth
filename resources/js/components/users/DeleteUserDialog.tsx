import React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DeleteUserDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Xác nhận xóa nhân viên</DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end space-x-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Hủy
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
