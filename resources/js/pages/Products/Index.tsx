import { DeleteProductDialog, ProductDetailDialog, ProductFilters, ProductImage, ProductSortSelect, ProductStatusBadge } from '@/components/products';
import { Button, DataTable } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib';
import { Category, Product, ProductSortOption, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

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

export default function ProductsIndex({ products, user, categories = [], filters = {}, sort = ProductSortOption.NEWEST }: Props) {
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
                },
            });
        }
    };

    const handleApplyFilters = (
        newFilters: Partial<{
            category_id: string;
            status: string;
            price_min: number;
            price_max: number;
        }>,
    ) => {
        router.get(
            '/products',
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

    const handleSortChange = (sortOption: ProductSortOption) => {
        router.get(
            '/products',
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
            render: (product: Product) => <div className="text-sm">{product.category?.name}</div>,
        },
        {
            key: 'price',
            label: 'Giá',
            render: (product: Product) => <div className="text-sm">{formatCurrency(product.price)}</div>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (product: Product) => <ProductStatusBadge status={product.status} />,
        },
    ];

    return (
        <AppLayout user={user}>
            <Head title="Quản lý sản phẩm" />

            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Sản phẩm</h1>
                    <div className="flex space-x-2">
                        <ProductSortSelect value={sort as ProductSortOption} onChange={handleSortChange} />
                        <ProductFilters categories={categories} initialFilters={filters} onApplyFilters={handleApplyFilters} />
                        <Button onClick={() => router.visit('/products/create')}>
                            <PlusIcon className="mr-2 h-4 w-4" />
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
                        total: products.total,
                    }}
                />

                <ProductDetailDialog product={selectedProduct} open={detailDialogOpen} onOpenChange={setDetailDialogOpen} />

                <DeleteProductDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
            </div>
        </AppLayout>
    );
}
