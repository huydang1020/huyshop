import Banner from "#src/assets/svg/banner.svg?react";
import logo from "#src/assets/svg/logo.svg?url";
import { useLayoutMenu } from "#src/hooks";
import { LayoutFooter } from "#src/layout";
import { LanguageButton } from "#src/layout/layout-header/components/language-button";
import { ThemeButton } from "#src/layout/layout-header/components/theme-button";

import { Col, Row, theme } from "antd";
import { clsx } from "clsx";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PasswordLogin } from "./password-login";

export default function Login() {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { pageLayout, layoutButtonTrigger } = useLayoutMenu();
  const isALignLeft = useMemo(() => pageLayout === "layout-left", [pageLayout]);
  const isAlignCenter = useMemo(
    () => pageLayout === "layout-center",
    [pageLayout]
  );

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
      }}
    >
      <div className="absolute left-0 top-0 z-10 flex flex-1">
        <div className="text-colorText ml-4 mt-4 gap-2 flex flex-1 items-center sm:left-6 sm:top-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {import.meta.env.VITE_GLOB_APP_TITLE}
          </span>
        </div>
      </div>
      <header className="z-10 absolute flex items-center right-3 top-3">
        {layoutButtonTrigger}
        <ThemeButton />
        <LanguageButton className="px-[11px]" />
      </header>
      <div className="flex items-center overflow-hidden h-full">
        <Row
          className={clsx("h-screen w-full", {
            "flex-row-reverse": isALignLeft,
          })}
        >
          <Col
            xs={0}
            sm={0}
            lg={15}
            style={{
              backgroundImage: `radial-gradient(${token.colorBgContainer}, ${token.colorPrimaryBg})`,
            }}
            className={clsx({ hidden: isAlignCenter })}
          >
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Banner className="h-64 motion-safe:animate-bounceInDownOutUp" />
              <div className="text-xl text-colorTextSecondary mt-6 font-sans lg:text-2xl">
                {t("authority.pageTitle")}
              </div>
              <div className="text-colorTextTertiary mt-2">
                {t("authority.pageDescription")}
              </div>
            </div>
          </Col>

          <Col
            xs={24}
            sm={24}
            lg={isAlignCenter ? 24 : 9}
            className="relative flex flex-col justify-center px-6 py-10 xl:px-8"
            style={
              isAlignCenter
                ? {
                    backgroundImage: `radial-gradient(${token.colorBgContainer}, ${token.colorPrimaryBg})`,
                  }
                : {}
            }
          >
            <LayoutFooter className="w-full absolute bottom-3 left-1/2 -translate-x-1/2" />
            <div className="w-full sm:mx-auto md:max-w-md">
              <PasswordLogin />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
