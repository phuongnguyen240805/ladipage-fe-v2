import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';

export const personApi = {
  getAll: async (params?: { keyword?: string; page?: number; size?: number }) => {
    const response = await request.get('/api/v1/persons/admin', { params });
    return unwrapApiResponse<any>(response);
  },

  getById: async (id: string) => {
    const response = await request.get(`/api/v1/persons/admin/${id}`);
    return unwrapApiResponse<any>(response);
  },
};
