"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/features/education/components/ui/card';
import { Button } from '@/features/education/components/ui/button';
import { Input } from '@/features/education/components/ui/input';
import { Label } from '@/features/education/components/ui/label';
import { Textarea } from '@/features/education/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/features/education/components/ui/dialog';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { request } from '@/features/education/utils/request';

interface Department {
  departmentId: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true
  });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response: any = await request.get('/api/v1/departments/admin');
      let data = [];
      if (response?.data?.content) {
        data = response.data.content;
      } else if (response?.content) {
        data = response.content;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      } else {
        data = [];
      }
      setDepartments(data);
    } catch (error) {
      toast.error('Không thể tải danh sách khoa');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(dept =>
    dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDepartments.length / rowsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleOpenModal = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        code: department.code,
        name: department.name,
        description: department.description || '',
        isActive: department.isActive
      });
    } else {
      setEditingDepartment(null);
      setFormData({ code: '', name: '', description: '', isActive: true });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code) {
      toast.error('Vui lòng nhập mã khoa');
      return;
    }
    if (!formData.name) {
      toast.error('Vui lòng nhập tên khoa');
      return;
    }

    try {
      if (editingDepartment) {
        await request.put(`/api/v1/departments/admin/${editingDepartment.departmentId}`, formData);
        toast.success('Cập nhật khoa thành công');
      } else {
        await request.post('/api/v1/departments/admin', formData);
        toast.success('Thêm khoa thành công');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa khoa ${name}?`)) {
      try {
        await request.delete(`/api/v1/departments/admin/${id}`);
        setDepartments(prev => prev.filter(dept => dept.departmentId !== id));
        toast.success(`Đã xóa khoa ${name}`);
        void fetchDepartments();
      } catch (error: any) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${type} ID: ${text.substring(0, 8)}...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản lý Khoa / Đơn vị</h1>
          <p className="text-muted-foreground">Danh sách các khoa và đơn vị đào tạo</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          Thêm khoa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã khoa, tên khoa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {paginatedDepartments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Chưa có dữ liệu khoa. Hãy thêm khoa mới.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm">ID Khoa</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Mã khoa</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Tên khoa</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Mô tả</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDepartments.map((dept) => (
                      <tr key={dept.departmentId} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{dept.departmentId.substring(0, 8)}...</span>
                            <button
                              onClick={() => copyToClipboard(dept.departmentId, 'Khoa')}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                              title="Copy Department ID"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">{dept.code}</td>
                        <td className="py-3 px-4 text-sm">{dept.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-500 truncate max-w-md">
                          {dept.description || '—'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            dept.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {dept.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(dept)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.departmentId, dept.name)} className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Hiển thị</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-muted-foreground">
                    trên tổng {filteredDepartments.length} bản ghi
                  </span>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Thêm/Sửa */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDepartment ? 'Chỉnh sửa khoa' : 'Thêm khoa mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingDepartment && (
              <div>
                <Label>ID Khoa</Label>
                <div className="flex items-center gap-2">
                  <Input value={editingDepartment.departmentId} disabled className="bg-gray-100 font-mono text-sm" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(editingDepartment.departmentId, 'Khoa')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">ID duy nhất của khoa</p>
              </div>
            )}
            <div>
              <Label htmlFor="code">Mã khoa *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="VD: CNTT"
              />
            </div>
            <div>
              <Label htmlFor="name">Tên khoa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Khoa Công nghệ thông tin"
              />
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả về khoa..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">Đang hoạt động</Label>
            </div>
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
