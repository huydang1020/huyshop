"use client";

import { MapPin, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import ProductGrid from "../product-grid";

interface IStoreDetailProps {
  data: IStoreInfoResponse;
  listFavoriteProduct: IProductType[];
}

const StoreInfoDescription = dynamic(() => import("./store-info-description"), {
  ssr: false,
});

export default function StoreDetail({
  data,
  listFavoriteProduct,
}: IStoreDetailProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header thông tin cửa hàng */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Logo cửa hàng */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 mx-auto lg:mx-0">
                <Image
                  src={data?.store?.logo}
                  alt={`Logo ${data?.store?.name}`}
                  width={120}
                  height={120}
                  unoptimized
                  className="w-full h-full object-cover rounded-full border-4 border-gray-100"
                />
              </div>
            </div>

            {/* Thông tin cửa hàng */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {data?.store?.name}
              </h1>

              <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                <span className="text-gray-500">
                  {data?.product_types?.total} sản phẩm
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{data?.store?.full_address}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{data?.store?.phone_number}</span>
                </div>
              </div>

              <StoreInfoDescription html={data?.store?.description} />
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sản Phẩm Của Cửa Hàng
          </h2>
          <p className="text-gray-600">
            Khám phá {data?.product_types?.total} sản phẩm chất lượng từ{" "}
            {data?.store?.name}
          </p>
        </div>

        <ProductGrid
          productTypes={data?.product_types?.product_types}
          listFavoriteProduct={listFavoriteProduct}
        />
      </div>
    </div>
  );
}
