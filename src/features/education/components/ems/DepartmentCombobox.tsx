'use client';

import React, { useState, useEffect, useRef } from 'react';
import { departmentApi } from '@/features/education/api/department';
import { Check, ChevronsUpDown, X, Loader2, Search } from 'lucide-react';
import { Badge } from '@/features/education/components/ui/badge';
import { toast } from 'sonner';

interface Department {
  departmentId: string;
  code: string;
  name: string;
}

interface DepartmentComboboxProps {
  label?: string;
  placeholder?: string;
  // Single-select mode
  value?: string;
  onChange?: (value: string) => void;
  // Multi-select mode
  isMulti?: boolean;
  selectedValues?: string[];
  onChangeMultiple?: (values: string[]) => void;
  // Common
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const DepartmentCombobox: React.FC<DepartmentComboboxProps> = ({
  label,
  placeholder = 'Chọn khoa...',
  value,
  onChange,
  isMulti = false,
  selectedValues = [],
  onChangeMultiple,
  disabled = false,
  error,
  className = '',
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadDepartments() {
      try {
        setLoading(true);
        const res: any = await departmentApi.getAll();
        
        // Handle flexible response formats
        let list: Department[] = [];
        if (res && Array.isArray(res)) {
          list = res;
        } else if (res && res.data && Array.isArray(res.data)) {
          list = res.data;
        } else if (res && res.content && Array.isArray(res.content)) {
          list = res.content;
        } else if (res && res.data && res.data.content && Array.isArray(res.data.content)) {
          list = res.data.content;
        }

        setDepartments(list);
      } catch (err) {
        console.error('Failed to load departments', err);
        toast.error('Không thể tải danh sách khoa');
      } finally {
        setLoading(false);
      }
    }

    loadDepartments();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDepts = departments.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase()) ||
    dept.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (deptId: string) => {
    if (isMulti) {
      if (selectedValues.includes(deptId)) {
        const next = selectedValues.filter((v) => v !== deptId);
        onChangeMultiple?.(next);
      } else {
        const next = [...selectedValues, deptId];
        onChangeMultiple?.(next);
      }
    } else {
      onChange?.(deptId);
      setIsOpen(false);
    }
  };

  const handleClearSingle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  const handleRemoveBadge = (e: React.MouseEvent, deptId: string) => {
    e.stopPropagation();
    const next = selectedValues.filter((v) => v !== deptId);
    onChangeMultiple?.(next);
  };

  const getSelectedText = () => {
    if (isMulti) {
      return `${selectedValues.length} khoa đã chọn`;
    }
    const found = departments.find((d) => d.departmentId === value);
    return found ? `${found.name} (${found.code})` : placeholder;
  };

  return (
    <div className={`space-y-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">
          {label}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex min-h-11 items-center justify-between w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 cursor-pointer ${
          disabled
            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700/50'
            : 'hover:border-slate-350 dark:hover:border-slate-750'
        } ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}`}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1 pr-2 max-w-[90%]">
          {isMulti && selectedValues.length > 0 ? (
            selectedValues.map((valId) => {
              const dept = departments.find((d) => d.departmentId === valId);
              if (!dept) return null;
              return (
                <Badge
                  key={valId}
                  variant="secondary"
                  className="bg-slate-100 hover:bg-slate-250 text-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 gap-1 pl-2.5 pr-1.5 py-0.5 rounded-md font-semibold text-xs transition-all flex items-center"
                >
                  {dept.code}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveBadge(e, valId)}
                    className="hover:bg-slate-300 dark:hover:bg-slate-650 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })
          ) : (
            <span className={!value && !isMulti ? 'text-slate-400 dark:text-slate-550' : 'text-slate-900 dark:text-slate-200 font-medium'}>
              {getSelectedText()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          {!isMulti && value && !disabled && (
            <button
              type="button"
              onClick={handleClearSingle}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <ChevronsUpDown className="h-4 w-4" />
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute left-0 mt-1.5 z-55 w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 shadow-xl animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1.5">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm khoa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none text-sm outline-none focus:outline-none focus:ring-0 text-slate-850 dark:text-slate-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {filteredDepts.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400 font-medium">
                Không tìm thấy khoa nào
              </div>
            ) : (
              filteredDepts.map((dept) => {
                const isSelected = isMulti
                  ? selectedValues.includes(dept.departmentId)
                  : value === dept.departmentId;

                return (
                  <div
                    key={dept.departmentId}
                    onClick={() => handleSelect(dept.departmentId)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-850 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{dept.name}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{dept.code}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 stroke-[2.5px]" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive mt-1 font-medium">{error}</p>}
    </div>
  );
};

export default DepartmentCombobox;
