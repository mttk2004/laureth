import { User } from '@/types/user';
import { AttendanceRecord } from '@/types/attendance_record';
import { Shift, ShiftType } from '@/types/shift';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { formatTime } from '@/lib/format';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClockIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

export default function AttendanceIndex({ user, currentShift, attendanceHistory }: AttendancePageProps) {
  const [processing, setProcessing] = useState(false);
  const { addToast } = useToast();

  // Kiểm tra trạng thái check-in/check-out của ca làm việc hiện tại
  const canCheckIn = useMemo(() => {
    if (!currentShift) return false;
    return !currentShift.attendanceRecord || !currentShift.attendanceRecord.check_in;
  }, [currentShift]);

  const canCheckOut = useMemo(() => {
    if (!currentShift) return false;
    return currentShift.attendanceRecord &&
           currentShift.attendanceRecord.check_in &&
           !currentShift.attendanceRecord.check_out;
  }, [currentShift]);

  // Xử lý sự kiện check-in
  const handleCheckIn = () => {
    if (!currentShift || processing) return;

    setProcessing(true);

    router.post(route('attendance.check-in'), {
      shift_id: currentShift.id,
    }, {
      onSuccess: () => {
        addToast('Chấm công vào ca làm việc thành công', 'success');
        setProcessing(false);

        // Tải lại trang để cập nhật dữ liệu
        router.reload();
      },
      onError: (errors) => {
        console.error(errors);
        addToast('Không thể chấm công vào. Vui lòng thử lại sau.', 'error');
        setProcessing(false);
      }
    });
  };

  // Xử lý sự kiện check-out
  const handleCheckOut = () => {
    if (!currentShift || processing) return;

    setProcessing(true);

    router.post(route('attendance.check-out'), {
      shift_id: currentShift.id,
    }, {
      onSuccess: () => {
        addToast('Chấm công ra ca làm việc thành công', 'success');
        setProcessing(false);

        // Tải lại trang để cập nhật dữ liệu
        router.reload();
      },
      onError: (errors) => {
        console.error(errors);
        addToast('Không thể chấm công ra. Vui lòng thử lại sau.', 'error');
        setProcessing(false);
      }
    });
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
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Bạn không có ca làm việc nào trong hôm nay
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lịch sử chấm công */}
        <div>
          <h2 className="text-xl font-bold mb-4">Lịch sử chấm công</h2>
          <DataTable
            data={attendanceHistory.data}
            columns={[
              {
                key: 'id',
                label: 'ID',
                render: (record) => `#${record.id}`
              },
              {
                key: 'date',
                label: 'Ngày',
                render: (record) => new Date(record.shift.date).toLocaleDateString('vi-VN')
              },
              {
                key: 'shift_type',
                label: 'Ca làm việc',
                render: (record) => getShiftTypeLabel(record.shift.shift_type)
              },
              {
                key: 'check_in',
                label: 'Giờ vào',
                render: (record) => record.check_in ? formatTime(record.check_in) : '--:--'
              },
              {
                key: 'check_out',
                label: 'Giờ ra',
                render: (record) => record.check_out ? formatTime(record.check_out) : '--:--'
              },
              {
                key: 'total_hours',
                label: 'Tổng giờ',
                render: (record) => record.total_hours ? `${Number(record.total_hours).toFixed(1)} giờ` : '--'
              }
            ]}
            pagination={{
              links: attendanceHistory.links,
              from: attendanceHistory.from,
              to: attendanceHistory.to,
              total: attendanceHistory.total
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
}
