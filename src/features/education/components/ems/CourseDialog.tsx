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
import { Save, Sparkles, BookOpen, GraduationCap, Clock, Award, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { courseApi, courseClassApi } from '@/features/education/api/course';
import LockedFieldInput from '@/features/education/components/ems/LockedFieldInput';
import CreditInput from '@/features/education/components/ems/CreditInput';
import DepartmentCombobox from '@/features/education/components/ems/DepartmentCombobox';
import { Badge } from '@/features/education/components/ui/badge';

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: string | null;
  onSaveSuccess: () => void;
}

interface CourseFormData {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  departmentId: string;
  courseType: string;
  credits: number;
  theoryHours: number;
  practiceHours: number;
  selfStudyHours: number;
  description: string;
  isActive: boolean;
}

interface FormErrors {
  code?: string;
  name?: string;
  departmentId?: string;
  credits?: string;
  theoryHours?: string;
  practiceHours?: string;
}

export default function CourseDialog({
  open,
  onOpenChange,
  courseId,
  onSaveSuccess,
}: CourseDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [hasClasses, setHasClasses] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<CourseFormData>({
    id: '',
    code: '',
    name: '',
    nameEn: '',
    departmentId: '',
    courseType: 'Bắt buộc',
    credits: 0,
    theoryHours: 0,
    practiceHours: 0,
    selfStudyHours: 0,
    description: '',
    isActive: true,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;

    if (courseId) {
      const cid = courseId;
      // Edit Mode
      async function loadData() {
        try {
          setLoading(true);
          setHasClasses(false);
          setErrors({});
          
          const [courseRes, classesRes]: [any, any] = await Promise.all([
            courseApi.getById(cid),
            courseClassApi.getByCourse(cid).catch(() => []),
          ]);
          
          if (!courseRes) throw new Error('Không tìm thấy môn học');
          const item = courseRes.data ? courseRes.data : courseRes;
          
          setFormData({
            id: item.courseId || item.id || cid || '',
            code: item.code || '',
            name: item.name || '',
            nameEn: item.nameEn || '',
            departmentId: item.departmentId || '',
            courseType: item.courseType || 'Bắt buộc',
            credits: typeof item.credits === 'number' ? item.credits : parseFloat(item.credits) || 0.0,
            theoryHours: typeof item.theoryHours === 'number' ? item.theoryHours : parseInt(item.theoryHours) || 0,
            practiceHours: typeof item.practiceHours === 'number' ? item.practiceHours : parseInt(item.practiceHours) || 0,
            selfStudyHours: typeof item.selfStudyHours === 'number' ? item.selfStudyHours : parseFloat(item.selfStudyHours) || 0.0,
            description: item.description || '',
            isActive: item.isActive !== undefined ? item.isActive : true,
          });

          let classesList = [];
          if (classesRes && Array.isArray(classesRes)) {
            classesList = classesRes;
          } else if (classesRes && Array.isArray(classesRes.data)) {
            classesList = classesRes.data;
          }
          if (classesList.length > 0) {
            setHasClasses(true);
          }
        } catch (err) {
          console.error('Lỗi khi tải chi tiết môn học:', err);
          toast.error('Không thể tải chi tiết môn học hoặc môn học không tồn tại');
          onOpenChange(false);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    } else {
      // Create Mode
      setErrors({});
      setHasClasses(false);
      setFormData({
        id: '',
        code: '',
        name: '',
        nameEn: '',
        departmentId: '',
        courseType: 'Bắt buộc',
        credits: 3.0,
        theoryHours: 30,
        practiceHours: 15,
        selfStudyHours: 6.0,
        description: '',
        isActive: true,
      });
    }
  }, [open, courseId, onOpenChange]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!courseId) {
      if (!formData.code.trim()) {
        newErrors.code = 'Vui lòng nhập mã môn học';
      } else if (!/^[A-Z0-9_-]{3,15}$/.test(formData.code.toUpperCase().trim())) {
        newErrors.code = 'Mã môn chỉ gồm chữ hoa, số, gạch dưới (3-15 ký tự)';
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên môn học';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Vui lòng chọn khoa phụ trách';
    }

    if (formData.credits <= 0) {
      newErrors.credits = 'Số tín chỉ phải lớn hơn 0';
    }

    if (formData.theoryHours < 0) {
      newErrors.theoryHours = 'Số tiết lý thuyết không thể âm';
    }

    if (formData.practiceHours < 0) {
      newErrors.practiceHours = 'Số tiết thực hành không thể âm';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error('Vui lòng kiểm tra lại các thông tin lỗi trên form.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaveLoading(true);
    const toastId = toast.loading(courseId ? 'Đang cập nhật môn học...' : 'Đang tạo môn học...');

    try {
      const payload = {
        courseId: courseId ? formData.id : undefined,
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        nameEn: formData.nameEn.trim() || null,
        departmentId: formData.departmentId,
        courseType: formData.courseType,
        credits: Number(formData.credits),
        theoryHours: Number(formData.theoryHours),
        practiceHours: Number(formData.practiceHours),
        selfStudyHours: Number(formData.selfStudyHours),
        description: formData.description.trim() || null,
        isActive: formData.isActive,
      };

      if (courseId) {
        await courseApi.update(courseId, payload);
        toast.success('Cập nhật thông tin môn học thành công!', { id: toastId });
      } else {
        await courseApi.create(payload);
        toast.success('Tạo môn học mới thành công!', { id: toastId });
      }
      
      onOpenChange(false);
      onSaveSuccess();
    } catch (error: any) {
      console.error('Lỗi khi lưu môn học:', error);
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      const clientMessage = error?.message || 'Có lỗi xảy ra khi lưu thông tin môn học';
      toast.error(serverMessage || clientMessage, { id: toastId });
    } finally {
      setSaveLoading(false);
    }
  };

  const totalHours = Number(formData.theoryHours || 0) + Number(formData.practiceHours || 0) + Number(formData.selfStudyHours || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            {courseId ? 'Chỉnh sửa môn học' : 'Tạo môn học mới'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-405 gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-semibold">Đang tải chi tiết môn học...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Form Column */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
              {hasClasses && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-850 dark:text-amber-400 flex items-start gap-2.5 shadow-xs">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-550 dark:text-amber-500 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs">Cảnh báo: Môn học đã mở lớp học phần!</h4>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      Sửa cơ cấu tín chỉ, loại học phần có thể ảnh hưởng đến lịch học hiện tại. Hãy cẩn trọng!
                    </p>
                  </div>
                </div>
              )}

              {/* Code & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LockedFieldInput
                  id="code"
                  label="Mã môn học *"
                  isLocked={!!courseId}
                  lockMessage="Mã môn học là duy nhất và không thể sửa đổi sau khi khởi tạo."
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  error={errors.code}
                  placeholder="Ví dụ: INT3306"
                  required
                />

                <div className="space-y-1.5">
                  <Label htmlFor="courseType" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    Loại môn học
                  </Label>
                  <Select 
                    value={formData.courseType} 
                    onValueChange={(val) => setFormData({ ...formData, courseType: val || 'Bắt buộc' })}
                  >
                    <SelectTrigger className="h-11 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bắt buộc">Bắt buộc</SelectItem>
                      <SelectItem value="Tự chọn">Tự chọn</SelectItem>
                      <SelectItem value="Thực tập">Thực tập</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Name VI */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  Tên môn học (Tiếng Việt) *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 border-slate-200 dark:border-slate-800"
                  placeholder="Ví dụ: Phát triển ứng dụng Web"
                  required
                />
                {errors.name && <p className="text-xs text-destructive mt-1 font-medium">{errors.name}</p>}
              </div>

              {/* Name EN */}
              <div className="space-y-1.5">
                <Label htmlFor="nameEn" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  Tên môn học (Tiếng Anh)
                </Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="h-11 border-slate-200 dark:border-slate-800"
                  placeholder="Ví dụ: Web Application Development"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <DepartmentCombobox
                  label="Khoa phụ trách *"
                  value={formData.departmentId}
                  onChange={(val) => setFormData({ ...formData, departmentId: val })}
                  error={errors.departmentId}
                />
              </div>

              {/* Credits */}
              <CreditInput
                credits={formData.credits}
                onChangeCredits={(val) => setFormData({ ...formData, credits: val })}
                selfStudyHours={formData.selfStudyHours}
                onChangeSelfStudy={(val) => setFormData({ ...formData, selfStudyHours: val })}
                error={errors.credits}
              />

              {/* Theory & Practice Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="theoryHours" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    Số tiết lý thuyết
                  </Label>
                  <div className="relative">
                    <Input
                      id="theoryHours"
                      type="number"
                      min="0"
                      value={formData.theoryHours || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setFormData({ ...formData, theoryHours: isNaN(val) ? 0 : val });
                      }}
                      className="h-11 border-slate-200 dark:border-slate-800 pr-14"
                    />
                    <span className="absolute inset-y-0 right-3.5 flex items-center text-xs text-slate-400 font-medium select-none">
                      tiết
                    </span>
                  </div>
                  {errors.theoryHours && <p className="text-xs text-destructive mt-1 font-medium">{errors.theoryHours}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="practiceHours" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    Số tiết thực hành
                  </Label>
                  <div className="relative">
                    <Input
                      id="practiceHours"
                      type="number"
                      min="0"
                      value={formData.practiceHours || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setFormData({ ...formData, practiceHours: isNaN(val) ? 0 : val });
                      }}
                      className="h-11 border-slate-200 dark:border-slate-800 pr-14"
                    />
                    <span className="absolute inset-y-0 right-3.5 flex items-center text-xs text-slate-400 font-medium select-none">
                      tiết
                    </span>
                  </div>
                  {errors.practiceHours && <p className="text-xs text-destructive mt-1 font-medium">{errors.practiceHours}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  Mô tả môn học
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-slate-200 dark:border-slate-800 min-h-[90px]"
                  placeholder="Tóm tắt mô tả chi tiết, đề cương..."
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="isActive" className="text-sm font-semibold text-slate-900 dark:text-slate-200">Kích hoạt hoạt động</Label>
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

              <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-1.5" 
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Lưu môn học
                </Button>
              </DialogFooter>
            </form>

            {/* Preview Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 text-slate-100 dark:bg-slate-950/80 rounded-2xl overflow-hidden shadow-md">
                <div className="bg-gradient-to-br from-primary/30 to-slate-900 p-6 text-center relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-primary animate-pulse opacity-40">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">XEM TRƯỚC MÔN HỌC</h3>
                  
                  <div className="mt-6 flex justify-center">
                    <div className="relative flex items-center justify-center h-28 w-28 rounded-full border border-white/5 bg-slate-950/40 p-4 shadow-inner">
                      <div className="flex flex-col items-center">
                        <span className="text-2.5xl font-extrabold text-white tracking-tight">
                          {Number(formData.credits || 0).toFixed(1)}
                        </span>
                        <span className="text-[9px] font-bold text-primary tracking-widest uppercase mt-0.5">Tín chỉ</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-primary" />
                      Mã môn học
                    </span>
                    <Badge className="bg-primary/20 text-primary border-none font-mono font-bold text-[11px] rounded px-1.5">
                      {formData.code.toUpperCase().trim() || '—'}
                    </Badge>
                  </div>

                  <div className="pb-2 border-b border-white/5 space-y-0.5">
                    <span className="text-slate-400 font-medium">Tên môn học (VI)</span>
                    <p className="font-semibold text-white text-sm">
                      {formData.name.trim() || 'Chưa nhập tên môn học'}
                    </p>
                  </div>

                  <div className="pb-2 border-b border-white/5 space-y-0.5">
                    <span className="text-slate-400 font-medium">Tên môn học (EN)</span>
                    <p className="text-slate-300 font-medium italic">
                      {formData.nameEn.trim() || '—'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-white/5">
                    <div>
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-primary" />
                        Khoa
                      </span>
                      <p className="font-semibold text-white truncate mt-0.5">
                        {formData.departmentId ? 'Đã liên kết' : 'Chưa chọn'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Loại môn</span>
                      <p className="font-semibold text-white mt-0.5">
                        {formData.courseType}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-3">
                    <h4 className="font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Cấu trúc thời lượng ({totalHours} tiết/giờ)
                    </h4>

                    <div className="space-y-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-450">Lý thuyết</span>
                          <span className="text-slate-200 font-semibold">{formData.theoryHours} tiết</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${totalHours > 0 ? (formData.theoryHours / totalHours) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-450">Thực hành</span>
                          <span className="text-slate-200 font-semibold">{formData.practiceHours} tiết</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-blue-450 rounded-full" 
                            style={{ width: `${totalHours > 0 ? (formData.practiceHours / totalHours) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-450">Tự học (x2)</span>
                          <span className="text-slate-200 font-semibold">{formData.selfStudyHours} giờ</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-450 rounded-full" 
                            style={{ width: `${totalHours > 0 ? (formData.selfStudyHours / totalHours) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
