"use client";

import { AdminResourcePage } from "@/features/education/components/admin/AdminResourcePage";
import { degreeApi } from "@/features/education/api/degree";
import { majorApi } from "@/features/education/api/major";
import type { Degree } from "@/features/education/types/lookup";
import { useEffect, useState } from "react";

export default function DegreesPage() {
  const [fieldOptions, setFieldOptions] = useState<Record<string, { value: string; label: string }[]>>({});

  useEffect(() => {
    const loadMajors = async () => {
      try {
        const majors = await majorApi.getAll({ isActive: true, size: 200 });
        const majorOpts = (majors || []).map((m) => ({ value: m.majorId || (m as any).id || '', label: m.name || m.code || '—' }));
        setFieldOptions({ majorId: majorOpts });
      } catch (err) {
        // ignore
      }
    };
    loadMajors();
  }, []);

  return (
    <AdminResourcePage<Degree>
      title="Bằng cấp / học vị"
      description="Quản lý học vị, chuyên ngành và thông tin đào tạo của nhân sự."
      api={degreeApi as any}
      idKey="degreeId"
      columns={[
        { key: "code", label: "Mã" },
        { key: "name", label: "Tên học vị" },
        { key: "majorId", label: "Ngành", render: (row) => {
          const id = row.majorId;
          const label = fieldOptions?.majorId?.find((m) => m.value === id)?.label;
          return label || (id ? 'Đã liên kết' : '—');
        } },
        { key: "isActive", label: "Trạng thái" },
      ]}
      fields={[
        { key: "code", label: "Mã học vị", required: true },
        { key: "name", label: "Tên học vị", required: true },
        { key: "majorId", label: "Ngành" },
        { key: "isActive", label: "Đang hoạt động", type: "boolean" },
      ]}
      fieldOptions={fieldOptions}
      initialForm={{ isActive: true }}
    />
  );
}
