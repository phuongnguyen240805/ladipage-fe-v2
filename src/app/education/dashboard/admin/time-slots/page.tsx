'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/features/education/components/ui/card';
import { Button } from '@/features/education/components/ui/button';
import { Badge } from '@/features/education/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/education/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/features/education/components/ui/dialog';
import { Input } from '@/features/education/components/ui/input';
import { Label } from '@/features/education/components/ui/label';
import { Plus, Edit, Trash2, Clock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { timeSlotApi } from '@/features/education/api/timeSlot';

// Định nghĩa type cho TimeSlot - ĐÚNG VỚI BACKEND
interface TimeSlot {
  timeSlotId: string;  // ← Quan trọng: timeSlotId, không phải id
  slotCode: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// Hàm format time từ "14:45:00" thành "14:45"
const formatTime = (timeString: string) => {
  if (!timeString) return '';
  return timeString.substring(0, 5);
};

export default function TimeSlotPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [slotToDelete, setSlotToDelete] = useState<TimeSlot | null>(null);
  
  // Dialog state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    slotCode: '',
    startTime: '',
    endTime: '',
    isActive: true
  });

  const fetchTimeSlots = async () => {
    try {
      const response: any = await timeSlotApi.getAll();
      const listData = response?.data || response || [];
      setTimeSlots(listData);
    } catch (error) {
      console.error(error);
      toast.error('Không thể lấy danh sách ca học');
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const handleDelete = (slot: TimeSlot) => {
    setSlotToDelete(slot);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (slotToDelete) {
      try {
        await timeSlotApi.delete(slotToDelete.timeSlotId);
        setTimeSlots(timeSlots.filter(s => s.timeSlotId !== slotToDelete.timeSlotId));
        toast.success(`Đã xóa ca học ${slotToDelete.slotCode}`);
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi xóa ca học');
      }
    }
    setDeleteDialogOpen(false);
    setSlotToDelete(null);
  };

  const handleOpenModal = (slot?: TimeSlot) => {
    if (slot) {
      setEditingTimeSlot(slot);
      setFormData({
        slotCode: slot.slotCode,
        startTime: formatTime(slot.startTime),
        endTime: formatTime(slot.endTime),
        isActive: slot.isActive
      });
    } else {
      setEditingTimeSlot(null);
      setFormData({
        slotCode: '',
        startTime: '',
        endTime: '',
        isActive: true
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slotCode || !formData.startTime || !formData.endTime) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      // Backend expects "HH:mm:ss" format
      const submitData = {
        slotCode: formData.slotCode,
        startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
        endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
        isActive: formData.isActive
      };

      if (editingTimeSlot) {
        await timeSlotApi.update(editingTimeSlot.timeSlotId, submitData);
        toast.success('Cập nhật ca học thành công');
      } else {
        await timeSlotApi.create(submitData);
        toast.success('Thêm ca học mới thành công');
      }
      setModalOpen(false);
      fetchTimeSlots();
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.response?.data?.message || 'Thao tác thất bại';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            Quản lý ca học
          </h1>
          <p className="text-muted-foreground">Danh sách và quản lý thời gian các ca học</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Thêm ca học
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-4 px-6 font-semibold text-sm">Mã ca học</th>
                  <th className="text-left py-4 px-6 font-semibold text-sm">Thời gian bắt đầu</th>
                  <th className="text-left py-4 px-6 font-semibold text-sm">Thời gian kết thúc</th>
                  <th className="text-left py-4 px-6 font-semibold text-sm">Trạng thái</th>
                  <th className="text-left py-4 px-6 font-semibold text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot.timeSlotId} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium">{slot.slotCode}</td>
                    <td className="py-4 px-6 text-sm">{formatTime(slot.startTime)}</td>
                    <td className="py-4 px-6 text-sm">{formatTime(slot.endTime)}</td>
                    <td className="py-4 px-6 text-sm">
                      <Badge variant={slot.isActive ? 'default' : 'secondary'}>
                        {slot.isActive ? 'Hoạt động' : 'Ngừng'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenModal(slot)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(slot)} 
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {timeSlots.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Không có dữ liệu ca học
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTimeSlot ? 'Chỉnh sửa ca học' : 'Thêm ca học mới'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div>
              <Label htmlFor="slotCode">Mã ca học *</Label>
              <Input
                id="slotCode"
                value={formData.slotCode}
                onChange={(e) => setFormData({ ...formData, slotCode: e.target.value })}
                className="mt-1.5"
                placeholder="T1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Thời gian bắt đầu *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">Thời gian kết thúc *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mt-1.5"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="isActive">Trạng thái hoạt động</Label>
              <button
                type="button"
                id="isActive"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  formData.isActive ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    formData.isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa ca học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ca học <strong>{slotToDelete?.slotCode}</strong>? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}