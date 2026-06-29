import { request } from '@/features/education/utils/request';

export const attendanceApi = {
  // Lấy danh sách sinh viên theo lớp học phần
  getStudentsByClass: (classId: string) => 
    request.get(`/api/attendance/class/${classId}`),
  
  // Lưu điểm danh
  save: (data: { classId: string; date: string; attendance: Record<string, boolean> }) => 
    request.post('/api/attendance', data),
  
  // Lấy lịch sử điểm danh theo lớp
  getHistory: (classId: string, date?: string) => 
    request.get(`/api/attendance/history/${classId}`, { params: { date } }),
};