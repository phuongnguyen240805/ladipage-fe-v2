"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Edit, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { schoolYearApi } from "@/features/education/api/school-year";
import { Button } from "@/features/education/components/ui/button";
import { Card, CardContent, CardHeader } from "@/features/education/components/ui/card";
import { DatePicker } from "@/features/education/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/education/components/ui/dialog";
import { Input } from "@/features/education/components/ui/input";
import { Label } from "@/features/education/components/ui/label";

interface SchoolYear {
  schoolYearId: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  isActive: boolean;
}

type SchoolYearForm = {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
};

const emptyForm: SchoolYearForm = {
  code: "",
  name: "",
  startDate: "",
  endDate: "",
  description: "",
  isActive: true,
};

const normalizeRows = (response: any): SchoolYear[] => {
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const toDateInputValue = (value?: string) => {
  if (!value) return "";
  return value.includes("T") ? value.split("T")[0] : value;
};

const formatDateDisplay = (value?: string) => {
  const date = toDateInputValue(value);
  if (!date) return "";
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return value ?? "";
  return `${day}/${month}/${year}`;
};

export default function SchoolYearsPage() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchoolYear, setEditingSchoolYear] = useState<SchoolYear | null>(null);
  const [formData, setFormData] = useState<SchoolYearForm>(emptyForm);

  const fetchSchoolYears = async () => {
    setLoading(true);
    try {
      const response = await schoolYearApi.getAll({
        keyword: searchTerm.trim() || undefined,
      });
      setSchoolYears(normalizeRows(response));
    } catch {
      toast.error("Không thể tải danh sách năm học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const openCreateDialog = () => {
    setEditingSchoolYear(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (schoolYear: SchoolYear) => {
    setEditingSchoolYear(schoolYear);
    setFormData({
      code: schoolYear.code ?? "",
      name: schoolYear.name ?? "",
      startDate: toDateInputValue(schoolYear.startDate),
      endDate: toDateInputValue(schoolYear.endDate),
      description: schoolYear.description ?? "",
      isActive: schoolYear.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const validateForm = () => {
    if (!formData.code || !formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }

    if (formData.startDate >= formData.endDate) {
      toast.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description.trim(),
      isActive: formData.isActive,
    };

    try {
      if (editingSchoolYear) {
        await schoolYearApi.update(editingSchoolYear.schoolYearId, payload);
        toast.success("Cập nhật năm học thành công");
      } else {
        await schoolYearApi.create(payload);
        toast.success("Thêm năm học thành công");
      }

      setDialogOpen(false);
      await fetchSchoolYears();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = confirm(
      `Bạn có chắc muốn xóa năm học "${name}"?\nCác học kỳ liên quan có thể bị ảnh hưởng.`,
    );
    if (!confirmed) return;

    try {
      await schoolYearApi.delete(id);
      toast.success("Xóa năm học thành công");
      await fetchSchoolYears();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
            <Calendar className="h-7 w-7 text-primary" />
            Quản lý năm học
          </h1>
          <p className="text-muted-foreground">Quản lý niên khóa, thời gian bắt đầu và kết thúc năm học.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSchoolYears} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm năm học
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã hoặc tên năm học"
              className="pl-10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Mã năm học</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tên năm học</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ngày bắt đầu</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ngày kết thúc</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      Đang tải...
                    </td>
                  </tr>
                ) : schoolYears.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      Chưa có năm học nào
                    </td>
                  </tr>
                ) : (
                  schoolYears.map((item) => (
                    <tr key={item.schoolYearId} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium">{item.code}</td>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{formatDateDisplay(item.startDate)}</td>
                      <td className="px-4 py-3 text-sm">{formatDateDisplay(item.endDate)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {item.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(item.schoolYearId, item.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSchoolYear ? "Chỉnh sửa năm học" : "Thêm năm học mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <Label className="text-sm font-semibold">Mã năm học *</Label>
              <Input
                value={formData.code}
                onChange={(event) => setFormData({ ...formData, code: event.target.value.toUpperCase() })}
                placeholder="Ví dụ: 2024-2025"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Tên năm học *</Label>
              <Input
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="Ví dụ: Năm học 2024-2025"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-semibold">Ngày bắt đầu *</Label>
                <DatePicker
                  value={formData.startDate}
                  onChange={(value) => setFormData({ ...formData, startDate: value })}
                  placeholder="Chọn ngày"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Ngày kết thúc *</Label>
                <DatePicker
                  value={formData.endDate}
                  onChange={(value) => setFormData({ ...formData, endDate: value })}
                  placeholder="Chọn ngày"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Mô tả</Label>
              <Input
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                placeholder="Mô tả thêm về năm học"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Lưu lại</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
