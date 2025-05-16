# Hu01b0u1edbng du1eabn su1eed du1ee5ng FilterSortTrait vu00e0 BaseService

## Giu1edbi thiu1ec7u

Cu00e1c thu00e0nh phu1ea7n nu00e0y u0111u01b0u1ee3c xiu00e2y du1ef1ng u0111u1ec3 tu00e1i su1eed du1ee5ng logic lu1ecdc vu00e0 su1eafp xu1ebfp chung cho tu1ea5t cu1ea3 cu00e1c service trong u1ee9ng du1ee5ng Laureth. Mu1ee5c tiu00eau lu00e0 giu00fap:

- Giu1ea3m code lu1eb7p lu1ea1i
- Tu0103ng tu00ednh nhu1ea5t quu00e1n giu1eefa cu00e1c service
- Du1ec5 du00e0ng thu00eam mu1edbi thu00e0nh phu1ea7n
- Tu0103ng khu1ea3 nu0103ng bu1ea3o tru00ec

## 1. FilterSortTrait

Trait nu00e0y cung cu1ea5p cu00e1c phu01b0u01a1ng thu1ee9c hu1ec7 thu1ed1ng cho viu1ec7c lu1ecdc vu00e0 su1eafp xu1ebfp du1eef liu1ec7u:

### Su1eafp xu1ebfp

```php
protected function applySorting(
  Builder $query,
  string $sort,
  array $validSortFields = ['created_at', 'name'],
  string $defaultSortField = 'created_at',
  string $defaultSortDirection = 'desc'
): Builder
```

Hu1ed7 tru1ee3 cu1ea3 chu1ed7i su1eafp xu1ebfp `field_direction` (vd: created_at_desc) vu00e0 cu00e1c keyword u0111u1eb7c biu1ec7t (vd: newest, oldest).

### Lu1ecdc theo tu00ean

```php
protected function applyNameFilter(
  Builder $query,
  array $filters,
  string $filterKey = 'name',
  array $searchFields = ['name']
): Builder
```

Cho phu00e9p tu00ecm kiu1ebfm theo tu00ean hou1eb7c tu1eeb khu00f3a trong nhiu1ec1u tru01b0u1eddng.

### Lu1ecdc theo quan hu1ec7 ID

```php
protected function applyRelationFilter(
  Builder $query,
  array $filters,
  string $filterKey,
  ?string $field = null
): Builder
```

Du00f9ng cho lu1ecdc theo ID cu1ee7a mu1ed9t mu1ed1i quan hu1ec7 (store_id, category_id, etc).

### Lu1ecdc theo giu00e1 tru1ecb boolean

```php
protected function applyBooleanFilter(
  Builder $query,
  array $filters,
  string $filterKey,
  ?string $field = null
): Builder
```

Lu1ecdc theo cu00e1c tru01b0u1eddng cu00f3/khu00f4ng (is_main, is_active, etc).

### Lu1ecdc theo khuu1edfn giu00e1 tru1ecb

```php
protected function applyRangeFilter(
  Builder $query,
  array $filters,
  string $field,
  string $minKey,
  string $maxKey
): Builder
```

Lu1ecdc theo khou1ea3ng (price_min/price_max, date_from/date_to, etc).

## 2. BaseService

`BaseService` lu00e0 lu1edbp tru1eeba tu01b0u1ee3ng ku1ebf thu1eeba `FilterSortTrait`, cung cu1ea5p mu1ed9t nu1ec1n tu1ea3ng thu1ed1ng nhu1ea5t cho tu1ea5t cu1ea3 service:

### Cu00e1c phu01b0u01a1ng thu1ee9c mu1edai service phu1ea3i triu1ec3n khai:

```php
// Tru1ea3 vu1ec1 class Model mu00e0 service nu00e0y lu00e0m viu1ec7c vu1edbi
protected function getModelClass(): string
```

### Cu00e1c phu01b0u01a1ng thu1ee9c cu00f3 thu1ec3 ghi u0111u00e8:

```php
// Tru1ea3 vu1ec1 mu1ea3ng cu00e1c tru01b0u1eddng hu1ee3p lu1ec7 u0111u1ec3 su1eafp xu1ebfp
protected function getValidSortFields(): array

// u00c1p du1ee5ng cu00e1c bu1ed9 lu1ecdc cu1ee5 thu1ec3 cho tu1eebng loa
i entity
protected function applyFilters(Builder $query, array $filters): Builder
```

### Phu01b0u01a1ng thu1ee9c chung cho tu1ea5t cu1ea3 service:

```php
// Lu1ea5y du1eef liu1ec7u vu1edbi bu1ed9 lu1ecdc, su1eafp xu1ebfp vu00e0 phu00e2n trang
public function getDataWithFilters(
  array $filters = [],
  int $perPage = 10,
  string $sort = 'created_at_desc',
  array $relations = []
)
```

## Cu00e1ch su1eed du1ee5ng

### 1. Tu1ea1o service mu1edbi ku1ebf thu1eeba BaseService

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
    // Lu1ecdc theo tu00ean
    $query = $this->applyNameFilter($query, $filters, 'name', ['name', 'description']);

    // Lu1ecdc theo quan hu1ec7
    $query = $this->applyRelationFilter($query, $filters, 'category_id');

    // Lu1ecdc theo boolean
    $query = $this->applyBooleanFilter($query, $filters, 'is_active');

    // Lu1ecdc theo khou1ea3ng giu00e1
    $query = $this->applyRangeFilter(
      $query,
      $filters,
      'price',
      'price_min',
      'price_max'
    );

    // Cu00e1c logic lu1ecdc u0111u1eb7c thu00f9
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

### 2. Su1eed du1ee5ng trong controller

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

## Lu01b0u u00fd

Khi chim mu1edbi chu1ee9c nu0103ng lu1ecdc hou1eb7c su1eafp xu1ebfp chung:

1. Nu1ebfu chu1ee9c nu0103ng lu00e0 thu00f4ng du1ee5ng cho nhiu1ec1u entity, hu00e3y thu00eam vu00e0o `FilterSortTrait`
2. Nu1ebfu chu1ee9c nu0103ng chu1ec9 diu00f9ng cho 1 hou1eb7c mu1ed9t su1ed1 u00edt entity, hu00e3y liu00ean ku1ebft triu1ec3n khai trong phu01b0u01a1ng thu1ee9c `applyFilters` cu1ee7a service tu01b0u01a1ng u1ee9ng
