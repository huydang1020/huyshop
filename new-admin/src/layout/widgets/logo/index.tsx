import { Typography } from "antd";
import { clsx } from "clsx";
import { useNavigate } from "react-router";

import { headerHeight } from "../../constants";

export interface LogoProps {
  sidebarCollapsed: boolean;
  className?: string;
}

/**
 * @zh 高度 48px
 * @en The height is 48px
 */
export function Logo({ sidebarCollapsed, className }: LogoProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{ height: headerHeight }}
      className={clsx(
        "flex items-center justify-center gap-2 cursor-pointer",
        className
      )}
      onClick={() => navigate(import.meta.env.VITE_BASE_HOME_PATH)}
    >
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <span className="text-white font-bold text-lg">H</span>
      </div>
      <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {import.meta.env.VITE_GLOB_APP_TITLE}
        <sup className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          VN
        </sup>
      </span>
    </div>
  );
}
