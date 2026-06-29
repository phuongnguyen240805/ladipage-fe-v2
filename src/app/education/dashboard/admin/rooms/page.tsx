'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/features/education/components/ui/card';
import { Button } from '@/features/education/components/ui/button';
import { Input } from '@/features/education/components/ui/input';
import { Badge } from '@/features/education/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/education/components/ui/select';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';
import { roomApi } from '@/features/education/api/room';
import { buildingApi } from '@/features/education/api/building';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/features/education/components/ui/dialog';
import { Label } from '@/features/education/components/ui/label';

const removeAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const roomTypes = [
  { value: 'Ly thuyet', label: 'Lý thuyết' },
  { value: 'Thuc hanh', label: 'Thực hành' },
  { value: 'Hoi thao', label: 'Hội thảo' },
];

const roomStatuses = [
  { value: 'San sang', label: 'Sẵn sàng' },
  { value: 'Dang su dung', label: 'Đang sử dụng' },
  { value: 'Bao tri', label: 'Bảo trì' },
];

interface Room {
  roomId: string;
  code: string;
  name: string;
  buildingId: string;
  buildingName: string;
  floorNumber: number;
  capacity: number;
  type: string;
  status: string;
  hasProjector: boolean;
  hasAirConditioner: boolean;
  hasComputer: boolean;
  description?: string;
}

