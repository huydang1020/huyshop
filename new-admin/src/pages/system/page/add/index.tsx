// Removed unused imports: MinusCircleOutlined, PlusOutlined
import IconPicker from "#src/components/icon/IconPicker.js";
import RenderIcon from "#src/components/icon/RenderIcon.js";
import { toastUtil } from "#src/components/toast";
import usePageStore, { useCreatePage, useListPage } from "#src/store/page.js";
import { IIcon, IPage } from "#src/types/page.js";
import { HideInMenu } from "#src/utils/enum.js";
import {
  AutoComplete,
  Button,
  Col,
  Form,
  type FormProps,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  TreeSelect,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import * as RoleService from "#src/services/role";
import * as AuthService from "#src/services/auth";

export type ModalAddPageProps = {
  title: string;
  isShowModal: boolean;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

// Constants
const ENTRY_PATH = "/src/pages";
const PAGES = import.meta.glob("/src/pages/**/*.tsx");
const PAGE_SELECT_OPTIONS = Object.entries(PAGES).map(([path]) => {
  const pagePath = path.replace(ENTRY_PATH, "");
  // Giữ nguyên .tsx để phân biệt các loại file
  const cleanPath = pagePath.replace(".tsx", "");
  return {
    label: cleanPath,
    value: cleanPath,
  };
});

// Interface cho tree node
interface TreeNode {
  title: string;
  value: string;
  path: string;
  key: string;
  children?: TreeNode[];
}

// Tạo cấu trúc tree cho menu cha từ pages data
const createTreeDataFromPages = (pages: IPage[]): TreeNode[] => {
  const treeData: TreeNode[] = [];

  // Tạo map để theo dõi các node đã tạo
  const nodeMap = new Map<string, TreeNode>();

  // Sắp xếp pages theo order và path để đảm bảo thứ tự đúng
  const sortedPages = [...pages].sort((a, b) => {
    if (a.handle?.order !== b.handle?.order) {
      return (a.handle?.order || 0) - (b.handle?.order || 0);
    }
    return (a.path || "").localeCompare(b.path || "");
  });

  sortedPages.forEach((page) => {
    if (!page.path) return;

    const node: TreeNode = {
      title: page.path, // Hiển thị thẳng path
      value: page.id,
      path: page.path,
      key: page.id,
      children: [],
    };

    nodeMap.set(page.id, node);

    // Nếu có parentId, thêm vào children của parent
    if (page.parentId && nodeMap.has(page.parentId)) {
      nodeMap.get(page.parentId)!.children!.push(node);
    } else {
      // Nếu không có parent hoặc parent chưa tồn tại, thêm vào root
      treeData.push(node);
    }
  });

  // Loại bỏ children array rỗng để TreeSelect render đúng
  const cleanTreeData = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map((node) => ({
      ...node,
      children:
        node.children && node.children.length > 0
          ? cleanTreeData(node.children)
          : undefined,
    }));
  };

  return cleanTreeData(treeData);
};

export function ModalAddPage(props: ModalAddPageProps) {
  const { title, isShowModal, setIsShowModal, onSuccess } = props;
  const [form] = Form.useForm<IPage>();
  const createPage = useCreatePage();
  const listPage = useListPage();
  const { pages } = usePageStore();
  const [roles, setRoles] = useState<IRole[]>([]);
  const [isFetchRoles, setIsFetchRoles] = useState(false);
  const [visibleIcons, setVisibleIcons] = useState(false);
  const [icon, setIcon] = useState<IIcon>({} as IIcon);
  const [compOptions, setCompOptions] = useState(PAGE_SELECT_OPTIONS);
  console.log("🚀 ~ ModalAddPage ~ compOptions:", compOptions);
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const updateCompOptions = useCallback((parentPath: string) => {
    if (!parentPath) {
      // Nếu không chọn menu cha, hiển thị tất cả
      setCompOptions(PAGE_SELECT_OPTIONS);
      return;
    }

    // Filter chỉ hiển thị các file con thuộc folder của menu cha
    setCompOptions(
      PAGE_SELECT_OPTIONS.filter(
        (option) =>
          option.value.startsWith(parentPath + "/") &&
          option.value !== parentPath // Loại bỏ chính file menu cha
      )
    );
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      const resp = await RoleService.getListRole({});
      if (resp.data.roles) {
        setIsFetchRoles(true);
        setRoles(resp.data.roles);
      }
    };
    if (isShowModal && !isFetchRoles) {
      fetchRoles();
    }
    listPage();
  }, [isShowModal, isFetchRoles]);

  const onFinish: FormProps<any>["onFinish"] = async (values) => {
    console.log("🚀 ~ constonFinish:FormProps<any= ~  values:", values);
    try {
      // Xử lý path: bỏ đuôi "/index" nếu có
      let processedPath = values.path;
      if (processedPath && processedPath.endsWith("/index")) {
        processedPath = processedPath.replace("/index", "");
      }

      const data: IPage = {
        ...values,
        path: processedPath, // Sử dụng path đã xử lý
        role_actions: values.role_actions,
        handle: {
          icon: icon.icon_name,
          iconType: icon.icon_type,
          title: values.title,
          order: values.order,
          keepAlive: true,
          hideInMenu: values.hideMenu,
        },
      };
      setIsLoadingBtn(true);
      const resp = await createPage(data);
      if (resp && resp.code !== 0) {
        toastUtil.error(resp.message);
        return;
      }
      toastUtil.success(resp?.message);
      setIcon({} as IIcon);
      form.resetFields();
      onSuccess?.();
      setIsShowModal(false);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoadingBtn(false);
    }
  };

  const onFinishFailed: FormProps<IPage>["onFinishFailed"] = (errorInfo) => {
    console.error("Failed:", errorInfo);
  };

  const onCancel = () => {
    form.resetFields();
    setIsShowModal(false);
  };

  return (
    <Modal
      forceRender
      width="50vw"
      title={title}
      open={isShowModal}
      footer={null}
      onCancel={onCancel}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{
          hideInMenu: HideInMenu.SHOW,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Hiển thị trên menu" name="hideInMenu">
              <Radio.Group>
                <Radio value={HideInMenu.SHOW}>Hiển thị</Radio>
                <Radio value={HideInMenu.HIDE}>Ẩn</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Biểu tượng" name="icon">
              <Space>
                <RenderIcon icon={icon} style={{ fontSize: 28 }} />
                <Button onClick={() => setVisibleIcons(true)}>
                  Chọn biểu tượng
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tiêu đề"
              name="title"
              rules={[{ required: true, message: "Hãy nhập tiêu đề!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Thứ tự hiển thị" name="order">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Menu cha" name="parentId">
              <TreeSelect
                fieldNames={{
                  label: "title",
                  value: "value",
                }}
                allowClear
                treeData={createTreeDataFromPages(
                  pages?.filter((page): page is IPage => page !== undefined) ||
                    []
                )}
                onChange={(value) => {
                  if (!value) {
                    // Nếu clear selection, reset về tất cả options
                    updateCompOptions("");
                    return;
                  }

                  // Tìm page tương ứng với value (page.id) đã chọn
                  const selectedPage = pages?.find(
                    (page) => page?.id === value
                  );
                  if (selectedPage?.path) {
                    updateCompOptions(selectedPage.path);
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Đường dẫn tới file"
              name="path"
              rules={[
                {
                  required: true,
                  message: "Hãy chọn đường dẫn tới file!",
                },
              ]}
            >
              <AutoComplete
                allowClear
                options={compOptions}
                filterOption={(input, option) =>
                  (option?.label || "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Phân quyền"
          name="role_ids"
          rules={[{ required: true, message: "Hãy chọn quyền hạn" }]}
        >
          <Select
            mode="multiple"
            showSearch
            allowClear
            placeholder="Chọn các quyền hạn cho trang này"
            optionFilterProp="label"
            options={roles.map((role) => ({
              value: role.id,
              label: role.name,
            }))}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={isLoadingBtn}>
              Xác nhận
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <IconPicker
        title="Chọn biểu tượng"
        visible={visibleIcons}
        setVisible={setVisibleIcons}
        onChange={(iconIdentity, iconName) => {
          setIcon({ icon_name: iconName, icon_type: iconIdentity });
          setVisibleIcons(false);
        }}
      />
    </Modal>
  );
}
