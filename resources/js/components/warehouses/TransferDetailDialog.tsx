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

// Interface cho dữ liệu chi tiết từ API
interface TransferDetailResponse {
    id: number;
    source_warehouse_id: number;
    destination_warehouse_id: number;
    source_warehouse?: {
        id: number;
        name: string;
        store?: {
            id: number;
            name: string;
        };
    };
    destination_warehouse?: {
        id: number;
        name: string;
        store?: {
            id: number;
            name: string;
        };
    };
    requested_by?: {
        id: string;
        name: string;
        full_name: string;
    };
    approved_by?: {
        id: string;
        name: string;
        full_name: string;
    };
    product?: {
        id: string;
        name: string;
    };
    product_id: string;
    quantity: number;
    status: InventoryTransferStatus;
    created_at: string;
    updated_at: string;
}

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
    const [transferDetail, setTransferDetail] = useState<TransferDetailResponse | null>(null);

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

    // Log dữ liệu khi chuyển đổi
    useEffect(() => {
        if (transferDetail) {
            console.log('Current transfer detail state:', {
                id: transferDetail.id,
                source: transferDetail.source_warehouse,
                destination: transferDetail.destination_warehouse,
                requestedBy: transferDetail.requested_by,
                approvedBy: transferDetail.approved_by,
                storeId: transferDetail.source_warehouse?.store?.id,
                destStoreId: transferDetail.destination_warehouse?.store?.id,
            });
        }
    }, [transferDetail]);

    // Lấy dữ liệu ưu tiên từ API
    const transferData = transferDetail || (selectedTransfer as unknown as TransferDetailResponse) || (transfer as unknown as TransferDetailResponse);

    // Check if the current user can update this transfer
    const canUpdateStatus = () => {
        if (!transferData) return false;

        // Nếu chuyển kho đã hoàn thành hoặc từ chối thì không thể cập nhật
        if (
            transferData.status === InventoryTransferStatus.COMPLETED ||
            transferData.status === InventoryTransferStatus.REJECTED
        ) {
            return false;
        }

        // Kiểm tra quyền cập nhật dựa trên cửa hàng của kho đích
        if (transferData.destination_warehouse?.store?.id) {
            console.log('Checking permission:', {
                destStoreId: transferData.destination_warehouse.store.id,
                currentUserStoreId
            });
            return Number(transferData.destination_warehouse.store.id) === Number(currentUserStoreId);
        }

        return false;
    };

    // Update transfer status
    const handleUpdateStatus = async () => {
        if (!transferData || !selectedStatus) {
            addToast('Vui lòng chọn trạng thái', 'error');
            return;
        }

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const response = await axios.put(`/api/inventory-transfers/${transferData.id}/status`, {
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

    if (!transferData) return null;

    // Lấy thông tin từ cấu trúc API mới
    const sourceWarehouseName = transferData.source_warehouse?.name || 'Không xác định';
    const sourceStoreName = transferData.source_warehouse?.store?.name || '';

    const destWarehouseName = transferData.destination_warehouse?.name || 'Không xác định';
    const destStoreName = transferData.destination_warehouse?.store?.name || '';

    const requestedByName = transferData.requested_by?.full_name ||
                         transferData.requested_by?.name ||
                         'Không xác định';

    const approvedByName = transferData.approved_by?.full_name ||
                        transferData.approved_by?.name ||
                        'Chưa có người duyệt';

    const productName = transferData.product?.name || 'Không xác định';

    console.log('Rendering transfer detail dialog with data:', {
        sourceWarehouseName,
        sourceStoreName,
        destWarehouseName,
        destStoreName,
        requestedByName,
        approvedByName,
        productName
    });

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết yêu cầu chuyển kho</DialogTitle>
                    <DialogDescription>
                        Mã yêu cầu: #{transferData.id} - <TransferStatusBadge status={transferData.status} />
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
                                    {productName}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-medium">Số lượng:</Label>
                                <div className="col-span-2">{transferData.quantity}</div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-medium">Người yêu cầu:</Label>
                                <div className="col-span-2">{requestedByName}</div>
                            </div>
                            {transferData.approved_by && (
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-right font-medium">Người duyệt:</Label>
                                    <div className="col-span-2">{approvedByName}</div>
                                </div>
                            )}
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-medium">Ngày tạo:</Label>
                                <div className="col-span-2">{formatDate(transferData.created_at)}</div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-medium">Trạng thái:</Label>
                                <div className="col-span-2">
                                    <TransferStatusBadge status={transferData.status} />
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
                                                {transferData.status === InventoryTransferStatus.PENDING && (
                                                    <>
                                                        <SelectItem value={InventoryTransferStatus.APPROVED}>Duyệt yêu cầu</SelectItem>
                                                        <SelectItem value={InventoryTransferStatus.REJECTED}>Từ chối yêu cầu</SelectItem>
                                                    </>
                                                )}
                                                {transferData.status === InventoryTransferStatus.APPROVED && (
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
