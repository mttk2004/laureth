import { Product } from '@/types/product';
import { EyeIcon, TrashIcon, PencilIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductImage from '@/components/products/ProductImage';
import ProductStatusBadge from '@/components/products/ProductStatusBadge';
import { formatCurrency } from '@/lib/productUtils';

interface ProductListItemProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function ProductListItem({ product, onView, onEdit, onDelete }: ProductListItemProps) {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-muted/40 rounded-md transition-colors">
      <div className="flex items-center space-x-4">
        <ProductImage src={product.image} alt={product.name} size="sm" />

        <div>
          <h3 className="font-medium">{product.name}</h3>
          <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
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
