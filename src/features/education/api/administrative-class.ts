import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';
import type { AdministrativeClass } from '@/features/education/types/lookup';

const CACHE_PREFIX = 'administrative_classes';

export const administrativeClassApi = {
  getAll: async (params?: { keyword?: string; departmentId?: string; academicCohortId?: string; isActive?: boolean }): Promise<AdministrativeClass[]> => {
    const cacheKey = `${CACHE_PREFIX}_${JSON.stringify(params || {})}`;
    return withCache(cacheKey, async () => {
      const response = await request.get('/api/v1/classes/admin', { params });
      return unwrapApiResponse<AdministrativeClass[]>(response);
    });
  },

  getById: async (id: string): Promise<AdministrativeClass> => {
    const response = await request.get(`/api/v1/classes/admin/${id}`);
    return unwrapApiResponse<AdministrativeClass>(response);
  },

  create: async (data: AdministrativeClass): Promise<AdministrativeClass> => {
    const response = await request.post('/api/v1/classes/admin', data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<AdministrativeClass>(response);
  },

  update: async (id: string, data: AdministrativeClass): Promise<AdministrativeClass> => {
    const response = await request.put(`/api/v1/classes/admin/${id}`, data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<AdministrativeClass>(response);
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/api/v1/classes/admin/${id}`);
    clearCache(CACHE_PREFIX);
  },
};
