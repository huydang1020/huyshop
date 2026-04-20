# Huyshop Admin

Đây là mã nguồn Frontend của trang quản trị (Admin Dashboard) thuộc dự án Huyshop. Hệ thống này cung cấp giao diện dành riêng cho quản trị viên để quản lý, theo dõi và thao tác với dữ liệu, kết nối trực tiếp với Backend API.

## 🛠 Công Nghệ Sử Dụng

Dự án được xây dựng dựa trên các công nghệ hiện đại và mạnh mẽ nhất:

- **Core**: [React 18](https://react.dev/) kết hợp với [TypeScript](https://www.typescriptlang.org/) để đảm bảo code an toàn và dễ bảo trì.
- **Trình đóng gói (Bundler)**: [Vite](https://vitejs.dev/) giúp quá trình dev và build diễn ra cực kỳ nhanh chóng.
- **UI Framework**: [Ant Design (antd)](https://ant.design/) cho các component giao diện (bảng, form, nút, v.v.) chuẩn admin.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) cho tiện ích viết CSS tùy chỉnh nhanh chóng.
- **Quản lý State**: [Zustand](https://zustand-demo.pmnd.rs/) quản lý state toàn cục nhẹ nhàng, dễ sử dụng.
- **Fetch dữ liệu**: `ky` kết hợp với `@tanstack/react-query` giúp tối ưu hóa việc gọi API và cache dữ liệu từ Backend.
- **Routing**: `react-router` để quản lý các đường dẫn điều hướng trong ứng dụng.

## 📁 Cấu Trúc Dự Án

- `src/`: Thư mục chính chứa toàn bộ mã nguồn React của ứng dụng (components, pages, utils, hooks...).
- `public/`: Chứa các tài nguyên tĩnh không cần qua bước xử lý của Vite.
- `build/`: Thư mục được tự động sinh ra sau khi chạy lệnh build, chứa mã nguồn đã tối ưu dùng cho production.
- `vite.config.ts`: Chứa các cấu hình Vite, đặc biệt là cấu hình `proxy` chuyển hướng tự động các request `/api/*` sang backend nội bộ (`http://localhost:8080`) trong quá trình dev.

## 🚀 Hướng Dẫn Cài Đặt và Chạy Trực Tiếp

Đảm bảo bạn đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18 trở lên) và `yarn`.

1. **Cài đặt thư viện (dependencies)**:
   ```bash
   yarn install
   ```

2. **Chạy server development**:
   ```bash
   yarn dev
   ```
   Ứng dụng sẽ khởi động tại: [http://localhost:3333](http://localhost:3333). 
   Mọi API gọi đến `/api` sẽ được tự động proxy sang backend tại port `8080`.

3. **Build cho môi trường Production**:
   ```bash
   yarn build
   ```
   Sau khi hoàn tất, thư mục `build/` sẽ được tạo ra, chứa toàn bộ tĩnh (HTML, CSS, JS) đã được nén gọn để deploy.

## 🐳 Hướng Dẫn Chạy Bằng Docker

Dự án đã được tích hợp sẵn `Dockerfile` với cấu trúc **Multi-stage build** nhằm tối ưu kích thước image. 
- **Stage 1 (Builder)**: Sử dụng Node.js để cài dependencies và build code thành file tĩnh.
- **Stage 2 (Production)**: Sử dụng Nginx để phục vụ file tĩnh một cách nhẹ nhàng nhất.

1. **Build Docker Image**:
   Tại thư mục gốc của code admin, chạy lệnh:
   ```bash
   docker build -t huyshop-admin .
   ```

2. **Chạy Docker Container**:
   Chạy lệnh dưới đây để ánh xạ cổng 3333 trên máy của bạn vào cổng 80 trong container Nginx:
   ```bash
   docker run -d -p 3333:80 --name huyshop-admin-container huyshop-admin
   ```
   Sau đó, bạn có thể truy cập `http://localhost:3333/huyshop` để vào trang Admin.

> **Lưu ý quan trọng**: Do file cấu hình `vite.config.ts` thiết lập tham số `base: "/huyshop/"` ở chế độ production, Nginx bên trong Docker đã được tự động cấu hình để phục vụ ứng dụng tại đường dẫn `/huyshop`. Việc truy cập root `/` sẽ được tự động chuyển hướng sang `/huyshop`.
