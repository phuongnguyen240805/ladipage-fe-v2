"use client";

import { AdminResourcePage } from "@/features/education/components/admin/AdminResourcePage";
import { positionApi, divisionApi, type Position, type Division } from "@/features/education/api/admin-resources";
import { useEffect, useState } from "react";
import { Button } from '@/features/education/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/features/education/components/ui/dialog';
import { Label } from '@/features/education/components/ui/label';
import { Input } from '@/features/education/components/ui/input';

const STORAGE_KEY = 'positions_code_mappings';

export default function PositionsPage() {
  const [fieldOptions, setFieldOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [mappingsOpen, setMappingsOpen] = useState(false);
  const [mappingCode, setMappingCode] = useState('');
  const [mappingName, setMappingName] = useState('');
  const [savedMappings, setSavedMappings] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedMappings(JSON.parse(stored));
      } catch {
        setSavedMappings([]);
      }
    }
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const divisions = await divisionApi.getAll({ isActive: true });
        const divisionOpts = divisions.map((d: Division) => ({ value: d.divisionId || String((d as any).id || ''), label: d.name || d.code || '—' }));

        // Use saved mappings for code options; no hardcoded level options
        setFieldOptions({ divisionId: divisionOpts, code: savedMappings || [] });
      } catch (err) {
        // ignore - options are optional
      }
    };
    loadOptions();
  }, [savedMappings]);

  const saveMapping = () => {
    if (!mappingCode.trim()) return;
    const label = `${mappingCode} - ${mappingName || mappingCode}`;
    const next = [{ value: mappingCode, label }, ...savedMappings.filter(m => m.value !== mappingCode)];
    setSavedMappings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setMappingCode('');
    setMappingName('');
    setMappingsOpen(false);
  };

  const deleteMapping = (value: string) => {
    const next = savedMappings.filter(m => m.value !== value);
    setSavedMappings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button variant="outline" onClick={() => setMappingsOpen(true)}>Quản lý mã</Button>
      </div>

      <AdminResourcePage<Position>
        title="Chức vụ"
        description="Quản lý chức vụ, cấp bậc và phụ cấp theo bộ phận."
        api={positionApi}
        idKey="positionId"
        columns={[
          { key: "code", label: "Mã" },
          { key: "name", label: "Tên chức vụ" },
          { key: "level", label: "Cấp bậc" },
          { key: "allowance", label: "Phụ cấp" },
          { key: "divisionId", label: "Bộ phận", render: (row) => row.divisionId ? "Đã liên kết" : "—" },
          { key: "isActive", label: "Trạng thái" },
        ]}
        fields={[
          { key: "code", label: "Mã chức vụ", required: true },
          { key: "name", label: "Tên chức vụ", required: true },
          { key: "level", label: "Cấp bậc" },
          { key: "allowance", label: "Phụ cấp", type: "number" },
          { key: "divisionId", label: "Bộ phận" },
          { key: "description", label: "Mô tả", type: "textarea" },
          { key: "isActive", label: "Trạng thái", type: "boolean" },
        ]}
        fieldOptions={fieldOptions}
        initialForm={{ isActive: true, allowance: 0 }}
      />

      <Dialog open={mappingsOpen} onOpenChange={setMappingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quản lý mã chức vụ</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2">
            <div>
              <Label>Mã</Label>
              <Input value={mappingCode} onChange={(e) => setMappingCode(e.target.value)} placeholder="VD: NV" className="mt-1" />
            </div>
            <div>
              <Label>Tên</Label>
              <Input value={mappingName} onChange={(e) => setMappingName(e.target.value)} placeholder="VD: Nhân viên" className="mt-1" />
            </div>

            <div className="pt-2">
              <Label>Danh sách đã lưu</Label>
              <div className="mt-2 space-y-2">
                {savedMappings.length === 0 ? (
                  <div className="text-sm text-slate-500">Chưa có mapping.</div>
                ) : (
                  savedMappings.map((m) => (
                    <div key={m.value} className="flex items-center justify-between rounded border px-3 py-2">
                      <div>{m.label}</div>
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => deleteMapping(m.value)}>Xóa</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMappingsOpen(false)}>Đóng</Button>
            <Button onClick={saveMapping}>Lưu mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
