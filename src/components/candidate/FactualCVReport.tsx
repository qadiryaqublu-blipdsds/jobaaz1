import React, { useState } from 'react';
import { FactualCVExtractionBlocks } from '../../types';
import {
  ShieldCheck,
  User,
  GraduationCap,
  Briefcase,
  Globe,
  Code,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

interface FactualCVReportProps {
  blocks: FactualCVExtractionBlocks;
}

export const FactualCVReport: React.FC<FactualCVReportProps> = ({ blocks }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'edu' | 'exp' | 'skills' | 'audit'>('all');
  const [isCopied, setIsCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const copyTextReport = () => {
    const textLines: string[] = [
      '=== FAKTİKİ DƏQİQ CV ÇIXARIŞI VƏ HR AUDİTİ (SIFIR HALLÜSİNASİYA) ===\n',
      'A) ƏSAS MƏLUMATLAR:',
      `Ad, Soyad: ${blocks.blockA_PersonalInfo?.fullName || 'Mətndə qeyd olunmayıb'}`,
      `Əlaqə məlumatları: Telefon: ${blocks.blockA_PersonalInfo?.phone || 'Mətndə qeyd olunmayıb'} | Email: ${blocks.blockA_PersonalInfo?.email || 'Mətndə qeyd olunmayıb'} | Şəhər: ${blocks.blockA_PersonalInfo?.city || 'Mətndə qeyd olunmayıb'}`,
      `Hədəf vəzifə: ${blocks.blockA_PersonalInfo?.jobTitle || 'Mətndə qeyd olunmayıb'}`,
      `Keçidlər: ${blocks.blockA_PersonalInfo?.links || 'Mətndə qeyd olunmayıb'}\n`,
      'B) TƏHSİL:',
      ...(blocks.blockB_Education || []).map(
        (e, i) =>
          `#${i + 1}. ${e.degree || 'Dərəcə qeyd olunmayıb'} | ${e.institution || 'Təhsil müəssisəsi qeyd olunmayıb'} | İxtisas: ${e.fieldOfStudy || 'Qeyd olunmayıb'} | Tarix: ${e.dates || 'Qeyd olunmayıb'}`
      ),
      '\nC) İŞ TƏCRÜBƏSİ:',
      ...(blocks.blockC_Experience || []).map(
        (exp, i) =>
          `#${i + 1}. Vəzifə: ${exp.position || 'Qeyd olunmayıb'} | Şirkət: ${exp.company || 'Qeyd olunmayıb'} | Müddət: ${exp.duration || 'Qeyd olunmayıb'}\n  Öhdəliklər:\n  ${(exp.dutiesAndAchievements || []).map((d) => `  - ${d}`).join('\n')}`
      ),
      '\nD) DİLLƏR VƏ SERTİFİKATLAR:',
      'Dillər: ' +
        ((blocks.blockD_LanguagesAndCertificates?.languages || [])
          .map((l) => `${l.language} (${l.level})`)
          .join(', ') || 'Qeyd olunmayıb'),
      'Sertifikatlar: ' +
        ((blocks.blockD_LanguagesAndCertificates?.certificates || [])
          .map((c) => `${c.name}${c.date ? ` (${c.date})` : ''}`)
          .join(', ') || 'Qeyd olunmayıb'),
      '\nE) PROQRAM VƏ TEXNİKİ BACARIQLAR:',
      (blocks.blockE_TechnicalSkills || []).join(', ') || 'Qeyd olunmayıb',
      '\nANALİZ VƏ RƏY:',
      '1. Güclü tərəflər:\n' + (blocks.auditAndReview?.strengths || []).map((s) => `  - ${s}`).join('\n'),
      '2. Uyğunsuzluqlar / Şübhəli məqamlar:\n' +
        (blocks.auditAndReview?.discrepanciesAndGaps || []).map((g) => `  - ${g}`).join('\n'),
      '3. Təkmilləşdirmə təklifləri:\n' +
        (blocks.auditAndReview?.improvementSuggestions || []).map((rec) => `  - ${rec}`).join('\n'),
    ];

    navigator.clipboard?.writeText(textLines.join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  const eduCount = (blocks.blockB_Education || []).filter(
    (e) => e.institution !== 'Mətndə qeyd olunmayıb' || e.degree !== 'Mətndə qeyd olunmayıb'
  ).length;

  const expCount = (blocks.blockC_Experience || []).filter(
    (e) => e.company !== 'Mətndə qeyd olunmayıb' || e.position !== 'Mətndə qeyd olunmayıb'
  ).length;

  const skillsCount = (blocks.blockE_TechnicalSkills || []).filter(
    (s) => s !== 'Mətndə qeyd olunmayıb'
  ).length;

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-500/30 shadow-sm overflow-hidden space-y-4">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md">
                  SIFIR HALLÜSİNASİYA
                </span>
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Yalnız sənəddəki real faktlar əsasında
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                Faktiki CV Çıxarışı və HR Analitik Hesabatı
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Heç bir təxmin və ya uydurma məlumat əlavə edilməyib. Mətndə olmayan sahələr birbaşa "Mətndə qeyd olunmayıb" olaraq göstərilir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              id="btn-copy-factual-report"
              onClick={copyTextReport}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Hesabatı kopyala"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Kopyalandı!' : 'Mətni Kopyala'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs transition-colors cursor-pointer"
              title={isCollapsed ? 'Hesabatı aç' : 'Hesabatı yığ'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick factual stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-2 border-t border-white/10 text-xs">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Namizəd</span>
            <span className="font-bold text-white text-xs truncate block">
              {blocks.blockA_PersonalInfo?.fullName || 'Mətndə qeyd olunmayıb'}
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Təhsil Müəssisəsi</span>
            <span className="font-bold text-emerald-300 text-xs truncate block">
              {eduCount > 0 ? `${eduCount} qeyd aşkarlandı` : 'Mətndə yoxdur'}
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">İş Təcrübəsi</span>
            <span className="font-bold text-blue-300 text-xs truncate block">
              {expCount > 0 ? `${expCount} şirkət aşkarlandı` : 'Mətndə yoxdur'}
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block">Texniki Bacarıq</span>
            <span className="font-bold text-purple-300 text-xs truncate block">
              {skillsCount > 0 ? `${skillsCount} bacarıq` : 'Mətndə yoxdur'}
            </span>
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5 space-y-5">
          {/* Navigation Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hamısı (A-E Bloklar)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edu')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'edu'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>B) Təhsil ({eduCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exp')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'exp'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>C) İş Təcrübəsi ({expCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'skills'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200/60'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>E) Bacarıqlar ({skillsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Analiz və Rəy</span>
            </button>
          </div>

          {/* BLOCK A: ƏSAS MƏLUMATLAR */}
          {(activeTab === 'all') && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Əsas Məlumatlar</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-400 block">Ad, Soyad</span>
                  <span className="font-bold text-slate-900">{blocks.blockA_PersonalInfo?.fullName || 'Mətndə qeyd olunmayıb'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-400 block">Hədəf Vəzifə / Peşə</span>
                  <span className="font-bold text-slate-900">{blocks.blockA_PersonalInfo?.jobTitle || 'Mətndə qeyd olunmayıb'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-400 block">Telefon</span>
                  <span className="font-semibold text-slate-800">{blocks.blockA_PersonalInfo?.phone || 'Mətndə qeyd olunmayıb'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-400 block">E-poçt</span>
                  <span className="font-semibold text-slate-800">{blocks.blockA_PersonalInfo?.email || 'Mətndə qeyd olunmayıb'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-400 block">Şəhər / Ünvan</span>
                  <span className="font-semibold text-slate-800">{blocks.blockA_PersonalInfo?.city || 'Mətndə qeyd olunmayıb'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-400 block">Keçidlər (LinkedIn / Portfolio)</span>
                  <span className="font-semibold text-slate-800 truncate block">{blocks.blockA_PersonalInfo?.links || 'Mətndə qeyd olunmayıb'}</span>
                </div>
              </div>
            </div>
          )}

          {/* BLOCK B: TƏHSİL */}
          {(activeTab === 'all' || activeTab === 'edu') && (
            <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    B
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Təhsil (Faktiki Məlumatlar)</span>
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                  {eduCount > 0 ? `${eduCount} Təhsil qeydi` : 'Mətndə qeyd olunmayıb'}
                </span>
              </div>

              {blocks.blockB_Education && blocks.blockB_Education.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {blocks.blockB_Education.map((edu, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-amber-200/70 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <span>🎓</span>
                          <span>{edu.institution || 'Mətndə qeyd olunmayıb'}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium shrink-0">
                          {edu.dates || 'Mətndə qeyd olunmayıb'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 space-y-0.5 pt-1 border-t border-slate-100">
                        <p>
                          <span className="text-slate-400 font-medium">Dərəcə:</span>{' '}
                          <strong className="text-slate-900">{edu.degree || 'Mətndə qeyd olunmayıb'}</strong>
                        </p>
                        <p>
                          <span className="text-slate-400 font-medium">İxtisas:</span>{' '}
                          <span className="text-slate-800">{edu.fieldOfStudy || 'Mətndə qeyd olunmayıb'}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs text-amber-800">
                  Mətndə təhsil haqqında məlumat qeyd olunmayıb.
                </div>
              )}
            </div>
          )}

          {/* BLOCK C: İŞ TƏCRÜBƏSİ */}
          {(activeTab === 'all' || activeTab === 'exp') && (
            <div className="bg-blue-50/40 border border-blue-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    C
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>İş Təcrübəsi (Faktiki Şirkətlər və Vəzifələr)</span>
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md">
                  {expCount > 0 ? `${expCount} İş yeri` : 'Mətndə qeyd olunmayıb'}
                </span>
              </div>

              {blocks.blockC_Experience && blocks.blockC_Experience.length > 0 ? (
                <div className="space-y-3">
                  {blocks.blockC_Experience.map((exp, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-blue-200/70 shadow-2xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h5 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>{exp.company || 'Mətndə qeyd olunmayıb'}</span>
                          </h5>
                          <p className="text-xs font-semibold text-slate-800 mt-0.5">
                            💼 {exp.position || 'Mətndə qeyd olunmayıb'}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium self-start sm:self-center flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{exp.duration || 'Mətndə qeyd olunmayıb'}</span>
                        </span>
                      </div>

                      {exp.dutiesAndAchievements && exp.dutiesAndAchievements.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Öhdəliklər və Nailiyyətlər:
                          </span>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {exp.dutiesAndAchievements.map((duty, dIdx) => (
                              <li key={dIdx} className="flex items-start gap-1.5 leading-relaxed">
                                <span className="text-blue-500">•</span>
                                <span>{duty}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-3 rounded-lg border border-blue-200 text-xs text-blue-800">
                  Mətndə iş təcrübəsi qeyd olunmayıb.
                </div>
              )}
            </div>
          )}

          {/* BLOCK D: DİLLƏR VƏ SERTİFİKATLAR */}
          {(activeTab === 'all') && (
            <div className="bg-sky-50/40 border border-sky-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-sky-200/60 pb-2">
                <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                  D
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-600" />
                  <span>Dillər və Sertifikatlar</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Languages */}
                <div className="bg-white p-3 rounded-xl border border-sky-200/70 space-y-2">
                  <span className="text-[11px] font-bold text-sky-950 block">Xarici Dil Bilikləri:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {blocks.blockD_LanguagesAndCertificates?.languages &&
                    blocks.blockD_LanguagesAndCertificates.languages.length > 0 ? (
                      blocks.blockD_LanguagesAndCertificates.languages.map((lang, lIdx) => (
                        <span
                          key={lIdx}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs font-medium"
                        >
                          <strong>{lang.language}</strong>: {lang.level}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Mətndə qeyd olunmayıb</span>
                    )}
                  </div>
                </div>

                {/* Certificates */}
                <div className="bg-white p-3 rounded-xl border border-sky-200/70 space-y-2">
                  <span className="text-[11px] font-bold text-sky-950 block">Sertifikatlar:</span>
                  <div className="space-y-1">
                    {blocks.blockD_LanguagesAndCertificates?.certificates &&
                    blocks.blockD_LanguagesAndCertificates.certificates.length > 0 ? (
                      blocks.blockD_LanguagesAndCertificates.certificates.map((cert, cIdx) => (
                        <div
                          key={cIdx}
                          className="text-xs text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-900">📜 {cert.name}</span>
                          {cert.date && <span className="text-[10px] text-slate-400">{cert.date}</span>}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Mətndə qeyd olunmayıb</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLOCK E: PROQRAM VƏ TEXNİKİ BACARIQLAR */}
          {(activeTab === 'all' || activeTab === 'skills') && (
            <div className="bg-purple-50/40 border border-purple-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                    E
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-purple-600" />
                    <span>Proqram və Texniki Bacarıqlar</span>
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded-md">
                  {skillsCount} Aşkar Edilən Bacarıq
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {blocks.blockE_TechnicalSkills && blocks.blockE_TechnicalSkills.length > 0 ? (
                  blocks.blockE_TechnicalSkills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3 py-1 rounded-xl bg-white border border-purple-200 text-purple-900 text-xs font-semibold shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Mətndə texniki bacarıq qeyd olunmayıb</span>
                )}
              </div>
            </div>
          )}

          {/* AUDİT VƏ RƏY */}
          {(activeTab === 'all' || activeTab === 'audit') && blocks.auditAndReview && (
            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
              <div className="border-b border-white/10 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>HR Audit və Obyektiv Rəy</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* 1. Güclü Tərəflər */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-300 block flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>1. Güclü Tərəflər:</span>
                  </span>
                  <ul className="space-y-1 text-slate-200">
                    {(blocks.auditAndReview.strengths || []).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1 leading-snug">
                        <span className="text-emerald-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Uyğunsuzluqlar / Şübhəli Məqamlar */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-2">
                  <span className="font-bold text-amber-300 block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>2. Uyğunsuzluqlar & Boşluqlar:</span>
                  </span>
                  <ul className="space-y-1 text-slate-200">
                    {(blocks.auditAndReview.discrepanciesAndGaps || []).length > 0 ? (
                      blocks.auditAndReview.discrepanciesAndGaps.map((g, idx) => (
                        <li key={idx} className="flex items-start gap-1 leading-snug">
                          <span className="text-amber-400">•</span>
                          <span>{g}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400">Heç bir kritik boşluq aşkar edilmədi.</li>
                    )}
                  </ul>
                </div>

                {/* 3. Təkmilləşdirmə Təklifləri */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-2">
                  <span className="font-bold text-blue-300 block flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>3. Təkmilləşdirmə Təklifləri:</span>
                  </span>
                  <ul className="space-y-1 text-slate-200">
                    {(blocks.auditAndReview.improvementSuggestions || []).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-1 leading-snug">
                        <span className="text-blue-400">💡</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
