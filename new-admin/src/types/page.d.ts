import { TypeIconWidget } from "#src/components/icon/IconWidget.ts";

interface IPage {
  id: string;
  path: string;
  handle: IPageHandle;
  parentId: string;
  state: string;
  created_at: number;
  updated_at: number;
  role_actions: IPageRoleAction[];
}

interface IPageHandle {
  icon: string;
  iconType: TypeIconWidget;
  title: string;
  order: number;
  keepAlive: boolean;
  hideInMenu: boolean;
}

interface IPageRoleAction {
  role_id: string;
  role?: IPageRole;
  actions: string[];
}

interface IPageRole {
  id: string;
  name: string;
  description: string;
  state: string;
}

interface IPageRequest {
  limit?: number;
  skip?: number;
}

interface IPageResponse {
  pages: IPage[];
  total: number;
}

interface IIcon {
  icon_name: string;
  icon_type: TypeIconWidget;
}
