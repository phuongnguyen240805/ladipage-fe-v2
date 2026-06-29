import apiClient from './auth';

export const scheduleApi = {
  getAll: () => apiClient.get('/api/v1/schedules'),
  getByCourseClass: (id: string) => apiClient.get(`/api/v1/schedules/course-class/${id}`),
  getByInstructor: (id: string) => apiClient.get(`/api/v1/schedules/instructor/${id}`),
  getByRoom: (id: string) => apiClient.get(`/api/v1/schedules/room/${id}`),
  create: (data: any) => apiClient.post('/api/v1/schedules', data),
  update: (id: string, data: any) => apiClient.put(`/api/v1/schedules/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/schedules/${id}`),
  generateAutoSchedule: (semesterId: string) => apiClient.post(`/api/v1/auto-schedules/generate/${semesterId}`),
  getAutoScheduleStatus: (semesterId: string) => apiClient.get(`/api/v1/auto-schedules/status/${semesterId}`),
  getTeachingProgress: (params?: { semesterId?: string; instructorId?: string; courseClassId?: string }) => 
    apiClient.get('/api/v1/schedules/teaching-progress', { params }),
  getCalendar: (params: { instructorId: string; month: number; year: number }) => 
    apiClient.get('/api/v1/schedules/calendar', { params }),
  getInstructorWeek: (id: string, date: string, semesterId?: string) => 
    apiClient.get(`/api/v1/schedules/instructor/${id}/week`, { params: { date, semesterId } }),
};
