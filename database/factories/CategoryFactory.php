<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    $categories = [
      'Nhẫn',
      'Dây chuyền',
      'Lắc tay',
      'Bông tai',
      'Vòng cổ',
      'Đồng hồ nam',
      'Đồng hồ nữ',
      'Kẹp tóc',
      'Khuyên tai',
      'Mắt kính',
      'Túi xách',
      'Ví',
      'Thắt lưng',
      'Cài áo'
    ];

    return [
      'name' => $this->faker->unique()->randomElement($categories)
    ];
  }
}
