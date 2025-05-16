import { ProductImage, ProductStatusBadge } from '@/components/products';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib';
import { Product } from '@/types';
import { router } from '@inertiajs/react';
import { PencilIcon } from 'lucide-react';

interface ProductDetailDialogProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Chi tiết sản phẩm</DialogTitle>
                    <DialogDescription>Thông tin chi tiết về sản phẩm {product.name}</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2">
                    {/* Cột trái - Ảnh sản phẩm */}
                    <div className="flex flex-col items-center justify-center">
                        <ProductImage src={product.image} alt={product.name} size="xl" className="mb-4" />
                        <h3 className="text-center font-semibold">{product.name}</h3>
                    </div>

                    {/* Cột phải - Thông tin sản phẩm */}
                    <div className="flex flex-col space-y-4">
                        <div className="grid grid-cols-3 gap-2 gap-y-3 text-sm">
                            <div className="font-semibold">Danh mục:</div>
                            <div className="col-span-2">{product.category?.name}</div>

                            <div className="font-semibold">Giá:</div>
                            <div className="col-span-2">{formatCurrency(product.price)}</div>

                            <div className="font-semibold">Trạng thái:</div>
                            <div className="col-span-2">
                                <ProductStatusBadge status={product.status} />
                            </div>
                        </div>

                        {product.description && (
                            <div className="mt-2 text-sm">
                                <div className="mb-1 font-semibold">Mô tả:</div>
                                <p>{product.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex space-x-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    <Button
                        onClick={() => {
                            if (product) {
                                router.visit(`/products/${product.id}/edit`);
                            }
                        }}
                    >
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
