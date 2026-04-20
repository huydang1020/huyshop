"use client";

import { Filter } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { getListProductTypeAction } from "@/actions/product.action";
import ProductGrid from "../product-grid";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { isEmpty } from "lodash";
import Image from "next/image";

const sortOptions = [
  { value: "default", label: "Mặc định" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "rating", label: "Đánh giá cao nhất" },
  { value: "sold", label: "Bán chạy nhất" },
];

const priceRangeOptions = [
  { id: "all", label: "Tất cả", min: 0, max: 50000000 },
  { id: "0-500", label: "Từ 0 - 500 nghìn", min: 0, max: 500000 },
  { id: "500-1", label: "Từ 500 nghìn - 1 triệu", min: 500000, max: 1000000 },
  { id: "1-2", label: "Từ 1 triệu - 2 triệu", min: 1000000, max: 2000000 },
  { id: "2-5", label: "Từ 2 triệu - 5 triệu", min: 2000000, max: 5000000 },
  { id: "5-10", label: "Từ 5 triệu - 10 triệu", min: 5000000, max: 10000000 },
  {
    id: "10-20",
    label: "Từ 10 triệu - 20 triệu",
    min: 10000000,
    max: 20000000,
  },
  {
    id: "20-50",
    label: "Từ 20 triệu - 50 triệu",
    min: 20000000,
    max: 50000000,
  },
];

interface IProductListingProps {
  data: IDataProductType;
  listCategory: ICategoryResponse;
  listFavoriteProduct: IProductType[];
  initialCategorySlug?: string;
  initialSearchKeyword?: string;
}

