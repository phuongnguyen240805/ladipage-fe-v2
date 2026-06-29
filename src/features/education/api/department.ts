import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';
import type { Department } from '@/features/education/types/lookup';

const CACHE_PREFIX = 'departments';

export const departmentApi = {
  getAll: async (params?: { keyword?: string; isActive?: boolean }): Promise<Department[]> => {
    const cacheKey = `${CACHE_PREFIX}_${JSON.stringify(params || {})}`;
    return withCache(cacheKey, async () => {
      const response = await request.get('/api/v1/departments/admin', { params });
      return unwrapApiResponse<Department[]>(response);
    });
  },

  getById: async (id: string): Promise<Department> => {
    const response = await request.get(`/api/v1/departments/admin/${id}`);
    return unwrapApiResponse<Department>(response);
  },

  create: async (data: Department): Promise<Department> => {
    const response = await request.post('/api/v1/departments/admin', data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<Department>(response);
  },

  update: async (id: string, data: Department): Promise<Department> => {
    const response = await request.put(`/api/v1/departments/admin/${id}`, data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<Department>(response);
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/api/v1/departments/admin/${id}`);
    clearCache(CACHE_PREFIX);
  },
};
