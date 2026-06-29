"use client";

import { AdminResourcePage } from "@/features/education/components/admin/AdminResourcePage";
import { divisionApi, type Division } from "@/features/education/api/admin-resources";

export default function DivisionsPage() {
  return (
    <AdminResourcePage<Division>
      title="Bộ phận chuyên môn"
      description="Quản lý danh mục phòng ban, bộ phận hành chính và chuyên môn."
      api={divisionApi}
      idKey="divisionId"
      columns={[
        { key: "code", label: "Mã" },
        { key: "name", label: "Tên bộ phận" },
        { key: "description", label: "Mô tả" },
        { key: "isActive", label: "Trạng thái" },
      ]}
      fields={[
        { key: "code", label: "Mã bộ phận", required: true },
        { key: "name", label: "Tên bộ phận", required: true },
        { key: "description", label: "Mô tả", type: "textarea" },
        { key: "isActive", label: "Trạng thái", type: "boolean" },
      ]}
      initialForm={{ isActive: true }}
    />
  );
}
