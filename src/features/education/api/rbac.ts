import { request } from '@/features/education/utils/request';
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto,
  CreateRbacApiDto,
  MenuItem,
  CreateMenuDto,
  UpdateMenuDto,
  UserWithRoles,
} from '@/features/education/types/rbac';

// ─── Roles ────────────────────────────────────────────────────────────────────
export const roleApi = {
  getAll: (): Promise<Role[]> =>
    request.get('/api/v1/roles/admin'),

  getById: (id: string): Promise<Role> =>
    request.get(`/api/v1/roles/admin/${id}`),

  create: (data: CreateRoleDto): Promise<Role> =>
    request.post('/api/v1/roles/admin', data),

  update: (id: string, data: UpdateRoleDto): Promise<Role> =>
    request.put(`/api/v1/roles/admin/${id}`, data),

  delete: (id: string): Promise<void> =>
    request.delete(`/api/v1/roles/admin/${id}`),

  // Permission assignment for a role
  getPermissions: (id: string): Promise<Permission[]> =>
    request.get(`/api/v1/roles/admin/${id}/permissions`),

  updatePermissions: (id: string, permissionIds: string[]): Promise<Role> =>
    request.put(`/api/v1/roles/admin/${id}/permissions`, { permissionIds }),

  getAllWithPermissions: async (): Promise<Role[]> => {
    const rolesRes: any = await request.get('/api/v1/roles/admin');
    const roles: any[] = Array.isArray(rolesRes?.data) ? rolesRes.data : Array.isArray(rolesRes) ? rolesRes : [];
    return Promise.all(
      roles.map(async (role) => {
        const roleId = role.id || role.roleId;
        if (!roleId) return role;
        const permissionsRes: any = await request.get(`/api/v1/roles/admin/${roleId}/permissions`);
        const permissions = Array.isArray(permissionsRes?.data)
          ? permissionsRes.data
          : Array.isArray(permissionsRes)
            ? permissionsRes
            : [];
        return { ...role, permissions };
      }),
    );
  },
};

// ─── Permissions ──────────────────────────────────────────────────────────────
export const permissionApi = {
  getAll: (): Promise<Permission[]> =>
    request.get('/api/v1/permissions/admin'),

  getById: (id: string): Promise<Permission> =>
    request.get(`/api/v1/permissions/admin/${id}`),

  create: (data: CreatePermissionDto): Promise<Permission> =>
    request.post('/api/v1/permissions/admin', data),

  update: (id: string, data: UpdatePermissionDto): Promise<Permission> =>
    request.put(`/api/v1/permissions/admin/${id}`, data),

  delete: (id: string): Promise<void> =>
    request.delete(`/api/v1/permissions/admin/${id}`),

  getApis: async (permissionId: string): Promise<any[]> => {
    const res: any = await request.get(`/api/v1/permissions/admin/${permissionId}/apis`);
    const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    return list.map((api: any) => ({
      id: `${api.httpMethod || api.method}:${api.apiPath || api.path}`,
      method: api.httpMethod || api.method,
      path: api.apiPath || api.path,
      permissionId: api.permissionId || permissionId,
    }));
  },

  addApi: (permissionId: string, data: CreateRbacApiDto): Promise<void> =>
    request.post('/api/v1/permissions/admin/apis', {
      permissionId,
      apiPath: data.path,
      httpMethod: data.method,
    }),

  removeApi: (permissionId: string, apiPath: string, httpMethod: string): Promise<void> =>
    request.delete(`/api/v1/permissions/admin/${permissionId}/apis`, {
      params: { apiPath, httpMethod },
    }),
};

// ─── Menus ────────────────────────────────────────────────────────────────────
export const menuApi = {
  getAll: (): Promise<MenuItem[]> =>
    request.get('/api/v1/menus/admin'),

  getMe: (): Promise<MenuItem[]> =>
    request.get('/api/v1/menus/me'),

  create: (data: CreateMenuDto): Promise<MenuItem> =>
    request.post('/api/v1/menus/admin', data),

  update: (id: string, data: UpdateMenuDto): Promise<MenuItem> =>
    request.put(`/api/v1/menus/admin/${id}`, data),

  delete: (id: string): Promise<void> =>
    request.delete(`/api/v1/menus/admin/${id}`),
};

// ─── User Role Assignment ─────────────────────────────────────────────────────
export const userRoleApi = {
  getUserRoles: (userId: string): Promise<UserWithRoles> =>
    request.get(`/api/v1/users/admin/${userId}/roles`),

  updateUserRoles: (userId: string, roleIds: string[]): Promise<UserWithRoles> =>
    request.put(`/api/v1/users/admin/${userId}/roles`, { roleIds }),

  // Search users (reusing general users endpoint)
  searchUsers: (params?: { keyword?: string; page?: number; size?: number }): Promise<any> =>
    request.get('/api/v1/users/admin', { params }),
};
