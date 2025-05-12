<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Warehouse>
 */
class WarehouseFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'name' => $this->faker->randomElement(['Kho chính', 'Kho phụ', 'Kho dự phòng']) . ' ' . $this->faker->city(),
      'is_main' => false,
    ];
  }

  /**
   * Indicate that the warehouse is main
   */
  public function main(): static
  {
    return $this->state(fn(array $attributes) => [
      'name' => 'Kho trung tâm',
      'is_main' => true,
      'store_id' => null,
    ]);
  }
}
