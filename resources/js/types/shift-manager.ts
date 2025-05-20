import { Shift, ShiftType } from './shift';
import { User } from './user';

export interface ShiftCalendarItem {
    date: string | null;
    shifts: Shift[];
    isCurrentMonth: boolean;
    isToday?: boolean;
}

export interface ShiftManagerPageProps {
    user: User;
    shifts: {
        calendar: ShiftCalendarItem[];
        month: number;
        year: number;
    };
    staff: User[];
    filters: {
        month: number;
        year: number;
    };
}

export interface ShiftFormData {
    user_id: string;
    date: string;
    shift_type: ShiftType;
}

export interface BulkShiftFormData {
    shifts: ShiftFormData[];
}

export enum ShiftManagerSortOption {
    DATE_ASC = 'date_asc',
    DATE_DESC = 'date_desc',
    EMPLOYEE_ASC = 'employee_asc',
    EMPLOYEE_DESC = 'employee_desc',
}

export const ShiftManagerSortOptionLabels: Record<ShiftManagerSortOption, string> = {
    [ShiftManagerSortOption.DATE_ASC]: 'Ngày tăng dần',
    [ShiftManagerSortOption.DATE_DESC]: 'Ngày giảm dần',
    [ShiftManagerSortOption.EMPLOYEE_ASC]: 'Nhân viên A-Z',
    [ShiftManagerSortOption.EMPLOYEE_DESC]: 'Nhân viên Z-A',
};
