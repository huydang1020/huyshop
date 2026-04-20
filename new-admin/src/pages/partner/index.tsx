import RenderIcon from "#src/components/icon/RenderIcon.js";
import { toastUtil } from "#src/components/toast/index.js";
import useUserStore, {
  useDeleteUser,
  useListUser,
  useUpdateUser,
} from "#src/store/user.js";
import { IUser } from "#src/types/user.js";
import { BasicStatus, COLOR } from "#src/utils/enum.js";
import { getRandomInt } from "#src/utils/helper.js";
import { PlusOutlined } from "@ant-design/icons";
import { ProTable, type ProColumns } from "@ant-design/pro-components";
import {
  Badge,
  Button,
  Card,
  ConfigProvider,
  Image,
  Popconfirm,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import avatarDefault from "#src/assets/images/avatar_default.jpg";
import { BasicContent } from "#src/components/index.js";
import usePartnerStore, {
  useDeletePartner,
  useListPartner,
  useUpdatePartner,
} from "#src/store/partner.js";
import { ModalAddPartner } from "./add";
import { ModalEditPartner } from "./edit";

export default function PartnerPage() {
  const listPartner = useListPartner();
  const updatePartner = useUpdatePartner();
  const deletePartner = useDeletePartner();
  const [formValue, setFormValue] = useState<Partial<IPartner>>({});
  const { partners, total, loading } = usePartnerStore();
  const [isShowModalAdd, setIsShowModalAdd] = useState(false);
  const [isShowModalEdit, setIsShowModalEdit] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total,
  });

  useEffect(() => {
    listPartner({
      type: "seller",
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

  const handleChangeStatusPartner = useCallback(
    async (state: boolean, id: string) => {
      const resp = await updatePartner({
        id,
        state: state ? BasicStatus.ENABLE : BasicStatus.DISABLE,
      } as any);
      if (resp && resp.code === 0) {
        listPartner({
          type: "seller",
          limit: pagination.pageSize,
          skip: pagination.current - 1,
        });
        toastUtil.success(resp.message);
      }
    },
    [listPartner, pagination.pageSize, pagination.current, updatePartner]
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
      listPartner({
        type: "seller",
        limit: pagination.pageSize,
        skip: pagination.current - 1,
        ...values,
      });
    },
    [listPartner, pagination.pageSize, pagination.current]
  );

  const handleReset = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    listPartner({ type: "seller", limit: 10, skip: 0 });
  }, [listPartner]);

  const columns: ProColumns<IPartner>[] = [
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
      title: "Tên đối tác",
      dataIndex: "name",
      width: 80,
      render: (_, record) => <div>{record.name}</div>,
    },
    {
      title: "Loại đối tác",
      dataIndex: "type",
      width: 120,
      render: (_, record) => {
        const color = COLOR[getRandomInt(0, 10)];
        return <Tag color={color}>{record.type}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      hideInSearch: true,
      width: 100,
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
      hideInSearch: true,
      width: 100,
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
          checked={record.state === BasicStatus.ENABLE}
          onChange={(status) => handleChangeStatusPartner(status, record.id)}
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
            title="Đồng ý xóa đối tác này?"
            onConfirm={async () => {
              const resp = await deletePartner(record.id);
              if (resp && resp.code === 0) {
                listPartner({
                  type: "seller",
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
            <Typography.Title level={5}>Danh sách đối tác</Typography.Title>
          </Badge>
        }
        columns={columns}
        dataSource={partners as any}
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
        <ModalAddPartner
          isShowModal={isShowModalAdd}
          setIsShowModal={setIsShowModalAdd}
          onSuccess={() => {
            listPartner({
              type: "seller",
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
      {isShowModalEdit && (
        <ModalEditPartner
          isShowModal={isShowModalEdit}
          setIsShowModal={setIsShowModalEdit}
          formValue={formValue}
          onSuccess={() => {
            listPartner({
              type: "seller",
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
    </BasicContent>
  );
}
