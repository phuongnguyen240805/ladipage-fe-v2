import { unwrapApiResponse } from '@/features/education/api/response';
import { studentApi } from '@/features/education/api/student';
import { request } from '@/features/education/utils/request';
import type {
  StudentAcademicResult,
  StudentAnnouncement,
  StudentDashboard,
  StudentDocument,
  StudentExam,
  StudentPortalAcademicResultApi,
  StudentPortalPayload,
  StudentPortalScheduleApiItem,
  StudentRegistration,
  StudentScheduleItem,
  StudentSupportRequest,
  StudentTuition,
} from '@/features/education/types/student-portal';
import type { StudentSelfResponse } from '@/features/education/types/student';

function withApi<T>(data: T): StudentPortalPayload<T> {
  return { data, source: 'api' };
}

const emptyAcademicResult: StudentAcademicResult = {
  semesters: [],
  semesterLabel: 'Học kỳ hiện tại',
  cumulativeGpa: 0,
  semesterGpa: 0,
  accumulatedCredits: 0,
  programCredits: 0,
  grades: [],
};

async function readAcademicResult(): Promise<StudentPortalPayload<StudentAcademicResult>> {
  try {
    const response = await request.get('/api/v1/students/me/academic-results');
    const data = normalizeAcademicResult(unwrapApiResponse<StudentPortalAcademicResultApi>(response));
    return withApi(data);
  } catch {
    return withApi(emptyAcademicResult);
  }
}

async function readSchedule(): Promise<StudentPortalPayload<StudentScheduleItem[]>> {
  try {
    const response = await request.get('/api/v1/students/me/schedule');
    const data = unwrapApiResponse<StudentPortalScheduleApiItem[]>(response).map(normalizeSchedule);
    return withApi(data);
  } catch {
    return withApi([]);
  }
}

export const studentPortalApi = {
  getDashboard: async (): Promise<StudentPortalPayload<StudentDashboard>> => {
    const [academic, mySchedule] = await Promise.all([readAcademicResult(), readSchedule()]);
    return {
      data: {
        semesterLabel: academic.data.semesterLabel,
        academic: academic.data,
        nextSchedules: mySchedule.data.slice(0, 3),
        announcements: [],
      },
      source: 'api',
    };
  },

  getAcademicResult: readAcademicResult,

  getMySchedule: readSchedule,

  getAnnouncements: async (): Promise<StudentPortalPayload<StudentAnnouncement[]>> => {
    try {
      const response = await request.get('/api/v1/students/me/announcements');
      const data = unwrapApiResponse<any[]>(response).map(normalizeAnnouncement);
      return withApi(data);
    } catch {
      return withApi([]);
    }
  },

  getDocuments: async (): Promise<StudentPortalPayload<StudentDocument[]>> => {
    try {
      const response = await request.get('/api/v1/students/me/documents');
      const data = unwrapApiResponse<any[]>(response).map(normalizeDocument);
      return withApi(data);
    } catch {
      return withApi([]);
    }
  },

  getTuition: async (): Promise<StudentPortalPayload<StudentTuition>> => {
    try {
      const response = await request.get('/api/v1/students/me/tuition');
      return withApi(normalizeTuition(unwrapApiResponse<any>(response)));
    } catch {
      return withApi({ totalAmount: 0, paidAmount: 0, remainingAmount: 0, registeredCredits: 0, unpaidRegistrations: 0 });
    }
  },

  getRegistrations: async (): Promise<StudentPortalPayload<StudentRegistration[]>> => {
    try {
      const response = await request.get('/api/v1/students/me/registrations');
      const data = unwrapApiResponse<any[]>(response).map(normalizeRegistration);
      return withApi(data);
    } catch {
      return withApi([]);
    }
  },

  getExams: async (): Promise<StudentPortalPayload<StudentExam[]>> => {
    try {
      const response = await request.get('/api/v1/students/me/exams');
      const data = unwrapApiResponse<any[]>(response).map(normalizeExam);
      return withApi(data);
    } catch {
      return withApi([]);
    }
  },

  getSupportRequests: async (): Promise<StudentPortalPayload<StudentSupportRequest[]>> => {
    try {
      const response = await request.get('/api/v1/students/me/support-requests');
      const data = unwrapApiResponse<any[]>(response).map(normalizeSupportRequest);
      return withApi(data);
    } catch {
      return withApi([]);
    }
  },

  createSupportRequest: async (payload: { title: string; content: string }): Promise<StudentSupportRequest> => {
    const response = await request.post('/api/v1/students/me/support-requests', payload);
    return normalizeSupportRequest(unwrapApiResponse<any>(response));
  },

  getStudentProfile: async (): Promise<StudentSelfResponse | null> => {
    try {
      return await studentApi.getMe();
    } catch {
      return null;
    }
  },
};

