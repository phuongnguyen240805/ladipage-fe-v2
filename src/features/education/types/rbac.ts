// ─── RBAC Type Definitions ───────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// ─── API Endpoint (gán vào Permission) ───────────────────────────────────────
export interface RbacApi {
  id: string;
  method: HttpMethod;
  path: string;
  permissionId: string;
  createdAt?: string;
}

export interface CreateRbacApiDto {
  method: HttpMethod;
  path: string;
}

// ─── Permission ──────────────────────────────────────────────────────────────
export interface Permission {
  id?: string;
  permissionId?: string;
  code?: string;
  name: string;
  description?: string;
  module?: string;
  apis?: RbacApi[];
  apiCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePermissionDto {
  code: string;
  name: string;
  description?: string;
  module?: string;
}

export interface UpdatePermissionDto {
  code?: string;
  name?: string;
  description?: string;
  module?: string;
}

// ─── Role ─────────────────────────────────────────────────────────────────────
export interface Role {
  id?: string;
  roleId?: string;
  code: string;
  name: string;
  description?: string;
  userCount?: number;
  permissionCount?: number;
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleDto {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  code?: string;
  name?: string;
  description?: string;
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
export interface MenuItem {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  orderIndex: number;
  parentId?: string | null;
  permissionId?: string | null;
  permission?: Permission;
  children?: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuDto {
  name: string;
  path?: string;
  icon?: string;
  orderIndex?: number;
  parentId?: string | null;
  permissionId?: string | null;
}

export interface UpdateMenuDto {
  name?: string;
  path?: string;
  icon?: string;
  orderIndex?: number;
  parentId?: string | null;
  permissionId?: string | null;
}

// ─── User + Roles ─────────────────────────────────────────────────────────────
export interface UserWithRoles {
  id: string;
  username?: string;
  email?: string;
  fullName?: string;
  roles: Role[];
  isActive?: boolean;
  createdAt?: string;
}

// ─── API Response wrappers ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
