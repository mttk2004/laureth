<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'order_date' => $this->faker->dateTimeBetween('-6 months', 'now'),
      'total_amount' => $this->faker->numberBetween(1000, 10000) * 1000,
      'status' => $this->faker->randomElement(['pending', 'received', 'cancelled']),
    ];
  }

  /**
   * Configure the model factory.
   */
  public function configure()
  {
    return $this->afterMaking(function (\App\Models\PurchaseOrder $order) {
      // Định nghĩa id theo Snowflake
      $order->id = app('snowflake')->id();
    });
  }
}
