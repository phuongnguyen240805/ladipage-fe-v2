import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';
import { withCache, clearCache } from '@/features/education/utils/cache';

const CACHE_PREFIX = 'timeSlots';

export const timeSlotApi = {
  // Lấy danh sách ca học
  getAll: (params?: { keyword?: string; isActive?: boolean }) => {
    const cacheKey = `${CACHE_PREFIX}_${JSON.stringify(params || {})}`;
    return withCache(cacheKey, async () => {
      return unwrapApiResponse<any[]>(await request.get('/api/v1/time-slots', { params }));
    });
  },
  
  // Lấy chi tiết ca học theo ID
  getById: (id: string) =>
    request.get(`/api/v1/time-slots/${id}`),
  
  // Tạo mới ca học
  create: async (data: {
    slotCode: string;      // ← sửa: code → slotCode
    startTime: string;     // ← giữ nguyên
    endTime: string;       // ← giữ nguyên
    isActive?: boolean;
  }) => {
    const response = await request.post('/api/v1/time-slots', data);
    clearCache(CACHE_PREFIX);
    return response;
  },
  
  // Cập nhật ca học
  update: async (id: string, data: {
    slotCode: string;      // ← sửa: code → slotCode
    startTime: string;     // ← giữ nguyên
    endTime: string;       // ← giữ nguyên
    isActive?: boolean;
  }) => {
    const response = await request.put(`/api/v1/time-slots/${id}`, data);
    clearCache(CACHE_PREFIX);
    return response;
  },
  
  // Xóa ca học
  delete: async (id: string) => {
    const response = await request.delete(`/api/v1/time-slots/${id}`);
    clearCache(CACHE_PREFIX);
    return response;
  },
};
