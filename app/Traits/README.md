# Hướng dẫn sử dụng FilterSortTrait và BaseService

## Giới thiệu

Các thành phần này được xây dựng để tái sử dụng logic lọc và sắp xếp chung cho tất cả các service trong ứng dụng Laureth. Mục tiêu là giúp:

- Giảm code lặp lại
- Tăng tính nhất quán giữa các service
- Dễ dàng thêm mới thành phần
- Tăng khả năng bảo trì

## 1. FilterSortTrait

Trait này cung cấp các phương thức hệ thống cho việc lọc và sắp xếp dữ liệu:

### Sắp xếp

```php
protected function applySorting(
  Builder $query,
  string $sort,
  array $validSortFields = ['created_at', 'name'],
  string $defaultSortField = 'created_at',
  string $defaultSortDirection = 'desc'
): Builder
```

Hỗ trợ cả chuỗi sắp xếp `field_direction` (vd: created_at_desc) và các keyword đặc biệt (vd: newest, oldest).

### Lọc theo tên

```php
protected function applyNameFilter(
  Builder $query,
  array $filters,
  string $filterKey = 'name',
  array $searchFields = ['name']
): Builder
```

Cho phép tìm kiếm theo tên hoặc từ khóa trong nhiều trường.

### Lọc theo quan hệ ID

```php
protected function applyRelationFilter(
  Builder $query,
  array $filters,
  string $filterKey,
  ?string $field = null
): Builder
```

Dùng cho lọc theo ID của một mối quan hệ (store_id, category_id, etc).

### Lọc theo giá trị boolean

```php
protected function applyBooleanFilter(
  Builder $query,
  array $filters,
  string $filterKey,
  ?string $field = null
): Builder
```

Lọc theo các trường có/không (is_main, is_active, etc).

### Lọc theo khuần giá trị

```php
protected function applyRangeFilter(
  Builder $query,
  array $filters,
  string $field,
  string $minKey,
  string $maxKey
): Builder
```

Lọc theo khoảng (price_min/price_max, date_from/date_to, etc).

## 2. BaseService

`BaseService` là lớp trừu tượng kế thừa `FilterSortTrait`, cung cấp một nền tảng thống nhất cho tất cả service:

### Các phương thức mỗi service phải triển khai:

```php
// Trả về class Model mà service này làm việc với
protected function getModelClass(): string
```

### Các phương thức có thể ghi đè:

```php
// Trả về mảng các trường hợp lệ để sắp xếp
protected function getValidSortFields(): array

// Áp dụng các bộ lọc cụ thể cho từng loại entity
protected function applyFilters(Builder $query, array $filters): Builder
```

### Phương thức chung cho tất cả service:

```php
// Lấy dữ liệu với bộ lọc, sắp xếp và phân trang
public function getDataWithFilters(
  array $filters = [],
  int $perPage = 10,
  string $sort = 'created_at_desc',
  array $relations = []
)
```

## Cách sử dụng

### 1. Tạo service mới kế thừa BaseService

```php
class MyEntityService extends BaseService
{
  protected function getModelClass(): string
  {
    return MyEntity::class;
  }

  protected function getValidSortFields(): array
  {
    return ['created_at', 'name', 'custom_field'];
  }

  protected function applyFilters(Builder $query, array $filters): Builder
  {
    // Lọc theo tên
    $query = $this->applyNameFilter($query, $filters, 'name', ['name', 'description']);

    // Lọc theo quan hệ
    $query = $this->applyRelationFilter($query, $filters, 'category_id');

    // Lọc theo boolean
    $query = $this->applyBooleanFilter($query, $filters, 'is_active');

    // Lọc theo khoảng giá
    $query = $this->applyRangeFilter(
      $query,
      $filters,
      'price',
      'price_min',
      'price_max'
    );

    // Các logic lọc đặc thù
    if (isset($filters['custom_filter'])) {
      $query->where('custom_field', $filters['custom_filter']);
    }

    return $query;
  }

  public function getMyEntities(array $filters = [], int $perPage = 10, string $sort = 'created_at_desc')
  {
    return $this->getDataWithFilters($filters, $perPage, $sort, ['relation1', 'relation2']);
  }
}
```

### 2. Sử dụng trong controller

```php
class MyEntityController extends Controller
{
  private $myEntityService;

  public function __construct(MyEntityService $myEntityService)
  {
    $this->myEntityService = $myEntityService;
  }

  public function index(Request $request)
  {
    $items = $this->myEntityService->getMyEntities(
      $request->all(),
      10,
      $request->input('sort', 'created_at_desc')
    );

    return Inertia::render('MyEntities/Index', [
      'items' => $items,
      'filters' => $request->only(['name', 'category_id', 'is_active', 'price_min', 'price_max']),
      'sort' => $request->input('sort', 'created_at_desc'),
    ]);
  }
}
```

## Lưu ý

Khi thêm mới chức năng lọc hoặc sắp xếp chung:

1. Nếu chức năng là thông dụng cho nhiều entity, hãy thêm vào `FilterSortTrait`
2. Nếu chức năng chỉ dùng cho 1 hoặc một số ít entity, hãy triển khai trong phương thức `applyFilters` của service tương ứng
