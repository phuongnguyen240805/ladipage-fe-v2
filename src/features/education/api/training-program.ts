import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';
import type { TrainingProgram } from '@/features/education/types/lookup';

const CACHE_PREFIX = 'training_programs';

export const trainingProgramApi = {
  getAll: async (params?: { keyword?: string; majorId?: string; departmentId?: string; academicCohortId?: string; isActive?: boolean; size?: number }): Promise<TrainingProgram[]> => {
    const cacheKey = `${CACHE_PREFIX}_${JSON.stringify(params || {})}`;
    return withCache(cacheKey, async () => {
      const response = await request.get('/api/v1/training-programs/admin', { params });
      return unwrapApiResponse<TrainingProgram[]>(response);
    });
  },

  getById: async (id: string): Promise<TrainingProgram> => {
    const response = await request.get(`/api/v1/training-programs/admin/${id}`);
    return unwrapApiResponse<TrainingProgram>(response);
  },

  create: async (data: Partial<TrainingProgram>): Promise<TrainingProgram> => {
    const response = await request.post('/api/v1/training-programs/admin', data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<TrainingProgram>(response);
  },

  update: async (id: string, data: Partial<TrainingProgram>): Promise<TrainingProgram> => {
    const response = await request.put(`/api/v1/training-programs/admin/${id}`, data);
    clearCache(CACHE_PREFIX);
    return unwrapApiResponse<TrainingProgram>(response);
  },

  delete: async (id: string): Promise<void> => {
    await request.delete(`/api/v1/training-programs/admin/${id}`);
    clearCache(CACHE_PREFIX);
  },
};
