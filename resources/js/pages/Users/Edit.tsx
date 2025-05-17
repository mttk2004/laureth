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
    editUser: User;
    stores: Store[];
    user: User;
}

export default function UserEdit({ editUser, stores, user }: Props) {
    // Chuyển đổi commission_rate từ thập phân sang phần trăm để hiển thị
    const commissionRatePercentage = editUser.commission_rate ? (editUser.commission_rate * 100).toString() : '';

    const [formData, setFormData] = useState({
        full_name: editUser.full_name,
        email: editUser.email,
        password: '',
        phone: editUser.phone,
        position: editUser.position,
        store_id: editUser.store_id || '',
        commission_rate: commissionRatePercentage,
        hourly_wage: editUser.hourly_wage?.toString() || '',
        base_salary: editUser.base_salary?.toString() || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    // Lọc ra các vị trí có thể thăng cấp dựa trên vai trò hiện tại
    const availablePositions = useMemo(() => {
        const positions: { value: UserRole; label: string }[] = [];

        // Luôn có thể giữ nguyên vai trò hiện tại
        positions.push({ value: editUser.position, label: roleLabels[editUser.position] });

        // Thêm các vai trò có thể thăng cấp
        if (editUser.position === 'SA') {
            positions.push({ value: 'SL', label: roleLabels['SL'] });
            positions.push({ value: 'SM', label: roleLabels['SM'] });
        } else if (editUser.position === 'SL') {
            positions.push({ value: 'SM', label: roleLabels['SM'] });
        }

        return positions;
    }, [editUser.position]);

    // Lọc danh sách cửa hàng phù hợp dựa trên vai trò hiện tại và vai trò mới
    const availableStores = useMemo(() => {
        // Nếu nhân viên đang ở cửa hàng, luôn có sẵn trong danh sách
        if (formData.position === 'SM') {
            // Nếu là SM hoặc thăng cấp lên SM
            // Hiển thị các cửa hàng không có quản lý và cửa hàng hiện tại của nhân viên
            return stores.filter((store) => !store.manager_id || store.manager_id === editUser.id || store.id === editUser.store_id);
        } else {
            // Nếu là SL, SA thì hiển thị tất cả các cửa hàng
            return stores;
        }
    }, [stores, formData.position, editUser.store_id, editUser.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name === 'position') {
            // Khi thay đổi vị trí, cập nhật các trường lương tương ứng
            if (value === 'SM') {
                setFormData((prev) => ({
                    ...prev,
                    position: value as UserRole,
                    hourly_wage: '',
                    base_salary: prev.base_salary || '10000000', // Mặc định lương cơ bản cho SM
                }));
            } else if (['SL', 'SA'].includes(value)) {
                setFormData((prev) => ({
                    ...prev,
                    position: value as UserRole,
                    base_salary: '',
                    hourly_wage: prev.hourly_wage || '25000', // Mặc định lương theo giờ
                }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(`/users/${editUser.id}`, formData, {
            onSuccess: () => {
                addToast('Thông tin người dùng đã được cập nhật thành công', 'success');
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
            <Head title="Chỉnh sửa thông tin nhân viên" />

            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Chỉnh sửa thông tin nhân viên</h1>
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
                                    <Label htmlFor="password">Mật khẩu (để trống nếu không đổi)</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
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
                                            {availablePositions.map((position) => (
                                                <SelectItem key={position.value} value={position.value}>
                                                    {position.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.position && <p className="mt-1 text-sm text-red-500">{errors.position}</p>}
                                    {formData.position !== editUser.position && (
                                        <p className="mt-1 text-sm text-blue-500">
                                            Lưu ý: Việc thay đổi vai trò sẽ thay đổi cách tính lương của nhân viên
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="store_id">Cửa hàng</Label>
                                    <Select value={formData.store_id} onValueChange={(value) => handleSelectChange('store_id', value)}>
                                        <SelectTrigger id="store_id" className={errors.store_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Chọn cửa hàng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableStores.map((store) => (
                                                <SelectItem key={store.id} value={store.id.toString()}>
                                                    {store.name} {store.manager_id && store.manager_id !== editUser.id ? '(Đã có SM)' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.store_id && <p className="mt-1 text-sm text-red-500">{errors.store_id}</p>}
                                    {formData.position === 'SM' &&
                                        formData.store_id &&
                                        availableStores.find((s) => s.id === formData.store_id)?.manager_id &&
                                        availableStores.find((s) => s.id === formData.store_id)?.manager_id !== editUser.id && (
                                            <p className="mt-1 text-sm text-amber-500">
                                                Cửa hàng đã có quản lý. Nếu tiếp tục, quản lý hiện tại sẽ bị gỡ khỏi cửa hàng.
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
                                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
