import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Modal } from '@/features/education/components/ui/modal';
import { toast } from 'sonner';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  title: string;
  expectedColumns: string[];
  sampleData?: any[];
}

export function ExcelImportModal({ isOpen, onClose, onImport, title, expectedColumns, sampleData }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const downloadTemplate = async () => {
    if (!sampleData || sampleData.length === 0) return;
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Import_Template.xlsx");
  };

  const processFile = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file Excel');
      return;
    }
    setLoading(true);
    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      if (json.length === 0) {
        toast.error('File Excel không có dữ liệu');
        setLoading(false);
        return;
      }

      // Check if all expected columns exist in the first row
      const firstRow = json[0] as object;
      const missingColumns = expectedColumns.filter(col => !(col in firstRow));
      if (missingColumns.length > 0) {
        toast.error(`File thiếu các cột bắt buộc: ${missingColumns.join(', ')}`);
        setLoading(false);
        return;
      }

      await onImport(json);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md w-full mx-4">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">{title}</h2>
              <p className="text-xs text-gray-400">Tải lên file .xlsx hoặc .xls</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 transition">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 flex gap-2.5 items-start">
            <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Cấu trúc file bắt buộc:</p>
              <p className="text-xs opacity-90 mb-2">File Excel của bạn phải chứa dòng tiêu đề (row 1) với các cột chính xác như sau: <strong className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded">{expectedColumns.join(', ')}</strong></p>
              {sampleData && (
                <button onClick={downloadTemplate} className="text-xs font-semibold text-blue-700 hover:underline">
                  &darr; Tải file mẫu (Template)
                </button>
              )}
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
              file ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center">
                <FileSpreadsheet size={32} className="text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-full px-4">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="mt-3 text-xs font-medium text-red-500 hover:underline"
                >
                  Xóa file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud size={32} className="text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Nhấn để chọn hoặc kéo thả file vào đây</p>
                <p className="text-xs text-gray-400 mt-1">Hỗ trợ Excel (.xlsx, .xls)</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6">
          <button onClick={handleClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition">Hủy</button>
          <button 
            onClick={processFile} 
            disabled={!file || loading} 
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-gray-400 text-white text-sm font-medium rounded-xl transition"
          >
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <UploadCloud size={15} />}
            Tiến hành Import
          </button>
        </div>
      </div>
    </Modal>
  );
}
