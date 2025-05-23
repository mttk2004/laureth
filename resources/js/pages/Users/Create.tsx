import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Store } from '@/types/store';
import { User, UserRole, roleLabels } from '@/types/user';
import { Head, router } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

interface Props {
    stores: Store[];
    user: User;
}

export default function UserCreate({ stores, user }: Props) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        position: '' as UserRole,
        store_id: '',
        commission_rate: '',
        hourly_wage: '',
        base_salary: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    // Lọc danh sách cửa hàng phù hợp dựa trên vai trò đã chọn
    const availableStores = useMemo(() => {
        if (formData.position === 'SM') {
            // Nếu tạo SM mới, chỉ hiển thị các cửa hàng chưa có quản lý
            return stores.filter((store) => !store.manager_id);
        } else {
            // Nếu tạo SL, SA thì hiển thị tất cả các cửa hàng
            return stores;
        }
    }, [stores, formData.position]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name === 'position') {
            // Khi thay đổi vị trí, cập nhật các trường lương tương ứng và reset store_id
            if (value === 'SM') {
                setFormData((prev) => ({
                    ...prev,
                    position: value as UserRole,
                    hourly_wage: '',
                    base_salary: '10000000', // Mặc định lương cơ bản cho SM
                    store_id: '', // Reset store_id khi chuyển vai trò
                }));
            } else if (['SL', 'SA'].includes(value)) {
                setFormData((prev) => ({
                    ...prev,
                    position: value as UserRole,
                    base_salary: '',
                    hourly_wage: '25000', // Mặc định lương theo giờ
                }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/users', formData, {
            onSuccess: () => {
                addToast('Người dùng đã được tạo thành công', 'success');
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            },
        });
    };

    // Kiểm tra xem có cần hiển thị trường lương cơ bản hay không
    const showBaseSalary = formData.position === 'SM';

    // Kiểm tra xem có cần hiển thị trường lương theo giờ hay không
    const showHourlyWage = ['SL', 'SA'].includes(formData.position);

    return (
        <AppLayout user={user}>
            <Head title="Thêm nhân viên mới" />

            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Thêm nhân viên mới</h1>
                </div>

                <div className="bg-background border-border overflow-hidden rounded-lg border p-6 shadow">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="full_name">Họ và tên</Label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        required
                                        className={errors.full_name ? 'border-red-500' : ''}
                                    />
                                    {errors.full_name && <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className={errors.phone ? 'border-red-500' : ''}
                                    />
                                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="position">Vị trí</Label>
                                    <Select value={formData.position} onValueChange={(value) => handleSelectChange('position', value)}>
                                        <SelectTrigger id="position" className={errors.position ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Chọn vị trí" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SM">{roleLabels.SM}</SelectItem>
                                            <SelectItem value="SL">{roleLabels.SL}</SelectItem>
                                            <SelectItem value="SA">{roleLabels.SA}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.position && <p className="mt-1 text-sm text-red-500">{errors.position}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="store_id">Cửa hàng</Label>
                                    <Select
                                        value={formData.store_id}
                                        onValueChange={(value) => handleSelectChange('store_id', value)}
                                        disabled={formData.position === 'SM' && availableStores.length === 0}
                                    >
                                        <SelectTrigger id="store_id" className={errors.store_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Chọn cửa hàng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableStores.map((store) => (
                                                <SelectItem key={store.id} value={store.id.toString()}>
                                                    {store.name} {store.manager_id ? '(Đã có SM)' : ''}
                                                </SelectItem>
                                            ))}
                                            {formData.position === 'SM' && availableStores.length === 0 && (
                                                <SelectItem value="no_available_stores" disabled>
                                                    Không có cửa hàng khả dụng (tất cả đã có SM)
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.store_id && <p className="mt-1 text-sm text-red-500">{errors.store_id}</p>}
                                    {formData.position === 'SM' && availableStores.length === 0 && (
                                        <p className="mt-1 text-sm text-amber-500">
                                            Tất cả cửa hàng đã có quản lý. Vui lòng tạo cửa hàng mới hoặc thay đổi quản lý hiện tại.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="commission_rate">Tỷ lệ hoa hồng (%)</Label>
                                    <Input
                                        id="commission_rate"
                                        name="commission_rate"
                                        type="number"
                                        value={formData.commission_rate}
                                        onChange={handleInputChange}
                                        min="10"
                                        max="1000"
                                        step="1"
                                        className={errors.commission_rate ? 'border-red-500' : ''}
                                        placeholder="Nhập % hoa hồng (vd: 5 cho 5%)"
                                        disabled={formData.position === 'SM'}
                                    />
                                    {errors.commission_rate && <p className="mt-1 text-sm text-red-500">{errors.commission_rate}</p>}
                                </div>

                                {showBaseSalary && (
                                    <div>
                                        <Label htmlFor="base_salary">Lương cơ bản (VND)</Label>
                                        <Input
                                            id="base_salary"
                                            name="base_salary"
                                            type="number"
                                            value={formData.base_salary}
                                            onChange={handleInputChange}
                                            min="10000000"
                                            step="1"
                                            className={errors.base_salary ? 'border-red-500' : ''}
                                            required={showBaseSalary}
                                        />
                                        {errors.base_salary && <p className="mt-1 text-sm text-red-500">{errors.base_salary}</p>}
                                    </div>
                                )}

                                {showHourlyWage && (
                                    <div>
                                        <Label htmlFor="hourly_wage">Lương theo giờ (VND)</Label>
                                        <Input
                                            id="hourly_wage"
                                            name="hourly_wage"
                                            type="number"
                                            value={formData.hourly_wage}
                                            onChange={handleInputChange}
                                            min="25000"
                                            step="1"
                                            className={errors.hourly_wage ? 'border-red-500' : ''}
                                            required={showHourlyWage}
                                        />
                                        {errors.hourly_wage && <p className="mt-1 text-sm text-red-500">{errors.hourly_wage}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.visit('/users')} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Đang lưu...' : 'Lưu nhân viên'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
