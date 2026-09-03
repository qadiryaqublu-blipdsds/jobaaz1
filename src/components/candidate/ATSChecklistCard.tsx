import React from 'react';
import { CheckCircle2, XCircle, Info, ShieldCheck } from 'lucide-react';
import { ATSCheckList } from '../../types';

interface ATSChecklistCardProps {
  atsChecks?: ATSCheckList;
}

export const ATSChecklistCard: React.FC<ATSChecklistCardProps> = ({
  atsChecks = {
    hasContactInfo: true,
    hasSummary: true,
    hasClearSections: true,
    hasQuantifiableResults: true,
  },
}) => {
  const items = [
    {
      label: 'Əlaqə Məlumatları',
      description: 'Email, telefon nömrəsi, yerləşmə və profil linki tamdır',
      passed: atsChecks.hasContactInfo,
    },
    {
      label: 'Peşəkar Xülasə (Summary)',
      description: 'CV-nin əvvəlində namizədin səviyyəsini xarakterizə edən giriş bölməsi mövcuddur',
      passed: atsChecks.hasSummary,
    },
    {
      label: 'Standart Bölmə Başlıqları',
      description: 'ATS alqoritmlərinin tanıya biləcəyi aydın struktur (Təcrübə, Təhsil, Bacarıqlar)',
      passed: atsChecks.hasClearSections,
    },
    {
      label: 'Ölçülə Bilən Nəticələr (Metrikalar)',
      description: 'Rəqəmlər, faizlər, komanda ölçüsü və ya konkret qazanclar qeyd olunub',
      passed: atsChecks.hasQuantifiableResults,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Standartlar & Audit
          </span>
          <h3 className="text-lg font-bold text-slate-800">
            ATS və Format Standartları Yoxlanışı
          </h3>
        </div>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
              item.passed
                ? 'bg-slate-50 border-slate-200'
                : 'bg-rose-50/50 border-rose-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {item.passed ? (
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 block">
                {item.label}
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {atsChecks.atsReadabilityNotes && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 block mb-0.5">ATS Uyğunluq Müşahidəsi:</span>
            <span>{atsChecks.atsReadabilityNotes}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSChecklistCard;
