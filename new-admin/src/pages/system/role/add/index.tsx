import { toastUtil } from "#src/components/toast";
import { useCreateRole } from "#src/store/role";
import { RoleGroup } from "#src/utils/helper.js";
import {
  Button,
  Checkbox,
  Form,
  type FormProps,
  Input,
  Modal,
  Select,
  Space,
  Table,
  TableProps,
  Typography,
} from "antd";
import { useState } from "react";

export type ModalAddRoleProps = {
  title: string;
  isShowModal: boolean;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalAddRole(props: ModalAddRoleProps) {
  const { title, isShowModal, setIsShowModal, onSuccess } = props;
  const [form] = Form.useForm();
  const createRole = useCreateRole();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);
  const [groups, setGroups] = useState<IRoleGroup[]>([]);

  const onFinish: FormProps<IRole>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      values.groups = groups;
      const resp = await createRole(values);
      if (resp && resp.code !== 0) {
        toastUtil.error(resp.message);
        return;
      }
      toastUtil.success(resp?.message);
      form.resetFields();
      setGroups([]);
      onSuccess?.();
      setIsShowModal(false);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoadingBtn(false);
    }
  };

  const onFinishFailed: FormProps<IRole>["onFinishFailed"] = (errorInfo) => {
    console.error("Failed:", errorInfo);
  };

  const onCancel = () => {
    form.resetFields();
    setGroups([]);
    setIsShowModal(false);
  };

  const columns: TableProps<any>["columns"] = [
    {
      title: "Nhóm quyền",
      dataIndex: "group",
      width: "30%",
      render: (_, record) => (
        <Typography.Paragraph>{record}</Typography.Paragraph>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "actions",
      width: "70%",
      render: (_, record) => (
        <Checkbox.Group
          options={[
            { label: "Thêm", value: "c" },
            { label: "Xem", value: "r" },
            { label: "Sửa", value: "u" },
            { label: "Xóa", value: "d" },
          ]}
          onChange={(val) => {
            setGroups((prevGroups) => {
              const existingGroupIndex = prevGroups.findIndex(
                (group) => group.group === record
              );

              if (existingGroupIndex !== -1) {
                const updatedGroups = [...prevGroups];
                updatedGroups[existingGroupIndex].actions = val;
                return updatedGroups;
              } else {
                return [
                  ...prevGroups,
                  {
                    group: record,
                    actions: val,
                  },
                ];
              }
            });
          }}
        />
      ),
    },
  ];

  return (
    <Modal
      forceRender
      title={title}
      open={isShowModal}
      footer={null}
      onCancel={onCancel}
      width="50vw"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Tên quyền"
          name="name"
          rules={[{ required: true, message: "Hãy nhập tên quyền!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: "Hãy nhập mô tả!" }]}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item label="Nhóm quyền" name="role_group">
          <Select
            showSearch
            allowClear
            mode="multiple"
            optionFilterProp="label"
            options={RoleGroup.map((role) => ({
              value: role,
              label: role,
            }))}
          />
        </Form.Item>

        <Form.Item shouldUpdate>
          {() => {
            return (
              <Form.Item name="groups" noStyle>
                <Table
                  columns={columns}
                  dataSource={form.getFieldValue("role_group")}
                  rowKey={(record) => record}
                  pagination={false}
                />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={isLoadingBtn}>
              Xác nhận
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
