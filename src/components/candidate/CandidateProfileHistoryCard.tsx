import React from 'react';
import {
  Briefcase,
  GraduationCap,
  Compass,
  Building2,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { CVAnalysisResult } from '../../types';

interface CandidateProfileHistoryCardProps {
  result: CVAnalysisResult;
}

export const CandidateProfileHistoryCard: React.FC<CandidateProfileHistoryCardProps> = ({ result }) => {
  const { experienceHistory = [], educationHistory = [], careerFit, detectedRole, seniorityLevel } = result;

  return (
    <div id="candidate-profile-history" className="space-y-6">
      {/* 1. Ümumi Təcrübə Sahəsi və Karyera İcmalı */}
      {careerFit && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 overflow-hidden relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Təcrübə Sahəsi & Profil
                  </span>
                  {seniorityLevel && (
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {seniorityLevel}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {careerFit.primaryDomain || detectedRole || 'İxtisaslaşmış Sahə'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-center min-w-[130px]">
                <span className="text-[11px] text-slate-500 font-medium block">Təxmini Təcrübə</span>
                <span className="text-base font-bold text-slate-900">{careerFit.totalExperienceEstimate || 'Müəyyən edilməyib'}</span>
              </div>
            </div>
          </div>

          {/* Hansı sahəyə və vəzifələrə uyğundur */}
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-800">
                  Hansı Sahələrə və Vəzifələrə Ən Çox Uyğundur?
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {careerFit.suitableRoles?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-bold text-slate-900">{item.role}</span>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md shrink-0">
                          {item.matchPercentage}% Uyğun
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tövsiyə olunan Sənayelər və Karyera İnkişaf Xətti */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">Tövsiyə Olunan Sənayelər (İdeal Sektorlar):</span>
                <div className="flex flex-wrap gap-1.5">
                  {careerFit.recommendedIndustries?.map((industry, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>

              {careerFit.growthTrajectory && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">Karyera İnkişaf Xətti & Potensial:</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {careerFit.growthTrajectory}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Hansı işlərdə işləyib (İş Tarixçəsi) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">
                İş Tarixçəsi
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Hansı İşlərdə və Şirkətlərdə İşləyib?
              </h3>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {experienceHistory.length > 0 ? `${experienceHistory.length} İş Yeri Qeydə Alınıb` : 'Məlumat Yoxdur'}
          </span>
        </div>

        {experienceHistory.length === 0 ? (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
            CV mətnində konkret iş yerləri və ya şirkətlər aşkar edilmədi. İş təcrübəsi bölməsinin əlavə olunması tövsiyə edilir.
          </div>
        ) : (
          <div className="space-y-4">
            {experienceHistory.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <h4 className="text-base font-bold text-slate-900">{exp.role}</h4>
                    <span className="text-slate-400 font-normal">@</span>
                    <span className="text-sm font-semibold text-indigo-600">{exp.company}</span>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {exp.domain && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-medium">
                        {exp.domain}
                      </span>
                    )}
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {exp.period}
                    </span>
                  </div>
                </div>

                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Əsas Fəaliyyət və Öhdəlikləri:
                    </span>
                    <ul className="space-y-1.5">
                      {exp.responsibilities.map((resp, rIdx) => (
                        <li key={rIdx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Təhsili hardadır (Universitet, Məktəb, İxtisas, Dərəcə) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
                Təhsil Məlumatları
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Təhsili Hardadır, Universitet, Məktəb, İxtisas və Dərəcəsi
              </h3>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {educationHistory.length > 0 ? `${educationHistory.length} Təhsil Pilləsi` : 'Qeyd Yoxdur'}
          </span>
        </div>

        {educationHistory.length === 0 ? (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
            CV mətnində rəsmi təhsil məlumatı (universitet, kollec və ya məktəb) qeyd edilməyib. ATS və rekruterlər üçün təhsil bölməsini əlavə etmək tövsiyə edilir.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {educationHistory.map((edu, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:border-emerald-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                      {edu.degree || 'Təhsil'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {edu.period}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    {edu.institution}
                  </h4>
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    İxtisas: <span className="text-indigo-600 font-bold">{edu.fieldOfStudy}</span>
                  </p>
                </div>

                {edu.details && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      {edu.details}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
