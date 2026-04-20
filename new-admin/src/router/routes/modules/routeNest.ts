import type { AppRouteRecordRaw } from "#src/router/types";
import { ContainerLayout, ParentLayout } from "#src/layout";

import { $t } from "#src/locales";

import { routeNest } from "#src/router/extra-info";
import {
	NodeExpandOutlined,
	SisternodeOutlined,
	SubnodeOutlined,
} from "@ant-design/icons";
import { createElement, lazy } from "react";

const routes: AppRouteRecordRaw[] = [
	{
		path: "/route-nest",
		Component: ContainerLayout,
		handle: {
			order: routeNest,
			title: $t("common.menu.nestMenus"),
			icon: createElement(NodeExpandOutlined),
		},
	},
];

export default routes;
