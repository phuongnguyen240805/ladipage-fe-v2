export type CustomerStatus = "ACTIVE" | "BLOCKED";

export type CustomerItem = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: CustomerStatus;
  createdAt: string;
  segment?: string;
  tags: string[];
};

export type CompanyItem = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type SegmentItem = {
  id: string;
  name: string;
  isDefault: boolean;
  customerCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TagItem = {
  id: string;
  name: string;
  count: number;
  createdAt: string;
  updatedAt: string;
};

export type CustomFieldType = "Chữ" | "Số" | "Ngày tháng" | "Danh sách" | "Đúng/Sai";

export type CustomFieldItem = {
  id: string;
  displayName: string;
  fieldName: string;
  dataType: CustomFieldType;
  description: string;
};

export type ErrorLogItem = {
  id: string;
  time: string;
  errorCode: string;
  customer: string;
  actionType: string;
  errorContent: string;
};
