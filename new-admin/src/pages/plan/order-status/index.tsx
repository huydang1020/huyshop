import { BasicContent } from "#src/components/index.js";
import { useCreateOrderPlanVnpay } from "#src/store/order-plan.js";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Card, Result } from "antd";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function OrderPlanStatus() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("vnp_ResponseCode");
  const order_code = searchParams.get("vnp_TxnRef");
  const createOrderPlanVnpay = useCreateOrderPlanVnpay();

  useEffect(() => {
    const createOrderPlan = async () => {
      await createOrderPlanVnpay(order_code || "");
    };
    if (code === "00") {
      createOrderPlan();
    }
  }, [code, order_code]);

  const getPaymentStatus = (statusCode: string) => {
    switch (statusCode) {
      case "00":
        return {
          status: "success" as const,
          title: "Giao dịch thành công",
          subTitle: "Giao dịch của bạn đã được xử lý thành công.",
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        };
      case "24":
        return {
          status: "error" as const,
          title: "Giao dich đã bị hủy",
          subTitle: "Bạn đã hủy giao dịch.",
          icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
        };
      default:
        return {
          status: "error" as const,
          title: "Giao dịch thất bại",
          subTitle: `Giao dịch của bạn không thành công.`,
          icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        };
    }
  };

  if (!code) return null;

  const statusInfo = getPaymentStatus(code);

  return (
    <BasicContent>
      <Card className="bg-gray-100">
        <Card className="shadow-lg">
          <Result
            status={statusInfo.status}
            title={statusInfo.title}
            subTitle={statusInfo.subTitle}
          />
        </Card>
      </Card>
    </BasicContent>
  );
}
