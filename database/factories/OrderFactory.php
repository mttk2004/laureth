<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    $totalAmount = $this->faker->numberBetween(500, 10000) * 1000; // Tổng tiền đơn hàng từ 500k đến 10M
    $discountAmount = $this->faker->numberBetween(0, 5) * $totalAmount / 100; // Số tiền giảm giá từ 0-5% tổng tiền
    $finalAmount = $totalAmount - $discountAmount;

    return [
      'order_date' => $this->faker->dateTimeBetween('-6 months', 'now'),
      'total_amount' => $totalAmount,
      'discount_amount' => $discountAmount,
      'final_amount' => $finalAmount,
      'payment_method' => $this->faker->randomElement(['cash', 'card', 'transfer']),
      'status' => $this->faker->randomElement(['completed', 'canceled', 'pending']),
    ];
  }

  /**
   * Configure the model factory.
   */
  public function configure()
  {
    return $this->afterMaking(function (\App\Models\Order $order) {
      // Định nghĩa id theo Snowflake
      $order->id = app('snowflake')->id();
    });
  }
}
