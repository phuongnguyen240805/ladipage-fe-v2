'use client';

import React, { useEffect } from 'react';
import { Input } from '@/features/education/components/ui/input';
import { Label } from '@/features/education/components/ui/label';
import { Badge } from '@/features/education/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface CreditInputProps {
  credits: number;
  onChangeCredits: (credits: number) => void;
  selfStudyHours: number;
  onChangeSelfStudy: (hours: number) => void;
  error?: string;
}

export const CreditInput: React.FC<CreditInputProps> = ({
  credits,
  onChangeCredits,
  selfStudyHours,
  onChangeSelfStudy,
  error,
}) => {
  useEffect(() => {
    const calculatedHours = Number((credits * 2).toFixed(1));
    if (selfStudyHours !== calculatedHours) {
      onChangeSelfStudy(calculatedHours);
    }
  }, [credits, selfStudyHours, onChangeSelfStudy]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div>
        <Label htmlFor="credits" className="text-sm font-semibold text-slate-900 dark:text-slate-200">
          Số tín chỉ *
        </Label>
        <Input
          id="credits"
          type="number"
          min="0.5"
          max="20"
          step="0.5"
          value={credits || ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChangeCredits(isNaN(val) ? 0 : val);
          }}
          className="mt-1.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          placeholder="Ví dụ: 3.0"
        />
        {error && <p className="text-xs text-destructive mt-1 font-medium">{error}</p>}
      </div>

      <div>
        <Label htmlFor="selfStudyHours" className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-slate-200">
          Số giờ tự học
          <Badge className="bg-emerald-550/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-none font-semibold flex items-center gap-1 py-0 px-2 h-5 text-[10px] animate-pulse">
            <Sparkles className="h-2.5 w-2.5" />
            Tự động tính
          </Badge>
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="selfStudyHours"
            type="number"
            disabled
            value={selfStudyHours}
            className="bg-slate-100/50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-850/50 cursor-not-allowed font-medium pr-14"
          />
          <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 font-medium select-none">
            giờ
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreditInput;
