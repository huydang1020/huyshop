# Customer Frontend — HuyShop

Giao diện khách hàng của hệ thống **HuyShop**, được xây dựng bằng **Next.js 14** với App Router, TypeScript và Tailwind CSS.

---

## 🧰 Tech Stack

| Công nghệ | Phiên bản |
|---|---|
| Next.js | 14.2.28 |
| React | 18 |
| TypeScript | 5 |
| Tailwind CSS | 3.4 |
| Radix UI | Latest |
| Ant Design | 5 |
| React Hook Form + Zod | Latest |

---

## ⚙️ Cấu hình môi trường

Tạo file `.env` tại root của project:

```env
# URL nội bộ (Server-Side Rendering)
NEXT_API_URL=http://localhost:8080

# URL công khai (Client-Side / Browser)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> **Lưu ý:** `NEXT_PUBLIC_*` sẽ được nhúng vào JavaScript bundle phía client. Đảm bảo giá trị này trỏ tới API có thể truy cập từ trình duyệt của người dùng.

---

## 🚀 Chạy local (Development)

```bash
# Cài đặt dependencies
yarn install

# Khởi động dev server trên port 12121
yarn dev
```

Truy cập tại: [http://localhost:12121](http://localhost:12121)

---

## 🐳 Docker

### Build image

```bash
docker build \
  --build-arg NEXT_API_URL=http://api-service:8080 \
  --build-arg NEXT_PUBLIC_API_URL=http://your-domain.com/api \
  -t huyshop/customer:latest .
```

### Chạy container

```bash
docker run -d \
  --name huyshop-customer \
  -p 3000:3000 \
  -e NEXT_API_URL=http://api-service:8080 \
  -e NEXT_PUBLIC_API_URL=http://your-domain.com/api \
  huyshop/customer:latest
```

Truy cập tại: [http://localhost:3000](http://localhost:3000)

### Với Docker Compose

```yaml
services:
  customer:
    build:
      context: .
      args:
        NEXT_API_URL: http://api:8080
        NEXT_PUBLIC_API_URL: http://your-domain.com/api
    image: huyshop/customer:latest
    container_name: huyshop-customer
    ports:
      - "3000:3000"
    environment:
      NEXT_API_URL: http://api:8080
      NEXT_PUBLIC_API_URL: http://your-domain.com/api
    restart: unless-stopped
```

---

## 📁 Cấu trúc thư mục

```
customer/
├── src/
│   ├── app/            # Next.js App Router (pages, layouts)
│   ├── components/     # React components dùng chung
│   ├── lib/            # Utilities, helpers
│   └── ...
├── public/             # Static assets
├── Dockerfile
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## 📦 Scripts

| Lệnh | Mô tả |
|---|---|
| `yarn dev` | Chạy dev server (port 12121) |
| `yarn build` | Build production bundle |
| `yarn start` | Chạy production server |
| `yarn lint` | Kiểm tra ESLint |
| `yarn type-check` | Kiểm tra TypeScript |

