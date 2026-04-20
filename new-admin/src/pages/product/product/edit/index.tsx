import RichText from "#src/components/richtext/index.js";
import { toastUtil } from "#src/components/toast";
import UploadImage from "#src/components/upload/index.js";
import * as categoryService from "#src/services/category";
import * as storeService from "#src/services/store";
import { useUpdateProductType } from "#src/store/product.js";
import { BasicStatus } from "#src/utils/enum.js";
import {
  InfoCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  type FormProps,
  Input,
  InputNumber,
  Modal,
  Popover,
  Row,
  Select,
  Space,
  Table,
  UploadFile,
} from "antd";
import { useEffect, useState } from "react";

interface ProductDetail {
  name: string;
  value: string;
}

interface ProductVariant {
  key: number;
  name: string;
  image: UploadFile[] | string;
  origin_price: number;
  sell_price: number;
  quantity: number;
  attribute_values: Record<string, string>;
  [key: string]: any;
}

interface ProductFormValues {
  name: string;
  category_id: string;
  brand?: string;
  origin?: string;
  store_id?: string;
  description: string;
  product_details: ProductDetail[];
  attribute_values: Array<{ name: string; value: string[] }>;
  products: ProductVariant[];
}

export type ModalEditProductTypeProps = {
  isShowModal: boolean;
  formValue: Partial<IProductType>;
  setIsShowModal: (value: boolean) => void;
  onSuccess?: VoidFunction;
};

