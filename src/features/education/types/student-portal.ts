export type StudentPortalSource = 'api';

export type StudentPortalPayload<T> = {
  data: T;
  source: StudentPortalSource;
};

export type StudentScheduleItem = {
  id: string;
  dayLabel: string;
  dateLabel: string;
  time: string;
  courseCode: string;
  courseName: string;
  classCode: string;
  room: string;
  lecturer: string;
  mode: 'LT' | 'TH' | 'Online';
  overrideType?: string;
  isCancelled?: boolean;
};

export type StudentGradeItem = {
  id: string;
  semesterId: string;
  semesterLabel: string;
  courseCode: string;
  courseName: string;
  credits: number;
  processScore: number | null;
  examScore: number | null;
  finalScore: number | null;
  gradePoint: number | null;
  letterGrade: string;
  status: 'Đạt' | 'Đang học' | 'Cần cải thiện';
};

export type StudentPortalScheduleApiItem = {
  scheduleId: string;
  dayOfWeek: number | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  courseCode: string | null;
  courseName: string | null;
  classCode: string | null;
  roomCode: string | null;
  instructorName: string | null;
  mode: string | null;
  overrideType: string | null;
  isCancelled: boolean | null;
};

export type StudentPortalAcademicResultApi = {
  semesterLabel: string | null;
  cumulativeGpa: number | null;
  semesterGpa: number | null;
  accumulatedCredits: number | null;
  programCredits: number | null;
  semesters: Array<{ semesterId: string; label: string | null }>;
  grades: Array<{
    gradeId: string;
    semesterId: string | null;
    semesterLabel: string | null;
    courseCode: string | null;
    courseName: string | null;
    credits: number | null;
    finalScore: number | null;
    gradePoint: number | null;
    letterGrade: string | null;
    status: string | null;
  }>;
};

export type StudentAcademicResult = {
  semesters: Array<{ id: string; label: string }>;
  semesterLabel: string;
  cumulativeGpa: number;
  semesterGpa: number;
  accumulatedCredits: number;
  programCredits: number;
  grades: StudentGradeItem[];
};

export type StudentAnnouncement = {
  id: string;
  title: string;
  sender: string;
  date: string;
  type: 'Đào tạo' | 'Học vụ' | 'Tài chính';
};

export type StudentDocument = {
  id: string;
  title: string;
  courseCode: string;
  fileType: string;
  updatedAt: string;
  downloadUrl?: string;
};

export type StudentTuition = {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  registeredCredits: number;
  unpaidRegistrations: number;
};

export type StudentRegistration = {
  registrationId: string;
  courseClassId: string;
  courseCode: string;
  courseName: string;
  classCode: string;
  credits: number;
  semesterLabel: string;
  registrationPeriodName: string;
  registeredAt: string;
  status: number | null;
  paid: boolean;
};

export type StudentExam = {
  id: string;
  courseCode: string;
  courseName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomCode: string;
  format: string;
};

export type StudentSupportRequest = {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
};

export type StudentDashboard = {
  semesterLabel: string;
  academic: StudentAcademicResult;
  nextSchedules: StudentScheduleItem[];
  announcements: StudentAnnouncement[];
};
