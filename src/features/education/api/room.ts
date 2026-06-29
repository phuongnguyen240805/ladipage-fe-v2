import apiClient from './auth';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';

const CACHE_PREFIX = 'rooms';

export const roomApi = {
  getAll: async () => {
    return withCache(CACHE_PREFIX, async () => {
      const response = await apiClient.get('/api/v1/rooms');
      return unwrapApiResponse<any[]>(response);
    });
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/rooms/${id}`);
    return response?.data;
  },
  create: async (data: any) => {
    // Loại bỏ roomId khỏi payload nếu có
    const { roomId, ...cleanData } = data;
    const response = await apiClient.post('/api/v1/rooms', cleanData);
    clearCache(CACHE_PREFIX);
    return response?.data;
  },
  update: async (id: string, data: any) => {
    // Loại bỏ roomId khỏi payload nếu có
    const { roomId, ...cleanData } = data;
    const response = await apiClient.put(`/api/v1/rooms/${id}`, cleanData);
    clearCache(CACHE_PREFIX);
    return response?.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/rooms/${id}`);
    clearCache(CACHE_PREFIX);
    return response;
  },
};
