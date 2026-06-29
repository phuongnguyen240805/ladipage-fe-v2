import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';
import type { AccountCreationResponse } from '@/features/education/types/api';
import type {
  StudentAdminCreateRequest,
  StudentAdminResponse,
  StudentAdminUpdateRequest,
  StudentListItem,
  StudentSelfResponse,
  StudentSelfUpdateRequest,
} from '@/features/education/types/student';

const CACHE_PREFIX = 'students';

const normalizeStudent = (student: StudentAdminResponse): StudentListItem => ({
  ...student,
  id: student.studentId,
});

export const studentApi = {
  getAll: async (): Promise<StudentListItem[]> => {
    return withCache(CACHE_PREFIX, async () => {
      const response = await request.get('/api/v1/students/admin');
      return unwrapApiResponse<StudentAdminResponse[]>(response).map(normalizeStudent);
    });
  },

  getById: async (id: string): Promise<StudentListItem> => {
    const response = await request.get(`/api/v1/students/admin/${id}`);
    return normalizeStudent(unwrapApiResponse<StudentAdminResponse>(response));
  },

  createAdmin: async (data: StudentAdminCreateRequest): Promise<AccountCreationResponse> => {
    const response = await request.post('/api/v1/students/admin', data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<AccountCreationResponse>(response);
  },

  create: async (data: StudentAdminCreateRequest | Record<string, unknown>): Promise<AccountCreationResponse> => {
    clearCache(CACHE_PREFIX);
    return studentApi.createAdmin(data as StudentAdminCreateRequest);
  },

  enroll: async (data: StudentAdminCreateRequest | Record<string, unknown>): Promise<AccountCreationResponse> => {
    clearCache(CACHE_PREFIX);
    return studentApi.createAdmin(data as StudentAdminCreateRequest);
  },

  update: async (id: string, data: StudentAdminUpdateRequest): Promise<StudentListItem> => {
    const response = await request.put(`/api/v1/students/admin/${id}`, data);
    clearCache(CACHE_PREFIX);
    return normalizeStudent(unwrapApiResponse<StudentAdminResponse>(response));
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/api/v1/students/admin/${id}`);
    clearCache(CACHE_PREFIX);
  },

  getMe: async (): Promise<StudentSelfResponse> => {
    const response = await request.get('/api/v1/students/me');
    return unwrapApiResponse<StudentSelfResponse>(response);
  },

  updateMe: async (data: StudentSelfUpdateRequest): Promise<StudentSelfResponse> => {
    const response = await request.put('/api/v1/students/me', data);
    return unwrapApiResponse<StudentSelfResponse>(response);
  },
};
