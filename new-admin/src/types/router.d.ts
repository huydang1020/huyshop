import type { RouteMeta } from "#src/router/types";
import type { UIMatch } from "react-router";

import "react-router";

/**
 * Matches the given routes to a location and returns the match data.
 *
 * @see https://reactrouter.com/utils/match-routes
 */

declare module "react-router" {
	function useMatches(): UIMatch<unknown, RouteMeta>[];
}

import type { ReactNode } from "react";
import type { Params, RouteObject } from "react-router";

interface IRouteMeta {
	/**
	 * antd menu selectedKeys
	 */
	key: string;
	/**
	 * menu label, i18n
	 */
	label: string;
	/**
	 * menu prefix icon
	 */
	icon?: ReactNode;
	/**
	 * menu suffix icon
	 */
	suffix?: ReactNode;
	/**
	 * hide in menu
	 */
	hideMenu?: boolean;
	/**
	 * hide in multi tab
	 */
	hideTab?: boolean;
	/**
	 * disable in menu
	 */
	disabled?: boolean;
	/**
	 * react router outlet
	 */
	outlet?: ReactNode;
	/**
	 * use to refresh tab
	 */
	timeStamp?: string;
	/**
	 * external link and iframe need
	 */
	frameSrc?: URL;
	/**
	 * dynamic route params
	 *
	 * @example /user/:id
	 */
	params?: Params<string>;
}

type IAppRouteObject = {
	order?: number;
	meta?: RouteMeta;
	children?: IAppRouteObject[];
} & Omit<RouteObject, "children">;