export function ModalEditProductType(props: ModalEditProductTypeProps) {
  const { isShowModal, setIsShowModal, onSuccess, formValue } = props;
  const [form] = Form.useForm();
  const updateProductType = useUpdateProductType();
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const [isFetchCategories, setIsFetchCategories] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);

  const [isFetchStores, setIsFetchStores] = useState(false);
  const [stores, setStores] = useState<IStore[]>([]);

  const transformProductDetailsToArray = (
    productDetails: Record<string, string>
  ): ProductDetail[] => {
    return Object.entries(productDetails).map(([name, value]) => ({
      name,
      value,
    }));
  };

  useEffect(() => {
    if (formValue) {
      const result = [];
      let processedProducts: any[] = [];

      if (formValue.products) {
        // Đối tượng để theo dõi các thuộc tính và giá trị
        const attributesMap: any = {};

        // Dùng vòng for để duyệt qua từng sản phẩm
        for (let i = 0; i < formValue.products.length; i++) {
          const product = formValue.products[i];
          const attributeValues = product.attribute_values;

          // Duyệt qua từng thuộc tính trong attribute_values
          for (const attributeName in attributeValues) {
            if (!attributesMap[attributeName]) {
              attributesMap[attributeName] = [];
            }

            const attributeValue = attributeValues[attributeName];

            // Thêm giá trị vào mảng nếu chưa tồn tại
            if (!attributesMap[attributeName].includes(attributeValue)) {
              attributesMap[attributeName].push(attributeValue);
            }
          }
        }

        // Chuyển đổi đối tượng thành mảng kết quả
        for (const attributeName in attributesMap) {
          result.push({
            name: attributeName,
            value: attributesMap[attributeName],
          });
        }

        // Xử lý products để bảo toàn cấu trúc và id
        processedProducts = formValue.products.map(
          (product: any, index: number) => {
            const name = Object.entries(product.attribute_values || {})
              .map(([key, value]) => `${value}`)
              .join(" - ");

            // Xử lý image để tương thích với UploadImage component
            let processedImage: UploadFile[] = [];
            if (product.image) {
              if (typeof product.image === "string" && product.image) {
                // Nếu là string URL, chuyển thành UploadFile format
                processedImage = [
                  {
                    uid: "-1",
                    name: "image.png",
                    status: "done",
                    url: product.image,
                  } as UploadFile,
                ];
              } else if (Array.isArray(product.image)) {
                // Nếu đã là array, giữ nguyên
                processedImage = product.image;
              }
            }

            return {
              key: index,
              name,
              id: product.id, // Bảo toàn id từ dữ liệu gốc
              attribute_values: product.attribute_values,
              image: processedImage,
              origin_price: product.origin_price,
              sell_price: product.sell_price,
              quantity: product.quantity,
            };
          }
        );
      }

      form.setFieldsValue({
        ...formValue,
        product_details: transformProductDetailsToArray(
          formValue.product_details || {}
        ),
        attribute_values: result,
        products: processedProducts,
      });
    }
  }, [formValue, form]);

  useEffect(() => {
    const fetchCategories = async () => {
      const resp = await categoryService.getListCategory({
        state: BasicStatus.ENABLE,
      });
      if (resp.data.categories) {
        setIsFetchCategories(true);
        setCategories(resp.data.categories);
      }
    };

    const fetchStores = async () => {
      const resp = await storeService.getListStore({
        state: BasicStatus.ENABLE,
      });
      if (resp.data.stores) {
        setIsFetchStores(true);
        setStores(resp.data.stores);
      }
    };

    if (isShowModal && !isFetchCategories) {
      fetchCategories();
    }

    if (isShowModal && !isFetchStores) {
      fetchStores();
    }
  }, [isShowModal, isFetchCategories, isFetchStores]);

  const onCancel = () => {
    setIsShowModal(false);
    onSuccess?.();
  };

  const onFinish: FormProps<ProductFormValues>["onFinish"] = async (values) => {
    try {
      setIsLoadingBtn(true);
      const { products, product_details, ...restValues } = values;

      // Logic xử lý:
      // - Sản phẩm có id: đây là sản phẩm đã tồn tại, sẽ được update
      // - Sản phẩm không có id: đây là sản phẩm mới, sẽ được tạo mới
      // - API sẽ tự động xử lý create/update dựa trên có/không có id

      // Chuyển đổi product_details từ array sang object
      const transformedProductDetails: Record<string, string> = {};
      if (Array.isArray(product_details)) {
        for (const item of product_details as ProductDetail[]) {
          transformedProductDetails[item.name] = item.value;
        }
      }

      // Xử lý ảnh cho từng sản phẩm - UploadImage đã tự động upload
      const updatedProducts = products.map((item) => {
        let imageUrl = "";

        // Lấy URL ảnh từ UploadImage component
        if (item.image && Array.isArray(item.image) && item.image.length > 0) {
          const imageFile = item.image[0];
          imageUrl =
            imageFile.url ||
            imageFile.response?.[0]?.url ||
            imageFile.response?.[0] ||
            "";
        }

        const productData: any = {
          name: values.name,
          image: imageUrl,
          origin_price: item.origin_price,
          sell_price: item.sell_price,
          quantity: item.quantity,
          attribute_values: item.attribute_values,
        };

        // Bảo toàn id nếu đây là sản phẩm cũ (đã tồn tại)
        if (item.id) {
          productData.id = item.id;
        }

        return productData;
      });

      // Chuyển đổi dữ liệu để phù hợp với API
      const apiData = {
        id: formValue.id,
        ...restValues,
        products: updatedProducts,
        product_details: transformedProductDetails,
      };

      const resp = await updateProductType(apiData as any);
      if (resp?.code === 0) {
        toastUtil.success(resp?.message);
        onSuccess?.();
        setIsShowModal(false);
        form.resetFields();
      } else {
        toastUtil.error(resp?.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Failed:", error);
      toastUtil.error(error?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoadingBtn(false);
    }
  };

  const onFinishFailed: FormProps<ProductFormValues>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.error("Failed:", errorInfo);
  };

  // Thêm hàm này để cập nhật products khi attribute_values hoặc name thay đổi
  const handleAttributeValuesChange = (changedValues: any, allValues: any) => {
    // Xử lý khi tên sản phẩm thay đổi
    if ("name" in changedValues) {
      const currentProducts = form.getFieldValue("products") || [];
      if (currentProducts.length > 0) {
        const updatedProducts = currentProducts.map((product: any) => ({
          ...product,
          name: Object.entries(product.attribute_values || {})
            .map(([key, value]) => `${value}`)
            .join(" - "),
        }));
        form.setFieldValue("products", updatedProducts);
      }
    }

    if (!("attribute_values" in changedValues)) return;

    const formValues = allValues.attribute_values || [];
    const validValues = formValues.filter(
      (item: any) =>
        item && item.name && Array.isArray(item.value) && item.value.length > 0
    );

    if (!validValues.length) {
      form.setFieldValue("products", []);
      return;
    }

    const combinations = validValues.reduce((acc: any[], curr: any) => {
      if (acc.length === 0) {
        return curr.value.map((value: string) => ({
          [curr.name]: value,
        }));
      }

      const newCombinations: any[] = [];
      acc.forEach((item: any) => {
        curr.value.forEach((value: string) => {
          newCombinations.push({
            ...item,
            [curr.name]: value,
          });
        });
      });
      return newCombinations;
    }, []);

    const oldProducts = form.getFieldValue("products") || [];

    const variants = combinations.map((combination: any, index: number) => {
      const name = Object.entries(combination)
        .map(([key, value]) => `${value}`)
        .join(" - ");
      const attribute_values = Object.entries(combination).reduce(
        (acc, [key, value]) => {
          acc[key] = value as string;
          return acc;
        },
        {} as Record<string, string>
      );

      // Tìm sản phẩm cũ dựa trên attribute_values
      const old = oldProducts.find(
        (v: any) =>
          JSON.stringify(v.attribute_values) ===
          JSON.stringify(attribute_values)
      );

      return {
        key: index,
        name,
        attribute_values,
        // Bảo toàn id của sản phẩm cũ nếu có
        id: old?.id,
        image: old?.image || [],
        origin_price: old?.origin_price,
        sell_price: old?.sell_price,
        quantity: old?.quantity,
      };
    });

    form.setFieldValue("products", variants);
  };

  return (
    <Modal
      forceRender
      title="Chỉnh sửa sản phẩm"
      open={isShowModal}
      footer={null}
      onCancel={onCancel}
      width="70vw"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onValuesChange={handleAttributeValuesChange}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[{ required: true, message: "Hãy nhập tên sản phẩm!" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Danh mục"
              name="category_id"
              rules={[{ required: true, message: "Hãy chọn danh mục!" }]}
            >
              <Select
                showSearch
                allowClear
                placeholder="Chọn danh mục"
                optionFilterProp="label"
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Cửa hàng" name="store_id">
              <Select
                showSearch
                allowClear
                placeholder="Chọn cửa hàng"
                optionFilterProp="label"
                options={stores.map((store) => ({
                  value: store.id,
                  label: store.name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Hãy nhập mô tả!" }]}
            >
              <RichText />
            </Form.Item>
          </Col>
        </Row>

        <Card
          title={
            <Space>
              <span>Cấu hình chi tiết sản phẩm</span>
              <Popover
                content={
                  <small>Chất liệu, kiểu dáng, chế độ bảo hành, ...</small>
                }
                title={
                  <span>
                    Cấu hình chi tiết sản phẩm{" "}
                    <span style={{ fontSize: 12, color: "red" }}>
                      (Tối đa: 10)
                    </span>
                  </span>
                }
                placement="right"
              >
                <InfoCircleOutlined />
              </Popover>
            </Space>
          }
        >
          <Form.List name="product_details">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row
                    key={key}
                    gutter={16}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        label="Tên"
                        name={[name, "name"]}
                        rules={[{ required: true, message: "Hãy nhập tên!" }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        label="Giá trị"
                        name={[name, "value"]}
                        rules={[
                          { required: true, message: "Hãy nhập giá trị!" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    disabled={fields.length >= 10}
                  >
                    Thêm chi tiết
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <Card
          title={
            <Space>
              <span>Cấu hình thuộc tính</span>
              <Popover
                content={<small>Màu sắc, kích cỡ, dung lượng, ...</small>}
                title={
                  <span>
                    Cấu hình thuộc tính{" "}
                    <span style={{ fontSize: 12, color: "red" }}>
                      (Tối đa: 2)
                    </span>
                  </span>
                }
                placement="right"
              >
                <InfoCircleOutlined />
              </Popover>
            </Space>
          }
        >
          <Form.List name="attribute_values">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row
                    key={key}
                    gutter={16}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        label="Tên thuộc tính"
                        name={[name, "name"]}
                        rules={[
                          {
                            required: true,
                            message: "Hãy nhập tên thuộc tính!",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        label="Giá trị"
                        name={[name, "value"]}
                        rules={[
                          { required: true, message: "Hãy nhập giá trị!" },
                        ]}
                      >
                        <Select
                          mode="tags"
                          style={{ width: "100%" }}
                          placeholder="Nhập giá trị"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    disabled={fields.length >= 2}
                  >
                    Thêm thuộc tính
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item
          shouldUpdate={(prevValues, currentValues) => {
            return (
              prevValues?.attribute_values !==
                currentValues?.attribute_values ||
              prevValues?.name !== currentValues?.name
            );
          }}
        >
          {(form) => {
            const formValues = form.getFieldValue("attribute_values") || [];
            // Lọc ra các phần tử có đầy đủ thông tin
            const validValues = formValues.filter(
              (item: any) =>
                item &&
                item.name &&
                Array.isArray(item.value) &&
                item.value.length > 0
            );

            if (!validValues.length) return null;

            // Không còn logic setFieldValue ở đây nữa
            // Table chỉ render theo products đã được cập nhật bởi useEffect

            return (
              <Card title="Danh sách sản phẩm" style={{ marginTop: 16 }}>
                <Form.List name="products">
                  {(fields) => (
                    <Table
                      pagination={false}
                      dataSource={fields}
                      columns={[
                        {
                          title: "STT",
                          width: 70,
                          render: (_, __, index) => index + 1,
                        },
                        {
                          title: "Tên sản phẩm",
                          render: (_, { name }) => {
                            const mainProductName =
                              form.getFieldValue("name") || "";
                            const variantAttributes =
                              form.getFieldValue([
                                "products",
                                name,
                                "attribute_values",
                              ]) || {};

                            // Chuyển đổi attribute_values thành chuỗi hiển thị
                            const attributeString = Object.entries(
                              variantAttributes
                            )
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(" | ");

                            return (
                              <div>
                                <p style={{ margin: 0, fontWeight: "bold" }}>
                                  {mainProductName}
                                </p>
                                <p
                                  style={{
                                    margin: 0,
                                    color: "#666",
                                    fontSize: "13px",
                                  }}
                                >
                                  {attributeString}
                                </p>
                              </div>
                            );
                          },
                        },
                        {
                          title: "Hình ảnh",
                          render: (_, record: any) => (
                            <Form.Item name={[record.name, "image"]}>
                              <UploadImage />
                            </Form.Item>
                          ),
                        },
                        {
                          title: "Giá gốc",
                          render: (_, { name }) => (
                            <Form.Item
                              name={[name, "origin_price"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Hãy nhập giá gốc!",
                                },
                              ]}
                            >
                              <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                  `${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ","
                                  )
                                }
                                parser={(value) =>
                                  value!.replace(/\$\s?|(,*)/g, "")
                                }
                                placeholder="Nhập giá gốc"
                              />
                            </Form.Item>
                          ),
                        },
                        {
                          title: "Giá bán",
                          render: (_, { name }) => (
                            <Form.Item
                              name={[name, "sell_price"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Hãy nhập giá bán!",
                                },
                              ]}
                            >
                              <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                  `${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ","
                                  )
                                }
                                parser={(value) =>
                                  value!.replace(/\$\s?|(,*)/g, "")
                                }
                                placeholder="Nhập giá bán"
                              />
                            </Form.Item>
                          ),
                        },
                        {
                          title: "Số lượng",
                          render: (_, { name }) => (
                            <Form.Item
                              name={[name, "quantity"]}
                              rules={[
                                {
                                  required: true,
                                  message: "Hãy nhập số lượng!",
                                },
                              ]}
                            >
                              <InputNumber
                                style={{ width: "100%" }}
                                placeholder="Nhập số lượng"
                              />
                            </Form.Item>
                          ),
                        },
                      ]}
                    />
                  )}
                </Form.List>
              </Card>
            );
          }}
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
