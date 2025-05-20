import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { InventoryTransfer, InventoryTransferStatus } from '@/types/inventory_transfer';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import TransferStatusBadge from './TransferStatusBadge';

interface TransferDetailDialogProps {
    transfer: InventoryTransfer | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusUpdated: () => void;
    currentUserStoreId: number;
}

export default function TransferDetailDialog({
    transfer,
    open,
    onOpenChange,
    onStatusUpdated,
    currentUserStoreId,
}: TransferDetailDialogProps) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    // Reset selected status when dialog opens
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedStatus('');
        }
        onOpenChange(open);
    };

    // Check if the current user can update this transfer
    const canUpdateStatus = () => {
        if (!transfer) return false;

        // Nếu chuyển kho đã hoàn thành hoặc từ chối thì không thể cập nhật
        if (
            transfer.status === InventoryTransferStatus.COMPLETED ||
            transfer.status === InventoryTransferStatus.REJECTED
        ) {
            return false;
        }

        // Chỉ người ở cửa hàng đích mới có thể cập nhật trạng thái
        return transfer.destination_warehouse_id.toString() === currentUserStoreId.toString();
    };

    // Update transfer status
    const handleUpdateStatus = async () => {
        if (!transfer || !selectedStatus) {
            addToast('Vui lòng chọn trạng thái', 'error');
            return;
        }

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const response = await axios.put(`/api/inventory-transfers/${transfer.id}/status`, {
                status: selectedStatus,
            });

            addToast('Đã cập nhật trạng thái thành công', 'success');
            onStatusUpdated();
            handleOpenChange(false);
        } catch (error) {
            console.error('Error updating transfer status:', error);
            addToast('Không thể cập nhật trạng thái', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!transfer) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết yêu cầu chuyển kho</DialogTitle>
                    <DialogDescription>
                        Mã yêu cầu: #{transfer.id} - <TransferStatusBadge status={transfer.status} />
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right font-medium">Kho nguồn:</Label>
                        <div className="col-span-2">
                            {transfer.sourceWarehouse?.name}{' '}
                            {transfer.sourceWarehouse?.store?.name && `(${transfer.sourceWarehouse.store.name})`}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right font-medium">Kho đích:</Label>
                        <div className="col-span-2">
                            {transfer.destinationWarehouse?.name}{' '}
                            {transfer.destinationWarehouse?.store?.name &&
                                `(${transfer.destinationWarehouse.store.name})`}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right font-medium">Sản phẩm:</Label>
                        <div className="col-span-2">
                            {transfer.product?.name}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right font-medium">Số lượng:</Label>
                        <div className="col-span-2">{transfer.quantity}</div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right font-medium">Người yêu cầu:</Label>
                        <div className="col-span-2">{transfer.requestedBy?.name}</div>
                    </div>
                    {transfer.approved_by && (
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label className="text-right font-medium">Người duyệt:</Label>
                            <div className="col-span-2">{transfer.approvedBy?.name}</div>
                        </div>
                    )}
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right font-medium">Ngày tạo:</Label>
                        <div className="col-span-2">{formatDate(transfer.created_at)}</div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right font-medium">Trạng thái:</Label>
                        <div className="col-span-2">
                            <TransferStatusBadge status={transfer.status} />
                        </div>
                    </div>

                    {canUpdateStatus() && (
                        <div className="grid grid-cols-3 items-center gap-4 mt-4 pt-4 border-t">
                            <Label htmlFor="status" className="text-right font-medium">
                                Cập nhật trạng thái:
                            </Label>
                            <div className="col-span-2">
                                <Select
                                    value={selectedStatus}
                                    onValueChange={setSelectedStatus}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái mới" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {transfer.status === InventoryTransferStatus.PENDING && (
                                            <>
                                                <SelectItem value={InventoryTransferStatus.APPROVED}>Duyệt yêu cầu</SelectItem>
                                                <SelectItem value={InventoryTransferStatus.REJECTED}>Từ chối yêu cầu</SelectItem>
                                            </>
                                        )}
                                        {transfer.status === InventoryTransferStatus.APPROVED && (
                                            <SelectItem value={InventoryTransferStatus.COMPLETED}>Hoàn thành</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        Đóng
                    </Button>
                    {canUpdateStatus() && selectedStatus && (
                        <Button onClick={handleUpdateStatus} disabled={loading}>
                            {loading ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
