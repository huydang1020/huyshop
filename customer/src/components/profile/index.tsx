"use client";

import { signOutAction } from "@/actions/auth.action";
import {
  changePasswordAction,
  createUserAddressAction,
  deleteUserAddressAction,
  updateProfileAction,
  updateUserAddressAction,
} from "@/actions/user.action";
import districtData from "@/assets/district.json";
import provinceData from "@/assets/province.json";
import wardData from "@/assets/ward.json";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/utils/helper";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfigProvider, DatePicker, Form, FormProps } from "antd";
import vi_VN from "antd/es/locale/vi_VN";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  Edit3,
  Gift,
  Heart,
  LogOut,
  Map,
  MapPin,
  Shield,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import defaultAvatar from "@/assets/images/avatar.png";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form as ShadcnForm,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import UploadImage from "../upload";

const addressFormSchema = z.object({
  full_name: z.string().min(1, { message: "Tên không được để trống" }),
  phone: z.string().min(1, { message: "Số điện thoại không được để trống" }),
  province: z.string().min(1, { message: "Vui lòng chọn tỉnh/thành phố" }),
  district: z.string().min(1, { message: "Vui lòng chọn quận/huyện" }),
  ward: z.string().min(1, { message: "Vui lòng chọn phường/xã" }),
  address: z.string().min(1, { message: "Địa chỉ không được để trống" }),
});

interface IProfileProps {
  userInfo: IUser;
  listUserAddress: IUserAddressResponse;
  listPointExchange: IPointExchangeResponse;
}

