import { request } from '@/features/education/utils/request';
import { unwrapApiResponse } from '@/features/education/api/response';

type Params = Record<string, string | number | boolean | undefined>;

async function getList<T>(path: string, params?: Params): Promise<T[]> {
  const response = await request.get(path, { params });
  const data = unwrapApiResponse<any>(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

async function getPage<T>(path: string, params?: Params): Promise<{ rows: T[]; total?: number }> {
  const response = await request.get(path, { params });
  const data = unwrapApiResponse<any>(response);
  if (Array.isArray(data)) return { rows: data, total: data.length };
  if (Array.isArray(data?.content)) return { rows: data.content, total: data.totalElements };
  return { rows: [], total: 0 };
}

function crudApi<T>(path: string) {
  return {
    getAll: (params?: Params) => getList<T>(path, params),
    getPage: (params?: Params) => getPage<T>(path, params),
    getById: async (id: string): Promise<T> => {
      const response = await request.get(`${path}/${id}`);
      return unwrapApiResponse<T>(response);
    },
    create: async (data: Partial<T>): Promise<T> => {
      const response = await request.post(path, data);
      return unwrapApiResponse<T>(response);
    },
    update: async (id: string, data: Partial<T>): Promise<T> => {
      const response = await request.put(`${path}/${id}`, data);
      return unwrapApiResponse<T>(response);
    },
    delete: async (id: string): Promise<void> => {
      await request.delete(`${path}/${id}`);
    },
  };
}

export type Division = {
  divisionId?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
};

export type Position = {
  positionId?: string;
  code?: string;
  name?: string;
  allowance?: number;
  description?: string;
  level?: string;
  divisionId?: string;
  isActive?: boolean;
};

export type SchoolYear = {
  schoolYearId?: string;
  code?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  schoolYearName?: string;
  note?: string;
  isActive?: boolean;
};

export type Semester = {
  semesterId?: string;
  code?: string;
  name?: string;
  schoolYearId?: string;
  startDate?: string;
  endDate?: string;
  status?: boolean;
  description?: string;
  isActive?: boolean;
};

export type Contract = {
  contractId?: string;
  employeeId?: string;
  contractNo?: string;
  contractType?: string;
  signedDate?: string;
  effectiveDate?: string;
  expiredDate?: string;
  baseSalary?: number;
  status?: number;
  note?: string;
  allowance?: number;
  signedBy?: string;
  annualLeave?: number;
  isActive?: boolean;
};

export type Staff = {
  employeeId?: string;
  employeeCode?: string;
  staffCode?: string;
  fullName?: string;
  fullNameNoAccent?: string;
  dateOfBirth?: string;
  gender?: string;
  contactEmail?: string;
  phoneNumber?: string;
  startWorkDate?: string;
  endWorkDate?: string;
  contractType?: string;
  divisionId?: string;
  positionId?: string;
  note?: string;
  isActive?: boolean;
};

export type UserAccount = {
  userId?: string;
  personId?: string;
  username?: string;
  email?: string;
  lastLoginAt?: string;
  accessFailedCount?: number;
  lockoutEndAt?: string;
  lockReason?: string;
  requirePasswordChange?: boolean;
  emailConfirmed?: boolean;
  isActive?: boolean;
  roles?: string[];
};

export type PasswordResetRequest = {
  passwordResetRequestId?: string;
  userId?: string;
  username?: string;
  requesterCode?: string;
  emailEdu?: string;
  phoneNumber?: string;
  fullName?: string;
  status?: string;
  adminNote?: string;
  processedAt?: string;
  createdAt?: string;
};

export type Employee = {
  employeeId?: string;
  employeeCode?: string;
  fullName?: string;
  contactEmail?: string;
  phoneNumber?: string;
  employeeType?: string;
  status?: string;
  contractType?: string;
  startWorkDate?: string;
  endWorkDate?: string;
  isActive?: boolean;
};

export type Person = {
  personId?: string;
  fullName?: string;
  fullNameNoAccent?: string;
  gender?: string;
  dateOfBirth?: string;
  contactEmail?: string;
  phoneNumber?: string;
  personalIdentificationNumber?: string;
  isActive?: boolean;
};

export const divisionApi = crudApi<Division>('/api/v1/divisions/admin');
export const positionApi = crudApi<Position>('/api/v1/positions/admin');
export const schoolYearApi = crudApi<SchoolYear>('/api/v1/school-years/admin');
export const semesterApi = crudApi<Semester>('/api/v1/semesters/admin');
export const contractApi = crudApi<Contract>('/api/v1/contracts/admin');
export const staffApi = crudApi<Staff>('/api/v1/staffs/admin');
export const employeeApi = {
  getAll: (params?: Params) => getList<Employee>('/api/v1/employees/admin', params),
  getPage: (params?: Params) => getPage<Employee>('/api/v1/employees/admin', params),
};
export const personAdminApi = {
  getAll: (params?: Params) => getList<Person>('/api/v1/persons/admin', params),
  getPage: (params?: Params) => getPage<Person>('/api/v1/persons/admin', params),
};
export const userAdminApi = {
  getPage: (params?: Params) => getPage<UserAccount>('/api/v1/users/admin', params),
  getAll: async (params?: Params) => {
    const page = await getPage<UserAccount>('/api/v1/users/admin', { size: 200, ...params });
    return page.rows;
  },
  update: async (id: string, data: Partial<UserAccount>) => {
    const response = await request.put(`/api/v1/users/admin/${id}`, data);
    return unwrapApiResponse<UserAccount>(response);
  },
  delete: async (id: string) => {
    await request.delete(`/api/v1/users/admin/${id}`);
  },
  lock: async (id: string, lockReason?: string) => {
    await request.put(`/api/v1/users/admin/${id}/lock`, { lockReason });
  },
  unlock: async (id: string) => {
    await request.put(`/api/v1/users/admin/${id}/unlock`);
  },
  restore: async (id: string) => {
    await request.put(`/api/v1/users/admin/${id}/restore`);
  },
  revokeSessions: async (id: string) => {
    await request.delete(`/api/v1/users/admin/${id}/sessions`);
  },
};

export const passwordResetAdminApi = {
  getAll: async (status = 'PENDING') => {
    const response = await request.get('/api/auth/admin/password-reset-requests', { params: { status } });
    return unwrapApiResponse<PasswordResetRequest[]>(response);
  },
  approve: async (id: string, adminNote?: string) => {
    const response = await request.put(`/api/auth/admin/password-reset-requests/${id}/approve`, { adminNote });
    return unwrapApiResponse<any>(response);
  },
  reject: async (id: string, adminNote?: string) => {
    await request.put(`/api/auth/admin/password-reset-requests/${id}/reject`, { adminNote });
  },
};
