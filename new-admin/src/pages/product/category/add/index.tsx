import { toastUtil } from "#src/components/toast";
import UploadImage from "#src/components/upload/index.js";
import { useCreateCategory } from "#src/store/category.js";
import { Button, Form, type FormProps, Input, Modal, Space } from "antd";
import { useState } from "react";

export type ModalAddCategoryProps = {
  isShowModal: boolean;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalAddCategory(props: ModalAddCategoryProps) {
  const { isShowModal, setIsShowModal, onSuccess } = props;
  const [form] = Form.useForm();
  const createCategory = useCreateCategory();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const onFinish: FormProps<ICategory>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      let imageUrl = "";
      if (values.logo && Array.isArray(values.logo) && values.logo.length > 0) {
        const imageFile = values.logo[0];
        imageUrl =
          imageFile.url ||
          imageFile.response?.[0]?.url ||
          imageFile.response?.[0] ||
          "";
      }
      const resp = await createCategory({
        ...values,
        logo: imageUrl,
      });
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

  const onFinishFailed: FormProps<ICategory>["onFinishFailed"] = (
    errorInfo
  ) => {
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
        <Form.Item label="Logo" name="logo">
          <UploadImage />
        </Form.Item>

        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: "Hãy nhập tên danh mục!" }]}
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
