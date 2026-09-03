import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';

interface StrengthsWeaknessesCardProps {
  strengths?: string[];
  weaknesses?: string[];
}

export const StrengthsWeaknessesCard: React.FC<StrengthsWeaknessesCardProps> = ({
  strengths = [],
  weaknesses = [],
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Müsbət & Mənfi Cəhətlər
          </span>
          <h3 className="text-lg font-bold text-slate-800">
            Əsas Üstünlüklər və Riskli Məqamlar
          </h3>
        </div>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wide">
              Güclü Tərəflər ({strengths.length})
            </h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {strengths.length > 0 ? (
              strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">Müsbət qeyd tapılmadı.</li>
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wide">
              Çatışmazlıqlar və Boşluqlar ({weaknesses.length})
            </h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {weaknesses.length > 0 ? (
              weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))
            ) : (
              <li className="text-emerald-700 italic font-medium">Ciddi çatışmazlıq aşkar edilmədi!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StrengthsWeaknessesCard;
