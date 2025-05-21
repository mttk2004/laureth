import { BaseFilterDialog, BaseFilterForm, BaseFilterRow } from '@/components/common';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatus, PaymentMethod } from '@/types/order';
import { User } from '@/types/user';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface OrderFiltersProps {
    initialFilters: {
        status?: string;
        payment_method?: string;
        date_from?: string;
        date_to?: string;
        user_id?: string;
    };
    onApplyFilters: (filters: {
        status?: string;
        payment_method?: string;
        date_from?: string;
        date_to?: string;
        user_id?: string;
    }) => void;
    currentUser: User;
}

// Định nghĩa các trạng thái đơn hàng
const orderStatusLabels: Record<OrderStatus, string> = {
    [OrderStatus.COMPLETED]: 'Hoàn thành',
    [OrderStatus.CANCELED]: 'Đã hủy',
    [OrderStatus.PENDING]: 'Đang xử lý',
};

// Định nghĩa các phương thức thanh toán
const paymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'Tiền mặt',
    [PaymentMethod.CARD]: 'Thẻ',
    [PaymentMethod.TRANSFER]: 'Chuyển khoản',
};

export default function OrderFilters({ initialFilters, onApplyFilters, currentUser }: OrderFiltersProps) {
    const [filters, setFilters] = useState({
        status: initialFilters.status || 'all',
        payment_method: initialFilters.payment_method || 'all',
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || '',
        user_id: initialFilters.user_id || 'all',
    });

    const [storeStaff, setStoreStaff] = useState<User[]>([]);

    // Lấy danh sách nhân viên trong cửa hàng
    useEffect(() => {
        if (currentUser.store_id) {
            axios.get(`/api/stores/${currentUser.store_id}/staff`)
                .then(response => {
                    console.log('API response data:', response.data);
                    // Đảm bảo dữ liệu trả về là một mảng
                    if (Array.isArray(response.data)) {
                        setStoreStaff(response.data);
                    } else {
                        console.error('Dữ liệu nhân viên không phải là mảng:', response.data);
                        setStoreStaff([]);
                    }
                })
                .catch(error => {
                    console.error('Không thể tải danh sách nhân viên:', error);
                    setStoreStaff([]);
                });
        }
    }, [currentUser.store_id]);

    const handleSelectChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            status: 'all',
            payment_method: 'all',
            date_from: '',
            date_to: '',
            user_id: 'all',
        });
        onApplyFilters({});
    };

    const handleApplyFilters = () => {
        const appliedFilters: {
            status?: string;
            payment_method?: string;
            date_from?: string;
            date_to?: string;
            user_id?: string;
        } = {};

        if (filters.status && filters.status !== 'all') {
            appliedFilters.status = filters.status;
        }

        if (filters.payment_method && filters.payment_method !== 'all') {
            appliedFilters.payment_method = filters.payment_method;
        }

        if (filters.date_from) {
            appliedFilters.date_from = filters.date_from;
        }

        if (filters.date_to) {
            appliedFilters.date_to = filters.date_to;
        }

        if (filters.user_id && filters.user_id !== 'all') {
            appliedFilters.user_id = filters.user_id;
        }

        onApplyFilters(appliedFilters);
    };

    // Kiểm tra xem đã áp dụng filter nào chưa
    const hasActiveFilters = Boolean(
        initialFilters.status ||
        initialFilters.payment_method ||
        initialFilters.date_from ||
        initialFilters.date_to ||
        initialFilters.user_id
    );

    return (
        <BaseFilterDialog
            title="Lọc đơn hàng"
            description="Chọn các điều kiện lọc bên dưới và nhấn 'Áp dụng' để lọc đơn hàng."
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            triggerText="Lọc đơn hàng"
        >
            <BaseFilterForm>
                <BaseFilterRow label="Trạng thái">
                    <Select value={filters.status} onValueChange={(value) => handleSelectChange('status', value)}>
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            {Object.entries(orderStatusLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </BaseFilterRow>

                <BaseFilterRow label="Phương thức thanh toán">
                    <Select value={filters.payment_method} onValueChange={(value) => handleSelectChange('payment_method', value)}>
                        <SelectTrigger id="payment_method">
                            <SelectValue placeholder="Tất cả phương thức" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả phương thức</SelectItem>
                            {Object.entries(paymentMethodLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </BaseFilterRow>

                <BaseFilterRow label="Nhân viên">
                    <Select value={filters.user_id} onValueChange={(value) => handleSelectChange('user_id', value)}>
                        <SelectTrigger id="user_id">
                            <SelectValue placeholder="Tất cả nhân viên" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả nhân viên</SelectItem>
                            <SelectItem value={currentUser.id}>Chỉ của tôi</SelectItem>
                            {Array.isArray(storeStaff) && storeStaff
                                .filter(staff => staff.id !== currentUser.id)
                                .map(staff => (
                                    <SelectItem key={staff.id} value={staff.id}>
                                        {staff.full_name}
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </BaseFilterRow>

                <BaseFilterRow label="Từ ngày">
                    <Input type="date" name="date_from" value={filters.date_from} onChange={handleInputChange} />
                </BaseFilterRow>

                <BaseFilterRow label="Đến ngày">
                    <Input type="date" name="date_to" value={filters.date_to} onChange={handleInputChange} />
                </BaseFilterRow>
            </BaseFilterForm>
        </BaseFilterDialog>
    );
}
