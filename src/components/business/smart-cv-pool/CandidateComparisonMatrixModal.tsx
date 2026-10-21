import React from 'react';
import {
  X,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  DollarSign,
  GraduationCap,
  MapPin,
  Send
} from 'lucide-react';
import { SmartCandidate, CandidateMatchResult, Company } from '../../../types';

interface CandidateComparisonMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: SmartCandidate[];
  matchResults: Map<string, CandidateMatchResult>;
  targetJobTitle?: string;
  maxBudget?: number;
  onOpenOutreach: (candidate: SmartCandidate) => void;
}

export const CandidateComparisonMatrixModal: React.FC<CandidateComparisonMatrixModalProps> = ({
  isOpen,
  onClose,
  candidates,
  matchResults,
  targetJobTitle,
  maxBudget,
  onOpenOutreach,
}) => {
  if (!isOpen || candidates.length === 0) return null;

  // Deduplicate candidates safely
  const uniqueCandidates = candidates.filter((c, idx, arr) => 
    Boolean(c && c.id && arr.findIndex(item => item.id === c.id) === idx)
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Namizədlərin Yan-Yana Müqayisə Matrisi ({uniqueCandidates.length} Namizəd)
              </h2>
              <p className="text-xs text-slate-500">
                «{targetJobTitle || 'Mütəxəssis'}» vəzifəsi üzrə açar meyarların qarşılaşdırılması
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table Container */}
        <div className="p-4 sm:p-6 overflow-x-auto max-h-[75vh]">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3.5 text-xs font-black text-slate-500 uppercase tracking-wider w-40">
                  Meyar / Parametr
                </th>
                {uniqueCandidates.map((c, idx) => {
                  const fit = matchResults.get(c.id);
                  const score = fit?.overallScore ?? 70;
                  return (
                    <th key={`${c.id}-${idx}`} className="p-3.5 text-xs font-black text-slate-900 w-64 align-top">
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-slate-900">{c.fullName}</div>
                        <div className="text-[11px] font-semibold text-slate-500 truncate">{c.jobTitle}</div>
                        <div className="pt-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${
                              score >= 85
                                ? 'bg-emerald-600 text-white'
                                : score >= 70
                                ? 'bg-blue-600 text-white'
                                : score >= 50
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-500 text-white'
                            }`}
                          >
                            {score}% Uyğunluq
                          </span>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Row 1: Fit Score Breakdown */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-700 bg-slate-50/70">
                  Uyğunluq Reytinqi
                </td>
                {uniqueCandidates.map((c, idx) => {
                  const fit = matchResults.get(c.id);
                  return (
                    <td key={`${c.id}-${idx}`} className="p-3.5">
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-800">
                          {fit?.tier === 'ideal'
                            ? '🌟 İdeal Namizəd'
                            : fit?.tier === 'high'
                            ? '👍 Yüksək Uyğunluq'
                            : fit?.tier === 'medium'
                            ? '⚠️ Qismən Uyğunluq'
                            : '❌ Aşağı Uyğunluq'}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-2">
                          {fit?.recommendation}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Experience */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-700 bg-slate-50/70">
                  İş Təcrübəsi
                </td>
                {uniqueCandidates.map((c, idx) => (
                  <td key={`${c.id}-${idx}`} className="p-3.5 font-bold text-slate-800">
                    <span className="text-sm font-black text-blue-600">{c.experienceYears} il</span>
                  </td>
                ))}
              </tr>

              {/* Row 3: Salary Expectation */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-700 bg-slate-50/70">
                  Gözlənilən Maaş
                </td>
                {uniqueCandidates.map((c, idx) => {
                  const isWithin = !maxBudget || c.expectedSalary <= maxBudget;
                  return (
                    <td key={`${c.id}-${idx}`} className="p-3.5">
                      <span className="text-sm font-black text-emerald-700">
                        {c.expectedSalary} AZN
                      </span>
                      {maxBudget && (
                        <div className="text-[10px] mt-0.5">
                          {isWithin ? (
                            <span className="text-emerald-600 font-bold">✓ Büdcə daxilində</span>
                          ) : (
                            <span className="text-rose-600 font-bold">
                              +{c.expectedSalary - maxBudget} AZN artıq
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: Matched Skills */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-700 bg-slate-50/70">
                  Uyğunlaşan Bacarıqlar
                </td>
                {uniqueCandidates.map((c, idx) => {
                  const fit = matchResults.get(c.id);
                  const matched = fit?.matchedSkills || [];
                  return (
                    <td key={`${c.id}-${idx}`} className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {matched.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic">Uyğunluq tapılmadı</span>
                        ) : (
                          matched.map((s, sIdx) => (
                            <span
                              key={`${s}-${sIdx}`}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800"
                            >
                              ✓ {s}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 5: Missing Skills */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-700 bg-slate-50/70">
                  Çatışmayan Bacarıqlar
                </td>
                {uniqueCandidates.map((c, idx) => {
                  const fit = matchResults.get(c.id);
                  const missing = fit?.missingSkills || [];
                  return (
                    <td key={`${c.id}-${idx}`} className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {missing.length === 0 ? (
                          <span className="text-[10px] text-emerald-600 font-bold">Bütün tələblər mövcuddur ✓</span>
                        ) : (
                          missing.map((s, sIdx) => (
                            <span
                              key={`${s}-${sIdx}`}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              ✗ {s}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 6: Education */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-700 bg-slate-50/70">
                  Təhsil Səviyyəsi
                </td>
                {uniqueCandidates.map((c, idx) => (
                  <td key={`${c.id}-${idx}`} className="p-3.5 text-slate-700 font-medium">
                    {c.educationLevel}
                    {c.educationDetails && <span className="block text-[10px] text-slate-400">{c.educationDetails}</span>}
                  </td>
                ))}
              </tr>

              {/* Row 7: Location */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-700 bg-slate-50/70">
                  Şəhər / Lokasiya
                </td>
                {uniqueCandidates.map((c, idx) => (
                  <td key={`${c.id}-${idx}`} className="p-3.5 text-slate-700 font-medium">
                    {c.location}
                  </td>
                ))}
              </tr>

              {/* Row 8: Pipeline Status */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-700 bg-slate-50/70">
                  Hazırkı Status
                </td>
                {uniqueCandidates.map((c, idx) => (
                  <td key={`${c.id}-${idx}`} className="p-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                      {c.pipelineStage}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 9: Actions */}
              <tr className="bg-slate-50/70">
                <td className="p-3.5 font-bold text-slate-700">
                  Əməliyyat
                </td>
                {uniqueCandidates.map((c, idx) => (
                  <td key={`${c.id}-${idx}`} className="p-3.5">
                    <button
                      type="button"
                      onClick={() => onOpenOutreach(c)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dəvət Göndər</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-200 transition-colors shadow-2xs"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
