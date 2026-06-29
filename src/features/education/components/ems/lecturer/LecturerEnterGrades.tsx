"use client";
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/features/education/components/ui/select';
import { Button } from '@/features/education/components/ui/button';
import { Save, Lock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { gradeApi } from '@/features/education/api/grade';

export default function LecturerEnterGrades() {
  const [courseClasses, setCourseClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [components, setComponents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const dataCache = React.useRef<Record<string, { components: any[]; grades: any[] }>>({});

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await gradeApi.getInstructorClasses();
        // Backend wraps in ApiResponse
        setCourseClasses(res.data?.data || res.data || []);
      } catch (e) {
        console.error("Failed to load classes", e);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass === 'all') {
      setGrades([]);
      setComponents([]);
      return;
    }
    
    // Return cached data immediately if available
    if (dataCache.current[selectedClass]) {
      setComponents(dataCache.current[selectedClass].components);
      setGrades(dataCache.current[selectedClass].grades);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [componentsRes, studentsRes] = await Promise.all([
          gradeApi.getClassComponents(selectedClass),
          gradeApi.getClassStudents(selectedClass)
        ]);
        
        const comps = componentsRes.data?.data || componentsRes.data || [];
        const stds = studentsRes.data?.data || studentsRes.data || [];
        
        // Cache the fetched data
        dataCache.current[selectedClass] = {
          components: comps,
          grades: stds
        };
        
        setComponents(comps);
        setGrades(stds);
      } catch (error) {
        console.error("Failed to load grades data", error);
        toast.error("Không thể tải danh sách điểm. Vui lòng kiểm tra kết nối.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedClass]);

  const handleScoreChange = (registrationId: string, componentId: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    if (numValue !== null && (numValue < 0 || numValue > 10)) return; // Prevent invalid
    
    setGrades(prev => {
      const newGrades = prev.map(g => {
        if (g.courseRegistrationId === registrationId) {
          let exists = false;
          let updatedComponentScores = (g.componentScores || []).map((cs: any) => {
            if (cs.gradeComponentId === componentId) {
              exists = true;
              return { ...cs, score: numValue };
            }
            return cs;
          });

          if (!exists) {
            const componentInfo = components.find(c => c.gradeComponentId === componentId);
            const weight = componentInfo ? componentInfo.weightPercentage : 0;
            updatedComponentScores.push({
              courseRegistrationId: registrationId,
              gradeComponentId: componentId,
              score: numValue,
              weightPercentage: weight,
              isLocked: false,
              note: ''
            });
          }

          // Recalculate total score dynamically based on weights
          let calculatedTotal = 0;
          updatedComponentScores.forEach((cs: any) => {
            const score = cs.score || 0;
            const weight = cs.weightPercentage || 0;
            calculatedTotal += score * (weight / 100);
          });

          return {
            ...g,
            componentScores: updatedComponentScores,
            totalScore: calculatedTotal
          };
        }
        return g;
      });

      // Keep cache in sync with local edits
      if (dataCache.current[selectedClass]) {
        dataCache.current[selectedClass].grades = newGrades;
      }
      return newGrades;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const savePromises: Promise<any>[] = [];
      
      grades.forEach(student => {
        const regId = student.courseRegistrationId;
        student.componentScores?.forEach((cs: any) => {
          if (cs.score !== null && cs.score !== undefined) {
            savePromises.push(
              gradeApi.upsertComponentScore(regId, {
                gradeComponentId: cs.gradeComponentId,
                score: cs.score,
                note: cs.note || ''
              })
            );
          }
        });
      });

      await Promise.all(savePromises);
      toast.success("Đã lưu điểm thành công!");
      
      // Refresh grades after saving to get updated letters/GPAs from backend
      const studentsRes = await gradeApi.getClassStudents(selectedClass);
      const refreshedGrades = studentsRes.data?.data || studentsRes.data || [];
      
      // Update cache
      if (dataCache.current[selectedClass]) {
        dataCache.current[selectedClass].grades = refreshedGrades;
      }
      setGrades(refreshedGrades);
    } catch (error) {
      console.error("Lỗi khi lưu điểm", error);
      toast.error("Lỗi khi lưu bảng điểm. Vui lòng kiểm tra lại dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'text-gray-500 bg-gray-50';
    if (score >= 8.5) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400';
    if (score >= 7.0) return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400';
    if (score >= 4.0) return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-[350px]">
          <Select value={selectedClass} onValueChange={(val) => setSelectedClass(val || 'all')}>
            <SelectTrigger className="bg-white dark:bg-gray-800 h-11 border-gray-200 dark:border-gray-700 font-medium">
              <SelectValue placeholder="-- Chọn lớp học phần --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- Chọn lớp học phần --</SelectItem>
              {courseClasses.map(c => (
                <SelectItem key={c.courseClassId} value={c.courseClassId}>
                  {c.classCode} - {c.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClass !== 'all' && (
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 text-brand-600 border-brand-200 hover:bg-brand-50" onClick={handleSave} disabled={saving}>
              <Save size={18} /> Lưu tạm
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white border-0 shadow-lg shadow-brand-500/30" onClick={() => toast.info("Đã khóa bảng điểm")} disabled={saving}>
              <Lock size={18} /> Khóa điểm
            </Button>
          </div>
        )}
      </div>

      {selectedClass === 'all' ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-gray-900/20 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <FileText size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Vui lòng chọn lớp học phần để tiến hành nhập điểm</p>
        </div>
      ) : loading ? (
        <div className="p-10 text-center text-slate-500">Đang tải danh sách sinh viên...</div>
      ) : (
        <div className="bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Mã SV</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Họ và tên</th>
                  {components.map(comp => (
                    <th key={comp.gradeComponentId} className="px-6 py-4 font-bold tracking-wider text-center w-[140px]">
                      {comp.componentName}
                      <span className="block text-[9px] font-normal mt-0.5 opacity-70">({comp.weightPercentage}%)</span>
                    </th>
                  ))}
                  <th className="px-6 py-4 font-bold tracking-wider text-center w-[120px]">Tổng kết</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center w-[100px]">Điểm chữ</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center w-[100px]">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {grades.map((student) => (
                  <tr key={student.courseRegistrationId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                      {student.studentCode}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {student.fullName}
                    </td>
                    {components.map(comp => {
                      const compScoreObj = student.componentScores?.find(
                        (cs: any) => cs.gradeComponentId === comp.gradeComponentId
                      );
                      const scoreValue = compScoreObj ? (compScoreObj.score !== null && compScoreObj.score !== undefined ? compScoreObj.score : '') : '';
                      return (
                        <td key={comp.gradeComponentId} className="px-6 py-3">
                          <input 
                            type="number" min="0" max="10" step="0.1"
                            value={scoreValue}
                            onChange={(e) => handleScoreChange(student.courseRegistrationId, comp.gradeComponentId, e.target.value)}
                            disabled={compScoreObj?.isLocked || student.isFinalized}
                            className="w-full text-center py-2 px-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-semibold disabled:bg-slate-105 dark:disabled:bg-slate-800 disabled:opacity-70"
                          />
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg font-bold ${getScoreColor(student.totalScore)}`}>
                        {student.totalScore !== null && student.totalScore !== undefined && student.totalScore >= 0 ? Number(student.totalScore).toFixed(1) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-700 dark:text-gray-300">
                      {student.letterGrade || '-'}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      {student.result === 'PASS' || student.result === 'Đạt' || student.result === 'QUA_MON' ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Đạt</span>
                      ) : student.result === 'FAIL' || student.result === 'Học lại' || student.result === 'TRUOT_MON' ? (
                        <span className="text-rose-600 dark:text-rose-400">Học lại</span>
                      ) : (
                        <span className="text-gray-500">{student.result || '-'}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {grades.length === 0 && !loading && (
                  <tr>
                    <td colSpan={components.length + 5} className="px-6 py-8 text-center text-gray-500">
                      Lớp học phần chưa có sinh viên đăng ký.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
