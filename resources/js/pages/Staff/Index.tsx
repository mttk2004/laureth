import { Button } from '@/components/ui';
import { DataTable } from '@/components/ui/data-table';
import { UserDetailDialog, UserFilters, UserRoleBadge, UserSortSelect } from '@/components/users';
import AppLayout from '@/layouts/app-layout';
import { formatPhoneNumber } from '@/lib';
import { Store, User, UserSortOption } from '@/types';
import { Head, router } from '@inertiajs/react';
import { EyeIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
    staff: {
        data: User[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
    };
    user: User;
    store: Store;
    filters?: {
        position?: string;
        name?: string;
    };
    sort?: string;
}

export default function StaffIndex({ staff, user, store, filters = {}, sort = UserSortOption.NEWEST }: Props) {
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<User | null>(null);

    const handleViewStaff = (staff: User) => {
        setSelectedStaff(staff);
        setDetailDialogOpen(true);
    };

    const handleApplyFilters = (
        newFilters: Partial<{
            position: string;
            name: string;
        }>,
    ) => {
        router.get(
            '/staff',
            {
                ...newFilters,
                sort,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const handleSortChange = (value: string) => {
        router.get(
            '/staff',
            {
                ...filters,
                sort: value,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    // Định nghĩa các cột cho bảng
    const columns = [
        {
            key: 'full_name',
            label: 'Họ tên',
            render: (item: User) => <span className="font-medium">{item.full_name}</span>,
        },
        {
            key: 'position',
            label: 'Vai trò',
            render: (item: User) => <UserRoleBadge position={item.position} />,
        },
        {
            key: 'email',
            label: 'Email',
        },
        {
            key: 'phone',
            label: 'Số điện thoại',
            render: (item: User) => formatPhoneNumber(item.phone),
        },
    ];

    return (
        <AppLayout user={user}>
            <Head title="Nhân viên cửa hàng" />

            <div>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Nhân viên cửa hàng</h1>
                        <p className="text-muted-foreground mt-1">Quản lý nhân viên tại cửa hàng {store.name}</p>
                    </div>
                    <div className="flex space-x-2">
                        <UserSortSelect value={sort as UserSortOption} onChange={handleSortChange} />
                        <UserFilters initialFilters={filters} onApplyFilters={handleApplyFilters} showStoreFilter={false} />
                    </div>
                </div>

                <DataTable
                    data={staff.data}
                    columns={columns}
                    actions={(staff: User) => (
                        <div className="flex">
                            <Button variant="ghost" size="sm" onClick={() => handleViewStaff(staff)}>
                                <EyeIcon className="h-4 w-4" />
                                <span className="sr-only">Xem</span>
                            </Button>
                        </div>
                    )}
                    pagination={{
                        links: staff.links,
                        from: staff.from,
                        to: staff.to,
                        total: staff.total,
                    }}
                />

                <UserDetailDialog user={selectedStaff} open={detailDialogOpen} onOpenChange={setDetailDialogOpen} />
            </div>
        </AppLayout>
    );
}
