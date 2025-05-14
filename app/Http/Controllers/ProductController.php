<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductController extends Controller
{
    private $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Hiển thị danh sách sản phẩm
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Lấy danh sách sản phẩm đã lọc, sắp xếp và phân trang
        $products = $this->productService->getProducts(
            $request->all(),
            10,
            $request->input('sort', 'created_at_desc')
        );

        // Lấy tất cả danh mục để hiển thị trong filter
        $categories = Category::all();

        // Lấy thông tin user
        $user = Auth::user();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'user' => $user,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'status', 'price_min', 'price_max', 'name']),
            'sort' => $request->input('sort', 'created_at_desc'),
        ]);
    }

    /**
     * Hiển thị form tạo sản phẩm mới
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Lấy danh sách danh mục để hiển thị trong dropdown
        $categories = Category::all();

        return Inertia::render('Products/Create', [
            'categories' => $categories,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Lưu sản phẩm mới
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreProductRequest $request)
    {
        // Xử lý lưu sản phẩm qua service
        $this->productService->createProduct($request->validated());

        return redirect()->route('products.index')
            ->with('success', 'Sản phẩm đã được tạo thành công.');
    }

    /**
     * Hiển thị form chỉnh sửa sản phẩm
     *
     * @param  mixed  $productId
     * @return \Inertia\Response
     */
    public function edit($productId)
    {
        // Tìm sản phẩm theo ID truyền vào
        $product = Product::findOrFail($productId);

        // Lấy danh sách danh mục để hiển thị trong dropdown
        $categories = Category::all();

        return Inertia::render('Products/Edit', [
            'product' => $product->load('category'),
            'categories' => $categories,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Cập nhật sản phẩm
     *
     * @param  mixed  $productId
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(UpdateProductRequest $request, $productId)
    {
        // Tìm sản phẩm theo ID truyền vào
        $product = Product::findOrFail($productId);

        // Xử lý cập nhật sản phẩm qua service
        $this->productService->updateProduct($product, $request->validated());

        return redirect()->route('products.index')
            ->with('success', 'Sản phẩm đã được cập nhật thành công.');
    }

    /**
     * Xóa sản phẩm
     *
     * @param  mixed  $productId
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($productId)
    {
        // Tìm sản phẩm theo ID
        $product = Product::findOrFail($productId);

        // Xử lý xóa sản phẩm qua service
        $this->productService->deleteProduct($product);

        return redirect()->route('products.index')
            ->with('success', 'Sản phẩm đã được xóa thành công.');
    }
}
