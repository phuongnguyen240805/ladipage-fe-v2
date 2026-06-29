'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { Save, User, GraduationCap, RefreshCw, BookOpenCheck, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/features/education/lib/utils';
import { academicCohortApi } from '@/features/education/api/academic-cohort';
import { administrativeClassApi } from '@/features/education/api/administrative-class';
import { departmentApi } from '@/features/education/api/department';
import { majorApi } from '@/features/education/api/major';
import { semesterApi } from '@/features/education/api/semester';
import { studentApi } from '@/features/education/api/student';
import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { trainingProgramApi } from '@/features/education/api/training-program';
import type { AcademicCohort, AdministrativeClass, Department, Major, TrainingProgram } from '@/features/education/types/lookup';
import type { Semester } from '@/features/education/api/admin-resources';
import type { StudentAdminFormData } from '@/features/education/types/student';

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId?: string | null;
  onSaveSuccess: () => void;
}

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

const defaultStudent: StudentAdminFormData = {
  fullName: '',
  studentCode: '',
  dateOfBirth: '',
  gender: 'Nam',
  phoneNumber: '',
  contactEmail: '',
  permanentAddress: '',
  departmentId: '',
  trainingProgramId: '',
  majorId: '',
  academicCohortId: '',
  classId: '',
  semesterId: '',
  admissionDate: '',
  isActive: true,
  note: '',
};

type FormErrors = Partial<Record<keyof StudentAdminFormData, string>>;

const SAVE_ERROR_MESSAGE = 'Không thể lưu. Vui lòng kiểm tra lại thông tin.';

const getSaveErrorMessage = (error: any) => {
  const responseData = error?.response?.data;
  return responseData?.message
    || responseData?.error
    || (Array.isArray(responseData?.errors) ? responseData.errors.join(', ') : null)
    || 'Thao tác thất bại, vui lòng thử lại';
};

const mapSaveErrorToFields = (message: string): FormErrors => {
  const normalized = message.toLowerCase();
  const fieldErrors: FormErrors = {};

  if (normalized.includes('query did not return a unique result') || normalized.includes('nonunique') || normalized.includes('unique result')) {
    return fieldErrors;
  }

  if (normalized.includes('họ tên')) fieldErrors.fullName = message;
  if (normalized.includes('ngày sinh')) fieldErrors.dateOfBirth = message;
  if (normalized.includes('mã sinh viên')) fieldErrors.studentCode = message;
  if (normalized.includes('khoa/bộ môn') || normalized.includes('khoa')) fieldErrors.departmentId = message;
  if (normalized.includes('chương trình đào tạo')) fieldErrors.trainingProgramId = message;
  if (normalized.includes('ngành')) fieldErrors.majorId = message;
  if (normalized.includes('khóa tuyển sinh') || normalized.includes('khóa học')) fieldErrors.academicCohortId = message;
  if (normalized.includes('học kỳ')) fieldErrors.semesterId = message;
  if (normalized.includes('email edu') || normalized.includes('email liên hệ') || normalized.includes('email')) fieldErrors.contactEmail = message;
  if (normalized.includes('số điện thoại') || normalized.includes('điện thoại')) fieldErrors.phoneNumber = message;
  if (normalized.includes('địa chỉ')) fieldErrors.permanentAddress = message;

  return fieldErrors;
};

const getFriendlySystemError = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('query did not return a unique result') || normalized.includes('nonunique') || normalized.includes('unique result')) {
    return SAVE_ERROR_MESSAGE;
  }

  if (normalized.includes('constraint') || normalized.includes('duplicate') || normalized.includes('data integrity')) {
    return SAVE_ERROR_MESSAGE;
  }

  return SAVE_ERROR_MESSAGE;
};