interface Building {
  buildingId: string;
  code: string;
  name: string;
}

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Room Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    buildingId: '',
    floorNumber: 1,
    capacity: 50,
    type: 'Ly thuyet',
    status: 'San sang',
    hasProjector: false,
    hasAirConditioner: false,
    hasComputer: false,
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, buildingsData] = await Promise.all([
        roomApi.getAll(),
        buildingApi.getAll()
      ]);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setBuildings(Array.isArray(buildingsData) ? buildingsData : []);
    } catch (error) {
      toast.error('Không thể lấy dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã phòng');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên phòng');
      return;
    }
    if (!formData.buildingId) {
      toast.error('Vui lòng chọn tòa nhà');
      return;
    }

    setSaveLoading(true);
    const payload = {
      code: formData.code.trim(),
      name: removeAccents(formData.name.trim()),
      buildingId: formData.buildingId,
      floorNumber: Number(formData.floorNumber),
      capacity: Number(formData.capacity),
      type: removeAccents(formData.type),
      status: removeAccents(formData.status),
      hasProjector: formData.hasProjector,
      hasAirConditioner: formData.hasAirConditioner,
      hasComputer: formData.hasComputer,
      description: formData.description ? removeAccents(formData.description.trim()) : ''
    };

    try {
      await roomApi.create(payload);
      toast.success('Thêm phòng học thành công');
      setCreateDialogOpen(false);
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm phòng');
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = filterBuilding === 'all' || room.buildingId === filterBuilding;
    return matchesSearch && matchesBuilding;
  });

  const totalPages = Math.ceil(filteredRooms.length / rowsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDelete = async (room: Room) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng ${room.name}?`)) {
      try {
        await roomApi.delete(room.roomId);
        toast.success(`Đã xóa phòng ${room.name}`);
        await fetchData();
      } catch (error) {
        toast.error('Lỗi khi xóa phòng');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'San sang' || status === 'Sẵn sàng') {
      return <Badge className="bg-green-100 text-green-700">Sẵn sàng</Badge>;
    }
    if (status === 'Dang su dung' || status === 'Đang sử dụng') {
      return <Badge className="bg-blue-100 text-blue-700">Đang sử dụng</Badge>;
    }
    return <Badge variant="secondary">Bảo trì</Badge>;
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
          <h1 className="text-3xl font-bold mb-2">Quản lý phòng học</h1>
          <p className="text-gray-500">Danh sách và quản lý phòng học</p>
        </div>
        <Button 
          onClick={() => {
            setFormData({
              code: '',
              name: '',
              buildingId: buildings[0]?.buildingId || '',
              floorNumber: 1,
              capacity: 50,
              type: 'Ly thuyet',
              status: 'San sang',
              hasProjector: false,
              hasAirConditioner: false,
              hasComputer: false,
              description: ''
            });
            setCreateDialogOpen(true);
          }} 
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm phòng học
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã phòng, tên phòng..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterBuilding} onValueChange={(val) => setFilterBuilding(val || 'all')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Chọn tòa nhà" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tòa nhà</SelectItem>
                {buildings.map(building => (
                  <SelectItem key={building.buildingId} value={building.buildingId}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Mã phòng</th>
                  <th className="text-left py-3 px-4">Tên phòng</th>
                  <th className="text-left py-3 px-4">Tòa nhà</th>
                  <th className="text-left py-3 px-4">Tầng</th>
                  <th className="text-left py-3 px-4">Sức chứa</th>
                  <th className="text-left py-3 px-4">Loại</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Thiết bị</th>
                  <th className="text-left py-3 px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRooms.map((room) => (
                  <tr key={room.roomId} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-sm">{room.code}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => router.push(`/education/dashboard/admin/rooms/${room.roomId}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {room.name}
                      </button>
                    </td>
                    <td className="py-3 px-4">{room.buildingName}</td>
                    <td className="py-3 px-4">{room.floorNumber}</td>
                    <td className="py-3 px-4">{room.capacity}</td>
                    <td className="py-3 px-4">{room.type}</td>
                    <td className="py-3 px-4">{getStatusBadge(room.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {room.hasProjector && <Badge variant="outline">Máy chiếu</Badge>}
                        {room.hasAirConditioner && <Badge variant="outline">Điều hòa</Badge>}
                        {room.hasComputer && <Badge variant="outline">Máy tính</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/education/dashboard/admin/rooms/${room.roomId}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(room)} className="text-red-600">
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
              <span className="text-sm">Hiển thị</span>
              <Select value={String(rowsPerPage)} onValueChange={(val) => setRowsPerPage(Number(val || 10))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm">trên tổng {filteredRooms.length} bản ghi</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">Trang {currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Room Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm phòng học mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột trái */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roomCode">Mã phòng *</Label>
                  <Input
                    id="roomCode"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1.5"
                    placeholder="A101"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="roomName">Tên phòng *</Label>
                  <Input
                    id="roomName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5"
                    placeholder="Phòng A101"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="buildingId">Tòa nhà *</Label>
                  <Select 
                    value={formData.buildingId} 
                    onValueChange={(val) => setFormData({ ...formData, buildingId: val || '' })}
                  >
                    <SelectTrigger id="buildingId" className="mt-1.5">
                      <SelectValue placeholder="Chọn tòa nhà" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map(building => (
                        <SelectItem key={building.buildingId} value={building.buildingId}>
                          {building.code} - {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="floorNumber">Tầng</Label>
                    <Input
                      id="floorNumber"
                      type="number"
                      value={formData.floorNumber}
                      onChange={(e) => setFormData({ ...formData, floorNumber: parseInt(e.target.value) || 1 })}
                      className="mt-1.5"
                      min={1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Sức chứa</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                      className="mt-1.5"
                      min={1}
                    />
                  </div>
                </div>
              </div>

              {/* Cột phải */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roomType">Loại phòng</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val) => setFormData({ ...formData, type: val || 'Ly thuyet' })}
                  >
                    <SelectTrigger id="roomType" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="roomStatus">Trạng thái</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(val) => setFormData({ ...formData, status: val || 'San sang' })}
                  >
                    <SelectTrigger id="roomStatus" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roomStatuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Thiết bị</Label>
                  <div className="flex flex-col gap-2.5 pt-1">
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.hasProjector}
                        onChange={(e) => setFormData({ ...formData, hasProjector: e.target.checked })}
                        className="w-4 h-4 rounded-md border-gray-300 text-primary focus:ring-primary"
                      />
                      Máy chiếu
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.hasAirConditioner}
                        onChange={(e) => setFormData({ ...formData, hasAirConditioner: e.target.checked })}
                        className="w-4 h-4 rounded-md border-gray-300 text-primary focus:ring-primary"
                      />
                      Điều hòa
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.hasComputer}
                        onChange={(e) => setFormData({ ...formData, hasComputer: e.target.checked })}
                        className="w-4 h-4 rounded-md border-gray-300 text-primary focus:ring-primary"
                      />
                      Máy tính
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1.5"
                    placeholder="Mô tả thêm về phòng học"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saveLoading} className="bg-green-600 hover:bg-green-700 text-white">
                {saveLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang lưu...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Lưu
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}