import { Button, Card } from '@/components/ui';
import { ShiftCalendarItem, ShiftStatus, ShiftType, User } from '@/types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { ShiftManagerCreateDialog } from './ShiftManagerCreateDialog';

interface ShiftManagerCalendarProps {
    calendar: ShiftCalendarItem[];
    month: number;
    year: number;
    staff: User[];
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onDeleteShift: (shiftId: number) => void;
}

export function ShiftManagerCalendar({
    calendar,
    month,
    year,
    staff,
    onPrevMonth,
    onNextMonth,
    onDeleteShift,
}: ShiftManagerCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const monthNames = [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
    ];

    // Lấy tên tháng hiện tại
    const getCurrentMonthName = () => {
        return `${monthNames[month - 1]} ${year}`;
    };

    // Lấy màu cho trạng thái ca làm việc
    const getShiftStatusColor = (status: ShiftStatus) => {
        switch (status) {
            case ShiftStatus.COMPLETED:
                return 'bg-green-100 text-green-800';
            case ShiftStatus.ABSENT:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    // Xử lý khi click vào một ngày
    const handleDateClick = (date: string | null) => {
        if (date) {
            setSelectedDate(date);
            setCreateDialogOpen(true);
        }
    };

    return (
        <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b p-4">
                <Button variant="ghost" size="sm" onClick={onPrevMonth}>
                    <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-medium">{getCurrentMonthName()}</h2>
                <Button variant="ghost" size="sm" onClick={onNextMonth}>
                    <ChevronRightIcon className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-7 border-b">
                {dayNames.map((day, index) => (
                    <div key={index} className="p-2 text-center text-sm font-medium">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 p-2">
                {calendar.map((item, index) => (
                    <div
                        key={index}
                        className={`min-h-[120px] rounded-md border p-2 ${
                            !item.isCurrentMonth ? 'bg-gray-50 text-gray-400' : item.isToday ? 'border-blue-200 bg-blue-50' : ''
                        }`}
                    >
                        {item.date && (
                            <>
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-sm font-medium">{new Date(item.date).getDate()}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleDateClick(item.date)}
                                        disabled={new Date(item.date) < new Date(new Date().setHours(0, 0, 0, 0))}
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        <span className="sr-only">Thêm ca</span>
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    {item.shifts.map((shift) => (
                                        <div
                                            key={shift.id}
                                            className={`flex items-center justify-between rounded-md p-1 text-xs ${getShiftStatusColor(
                                                shift.status
                                            )}`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{shift.user?.full_name}</span>
                                                <span>{shift.shift_type === ShiftType.A ? 'Ca sáng' : 'Ca chiều'}</span>
                                            </div>
                                            {shift.status === ShiftStatus.PLANNED && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => onDeleteShift(shift.id)}
                                                >
                                                    <TrashIcon className="h-3 w-3 text-red-500" />
                                                    <span className="sr-only">Xóa</span>
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <ShiftManagerCreateDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                date={selectedDate}
                staff={staff}
            />
        </Card>
    );
}
