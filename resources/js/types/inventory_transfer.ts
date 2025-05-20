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

    // Thêm các mối quan hệ
    sourceWarehouse?: {
        id: number;
        name: string;
        store?: {
            id: number;
            name: string;
        };
    };
    destinationWarehouse?: {
        id: number;
        name: string;
        store?: {
            id: number;
            name: string;
        };
    };
    product?: {
        id: string;
        name: string;
    };
    requestedBy?: {
        id: string;
        name: string;
        full_name: string;
    };
    approvedBy?: {
        id: string;
        name: string;
        full_name: string;
    };
}
