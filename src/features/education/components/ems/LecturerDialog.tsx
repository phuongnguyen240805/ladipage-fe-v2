'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/features/education/components/ui/dialog';
import { Button } from '@/features/education/components/ui/button';
import { Label } from '@/features/education/components/ui/label';
import { Input } from '@/features/education/components/ui/input';
import { Textarea } from '@/features/education/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/education/components/ui/select';
import { DatePicker } from '@/features/education/components/ui/date-picker';
import { Save, User, Briefcase, GraduationCap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { lecturerApi } from '@/features/education/api/lecturer';
import { departmentApi } from '@/features/education/api/department';
import { degreeApi } from '@/features/education/api/degree';
import { majorApi } from '@/features/education/api/major';
import type { InstructorAdminFormData, InstructorAdminCreateRequest, InstructorAdminUpdateRequest } from '@/features/education/types/instructor';
import type { Degree, Department, Major } from '@/features/education/types/lookup';

interface LecturerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lecturerId?: string | null;
  onSaveSuccess: () => void;
}

const contractTypeOptions = [
  { value: 'FULL_TIME', label: 'Toàn thời gian' },
  { value: 'PART_TIME', label: 'Bán thời gian' },
  { value: 'VISITING', label: 'Thỉnh giảng' },
  { value: 'PROBATION', label: 'Thử việc' },
];

const academicRankOptions = [
  { value: 'NONE', label: 'Chưa có' },
  { value: 'LECTURER', label: 'Giảng viên' },
  { value: 'SENIOR_LECTURER', label: 'Giảng viên chính' },
  { value: 'ASSOCIATE_PROFESSOR', label: 'Phó giáo sư' },
  { value: 'PROFESSOR', label: 'Giáo sư' },
];

const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : '');

const removeAccents = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

const getFirstNameNoAccent = (fullName: string) => {
  const normalized = removeAccents(fullName.trim()).replace(/\s+/g, ' ');
  const parts = normalized.split(' ').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1].toLowerCase() : '';
};

const defaultLecturer: InstructorAdminFormData = {
  fullName: '',
  dateOfBirth: '',
  gender: 'Nam',
  phoneNumber: '',
  contactEmail: '',
  permanentAddress: '',
  employeeCode: '',
  instructorCode: '',
  startWorkDate: '',
  endWorkDate: '',
  contractType: '',
  departmentId: '',
  degreeId: '',
  academicRank: '',
  majorId: '',
  specialization: '',
  institution: '',
  graduationYear: '',
  isActive: true,
  note: '',
};

type FormErrors = Partial<Record<keyof InstructorAdminFormData, string>>;

