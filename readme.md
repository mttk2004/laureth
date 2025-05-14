# LAURETH - Hệ thống Quản lý Cửa hàng Phụ kiện Thời trang

## Giới thiệu

LAURETH là ứng dụng quản lý toàn diện dành cho chuỗi cửa hàng bán phụ kiện thời trang cao cấp. Hệ thống được thiết kế để hỗ trợ quản lý hiệu quả hoạt động bán hàng, kho hàng, nhân sự và báo cáo doanh số.

Ứng dụng này được xây dựng trên nền tảng Laravel + Inertia.js + React, với giao diện người dùng thân thiện, đáp ứng đầy đủ các yêu cầu nghiệp vụ của doanh nghiệp bán lẻ trong lĩnh vực thời trang.

## Mô hình kinh doanh

LAURETH phục vụ cho doanh nghiệp chuyên bán phụ kiện thời trang cao cấp (giày, túi xách, trang sức,...) thông qua mạng lưới các cửa hàng trực tiếp tại các trung tâm thương mại lớn, nơi có nhu cầu mua sắm cao.

### Quản lý kho hàng

- Hàng hóa được nhập trực tiếp từ nhà cung cấp nước ngoài về kho tổng, sau đó phân phối đến các cửa hàng trong hệ thống.
- Mỗi cửa hàng có kho riêng, do nhân viên cửa hàng quản lý và chịu trách nhiệm về mất mát.
- Việc luân chuyển hàng hóa giữa các cửa hàng yêu cầu "lệnh trao đổi" và sự đồng ý của cả hai bên.

### Quản lý nhân sự

- Nhân sự được phân thành các bậc:
  - **DM (District Manager)**: Quản lý chuỗi cửa hàng
  - **SM (Store Manager)**: Quản lý cửa hàng
  - **SL (Shift Leader)**: Trưởng ca bán hàng
  - **SA (Sales Associate)**: Nhân viên bán hàng
- Lương của SL và SA được tính theo giờ làm và hoa hồng theo giá trị sản phẩm.
- SM nhận lương cơ bản cộng với thưởng dựa trên doanh số cửa hàng.
- Nhân viên có 12 ngày nghỉ phép/năm, không được cộng dồn sang năm sau.
- Ca làm việc chia thành hai ca: A (8h-16h) và B (14h30-22h30), do SM quản lý.

### Quản lý cửa hàng

- Cửa hàng được thuê tại các trung tâm thương mại lớn để duy trì lượng khách ổn định.
- Mỗi cửa hàng có một SM chịu trách nhiệm quản lý và đào tạo nhân viên.
- Mỗi cửa hàng có mục tiêu doanh số riêng; nếu không đạt, SM sẽ không được hưởng hoa hồng.

### Chương trình khuyến mãi

- Hệ thống hỗ trợ tạo ra các chương trình khuyến mãi hấp dẫn để thu hút khách hàng.
- Ưu đãi dành cho khách hàng thân thiết để khuyến khích họ quay lại mua hàng.

### Thống kê và báo cáo

- DM và SM có thể xem doanh số hàng ngày của các cửa hàng để đánh giá và tìm giải pháp cải thiện.
- Cửa hàng có thể theo dõi doanh số hiện tại so với mục tiêu và các chỉ số bán hàng trong ngày.

## Cấu trúc hệ thống

### Cơ sở dữ liệu

Hệ thống sử dụng 15 bảng chính để quản lý:
- Người dùng/Nhân viên (users)
- Cửa hàng (stores)
- Sản phẩm (products) và Danh mục (categories)
- Nhà cung cấp (suppliers)
- Kho hàng (warehouses) và Tồn kho (inventory_items)
- Đơn hàng (orders) và Chi tiết đơn hàng (order_items)
- Ca làm việc (shifts) và Chấm công (attendance_records)
- Bảng lương (payrolls)
- Đơn nhập hàng (purchase_orders) và Chi tiết đơn nhập hàng (purchase_order_items)
- Chuyển kho (inventory_transfers)

Chi tiết cấu trúc cơ sở dữ liệu có thể xem tại [database.md](database.md).

### Phân quyền và giao diện

Hệ thống được thiết kế với 2 layout chính:
1. **Layout Quản lý (Admin Layout)**: Dành cho DM và SM
2. **Layout Nhân viên (Staff Layout)**: Dành cho SL và SA

Mỗi vai trò có các quyền hạn khác nhau trong hệ thống, được mô tả chi tiết trong [roles-and-layouts.md](roles-and-layouts.md).

## Tính năng chính

### Quản lý sản phẩm và kho hàng
- Quản lý thông tin sản phẩm và danh mục
- Theo dõi tồn kho tại kho tổng và kho cửa hàng
- Xử lý nhập hàng từ nhà cung cấp
- Quản lý việc chuyển kho giữa các cửa hàng

### Quản lý bán hàng
- Tạo và xử lý đơn hàng
- Áp dụng khuyến mãi và giảm giá
- Theo dõi doanh số bán hàng

### Quản lý nhân sự
- Phân ca làm việc
- Chấm công và tính giờ làm
- Tính lương và hoa hồng
- Quản lý ngày nghỉ phép

### Báo cáo và thống kê
- Báo cáo doanh số (theo ngày, tháng, cửa hàng)
- Báo cáo tồn kho
- Báo cáo hiệu suất nhân viên
- So sánh mục tiêu và thực tế

## Yêu cầu kỹ thuật

- PHP >= 8.1
- Laravel 10.x
- MySQL/MariaDB
- Node.js và NPM (cho các assets front-end)

## Cài đặt và triển khai

1. Clone repository:
```
git clone [repository_url] laureth
cd laureth
```

2. Cài đặt dependencies:
```
composer install
npm install
```

3. Thiết lập môi trường:
```
cp .env.example .env
php artisan key:generate
```

4. Cấu hình database trong file .env

5. Chạy migrations và seeders:
```
php artisan migrate --seed
```

6. Biên dịch assets:
```
npm run dev
```

7. Khởi chạy ứng dụng:
```
php artisan serve
```

## Đóng góp và phát triển

Chúng tôi luôn chào đón sự đóng góp từ cộng đồng để cải thiện và phát triển LAURETH. Vui lòng xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết về quy trình đóng góp.

## Giấy phép

LAURETH được phát hành dưới giấy phép [MIT](LICENSE).


## Tác giả

[Mai Trần Tuấn Kiệt](https://github.com/mttk2004)
