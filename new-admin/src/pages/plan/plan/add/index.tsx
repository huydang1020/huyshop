import { toastUtil } from "#src/components/toast";
import { useCreatePlan } from "#src/store/plan.js";
import { IPlan } from "#src/types/plan.js";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
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

export type ModalAddPlanProps = {
  isShowModal: boolean;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalAddPlan(props: ModalAddPlanProps) {
  const { isShowModal, setIsShowModal, onSuccess } = props;
  const [form] = Form.useForm();
  const createPlan = useCreatePlan();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const onFinish: FormProps<IPlan>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      console.log("🚀 ~ onFinish ~ values:", values);
      const resp = await createPlan(values);
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

  const onFinishFailed: FormProps<IPlan>["onFinishFailed"] = (errorInfo) => {
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
            <Form.Item
              label="Tên gói dịch vụ"
              name="name"
              rules={[{ required: true, message: "Hãy nhập tên gói dịch vụ!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Số lượng cửa hàng tối đa"
              name="max_stores_allowed"
              rules={[
                { required: true, message: "Hãy nhập số lượng cửa hàng!" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Số lượng sản phẩm tối đa / cửa hàng"
              name="max_products_per_store"
              rules={[
                { required: true, message: "Hãy nhập số lượng sản phẩm!" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Tính năng"
          name="features"
          rules={[{ required: true, message: "Hãy chọn tính năng!" }]}
        >
          <Select
            mode="tags"
            allowClear
            style={{ width: "100%" }}
            placeholder="Chọn tính năng"
          />
        </Form.Item>

        <Form.List name="prices">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row
                  key={key}
                  gutter={16}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Col span={12}>
                    <Form.Item
                      {...restField}
                      label="Thời hạn"
                      name={[name, "type"]}
                      rules={[
                        {
                          required: true,
                          message: "Hãy nhập thời hạn!",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập thời hạn" />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      {...restField}
                      label="Giá"
                      name={[name, "price"]}
                      rules={[{ required: true, message: "Hãy nhập giá!" }]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                        placeholder="Nhập giá"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Col>
                </Row>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  disabled={fields.length >= 2}
                >
                  Thêm giá
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

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