export const Profile = (props: IProfileProps) => {
  const { userInfo, listUserAddress, listPointExchange } = props;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Initialize birthday value based on userInfo
  const [birthdayValue, setBirthdayValue] = useState(() => {
    if (userInfo?.birthday != null) {
      const date = new Date(userInfo.birthday * 1000);
      return dayjs(date);
    }
    return null;
  });

  const [isOpenDialogCreateAddress, setIsOpenDialogCreateAddress] =
    useState(false);

  const [isOpenDialogUpdateAddress, setIsOpenDialogUpdateAddress] =
    useState(false);

  const [selectedAddress, setSelectedAddress] = useState<IUserAddress | null>(
    null
  );

  const [isOpenSelectProvince, setIsOpenSelectProvince] = useState(false);
  const [isOpenSelectDistrict, setIsOpenSelectDistrict] = useState(false);
  const [isOpenSelectWard, setIsOpenSelectWard] = useState(false);

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

  // Populate form when selectedAddress changes
  useEffect(() => {
    if (selectedAddress) {
      addressForm.reset({
        full_name: selectedAddress.full_name || "",
        phone: selectedAddress.phone || "",
        province: selectedAddress.province || "",
        district: selectedAddress.district || "",
        ward: selectedAddress.ward || "",
        address: selectedAddress.address || "",
      });
    }
  }, [selectedAddress, addressForm]);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // Set form values when userInfo changes
  useEffect(() => {
    if (userInfo) {
      // Convert birthday timestamp to dayjs object
      let birthdayDayjs = null;
      if (userInfo.birthday != null) {
        const date = new Date(userInfo.birthday * 1000);
        birthdayDayjs = dayjs(date);
      }

      // Update birthday state
      setBirthdayValue(birthdayDayjs);

      form.setFieldsValue({
        full_name: userInfo.full_name || "",
        phone_number: userInfo.phone_number || "",
        birthday: birthdayDayjs,
        email: userInfo.email || "",
        avatar: userInfo.avatar
          ? [
              {
                uid: "-1",
                name: "image.jpg",
                status: "done" as const,
                url: userInfo.avatar,
              },
            ]
          : [],
      });
    }
  }, [userInfo, form]);

  // Reset form when create dialog opens
  useEffect(() => {
    if (isOpenDialogCreateAddress) {
      addressForm.reset({
        full_name: "",
        phone: "",
        province: "",
        district: "",
        ward: "",
        address: "",
      });
    }
  }, [isOpenDialogCreateAddress, addressForm]);

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
      addressForm.reset();
    } catch (error) {
      console.error("Error creating address:", error);
      toast.error("Có lỗi xảy ra khi thêm địa chỉ");
    }
  };

  const handleUpdateUserAddress = async (
    data: z.infer<typeof addressFormSchema>
  ) => {
    if (!selectedAddress) return;

    try {
      const resp = await updateUserAddressAction(selectedAddress.id, {
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
      toast.success("Cập nhật địa chỉ thành công");
      setIsOpenDialogUpdateAddress(false);
      setSelectedAddress(null);
      // Reset form về defaultValues
      addressForm.reset({
        full_name: "",
        phone: "",
        province: "",
        district: "",
        ward: "",
        address: "",
      });
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Có lỗi xảy ra khi cập nhật địa chỉ");
    }
  };

  const onFinishUserInfo: FormProps<any>["onFinish"] = async (values) => {
    console.log("🚀 ~ Form values:", values);

    // Handle avatar: check if it's a new upload (has response) or existing (has url)
    let avatarUrl = "";
    if (values?.avatar?.[0]) {
      if (values.avatar[0].response?.[0]?.url) {
        // New upload
        avatarUrl = values.avatar[0].response[0].url;
      } else if (values.avatar[0].url) {
        // Existing avatar
        avatarUrl = values.avatar[0].url;
      }
    }

    const submitData = {
      ...values,
      birthday:
        values.birthday && dayjs.isDayjs(values.birthday)
          ? values.birthday.unix()
          : values.birthday,
      avatar: avatarUrl,
    };

    console.log("🚀 ~ Submit data:", submitData);
    const resp = await updateProfileAction(submitData);
    console.log("🚀 ~ resp:", resp);
    if (resp && resp.code !== 0) {
      toast.error(resp.message);
      return;
    }
    toast.success("Cập nhật thông tin thành công");
  };

  const onFinishFailedUserInfo: FormProps<any>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  const onFinishChangePassword: FormProps<any>["onFinish"] = async (values) => {
    console.log("🚀 ~ values:", values);
    const resp = await changePasswordAction(
      values.old_password,
      values.new_password
    );
    if (resp && resp.code !== 0) {
      toast.error(resp.message);
      return;
    }
    passwordForm.resetFields();
    const respSignOut = await signOutAction();
    if (respSignOut && respSignOut.code !== 0) {
      toast.error(respSignOut.message);
      return;
    }
    toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
    router.push("/dang-nhap");
  };

  const onFinishFailedChangePassword: FormProps<any>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b select-none">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Tài khoản của bạn
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Image
                      src={userInfo.avatar || defaultAvatar}
                      alt="avatar"
                      className="w-20 h-20 rounded-full object-cover"
                      width={80}
                      height={80}
                      unoptimized
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800">
                  {userInfo.full_name}
                </h3>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <nav className="p-2">
                {[
                  { id: "overview", label: "Tổng quan", icon: TrendingUp },
                  { id: "addresses", label: "Địa chỉ giao hàng", icon: MapPin },
                  { id: "wallet", label: "Ví điểm", icon: Wallet },
                  { id: "security", label: "Bảo mật", icon: Shield },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                ))}

                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-all"
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
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">
                          {userInfo.total_orders || 0}
                        </p>
                        <p className="text-gray-600 text-sm">Đơn hàng</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Wallet className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          {formatCurrency(userInfo.total_amount_spent || 0)}
                        </p>
                        <p className="text-gray-600 text-sm">Tổng chi tiêu</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-100 rounded-xl">
                        <Heart className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">
                          {userInfo.favorite_quantity || 0}
                        </p>
                        <p className="text-gray-600 text-sm">Yêu thích</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-100 rounded-xl">
                        <Gift className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">
                          {formatNumber(userInfo.total_earned_points || 0)}
                        </p>
                        <p className="text-gray-600 text-sm">Điểm tích lũy</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Thông tin cá nhân
                    </h3>
                  </div>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinishUserInfo}
                    onFinishFailed={onFinishFailedUserInfo}
                    autoComplete="off"
                    initialValues={{
                      full_name: "",
                      phone_number: "",
                      birthday: null,
                      email: "",
                      avatar: [],
                    }}
                  >
                    <div className="grid md:grid-cols-3 gap-4">
                      <Form.Item label="Ảnh đại diện" name="avatar">
                        <UploadImage />
                      </Form.Item>

                      <Form.Item
                        label="Họ và tên"
                        name="full_name"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập họ và tên",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        label="Số điện thoại"
                        name="phone_number"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số điện thoại",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Form.Item
                        label={
                          <span>
                            Sinh nhật:{" "}
                            <small className="text-gray-500 italic">
                              Không thể thay đổi sau khi đã thiết lập
                            </small>
                          </span>
                        }
                        name="birthday"
                      >
                        <ConfigProvider locale={vi_VN}>
                          <DatePicker
                            style={{ width: "100%", height: "36px" }}
                            placeholder="Chọn ngày sinh"
                            format="DD/MM/YYYY"
                            value={birthdayValue}
                            disabled={userInfo?.birthday != null}
                            onChange={(date) => {
                              setBirthdayValue(date);
                              form.setFieldValue("birthday", date);
                            }}
                          />
                        </ConfigProvider>
                      </Form.Item>

                      <Form.Item label="Email" name="email">
                        <Input />
                      </Form.Item>
                    </div>
                    <Form.Item>
                      <Button type="submit">Cập nhật</Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Địa chỉ giao hàng (
                      {listUserAddress?.user_addresses?.length || 0})
                    </h3>
                    <small className="text-gray-500 italic">
                      *Tối đa 5 địa chỉ*
                    </small>
                  </div>
                  <Dialog
                    open={isOpenDialogCreateAddress}
                    onOpenChange={setIsOpenDialogCreateAddress}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Reset form về defaultValues khi mở dialog thêm mới
                          addressForm.reset({
                            full_name: "",
                            phone: "",
                            province: "",
                            district: "",
                            ward: "",
                            address: "",
                          });
                        }}
                      >
                        <Map className="w-4 h-4" />
                        Thêm địa chỉ
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="sm:max-w-[800px] px-4"
                      onInteractOutside={(e) => e.preventDefault()}
                      onEscapeKeyDown={(e) => e.preventDefault()}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      <DialogHeader>
                        <DialogTitle>Thêm địa chỉ giao hàng</DialogTitle>
                        <DialogDescription></DialogDescription>
                      </DialogHeader>

                      <ShadcnForm {...addressForm}>
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
                                                  province.id === field.value
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
                                          onWheel={(e) => e.stopPropagation()}
                                        >
                                          <CommandEmpty>
                                            Không tìm thấy
                                          </CommandEmpty>
                                          <CommandGroup>
                                            {provinceData.map((province) => (
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
                                                    province.id === field.value
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
                                                (d) => d.id === field.value
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
                                          onWheel={(e) => e.stopPropagation()}
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
                                                (w) => w.id === field.value
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
                                          onWheel={(e) => e.stopPropagation()}
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
                                                  setIsOpenSelectWard(false);
                                                }}
                                              >
                                                {ward.name}
                                                <Check
                                                  className={cn(
                                                    "ml-auto",
                                                    ward.id === field.value
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
                                  Địa chỉ: số nhà, tên đường, thôn, xóm,...
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
                      </ShadcnForm>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setIsOpenDialogCreateAddress(false)}
                        >
                          Đóng
                        </Button>
                        <Button type="submit" form="address-form">
                          Thêm địa chỉ
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {isEmpty(listUserAddress) ? (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Chưa có địa chỉ giao hàng</p>
                    </div>
                  ) : (
                    listUserAddress.user_addresses.map(
                      (address: IUserAddress) => (
                        <div
                          key={address.id}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {address.is_default === "true" && (
                                  <Badge className="bg-blue-600 hover:bg-blue-700">
                                    Mặc định
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-2">
                                <h4>
                                  <span className="font-medium">
                                    Tên người nhận:
                                  </span>{" "}
                                  {address.full_name}
                                </h4>
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
                                  {address.full_address}
                                </p>
                              </div>
                              {address.is_default === "false" ? (
                                <div className="flex items-center gap-2 mt-4">
                                  <p className="text-sm font-medium">
                                    Đặt làm mặc định
                                  </p>
                                  <Switch
                                    checked={false}
                                    onCheckedChange={async () => {
                                      const resp =
                                        await updateUserAddressAction(
                                          address.id,
                                          {
                                            is_default: "true",
                                          } as any
                                        );
                                      if (resp && resp.code !== 0) {
                                        toast.error(resp.message);
                                        return;
                                      }
                                      toast.success(
                                        "Cập nhật địa chỉ thành công"
                                      );
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-4">
                                  <p className="text-sm font-medium">
                                    Đặt làm mặc định
                                  </p>
                                  <Switch checked={true} disabled />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Dialog
                                open={isOpenDialogUpdateAddress}
                                onOpenChange={setIsOpenDialogUpdateAddress}
                              >
                                <DialogTrigger asChild>
                                  <button
                                    className="p-2 text-blue-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                    onClick={() => setSelectedAddress(address)}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                </DialogTrigger>
                                <DialogContent
                                  className="sm:max-w-[800px] px-4"
                                  onInteractOutside={(e) => e.preventDefault()}
                                  onEscapeKeyDown={(e) => e.preventDefault()}
                                  onOpenAutoFocus={(e) => e.preventDefault()}
                                  onCloseAutoFocus={(e) => e.preventDefault()}
                                >
                                  <DialogHeader>
                                    <DialogTitle>
                                      Cập nhật địa chỉ giao hàng
                                    </DialogTitle>
                                    <DialogDescription></DialogDescription>
                                  </DialogHeader>

                                  <ShadcnForm {...addressForm}>
                                    <form
                                      id="update-address-form"
                                      onSubmit={addressForm.handleSubmit(
                                        handleUpdateUserAddress
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
                                              <FormLabel>
                                                Số điện thoại
                                              </FormLabel>
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
                                              <FormLabel>
                                                Tỉnh/Thành phố
                                              </FormLabel>
                                              <Popover
                                                open={isOpenSelectProvince}
                                                onOpenChange={
                                                  setIsOpenSelectProvince
                                                }
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
                                                              value={
                                                                province.name
                                                              }
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
                                                onOpenChange={
                                                  setIsOpenSelectDistrict
                                                }
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
                                                      disabled={
                                                        !selectedProvince
                                                      }
                                                    >
                                                      {field.value
                                                        ? filteredDistricts.find(
                                                            (d) =>
                                                              d.id ===
                                                              field.value
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
                                                              value={
                                                                district.name
                                                              }
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
                                                onOpenChange={
                                                  setIsOpenSelectWard
                                                }
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
                                                      disabled={
                                                        !selectedDistrict
                                                      }
                                                    >
                                                      {field.value
                                                        ? filteredWards.find(
                                                            (w) =>
                                                              w.id ===
                                                              field.value
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
                                                        {filteredWards.map(
                                                          (ward) => (
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
                                  </ShadcnForm>

                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      type="button"
                                      onClick={() => {
                                        setIsOpenDialogUpdateAddress(false);
                                        setSelectedAddress(null);
                                        // Reset form về defaultValues
                                        addressForm.reset({
                                          full_name: "",
                                          phone: "",
                                          province: "",
                                          district: "",
                                          ward: "",
                                          address: "",
                                        });
                                      }}
                                    >
                                      Đóng
                                    </Button>
                                    <Button
                                      type="submit"
                                      form="update-address-form"
                                    >
                                      Cập nhật địa chỉ
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <button
                                className="p-2 text-red-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={async () => {
                                  const resp = await deleteUserAddressAction(
                                    address.id
                                  );
                                  if (resp && resp.code !== 0) {
                                    toast.error(resp.message);
                                    return;
                                  }
                                  toast.success("Xóa địa chỉ thành công");
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-1 gap-6">
                  {/* Points Card */}
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">Điểm tích lũy</h3>
                      <Gift className="w-6 h-6" />
                    </div>
                    <p className="text-3xl font-bold mb-2">
                      {formatNumber(userInfo.total_earned_points || 0)}
                    </p>
                    <p className="text-yellow-100">Điểm có thể sử dụng</p>
                    {userInfo.total_earned_points > 0 && (
                      <button
                        className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                        onClick={() => {
                          router.push("/uu-dai");
                        }}
                      >
                        Đổi điểm
                      </button>
                    )}
                  </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Lịch sử giao dịch
                  </h3>
                  {isEmpty(listPointExchange) ? (
                    <div className="text-center py-8 text-gray-500">
                      <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Chưa có giao dịch nào</p>
                      <p className="text-sm">
                        Các giao dịch sẽ hiển thị tại đây
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {listPointExchange.point_exchanges.map((transaction) => (
                        <Card
                          key={transaction.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              {/* Avatar */}
                              <Image
                                src={
                                  transaction.receiver.avatar ||
                                  defaultAvatar.src
                                }
                                alt={transaction.receiver.full_name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                      {transaction.receiver.full_name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                      {dayjs
                                        .unix(transaction.created_at)
                                        .format("DD/MM/YYYY HH:mm:ss")}
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {transaction.description}
                                    </p>
                                  </div>

                                  {/* Points Badge */}
                                  <div className="flex flex-col items-end ml-4">
                                    <Badge
                                      variant="secondary"
                                      className={`${
                                        transaction.points > 0
                                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                                          : "bg-red-100 text-red-800 hover:bg-red-100"
                                      } font-semibold text-base px-3 py-1 mb-2`}
                                    >
                                      {transaction.points > 0
                                        ? `+${formatNumber(
                                            transaction.points
                                          )} điểm`
                                        : `${formatNumber(
                                            transaction.points
                                          )} điểm`}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Đổi mật khẩu
                  </h3>
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={onFinishChangePassword}
                    onFinishFailed={onFinishFailedChangePassword}
                    autoComplete="off"
                    initialValues={{
                      old_password: "",
                      new_password: "",
                      confirm_password: "",
                    }}
                  >
                    <Form.Item
                      label="Mật khẩu hiện tại"
                      name="old_password"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mật khẩu hiện tại",
                        },
                      ]}
                    >
                      <Input type="password" placeholder="Mật khẩu hiện tại" />
                    </Form.Item>
                    <Form.Item
                      label="Mật khẩu mới"
                      name="new_password"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mật khẩu mới",
                        },
                        {
                          min: 6,
                          message: "Mật khẩu phải có ít nhất 6 ký tự",
                        },
                      ]}
                    >
                      <Input type="password" placeholder="Mật khẩu mới" />
                    </Form.Item>
                    <Form.Item
                      label="Nhập lại mật khẩu mới"
                      name="confirm_password"
                      dependencies={["new_password"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập lại mật khẩu mới",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            // Chỉ validate khi đã nhập confirm password
                            if (!value) {
                              return Promise.resolve();
                            }

                            const newPassword = getFieldValue("new_password");
                            if (!newPassword) {
                              return Promise.reject(
                                new Error("Vui lòng nhập mật khẩu mới trước")
                              );
                            }

                            if (newPassword === value) {
                              return Promise.resolve();
                            }

                            return Promise.reject(
                              new Error("Mật khẩu xác nhận không khớp!")
                            );
                          },
                        }),
                      ]}
                    >
                      <Input
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </Form.Item>
                    <Button type="submit">Cập nhật mật khẩu</Button>
                  </Form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
