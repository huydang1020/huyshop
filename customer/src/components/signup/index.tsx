"use client";

import { signUpAction } from "@/actions/auth.action";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

const formRegisterSchema = z.object({
  full_name: z
    .string()
    .min(1, {
      message: "Họ tên không được để trống",
    })
    .regex(new RegExp(/^[A-Za-zÀ-Ỹà-ỹĐđ\s]+$/), {
      message: "Họ tên không hợp lệ",
    }),
  phone_number: z
    .string()
    .min(1, {
      message: "Số điện thoại không được để trống",
    })
    .regex(
      new RegExp(/^(?:\+84|0)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])\d{7}$/),
      {
        message: "Số điện thoại không hợp lệ",
      }
    ),
  email: z
    .string()
    .min(1, {
      message: "Email không được để trống",
    })
    .regex(new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/), {
      message: "Email không hợp lệ",
    }),
  password: z.string().min(1, { message: "Mật khẩu không được để trống" }),
  confirm_password: z.string().min(1, {
    message: "Mật khẩu không được để trống",
  }),
});

export const SignUp = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formRegisterSchema>>({
    resolver: zodResolver(formRegisterSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const handleSignUp = async (values: z.infer<typeof formRegisterSchema>) => {
    try {
      setIsLoading(true);
      if (values.password !== values.confirm_password) {
        toast.warning("Mật khẩu không khớp");
        return;
      }
      const respSignUp = await signUpAction(values as any);
      if (respSignUp.code !== 0) {
        toast.error(respSignUp.message);
        return;
      }
      toast.success("Đăng ký thành công");
      router.push("/dang-nhap");
    } catch (error) {
      console.log(error);
      toast.error("Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-100">
      <CardContent>
        <div
          className="flex flex-col justify-center py-4 sm:px-6 lg:px-72"
          data-aos="fade-right"
        >
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Đăng ký
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 max-w">
              Bạn đã có tài khoản?{" "}
              <Link
                href="/dang-nhap"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSignUp)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ tên</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập họ tên" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone_number"
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
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập mật khẩu"
                              type={isShowPassword ? "text" : "password"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nhập lại mật khẩu</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập lại mật khẩu"
                              type={isShowPassword ? "text" : "password"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="text-sm flex items-center gap-2">
                    <Checkbox
                      id="show-password"
                      checked={isShowPassword}
                      onCheckedChange={() => setIsShowPassword(!isShowPassword)}
                    />
                    <Label className="cursor-pointer" htmlFor="show-password">
                      Hiện mật khẩu
                    </Label>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-br from-blue-600 to-purple-600 focus:outline-none"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                  </button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
