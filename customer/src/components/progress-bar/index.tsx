// components/ProgressBar.tsx
"use client";

import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { usePathname, useSearchParams } from "next/navigation";

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: true });

    const handleStart = () => {
      NProgress.start();
    };

    const handleStop = () => {
      NProgress.done();
    };

    handleStart();
    handleStop();

    window.addEventListener("beforeunload", handleStart);
    return () => {
      window.removeEventListener("beforeunload", handleStart);
    };
  }, [pathname, searchParams]);

  return null;
}
