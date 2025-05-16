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
        $totalAmount = $this->faker->numberBetween(200, 5000) * 1000;
        $discountAmount = $this->faker->optional(0.3, 0)->numberBetween(50, 200) * 1000;
        $finalAmount = $totalAmount - $discountAmount;

        return [
            'order_date' => $this->faker->dateTimeBetween('-3 months', 'now'),
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
