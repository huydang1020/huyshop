import districtsData from "#src/assets/district.json";
import provincesData from "#src/assets/province.json";
import wardsData from "#src/assets/ward.json";
import RichText from "#src/components/richtext/index.js";
import { toastUtil } from "#src/components/toast";
import UploadImage from "#src/components/upload/index.js";
import { useUpdateStore } from "#src/store/store.js";
import {
  Button,
  Col,
  Form,
  type FormProps,
  Input,
  Modal,
  Row,
  Select,
  Space,
} from "antd";
import { useEffect, useState } from "react";

export type ModalEditStoreProps = {
  isShowModal: boolean;
  formValue: Partial<IStore>;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

interface IDistrict {
  id: string;
  name: string;
  province_id: string;
  province_name: string;
}

interface IWard {
  id: string;
  name: string;
  district_id: string;
  district_name: string;
  province_id: string;
  province_name: string;
}

export function ModalEditStore(props: ModalEditStoreProps) {
  const { isShowModal, setIsShowModal, onSuccess, formValue } = props;
  const [form] = Form.useForm();
  const updateStore = useUpdateStore();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);

  const [choooseProv, setChoooseProv] = useState<string>("");
  const [choooseDist, setChoooseDist] = useState<string>("");
  const [choooseWard, setChoooseWard] = useState<string>("");

  useEffect(() => {
    if (formValue) {
      const formData = { ...formValue };
      if (formValue.logo && typeof formValue.logo === "string") {
        const imageFile = [
          {
            uid: "-1",
            name: "logo.jpg",
            status: "done" as const,
            url: formValue.logo,
          },
        ];
        (formData as any).logo = imageFile;
      }
      form.setFieldsValue(formData);
      if (formValue.province) {
        setChoooseProv(formValue.province);
      }
      if (formValue.district) {
        const dist = districtsData.filter(
          (item) => item.province_id === formValue.province
        );
        setDistricts(dist);
        setChoooseDist(formValue.district);
      }
      if (formValue.ward) {
        const ward = wardsData.filter(
          (item) => item.district_id === formValue.district
        );
        setWards(ward);
        setChoooseWard(formValue.ward);
      }
    }
  }, [formValue, form]);

  const onFinish: FormProps<IStore>["onFinish"] = async (values) => {
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
      const resp = await updateStore({
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

  const onFinishFailed: FormProps<IStore>["onFinishFailed"] = (errorInfo) => {
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
            <Form.Item label="Logo" name="logo">
              <UploadImage />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Tên cửa hàng"
              name="name"
              rules={[{ required: true, message: "Hãy nhập tên cửa hàng!" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Số điện thoại"
              name="phone_number"
              rules={[{ required: true, message: "Hãy nhập số diện thoại!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Tỉnh/thành phố"
              name="province"
              rules={[{ required: true, message: "Hãy chọn tỉnh/thành phố!" }]}
            >
              <Select
                showSearch
                style={{ width: "100%" }}
                optionFilterProp="children"
                onChange={(val) => {
                  setChoooseProv(val);
                  const dist = districtsData.filter(
                    (item) => item.province_id === val
                  );
                  setDistricts(dist);
                  setChoooseDist("");
                  setChoooseWard("");
                  setWards([]);
                  form.resetFields(["district", "ward"]);
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={provincesData.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Quận/huyện"
              name="district"
              rules={[{ required: true, message: "Hãy chọn quận/huyện!" }]}
            >
              <Select
                showSearch
                style={{ width: "100%" }}
                optionFilterProp="children"
                disabled={!choooseProv}
                onChange={(val) => {
                  setChoooseDist(val);
                  setChoooseWard("");
                  const ward = wardsData.filter(
                    (item) => item.district_id === val
                  );
                  setWards(ward);
                  form.resetFields(["ward"]);
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={districts.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Phường/xã"
              name="ward"
              rules={[{ required: true, message: "Hãy chọn phường/xã!" }]}
            >
              <Select
                showSearch
                style={{ width: "100%" }}
                optionFilterProp="children"
                disabled={!choooseDist}
                onChange={(val) => {
                  setChoooseWard(val);
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={wards.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Hãy nhập địa chỉ!" }]}
        >
          <Input.TextArea />
        </Form.Item>

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
