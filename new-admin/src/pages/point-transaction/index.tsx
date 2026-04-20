import { BasicContent } from "#src/components/index.js";
import usePointStore, { useListPointTransaction } from "#src/store/point.js";
import { IPointTransaction } from "#src/types/point.js";
import { formatNumber } from "#src/utils/helper.js";
import { ProTable, type ProColumns } from "@ant-design/pro-components";
import { Badge, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

export default function UserPage() {
  const getPointTransaction = useListPointTransaction();
  const { pointTransactions, total, loading } = usePointStore();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total,
  });

  useEffect(() => {
    getPointTransaction({
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
      getPointTransaction({
        limit: pagination.pageSize,
        skip: pagination.current - 1,
        ...values,
      });
    },
    [pagination.pageSize, pagination.current]
  );

  const handleReset = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    getPointTransaction({ limit: 10, skip: 0 });
  }, []);

  const columns: ProColumns<IPointTransaction>[] = [
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
      title: "Tên người dùng",
      dataIndex: "receiver_id",
      width: 80,
      render: (_, record) => <div>{record?.receiver?.full_name}</div>,
    },
    {
      title: "Số điểm",
      dataIndex: "points",
      width: 80,
      hideInSearch: true,
      render: (_, record) => (
        <div>
          {record.points > 0
            ? `+${formatNumber(record.points)}`
            : `${formatNumber(record.points)}`}
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 100,
      hideInSearch: true,
      render: (_, record) => <div>{record.description}</div>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      width: 100,
      render: (_, record) => (
        <div>
          {record.created_at
            ? dayjs.unix(record.created_at).format("YYYY-MM-DD HH:mm:ss")
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
              Danh sách giao dịch điểm
            </Typography.Title>
          </Badge>
        }
        columns={columns}
        dataSource={pointTransactions as any}
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
