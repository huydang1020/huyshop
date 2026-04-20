"use client";

import { signInAction } from "@/actions/auth.action";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

const formLoginSchema = z.object({
  username: z.string().min(1, {
    message: "Số điện thoại hoặc email không được để trống",
  }),
  password: z.string().min(1, { message: "Mật khẩu không được để trống" }),
});

interface SignInProps {
  redirect?: string;
}

export const SignIn = ({ redirect }: SignInProps) => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isOpenAlertDialog, setIsOpenAlertDialog] = useState(false);

  const form = useForm<z.infer<typeof formLoginSchema>>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleLogin = async (values: z.infer<typeof formLoginSchema>) => {
    const resp = await signInAction(values);
    if (resp.code === -1) {
      toast.error(resp.message);
      return;
    }
    if (resp.code === 1) {
      setUsername(values.username);
      setIsOpenAlertDialog(true);
      return;
    }
    toast.success("Đăng nhập thành công");
    if (redirect) {
      router.push(`/${redirect}`);
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <AlertDialog open={isOpenAlertDialog} onOpenChange={setIsOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tài khoản của bạn chưa được kích hoạt!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng bấm tiếp tục để kích hoạt tài khoản.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                router.push(`/kich-hoat-tai-khoan?username=${username}`)
              }
            >
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="bg-gray-100">
        <CardContent>
          <div
            className="flex flex-col justify-center py-4 sm:px-6 lg:px-4"
            data-aos="fade-right"
          >
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Đăng nhập
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 max-w">
                Bạn chưa có tài khoản?{" "}
                <Link
                  href="/dang-ky"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleLogin)}
                    className="space-y-4"
                    autoComplete="off"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại hoặc email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập số điện thoại hoặc email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu</FormLabel>
                          <FormControl>
                            <Input
                              type={isShowPassword ? "text" : "password"}
                              placeholder="Nhập mật khẩu"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <div className="text-sm flex items-center gap-2">
                        <Checkbox
                          id="show-password"
                          checked={isShowPassword}
                          onCheckedChange={() =>
                            setIsShowPassword(!isShowPassword)
                          }
                        />
                        <Label
                          className="cursor-pointer"
                          htmlFor="show-password"
                        >
                          Hiện mật khẩu
                        </Label>
                      </div>
                      <div className="text-sm">
                        <a
                          href="#"
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Quên mật khẩu?
                        </a>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-br from-blue-600 to-purple-600 focus:outline-none"
                    >
                      Đăng nhập
                    </button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
