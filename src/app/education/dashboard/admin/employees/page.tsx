"use client";

import { AdminResourcePage } from "@/features/education/components/admin/AdminResourcePage";
import { employeeApi, type Employee } from "@/features/education/api/admin-resources";

export default function EmployeesPage() {
  return (
    <AdminResourcePage<Employee>
      title="Dữ liệu nhân viên"
      description="Tra cứu bảng Employees nền của giảng viên và nhân viên hành chính."
      api={employeeApi}
      idKey="employeeId"
      readOnly
      columns={[
        { key: "employeeCode", label: "Mã nhân viên" },
        { key: "fullName", label: "Họ tên" },
        { key: "employeeType", label: "Loại" },
        { key: "status", label: "Trạng thái nhân sự" },
        { key: "contractType", label: "Hợp đồng" },
        { key: "isActive", label: "Hoạt động" },
      ]}
    />
  );
}
