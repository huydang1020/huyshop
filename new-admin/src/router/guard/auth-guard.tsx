import { useCurrentRoute } from "#src/hooks";
import { hideLoading, setupLoading } from "#src/plugins";
import {
  exception403Path,
  exception404Path,
  exception500Path,
  loginPath,
} from "#src/router/extra-info";
import { whiteRouteNames } from "#src/router/routes";
import { isSendRoutingRequest } from "#src/router/routes/config";
import { generateRoutesFromBackend } from "#src/router/utils";
import { useAccessStore, usePreferencesStore } from "#src/store";

import { useEffect } from "react";
import {
  matchRoutes,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";

import { getUserPage } from "#src/services/auth.js";
import { getUserInfo, useUserInfo, useUserToken } from "#src/store/auth.js";
import { removeDuplicateRoutes } from "./utils";

const noLoginWhiteList = Array.from(whiteRouteNames).filter(
  (item) => item !== loginPath
);

interface AuthGuardProps {
  children?: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentRoute = useCurrentRoute();
  const { pathname, search } = useLocation();
  const isLogin = Boolean(useUserToken().accessToken);
  const isAuthorized = Boolean(useUserInfo().id);
  const userRole = useUserInfo().role_id;
  const userInfo = getUserInfo();
  const { setAccessStore, isAccessChecked, routeList } = useAccessStore();
  const { enableBackendAccess } = usePreferencesStore((state) => state);

  const isPathInNoLoginWhiteList = noLoginWhiteList.includes(pathname);

  useEffect(() => {
    async function fetchUserInfoAndRoutes() {
      setupLoading();
      const promises = [];
      promises.push(userInfo());
      if (enableBackendAccess && isSendRoutingRequest) {
        promises.push(getUserPage());
      }
      const results = await Promise.allSettled(promises);
      const [userInfoResult, routeResult] = results;

      const routes = [];
      if (
        enableBackendAccess &&
        !isSendRoutingRequest &&
        userInfoResult.status === "fulfilled" &&
        "menus" in userInfoResult.value
      ) {
        routes.push(
          ...(await generateRoutesFromBackend(
            userInfoResult.value?.menus ?? []
          ))
        );
      }
      if (
        enableBackendAccess &&
        isSendRoutingRequest &&
        routeResult.status === "fulfilled" &&
        "data" in routeResult.value
      ) {
        routes.push(
          ...(await generateRoutesFromBackend(
            (routeResult.value?.data.pages as any) ?? []
          ))
        );
      }
      const uniqueRoutes = removeDuplicateRoutes(routes);
      setAccessStore(uniqueRoutes);

      const hasError = results.some((result) => result.status === "rejected");
      if (hasError) {
        const unAuthorized = results.some(
          (result: any) => result.reason.response.status === 401
        );
        if (!unAuthorized) {
          return navigate(exception500Path);
        }
      }
      navigate(`${pathname}${search}`, {
        replace: true,
        flushSync: true,
      });
    }
    if (!whiteRouteNames.includes(pathname) && isLogin && !isAuthorized) {
      fetchUserInfoAndRoutes();
    }
  }, [pathname, isLogin, isAuthorized]);

  if (isPathInNoLoginWhiteList) {
    hideLoading();
    return children;
  }

  if (!isLogin) {
    hideLoading();
    if (pathname !== loginPath) {
      // const redirectPath =
      //   pathname.length > 1
      //     ? `${loginPath}?redirect=${pathname}${search}`
      //     : loginPath;
      // return <Navigate to={redirectPath} replace />;
      return <Navigate to={loginPath} replace />;
    } else {
      return children;
    }
  }
  if (pathname === loginPath) {
    // const redirectPath = searchParams.get("redirect");
    // if (redirectPath?.length && redirectPath !== pathname) {
    //   return <Navigate to={redirectPath} replace />;
    // }
    return <Navigate to={import.meta.env.VITE_BASE_HOME_PATH} replace />;
  }
  if (!isAuthorized) {
    return null;
  }

  if (!isAccessChecked) {
    return null;
  }

  hideLoading();

  if (pathname === "/") {
    return <Navigate to={import.meta.env.VITE_BASE_HOME_PATH} replace />;
  }

  const routeRoles = currentRoute?.handle?.roles;
  const ignoreAccess = currentRoute?.handle?.ignoreAccess;

  if (ignoreAccess === true) {
    return children;
  }

  const matches = matchRoutes(routeList, pathname) ?? [];

  const hasChildren = matches[matches.length - 1]?.route?.children?.filter(
    (item) => !item.index
  )?.length;

  if (hasChildren && hasChildren > 0) {
    return <Navigate to={exception404Path} replace />;
  }

  const hasRoutePermission = routeRoles?.includes(userRole);

  if (routeRoles && routeRoles.length && !hasRoutePermission) {
    return <Navigate to={exception403Path} replace />;
  }

  return children;
}