function normalizeAcademicResult(data: StudentPortalAcademicResultApi): StudentAcademicResult {
  const grades = (data.grades ?? []).map((grade) => ({
    id: grade.gradeId,
    semesterId: grade.semesterId || 'unassigned',
    semesterLabel: grade.semesterLabel || 'Chưa xác định học kỳ',
    courseCode: grade.courseCode || '--',
    courseName: grade.courseName || 'Học phần chưa đặt tên',
    credits: grade.credits ?? 0,
    processScore: null,
    examScore: null,
    finalScore: grade.finalScore,
    gradePoint: grade.gradePoint,
    letterGrade: grade.letterGrade || '--',
    status: normalizeGradeStatus(grade.status),
  }));
  const semesters = (data.semesters ?? [])
    .filter((semester) => semester.semesterId)
    .map((semester) => ({
      id: semester.semesterId,
      label: semester.label || 'Học kỳ chưa đặt tên',
    }));
  if (grades.some((grade) => grade.semesterId === 'unassigned')) {
    semesters.unshift({ id: 'unassigned', label: 'Chưa xác định học kỳ' });
  }

  return {
    semesters,
    semesterLabel: data.semesterLabel || semesters.at(-1)?.label || 'Học kỳ hiện tại',
    cumulativeGpa: data.cumulativeGpa ?? 0,
    semesterGpa: data.semesterGpa ?? 0,
    accumulatedCredits: data.accumulatedCredits ?? 0,
    programCredits: data.programCredits ?? 0,
    grades,
  };
}

function normalizeAnnouncement(item: any): StudentAnnouncement {
  return {
    id: String(item.id ?? item.announcementId ?? item.notificationId ?? crypto.randomUUID()),
    title: String(item.title ?? item.subject ?? 'Thông báo'),
    sender: String(item.sender ?? item.departmentName ?? item.createdBy ?? 'Nhà trường'),
    date: formatDisplayDate(item.date ?? item.createdAt ?? item.publishedAt),
    type: normalizeAnnouncementType(item.type ?? item.category),
  };
}

function normalizeDocument(item: any): StudentDocument {
  return {
    id: String(item.id ?? item.documentId),
    title: String(item.title ?? 'Tài liệu học tập'),
    courseCode: String(item.courseCode ?? '--'),
    fileType: String(item.fileType ?? item.type ?? '--'),
    updatedAt: formatDisplayDate(item.updatedAt ?? item.createdAt),
    downloadUrl: item.downloadUrl ?? undefined,
  };
}

function normalizeTuition(item: any): StudentTuition {
  return {
    totalAmount: Number(item.totalAmount ?? 0),
    paidAmount: Number(item.paidAmount ?? 0),
    remainingAmount: Number(item.remainingAmount ?? 0),
    registeredCredits: Number(item.registeredCredits ?? 0),
    unpaidRegistrations: Number(item.unpaidRegistrations ?? 0),
  };
}

