import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { formatTime } from '@/lib/format';
import { AttendanceRecord } from '@/types/attendance_record';
import { Shift, ShiftType } from '@/types/shift';
import { User } from '@/types/user';
import { Head, router } from '@inertiajs/react';
import { ClockIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface AttendancePageProps {
    user: User;
    currentShift: Shift & { attendanceRecord?: AttendanceRecord | null };
    attendanceHistory: {
        data: (AttendanceRecord & { shift: Shift })[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        from: number;
        to: number;
        total: number;
    };
    hasAttendanceRecord: boolean;
    checkInTime: string | null;
    checkOutTime: string | null;
    error?: string;
    success?: boolean;
    message?: string;
}

export default function AttendanceIndex({
    user,
    currentShift: initialShift,
    attendanceHistory: initialHistory,
    hasAttendanceRecord: initialHasAttendanceRecord,
    checkInTime: initialCheckInTime,
    checkOutTime: initialCheckOutTime,
    error,
    success,
    message,
}: AttendancePageProps) {
    const [processing, setProcessing] = useState(false);
    const [currentShift, setCurrentShift] = useState(initialShift);
    const [attendanceHistory, setAttendanceHistory] = useState(initialHistory);
    const { addToast } = useToast();
    const [hasAttendanceRecord, setHasAttendanceRecord] = useState(initialHasAttendanceRecord);
    const [checkInTime, setCheckInTime] = useState(initialCheckInTime);
    const [checkOutTime, setCheckOutTime] = useState(initialCheckOutTime);

    // Cập nhật state khi props thay đổi - chỉ chạy khi các prop thực sự thay đổi
    useEffect(() => {
        setCurrentShift(initialShift);
        setAttendanceHistory(initialHistory);
        setHasAttendanceRecord(initialHasAttendanceRecord);
        setCheckInTime(initialCheckInTime);
        setCheckOutTime(initialCheckOutTime);
    }, [initialShift, initialHistory, initialHasAttendanceRecord, initialCheckInTime, initialCheckOutTime]);

    // Xử lý thông báo - chỉ chạy một lần khi có thông báo mới
    useEffect(() => {
        if (error) {
            addToast(error, 'error');
        } else if (success && message) {
            addToast(message, 'success');
        }
    }, [error, success, message]);

    // Kiểm tra trạng thái check-in/check-out của ca làm việc hiện tại
    const canCheckIn = useMemo(() => {
        if (!currentShift) return false;
        return !hasAttendanceRecord || !checkInTime;
    }, [currentShift, hasAttendanceRecord, checkInTime]);

    const canCheckOut = useMemo(() => {
        if (!currentShift) return false;
        return hasAttendanceRecord && !!checkInTime && !checkOutTime;
    }, [currentShift, hasAttendanceRecord, checkInTime, checkOutTime]);

    // Xử lý sự kiện check-in
    const handleCheckIn = () => {
        if (!currentShift || processing || !canCheckIn) return;

        setProcessing(true);

        router.post(
            route('attendance.check-in'),
            {
                shift_id: currentShift.id,
            },
            {
                preserveState: false,
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: (errors) => {
                    if (errors.message) {
                        addToast(errors.message, 'error');
                    } else {
                        addToast('Không thể chấm công vào. Vui lòng thử lại sau.', 'error');
                    }
                    setProcessing(false);
                },
            },
        );
    };

    // Xử lý sự kiện check-out
    const handleCheckOut = () => {
        if (!currentShift || processing || !canCheckOut) return;

        setProcessing(true);

        router.post(
            route('attendance.check-out'),
            {
                shift_id: currentShift.id,
            },
            {
                preserveState: false,
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: (errors) => {
                    if (errors.message) {
                        addToast(errors.message, 'error');
                    } else {
                        addToast('Không thể chấm công ra. Vui lòng thử lại sau.', 'error');
                    }
                    setProcessing(false);
                },
            },
        );
    };

    // Lấy tên ca làm việc
    const getShiftTypeLabel = (shiftType: ShiftType) => {
        return shiftType === ShiftType.A ? 'Ca sáng (8h-16h)' : 'Ca chiều (14h30-22h30)';
    };

    return (
        <AppLayout user={user}>
            <Head title="Chấm công" />

            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Chấm công</h1>

                {/* Thông tin ca làm việc hiện tại */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ClockIcon className="mr-2 h-5 w-5" />
                            Ca làm việc hôm nay
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentShift ? (
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <div className="text-muted-foreground text-sm">Ca làm việc:</div>
                                        <div className="font-medium">{getShiftTypeLabel(currentShift.shift_type)}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground text-sm">Ngày:</div>
                                        <div className="font-medium">{new Date(currentShift.date).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                    {currentShift.attendanceRecord && (
                                        <>
                                            <div>
                                                <div className="text-muted-foreground text-sm">Giờ vào:</div>
                                                <div className="font-medium">
                                                    {currentShift.attendanceRecord.check_in
                                                        ? formatTime(currentShift.attendanceRecord.check_in)
                                                        : '--:--'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground text-sm">Giờ ra:</div>
                                                <div className="font-medium">
                                                    {currentShift.attendanceRecord.check_out
                                                        ? formatTime(currentShift.attendanceRecord.check_out)
                                                        : '--:--'}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Hiển thị nút chấm công hoặc thông báo đã hoàn thành */}
                                {hasAttendanceRecord && checkInTime && checkOutTime ? (
                                    <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4 text-center">
                                        <p className="font-medium text-green-700">Bạn đã hoàn thành ca làm việc hôm nay!</p>
                                        <p className="mt-1 text-sm text-green-600">
                                            Giờ vào: {formatTime(checkInTime)} - Giờ ra: {formatTime(checkOutTime)} - Tổng:{' '}
                                            {currentShift.attendanceRecord?.total_hours
                                                ? Number(currentShift.attendanceRecord.total_hours).toFixed(1)
                                                : '0'}{' '}
                                            giờ
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex justify-center gap-4">
                                        <Button
                                            onClick={handleCheckIn}
                                            disabled={!canCheckIn || processing}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {processing && canCheckIn ? 'Đang xử lý...' : 'Chấm công vào'}
                                        </Button>
                                        <Button
                                            onClick={handleCheckOut}
                                            disabled={!canCheckOut || processing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing && canCheckOut ? 'Đang xử lý...' : 'Chấm công ra'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-muted-foreground py-4 text-center">Bạn không có ca làm việc nào trong hôm nay</div>
                        )}
                    </CardContent>
                </Card>

                {/* Lịch sử chấm công */}
                <div>
                    <h2 className="mb-4 text-xl font-bold">Lịch sử chấm công</h2>
                    <DataTable
                        data={attendanceHistory.data}
                        columns={[
                            {
                                key: 'id',
                                label: 'ID',
                                render: (record) => `#${record.id}`,
                            },
                            {
                                key: 'date',
                                label: 'Ngày',
                                render: (record) => new Date(record.shift.date).toLocaleDateString('vi-VN'),
                            },
                            {
                                key: 'shift_type',
                                label: 'Ca làm việc',
                                render: (record) => getShiftTypeLabel(record.shift.shift_type),
                            },
                            {
                                key: 'check_in',
                                label: 'Giờ vào',
                                render: (record) => (record.check_in ? formatTime(record.check_in) : '--:--'),
                            },
                            {
                                key: 'check_out',
                                label: 'Giờ ra',
                                render: (record) => (record.check_out ? formatTime(record.check_out) : '--:--'),
                            },
                            {
                                key: 'total_hours',
                                label: 'Tổng giờ',
                                render: (record) => (record.total_hours ? `${Number(record.total_hours).toFixed(1)} giờ` : '--'),
                            },
                        ]}
                        pagination={{
                            links: attendanceHistory.links,
                            from: attendanceHistory.from,
                            to: attendanceHistory.to,
                            total: attendanceHistory.total,
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
