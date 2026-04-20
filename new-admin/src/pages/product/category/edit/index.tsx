import { toastUtil } from "#src/components/toast";
import UploadImage from "#src/components/upload/index.js";
import { useUpdateCategory } from "#src/store/category.js";
import { Button, Form, type FormProps, Input, Modal, Space } from "antd";
import { useEffect, useState } from "react";

export type ModalEditCategoryProps = {
  isShowModal: boolean;
  formValue: Partial<ICategory>;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalEditCategory(props: ModalEditCategoryProps) {
  const { isShowModal, setIsShowModal, onSuccess, formValue } = props;
  const [form] = Form.useForm();
  const updateCategory = useUpdateCategory();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  useEffect(() => {
    if (formValue) {
      // Convert image URL string to UploadFile format for display
      const formData = { ...formValue };
      if (formValue.logo && typeof formValue.logo === "string") {
        const imageFile = [
          {
            uid: "-1",
            name: "image.jpg",
            status: "done" as const,
            url: formValue.logo,
          },
        ];
        (formData as any).logo = imageFile;
      }

      form.setFieldsValue(formData);
    }
  }, [formValue, form]);

  const onFinish: FormProps<ICategory>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      const submitData = { ...values };
      if (values.logo && Array.isArray(values.logo) && values.logo.length > 0) {
        const imageFile = values.logo[0];
        submitData.logo =
          imageFile.url ||
          imageFile.response?.[0]?.url ||
          imageFile.response?.[0] ||
          "";
      }
      const resp = await updateCategory({
        ...submitData,
        id: formValue.id as string,
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
