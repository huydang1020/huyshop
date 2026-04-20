"use client";

import { sendOtpAction, verifyOtpAction } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { toast } from "sonner";
import { signInAfterVerifyOtpAction } from "@/actions/auth.action";

interface ActiveAccountProps {
  username: string;
}

const ActiveAccount = ({ username }: ActiveAccountProps) => {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasOtpSent, setHasOtpSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && hasOtpSent) {
      setIsResendDisabled(false);
    }
  }, [timeLeft, hasOtpSent]);

  // Format thời gian hiển thị
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Gửi OTP đến email
  const handleSendOtp = async () => {
    try {
      setIsLoading(true);

      const resp = await sendOtpAction({ username });
      if (resp.code !== 0) {
        toast.error(resp.message);
        return;
      }

      setTimeLeft(resp.data.ttl);
      setIsResendDisabled(true);
      setHasOtpSent(true);
      toast.success("Đã gửi mã OTP đến email của bạn");
      // Focus vào ô nhập OTP đầu tiên
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi gửi OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý thay đổi input OTP
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Xử lý phím backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
    }
  };

  const handleResendOtp = async () => {
    try {
      if (isSendingOtp) return;
      setIsSendingOtp(true);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      const resp = await sendOtpAction({ username });
      if (resp.code !== 0) {
        toast.error(resp.message);
        return;
      }
      setTimeLeft(resp.data.ttl);
      setIsResendDisabled(true);
      toast.success("Đã gửi lại mã OTP");
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi gửi OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const verifyOtp = otp.join("");
    const resp = await verifyOtpAction(username, verifyOtp);
    if (resp.code !== 0) {
      toast.error(resp.message);
      return;
    }
    const respSignIn = await signInAfterVerifyOtpAction({
      username,
      password: "",
    });
    if (respSignIn.code !== 0) {
      toast.error(respSignIn.message);
      return;
    }
    toast.success(
      "Xin chúc mừng, tài khoản của bạn đã được kích hoạt thành công!"
    );
    router.push("/");
  };

  return (
    <Card className="bg-gray-100">
      <CardContent>
        <div
          className="flex flex-col justify-center py-4 sm:px-6 lg:px-4"
          data-aos="fade-right"
        >
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Kích hoạt tài khoản
            </h2>
          </div>

          <div className="mt-8 max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {hasOtpSent ? "Xác thực OTP" : "Gửi mã xác thực"}
              </h2>
              {/* <p className="text-gray-600 mb-2">
                {hasOtpSent ? "Mã OTP đã được gửi đến" : "Gửi mã OTP đến email"}
              </p>
              <p className="font-semibold text-gray-800">{username}</p> */}
            </div>

            {!hasOtpSent ? (
              // Hiển thị nút gửi OTP
              <Button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full py-3 text-lg font-semibold disabled:opacity-50"
              >
                {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
              </Button>
            ) : (
              // Hiển thị form nhập OTP
              <>
                <div className="flex justify-center gap-3 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      maxLength={1}
                      disabled={isLoading}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <div className="text-center mb-6">
                  {isResendDisabled ? (
                    <p className="text-gray-600">
                      Gửi lại OTP sau:{" "}
                      <span className="font-bold text-blue-600">
                        {formatTime(timeLeft)}
                      </span>
                    </p>
                  ) : (
                    <Button onClick={handleResendOtp} disabled={isSendingOtp}>
                      {isSendingOtp ? "Đang gửi..." : "Gửi lại OTP"}
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.join("").length !== 6}
                  className="w-full py-3 text-lg font-semibold disabled:opacity-50"
                >
                  {isLoading ? "Đang xác thực..." : "Xác nhận OTP"}
                </Button>
              </>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                {hasOtpSent
                  ? "Không nhận được mã? Kiểm tra hộp thư spam hoặc chờ hết thời gian để gửi lại."
                  : "Mã OTP sẽ được gửi đến địa chỉ email của bạn để xác thực tài khoản."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveAccount;
