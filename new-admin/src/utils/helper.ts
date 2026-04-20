import type { RcFile } from "antd/es/upload";

export const RoleGroup = [
  "home",
  "system",
  "page",
  "role",
  "user",
  "partner",
  "store",
  "category",
  "banner",
  "order_plan",
  "plan",
  "product_type",
  "order",
  "reviews",
  "voucher",
  "point_exchange",
];

export const getBlobUrl = (imgFile: RcFile) => {
  const fileBlob = new Blob([imgFile]);
  const thumbnailUrl = URL.createObjectURL(fileBlob);
  return thumbnailUrl;
};

export const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const formatCurrency = (price: number) => {
  return `${price.toLocaleString()} ₫`;
};

export const formatNumber = (number: number) => {
  return new Intl.NumberFormat("vi-VN").format(number);
};

export const convertToArrayOfCombinations = (data: any) => {
  // Bước 1: Tạo một object để lưu trữ tất cả các thuộc tính và giá trị của chúng
  const properties: any = {};

  // Lấy tất cả các thuộc tính và giá trị từ mảng đầu vào
  data.forEach((item: any) => {
    properties[item.name] = item.value;
  });

  // Bước 2: Tạo các kết hợp
  const result: any = [];

  // Hàm đệ quy để tạo tất cả các kết hợp có thể
  function generateCombinations(currentIndex: number, currentCombination: any) {
    // Nếu đã xử lý hết tất cả các thuộc tính, thêm kết hợp hiện tại vào kết quả
    if (currentIndex === Object.keys(properties).length) {
      result.push({ ...currentCombination });
      return;
    }

    // Lấy thuộc tính hiện tại và các giá trị của nó
    const currentProperty = Object.keys(properties)[currentIndex];
    const currentValues = properties[currentProperty];

    // Duyệt qua từng giá trị của thuộc tính hiện tại
    for (const value of currentValues) {
      // Thêm giá trị hiện tại vào kết hợp đang xây dựng
      currentCombination[currentProperty] = value;

      // Gọi đệ quy để xử lý thuộc tính tiếp theo
      generateCombinations(currentIndex + 1, currentCombination);
    }
  }

  // Bắt đầu quá trình tạo kết hợp
  generateCombinations(0, {});

  return result;
};
