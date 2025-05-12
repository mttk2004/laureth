<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    $adjectives = ['Luxury', 'Modern', 'Elegant', 'Classic', 'Vintage', 'Royal', 'Premium', 'Fancy', 'Exquisite'];
    $materials = ['Gold', 'Silver', 'Platinum', 'Diamond', 'Pearl', 'Crystal', 'Steel', 'Leather', 'Titanium'];

    return [
      'name' => $this->faker->randomElement($adjectives) . ' ' . $this->faker->randomElement($materials) . ' ' . $this->faker->word(),
      'description' => $this->faker->paragraph(),
      'image' => 'products/' . $this->faker->numberBetween(1, 20) . '.jpg',
      'price' => $this->faker->numberBetween(200, 5000) * 1000,
      'status' => $this->faker->randomElement(['active', 'inactive']),
    ];
  }

  /**
   * Configure the model factory.
   */
  public function configure()
  {
    return $this->afterMaking(function (\App\Models\Product $product) {
      // Định nghĩa id theo Snowflake
      $product->id = app('snowflake')->id();
    });
  }
}
