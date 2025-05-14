import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { User, UserRole, roleLabels } from '@/types/user';
import { Store } from '@/types/store';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Thêm nhân viên mới</h1>
        </div>

        <div className="bg-background rounded-lg shadow overflow-hidden border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
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
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="position">Vị trí</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => handleSelectChange('position', value)}
                  >
                    <SelectTrigger id="position" className={errors.position ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Chọn vị trí" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SM">{roleLabels.SM}</SelectItem>
                      <SelectItem value="SL">{roleLabels.SL}</SelectItem>
                      <SelectItem value="SA">{roleLabels.SA}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                </div>

                <div>
                  <Label htmlFor="store_id">Cửa hàng</Label>
                  <Select
                    value={formData.store_id}
                    onValueChange={(value) => handleSelectChange('store_id', value)}
                  >
                    <SelectTrigger id="store_id" className={errors.store_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Chọn cửa hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.store_id && <p className="text-red-500 text-sm mt-1">{errors.store_id}</p>}
                </div>

                <div>
                  <Label htmlFor="commission_rate">Tỷ lệ hoa hồng (%)</Label>
                  <Input
                    id="commission_rate"
                    name="commission_rate"
                    type="number"
                    value={formData.commission_rate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className={errors.commission_rate ? 'border-red-500' : ''}
                    placeholder="Nhập % hoa hồng (vd: 5 cho 5%)"
                  />
                  {errors.commission_rate && (
                    <p className="text-red-500 text-sm mt-1">{errors.commission_rate}</p>
                  )}
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
                      min="0"
                      step="100000"
                      className={errors.base_salary ? 'border-red-500' : ''}
                      required={showBaseSalary}
                    />
                    {errors.base_salary && (
                      <p className="text-red-500 text-sm mt-1">{errors.base_salary}</p>
                    )}
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
                      min="0"
                      step="1000"
                      className={errors.hourly_wage ? 'border-red-500' : ''}
                      required={showHourlyWage}
                    />
                    {errors.hourly_wage && (
                      <p className="text-red-500 text-sm mt-1">{errors.hourly_wage}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.visit('/users')}
                disabled={isSubmitting}
              >
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
