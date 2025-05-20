import { ShiftManagerCalendar } from '@/components/shift-manager';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { ShiftManagerPageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

export default function ShiftManagerIndex({ user, shifts, staff, filters }: ShiftManagerPageProps) {
    const [selectedMonth, setSelectedMonth] = useState(filters.month);
    const [selectedYear, setSelectedYear] = useState(filters.year);
    const { addToast } = useToast();

    // Xử lý khi thay đổi tháng
    const handleMonthChange = (month: number, year: number) => {
        router.get(
            '/shifts-management',
            { month, year },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedMonth(month);
                    setSelectedYear(year);
                },
            },
        );
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

    // Xử lý xóa ca làm việc
    const handleDeleteShift = (shiftId: number) => {
        if (confirm('Bạn có chắc chắn muốn xóa ca làm việc này không?')) {
            router.delete(`/shifts-management/${shiftId}`, {
                preserveState: true,
                onSuccess: () => {
                    addToast('Ca làm việc đã được xóa thành công', 'success');
                },
                onError: () => {
                    addToast('Không thể xóa ca làm việc', 'error');
                },
            });
        }
    };

    // Chuyển đến trang tạo ca làm việc hàng loạt
    const goToCreatePage = () => {
        router.visit('/shifts-management/create');
    };

    return (
        <AppLayout user={user}>
            <Head title="Quản lý ca làm việc" />

            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý ca làm việc</h1>
                    <Button onClick={goToCreatePage}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Xếp lịch hàng loạt
                    </Button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                        <div className="text-muted-foreground text-sm font-medium">Tổng số nhân viên</div>
                        <div className="mt-2 text-2xl font-bold">{staff.length}</div>
                    </div>
                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                        <div className="text-muted-foreground text-sm font-medium">Số ca làm việc trong tháng</div>
                        <div className="mt-2 text-2xl font-bold">{shifts.calendar.reduce((total, day) => total + day.shifts.length, 0)}</div>
                    </div>
                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                        <div className="text-muted-foreground text-sm font-medium">Ca sáng</div>
                        <div className="mt-2 text-2xl font-bold">
                            {shifts.calendar.reduce((total, day) => total + day.shifts.filter((shift) => shift.shift_type === 'A').length, 0)}
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                        <div className="text-muted-foreground text-sm font-medium">Ca chiều</div>
                        <div className="mt-2 text-2xl font-bold">
                            {shifts.calendar.reduce((total, day) => total + day.shifts.filter((shift) => shift.shift_type === 'B').length, 0)}
                        </div>
                    </div>
                </div>

                <ShiftManagerCalendar
                    calendar={shifts.calendar}
                    month={selectedMonth}
                    year={selectedYear}
                    staff={staff}
                    onPrevMonth={goToPreviousMonth}
                    onNextMonth={goToNextMonth}
                    onDeleteShift={handleDeleteShift}
                />
            </div>
        </AppLayout>
    );
}
