import { useUpdateRole } from "#src/store/role";
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
import { useEffect, useState } from "react";
import { toastUtil } from "#src/components/toast";
import { RoleGroup } from "#src/utils/helper.js";

export type ModalEditRoleProps = {
  formValue: Partial<IRole>;
  title: string;
  isShowModal: boolean;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalEditRole(props: ModalEditRoleProps) {
  const { formValue, title, isShowModal, setIsShowModal, onSuccess } = props;
  const [form] = Form.useForm();
  const updateRole = useUpdateRole();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);
  const [groups, setGroups] = useState<IRoleGroup[]>([]);

  useEffect(() => {
    if (formValue) {
      form.setFieldsValue(formValue);
      if (formValue.groups) {
        const roleGroup: string[] = [];
        for (const item of formValue.groups) {
          roleGroup.push(item.group);
        }
        form.setFieldValue("role_group", roleGroup);
        setGroups(formValue.groups);
      }
    }
  }, [formValue, form]);

  const onFinish: FormProps<IRole>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      const roleGroup = values.role_group;
      const newGroups: IRoleGroup[] = [];
      for (const item of groups) {
        if (roleGroup && roleGroup.includes(item.group)) {
          newGroups.push(item);
        }
      }
      const updatedValues = {
        ...values,
        groups: newGroups,
      };

      const resp = await updateRole({ ...formValue, ...updatedValues });
      if (resp && resp.code !== 0) {
        toastUtil.error(resp.message);
        return;
      }
      toastUtil.success(resp?.message);
      form.resetFields();
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
    // form.resetFields();
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
      render: (_, record) => {
        const gr = groups.find((item) => item.group === record); // Lấy dữ liệu nhóm từ state
        return (
          <Checkbox.Group
            options={[
              { label: "Thêm", value: "c" },
              { label: "Xem", value: "r" },
              { label: "Sửa", value: "u" },
              { label: "Xóa", value: "d" },
            ]}
            value={gr?.actions}
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
        );
      },
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
