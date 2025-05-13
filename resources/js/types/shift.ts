export enum ShiftType {
  A = 'A',
  B = 'B'
}

export enum ShiftStatus {
  PLANNED = 'planned',
  COMPLETED = 'completed',
  ABSENT = 'absent'
}

export interface Shift {
  id: number;
  shift_type: ShiftType;
  date: string;
  user_id: number;
  store_id: number;
  status: ShiftStatus;
  created_at: string;
  updated_at: string;
}
