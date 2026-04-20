# Bước 1: Build ứng dụng (Builder Stage)
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy các file quản lý package vào container
COPY package.json yarn.lock ./

# Cài đặt dependencies (dùng frozen-lockfile để đảm bảo tính nhất quán)
RUN yarn install --frozen-lockfile

# Copy toàn bộ mã nguồn của dự án vào container
COPY . .

# Tiến hành build ứng dụng. 
# Kết quả build sẽ được lưu trong thư mục "build" (theo cấu hình trong vite.config.ts)
RUN yarn build

# Bước 2: Phục vụ ứng dụng bằng Nginx (Production Stage)
FROM nginx:alpine

# Xóa nội dung mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy code đã build từ builder stage sang thư mục phục vụ của Nginx.
# Lưu ý: Vì vite.config.ts có base: "/huyshop/" khi build production,
# thư mục "build" sẽ được đưa vào "/usr/share/nginx/html/huyshop"
# để Nginx trỏ đúng đường dẫn tĩnh.
COPY --from=builder /app/build /usr/share/nginx/html/huyshop

# Tạo file cấu hình Nginx cơ bản để hỗ trợ React Router và serve đúng thư mục
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location /huyshop { \
        alias /usr/share/nginx/html/huyshop; \
        try_files $uri $uri/ /huyshop/index.html; \
    } \
    location / { \
        rewrite ^/$ /huyshop/ redirect; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Mở cổng 80
EXPOSE 80

# Khởi động Nginx
CMD ["nginx", "-g", "daemon off;"]
