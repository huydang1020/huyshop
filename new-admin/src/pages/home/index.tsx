import { BasicContent } from "#src/components";
import useAuthStore from "#src/store/auth.js";
import useDashboardStore, {
  useGetOverview,
  useGetReportProductHighestSales,
  useGetReportProductHighestViews,
  useGetRevenue,
} from "#src/store/dashboard.js";
import usePartnerStore, { useListPartner } from "#src/store/partner.js";
import { formatCurrency } from "#src/utils/helper.js";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CodeOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  GiftOutlined,
  HourglassOutlined,
  ProductOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  TruckOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  DatePickerProps,
  Form,
  Row,
  Select,
  Space,
  Statistic,
} from "antd";
import { Bar, Line, Pie } from "react-chartjs-2";

import { useEffect, useState } from "react";
import { usePreferencesStore } from "#src/store/index.js";
import { PartnerType } from "#src/utils/enum.js";

export default function Home() {
  const listPartner = useListPartner();
  const getOverview = useGetOverview();
  const getRevenue = useGetRevenue();
  const getReportProductHighestViews = useGetReportProductHighestViews();
  const getReportProductHighestSales = useGetReportProductHighestSales();
  const { themeColorPrimary } = usePreferencesStore();
  const {
    overview,
    revenue,
    reportProductHighestViews,
    reportProductHighestSales,
  } = useDashboardStore();
  const { partners } = usePartnerStore();

  const { userInfo } = useAuthStore();

  const [form] = Form.useForm();
  const [groupByMode, setGroupByMode] = useState<"month" | "year">("month");

  useEffect(() => {
    getOverview();
    getRevenue({ group_by: "month" });
    listPartner({ type: "seller" });
    getReportProductHighestViews();
    getReportProductHighestSales();
  }, []);

  const onChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString);
  };

  const formatLabels = (labels: string[], mode: "month" | "year") => {
    if (!labels) return [];

    if (mode === "month") {
      // Nếu group by month thì labels là các ngày → hiển thị: "Ngày 01", "Ngày 02", ...
      return labels.map((label) => `Ngày ${label}`);
    } else {
      // Nếu group by year thì labels là các tháng → hiển thị: "Tháng 1", "Tháng 2", ...
      return labels.map((label) => `Tháng ${parseInt(label)}`);
    }
  };

  const convertObjectToChartData = (data: Record<string, number>) => {
    if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
      // Fallback data for demo
      return {
        labels: ["Sản phẩm A", "Sản phẩm B", "Sản phẩm C"],
        values: [40, 30, 30],
      };
    }

    const entries = Object.entries(data);
    const labels = entries.map(([name]) => name);
    const values = entries.map(([, value]) => value);

    console.log("Chart data:", { labels, values });
    return { labels, values };
  };

  const onFinish = (values: any) => {
    const params: any = {};

    // Nếu có partner_id thì thêm vào params
    if (values.partner_id) {
      params.partner_id = values.partner_id;
    }

    // Xử lý group_by dựa trên month/year picker
    if (values.month) {
      // Nếu chọn month thì group_by = "month" và truyền cả month, year
      params.group_by = "month";
      params.month = values.month.month() + 1; // month() trả về 0-11, cần +1
      params.year = values.month.year();
      setGroupByMode("month");
    } else if (values.year) {
      // Nếu chỉ chọn year thì group_by = "year" và truyền year
      params.group_by = "year";
      params.year = values.year.year();
      setGroupByMode("year");
    } else {
      // Mặc định group_by = "month"
      params.group_by = "month";
      setGroupByMode("month");
    }

    console.log("Filter params:", params);
    getRevenue(params);
  };

  const onReset = () => {
    form.resetFields();
    setGroupByMode("month");
    getRevenue({ group_by: "month" });
  };

  return (
    <BasicContent>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card title="Tổng quan">
          {/* Main Statistics */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={overview?.total_revenue || 0}
                  formatter={(value) => formatCurrency(Number(value))}
                  prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>

            {userInfo?.partner?.type === PartnerType.ADMIN && (
              <>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng đối tác"
                      value={overview?.total_partners || 0}
                      prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng người dùng"
                      value={overview?.total_users || 0}
                      prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng voucher"
                      value={overview?.total_vouchers || 0}
                      prefix={<GiftOutlined style={{ color: "#1890ff" }} />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Tổng code đã sử dụng"
                      value={overview?.total_code_used || 0}
                      prefix={<CodeOutlined style={{ color: "#1890ff" }} />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
              </>
            )}

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng đơn hàng"
                  value={overview?.total_orders || 0}
                  prefix={<ShoppingCartOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng sản phẩm"
                  value={overview?.total_product || 0}
                  prefix={<ProductOutlined style={{ color: "#722ed1" }} />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng cửa hàng"
                  value={overview?.total_stores || 0}
                  prefix={<ShopOutlined style={{ color: "#fa8c16" }} />}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Order Status Statistics */}
        <Card title="Trạng thái đơn hàng">
          <Row gutter={[16, 16]}>
            {/* Pending Orders */}
            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Statistic
                  title="Chờ xử lý"
                  value={overview?.order_status?.pending || 0}
                  prefix={<HourglassOutlined style={{ color: "#faad14" }} />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>

            {/* Processing Orders */}
            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Statistic
                  title="Đang xử lý"
                  value={overview?.order_status?.processing || 0}
                  prefix={<SyncOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>

            {/* Confirmed Orders */}
            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Statistic
                  title="Đã xác nhận"
                  value={overview?.order_status?.confirmed || 0}
                  prefix={
                    <ExclamationCircleOutlined style={{ color: "#722ed1" }} />
                  }
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>

            {/* Shipping Orders */}
            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Statistic
                  title="Đang giao hàng"
                  value={overview?.order_status?.shipping || 0}
                  prefix={<TruckOutlined style={{ color: "#13c2c2" }} />}
                  valueStyle={{ color: "#13c2c2" }}
                />
              </Card>
            </Col>

            {/* Completed Orders */}
            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Statistic
                  title="Hoàn thành"
                  value={overview?.order_status?.completed || 0}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>

            {/* Cancelled Orders */}
            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ textAlign: "center" }}>
                <Statistic
                  title="Đã hủy"
                  value={overview?.order_status?.cancelled || 0}
                  prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
          </Row>
        </Card>

        <Card title="Doanh thu">
          <Form
            style={{ display: "flex", justifyContent: "center" }}
            layout="inline"
            onFinish={onFinish}
            onFinishFailed={() => {}}
            autoComplete="off"
            form={form}
          >
            {userInfo?.partner?.type === PartnerType.ADMIN && (
              <Form.Item label="Đối tác" name="partner_id">
                <Select
                  allowClear
                  showSearch
                  style={{ width: 200 }}
                  optionFilterProp="label"
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? "")
                      .toLowerCase()
                      .localeCompare((optionB?.label ?? "").toLowerCase())
                  }
                  placeholder="Chọn đối tác"
                  options={partners.map((partner) => ({
                    label: partner.name,
                    value: partner.id,
                  }))}
                />
              </Form.Item>
            )}

            <Form.Item label="Tháng/năm" name="month">
              <DatePicker onChange={onChange} picker="month" />
            </Form.Item>

            <Form.Item label="Năm" name="year">
              <DatePicker onChange={onChange} picker="year" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
                <Button onClick={onReset}>Làm lại</Button>
              </Space>
            </Form.Item>
          </Form>

          <Bar
            style={{ marginTop: 16 }}
            data={{
              labels: formatLabels(revenue?.labels || [], groupByMode),
              datasets: [
                {
                  label: "Doanh thu",
                  data: revenue?.values || [],
                  backgroundColor: themeColorPrimary,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
          />
        </Card>

        <Card title="Top sản phẩm bán chạy / có lượt xem cao nhất">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={12}>
              <Card title="Top sản phẩm bán chạy">
                <Pie
                  data={{
                    labels: convertObjectToChartData(
                      (reportProductHighestSales as any) || {}
                    ).labels,
                    datasets: [
                      {
                        label: "Số lượng bán",
                        data: convertObjectToChartData(
                          (reportProductHighestSales as any) || {}
                        ).values,
                        backgroundColor: [
                          "#42a5f5",
                          "#66bb6a",
                          "#ffa726",
                          "#ef5350",
                          "#ab47bc",
                          "#26a69a",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "bottom" },
                    },
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={12}>
              <Card title="Top sản phẩm có lượt xem cao nhất">
                <Pie
                  data={{
                    labels: convertObjectToChartData(
                      (reportProductHighestViews as any) || {}
                    ).labels,
                    datasets: [
                      {
                        label: "Lượt xem",
                        data: convertObjectToChartData(
                          (reportProductHighestViews as any) || {}
                        ).values,
                        backgroundColor: [
                          "#42a5f5",
                          "#66bb6a",
                          "#ffa726",
                          "#ef5350",
                          "#ab47bc",
                          "#26a69a",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "bottom" },
                    },
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      </Space>
    </BasicContent>
  );
}
