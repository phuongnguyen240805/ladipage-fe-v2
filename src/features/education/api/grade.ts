import { request } from '@/features/education/utils/request';

export const gradeApi = {
  // Lấy danh sách điểm theo lớp
  getByClass: (classId: string) => 
    request.get(`/api/grades/class/${classId}`),
  
  // Lấy chi tiết điểm của sinh viên
  getById: (id: string) => 
    request.get(`/api/grades/${id}`),
  
  // Cập nhật điểm
  update: (id: string, data: { attendanceScore: number; midtermScore: number; finalScore: number }) => 
    request.put(`/api/grades/${id}`, data),
  
  // Nhập điểm hàng loạt
  updateBatch: (data: Array<{ id: string; attendanceScore: number; midtermScore: number; finalScore: number }>) => 
    request.post('/api/grades/batch', data),

  // Instructor APIs
  getInstructorClasses: () =>
    request.get('/api/v1/instructors/grades/course-classes'),

  getClassComponents: (courseClassId: string) =>
    request.get(`/api/v1/instructors/grades/course-classes/${courseClassId}/components`),

  getClassStudents: (courseClassId: string) =>
    request.get(`/api/v1/instructors/grades/course-classes/${courseClassId}/students`),

  upsertComponentScore: (courseRegistrationId: string, data: { gradeComponentId: string; score: number; note?: string }) =>
    request.post(`/api/v1/instructors/grades/registrations/${courseRegistrationId}/component-scores`, data),
};