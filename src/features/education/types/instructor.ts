export interface InstructorAdminCreateRequest {
  fullName: string;
  fullNameNoAccent?: string;
  dateOfBirth: string;
  gender?: string;
  placeOfBirth?: string;
  ethnicity?: string;
  personalIdentificationNumber?: string;
  dateOfIssue?: string;
  cardPlace?: string;
  nationality?: string;
  contactEmail?: string;
  phoneNumber?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  avatarUrl?: string;
  note?: string;
  employeeCode?: string;
  instructorCode?: string;
  startWorkDate?: string;
  endWorkDate?: string;
  contractType?: string;
  departmentId: string;
  degreeId?: string;
  academicRank?: string;
  majorId?: string;
  specialization?: string;
  institution?: string;
  graduationYear?: number;
}

export interface InstructorAdminUpdateRequest extends Partial<InstructorAdminCreateRequest> {
  employeeStatus?: string;
  isActive?: boolean;
}

export interface InstructorAdminResponse {
  employeeId: string;
  employeeCode?: string;
  instructorCode?: string;
  startWorkDate?: string;
  endWorkDate?: string;
  employeeStatus?: string;
  employeeType?: string;
  contractType?: string;
  note?: string;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  degreeId?: string;
  degreeCode?: string;
  degreeName?: string;
  academicRank?: string;
  majorId?: string;
  specialization?: string;
  institution?: string;
  graduationYear?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  personId?: string;
  fullName?: string;
  fullNameNoAccent?: string;
  gender?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  ethnicity?: string;
  personalIdentificationNumber?: string;
  dateOfIssue?: string;
  cardPlace?: string;
  nationality?: string;
  contactEmail?: string;
  phoneNumber?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  avatarUrl?: string;
}

export type LecturerListItem = InstructorAdminResponse & {
  id: string;
};

export interface InstructorAdminFormData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  contactEmail: string;
  permanentAddress: string;
  employeeCode: string;
  instructorCode: string;
  startWorkDate: string;
  endWorkDate: string;
  contractType: string;
  departmentId: string;
  degreeId: string;
  academicRank: string;
  majorId: string;
  specialization: string;
  institution: string;
  graduationYear: string;
  isActive?: boolean;
  note: string;
}
