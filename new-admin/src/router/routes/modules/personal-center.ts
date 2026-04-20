import type { AppRouteRecordRaw } from "#src/router/types";
import { ProfileIcon, UserCircleIcon, UserSettingsIcon } from "#src/icons";
import { ContainerLayout } from "#src/layout";
import { $t } from "#src/locales";
import { personalCenter } from "#src/router/extra-info";

import { createElement, lazy } from "react";

const routes: AppRouteRecordRaw[] = [
	{
		path: "/personal-center",
		Component: ContainerLayout,
		handle: {
			order: personalCenter,
			title: $t("common.menu.personalCenter"),
			icon: createElement(UserCircleIcon),
		},
	},
];

export default routes;
