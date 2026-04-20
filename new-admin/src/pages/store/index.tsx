import RenderIcon from "#src/components/icon/RenderIcon.js";
import { BasicContent } from "#src/components/index.js";
import { toastUtil } from "#src/components/toast/index.js";
import useStoreStore, {
  useDeleteStore,
  useListStore,
  useUpdateStore,
} from "#src/store/store.js";
import { BasicStatus, COLOR } from "#src/utils/enum.js";
import { getRandomInt } from "#src/utils/helper.js";
import { PlusOutlined } from "@ant-design/icons";
import { ProTable, type ProColumns } from "@ant-design/pro-components";
import {
  Badge,
  Button,
  Image,
  Popconfirm,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { ModalAddStore } from "./add";
import { ModalEditStore } from "./edit";
import avatarDefault from "#src/assets/images/avatar_default.jpg";
import { get } from "lodash";

export default function StorePage() {
  const listStore = useListStore();
  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();
  const [formValue, setFormValue] = useState<Partial<IStore>>({});
  const { stores, total, loading } = useStoreStore();
  const [isShowModalAdd, setIsShowModalAdd] = useState(false);
  const [isShowModalEdit, setIsShowModalEdit] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total,
  });

  useEffect(() => {
    listStore({
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

  const handleChangeStatusStore = useCallback(
    async (state: boolean, id: string) => {
      const resp = await updateStore({
        id,
        state: state ? BasicStatus.ENABLE : BasicStatus.DISABLE,
      } as any);
      if (resp && resp.code === 0) {
        listStore({
          limit: pagination.pageSize,
          skip: pagination.current - 1,
        });
        toastUtil.success(resp.message);
      }
    },
    [listStore, pagination.pageSize, pagination.current, updateStore]
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
      listStore({
        limit: pagination.pageSize,
        skip: pagination.current - 1,
        ...values,
      });
    },
    [listStore, pagination.pageSize, pagination.current]
  );

  const handleReset = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    listStore({ limit: 10, skip: 0 });
  }, [listStore]);

  const columns: ProColumns<IStore>[] = [
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
      title: "Logo",
      dataIndex: "logo",
      width: 80,
      hideInSearch: true,
      render: (_, record) => (
        <Image
          src={record.logo || avatarDefault}
          alt="avatar"
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ),
    },
    {
      title: "Tên cửa hàng",
      dataIndex: "name",
      width: 80,
      render: (_, record) => <div>{record.name}</div>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      width: 100,
    },
    {
      title: "Đối tác",
      width: 100,
      ellipsis: {
        showTitle: true,
      },
      dataIndex: "partner_id",
      render: (val, record) => {
        const partnerName = get(record, "partner.name", "-");
        let id = get(record, "partner.id", "");
        return (
          <Typography.Paragraph
            code={false}
            copyable={false}
            underline={false}
            ellipsis={false}
          >
            <Tooltip title={partnerName}>{partnerName}</Tooltip>
            <Typography.Paragraph
              copyable={{ tooltips: false, text: id }}
              style={{ fontSize: "13px", color: "#6c757d" }}
            >
              {"..." + (id || "").slice(-5)}
            </Typography.Paragraph>
          </Typography.Paragraph>
        );
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
          onChange={(status) => handleChangeStatusStore(status, record.id)}
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
            title="Đồng ý xóa cửa hàng này?"
            onConfirm={async () => {
              const resp = await deleteStore(record.id);
              if (resp && resp.code === 0) {
                listStore({
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
            <Typography.Title level={5}>Danh sách cửa hàng</Typography.Title>
          </Badge>
        }
        columns={columns}
        dataSource={stores as any}
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
        <ModalAddStore
          isShowModal={isShowModalAdd}
          setIsShowModal={setIsShowModalAdd}
          onSuccess={() => {
            listStore({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
      {isShowModalEdit && (
        <ModalEditStore
          isShowModal={isShowModalEdit}
          setIsShowModal={setIsShowModalEdit}
          formValue={formValue}
          onSuccess={() => {
            listStore({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
    </BasicContent>
  );
}
