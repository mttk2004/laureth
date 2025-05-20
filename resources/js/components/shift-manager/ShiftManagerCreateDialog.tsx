import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui';
import { ShiftFormData, ShiftType, User } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface ShiftManagerCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: string | null;
    staff: User[];
}

export function ShiftManagerCreateDialog({ open, onOpenChange, date, staff }: ShiftManagerCreateDialogProps) {
    const [formData, setFormData] = useState<ShiftFormData>({
        user_id: '',
        date: date || '',
        shift_type: ShiftType.A,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cập nhật formData khi date thay đổi
    useState(() => {
        if (date) {
            setFormData((prev) => ({ ...prev, date }));
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/shifts-management', formData, {
            onSuccess: () => {
                onOpenChange(false);
                setIsSubmitting(false);
                // Reset form
                setFormData({
                    user_id: '',
                    date: date || '',
                    shift_type: ShiftType.A,
                });
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tạo ca làm việc mới</DialogTitle>
                    <DialogDescription>
                        Thêm ca làm việc cho nhân viên vào ngày {date ? new Date(date).toLocaleDateString('vi-VN') : ''}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="user_id" className="text-sm font-medium">
                                Nhân viên
                            </label>
                            <select
                                id="user_id"
                                name="user_id"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.user_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Chọn nhân viên</option>
                                {staff.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name} ({user.position === 'SL' ? 'Trưởng ca' : 'Nhân viên'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="shift_type" className="text-sm font-medium">
                                Ca làm việc
                            </label>
                            <select
                                id="shift_type"
                                name="shift_type"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.shift_type}
                                onChange={handleChange}
                                required
                            >
                                <option value={ShiftType.A}>Ca sáng (8h-16h)</option>
                                <option value={ShiftType.B}>Ca chiều (14h30-22h30)</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang xử lý...' : 'Tạo ca làm việc'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
