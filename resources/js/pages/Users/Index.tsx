import { Button, DataTable } from '@/components/ui';
import { DeleteUserDialog, UserDetailDialog, UserFilters, UserRoleBadge, UserSortSelect } from '@/components/users';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { formatPhoneNumber } from '@/lib';
import { Store, User, UserSortOption } from '@/types';
import { Head, router } from '@inertiajs/react';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
    users: {
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
    stores: Store[];
    filters?: {
        position?: string;
        store_id?: string;
    };
    sort?: string;
}

export default function UsersIndex({ users, user, stores = [], filters = {}, sort = UserSortOption.NEWEST }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { addToast } = useToast();

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setDetailDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        router.visit(`/users/${user.id}/edit`);
    };

    const openDeleteDialog = (userId: string) => {
        setDeleteUserId(userId);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteUserId(null);
    };

    const handleDelete = () => {
        if (deleteUserId) {
            router.delete(`/users/${deleteUserId}`, {
                onSuccess: () => {
                    addToast('Nhân viên đã được xóa thành công', 'success');
                    closeDeleteDialog();
                },
                onError: () => {
                    addToast('Không thể xóa nhân viên', 'error');
                    closeDeleteDialog();
                },
            });
        }
    };

    const handleApplyFilters = (
        newFilters: Partial<{
            position: string;
            store_id: string;
        }>,
    ) => {
        router.get(
            '/users',
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

    const handleSortChange = (sortOption: UserSortOption) => {
        router.get(
            '/users',
            {
                ...filters,
                sort: sortOption,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const columns = [
        {
            key: 'name',
            label: 'Nhân viên',
            render: (user: User) => (
                <div className="flex items-center">
                    <div className="bg-muted mr-4 flex h-10 w-10 items-center justify-center rounded-full">
                        <span className="font-medium">{user.full_name.charAt(0)}</span>
                    </div>
                    <div>
                        <div className="text-sm font-medium">{user.full_name}</div>
                        <div className="text-muted-foreground text-xs">{user.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'position',
            label: 'Vai trò',
            render: (user: User) => <UserRoleBadge role={user.position} />,
        },
        {
            key: 'phone',
            label: 'Điện thoại',
            render: (user: User) => <div className="text-sm">{formatPhoneNumber(user.phone)}</div>,
        },
        {
            key: 'store',
            label: 'Cửa hàng',
            render: (user: User) => <div className="text-sm">{user.store?.name || 'Chưa phân công'}</div>,
        },
    ];

    return (
        <AppLayout user={user}>
            <Head title="Quản lý nhân viên" />

            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
                    <div className="flex space-x-2">
                        <UserSortSelect value={sort as UserSortOption} onChange={handleSortChange} />
                        <UserFilters stores={stores} initialFilters={filters} onApplyFilters={handleApplyFilters} />
                        <Button onClick={() => router.visit('/users/create')}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Thêm nhân viên mới
                        </Button>
                    </div>
                </div>

                <DataTable
                    data={users.data}
                    columns={columns}
                    actions={(user: User) => (
                        <div className="flex">
                            <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                                <EyeIcon className="h-4 w-4" />
                                <span className="sr-only">Xem</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Sửa</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(user.id)}>
                                <TrashIcon className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Xóa</span>
                            </Button>
                        </div>
                    )}
                    pagination={{
                        links: users.links,
                        from: users.from,
                        to: users.to,
                        total: users.total,
                    }}
                />

                <UserDetailDialog user={selectedUser} open={detailDialogOpen} onOpenChange={setDetailDialogOpen} />

                <DeleteUserDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
            </div>
        </AppLayout>
    );
}
