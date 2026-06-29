'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/features/education/components/ui/card';
import { Button } from '@/features/education/components/ui/button';
import { Input } from '@/features/education/components/ui/input';
import { Label } from '@/features/education/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/features/education/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/education/components/ui/select';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { buildingApi } from '@/features/education/api/building';

interface Building {
  buildingId: string;
  code: string;
  name: string;
  address: string;
  totalFloors: number;
  buildingType: string;
  description?: string;
  note?: string;
}

const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [deletingBuilding, setDeletingBuilding] = useState<Building | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    totalFloors: 3,
    buildingType: 'Giang duong',
    description: '',
    note: ''
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const data = await buildingApi.getAll();
      setBuildings(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Không thể lấy danh sách tòa nhà');
    } finally {
      setLoading(false);
    }
  };

  const filteredBuildings = buildings.filter(building =>
    building.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBuildings.length / rowsPerPage);
  const paginatedBuildings = filteredBuildings.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleEdit = (building: Building) => {
    setEditingBuilding(building);
    setFormData({
      code: building.code,
      name: building.name,
      address: building.address || '',
      totalFloors: building.totalFloors,
      buildingType: building.buildingType,
      description: building.description || '',
      note: building.note || ''
    });
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBuilding(null);
    setFormData({
      code: '',
      name: '',
      address: '',
      totalFloors: 3,
      buildingType: 'Giang duong',
      description: '',
      note: ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã tòa nhà');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên tòa nhà');
      return;
    }

    const payload = {
      code: formData.code,
      name: removeAccents(formData.name),
      address: formData.address ? removeAccents(formData.address) : '',
      totalFloors: Number(formData.totalFloors),
      buildingType: removeAccents(formData.buildingType),
      description: formData.description ? removeAccents(formData.description) : '',
      note: formData.note ? removeAccents(formData.note) : ''
    };

    try {
      if (editingBuilding) {
        await buildingApi.update(editingBuilding.buildingId, payload);
        toast.success('Cập nhật tòa nhà thành công');
      } else {
        await buildingApi.create(payload);
        toast.success('Thêm tòa nhà thành công');
      }
      await fetchBuildings();
      setModalOpen(false);
      setEditingBuilding(null);
      setFormData({
        code: '',
        name: '',
        address: '',
        totalFloors: 3,
        buildingType: 'Giang duong',
        description: '',
        note: ''
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu tòa nhà');
    }
  };

  const handleDeleteClick = (building: Building) => {
    setDeletingBuilding(building);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBuilding) return;
    try {
      await buildingApi.delete(deletingBuilding.buildingId);
      toast.success(`Đã xóa tòa nhà ${deletingBuilding.name}`);
      await fetchBuildings();
      setDeleteDialogOpen(false);
      setDeletingBuilding(null);
    } catch (error: any) {
      console.error(error);
      toast.error('Lỗi khi xóa tòa nhà');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Quản lý tòa nhà</h1>
          <p className="text-gray-500 dark:text-gray-400">Danh sách và quản lý tòa nhà trong trường</p>
        </div>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Thêm tòa nhà
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo mã, tên tòa nhà, địa chỉ..."
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Mã</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Tên tòa nhà</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Địa chỉ</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Số tầng</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Loại</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBuildings.map((building) => (
                  <tr key={building.buildingId} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{building.code}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{building.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{building.address || '---'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{building.totalFloors}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{building.buildingType}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(building)} className="text-blue-600 hover:text-blue-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(building)} className="text-red-600 hover:text-red-700">
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
              <span className="text-sm text-gray-500">Hiển thị</span>
              <Select value={String(rowsPerPage)} onValueChange={(val) => setRowsPerPage(Number(val))}>
                <SelectTrigger className="w-20 bg-white dark:bg-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">
                trên tổng {filteredBuildings.length} bản ghi
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
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBuilding ? 'Chỉnh sửa tòa nhà' : 'Thêm tòa nhà mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Mã tòa nhà *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="mt-1.5"
                placeholder="A"
              />
            </div>
            <div>
              <Label htmlFor="name">Tên tòa nhà *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5"
                placeholder="Tòa nhà A"
              />
            </div>
            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1.5"
                placeholder="Khu A, Đại học Đông Á"
              />
            </div>
            <div>
              <Label htmlFor="totalFloors">Số tầng</Label>
              <Input
                id="totalFloors"
                type="number"
                value={formData.totalFloors}
                onChange={(e) => setFormData({ ...formData, totalFloors: parseInt(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="buildingType">Loại tòa nhà</Label>
              <Select value={formData.buildingType} onValueChange={(val) => setFormData({ ...formData, buildingType: val || '' })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Giang duong">Giảng đường</SelectItem>
                  <SelectItem value="Thu vien">Thư viện</SelectItem>
                  <SelectItem value="Ky tuc xa">Ký túc xá</SelectItem>
                  <SelectItem value="Hanh chinh">Hành chính</SelectItem>
                  <SelectItem value="Phong thi nghiem">Phòng thí nghiệm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa tòa nhà <span className="font-semibold">{deletingBuilding?.name}</span>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}