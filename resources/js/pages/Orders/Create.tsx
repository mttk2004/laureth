import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatters';
import { OrderStatus, PaymentMethod } from '@/types/order';
import { Product } from '@/types/product';
import { User } from '@/types/user';
import { Head, router, useForm } from '@inertiajs/react';
import { MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    user: User;
    products: Product[];
}

interface OrderItem {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    max_quantity: number;
}

export default function OrderCreate({ user, products }: Props) {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const { addToast } = useToast();

    // Tính toán tổng tiền
    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const finalAmount = totalAmount - discountAmount;

    const { data, setData, post, processing, errors } = useForm({
        order_date: new Date().toISOString().split('T')[0],
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        payment_method: PaymentMethod.CASH,
        status: OrderStatus.COMPLETED,
        store_id: user.store_id,
        items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
        })),
    });

    // Cập nhật dữ liệu form khi items hoặc discountAmount thay đổi
    useEffect(() => {
        setData({
            order_date: data.order_date,
            total_amount: totalAmount,
            discount_amount: discountAmount,
            final_amount: finalAmount,
            payment_method: data.payment_method,
            status: data.status,
            store_id: data.store_id,
            items: items.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
            })),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, discountAmount]);

    // Xử lý thêm sản phẩm vào đơn hàng
    const handleAddProduct = () => {
        if (!selectedProduct || quantity <= 0) {
            addToast('Vui lòng chọn sản phẩm và số lượng hợp lệ', 'error');
            return;
        }

        const product = products.find((p) => p.id === selectedProduct);
        if (!product) {
            addToast('Sản phẩm không tồn tại', 'error');
            return;
        }

        // Lấy số lượng tồn kho của sản phẩm
        const inventoryItem = product.inventoryItems?.[0];
        if (!inventoryItem || inventoryItem.quantity <= 0) {
            addToast('Sản phẩm đã hết hàng', 'error');
            return;
        }

        // Kiểm tra nếu sản phẩm đã có trong đơn hàng
        const existingItemIndex = items.findIndex((item) => item.product_id === selectedProduct);
        if (existingItemIndex >= 0) {
            // Cập nhật số lượng sản phẩm đã có
            const newItems = [...items];
            const newQuantity = newItems[existingItemIndex].quantity + quantity;

            // Kiểm tra số lượng không vượt quá tồn kho
            if (newQuantity > inventoryItem.quantity) {
                addToast(`Số lượng vượt quá tồn kho (${inventoryItem.quantity})`, 'error');
                return;
            }

            newItems[existingItemIndex] = {
                ...newItems[existingItemIndex],
                quantity: newQuantity,
                total_price: newQuantity * product.price,
            };

            setItems(newItems);
        } else {
            // Kiểm tra số lượng không vượt quá tồn kho
            if (quantity > inventoryItem.quantity) {
                addToast(`Số lượng vượt quá tồn kho (${inventoryItem.quantity})`, 'error');
                return;
            }

            // Thêm sản phẩm mới vào đơn hàng
            setItems([
                ...items,
                {
                    product_id: product.id,
                    product_name: product.name,
                    quantity: quantity,
                    unit_price: product.price,
                    total_price: quantity * product.price,
                    max_quantity: inventoryItem.quantity,
                },
            ]);
        }

        // Reset form
        setSelectedProduct('');
        setQuantity(1);
    };

    // Xử lý xóa sản phẩm khỏi đơn hàng
    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    // Xử lý thay đổi số lượng sản phẩm
    const handleQuantityChange = (index: number, newQuantity: number) => {
        if (newQuantity <= 0) return;

        const item = items[index];
        if (newQuantity > item.max_quantity) {
            addToast(`Số lượng vượt quá tồn kho (${item.max_quantity})`, 'error');
            return;
        }

        const newItems = [...items];
        newItems[index] = {
            ...item,
            quantity: newQuantity,
            total_price: newQuantity * item.unit_price,
        };

        setItems(newItems);
    };

    // Xử lý submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            addToast('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng', 'error');
            return;
        }

        post('/pos', {
            onSuccess: () => {
                addToast('Tạo đơn hàng thành công', 'success');
                router.visit('/pos');
            },
        });
    };

    return (
        <AppLayout user={user}>
            <Head title="Tạo đơn hàng mới" />

            <div className="container mx-auto py-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Tạo đơn hàng mới</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Thông tin đơn hàng */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Thông tin sản phẩm</CardTitle>
                                <CardDescription>Thêm sản phẩm vào đơn hàng</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 flex flex-wrap items-end gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="product">Sản phẩm</Label>
                                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                            <SelectTrigger id="product">
                                                <SelectValue placeholder="Chọn sản phẩm" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((product) => {
                                                    const inventoryItem = product.inventoryItems?.[0];
                                                    const quantity = inventoryItem?.quantity || 0;
                                                    return (
                                                        <SelectItem key={product.id} value={product.id} disabled={quantity <= 0}>
                                                            {product.name} - {formatCurrency(product.price)} (Còn {quantity})
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-24">
                                        <Label htmlFor="quantity">Số lượng</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <Button type="button" onClick={handleAddProduct}>
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Thêm
                                    </Button>
                                </div>

                                {/* Danh sách sản phẩm đã thêm */}
                                <div className="rounded-md border">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-muted/50 border-b">
                                                <th className="p-2 text-left font-medium">Sản phẩm</th>
                                                <th className="p-2 text-center font-medium">Đơn giá</th>
                                                <th className="p-2 text-center font-medium">Số lượng</th>
                                                <th className="p-2 text-right font-medium">Thành tiền</th>
                                                <th className="p-2 text-center font-medium">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-muted-foreground p-4 text-center">
                                                        Chưa có sản phẩm nào được thêm vào đơn hàng
                                                    </td>
                                                </tr>
                                            ) : (
                                                items.map((item, index) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="p-2">{item.product_name}</td>
                                                        <td className="p-2 text-center">{formatCurrency(item.unit_price)}</td>
                                                        <td className="p-2">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="h-7 w-7"
                                                                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                >
                                                                    <MinusIcon className="h-3 w-3" />
                                                                </Button>
                                                                <span className="w-8 text-center">{item.quantity}</span>
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="h-7 w-7"
                                                                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                                                    disabled={item.quantity >= item.max_quantity}
                                                                >
                                                                    <PlusIcon className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-right">{formatCurrency(item.total_price)}</td>
                                                        <td className="p-2 text-center">
                                                            <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveItem(index)}>
                                                                <TrashIcon className="text-destructive h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin thanh toán */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thanh toán</CardTitle>
                                <CardDescription>Thông tin thanh toán đơn hàng</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="payment_method">Phương thức thanh toán</Label>
                                    <Select value={data.payment_method} onValueChange={(value) => setData('payment_method', value as PaymentMethod)}>
                                        <SelectTrigger id="payment_method">
                                            <SelectValue placeholder="Chọn phương thức thanh toán" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={PaymentMethod.CASH}>Tiền mặt</SelectItem>
                                            <SelectItem value={PaymentMethod.CARD}>Thẻ</SelectItem>
                                            <SelectItem value={PaymentMethod.TRANSFER}>Chuyển khoản</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_method && <p className="text-destructive mt-1 text-sm">{errors.payment_method}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="discount_amount">Giảm giá (VNĐ)</Label>
                                    <Input
                                        id="discount_amount"
                                        type="number"
                                        min="0"
                                        max={totalAmount}
                                        value={discountAmount}
                                        onChange={(e) => setDiscountAmount(Math.min(totalAmount, Math.max(0, parseInt(e.target.value) || 0)))}
                                    />
                                    {errors.discount_amount && <p className="text-destructive mt-1 text-sm">{errors.discount_amount}</p>}
                                </div>

                                <div className="bg-muted rounded-lg p-4">
                                    <div className="flex justify-between py-1">
                                        <span>Tổng tiền hàng:</span>
                                        <span>{formatCurrency(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span>Giảm giá:</span>
                                        <span>{formatCurrency(discountAmount)}</span>
                                    </div>
                                    <div className="flex justify-between border-t py-1 font-bold">
                                        <span>Thành tiền:</span>
                                        <span>{formatCurrency(finalAmount)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={processing || items.length === 0}>
                                    <ShoppingCartIcon className="mr-2 h-4 w-4" />
                                    Tạo đơn hàng
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
