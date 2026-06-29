import React, { FC } from "react";

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput: FC<FileInputProps> = ({ className, onChange }) => {
  return (
    <input
      type="file"
      className={`focus:border-ring-brand-300 shadow-theme-xs focus:file:ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-slate-300 bg-transparent text-sm text-slate-600 transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-slate-200 file:bg-slate-50 file:py-3 file:pr-3 file:pl-3.5 file:text-sm file:text-slate-900 placeholder:text-slate-400 hover:file:bg-slate-50 focus:outline-hidden dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:text-white/90 dark:file:border-slate-700 dark:file:bg-white/[0.03] dark:file:text-slate-400 dark:placeholder:text-slate-400 ${className}`}
      onChange={onChange}
    />
  );
};

export default FileInput;
