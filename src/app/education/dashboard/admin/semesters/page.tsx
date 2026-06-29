"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit, Plus, RefreshCw, Search, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

import { schoolYearApi } from "@/features/education/api/school-year";
import { semesterApi } from "@/features/education/api/semester";
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

interface Semester {
  semesterId: string;
  code: string;
  name: string;
  schoolYearId: string;
  startDate: string;
  endDate: string;
  status: boolean;
  description?: string;
  isActive: boolean;
}

interface SchoolYear {
  schoolYearId: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
}

type SemesterForm = {
  code: string;
  name: string;
  schoolYearId: string;
  startDate: string;
  endDate: string;
  status: boolean;
  description: string;
  isActive: boolean;
};

const emptyForm: SemesterForm = {
  code: "",
  name: "",
  schoolYearId: "",
  startDate: "",
  endDate: "",
  status: true,
  description: "",
  isActive: true,
};

const normalizeRows = <T,>(response: any): T[] => {
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

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [formData, setFormData] = useState<SemesterForm>(emptyForm);

  const selectedSchoolYear = useMemo(
    () => schoolYears.find((schoolYear) => schoolYear.schoolYearId === formData.schoolYearId),
    [formData.schoolYearId, schoolYears],
  );

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const response = await semesterApi.getAll({
        keyword: searchTerm.trim() || undefined,
      });
      setSemesters(normalizeRows<Semester>(response));
    } catch {
      toast.error("Không thể tải danh sách học kỳ");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolYears = async () => {
    try {
      const response = await schoolYearApi.getAll();
      setSchoolYears(normalizeRows<SchoolYear>(response));
    } catch {
      toast.error("Không thể tải danh sách năm học");
    }
  };

  useEffect(() => {
    fetchSemesters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  const openCreateDialog = () => {
    setEditingSemester(null);
    setFormData({
      ...emptyForm,
      schoolYearId: schoolYears[0]?.schoolYearId ?? "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (semester: Semester) => {
    setEditingSemester(semester);
    setFormData({
      code: semester.code ?? "",
      name: semester.name ?? "",
      schoolYearId: semester.schoolYearId ?? "",
      startDate: toDateInputValue(semester.startDate),
      endDate: toDateInputValue(semester.endDate),
      status: semester.status ?? true,
      description: semester.description ?? "",
      isActive: semester.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const getSchoolYearName = (id: string) => {
    const schoolYear = schoolYears.find((item) => item.schoolYearId === id);
    return schoolYear?.name ?? id?.slice(0, 8) ?? "";
  };

  const validateForm = () => {
    if (!formData.code || !formData.name || !formData.schoolYearId || !formData.startDate || !formData.endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return false;
    }

    if (formData.startDate >= formData.endDate) {
      toast.error("Ngày bắt đầu học kỳ phải nhỏ hơn ngày kết thúc");
      return false;
    }

    if (selectedSchoolYear) {
      const yearStartDate = toDateInputValue(selectedSchoolYear.startDate);
      const yearEndDate = toDateInputValue(selectedSchoolYear.endDate);

      if (formData.startDate < yearStartDate || formData.endDate > yearEndDate) {
        toast.error("Thời gian học kỳ phải nằm trong khoảng năm học đã chọn");
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      schoolYearId: formData.schoolYearId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      description: formData.description.trim(),
      isActive: formData.isActive,
    };

    try {
      if (editingSemester) {
        await semesterApi.update(editingSemester.semesterId, payload);
        toast.success("Cập nhật học kỳ thành công");
      } else {
        await semesterApi.create(payload);
        toast.success("Thêm học kỳ thành công");
      }

      setDialogOpen(false);
      await fetchSemesters();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa học kỳ "${name}"?`)) return;

    try {
      await semesterApi.delete(id);
      toast.success("Xóa học kỳ thành công");
      await fetchSemesters();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xóa thất bại");
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${type} ID: ${text.substring(0, 8)}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Quản lý học kỳ</h1>
          <p className="text-muted-foreground">Quản lý học kỳ theo từng năm học và khoảng thời gian đào tạo.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSemesters} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm học kỳ
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã hoặc tên học kỳ"
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
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID học kỳ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Mã học kỳ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tên học kỳ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Năm học</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ngày bắt đầu</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ngày kết thúc</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      Đang tải...
                    </td>
                  </tr>
                ) : semesters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      Chưa có học kỳ nào
                    </td>
                  </tr>
                ) : (
                  semesters.map((item) => (
                    <tr key={item.semesterId} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{item.semesterId.substring(0, 8)}...</span>
                          <button
                            onClick={() => copyToClipboard(item.semesterId, "Học kỳ")}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                            title="Copy Semester ID"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                       </td>
                      <td className="px-4 py-3 text-sm font-medium">{item.code}</td>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{getSchoolYearName(item.schoolYearId)}</td>
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
                            onClick={() => handleDelete(item.semesterId, item.name)}
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
            <DialogTitle>{editingSemester ? "Chỉnh sửa học kỳ" : "Thêm học kỳ mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingSemester && (
              <div>
                <Label className="text-sm font-semibold">ID học kỳ</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={editingSemester.semesterId} disabled className="bg-gray-100 font-mono text-sm" />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(editingSemester.semesterId, "Học kỳ")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">ID duy nhất của học kỳ</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-semibold">Mã học kỳ *</Label>
              <Input
                value={formData.code}
                onChange={(event) => setFormData({ ...formData, code: event.target.value.toUpperCase() })}
                placeholder="HK1, HK2, HK3"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Tên học kỳ *</Label>
              <Input
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="Học kỳ 1, Học kỳ 2"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Năm học *</Label>
              <select
                value={formData.schoolYearId}
                onChange={(event) =>
                  setFormData({ ...formData, schoolYearId: event.target.value, startDate: "", endDate: "" })
                }
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="">Chọn năm học</option>
                {schoolYears.map((schoolYear) => (
                  <option key={schoolYear.schoolYearId} value={schoolYear.schoolYearId}>
                    {schoolYear.name}
                  </option>
                ))}
              </select>
              {selectedSchoolYear ? (
                <p className="mt-2 rounded-md border bg-muted/50 p-2 text-xs text-muted-foreground">
                  Khoảng năm học: {formatDateDisplay(selectedSchoolYear.startDate)} -{" "}
                  {formatDateDisplay(selectedSchoolYear.endDate)}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Cần có năm học trước khi thêm học kỳ.</p>
              )}
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
                placeholder="Mô tả thêm"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={!selectedSchoolYear}>
              Lưu lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
