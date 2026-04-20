import { BasicContent } from "#src/components/index.js";
import useOrderPlanStore, { useListOrderPlan } from "#src/store/order-plan.js";
import { IOrderPlan } from "#src/types/plan.js";
import { formatCurrency } from "#src/utils/helper.js";
import { ProTable, type ProColumns } from "@ant-design/pro-components";
import { Badge, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

export default function PlanOrderPage() {
  const listOrderPlan = useListOrderPlan();
  const { orderPlans, total, loading } = useOrderPlanStore();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total,
  });

  useEffect(() => {
    listOrderPlan({
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
      listOrderPlan({
        limit: pagination.pageSize,
        skip: pagination.current - 1,
        ...values,
      });
    },
    [listOrderPlan, pagination.pageSize, pagination.current]
  );

  const handleReset = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    listOrderPlan({ limit: 10, skip: 0 });
  }, [listOrderPlan]);

  const columns: ProColumns<IOrderPlan>[] = [
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
      title: "Mã đơn hàng",
      dataIndex: "order_code",
      width: 80,
      render: (_, record) => <div>{record.order_code}</div>,
    },
    {
      title: "Loại đơn hàng",
      dataIndex: "type",
      width: 80,
      render: (_, record) => {
        switch (record.type) {
          case "create":
            return <div>Tạo mới</div>;
          case "renew":
            return <div>Gia hạn</div>;
          case "upgrade":
            return <div>Nâng cấp</div>;
          default:
            return <>-</>;
        }
      },
    },
    {
      title: "Người dùng",
      dataIndex: "user_id",
      width: 80,
      render: (_, record) => <div>{record.user.full_name}</div>,
    },
    {
      title: "Tên gói dịch vụ",
      dataIndex: "plan_id",
      width: 80,
      render: (_, record) => (
        <div>Gói {record.plan.name.toLocaleLowerCase()}</div>
      ),
    },
    {
      title: "Giá gói",
      dataIndex: "price",
      width: 80,
      render: (_, record) => (
        <div>{formatCurrency(record.plan_price || 0)}</div>
      ),
    },
    {
      title: "Loại thanh toán",
      dataIndex: "plan_type",
      width: 80,
      render: (_, record) => <div>Hằng {record.plan_type}</div>,
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
  ];

  return (
    <BasicContent>
      <ProTable
        rowKey="id"
        type="table"
        tableClassName="gx-table-responsive"
        headerTitle={
          <Badge count={total || 0} showZero={true}>
            <Typography.Title level={5}>
              Danh sách đơn hàng gói dịch vụ
            </Typography.Title>
          </Badge>
        }
        columns={columns}
        dataSource={orderPlans as any}
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
    </BasicContent>
  );
}
