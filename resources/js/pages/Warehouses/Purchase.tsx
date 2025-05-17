import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Product, Supplier, User, WarehouseWithStore } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { MinusCircleIcon, PlusCircleIcon } from 'lucide-react';
import React, { FormEvent, useState } from 'react';

interface PurchaseItem {
    product_id: string;
    product_name?: string;
    quantity: number;
    purchase_price: number;
    selling_price: number;
}

interface Props {
    user: User;
    warehouse: WarehouseWithStore;
    suppliers: Supplier[];
    products: Product[];
}

export default function WarehousePurchase({ user, warehouse, suppliers, products }: Props) {
    const [formData, setFormData] = useState({
        supplier_id: '',
        order_date: format(new Date(), 'yyyy-MM-dd'),
        items: [] as PurchaseItem[],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    // Thêm một sản phẩm mới vào danh sách
    const addItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                {
                    product_id: '',
                    quantity: 1,
                    purchase_price: 0,
                    selling_price: 0,
                },
            ],
        });
    };

    // Xóa sản phẩm khỏi danh sách
    const removeItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({
            ...formData,
            items: newItems,
        });
    };

    // Cập nhật thông tin sản phẩm
    const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
        const newItems = [...formData.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };

        // Nếu chọn sản phẩm mới, tự động điền giá bán gợi ý
        if (field === 'product_id') {
            const selectedProduct = products.find((p) => p.id === value);
            if (selectedProduct) {
                newItems[index].product_name = selectedProduct.name;
                newItems[index].purchase_price = selectedProduct.price * 0.7; // Giá mua mặc định = 70% giá bán
                newItems[index].selling_price = selectedProduct.price;
            }
        }

        setFormData({
            ...formData,
            items: newItems,
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { name: string; value: string }) => {
        const { name, value } = 'target' in e ? e.target : e;

        setFormData({
            ...formData,
            [name]: value,
        });

        // Xóa lỗi khi người dùng bắt đầu sửa trường đó
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Kiểm tra có sản phẩm nào không
        if (formData.items.length === 0) {
            addToast('Vui lòng thêm ít nhất một sản phẩm', 'error');
            setIsSubmitting(false);
            return;
        }

        // Kiểm tra thông tin sản phẩm
        let isValid = true;
        formData.items.forEach((item, index) => {
            if (!item.product_id) {
                setErrors((prev) => ({ ...prev, [`items.${index}.product_id`]: 'Vui lòng chọn sản phẩm' }));
                isValid = false;
            }
            if (item.quantity <= 0) {
                setErrors((prev) => ({ ...prev, [`items.${index}.quantity`]: 'Số lượng phải lớn hơn 0' }));
                isValid = false;
            }
            if (item.purchase_price <= 0) {
                setErrors((prev) => ({ ...prev, [`items.${index}.purchase_price`]: 'Giá mua phải lớn hơn 0' }));
                isValid = false;
            }
            if (item.selling_price <= 0) {
                setErrors((prev) => ({ ...prev, [`items.${index}.selling_price`]: 'Giá bán phải lớn hơn 0' }));
                isValid = false;
            }
            if (item.selling_price < item.purchase_price) {
                setErrors((prev) => ({ ...prev, [`items.${index}.selling_price`]: 'Giá bán phải lớn hơn hoặc bằng giá mua' }));
                isValid = false;
            }
        });

        if (!isValid) {
            setIsSubmitting(false);
            return;
        }

        // Chuyển đổi dữ liệu form để phù hợp với FormDataConvertible
        const formDataToSubmit = {
            supplier_id: formData.supplier_id,
            order_date: formData.order_date,
            items: JSON.stringify(formData.items),
        };

        router.post(`/warehouses/${warehouse.id}/purchase`, formDataToSubmit, {
            onSuccess: () => {
                addToast('Nhập hàng thành công', 'success');
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
                addToast('Có lỗi xảy ra khi nhập hàng', 'error');
            },
        });
    };

    // Tính tổng giá trị đơn nhập hàng
    const totalPurchaseAmount = formData.items.reduce((sum, item) => sum + item.purchase_price * item.quantity, 0);

    return (
        <AppLayout user={user}>
            <Head title="Nhập hàng cho kho" />

            <div className="mx-auto max-w-5xl py-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Nhập hàng cho kho: {warehouse.name}</h1>
                </div>

                <div className="bg-background border-border overflow-hidden rounded-lg border p-6 shadow">
                    <div className="bg-muted mb-6 rounded-md p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground font-medium">Kho:</span>
                                <span className="ml-2">{warehouse.name}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground font-medium">Cửa hàng:</span>
                                <span className="ml-2">{warehouse.store?.name || 'Không thuộc cửa hàng nào'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground font-medium">Địa chỉ:</span>
                                <span className="ml-2">{warehouse.address}</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <Label htmlFor="supplier_id">Nhà cung cấp</Label>
                                <Select
                                    name="supplier_id"
                                    value={formData.supplier_id}
                                    onValueChange={(value) => handleChange({ name: 'supplier_id', value })}
                                >
                                    <SelectTrigger id="supplier_id" className={errors.supplier_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Chọn nhà cung cấp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.supplier_id && <p className="mt-1 text-sm text-red-500">{errors.supplier_id}</p>}
                            </div>

                            <div>
                                <Label htmlFor="order_date">Ngày đặt hàng</Label>
                                <Input
                                    id="order_date"
                                    name="order_date"
                                    type="date"
                                    value={formData.order_date}
                                    onChange={handleChange}
                                    className={errors.order_date ? 'border-red-500' : ''}
                                />
                                {errors.order_date && <p className="mt-1 text-sm text-red-500">{errors.order_date}</p>}
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="text-lg font-medium">Danh sách sản phẩm</h3>
                                <Button type="button" onClick={addItem} variant="outline" size="sm">
                                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                                    Thêm sản phẩm
                                </Button>
                            </div>

                            {formData.items.length === 0 && (
                                <div className="rounded-md border border-dashed p-6 text-center">
                                    <p className="text-muted-foreground">Chưa có sản phẩm nào. Vui lòng thêm sản phẩm.</p>
                                </div>
                            )}

                            {formData.items.length > 0 && (
                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="border-b px-4 py-2 text-left">Sản phẩm</th>
                                                <th className="border-b px-4 py-2 text-right">Số lượng</th>
                                                <th className="border-b px-4 py-2 text-right">Giá mua (VNĐ)</th>
                                                <th className="border-b px-4 py-2 text-right">Giá bán (VNĐ)</th>
                                                <th className="border-b px-4 py-2 text-right">Thành tiền (VNĐ)</th>
                                                <th className="border-b px-4 py-2 text-center">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.items.map((item, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="px-4 py-2">
                                                        <Select
                                                            value={item.product_id}
                                                            onValueChange={(value) => updateItem(index, 'product_id', value)}
                                                        >
                                                            <SelectTrigger className={errors[`items.${index}.product_id`] ? 'border-red-500' : ''}>
                                                                <SelectValue placeholder="Chọn sản phẩm" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {products.map((product) => (
                                                                    <SelectItem key={product.id} value={product.id}>
                                                                        {product.name} ({product.category?.name})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors[`items.${index}.product_id`] && (
                                                            <p className="mt-1 text-sm text-red-500">{errors[`items.${index}.product_id`]}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                                                            className={errors[`items.${index}.quantity`] ? 'border-red-500 text-right' : 'text-right'}
                                                        />
                                                        {errors[`items.${index}.quantity`] && (
                                                            <p className="mt-1 text-sm text-red-500">{errors[`items.${index}.quantity`]}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="1000"
                                                            value={item.purchase_price}
                                                            onChange={(e) => updateItem(index, 'purchase_price', parseFloat(e.target.value) || 0)}
                                                            className={
                                                                errors[`items.${index}.purchase_price`] ? 'border-red-500 text-right' : 'text-right'
                                                            }
                                                        />
                                                        {errors[`items.${index}.purchase_price`] && (
                                                            <p className="mt-1 text-sm text-red-500">{errors[`items.${index}.purchase_price`]}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="1000"
                                                            value={item.selling_price}
                                                            onChange={(e) => updateItem(index, 'selling_price', parseFloat(e.target.value) || 0)}
                                                            className={
                                                                errors[`items.${index}.selling_price`] ? 'border-red-500 text-right' : 'text-right'
                                                            }
                                                        />
                                                        {errors[`items.${index}.selling_price`] && (
                                                            <p className="mt-1 text-sm text-red-500">{errors[`items.${index}.selling_price`]}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-right">
                                                        {(item.purchase_price * item.quantity).toLocaleString('vi-VN')}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <Button type="button" onClick={() => removeItem(index)} variant="ghost" size="sm">
                                                            <MinusCircleIcon className="h-4 w-4 text-red-500" />
                                                            <span className="sr-only">Xóa</span>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-muted">
                                                <td colSpan={4} className="px-4 py-2 text-right font-bold">
                                                    Tổng tiền:
                                                </td>
                                                <td className="px-4 py-2 text-right font-bold">{totalPurchaseAmount.toLocaleString('vi-VN')} VNĐ</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.visit('/warehouses')}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting || formData.items.length === 0}>
                                {isSubmitting ? 'Đang xử lý...' : 'Nhập hàng'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
