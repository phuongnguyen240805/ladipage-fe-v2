'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/features/education/components/ui/input';
import { Label } from '@/features/education/components/ui/label';
import { Badge } from '@/features/education/components/ui/badge';
import { ArrowLeft, Save, Trash2, Loader2, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';
import { roomApi } from '@/features/education/api/room';
import { buildingApi } from '@/features/education/api/building';

interface RoomDetail {
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

const removeAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

export default function RoomDetailClient() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    buildingId: '',
    floorNumber: 1,
    capacity: 50,
    type: '',
    status: '',
    hasProjector: false,
    hasAirConditioner: false,
    hasComputer: false,
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomData, buildingsData] = await Promise.all([
        roomApi.getById(params.id as string),
        buildingApi.getAll()
      ]);
      setRoom(roomData);
      setBuildings(Array.isArray(buildingsData) ? buildingsData : []);
      setFormData({
        code: roomData.code,
        name: roomData.name,
        buildingId: roomData.buildingId,
        floorNumber: roomData.floorNumber,
        capacity: roomData.capacity,
        type: roomData.type,
        status: roomData.status,
        hasProjector: roomData.hasProjector,
        hasAirConditioner: roomData.hasAirConditioner,
        hasComputer: roomData.hasComputer,
        description: roomData.description || ''
      });
    } catch (error) {
      toast.error('Không thể tải thông tin phòng');
      router.push('/education/dashboard/admin/rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const payload = {
      code: formData.code,
      name: removeAccents(formData.name),
      buildingId: formData.buildingId,
      floorNumber: Number(formData.floorNumber),
      capacity: Number(formData.capacity),
      type: removeAccents(formData.type),
      status: removeAccents(formData.status),
      hasProjector: formData.hasProjector,
      hasAirConditioner: formData.hasAirConditioner,
      hasComputer: formData.hasComputer,
      description: formData.description ? removeAccents(formData.description) : ''
    };

    try {
      await roomApi.update(params.id as string, payload);
      toast.success('Cập nhật phòng học thành công');
      setIsEditing(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật');
    }
  };

  const handleDelete = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      try {
        await roomApi.delete(params.id as string);
        toast.success('Xóa phòng thành công');
        router.push('/education/dashboard/admin/rooms');
      } catch (error) {
        toast.error('Lỗi khi xóa phòng');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Chỉnh sửa phòng học' : 'Chi tiết phòng học'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Mã phòng: <span className="font-mono">{room.code}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Edit2 className="h-4 w-4" />
                  Chỉnh sửa
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <Save className="h-4 w-4" />
                    Lưu
                  </button>
                </>
              )}
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </button>
            </div>
          </div>
        </div>

        {/* Form 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cột trái */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Thông tin cơ bản</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mã phòng</Label>
                {isEditing ? (
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <p className="mt-2 text-gray-900 dark:text-white font-mono">{room.code}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên phòng</Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <p className="mt-2 text-gray-900 dark:text-white">{room.name}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tòa nhà</Label>
                {isEditing ? (
                  <select
                    value={formData.buildingId}
                    onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn tòa nhà</option>
                    {buildings.map(building => (
                      <option key={building.buildingId} value={building.buildingId}>
                        {building.code} - {building.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-2 text-gray-900 dark:text-white">{room.buildingName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tầng</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.floorNumber}
                      onChange={(e) => setFormData({ ...formData, floorNumber: parseInt(e.target.value) })}
                      className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <p className="mt-2 text-gray-900 dark:text-white">{room.floorNumber}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sức chứa</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <p className="mt-2 text-gray-900 dark:text-white">{room.capacity} người</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Thông tin khác</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loại phòng</Label>
                {isEditing ? (
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ly thuyet">Lý thuyết</option>
                    <option value="Thuc hanh">Thực hành</option>
                    <option value="Hoi thao">Hội thảo</option>
                  </select>
                ) : (
                  <p className="mt-2 text-gray-900 dark:text-white">
                    {room.type === 'Ly thuyet' ? 'Lý thuyết' : room.type === 'Thuc hanh' ? 'Thực hành' : 'Hội thảo'}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</Label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="San sang">Sẵn sàng</option>
                    <option value="Dang su dung">Đang sử dụng</option>
                    <option value="Bao tri">Bảo trì</option>
                  </select>
                ) : (
                  <div className="mt-2">
                    {room.status === 'San sang' ? (
                      <Badge className="bg-green-100 text-green-700">🟢 Sẵn sàng</Badge>
                    ) : room.status === 'Dang su dung' ? (
                      <Badge className="bg-yellow-100 text-yellow-700">🟡 Đang sử dụng</Badge>
                    ) : (
                      <Badge variant="secondary">🔴 Bảo trì</Badge>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Thiết bị</Label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasProjector}
                        onChange={(e) => setFormData({ ...formData, hasProjector: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Máy chiếu</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasAirConditioner}
                        onChange={(e) => setFormData({ ...formData, hasAirConditioner: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Điều hòa</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.hasComputer}
                        onChange={(e) => setFormData({ ...formData, hasComputer: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Máy tính</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {room.hasProjector && <Badge variant="outline">📽️ Máy chiếu</Badge>}
                    {room.hasAirConditioner && <Badge variant="outline">❄️ Điều hòa</Badge>}
                    {room.hasComputer && <Badge variant="outline">💻 Máy tính</Badge>}
                    {!room.hasProjector && !room.hasAirConditioner && !room.hasComputer && (
                      <span className="text-sm text-gray-400">Không có thiết bị</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</Label>
                {isEditing ? (
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    placeholder="Mô tả thêm về phòng học"
                  />
                ) : (
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    {room.description || 'Chưa có mô tả'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
