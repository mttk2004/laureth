export enum PayrollStatus {
    PENDING = 'pending',
    PAID = 'paid',
}

export interface Payroll {
    id: number;
    user_id: string;
    month: number;
    year: number;
    base_amount: number;
    total_hours: number;
    commission_amount: number;
    final_amount: number;
    status: PayrollStatus;
    created_at: string;
    updated_at: string;
    user?: {
        id: string;
        full_name: string;
        email: string;
        position: string;
        store_id?: string;
        store?: {
            id: string;
            name: string;
        };
    };
}

export interface PayrollSummary {
    periods: {
        month: number;
        year: number;
        label: string;
    }[];
    totalPaidAmount: number;
    totalPendingAmount: number;
    payrollByPosition: {
        position: string;
        count: number;
        total_amount: number;
    }[];
}

export enum PayrollSortOption {
    NEWEST = 'created_at_desc',
    OLDEST = 'created_at_asc',
    AMOUNT_ASC = 'final_amount_asc',
    AMOUNT_DESC = 'final_amount_desc',
}

export const PayrollSortOptionLabels: Record<PayrollSortOption, string> = {
    [PayrollSortOption.NEWEST]: 'Mới nhất',
    [PayrollSortOption.OLDEST]: 'Cũ nhất',
    [PayrollSortOption.AMOUNT_ASC]: 'Lương thấp-cao',
    [PayrollSortOption.AMOUNT_DESC]: 'Lương cao-thấp',
};
