# Voucher Service

Service **Voucher** là một phần của hệ thống Huyshop (Microservices architecture), được phát triển bằng Go (Golang) và giao tiếp chủ yếu qua gRPC. Service này chịu trách nhiệm quản lý hệ thống mã giảm giá, các chương trình khuyến mãi, và cấp phát voucher cho người dùng.

## 🚀 Tính năng chính

- **Quản lý Voucher (Vouchers)**: Tạo mới, cập nhật, xóa, tìm kiếm và thống kê các chương trình khuyến mãi/voucher.
- **Quản lý Mã giảm giá (Codes)**: Quản lý chi tiết từng mã giảm giá cụ thể thuộc một chương trình voucher.
- **Quản lý User Voucher**: Quản lý và theo dõi việc gán, sở hữu và sử dụng mã giảm giá của từng người dùng cụ thể.

## 🛠 Yêu cầu hệ thống

- **Go**: 1.18+ (khuyến nghị)
- **Database**: Hỗ trợ kết nối cơ sở dữ liệu theo cấu hình
- **Cache**: Redis (lưu trữ dữ liệu cache để tối ưu hiệu suất)
- **Docker & Docker Compose** (tùy chọn cho việc deploy)

## ⚙️ Cấu hình môi trường

Tạo file `.env` ở thư mục gốc của project (có thể tham khảo file `.env.example`) với các cấu hình sau:

```env
# Cổng chạy gRPC server
GRPC_PORT=4001

# Cấu hình kết nối Database
DB_PATH=user:password@tcp(host:port) # Hoặc chuỗi kết nối DB tương ứng
DB_NAME=voucher

# Cấu hình kết nối Redis
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
```

## 📦 Hướng dẫn chạy và phát triển (Development)

Dự án sử dụng `Makefile` để quản lý các lệnh chạy và build.

### 1. Khởi tạo Database (Tạo bảng tự động)

Trước khi chạy ứng dụng lần đầu tiên, bạn có thể cần khởi tạo cấu trúc trong Database:

```bash
make cdb
# hoặc chạy lệnh trực tiếp: go build && ./voucher createDb
```

### 2. Khởi chạy Service

Chạy service ở chế độ bình thường:

```bash
make start
# hoặc chạy lệnh trực tiếp: go build && ./voucher start
```

### 3. Build file thực thi (Binary)

Build ứng dụng thành file thực thi cho môi trường Linux (sử dụng cho Docker/Production):

```bash
make build
# Lệnh thực thi: CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o voucher .
```

## 🐳 Khởi chạy với Docker

Dự án đã có sẵn `Dockerfile` (sử dụng base image `alpine:3.14`) tối ưu dung lượng cho môi trường production.

1. **Build image**:

```bash
make build # Build file binary (voucher) trước
docker build -t huyshop/voucher:latest .
```

2. **Chạy container**:

```bash
docker run -d \
  -p 4001:4001 \
  --name voucher_service \
  --env-file .env \
  huyshop/voucher:latest
```
