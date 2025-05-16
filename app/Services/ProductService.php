<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductService extends BaseService
{
  /**
   * Lấy model class
   *
   * @return string
   */
  protected function getModelClass(): string
  {
    return Product::class;
  }

  /**
   * Lấy danh sách các trường hợp lệ để sắp xếp
   *
   * @return array
   */
  protected function getValidSortFields(): array
  {
    return ['created_at', 'name', 'price'];
  }

  /**
   * Áp dụng các bộ lọc cho product
   *
   * @param Builder $query
   * @param array $filters
   * @return Builder
   */
  protected function applyFilters(Builder $query, array $filters): Builder
  {
    // Lọc theo danh mục
    $query = $this->applyRelationFilter($query, $filters, 'category_id');

    // Lọc theo trạng thái
    $query = $this->applyRelationFilter($query, $filters, 'status');

    // Lọc theo khoảng giá
    $query = $this->applyRangeFilter($query, $filters, 'price', 'price_min', 'price_max');

    // Lọc theo tên
    $query = $this->applyNameFilter($query, $filters, 'name', ['name', 'sku']);

    return $query;
  }

  /**
   * Lấy danh sách sản phẩm với bộ lọc và sắp xếp
   *
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getProducts(array $filters = [], int $perPage = 10, string $sort = 'created_at_desc')
  {
    return $this->getDataWithFilters($filters, $perPage, $sort, ['category']);
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
