import RenderIcon from "#src/components/icon/RenderIcon.js";
import { BasicContent } from "#src/components/index.js";
import { toastUtil } from "#src/components/toast/index.js";
import useOrderStore, {
  useListOrder,
  useUpdateOrder,
} from "#src/store/order.js";
import { IOrder, IProductOrdered } from "#src/types/order.js";
import { OrderState } from "#src/utils/enum.js";
import { formatCurrency } from "#src/utils/helper.js";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ProTable, type ProColumns } from "@ant-design/pro-components";
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Popconfirm,
  Row,
  Space,
  Steps,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

export default function OrderPage() {
  const { Title, Text } = Typography;
  const listOrder = useListOrder();
  const updateOrder = useUpdateOrder();
  const { orders, total, loading } = useOrderStore();
  const [orderDetail, setOrderDetail] = useState<IOrder | null>(null);
  const [isShowDrawer, setIsShowDrawer] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total,
  });

  useEffect(() => {
    listOrder({
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

  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize,
    }));
  }, []);

  const handleSearch = useCallback(
    (values: Record<string, any>) => {
      listOrder({
        limit: pagination.pageSize,
        skip: pagination.current - 1,
        ...values,
      });
    },
    [listOrder, pagination.pageSize, pagination.current]
  );

  const handleReset = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    listOrder({ limit: 10, skip: 0 });
  }, [listOrder]);

  const handleUpdateOrder = async (order_id: string, state: string) => {
    const resp = await updateOrder({
      id: order_id,
      state,
    } as any);
    if (resp && resp.code !== 0) {
      toastUtil.error(resp.message);
      return;
    }
    toastUtil.success("Cập nhật trạng thái thành công");
    listOrder({
      limit: pagination.pageSize,
      skip: pagination.current - 1,
    });
  };

  const columns: ProColumns<IOrder>[] = [
    {
      title: "Mã hóa đơn",
      dataIndex: "order_code",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-2">
          <Typography.Text
            code={false}
            copyable={{
              text: record.order_code,
            }}
            underline={false}
          >
            <Tooltip title={record.order_code}>
              {`...${record.order_code.slice(-5)}`}
            </Tooltip>
          </Typography.Text>
          <span
            className="ant-menu-item-icon cursor-pointer"
            onClick={() => {
              setOrderDetail(record);
              setIsShowDrawer(true);
            }}
          >
            <RenderIcon
              icon={{ icon_name: "AiOutlineEye", icon_type: "Ant" }}
              style={{ fontSize: 20, color: "blue" }}
            />
          </span>
        </div>
      ),
    },
    {
      title: "Tên người nhận",
      dataIndex: "receiver_name",
      width: 120,
      render: (_, record) => <div>{record.user_address?.full_name}</div>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "receiver_phone",
      width: 120,
      render: (_, record) => <div>{record.user_address?.phone}</div>,
    },
    {
      title: "Địa chỉ",
      dataIndex: "receiver_address",
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <div className="break-words">{record.user_address?.full_address}</div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_money",
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <span className="text-red-500 font-bold">
          {formatCurrency(Number(record.total_money) || 0)}
        </span>
      ),
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "time_order",
      hideInSearch: true,
      width: 100,
      render: (_, record) => (
        <div>
          {record.time_order
            ? dayjs.unix(record.time_order).format("YYYY-MM-DD HH:mm:ss")
            : "-"}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      align: "center",
      width: 80,
      valueType: "select",
      valueEnum: {
        [OrderState.pending.value]: {
          text: OrderState.pending.text,
          status: "Default",
        },
        [OrderState.confirmed.value]: {
          text: OrderState.confirmed.text,
          status: "Processing",
        },
        [OrderState.shipping.value]: {
          text: OrderState.shipping.text,
          status: "Processing",
        },
        [OrderState.completed.value]: {
          text: OrderState.completed.text,
          status: "Success",
        },
        [OrderState.cancelled.value]: {
          text: OrderState.cancelled.text,
          status: "Error",
        },
      },
      render: (_, record) => (
        <Tag color={OrderState[record.state as keyof typeof OrderState]?.color}>
          {OrderState[record.state as keyof typeof OrderState].text}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 100,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          {(() => {
            if (record.state === OrderState.pending.value) {
              return (
                <Space>
                  <Popconfirm
                    title="Đồng ý duyệt đơn hàng này?"
                    okText="Đồng ý"
                    cancelText="Không"
                    onConfirm={() =>
                      handleUpdateOrder(record.id, OrderState.confirmed.value)
                    }
                  >
                    <Button icon={<CheckCircleOutlined />}>Duyệt</Button>
                  </Popconfirm>

                  <Popconfirm
                    title="Đồng ý hủy đơn hàng này?"
                    okText="Đồng ý"
                    cancelText="Không"
                    onConfirm={() =>
                      handleUpdateOrder(record.id, OrderState.cancelled.value)
                    }
                  >
                    <Button icon={<CloseCircleOutlined />} danger>
                      Hủy
                    </Button>
                  </Popconfirm>
                </Space>
              );
            } else if (record.state === OrderState.confirmed.value) {
              return (
                <Popconfirm
                  title="Đồng ý giao hàng đơn hàng này?"
                  okText="Đồng ý"
                  cancelText="Không"
                  onConfirm={() =>
                    handleUpdateOrder(record.id, OrderState.shipping.value)
                  }
                >
                  <Button icon={<TruckOutlined />}>Giao hàng</Button>
                </Popconfirm>
              );
            } else if (record.state === OrderState.shipping.value) {
              return (
                <Popconfirm
                  title="Xác nhận đã giao hàng?"
                  okText="Đồng ý"
                  cancelText="Không"
                  onConfirm={() =>
                    handleUpdateOrder(record.id, OrderState.completed.value)
                  }
                >
                  <Button icon={<CheckCircleOutlined />}>Đã giao</Button>
                </Popconfirm>
              );
            }
          })()}
        </Space>
      ),
    },
  ];

  // Removed getCurrentStep function as it's no longer needed

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: "orange",
      confirmed: "blue",
      shipping: "purple",
      completed: "green",
      cancelled: "red",
    };
    return colorMap[status as keyof typeof colorMap] || "default";
  };

  const getStatusText = (status: string) => {
    const textMap = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao hàng",
      completed: "Đã giao",
      cancelled: "Đã hủy",
    };
    return textMap[status as keyof typeof textMap] || "Không xác định";
  };

  const steps = (() => {
    if (!orderDetail?.history) return [];

    const historyData = JSON.parse(orderDetail.history);
    const stepsList = [];
    let currentStepIndex = 0;

    // Step 1: Chờ xác nhận
    if (historyData.pending) {
      stepsList.push({
        title: "Chờ xác nhận",
        status: orderDetail?.state === "cancelled" ? "error" : "finish",
        icon: <ClockCircleOutlined />,
        description: dayjs
          .unix(historyData.pending)
          .format("YYYY-MM-DD HH:mm:ss"),
      });
      currentStepIndex++;
    }

    // Step 2: Đã xác nhận
    if (historyData.confirmed) {
      stepsList.push({
        title: "Đã xác nhận",
        status: orderDetail?.state === "cancelled" ? "error" : "finish",
        icon: <CheckCircleOutlined />,
        description: dayjs
          .unix(historyData.confirmed)
          .format("YYYY-MM-DD HH:mm:ss"),
      });
      currentStepIndex++;
    }

    // Step 3: Đang giao hàng
    if (historyData.shipping) {
      stepsList.push({
        title: "Đang giao hàng",
        status:
          orderDetail?.state === "cancelled"
            ? "error"
            : orderDetail?.state === "shipping"
            ? "process"
            : "finish",
        icon: <TruckOutlined />,
        description: dayjs
          .unix(historyData.shipping)
          .format("YYYY-MM-DD HH:mm:ss"),
      });
      currentStepIndex++;
    }

    // Step 4: Hoàn thành hoặc Đã hủy
    if (historyData.completed || historyData.cancelled) {
      const isCancelled = orderDetail?.state === "cancelled";
      stepsList.push({
        title: isCancelled ? "Đã hủy" : "Đã giao",
        status: isCancelled ? "error" : "finish",
        icon: isCancelled ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
        description:
          isCancelled && historyData.cancelled
            ? dayjs.unix(historyData.cancelled).format("YYYY-MM-DD HH:mm:ss")
            : historyData.completed
            ? dayjs.unix(historyData.completed).format("YYYY-MM-DD HH:mm:ss")
            : "",
      });
    }

    return stepsList;
  })();

  const productColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: IProductOrdered) => (
        <Space>
          <img
            src={record.product.image}
            alt={record.product.name}
            style={{ width: 60, height: 60, objectFit: "cover" }}
          />
          <div className="flex flex-col gap-2">
            <Text strong>{record.product.name}</Text>

            {(() => {
              const attributeString = record.product?.attribute_values
                ? Object.entries(record.product.attribute_values)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" | ")
                : "";
              return (
                <p className="m-0 text-sm text-muted-foreground break-words">
                  {attributeString}
                </p>
              );
            })()}
          </div>
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 100,
      render: (_: any, record: IProductOrdered) => record.quantity,
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      width: 150,
      render: (_: any, record: IProductOrdered) =>
        formatCurrency(Number(record.product.sell_price) || 0),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      align: "right",
      width: 150,
      render: (_: any, record: IProductOrdered) => (
        <Text strong>
          {formatCurrency(
            Number(record.product.sell_price) * record.quantity || 0
          )}
        </Text>
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
            <Typography.Title level={5}>Danh sách đơn hàng</Typography.Title>
          </Badge>
        }
        columns={columns}
        dataSource={orders as any}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: handleTableChange,
        }}
        onSubmit={handleSearch}
        onReset={handleReset}
      />
      <Drawer
        title="Chi tiết đơn hàng"
        closable={{ "aria-label": "Close Button" }}
        onClose={() => setIsShowDrawer(false)}
        open={isShowDrawer}
        width="50vw"
      >
        <Card style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                <ShoppingCartOutlined /> Chi tiết đơn hàng
              </Title>
              <Text type="secondary">
                Mã đơn hàng: {orderDetail?.order_code}
              </Text>
            </Col>
            <Col>
              <Tag
                color={getStatusColor(orderDetail?.state || "")}
                style={{ fontSize: 14, padding: "4px 12px" }}
              >
                {getStatusText(orderDetail?.state || "")}
              </Tag>
            </Col>
          </Row>
        </Card>

        <Card title="Lịch sử đơn hàng" style={{ marginBottom: 24 }}>
          {steps.length > 0 ? (
            <Steps items={steps as any} direction="horizontal" />
          ) : (
            <div className="text-center text-gray-500">
              Chưa có lịch sử trạng thái
            </div>
          )}
        </Card>

        <Row gutter={[24, 24]}>
          {/* Thông tin đơn hàng */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <>
                  <UserOutlined /> Thông tin đơn hàng
                </>
              }
              style={{ height: "100%" }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item
                  label={
                    <div className="flex items-center gap-2">
                      <CalendarOutlined />
                      <span>Thời gian đặt hàng</span>
                    </div>
                  }
                >
                  {orderDetail?.time_order
                    ? dayjs
                        .unix(orderDetail?.time_order)
                        .format("YYYY-MM-DD HH:mm:ss")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <div className="flex items-center gap-2">
                      <UserOutlined />
                      <span>Tên người nhận</span>
                    </div>
                  }
                >
                  {orderDetail?.user_address?.full_name}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <div className="flex items-center gap-2">
                      <PhoneOutlined />
                      <span>Số điện thoại</span>
                    </div>
                  }
                >
                  {orderDetail?.user_address?.phone}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <div className="flex items-center gap-2">
                      <EnvironmentOutlined />
                      <span>Địa chỉ giao hàng</span>
                    </div>
                  }
                >
                  {orderDetail?.user_address?.full_address}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Thông tin vận chuyển và thanh toán */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <>
                  <TruckOutlined /> Vận chuyển & Thanh toán
                </>
              }
              style={{ height: "100%" }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item
                  label={
                    <div className="flex items-center gap-2">
                      <TruckOutlined />
                      <span>Đơn vị vận chuyển</span>
                    </div>
                  }
                >
                  {orderDetail?.shipping_name}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <div className="flex items-center gap-2">
                      <TruckOutlined />
                      <span>Phí vận chuyển</span>
                    </div>
                  }
                >
                  {formatCurrency(orderDetail?.shipping_fee || 0)}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <div className="flex items-center gap-2">
                      <CreditCardOutlined />
                      <span>Phương thức thanh toán</span>
                    </div>
                  }
                >
                  {orderDetail?.method_payment === "cod"
                    ? "Thanh toán khi nhận hàng"
                    : "Thanh toán online"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <div className="flex items-center gap-2">
                      <CreditCardOutlined />
                      <span>Tổng tiền</span>
                    </div>
                  }
                >
                  <Text strong style={{ fontSize: 16, color: "#f5222d" }}>
                    {formatCurrency(orderDetail?.total_money || 0)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Danh sách sản phẩm */}
        <Card title="Danh sách sản phẩm" style={{ marginTop: 24 }}>
          <Table
            rowKey="product_id"
            dataSource={orderDetail?.product_ordered}
            columns={productColumns as any}
            pagination={false}
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>Tổng cộng</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>
                      {orderDetail?.product_ordered?.reduce(
                        (sum: number, item: IProductOrdered) =>
                          sum + item.quantity,
                        0
                      )}{" "}
                      sản phẩm
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong style={{ fontSize: 16 }}>
                      {formatCurrency(
                        orderDetail?.product_ordered?.reduce(
                          (sum: number, item: IProductOrdered) =>
                            sum +
                            Number(item.product.sell_price) * item.quantity,
                          0
                        ) || 0
                      )}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text>Phí vận chuyển</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text>
                      {formatCurrency(orderDetail?.shipping_fee || 0)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong style={{ fontSize: 16 }}>
                      Tổng thanh toán
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong style={{ fontSize: 16, color: "#f5222d" }}>
                      {formatCurrency(orderDetail?.total_money || 0)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>
      </Drawer>
    </BasicContent>
  );
}
