import { toastUtil } from "#src/components/toast";
import * as planService from "#src/services/plan.js";
import { usePreferencesStore } from "#src/store/index.js";
import { useCreateOrderPlan } from "#src/store/order-plan.js";
import { ICreateOrderPlanRequest, IPlan } from "#src/types/plan.js";
import { BasicStatus } from "#src/utils/enum.js";
import { formatCurrency } from "#src/utils/helper.js";
import { CheckOutlined } from "@ant-design/icons";
import { Button, Card, Modal, Radio } from "antd";
import { useEffect, useState } from "react";

export type ModalUpgradeOrderPlanProps = {
  isShowModal: boolean;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

interface ISelectPlan {
  plan: IPlan;
  type: string;
}

export function ModalUpgradeOrderPlan(props: ModalUpgradeOrderPlanProps) {
  const { isShowModal, setIsShowModal, onSuccess } = props;
  const createOrderPlan = useCreateOrderPlan();
  const preference = usePreferencesStore();
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ISelectPlan | null>(null);
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);
  const [billingType, setBillingType] = useState<"tháng" | "năm">("tháng");
  const [isFetchPlans, setIsFetchPlans] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      const resp = await planService.getListPlan({
        state: BasicStatus.ENABLE,
      } as any);
      if (resp.data.plans) {
        setIsFetchPlans(true);
        setPlans(resp.data.plans);
      }
    };
    if (isShowModal && !isFetchPlans) {
      fetchPlans();
    }
  }, [isShowModal, isFetchPlans]);

  const getPrice = (
    prices: Array<{ type: string; price: number }>,
    type: string
  ) => {
    return prices.find((p) => p.type === type)?.price || 0;
  };

  const getYearlySavings = (prices: Array<{ type: string; price: number }>) => {
    const monthlyPrice = getPrice(prices, "tháng");
    const yearlyPrice = getPrice(prices, "năm");
    const monthlyCost = monthlyPrice * 12;
    const savings = ((monthlyCost - yearlyPrice) / monthlyCost) * 100;
    return Math.round(savings);
  };

  const onFinish = async () => {
    try {
      setIsLoadingBtn(true);
      if (!selectedPlan) {
        toastUtil.error("Vui lòng chọn gói dịch vụ");
        return;
      }
      const resp = await createOrderPlan({
        plan_id: selectedPlan?.plan.id,
        plan_type: selectedPlan?.type,
        vnpay_return_url: `${window.location.origin}/plan/order-status`,
      });

      console.log("🚀 ~ onSubmit ~ resp:", resp);

      if (!resp || resp.code !== 0) {
        toastUtil.error("Nâng cấp gói dịch vụ thất bại");
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

  return (
    <Modal
      forceRender
      title="Nâng cấp gói dịch vụ"
      open={isShowModal}
      footer={null}
      onCancel={onCancel}
      width="50vw"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg">
          <div className="container">
            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <Radio.Group
                value={billingType}
                onChange={(e) => setBillingType(e.target.value)}
                className="bg-muted p-1 rounded-lg"
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="tháng" className="!px-6">
                  Gói tháng
                </Radio.Button>
                <Radio.Button value="năm" className="!px-6">
                  Gói năm
                </Radio.Button>
              </Radio.Group>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => {
                const currentPrice = getPrice(plan.prices, billingType);
                const yearlySavings = getYearlySavings(plan.prices);
                const isSelected =
                  selectedPlan?.plan.id === plan.id &&
                  selectedPlan?.type === billingType;

                return (
                  <Card
                    key={plan.id}
                    className={`relative ${!isSelected ? "border-border" : ""}`}
                    style={
                      isSelected
                        ? {
                            border: "1px solid",
                            borderColor: preference.themeColorPrimary,
                          }
                        : undefined
                    }
                  >
                    <div>
                      <div>
                        <span className="text-xl font-bold">{plan.name}</span>
                      </div>
                      <span className="text-xl font-bold">
                        {formatCurrency(currentPrice)}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        /{billingType}
                      </span>
                      {billingType === "năm" && yearlySavings > 0 && (
                        <div className="text-sm text-green-600 mt-1">
                          Tiết kiệm {yearlySavings}% so với thanh toán hàng
                          tháng
                        </div>
                      )}
                    </div>

                    <Button
                      type="primary"
                      className="w-full mt-6 mb-6"
                      onClick={() => {
                        setSelectedPlan({
                          plan: plan,
                          type: billingType,
                        });
                      }}
                    >
                      {selectedPlan?.plan.id === plan.id &&
                      selectedPlan?.type === billingType ? (
                        <span className="flex items-center gap-2">
                          <CheckOutlined />
                          Đã chọn
                        </span>
                      ) : (
                        "Chọn gói"
                      )}
                    </Button>

                    {/* Store and Product Limits */}
                    <div className="mb-6 p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Số cửa hàng:</span>
                          <span className="font-medium">
                            {plan.max_stores_allowed === -1
                              ? "∞"
                              : plan.max_stores_allowed}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sản phẩm/cửa hàng:</span>
                          <span className="font-medium">
                            {plan.max_products_per_store === -1
                              ? "∞"
                              : plan.max_products_per_store}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <CheckOutlined className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col items-center justify-center mt-6">
              <div>
                <span className="italic">
                  *Vui lòng bấm tiếp tục để tiến hành thanh toán*
                </span>
              </div>
              <Button
                type="primary"
                onClick={onFinish}
                className="mt-4"
                disabled={!selectedPlan}
                loading={isLoadingBtn}
              >
                Tiếp tục
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
