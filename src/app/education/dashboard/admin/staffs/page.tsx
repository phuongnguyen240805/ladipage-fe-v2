"use client";

import { useEffect, useState } from "react";
import { AdminResourcePage } from "@/features/education/components/admin/AdminResourcePage";
import { staffApi, divisionApi, positionApi, type Staff } from "@/features/education/api/admin-resources";

export default function StaffsPage() {
  const [divisionsOptions, setDivisionsOptions] = useState<{ value: string; label: string }[]>([]);
  const [positionsOptions, setPositionsOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // Tải phòng ban
    divisionApi.getAll({ isActive: true }).then((res) => {
      const opts = res.map((d: any) => ({
        value: d.divisionId || d.id,
        label: d.name || d.code || "Phòng ban",
      }));
      setDivisionsOptions(opts);
    }).catch(err => console.error("Lỗi khi tải phòng ban", err));

    // Tải chức vụ
    positionApi.getAll({ isActive: true }).then((res) => {
      const opts = res.map((p: any) => ({
        value: p.positionId || p.id,
        label: p.name || p.code || "Chức vụ",
      }));
      setPositionsOptions(opts);
    }).catch(err => console.error("Lỗi khi tải chức vụ", err));
  }, []);

  const fieldOptions = {
    divisionId: divisionsOptions,
    positionId: positionsOptions,
  };

  return (
    <AdminResourcePage<Staff>
      title="Nhân viên hành chính"
      description="Quản lý hồ sơ nhân viên hành chính và tài khoản được tạo tự động."
      api={staffApi}
      idKey="employeeId"
      columns={[
        { key: "staffCode", label: "Mã NVHC" },
        { key: "employeeCode", label: "Mã nhân viên" },
        { key: "fullName", label: "Họ tên" },
        { 
          key: "divisionId", 
          label: "Phòng ban", 
          render: (row) => {
            const found = divisionsOptions.find(o => o.value === row.divisionId);
            return found ? found.label : row.divisionId || "—";
          }
        },
        { 
          key: "positionId", 
          label: "Chức vụ", 
          render: (row) => {
            const found = positionsOptions.find(o => o.value === row.positionId);
            return found ? found.label : row.positionId || "—";
          }
        },
        { key: "isActive", label: "Trạng thái" },
      ]}
      fields={[
        { key: "fullName", label: "Họ tên", required: true },
        { key: "fullNameNoAccent", label: "Tên không dấu" },
        { key: "dateOfBirth", label: "Ngày sinh", type: "date", required: true },
        { key: "gender", label: "Giới tính" },
        { key: "employeeCode", label: "Mã nhân viên" },
        { key: "staffCode", label: "Mã NVHC" },
        { key: "startWorkDate", label: "Ngày bắt đầu", type: "date" },
        { key: "endWorkDate", label: "Ngày kết thúc", type: "date" },
        { key: "contractType", label: "Loại hợp đồng" },
        { key: "divisionId", label: "Phòng ban", required: true, options: divisionsOptions },
        { key: "positionId", label: "Chức vụ", options: positionsOptions },
        { key: "contactEmail", label: "Email liên hệ" },
        { key: "phoneNumber", label: "Số điện thoại" },
        { key: "note", label: "Ghi chú", type: "textarea" },
        { key: "isActive", label: "Đang hoạt động", type: "boolean" },
      ]}
      initialForm={{ isActive: true }}
      fieldOptions={fieldOptions}
    />
  );
}
