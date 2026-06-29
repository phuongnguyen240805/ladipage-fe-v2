import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  Plus,
  ChevronRight,
  ChevronDown,
  Key,
  Unlink,
  Pencil,
  Trash2,
  Lock,
  RefreshCw,
  AlertTriangle,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/features/education/components/ui/modal';
import { ExcelImportModal } from './excel-import-modal';
import { menuApi, permissionApi } from '@/features/education/api/rbac';
import type { MenuItem as MenuItemType, Permission, CreateMenuDto, UpdateMenuDto } from '@/features/education/types/rbac';
import { EmptyState } from './shared';

const PREDEFINED_ICONS = ['📄', '📁', '📊', '👥', '📚', '🎓', '📅', '🏢', '⚙️', '🛡️', '🔧', '📈'];
const PREDEFINED_PATHS = [
  { label: '--- Không có đường dẫn (Menu nhóm) ---', value: '' },
  { label: 'Tổng quan (Dashboard)', value: '/education/dashboard/admin' },
  { label: 'Quản lý sinh viên', value: '/education/dashboard/admin/students' },
  { label: 'Quản lý giảng viên', value: '/education/dashboard/admin/lecturers' },
  { label: 'Quản lý khóa học', value: '/education/dashboard/admin/courses' },
  { label: 'Quản lý lớp học', value: '/education/dashboard/admin/course-classes' },
  { label: 'Quản lý lịch học', value: '/education/dashboard/admin/schedules' },
  { label: 'Quản lý phòng học', value: '/education/dashboard/admin/rooms' },
  { label: 'Phân quyền (RBAC)', value: '/education/dashboard/admin/rbac' },
  { label: '--- Đường dẫn tùy chỉnh (Tự nhập) ---', value: 'CUSTOM' }
];

