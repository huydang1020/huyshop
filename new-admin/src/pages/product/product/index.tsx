import RenderIcon from "#src/components/icon/RenderIcon.js";
import { BasicContent } from "#src/components/index.js";
import { toastUtil } from "#src/components/toast/index.js";
import useProductStore, {
  useDeleteProductType,
  useListProductType,
  useUpdateProductType,
  useUpdateStateProductType,
} from "#src/store/product.js";
import {
  BasicStatus,
  COLOR,
  PartnerType,
  ProductTypeStatus,
} from "#src/utils/enum.js";
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
import { ModalAddProductType } from "./add";
import { ModalEditProductType } from "./edit";
import { get } from "lodash";
import { getRandomInt } from "#src/utils/helper.js";
import useAuthStore from "#src/store/auth.js";

export default function ProductPage() {
  const { userInfo } = useAuthStore();
  const listProductType = useListProductType();
  const updateProductType = useUpdateProductType();
  const updateStateProductType = useUpdateStateProductType();
  const deleteProductType = useDeleteProductType();
  const [formValue, setFormValue] = useState<Partial<IProductType>>({});
  const { productTypes, total, loading } = useProductStore();
  const [isShowModalAdd, setIsShowModalAdd] = useState(false);
  const [isShowModalEdit, setIsShowModalEdit] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total,
  });

  useEffect(() => {
    listProductType({
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

  const handleChangeStatusProductType = useCallback(
    async (state: boolean, id: string) => {
      const resp = await updateStateProductType(
        id,
        state ? BasicStatus.ENABLE : BasicStatus.DISABLE
      );
      if (resp && resp.code === 0) {
        listProductType({
          limit: pagination.pageSize,
          skip: pagination.current - 1,
        });
        toastUtil.success(resp.message);
      }
    },
    [
      listProductType,
      pagination.pageSize,
      pagination.current,
      updateStateProductType,
    ]
  );

  const handleApproveProductType = useCallback(
    async (id: string) => {
      const resp = await updateStateProductType(id, BasicStatus.ENABLE);
      if (resp && resp.code === 0) {
        listProductType({
          limit: pagination.pageSize,
          skip: pagination.current - 1,
        });
        toastUtil.success(resp.message);
      }
    },
    [
      listProductType,
      pagination.pageSize,
      pagination.current,
      updateStateProductType,
    ]
  );

  const handleRejectProductType = useCallback(
    async (id: string) => {
      const resp = await updateStateProductType(id, BasicStatus.REJECT);
      if (resp && resp.code === 0) {
        listProductType({
          limit: pagination.pageSize,
          skip: pagination.current - 1,
        });
        toastUtil.success(resp.message);
      }
    },
    [
      listProductType,
      pagination.pageSize,
      pagination.current,
      updateStateProductType,
    ]
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
      listProductType({
        limit: pagination.pageSize,
        skip: pagination.current - 1,
        ...values,
      });
    },
    [listProductType, pagination.pageSize, pagination.current]
  );

  const handleReset = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    listProductType({ limit: 10, skip: 0 });
  }, [listProductType]);

  const columns: ProColumns<IProductType>[] = [
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
      title: "Ảnh sản phẩm",
      dataIndex: "images",
      width: 80,
      hideInSearch: true,
      render: (_, record) => (
        <Image
          src={record.products[0].image || ""}
          alt="avatar"
          style={{
            width: 60,
            height: 60,
            objectFit: "cover",
          }}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      width: 120,
      render: (_, record) => (
        <div className="truncate">
          <Tooltip title={record.name} placement="topLeft">
            {record.name}
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category_id",
      width: 120,
      hideInSearch: true,
      render: (_, record) => {
        const color = COLOR[getRandomInt(0, 10)];
        return <Tag color={color}>{record.category?.name}</Tag>;
      },
    },
    {
      title: "Đối tác",
      width: 100,
      ellipsis: {
        showTitle: true,
      },
      hideInSearch: true,
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
      title: "Số lượng đã bán",
      dataIndex: "quantity_sold",
      width: 80,
      hideInSearch: true,
      render: (_, record) => <div>{record.quantity_sold || 0}</div>,
    },
    {
      title: "Số lượt xem",
      dataIndex: "views",
      width: 80,
      hideInSearch: true,
      render: (_, record) => <div>{record.views || 0}</div>,
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
      render: (_, record) => {
        if (record.state === BasicStatus.PENDING) {
          return <Tag color="orange">Chờ duyệt</Tag>;
        }
        if (record.state === BasicStatus.REJECT) {
          return <Tag color="red">Từ chối</Tag>;
        }
        return (
          <Switch
            checked={record.state === BasicStatus.ENABLE}
            onChange={(checked) =>
              handleChangeStatusProductType(checked, record.id)
            }
          />
        );
      },
    },
    {
      title: "Thao tác",
      width: 100,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          {userInfo?.partner?.type === PartnerType.ADMIN &&
            record.state === BasicStatus.PENDING && (
              <>
                <Tooltip title="Duyệt sản phẩm">
                  <span
                    className="ant-menu-item-icon cursor-pointer"
                    onClick={() => {
                      handleApproveProductType(record.id);
                    }}
                  >
                    <RenderIcon
                      icon={{ icon_name: "AiOutlineCheck", icon_type: "Ant" }}
                      style={{ fontSize: 20, color: "green" }}
                    />
                  </span>
                </Tooltip>

                <Tooltip title="Từ chối sản phẩm">
                  <span
                    className="ant-menu-item-icon cursor-pointer"
                    onClick={() => {
                      handleRejectProductType(record.id);
                    }}
                  >
                    <RenderIcon
                      icon={{ icon_name: "AiOutlineClose", icon_type: "Ant" }}
                      style={{ fontSize: 20, color: "red" }}
                    />
                  </span>
                </Tooltip>
              </>
            )}
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
            title="Đồng ý xóa sản phẩm này?"
            onConfirm={async () => {
              const resp = await deleteProductType(record.id);
              if (resp && resp.code === 0) {
                listProductType({
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
            <Typography.Title level={5}>Danh sách sản phẩm</Typography.Title>
          </Badge>
        }
        columns={columns}
        dataSource={productTypes as any}
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
        <ModalAddProductType
          isShowModal={isShowModalAdd}
          setIsShowModal={setIsShowModalAdd}
          onSuccess={() => {
            listProductType({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
      {isShowModalEdit && (
        <ModalEditProductType
          isShowModal={isShowModalEdit}
          setIsShowModal={setIsShowModalEdit}
          formValue={formValue}
          onSuccess={() => {
            listProductType({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
    </BasicContent>
  );
}
