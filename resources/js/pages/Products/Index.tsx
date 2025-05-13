import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { EyeIcon, TrashIcon } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types/user';
import DataTable from '@/components/ui/data-table';

interface Props {
  products: {
    data: Product[];
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
}

export default function ProductsIndex({ products, user }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);

  const openDeleteDialog = (productId: number) => {
    setDeleteProductId(productId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteProductId(null);
  };

  const handleDelete = () => {
    if (deleteProductId) {
      router.delete(`/products/${deleteProductId}`, {
        onSuccess: () => {
          closeDeleteDialog();
        },
      });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Tên sản phẩm',
      render: (product: Product) => (
        <div className="flex items-center">
          {product.image && (
            <div className="flex-shrink-0 h-10 w-10 mr-4">
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={product.image}
                alt={product.name}
              />
            </div>
          )}
          <div className="text-sm font-medium">{product.name}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Danh mục',
      render: (product: Product) => (
        <div className="text-sm">{product.category?.name}</div>
      ),
    },
    {
      key: 'price',
      label: 'Giá',
      render: (product: Product) => (
        <div className="text-sm">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (product: Product) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          product.status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {product.status === 'active' ? 'Đang bán' : 'Không bán'}
        </span>
      ),
    },
  ];

  const renderActions = (product: Product) => (
    <div className="flex space-x-2">
      <Link href={`/products/${product.id}`}>
        <Button variant="ghost" size="sm">
          <EyeIcon className="h-4 w-4" />
          <span className="sr-only">Xem</span>
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => openDeleteDialog(product.id)}
      >
        <TrashIcon className="h-4 w-4 text-red-500" />
        <span className="sr-only">Xóa</span>
      </Button>
    </div>
  );

  return (
    <AppLayout user={user}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sản phẩm</h1>
          <Link href="/products/create">
            <Button>Thêm sản phẩm mới</Button>
          </Link>
        </div>

        <DataTable
          data={products.data}
          columns={columns}
          actions={renderActions}
          pagination={{
            links: products.links,
            from: products.from,
            to: products.to,
            total: products.total
          }}
        />

        {/* Dialog xác nhận xóa sản phẩm */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeDeleteDialog}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
