"use client";

import { formatCurrency } from "@/utils/helper";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  Gift,
  Home,
  Map,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";

import { checkoutCartAction } from "@/actions/cart.action";
import { createUserAddressAction } from "@/actions/user.action";
import { verifyCodeAction } from "@/actions/voucher.action";
import districtData from "@/assets/district.json";
import provinceData from "@/assets/province.json";
import wardData from "@/assets/ward.json";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Textarea } from "../ui/textarea";

const addressFormSchema = z.object({
  full_name: z.string().min(1, { message: "Tên không được để trống" }),
  phone: z.string().min(1, { message: "Số điện thoại không được để trống" }),
  province: z.string().min(1, { message: "Vui lòng chọn tỉnh/thành phố" }),
  district: z.string().min(1, { message: "Vui lòng chọn quận/huyện" }),
  ward: z.string().min(1, { message: "Vui lòng chọn phường/xã" }),
  address: z.string().min(1, { message: "Địa chỉ không được để trống" }),
});

interface ICheckoutProps {
  listUserVouchers: IUserVoucherResponse;
  listUserAddress: IUserAddressResponse;
}

export default function Checkout(props: ICheckoutProps) {
  const { listUserVouchers, listUserAddress } = props;
  const defaultAddress =
    !isEmpty(listUserAddress) &&
    listUserAddress.user_addresses.find(
      (address) => address.is_default === "true"
    );
  const router = useRouter();
  const [cartItems, setCartItems] = useState<IProductCartResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [shippingName, setShippingName] = useState<string>("GHTC");
  const [methodPayment, setMethodPayment] = useState<string>("cod");

  const [isOpenSelectProvince, setIsOpenSelectProvince] = useState(false);
  const [isOpenSelectDistrict, setIsOpenSelectDistrict] = useState(false);
  const [isOpenSelectWard, setIsOpenSelectWard] = useState(false);

  const [isOpenDialogVoucher, setIsOpenDialogVoucher] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<IUserVoucher | null>(
    null
  );

  const [isOpenDialogCreateAddress, setIsOpenDialogCreateAddress] =
    useState(false);

  const [selectedAddress, setSelectedAddress] = useState<IUserAddress | null>(
    defaultAddress || null
  );

  const [isOpenDialogChangeAddress, setIsOpenDialogChangeAddress] =
    useState(false);

  const addressForm = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      address: "",
    },
  });

  useEffect(() => {
    const storedData = localStorage.getItem("checkoutData");

    if (storedData) {
      try {
        const checkoutData: ICartResponse = JSON.parse(storedData);

        const flattenedItems = checkoutData.stores.flatMap(
          (store) => store.products
        );

        setCartItems(flattenedItems);
      } catch (error) {
        console.error("Failed to parse checkoutData from localStorage", error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    const subtotal = cartItems.reduce(
      (sum, item) =>
        sum +
        (item.product?.sell_price || (item as any).sell_price || 0) *
          (item.quantity || 0),
      0
    );
    const shippingFee = shippingName === "GHTC" ? 30000 : 60000;
    if (selectedVoucher && selectedVoucher.voucher.discount_cash) {
      setTotalAmount(
        subtotal + shippingFee - selectedVoucher.voucher.discount_cash
      );
    } else if (selectedVoucher && selectedVoucher.voucher.discount_percent) {
      const discountAmount =
        (subtotal * selectedVoucher.voucher.discount_percent) / 100;
      setTotalAmount(
        subtotal +
          shippingFee -
          (discountAmount > selectedVoucher.voucher.max_discount_cash_value
            ? selectedVoucher.voucher.max_discount_cash_value
            : discountAmount)
      );
    } else {
      setTotalAmount(subtotal + shippingFee);
    }
  }, [cartItems, shippingName, selectedVoucher]);

  const selectedProvince = useWatch({
    control: addressForm.control,
    name: "province",
  });

  const selectedDistrict = useWatch({
    control: addressForm.control,
    name: "district",
  });

  const filteredDistricts = districtData.filter(
    (district) => district.province_id === selectedProvince
  );
  const filteredWards = wardData.filter(
    (ward) => ward.district_id === selectedDistrict
  );

  const handleAddUserAddress = async (
    data: z.infer<typeof addressFormSchema>
  ) => {
    try {
      const resp = await createUserAddressAction({
        full_name: data.full_name,
        phone: data.phone,
        province: data.province,
        district: data.district,
        ward: data.ward,
        address: data.address,
      } as any);
      if (resp && resp.code !== 0) {
        toast.error(resp.message);
        return;
      }
      toast.success("Thêm địa chỉ thành công");
      setIsOpenDialogCreateAddress(false);
      // Reset form after successful submission
      addressForm.reset();
    } catch (error) {
      console.error("Error creating address:", error);
      toast.error("Có lỗi xảy ra khi thêm địa chỉ");
    }
  };

  const onSubmit = async () => {
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }
    try {
      setLoading(true);
      const data = {
        product_ordered: cartItems.map((item) => ({
          product_id: item.product?.id || (item as any).id || "",
          quantity: item.quantity,
        })),
        user_address_id: selectedAddress.id,
        total_money: totalAmount,
        method_payment: methodPayment,
        shipping_name: shippingName,
        shipping_fee: shippingName === "GHTC" ? 30000 : 60000,
        code_id: selectedVoucher?.code_id,
        vnpay_return_url:
          methodPayment === "online"
            ? `${window.location.origin}/trang-thai-don-hang-online`
            : "",
      };
      const resp = await checkoutCartAction(data);
      console.log("🚀 ~ onSubmit ~ resp:", resp);
      if (!resp) {
        toast.error("Đặt hàng thất bại");
        return;
      }
      if (resp.code !== 0) {
        setLoading(false);
        toast.error(resp.message);
        return;
      }
      if (resp.data && resp.data.vnp_redirect_url) {
        setLoading(false);
        window.location.replace(resp.data.vnp_redirect_url);
        return;
      } else {
        setLoading(false);
        router.push("/trang-thai-don-hang");
        return;
      }
    } catch (err) {
      setLoading(false);
      console.error("Checkout failed:", err);
      toast.error("Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, product) =>
      sum +
      (product.product?.sell_price || (product as any).sell_price || 0) *
        (product.quantity || 0),
    0
  );

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Order summary */}
          <div className="w-full md:w-1/3">
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Thông tin đơn hàng
                </CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Product list */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.product?.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="relative">
                          <Image
                            src={item.product?.image || (item as any).image}
                            alt={item.product?.name || (item as any).name}
                            className="h-16 w-16 rounded-md object-cover"
                            width={64}
                            height={64}
                            unoptimized
                          />
                          <Badge
                            variant="secondary"
                            className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full"
                          >
                            {item.quantity}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-2 break-words">
                            {item.product?.name || (item as any).name}
                          </h4>
                          {(() => {
                            const attributeValues =
                              item.product?.attribute_values ||
                              (item as any).attribute_values;
                            const attributeString = attributeValues
                              ? Object.entries(attributeValues)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(" | ")
                              : "";
                            return (
                              <p
                                style={{
                                  margin: 0,
                                  color: "#666",
                                  fontSize: "13px",
                                }}
                              >
                                {attributeString}
                              </p>
                            );
                          })()}
                          <p className="text-sm text-gray-500">
                            {formatCurrency(
                              item.product?.sell_price ||
                                (item as any).sell_price ||
                                0
                            )}{" "}
                            x {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-bold text-red-500">
                          {formatCurrency(
                            (item.product?.sell_price ||
                              (item as any).sell_price ||
                              0) * (item.quantity || 0)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon code */}
                  <div className="flex items-center space-x-2 w-full">
                    <Dialog
                      open={isOpenDialogVoucher}
                      onOpenChange={setIsOpenDialogVoucher}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Gift className="w-4 h-4" />
                          Thêm ưu đãi
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[800px] px-4">
                        <DialogHeader>
                          <DialogTitle>
                            Ưu đãi của bạn ({listUserVouchers.total})
                          </DialogTitle>
                          <DialogDescription>
                            Chọn ưu đãi để áp dụng cho đơn hàng
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-96 overflow-y-auto">
                          {isEmpty(listUserVouchers) ||
                          listUserVouchers.total === 0 ? (
                            <div className="flex justify-center py-8">
                              <div className="text-gray-500">
                                Bạn chưa có ưu đãi nào
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {listUserVouchers.user_vouchers.map(
                                (userVoucher) => (
                                  <div
                                    key={userVoucher.id}
                                    className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${
                                      selectedVoucher?.id === userVoucher.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200"
                                    }`}
                                    onClick={async () => {
                                      const resp = await verifyCodeAction({
                                        code_id: userVoucher.code_id,
                                        voucher_id: userVoucher.voucher.id,
                                        total_bill: totalAmount,
                                      });
                                      if (resp && resp.code !== 0) {
                                        toast.error(resp.message);
                                        return;
                                      }
                                      setSelectedVoucher(userVoucher);
                                      setIsOpenDialogVoucher(false);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium">
                                          {userVoucher.voucher.name}
                                        </h4>
                                        <p className="text-sm text-red-600 mt-1">
                                          {(() => {
                                            if (
                                              userVoucher.voucher
                                                .discount_percent
                                            ) {
                                              return (
                                                <span className="font-bold text-red-600">
                                                  Giảm (
                                                  {
                                                    userVoucher.voucher
                                                      .discount_percent
                                                  }
                                                  %)
                                                  {userVoucher.voucher
                                                    .max_discount_cash_value &&
                                                    ` - Tối đa ${formatCurrency(
                                                      userVoucher.voucher
                                                        .max_discount_cash_value
                                                    )}`}
                                                </span>
                                              );
                                            } else if (
                                              userVoucher.voucher.discount_cash
                                            ) {
                                              return (
                                                <span className="font-bold text-red-600">
                                                  Giảm{" "}
                                                  {formatCurrency(
                                                    userVoucher.voucher
                                                      .discount_cash
                                                  )}
                                                </span>
                                              );
                                            }
                                          })()}
                                        </p>

                                        <p className="text-sm mt-1">
                                          {userVoucher.voucher
                                            .min_total_bill_value && (
                                            <span>
                                              Áp dụng cho đơn hàng tối thiểu{" "}
                                              <span className="font-bold text-red-600">
                                                {formatCurrency(
                                                  userVoucher.voucher
                                                    .min_total_bill_value
                                                )}
                                              </span>
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-sm mt-1">
                                          Hạn sử dụng:{" "}
                                          {dayjs
                                            .unix(userVoucher.voucher.end_at)
                                            .format("DD/MM/YYYY HH:mm:ss")}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {selectedVoucher && (
                    <div className="flex items-center justify-center space-x-2 w-full">
                      <Badge variant="outline">
                        <p className="flex items-center">
                          {selectedVoucher.voucher.name}
                          <X
                            className="w-4 h-4 ml-2 cursor-pointer text-red-600"
                            onClick={() => setSelectedVoucher(null)}
                          />
                        </p>
                      </Badge>
                    </div>
                  )}

                  {/* Order summary */}
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tạm tính</span>
                      <span className="text-red-500 font-bold">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phí vận chuyển</span>
                      <span className="text-red-500 font-bold">
                        {formatCurrency(
                          shippingName === "GHTC" ? 30000 : 60000
                        )}
                      </span>
                    </div>
                    {selectedVoucher && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Ưu đãi giảm:</span>
                        <span className="text-red-500 font-bold">
                          {(() => {
                            if (selectedVoucher.voucher.discount_percent) {
                              // Tính số tiền giảm thực tế
                              const calculatedDiscount =
                                (subtotal *
                                  selectedVoucher.voucher.discount_percent) /
                                100;
                              const actualDiscount = selectedVoucher.voucher
                                .max_discount_cash_value
                                ? Math.min(
                                    calculatedDiscount,
                                    selectedVoucher.voucher
                                      .max_discount_cash_value
                                  )
                                : calculatedDiscount;
                              return `- ${formatCurrency(
                                actualDiscount
                              )} (Giảm ${
                                selectedVoucher.voucher.discount_percent
                              }% tối đa ${formatCurrency(
                                selectedVoucher.voucher.max_discount_cash_value
                              )})`;
                            } else if (selectedVoucher.voucher.discount_cash) {
                              return `- ${formatCurrency(
                                selectedVoucher.voucher.discount_cash
                              )}`;
                            }
                          })()}
                        </span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Tổng tiền</span>
                      <span className="text-red-500 font-bold">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      (Đã bao gồm VAT)
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <p className="text-xs text-gray-500 text-center">
                  Bằng cách tiếp tục, bạn đồng ý với{" "}
                  <a href="#" className="underline">
                    điều khoản sử dụng
                  </a>{" "}
                  và{" "}
                  <a href="#" className="underline">
                    chính sách bảo mật
                  </a>{" "}
                  của chúng tôi.
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Right column - Order details  */}
          <div className="flex-1">
            {/* Shipping information */}
            <Card className="">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center">
                    <Home className="mr-2 h-5 w-5" />
                    Thông tin giao hàng
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  {/* User address */}
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Dialog
                          open={isOpenDialogCreateAddress}
                          onOpenChange={setIsOpenDialogCreateAddress}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                !isEmpty(listUserAddress) &&
                                listUserAddress?.user_addresses?.length === 5
                              }
                            >
                              <Map className="w-4 h-4" />
                              Thêm địa chỉ
                            </Button>
                          </DialogTrigger>
                          <DialogContent
                            className="sm:max-w-[800px] px-4"
                            onInteractOutside={(e) => e.preventDefault()}
                            onEscapeKeyDown={(e) => e.preventDefault()}
                          >
                            <DialogHeader>
                              <DialogTitle>Thêm địa chỉ giao hàng</DialogTitle>
                              <DialogDescription>
                                Thêm địa chỉ giao hàng mới
                              </DialogDescription>
                            </DialogHeader>

                            <Form {...addressForm}>
                              <form
                                id="address-form"
                                onSubmit={addressForm.handleSubmit(
                                  handleAddUserAddress
                                )}
                                className="space-y-4"
                              >
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={addressForm.control}
                                    name="full_name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Họ tên</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Nhập tên người nhận"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={addressForm.control}
                                    name="phone"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Số điện thoại</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Nhập số điện thoại"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <FormField
                                    control={addressForm.control}
                                    name="province"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <FormLabel>Tỉnh/Thành phố</FormLabel>
                                        <Popover
                                          open={isOpenSelectProvince}
                                          onOpenChange={setIsOpenSelectProvince}
                                          modal={true}
                                        >
                                          <PopoverTrigger asChild>
                                            <FormControl>
                                              <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                  "justify-between",
                                                  !field.value &&
                                                    "text-muted-foreground"
                                                )}
                                              >
                                                {field.value
                                                  ? provinceData.find(
                                                      (province) =>
                                                        province.id ===
                                                        field.value
                                                    )?.name
                                                  : "Chọn tỉnh/thành phố"}
                                                <ChevronsUpDown className="opacity-50" />
                                              </Button>
                                            </FormControl>
                                          </PopoverTrigger>
                                          <PopoverContent className="p-0 z-[100]">
                                            <Command>
                                              <CommandInput
                                                placeholder="Tìm kiếm tỉnh/thành phố"
                                                className="h-9"
                                              />
                                              <CommandList
                                                onWheel={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <CommandEmpty>
                                                  Không tìm thấy
                                                </CommandEmpty>
                                                <CommandGroup>
                                                  {provinceData.map(
                                                    (province) => (
                                                      <CommandItem
                                                        value={province.name}
                                                        key={province.id}
                                                        onSelect={() => {
                                                          addressForm.setValue(
                                                            "province",
                                                            province.id
                                                          );
                                                          addressForm.setValue(
                                                            "district",
                                                            ""
                                                          );
                                                          addressForm.setValue(
                                                            "ward",
                                                            ""
                                                          );
                                                          setIsOpenSelectProvince(
                                                            false
                                                          );
                                                        }}
                                                      >
                                                        {province.name}
                                                        <Check
                                                          className={cn(
                                                            "ml-auto",
                                                            province.id ===
                                                              field.value
                                                              ? "opacity-100"
                                                              : "opacity-0"
                                                          )}
                                                        />
                                                      </CommandItem>
                                                    )
                                                  )}
                                                </CommandGroup>
                                              </CommandList>
                                            </Command>
                                          </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={addressForm.control}
                                    name="district"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <FormLabel>Quận/Huyện</FormLabel>
                                        <Popover
                                          open={isOpenSelectDistrict}
                                          onOpenChange={setIsOpenSelectDistrict}
                                          modal={true}
                                        >
                                          <PopoverTrigger asChild>
                                            <FormControl>
                                              <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                  "justify-between",
                                                  !field.value &&
                                                    "text-muted-foreground"
                                                )}
                                                disabled={!selectedProvince}
                                              >
                                                {field.value
                                                  ? filteredDistricts.find(
                                                      (d) =>
                                                        d.id === field.value
                                                    )?.name
                                                  : "Chọn quận/huyện"}
                                                <ChevronsUpDown className="opacity-50" />
                                              </Button>
                                            </FormControl>
                                          </PopoverTrigger>
                                          <PopoverContent className="p-0 z-[100]">
                                            <Command>
                                              <CommandInput
                                                placeholder="Tìm kiếm quận/huyện"
                                                className="h-9"
                                              />
                                              <CommandList
                                                onWheel={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <CommandEmpty>
                                                  Không tìm thấy
                                                </CommandEmpty>
                                                <CommandGroup>
                                                  {filteredDistricts.map(
                                                    (district) => (
                                                      <CommandItem
                                                        value={district.name}
                                                        key={district.id}
                                                        onSelect={() => {
                                                          addressForm.setValue(
                                                            "district",
                                                            district.id
                                                          );
                                                          addressForm.setValue(
                                                            "ward",
                                                            ""
                                                          );
                                                          setIsOpenSelectDistrict(
                                                            false
                                                          );
                                                        }}
                                                      >
                                                        {district.name}
                                                        <Check
                                                          className={cn(
                                                            "ml-auto",
                                                            district.id ===
                                                              field.value
                                                              ? "opacity-100"
                                                              : "opacity-0"
                                                          )}
                                                        />
                                                      </CommandItem>
                                                    )
                                                  )}
                                                </CommandGroup>
                                              </CommandList>
                                            </Command>
                                          </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={addressForm.control}
                                    name="ward"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <FormLabel>Phường/Xã</FormLabel>
                                        <Popover
                                          open={isOpenSelectWard}
                                          onOpenChange={setIsOpenSelectWard}
                                          modal={true}
                                        >
                                          <PopoverTrigger asChild>
                                            <FormControl>
                                              <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                  "justify-between",
                                                  !field.value &&
                                                    "text-muted-foreground"
                                                )}
                                                disabled={!selectedDistrict}
                                              >
                                                {field.value
                                                  ? filteredWards.find(
                                                      (w) =>
                                                        w.id === field.value
                                                    )?.name
                                                  : "Chọn phường/xã"}
                                                <ChevronsUpDown className="opacity-50" />
                                              </Button>
                                            </FormControl>
                                          </PopoverTrigger>
                                          <PopoverContent className="p-0 z-[100]">
                                            <Command>
                                              <CommandInput
                                                placeholder="Tìm kiếm phường/xã"
                                                className="h-9"
                                              />
                                              <CommandList
                                                onWheel={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <CommandEmpty>
                                                  Không tìm thấy
                                                </CommandEmpty>
                                                <CommandGroup>
                                                  {filteredWards.map((ward) => (
                                                    <CommandItem
                                                      value={ward.name}
                                                      key={ward.id}
                                                      onSelect={() => {
                                                        addressForm.setValue(
                                                          "ward",
                                                          ward.id
                                                        );
                                                        setIsOpenSelectWard(
                                                          false
                                                        );
                                                      }}
                                                    >
                                                      {ward.name}
                                                      <Check
                                                        className={cn(
                                                          "ml-auto",
                                                          ward.id ===
                                                            field.value
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                        )}
                                                      />
                                                    </CommandItem>
                                                  ))}
                                                </CommandGroup>
                                              </CommandList>
                                            </Command>
                                          </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormField
                                  control={addressForm.control}
                                  name="address"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Địa chỉ: số nhà, tên đường, thôn,
                                        xóm,...
                                      </FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Nhập địa chỉ: số nhà, tên đường"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </form>
                            </Form>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() =>
                                  setIsOpenDialogCreateAddress(false)
                                }
                              >
                                Đóng
                              </Button>
                              <Button type="submit" form="address-form">
                                Thêm địa chỉ
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={isOpenDialogChangeAddress}
                          onOpenChange={setIsOpenDialogChangeAddress}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Thay đổi địa chỉ giao hàng
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[800px] px-4">
                            <DialogHeader>
                              <DialogTitle>
                                Thay đổi địa chỉ giao hàng
                              </DialogTitle>
                              <DialogDescription></DialogDescription>
                            </DialogHeader>

                            <div className="max-h-96 overflow-y-auto p-2">
                              {isEmpty(listUserAddress) ||
                              listUserAddress.user_addresses.length === 0 ? (
                                <div className="flex justify-center py-8">
                                  <div className="text-gray-500">
                                    Bạn chưa có địa chỉ nào
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {listUserAddress.user_addresses.map(
                                    (address) => (
                                      <div
                                        key={address.id}
                                        className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer relative transition-all ${
                                          selectedAddress?.id === address.id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200"
                                        }`}
                                        onClick={() => {
                                          setSelectedAddress(address);
                                          toast.success(
                                            "Đã chọn địa chỉ giao hàng"
                                          );
                                          setIsOpenDialogChangeAddress(false);
                                        }}
                                      >
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between space-x-2">
                                            <h4>
                                              <span className="font-medium">
                                                Tên người nhận:
                                              </span>{" "}
                                              {address.full_name}
                                            </h4>
                                            <Separator
                                              orientation="vertical"
                                              className="h-4"
                                            />
                                            {address.is_default === "true" && (
                                              <Badge className="bg-blue-600 hover:bg-blue-700">
                                                Mặc định
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm">
                                            <span className="font-medium">
                                              Số điện thoại nhận hàng:
                                            </span>{" "}
                                            {address.phone}
                                          </p>
                                          <p className="text-sm">
                                            <span className="font-medium">
                                              Địa chỉ giao hàng:
                                            </span>{" "}
                                            {address.address}
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isEmpty(listUserAddress) ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">
                            Bạn chưa có địa chỉ giao hàng nào
                          </p>
                        </div>
                      ) : selectedAddress ? (
                        <div className="space-y-3">
                          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between space-x-2">
                                <h4>
                                  <span className="font-medium">
                                    Tên người nhận:
                                  </span>{" "}
                                  {selectedAddress.full_name}
                                </h4>
                                <Separator
                                  orientation="vertical"
                                  className="h-4"
                                />
                                {selectedAddress.is_default === "true" && (
                                  <Badge className="bg-blue-600 hover:bg-blue-700">
                                    Mặc định
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">
                                  Số điện thoại nhận hàng:
                                </span>{" "}
                                {selectedAddress.phone}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">
                                  Địa chỉ giao hàng:
                                </span>{" "}
                                {selectedAddress.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">
                            Vui lòng chọn địa chỉ giao hàng
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Shipping method */}
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl flex items-center">
                        <Truck className="mr-2 h-5 w-5" />
                        Phương thức vận chuyển
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={shippingName}
                        onValueChange={setShippingName}
                        className="space-y-4"
                      >
                        <div className="flex items-center space-x-3 border rounded-md p-3">
                          <RadioGroupItem value="GHTC" id="GHTC" />
                          <Label htmlFor="GHTC" className="flex-1">
                            <div className="font-medium">
                              Giao hàng tiêu chuẩn
                            </div>
                            <div className="text-sm text-gray-500">
                              Nhận hàng trong 3-5 ngày
                            </div>
                          </Label>
                          <div className="font-medium">30.000₫</div>
                        </div>
                        <div className="flex items-center space-x-3 border rounded-md p-3">
                          <RadioGroupItem value="GHN" id="GHN" />
                          <Label htmlFor="GHN" className="flex-1">
                            <div className="font-medium">Giao hàng nhanh</div>
                            <div className="text-sm text-gray-500">
                              Nhận hàng trong 1-2 ngày
                            </div>
                          </Label>
                          <div className="font-medium">60.000₫</div>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* Payment method */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Phương thức thanh toán
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={methodPayment}
                        onValueChange={setMethodPayment}
                        className="space-y-4"
                      >
                        <div className="flex items-center space-x-3 border rounded-md p-3">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="flex-1">
                            <div className="font-medium">
                              Thanh toán khi nhận hàng
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 border rounded-md p-3">
                          <RadioGroupItem value="online" id="online" />
                          <Label htmlFor="online" className="flex-1">
                            <div className="font-medium">Thanh toán online</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <Button
                    className="w-full mt-4"
                    size="lg"
                    type="submit"
                    onClick={onSubmit}
                  >
                    {loading ? "Đang xử lý..." : "Đặt hàng"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
