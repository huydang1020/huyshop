import RichText from "#src/components/richtext/index.js";
import { toastUtil } from "#src/components/toast";
import UploadImage from "#src/components/upload/index.js";
import * as storeService from "#src/services/store";
import { useUpdateVoucher } from "#src/store/voucher.js";
import { BasicStatus, VoucherType } from "#src/utils/enum.js";
import {
  Button,
  Col,
  DatePicker,
  Form,
  type FormProps,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export type ModalEditVoucherProps = {
  isShowModal: boolean;
  formValue: Partial<IVoucher>;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalEditVoucher(props: ModalEditVoucherProps) {
  const { isShowModal, setIsShowModal, onSuccess, formValue } = props;
  const [form] = Form.useForm();
  const updateVoucher = useUpdateVoucher();
  const [isFetchStores, setIsFetchStores] = useState(false);
  const [stores, setStores] = useState<IStore[]>([]);
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      const resp = await storeService.getListStore({
        state: BasicStatus.ENABLE,
      });
      if (resp.data.stores) {
        setIsFetchStores(true);
        setStores(resp.data.stores);
      }
    };

    if (isShowModal && !isFetchStores) {
      fetchStores();
    }
  }, [isShowModal, isFetchStores]);

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
      if (formValue.start_at) {
        form.setFieldValue("start_at", dayjs.unix(formValue.start_at));
      }
      if (formValue.end_at) {
        form.setFieldValue("end_at", dayjs.unix(formValue.end_at));
      }
    }
  }, [formValue, form]);

  const onFinish: FormProps<IVoucher>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);

      // Convert image UploadFile[] back to string URL for API
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

      const resp = await updateVoucher({
        ...submitData,
        id: formValue.id as string,
        start_at: dayjs(values.start_at).startOf("day").unix(),
        end_at: dayjs(values.end_at).endOf("day").unix(),
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

  const onFinishFailed: FormProps<IVoucher>["onFinishFailed"] = (errorInfo) => {
    console.error("Failed:", errorInfo);
  };

  const onCancel = () => {
    form.resetFields();
    setIsShowModal(false);
  };

  return (
    <Modal
      forceRender
      title="Chỉnh sửa"
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
            <Form.Item<IVoucher>
              label="Ảnh ưu đãi"
              name="image"
              rules={[{ required: true, message: "Hãy chọn ảnh ưu đãi!" }]}
            >
              <UploadImage />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item<IVoucher>
              label="Tên ưu đãi"
              name="name"
              rules={[{ required: true, message: "Hãy nhập tên ưu đãi!" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item<IVoucher>
              label="Số tiền giảm giá"
              name="discount_cash"
              rules={[
                {
                  validator: (_, value) => {
                    const discountPercent =
                      form.getFieldValue("discount_percent");
                    if (value && discountPercent) {
                      return Promise.reject(
                        new Error(
                          "Chỉ được chọn 1 trong 2: số tiền hoặc phần trăm giảm giá!"
                        )
                      );
                    }
                    if (!value && !discountPercent) {
                      return Promise.reject(
                        new Error(
                          "Phải nhập ít nhất 1 trong 2: số tiền hoặc phần trăm giảm giá!"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                onChange={(value) => {
                  if (value) {
                    form.setFieldValue("discount_percent", undefined);
                    form.validateFields(["discount_percent"]);
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item<IVoucher>
              label="Phần trăm giảm giá"
              name="discount_percent"
              rules={[
                {
                  validator: (_, value) => {
                    const discountCash = form.getFieldValue("discount_cash");
                    if (value && discountCash) {
                      return Promise.reject(
                        new Error(
                          "Chỉ được chọn 1 trong 2: số tiền hoặc phần trăm giảm giá!"
                        )
                      );
                    }
                    if (!value && !discountCash) {
                      return Promise.reject(
                        new Error(
                          "Phải nhập ít nhất 1 trong 2: số tiền hoặc phần trăm giảm giá!"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                onChange={(value) => {
                  if (value) {
                    form.setFieldValue("discount_cash", undefined);
                    form.validateFields(["discount_cash"]);
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item<IVoucher>
              label="Số tiền giảm giá tối đa"
              name="max_discount_cash_value"
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
            <Form.Item<IVoucher>
              label="Số tiền áp dụng tối thiểu "
              name="min_total_bill_value"
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

        <Form.Item<IVoucher> label="Cửa hàng áp dụng" name="store_ids">
          <Select
            showSearch
            allowClear
            mode="multiple"
            placeholder="Chọn cửa hàng"
            optionFilterProp="label"
            options={stores.map((store) => ({
              value: store.id,
              label: store.name,
            }))}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item<IVoucher>
              label="Tổng số lượng ưu đãi"
              name="total_quantity"
              rules={[
                { required: true, message: "Hãy nhập tổng số lượng ưu đãi!" },
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
            <Form.Item<IVoucher>
              label="Số lượng còn lại"
              name="remaining_quantity"
            >
              <InputNumber
                disabled
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item<IVoucher>
              label="Số điểm đổi ưu đãi"
              name="point_exchange"
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

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item<IVoucher> label="Loại ưu đãi" name="type">
              <Select
                showSearch
                optionFilterProp="label"
                options={Object.values(VoucherType).map((type) => ({
                  value: type.value,
                  label: type.text,
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item<IVoucher>
              label="Ngày bắt đầu"
              name="start_at"
              rules={[{ required: true, message: "Hãy chọn ngày bắt đầu!" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item<IVoucher>
              label="Ngày kết thúc"
              name="end_at"
              rules={[{ required: true, message: "Hãy chọn ngày kết thúc!" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: "Hãy nhập mô tả!" }]}
        >
          <RichText />
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
