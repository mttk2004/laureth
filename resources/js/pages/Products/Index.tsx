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

  return (
    <AppLayout user={user}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sản phẩm</h1>
          <Link href="/products/create">
            <Button>Thêm sản phẩm mới</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên sản phẩm
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.data.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status === 'active' ? 'Đang bán' : 'Không bán'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Hiển thị từ <span className="font-medium">{products.from}</span> đến <span className="font-medium">{products.to}</span> của <span className="font-medium">{products.total}</span> sản phẩm
              </div>
              <div className="flex space-x-1">
                {products.links.map((link, i) => {
                  // Skip "prev" and "next" labels
                  if (i === 0 || i === products.links.length - 1) {
                    return null;
                  }

                  return (
                    <Link
                      key={i}
                      href={link.url || ''}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        link.active
                          ? 'z-10 bg-[#F5B3BE] text-white'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                      preserveScroll
                    >
                      {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

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
