import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Category } from '@/types/product';
import { User } from '@/types/user';
import { router } from '@inertiajs/react';
import React, { useState } from 'react';

interface Props {
    categories: Category[];
    user: User;
}

export default function ProductCreate({ categories, user }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        price: '',
        status: 'active',
        image: null as File | null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));

            // Tạo preview cho ảnh
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description || '');
        data.append('category_id', formData.category_id);
        data.append('price', formData.price);
        data.append('status', formData.status);

        if (formData.image) {
            data.append('image', formData.image);
        }

        router.post('/products', data, {
            onSuccess: () => {
                // Hiển thị thông báo thành công
                addToast('Sản phẩm đã được tạo thành công', 'success');
                // Reset form và chuyển hướng đã được xử lý tự động
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            },
            forceFormData: true,
        });
    };

    return (
        <AppLayout user={user}>
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Thêm sản phẩm mới</h1>
                </div>

                <div className="bg-background border-border overflow-hidden rounded-lg border p-6 shadow">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Tên sản phẩm</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="category_id">Danh mục</Label>
                                    <Select value={formData.category_id} onValueChange={(value) => handleSelectChange('category_id', value)}>
                                        <SelectTrigger id="category_id" className={errors.category_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="price">Giá (VND)</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="1000"
                                        className={errors.price ? 'border-red-500' : ''}
                                    />
                                    {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                                </div>

                                <div>
                                    <Label className="mb-2 block">Trạng thái</Label>
                                    <RadioGroup
                                        value={formData.status}
                                        onValueChange={(value: string) => handleSelectChange('status', value)}
                                        className="flex space-x-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="active" id="active" />
                                            <Label htmlFor="active" className="cursor-pointer">
                                                Đang bán
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="inactive" id="inactive" />
                                            <Label htmlFor="inactive" className="cursor-pointer">
                                                Không bán
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="image">Hình ảnh</Label>
                                    <Input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={errors.image ? 'border-red-500' : ''}
                                    />
                                    {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}

                                    {imagePreview && (
                                        <div className="mt-2">
                                            <p className="mb-1 text-sm">Xem trước:</p>
                                            <img src={imagePreview} alt="Xem trước" className="h-auto w-full max-w-[200px] rounded-md" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={5}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.visit('/products')} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
