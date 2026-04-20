import { toastUtil } from "#src/components/toast";
import UploadImage from "#src/components/upload/index.js";
import * as roleService from "#src/services/role";
import { useCreateUser } from "#src/store/user.js";
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
import { useEffect, useState } from "react";

export type ModalAddUserProps = {
  isShowModal: boolean;
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

export function ModalAddUser(props: ModalAddUserProps) {
  const { isShowModal, setIsShowModal, onSuccess } = props;
  const [form] = Form.useForm();
  const createUser = useCreateUser();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const [roles, setRoles] = useState<IRole[]>([]);
  const [isFetchRoles, setIsFetchRoles] = useState(false);

  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);

  const [choooseProv, setChoooseProv] = useState<string>("");
  const [choooseDist, setChoooseDist] = useState<string>("");
  const [choooseWard, setChoooseWard] = useState<string>("");

  useEffect(() => {
    const fetchRoles = async () => {
      const resp = await roleService.getListRole({});
      if (resp.data.roles) {
        setIsFetchRoles(true);
        setRoles(resp.data.roles);
      }
      console.log("🚀 ~ fetchRoles ~ resp:", resp);
    };
    if (isShowModal && !isFetchRoles) {
      fetchRoles();
    }
  }, [isShowModal, isFetchRoles]);

  const onFinish: FormProps<IUser>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      let imageUrl = "";
      if (
        values.avatar &&
        Array.isArray(values.avatar) &&
        values.avatar.length > 0
      ) {
        const imageFile = values.avatar[0];
        imageUrl =
          imageFile.url ||
          imageFile.response?.[0]?.url ||
          imageFile.response?.[0] ||
          "";
      }
      const submitData = { ...values, avatar: imageUrl };
      const resp = await createUser(submitData);
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

  const onFinishFailed: FormProps<IUser>["onFinishFailed"] = (errorInfo) => {
    console.error("Failed:", errorInfo);
  };

  const onCancel = () => {
    form.resetFields();
    setChoooseProv("");
    setChoooseDist("");
    setChoooseWard("");
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

          <Col span={8}>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Hãy nhập mật khẩu!" }]}
            >
              <Input.Password />
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
