# Cơ sở dữ liệu hệ thống quản lý cửa hàng bán phụ kiện thời trang

## Giới thiệu

Đây là cơ sở dữ liệu được thiết kế cho một hệ thống quản lý cửa hàng bán phụ kiện thời trang. Hệ thống này hỗ trợ quản lý nhân viên, cửa hàng, sản phẩm, kho hàng, bán hàng, chấm công và tính lương.

Cơ sở dữ liệu được tối ưu hóa để đơn giản nhưng vẫn đảm bảo đáp ứng các nhu cầu cơ bản của một cửa hàng bán lẻ.

## Cấu trúc cơ sở dữ liệu

Hệ thống gồm 15 bảng chính:

### 1. `users` - Người dùng/Nhân viên
Lưu trữ thông tin về tất cả nhân viên trong hệ thống.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| full_name | VARCHAR(100) | Họ tên nhân viên |
| email | VARCHAR(100) | Email, dùng để đăng nhập |
| password | VARCHAR(255) | Mật khẩu đã mã hóa |
| phone | VARCHAR(20) | Số điện thoại |
| position | ENUM | Vị trí làm việc: DM (Quản lý chuỗi), SM (Quản lý cửa hàng), SL (Trưởng ca), SA (Nhân viên bán hàng) |
| hourly_wage | DECIMAL(10,2) | Lương theo giờ (áp dụng cho SL và SA) |
| base_salary | DECIMAL(10,2) | Lương cơ bản (áp dụng cho SM) |
| commission_rate | DECIMAL(5,2) | Tỉ lệ hoa hồng (%) |
| store_id | INT | Khóa ngoại tới bảng stores |
| created_at | TIMESTAMP | Thời gian tạo |

### 2. `stores` - Cửa hàng
Quản lý thông tin về các cửa hàng trong hệ thống.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| name | VARCHAR(100) | Tên cửa hàng |
| address | TEXT | Địa chỉ cửa hàng |
| manager_id | INT | ID của người quản lý (SM), khóa ngoại tới bảng users |
| monthly_target | DECIMAL(12,2) | Mục tiêu doanh số hàng tháng |
| created_at | TIMESTAMP | Thời gian tạo |

### 3. `products` - Sản phẩm
Quản lý thông tin về các sản phẩm được bán.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| name | VARCHAR(200) | Tên sản phẩm |
| description | TEXT | Mô tả sản phẩm |
| image | VARCHAR(255) | Đường dẫn hình ảnh |
| category_id | INT | Khóa ngoại tới bảng categories |
| price | DECIMAL(10,2) | Giá bán |
| status | ENUM | Trạng thái: active (đang bán), inactive (ngừng bán) |
| created_at | TIMESTAMP | Thời gian tạo |

### 4. `categories` - Danh mục sản phẩm
Phân loại sản phẩm theo danh mục.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| name | VARCHAR(100) | Tên danh mục |

### 5. `suppliers` - Nhà cung cấp
Quản lý thông tin về các nhà cung cấp.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| name | VARCHAR(200) | Tên nhà cung cấp |
| phone | VARCHAR(20) | Số điện thoại |
| email | VARCHAR(100) | Email liên hệ |
| created_at | TIMESTAMP | Thời gian tạo |

### 6. `warehouses` - Kho hàng
Quản lý thông tin về các kho hàng trong hệ thống.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| name | VARCHAR(100) | Tên kho |
| is_main | BOOLEAN | Đánh dấu kho tổng (true) hoặc kho cửa hàng (false) |
| store_id | INT | Khóa ngoại tới bảng stores, NULL nếu là kho tổng |
| created_at | TIMESTAMP | Thời gian tạo |

### 7. `inventory_items` - Tồn kho
Quản lý số lượng sản phẩm trong mỗi kho.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| warehouse_id | INT | Khóa ngoại tới bảng warehouses |
| product_id | INT | Khóa ngoại tới bảng products |
| quantity | INT | Số lượng tồn kho |
| updated_at | TIMESTAMP | Thời gian cập nhật |

### 8. `orders` - Đơn hàng
Quản lý thông tin đơn hàng bán tại cửa hàng.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| order_date | TIMESTAMP | Ngày tạo đơn hàng |
| total_amount | DECIMAL(12,2) | Tổng giá trị đơn hàng |
| discount_amount | DECIMAL(10,2) | Giảm giá |
| final_amount | DECIMAL(12,2) | Số tiền cuối cùng |
| payment_method | ENUM | Phương thức thanh toán: cash, card, transfer |
| status | ENUM | Trạng thái: completed, canceled, pending |
| user_id | INT | ID nhân viên bán hàng, khóa ngoại tới bảng users |
| store_id | INT | ID cửa hàng, khóa ngoại tới bảng stores |
| created_at | TIMESTAMP | Thời gian tạo |

