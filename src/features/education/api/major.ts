import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';
import type { Major } from '@/features/education/types/lookup';

const CACHE_PREFIX = 'majors';

export const majorApi = {
  getAll: async (params?: { keyword?: string; departmentId?: string; isActive?: boolean; size?: number }): Promise<Major[]> => {
    const cacheKey = `${CACHE_PREFIX}_${JSON.stringify(params || {})}`;
    return withCache(cacheKey, async () => {
      const response = await request.get('/api/v1/majors/admin', { params });
      return unwrapApiResponse<Major[]>(response);
    });
  },

  getById: async (id: string): Promise<Major> => {
    const response = await request.get(`/api/v1/majors/admin/${id}`);
    return unwrapApiResponse<Major>(response);
  },

  create: async (data: { code: string; name: string; description?: string; departmentId?: string; isActive?: boolean }): Promise<Major> => {
    const response = await request.post('/api/v1/majors/admin', data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<Major>(response);
  },

  update: async (id: string, data: { code: string; name: string; description?: string; departmentId?: string; isActive?: boolean }): Promise<Major> => {
    const response = await request.put(`/api/v1/majors/admin/${id}`, data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<Major>(response);
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/api/v1/majors/admin/${id}`);
    clearCache(CACHE_PREFIX);
  },
};