export function MenusTab() {
  const [menus, setMenus] = useState<MenuItemType[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{ mode: 'create' | 'edit' | 'delete'; item?: MenuItemType; parentId?: string | null } | null>(null);
  const [form, setForm] = useState<CreateMenuDto>({ name: '', path: '', icon: '📄', orderIndex: 0, parentId: null, permissionId: null });
  const [saving, setSaving] = useState(false);
  const [isCustomPath, setIsCustomPath] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [menuRes, permRes]: any = await Promise.all([menuApi.getAll(), permissionApi.getAll()]);
      const menuList: MenuItemType[] = Array.isArray(menuRes?.data) ? menuRes.data : Array.isArray(menuRes) ? menuRes : [];
      setMenus(menuList);
      // Auto-expand top level
      setExpandedIds(new Set(menuList.filter(m => !m.parentId).map(m => m.id)));
      setAllPermissions(Array.isArray(permRes?.data) ? permRes.data : Array.isArray(permRes) ? permRes : []);
    } catch {
      toast.error('Không thể tải danh sách menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const buildTree = (items: MenuItemType[], parentId: string | null = null, visited = new Set<string>()): MenuItemType[] => {
    return items
      .filter(item => (item.parentId ?? null) === parentId)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map(item => {
        if (visited.has(item.id)) {
          return { ...item, children: [] };
        }

        const nextVisited = new Set(visited);
        nextVisited.add(item.id);

        return { ...item, children: buildTree(items, item.id, nextVisited) };
      });
  };

  const tree = buildTree(menus, null, new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreate = (parentId?: string | null) => {
    const siblingsCount = menus.filter(m => (m.parentId ?? null) === (parentId ?? null)).length;
    setForm({ name: '', path: '', icon: '📄', orderIndex: siblingsCount, parentId: parentId ?? null, permissionId: null });
    setIsCustomPath(false);
    setModal({ mode: 'create', parentId });
  };

  const openEdit = (item: MenuItemType) => {
    setForm({ name: item.name, path: item.path || '', icon: item.icon || '📄', orderIndex: item.orderIndex, parentId: item.parentId ?? null, permissionId: item.permissionId ?? null });
    setIsCustomPath(!PREDEFINED_PATHS.some(p => p.value === (item.path || '')));
    setModal({ mode: 'edit', item });
  };

  const openDelete = (item: MenuItemType) => setModal({ mode: 'delete', item });
  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Tên menu không được để trống'); return; }
    setSaving(true);
    try {
      if (modal?.mode === 'create') {
        await menuApi.create(form);
        toast.success('Tạo menu thành công');
      } else if (modal?.mode === 'edit' && modal.item) {
        await menuApi.update(modal.item.id, form as UpdateMenuDto);
        toast.success('Cập nhật menu thành công');
      }
      closeModal();
      await fetchData();
    } catch {
      toast.error('Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!modal?.item) return;
    setSaving(true);
    try {
      await menuApi.delete(modal.item.id);
      toast.success(`Đã xóa menu "${modal.item.name}"`);
      closeModal();
      await fetchData();
    } catch {
      toast.error('Xóa menu thất bại');
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
          name: String(row.Name || row.name || '').trim(),
          path: String(row.Path || row.path || '').trim(),
          icon: String(row.Icon || row.icon || '📄').trim(),
          orderIndex: Number(row.OrderIndex || row.orderIndex || 0),
          parentId: null,
          permissionId: null
        };
        if (dto.name) {
          await menuApi.create(dto);
          success++;
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
      }
    }
    
    if (success > 0) {
      toast.success(`Import thành công ${success} menu gốc.`);
      fetchData();
    }
    if (failed > 0) {
      toast.warning(`Có ${failed} dòng bị lỗi hoặc thiếu dữ liệu.`);
    }
    setShowImport(false);
  };

  const MenuNode = ({ item, depth }: { item: MenuItemType; depth: number }) => {
    const hasChildren = (item.children?.length ?? 0) > 0;
    const isExpanded = expandedIds.has(item.id);
    const linkedPerm = allPermissions.find(p => p.id === item.permissionId);

    return (
      <div>
        <div
          className={`flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition group ${depth > 0 ? 'ml-6' : ''}`}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          {/* Expand toggle */}
          <button
            onClick={() => hasChildren && toggleExpand(item.id)}
            className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${hasChildren ? 'text-gray-400 hover:text-gray-600' : 'text-transparent'}`}
          >
            {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3.5 h-3.5 rounded-sm border border-gray-200 dark:border-gray-700 block" />}
          </button>

          {/* Icon */}
          <span className="w-6 text-center text-base">{item.icon || '📄'}</span>

          {/* Name + path */}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
            {item.path && <span className="ml-2 text-xs text-gray-400 font-mono">{item.path}</span>}
          </div>

          {/* Permission badge */}
          {linkedPerm ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <Key size={9} /> {linkedPerm.name}
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-gray-400 border border-dashed border-gray-200 dark:border-gray-700">
              <Unlink size={9} /> Công khai
            </span>
          )}

          {/* Order */}
          <span className="text-xs text-gray-300 dark:text-gray-600 w-5 text-center">{item.orderIndex}</span>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
            <button onClick={() => openCreate(item.id)} className="p-1 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition" title="Thêm menu con">
              <Plus size={13} />
            </button>
            <button onClick={() => openEdit(item)} className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Chỉnh sửa">
              <Pencil size={13} />
            </button>
            <button onClick={() => openDelete(item)} className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Xóa">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {item.children!.map((child, index) => (
              <MenuNode key={child.id || `${item.id}-child-${index}`} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition shadow-sm">
          <UploadCloud size={15} /> Import Excel
        </button>
        <button onClick={() => openCreate(null)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition shadow-sm">
          <Plus size={15} /> Thêm menu gốc
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <span className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wider pl-7">Tên menu / Đường dẫn</span>
          <span className="hidden sm:block text-xs font-semibold text-gray-500 uppercase tracking-wider w-36 text-center">Permission</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-10 text-center">Thứ tự</span>
          <span className="w-24" />
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" style={{ marginLeft: `${(i % 2) * 20}px` }} />
            ))}
          </div>
        ) : tree.length === 0 ? (
          <EmptyState
            icon={<Menu size={32} />}
            title="Chưa có menu nào"
            description="Tạo menu gốc đầu tiên để cấu hình điều hướng"
            action={<button onClick={() => openCreate(null)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm rounded-xl hover:bg-emerald-700 transition"><Plus size={14} /> Thêm menu gốc</button>}
          />
        ) : (
          <div className="p-2 space-y-0.5">
            {tree.map((item, index) => (
              <MenuNode key={item.id || `root-${index}`} item={item} depth={0} />
            ))}
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      <Modal isOpen={modal?.mode === 'create' || modal?.mode === 'edit'} onClose={closeModal} className="max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <Menu size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                {modal?.mode === 'create' ? (modal.parentId ? 'Thêm menu con' : 'Thêm menu gốc') : 'Chỉnh sửa menu'}
              </h2>
              <p className="text-xs text-gray-400">Cấu hình thông tin menu điều hướng</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Icon</label>
                <select
                  value={form.icon || '📄'}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition appearance-none"
                >
                  {PREDEFINED_ICONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tên menu <span className="text-red-500">*</span></label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Quản lý sinh viên"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Đường dẫn (path)</label>
              {!isCustomPath ? (
                <select
                  value={PREDEFINED_PATHS.some(p => p.value === form.path) ? form.path : 'CUSTOM'}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'CUSTOM') {
                      setIsCustomPath(true);
                      setForm(f => ({ ...f, path: '' }));
                    } else {
                      setForm(f => ({ ...f, path: val }));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                >
                  {PREDEFINED_PATHS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={form.path}
                    onChange={e => setForm(f => ({ ...f, path: e.target.value }))}
                    placeholder="/education/dashboard/admin/tuy-chinh"
                    autoFocus
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                  <button onClick={() => setIsCustomPath(false)} className="px-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-sm">Hủy</button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Thứ tự hiển thị</label>
                <input
                  type="number"
                  disabled
                  value={form.orderIndex}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 text-sm focus:outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="flex items-center gap-1"><Lock size={12} /> Yêu cầu quyền</span>
                </label>
                <select
                  value={form.permissionId ?? ''}
                  onChange={e => setForm(f => ({ ...f, permissionId: e.target.value || null }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                >
                  <option value="">— Công khai —</option>
                  {allPermissions.map((p, permIndex) => (
                    <option key={p.id ?? p.permissionId ?? p.code ?? `perm-${permIndex}`} value={p.id ?? p.permissionId ?? ''}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2.5 mt-6">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition">Hủy</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition">
              {saving && <RefreshCw size={13} className="animate-spin" />}
              {modal?.mode === 'create' ? 'Tạo menu' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Delete */}
      <Modal isOpen={modal?.mode === 'delete'} onClose={closeModal} className="max-w-sm w-full mx-4">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Xóa menu?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Xóa menu <span className="font-semibold text-gray-800 dark:text-gray-200">"{modal?.item?.name}"</span>.
            {(modal?.item?.children?.length ?? 0) > 0 && (
              <span className="block mt-1 text-xs text-amber-600">⚠️ Menu này có {modal?.item?.children?.length} menu con sẽ bị xóa theo.</span>
            )}
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Hủy</button>
            <button onClick={handleDelete} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition">
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
        title="Nhập danh sách Menu gốc"
        expectedColumns={['Name', 'Path', 'Icon']}
      />
    </div>
  );
}
