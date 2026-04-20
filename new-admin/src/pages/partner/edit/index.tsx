import { toastUtil } from "#src/components/toast";
import { useUpdatePartner } from "#src/store/partner.js";
import { Button, Form, type FormProps, Input, Modal, Space } from "antd";
import { useEffect, useState } from "react";

export type ModalEditPartnerProps = {
  isShowModal: boolean;
  formValue: Partial<IPartner>;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalEditPartner(props: ModalEditPartnerProps) {
  const { isShowModal, setIsShowModal, onSuccess, formValue } = props;
  const [form] = Form.useForm();
  const updatePartner = useUpdatePartner();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  useEffect(() => {
    if (formValue) {
      form.setFieldsValue(formValue);
    }
  }, [formValue, form]);

  const onFinish: FormProps<IPartner>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      values.id = formValue.id as string;
      const resp = await updatePartner(values);
      if (resp && resp.code !== 0) {
        toastUtil.error(resp.message);
        return;
      }
      toastUtil.success(resp?.message);
      onSuccess?.();
      form.resetFields();
      setIsShowModal(false);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoadingBtn(false);
    }
  };

  const onFinishFailed: FormProps<IPartner>["onFinishFailed"] = (errorInfo) => {
    console.error("Failed:", errorInfo);
  };

  const onCancel = () => {
    setIsShowModal(false);
  };

  return (
    <Modal
      forceRender
      title="Chỉnh sửa"
      open={isShowModal}
      footer={null}
      onCancel={onCancel}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Tên đối tác"
          name="name"
          rules={[{ required: true, message: "Hãy nhập tên đối tác!" }]}
        >
          <Input />
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
