import apiClient from './auth';
import { withCache, clearCache } from '@/features/education/utils/cache';

const CACHE_PREFIX = 'buildings';

export const buildingApi = {
  getAll: async () => {
    return withCache(CACHE_PREFIX, async () => {
      const response = await apiClient.get('/api/v1/buildings');
      return response?.data || [];
    });
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/v1/buildings/${id}`);
    return response?.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/api/v1/buildings', data);
    clearCache(CACHE_PREFIX);
    return response?.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/v1/buildings/${id}`, data);
    clearCache(CACHE_PREFIX);
    return response?.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/buildings/${id}`);
    clearCache(CACHE_PREFIX);
    return response;
  },
};