<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Store>
 */
class StoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucwords($this->faker->word()).
              $this->faker->randomElement([' '.ucwords($this->faker->word()).' ', ' ']).
              $this->faker->randomElement(['Shop', 'Store']),
            'address' => $this->faker->address(),
            'monthly_target' => $this->faker->numberBetween(500, 2000) * 100000,
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure()
    {
        return $this->afterMaking(function (\App\Models\Store $store) {
            // Định nghĩa id theo Snowflake
            $store->id = app('snowflake')->id();
        });
    }
}
