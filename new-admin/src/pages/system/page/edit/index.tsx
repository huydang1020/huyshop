import { useUpdatePage } from "#src/store/page.js";
import { Button, Form, type FormProps, Input, Modal, Space } from "antd";
import { useEffect, useState } from "react";
import { toastUtil } from "#src/components/toast";
import { IPage } from "#src/types/page.js";

export type ModalEditPageProps = {
  formValue: Partial<IPage>;
  title: string;
  isShowModal: boolean;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalEditPage(props: ModalEditPageProps) {
  const { formValue, title, isShowModal, setIsShowModal, onSuccess } = props;
  const [form] = Form.useForm<IPage>();
  const updatePage = useUpdatePage();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  useEffect(() => {
    if (formValue) {
      form.setFieldsValue(formValue);
    }
  }, [formValue, form]);

  const onFinish: FormProps<IPage>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      const resp = await updatePage({ ...formValue, ...values });
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

  const onFinishFailed: FormProps<IPage>["onFinishFailed"] = (errorInfo) => {
    console.error("Failed:", errorInfo);
  };

  const onCancel = () => {
    // form.resetFields();
    setIsShowModal(false);
  };

  return (
    <Modal
      forceRender
      title={title}
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
