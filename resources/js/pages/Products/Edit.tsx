import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Category, Product } from '@/types/product';
import { User } from '@/types/user';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface Props {
  product: Product;
  categories: Category[];
  user: User;
}

export default function ProductEdit({ product, categories, user }: Props) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    category_id: product.category_id.toString(),
    price: product.price.toString(),
    status: product.status,
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  // Thiết lập xem trước hình ảnh nếu sản phẩm có ảnh
  useEffect(() => {
    if (product.image) {
      const imageUrl = product.image.startsWith('http')
        ? product.image
        : `/storage/${product.image}`;
      setImagePreview(imageUrl);
    }
  }, [product.image]);

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
    data.append('_method', 'PUT'); // Laravel yêu cầu '_method' để override method
    data.append('name', formData.name);
    data.append('description', formData.description || '');
    data.append('category_id', formData.category_id);
    data.append('price', formData.price);
    data.append('status', formData.status);

    if (formData.image) {
      data.append('image', formData.image);
    }

    router.post(`/products/${product.id}`, data, {
      onSuccess: () => {
        // Hiển thị thông báo thành công
        addToast('Sản phẩm đã được cập nhật thành công', 'success');
        // Chuyển hướng đã được xử lý tự động
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
        </div>

        <div className="bg-background rounded-lg shadow overflow-hidden border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="category_id">Danh mục</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleSelectChange('category_id', value)}
                  >
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
                  {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
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
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <Label className="block mb-2">Trạng thái</Label>
                  <RadioGroup
                    value={formData.status}
                    onValueChange={(value: string) => handleSelectChange('status', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active" className="cursor-pointer">Đang bán</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inactive" id="inactive" />
                      <Label htmlFor="inactive" className="cursor-pointer">Không bán</Label>
                    </div>
                  </RadioGroup>
                  {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
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
                  {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}

                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm mb-1">Hình ảnh hiện tại:</p>
                      <img
                        src={imagePreview}
                        alt="Hình ảnh sản phẩm"
                        className="w-full max-w-[200px] h-auto rounded-md"
                      />
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
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.get('/products')}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Cập nhật sản phẩm'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
