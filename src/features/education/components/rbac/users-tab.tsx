import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Users,
  Settings2,
  UserCircle,
  Check,
  RefreshCw,
  Download,
  AlertTriangle,
  Key,
  ShieldCheck,
  X,
  Layers,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/features/education/components/ui/modal';
import { AddUserModal } from './add-user-modal';
import { useAuth } from '@/features/education/context/AuthContext';
import { roleApi, userRoleApi } from '@/features/education/api/rbac';
import { request } from '@/features/education/utils/request';
import type { Role, UserWithRoles, Permission } from '@/features/education/types/rbac';
import { EmptyState, ActionMenu, ActionMenuItem, parseUserList, useDebounce, UserTableSkeleton, MethodBadge } from './shared';

interface UsersTabProps {
  initialSearch?: string;
}

export function UsersTab({ initialSearch = '' }: UsersTabProps) {
  const [rawUsers, setRawUsers] = useState<any[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const searchDebounced = useDebounce(search, 300);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  const users: UserWithRoles[] = useMemo(() => rawUsers.map((user: any) => {
    const mappedRoles = Array.isArray(user.roles)
      ? user.roles.map((role: any) => {
          if (typeof role === 'string') {
            const match = allRoles.find(r => r.code === role || r.name === role);
            return match || { code: role, name: role, id: '', roleId: '' };
          }
          return role;
        })
      : [];

    return {
      ...user,
      id: user.id || user.userId || user.userId?.toString() || '',
      roles: mappedRoles,
    };
  }), [rawUsers, allRoles]);

  // Modal states
  const [modalUser, setModalUser] = useState<UserWithRoles | null>(null);
  const [modalTab, setModalTab] = useState<'roles' | 'permissions'>('roles');
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');
  const [permMethodFilter, setPermMethodFilter] = useState<string>('ALL');
  
  // Add User Modal States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const { user: authUser, refreshUser } = useAuth();
  const currentUserEmail = authUser?.email || authUser?.username || '';

  const fetchRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      // Use the standard endpoint to get roles and then query their permissions in parallel
      const res: any = await roleApi.getAll();
      const rolesList = parseUserList(res);
      
      const rolesWithPerms = await Promise.all(
        rolesList.map(async (role: any) => {
          const roleId = role.id || role.roleId;
          if (!roleId) return role;
          try {
            const permsRes = await roleApi.getPermissions(roleId);
            return {
              ...role,
              permissions: parseUserList(permsRes),
            };
          } catch (e) {
            console.error(`Lỗi khi lấy quyền của vai trò ${roleId}:`, e);
            return { ...role, permissions: [] };
          }
        })
      );
      
      setAllRoles(rolesWithPerms);
    } catch (error) {
      console.error('Lỗi khi tải danh sách role:', error);
      toast.error('Không thể tải danh sách vai trò. Vui lòng kiểm tra backend.');
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // If the search string is like "role:STUDENT", we might want to pass it differently
      // if backend supports it. For now just pass as keyword.
      const keyword = searchDebounced.startsWith('role:') 
        ? searchDebounced.replace('role:', '').trim() 
        : searchDebounced || undefined;

      const res: any = await userRoleApi.searchUsers({
        keyword,
        size: 50,
      });
      const serverUsers = parseUserList(res);
      setRawUsers(serverUsers);
    } catch {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [searchDebounced]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (!modalUser || selectedRoleIds.size > 0) return;

    const initialSelected = new Set<string>();
    modalUser.roles?.forEach(role => {
      if (typeof role === 'string') {
        const match = allRoles.find(r => r.code === role || r.name === role);
        if (match) initialSelected.add(match.id || match.roleId || '');
      } else {
        const roleId = role.id || role.roleId || role.code || role.name;
        if (roleId) initialSelected.add(roleId);
      }
    });

    if (initialSelected.size > 0) {
      setSelectedRoleIds(initialSelected);
    }
  }, [modalUser, allRoles, selectedRoleIds.size]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(new Set(users.map(u => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (id: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUserIds(newSet);
  };

  const openAssign = (user: UserWithRoles) => {
    // Find the full user object from the memoized users list
    const fullUser = users.find(u => u.id === user.id);
    setModalUser(fullUser || user); // Fallback to the provided user
    setModalTab('roles');
    setRoleSearch('');

    const initialSelected = new Set<string>();
    (fullUser || user).roles?.forEach(role => {
      if (typeof role === 'string') {
        const match = allRoles.find(r => r.code === role || r.name === role);
        if (match) {
          initialSelected.add(match.id || match.roleId || '');
        }
      } else {
        const roleId = role.id || role.roleId || role.code || role.name;
        if (roleId) initialSelected.add(roleId);
      }
    });

    setSelectedRoleIds(initialSelected);
  };

  const closeModal = () => {
    setModalUser(null);
  };

  const handleSaveRoles = async () => {
    if (!modalUser) return;

    if (selectedRoleIds.size === 0) {
      const confirm = window.confirm('User sẽ mất toàn bộ quyền truy cập. Bạn có chắc chắn muốn tiếp tục?');
      if (!confirm) return;
    }

    setSaving(true);
    try {
      const roleIdsArray = Array.from(selectedRoleIds).map(sel => {
        const match = allRoles.find(r => r.id === sel || r.roleId === sel || r.code === sel || r.name === sel);
        return match?.id || match?.roleId || sel;
      }).filter(Boolean);

      await userRoleApi.updateUserRoles(modalUser.id, roleIdsArray);
      
      // Optimistic update local users state
      const updatedRoles = allRoles.filter(r => {
        const rId = r.id || r.roleId;
        return rId && selectedRoleIds.has(rId);
      });
      setRawUsers(prev => prev.map(u => u.id === modalUser.id ? { ...u, roles: updatedRoles } : u));
      if (
        modalUser.id === authUser?.id ||
        modalUser.email === authUser?.email ||
        modalUser.username === authUser?.username
      ) {
        await refreshUser();
      }
      
      toast.success(`Đã cập nhật roles cho user ${modalUser.fullName || modalUser.email}`);
      closeModal();
    } catch {
      toast.error('Cập nhật vai trò thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  // Derived calculations for Preview Panel
  const { totalPermissions, totalEndpoints, previewPermissions } = useMemo(() => {
    const permsMap = new Map<string, Permission>();
    let endpoints = 0;

    allRoles.forEach(role => {
      const rId = role.id || role.roleId;
      if (rId && selectedRoleIds.has(rId)) {
        role.permissions?.forEach(p => {
          const pId = p.id || p.permissionId;
          if (pId && !permsMap.has(pId)) {
            permsMap.set(pId, p);
            endpoints += p.apis?.length || p.apiCount || 0;
          }
        });
      }
    });

    const allPerms = Array.from(permsMap.values());
    return {
      totalPermissions: allPerms.length,
      totalEndpoints: endpoints,
      previewPermissions: allPerms.slice(0, 3)
    };
  }, [selectedRoleIds, allRoles]);

  // Derived for Tab B: Permissions list of the user
  const userInheritedPermissions = useMemo(() => {
    const permsMap = new Map<string, Permission>();
    if (modalUser) {
      // Ensure we are iterating over the roles of the user currently in the modal
      const userRoles = users.find(u => u.id === modalUser.id)?.roles || modalUser.roles || [];
      
      userRoles.forEach(role => {
        // Find the full role object from the master 'allRoles' list
        const fullRole = allRoles.find(r => 
          r.id === (role.id || role.roleId) || r.code === role.code
        );

        if (fullRole && fullRole.permissions) {
          fullRole.permissions.forEach(p => {
            const pId = p.id || p.permissionId;
            if (pId && !permsMap.has(pId)) {
              permsMap.set(pId, p);
            }
          });
        }
      });
    }
    const list = Array.from(permsMap.values());
    if (permMethodFilter === 'ALL') return list;
    return list.filter(p => p.apis?.some(api => api.method === permMethodFilter));
  }, [modalUser, users, allRoles, permMethodFilter]);

  const filteredRoles = allRoles.filter(r => 
    r.name.toLowerCase().includes(roleSearch.toLowerCase()) || 
    r.code.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const handleSaveUsers = async (userData: any) => {
    try {
      setLoading(true);
      let userId: string | null = null;
      const fullName = userData.fullName;

      if (userData.isStudent) {
        const response: any = await request.post('/api/v1/students/admin', {
          fullName: userData.fullName,
          dateOfBirth: userData.dob,
          majorId: userData.majorId,
          trainingProgramId: userData.trainingProgramId,
          academicCohortId: userData.academicCohortId,
        });
        const responseData = response?.data || response;
        userId = responseData.userId || responseData.data?.userId;
      } else if (userData.isLecturer) {
        const response: any = await request.post('/api/v1/instructors/admin', {
          fullName: userData.fullName,
          dateOfBirth: userData.dob,
          departmentId: userData.departmentId,
        });
        const responseData = response?.data || response;
        userId = responseData.userId || responseData.data?.userId;
      } else {
        const response: any = await request.post('/api/v1/staffs/admin', {
          fullName: userData.fullName,
          dateOfBirth: userData.dob,
          divisionId: userData.divisionId,
        });
        const responseData = response?.data || response;
        userId = responseData.userId || responseData.data?.userId;
      }

      if (!userId) {
        throw new Error('Không nhận được User ID từ máy chủ.');
      }

      if (userData.roles && userData.roles.length > 0) {
        const roleIdsArray = userData.roles.map((sel: string) => {
          const match = allRoles.find(r => r.id === sel || r.roleId === sel || r.code === sel || r.name === sel);
          return match?.id || match?.roleId || sel;
        }).filter(Boolean);

        await userRoleApi.updateUserRoles(userId, roleIdsArray);
      }

      toast.success(`Đã tạo người dùng ${fullName} thành công!`);
      setIsAddUserModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Lỗi khi tạo user:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Không thể tạo người dùng mới';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo email, họ tên, hoặc 'role:STUDENT'..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition shadow-sm"
          >
            <UserPlus size={15} />
            <span className="hidden sm:inline">Thêm người dùng</span>
          </button>
          <button 
            onClick={() => fetchUsers()} 
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition shadow-sm"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-600' : ''} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm" role="grid">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                <th className="py-3 px-4 w-12">
                  <input 
                    type="checkbox" 
                    aria-label="Select all users"
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer w-4 h-4"
                    checked={users.length > 0 && selectedUserIds.size === users.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Người dùng</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Email</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Số Roles</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Tổng Permissions</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Trạng thái</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <UserTableSkeleton rows={6} />
                : users.length === 0
                ? (
                  <tr><td colSpan={7}>
                    <EmptyState
                      icon={<Users size={32} />}
                      title={searchDebounced ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
                      description={searchDebounced ? `Không có kết quả cho "${searchDebounced}"` : 'Hãy thay đổi bộ lọc hoặc thêm mới'}
                    />
                  </td></tr>
                )
                : users.map(user => {
                  const roleCount = user.roles?.length ?? 0;
                  
                  // Shared logic to calculate permission count
                  const permSet = new Set<string>();
                  user.roles.forEach(role => {
                    const fullRole = allRoles.find(r => (r.id || r.roleId) === (role.id || role.roleId) || r.code === role.code);
                    fullRole?.permissions?.forEach(p => permSet.add(p.id || p.permissionId || ''));
                  });
                  const permCount = permSet.size;

                  return (
                    <tr 
                      key={user.id} 
                      className={`border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer group ${selectedUserIds.has(user.id) ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 'hover:bg-gray-50/60 dark:hover:bg-gray-800/30'}`}
                      onClick={(e) => {
                        // Prevent row click if clicking checkbox or action menu
                        if ((e.target as HTMLElement).closest('input[type="checkbox"], button')) return;
                        openAssign(user);
                      }}
                    >
                      <td className="py-3 px-4">
                        <input 
                          type="checkbox" 
                          aria-label={`Select user ${user.fullName || user.email}`}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer w-4 h-4"
                          checked={selectedUserIds.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {(user.fullName || user.username || user.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.fullName || user.username || '—'}</p>
                            {user.username && user.fullName && <p className="text-[11px] text-gray-400">@{user.username}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{user.email || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                          {roleCount} roles
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (permCount/25)*100)}%` }}></div>
                          </div>
                          <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-400">{permCount}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                          user.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800'
                            : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive !== false ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ActionMenu>
                          <ActionMenuItem icon={<Settings2 size={14} />} label="Gán quyền / Xem chi tiết" onClick={() => openAssign(user)} />
                        </ActionMenu>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
        
        {/* Simple pagination footer (UI only for now) */}
        {!loading && users.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
            <span>Hiển thị {users.length} người dùng</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">Trước</button>
              <button className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isAddUserModalOpen} 
        onClose={() => setIsAddUserModalOpen(false)} 
        allRoles={allRoles}
        onSave={handleSaveUsers}
      />

      {/* Modal User Detail (XL) */}
      <Modal isOpen={!!modalUser} onClose={closeModal} className="max-w-7xl w-full mx-4 h-[90vh] flex flex-col">
        {modalUser && (
          <div className="flex flex-col h-full bg-gray-50/30 dark:bg-gray-900/20">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col gap-4 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                    {(modalUser.fullName || modalUser.username || modalUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                      {modalUser.fullName || modalUser.username || modalUser.email}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{modalUser.email}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition" aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              {/* Self-edit protection warning */}
              {modalUser.email === currentUserEmail && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-400 text-sm">
                  <AlertTriangle size={16} />
                  <span><strong>Cảnh báo:</strong> Bạn đang thao tác phân quyền trên <strong>chính tài khoản của mình</strong>. Hãy cẩn thận tránh tự khóa quyền truy cập!</span>
                </div>
              )}

              {/* Inner Pill Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setModalTab('roles')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    modalTab === 'roles'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <ShieldCheck size={16} /> Roles (Gán quyền)
                </button>
                <button
                  onClick={() => setModalTab('permissions')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    modalTab === 'permissions'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <Key size={16} /> Permissions chi tiết
                </button>
              </div>
            </div>

            {/* Modal Content Area */}
            <div className="flex-1 overflow-hidden relative">
              
              {/* TAB A: ROLES */}
              {modalTab === 'roles' && (
                <div className="absolute inset-0 flex flex-col md:flex-row gap-6 p-6 overflow-y-auto custom-scrollbar">
                  {/* Left: Role Selection Table */}
                  <div className="flex-1 space-y-4">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={roleSearch}
                        onChange={e => setRoleSearch(e.target.value)}
                        placeholder="Tìm role theo tên hoặc mã (Nhấn Ctrl+K)..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                      />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm" role="grid">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="py-2.5 px-4 w-12 font-medium text-gray-500">Chọn</th>
                            <th className="py-2.5 px-4 font-medium text-gray-500">Tên Role</th>
                            <th className="py-2.5 px-4 font-medium text-gray-500">Mô tả</th>
                            <th className="py-2.5 px-4 font-medium text-gray-500">Permissions</th>
                            <th className="py-2.5 px-4 font-medium text-gray-500 text-right">Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rolesLoading ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                Đang tải danh sách vai trò...
                              </td>
                            </tr>
                          ) : filteredRoles.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                Không tìm thấy Role phù hợp.
                              </td>
                            </tr>
                          ) : filteredRoles.map(role => {
                            const rId = role.id || role.roleId;
                            if (!rId) return null;
                            const isSelected = selectedRoleIds.has(rId);
                            
                            return (
                              <tr 
                                key={rId}
                                onClick={() => {
                                  const newSet = new Set(selectedRoleIds);
                                  if (newSet.has(rId)) newSet.delete(rId);
                                  else newSet.add(rId);
                                  setSelectedRoleIds(newSet);
                                }}
                                className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100/60' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                              >
                                <td className="py-3 px-4">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                                    isSelected
                                      ? 'bg-emerald-500 border-emerald-500'
                                      : 'border-gray-300 dark:border-gray-600'
                                  }`}>
                                    {isSelected && <Check size={11} className="text-white" />}
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                                  {role.name}
                                  <span className="block text-[11px] font-normal text-gray-400 mt-0.5">{role.code}</span>
                                </td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{role.description || '—'}</td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                    {role.permissionCount ?? (role.permissions?.length || 0)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right text-gray-500 text-xs">
                                  {role.userCount ?? 0}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Sticky Preview Panel */}
                  <div className="w-full md:w-80 flex-shrink-0">
                    <div className="sticky top-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Layers size={16} className="text-emerald-600" />
                        Preview Quyền hạn
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Tổng Permissions</p>
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{totalPermissions}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">API Endpoints</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalEndpoints}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quyền nổi bật sẽ nhận được:</p>
                        {previewPermissions.length > 0 ? (
                          <ul className="space-y-2">
                            {previewPermissions.map(p => (
                              <li key={p.id || p.permissionId} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>{p.name}</span>
                              </li>
                            ))}
                            {totalPermissions > 3 && (
                              <li className="text-xs text-gray-400 pl-6 italic">+ {totalPermissions - 3} quyền khác...</li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
                            Chưa chọn role nào. User sẽ không có quyền truy cập.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB B: PERMISSIONS READ-ONLY */}
              {modalTab === 'permissions' && (
                <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map(method => (
                      <button
                        key={method}
                        onClick={() => setPermMethodFilter(method)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                          permMethodFilter === method
                            ? method === 'ALL' ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                    <div className="flex-1" />
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg transition">
                      <Download size={14} /> Xuất DS Quyền
                    </button>
                  </div>

                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex-1 shadow-sm">
                    {userInheritedPermissions.length === 0 ? (
                      <EmptyState
                        icon={<Key size={32} />}
                        title="Không có quyền nào"
                        description="User chưa được gán role nào có chứa API hoặc không khớp bộ lọc Method."
                      />
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="py-3 px-4 font-medium text-gray-500">Tên Quyền</th>
                            <th className="py-3 px-4 font-medium text-gray-500">Module</th>
                            <th className="py-3 px-4 font-medium text-gray-500">Method & APIs</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userInheritedPermissions.map(p => (
                            <tr key={p.id || p.permissionId} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-4">
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{p.name}</p>
                                {p.description && <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>}
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {p.module ? (
                                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">{p.module}</span>
                                ) : '—'}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col gap-1.5">
                                  {p.apis?.map(api => (
                                    <div key={api.id} className="flex items-center gap-2">
                                      <MethodBadge method={api.method} />
                                      <code className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800/50 px-1.5 py-0.5 rounded">
                                        {api.path}
                                      </code>
                                    </div>
                                  ))}
                                  {(!p.apis || p.apis.length === 0) && (
                                    <span className="text-xs text-gray-400 italic">Không có API</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Sticky bottom) */}
            {modalTab === 'roles' && (
              <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={() => setSelectedRoleIds(new Set())} 
                  className="px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                >
                  Reset (Xóa hết)
                </button>
                <div className="flex-1" />
                <button 
                  onClick={closeModal} 
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSaveRoles}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-emerald-600/20"
                >
                  {saving && <RefreshCw size={15} className="animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
