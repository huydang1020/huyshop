import { toastUtil } from "#src/components/toast";
import { useCreatePartner } from "#src/store/partner.js";
import { Button, Form, type FormProps, Input, Modal, Space } from "antd";
import { useState } from "react";

export type ModalAddPartnerProps = {
  isShowModal: boolean;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalAddPartner(props: ModalAddPartnerProps) {
  const { isShowModal, setIsShowModal, onSuccess } = props;
  const [form] = Form.useForm();
  const createPartner = useCreatePartner();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const onFinish: FormProps<IPartner>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      const resp = await createPartner(values);
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

  const onFinishFailed: FormProps<IPartner>["onFinishFailed"] = (errorInfo) => {
    console.error("Failed:", errorInfo);
  };

  const onCancel = () => {
    form.resetFields();
    setIsShowModal(false);
  };

  return (
    <Modal
      forceRender
      title="Thêm mới"
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
