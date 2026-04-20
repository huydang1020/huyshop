import { toastUtil } from "#src/components/toast";
import UploadImage from "#src/components/upload/index.js";
import { useUpdateBanner } from "#src/store/banner.js";
import { BannerType } from "#src/utils/enum.js";
import {
  Button,
  Col,
  Form,
  type FormProps,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
} from "antd";
import { useEffect, useState } from "react";

export type ModalEditBannerProps = {
  isShowModal: boolean;
  formValue: Partial<IBanner>;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalEditBanner(props: ModalEditBannerProps) {
  const { isShowModal, setIsShowModal, onSuccess, formValue } = props;
  const [form] = Form.useForm();
  const updateBanner = useUpdateBanner();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  useEffect(() => {
    if (formValue) {
      // Convert image URL string to UploadFile format for display
      const formData = { ...formValue };
      if (formValue.image && typeof formValue.image === "string") {
        const imageFile = [
          {
            uid: "-1",
            name: "image.jpg",
            status: "done" as const,
            url: formValue.image,
          },
        ];
        (formData as any).image = imageFile;
      }

      form.setFieldsValue(formData);
    }
  }, [formValue, form]);

  const onFinish: FormProps<IBanner>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      const submitData = { ...values };
      if (
        values.image &&
        Array.isArray(values.image) &&
        values.image.length > 0
      ) {
        const imageFile = values.image[0];
        submitData.image =
          imageFile.url ||
          imageFile.response?.[0]?.url ||
          imageFile.response?.[0] ||
          "";
      }
      const resp = await updateBanner({
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

  const onFinishFailed: FormProps<IBanner>["onFinishFailed"] = (errorInfo) => {
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
      width="50vw"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Hình ảnh" name="image">
              <UploadImage />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Tên banner"
              name="name"
              rules={[{ required: true, message: "Hãy nhập tên banner!" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="URL"
              name="url"
              rules={[{ required: true, message: "Hãy nhập URL!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Loại banner"
              name="type"
              rules={[{ required: true, message: "Hãy chọn loại banner!" }]}
            >
              <Select
                showSearch
                placeholder="Chọn loại banner"
                optionFilterProp="label"
                options={Object.values(BannerType).map((type) => ({
                  value: type,
                  label: type,
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Thứ tự"
              name="order"
              rules={[{ required: true, message: "Hãy nhập thứ tự!" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

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
