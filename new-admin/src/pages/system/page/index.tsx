import { PlusOutlined } from "@ant-design/icons";
import { type ProColumns, ProTable } from "@ant-design/pro-components";
import {
  Badge,
  Button,
  ConfigProvider,
  Popconfirm,
  Space,
  Switch,
  Tooltip,
  Typography,
} from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { toastUtil } from "#src/components/toast";
import { useTranslation } from "react-i18next";
import { BasicStatus } from "#src/utils/enum";
import usePageStore, {
  useDeletePage,
  useListPage,
  useUpdatePage,
} from "#src/store/page";
import { BasicContent } from "#src/components";
import RenderIcon from "#src/components/icon/RenderIcon.js";
import { IPage } from "#src/types/page.js";
import { ModalAddPage } from "./add";
import { ModalEditPage } from "./edit";

export default function Page() {
  const { t } = useTranslation();
  const listPage = useListPage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();

  const [isShowModalAdd, setIsShowModalAdd] = useState(false);
  const [isShowModalEdit, setIsShowModalEdit] = useState(false);
  const [formValue, setFormValue] = useState<Partial<IPage>>({});
  const { pages, total, loading } = usePageStore();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total,
  });

  useEffect(() => {
    listPage({
      limit: pagination.pageSize,
      skip: pagination.current - 1,
    });
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total,
    }));
  }, [total]);

  const handleChangeStatusPage = useCallback(
    async (state: boolean, id: string) => {
      const resp = await updatePage({
        id,
        state: state ? BasicStatus.ENABLE : BasicStatus.DISABLE,
      } as any);
      if (resp && resp.code === 0) {
        listPage({
          limit: pagination.pageSize,
          skip: pagination.current - 1,
        });
        toastUtil.success(resp.message);
      }
    },
    [listPage, pagination.pageSize, pagination.current, updatePage]
  );

  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize,
    }));
  }, []);

  const handleSearch = useCallback(
    (values: Record<string, any>) => {
      listPage({
        limit: pagination.pageSize,
        skip: pagination.current - 1,
        ...values,
      });
    },
    [listPage, pagination.pageSize, pagination.current]
  );

  const handleReset = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    listPage({ limit: 10, skip: 0 });
  }, [listPage]);

  const columns: ProColumns<IPage>[] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      render: (_, record) => (
        <Typography.Text
          code={false}
          copyable={{
            text: record.id,
          }}
          underline={false}
        >
          <Tooltip title={record.id}>{`...${record.id.slice(-5)}`}</Tooltip>
        </Typography.Text>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      width: 100,
      render: (_, record) => <div>{t(record.handle.title)}</div>,
    },
    {
      title: "Đường dẫn",
      dataIndex: "path",
      width: 100,
      hideInSearch: true,
      render: (_, record) => <div>{record.path}</div>,
    },
    {
      title: "Biểu tượng",
      dataIndex: "icon",
      width: 80,
      hideInSearch: true,
      render: (_, record) => {
        return (
          <div>
            {record.handle.icon && (
              <RenderIcon
                icon={{
                  icon_name: record.handle.icon,
                  icon_type: record.handle.iconType,
                }}
                style={{ fontSize: 18 }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      width: 100,
      hideInSearch: true,
      render: (_, record) => (
        <div>
          {record.created_at
            ? dayjs.unix(record.created_at).format("YYYY-MM-DD HH:mm:ss")
            : "-"}
        </div>
      ),
    },
    {
      title: "Ngày sửa",
      dataIndex: "updated_at",
      width: 100,
      hideInSearch: true,
      render: (_, record) => (
        <div>
          {record.updated_at
            ? dayjs.unix(record.updated_at).format("YYYY-MM-DD HH:mm:ss")
            : "-"}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      width: 80,
      hideInSearch: true,
      render: (_, record) => (
        <Switch
          checked={record.state === "active"}
          onChange={(status) => handleChangeStatusPage(status, record.id)}
        />
      ),
    },
    {
      title: "Thao tác",
      width: 100,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <span
              className="ant-menu-item-icon cursor-pointer"
              onClick={() => {
                setFormValue(record);
                setIsShowModalEdit(true);
              }}
            >
              <RenderIcon
                icon={{ icon_name: "AiOutlineEdit", icon_type: "Ant" }}
                style={{ fontSize: 20, color: "blue" }}
              />
            </span>
          </Tooltip>
          <Popconfirm
            title="Đồng ý xóa quyền này?"
            onConfirm={async () => {
              const resp = await deletePage(record.id);
              if (resp && resp.code === 0) {
                listPage({
                  limit: pagination.pageSize,
                  skip: pagination.current - 1,
                });
                toastUtil.success(resp.message);
              }
            }}
            okText="Đồng ý"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <span className="ant-menu-item-icon cursor-pointer">
                <RenderIcon
                  icon={{ icon_name: "AiFillDelete", icon_type: "Ant" }}
                  style={{ fontSize: 20, color: "red" }}
                />
              </span>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <BasicContent>
      <ProTable
        rowKey="id"
        type="table"
        tableClassName="gx-table-responsive"
        headerTitle={
          <Badge count={total || 0} showZero={true}>
            <Typography.Title level={5}>Danh sách trang</Typography.Title>
          </Badge>
        }
        columns={columns}
        dataSource={pages as any}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: handleTableChange,
        }}
        onSubmit={handleSearch}
        onReset={handleReset}
        toolBarRender={() => [
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsShowModalAdd(true)}
          >
            Thêm mới
          </Button>,
        ]}
      />
      {isShowModalAdd && (
        <ModalAddPage
          isShowModal={isShowModalAdd}
          setIsShowModal={setIsShowModalAdd}
          title="Thêm mới"
          onSuccess={() => {
            setIsShowModalAdd(false);
            listPage({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
      {isShowModalEdit && (
        <ModalEditPage
          isShowModal={isShowModalEdit}
          setIsShowModal={setIsShowModalEdit}
          title="Chỉnh sửa"
          formValue={formValue}
          onSuccess={() => {
            setIsShowModalEdit(false);
            listPage({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
    </BasicContent>
  );
}
