"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    console.log("Error:", error.message);
  }, [error]);

  return (
    <div className="bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-foreground">
              Oops! Có lỗi xảy ra
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Chúng tôi không thể tải dữ liệu lúc này. Vui lòng thử lại sau.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Không thể kết nối đến máy chủ. Vui lòng thử lại sau vài phút.
              </AlertDescription>
            </Alert>
          </CardContent>

          <Separator />

          <CardFooter className="flex flex-col gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Nếu vấn đề vẫn tiếp tục, vui lòng{" "}
              <Link href="/" className="text-primary hover:underline">
                liên hệ hỗ trợ
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
