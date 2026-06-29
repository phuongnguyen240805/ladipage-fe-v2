'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/education/components/ui/card';
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
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trainingProgramApi } from '@/features/education/api/training-program';
import { majorApi } from '@/features/education/api/major';
import { academicCohortApi } from '@/features/education/api/academic-cohort';

export default function TrainingProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [majors, setMajors] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    programCode: '',
    programName: '',
    majorId: '',
    academicCohortId: '',
    academicYear: '',
    departmentId: '',
    totalCredits: 0,
    description: '',
    note: '',
    degreeLevel: 'Đại học',
    educationType: 'Chính quy',
    durationYears: 4,
    maxDurationYears: 6,
    effectiveDate: new Date().toISOString().split('T')[0],
    isActive: true
  });

  // Load danh sách chương trình
  const fetchPrograms = async () => {
    setLoading(true);
    try {

      const response = await trainingProgramApi.getAll({ keyword: searchTerm, size: 100 });
      setPrograms(response);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách chương trình đào tạo');
    } finally {
      setLoading(false);
    }
  };

  // Load danh sách majors và cohorts
  const fetchMasterData = async () => {
    try {
      const [majorsRes, cohortsRes]: any = await Promise.all([
        majorApi.getAll({ size: 100 }),
        academicCohortApi.getAll()
      ]);
      
      let majorsData = [];
      if (majorsRes?.data?.content) majorsData = majorsRes.data.content;
      else if (majorsRes?.content) majorsData = majorsRes.content;
      else if (Array.isArray(majorsRes?.data)) majorsData = majorsRes.data;
      else if (Array.isArray(majorsRes)) majorsData = majorsRes;
      setMajors(majorsData);
      
      let cohortsData = [];
      if (cohortsRes?.data?.content) cohortsData = cohortsRes.data.content;
      else if (cohortsRes?.content) cohortsData = cohortsRes.content;
      else if (Array.isArray(cohortsRes?.data)) cohortsData = cohortsRes.data;
      else if (Array.isArray(cohortsRes)) cohortsData = cohortsRes;
      setCohorts(cohortsData);
    } catch (error) {
      console.error('Lỗi tải master data:', error);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchMasterData();
  }, [searchTerm]);

  const majorLabels = new Map(
    majors.map((major) => [
      major.majorId || major.id,
      [major.code, major.name].filter(Boolean).join(' - '),
    ]),
  );
  const cohortLabels = new Map(
    cohorts.map((cohort) => [
      cohort.academicCohortId || cohort.cohortId || cohort.id,
      [cohort.code, cohort.name].filter(Boolean).join(' - '),
    ]),
  );

  // Mở dialog thêm mới
  const handleOpenCreate = () => {
    setEditingProgram(null);
    setFormData({
      code: '',
      name: '',
      programCode: '',
      programName: '',
      majorId: '',
      academicCohortId: '',
      academicYear: '',
      departmentId: '',
      totalCredits: 0,
      description: '',
      note: '',
      degreeLevel: 'Đại học',
      educationType: 'Chính quy',
      durationYears: 4,
      maxDurationYears: 6,
      effectiveDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
    setDialogOpen(true);
  };

  // Mở dialog chỉnh sửa
  const handleOpenEdit = async (program: any) => {
    try {
      const response: any = await trainingProgramApi.getById(program.trainingProgramId || program.id);
      const data = response?.data || response;
      
      setEditingProgram(data);
      setFormData({
        code: data.code || '',
        name: data.name || '',
        programCode: data.programCode || data.code || '',
        programName: data.programName || data.name || '',
        majorId: data.majorId || '',
        academicCohortId: data.academicCohortId || '',
        academicYear: data.academicYear || '',
        departmentId: data.departmentId || '',
        totalCredits: data.totalCredits || 0,
        description: data.description || '',
        note: data.note || '',
        degreeLevel: data.degreeLevel || 'Đại học',
        educationType: data.educationType || 'Chính quy',
        durationYears: data.durationYears || 4,
        maxDurationYears: data.maxDurationYears || 6,
        effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
        isActive: data.isActive !== false
      });
      setDialogOpen(true);
    } catch (error) {
      toast.error('Không thể lấy thông tin chương trình');
    }
  };

  // Lưu
  const handleSave = async () => {
    const selectedMajor = majors.find((major) => (major.majorId || major.id) === formData.majorId);
    const departmentId = formData.departmentId || selectedMajor?.departmentId || '';

    if (!formData.code || !formData.name || !formData.majorId || !formData.academicCohortId || !departmentId) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      const admissionYearFormatted = `${new Date().getFullYear()}-01-01`;
      const submitData = {
        ...formData,
        departmentId,
        programCode: formData.code,
        programName: formData.name,
        admissionYear: admissionYearFormatted,
        totalCredits: Number(formData.totalCredits),
        durationYears: Number(formData.durationYears),
        maxDurationYears: Number(formData.maxDurationYears),
        isActive: true
      };

      if (editingProgram) {
        await trainingProgramApi.update(editingProgram.trainingProgramId || editingProgram.id, submitData);
        toast.success('Cập nhật chương trình thành công');
      } else {
        await trainingProgramApi.create(submitData);
        toast.success('Thêm chương trình thành công');
      }
      setDialogOpen(false);
      fetchPrograms();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Xóa
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa chương trình "${name}"?`)) {
      try {
        await trainingProgramApi.delete(id);
        toast.success('Xóa chương trình thành công');
        fetchPrograms();
      } catch (error) {
        toast.error('Không thể xóa chương trình');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Chương trình đào tạo</h1>
          <p className="text-muted-foreground">Quản lý các chương trình đào tạo của nhà trường</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Thêm chương trình
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm chương trình..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Mã chương trình</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Tên chương trình</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Ngành</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Khoa</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Khóa học</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Tín chỉ</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8">Đang tải...</td></tr>
                ) : programs.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8">Chưa có chương trình đào tạo nào</td></tr>
                ) : (
                  programs.map((item) => (
                    <tr key={item.trainingProgramId || item.id} className="border-b hover:bg-muted/50 transition-colors">

                      <td className="py-3 px-4 text-sm font-medium">{item.code || item.programCode}</td>
                      <td className="py-3 px-4 text-sm">{item.name || item.programName}</td>
                      <td className="py-3 px-4 text-sm">{item.majorName || majorLabels.get(item.majorId) || 'Chưa có thông tin'}</td>
                      <td className="py-3 px-4 text-sm">{item.departmentName || 'Chưa có thông tin'}</td>
                      <td className="py-3 px-4 text-sm">{item.academicCohortName || item.academicYear || cohortLabels.get(item.academicCohortId) || 'Chưa có thông tin'}</td>
                      <td className="py-3 px-4 text-sm">{item.totalCredits}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(item.trainingProgramId || item.id, item.name || item.programName || item.code || 'này')}
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

      {/* Dialog Thêm/Sửa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Chỉnh sửa chương trình đào tạo' : 'Thêm chương trình đào tạo mới'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label>Mã chương trình *</Label>
              <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
            </div>
            <div>
              <Label>Tên chương trình *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <Label>Ngành học *</Label>
              <select
                value={formData.majorId}
                onChange={(e) => {
                  const major = majors.find((m) => (m.majorId || m.id) === e.target.value);
                  setFormData({...formData, majorId: e.target.value, departmentId: major?.departmentId || ''});
                }}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="">-- Chọn ngành --</option>
                {majors.map((m) => (
                  <option key={m.majorId} value={m.majorId}>{m.code} - {m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Khóa học *</Label>
              <select
                value={formData.academicCohortId}
                onChange={(e) => setFormData({...formData, academicCohortId: e.target.value})}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="">-- Chọn khóa --</option>
                {cohorts.map((c) => (
                  <option key={c.cohortId} value={c.cohortId}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Năm học</Label>
              <Input value={formData.academicYear} onChange={(e) => setFormData({...formData, academicYear: e.target.value})} placeholder="2024-2028" />
            </div>
            <div>
              <Label>Tổng tín chỉ</Label>
              <Input type="number" value={formData.totalCredits} onChange={(e) => setFormData({...formData, totalCredits: parseInt(e.target.value) || 0})} />
            </div>
            <div className="md:col-span-2">
              <Label>Mô tả</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-green-600" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