export default function StudentDialog({
  open,
  onOpenChange,
  studentId,
  onSaveSuccess,
}: StudentDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [cohorts, setCohorts] = useState<AcademicCohort[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [classes, setClasses] = useState<AdministrativeClass[]>([]);

  const [formData, setFormData] = useState<StudentAdminFormData>(defaultStudent);
  const [originalValues, setOriginalValues] = useState<StudentAdminFormData | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);


  const getProgramId = (program: TrainingProgram) => program.trainingProgramId || program.programId || program.id || '';
  const getProgramCode = (program: TrainingProgram) => program.code || program.programCode || 'CTDT';
  const getProgramName = (program: TrainingProgram) => program.name || program.programName || 'Chương trình đào tạo';
  const getDepartmentId = (department: Department) => department.departmentId || department.id || '';
  const getDepartmentName = (department: Department) => department.name || 'Khoa/Bộ môn';
  const getMajorId = (major: Major) => major.majorId || major.id || '';
  const getCohortId = (cohort: AcademicCohort) => cohort.academicCohortId || cohort.cohortId || cohort.id || '';
  const getSemesterId = (semester: Semester) => semester.semesterId || '';
  const getSemesterName = (semester: Semester) => semester.name || 'Học kỳ';
  const getClassId = (classItem: AdministrativeClass) => classItem.classId || classItem.id || '';
  const controlClass = (field: keyof FormErrors, baseClass: string) =>
    cn(baseClass, errors[field] && 'border-destructive focus-visible:ring-destructive/20 focus-visible:ring-2');

  // ── Cascading filter helpers ───────────────────────────────────────────────
  // Programs filtered by selected department
  const filteredPrograms = useMemo(() => {
    if (!formData.departmentId) return programs;
    return programs.filter((p) => !p.departmentId || p.departmentId === formData.departmentId);
  }, [programs, formData.departmentId]);

  // Majors filtered by selected department
  const filteredMajors = useMemo(() => {
    if (!formData.departmentId) return majors;
    return majors.filter((m) => !m.departmentId || m.departmentId === formData.departmentId);
  }, [majors, formData.departmentId]);

  // All cohorts (show all, no filter) — put program's suggested cohort first
  const filteredCohorts = useMemo(() => {
    const prog = programs.find((p) => getProgramId(p) === formData.trainingProgramId);
    if (!prog?.academicCohortId) return cohorts;
    // Put the program-matched cohort at the top for easy selection
    const matched = cohorts.filter((c) => getCohortId(c) === prog.academicCohortId);
    const rest = cohorts.filter((c) => getCohortId(c) !== prog.academicCohortId);
    return [...matched, ...rest];
  }, [cohorts, programs, formData.trainingProgramId]);

  // Classes filtered by selected department AND academicCohortId
  const filteredClasses = useMemo(() => {
    let result = classes;
    if (formData.departmentId) {
      result = result.filter((c) => !c.departmentId || c.departmentId === formData.departmentId);
    }
    if (formData.academicCohortId) {
      result = result.filter((c) => !c.academicCohortId || c.academicCohortId === formData.academicCohortId);
    }
    return result;
  }, [classes, formData.departmentId, formData.academicCohortId]);

  // Program data for the currently selected training program
  const selectedProgramData = useMemo(
    () => programs.find((p) => getProgramId(p) === formData.trainingProgramId),
    [programs, formData.trainingProgramId],
  );
  // Major is auto-filled but still editable (for edge cases)
  const isMajorLockedByProgram = !!selectedProgramData?.majorId;
  // Cohort: warn if differs from program's expected cohort (not locked)
  const cohortMismatch =
    !!selectedProgramData?.academicCohortId &&
    !!formData.academicCohortId &&
    formData.academicCohortId !== selectedProgramData.academicCohortId;
  // ─────────────────────────────────────────────────────────────────────────

  const setField = (field: keyof StudentAdminFormData, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleFullNameChange = (name: string) => {
    setFormData((current) => ({ ...current, fullName: name }));
    setErrors((current) => ({ ...current, fullName: undefined }));
  };

  // When department changes: reset program, major, cohort, class to avoid mismatches
  const handleDepartmentChange = (deptId: string) => {
    setFormData((current) => ({
      ...current,
      departmentId: deptId,
      trainingProgramId: '',
      majorId: '',
      academicCohortId: '',
      classId: '',
      semesterId: '',
    }));
    setErrors((current) => ({ ...current, departmentId: undefined, trainingProgramId: undefined, majorId: undefined, academicCohortId: undefined }));
  };

  // When program changes: auto-fill AND lock major + cohort from program data
  // If cohort changes, also reset class (class must belong to cohort)
  const handleProgramChange = (programId: string | null) => {
    if (!programId) {
      setFormData((current) => ({ ...current, trainingProgramId: '', majorId: '', academicCohortId: '' }));
      return;
    }
    const program = programs.find((item) => getProgramId(item) === programId);
    setFormData((current) => {
      const newCohortId = program?.academicCohortId || current.academicCohortId;
      const cohortChanged = newCohortId !== current.academicCohortId;
      return {
        ...current,
        trainingProgramId: programId,
        majorId: program?.majorId || current.majorId,
        academicCohortId: newCohortId,
        // Reset class if cohort changes (old class belongs to old cohort)
        classId: cohortChanged ? '' : current.classId,
        semesterId: cohortChanged ? '' : current.semesterId,
      };
    });
    setErrors((current) => ({
      ...current,
      trainingProgramId: undefined,
      majorId: undefined,
      academicCohortId: undefined,
    }));
  };

  // Load lookups
  useEffect(() => {
    if (!open) return;

    const fetchLookups = async () => {
      try {
        const [deptData, progData, majData, cohData, semData, clsData] = await Promise.all([
          departmentApi.getAll({ isActive: true }).catch(() => []),
          trainingProgramApi.getAll({ size: 100 }).catch(() => []),
          majorApi.getAll({ isActive: true }).catch(() => []),
          academicCohortApi.getAll({ isActive: true }).catch(() => []),
          semesterApi.getAll({ isActive: true }).catch(() => []),
          administrativeClassApi.getAll({ isActive: true }).catch(() => []),
        ]);

        setDepartments(deptData || []);
        setPrograms(progData || []);
        setMajors(majData || []);
        setCohorts(cohData || []);
        setSemesters(semData || []);
        setClasses(clsData || []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu danh mục:', error);
        toast.error('Không thể tải đầy đủ danh mục dữ liệu sinh viên');
      }
    };

    fetchLookups();
  }, [open]);

  // Load student details if editing
  useEffect(() => {
    if (!open) return;

    if (studentId) {
      const fetchStudent = async () => {
        try {
          setLoading(true);
          setErrors({});
          setApiError(null);
          const student = await studentApi.getById(studentId);
          const initialData: StudentAdminFormData = {
            fullName: student.fullName || '',
            studentCode: student.studentCode || '',
            dateOfBirth: toDateInputValue(student.dateOfBirth),
            departmentId: student.departmentId || '',
            semesterId: (student as any).semesterId || '',
            gender: student.gender || 'Nam',
            phoneNumber: student.phoneNumber || '',
            contactEmail: student.contactEmail || '',
            permanentAddress: student.permanentAddress || '',
            trainingProgramId: student.trainingProgramId || '',
            majorId: student.majorId || '',
            academicCohortId: student.academicCohortId || '',
            classId: student.classId || '',
            admissionDate: toDateInputValue(student.admissionDate),
            isActive: student.isActive ?? true,
            note: student.note || '',
          };
          setFormData(initialData);
          setOriginalValues(initialData);
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu sinh viên:', error);
          toast.error('Không thể tải dữ liệu sinh viên');
          onOpenChange(false);
        } finally {
          setLoading(false);
        }
      };
      fetchStudent();
    } else {
      setErrors({});
      setApiError(null);
      setFormData(defaultStudent);
      setOriginalValues(null);
    }
  }, [open, studentId, onOpenChange]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!formData.fullName.trim()) nextErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.dateOfBirth) nextErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    if (!formData.departmentId) nextErrors.departmentId = 'Vui lòng chọn khoa';
    if (!formData.trainingProgramId) nextErrors.trainingProgramId = 'Vui lòng chọn chương trình đào tạo';
    if (!formData.majorId) nextErrors.majorId = 'Vui lòng chọn ngành';
    if (!formData.academicCohortId) nextErrors.academicCohortId = 'Vui lòng chọn khóa tuyển sinh';
    // semester removed from form

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaveLoading(true);
    setApiError(null);
    const toastId = toast.loading(studentId ? 'Đang cập nhật sinh viên...' : 'Đang thêm sinh viên...');
    // build payload up-front
    const classIdVal = undefined;
    const isUpdate = Boolean(studentId);

    const buildUpdatePayload = () => {
      const payload: any = {
        fullName: formData.fullName.trim(),
        studentCode: formData.studentCode || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        contactEmail: formData.contactEmail || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        admissionDate: formData.admissionDate || undefined,
        isActive: formData.isActive,
        note: formData.note || undefined,
      };

      if (originalValues) {
        const deptChanged = formData.departmentId !== originalValues.departmentId;
        const progChanged = formData.trainingProgramId !== originalValues.trainingProgramId;
        const majorChanged = formData.majorId !== originalValues.majorId;
        const cohortChanged = formData.academicCohortId !== originalValues.academicCohortId;
        const classChanged = formData.classId !== originalValues.classId;
        if (deptChanged || progChanged || majorChanged || cohortChanged) {
          payload.departmentId = formData.departmentId || undefined;
          payload.trainingProgramId = formData.trainingProgramId || undefined;
          payload.majorId = formData.majorId || undefined;
          payload.academicCohortId = formData.academicCohortId || undefined;
        }
        if (classChanged) {
          payload.classId = formData.classId || undefined;
        }
      } else {
        payload.departmentId = formData.departmentId || undefined;
        payload.trainingProgramId = formData.trainingProgramId || undefined;
        payload.majorId = formData.majorId || undefined;
        payload.academicCohortId = formData.academicCohortId || undefined;
        payload.classId = formData.classId || undefined;
      }

      // Only include academic references (cohort/program/major) when changed
      return payload;
    };

    const buildCreatePayload = () => ({
      fullName: formData.fullName.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phoneNumber: formData.phoneNumber || undefined,
      // contactEmail & studentCode: BE tự sinh, không gửi lên
      permanentAddress: formData.permanentAddress || undefined,
      departmentId: formData.departmentId,
      trainingProgramId: formData.trainingProgramId,
      majorId: formData.majorId,
      academicCohortId: formData.academicCohortId,
      classId: formData.classId || undefined,
      admissionDate: formData.admissionDate || undefined,
      note: formData.note || undefined,
    });

    try {
      const payload = isUpdate ? buildUpdatePayload() : buildCreatePayload();
      console.log('=== SAVE PAYLOAD ===', JSON.stringify(payload, null, 2));
      if (isUpdate) {
        await studentApi.update(studentId!, payload);
        toast.success('Cập nhật sinh viên thành công', { id: toastId });
      } else {
        await studentApi.createAdmin(payload);
        toast.success('Thêm sinh viên thành công', { id: toastId });
      }
      onOpenChange(false);
      onSaveSuccess();
    } catch (error: any) {
      console.warn('Student save failed', {
        status: error?.response?.status,
        responseData: error?.response?.data,
      });
      const rawMessage = getSaveErrorMessage(error);
      const serverMessage = getFriendlySystemError(rawMessage);
      const fieldErrors = mapSaveErrorToFields(serverMessage);
      const hasFieldErrors = Object.keys(fieldErrors).length > 0;

      

      if (hasFieldErrors) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
        setApiError(SAVE_ERROR_MESSAGE);
      } else {
        setApiError(serverMessage);
      }

      toast.error(serverMessage, { id: toastId });
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
            {studentId ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-semibold">Đang tải dữ liệu sinh viên...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* Personal Info */}
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
                    onChange={(e) => handleFullNameChange(e.target.value)}
                    className={controlClass('fullName', 'mt-1.5 h-10')}
                    placeholder="VD: Nguyễn Văn A"
                    required
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
                </div>

                {studentId && (
                <div>
                  <Label htmlFor="studentCode" className="flex items-center gap-1.5">
                    Mã sinh viên
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded font-normal uppercase tracking-tight">Tự động</span>
                  </Label>
                  <Input
                    id="studentCode"
                    value={formData.studentCode}
                    readOnly
                    className={controlClass('studentCode', 'mt-1.5 h-10 bg-slate-50 font-mono text-primary font-semibold')}
                    placeholder="Hệ thống tự sinh khi lưu"
                  />
                </div>
                )}

                <div>
                  <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
                  <DatePicker
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(value) => setField('dateOfBirth', value)}
                    placeholder="Chọn ngày sinh"
                    className={cn('mt-1.5 rounded-md', errors.dateOfBirth && 'ring-1 ring-destructive/60')}
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
                    className={controlClass('phoneNumber', 'mt-1.5 h-10')}
                    placeholder="VD: 0987654321"
                  />
                </div>

                {studentId && (
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
                    className={controlClass('contactEmail', 'mt-1.5 h-10 bg-slate-50 text-slate-600 italic')}
                    placeholder="Hệ thống tự sinh khi lưu"
                  />
                </div>
                )}

                <div className="md:col-span-2 lg:col-span-2">
                  <Label htmlFor="permanentAddress">Địa chỉ thường trú</Label>
                  <Textarea
                    id="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={(e) => setField('permanentAddress', e.target.value)}
                    className={controlClass('permanentAddress', 'mt-1.5 min-h-[60px]')}
                    placeholder="Nhập địa chỉ thường trú"
                  />
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b pb-1.5">
                <GraduationCap className="h-4 w-4" />
                Chương trình học
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-1">
                  <Label>Khoa/Bộ môn *</Label>
                  <Select value={formData.departmentId} onValueChange={handleDepartmentChange}>
                    <SelectTrigger className={controlClass('departmentId', 'mt-1.5 h-10 w-full')}>
                        <SelectValue>
                          {departments.find((d) => getDepartmentId(d) === formData.departmentId)
                            ? getDepartmentName(departments.find((d) => getDepartmentId(d) === formData.departmentId) as Department)
                            : 'Chọn khoa/bộ môn'}
                        </SelectValue>
                      </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={getDepartmentId(dept)} value={getDepartmentId(dept)}>
                          {getDepartmentName(dept)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.departmentId && <p className="mt-1 text-xs text-destructive">{errors.departmentId}</p>}
                </div>

                <div className="md:col-span-2 lg:col-span-2">
                  <Label>Chương trình đào tạo *</Label>
                  <Select
                    value={formData.trainingProgramId}
                    onValueChange={handleProgramChange}
                    disabled={!formData.departmentId}
                  >
                    <SelectTrigger className={controlClass('trainingProgramId', 'mt-1.5 h-10 w-full')}>
                      <SelectValue>
                        {programs.find((p) => getProgramId(p) === formData.trainingProgramId)
                          ? `${getProgramCode(programs.find((p) => getProgramId(p) === formData.trainingProgramId) as TrainingProgram)} - ${getProgramName(programs.find((p) => getProgramId(p) === formData.trainingProgramId) as TrainingProgram)}`
                          : formData.departmentId ? 'Chọn chương trình đào tạo' : 'Chọn khoa trước'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPrograms.map((program) => (
                        <SelectItem key={getProgramId(program)} value={getProgramId(program)}>
                          {getProgramCode(program)} - {getProgramName(program)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.trainingProgramId && <p className="mt-1 text-xs text-destructive">{errors.trainingProgramId}</p>}
                </div>

                <div>
                  <Label className="flex items-center gap-1">
                    Ngành *
                    {isMajorLockedByProgram && (
                      <span className="text-xs text-muted-foreground font-normal">(tự động từ CTĐT)</span>
                    )}
                  </Label>
                  <Select
                    value={formData.majorId}
                    onValueChange={(value) => setField('majorId', value || '')}
                    disabled={isMajorLockedByProgram}
                  >
                    <SelectTrigger className={controlClass('majorId', 'mt-1.5 h-10 w-full')}>
                      <SelectValue>
                        {majors.find((m) => getMajorId(m) === formData.majorId)
                          ? (majors.find((m) => getMajorId(m) === formData.majorId) as Major).name
                          : 'Chọn ngành'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMajors.map((major) => (
                        <SelectItem key={getMajorId(major)} value={getMajorId(major)}>
                          {major.code ? `${major.code} - ${major.name}` : major.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.majorId && <p className="mt-1 text-xs text-destructive">{errors.majorId}</p>}
                </div>

                <div>
                  <Label className="flex items-center gap-1">
                    Khóa tuyển sinh *
                    {selectedProgramData?.academicCohortId && !cohortMismatch && (
                      <span className="text-xs text-muted-foreground font-normal">(gợi ý từ CTĐT)</span>
                    )}
                  </Label>
                  <Select
                    value={formData.academicCohortId}
                    onValueChange={(value) => setField('academicCohortId', value || '')}
                  >
                      <SelectTrigger className={cn(
                      'mt-1.5 h-10 w-full',
                      cohortMismatch ? 'border-amber-400 focus:ring-amber-400' : '',
                      errors.academicCohortId && 'border-destructive focus-visible:ring-destructive/20 focus-visible:ring-2',
                    )}>
                      <SelectValue>
                        {cohorts.find((c) => getCohortId(c) === formData.academicCohortId)
                          ? (cohorts.find((c) => getCohortId(c) === formData.academicCohortId) as AcademicCohort).name
                          : 'Chọn khóa'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCohorts.map((cohort) => (
                        <SelectItem key={getCohortId(cohort)} value={getCohortId(cohort)}>
                          {cohort.code ? `${cohort.code} - ${cohort.name}` : cohort.name}
                          {getCohortId(cohort) === selectedProgramData?.academicCohortId ? ' ✓' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {cohortMismatch && (
                    <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                      ⚠️ Khóa này khác với khóa gốc của CTĐT. Chỉ lưu nếu bạn chắc chắn.
                    </p>
                  )}
                  {errors.academicCohortId && <p className="mt-1 text-xs text-destructive">{errors.academicCohortId}</p>}
                </div>

                <div>
                  <Label>Lớp hành chính</Label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) => setField('classId', value || '')}
                    disabled={!formData.departmentId || !formData.academicCohortId}
                  >
                    <SelectTrigger className="mt-1.5 h-10 w-full">
                      <SelectValue>
                        {classes.find((c) => getClassId(c) === formData.classId)
                          ? (classes.find((c) => getClassId(c) === formData.classId) as AdministrativeClass).classCode
                          : !formData.departmentId || !formData.academicCohortId
                            ? 'Chọn Khoa & Khóa trước'
                            : 'Chọn lớp hành chính'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredClasses.map((cls) => (
                        <SelectItem key={getClassId(cls)} value={getClassId(cls)}>
                          {cls.classCode || cls.className || 'Lớp'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Semester removed: only admissionDate and cohort are kept */}

                <div>
                  <Label htmlFor="admissionDate">Ngày nhập học</Label>
                  <DatePicker
                    id="admissionDate"
                    value={formData.admissionDate}
                    onChange={(value) => setField('admissionDate', value)}
                    placeholder="Chọn ngày nhập học"
                    className={cn('mt-1.5 rounded-md', errors.admissionDate && 'ring-1 ring-destructive/60')}
                  />
                </div>

                {studentId && (
                  <div>
                    <Label>Trạng thái</Label>
                    <Select value={formData.isActive ? 'active' : 'inactive'} onValueChange={(value) => setField('isActive', (value || 'active') === 'active')}>
                      <SelectTrigger className="mt-1.5 h-10 w-full">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Đang học</SelectItem>
                        <SelectItem value="inactive">Ngừng học</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Note & Comments */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b pb-1.5">
                <BookOpenCheck className="h-4 w-4" />
                Ghi chú hồ sơ
              </h3>
              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setField('note', e.target.value)}
                  className="mt-1.5 min-h-[60px]"
                  placeholder="Nhập ghi chú nếu có"
                />
              </div>
            </div>

            {/* API Error Banner */}
            {apiError && (
              <div className="mx-0 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Lưu thất bại</p>
                  <p className="mt-0.5 text-destructive/90">{apiError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setApiError(null)}
                  className="shrink-0 rounded p-0.5 hover:bg-destructive/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

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
                    Lưu sinh viên
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
