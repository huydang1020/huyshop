import { toastUtil } from "#src/components/toast";
import UploadImage from "#src/components/upload/index.js";
import { useCreateBanner } from "#src/store/banner.js";
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
import { useState } from "react";

export type ModalAddBannerProps = {
  isShowModal: boolean;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalAddBanner(props: ModalAddBannerProps) {
  const { isShowModal, setIsShowModal, onSuccess } = props;
  const [form] = Form.useForm();
  const createBanner = useCreateBanner();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const onFinish: FormProps<IBanner>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      let imageUrl = "";
      if (
        values.image &&
        Array.isArray(values.image) &&
        values.image.length > 0
      ) {
        const imageFile = values.image[0];
        imageUrl =
          imageFile.url ||
          imageFile.response?.[0]?.url ||
          imageFile.response?.[0] ||
          "";
      }
      const resp = await createBanner({
        ...values,
        image: imageUrl,
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
