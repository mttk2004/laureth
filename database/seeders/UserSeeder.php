<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Tạo một người dùng admin (DM - District Manager)
    User::create([
      'full_name' => 'Admin User',
      'email' => 'admin@example.com',
      'password' => Hash::make('password'),
      'phone' => '0987654321',
      'position' => 'DM',
      'base_salary' => 15000000,
      'commission_rate' => 5,
    ]);

    // Tạo 5 Store Manager (SM)
    for ($i = 0; $i < 5; $i++) {
      User::factory()->create([
        'position' => 'SM',
        'base_salary' => rand(8000000, 12000000),
        'hourly_wage' => null,
        'commission_rate' => rand(3, 8),
      ]);
    }

    // Tạo 5 Shift Leader (SL)
    for ($i = 0; $i < 5; $i++) {
      User::factory()->create([
        'position' => 'SL',
        'base_salary' => null,
        'hourly_wage' => rand(30000, 40000),
        'commission_rate' => rand(2, 6),
      ]);
    }

    // Tạo 20 Sales Associate (SA)
    for ($i = 0; $i < 20; $i++) {
      User::factory()->create([
        'position' => 'SA',
        'base_salary' => null,
        'hourly_wage' => rand(25000, 35000),
        'commission_rate' => rand(1, 5),
      ]);
    }
  }
}
