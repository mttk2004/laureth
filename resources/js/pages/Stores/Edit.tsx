import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Store } from '@/types/store';
import { User } from '@/types/user';
import { router } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import React, { FormEvent, useMemo, useState } from 'react';

interface StoreWithManager extends Store {
    manager?: User | null;
}

interface Props {
    user: User;
    managers: User[];
    editStore: StoreWithManager;
}

export default function StoreEdit({ user, managers, editStore }: Props) {
    const [formData, setFormData] = useState({
        name: editStore.name,
        address: editStore.address,
        manager_id: editStore.manager_id || 'no_manager',
        monthly_target: editStore.monthly_target.toString(),
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    // Nhóm nhân viên theo vai trò và cửa hàng
    const potentialManagersByType = useMemo(() => {
        const result: {
            currentManager: User | null;
            availableSMs: User[];
            storeEmployees: User[];
        } = {
            currentManager: null,
            availableSMs: [],
            storeEmployees: [],
        };

        managers.forEach((manager) => {
            // Quản lý hiện tại của cửa hàng
            if (manager.id === editStore.manager_id) {
                result.currentManager = manager;
            }
            // Các SM chưa được phân công
            else if (manager.position === 'SM' && !manager.store_id) {
                result.availableSMs.push(manager);
            }
            // Các nhân viên của cửa hàng này (có thể thăng cấp)
            else if (['SL', 'SA'].includes(manager.position) && manager.store_id === editStore.id) {
                result.storeEmployees.push(manager);
            }
        });

        return result;
    }, [managers, editStore]);

    // Kiểm tra nếu đang chọn một nhân viên không phải SM làm quản lý
    const isPromotingEmployee = useMemo(() => {
        if (formData.manager_id !== 'no_manager') {
            const selectedManager = managers.find((m) => m.id === formData.manager_id);
            return selectedManager && ['SL', 'SA'].includes(selectedManager.position);
        }
        return false;
    }, [formData.manager_id, managers]);

    // Kiểm tra nếu đang thay đổi quản lý cửa hàng
    const isChangingManager = useMemo(() => {
        return formData.manager_id !== editStore.manager_id && formData.manager_id !== 'no_manager' && editStore.manager_id !== null;
    }, [formData.manager_id, editStore.manager_id]);

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

        router.put(`/stores/${editStore.id}`, data, {
            onSuccess: () => {
                addToast('Cập nhật thông tin cửa hàng thành công', 'success');
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
                addToast('Có lỗi xảy ra khi cập nhật thông tin cửa hàng', 'error');
            },
        });
    };

    return (
        <AppLayout user={user}>
            <div className="mx-auto max-w-4xl py-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Chỉnh sửa cửa hàng</h1>
                </div>

                <div className="bg-background border-border overflow-hidden rounded-lg border p-6 shadow">
                    <div className="bg-muted mb-6 rounded-md p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground font-medium">ID:</span>
                                <span className="ml-2">{editStore.id}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground font-medium">Ngày tạo:</span>
                                <span className="ml-2">{new Date(editStore.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Hiển thị thông báo nếu đang thay đổi quản lý */}
                    {(isChangingManager || isPromotingEmployee) && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>
                                {isPromotingEmployee ? (
                                    <strong className="text-red-500">Thăng cấp nhân viên lên quản lý cửa hàng</strong>
                                ) : (
                                    <strong className="text-red-500">Thay đổi quản lý cửa hàng</strong>
                                )}
                            </AlertTitle>
                            <AlertDescription>
                                {isPromotingEmployee ? (
                                    <p className="text-sm text-red-500">
                                        Nhân viên này sẽ được thăng cấp lên vị trí Quản lý cửa hàng (SM). Hệ thống sẽ tự động điều chỉnh lương từ giờ
                                        sang lương cơ bản.
                                    </p>
                                ) : (
                                    <p className="text-sm text-red-500">
                                        Quản lý hiện tại ({potentialManagersByType.currentManager?.full_name || 'N/A'}) sẽ bị gỡ khỏi cửa hàng và trở
                                        thành nhân viên chờ phân công.
                                    </p>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

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

                                            {/* Quản lý hiện tại */}
                                            {potentialManagersByType.currentManager && (
                                                <>
                                                    <SelectItem value={potentialManagersByType.currentManager.id}>
                                                        {potentialManagersByType.currentManager.full_name} (SM hiện tại)
                                                    </SelectItem>
                                                    <SelectItem value="divider" disabled>
                                                        ──────────
                                                    </SelectItem>
                                                </>
                                            )}

                                            {/* Các SM khác chưa được phân công */}
                                            {potentialManagersByType.availableSMs.length > 0 && (
                                                <>
                                                    {potentialManagersByType.availableSMs.map((manager) => (
                                                        <SelectItem key={manager.id} value={manager.id}>
                                                            {manager.full_name} (SM)
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="divider2" disabled>
                                                        ──────────
                                                    </SelectItem>
                                                </>
                                            )}

                                            {/* Các nhân viên cửa hàng (tiềm năng thăng cấp) */}
                                            {potentialManagersByType.storeEmployees.length > 0 && (
                                                <>
                                                    {potentialManagersByType.storeEmployees.map((employee) => (
                                                        <SelectItem key={employee.id} value={employee.id}>
                                                            {employee.full_name} ({employee.position} → SM)
                                                        </SelectItem>
                                                    ))}
                                                </>
                                            )}
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
                                        min="1000000"
                                        step="100000"
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
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.visit('/stores')} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Đang lưu...' : 'Cập nhật cửa hàng'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
