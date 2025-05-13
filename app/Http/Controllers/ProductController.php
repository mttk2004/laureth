<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductController extends Controller
{
  public function index(Request $request)
  {
    // Lấy query từ request
    $query = Product::query()->with(['category']);

    // Lọc theo danh mục
    if ($request->filled('category_id') && $request->category_id !== 'all') {
      $query->where('category_id', $request->category_id);
    }

    // Lọc theo trạng thái
    if ($request->filled('status') && $request->status !== 'all') {
      $query->where('status', $request->status);
    }

    // Lọc theo khoảng giá
    if ($request->filled('price_min')) {
      $query->where('price', '>=', $request->price_min);
    }

    if ($request->filled('price_max')) {
      $query->where('price', '<=', $request->price_max);
    }

    // Lấy danh sách sản phẩm đã lọc và phân trang
    $products = $query->paginate(10)->withQueryString();

    // Lấy tất cả danh mục để hiển thị trong filter
    $categories = Category::all();

    // Lấy thông tin user
    $user = Auth::user();

    return Inertia::render('Products/Index', [
      'products' => $products,
      'user' => $user,
      'categories' => $categories,
      'filters' => $request->only(['category_id', 'status', 'price_min', 'price_max'])
    ]);
  }
}
