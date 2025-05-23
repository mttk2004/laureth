import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib';
import { Store, User } from '@/types';
import { router } from '@inertiajs/react';
import { PencilIcon } from 'lucide-react';

interface StoreWithManager extends Store {
    manager?: User | null;
}

interface StoreDetailDialogProps {
    store: StoreWithManager | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function StoreDetailDialog({ store, open, onOpenChange }: StoreDetailDialogProps) {
    if (!store) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Chi tiết cửa hàng</DialogTitle>
                    <DialogDescription>Thông tin chi tiết về cửa hàng {store.name}</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-muted-foreground mb-1 text-sm font-medium">Thông tin cửa hàng</h3>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="font-medium">ID:</div>
                                <div className="col-span-2">{store.id}</div>

                                <div className="font-medium">Địa chỉ:</div>
                                <div className="col-span-2">{store.address}</div>

                                <div className="font-medium">Mục tiêu tháng:</div>
                                <div className="col-span-2">{formatCurrency(store.monthly_target)}</div>

                                <div className="font-medium">Ngày tạo:</div>
                                <div className="col-span-2">{new Date(store.created_at).toLocaleDateString('vi-VN')}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-muted-foreground mb-1 text-sm font-medium">Quản lý cửa hàng</h3>
                            {store.manager ? (
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="font-medium">Họ tên:</div>
                                    <div className="col-span-2">{store.manager.full_name}</div>

                                    <div className="font-medium">Email:</div>
                                    <div className="col-span-2">{store.manager.email}</div>

                                    <div className="font-medium">Điện thoại:</div>
                                    <div className="col-span-2">{store.manager.phone}</div>
                                </div>
                            ) : (
                                <div className="text-muted-foreground text-sm italic">Cửa hàng chưa được phân công quản lý</div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex space-x-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    <Button
                        onClick={() => {
                            if (store) {
                                router.visit(`/stores/${store.id}/edit`);
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
