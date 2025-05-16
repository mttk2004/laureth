import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types/user';
import { router } from '@inertiajs/react';
import React, { FormEvent, useState } from 'react';

interface Props {
    user: User;
    managers: User[];
}

export default function StoreCreate({ user, managers }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        manager_id: 'no_manager',
        monthly_target: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { name: string; value: string }) => {
        const { name, value } = 'target' in e ? e.target : e;

        setFormData({
            ...formData,
            [name]: value,
        });

        // Xóa lỗi khi người dùng bắt đầu sửa trường đó
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Chuyển đổi giá trị sang số
        const data = {
            ...formData,
            monthly_target: formData.monthly_target ? parseFloat(formData.monthly_target) : 0,
            manager_id: formData.manager_id === 'no_manager' ? null : formData.manager_id || null,
        };

        router.post('/stores', data, {
            onSuccess: () => {
                addToast('Thêm cửa hàng mới thành công', 'success');
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
                addToast('Có lỗi xảy ra khi thêm cửa hàng', 'error');
            },
        });
    };

    return (
        <AppLayout user={user}>
            <div className="mx-auto max-w-4xl py-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Thêm cửa hàng mới</h1>
                </div>

                <div className="bg-background border-border overflow-hidden rounded-lg border p-6 shadow">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Tên cửa hàng</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nhập tên cửa hàng"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="address">Địa chỉ</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nhập địa chỉ cửa hàng"
                                        className={errors.address ? 'border-red-500' : ''}
                                    />
                                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="manager_id">Quản lý</Label>
                                    <Select
                                        name="manager_id"
                                        value={formData.manager_id}
                                        onValueChange={(value) => handleChange({ name: 'manager_id', value })}
                                    >
                                        <SelectTrigger id="manager_id" className={errors.manager_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Chọn quản lý cửa hàng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no_manager">Không có</SelectItem>
                                            {managers.map((manager) => (
                                                <SelectItem key={manager.id} value={manager.id}>
                                                    {manager.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.manager_id && <p className="mt-1 text-sm text-red-500">{errors.manager_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="monthly_target">Mục tiêu tháng (VNĐ)</Label>
                                    <Input
                                        id="monthly_target"
                                        name="monthly_target"
                                        type="number"
                                        min="0"
                                        step="1000000"
                                        value={formData.monthly_target}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nhập mục tiêu doanh thu tháng"
                                        className={errors.monthly_target ? 'border-red-500' : ''}
                                    />
                                    {errors.monthly_target && <p className="mt-1 text-sm text-red-500">{errors.monthly_target}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.visit('/stores')}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Đang xử lý...' : 'Thêm cửa hàng'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
