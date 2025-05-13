import React from 'react';
import { router } from '@inertiajs/react';
import { PencilIcon } from 'lucide-react';
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
import ProductImage from '@/components/products/ProductImage';
import ProductStatusBadge from '@/components/products/ProductStatusBadge';
import { formatCurrency } from '@/lib/productUtils';

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chi tiết sản phẩm</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về sản phẩm {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center mb-4">
            <ProductImage
              src={product.image}
              alt={product.name}
              size="lg"
              className="mb-4"
            />
            <h3 className="text-lg font-semibold">{product.name}</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Danh mục:</div>
            <div>{product.category?.name}</div>

            <div className="font-medium">Giá:</div>
            <div>{formatCurrency(product.price)}</div>

            <div className="font-medium">Trạng thái:</div>
            <div>
              <ProductStatusBadge status={product.status} />
            </div>
          </div>

          {product.description && (
            <div className="mt-2">
              <div className="font-medium">Mô tả:</div>
              <p className="text-sm mt-1">{product.description}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={() => {
            if (product) {
              router.visit(`/products/${product.id}/edit`);
            }
          }}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
