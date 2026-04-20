export enum BasicStatus {
  DISABLE = "inactive",
  ENABLE = "active",
  PENDING = "pending",
  REJECT = "reject",
}

export enum LocalEnum {
  vi_VN = "vi_VN",
  en_US = "en_US",
}

export enum HideInMenu {
  SHOW = 0,
  HIDE = 1,
}

export enum ActionEnum {
  CREATE = "c",
  READ = "r",
  UPDATE = "u",
  DELETE = "d",
}

export const COLOR = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
];

export enum PartnerType {
  SYSTEM = "system",
  ADMIN = "admin",
  MEMBER = "member",
}

export const ProductTypeStatus = {
  active: { text: "Hoạt động", color: "green" },
  inactive: { text: "Tạm ngưng", color: "gray" },
  pending: { text: "Chờ phê duyệt", color: "gold" },
  reject: { text: "Từ chối", color: "red" },
};

export const BannerType = {
  SLIDE: "slide",
  CARD: "card",
};

export const OrderState = {
  pending: { text: "Chờ xác nhận", value: "pending", color: "gold" },
  confirmed: { text: "Đã xác nhận", value: "confirmed", color: "green" },
  shipping: { text: "Đang giao", value: "shipping", color: "blue" },
  completed: { text: "Đã giao", value: "completed", color: "green" },
  cancelled: { text: "Đã hủy", value: "cancelled", color: "red" },
};

export const VoucherType = {
  point: { text: "Đổi điểm", value: "point" },
  free: { text: "Miễn phí", value: "free" },
  gift: { text: "Quà tặng", value: "gift" },
};
