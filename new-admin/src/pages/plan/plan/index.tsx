import RenderIcon from "#src/components/icon/RenderIcon.js";
import { BasicContent } from "#src/components/index.js";
import { toastUtil } from "#src/components/toast/index.js";
import usePlanStore, {
  useDeletePlan,
  useListPlan,
  useUpdatePlan,
} from "#src/store/plan.js";
import { BasicStatus } from "#src/utils/enum.js";
import { PlusOutlined } from "@ant-design/icons";
import { ProTable, type ProColumns } from "@ant-design/pro-components";
import {
  Badge,
  Button,
  Popconfirm,
  Space,
  Switch,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { ModalAddPlan } from "./add";
import { ModalEditPlan } from "./edit";
import { IPlan } from "#src/types/plan.js";

export default function PlanPage() {
  const listPlan = useListPlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const [formValue, setFormValue] = useState<Partial<IPlan>>({});
  const { plans, total, loading } = usePlanStore();
  const [isShowModalAdd, setIsShowModalAdd] = useState(false);
  const [isShowModalEdit, setIsShowModalEdit] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total,
  });

  useEffect(() => {
    listPlan({
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

  const handleChangeStatusPlan = useCallback(
    async (state: boolean, id: string) => {
      const resp = await updatePlan({
        id,
        state: state ? BasicStatus.ENABLE : BasicStatus.DISABLE,
      } as any);
      if (resp && resp.code === 0) {
        listPlan({
          limit: pagination.pageSize,
          skip: pagination.current - 1,
        });
        toastUtil.success(resp.message);
      }
    },
    [listPlan, pagination.pageSize, pagination.current, updatePlan]
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
      listPlan({
        limit: pagination.pageSize,
        skip: pagination.current - 1,
        ...values,
      });
    },
    [listPlan, pagination.pageSize, pagination.current]
  );

  const handleReset = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    listPlan({ limit: 10, skip: 0 });
  }, [listPlan]);

  const columns: ProColumns<IPlan>[] = [
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
      title: "Tên gói dịch vụ",
      dataIndex: "name",
      width: 80,
      render: (_, record) => <div>{record.name}</div>,
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
          onChange={(status) => handleChangeStatusPlan(status, record.id)}
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
            title="Đồng ý xóa gói dịch vụ này?"
            onConfirm={async () => {
              const resp = await deletePlan(record.id);
              if (resp && resp.code === 0) {
                listPlan({
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
            <Typography.Title level={5}>Danh sách gói dịch vụ</Typography.Title>
          </Badge>
        }
        columns={columns}
        dataSource={plans as any}
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
        <ModalAddPlan
          isShowModal={isShowModalAdd}
          setIsShowModal={setIsShowModalAdd}
          onSuccess={() => {
            listPlan({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
      {isShowModalEdit && (
        <ModalEditPlan
          isShowModal={isShowModalEdit}
          setIsShowModal={setIsShowModalEdit}
          formValue={formValue}
          onSuccess={() => {
            listPlan({
              limit: pagination.pageSize,
              skip: pagination.current - 1,
            });
          }}
        />
      )}
    </BasicContent>
  );
}
