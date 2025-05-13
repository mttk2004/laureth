<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
  public function index()
  {
    $products = Product::with(['category'])->paginate(10);

    return Inertia::render('Products/Index', [
      'products' => $products
    ]);
  }
}
