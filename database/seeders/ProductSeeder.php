<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Lấy các danh mục hiện có
    $categories = Category::all();

    // Tạo 50 sản phẩm và gán danh mục ngẫu nhiên cho mỗi sản phẩm
    Product::factory(50)->make()->each(function ($product) use ($categories) {
      $product->category_id = $categories->random()->id;
      $product->save();
    });
  }
}
