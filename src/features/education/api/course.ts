import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';

const COURSE_CACHE_PREFIX = 'courses';
const COURSE_CLASS_CACHE_PREFIX = 'course_classes';

export const courseApi = {
  getAll: async () => {
    return withCache(COURSE_CACHE_PREFIX, async () => {
      return request.get('/api/v1/courses');
    });
  },
  getById: (id: string) => request.get(`/api/v1/courses/${id}`),
  getByCode: (code: string) => request.get(`/api/v1/courses/code/${code}`),
  getByDepartment: (deptId: string) => request.get(`/api/v1/courses/department/${deptId}`),
  create: async (data: any) => {
    const response = await request.post('/api/v1/courses', data);
    clearCache(COURSE_CACHE_PREFIX);
    return response;
  },
  update: async (id: string, data: any) => {
    const response = await request.put(`/api/v1/courses/${id}`, data);
    clearCache(COURSE_CACHE_PREFIX);
    return response;
  },
  delete: async (id: string) => {
    const response = await request.delete(`/api/v1/courses/${id}`);
    clearCache(COURSE_CACHE_PREFIX);
    return response;
  },
  
  getTrainingPrograms: () => request.get('/api/v1/training-programs/admin'),
};

export const courseClassApi = {
  getAll: async () => {
    return withCache(COURSE_CLASS_CACHE_PREFIX, async () => {
      return unwrapApiResponse<any[]>(await request.get('/api/v1/courses/classes'));
    });
  },
  getById: async (id: string) => unwrapApiResponse<any>(await request.get(`/api/v1/courses/classes/${id}`)),
  getByCourse: async (courseId: string) => unwrapApiResponse<any[]>(await request.get(`/api/v1/courses/${courseId}/classes`)),
  getBySemester: async (semesterId: string) => {
    return withCache(`${COURSE_CLASS_CACHE_PREFIX}_semester_${semesterId}`, async () => {
      return unwrapApiResponse<any[]>(await request.get(`/api/v1/courses/classes/semester/${semesterId}`));
    });
  },
  getStudents: async (id: string) => unwrapApiResponse<any[]>(await request.get(`/api/v1/courses/classes/${id}/students`)),
  transferStudent: async (registrationId: string, targetCourseClassId: string) => {
    const response = await request.put(`/api/v1/courses/classes/registrations/${registrationId}/transfer`, {
      targetCourseClassId,
    });
    clearCache(COURSE_CLASS_CACHE_PREFIX);
    return unwrapApiResponse<any>(response);
  },
  create: async (data: any) => {
    const response = unwrapApiResponse<any>(await request.post('/api/v1/courses/classes', data));
    clearCache(COURSE_CLASS_CACHE_PREFIX);
    return response;
  },
  update: async (id: string, data: any) => {
    const response = unwrapApiResponse<any>(await request.put(`/api/v1/courses/classes/${id}`, data));
    clearCache(COURSE_CLASS_CACHE_PREFIX);
    return response;
  },
  delete: async (id: string) => {
    const response = await request.delete(`/api/v1/courses/classes/${id}`);
    clearCache(COURSE_CLASS_CACHE_PREFIX);
    return response;
  },
};

export const coursePrerequisiteApi = {
  getByCourse: (courseId: string) => request.get(`/api/v1/course-prerequisites/admin/course/${courseId}`),
  add: (data: { courseId: string; prerequisiteId: string; type: string }) => request.post('/api/v1/course-prerequisites/admin', data),
  delete: (courseId: string, prereqId: string) => request.delete(`/api/v1/course-prerequisites/admin`, { params: { courseId, prereqId } }),
};
