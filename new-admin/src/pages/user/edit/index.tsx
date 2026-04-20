import districtsData from "#src/assets/district.json";
import wardsData from "#src/assets/ward.json";
import { toastUtil } from "#src/components/toast";
import UploadImage from "#src/components/upload/index.js";
import * as roleService from "#src/services/role";
import { useUpdateUser } from "#src/store/user.js";
import { IUser } from "#src/types/user.js";
import {
  Button,
  Col,
  DatePicker,
  Form,
  type FormProps,
  Input,
  Modal,
  Row,
  Select,
  Space,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export type ModalEditUserProps = {
  isShowModal: boolean;
  formValue: Partial<IUser>;
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

export function ModalEditUser(props: ModalEditUserProps) {
  const { isShowModal, setIsShowModal, onSuccess, formValue } = props;
  const [form] = Form.useForm();
  const updateUser = useUpdateUser();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const [roles, setRoles] = useState<IRole[]>([]);
  const [isFetchRoles, setIsFetchRoles] = useState(false);

  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);

  const [choooseProv, setChoooseProv] = useState<string>("");
  const [choooseDist, setChoooseDist] = useState<string>("");
  const [choooseWard, setChoooseWard] = useState<string>("");

  useEffect(() => {
    if (formValue) {
      if (typeof formValue.birthday === "number") {
        formValue.birthday = dayjs.unix(formValue.birthday);
      }

      const formData = { ...formValue };
      if (formValue.avatar && typeof formValue.avatar === "string") {
        const imageFile = [
          {
            uid: "-1",
            name: "avatar.jpg",
            status: "done" as const,
            url: formValue.avatar,
          },
        ];
        (formData as any).avatar = imageFile;
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

  useEffect(() => {
    const fetchRoles = async () => {
      const resp = await roleService.getListRole({});
      if (resp.data.roles) {
        setIsFetchRoles(true);
        setRoles(resp.data.roles);
      }
    };
    if (isShowModal && !isFetchRoles) {
      fetchRoles();
    }
  }, [isShowModal, isFetchRoles]);

  const onFinish: FormProps<IUser>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      const submitData = { ...values };
      if (
        values.avatar &&
        Array.isArray(values.avatar) &&
        values.avatar.length > 0
      ) {
        const imageFile = values.avatar[0];
        submitData.avatar =
          imageFile.url ||
          imageFile.response?.[0]?.url ||
          imageFile.response?.[0] ||
          "";
      }
      const resp = await updateUser({
        ...submitData,
        id: formValue.id as string,
      });
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

  const onFinishFailed: FormProps<IUser>["onFinishFailed"] = (errorInfo) => {
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
            <Form.Item label="Ảnh đại diện" name="avatar">
              <UploadImage />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Tên người dùng"
              name="full_name"
              rules={[{ required: true, message: "Hãy nhập tên người dùng!" }]}
            >
              <Input id="modal_full_name" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Số điện thoại"
              name="phone_number"
              rules={[{ required: true, message: "Hãy nhập số diện thoại!" }]}
            >
              <Input id="modal_phone_number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Hãy nhập email!" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Ngày sinh"
              name="birthday"
              // rules={[{ required: true, message: "Hãy chọn ngày sinh!" }]}
            >
              <DatePicker style={{ width: "100%" }} placeholder="" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Quyền hạn"
              name="role_id"
              rules={[{ required: true, message: "Hãy chọn quyền hạn!" }]}
            >
              <Select
                showSearch
                placeholder="Chọn quyền hạn"
                optionFilterProp="label"
                options={roles.map((role) => ({
                  value: role.id,
                  label: role.name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Tên đăng nhập" name="username">
              <Input id="modal_username" />
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
