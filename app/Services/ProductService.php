<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductService extends BaseService
{
  /**
   * Lu1ea5y model class
   *
   * @return string
   */
  protected function getModelClass(): string
  {
    return Product::class;
  }

  /**
   * Lu1ea5y danh su00e1ch cu00e1c tru01b0u1eddng hu1ee3p lu1ec7 u0111u1ec3 su1eafp xu1ebfp
   *
   * @return array
   */
  protected function getValidSortFields(): array
  {
    return ['created_at', 'name', 'price'];
  }

  /**
   * u00c1p du1ee5ng cu00e1c bu1ed9 lu1ecdc cho product
   *
   * @param Builder $query
   * @param array $filters
   * @return Builder
   */
  protected function applyFilters(Builder $query, array $filters): Builder
  {
    // Lu1ecdc theo danh mu1ee5c
    $query = $this->applyRelationFilter($query, $filters, 'category_id');

    // Lu1ecdc theo tru1ea1ng thu00e1i
    $query = $this->applyRelationFilter($query, $filters, 'status');

    // Lu1ecdc theo khou1ea3ng giu00e1
    $query = $this->applyRangeFilter($query, $filters, 'price', 'price_min', 'price_max');

    // Lu1ecdc theo tu00ean
    $query = $this->applyNameFilter($query, $filters, 'name', ['name', 'sku']);

    return $query;
  }

  /**
   * Lu1ea5y danh su00e1ch su1ea3n phu1ea9m vu1edbi bu1ed9 lu1ecdc vu00e0 su1eafp xu1ebfp
   *
   * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
   */
  public function getProducts(array $filters = [], int $perPage = 10, string $sort = 'created_at_desc')
  {
    return $this->getDataWithFilters($filters, $perPage, $sort, ['category']);
  }

  /**
   * Tu1ea1o su1ea3n phu1ea9m mu1edbi
   *
   * @return Product
   */
  public function createProduct(array $data)
  {
    // Xu1eed lu00fd upload u1ea3nh nu1ebfu cu00f3
    if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
      $data['image'] = $this->uploadImage($data['image']);
    }

    return Product::create($data);
  }

  /**
   * Cu1eadp nhu1eadt su1ea3n phu1ea9m
   *
   * @return Product
   */
  public function updateProduct(Product $product, array $data)
  {
    // Xu1eed lu00fd upload u1ea3nh mu1edbi nu1ebfu cu00f3
    if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
      // Xu00f3a u1ea3nh cu0169
      if ($product->image) {
        $this->deleteImage($product->image);
      }

      $data['image'] = $this->uploadImage($data['image']);
    }

    $product->update($data);

    return $product;
  }

  /**
   * Xu00f3a su1ea3n phu1ea9m
   *
   * @return bool
   */
  public function deleteProduct(Product $product)
  {
    // Xu00f3a u1ea3nh tru01b0u1edbc khi xu00f3a su1ea3n phu1ea9m
    if ($product->image) {
      $this->deleteImage($product->image);
    }

    return $product->delete();
  }

  /**
   * Upload u1ea3nh su1ea3n phu1ea9m
   *
   * @return string
   */
  private function uploadImage(UploadedFile $image)
  {
    $path = Storage::disk('public')->put('products', $image);

    return $path;
  }

  /**
   * Xu00f3a u1ea3nh su1ea3n phu1ea9m
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
