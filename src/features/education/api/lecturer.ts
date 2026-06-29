import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';
import type { AccountCreationResponse } from '@/features/education/types/api';
import type {
  InstructorAdminCreateRequest,
  InstructorAdminResponse,
  InstructorAdminUpdateRequest,
  LecturerListItem,
} from '@/features/education/types/instructor';

const CACHE_PREFIX = 'instructors';

const normalizeLecturer = (lecturer: InstructorAdminResponse): LecturerListItem => ({
  ...lecturer,
  id: lecturer.employeeId,
});

export const lecturerApi = {
  getAll: async (): Promise<LecturerListItem[]> => {
    return withCache(CACHE_PREFIX, async () => {
      const response = await request.get('/api/v1/instructors/admin');
      return unwrapApiResponse<InstructorAdminResponse[]>(response).map(normalizeLecturer);
    });
  },

  getById: async (id: string): Promise<LecturerListItem> => {
    const response = await request.get(`/api/v1/instructors/admin/${id}`);
    return normalizeLecturer(unwrapApiResponse<InstructorAdminResponse>(response));
  },

  create: async (data: InstructorAdminCreateRequest): Promise<AccountCreationResponse> => {
    const response = await request.post('/api/v1/instructors/admin', data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<AccountCreationResponse>(response);
  },

  update: async (id: string, data: InstructorAdminUpdateRequest): Promise<LecturerListItem> => {
    const response = await request.put(`/api/v1/instructors/admin/${id}`, data);
    clearCache(CACHE_PREFIX);
    return normalizeLecturer(unwrapApiResponse<InstructorAdminResponse>(response));
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/api/v1/instructors/admin/${id}`);
    clearCache(CACHE_PREFIX);
  },
};
