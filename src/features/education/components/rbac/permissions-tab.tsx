import React, { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Globe,
  AlertTriangle,
  UploadCloud,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/features/education/components/ui/modal';
import { ExcelImportModal } from './excel-import-modal';
import { permissionApi } from '@/features/education/api/rbac';
import type { Permission, RbacApi, CreatePermissionDto, CreateRbacApiDto, HttpMethod } from '@/features/education/types/rbac';
import { SkeletonRow, EmptyState, ActionMenu, ActionMenuItem, MethodBadge, METHODS } from './shared';

type PermModalMode = 'create' | 'edit' | 'apis' | 'delete';

export function PermissionsTab() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ mode: PermModalMode; perm?: Permission } | null>(null);
  const [form, setForm] = useState<CreatePermissionDto & { code: string; name: string; module: string }>({ code: '', name: '', description: '', module: '' });
  const [apis, setApis] = useState<RbacApi[]>([]);
  const [apiForm, setApiForm] = useState<CreateRbacApiDto>({ method: 'GET', path: '' });
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await permissionApi.getAll();
      setPermissions(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      toast.error('Không thể tải danh sách quyền hạn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setForm({ code: '', name: '', description: '', module: '' });
    setModal({ mode: 'create' });
  };

  const openEdit = (perm: Permission) => {
    setForm({ code: perm.code || '', name: perm.name, description: perm.description || '', module: perm.module || '' });
    setModal({ mode: 'edit', perm });
  };

  const openApis = async (perm: Permission) => {
    const pId = perm.id || perm.permissionId;
    setApis([]);
    setApiForm({ method: 'GET', path: '' });
    setModal({ mode: 'apis', perm });
    if (!pId) return;
    try {
      const apiList: any = await permissionApi.getApis(pId);
      setApis(Array.isArray(apiList) ? apiList : []);
    } catch {
      toast.error('Không thể tải API endpoint của quyền');
    }
  };

  const openDelete = (perm: Permission) => setModal({ mode: 'delete', perm });
  const closeModal = () => setModal(null);

  const handleSavePerm = async () => {
    if (!form.code.trim()) { toast.error('Mã quyền không được để trống'); return; }
    if (!form.name.trim()) { toast.error('Tên quyền không được để trống'); return; }
    setSaving(true);
    try {
      if (modal?.mode === 'create') {
        await permissionApi.create(form);
        toast.success('Tạo quyền hạn thành công');
      } else if (modal?.mode === 'edit' && modal.perm) {
        const pId = modal.perm.id || modal.perm.permissionId;
        if (pId) await permissionApi.update(pId, form);
        toast.success('Cập nhật quyền hạn thành công');
      }
      closeModal();
      await fetchData();
    } catch {
      toast.error('Thao tác thất bại');
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
          module: String(row.Module || row.module || '').trim(),
          description: String(row.Description || row.description || '').trim()
        };
        if (dto.code && dto.name) {
          await permissionApi.create(dto);
          success++;
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
      }
    }
    
    if (success > 0) {
      toast.success(`Import thành công ${success} quyền hạn.`);
      fetchData();
    }
    if (failed > 0) {
      toast.warning(`Có ${failed} dòng bị lỗi hoặc thiếu dữ liệu.`);
    }
    setShowImport(false);
  };

  const handleAddApi = async () => {
    if (!apiForm.path.trim()) { toast.error('Đường dẫn API không được để trống'); return; }
    if (!modal?.perm) return;
    const pId = modal.perm.id || modal.perm.permissionId;
    if (!pId) return;
    setSaving(true);
    try {
      await permissionApi.addApi(pId, apiForm);
      const newApi: RbacApi = { id: Date.now().toString(), ...apiForm, permissionId: pId };
      setApis(prev => [...prev, newApi]);
      setApiForm({ method: 'GET', path: '' });
      toast.success('Thêm API endpoint thành công');
    } catch {
      toast.error('Thêm API thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveApi = async (api: RbacApi) => {
    if (!modal?.perm) return;
    const pId = modal.perm.id || modal.perm.permissionId;
    if (!pId) return;
    try {
      await permissionApi.removeApi(pId, api.path, api.method);
      setApis(prev => prev.filter(a => a.id !== api.id));
      toast.success('Đã xóa API endpoint');
    } catch {
      toast.error('Xóa API thất bại');
    }
  };

  const handleDelete = async () => {
    if (!modal?.perm) return;
    const pId = modal.perm.id || modal.perm.permissionId;
    if (!pId) return;
    setSaving(true);
    try {
      await permissionApi.delete(pId);
      toast.success(`Đã xóa quyền "${modal.perm.name}"`);
      closeModal();
      await fetchData();
    } catch {
      toast.error('Xóa quyền hạn thất bại');
    } finally {
      setSaving(false);
    }
  };

  const filtered = permissions.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm quyền hạn..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition shadow-sm">
            <UploadCloud size={15} /> Import Excel
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition shadow-sm">
            <Plus size={15} /> Tạo quyền hạn
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã quyền</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên quyền</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mô tả</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">API Endpoints</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
                : filtered.length === 0
                ? (
                  <tr><td colSpan={5}>
                    <EmptyState
                      icon={<Key size={32} />}
                      title="Chưa có quyền hạn nào"
                      description="Tạo quyền hạn để gán cho các vai trò"
                      action={<button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition"><Plus size={14} /> Tạo quyền hạn</button>}
                    />
                  </td></tr>
                )
                : filtered.map(perm => {
                  const pId = perm.id || perm.permissionId;
                  return (
                  <tr key={pId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <Key size={14} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-900/10 px-2 py-1 rounded">{perm.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{perm.name}</span>
                      {perm.module && <span className="ml-2 text-xs text-gray-400">({perm.module})</span>}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 max-w-[220px]">
                      <span className="block truncate">{perm.description || '—'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openApis(perm)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-700 transition"
                      >
                        <Globe size={11} />
                        {perm.apiCount ?? perm.apis?.length ?? 0} endpoint
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ActionMenu>
                        <ActionMenuItem icon={<Pencil size={14} />} label="Chỉnh sửa" onClick={() => openEdit(perm)} />
                        <ActionMenuItem icon={<Globe size={14} />} label="Quản lý API" onClick={() => openApis(perm)} />
                        <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                        <ActionMenuItem icon={<Trash2 size={14} />} label="Xóa quyền" onClick={() => openDelete(perm)} danger />
                      </ActionMenu>
                    </td>
                  </tr>
                )})
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit Permission */}
      <Modal isOpen={modal?.mode === 'create' || modal?.mode === 'edit'} onClose={closeModal} className="max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <Key size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                {modal?.mode === 'create' ? 'Tạo quyền hạn mới' : 'Chỉnh sửa quyền hạn'}
              </h2>
              <p className="text-xs text-gray-400">Cấu hình thông tin quyền hạn</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mã quyền <span className="text-red-500">*</span></label>
              <input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="VD: READ_STUDENTS, MANAGE_COURSES..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tên hiển thị <span className="text-red-500">*</span></label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Xem sinh viên, Quản lý..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Module</label>
                <input
                  value={form.module}
                  onChange={e => setForm(f => ({ ...f, module: e.target.value }))}
                  placeholder="VD: Học vụ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mô tả</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả ngắn về quyền hạn này..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 mt-6">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition">Hủy</button>
            <button onClick={handleSavePerm} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition">
              {saving && <RefreshCw size={13} className="animate-spin" />}
              {modal?.mode === 'create' ? 'Tạo quyền' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Manage APIs */}
      <Modal isOpen={modal?.mode === 'apis'} onClose={closeModal} className="max-w-lg w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <Globe size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Quản lý API Endpoints</h2>
              <p className="text-xs text-gray-400">Quyền: <span className="font-semibold text-emerald-600">{modal?.perm?.name}</span></p>
            </div>
          </div>

          {/* Existing APIs */}
          <div className="max-h-[220px] overflow-y-auto space-y-2 mb-4 custom-scrollbar">
            {apis.length === 0
              ? <p className="text-center text-sm text-gray-400 py-4">Chưa có API endpoint nào</p>
              : apis.map(api => (
                <div key={api.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 group">
                  <MethodBadge method={api.method} />
                  <code className="flex-1 text-xs text-gray-700 dark:text-gray-300 font-mono truncate">{api.path}</code>
                  <button
                    onClick={() => handleRemoveApi(api)}
                    className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))
            }
          </div>

          {/* Add new API */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Thêm endpoint mới</p>
            <div className="flex gap-2">
              <select
                value={apiForm.method}
                onChange={e => setApiForm(f => ({ ...f, method: e.target.value as HttpMethod }))}
                className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
              >
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                value={apiForm.path}
                onChange={e => setApiForm(f => ({ ...f, path: e.target.value }))}
                placeholder="/api/v1/users/**"
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
              />
              <button
                onClick={handleAddApi}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition">Đóng</button>
          </div>
        </div>
      </Modal>

      {/* Modal Delete */}
      <Modal isOpen={modal?.mode === 'delete'} onClose={closeModal} className="max-w-sm w-full mx-4">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Xóa quyền hạn?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Bạn sắp xóa quyền <span className="font-semibold text-gray-800 dark:text-gray-200">"{modal?.perm?.name}"</span>. Hành động này không thể hoàn tác.
          </p>
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
        title="Nhập danh sách Quyền hạn"
        expectedColumns={['Module', 'Code', 'Name']}
      />
    </div>
  );
}
