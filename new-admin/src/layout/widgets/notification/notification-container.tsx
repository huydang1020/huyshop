import type { ButtonProps } from "antd";
import type { NotificationItem } from "./types";

import { useEffect, useState } from "react";
import { NotificationPopup } from "./index";

export function NotificationContainer({ ...restProps }: ButtonProps) {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);

	return <NotificationPopup notifications={notifications} {...restProps} />;
}
