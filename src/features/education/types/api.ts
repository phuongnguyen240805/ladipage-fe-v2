export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AccountCreationResponse {
  personId?: string;
  studentId?: string;
  employeeId?: string;
  userId?: string;
  type?: string;
  roleCode?: string;
  generatedCode?: string;
  studentCode?: string;
  employeeCode?: string;
  instructorCode?: string;
  staffCode?: string;
  username?: string;
  emailEdu?: string;
  initialPassword?: string;
  confirmationToken?: string;
  confirmationLink?: string;
  requirePasswordChange?: boolean;
  majorId?: string;
  trainingProgramId?: string;
  academicCohortId?: string;
  classId?: string;
  departmentId?: string;
  degreeId?: string;
  divisionId?: string;
  positionId?: string;
}
