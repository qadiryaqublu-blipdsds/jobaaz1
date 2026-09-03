import React, { useState } from 'react';
import { Copy, Check, Sparkles, Wand2 } from 'lucide-react';
import { BulletImprovement } from '../../types';

interface BulletImprovementsCardProps {
  improvements?: BulletImprovement[];
}

export const BulletImprovementsCard: React.FC<BulletImprovementsCardProps> = ({
  improvements = [],
}) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Optimallaşdırma
          </span>
          <h3 className="text-lg font-bold text-slate-800">
            Təcrübə Cümlələrinin İslahı (STAR Metodu)
          </h3>
        </div>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <Wand2 className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-4">
        {improvements.length > 0 ? (
          improvements.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                {/* Original / Weak version */}
                <div className="p-3.5 rounded-xl bg-white border border-rose-200 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-rose-700 block">
                    Əvvəlki / Zəif Forma
                  </span>
                  <p className="text-xs text-slate-600 italic">
                    "{item.originalOrWeakness}"
                  </p>
                </div>

                {/* Improved version with Copy */}
                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-1.5 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-indigo-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Tövsiyə Olunan Güclü Forma
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.improved, idx)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-2xs cursor-pointer"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3 h-3 text-indigo-600" />
                          <span>Kopyalandı!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 pr-10 leading-relaxed">
                    • {item.improved}
                  </p>
                </div>
              </div>

              {/* Explanation / rationale */}
              <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-1.5 leading-relaxed">
                <span className="font-bold text-slate-800 shrink-0">Niyə daha yaxşıdır:</span>
                <span>{item.explanation}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
            Cümlə islahı tövsiyələri mövcud deyil.
          </div>
        )}
      </div>
    </div>
  );
};

export default BulletImprovementsCard;
