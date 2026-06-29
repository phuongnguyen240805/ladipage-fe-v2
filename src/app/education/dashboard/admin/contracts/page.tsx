"use client";

import { AdminResourcePage } from "@/features/education/components/admin/AdminResourcePage";
import { contractApi, type Contract } from "@/features/education/api/admin-resources";

export default function ContractsPage() {
  return (
    <AdminResourcePage<Contract>
      title="Hợp đồng"
      description="Quản lý hợp đồng nhân sự và thông tin lương/phụ cấp."
      api={contractApi}
      idKey="contractId"
      columns={[
        { key: "contractNo", label: "Số hợp đồng" },
        { key: "employeeId", label: "Nhân viên" },
        { key: "contractType", label: "Loại" },
        { key: "effectiveDate", label: "Hiệu lực" },
        { key: "expiredDate", label: "Hết hạn" },
        { key: "status", label: "Trạng thái" },
      ]}
      fields={[
        { key: "contractNo", label: "Số hợp đồng", required: true },
        { key: "employeeId", label: "Employee ID", required: true },
        { key: "contractType", label: "Loại hợp đồng" },
        { key: "signedDate", label: "Ngày ký", type: "date" },
        { key: "effectiveDate", label: "Ngày hiệu lực", type: "date" },
        { key: "expiredDate", label: "Ngày hết hạn", type: "date" },
        { key: "baseSalary", label: "Lương cơ bản", type: "number" },
        { key: "allowance", label: "Phụ cấp", type: "number" },
        { key: "annualLeave", label: "Ngày phép năm", type: "number" },
        { key: "signedBy", label: "Người ký" },
        { key: "status", label: "Trạng thái số", type: "number" },
        { key: "note", label: "Ghi chú", type: "textarea" },
        { key: "isActive", label: "Đang hoạt động", type: "boolean" },
      ]}
      initialForm={{ isActive: true, status: 1, annualLeave: 12 }}
    />
  );
}