### 9. `order_items` - Chi tiết đơn hàng
Lưu trữ thông tin các sản phẩm trong đơn hàng.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| order_id | INT | Khóa ngoại tới bảng orders |
| product_id | INT | Khóa ngoại tới bảng products |
| quantity | INT | Số lượng sản phẩm |
| unit_price | DECIMAL(10,2) | Đơn giá |
| total_price | DECIMAL(12,2) | Tổng giá (số lượng × đơn giá) |

### 10. `shifts` - Ca làm việc
Quản lý lịch làm việc của nhân viên.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| shift_type | ENUM | Loại ca: A (8h-16h) hoặc B (14h30-22h30) |
| date | DATE | Ngày làm việc |
| user_id | INT | ID nhân viên, khóa ngoại tới bảng users |
| store_id | INT | ID cửa hàng, khóa ngoại tới bảng stores |
| status | ENUM | Trạng thái: planned, completed, absent |

### 11. `attendance_records` - Chấm công
Ghi lại thời gian làm việc thực tế của nhân viên.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| user_id | INT | ID nhân viên, khóa ngoại tới bảng users |
| shift_id | INT | ID ca làm việc, khóa ngoại tới bảng shifts |
| check_in | TIMESTAMP | Thời gian vào ca |
| check_out | TIMESTAMP | Thời gian kết thúc ca |
| total_hours | DECIMAL(5,2) | Tổng số giờ làm |
| created_at | TIMESTAMP | Thời gian tạo |

### 12. `payrolls` - Bảng lương
Quản lý thông tin lương hàng tháng của nhân viên.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| user_id | INT | ID nhân viên, khóa ngoại tới bảng users |
| month | INT | Tháng tính lương |
| year | INT | Năm tính lương |
| base_amount | DECIMAL(10,2) | Lương cơ bản hoặc lương theo giờ |
| total_hours | DECIMAL(6,2) | Tổng số giờ làm việc |
| commission_amount | DECIMAL(10,2) | Tiền hoa hồng |
| final_amount | DECIMAL(12,2) | Tổng lương |
| status | ENUM | Trạng thái: pending, paid |
| created_at | TIMESTAMP | Thời gian tạo |

### 13. `purchase_orders` - Đơn nhập hàng
Quản lý việc nhập hàng từ nhà cung cấp.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| supplier_id | INT | ID nhà cung cấp, khóa ngoại tới bảng suppliers |
| warehouse_id | INT | ID kho hàng, khóa ngoại tới bảng warehouses |
| user_id | INT | ID người tạo đơn, khóa ngoại tới bảng users |
| order_date | TIMESTAMP | Ngày đặt hàng |
| total_amount | DECIMAL(12,2) | Tổng giá trị đơn hàng |
| status | ENUM | Trạng thái: pending, received, cancelled |
| created_at | TIMESTAMP | Thời gian tạo |

### 14. `purchase_order_items` - Chi tiết đơn nhập hàng
Lưu trữ thông tin sản phẩm trong đơn nhập hàng.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| purchase_order_id | INT | Khóa ngoại tới bảng purchase_orders |
| product_id | INT | Khóa ngoại tới bảng products |
| quantity | INT | Số lượng |
| purchase_price | DECIMAL(10,2) | Giá nhập |
| selling_price | DECIMAL(10,2) | Giá bán dự kiến |

### 15. `inventory_transfers` - Chuyển kho
Quản lý việc chuyển hàng giữa các kho.

| Trường | Kiểu dữ liệu | Mô tả |
|--------|--------------|-------|
| id | INT | Khóa chính, tự tăng |
| source_warehouse_id | INT | ID kho nguồn, khóa ngoại tới bảng warehouses |
| destination_warehouse_id | INT | ID kho đích, khóa ngoại tới bảng warehouses |
| requested_by | INT | ID người yêu cầu, khóa ngoại tới bảng users |
| approved_by | INT | ID người phê duyệt, khóa ngoại tới bảng users |
| product_id | INT | ID sản phẩm chuyển, khóa ngoại tới bảng products |
| quantity | INT | Số lượng chuyển |
| status | ENUM | Trạng thái: pending, approved, rejected, completed |
| created_at | TIMESTAMP | Thời gian tạo |

## Mối quan hệ giữa các bảng

1. **Quản lý người dùng và cửa hàng**:
   - `users.store_id` → `stores.id`: Mỗi nhân viên thuộc về một cửa hàng
   - `stores.manager_id` → `users.id`: Mỗi cửa hàng có một quản lý (SM)

