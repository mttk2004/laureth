import { useState } from 'react';
import { router } from '@inertiajs/react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { Supplier, SupplierSortOption, User } from '@/types';
import { Button, DataTable } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber } from '@/lib/utils';
import { DeleteSupplierDialog, SupplierDetailDialog, SupplierFilters, SupplierSortSelect } from '@/components/suppliers';

interface Props {
  suppliers: {
    data: Supplier[];
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
  filters?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  sort?: string;
}

export default function SuppliersIndex({ suppliers, user, filters = {}, sort = SupplierSortOption.NAME_ASC }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSupplierId, setDeleteSupplierId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { addToast } = useToast();

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDetailDialogOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    router.visit(`/suppliers/${supplier.id}/edit`);
  };

  const openDeleteDialog = (supplierId: string) => {
    setDeleteSupplierId(supplierId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteSupplierId(null);
  };

  const handleDelete = () => {
    if (deleteSupplierId) {
      router.delete(`/suppliers/${deleteSupplierId}`, {
        onSuccess: () => {
          addToast('Nhà cung cấp đã được xóa thành công', 'success');
          closeDeleteDialog();
        },
        onError: () => {
          addToast('Không thể xóa nhà cung cấp', 'error');
          closeDeleteDialog();
        }
      });
    }
  };

  const handleApplyFilters = (newFilters: Partial<{
    name: string;
    phone: string;
    email: string;
  }>) => {
    router.get('/suppliers', {
      ...newFilters,
      sort,
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const handleSortChange = (sortOption: SupplierSortOption) => {
    router.get('/suppliers', {
      ...filters,
      sort: sortOption,
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Tên nhà cung cấp',
      render: (supplier: Supplier) => (
        <div className="text-sm font-medium">{supplier.name}</div>
      ),
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      render: (supplier: Supplier) => (
        <div className="text-sm">{formatPhoneNumber(supplier.phone)}</div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (supplier: Supplier) => (
        <div className="text-sm">{supplier.email}</div>
      ),
    },
  ];

  return (
    <AppLayout user={user}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Nhà cung cấp</h1>
          <div className="flex space-x-2">
            <SupplierSortSelect
              value={sort as SupplierSortOption}
              onChange={handleSortChange}
            />
            <SupplierFilters
              initialFilters={filters}
              onApplyFilters={handleApplyFilters}
            />
            <Button onClick={() => router.visit('/suppliers/create')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm nhà cung cấp mới
            </Button>
          </div>
        </div>

        <DataTable
          data={suppliers.data}
          columns={columns}
          actions={(supplier) => (
            <div className="flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewSupplier(supplier)}
              >
                <EyeIcon className="h-4 w-4" />
                <span className="sr-only">Xem</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleEditSupplier(supplier)}>
                <PencilIcon className="h-4 w-4" />
                <span className="sr-only">Sửa</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(supplier.id.toString())}>
                <TrashIcon className="h-4 w-4 text-red-500" />
                <span className="sr-only">Xóa</span>
              </Button>
            </div>
          )}
          pagination={{
            links: suppliers.links,
            from: suppliers.from,
            to: suppliers.to,
            total: suppliers.total
          }}
        />

        <SupplierDetailDialog
          supplier={selectedSupplier}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />

        <DeleteSupplierDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
        />
      </div>
    </AppLayout>
  );
}
