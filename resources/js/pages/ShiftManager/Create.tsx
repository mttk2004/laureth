import { Button, Card } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { BulkShiftFormData, ShiftFormData, ShiftType, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeftIcon, CalendarIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface CreateShiftManagerProps {
    user: User;
    staff: User[];
}

export default function ShiftManagerCreate({ user, staff }: CreateShiftManagerProps) {
    const [shifts, setShifts] = useState<ShiftFormData[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    // Thêm ca làm việc mới
    const addShift = () => {
        setShifts([
            ...shifts,
            {
                user_id: '',
                date: '',
                shift_type: ShiftType.A,
            },
        ]);
    };

    // Xóa ca làm việc
    const removeShift = (index: number) => {
        const newShifts = [...shifts];
        newShifts.splice(index, 1);
        setShifts(newShifts);
    };

    // Cập nhật ca làm việc
    const updateShift = (index: number, field: keyof ShiftFormData, value: string) => {
        const newShifts = [...shifts];
        newShifts[index] = { ...newShifts[index], [field]: value };
        setShifts(newShifts);
    };

    // Xử lý submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (shifts.length === 0) {
            addToast('Vui lòng thêm ít nhất một ca làm việc', 'error');
            return;
        }

        setIsSubmitting(true);

        const formData: BulkShiftFormData = {
            shifts,
        };

        router.post('/api/shifts-management/bulk', formData as any, {
            onSuccess: (response) => {
                const data = response.props as any;
                addToast(
                    `Đã tạo ${data.created} ca làm việc thành công, bỏ qua ${data.skipped} ca trùng lặp hoặc không hợp lệ`,
                    'success'
                );
                setIsSubmitting(false);
                router.visit('/shifts-management');
            },
            onError: () => {
                addToast('Có lỗi xảy ra khi tạo ca làm việc', 'error');
                setIsSubmitting(false);
            },
        });
    };

    // Quay lại trang quản lý ca làm việc
    const goBack = () => {
        router.visit('/shifts-management');
    };

    return (
        <AppLayout user={user}>
            <Head title="Xếp lịch làm việc hàng loạt" />

            <div>
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <Button variant="ghost" className="mr-2" onClick={goBack}>
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">Xếp lịch làm việc hàng loạt</h1>
                    </div>
                </div>

                <Card className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 flex justify-between">
                            <h2 className="text-lg font-medium">Danh sách ca làm việc</h2>
                            <Button type="button" onClick={addShift}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Thêm ca làm việc
                            </Button>
                        </div>

                        {shifts.length === 0 ? (
                            <div className="mb-4 flex flex-col items-center justify-center rounded-md border border-dashed p-8">
                                <CalendarIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                                <p className="text-center text-muted-foreground">Chưa có ca làm việc nào được thêm</p>
                                <Button className="mt-4" onClick={addShift}>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Thêm ca làm việc
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {shifts.map((shift, index) => (
                                    <div key={index} className="flex items-center gap-4 rounded-md border p-4">
                                        <div className="flex-1">
                                            <label htmlFor={`user_id_${index}`} className="mb-1 block text-sm font-medium">
                                                Nhân viên
                                            </label>
                                            <select
                                                id={`user_id_${index}`}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={shift.user_id}
                                                onChange={(e) => updateShift(index, 'user_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Chọn nhân viên</option>
                                                {staff.map((staffMember) => (
                                                    <option key={staffMember.id} value={staffMember.id}>
                                                        {staffMember.full_name} ({staffMember.position === 'SL' ? 'Trưởng ca' : 'Nhân viên'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor={`date_${index}`} className="mb-1 block text-sm font-medium">
                                                Ngày
                                            </label>
                                            <input
                                                id={`date_${index}`}
                                                type="date"
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={shift.date}
                                                onChange={(e) => updateShift(index, 'date', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor={`shift_type_${index}`} className="mb-1 block text-sm font-medium">
                                                Ca làm việc
                                            </label>
                                            <select
                                                id={`shift_type_${index}`}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={shift.shift_type}
                                                onChange={(e) => updateShift(index, 'shift_type', e.target.value as ShiftType)}
                                                required
                                            >
                                                <option value={ShiftType.A}>Ca sáng (8h-16h)</option>
                                                <option value={ShiftType.B}>Ca chiều (14h30-22h30)</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeShift(index)}
                                                className="h-10 w-10"
                                            >
                                                <TrashIcon className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={goBack} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting || shifts.length === 0}>
                                {isSubmitting ? 'Đang xử lý...' : 'Lưu lịch làm việc'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
