import { DeleteStoreDialog, StoreDetailDialog, StoreFilters, StoreSortSelect } from '@/components/stores';
import { Button, DataTable } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib';
import { Store, StoreSortOption, User } from '@/types';
import { router } from '@inertiajs/react';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface StoreWithManager extends Store {
    manager?: User | null;
}

interface Props {
    stores: {
        data: StoreWithManager[];
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
    managers: User[];
    filters?: {
        manager_id?: string;
        has_manager?: boolean;
    };
    sort?: string;
}

export default function StoresIndex({ stores, user, managers = [], filters = {}, sort = StoreSortOption.NEWEST }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteStoreId, setDeleteStoreId] = useState<string | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<StoreWithManager | null>(null);
    const { addToast } = useToast();

    const handleViewStore = (store: StoreWithManager) => {
        setSelectedStore(store);
        setDetailDialogOpen(true);
    };

    const handleEditStore = (store: StoreWithManager) => {
        router.visit(`/stores/${store.id}/edit`);
    };

    const openDeleteDialog = (storeId: string) => {
        setDeleteStoreId(storeId);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteStoreId(null);
    };

    const handleDelete = () => {
        if (deleteStoreId) {
            router.delete(`/stores/${deleteStoreId}`, {
                onSuccess: () => {
                    addToast('Cửa hàng đã được xóa thành công', 'success');
                    closeDeleteDialog();
                },
                onError: () => {
                    addToast('Không thể xóa cửa hàng', 'error');
                    closeDeleteDialog();
                },
            });
        }
    };

    const handleApplyFilters = (
        newFilters: Partial<{
            manager_id: string;
            has_manager: boolean;
        }>,
    ) => {
        router.get(
            '/stores',
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

    const handleSortChange = (sortOption: StoreSortOption) => {
        router.get(
            '/stores',
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
            label: 'Tên cửa hàng',
            render: (store: StoreWithManager) => <div className="text-sm font-medium">{store.name}</div>,
        },
        {
            key: 'address',
            label: 'Địa chỉ',
            render: (store: StoreWithManager) => <div className="max-w-md truncate text-sm">{store.address}</div>,
        },
        {
            key: 'manager',
            label: 'Quản lý',
            render: (store: StoreWithManager) => <div className="text-sm">{store.manager ? store.manager.full_name : 'Chưa phân công'}</div>,
        },
        {
            key: 'monthly_target',
            label: 'Mục tiêu tháng',
            render: (store: StoreWithManager) => <div className="text-sm font-medium">{formatCurrency(store.monthly_target)}</div>,
        },
    ];

    return (
        <AppLayout user={user}>
            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý cửa hàng</h1>
                    <div className="flex space-x-2">
                        <StoreSortSelect value={sort as StoreSortOption} onChange={handleSortChange} />
                        <StoreFilters managers={managers} initialFilters={filters} onApplyFilters={handleApplyFilters} />
                        <Button onClick={() => router.visit('/stores/create')}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Thêm cửa hàng mới
                        </Button>
                    </div>
                </div>

                <DataTable
                    data={stores.data}
                    columns={columns}
                    actions={(store: StoreWithManager) => (
                        <div className="flex">
                            <Button variant="ghost" size="sm" onClick={() => handleViewStore(store)}>
                                <EyeIcon className="h-4 w-4" />
                                <span className="sr-only">Xem</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditStore(store)}>
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Sửa</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(store.id)}>
                                <TrashIcon className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Xóa</span>
                            </Button>
                        </div>
                    )}
                    pagination={{
                        links: stores.links,
                        from: stores.from,
                        to: stores.to,
                        total: stores.total,
                    }}
                />

                <StoreDetailDialog store={selectedStore} open={detailDialogOpen} onOpenChange={setDetailDialogOpen} />

                <DeleteStoreDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
            </div>
        </AppLayout>
    );
}
