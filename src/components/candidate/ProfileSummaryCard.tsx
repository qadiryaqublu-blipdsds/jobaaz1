import React, { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';

interface ProfileSummaryCardProps {
  summary?: string;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({ summary }) => {
  const [copied, setCopied] = useState(false);

  const displaySummary =
    summary ||
    'Zəhmət olmasa təcrübə, açar texniki bacarıqlar və nailiyyətlərinizi əks etdirən 3-4 cümləlik peşəkar bio əlavə edin.';

  const handleCopy = () => {
    navigator.clipboard.writeText(displaySummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
              Peşəkar Təqdimat
            </span>
            <h3 className="text-lg font-bold text-slate-800">
              Tövsiyə Olunan Peşəkar Xülasə (Summary / Bio)
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-indigo-700" />
              <span>Kopyalandı!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mətni Kopyala</span>
            </>
          )}
        </button>
      </div>

      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
        <p className="text-sm font-normal text-slate-700 leading-relaxed font-sans italic">
          "{displaySummary}"
        </p>
      </div>
    </div>
  );
};

export default ProfileSummaryCard;
