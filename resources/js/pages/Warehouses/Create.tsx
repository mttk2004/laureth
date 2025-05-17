import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Store, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import React, { FormEvent, useState } from 'react';

interface Props {
    user: User;
    stores: Store[];
}

export default function WarehouseCreate({ user, stores }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        is_main: false,
        store_id: 'no_store',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string | boolean }) => {
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

        // Chuyển đổi giá trị
        const data = {
            ...formData,
            store_id: formData.store_id === 'no_store' ? null : formData.store_id,
        };

        router.post('/warehouses', data, {
            onSuccess: () => {
                addToast('Thêm kho mới thành công', 'success');
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
                addToast('Có lỗi xảy ra khi thêm kho', 'error');
            },
        });
    };

    return (
        <AppLayout user={user}>
            <Head title="Thêm kho mới" />

            <div className="mx-auto max-w-4xl py-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Thêm kho mới</h1>
                </div>

                <div className="bg-background border-border overflow-hidden rounded-lg border p-6 shadow">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Tên kho</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nhập tên kho"
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
                                        placeholder="Nhập địa chỉ kho"
                                        className={errors.address ? 'border-red-500' : ''}
                                    />
                                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_main"
                                        checked={formData.is_main}
                                        onCheckedChange={(checked) => handleChange({ name: 'is_main', value: !!checked })}
                                    />
                                    <Label htmlFor="is_main">Đây là kho chính</Label>
                                    {errors.is_main && <p className="mt-1 text-sm text-red-500">{errors.is_main}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="store_id">Cửa hàng</Label>
                                    <Select
                                        name="store_id"
                                        value={formData.store_id}
                                        onValueChange={(value) => handleChange({ name: 'store_id', value })}
                                    >
                                        <SelectTrigger id="store_id" className={errors.store_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Chọn cửa hàng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no_store">Không có</SelectItem>
                                            {stores.map((store) => (
                                                <SelectItem key={store.id} value={store.id}>
                                                    {store.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.store_id && <p className="mt-1 text-sm text-red-500">{errors.store_id}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.visit('/warehouses')}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Đang xử lý...' : 'Thêm kho'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
