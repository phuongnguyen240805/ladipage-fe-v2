import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';
import type { Degree } from '@/features/education/types/lookup';

const CACHE_PREFIX = 'degrees';

export const degreeApi = {
  getAll: async (params?: { keyword?: string; majorId?: string; isActive?: boolean }): Promise<Degree[]> => {
    const cacheKey = `${CACHE_PREFIX}_${JSON.stringify(params || {})}`;
    return withCache(cacheKey, async () => {
      const response = await request.get('/api/v1/degrees/admin', { params });
      return unwrapApiResponse<Degree[]>(response);
    });
  },

  getById: async (id: string): Promise<Degree> => {
    const response = await request.get(`/api/v1/degrees/admin/${id}`);
    return unwrapApiResponse<Degree>(response);
  },

  create: async (data: Degree): Promise<Degree> => {
    const response = await request.post('/api/v1/degrees/admin', data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<Degree>(response);
  },

  update: async (id: string, data: Degree): Promise<Degree> => {
    const response = await request.put(`/api/v1/degrees/admin/${id}`, data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<Degree>(response);
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/api/v1/degrees/admin/${id}`);
    clearCache(CACHE_PREFIX);
  },
};
