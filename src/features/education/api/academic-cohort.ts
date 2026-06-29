import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';
import type { AcademicCohort } from '@/features/education/types/lookup';

const CACHE_PREFIX = 'academic_cohorts';

export const academicCohortApi = {

  getAll: async (params?: { keyword?: string; isActive?: boolean }): Promise<AcademicCohort[]> => {
    const cacheKey = `${CACHE_PREFIX}_${JSON.stringify(params || {})}`;
    return withCache(cacheKey, async () => {
      const response = await request.get('/api/v1/academic-cohorts/admin', { params });
      return unwrapApiResponse<AcademicCohort[]>(response);
    });
  },

  getById: async (id: string): Promise<AcademicCohort> => {
    const response = await request.get(`/api/v1/academic-cohorts/admin/${id}`);
    return unwrapApiResponse<AcademicCohort>(response);
  },

  create: async (data: AcademicCohort): Promise<AcademicCohort> => {
    const response = await request.post('/api/v1/academic-cohorts/admin', data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<AcademicCohort>(response);
  },

  update: async (id: string, data: AcademicCohort): Promise<AcademicCohort> => {
    const response = await request.put(`/api/v1/academic-cohorts/admin/${id}`, data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<AcademicCohort>(response);
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/api/v1/academic-cohorts/admin/${id}`);
    clearCache(CACHE_PREFIX);
  },
};

