<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'full_name' => $this->faker->name(),
      'email' => $this->faker->unique()->safeEmail(),
      'password' => Hash::make('password'),
      'phone' => $this->faker->unique()->regexify('0[35789]{8}'),
      'position' => 'SA', // Mặc định là SA, sẽ được ghi đè trong seeder
      'hourly_wage' => null,
      'base_salary' => null,
      'commission_rate' => 0,
      'last_login' => $this->faker->optional(0.7)->dateTimeThisMonth(),
      'remember_token' => Str::random(10),
    ];
  }

  /**
   * Indicate that the model's email address should be unverified.
   */
  public function unverified(): static
  {
    return $this->state(fn(array $attributes) => [
      'email_verified_at' => null,
    ]);
  }
}
