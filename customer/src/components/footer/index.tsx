"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="font-bold text-2xl">
                HuyShop
                <sup className="text-xs">VN</sup>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Cửa hàng thương mại điện tử hàng đầu Việt Nam, cung cấp các sản
              phẩm chất lượng cao với giá cả hợp lý.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">0123 456 789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">contact@huyshop.com</span>
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-2">
              <li>
                {/* <Link
                  href="/help"
                  className="text-sm hover:text-white transition-colors"
                > */}
                Trung tâm trợ giúp
                {/* </Link> */}
              </li>
              <li>
                {/* <Link
                  href="/shipping"
                  className="text-sm hover:text-white transition-colors"
                > */}
                Chính sách giao hàng
                {/* </Link> */}
              </li>
              <li>
                {/* <Link
                    href="/returns"
                    className="text-sm hover:text-white transition-colors"
                  > */}
                Chính sách đổi trả
                {/* </Link> */}
              </li>
              <li>
                {/* <Link
                  href="/warranty"
                  className="text-sm hover:text-white transition-colors"
                > */}
                Chính sách bảo hành
                {/* </Link> */}
              </li>
              <li>
                {/* <Link
                  href="/privacy"
                  className="text-sm hover:text-white transition-colors"
                > */}
                Chính sách bảo mật
                {/* </Link> */}
              </li>
              <li>
                {/* <Link
                  href="/terms"
                  className="text-sm hover:text-white transition-colors"
                > */}
                Điều khoản sử dụng
                {/* </Link> */}
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Danh mục sản phẩm
            </h4>
            <ul className="space-y-2">
              <li>
                {/* <Link
                  href="/electronics"
                  className="text-sm hover:text-white transition-colors"
                > */}
                Điện tử
                {/* </Link> */}
              </li>
              <li>
                {/* <Link
                  href="/fashion"
                  className="text-sm hover:text-white transition-colors"
                > */}
                Thời trang
                {/* </Link> */}
              </li>
              <li>
                {/* <Link
                  href="/home-garden"
                  className="text-sm hover:text-white transition-colors"
                > */}
                Nhà cửa & Sân vườn
                {/* </Link> */}
              </li>
              <li>
                {/* <Link
                  href="/sports"
                  className="text-sm hover:text-white transition-colors"
                > */}
                Thể thao
                {/* </Link> */}
              </li>
              <li>
                {/* <Link
                  href="/books"
                  className="text-sm hover:text-white transition-colors"
                > */}
                Sách & Văn phòng phẩm
                {/* </Link> */}
              </li>
              <li>
                {/* <Link
                  href="/beauty"
                  className="text-sm hover:text-white transition-colors"
                > */}
                Làm đẹp & Sức khỏe
                {/* </Link> */}
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Kết nối với chúng tôi
            </h4>
            <p className="text-sm">
              Đăng ký nhận tin tức và ưu đãi mới nhất từ HuyShop
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email của bạn"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">Đăng ký</Button>
            </div>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Features Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-full">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm">
                Giao hàng nhanh, đúng hẹn
              </h5>
              <p className="text-xs text-gray-400">
                Kiểm tra hàng trước khi thanh toán
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-full">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm">
                Thanh toán an toàn
              </h5>
              <p className="text-xs text-gray-400">Bảo mật 100%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-full">
              <RotateCcw className="h-5 w-5 text-white" />
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm">
                Đổi trả dễ dàng
              </h5>
              <p className="text-xs text-gray-400">Trong vòng 30 ngày</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-full">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm">Hỗ trợ 24/7</h5>
              <p className="text-xs text-gray-400">Luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Payment Methods & Copyright */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Phương thức thanh toán:
            </span>
            <div className="flex items-center gap-2">
              <div className="bg-white p-1 rounded">
                <CreditCard className="h-6 w-6 text-gray-800" />
              </div>
              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                VISA
              </div>
              <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                MC
              </div>
              <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                MOMO
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} HuyShop. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </div>
    </footer>
  );
}
