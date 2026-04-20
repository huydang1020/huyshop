import RenderIcon from "#src/components/icon/RenderIcon.js";
import { BasicContent } from "#src/components/index.js";
import { toastUtil } from "#src/components/toast/index.js";
import useStoreStore, {
  useDeleteStore,
  useListStore,
  useUpdateStore,
} from "#src/store/store.js";
import { BasicStatus, COLOR, VoucherType } from "#src/utils/enum.js";
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
import avatarDefault from "#src/assets/images/avatar_default.jpg";
import { get } from "lodash";
import useVoucherStore, {
  useDeleteVoucher,
  useListVoucher,
  useUpdateVoucher,
} from "#src/store/voucher.js";
import { ModalAddVoucher } from "./add";
import { ModalEditVoucher } from "./edit";

export default function VoucherPage() {
  const listVoucher = useListVoucher();
  const updateVoucher = useUpdateVoucher();
  const deleteVoucher = useDeleteVoucher();
  const [formValue, setFormValue] = useState<Partial<IVoucher>>({});
  const { vouchers, total, loading } = useVoucherStore();
  const [isShowModalAdd, setIsShowModalAdd] = useState(false);
  const [isShowModalEdit, setIsShowModalEdit] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total,
  });

  useEffect(() => {
    listVoucher({
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

  const handleChangeStatusVoucher = useCallback(
    async (state: boolean, id: string) => {
      const resp = await updateVoucher({
        id,
        state: state ? BasicStatus.ENABLE : BasicStatus.DISABLE,
      } as any);
      if (resp && resp.code === 0) {
        listVoucher({
          limit: pagination.pageSize,
          skip: pagination.current - 1,
        });
        toastUtil.success(resp.message);
      }
    },
    [listVoucher, pagination.pageSize, pagination.current, updateVoucher]
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
      listVoucher({
        limit: pagination.pageSize,
        skip: pagination.current - 1,
        ...values,
      });
    },
    [listVoucher, pagination.pageSize, pagination.current]
  );

  const handleReset = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    listVoucher({ limit: 10, skip: 0 });
  }, [listVoucher]);

  const columns: ProColumns<IVoucher>[] = [
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
      title: "Ảnh",
      dataIndex: "image",
      width: 80,
      hideInSearch: true,
      render: (_, record) => (
        <Image
          src={record.image || avatarDefault}
          alt="avatar"
          style={{
            width: 85,
            height: 45,
            objectFit: "cover",
          }}
        />
      ),
    },
    {
      title: "Tên ưu đãi",
      dataIndex: "name",
      width: 120,
      render: (_, record) => <div>{record.name}</div>,
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
      title: "Loại ưu đãi",
      dataIndex: "type",
      width: 100,
      valueType: "select",
      valueEnum: Object.values(VoucherType).reduce((acc, type) => {
        acc[type.value] = type.text;
        return acc;
      }, {} as Record<string, string>),
      render: (_, record) => {
        return (
          <div>{VoucherType[record.type as keyof typeof VoucherType].text}</div>
        );
      },
    },
    {
      title: "Tổng số lượng",
      dataIndex: "total_quantity",
      width: 100,
      hideInSearch: true,
      render: (_, record) => {
        return <div>{record.total_quantity}</div>;
      },
    },
    {
      title: "Số lượng còn lại",
      dataIndex: "remaining_quantity",
      width: 100,
      hideInSearch: true,
      render: (_, record) => {
        return <div>{record.remaining_quantity || 0}</div>;
      },
    },

    {
      title: "Ngày bắt đầu",
      dataIndex: "start_at",
      hideInSearch: true,
      width: 100,
      render: (_, record) => (
        <div>
          {record.start_at
            ? dayjs.unix(record.start_at).format("YYYY-MM-DD HH:mm:ss")
            : "-"}
        </div>
      ),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "end_at",
      hideInSearch: true,
      width: 100,
      render: (_, record) => (
        <div>
          {record.end_at
            ? dayjs.unix(record.end_at).format("YYYY-MM-DD HH:mm:ss")
            : "-"}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      align: "center",
      width: 80,
      hideInSearch: true,
      render: (_, record) => (
        <Switch
          checked={record.state === BasicStatus.ENABLE}
          onChange={(status) => handleChangeStatusVoucher(status, record.id)}
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
            title="Đồng ý xóa ưu đãi này?"
            onConfirm={async () => {
              const resp = await deleteVoucher(record.id);
              if (resp && resp.code === 0) {
                listVoucher({
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
            <Typography.Title level={5}>Danh sách ưu đãi</Typography.Title>
          </Badge>
        }
        columns={columns}
        dataSource={vouchers as any}
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
        <ModalAddVoucher
          isShowModal={isShowModalAdd}
          setIsShowModal={setIsShowModalAdd}
          onSuccess={() => {
            listVoucher({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
      {isShowModalEdit && (
        <ModalEditVoucher
          isShowModal={isShowModalEdit}
          setIsShowModal={setIsShowModalEdit}
          formValue={formValue}
          onSuccess={() => {
            listVoucher({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
    </BasicContent>
  );
}
