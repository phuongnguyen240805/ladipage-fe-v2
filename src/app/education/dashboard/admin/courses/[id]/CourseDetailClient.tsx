'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/features/education/components/ui/card';
import { Button } from '@/features/education/components/ui/button';
import { Badge } from '@/features/education/components/ui/badge';
import { Skeleton } from '@/features/education/components/ui/skeleton';
import { 
  ArrowLeft, 
  Edit, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Award, 
  Layers, 
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { courseApi, courseClassApi, coursePrerequisiteApi } from '@/features/education/api/course';
import { departmentApi } from '@/features/education/api/department';
import PrerequisiteDualList, { PrerequisiteItem } from '@/features/education/components/ems/PrerequisiteDualList';
import type { Department } from '@/features/education/types/lookup';
import CourseDialog from '@/features/education/components/ems/CourseDialog';

const getDepartmentId = (department: Department) => department.departmentId || department.id || '';
const getDepartmentLabel = (department: Department) => [department.code, department.name].filter(Boolean).join(' - ');

interface Course {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  departmentId: string;
  departmentName: string;
  courseType: string;
  credits: number;
  theoryHours: number;
  practiceHours: number;
  selfStudyHours: number;
  description: string;
  isActive: boolean;
}

interface CourseClass {
  courseClassId: string;
  classCode: string;
  maxStudent: number;
  currentStudent: number;
  status: string;
  roomId?: string;
  roomCode?: string;
  roomName?: string;
  semesterId?: string;
}

export default function CourseDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<'general' | 'classes' | 'prerequisites'>('general');
  const [loading, setLoading] = useState<boolean>(true);
  const [course, setCourse] = useState<Course | null>(null);
  
  // Tab 2 State: Classes
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [classesLoading, setClassesLoading] = useState<boolean>(false);

  // Tab 3 State: Prerequisites
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [prereqs, setPrereqs] = useState<PrerequisiteItem[]>([]);
  const [prereqsLoading, setPrereqsLoading] = useState<boolean>(false);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [response, departments]: [any, Department[]] = await Promise.all([
        courseApi.getById(id),
        departmentApi.getAll(),
      ]);
      if (!response) throw new Error('Không tìm thấy thông tin môn học');

      const item = response.data ? response.data : response;
      const department = (departments || []).find((entry) => getDepartmentId(entry) === item.departmentId);
      
      setCourse({
        id: item.courseId || item.id || id,
        code: item.code || '',
        name: item.name || '',
        nameEn: item.nameEn || '',
        departmentId: item.departmentId || '',
        departmentName: item.departmentName || (department ? getDepartmentLabel(department) : ''),
        courseType: item.courseType || 'Bắt buộc',
        credits: typeof item.credits === 'number' ? item.credits : parseFloat(item.credits) || 0.0,
        theoryHours: typeof item.theoryHours === 'number' ? item.theoryHours : parseInt(item.theoryHours) || 0,
        practiceHours: typeof item.practiceHours === 'number' ? item.practiceHours : parseInt(item.practiceHours) || 0,
        selfStudyHours: typeof item.selfStudyHours === 'number' ? item.selfStudyHours : parseFloat(item.selfStudyHours) || 0.0,
        description: item.description || '',
        isActive: item.isActive !== undefined ? item.isActive : true,
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Không tìm thấy môn học yêu cầu');
      router.push('/education/dashboard/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch course details on mount
  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Load Tab 2: Course Classes
  const loadClasses = async () => {
    try {
      setClassesLoading(true);
      const res: any = await courseClassApi.getByCourse(id);
      
      let list = [];
      if (res && Array.isArray(res)) {
        list = res;
      } else if (res && Array.isArray(res.data)) {
        list = res.data;
      }
      setClasses(list);
    } catch (err) {
      console.error('Error loading course classes:', err);
      toast.error('Không thể tải danh sách lớp học phần từ backend');
    } finally {
      setClassesLoading(false);
    }
  };

  // Load Tab 3: Prerequisites
  const loadPrerequisites = async () => {
    try {
      setPrereqsLoading(true);
      
      // 1. Load all courses to resolve codes/names
      const [allRes, departments]: [any, Department[]] = await Promise.all([
        courseApi.getAll(),
        departmentApi.getAll(),
      ]);
      const departmentLabels = new Map(
        (departments || []).map((department) => [getDepartmentId(department), getDepartmentLabel(department)]),
      );
      let coursesList = [];
      if (allRes && Array.isArray(allRes)) {
        coursesList = allRes;
      } else if (allRes && Array.isArray(allRes.data)) {
        coursesList = allRes.data;
      } else if (allRes && Array.isArray(allRes.content)) {
        coursesList = allRes.content;
      } else if (allRes && Array.isArray(allRes.data?.content)) {
        coursesList = allRes.data.content;
      }
      
      const mappedCourses = coursesList.map((c: any) => ({
        id: c.courseId || c.id,
        code: c.code || '',
        name: c.name || '',
        departmentId: c.departmentId || '',
        departmentName: c.departmentName || departmentLabels.get(c.departmentId || '') || '',
        courseType: c.courseType || '',
        credits: c.credits || 0,
      }));
      setAllCourses(mappedCourses);

      // 2. Load prerequisites for this course
      const prereqsRes: any = await coursePrerequisiteApi.getByCourse(id);
      let prereqsList = [];
      if (prereqsRes && Array.isArray(prereqsRes)) {
        prereqsList = prereqsRes;
      } else if (prereqsRes && Array.isArray(prereqsRes.data)) {
        prereqsList = prereqsRes.data;
      }

      // 3. Resolve details using mapped courses
      const enrichedPrereqs: PrerequisiteItem[] = prereqsList.map((p: any) => {
        const targetId = p.prerequisiteCourseId || p.prerequisiteId;
        const courseInfo = mappedCourses.find((c: any) => c.id === targetId);
        
        return {
          id: p.prerequisiteCourseId || targetId,
          prerequisiteCourseId: targetId,
          code: courseInfo ? courseInfo.code : '—',
          name: courseInfo ? courseInfo.name : 'Môn học liên kết',
          departmentId: courseInfo ? courseInfo.departmentId : '—',
          departmentName: courseInfo ? courseInfo.departmentName : '',
          type: p.type === 'PARALLEL' ? 'PARALLEL' : 'PREREQUISITE',
        };
      });

      setPrereqs(enrichedPrereqs);
    } catch (err) {
      console.error('Error loading prerequisites:', err);
      toast.error('Không thể tải môn học tiên quyết');
    } finally {
      setPrereqsLoading(false);
    }
  };

  // Trigger tab data loads
  useEffect(() => {
    if (activeTab === 'classes') {
      loadClasses();
    } else if (activeTab === 'prerequisites') {
      loadPrerequisites();
    }
  }, [activeTab]);

  // Prerequisite Add Handler
  const handleAddPrerequisite = async (prereqCourseId: string, type: 'PREREQUISITE' | 'PARALLEL') => {
    try {
      const payload = {
        courseId: id,
        prerequisiteId: prereqCourseId,
        type: type
      };
      await coursePrerequisiteApi.add(payload);
      toast.success(`Đã thêm môn liên kết thành công!`);
      // Refresh list
      loadPrerequisites();
    } catch (err: any) {
      console.error('Error adding prerequisite:', err);
      toast.error(err.response?.data?.message || 'Không thể thêm môn liên kết (Có thể đã tồn tại)');
    }
  };

  // Prerequisite Delete Handler
  const handleRemovePrerequisite = async (identifier: string | { courseId: string; prereqId: string }) => {
    try {
      const prereqId = typeof identifier === 'string' ? identifier : identifier.prereqId;
      await coursePrerequisiteApi.delete(id, prereqId);
      toast.success('Đã gỡ bỏ môn liên kết thành công!');
      // Refresh list
      loadPrerequisites();
    } catch (err) {
      console.error('Error removing prerequisite:', err);
      toast.error('Không thể gỡ bỏ môn học liên kết');
    }
  };

  if (loading || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-450 gap-2">
        <RefreshCw className="h-9 w-9 animate-spin text-primary" />
        <span className="text-sm font-semibold">Đang tải thông tin chi tiết...</span>
      </div>
    );
  }

  const totalHours = course.theoryHours + course.practiceHours + course.selfStudyHours;

  return (
    <div className="space-y-6">
      {/* HEADER ACTION AREA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/education/dashboard/admin/courses')} 
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg py-1 px-2.5 -ml-2 text-xs font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1 stroke-[2.5px]" />
            Quay lại danh sách
          </Button>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-2.5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {course.name}
            </h1>
            <Badge className="font-mono font-bold bg-primary/10 border-none text-primary rounded-md text-xs py-0.5 px-2">
              {course.code}
            </Badge>
            <Badge 
              variant="outline"
              className={`font-semibold text-[10px] rounded-md h-5 ${
                course.isActive 
                  ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' 
                  : 'bg-red-500/5 text-red-500 border-red-500/10'
              }`}
            >
              {course.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
            </Badge>
          </div>
        </div>

        <Button 
          onClick={() => setDialogOpen(true)}
          className="bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl h-11 px-5 flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Edit className="h-4 w-4" />
          Chỉnh sửa môn học
        </Button>
      </div>

      {/* TABS SELECTOR CONTAINER */}
      <div className="border-b border-slate-150 dark:border-slate-800 flex gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap outline-none ${
            activeTab === 'general'
              ? 'border-primary text-primary stroke-[2.5px]'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <FileText className="h-4 w-4" />
          Thông tin chung
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap outline-none ${
            activeTab === 'classes'
              ? 'border-primary text-primary stroke-[2.5px]'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Layers className="h-4 w-4" />
          Lớp học phần
        </button>
        <button
          onClick={() => setActiveTab('prerequisites')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap outline-none ${
            activeTab === 'prerequisites'
              ? 'border-primary text-primary stroke-[2.5px]'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Môn tiên quyết & Song hành
        </button>
      </div>

      {/* TABS CONTENT RENDERING */}
      <div className="space-y-6">
        
        {/* TAB 1: GENERAL VIEW */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: General Meta Card */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-sm">
                <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-850">
                  <CardTitle className="text-lg font-bold text-slate-850 dark:text-slate-100">
                    Cấu trúc & Mô tả môn học
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Detailed Meta Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Tên môn học (Tiếng Việt)</span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{course.name}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Tên môn học (Tiếng Anh)</span>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 italic">{course.nameEn || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Khoa phụ trách</span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {course.departmentName || 'Chưa liên kết'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Loại môn học</span>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{course.courseType}</p>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mô tả tóm tắt</span>
                    <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      {course.description || 'Chưa có mô tả chi tiết cho môn học này.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Related Redirect Information Panel */}
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-200">Thời khóa biểu & Lớp liên kết</h5>
                    <p className="text-xs text-slate-450">Xem lịch học của môn học này trong từng học kỳ năm học.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/education/dashboard/admin/classes')}
                  variant="outline" 
                  size="sm"
                  className="rounded-lg border-slate-200 dark:border-slate-800 font-bold text-xs hover:bg-slate-100 h-9 px-4"
                >
                  Đến thời khóa biểu
                </Button>
              </div>
            </div>

            {/* Right: Credits Circular Graphic */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
              <Card className="border-none bg-slate-900 text-slate-100 dark:bg-slate-950/80 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/10 p-6">
                <div className="text-center relative">
                  <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-md font-bold uppercase tracking-widest text-primary/80">Thời lượng đào tạo</h3>
                  <p className="text-xs text-slate-450 mt-1">Cấu trúc phân phối tín chỉ thời gian tự học</p>

                  {/* Gradient Ring Graphic */}
                  <div className="mt-8 flex justify-center">
                    <div className="relative flex items-center justify-center h-28 w-28 rounded-full border border-white/5 bg-slate-950/40 p-4">
                      <div className="flex flex-col items-center">
                        <span className="text-2.5xl font-extrabold text-white tracking-tight">
                          {Number(course.credits).toFixed(1)}
                        </span>
                        <span className="text-[9px] font-bold text-primary tracking-widest uppercase mt-0.5">Tín chỉ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bars of breakdown */}
                <div className="mt-8 space-y-4">
                  {/* Theory */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Lý thuyết</span>
                      <span className="text-slate-200">{course.theoryHours} tiết</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${totalHours > 0 ? (course.theoryHours / totalHours) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Practice */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Thực hành</span>
                      <span className="text-slate-200">{course.practiceHours} tiết</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full bg-blue-400 rounded-full" 
                        style={{ width: `${totalHours > 0 ? (course.practiceHours / totalHours) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Self-Study */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Tự học (Tự động tính)</span>
                      <span className="text-slate-200">{course.selfStudyHours} giờ</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-400 rounded-full" 
                        style={{ width: `${totalHours > 0 ? (course.selfStudyHours / totalHours) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: COURSE CLASSES */}
        {activeTab === 'classes' && (
          <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-850 flex flex-row items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                  Lớp học phần mở
                </CardTitle>
                <CardDescription>Các lớp đang hoạt động giảng dạy cho môn học này.</CardDescription>
              </div>
              <Badge className="bg-primary/15 text-primary border-none font-semibold">
                {classes.length} lớp học phần
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {classesLoading ? (
                <div className="p-12 text-center text-slate-450 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="h-7 w-7 animate-spin text-primary" />
                  <span className="text-sm font-semibold">Đang tải danh sách lớp...</span>
                </div>
              ) : classes.length === 0 ? (
                <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2.5">
                  <AlertCircle className="h-9 w-9 text-slate-300" />
                  <span className="text-sm font-semibold">Chưa có lớp học phần nào mở cho môn này</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/10 text-slate-450 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">Mã lớp HP</th>
                        <th className="py-4 px-6 text-center">Phòng học</th>
                        <th className="py-4 px-6 text-center">Sĩ số tối đa</th>
                        <th className="py-4 px-6 text-center">Đang đăng ký</th>
                        <th className="py-4 px-6 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-850 dark:text-slate-200">
                      {classes.map((cls) => (
                        <tr 
                          key={cls.courseClassId} 
                          className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors h-[56px]"
                        >
                          <td className="py-3 px-6 font-mono font-bold text-sm text-primary">
                            {cls.classCode}
                          </td>
                          <td className="py-3 px-6 text-center text-sm font-semibold text-slate-700 dark:text-slate-350">
                            {cls.roomName || cls.roomCode || 'Chưa xếp phòng'}
                          </td>
                          <td className="py-3 px-6 text-center text-sm font-bold text-slate-900 dark:text-slate-100">
                            {cls.maxStudent || '50'}
                          </td>
                          <td className="py-3 px-6 text-center text-sm font-bold text-slate-900 dark:text-slate-100">
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {cls.currentStudent || '0'}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            <Badge 
                              className={`font-semibold text-[10px] rounded-md ${
                                cls.status === 'ACTIVE' || cls.status === 'Đang mở'
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/10 border-none text-emerald-600 dark:bg-emerald-500/20'
                                  : 'bg-slate-500/10 hover:bg-slate-500/10 border-none text-slate-500 dark:bg-slate-500/20'
                              }`}
                            >
                              {cls.status === 'ACTIVE' || cls.status === 'Đang mở' ? 'Đang mở' : 'Đã khóa'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: PREREQUISITES & PARALLEL DUAL LIST */}
        {activeTab === 'prerequisites' && (
          <div className="space-y-2">
            <PrerequisiteDualList
              courseId={course.id}
              allCourses={allCourses}
              selectedPrerequisites={prereqs}
              onAdd={handleAddPrerequisite}
              onDelete={handleRemovePrerequisite}
              loading={prereqsLoading}
            />
          </div>
        )}

      </div>

      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        courseId={course.id}
        onSaveSuccess={fetchDetails}
      />
    </div>
  );
}
