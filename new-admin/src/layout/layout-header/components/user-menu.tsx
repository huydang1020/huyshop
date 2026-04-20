import type { ButtonProps, MenuProps } from "antd";

import { BasicButton } from "#src/components";
import { UserCircleIcon } from "#src/icons";
import { cn } from "#src/utils";

import { toastUtil } from "#src/components/toast/index.js";
import * as authService from "#src/services/auth";
import useAuthStore, { useUserInfo } from "#src/store/auth.js";
import { LogoutOutlined } from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export function UserMenu({ ...restProps }: ButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const avatar = useUserInfo().avatar;
  const { clearUserToken, clearUserInfo } = useAuthStore().actions;

  const onClick: MenuProps["onClick"] = async ({ key }) => {
    if (key === "logout") {
      const resp = await authService.signout();
      if (resp.code !== 0) {
        toastUtil.error(resp.message);
        return;
      }
      clearUserToken();
      clearUserInfo();
      window.location.href = "/login";
    }
    if (key === "personal-center") {
      navigate("/personal-center/my-profile");
    }
  };

  const items: MenuProps["items"] = [
    // {
    //   label: t("common.menu.personalCenter"),
    //   key: "personal-center",
    //   icon: <UserCircleIcon />,
    // },
    {
      label: t("authority.logout"),
      key: "logout",
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <Dropdown
      menu={{ items, onClick }}
      arrow={false}
      placement="bottomRight"
      trigger={["click"]}
    >
      <BasicButton
        type="text"
        {...restProps}
        className={cn(restProps.className, "rounded-full px-1")}
      >
        <Avatar src={avatar} />
      </BasicButton>
    </Dropdown>
  );
}
