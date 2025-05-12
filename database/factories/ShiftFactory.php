<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Shift>
 */
class ShiftFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    $shiftType = $this->faker->randomElement(['A', 'B']);
    $status = $this->faker->randomElement(['planned', 'completed', 'absent']);

    // Nếu shift là completed hoặc absent, thì nó đã trong quá khứ
    $date = $status !== 'planned'
      ? $this->faker->dateTimeBetween('-1 month', 'yesterday')->format('Y-m-d')
      : $this->faker->dateTimeBetween('today', '+1 month')->format('Y-m-d');

    return [
      'shift_type' => $shiftType,
      'date' => $date,
      'status' => $status,
    ];
  }
}
