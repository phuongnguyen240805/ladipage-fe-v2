"use client";

import { AdminResourcePage } from "@/features/education/components/admin/AdminResourcePage";
import { academicCohortApi } from "@/features/education/api/academic-cohort";
import type { AcademicCohort } from "@/features/education/types/lookup";

export default function AcademicCohortsPage() {
  return (
    <AdminResourcePage<AcademicCohort>
      title="Khóa đào tạo"
      description="Quản lý khóa sinh viên theo năm bắt đầu và kết thúc."
      api={academicCohortApi as any}
      idKey="academicCohortId"
      columns={[
        { key: "code", label: "Mã khóa" },
        { key: "name", label: "Tên khóa" },
        { key: "startYear", label: "Năm bắt đầu" },
        { key: "endYear", label: "Năm kết thúc" },
        { key: "isActive", label: "Trạng thái" },
      ]}
      fields={[
        { key: "code", label: "Mã khóa", required: true },
        { key: "name", label: "Tên khóa", required: true },
        { key: "startYear", label: "Năm bắt đầu", type: "number" },
        { key: "endYear", label: "Năm kết thúc", type: "number" },
        { key: "isActive", label: "Đang hoạt động", type: "boolean" },
      ]}
      initialForm={{ isActive: true }}
    />
  );
}
