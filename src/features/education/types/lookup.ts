export interface TrainingProgram {
  id?: string;
  trainingProgramId?: string;
  programId?: string;
  code?: string;
  programCode?: string;
  name?: string;
  programName?: string;
  majorId?: string;
  majorCode?: string;
  majorName?: string;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  academicCohortId?: string;
  academicCohortCode?: string;
  academicCohortName?: string;
  isActive?: boolean;
}

export interface Department {
  id?: string;
  departmentId?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AcademicCohort {
  id?: string;
  academicCohortId?: string;
  cohortId?: string;
  code?: string;
  name?: string;
  startYear?: number;
  endYear?: number;
  isActive?: boolean;
}

export interface Major {
  id?: string;
  majorId?: string;
  code?: string;
  name?: string;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  description?: string;
  isActive?: boolean;
}

export interface Degree {
  id?: string;
  degreeId?: string;
  code?: string;
  name?: string;
  majorId?: string;
  isActive?: boolean;
}

export interface AdministrativeClass {
  id?: string;
  classId?: string;
  classCode?: string;
  className?: string;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  majorId?: string;
  majorCode?: string;
  majorName?: string;
  specializationId?: string;
  specializationCode?: string;
  specializationName?: string;
  advisorId?: string;
  advisorCode?: string;
  advisorName?: string;
  academicCohortId?: string;
  academicCohortCode?: string;
  academicCohortName?: string;
  classPhase?: string;
  maxSize?: number;
  status?: number;
  note?: string;
  isActive?: boolean;
}

export interface Specialization {
  id?: string;
  specializationId?: string;
  code?: string;
  name?: string;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  majorId?: string;
  majorCode?: string;
  majorName?: string;
  description?: string;
  isActive?: boolean;
}
