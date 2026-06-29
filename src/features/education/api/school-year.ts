import { request } from '@/features/education/utils/request';
import { withCache, clearCache } from '@/features/education/utils/cache';

const CACHE_PREFIX = 'schoolYears';

export const schoolYearApi = {
  getAll: (params?: { keyword?: string; isActive?: boolean }) => {
    const cacheKey = `${CACHE_PREFIX}_${JSON.stringify(params || {})}`;
    return withCache(cacheKey, async () => {
      return request.get('/api/v1/school-years/admin', { params });
    });
  },
  
  getById: (id: string) =>
    request.get(`/api/v1/school-years/admin/${id}`),
  
  create: async (data: any) => {
    const response = await request.post('/api/v1/school-years/admin', data);
    clearCache(CACHE_PREFIX);
    return response;
  },
  
  update: async (id: string, data: any) => {
    const response = await request.put(`/api/v1/school-years/admin/${id}`, data);
    clearCache(CACHE_PREFIX);
    return response;
  },
  
  delete: async (id: string) => {
    const response = await request.delete(`/api/v1/school-years/admin/${id}`);
    clearCache(CACHE_PREFIX);
    return response;
  },
};