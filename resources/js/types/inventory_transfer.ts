export enum InventoryTransferStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    COMPLETED = 'completed',
}

export interface InventoryTransfer {
    id: number;
    source_warehouse_id: number;
    destination_warehouse_id: number;
    requested_by: string;
    approved_by: string | null;
    product_id: string;
    quantity: number;
    status: InventoryTransferStatus;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}
