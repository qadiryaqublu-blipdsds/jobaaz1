import React from 'react';
import { Target, Check, AlertTriangle } from 'lucide-react';
import { JobMatchDetails } from '../../types';

interface JobMatchCardProps {
  jobMatch: JobMatchDetails;
}

export const JobMatchCard: React.FC<JobMatchCardProps> = ({ jobMatch }) => {
  const percentage = jobMatch.matchPercentage || 0;
  const isHigh = percentage >= 75;
  const isMedium = percentage >= 50 && percentage < 75;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
              Vakansiya Uyğunluğu
            </span>
            <h3 className="text-lg font-bold text-slate-800">
              Vakansiya Tələbləri ilə Müqayisə
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Uyğunluq
            </span>
            <span
              className={`text-xl font-bold ${
                isHigh ? 'text-indigo-600' : isMedium ? 'text-indigo-600' : 'text-amber-600'
              }`}
            >
              {percentage}%
            </span>
          </div>
          <div className="w-14 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isHigh ? 'bg-indigo-600' : isMedium ? 'bg-indigo-500' : 'bg-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
        <span className="font-bold text-slate-800 block mb-1">Uyğunluq İcmalı:</span>
        {jobMatch.compatibilitySummary || 'Vakansiya tələbləri ilə uyğunluq nisbəti hesablandı.'}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Keywords */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            Uyğun Gələn Açar Sözlər ({(jobMatch.matchedKeywords || []).length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(jobMatch.matchedKeywords || []).length > 0 ? (
              jobMatch.matchedKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs"
                >
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">Uyğun gələn spesifik açar söz tapılmadı.</span>
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Çatışmayan Açar Sözlər ({(jobMatch.missingKeywords || []).length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(jobMatch.missingKeywords || []).length > 0 ? (
              jobMatch.missingKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs"
                >
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-600 font-medium">Bütün əsas tələblər CV-də əks olunub!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobMatchCard;
