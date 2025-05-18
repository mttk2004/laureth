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
}

export default function AttendanceIndex({
    user,
    currentShift: initialShift,
    attendanceHistory: initialHistory,
    hasAttendanceRecord: initialHasAttendanceRecord,
    checkInTime: initialCheckInTime,
    checkOutTime: initialCheckOutTime,
    error,
}: AttendancePageProps) {
    const [processing, setProcessing] = useState(false);
    const [currentShift, setCurrentShift] = useState(initialShift);
    const [attendanceHistory, setAttendanceHistory] = useState(initialHistory);
    const { addToast } = useToast();
    const [hasAttendanceRecord, setHasAttendanceRecord] = useState(initialHasAttendanceRecord);
    const [checkInTime, setCheckInTime] = useState(initialCheckInTime);
    const [checkOutTime, setCheckOutTime] = useState(initialCheckOutTime);

    // Cập nhật state khi props thay đổi
    useEffect(() => {
        console.log('Props changed, updating state with:', {
            initialShift,
            initialHistory,
            initialHasAttendanceRecord,
            initialCheckInTime,
            initialCheckOutTime,
        });
        setCurrentShift(initialShift);
        setAttendanceHistory(initialHistory);
        setHasAttendanceRecord(initialHasAttendanceRecord);
        setCheckInTime(initialCheckInTime);
        setCheckOutTime(initialCheckOutTime);
    }, [initialShift, initialHistory, initialHasAttendanceRecord, initialCheckInTime, initialCheckOutTime]);

    // Log khi component được mount
    useEffect(() => {
        console.log('Component mounted with initial data:', {
            initialShift,
            initialHistory,
            hasAttendanceRecord: initialShift && !!initialShift.attendanceRecord,
            checkIn: initialShift && initialShift.attendanceRecord ? initialShift.attendanceRecord.check_in : null,
            checkOut: initialShift && initialShift.attendanceRecord ? initialShift.attendanceRecord.check_out : null,
        });

        // Kiểm tra chi tiết về attendance record ban đầu
        if (initialShift && initialShift.attendanceRecord) {
            console.log('Initial attendance record details:', {
                id: initialShift.attendanceRecord.id,
                user_id: initialShift.attendanceRecord.user_id,
                shift_id: initialShift.attendanceRecord.shift_id,
                check_in: initialShift.attendanceRecord.check_in,
                check_out: initialShift.attendanceRecord.check_out,
                total_hours: initialShift.attendanceRecord.total_hours,
                created_at: initialShift.attendanceRecord.created_at,
                updated_at: initialShift.attendanceRecord.updated_at,
                type_of_check_in: typeof initialShift.attendanceRecord.check_in,
                type_of_check_out: typeof initialShift.attendanceRecord.check_out,
                is_empty_object: Object.keys(initialShift.attendanceRecord as object).length === 0,
            });
        }
    }, []);

    // Kiểm tra trạng thái check-in/check-out của ca làm việc hiện tại
    const canCheckIn = useMemo(() => {
        // Sử dụng trực tiếp state hasAttendanceRecord và checkInTime
        if (!currentShift) return false;

        // Nếu không có attendance record hoặc không có check-in
        if (!hasAttendanceRecord) return true;

        // Nếu có attendance record nhưng không có check-in
        return !checkInTime;
    }, [currentShift, hasAttendanceRecord, checkInTime]);

    const canCheckOut = useMemo(() => {
        // Sử dụng trực tiếp state hasAttendanceRecord, checkInTime và checkOutTime
        if (!currentShift) return false;

        // Nếu không có attendance record hoặc không có check-in
        if (!hasAttendanceRecord || !checkInTime) return false;

        // Nếu có check-in nhưng chưa có check-out
        return !checkOutTime;
    }, [currentShift, hasAttendanceRecord, checkInTime, checkOutTime]);

    // Debug
    useEffect(() => {
        console.log('Current shift state:', currentShift);
        console.log('Direct state values:', {
            hasAttendanceRecord,
            checkInTime,
            checkOutTime,
        });
        console.log('Can check in:', canCheckIn);
        console.log('Can check out:', canCheckOut);
    }, [currentShift, hasAttendanceRecord, checkInTime, checkOutTime, canCheckIn, canCheckOut]);

    // Kiểm tra và cập nhật trạng thái attendance record
    useEffect(() => {
        if (currentShift) {
            // Kiểm tra attendance record có tồn tại và có dữ liệu hợp lệ không
            const hasRecord =
                !!currentShift.attendanceRecord && typeof currentShift.attendanceRecord === 'object' && currentShift.attendanceRecord !== null;

            // Kiểm tra xem có phải là object rỗng không
            const isEmptyObject = hasRecord && Object.keys(currentShift.attendanceRecord as object).length === 0;

            // Kiểm tra xem có chứa dữ liệu hợp lệ không
            const hasValidData =
                hasRecord &&
                !isEmptyObject &&
                ('id' in (currentShift.attendanceRecord as object) ||
                    'check_in' in (currentShift.attendanceRecord as object) ||
                    'check_out' in (currentShift.attendanceRecord as object));

            // Chỉ coi là có attendance record nếu nó không phải là object rỗng và chứa dữ liệu hợp lệ
            const validRecord = hasRecord && !isEmptyObject && hasValidData;

            console.log('Attendance record check:', {
                hasRecord,
                isEmptyObject,
                hasValidData,
                validRecord,
                attendanceRecord: currentShift.attendanceRecord,
                typeofAttendanceRecord: typeof currentShift.attendanceRecord,
                keys: hasRecord ? Object.keys(currentShift.attendanceRecord as object) : [],
            });

            setHasAttendanceRecord(validRecord);
        } else {
            setHasAttendanceRecord(false);
        }
    }, [currentShift]);

    // Hiển thị lỗi nếu có
    useEffect(() => {
        if (error) {
            addToast(error, 'error');
        }
    }, [error]);

    // Xử lý sự kiện check-in
    const handleCheckIn = () => {
        if (!currentShift || processing || !canCheckIn) return;

        setProcessing(true);
        console.log('Starting check-in process for shift:', currentShift);

        router.post(
            route('attendance.check-in'),
            {
                shift_id: currentShift.id,
            },
            {
                preserveState: true,
                onSuccess: (response) => {
                    const data = response.props as { success?: boolean; message?: string };
                    if (data.success === false) {
                        // Xử lý lỗi từ server trả về
                        addToast(data.message || 'Không thể chấm công vào. Vui lòng thử lại sau.', 'error');
                        setProcessing(false);
                        return;
                    }

                    addToast('Chấm công vào ca làm việc thành công', 'success');
                    console.log('Check-in successful, updating local state');

                    // Cập nhật state sau khi check-in thành công
                    setCheckInTime(new Date().toISOString());

                    // Tải lại trang sau một khoảng thời gian ngắn để cập nhật dữ liệu từ server
                    console.log('Will reload page in 500ms');
                    setTimeout(() => {
                        console.log('Reloading page now');
                        router.visit(route('attendance.index'), {
                            preserveScroll: true,
                            replace: true,
                        });
                    }, 500);

                    setProcessing(false);
                },
                onError: (errors) => {
                    console.error('Check-in failed with errors:', errors);
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
        console.log('Starting check-out process for shift:', currentShift);

        router.post(
            route('attendance.check-out'),
            {
                shift_id: currentShift.id,
            },
            {
                preserveState: true,
                onSuccess: (response) => {
                    const data = response.props as { success?: boolean; message?: string };
                    if (data.success === false) {
                        // Xử lý lỗi từ server trả về
                        addToast(data.message || 'Không thể chấm công ra. Vui lòng thử lại sau.', 'error');
                        setProcessing(false);
                        return;
                    }

                    addToast('Chấm công ra ca làm việc thành công', 'success');
                    console.log('Check-out successful, updating local state');

                    // Cập nhật state sau khi check-out thành công
                    setCheckOutTime(new Date().toISOString());

                    // Tải lại trang sau một khoảng thời gian ngắn để cập nhật dữ liệu từ server
                    console.log('Will reload page in 500ms');
                    setTimeout(() => {
                        console.log('Reloading page now');
                        router.visit(route('attendance.index'), {
                            preserveScroll: true,
                            replace: true,
                        });
                    }, 500);

                    setProcessing(false);
                },
                onError: (errors) => {
                    console.error('Check-out failed with errors:', errors);
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
                                        <div className="text-sm text-muted-foreground">Ca làm việc:</div>
                                        <div className="font-medium">{getShiftTypeLabel(currentShift.shift_type)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Ngày:</div>
                                        <div className="font-medium">{new Date(currentShift.date).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                    {currentShift.attendanceRecord && (
                                        <>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Giờ vào:</div>
                                                <div className="font-medium">
                                                    {currentShift.attendanceRecord.check_in
                                                        ? formatTime(currentShift.attendanceRecord.check_in)
                                                        : '--:--'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Giờ ra:</div>
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
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-center">
                                        <p className="text-green-700 font-medium">
                                            Bạn đã hoàn thành ca làm việc hôm nay!
                                        </p>
                                        <p className="text-green-600 text-sm mt-1">
                                            Giờ vào: {formatTime(checkInTime)} - Giờ ra: {formatTime(checkOutTime)} - Tổng: {currentShift.attendanceRecord?.total_hours ? Number(currentShift.attendanceRecord.total_hours).toFixed(1) : '0'} giờ
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
