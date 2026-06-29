'use client';

import React from 'react';
import { Input } from '@/features/education/components/ui/input';
import { Label } from '@/features/education/components/ui/label';
import { Lock } from 'lucide-react';

interface LockedFieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isLocked: boolean;
  lockMessage?: string;
  error?: string;
}

export const LockedFieldInput: React.FC<LockedFieldInputProps> = ({
  label,
  isLocked,
  lockMessage = 'Trường thông tin này không thể thay đổi sau khi tạo',
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <Label htmlFor={props.id} className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-slate-200">
          {label}
          {isLocked && (
            <span className="text-amber-500 hover:text-amber-600 transition-colors cursor-help group relative">
              <Lock className="h-3.5 w-3.5" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-52 p-2 text-xs text-white bg-slate-900 dark:bg-slate-800 rounded-md shadow-lg z-50 text-center font-normal leading-normal whitespace-normal transition-all duration-200">
                {lockMessage}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></span>
              </span>
            </span>
          )}
        </Label>
      )}
      <div className="relative">
        <Input
          {...props}
          disabled={isLocked || props.disabled}
          className={`${className} ${
            isLocked
              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 pr-10 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium'
              : ''
          }`}
        />
        {isLocked && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1 font-medium">{error}</p>}
    </div>
  );
};

export default LockedFieldInput;