2. **Quản lý sản phẩm**:
   - `products.category_id` → `categories.id`: Mỗi sản phẩm thuộc về một danh mục

3. **Quản lý kho hàng**:
   - `warehouses.store_id` → `stores.id`: Mỗi cửa hàng có một kho
   - `inventory_items.warehouse_id` → `warehouses.id`: Mỗi mục tồn kho thuộc về một kho
   - `inventory_items.product_id` → `products.id`: Mỗi mục tồn kho là một sản phẩm

4. **Quản lý bán hàng**:
   - `orders.user_id` → `users.id`: Mỗi đơn hàng được tạo bởi một nhân viên
   - `orders.store_id` → `stores.id`: Mỗi đơn hàng thuộc về một cửa hàng
   - `order_items.order_id` → `orders.id`: Mỗi chi tiết đơn hàng thuộc về một đơn hàng
   - `order_items.product_id` → `products.id`: Mỗi chi tiết đơn hàng là một sản phẩm

5. **Quản lý ca làm việc và chấm công**:
   - `shifts.user_id` → `users.id`: Mỗi ca làm việc được gán cho một nhân viên
   - `shifts.store_id` → `stores.id`: Mỗi ca làm việc diễn ra tại một cửa hàng
   - `attendance_records.user_id` → `users.id`: Mỗi bản ghi chấm công thuộc về một nhân viên
   - `attendance_records.shift_id` → `shifts.id`: Mỗi bản ghi chấm công liên kết với một ca làm việc

6. **Quản lý lương**:
   - `payrolls.user_id` → `users.id`: Mỗi bảng lương thuộc về một nhân viên

7. **Quản lý nhập hàng**:
   - `purchase_orders.supplier_id` → `suppliers.id`: Mỗi đơn nhập hàng liên kết với một nhà cung cấp
   - `purchase_orders.warehouse_id` → `warehouses.id`: Mỗi đơn nhập hàng được nhập vào một kho
   - `purchase_orders.user_id` → `users.id`: Mỗi đơn nhập hàng được tạo bởi một nhân viên
   - `purchase_order_items.purchase_order_id` → `purchase_orders.id`: Mỗi chi tiết đơn nhập hàng thuộc về một đơn nhập hàng
   - `purchase_order_items.product_id` → `products.id`: Mỗi chi tiết đơn nhập hàng là một sản phẩm

8. **Quản lý chuyển kho**:
   - `inventory_transfers.source_warehouse_id` → `warehouses.id`: Kho nguồn
   - `inventory_transfers.destination_warehouse_id` → `warehouses.id`: Kho đích
   - `inventory_transfers.requested_by` → `users.id`: Người yêu cầu chuyển kho
   - `inventory_transfers.approved_by` → `users.id`: Người phê duyệt chuyển kho
   - `inventory_transfers.product_id` → `products.id`: Sản phẩm được chuyển

## Luồng nghiệp vụ chính

1. **Quy trình bán hàng**:
   - Nhân viên bán hàng (SA) tạo đơn hàng mới
   - Thêm các sản phẩm vào đơn hàng
   - Hoàn tất đơn hàng và cập nhật tồn kho
   - Hệ thống tính hoa hồng cho nhân viên bán hàng

2. **Quy trình nhập hàng**:
   - Quản lý cửa hàng (SM) tạo đơn nhập hàng từ nhà cung cấp
   - Thêm sản phẩm vào đơn nhập hàng
   - Khi nhận hàng, cập nhật đơn hàng và tồn kho

3. **Quy trình chuyển kho**:
   - Quản lý cửa hàng (SM) tạo yêu cầu chuyển kho
   - Quản lý khác xem xét và phê duyệt yêu cầu
   - Khi hoàn tất, cập nhật tồn kho tại cả hai kho

4. **Quy trình chấm công và tính lương**:
   - Nhân viên check-in khi bắt đầu ca và check-out khi kết thúc
   - Hệ thống tính tổng giờ làm việc
   - Cuối tháng, hệ thống tính lương dựa trên giờ làm, lương cơ bản và hoa hồng

## Chức năng chính của hệ thống

1. **Quản lý nhân viên và phân quyền**
2. **Quản lý cửa hàng**
3. **Quản lý sản phẩm**
4. **Quản lý kho hàng và tồn kho**
5. **Quản lý bán hàng**
6. **Quản lý ca làm việc và chấm công**
7. **Tính lương và hoa hồng**
8. **Quản lý nhập hàng từ nhà cung cấp**
9. **Quản lý chuyển kho**
