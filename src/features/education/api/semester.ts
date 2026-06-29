import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';
import type { Semester } from '@/features/education/api/admin-resources';

const CACHE_PREFIX = 'semesters';

export const semesterApi = {
  getAll: async (params?: { keyword?: string; schoolYearId?: string; isActive?: boolean }): Promise<Semester[]> => {
    const cacheKey = `${CACHE_PREFIX}_${JSON.stringify(params || {})}`;
    return withCache(cacheKey, async () => {
      const response = await request.get('/api/v1/semesters/admin', { params });
      return unwrapApiResponse<Semester[]>(response);
    });
  },
  getById: (id: string) => request.get(`/api/v1/semesters/admin/${id}`),
  create: async (data: any) => {
    const response = await request.post('/api/v1/semesters/admin', data);
    clearCache(CACHE_PREFIX);
    return response;
  },
  update: async (id: string, data: any) => {
    const response = await request.put(`/api/v1/semesters/admin/${id}`, data);
    clearCache(CACHE_PREFIX);
    return response;
  },
  delete: async (id: string) => {
    const response = await request.delete(`/api/v1/semesters/admin/${id}`);
    clearCache(CACHE_PREFIX);
    return response;
  },
};