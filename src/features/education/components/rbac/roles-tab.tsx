import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Key,
  Plus,
  Search,
  Pencil,
  Trash2,
  Settings2,
  RefreshCw,
  Check,
  AlertTriangle,
  UploadCloud,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/features/education/components/ui/modal';
import { ExcelImportModal } from './excel-import-modal';
import { roleApi, permissionApi } from '@/features/education/api/rbac';
import type { Role, Permission, CreateRoleDto, UpdateRoleDto } from '@/features/education/types/rbac';
import { SkeletonRow, EmptyState, ActionMenu, ActionMenuItem } from './shared';

type RoleModalMode = 'create' | 'edit' | 'permissions' | 'delete';

export function RolesTab({ onNavigateToUsers }: { onNavigateToUsers?: (roleCode: string) => void }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [modal, setModal] = useState<{ mode: RoleModalMode; role?: Role } | null>(null);
  const [form, setForm] = useState<CreateRoleDto & UpdateRoleDto>({ code: '', name: '', description: '' });
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [permSearch, setPermSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes]: any = await Promise.all([
        roleApi.getAll(),
        permissionApi.getAll(),
      ]);
      setRoles(Array.isArray(rolesRes?.data) ? rolesRes.data : Array.isArray(rolesRes) ? rolesRes : []);
      setAllPermissions(Array.isArray(permsRes?.data) ? permsRes.data : Array.isArray(permsRes) ? permsRes : []);
    } catch {
      toast.error('Không thể tải danh sách vai trò');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setForm({ code: '', name: '', description: '' });
    setModal({ mode: 'create' });
  };

  const openEdit = (role: Role) => {
    setForm({ code: role.code || '', name: role.name, description: role.description || '' });
    setModal({ mode: 'edit', role });
  };

  const openPermissions = async (role: Role) => {
    setPermSearch('');
    setModal({ mode: 'permissions', role });
    try {
      const roleId = role.id || role.roleId;
      if (!roleId) return;
      const res: any = await roleApi.getPermissions(roleId);
      const perms: Permission[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setSelectedPermIds(perms.map((p: Permission) => p.id || p.permissionId!).filter(Boolean));
    } catch {
      setSelectedPermIds(role.permissions?.map(p => p.id || p.permissionId!).filter(Boolean) || []);
    }
  };

  const openDelete = (role: Role) => setModal({ mode: 'delete', role });

  const closeModal = () => setModal(null);

  const handleSaveRole = async () => {
    if (!form.code?.trim()) {
      toast.error('Mã vai trò không được để trống');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Tên vai trò không được để trống');
      return;
    }
    setSaving(true);
    try {
      if (modal?.mode === 'create') {
        await roleApi.create(form as CreateRoleDto);
        toast.success('Tạo vai trò thành công');
      } else if (modal?.mode === 'edit' && modal.role) {
        const roleId = modal.role.id || modal.role.roleId;
        if (roleId) await roleApi.update(roleId, form);
        toast.success('Cập nhật vai trò thành công');
      }
      closeModal();
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!modal?.role) return;
    const roleId = modal.role.id || modal.role.roleId;
    if (!roleId) return;
    setSaving(true);
    try {
      await roleApi.updatePermissions(roleId, selectedPermIds);
      toast.success('Cập nhật quyền hạn thành công');
      closeModal();
      await fetchData();
    } catch {
      toast.error('Cập nhật quyền hạn thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!modal?.role) return;
    const roleId = modal.role.id || modal.role.roleId;
    if (!roleId) return;
    setSaving(true);
    try {
      await roleApi.delete(roleId);
      toast.success(`Đã xóa vai trò "${modal.role.name}"`);
      closeModal();
      await fetchData();
    } catch {
      toast.error('Xóa vai trò thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleImportExcel = async (data: any[]) => {
    let success = 0;
    let failed = 0;
    for (const row of data) {
      try {
        const dto = {
          code: String(row.Code || row.code || '').trim().toUpperCase(),
          name: String(row.Name || row.name || '').trim(),
          description: String(row.Description || row.description || '').trim()
        };
        if (dto.code && dto.name) {
          await roleApi.create(dto);
          success++;
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
      }
    }
    
    if (success > 0) {
      toast.success(`Import thành công ${success} vai trò.`);
      fetchData();
    }
    if (failed > 0) {
      toast.warning(`Có ${failed} dòng bị lỗi hoặc thiếu dữ liệu.`);
    }
    setShowImport(false);
  };

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPerms = allPermissions.filter(p =>
    p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
    p.description?.toLowerCase().includes(permSearch.toLowerCase())
  );

  const togglePerm = (id: string) => {
    setSelectedPermIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm vai trò..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition shadow-sm">
            <UploadCloud size={15} /> Import Excel
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
            <Plus size={15} />
            Tạo vai trò
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên vai trò</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mô tả</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Người dùng</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số quyền</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                : filteredRoles.length === 0
                ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon={<ShieldCheck size={32} />}
                        title="Chưa có vai trò nào"
                        description="Tạo vai trò đầu tiên để bắt đầu quản lý phân quyền"
                        action={
                          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition">
                            <Plus size={14} /> Tạo vai trò mới
                          </button>
                        }
                      />
                    </td>
                  </tr>
                )
                : filteredRoles.map(role => (
                  <tr key={role.id || role.roleId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{role.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
                      <span className="block truncate">{role.description || '—'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onNavigateToUsers?.(role.code)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-700 transition"
                      >
                        <Users size={11} />
                        {role.userCount ?? 0} user
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                        {role.permissionCount ?? role.permissions?.length ?? 0} quyền
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ActionMenu>
                        <ActionMenuItem icon={<Pencil size={14} />} label="Chỉnh sửa" onClick={() => openEdit(role)} />
                        <ActionMenuItem icon={<Settings2 size={14} />} label="Quản lý quyền" onClick={() => openPermissions(role)} />
                        <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                        <ActionMenuItem icon={<Trash2 size={14} />} label="Xóa vai trò" onClick={() => openDelete(role)} danger />
                      </ActionMenu>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal Create / Edit ─── */}
      <Modal isOpen={modal?.mode === 'create' || modal?.mode === 'edit'} onClose={closeModal} className="max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                {modal?.mode === 'create' ? 'Tạo vai trò mới' : 'Chỉnh sửa vai trò'}
              </h2>
              <p className="text-xs text-gray-400">Điền thông tin vai trò bên dưới</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mã vai trò <span className="text-red-500">*</span>
              </label>
              <input
                value={form.code || ''}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="VD: ADMIN"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tên vai trò <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: Quản trị viên"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mô tả</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả ngắn về vai trò này..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 mt-6">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Hủy
            </button>
            <button
              onClick={handleSaveRole}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
            >
              {saving && <RefreshCw size={13} className="animate-spin" />}
              {modal?.mode === 'create' ? 'Tạo vai trò' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Modal Permissions ─── */}
      <Modal isOpen={modal?.mode === 'permissions'} onClose={closeModal} className="max-w-lg w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Key size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Quản lý quyền hạn</h2>
              <p className="text-xs text-gray-400">
                Vai trò: <span className="font-semibold text-emerald-600">{modal?.role?.name}</span>
                {' · '}Đã chọn {selectedPermIds.length} / {allPermissions.length} quyền
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={permSearch}
              onChange={e => setPermSearch(e.target.value)}
              placeholder="Tìm quyền hạn..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            />
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => setSelectedPermIds(allPermissions.map(p => p.id || p.permissionId!).filter(Boolean))} className="text-xs text-emerald-600 hover:underline">Chọn tất cả</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => setSelectedPermIds([])} className="text-xs text-gray-500 hover:underline">Bỏ chọn</button>
          </div>

          {/* Permission list */}
          <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {filteredPerms.map(perm => {
              const pId = perm.id || perm.permissionId;
              if (!pId) return null;
              return (
              <label
                key={pId}
                className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 cursor-pointer transition group"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                  selectedPermIds.includes(pId)
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedPermIds.includes(pId) && <Check size={11} className="text-white" />}
                </div>
                <input type="checkbox" className="sr-only" checked={selectedPermIds.includes(pId)} onChange={() => togglePerm(pId)} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{perm.name}</p>
                  {perm.description && <p className="text-xs text-gray-400 truncate">{perm.description}</p>}
                </div>
              </label>
            )})}
            {filteredPerms.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">Không tìm thấy quyền phù hợp</p>
            )}
          </div>

          <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">Hủy</button>
            <button
              onClick={handleSavePermissions}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
            >
              {saving && <RefreshCw size={13} className="animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── Modal Delete ─── */}
      <Modal isOpen={modal?.mode === 'delete'} onClose={closeModal} className="max-w-sm w-full mx-4">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Xóa vai trò?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Bạn sắp xóa vai trò <span className="font-semibold text-gray-800 dark:text-gray-200">"{modal?.role?.name}"</span>.
          </p>
          {(modal?.role?.userCount ?? 0) > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 mb-3">
              ⚠️ Vai trò này đang được gán cho {modal?.role?.userCount} người dùng.
            </p>
          )}
          <p className="text-xs text-gray-400 mb-6">Hành động này không thể hoàn tác.</p>
          <div className="flex justify-center gap-3">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition">Hủy</button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
            >
              {saving && <RefreshCw size={13} className="animate-spin" />}
              Xác nhận xóa
            </button>
          </div>
        </div>
      </Modal>

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImportExcel}
        title="Nhập danh sách Vai trò"
        expectedColumns={['Code', 'Name']}
      />
    </div>
  );
}
