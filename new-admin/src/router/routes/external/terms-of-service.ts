import type { AppRouteRecordRaw } from "#src/router/types";
import { $t } from "#src/locales";

import { lazy } from "react";
import { Outlet } from "react-router";

const routes: AppRouteRecordRaw[] = [
	{
		path: "/terms-of-service",
		Component: Outlet,
		handle: {
			hideInMenu: true,
			title: $t("authority.termsOfService"),
		},
	},
];

export default routes;
