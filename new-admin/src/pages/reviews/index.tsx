import RenderIcon from "#src/components/icon/RenderIcon.js";
import { BasicContent } from "#src/components/index.js";
import { toastUtil } from "#src/components/toast/index.js";
import useReviewsStore, {
  useListReviews,
  useUpdateReviews,
} from "#src/store/reviews.js";
import { IReviews } from "#src/types/reviews.js";
import { formatCurrency } from "#src/utils/helper.js";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { ProTable, type ProColumns } from "@ant-design/pro-components";
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Image,
  Input,
  Modal,
  Rate,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

export default function ReviewsPage() {
  const { Title, Text, Paragraph } = Typography;
  const listReviews = useListReviews();
  const updateReviews = useUpdateReviews();
  const { reviews, total, loading } = useReviewsStore();
  const [reviewDetail, setReviewDetail] = useState<IReviews | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isShowDrawer, setIsShowDrawer] = useState(false);
  const [isModalAddReplyOpen, setIsModalAddReplyOpen] = useState(false);
  const [isModalEditReplyOpen, setIsModalEditReplyOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total,
  });

  useEffect(() => {
    listReviews({
      limit: pagination.pageSize,
      skip: pagination.current - 1,
    });
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total,
    }));
  }, [total]);

  // Set replyContent khi mở modal edit
  useEffect(() => {
    if (isModalEditReplyOpen && reviewDetail?.seller_reply) {
      setReplyContent(reviewDetail.seller_reply);
    }
  }, [isModalEditReplyOpen, reviewDetail]);

  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize,
    }));
  }, []);

  const handleSearch = useCallback(
    (values: Record<string, any>) => {
      listReviews({
        limit: pagination.pageSize,
        skip: pagination.current - 1,
        ...values,
      });
    },
    [listReviews, pagination.pageSize, pagination.current]
  );

  const handleReset = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    listReviews({ limit: 10, skip: 0 });
  }, [listReviews]);

  const handleUpdateReviews = async (reviews_id: string, state: string) => {
    const resp = await updateReviews({
      id: reviews_id,
      state,
    } as any);
    if (resp && resp.code !== 0) {
      toastUtil.error(resp.message);
      return;
    }
    toastUtil.success("Cập nhật trạng thái thành công");
    listReviews({
      limit: pagination.pageSize,
      skip: pagination.current - 1,
    });
  };

  const columns: ProColumns<IReviews>[] = [
    {
      title: "ID",
      dataIndex: "id",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-2">
          <Typography.Text
            code={false}
            copyable={{
              text: record.id,
            }}
            underline={false}
          >
            <Tooltip title={record.id}>{`...${record.id.slice(-5)}`}</Tooltip>
          </Typography.Text>
          <span
            className="ant-menu-item-icon cursor-pointer"
            onClick={() => {
              setReviewDetail(record);
              setIsShowDrawer(true);
            }}
          >
            <RenderIcon
              icon={{ icon_name: "AiOutlineEye", icon_type: "Ant" }}
              style={{ fontSize: 20, color: "blue" }}
            />
          </span>
        </div>
      ),
    },
    {
      title: "Tên người dùng",
      dataIndex: "user_id",
      width: 120,
      hideInSearch: true,
      render: (_, record) => <div>{record.user.full_name}</div>,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product_id",
      width: 150,
      hideInSearch: true,
      render: (_, record) => (
        <div className="truncate">{record.product.name}</div>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      width: 120,
      valueType: "select",
      valueEnum: {
        1: "1 sao",
        2: "2 sao",
        3: "3 sao",
        4: "4 sao",
        5: "5 sao",
      },
      render: (_, record) => <div>{record.rating} sao</div>,
    },
    {
      title: "Nội dung đánh giá",
      dataIndex: "content",
      width: 120,
      hideInSearch: true,
      render: (_, record) => <div>{record.content}</div>,
    },
    {
      title: "Nội dung phản hồi",
      dataIndex: "seller_reply",
      width: 120,
      hideInSearch: true,
      render: (_, record) => <div>{record.seller_reply}</div>,
    },
    {
      title: "Trạng thái",
      dataIndex: "is_seller_reply",
      width: 120,
      valueType: "select",
      valueEnum: {
        true: "Đã phản hồi",
        false: "Chưa phản hồi",
      },
      render: (_, record) => (
        <div>
          {record.seller_reply ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Đã phản hồi
            </Tag>
          ) : (
            <Tag color="orange" icon={<ClockCircleOutlined />}>
              Chưa phản hồi
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      width: 100,
      hideInSearch: true,
      render: (_, record) => (
        <Space>
          {record.seller_reply ? (
            <Tooltip title="Chỉnh sửa phản hồi">
              <span
                className="ant-menu-item-icon cursor-pointer"
                onClick={() => {
                  // Đảm bảo đóng modal khác trước
                  setIsModalAddReplyOpen(false);
                  setReviewDetail(record);
                  setReplyContent(record.seller_reply || "");
                  setIsModalEditReplyOpen(true);
                }}
              >
                <RenderIcon
                  icon={{ icon_name: "AiOutlineEdit", icon_type: "Ant" }}
                  style={{ fontSize: 20, color: "blue" }}
                />
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="Thêm phản hồi">
              <span
                className="ant-menu-item-icon cursor-pointer"
                onClick={() => {
                  // Đảm bảo đóng modal khác trước
                  setIsModalEditReplyOpen(false);
                  setReviewDetail(record);
                  setReplyContent("");
                  setIsModalAddReplyOpen(true);
                }}
              >
                <RenderIcon
                  icon={{ icon_name: "PlusCircleOutlined", icon_type: "antd" }}
                  style={{ fontSize: 20, color: "green" }}
                />
              </span>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <BasicContent>
      <ProTable
        rowKey="id"
        type="table"
        tableClassName="gx-table-responsive"
        headerTitle={
          <Badge count={total || 0} showZero={true}>
            <Typography.Title level={5}>Danh sách đánh giá</Typography.Title>
          </Badge>
        }
        columns={columns}
        dataSource={reviews as any}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: handleTableChange,
        }}
        onSubmit={handleSearch}
        onReset={handleReset}
      />
      <Modal
        title="Thêm phản hồi"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalAddReplyOpen}
        onCancel={() => {
          if (isSubmitting) return;
          setIsModalAddReplyOpen(false);
          setReplyContent("");
          setReviewDetail(null);
        }}
        footer={null}
      >
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Nội dung phản hồi
            </label>
            <Input.TextArea
              placeholder="Nhập nội dung phản hồi..."
              onChange={(e) => setReplyContent(e.target.value)}
              value={replyContent}
              rows={4}
            />
          </div>
          <div>
            <Button
              type="primary"
              loading={isSubmitting}
              disabled={!replyContent.trim()}
              onClick={async () => {
                if (isSubmitting) return;

                setIsSubmitting(true);
                try {
                  const resp = await updateReviews({
                    id: reviewDetail?.id || "",
                    seller_reply: replyContent,
                  } as any);

                  if (resp && resp.code === 0) {
                    setIsModalAddReplyOpen(false);
                    setReplyContent("");
                    setReviewDetail(null);
                    listReviews({
                      limit: pagination.pageSize,
                      skip: pagination.current - 1,
                    });
                  }
                } catch (error) {
                  console.error("Update failed:", error);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              Thêm phản hồi
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title="Chỉnh sửa phản hồi"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalEditReplyOpen}
        onCancel={() => {
          if (isSubmitting) return;
          setIsModalEditReplyOpen(false);
          setReplyContent("");
          setReviewDetail(null);
        }}
        footer={null}
      >
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Nội dung phản hồi
            </label>
            <Input.TextArea
              placeholder="Nhập nội dung phản hồi..."
              onChange={(e) => setReplyContent(e.target.value)}
              value={replyContent}
              rows={4}
            />
          </div>
          <div>
            <Button
              type="primary"
              loading={isSubmitting}
              disabled={!replyContent.trim()}
              onClick={async () => {
                if (isSubmitting) return;

                setIsSubmitting(true);
                try {
                  const resp = await updateReviews({
                    id: reviewDetail?.id || "",
                    seller_reply: replyContent,
                  } as any);

                  if (resp && resp.code === 0) {
                    setIsModalEditReplyOpen(false);
                    setReplyContent("");
                    setReviewDetail(null);
                    // Chỉ gọi lại list khi update thành công
                    listReviews({
                      limit: pagination.pageSize,
                      skip: pagination.current - 1,
                    });
                  }
                } catch (error) {
                  console.error("Update failed:", error);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              Cập nhật phản hồi
            </Button>
          </div>
        </div>
      </Modal>
      <Drawer
        title="Chi tiết đánh giá"
        closable={{ "aria-label": "Close Button" }}
        onClose={() => setIsShowDrawer(false)}
        open={isShowDrawer}
        width="50vw"
      >
        <Card style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                <StarOutlined /> Chi tiết đánh giá
              </Title>
              <Text type="secondary">Mã đánh giá: {reviewDetail?.id}</Text>
            </Col>
            <Col>
              <Tag style={{ fontSize: 14, padding: "4px 12px" }}>
                {reviewDetail?.state}
              </Tag>
            </Col>
          </Row>
        </Card>

        <Descriptions
          size={"small"}
          title="Thông tin khách hàng"
          layout="horizontal"
          bordered
          style={{ marginBottom: "10px" }}
        >
          <Descriptions.Item label="Tên khách hàng" span={4}>
            <p style={{ color: "#000000" }}>{reviewDetail?.user?.full_name}</p>
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại" span={4}>
            <p style={{ color: "#000000" }}>
              {reviewDetail?.user?.phone_number}
            </p>
          </Descriptions.Item>
        </Descriptions>

        <Card title="Thông tin sản phẩm">
          <Row gutter={16} align="middle">
            <Col span={4}>
              <Image
                src={reviewDetail?.product.image}
                alt={reviewDetail?.product.name}
                width={80}
                height={80}
                style={{ objectFit: "cover", borderRadius: 8 }}
              />
            </Col>
            <Col
              span={20}
              style={{ display: "flex", flexDirection: "column", gap: 5 }}
            >
              <Text strong>{reviewDetail?.product.name}</Text>
              {(() => {
                const attributeString = reviewDetail?.product?.attribute_values
                  ? Object.entries(reviewDetail?.product.attribute_values)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(" | ")
                  : "";
                return (
                  <p className="m-0 text-sm text-muted-foreground break-words">
                    {attributeString}
                  </p>
                );
              })()}
            </Col>
          </Row>
        </Card>

        <Card title="Thông tin đánh giá">
          <Descriptions column={1} size="small">
            <Descriptions.Item>
              <Rate disabled value={reviewDetail?.rating} />
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {reviewDetail?.seller_reply ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Đã phản hồi
                </Tag>
              ) : (
                <Tag color="orange" icon={<ClockCircleOutlined />}>
                  Chưa phản hồi
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đánh giá">
              <span>
                {dayjs(reviewDetail?.created_at).format("DD/MM/YYYY HH:mm:ss")}
              </span>
            </Descriptions.Item>
            {reviewDetail?.images && reviewDetail?.images?.length > 0 && (
              <Descriptions.Item label="Hình ảnh đính kèm">
                <Image.PreviewGroup>
                  <Row gutter={8}>
                    {reviewDetail?.images.map((url: string, index: number) => (
                      <Col key={index} style={{ marginBottom: 10 }}>
                        <Image
                          src={url}
                          width={100}
                          height={100}
                          style={{ objectFit: "cover", borderRadius: 8 }}
                        />
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Nội dung đánh giá">
              <Paragraph>{reviewDetail?.content}</Paragraph>
            </Descriptions.Item>
            {reviewDetail?.seller_reply && (
              <Descriptions.Item label="Nội dung phản hồi">
                <Paragraph>{reviewDetail?.seller_reply}</Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      </Drawer>
    </BasicContent>
  );
}
