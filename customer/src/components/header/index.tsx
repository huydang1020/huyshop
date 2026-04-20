"use client";

import {
  ChevronDown,
  ChevronUp,
  Gift,
  Heart,
  Menu,
  Package,
  Phone,
  Search,
  ShoppingCart,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

import defaultAvatar from "@/assets/images/avatar.png";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isEmpty } from "lodash";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOutAction } from "@/actions/auth.action";
import { toast } from "sonner";
import { formatNumber } from "@/utils/helper";

interface IHeaderProps {
  userInfo: IUser;
}

export const Header = (props: IHeaderProps) => {
  const { userInfo } = props;
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 select-none">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HuyShop
            <sup className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VN
            </sup>
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm"
              className="w-full py-2 pl-4 pr-24 border border-blue-500 rounded-lg outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(`/san-pham?search=${search}`);
                }
              }}
            />
            <button
              className="absolute right-0 top-0 h-full px-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-r-lg flex items-center justify-center"
              onClick={() => router.push(`/san-pham?search=${search}`)}
            >
              <Search className="text-white h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center space-x-6">
          <Link
            href="/san-pham"
            className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Sản phẩm
          </Link>
          <Link
            href="/uu-dai"
            className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <Gift className="w-4 h-4" />
            Ưu đãi
          </Link>
          <Link
            href="/dang-ky-ban-hang"
            className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Đăng ký bán hàng
          </Link>
          <Link
            href="/lien-he"
            className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Liên hệ
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center select-none">
          {!isEmpty(userInfo) ? (
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <span className={`cursor-pointer flex items-center gap-1 mr-2`}>
                  <Image
                    src={userInfo.avatar || defaultAvatar}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover"
                    width={28}
                    height={28}
                    unoptimized
                  />
                  <span
                    className="relative inline-flex items-center justify-center"
                    style={{ width: 12, height: 12 }}
                  >
                    <ChevronDown
                      className={`absolute top-0 left-0 w-3 h-3 transition-all duration-200 ${
                        open ? "opacity-0 scale-90" : "opacity-100 scale-100"
                      }`}
                    />
                    <ChevronUp
                      className={`absolute top-0 left-0 w-3 h-3 transition-all duration-200 ${
                        open ? "opacity-100 scale-100" : "opacity-0 scale-90"
                      }`}
                    />
                  </span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>
                  <p className="text-sm flex items-center gap-2">
                    <span>{userInfo.full_name}</span>
                  </p>
                  <p className="text-xs text-yellow-500 font-bold flex items-center gap-1 mt-2">
                    <span>
                      {formatNumber(userInfo.total_earned_points || 0)}
                    </span>{" "}
                    điểm
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      router.push("/thong-tin-tai-khoan");
                    }}
                  >
                    Thông tin tài khoản
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      router.push("/lich-su-mua-hang");
                    }}
                  >
                    Lịch sử mua hàng
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={async () => {
                    const resp = await signOutAction();
                    if (resp && resp.code !== 0) {
                      toast.error(resp.message);
                      return;
                    }
                    toast.success("Đăng xuất thành công");
                    router.push("/");
                  }}
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <span className={`cursor-pointer flex items-center gap-1`}>
                  <User className="w-6 h-6" />
                  <span
                    className="relative inline-flex items-center justify-center"
                    style={{ width: 12, height: 12 }}
                  >
                    <ChevronDown
                      className={`absolute top-0 left-0 w-3 h-3 transition-all duration-200 ${
                        open ? "opacity-0 scale-90" : "opacity-100 scale-100"
                      }`}
                    />
                    <ChevronUp
                      className={`absolute top-0 left-0 w-3 h-3 transition-all duration-200 ${
                        open ? "opacity-100 scale-100" : "opacity-0 scale-90"
                      }`}
                    />
                  </span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      router.push("/dang-nhap");
                    }}
                  >
                    Đăng nhập
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      router.push("/dang-ky");
                    }}
                  >
                    Đăng ký
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <div className="flex flex-[1] items-center ml-4 mr-4 space-x-8 justify-center">
            <div className="relative">
              <Link href={"/san-pham-yeu-thich"}>
                <Heart className="w-6 h-6 sm:w-5 sm:h-5 text-red-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {userInfo?.favorite_quantity || 0}
                </span>
              </Link>
            </div>
            <div className="relative">
              <Link href={"/gio-hang"}>
                <ShoppingCart className="w-6 h-6 sm:w-5 sm:h-5 text-blue-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full w-4 h-4 flex items-center justify-center">
                  {userInfo?.cart_quantity || 0}
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Menu className="w-6 h-6 ml-2 lg:hidden" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Điều hướng và tìm kiếm</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm"
                    className="w-full py-2 pl-4 pr-24 border border-blue-500 rounded-lg outline-none"
                  />
                  <button className="absolute right-0 top-0 h-full px-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-r-lg flex items-center justify-center">
                    <Search className="text-white h-4 w-4" />
                  </button>
                </div>
                <nav className="space-y-2">
                  <Link
                    href="/san-pham"
                    className="block py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Sản phẩm
                  </Link>
                  <Link
                    href="/uu-dai"
                    className="block py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Ưu đãi
                  </Link>
                  <Link
                    href="/dang-ky-ban-hang"
                    className="block py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Đăng ký bán hàng
                  </Link>
                  <Link
                    href="/lien-he"
                    className="block py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Liên hệ
                  </Link>
                </nav>

                <button
                  type="submit"
                  className="w-full flex justify-center py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-br from-blue-600 to-purple-600 focus:outline-none"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/dang-nhap");
                  }}
                >
                  Đăng nhập
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
