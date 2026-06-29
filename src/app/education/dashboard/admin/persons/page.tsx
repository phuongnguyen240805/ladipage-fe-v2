"use client";

import { AdminResourcePage } from "@/features/education/components/admin/AdminResourcePage";
import { personAdminApi, type Person } from "@/features/education/api/admin-resources";

export default function PersonsPage() {
  return (
    <AdminResourcePage<Person>
      title="Hồ sơ cá nhân"
      description="Tra cứu dữ liệu nền Persons dùng chung cho sinh viên, giảng viên và nhân viên."
      api={personAdminApi}
      idKey="personId"
      readOnly
      columns={[
        { key: "fullName", label: "Họ tên" },
        { key: "gender", label: "Giới tính" },
        { key: "dateOfBirth", label: "Ngày sinh" },
        { key: "contactEmail", label: "Email liên hệ" },
        { key: "phoneNumber", label: "Số điện thoại" },
        { key: "isActive", label: "Hoạt động" },
      ]}
    />
  );
}
