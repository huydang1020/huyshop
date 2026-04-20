"use client";

import Autoplay from "embla-carousel-autoplay";
import {
  Headphones,
  RotateCcw,
  Shield,
  Star,
  ThumbsUp,
  TrendingUp,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductGrid from "../product-grid";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

interface HomeComponentProps {
  banners: IBanner[];
  categories: ICategory[];
  products_best_seller: IProductType[];
  products_most_view: IProductType[];
  products_highest_rating: IProductType[];
  listFavoriteProduct: IProductType[];
}

export default function HomeComponent(props: HomeComponentProps) {
  const {
    banners,
    categories,
    products_best_seller,
    products_most_view,
    products_highest_rating,
    listFavoriteProduct,
  } = props;

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 hidden md:block">
        <div className="h-full bg-white">
          <Card className="sticky top-20">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="p-2 pl-0 max-h-[85vh] overflow-y-auto hide-scrollbar">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/san-pham?category=${category.slug}`}
                    className="flex items-center p-2 space-x-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Image
                      src={category.logo}
                      alt={category.name}
                      className="w-8 h-8 object-contain"
                      width={32}
                      height={32}
                      unoptimized
                    />
                    <span className="text-sm">{category.name}</span>
                  </Link>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="pl-0 md:pl-[32px]">
          <Card>
            <CardContent className="p-4">
              <Carousel
                className="w-full"
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[Autoplay({ delay: 2000 })]}
              >
                <CarouselContent>
                  {banners
                    .filter((banner) => banner.type === "slide")
                    .sort((a, b) => a.order - b.order)
                    .map((banner) => (
                      <CarouselItem
                        key={banner.id}
                        className="md:basis-1/2 lg:basis-1/2"
                      >
                        <div className="group cursor-pointer">
                          <div className="w-full h-[300px] overflow-hidden rounded-lg relative">
                            <Image
                              src={banner.image}
                              alt={banner.image}
                              className="object-cover rounded-lg"
                              fill
                              unoptimized
                              sizes="(max-width: 768px) 100vw, 50vw"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardContent className="p-0">
              <section className="py-4 bg-white">
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {banners
                      .filter((banner) => banner.type === "card")
                      .sort((a, b) => a.order - b.order)
                      .map((banner) => (
                        <div key={banner.id} className="group cursor-pointer">
                          <div className="relative overflow-hidden rounded-xl h-32">
                            <Image
                              src={banner.image}
                              alt={banner.image}
                              fill
                              unoptimized
                              className="object-cover rounded-xl"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardContent className="p-0">
              <section className="py-4 bg-white">
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      {
                        icon: <Truck size={32} />,
                        title: "Giao hàng nhanh, đúng hẹn",
                        desc: "Kiểm tra hàng trước khi thanh toán",
                      },
                      {
                        icon: <Shield size={32} />,
                        title: "Thanh toán an toàn",
                        desc: "Bảo mật 100%",
                      },
                      {
                        icon: <Headphones size={32} />,
                        title: "Hỗ trợ 24/7",
                        desc: "Tư vấn nhiệt tình",
                      },
                      {
                        icon: <RotateCcw size={32} />,
                        title: "Đổi trả dễ dàng",
                        desc: "Không cần lý do",
                      },
                    ].map((feature, index) => (
                      <div key={index} className="text-center p-6 rounded-lg">
                        <div className="text-blue-600 mb-4 flex justify-center">
                          {feature.icon}
                        </div>
                        <h3 className="font-semibold text-lg mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-red-600 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sản phẩm bán chạy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductGrid
                productTypes={products_best_seller}
                listFavoriteProduct={listFavoriteProduct}
              />
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-red-600 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Đánh giá cao nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductGrid
                productTypes={products_highest_rating}
                listFavoriteProduct={listFavoriteProduct}
              />
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-red-600 flex items-center gap-2">
                <ThumbsUp className="w-5 h-5" />
                Lượt xem nhiều nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductGrid
                productTypes={products_most_view}
                listFavoriteProduct={listFavoriteProduct}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
