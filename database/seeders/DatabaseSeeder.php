<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
  /**
   * Seed the application's database.
   */
  public function run(): void
  {
    $this->call([
      UserSeeder::class,
      StoreSeeder::class,
      CategorySeeder::class,
      ProductSeeder::class,
      SupplierSeeder::class,
      WarehouseSeeder::class,
      InventorySeeder::class,
      ShiftSeeder::class,
      AttendanceSeeder::class,
      PayrollSeeder::class,
      OrderSeeder::class,
      PurchaseOrderSeeder::class,
      InventoryTransferSeeder::class,
    ]);
  }
}
