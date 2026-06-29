"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/features/education/components/ui/card";
import { Button } from "@/features/education/components/ui/button";
import { Input } from "@/features/education/components/ui/input";
import { Label } from "@/features/education/components/ui/label";
import { Textarea } from "@/features/education/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/features/education/components/ui/dialog";
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { toast } from "sonner";
import { majorApi } from "@/features/education/api/major";
import { departmentApi } from "@/features/education/api/department";
import type { Department, Major } from "@/features/education/types/lookup";

const getDepartmentId = (department: Department) => department.departmentId || department.id || "";
const getMajorId = (major: Major) => major.majorId || major.id || "";

const generateCode = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 12);

export default function MajorsPage() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    departmentId: "",
    description: "",
    isActive: true,
  });

  const departmentNameById = useMemo(
    () => new Map(departments.map((department) => [getDepartmentId(department), department.name || department.code || ""])),
    [departments],
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [majorData, departmentData] = await Promise.all([
        majorApi.getAll({ isActive: true }),
        departmentApi.getAll({ isActive: true }),
      ]);
      setMajors(majorData || []);
      setDepartments(departmentData || []);
    } catch (error) {
      console.error(error);
      toast.error("Khong the tai danh sach nganh/khoa");
      setMajors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMajors = majors.filter((major) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !search ||
      (major.code || "").toLowerCase().includes(search) ||
      (major.name || "").toLowerCase().includes(search) ||
      (major.departmentName || departmentNameById.get(major.departmentId || "") || "").toLowerCase().includes(search);
    const matchesDepartment = filterDepartmentId === "all" || major.departmentId === filterDepartmentId;
    return matchesSearch && matchesDepartment;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMajors.length / rowsPerPage));
  const paginatedMajors = filteredMajors.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleOpenModal = (major?: Major) => {
    if (major) {
      setEditingMajor(major);
      setFormData({
        code: major.code || "",
        name: major.name || "",
        departmentId: major.departmentId || "",
        description: (major as any).description || "",
        isActive: major.isActive !== false,
      });
    } else {
      setEditingMajor(null);
      setFormData({ code: "", name: "", departmentId: "", description: "", isActive: true });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui long nhap ten nganh");
      return;
    }
    if (!formData.departmentId) {
      toast.error("Vui long chon khoa cho nganh");
      return;
    }

    const code = (formData.code || generateCode(formData.name)).trim().toUpperCase();
    if (!code) {
      toast.error("Vui long nhap ma nganh");
      return;
    }

    try {
      const payload = {
        code,
        name: formData.name.trim(),
        departmentId: formData.departmentId,
        description: formData.description,
        isActive: formData.isActive,
      };

      if (editingMajor) {
        await majorApi.update(getMajorId(editingMajor), payload);
        toast.success("Cap nhat nganh thanh cong");
      } else {
        await majorApi.create(payload);
        toast.success("Them nganh thanh cong");
      }
      setModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Thao tac that bai");
    }
  };

  const handleDelete = async (major: Major) => {
    const id = getMajorId(major);
    if (!confirm(`Ban co chac muon xoa nganh ${major.name || major.code}?`)) return;
    try {
      await majorApi.delete(id);
      toast.success("Da xoa nganh");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xoa nganh that bai");
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`Da copy ID: ${text.substring(0, 8)}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Quản lý ngành học</h1>
          <p className="text-muted-foreground">Ngành đào tạo được liên kết trực tiếp với khoa</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary">
          <Plus className="mr-2 h-4 w-4" />
          Them nganh hoc
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_260px]">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Tim theo ma nganh, ten nganh, khoa..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <select
              value={filterDepartmentId}
              onChange={(event) => {
                setFilterDepartmentId(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option value="all">Tat ca khoa</option>
              {departments.map((department) => {
                const id = getDepartmentId(department);
                return (
                  <option key={id} value={id}>
                    {department.code ? `${department.code} - ` : ""}{department.name || id}
                  </option>
                );
              })}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ma nganh</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Ten nganh</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Khoa</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Trang thai</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Dang tai...</td></tr>
                ) : paginatedMajors.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Chua co nganh hoc phu hop</td></tr>
                ) : (
                  paginatedMajors.map((major) => {
                    const id = getMajorId(major);
                    const departmentLabel = major.departmentName || departmentNameById.get(major.departmentId || "") || "Chua lien ket";
                    return (
                      <tr key={id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-medium">{major.code}</td>
                        <td className="px-4 py-3 text-sm">{major.name}</td>
                        <td className="px-4 py-3 text-sm">{departmentLabel}</td>
                        <td className="px-4 py-3 text-sm">{major.isActive === false ? "Tam dung" : "Dang hoat dong"}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(major)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(major)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Hien thi</span>
              <select value={rowsPerPage} onChange={(event) => setRowsPerPage(Number(event.target.value))} className="rounded border px-2 py-1 text-sm">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-muted-foreground text-sm">tren tong {filteredMajors.length} ban ghi</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Trang {currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMajor ? "Chỉnh sửa ngành học" : "Thêm ngành học mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Mã ngành *</Label>
              <Input id="code" value={formData.code} onChange={(event) => setFormData({ ...formData, code: event.target.value })} placeholder="VD: CNTT" />
            </div>
            <div>
              <Label htmlFor="name">Tên ngành *</Label>
              <Input id="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value, code: formData.code || generateCode(event.target.value) })} />
            </div>
            <div>
              <Label htmlFor="departmentId">Khoa *</Label>
              <select id="departmentId" value={formData.departmentId} onChange={(event) => setFormData({ ...formData, departmentId: event.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">-- Chọn khoa --</option>
                {departments.map((department) => {
                  const id = getDepartmentId(department);
                  return (
                    <option key={id} value={id}>
                      {department.code ? `${department.code} - ` : ""}{department.name || id}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} rows={3} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })} />
              Đang hoạt động
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-primary">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
