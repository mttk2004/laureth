<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    /**
     * Lấy danh sách sản phẩm với bộ lọc
     *
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getProducts(array $filters = [], int $perPage = 10)
    {
        $query = Product::query()->with(['category']);

        // Lọc theo danh mục
        if (isset($filters['category_id']) && $filters['category_id'] !== 'all') {
            $query->where('category_id', $filters['category_id']);
        }

        // Lọc theo trạng thái
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Lọc theo khoảng giá
        if (isset($filters['price_min'])) {
            $query->where('price', '>=', $filters['price_min']);
        }

        if (isset($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Tạo sản phẩm mới
     *
     * @return Product
     */
    public function createProduct(array $data)
    {
        // Xử lý upload ảnh nếu có
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $data['image'] = $this->uploadImage($data['image']);
        }

        return Product::create($data);
    }

    /**
     * Cập nhật sản phẩm
     *
     * @return Product
     */
    public function updateProduct(Product $product, array $data)
    {
        // Xử lý upload ảnh mới nếu có
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            // Xóa ảnh cũ
            if ($product->image) {
                $this->deleteImage($product->image);
            }

            $data['image'] = $this->uploadImage($data['image']);
        }

        $product->update($data);

        return $product;
    }

    /**
     * Xóa sản phẩm
     *
     * @return bool
     */
    public function deleteProduct(Product $product)
    {
        // Xóa ảnh trước khi xóa sản phẩm
        if ($product->image) {
            $this->deleteImage($product->image);
        }

        return $product->delete();
    }

    /**
     * Upload ảnh sản phẩm
     *
     * @return string
     */
    private function uploadImage(UploadedFile $image)
    {
        $path = Storage::disk('public')->put('products', $image);

        return $path;
    }

    /**
     * Xóa ảnh sản phẩm
     *
     * @return bool
     */
    private function deleteImage(string $imagePath)
    {
        if (Storage::disk('public')->exists($imagePath)) {
            return Storage::disk('public')->delete($imagePath);
        }

        return false;
    }
}
