import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StaffLayout from '@/layouts/staff-layout';
import { formatTime } from '@/lib/format';
import { Shift, ShiftStatus, ShiftType } from '@/types/shift';
import { User } from '@/types/user';
import { Head, router } from '@inertiajs/react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';

interface ShiftCalendarItem {
    date: string | null;
    shifts: (Shift & { attendanceRecord?: { check_in: string | null; check_out: string | null } | null })[];
    isCurrentMonth: boolean;
    isToday?: boolean;
}

interface ShiftPageProps {
    user: User;
    shifts: {
        calendar: ShiftCalendarItem[];
        month: number;
        year: number;
    };
    summary: {
        totalShifts: number;
        completedShifts: number;
        absentShifts: number;
        remainingShifts: number;
        totalHours: number;
        availableMonths: {
            month: number;
            year: number;
            label: string;
        }[];
    };
    filters: {
        month: number;
        year: number;
    };
}

export default function ShiftIndex({ user, shifts, summary, filters }: ShiftPageProps) {
    const [selectedMonth, setSelectedMonth] = useState(filters.month);
    const [selectedYear, setSelectedYear] = useState(filters.year);

    // Xử lý khi thay đổi tháng
    const handleMonthChange = (month: number, year: number) => {
        router.get('/shift', { month, year }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setSelectedMonth(month);
                setSelectedYear(year);
            },
        });
    };

    // Chuyển sang tháng trước
    const goToPreviousMonth = () => {
        let newMonth = selectedMonth - 1;
        let newYear = selectedYear;

        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        }

        handleMonthChange(newMonth, newYear);
    };

    // Chuyển sang tháng sau
    const goToNextMonth = () => {
        let newMonth = selectedMonth + 1;
        let newYear = selectedYear;

        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }

        handleMonthChange(newMonth, newYear);
    };

    // Lấy tên tháng hiện tại
    const getCurrentMonthName = () => {
        const monthNames = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        return `${monthNames[selectedMonth - 1]} ${selectedYear}`;
    };

    // Lấy tên ca làm việc
    const getShiftTypeLabel = (shiftType: ShiftType) => {
        return shiftType === ShiftType.A ? 'Ca sáng (8h-16h)' : 'Ca chiều (14h30-22h30)';
    };

    // Lấy màu cho trạng thái ca làm việc
    const getStatusColor = (status: ShiftStatus) => {
        switch (status) {
            case ShiftStatus.COMPLETED:
                return 'bg-green-100 text-green-800 border-green-300';
            case ShiftStatus.ABSENT:
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-300';
        }
    };

    // Lấy tên trạng thái ca làm việc
    const getStatusLabel = (status: ShiftStatus) => {
        switch (status) {
            case ShiftStatus.COMPLETED:
                return 'Đã hoàn thành';
            case ShiftStatus.ABSENT:
                return 'Vắng mặt';
            default:
                return 'Đã lên lịch';
        }
    };

    return (
        <StaffLayout user={user}>
            <Head title="Ca làm việc" />

            <div className="container py-6">
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Ca làm việc</h1>
                            <p className="text-muted-foreground mt-1">Xem lịch ca làm việc của bạn</p>
                        </div>

                        {/* Bộ chọn tháng */}
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousMonth}
                            >
                                <ChevronLeftIcon className="h-4 w-4" />
                            </Button>
                            <div className="min-w-[120px] text-center font-medium">
                                {getCurrentMonthName()}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextMonth}
                            >
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Thẻ tổng quan */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Tổng số ca
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.totalShifts}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Đã hoàn thành
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{summary.completedShifts}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Vắng mặt
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{summary.absentShifts}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Tổng giờ làm
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.totalHours?.toFixed(1) || 0}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Lịch ca làm việc */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CalendarIcon className="mr-2 h-5 w-5" />
                                Lịch ca làm việc
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Tiêu đề các ngày trong tuần */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => (
                                    <div key={index} className="text-center font-medium py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Lịch */}
                            <div className="grid grid-cols-7 gap-1">
                                {shifts.calendar.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`min-h-[100px] border rounded-md p-1 ${
                                            !item.isCurrentMonth
                                                ? 'bg-gray-50 text-gray-400'
                                                : item.isToday
                                                ? 'bg-blue-50 border-blue-200'
                                                : ''
                                        }`}
                                    >
                                        {item.date && (
                                            <>
                                                <div className="text-right text-sm font-medium mb-1">
                                                    {new Date(item.date).getDate()}
                                                </div>
                                                <div className="space-y-1">
                                                    {item.shifts.map((shift) => (
                                                        <div
                                                            key={shift.id}
                                                            className={`text-xs p-1 rounded border ${getStatusColor(
                                                                shift.status as ShiftStatus
                                                            )}`}
                                                        >
                                                            <div className="font-medium">
                                                                {getShiftTypeLabel(shift.shift_type as ShiftType)}
                                                            </div>
                                                            <div>{getStatusLabel(shift.status as ShiftStatus)}</div>
                                                            {shift.attendanceRecord && (
                                                                <div className="mt-1 text-xs">
                                                                    {shift.attendanceRecord.check_in && (
                                                                        <span>
                                                                            Vào: {formatTime(shift.attendanceRecord.check_in)}
                                                                        </span>
                                                                    )}
                                                                    {shift.attendanceRecord.check_out && (
                                                                        <span className="ml-1">
                                                                            - Ra: {formatTime(shift.attendanceRecord.check_out)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Chú thích */}
                            <div className="mt-4 flex flex-wrap gap-4">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded mr-2 bg-blue-100 border border-blue-300"></div>
                                    <span className="text-sm">Đã lên lịch</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded mr-2 bg-green-100 border border-green-300"></div>
                                    <span className="text-sm">Đã hoàn thành</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded mr-2 bg-red-100 border border-red-300"></div>
                                    <span className="text-sm">Vắng mặt</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StaffLayout>
    );
}
