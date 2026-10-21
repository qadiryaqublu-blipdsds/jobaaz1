import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  Send,
  MessageSquare,
  Save,
  Tag,
  Clock,
  FileText,
  ShieldAlert,
  Globe2,
  HelpCircle,
  TrendingUp,
  Percent
} from 'lucide-react';
import { SmartCandidate, CandidateMatchResult, Company } from '../../../types';
import { PhysicalCVViewerModal } from './PhysicalCVViewerModal';

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: SmartCandidate;
  matchResult?: CandidateMatchResult;
  company: Company;
  targetJobTitle?: string;
  onUpdateCandidate: (updated: SmartCandidate) => void;
  onOpenOutreach: (candidate: SmartCandidate) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  isOpen,
  onClose,
  candidate,
  matchResult,
  company,
  targetJobTitle,
  onUpdateCandidate,
  onOpenOutreach,
}) => {
  const [notes, setNotes] = useState(candidate.notes || '');
  const [stage, setStage] = useState(candidate.pipelineStage);
  const [tagsInput, setTagsInput] = useState((candidate.tags || []).join(', '));
  const [isSaved, setIsSaved] = useState(false);
  const [isPhysicalCVModalOpen, setIsPhysicalCVModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleSaveNotes = () => {
    const updatedTags = tagsInput
      .split(/[,;]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const updated: SmartCandidate = {
      ...candidate,
      notes,
      pipelineStage: stage,
      tags: updatedTags,
      updatedAt: new Date().toISOString(),
    };

    onUpdateCandidate(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const score = matchResult?.overallScore ?? 75;

  let scoreBadgeColor = 'bg-emerald-500 text-white';
  let scoreTierLabel = 'Mükəmməl Uyğunluq';
  if (score >= 85) {
    scoreBadgeColor = 'bg-emerald-600 text-white';
    scoreTierLabel = 'Mükəmməl Uyğunluq (İdeal)';
  } else if (score >= 70) {
    scoreBadgeColor = 'bg-blue-600 text-white';
    scoreTierLabel = 'Yüksək Uyğunluq';
  } else if (score >= 50) {
    scoreBadgeColor = 'bg-amber-500 text-white';
    scoreTierLabel = 'Qismən Uyğunluq';
  } else {
    scoreBadgeColor = 'bg-rose-500 text-white';
    scoreTierLabel = 'Aşağı Uyğunluq';
  }

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-xs">
              {candidate.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {candidate.fullName}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs ${scoreBadgeColor}`}>
                  {score}% {scoreTierLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {candidate.jobTitle} • {candidate.experienceYears} il təcrübə • {candidate.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPhysicalCVModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Fiziki CV Sənədinə Fiziki Baxış (PDF / Sənəd)"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Fiziki CV Sənədinə Bax</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Quick Contact & Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Telefon</span>
              <a href={`tel:${candidate.phone}`} className="font-bold text-blue-600 hover:underline">
                {candidate.phone || 'Göstərilməyib'}
              </a>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">E-poçt</span>
              <a href={`mailto:${candidate.email}`} className="font-bold text-blue-600 hover:underline truncate block">
                {candidate.email}
              </a>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Gözlənilən Maaş</span>
              <span className="font-black text-emerald-700">{candidate.expectedSalary} AZN</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Təhsil</span>
              <span className="font-bold text-slate-700">{candidate.educationLevel}</span>
            </div>
          </div>

          {/* AI Role & Suitable Positions Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/50 border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Vəzifə Təyini & Uyğunluq Rəyi</span>
              </div>
              {candidate.aiAnalyzed && (
                <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full">
                  Gemini AI ilə Doğrulandı
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-blue-100">
                <span className="text-[10px] font-black text-slate-400 uppercase block">
                  CV-dəki Əsas Vəzifəsi
                </span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">
                  {candidate.jobTitle}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Staj: {candidate.experienceYears} il • Məkan: {candidate.location}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-100">
                <span className="text-[10px] font-black text-slate-400 uppercase block">
                  Hansı Vəzifələrə Uyğundur
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(candidate.suitablePositions && candidate.suitablePositions.length > 0
                    ? candidate.suitablePositions
                    : [candidate.jobTitle]
                  ).map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {candidate.bestMatchingVacancyTitle && (
              <div className="p-3 bg-white rounded-xl border border-indigo-200 text-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-indigo-500 uppercase block">
                    Şirkət Vakansiyası ilə Ən Yaxşı Uyğunluq
                  </span>
                  <span className="font-black text-slate-900 truncate block">
                    🎯 {candidate.bestMatchingVacancyTitle}
                  </span>
                  {candidate.matchRationale && (
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      {candidate.matchRationale}
                    </span>
                  )}
                </div>
                {candidate.bestMatchScore && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shrink-0 shadow-2xs">
                    {candidate.bestMatchScore}% Uyğundur
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Vəzifəyə Uyğunluq Skorinq Kartı */}
          {matchResult && (
            <div className="border border-blue-200 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 shadow-2xs space-y-4">
              {/* Knockout Warning Banner if Disqualified */}
              {matchResult.knockoutResult?.disqualified && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 flex items-start gap-3 text-rose-900 text-xs animate-pulse">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-rose-800 uppercase block tracking-wider">
                      Məcburi Meyar Kənarlaşması (Knockout Rule)
                    </span>
                    <span className="font-bold text-rose-700 block mt-0.5">
                      {matchResult.knockoutResult.failedCriteria.join(' • ')}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                    «{targetJobTitle || candidate.jobTitle}» Vəzifəsi üzrə ATS Skorinq Təhlili
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {matchResult.percentileRank && (
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Top %{matchResult.percentileRank}</span>
                    </span>
                  )}
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-lg shadow-2xs text-white ${
                      matchResult.overallScore >= 85
                        ? 'bg-emerald-600'
                        : matchResult.overallScore >= 70
                        ? 'bg-blue-600'
                        : matchResult.overallScore >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                  >
                    Ümumi: {matchResult.overallScore}% Uyğunluq
                  </span>
                </div>
              </div>

              {/* 7-Factor International Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* 1. Skills */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>1. Əsas Bacarıqlar:</span>
                    <span className="text-blue-600">{matchResult.breakdown.skillsScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${matchResult.breakdown.skillsScore}%` }}
                    />
                  </div>
                </div>

                {/* 2. Role match */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>2. Vəzifə Uyğunluğu:</span>
                    <span className="text-indigo-600">{matchResult.breakdown.roleScore ?? 85}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${matchResult.breakdown.roleScore ?? 85}%` }}
                    />
                  </div>
                </div>

                {/* 3. Experience */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>3. İş Təcrübəsi (İllər):</span>
                    <span className="text-emerald-600">{matchResult.breakdown.expScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${matchResult.breakdown.expScore}%` }}
                    />
                  </div>
                </div>

                {/* 4. Salary */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>4. Maaş Büdcəsi:</span>
                    <span className="text-amber-600">{matchResult.breakdown.salaryScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${matchResult.breakdown.salaryScore}%` }}
                    />
                  </div>
                </div>

                {/* 5. Education */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>5. Təhsil Səviyyəsi:</span>
                    <span className="text-purple-600">{matchResult.breakdown.educationScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all"
                      style={{ width: `${matchResult.breakdown.educationScore}%` }}
                    />
                  </div>
                </div>

                {/* 6. Languages & Location */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>6. Dil & Lokasiya:</span>
                    <span className="text-teal-600">
                      {Math.round(((matchResult.breakdown.languageScore ?? 100) + matchResult.breakdown.locationScore) / 2)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round(((matchResult.breakdown.languageScore ?? 100) + matchResult.breakdown.locationScore) / 2)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Recommendation Note */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium shadow-2xs">
                <span className="font-black text-slate-900 block mb-1">📋 Beynəlxalq HR Tövsiyəsi:</span>
                {matchResult.recommendation}
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {matchResult.pros.length > 0 && (
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Güclü Tərəflər ({matchResult.pros.length}):</span>
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {matchResult.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matchResult.cons.length > 0 && (
                  <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 space-y-1">
                    <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Diqqət Yetirilməli Boşluqlar ({matchResult.cons.length}):</span>
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {matchResult.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Tailored Interview Questions based on Candidate's Profile */}
              {matchResult.interviewQuestions && matchResult.interviewQuestions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <div className="flex items-center gap-2 text-purple-950 font-black text-xs uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>Müsahibə üçün Fərdiləşdirilmiş Hədəf Sualları ({matchResult.interviewQuestions.length}):</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-purple-900 font-medium">
                    {matchResult.interviewQuestions.map((q, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-purple-100">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                          {idx + 1}
                        </span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills Badges */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Namizədin Bacarıqları ({candidate.skills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map(sk => {
                const isMatched = matchResult?.matchedSkills?.some(m => m.toLowerCase() === sk.toLowerCase());
                return (
                  <span
                    key={sk}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isMatched
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isMatched && <span className="mr-1">✓</span>}
                    {sk}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Pipeline Stage & Tags Management */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Rekrutinq Mərhələsi (Status)
              </label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="sourced">📥 Daxil Olmuş (Sourced)</option>
                <option value="screened">🔍 İlkin Skrininq (Screened)</option>
                <option value="interview">📅 Müsahibə Təyin Edildi (Interview)</option>
                <option value="shortlist">⭐ Qısa Siyahı (Shortlisted)</option>
                <option value="offer">📄 İş Təklifi Göndərildi (Offered)</option>
                <option value="hired">🎉 İşə Qəbul Edildi (Hired)</option>
                <option value="archived">📦 Ehtiyat Baza / Arxiv (Archived)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Teqlər (Vergüllə ayırın)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="A Kateqoriyası, Təcili, VIP"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* HR Recruiter Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                HR Qeydləri & Daxili Rəy
              </label>
              {isSaved && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Yadda saxlanıldı!
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Namizəd haqqında daxili qeydlər, müsahibə nəticəsi və ya rəylər..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleSaveNotes}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Dəyişiklikləri Yadda Saxla</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPhysicalCVModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Fiziki CV Sənədi</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenOutreach(candidate)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Müsahibəyə Dəvət Göndər</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>

      {/* Physical CV Viewer Modal */}
      <PhysicalCVViewerModal
        isOpen={isPhysicalCVModalOpen}
        onClose={() => setIsPhysicalCVModalOpen(false)}
        candidate={candidate}
        matchResult={matchResult}
      />
    </div>
  );
};
