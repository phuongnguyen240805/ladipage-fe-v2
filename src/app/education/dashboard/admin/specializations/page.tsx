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

type Specialization = {
  specializationId?: string;
  code?: string;
  name?: string;
  description?: string;
  departmentId?: string;
  departmentName?: string;
  majorId?: string;
  majorName?: string;
  isActive?: boolean;
};

const specializationApi = crudApi<Specialization>('/api/v1/specializations/admin');

export default function SpecializationsPage() {
  return (
    <AdminResourcePage<Specialization>
      title="Chuyên ngành đào tạo"
      description="Quản lý chuyên ngành chi tiết theo từng ngành học"
      api={specializationApi}
      idKey="specializationId"
      columns={[
        { key: "code", label: "Mã chuyên ngành" },
        { key: "name", label: "Tên chuyên ngành" },
        { key: "majorName", label: "Ngành" },
        { key: "departmentName", label: "Khoa" },
        { key: "description", label: "Mô tả" },
        { 
          key: "isActive", 
          label: "Trạng thái",
          render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs ${
              row.isActive 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {row.isActive ? "Hoạt động" : "Không hoạt động"}
            </span>
          )
        },
      ]}
      fields={[
        { key: "code", label: "Mã chuyên ngành", required: true, placeholder: "VD: CNTT_LTW" },
        { key: "name", label: "Tên chuyên ngành", required: true, placeholder: "VD: Lập trình web" },
        { key: "majorId", label: "ID Ngành", required: true, placeholder: "UUID của ngành học" },
        { key: "departmentId", label: "ID Khoa", required: true, placeholder: "UUID của khoa (lấy từ trang Khoa)" },
        { key: "description", label: "Mô tả", type: "textarea", placeholder: "Mô tả chi tiết về chuyên ngành..." },
        { key: "isActive", label: "Kích hoạt", type: "boolean" },
      ]}
      initialForm={{ isActive: true }}
    />
  );
}