export default function LecturerDialog({
  open,
  onOpenChange,
  lecturerId,
  onSaveSuccess,
}: LecturerDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  
  const [formData, setFormData] = useState<InstructorAdminFormData>(defaultLecturer);
  const [errors, setErrors] = useState<FormErrors>({});
  const [dobDisplay, setDobDisplay] = useState<string>('');


  const formatIsoToDisplay = (iso?: string) => {
    if (!iso) return '';
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return iso;
    const [, y, mo, d] = m;
    return `${d}/${mo}/${y}`;
  };

  const parseDisplayToIso = (text: string) => {
    const t = String(text || '').trim();
    if (!t) return '';
    // Enforce slash-separated format: dd/mm/yyyy only
    const slashMatch = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const d = String(slashMatch[1]).padStart(2, '0');
      const m = String(slashMatch[2]).padStart(2, '0');
      const y = slashMatch[3];
      return `${y}-${m}-${d}`;
    }
    return undefined;
  };

  const getDepartmentId = (department: Department) => department.departmentId || department.id || '';
  const getDegreeId = (degree: Degree) => degree.degreeId || degree.id || '';
  const getMajorId = (major: Major) => major.majorId || major.id || '';

  const setField = (field: keyof InstructorAdminFormData, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  // Load lookups
  useEffect(() => {
    if (!open) return;

    const fetchLookups = async () => {
      try {
        const [departmentData, degreeData, majorData] = await Promise.all([
          departmentApi.getAll({ isActive: true }).catch(() => []),
          degreeApi.getAll({ isActive: true }).catch(() => []),
          majorApi.getAll({ isActive: true }).catch(() => []),
        ]);
        setDepartments(departmentData || []);
        setDegrees(degreeData || []);
        setMajors(majorData || []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu danh mục:', error);
        toast.error('Không thể tải đầy đủ danh mục dữ liệu');
      }
    };

    fetchLookups();
  }, [open]);

  // Load lecturer details if editing
  useEffect(() => {
    if (!open) return;

    if (lecturerId) {
      const fetchLecturer = async () => {
        try {
          setLoading(true);
          setErrors({});
          const lecturer = await lecturerApi.getById(lecturerId);
          setFormData({
            fullName: lecturer.fullName || '',
            dateOfBirth: toDateInputValue(lecturer.dateOfBirth),
            gender: lecturer.gender || 'Nam',
            phoneNumber: lecturer.phoneNumber || '',
            contactEmail: lecturer.contactEmail || '',
            permanentAddress: lecturer.permanentAddress || '',
            instructorCode: lecturer.instructorCode || '',
            startWorkDate: toDateInputValue(lecturer.startWorkDate),
            endWorkDate: toDateInputValue(lecturer.endWorkDate),
            contractType: lecturer.contractType || '',
             employeeCode: lecturer.employeeCode || '',
             // Ensure employeeCode is set when loading lecturer details
             // Keeps state consistent though field is not shown
            departmentId: lecturer.departmentId || '',
            degreeId: lecturer.degreeId || '',
            academicRank: lecturer.academicRank || '',
            majorId: lecturer.majorId || '',
            specialization: lecturer.specialization || '',
            institution: lecturer.institution || '',
            graduationYear: lecturer.graduationYear ? String(lecturer.graduationYear) : '',
            isActive: lecturer.isActive ?? true,
            note: lecturer.note || '',
          });
          setDobDisplay(formatIsoToDisplay(toDateInputValue(lecturer.dateOfBirth)));
        } catch (error) {
          console.error('Lỗi khi tải thông tin giảng viên:', error);
          toast.error('Không thể tải dữ liệu giảng viên');
          onOpenChange(false);
        } finally {
          setLoading(false);
        }
      };
      fetchLecturer();
    } else {
      setErrors({});
      setFormData(defaultLecturer);
      setDobDisplay('');
    }
  }, [open, lecturerId, onOpenChange]);

  useEffect(() => {
    setDobDisplay(formatIsoToDisplay(formData.dateOfBirth));
  }, [formData.dateOfBirth]);



  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!formData.fullName.trim()) nextErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.dateOfBirth) nextErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    if (!formData.departmentId) nextErrors.departmentId = 'Vui lòng chọn khoa/bộ môn';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaveLoading(true);
    const toastId = toast.loading(lecturerId ? 'Đang cập nhật giảng viên...' : 'Đang thêm giảng viên...');

    try {
        const payload: any = {
        fullName: formData.fullName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        note: formData.note || undefined,
        startWorkDate: formData.startWorkDate || undefined,
        endWorkDate: formData.endWorkDate || undefined,
        contractType: formData.contractType || undefined,
        departmentId: formData.departmentId,
        degreeId: formData.degreeId || undefined,
        academicRank: formData.academicRank || undefined,
        majorId: formData.majorId || undefined,
        specialization: formData.specialization || undefined,
        institution: formData.institution || undefined,
        graduationYear: formData.graduationYear ? Number(formData.graduationYear) : undefined,
        isActive: formData.isActive,
      };

      // Khi update: gửi thêm các field đã có
      if (lecturerId) {
        payload.employeeCode = formData.employeeCode || undefined;
        payload.instructorCode = formData.instructorCode || undefined;
        payload.contactEmail = formData.contactEmail || undefined;
      }

      if (lecturerId) {
        await lecturerApi.update(lecturerId, payload);
        toast.success('Cập nhật giảng viên thành công', { id: toastId });
      } else {
        await lecturerApi.create(payload);
        toast.success('Thêm giảng viên thành công', { id: toastId });
      }
      onOpenChange(false);
      onSaveSuccess();
    } catch (error: any) {
      console.error(error);
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(serverMessage || 'Thao tác thất bại', { id: toastId });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            {lecturerId ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên mới'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-semibold">Đang tải dữ liệu giảng viên...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* Section 1: Personal Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b pb-1.5">
                <User className="h-4 w-4" />
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setField('fullName', e.target.value)}
                    className="mt-1.5 h-10"
                    placeholder="VD: Nguyễn Văn An"
                    required
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
                  <Input
                    id="dateOfBirth"
                    value={dobDisplay}
                    onChange={(e) => setDobDisplay(e.target.value)}
                    onBlur={(e) => {
                      const iso = parseDisplayToIso(e.target.value);
                      if (!iso) {
                        setErrors((c) => ({ ...c, dateOfBirth: 'Ngày không hợp lệ' }));
                        setField('dateOfBirth', '');
                      } else {
                        setErrors((c) => ({ ...c, dateOfBirth: undefined }));
                        setField('dateOfBirth', iso);
                      }
                    }}
                    placeholder="dd/mm/yyyy"
                    className="mt-1.5 h-10"
                  />
                  {errors.dateOfBirth && <p className="mt-1 text-xs text-destructive">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <Label>Giới tính</Label>
                  <Select value={formData.gender} onValueChange={(value) => setField('gender', value || 'Nam')}>
                    <SelectTrigger className="mt-1.5 h-10 w-full">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setField('phoneNumber', e.target.value)}
                    className="mt-1.5 h-10"
                    placeholder="VD: 0987654321"
                  />
                </div>

                {lecturerId && (
                <div>
                  <Label htmlFor="contactEmail" className="flex items-center gap-1.5">
                    Email đào tạo
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded font-normal uppercase tracking-tight">Tự động</span>
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    readOnly
                    className="mt-1.5 h-10 bg-muted/50 italic"
                    placeholder="Hệ thống tự sinh khi lưu"
                  />
                </div>
                )}

                <div className="md:col-span-2 lg:col-span-3">
                  <Label htmlFor="permanentAddress">Địa chỉ thường trú</Label>
                  <Textarea
                    id="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={(e) => setField('permanentAddress', e.target.value)}
                    className="mt-1.5 min-h-[60px]"
                    placeholder="Nhập địa chỉ thường trú"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Work Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b pb-1.5">
                <Briefcase className="h-4 w-4" />
                Thông tin công tác
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {lecturerId && (
                <div>
                  <Label htmlFor="employeeCode" className="flex items-center gap-1.5">
                    Mã nhân viên (NV)
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded font-normal uppercase tracking-tight">Tự động</span>
                  </Label>
                  <Input
                    id="employeeCode"
                    value={formData.employeeCode}
                    readOnly
                    className="mt-1.5 h-10 bg-muted/50 font-mono"
                    placeholder="Hệ thống tự sinh khi lưu"
                  />
                </div>
                )}

                {lecturerId && (
                <div>
                  <Label htmlFor="instructorCode" className="flex items-center gap-1.5">
                    Mã giảng viên (GV)
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded font-normal uppercase tracking-tight">Tự động</span>
                  </Label>
                  <Input
                    id="instructorCode"
                    value={formData.instructorCode}
                    readOnly
                    className="mt-1.5 h-10 bg-muted/50 font-mono text-primary font-bold"
                    placeholder="Hệ thống tự sinh khi lưu"
                  />
                </div>
                )}

                <div>
                  <Label>Khoa/Bộ môn *</Label>
                  <Select value={formData.departmentId} onValueChange={(value) => setField('departmentId', value || '')}>
                    <SelectTrigger className="mt-1.5 h-10 w-full">
                      <SelectValue placeholder="Chọn khoa/bộ môn" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={getDepartmentId(department)} value={getDepartmentId(department)}>
                          {department.code ? `${department.code} - ${department.name}` : department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.departmentId && <p className="mt-1 text-xs text-destructive">{errors.departmentId}</p>}
                </div>

                <div>
                  <Label>Loại hợp đồng</Label>
                  <Select value={formData.contractType} onValueChange={(value) => setField('contractType', value || '')}>
                    <SelectTrigger className="mt-1.5 h-10 w-full">
                      <SelectValue placeholder="Chọn loại hợp đồng" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startWorkDate">Ngày bắt đầu làm việc</Label>
                  <DatePicker
                    id="startWorkDate"
                    value={formData.startWorkDate}
                    onChange={(value) => setField('startWorkDate', value)}
                    placeholder="dd/mm/yyyy"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="endWorkDate">Ngày kết thúc</Label>
                  <DatePicker
                    id="endWorkDate"
                    value={formData.endWorkDate}
                    onChange={(value) => setField('endWorkDate', value)}
                    placeholder="dd/mm/yyyy"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Academic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b pb-1.5">
                <GraduationCap className="h-4 w-4" />
                Học hàm, học vị và chuyên môn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Học vị</Label>
                  <Select value={formData.degreeId} onValueChange={(value) => setField('degreeId', value || '')}>
                    <SelectTrigger className="mt-1.5 h-10 w-full">
                      <SelectValue placeholder="Chọn học vị" />
                    </SelectTrigger>
                    <SelectContent>
                      {degrees.map((degree) => (
                        <SelectItem key={getDegreeId(degree)} value={getDegreeId(degree)}>
                          {degree.code ? `${degree.code} - ${degree.name}` : degree.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Học hàm</Label>
                  <Select value={formData.academicRank} onValueChange={(value) => setField('academicRank', value || '')}>
                    <SelectTrigger className="mt-1.5 h-10 w-full">
                      <SelectValue placeholder="Chọn học hàm" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicRankOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ngành chuyên môn</Label>
                  <Select value={formData.majorId} onValueChange={(value) => setField('majorId', value || '')}>
                    <SelectTrigger className="mt-1.5 h-10 w-full">
                      <SelectValue placeholder="Chọn ngành chuyên môn" />
                    </SelectTrigger>
                    <SelectContent>
                      {majors.map((major) => (
                        <SelectItem key={getMajorId(major)} value={getMajorId(major)}>
                          {major.code ? `${major.code} - ${major.name}` : major.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialization">Chuyên ngành sâu</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setField('specialization', e.target.value)}
                    className="mt-1.5 h-10"
                    placeholder="VD: Công nghệ phần mềm"
                  />
                </div>

                <div>
                  <Label htmlFor="institution">Cơ sở đào tạo</Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => setField('institution', e.target.value)}
                    className="mt-1.5 h-10"
                    placeholder="VD: Đại học Đông Á"
                  />
                </div>

                <div>
                  <Label htmlFor="graduationYear">Năm tốt nghiệp</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setField('graduationYear', e.target.value)}
                    className="mt-1.5 h-10"
                    placeholder="VD: 2024"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea
                    id="note"
                    value={formData.note}
                    onChange={(e) => setField('note', e.target.value)}
                    className="mt-1.5 min-h-[60px]"
                    placeholder="Nhập ghi chú nếu có"
                  />
                </div>

                {/* Active Toggle */}
                <div className="md:col-span-2 flex items-center justify-between pt-2 border-t mt-2">
                  <Label htmlFor="isActive" className="text-sm font-semibold text-slate-900 dark:text-slate-200">Trạng thái hoạt động</Label>
                  <button
                    type="button"
                    id="isActive"
                    onClick={() => setField('isActive', !formData.isActive)}
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
              </div>
            </div>

            <DialogFooter className="pt-4 border-t gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saveLoading} className="bg-primary hover:bg-primary/90 text-white font-semibold">
                {saveLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Save className="h-4 w-4" />
                    Lưu giảng viên
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
