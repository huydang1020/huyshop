import type { AppRouteRecordRaw } from "#src/router/types";

import { ContainerLayout } from "#src/layout";
import { $t } from "#src/locales";
import { access } from "#src/router/extra-info";
import { accessControlCodes } from "#src/hooks/use-access/constants";

import { lazy } from "react";

const routes: AppRouteRecordRaw[] = [
	{
		path: "/access",
		Component: ContainerLayout,
		handle: {
			icon: "SafetyOutlined",
			title: $t("common.menu.access"),
			order: access,
		},
	},
];

export default routes;
