'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/features/education/components/ui/card';
import { Button } from '@/features/education/components/ui/button';
import { Input } from '@/features/education/components/ui/input';
import { Badge } from '@/features/education/components/ui/badge';
import { Search, Plus, Trash2, ArrowRight, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import DepartmentCombobox from './DepartmentCombobox';

export interface PrerequisiteItem {
  id: string; // The relationship ID or course ID
  prerequisiteCourseId: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName?: string;
  type: 'PREREQUISITE' | 'PARALLEL';
}

interface Course {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName?: string;
  courseType: string;
  credits: number;
}

interface PrerequisiteDualListProps {
  courseId: string;
  allCourses: Course[];
  selectedPrerequisites: PrerequisiteItem[];
  onAdd: (prereqCourseId: string, type: 'PREREQUISITE' | 'PARALLEL') => Promise<void>;
  onDelete: (prereqRelationId: string | { courseId: string; prereqId: string }) => Promise<void>;
  loading?: boolean;
}

export const PrerequisiteDualList: React.FC<PrerequisiteDualListProps> = ({
  courseId,
  allCourses = [],
  selectedPrerequisites = [],
  onAdd,
  onDelete,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 1. Filter out the current course itself
  const availableCoursesRaw = allCourses.filter(c => c.id !== courseId);

  // 2. Filter out courses that are already selected as prerequisites
  const selectedIds = new Set(selectedPrerequisites.map(p => p.prerequisiteCourseId));
  const availableCourses = availableCoursesRaw.filter(c => !selectedIds.has(c.id));

  // 3. Search and department filtering in Available Panel
  const filteredAvailable = availableCourses.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDept || c.departmentId === filterDept;
    return matchesSearch && matchesDept;
  });

  const handleAddPrerequisite = async (prereqId: string, type: 'PREREQUISITE' | 'PARALLEL') => {
    setActionLoading(prereqId + '-' + type);
    try {
      await onAdd(prereqId, type);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemovePrerequisite = async (item: PrerequisiteItem) => {
    // If we have an id (relation id) use it, otherwise use composite
    const identifier = item.id ? item.id : { courseId, prereqId: item.prerequisiteCourseId };
    setActionLoading(item.prerequisiteCourseId);
    try {
      await onDelete(identifier);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch min-h-[450px]">
      {/* LEFT PANEL: Available Courses */}
      <Card className="lg:col-span-7 flex flex-col border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-150/60 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-primary" />
              Môn học khả dụng
            </h3>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold">
              {filteredAvailable.length} môn
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Mã, tên môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 border-slate-200 dark:border-slate-800"
              />
            </div>
            <DepartmentCombobox
              placeholder="Lọc theo khoa..."
              value={filterDept}
              onChange={setFilterDept}
              className="h-10"
            />
          </div>
        </div>

        <CardContent className="p-3 flex-1 overflow-y-auto max-h-[360px] min-h-[250px] space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-slate-450 gap-2">
              <RefreshCw className="h-7 w-7 animate-spin text-primary" />
              <span className="text-sm font-medium">Đang tải danh sách môn học...</span>
            </div>
          ) : filteredAvailable.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400 gap-2">
              <AlertCircle className="h-7 w-7" />
              <span className="text-sm font-semibold">Không tìm thấy môn học nào</span>
            </div>
          ) : (
            filteredAvailable.map((c) => (
              <div
                key={c.id}
                className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs border-primary/20 text-primary bg-primary/5">
                      {c.code}
                    </Badge>
                    <span className="font-semibold text-slate-850 dark:text-slate-200 text-sm line-clamp-1">
                      {c.name}
                    </span>
                  </div>
                  <div className="flex gap-3 text-[11px] text-slate-450 mt-1 font-medium">
                    <span>Khoa: {c.departmentName || 'Chưa rõ'}</span>
                    <span>•</span>
                    <span>Tín chỉ: {c.credits.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-600 dark:hover:bg-amber-500/20 dark:hover:text-amber-400 hover:border-amber-500/30 border-slate-200 dark:border-slate-800"
                    disabled={actionLoading !== null}
                    onClick={() => handleAddPrerequisite(c.id, 'PREREQUISITE')}
                  >
                    {actionLoading === c.id + '-PREREQUISITE' ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 mr-1" />
                    )}
                    Tiên quyết
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 hover:border-indigo-500/30 border-slate-200 dark:border-slate-800"
                    disabled={actionLoading !== null}
                    onClick={() => handleAddPrerequisite(c.id, 'PARALLEL')}
                  >
                    {actionLoading === c.id + '-PARALLEL' ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 mr-1" />
                    )}
                    Song hành
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* MIDDLE INDICATOR FOR LARGE DESKTOP */}
      <div className="hidden lg:flex flex-col items-center justify-center text-slate-300">
        <ArrowRight className="h-6 w-6 stroke-[1.5px] animate-bounce-x" />
      </div>

      {/* RIGHT PANEL: Selected Prerequisites */}
      <Card className="lg:col-span-4 flex flex-col border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-150/60 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
            Môn liên kết
          </h3>
          <Badge className="bg-primary/10 text-primary border-none font-semibold">
            {selectedPrerequisites.length} môn
          </Badge>
        </div>

        <CardContent className="p-3 flex-1 overflow-y-auto max-h-[420px] min-h-[250px] space-y-2">
          {selectedPrerequisites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 gap-2 text-center px-4">
              <BookOpen className="h-8 w-8 opacity-40 text-slate-400" />
              <span className="text-sm font-semibold">Chưa có môn tiên quyết hoặc song hành nào</span>
              <p className="text-xs text-slate-450 leading-relaxed mt-1">
                Hãy click nút thêm từ bảng môn học khả dụng bên cạnh
              </p>
            </div>
          ) : (
            selectedPrerequisites.map((p) => (
              <div
                key={p.prerequisiteCourseId}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 hover:border-slate-200 transition-all"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-850 dark:text-slate-200 text-sm line-clamp-1">
                      {p.name}
                    </span>
                  </div>
                  <div className="flex gap-2 text-[10px] text-slate-400 mt-1 font-mono items-center">
                    <span>{p.code}</span>
                    <span>•</span>
                    {p.type === 'PREREQUISITE' ? (
                      <Badge className="bg-amber-500/10 hover:bg-amber-500/10 border-none text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-semibold py-0 px-1.5 h-4.5 text-[9px] rounded-md">
                        Tiên quyết
                      </Badge>
                    ) : (
                      <Badge className="bg-indigo-500/10 hover:bg-indigo-500/10 border-none text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-semibold py-0 px-1.5 h-4.5 text-[9px] rounded-md">
                        Song hành
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0 transition-all"
                  disabled={actionLoading !== null}
                  onClick={() => handleRemovePrerequisite(p)}
                >
                  {actionLoading === p.prerequisiteCourseId ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4.5 w-4.5" />
                  )}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrerequisiteDualList;
