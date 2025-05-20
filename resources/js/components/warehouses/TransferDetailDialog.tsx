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
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import TransferStatusBadge from './TransferStatusBadge';

interface TransferDetailDialogProps {
    transfer: InventoryTransfer | null;
    selectedTransfer: InventoryTransfer | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusUpdated: () => void;
    currentUserStoreId: number;
}

export default function TransferDetailDialog({
    transfer,
    selectedTransfer,
    open,
    onOpenChange,
    onStatusUpdated,
    currentUserStoreId,
}: TransferDetailDialogProps) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [transferDetail, setTransferDetail] = useState<InventoryTransfer | null>(null);

    // Xử lý khi mở/đóng dialog
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedStatus('');
            setTransferDetail(null);
        } else if (selectedTransfer) {
            // Tải dữ liệu khi mở dialog
            fetchTransferDetail(selectedTransfer.id);
        }
        onOpenChange(open);
    };

    // Fetch thông tin chi tiết từ API
    const fetchTransferDetail = async (transferId: number) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/inventory-transfers/${transferId}`);
            if (response.data) {
                setTransferDetail(response.data);
                console.log('Transfer detail data:', response.data);
            }
        } catch (error) {
            console.error('Error fetching transfer detail:', error);
            addToast('Không thể lấy chi tiết phiếu chuyển kho', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Log dữ liệu mỗi khi transferDetail thay đổi
    useEffect(() => {
        if (transferDetail) {
            console.log('Current transfer detail state:', {
                source: transferDetail.sourceWarehouse,
                destination: transferDetail.destinationWarehouse,
                requestedBy: transferDetail.requestedBy,
                approvedBy: transferDetail.approvedBy
            });
        }
    }, [transferDetail]);

    // Lấy dữ liệu với thứ tự ưu tiên: transferDetail > selectedTransfer > transfer
    const transferToDisplay = transferDetail || selectedTransfer || transfer;

    // Check if the current user can update this transfer
    const canUpdateStatus = () => {
        const transferToUse = transferToDisplay;
        if (!transferToUse) return false;

        // Nếu chuyển kho đã hoàn thành hoặc từ chối thì không thể cập nhật
        if (
            transferToUse.status === InventoryTransferStatus.COMPLETED ||
            transferToUse.status === InventoryTransferStatus.REJECTED
        ) {
            return false;
        }

        // Kiểm tra kho đích thuộc về store của user hiện tại
        if (transferToUse.destinationWarehouse?.store?.id) {
            console.log('Checking permission:', {
                destStoreId: transferToUse.destinationWarehouse.store.id,
                currentUserStoreId
            });
            return Number(transferToUse.destinationWarehouse.store.id) === Number(currentUserStoreId);
        }

        // Nếu không có thông tin store, so sánh warehouse_id
        return Number(transferToUse.destination_warehouse_id) === Number(currentUserStoreId);
    };

    // Update transfer status
    const handleUpdateStatus = async () => {
        if (!transferToDisplay || !selectedStatus) {
            addToast('Vui lòng chọn trạng thái', 'error');
            return;
        }

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const response = await axios.put(`/api/inventory-transfers/${transferToDisplay.id}/status`, {
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

    if (!transferToDisplay) return null;

    // Lấy tên kho nguồn và kho đích từ dữ liệu
    const sourceWarehouseName = transferToDisplay.sourceWarehouse?.name || 'Kho trung tâm';
    const sourceStoreName = transferToDisplay.sourceWarehouse?.store?.name || '';

    const destWarehouseName = transferToDisplay.destinationWarehouse?.name || 'Kho trung tâm';
    const destStoreName = transferToDisplay.destinationWarehouse?.store?.name || '';

    // Lấy tên người yêu cầu và người duyệt
    const requestedByName = transferToDisplay.requestedBy?.full_name ||
                           transferToDisplay.requestedBy?.name ||
                           'Không xác định';

    const approvedByName = transferToDisplay.approvedBy?.full_name ||
                          transferToDisplay.approvedBy?.name ||
                          'Chưa có người duyệt';

    console.log('Rendering transfer detail dialog with data:', {
        sourceWarehouseName,
        sourceStoreName,
        destWarehouseName,
        destStoreName,
        requestedByName,
        approvedByName
    });

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết yêu cầu chuyển kho</DialogTitle>
                    <DialogDescription>
                        Mã yêu cầu: #{transferToDisplay.id} - <TransferStatusBadge status={transferToDisplay.status} />
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                            <span className="ml-2">Đang tải dữ liệu...</span>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-medium">Kho nguồn:</Label>
                                <div className="col-span-2">
                                    {sourceWarehouseName}
                                    {sourceStoreName && ` (${sourceStoreName})`}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-medium">Kho đích:</Label>
                                <div className="col-span-2">
                                    {destWarehouseName}
                                    {destStoreName && ` (${destStoreName})`}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-medium">Sản phẩm:</Label>
                                <div className="col-span-2">
                                    {transferToDisplay.product?.name || 'Không có thông tin'}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-medium">Số lượng:</Label>
                                <div className="col-span-2">{transferToDisplay.quantity}</div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-medium">Người yêu cầu:</Label>
                                <div className="col-span-2">{requestedByName}</div>
                            </div>
                            {transferToDisplay.approved_by && (
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-right font-medium">Người duyệt:</Label>
                                    <div className="col-span-2">{approvedByName}</div>
                                </div>
                            )}
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-medium">Ngày tạo:</Label>
                                <div className="col-span-2">{formatDate(transferToDisplay.created_at)}</div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-medium">Trạng thái:</Label>
                                <div className="col-span-2">
                                    <TransferStatusBadge status={transferToDisplay.status} />
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
                                                {transferToDisplay.status === InventoryTransferStatus.PENDING && (
                                                    <>
                                                        <SelectItem value={InventoryTransferStatus.APPROVED}>Duyệt yêu cầu</SelectItem>
                                                        <SelectItem value={InventoryTransferStatus.REJECTED}>Từ chối yêu cầu</SelectItem>
                                                    </>
                                                )}
                                                {transferToDisplay.status === InventoryTransferStatus.APPROVED && (
                                                    <SelectItem value={InventoryTransferStatus.COMPLETED}>Hoàn thành</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </>
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
