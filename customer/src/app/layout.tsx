import { Header } from "@/components/header";
import { ProgressBar } from "@/components/progress-bar";
import ScrollToTop from "@/components/scroll-top";
import ScrollTopButton from "@/components/scroll-top/button";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { getUserInfoAction } from "@/actions/auth.action";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/footer";
import StyledComponentsRegistry from "@/lib/antd-styled-component";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Trang chủ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accessToken = cookies().get("access_token")?.value;

  let userInfo: IUser = {} as IUser;
  if (accessToken) {
    const resp = await getUserInfoAction();
    console.log("🚀 ~ resp:", resp);
    if (resp && resp.code === 0) {
      userInfo = resp.data;
    }
  }

  return (
    <html suppressHydrationWarning>
      <body className={`${montserrat.className}`}>
        <StyledComponentsRegistry>
          <Header userInfo={userInfo} />
          <div className="container mx-auto py-8 px-4 min-h-[650px]">
            {children}
          </div>
          <Footer />
          <ProgressBar />
          <ScrollToTop />
          <ScrollTopButton />
          <Toaster position="top-center" />
        </StyledComponentsRegistry>
        <Script
          id="fchat-script"
          strategy="afterInteractive" // hoặc "lazyOnload", "beforeInteractive"
          src="https://cdn.fchat.vn/assets/embed/webchat.js?id=68620720fd8a9228930b0783"
          async={true}
        />
      </body>
    </html>
  );
}
