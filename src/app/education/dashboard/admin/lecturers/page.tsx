'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/education/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/education/components/ui/card';
import { Button } from '@/features/education/components/ui/button';
import { Input } from '@/features/education/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/education/components/ui/select';
import { Badge } from '@/features/education/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/education/components/ui/table';
import { Search, Plus, Edit, Trash2, FileText, UserCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { lecturerApi } from '@/features/education/api/lecturer';
import { departmentApi } from '@/features/education/api/department';
import { degreeApi } from '@/features/education/api/degree';
import type { LecturerListItem } from '@/features/education/types/instructor';
import type { Degree, Department } from '@/features/education/types/lookup';
import LecturerDialog from '@/features/education/components/ems/LecturerDialog';

const getDepartmentId = (department: Department) => department.departmentId || department.id || '';
const getDegreeId = (degree: Degree) => degree.degreeId || degree.id || '';
const getLabel = (code?: string, name?: string) => [code, name].filter(Boolean).join(' - ');

export default function LecturersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user?.role || 'admin';
  
  const [lecturers, setLecturers] = useState<LecturerListItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedLecturerId, setSelectedLecturerId] = useState<string | null>(null);

  const fetchLecturers = async () => {
    try {
      setLoading(true);
      const [response, departmentData, degreeData]: any = await Promise.all([
        lecturerApi.getAll(),
        departmentApi.getAll(),
        degreeApi.getAll(),
      ]);
      const listData = Array.isArray(response) ? response : (response?.data || []);
      setLecturers(listData);
      setDepartments(departmentData || []);
      setDegrees(degreeData || []);
    } catch (error) {
      console.error(error);
      toast.error('Không thể lấy danh sách giảng viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  const departmentLabels = new Map(
    departments.map((department) => [getDepartmentId(department), getLabel(department.code, department.name)]),
  );
  const degreeLabels = new Map(
    degrees.map((degree) => [getDegreeId(degree), getLabel(degree.code, degree.name)]),
  );

  // Filter lecturers
  const filteredLecturers = lecturers.filter(lecturer => {
    const matchesSearch = (lecturer.instructorCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lecturer.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lecturer.employeeCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && lecturer.isActive) ||
                          (filterStatus === 'inactive' && !lecturer.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa giảng viên ${name}?`)) return;
    try {
      await lecturerApi.delete(id);
      setLecturers((prev) => prev.filter((lecturer) => lecturer.id !== id));
      toast.success(`Đã xóa giảng viên ${name}`);
    } catch (error) {
      console.error(error);
      toast.error('Xóa giảng viên thất bại');
    }
  };

  const handleOpenCreate = () => {
    setSelectedLecturerId(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (id: string) => {
    setSelectedLecturerId(id);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary">
            Nhân sự đào tạo
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quản lý giảng viên</h1>
          <p className="mt-1 text-sm text-muted-foreground">Danh sách và quản lý thông tin giảng viên</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {userRole === 'lecturer' && (
            <>
              <Button variant="outline" onClick={() => router.push('/education/dashboard/lecturer/enter-grades')}>
                <FileText className="h-4 w-4 mr-2" />
                Nhập điểm
              </Button>
              <Button variant="outline" onClick={() => router.push('/education/dashboard/lecturer/attendance')}>
                <UserCheck className="h-4 w-4 mr-2" />
                Điểm danh
              </Button>
            </>
          )}
          {userRole === 'admin' && (
            <>
              <Button variant="outline" onClick={fetchLecturers} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Tải lại
              </Button>
              <Button onClick={handleOpenCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Thêm giảng viên
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Bộ lọc dữ liệu</CardTitle>
          <CardDescription>Tìm nhanh theo mã, họ tên hoặc trạng thái giảng viên.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                placeholder="Tìm kiếm theo mã GV, họ tên..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value || 'all')}>
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
              Đang tải danh sách giảng viên...
            </div>
          ) : filteredLecturers.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Chưa có dữ liệu giảng viên phù hợp.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:hidden">
                {filteredLecturers.map((lecturer) => (
                  <div key={lecturer.id} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Mã GV</p>
                        <p className="text-sm font-semibold text-foreground">{lecturer.instructorCode || '—'}</p>
                      </div>
                      <Badge variant={lecturer.isActive ? 'default' : 'secondary'} className={lecturer.isActive ? '' : 'text-muted-foreground'}>
                        {lecturer.isActive ? 'Hoạt động' : 'Ngừng'}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-3 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Mã NV</p>
                        <p className="font-medium text-foreground">{lecturer.employeeCode || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Họ và tên</p>
                        <p className="font-medium text-foreground">{lecturer.fullName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Khoa</p>
                        <p className="text-foreground">
                          {getLabel(lecturer.departmentCode, lecturer.departmentName) ||
                            departmentLabels.get(lecturer.departmentId || '') ||
                            'Chưa có thông tin'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Học vị</p>
                        <p className="text-foreground">
                          {getLabel(lecturer.degreeCode, lecturer.degreeName) ||
                            degreeLabels.get(lecturer.degreeId || '') ||
                            'Chưa có thông tin'}
                        </p>
                      </div>
                    </div>
                    {userRole === 'admin' && (
                      <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(lecturer.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(lecturer.id, lecturer.fullName || lecturer.instructorCode || 'giảng viên')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Table className="hidden md:table">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Mã NV</TableHead>
                  <TableHead>Mã GV</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Khoa</TableHead>
                  <TableHead>Học vị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  {userRole === 'admin' && <TableHead className="text-right">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLecturers.map((lecturer) => (
                  <TableRow key={lecturer.id}>
                    <TableCell className="font-medium">{lecturer.employeeCode || '—'}</TableCell>
                    <TableCell className="font-medium">{lecturer.instructorCode}</TableCell>
                    <TableCell>{lecturer.fullName}</TableCell>
                    <TableCell>
                      {getLabel(lecturer.departmentCode, lecturer.departmentName) ||
                        departmentLabels.get(lecturer.departmentId || '') ||
                        'Chưa có thông tin'}
                    </TableCell>
                    <TableCell>
                      {getLabel(lecturer.degreeCode, lecturer.degreeName) ||
                        degreeLabels.get(lecturer.degreeId || '') ||
                        'Chưa có thông tin'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lecturer.isActive ? 'default' : 'secondary'} className={lecturer.isActive ? '' : 'text-muted-foreground'}>
                        {lecturer.isActive ? 'Hoạt động' : 'Ngừng'}
                      </Badge>
                    </TableCell>
                    {userRole === 'admin' && (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            onClick={() => handleOpenEdit(lecturer.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(lecturer.id, lecturer.fullName || lecturer.instructorCode || 'giảng viên')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </>
          )}
        </CardContent>
      </Card>

      <LecturerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lecturerId={selectedLecturerId}
        onSaveSuccess={fetchLecturers}
      />
    </div>
  );
}
