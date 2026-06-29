'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/education/components/ui/card';
import { Button } from '@/features/education/components/ui/button';
import { Input } from '@/features/education/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/education/components/ui/select';
import { Badge } from '@/features/education/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/education/components/ui/table';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { studentApi } from '@/features/education/api/student';
import { trainingProgramApi } from '@/features/education/api/training-program';
import type { StudentListItem } from '@/features/education/types/student';
import StudentDialog from '@/features/education/components/ems/StudentDialog';

// Hàm tính năm đào tạo dựa trên ngày tạo
const getTrainingYear = (createdAt?: string): string => {
  if (!createdAt) return 'Chưa cập nhật';

  const createdDate = new Date(createdAt);
  const currentDate = new Date();
  const yearDiff = currentDate.getFullYear() - createdDate.getFullYear();
  
  if (yearDiff >= 5) return 'Đã tốt nghiệp';
  if (yearDiff >= 4) return 'Sinh viên năm 5';
  if (yearDiff >= 3) return 'Sinh viên năm 4';
  if (yearDiff >= 2) return 'Sinh viên năm 3';
  if (yearDiff >= 1) return 'Sinh viên năm 2';
  return 'Sinh viên năm 1';
};

// Hàm tính thời gian còn lại (5 năm kể từ ngày tạo)
const getRemainingTime = (createdAt?: string): string => {
  if (!createdAt) return 'Chưa cập nhật';

  const createdDate = new Date(createdAt);
  const expiryDate = new Date(createdDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 5);
  const currentDate = new Date();
  
  if (currentDate > expiryDate) return 'Đã hết hạn';
  
  const diffTime = expiryDate.getTime() - currentDate.getTime();
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMonths >= 12) return `${Math.floor(diffMonths / 12)} năm ${diffMonths % 12} tháng`;
  if (diffMonths >= 1) return `${diffMonths} tháng`;
  return `${diffDays} ngày`;
};

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [programs, setPrograms] = useState<any[]>([]);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, programRes]: any = await Promise.all([
        studentApi.getAll(),
        trainingProgramApi.getAll({ size: 100 })
      ]);
      
      const studentData = studentRes?.data || studentRes || [];
      setStudents(studentData);
      setPrograms(programRes?.data?.content || programRes?.data || programRes?.content || programRes || []);
    } catch (error) {
      toast.error('Không thể lấy dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReactivate = async (student: StudentListItem) => {
    try {
      await studentApi.update(student.id, { isActive: true });
      toast.success(`Đã kích hoạt sinh viên ${student.fullName}`);
      await fetchData();
    } catch (error) {
      toast.error('Kích hoạt thất bại');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.studentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && student.isActive) ||
                          (filterStatus === 'inactive' && !student.isActive);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDelete = async (student: StudentListItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sinh viên ${student.fullName}?`)) return;
    try {
      await studentApi.delete(student.id);
      toast.success(`Đã xóa sinh viên ${student.fullName}`);
      await fetchData();
    } catch (error) {
      toast.error('Xóa sinh viên thất bại');
    }
  };

  const handleOpenCreate = () => {
    setSelectedStudentId(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setSelectedStudentId(id);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary">
            Hồ sơ người học
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quản lý sinh viên</h1>
          <p className="mt-1 text-sm text-muted-foreground">Danh sách sinh viên và trạng thái đào tạo</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Tải lại
          </Button>
          <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Thêm sinh viên
          </Button>
        </div>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Bộ lọc dữ liệu</CardTitle>
          <CardDescription>Tìm kiếm theo mã sinh viên, họ tên hoặc lọc theo trạng thái.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã SV, họ tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || 'all')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
              Đang tải danh sách sinh viên...
            </div>
          ) : paginatedStudents.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Chưa có dữ liệu sinh viên. Hãy thêm sinh viên mới.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Mã SV</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Chương trình</TableHead>
                    <TableHead>Năm học</TableHead>
                    <TableHead>Thời gian còn lại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.studentCode}</TableCell>
                        <TableCell>{student.fullName || 'Chưa cập nhật'}</TableCell>
                        <TableCell>
                          {programs.find(p => (p.trainingProgramId || p.programId || p.id) === student.trainingProgramId)?.programName ||
                            programs.find(p => (p.trainingProgramId || p.programId || p.id) === student.trainingProgramId)?.name ||
                            student.trainingProgramId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTrainingYear(student.createdAt)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getRemainingTime(student.createdAt)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.isActive ? 'default' : 'destructive'}>
                            {student.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon-sm"
                              onClick={() => handleOpenEdit(student.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!student.isActive && (
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                onClick={() => handleReactivate(student)}
                                className="text-primary hover:text-primary"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon-sm"
                              onClick={() => handleDelete(student)} 
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Hiển thị</span>
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
                  <span className="text-sm text-muted-foreground">
                    trên tổng {filteredStudents.length} bản ghi
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
            </>
          )}
        </CardContent>
      </Card>

      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        studentId={selectedStudentId}
        onSaveSuccess={fetchData}
      />
    </div>
  );
}
