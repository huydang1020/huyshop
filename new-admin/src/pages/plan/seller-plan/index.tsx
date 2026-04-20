import { BasicContent } from "#src/components/index.js";
import { useUserInfo } from "#src/store/auth.js";
import { useGetOnePartner } from "#src/store/partner.js";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  ProductOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { ModalRenewOrderPlan } from "./renew-order-plan";
import { ModalUpgradeOrderPlan } from "./upgrade-order-plan";

export default function PlanSellerPage() {
  const { Title } = Typography;

  const userInfo = useUserInfo();
  const getOnePartner = useGetOnePartner();
  const [partner, setPartner] = useState<IPartner | null>(null);
  const [isShowModalRenew, setIsShowModalRenew] = useState(false);
  const [isShowModalUpgrade, setIsShowModalUpgrade] = useState(false);

  useEffect(() => {
    const getPartner = async () => {
      const res = await getOnePartner(userInfo.partner_id || "");
      if (res && res.code === 0) {
        setPartner(res.data);
      }
    };
    getPartner();
  }, []);

  // Hàm tính số ngày còn lại của plan
  const getDaysRemaining = (expiredTimestamp: number) => {
    const now = Date.now() / 1000;
    const daysRemaining = Math.ceil((expiredTimestamp - now) / (24 * 60 * 60));
    return daysRemaining;
  };

  const daysRemaining = getDaysRemaining(partner?.plan_expired_at || 0);
  const storeUsagePercent =
    ((partner?.current_stores_count || 0) /
      (partner?.max_stores_allowed || 0)) *
    100;

  return (
    <BasicContent>
      {/* Header */}
      <Card style={{ marginBottom: "24px" }}>
        <Row align="middle" gutter={16}>
          <Col>
            {userInfo.avatar ? (
              <Avatar
                size={64}
                style={{ backgroundColor: "#1677ff" }}
                src={userInfo.avatar}
              />
            ) : (
              <Avatar
                size={64}
                style={{ backgroundColor: "#1677ff" }}
                icon={<UserOutlined />}
              />
            )}
          </Col>
          <Col flex="auto">
            <Title level={2} style={{ margin: 0 }}>
              {partner?.name}
            </Title>
            <Space>
              <Badge
                status={partner?.state === "active" ? "success" : "default"}
                text={
                  partner?.state === "active"
                    ? "Đang hoạt động"
                    : "Không hoạt động"
                }
              />
            </Space>
          </Col>
          <Col>
            <div>
              <Tag color="gold" icon={<CrownOutlined />}>
                Gói {partner?.plan?.name.toLocaleLowerCase()}
              </Tag>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 10,
              }}
            >
              <Button type="primary" onClick={() => setIsShowModalRenew(true)}>
                Gia hạn
              </Button>
              <Button
                type="default"
                onClick={() => setIsShowModalUpgrade(true)}
              >
                Nâng cấp
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col
          xs={24}
          sm={12}
          lg={6}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Card style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Statistic
              title="Cửa hàng hiện tại"
              value={partner?.current_stores_count}
              suffix={`/ ${partner?.max_stores_allowed}`}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
            <Progress
              percent={storeUsagePercent}
              size="small"
              status={storeUsagePercent === 100 ? "success" : "active"}
              style={{ marginTop: "8px" }}
            />
          </Card>
        </Col>
        <Col
          xs={24}
          sm={12}
          lg={6}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Card style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Statistic
              title="Sản phẩm tối đa/cửa hàng"
              value={partner?.max_products_per_store}
              prefix={<ProductOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col
          xs={24}
          sm={12}
          lg={6}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Card style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Statistic
              title="Ngày còn lại"
              value={daysRemaining}
              suffix="ngày"
              prefix={<CalendarOutlined />}
              valueStyle={{
                color: daysRemaining > 7 ? "#52c41a" : "#ff4d4f",
              }}
            />
          </Card>
        </Col>
        <Col
          xs={24}
          sm={12}
          lg={6}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Card style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Statistic
              title="Trạng thái"
              value={
                partner?.state === "active" ? "Hoạt động" : "Không hoạt động"
              }
              prefix={<CheckCircleOutlined />}
              valueStyle={{
                color: partner?.state === "active" ? "#52c41a" : "#ff4d4f",
              }}
            />
          </Card>
        </Col>
      </Row>
      {isShowModalRenew && (
        <ModalRenewOrderPlan
          isShowModal={isShowModalRenew}
          setIsShowModal={setIsShowModalRenew}
          partner={partner || ({} as IPartner)}
        />
      )}
      {isShowModalUpgrade && (
        <ModalUpgradeOrderPlan
          isShowModal={isShowModalUpgrade}
          setIsShowModal={setIsShowModalUpgrade}
        />
      )}
    </BasicContent>
  );
}
