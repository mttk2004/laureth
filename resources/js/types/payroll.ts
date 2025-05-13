export enum PayrollStatus {
  PENDING = 'pending',
  PAID = 'paid'
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
}