function normalizeRegistration(item: any): StudentRegistration {
  return {
    registrationId: String(item.registrationId ?? item.courseRegistrationId),
    courseClassId: String(item.courseClassId ?? ''),
    courseCode: String(item.courseCode ?? '--'),
    courseName: String(item.courseName ?? 'Học phần chưa đặt tên'),
    classCode: String(item.classCode ?? '--'),
    credits: Number(item.credits ?? 0),
    semesterLabel: String(item.semesterLabel ?? 'Chưa xác định học kỳ'),
    registrationPeriodName: String(item.registrationPeriodName ?? 'Chưa xác định đợt đăng ký'),
    registeredAt: formatDisplayDate(item.registeredAt),
    status: item.status ?? null,
    paid: Boolean(item.paid),
  };
}

function normalizeExam(item: any): StudentExam {
  return {
    id: String(item.id ?? item.examId),
    courseCode: String(item.courseCode ?? '--'),
    courseName: String(item.courseName ?? 'Học phần chưa đặt tên'),
    examDate: formatDisplayDate(item.examDate),
    startTime: formatTime(item.startTime),
    endTime: formatTime(item.endTime),
    roomCode: String(item.roomCode ?? 'Chưa xếp phòng'),
    format: String(item.format ?? '--'),
  };
}

function normalizeSupportRequest(item: any): StudentSupportRequest {
  return {
    id: String(item.id ?? item.requestId),
    title: String(item.title ?? 'Yêu cầu hỗ trợ'),
    content: String(item.content ?? ''),
    status: String(item.status ?? 'RECEIVED'),
    createdAt: formatDisplayDate(item.createdAt),
  };
}

function normalizeAnnouncementType(type: unknown): StudentAnnouncement['type'] {
  const value = String(type ?? '').toLowerCase();
  if (value.includes('tài') || value.includes('finance')) return 'Tài chính';
  if (value.includes('vụ') || value.includes('academic')) return 'Học vụ';
  return 'Đào tạo';
}

function normalizeGradeStatus(status: string | null): StudentAcademicResult['grades'][number]['status'] {
  if (status === 'IN_PROGRESS') return 'Đang học';
  if (status === 'FAILED') return 'Cần cải thiện';
  return 'Đạt';
}

function normalizeSchedule(item: StudentPortalScheduleApiItem): StudentScheduleItem {
  return {
    id: item.scheduleId,
    dayLabel: toDayLabel(item.dayOfWeek),
    dateLabel: formatDate(item.date),
    time: formatTimeRange(item.startTime, item.endTime),
    courseCode: item.courseCode || '--',
    courseName: item.courseName || 'Học phần chưa đặt tên',
    classCode: item.classCode || '--',
    room: item.roomCode || 'Chưa xếp phòng',
    lecturer: item.instructorName || 'Chưa phân công',
    mode: normalizeScheduleMode(item.mode),
    overrideType: item.overrideType || undefined,
    isCancelled: item.isCancelled ?? undefined,
  };
}

function toDayLabel(dayOfWeek: number | null) {
  if (dayOfWeek === 1) return 'Chủ nhật';
  if (dayOfWeek && dayOfWeek >= 2 && dayOfWeek <= 7) return `Thứ ${dayOfWeek}`;
  return 'Chưa xếp ngày';
}

function formatDate(date: string | null) {
  if (!date) return '--';
  const [year, month, day] = date.split('-');
  return year && month && day ? `${day}/${month}` : date;
}

function formatDisplayDate(date: string | null) {
  if (!date) return '--';
  const [ymd] = date.split('T');
  const [year, month, day] = ymd.split('-');
  return year && month && day ? `${day}/${month}/${year}` : date;
}

function formatTimeRange(startTime: string | null, endTime: string | null) {
  if (!startTime || !endTime) return 'Chưa xếp ca';
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

function formatTime(time: string | null) {
  if (!time) return '--';
  return time.slice(0, 5);
}

function normalizeScheduleMode(mode: string | null): StudentScheduleItem['mode'] {
  if (mode?.toLowerCase().includes('online')) return 'Online';
  if (mode?.toUpperCase().includes('TH')) return 'TH';
  return 'LT';
}
