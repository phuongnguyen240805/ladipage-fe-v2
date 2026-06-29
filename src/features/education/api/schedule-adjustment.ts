import apiClient from './auth';

export interface ScheduleAdjustmentValidateRequest {
  courseClassId: string;
  originalScheduleId?: string;
  requestType: 'ABSENT_MAKEUP' | 'EXTRA_SESSION' | 'RESCHEDULE' | 'ROOM_CHANGE';
  absentDate?: string;
  absentTimeSlotId?: string;
  absentPeriods?: number;
  proposedDate?: string;
  proposedTimeSlotId?: string;
  proposedRoomId?: string;
  proposedPeriods?: number;
}

export interface ScheduleAdjustmentSubmitRequest extends ScheduleAdjustmentValidateRequest {
  reason: string;
}

export interface ScheduleAdjustmentReviewRequest {
  note?: string;
}

export interface ScheduleAdjustmentSuggestionRequest {
  courseClassId: string;
  originalScheduleId?: string;
  requestedByInstructorId?: string;
  requestType: 'ABSENT_MAKEUP' | 'EXTRA_SESSION' | 'RESCHEDULE' | 'ROOM_CHANGE';
  absentDate?: string;
  absentTimeSlotId?: string;
  absentPeriods?: number;
  proposedPeriods?: number;
  fromDate?: string;
  toDate?: string;
  preferredDayOfWeeks?: number[];
  preferredTimeSlotIds?: string[];
  preferredRoomId?: string;
  preferredBuildingId?: string;
  preferSameRoom?: boolean;
  maxSuggestions?: number;
}

export const scheduleAdjustmentApi = {
  validate: (data: ScheduleAdjustmentValidateRequest) => 
    apiClient.post('/api/v1/schedule-adjustments/validate', data),
    
  submit: (data: ScheduleAdjustmentSubmitRequest) => 
    apiClient.post('/api/v1/schedule-adjustments', data),
    
  getMine: () => 
    apiClient.get('/api/v1/schedule-adjustments/my'),

  suggest: (data: ScheduleAdjustmentSuggestionRequest) =>
    apiClient.post('/api/v1/schedule-adjustments/suggestions', data),
    
  getByInstructor: (instructorId: string) => 
    apiClient.get('/api/v1/admin/schedule-adjustments', { params: { instructorId } }),
    
  searchAdmin: (params?: { status?: string, courseClassId?: string, instructorId?: string, requestType?: string, departmentId?: string, semesterId?: string, page?: number, size?: number }) => 
    apiClient.get('/api/v1/admin/schedule-adjustments', { params }),

  suggestAdmin: (data: ScheduleAdjustmentSuggestionRequest) =>
    apiClient.post('/api/v1/admin/schedule-adjustments/suggestions', data),
    
  approve: (requestId: string, data: ScheduleAdjustmentReviewRequest) => 
    apiClient.post(`/api/v1/admin/schedule-adjustments/${requestId}/approve`, data),
    
  reject: (requestId: string, data: ScheduleAdjustmentReviewRequest) => 
    apiClient.post(`/api/v1/admin/schedule-adjustments/${requestId}/reject`, data),
    
  returnToInstructor: (requestId: string, data: ScheduleAdjustmentReviewRequest) => 
    apiClient.post(`/api/v1/admin/schedule-adjustments/${requestId}/return`, data),
};
