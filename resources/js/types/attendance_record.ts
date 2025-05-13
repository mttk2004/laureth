export interface AttendanceRecord {
  id: number;
  user_id: number;
  shift_id: number;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | null;
  created_at: string;
  updated_at: string;
}
