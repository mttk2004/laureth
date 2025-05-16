import ProductImage from '@/components/products/ProductImage';
import ProductStatusBadge from '@/components/products/ProductStatusBadge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib';
import { Product } from '@/types/product';
import { EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';

interface ProductListItemProps {
    product: Product;
    onView: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
}

export default function ProductListItem({ product, onView, onEdit, onDelete }: ProductListItemProps) {
    return (
        <div className="hover:bg-muted/40 flex items-center justify-between rounded-md p-4 transition-colors">
            <div className="flex items-center space-x-4">
                <ProductImage src={product.image} alt={product.name} size="sm" />

                <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="text-muted-foreground mt-1 flex items-center space-x-2 text-sm">
                        <span>{product.category?.name}</span>
                        <span>•</span>
                        <span>{formatCurrency(product.price)}</span>
                        <span>•</span>
                        <ProductStatusBadge status={product.status} />
                    </div>
                </div>
            </div>

            <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onView(product)}>
                    <EyeIcon className="h-4 w-4" />
                    <span className="sr-only">Xem</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                    <PencilIcon className="h-4 w-4" />
                    <span className="sr-only">Sửa</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)}>
                    <TrashIcon className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Xóa</span>
                </Button>
            </div>
        </div>
    );
}
