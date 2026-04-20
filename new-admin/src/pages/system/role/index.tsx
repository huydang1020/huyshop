import RenderIcon from "#src/components/icon/RenderIcon";
import { BasicContent } from "#src/components";
import useRoleStore, {
  useDeleteRole,
  useListRole,
  useUpdateRole,
} from "#src/store/role";
import { BasicStatus } from "#src/utils/enum";
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
import { ModalAddRole } from "./add";
import { ModalEditRole } from "./edit";
import { toastUtil } from "#src/components/toast";

export default function RolePage() {
  const listRole = useListRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [isShowModalAdd, setIsShowModalAdd] = useState(false);
  const [isShowModalEdit, setIsShowModalEdit] = useState(false);
  const [formValue, setFormValue] = useState<Partial<IRole>>({});
  const { roles, total, loading } = useRoleStore();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total,
  });

  useEffect(() => {
    listRole({
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

  const handleChangeStatusRole = useCallback(
    async (state: boolean, id: string) => {
      const resp = await updateRole({
        id,
        state: state ? BasicStatus.ENABLE : BasicStatus.DISABLE,
      } as any);
      if (resp && resp.code === 0) {
        listRole({
          limit: pagination.pageSize,
          skip: pagination.current - 1,
        });
        toastUtil.success(resp.message);
      }
    },
    [listRole, pagination.pageSize, pagination.current, updateRole]
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
      listRole({
        limit: pagination.pageSize,
        skip: pagination.current - 1,
        ...values,
      });
    },
    [listRole, pagination.pageSize, pagination.current]
  );

  const handleReset = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    listRole({ limit: 10, skip: 0 });
  }, [listRole]);

  const columns: ProColumns<any>[] = [
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
      title: "Tên quyền hạn",
      dataIndex: "name",
      width: 100,
      render: (_, record) => <div>{record.name}</div>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 120,
      hideInSearch: true,
      render: (_, record) => <div>{record.description}</div>,
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
          onChange={(status) => handleChangeStatusRole(status, record.id)}
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
              const resp = await deleteRole(record.id);
              if (resp && resp.code === 0) {
                listRole({
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
            <Typography.Title level={5}>Danh sách quyền hạn</Typography.Title>
          </Badge>
        }
        columns={columns}
        dataSource={roles as any}
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
        <ModalAddRole
          isShowModal={isShowModalAdd}
          setIsShowModal={setIsShowModalAdd}
          title="Thêm mới"
          onSuccess={() => {
            setIsShowModalAdd(false);
            listRole({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
      {isShowModalEdit && (
        <ModalEditRole
          isShowModal={isShowModalEdit}
          setIsShowModal={setIsShowModalEdit}
          title="Chỉnh sửa"
          formValue={formValue}
          onSuccess={() => {
            setIsShowModalEdit(false);
            listRole({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
    </BasicContent>
  );
}
