'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/features/education/components/ui/card';
import { Button } from '@/features/education/components/ui/button';
import { Input } from '@/features/education/components/ui/input';
import { Badge } from '@/features/education/components/ui/badge';
import { Skeleton } from '@/features/education/components/ui/skeleton';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Check, 
  ChevronsUpDown, 
  ChevronUp, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { courseApi, courseClassApi } from '@/features/education/api/course';
import { departmentApi } from '@/features/education/api/department';
import DepartmentCombobox from '@/features/education/components/ems/DepartmentCombobox';
import type { Department } from '@/features/education/types/lookup';
import CourseDialog from '@/features/education/components/ems/CourseDialog';

// TypeScript interfaces
interface Course {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName: string;
  courseType: string;
  credits: number;
  isActive: boolean;
}

type SortField = 'code' | 'name' | 'credits' | 'courseType';
type SortDir = 'asc' | 'desc';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  
  // Pagination state (simulated server-side paging/sorting)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Clipboard copy state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [response, departments]: [any, Department[]] = await Promise.all([
        courseApi.getAll(),
        departmentApi.getAll(),
      ]);
      const departmentLabels = new Map(
        (departments || []).map((department) => [
          department.departmentId || department.id || '',
          [department.code, department.name].filter(Boolean).join(' - '),
        ]),
      );
      
      let list: Course[] = [];
      // Handle flexible API list wrappers
      if (response && Array.isArray(response)) {
        list = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        list = response.data;
      } else if (response && response.content && Array.isArray(response.content)) {
        list = response.content;
      } else if (response && response.data?.content && Array.isArray(response.data.content)) {
        list = response.data.content;
      }
      
      // Standardize course objects (Map java UUID fields to id)
      const mappedList = list.map((item: any) => ({
        id: item.courseId || item.id,
        code: item.code || '',
        name: item.name || '',
        departmentId: item.departmentId || '',
        departmentName: item.departmentName || departmentLabels.get(item.departmentId || '') || '',
        courseType: item.courseType || 'Bắt buộc',
        credits: typeof item.credits === 'number' ? item.credits : parseFloat(item.credits) || 0.0,
        isActive: item.isActive !== undefined ? item.isActive : true,
      }));

      setCourses(mappedList);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách môn học:', error);
      toast.error('Không thể lấy danh sách môn học từ hệ thống. Vui lòng kiểm tra kết nối Spring Boot.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle Quick Action: Copy course code
  const handleCopyCode = async (e: React.MouseEvent, code: string) => {
    e.stopPropagation(); // Avoid triggering row navigation click
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Đã sao chép mã môn học: ${code}`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error('Lỗi sao chép mã môn học');
    }
  };

  // Handle Inline Switch: Toggle course isActive status
  const handleToggleActive = async (e: React.MouseEvent, course: Course) => {
    e.stopPropagation(); // Avoid triggering row navigation click
    
    // Optimistic UI update
    const updatedCourses = courses.map(c => 
      c.id === course.id ? { ...c, isActive: !c.isActive } : c
    );
    setCourses(updatedCourses);

    try {
      const payload = {
        courseId: course.id,
        code: course.code,
        name: course.name,
        departmentId: course.departmentId || null,
        courseType: course.courseType,
        credits: course.credits,
        isActive: !course.isActive
      };
      await courseApi.update(course.id, payload);
      toast.success(`Đã ${!course.isActive ? 'kích hoạt' : 'ngừng'} môn học ${course.name}`);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái môn học:', error);
      toast.error('Cập nhật trạng thái thất bại, đang khôi phục...');
      // Rollback UI
      setCourses(courses);
    }
  };

  // Handle Deep UX Logic: Soft Delete Check
  const handleDeleteClick = async (e: React.MouseEvent, course: Course) => {
    e.stopPropagation(); // Avoid triggering row navigation click

    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa môn học "${course.name}" (${course.code})?`);
    if (!confirmDelete) return;

    try {
      toast.loading('Đang kiểm tra các liên kết môn học...', { id: 'delete-toast' });
      await courseApi.delete(course.id);
      toast.dismiss('delete-toast');
      setCourses(prev => prev.filter(c => c.id !== course.id));
      toast.success(`Da xoa mon hoc ${course.name}`);
      return;

      // Fetch open classes under this course
      const classesResponse: any = await courseClassApi.getByCourse(course.id);
      
      let classesList = [];
      if (classesResponse && Array.isArray(classesResponse)) {
        classesList = classesResponse;
      } else if (classesResponse && Array.isArray(classesResponse.data)) {
        classesList = classesResponse.data;
      }
      classesList = [];

      if (classesList.length > 0) {
        // Deep UX Logic Triggered: has linked classes!
        // Instead of hard deleting, toggle isActive to false and show descriptive toast
        toast.dismiss('delete-toast');
        
        // Optimistically set inactive
        setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isActive: false } : c));
        
        const payload = {
          courseId: course.id,
          code: course.code,
          name: course.name,
          departmentId: course.departmentId || null,
          courseType: course.courseType,
          credits: course.credits,
          isActive: false
        };
        await courseApi.update(course.id, payload);
        toast.success(`Đã ngừng hoạt động môn học ${course.code} thay vì xóa vĩnh viễn do đang có lớp học phần mở.`, {
          duration: 5000,
        });
      } else {
        // No classes open: execute standard hard delete
        await courseApi.delete(course.id);
        toast.dismiss('delete-toast');
        setCourses(prev => prev.filter(c => c.id !== course.id));
        toast.success(`Đã xóa thành công môn học ${course.name}`);
      }
    } catch (error) {
      console.error('Lỗi khi xử lý xóa môn học:', error);
      toast.dismiss('delete-toast');
      toast.error('Lỗi hệ thống khi xóa môn học');
    }
  };

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // UI Helper for Sorting Indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 text-slate-400 group-hover:block shrink-0" />;
    }
    return sortDir === 'asc' 
      ? <ChevronUp className="ml-1 h-3.5 w-3.5 text-primary shrink-0 stroke-[2.5px]" /> 
      : <ChevronDown className="ml-1 h-3.5 w-3.5 text-primary shrink-0 stroke-[2.5px]" />;
  };

  // Perform client-side pagination, search, sorting and department filter
  const processedCourses = React.useMemo(() => {
    let result = [...courses];

    // 1. Search Filter (code or name)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.code.toLowerCase().includes(search) || 
        c.name.toLowerCase().includes(search)
      );
    }

    // 2. Department Multi-select Filter
    if (selectedDepts.length > 0) {
      result = result.filter(c => selectedDepts.includes(c.departmentId));
    }

    // 3. Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'credits') {
        comparison = a.credits - b.credits;
      } else {
        const valA = String(a[sortField]).toLowerCase();
        const valB = String(b[sortField]).toLowerCase();
        comparison = valA.localeCompare(valB);
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [courses, searchTerm, selectedDepts, sortField, sortDir]);

  // Page slice parameters
  const totalRecords = processedCourses.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedCourses = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedCourses.slice(startIndex, startIndex + pageSize);
  }, [processedCourses, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepts]);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Quản lý môn học
            </h1>
            <Badge className="bg-primary hover:bg-primary/95 text-white py-0.5 px-2 rounded-full font-bold text-xs h-5">
              {courses.length} môn
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
            Hệ thống danh mục môn học đào tạo, cấu hình tín chỉ và môn tiên quyết.
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedCourseId(null);
            setDialogOpen(true);
          }} 
          className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm hover:shadow-md transition-all self-start sm:self-auto rounded-xl px-5 h-11"
        >
          <Plus className="h-5 w-5 mr-2 stroke-[2.5px]" />
          Tạo môn học mới
        </Button>
      </div>

      {/* FILTER PANEL */}
      <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-sm font-semibold text-slate-850 dark:text-slate-200">Tìm kiếm môn học</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm kiếm nhanh theo mã môn, tên môn..." 
                className="pl-10 h-11 border-slate-200 dark:border-slate-800 bg-slate-50/20 focus:bg-white transition-all rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-80 space-y-1.5">
            <DepartmentCombobox
              label="Khoa phụ trách"
              placeholder="Chọn các khoa cần lọc..."
              isMulti={true}
              selectedValues={selectedDepts}
              onChangeMultiple={setSelectedDepts}
            />
          </div>
        </CardContent>
      </Card>

      {/* DATA TABLE CARD */}
      <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/10 text-slate-450 text-xs font-bold uppercase tracking-wider select-none">
                  <th 
                    onClick={() => handleSort('code')}
                    className="py-4 px-5 font-bold cursor-pointer group hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <div className="flex items-center">
                      Mã môn
                      {renderSortIndicator('code')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="py-4 px-5 font-bold cursor-pointer group hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <div className="flex items-center">
                      Tên môn học
                      {renderSortIndicator('name')}
                    </div>
                  </th>
                  <th className="py-4 px-5 font-bold">Khoa</th>
                  <th 
                    onClick={() => handleSort('credits')}
                    className="py-4 px-5 font-bold cursor-pointer group hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <div className="flex items-center justify-center">
                      Tín chỉ
                      {renderSortIndicator('credits')}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('courseType')}
                    className="py-4 px-5 font-bold cursor-pointer group hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <div className="flex items-center">
                      Loại môn
                      {renderSortIndicator('courseType')}
                    </div>
                  </th>
                  <th className="py-4 px-5 font-bold text-center">Trạng thái (Switch)</th>
                  <th className="py-4 px-5 font-bold text-right pr-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-800 dark:text-slate-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="h-[64px]">
                      <td className="py-3 px-5"><Skeleton className="h-6 w-20 rounded-md" /></td>
                      <td className="py-3 px-5"><Skeleton className="h-5 w-44 rounded-md" /></td>
                      <td className="py-3 px-5"><Skeleton className="h-5 w-24 rounded-md" /></td>
                      <td className="py-3 px-5 text-center"><Skeleton className="h-5 w-8 mx-auto rounded-md" /></td>
                      <td className="py-3 px-5"><Skeleton className="h-6 w-16 rounded-md" /></td>
                      <td className="py-3 px-5"><Skeleton className="h-6 w-12 mx-auto rounded-full" /></td>
                      <td className="py-3 px-5"><Skeleton className="h-8 w-24 ml-auto rounded-lg" /></td>
                    </tr>
                  ))
                ) : paginatedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-slate-400 font-semibold">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto p-6">
                        <div className="p-4 bg-primary/10 text-primary rounded-full">
                          <Plus className="h-8 w-8 stroke-[2.5px]" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                          Chưa có dữ liệu môn học trong Database
                        </h3>
                        <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                          Hệ thống hiện tại chưa có môn học nào được nạp từ Spring Boot. Vui lòng nhấn nút <strong>"Tạo môn học mới"</strong> ở góc trên bên phải để bắt đầu thêm và quản lý môn học thực tế của bạn.
                        </p>
                        <Button 
                          onClick={() => {
                            setSelectedCourseId(null);
                            setDialogOpen(true);
                          }}
                          className="mt-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl h-10 px-5 text-xs shadow-xs"
                        >
                          Tạo môn học đầu tiên
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCourses.map((course) => (
                    <tr 
                      key={course.id} 
                      onClick={() => router.push(`/education/dashboard/admin/courses/${course.id}`)}
                      className="group border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 cursor-pointer transition-colors h-[64px]"
                    >
                      {/* Mã Môn: Quick Action Copy */}
                      <td className="py-3 px-5">
                        <div 
                          onClick={(e) => handleCopyCode(e, course.code)}
                          className="inline-flex items-center gap-1.5 cursor-pointer font-mono font-bold text-xs"
                        >
                          <Badge 
                            variant="secondary" 
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-primary border border-primary/10 transition-all gap-1 rounded-md px-2 py-0.5"
                          >
                            {course.code}
                            {copiedCode === course.code ? (
                              <Check className="h-3 w-3 text-emerald-500 stroke-[3px]" />
                            ) : (
                              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                            )}
                          </Badge>
                        </div>
                      </td>

                      {/* Tên Môn */}
                      <td className="py-3 px-5 font-semibold text-sm text-slate-850 dark:text-slate-100 leading-tight">
                        {course.name}
                      </td>

                      {/* Khoa */}
                      <td className="py-3 px-5 text-sm text-slate-400 font-medium">
                        {course.departmentName || 'Chưa chọn'}
                      </td>

                      {/* Tín Chỉ */}
                      <td className="py-3 px-5 text-center text-sm font-semibold text-slate-850 dark:text-slate-100">
                        {Number(course.credits).toFixed(1)}
                      </td>

                      {/* Loại Môn */}
                      <td className="py-3 px-5 text-sm">
                        <Badge 
                          variant="outline"
                          className={`font-semibold text-[11px] rounded-md ${
                            course.courseType === 'Bắt buộc' 
                              ? 'bg-red-500/5 text-red-500 border-red-500/10' 
                              : 'bg-blue-500/5 text-blue-500 border-blue-500/10'
                          }`}
                        >
                          {course.courseType}
                        </Badge>
                      </td>

                      {/* Trạng thái Switch Inline */}
                      <td className="py-3 px-5 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => handleToggleActive(e, course)}
                            aria-label={`Thay đổi trạng thái hoạt động môn ${course.name}`}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              course.isActive ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                course.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-5 text-right pr-6">
                        <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Chi tiết môn học"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/education/dashboard/admin/courses/${course.id}`);
                            }}
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Sửa môn học"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600 hover:bg-amber-500/5 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourseId(course.id);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4.5 w-4.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Xóa môn học"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-destructive hover:bg-destructive/5 rounded-lg"
                            onClick={(e) => handleDeleteClick(e, course)}
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER / PAGINATION */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-slate-100 dark:border-slate-850 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-450 font-medium">Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value={10}>10 bản ghi</option>
                <option value={25}>25 bản ghi</option>
                <option value={50}>50 bản ghi</option>
              </select>
              <span className="text-sm text-slate-450 font-medium">
                trên tổng số <strong className="text-slate-800 dark:text-slate-200">{totalRecords}</strong> bản ghi
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-850 font-semibold"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1 stroke-[2.5px]" />
                Trước
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = currentPage === pageNum;
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={isCurrent ? 'default' : 'outline'}
                      className={`h-9 w-9 rounded-lg font-bold text-xs ${
                        isCurrent 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'border-slate-200 dark:border-slate-850'
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-850 font-semibold"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Sau
                <ChevronRight className="h-4 w-4 ml-1 stroke-[2.5px]" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        courseId={selectedCourseId}
        onSaveSuccess={fetchCourses}
      />
    </div>
  );
}
