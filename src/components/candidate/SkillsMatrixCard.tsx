import React from 'react';
import { Layers, PlusCircle, Check } from 'lucide-react';
import { SkillCategory } from '../../types';

interface SkillsMatrixCardProps {
  skillsFound?: SkillCategory[];
  missingRecommendedSkills?: string[];
}

export const SkillsMatrixCard: React.FC<SkillsMatrixCardProps> = ({
  skillsFound = [],
  missingRecommendedSkills = [],
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Səriştələr & Açar Sözlər
          </span>
          <h3 className="text-lg font-bold text-slate-800">
            Bacarıqlar Matrisi və Boşluq Təhlili
          </h3>
        </div>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* Identified skills */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          CV-də Aşkarlanan Bacarıqlar
        </h4>
        {skillsFound.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillsFound.map((group, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5"
              >
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  {group.category}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(group.skills || []).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-indigo-600" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
            Aşkarlanan xüsusi qrup bacarıqları yoxdur və ya ümumi siyahıdadır.
          </div>
        )}
      </div>

      {/* Missing or Recommended Skills */}
      {missingRecommendedSkills && missingRecommendedSkills.length > 0 && (
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Əlavə Edilməsi Tövsiyə Olunan Bacarıqlar
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Müasir bazar tələblərinə və ATS açar sözlərinə əsasən bu bacarıqlardan təcrübənizdə olanları CV-yə əlavə etmək tövsiyə olunur:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {missingRecommendedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-semibold shadow-2xs hover:border-indigo-400 transition-colors"
              >
                <span className="text-indigo-600 font-bold">+</span> {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsMatrixCard;
