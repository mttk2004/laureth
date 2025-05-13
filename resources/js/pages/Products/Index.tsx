import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { Product, Category } from '@/types/product';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types/user';
import DataTable from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import ProductImage from '@/components/products/ProductImage';
import ProductStatusBadge from '@/components/products/ProductStatusBadge';
import ProductDetailDialog from '@/components/products/ProductDetailDialog';
import DeleteProductDialog from '@/components/products/DeleteProductDialog';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSortSelect from '@/components/products/ProductSortSelect';
import { formatCurrency, SortOption } from '@/lib/productUtils';

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
  categories: Category[];
  filters?: {
    category_id?: string;
    status?: string;
    price_min?: number;
    price_max?: number;
  };
  sort?: string;
}

export default function ProductsIndex({ products, user, categories = [], filters = {}, sort = SortOption.NEWEST }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToast } = useToast();

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    router.visit(`/products/${product.id}/edit`);
  };

  const openDeleteDialog = (productId: string) => {
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
          addToast('Sản phẩm đã được xóa thành công', 'success');
          closeDeleteDialog();
        },
        onError: () => {
          addToast('Không thể xóa sản phẩm', 'error');
          closeDeleteDialog();
        }
      });
    }
  };

  const handleApplyFilters = (newFilters: Partial<{
    category_id: string;
    status: string;
    price_min: number;
    price_max: number;
  }>) => {
    router.get('/products', {
      ...newFilters,
      sort,
    }, {
      preserveState: true,
      replace: true,
      preserveScroll: true,
    });
  };

  const handleSortChange = (sortOption: SortOption) => {
    router.get('/products', {
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
      label: 'Sản phẩm',
      render: (product: Product) => (
        <div className="flex items-center">
          <ProductImage src={product.image} alt={product.name} size="sm" className="mr-4" />
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
          {formatCurrency(product.price)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (product: Product) => (
        <ProductStatusBadge status={product.status} />
      ),
    },
  ];

  return (
    <AppLayout user={user}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sản phẩm</h1>
          <div className="flex space-x-2">
            <ProductSortSelect
              value={sort as SortOption}
              onChange={handleSortChange}
            />
            <ProductFilters
              categories={categories}
              initialFilters={filters}
              onApplyFilters={handleApplyFilters}
            />
            <Button onClick={() => router.visit('/products/create')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm sản phẩm mới
            </Button>
          </div>
        </div>

        <DataTable
          data={products.data}
          columns={columns}
          actions={(product) => (
            <div className="flex">
              <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)}>
                <EyeIcon className="h-4 w-4" />
                <span className="sr-only">Xem</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                <PencilIcon className="h-4 w-4" />
                <span className="sr-only">Sửa</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(product.id)}>
                <TrashIcon className="h-4 w-4 text-red-500" />
                <span className="sr-only">Xóa</span>
              </Button>
            </div>
          )}
          pagination={{
            links: products.links,
            from: products.from,
            to: products.to,
            total: products.total
          }}
        />

        <ProductDetailDialog
          product={selectedProduct}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />

        <DeleteProductDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
        />
      </div>
    </AppLayout>
  );
}