export default function ProductListing(props: IProductListingProps) {
  const {
    data,
    listCategory,
    listFavoriteProduct,
    initialCategorySlug,
    initialSearchKeyword,
  } = props;

  const router = useRouter();

  // Tìm category từ initialCategorySlug
  const initialCategory = initialCategorySlug
    ? listCategory?.categories?.find((cat) => cat.slug === initialCategorySlug)
    : null;

  const [dataProductType, setDataProductType] = useState<IDataProductType>({
    product_types: data?.product_types || [],
    total: data?.total || 0,
  });
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory ? initialCategory.id : "Tất cả"
  );
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | undefined
  >(initialCategorySlug);
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>(
    initialSearchKeyword
  );

  // Ref để track category và search hiện tại và tránh stale closure
  const currentCategorySlugRef = useRef<string | undefined>(
    initialCategorySlug
  );
  const currentSearchKeywordRef = useRef<string | undefined>(
    initialSearchKeyword
  );
  const prevInitialSearchKeywordRef = useRef<string | undefined>(
    initialSearchKeyword
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    return (data?.product_types?.length || 0) < (data?.total || 0);
  });
  const [hasCleanedUrl, setHasCleanedUrl] = useState(false);

  const itemsPerPage = 15;

  // Helper function để lấy giá trị price range từ selectedPriceRange
  const getCurrentPriceRange = () => {
    const selectedRange = priceRangeOptions.find(
      (option) => option.id === selectedPriceRange
    );
    return selectedRange || priceRangeOptions[0]; // fallback to "all" if not found
  };

  // Helper function để clean URL parameter nhưng preserve search hiện tại
  const cleanUrlParam = () => {
    if ((initialCategorySlug || initialSearchKeyword) && !hasCleanedUrl) {
      // Preserve search keyword hiện tại nếu có
      const currentSearch = searchKeyword || currentSearchKeywordRef.current;
      const newUrl = currentSearch
        ? `/san-pham?search=${encodeURIComponent(currentSearch)}`
        : "/san-pham";
      router.replace(newUrl, { scroll: false });
      setHasCleanedUrl(true);
    }
  };

  const fetchListProductType = useCallback(
    async (
      page: number,
      sort: string,
      categorySlug?: string,
      isLoadMore = false,
      minPrice?: number,
      maxPrice?: number,
      searchKeyword?: string
    ) => {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      // Chỉ gửi price parameters khi không phải default range (0-50M)
      const isDefaultPriceRange = minPrice === 0 && maxPrice === 50000000;

      const resp = await getListProductTypeAction({
        limit: itemsPerPage,
        skip: page - 1,
        order_by: sort === "default" ? undefined : sort,
        category: categorySlug,
        name: searchKeyword,
        ...(!isDefaultPriceRange &&
          minPrice !== undefined &&
          maxPrice !== undefined && {
            price_from: minPrice,
            price_to: maxPrice,
          }),
      });

      if (resp.code === 0 && resp.data) {
        const newData = {
          product_types: resp.data.product_types || [],
          total: resp.data.total || 0,
        };

        setDataProductType((prevData) => {
          if (isLoadMore) {
            // Append new products to existing ones
            const updatedProducts = [
              ...(prevData.product_types || []),
              ...newData.product_types,
            ];
            const finalData = {
              ...newData,
              product_types: updatedProducts,
            };
            // Check if there are more items to load for append case
            setHasMore(updatedProducts.length < newData.total);
            return finalData;
          } else {
            // Replace products (for sort/filter changes)
            setHasMore(newData.product_types.length < newData.total);
            return newData;
          }
        });
      } else {
        // Handle error case - set empty data
        if (!isLoadMore) {
          setDataProductType({
            product_types: [],
            total: 0,
          });
          setHasMore(false);
        }
      }

      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    },
    [itemsPerPage] // Remove problematic dependency
  );

  // Update ref khi selectedCategorySlug hoặc searchKeyword thay đổi
  useEffect(() => {
    currentCategorySlugRef.current = selectedCategorySlug;
  }, [selectedCategorySlug]);

  useEffect(() => {
    currentSearchKeywordRef.current = searchKeyword;
  }, [searchKeyword]);

  // Đảm bảo selectedCategorySlug và searchKeyword được sync với initial values chỉ khi mount
  useEffect(() => {
    if (
      initialCategorySlug &&
      initialCategory &&
      selectedCategorySlug !== initialCategorySlug
    ) {
      setSelectedCategorySlug(initialCategorySlug);
      setSelectedCategory(initialCategory.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategorySlug, initialCategory]);

  useEffect(() => {
    if (initialSearchKeyword && searchKeyword !== initialSearchKeyword) {
      setSearchKeyword(initialSearchKeyword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchKeyword]);

  // Fetch lại data khi initialSearchKeyword thay đổi từ bên ngoài (navigation)
  useEffect(() => {
    const hasSearchKeywordChanged =
      initialSearchKeyword !== prevInitialSearchKeywordRef.current;

    // Update ref để track current value
    prevInitialSearchKeywordRef.current = initialSearchKeyword;

    if (hasSearchKeywordChanged) {
      // Reset page và loading state
      setCurrentPage(1);
      setDataProductType({
        product_types: [],
        total: 0,
      });
      setHasMore(false);
      setIsLoading(true);

      if (initialSearchKeyword && initialSearchKeyword.trim() !== "") {
        // Có search keyword - CHỈ reset filters nếu đây là search keyword hoàn toàn mới
        // Không reset nếu search keyword giống với keyword hiện tại (tránh reset khi user filter)
        const currentSearchKeyword =
          searchKeyword || currentSearchKeywordRef.current;
        const isNewSearch = initialSearchKeyword !== currentSearchKeyword;

        if (isNewSearch) {
          setSelectedCategory("Tất cả");
          setSelectedCategorySlug(undefined);
          currentCategorySlugRef.current = undefined;
          setSortBy("default");
          setSelectedPriceRange("all");
        }

        // Update search keyword state
        setSearchKeyword(initialSearchKeyword);
        currentSearchKeywordRef.current = initialSearchKeyword;

        // Fetch với search keyword - preserve filters nếu không phải new search
        const currentRange =
          priceRangeOptions.find(
            (option) => option.id === selectedPriceRange
          ) || priceRangeOptions[0];
        const isDefaultPriceRange = selectedPriceRange === "all";

        fetchListProductType(
          1,
          isNewSearch ? "default" : sortBy,
          isNewSearch
            ? undefined
            : selectedCategorySlug || currentCategorySlugRef.current,
          false,
          isNewSearch || isDefaultPriceRange ? undefined : currentRange.min,
          isNewSearch || isDefaultPriceRange ? undefined : currentRange.max,
          initialSearchKeyword
        );
      } else {
        // Search keyword rỗng - clear search và reset về trạng thái mặc định
        setSearchKeyword(undefined);
        currentSearchKeywordRef.current = undefined;

        // Reset UI state về default
        setSelectedCategory("Tất cả");
        setSelectedCategorySlug(undefined);
        currentCategorySlugRef.current = undefined;
        setSortBy("default");
        setSelectedPriceRange("all");

        // Clean URL để remove search parameter
        router.replace("/san-pham", { scroll: false });

        // Fetch all products với default settings
        fetchListProductType(
          1,
          "default",
          undefined,
          false,
          undefined,
          undefined,
          undefined
        );
      }
    }
  }, [
    initialSearchKeyword,
    fetchListProductType,
    router,
    searchKeyword,
    selectedCategorySlug,
    sortBy,
    selectedPriceRange,
  ]);

  // Fetch data với category hoặc search được chọn chỉ khi mount lần đầu (không có search keyword)
  useEffect(() => {
    // KHÔNG fetch nếu có search keyword (để useEffect search keyword handle)
    if (initialSearchKeyword) {
      return;
    }

    // KHÔNG fetch nếu user đã chọn category từ sidebar
    if (selectedCategorySlug && selectedCategorySlug !== initialCategorySlug) {
      return;
    }

    // Chỉ truyền price khi không phải default range
    const currentRange = getCurrentPriceRange();
    const isDefaultPriceRange = selectedPriceRange === "all";

    if (initialCategorySlug && initialCategory) {
      fetchListProductType(
        1,
        sortBy,
        initialCategorySlug,
        false,
        isDefaultPriceRange ? undefined : currentRange.min,
        isDefaultPriceRange ? undefined : currentRange.max,
        undefined // No search keyword
      );
    } else if (!initialCategorySlug && !selectedCategorySlug) {
      // Fetch all products khi KHÔNG có category và search nào được chọn
      fetchListProductType(
        1,
        sortBy,
        undefined,
        false,
        isDefaultPriceRange ? undefined : currentRange.min,
        isDefaultPriceRange ? undefined : currentRange.max,
        undefined // No search keyword
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategorySlug, initialCategory, fetchListProductType]);

  const handleLoadMore = () => {
    cleanUrlParam(); // Clean URL khi user tương tác
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    // Chỉ truyền price khi không phải default range
    const currentRange = getCurrentPriceRange();
    const isDefaultPriceRange = selectedPriceRange === "all";

    // Sử dụng ref để lấy giá trị fresh nhất
    const categoryToUse = currentCategorySlugRef.current || initialCategorySlug;
    const searchToUse = currentSearchKeywordRef.current || initialSearchKeyword;

    fetchListProductType(
      nextPage,
      sortBy,
      categoryToUse,
      true,
      isDefaultPriceRange ? undefined : currentRange.min,
      isDefaultPriceRange ? undefined : currentRange.max,
      searchToUse
    );
  };

  const handleSortChange = (newSortBy: string) => {
    cleanUrlParam(); // Clean URL khi user tương tác
    setSortBy(newSortBy);
    setCurrentPage(1);
    // Reset data trước khi fetch để đảm bảo refresh
    setDataProductType({
      product_types: [],
      total: 0,
    });
    setHasMore(false);
    setIsLoading(true);

    // Chỉ truyền price khi không phải default range
    const currentRange = getCurrentPriceRange();
    const isDefaultPriceRange = selectedPriceRange === "all";

    // Sử dụng selectedCategorySlug hoặc ref để lấy giá trị fresh nhất
    const categoryToUse =
      selectedCategorySlug ||
      currentCategorySlugRef.current ||
      initialCategorySlug;
    const searchToUse =
      searchKeyword || currentSearchKeywordRef.current || initialSearchKeyword;

    fetchListProductType(
      1,
      newSortBy,
      categoryToUse,
      false,
      isDefaultPriceRange ? undefined : currentRange.min,
      isDefaultPriceRange ? undefined : currentRange.max,
      searchToUse
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (categoryId: string, categorySlug?: string) => {
    cleanUrlParam(); // Clean URL khi user tương tác
    setSelectedCategory(categoryId);
    setSelectedCategorySlug(categorySlug);

    // Update ref ngay lập tức để tránh stale closure
    currentCategorySlugRef.current = categorySlug;

    setCurrentPage(1);
    // Reset data trước khi fetch để đảm bảo refresh
    setDataProductType({
      product_types: [],
      total: 0,
    });
    setHasMore(false);
    setIsLoading(true);

    // Chỉ truyền price khi không phải default range
    const currentRange = getCurrentPriceRange();
    const isDefaultPriceRange = selectedPriceRange === "all";
    const searchToUse =
      searchKeyword || currentSearchKeywordRef.current || initialSearchKeyword;

    fetchListProductType(
      1,
      sortBy,
      categorySlug,
      false,
      isDefaultPriceRange ? undefined : currentRange.min,
      isDefaultPriceRange ? undefined : currentRange.max,
      searchToUse
    );
    // Không scroll về đầu trang để giữ vị trí hiện tại trong danh sách category
  };

  const handleClearCategory = async () => {
    cleanUrlParam();
    setSelectedCategory("Tất cả");
    setSelectedCategorySlug(undefined);

    // Update ref ngay lập tức
    currentCategorySlugRef.current = undefined;

    setCurrentPage(1);

    setDataProductType({
      product_types: [],
      total: 0,
    });
    setHasMore(false);
    setIsLoading(true);

    try {
      // Chỉ gửi price parameters khi không phải default range (0-50M)
      const currentRange = getCurrentPriceRange();
      const isDefaultPriceRange = selectedPriceRange === "all";

      const searchToUse =
        searchKeyword ||
        currentSearchKeywordRef.current ||
        initialSearchKeyword;

      const resp = await getListProductTypeAction({
        limit: itemsPerPage,
        skip: 0,
        order_by: sortBy === "default" ? undefined : sortBy,
        category: undefined,
        name: searchToUse,
        ...(!isDefaultPriceRange && {
          price_from: currentRange.min,
          price_to: currentRange.max,
        }),
      });

      if (resp.code === 0 && resp.data) {
        const newData = {
          product_types: resp.data.product_types || [],
          total: resp.data.total || 0,
        };
        setDataProductType(newData);
        setHasMore(newData.product_types.length < newData.total);
      } else {
        setDataProductType({
          product_types: [],
          total: 0,
        });
        setHasMore(false);
      }
    } catch {
      setDataProductType({
        product_types: [],
        total: 0,
      });
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceFilter = (priceRangeId: string) => {
    setSelectedPriceRange(priceRangeId);
    cleanUrlParam();
    setCurrentPage(1);

    setDataProductType({
      product_types: [],
      total: 0,
    });
    setHasMore(false);
    setIsLoading(true);

    // Tìm khoảng giá tương ứng
    const selectedRange = priceRangeOptions.find(
      (option) => option.id === priceRangeId
    );

    // Chỉ truyền price khi không phải "all"
    const isDefaultPriceRange = priceRangeId === "all";

    // Sử dụng ref để lấy giá trị fresh nhất
    const categoryToUse = currentCategorySlugRef.current || initialCategorySlug;
    const searchToUse =
      searchKeyword || currentSearchKeywordRef.current || initialSearchKeyword;

    fetchListProductType(
      1,
      sortBy,
      categoryToUse,
      false,
      isDefaultPriceRange ? undefined : selectedRange?.min,
      isDefaultPriceRange ? undefined : selectedRange?.max,
      searchToUse
    );
  };

  const handleResetPrice = () => {
    setSelectedPriceRange("all");
    cleanUrlParam();
    setCurrentPage(1);

    setDataProductType({
      product_types: [],
      total: 0,
    });
    setHasMore(false);
    setIsLoading(true);

    // Sử dụng ref để lấy category hiện tại
    const categoryToUse = currentCategorySlugRef.current || initialCategorySlug;
    const searchToUse =
      searchKeyword || currentSearchKeywordRef.current || initialSearchKeyword;

    // Reset về default range - không truyền price parameters
    fetchListProductType(
      1,
      sortBy,
      categoryToUse,
      false,
      undefined,
      undefined,
      searchToUse
    );
  };

  const FilterContent = () => {
    const selectedCategoryData = listCategory?.categories?.find(
      (cat) => cat.id === selectedCategory
    );

    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Danh mục</h3>
          {selectedCategory !== "Tất cả" && selectedCategoryData ? (
            // Hiển thị category đã chọn và nút xóa
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Image
                    src={selectedCategoryData.logo}
                    alt={selectedCategoryData.name}
                    className="w-8 h-8 object-contain"
                    width={32}
                    height={32}
                    unoptimized
                  />
                  <span className="text-sm font-medium text-blue-700">
                    {selectedCategoryData.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCategory}
                  className="h-auto p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          ) : (
            // Hiển thị danh sách đầy đủ
            <nav className="p-2 pl-0 max-h-96 overflow-y-auto hide-scrollbar">
              {/* Option "Tất cả" để bỏ filter */}
              <div
                className={`flex items-center p-2 space-x-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === "Tất cả"
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleCategoryChange("Tất cả", undefined)}
              >
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <span className="text-sm">Tất cả</span>
              </div>
              {!isEmpty(listCategory) &&
                listCategory.categories &&
                listCategory.categories.map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center p-2 space-x-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      handleCategoryChange(category.id, category.slug)
                    }
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
                  </div>
                ))}
            </nav>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="font-semibold mb-3">Khoảng giá</h3>
          {selectedPriceRange !== "all" ? (
            // Hiển thị khoảng giá đã chọn và nút xóa
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-green-700">
                  {
                    priceRangeOptions.find(
                      (option) => option.id === selectedPriceRange
                    )?.label
                  }
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetPrice}
                  className="h-auto p-1 text-green-600 hover:text-green-800 hover:bg-green-100"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          ) : (
            // Hiển thị danh sách đầy đủ
            <div className="space-y-3">
              <RadioGroup
                value={selectedPriceRange}
                onValueChange={handlePriceFilter}
                className="space-y-2"
              >
                {priceRangeOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label
                      htmlFor={option.id}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Trang chủ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Sản phẩm</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" />
              <h2 className="font-semibold">Bộ lọc</h2>
            </div>
            <FilterContent />
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter & Sort */}
          <div className="flex items-center justify-between mb-6">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] focus:ring-0">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg shadow-sm border">
                    {/* Image skeleton */}
                    <div className="bg-gray-200 h-56 w-full rounded-t-lg"></div>

                    {/* Content skeleton */}
                    <div className="p-4 space-y-3">
                      {/* Title skeleton */}
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>

                      {/* Price skeleton */}
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>

                      {/* Rating and sold skeleton */}
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid
              productTypes={dataProductType.product_types}
              listFavoriteProduct={listFavoriteProduct}
            />
          )}
          {/* Load More Button */}
          {hasMore && !isLoading && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-24 py-6"
              >
                {isLoadingMore ? "Đang tải..." : "Xem thêm"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
