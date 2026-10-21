import React from 'react';
import { Application, JobOffer } from '../../types';
import { 
  X, 
  Sparkles, 
  User, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  Send, 
  FileText, 
  Check, 
  Minus,
  Download
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { ModalPortal } from '../common/ModalPortal';

interface CandidateComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Application[];
  offers: JobOffer[];
  onOpenApplicantDetail: (app: Application) => void;
  onOpenInterviewModal: (app: Application) => void;
  onOpenOfferModal: (app: Application) => void;
}

export const CandidateComparatorModal: React.FC<CandidateComparatorModalProps> = ({
  isOpen,
  onClose,
  candidates,
  offers,
  onOpenApplicantDetail,
  onOpenInterviewModal,
  onOpenOfferModal,
}) => {
  if (!isOpen || candidates.length === 0) return null;

  // Deduplicate candidates safely
  const uniqueCandidates = candidates.filter((cand, idx, arr) =>
    Boolean(cand && cand.id && arr.findIndex((item) => item.id === cand.id) === idx)
  );

  return (
    <ModalPortal>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white text-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Namizədləri Yan-yana Müqayisə Et</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {candidates.length} Namizəd
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Seçilmiş namizədlərin ixtisas, təcrübə, bacarıq və uyğunluq göstəricilərinin müqayisəli təhlili
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Content Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">
                    Meyar / Göstərici
                  </th>
                  {uniqueCandidates.map((cand, idx) => {
                    const offer = offers.find(
                      (o) => o.applicationId === cand.id || o.candidateEmail === cand.candidateEmail
                    );

                    return (
                      <th
                        key={`${cand.id}-${idx}`}
                        className="p-4 bg-slate-50/80 border-b border-l border-slate-200 text-slate-900"
                        style={{ width: `${75 / uniqueCandidates.length}%` }}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{cand.candidateName}</h4>
                            {cand.matchScore !== undefined && (
                              <span
                                className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                                  cand.matchScore >= 80
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : cand.matchScore >= 60
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {cand.matchScore}% Uyğunluq
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-blue-700 font-semibold">{cand.vacancyTitle}</p>
                          <p className="text-[11px] text-slate-500">{cand.candidateEmail}</p>
                          {offer && (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Offer: {offer.status}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {/* 1. Müraciət Statusu */}
                <tr>
                  <td className="p-3.5 bg-slate-50 font-bold text-slate-700">Müraciət Statusu</td>
                  {uniqueCandidates.map((cand, idx) => (
                    <td key={`${cand.id}-${idx}`} className="p-3.5 border-l border-slate-200 font-semibold">
                      <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {cand.status || 'Gözləyir'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 2. Müraciət Tarixi */}
                <tr>
                  <td className="p-3.5 bg-slate-50 font-bold text-slate-700">Müraciət Tarixi</td>
                  {uniqueCandidates.map((cand, idx) => (
                    <td key={`${cand.id}-${idx}`} className="p-3.5 border-l border-slate-200 text-slate-600">
                      {cand.appliedDate || 'Qeyd olunmayıb'}
                    </td>
                  ))}
                </tr>

                {/* 3. Təcrübə və Bacarıqlar */}
                <tr>
                  <td className="p-3.5 bg-slate-50 font-bold text-slate-700">
                    <div>Bacarıqlar</div>
                    <span className="text-[10px] font-normal text-slate-500">CV-də qeyd edilmiş bacarıqlar</span>
                  </td>
                  {uniqueCandidates.map((cand, idx) => {
                    const skills = cand.cvData?.skills || [];
                    return (
                      <td key={`${cand.id}-${idx}`} className="p-3.5 border-l border-slate-200 align-top">
                        {skills.length === 0 ? (
                          <span className="text-slate-400 italic">Bacarıqlar spesifik göstərilməyib</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {skills.slice(0, 8).map((skill, sIdx) => {
                              const skillName = typeof skill === 'string' ? skill : skill.name;
                              return (
                                <span
                                  key={`${skillName}-${sIdx}`}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                                >
                                  {skillName}
                                </span>
                              );
                            })}
                            {skills.length > 8 && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                +{skills.length - 8} digər
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 4. İş Təcrübəsi (İllər və Vəzifələr) */}
                <tr>
                  <td className="p-3.5 bg-slate-50 font-bold text-slate-700">İş Təcrübəsi Xülasəsi</td>
                  {uniqueCandidates.map((cand, idx) => {
                    const exps = cand.cvData?.experiences || [];
                    return (
                      <td key={`${cand.id}-${idx}`} className="p-3.5 border-l border-slate-200 align-top space-y-1.5">
                        {exps.length === 0 ? (
                          <span className="text-slate-400 italic">Təcrübə göstərilməyib</span>
                        ) : (
                          exps.slice(0, 2).map((exp, eIdx) => (
                            <div key={`${exp.position}-${eIdx}`} className="bg-slate-50 p-2 rounded border border-slate-100">
                              <div className="font-bold text-slate-900">{exp.position}</div>
                              <div className="text-[11px] text-slate-600">
                                {exp.company} • {exp.startDate || ''} {exp.startDate ? '-' : ''} {exp.current ? 'Davam edir' : (exp.endDate || '')}
                              </div>
                            </div>
                          ))
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 5. Təhsil */}
                <tr>
                  <td className="p-3.5 bg-slate-50 font-bold text-slate-700">Təhsil Səviyyəsi</td>
                  {uniqueCandidates.map((cand, idx) => {
                    const edus = cand.cvData?.education || [];
                    return (
                      <td key={`${cand.id}-${idx}`} className="p-3.5 border-l border-slate-200 align-top">
                        {edus.length === 0 ? (
                          <span className="text-slate-400 italic">Göstərilməyib</span>
                        ) : (
                          edus.map((edu, eduIdx) => (
                            <div key={`${edu.institution}-${eduIdx}`} className="text-slate-700">
                              <span className="font-semibold">{edu.degree || edu.fieldOfStudy}</span>
                              <span className="block text-slate-500 text-[11px]">
                                {edu.institution} ({edu.startDate || ''} - {edu.current ? 'Davam edir' : (edu.endDate || '')})
                              </span>
                            </div>
                          ))
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 6. Müşayiət Məktubu (Cover Note) */}
                <tr>
                  <td className="p-3.5 bg-slate-50 font-bold text-slate-700">Müraciət Qeydi (Cover Note)</td>
                  {uniqueCandidates.map((cand, idx) => (
                    <td key={`${cand.id}-${idx}`} className="p-3.5 border-l border-slate-200 text-slate-600 italic">
                      {cand.coverNote ? `"${cand.coverNote}"` : <span className="text-slate-400 not-italic">Qeyd yoxdur</span>}
                    </td>
                  ))}
                </tr>

                {/* 7. Əməliyyat Düymələri */}
                <tr className="bg-slate-50/50">
                  <td className="p-3.5 bg-slate-100 font-bold text-slate-800">Qərar və Əməliyyat</td>
                  {uniqueCandidates.map((cand, idx) => (
                    <td key={`${cand.id}-${idx}`} className="p-3.5 border-l border-slate-200">
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenInterviewModal(cand);
                          }}
                          className="w-full py-1.5 px-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Müsahibə Təyin Et</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onOpenOfferModal(cand);
                          }}
                          className="w-full py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>İş Təklifi (Offer) Hazırla</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onOpenApplicantDetail(cand);
                          }}
                          className="w-full py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>CV-ni Ətraflı Aç</span>
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <ModalBottomLogo tagline="Jobia.az Namizəd Müqayisə & Analiz Sistemi" size="xs" variant="slate" />
          <span className="text-xs text-slate-500 font-medium">Bütün göstəricilər AI tərəfindən hesablanmışdır</span>
        </div>
      </div>
    </div>
  </ModalPortal>
);
};
