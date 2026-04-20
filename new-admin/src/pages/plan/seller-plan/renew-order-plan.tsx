import { toastUtil } from "#src/components/toast";
import { useCreateOrderPlan } from "#src/store/order-plan.js";
import { IPlan } from "#src/types/plan.js";
import { Button, Modal, Space } from "antd";
import { useState } from "react";

export type ModalRenewOrderPlanProps = {
  isShowModal: boolean;
  setIsShowModal: (value: boolean) => void;
  partner: IPartner;
  onSuccess?: VoidFunction;
};

export function ModalRenewOrderPlan(props: ModalRenewOrderPlanProps) {
  const { isShowModal, setIsShowModal, onSuccess, partner } = props;
  const createOrderPlan = useCreateOrderPlan();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const onFinish = async () => {
    try {
      setIsLoadingBtn(true);
      const resp = await createOrderPlan({
        plan_id: partner.plan_id,
        plan_type: partner.plan_type,
        vnpay_return_url: `${window.location.origin}/plan/order-status`,
      });

      console.log("🚀 ~ onSubmit ~ resp:", resp);

      if (!resp || resp.code !== 0) {
        toastUtil.error("Gia hạn gói dịch vụ thất bại");
        return;
      }

      if (resp.data && resp.data.vnp_redirect_url) {
        window.location.replace(resp.data.vnp_redirect_url);
        return;
      }
      onSuccess?.();
      setIsShowModal(false);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoadingBtn(false);
    }
  };

  const onCancel = () => {
    setIsShowModal(false);
  };

  const getDaysRemaining = (expiredTimestamp: number) => {
    const now = Date.now() / 1000;
    const daysRemaining = Math.ceil((expiredTimestamp - now) / (24 * 60 * 60));
    return daysRemaining;
  };

  const daysRemaining = getDaysRemaining(partner?.plan_expired_at || 0);

  return (
    <Modal
      forceRender
      title="Gia hạn gói dịch vụ"
      open={isShowModal}
      footer={null}
      onCancel={onCancel}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-lg">
            Bạn đang sử dụng{" "}
            <strong>GÓI {partner?.plan?.name.toUpperCase()}</strong> với thời
            hạn {daysRemaining} ngày
          </div>
          <div className="text-sm text-gray-500">
            Vui lòng nhấn tiếp tục để tiến hành thanh toán
          </div>
        </div>
        <Space>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" onClick={onFinish} loading={isLoadingBtn}>
            Tiếp tục
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
