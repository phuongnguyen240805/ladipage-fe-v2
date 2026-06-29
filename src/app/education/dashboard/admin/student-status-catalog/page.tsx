"use client";

import { AdminResourcePage } from "@/features/education/components/admin/AdminResourcePage";
import { request } from "@/features/education/utils/request";
import { unwrapApiResponse } from "@/features/education/api/response";

function crudApi<T>(path: string) {
  return {
    getAll: async (params?: any) => {
      const response = await request.get(path, { params });
      const data = unwrapApiResponse<any>(response);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.content)) return data.content;
      return [];
    },
    getPage: async (params?: any) => {
      const response = await request.get(path, { params });
      const data = unwrapApiResponse<any>(response);
      if (Array.isArray(data)) return { rows: data, total: data.length };
      if (Array.isArray(data?.content)) return { rows: data.content, total: data.totalElements };
      return { rows: [], total: 0 };
    },
    getById: async (id: string) => {
      const response = await request.get(`${path}/${id}`);
      return unwrapApiResponse<T>(response);
    },
    create: async (data: Partial<T>) => {
      const response = await request.post(path, data);
      return unwrapApiResponse<T>(response);
    },
    update: async (id: string, data: Partial<T>) => {
      const response = await request.put(`${path}/${id}`, data);
      return unwrapApiResponse<T>(response);
    },
    delete: async (id: string) => {
      await request.delete(`${path}/${id}`);
    },
  };
}

type StudentStatusCatalog = {
  studentStatusId?: string;
  code?: string;
  name?: string;
  description?: string;
  statusType?: string;
  color?: string;
  isActive?: boolean;
  sortOrder?: number;
};

const studentStatusCatalogApi = crudApi<StudentStatusCatalog>('/api/v1/student-status-catalog/admin');

export default function StudentStatusCatalogPage() {
  return (
    <AdminResourcePage<StudentStatusCatalog>
      title="Danh mục trạng thái sinh viên"
      description="Định nghĩa các trạng thái học tập của sinh viên"
      api={studentStatusCatalogApi}
      idKey="studentStatusId"
      columns={[
        { key: "code", label: "Mã trạng thái" },
        { key: "name", label: "Tên trạng thái" },
        { key: "statusType", label: "Loại" },
        { 
          key: "color", 
          label: "Màu sắc",
          render: (row) => (
            <div className="flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-full border shadow-sm" 
                style={{ backgroundColor: row.color || "#cbd5e1" }} 
              />
              <span className="text-xs font-mono">{row.color || "#cbd5e1"}</span>
            </div>
          )
        },
        { key: "description", label: "Mô tả" },
        { 
          key: "isActive", 
          label: "Trạng thái",
          render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs ${
              row.isActive 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {row.isActive ? "Kích hoạt" : "Vô hiệu"}
            </span>
          )
        },
        { key: "sortOrder", label: "STT" },
      ]}
      fields={[
        { key: "code", label: "Mã trạng thái", required: true, placeholder: "VD: STUDYING, SUSPEND, DROPOUT" },
        { key: "name", label: "Tên trạng thái", required: true, placeholder: "VD: Đang học, Bảo lưu" },
        { key: "statusType", label: "Loại trạng thái", required: true, placeholder: "ACTIVE, INACTIVE, GRADUATED" },
        { key: "color", label: "Mã màu (HEX)", placeholder: "#10b981" },
        { key: "description", label: "Mô tả", type: "textarea" },
        { key: "sortOrder", label: "Thứ tự", type: "number", placeholder: "1, 2, 3..." },
        { key: "isActive", label: "Kích hoạt", type: "boolean" },
      ]}
      initialForm={{ isActive: true, sortOrder: 0 }}
    />
  );
}