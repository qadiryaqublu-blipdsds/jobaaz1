import React, { useState } from 'react';
import {
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Globe,
  Layers,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Calendar,
  Building,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  Copy,
  Check,
  Search,
  BookOpen,
  Target,
  TrendingUp,
  ShieldCheck,
  Code,
  Clock,
  Quote,
  Lightbulb
} from 'lucide-react';
import {
  CVAnalyzerResult,
  CriteriaItem,
  DeterministicATSScore,
  JobMatchAnalysis,
  KeywordAnalysis,
  AchievementAnalysis,
  CareerTimeline,
  ExperienceRelevanceItem,
  EvidenceReferenceItem
} from '../../../types/cvAnalyzer';
import { useLanguage } from '../../../context/LanguageContext';

interface AICVAnalyzerDashboardProps {
  data: CVAnalyzerResult;
  onReset: () => void;
}

export const AICVAnalyzerDashboard: React.FC<AICVAnalyzerDashboardProps> = ({
  data,
  onReset
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    'ats' | 'timeline' | 'skills' | 'jobmatch' | 'achievements' | 'quality'
  >('ats');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});

  const toggleCriteria = (key: string) => {
    setExpandedCriteria(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const atsScore = data.atsScoreBreakdown?.totalScore ?? data.atsAnalysis?.atsScore ?? 70;
  const scoreColor =
    atsScore >= 80
      ? 'from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50 border-emerald-200'
      : atsScore >= 60
      ? 'from-amber-500 to-orange-600 text-amber-700 bg-amber-50 border-amber-200'
      : 'from-rose-500 to-red-600 text-rose-700 bg-rose-50 border-rose-200';

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  const criteriaKeys: Array<{ key: keyof typeof data.atsAnalysis.criteriaBreakdown; label: string }> = [
    { key: 'contactInfo', label: language === 'en' ? 'Contact Information' : language === 'ru' ? 'Контактные данные' : 'Əlaqə Məlumatları' },
    { key: 'professionalSummary', label: language === 'en' ? 'Professional Summary' : language === 'ru' ? 'Профессиональное резюме' : 'Peşəkar Xülasə' },
    { key: 'workExperience', label: language === 'en' ? 'Work Experience' : language === 'ru' ? 'Опыт работы' : 'İş Təcrübəsi' },
    { key: 'education', label: language === 'en' ? 'Education' : language === 'ru' ? 'Образование' : 'Təhsil' },
    { key: 'skills', label: language === 'en' ? 'Skills Architecture' : language === 'ru' ? 'Структура навыков' : 'Bacarıqlar Strukturu' },
    { key: 'keywords', label: language === 'en' ? 'Industry Keywords' : language === 'ru' ? 'Ключевые слова индустрии' : 'Sahəvi Açar Sözlər' },
    { key: 'jobTitles', label: language === 'en' ? 'Standard Job Titles' : language === 'ru' ? 'Стандартные должности' : 'Vəzifə Adları Standartı' },
    { key: 'dateConsistency', label: language === 'en' ? 'Date Consistency' : language === 'ru' ? 'Хронология дат' : 'Tarix Ardıcıllığı' },
    { key: 'formattingReadability', label: language === 'en' ? 'Layout & Readability' : language === 'ru' ? 'Читаемость формата' : 'Format Oxunaqlığı' },
    { key: 'sectionStructure', label: language === 'en' ? 'Section Organization' : language === 'ru' ? 'Структура разделов' : 'Bölmələrin Düzülüşü' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
              {data.personalInfo.fullName
                ? data.personalInfo.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
                : 'CV'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {data.personalInfo.fullName || 'Namizəd'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {data.candidateProfile?.primaryProfession || 'Mütəxəssis'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                  {data.candidateProfile?.careerLevel || 'Mid-Level'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Dəqiqlik: {data.personalInfo.confidence || 'Yüksək'}</span>
                </span>
              </div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                {data.personalInfo.email && data.personalInfo.email !== 'Not specified' && (
                  <span>📧 {data.personalInfo.email}</span>
                )}
                {data.personalInfo.phone && data.personalInfo.phone !== 'Not specified' && (
                  <span>📞 {data.personalInfo.phone}</span>
                )}
                {data.personalInfo.location && data.personalInfo.location !== 'Not specified' && (
                  <span>📍 {data.personalInfo.location}</span>
                )}
                {data.personalInfo.linkedIn && data.personalInfo.linkedIn !== 'Not specified' && (
                  <span className="text-blue-600 font-medium">🔗 {data.personalInfo.linkedIn}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {language === 'en' ? '← Analyze Another CV' : language === 'ru' ? '← Другое резюме' : '← Başqa CV Analiz Et'}
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        {data.executiveSummary && (
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>İcraçı Xülasə (Faktual İcmal)</span>
            </div>
            {data.executiveSummary}
          </div>
        )}

        {/* Engine Metadata Badge */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-800 font-bold">{data.metadata?.engineModel || 'Jobia AI CV Analyzer'}</span>
            <span>•</span>
            <span>{data.metadata?.extractedCharacterCount || 0} simvol oxundu</span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            🔒 Rəsmi ATS Qiymətləndirməsi: Yalnız sənəddə mövcud olan faktiki məlumatlar əsasında
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ats')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'ats'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ATS 100-Bal Şkalası</span>
          <span className={`px-1.5 py-0.2 text-[10px] font-black rounded-md ${atsScore >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {atsScore}/100
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Karyera Xronologiyası</span>
          <span className="px-1.5 py-0.2 text-[10px] font-black bg-blue-100 text-blue-800 rounded-md">
            {data.workExperience?.length || 0} İş
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'skills'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Bacarıqlar & Açar Sözlər</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jobmatch')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'jobmatch'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Vakansiya Uyğunluğu</span>
          {typeof data.jobMatchScore === 'number' && (
            <span className="px-1.5 py-0.2 text-[10px] font-black bg-indigo-100 text-indigo-800 rounded-md">
              {data.jobMatchScore}%
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'achievements'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Nailiyyətlər & Sübutlar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quality')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'quality'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Audit & Risk Analizi</span>
          <span className="px-1.5 py-0.2 text-[10px] font-black bg-slate-200 text-slate-700 rounded-md">
            {data.redFlags?.length || 0}
          </span>
        </button>
      </div>

      {/* TAB 1: ATS 100-POINT DETERMINISTIC SCORING */}
      {activeTab === 'ats' && (
        <div className="space-y-6">
          {/* Main Score Hero Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-blue-50/30 rounded-2xl border border-slate-100 text-center">
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      className="stroke-slate-200"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      className={`transition-all duration-1000 ${
                        atsScore >= 80 ? 'stroke-emerald-500' : atsScore >= 60 ? 'stroke-amber-500' : 'stroke-rose-500'
                      }`}
                      strokeWidth="10"
                      strokeDasharray={339.292}
                      strokeDashoffset={339.292 - (339.292 * atsScore) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">{atsScore}</span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">/ 100</span>
                  </div>
                </div>

                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {data.atsAnalysis?.scoreLabel || 'Analiz Edildi'}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 font-medium">
                  {data.atsAnalysis?.compatibilityAssessment || 'Likely ATS-friendly'}
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Qiymətləndirmə Təhlili
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl">
                    <div className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Əsas Üstünlüklər ({data.atsAnalysis?.strengths?.length || 0})</span>
                    </div>
                    <ul className="space-y-1 text-emerald-900">
                      {data.atsAnalysis?.strengths?.slice(0, 3).map((s, idx) => (
                        <li key={idx} className="line-clamp-2">• {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-rose-50/70 border border-rose-200/70 rounded-xl">
                    <div className="font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>Aradan Qaldırılmalı Nöqsanlar ({data.atsAnalysis?.issues?.length || 0})</span>
                    </div>
                    <ul className="space-y-1 text-rose-900">
                      {data.atsAnalysis?.issues?.length ? (
                        data.atsAnalysis?.issues?.slice(0, 3).map((iss, idx) => (
                          <li key={idx} className="line-clamp-2">• {iss}</li>
                        ))
                      ) : (
                        <li className="text-emerald-700">Heç bir kritik nöqsan aşkar edilmədi.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 8-Part Deterministic ATS Breakdown */}
          {data.atsScoreBreakdown && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>8-Komponentli Deterministik ATS Bal Ayrılışı (Cəmi 100 Bal)</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                ATS balı subyektiv təxmin deyil, 8 faktiki meyarın riyazi cəmindən ibarətdir.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { name: 'ATS Readability', data: data.atsScoreBreakdown.atsReadability, max: 20 },
                  { name: 'Content Completeness', data: data.atsScoreBreakdown.contentCompleteness, max: 20 },
                  { name: 'Keyword Optimization', data: data.atsScoreBreakdown.keywordOptimization, max: 20 },
                  { name: 'Work Exp. Structure', data: data.atsScoreBreakdown.workExperienceStructure, max: 15 },
                  { name: 'Skills Alignment', data: data.atsScoreBreakdown.skillsAlignment, max: 10 },
                  { name: 'Education Structure', data: data.atsScoreBreakdown.educationStructure, max: 5 },
                  { name: 'Contact Information', data: data.atsScoreBreakdown.contactInformation, max: 5 },
                  { name: 'Achievement Quality', data: data.atsScoreBreakdown.achievementQuality, max: 5 }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">{item.name}</span>
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-700">
                          {item.data?.score ?? 0}/{item.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        {item.data?.explanation || 'Təhlil olundu.'}
                      </p>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${((item.data?.score ?? 0) / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10 Criteria Breakdown Accordion/Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>10 Standart ATS Meyarı üzrə Detallı Ayrılış</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {criteriaKeys.map(({ key, label }) => {
                const item: CriteriaItem | undefined = data.atsAnalysis?.criteriaBreakdown?.[key];
                const score = item?.score ?? 70;
                const feedback = item?.feedback || 'Normativlərə uyğundur';
                const isExpanded = expandedCriteria[key];

                return (
                  <div
                    key={key}
                    onClick={() => toggleCriteria(key)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer bg-slate-50/40 hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-black border ${getScoreBadge(score)}`}>
                          {score}/100
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <div className={`mt-2 text-xs text-slate-600 leading-relaxed ${isExpanded ? 'block' : 'line-clamp-1'}`}>
                      {feedback}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAREER TIMELINE & WORK EXPERIENCE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Career Timeline Overview */}
          {data.careerTimeline && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Karyera Xronologiyası İcmalı</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Ən Erkən Məlum İş</span>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {data.careerTimeline.earliestKnownEmployment}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Son Məlum İş Yeri</span>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {data.careerTimeline.mostRecentEmployment}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Ümumi Eyniləşdirilən Təcrübə</span>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {data.careerTimeline.totalIdentifiableExperience}
                  </div>
                </div>
              </div>

              {data.careerTimeline.careerProgression && (
                <p className="text-xs text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <strong>Karyera dinamikası:</strong> {data.careerTimeline.careerProgression}
                </p>
              )}

              {/* Potential Employment Gaps Alert */}
              {data.careerTimeline.potentialEmploymentGaps && data.careerTimeline.potentialEmploymentGaps.length > 0 && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Mümkün İş Boşluğu (Potential Employment Gap Detected)</span>
                  </div>
                  {data.careerTimeline.potentialEmploymentGaps.map((gap, gIdx) => (
                    <div key={gIdx} className="mt-1">
                      • <strong>{gap.period}:</strong> {gap.description}. <em>{gap.note}</em>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Detailed Work Experience Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span>Faktiki Çıxarılmış İş Təcrübələri ({data.workExperience?.length || 0})</span>
            </h3>

            <div className="space-y-4">
              {data.workExperience?.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        {exp.position || exp.originalJobTitle}
                      </h4>
                      <div className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exp.company}</span>
                        {exp.location && <span>• {exp.location}</span>}
                        {exp.employmentType && <span>• ({exp.employmentType})</span>}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 self-start sm:self-auto">
                      {exp.startDate} — {exp.endDate} {exp.duration ? `(${exp.duration})` : ''}
                    </div>
                  </div>

                  {exp.responsibilities?.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Vəzifə Öhdəlikləri:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {exp.responsibilities.map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exp.achievements?.length > 0 && (
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                      <span className="font-bold block mb-1">Faktiki Nailiyyətlər:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {exp.achievements.map((a, aIdx) => (
                          <li key={aIdx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exp.evidence && (
                    <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200 flex items-center gap-1">
                      <Quote className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">Sübut: {exp.evidence}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Education Block */}
          {data.education && data.education.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>Təhsil Məlumatları ({data.education.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-xs text-slate-900">{edu.institution}</div>
                    <div className="text-xs text-slate-700 mt-0.5 font-medium">{edu.degree} — {edu.fieldOfStudy}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{edu.startDate} — {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SKILLS & KEYWORDS */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Explicit Skills Architecture */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <span>Dəqiq Çıxarılmış Bacarıqlar (Explicit Skills)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Yalnız namizədin CV-sində birbaşa qeyd olunan səriştələr və ATS açar sözləri.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Technical Skills */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Texniki Bacarıqlar & Texnologiyalar ({data.skills?.explicitSkills?.technicalSkills?.length || data.skills?.technicalSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(data.skills?.explicitSkills?.technicalSkills || data.skills?.technicalSkills || []).map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Software & Tools */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Proqram Təminatı & Alətlər ({data.skills?.explicitSkills?.tools?.length || data.skills?.softwareTools?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(data.skills?.explicitSkills?.tools || data.skills?.softwareTools || []).map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Fərdi & Liderlik Bacarıqları (Soft Skills) ({data.skills?.explicitSkills?.softSkills?.length || data.skills?.softSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(data.skills?.explicitSkills?.softSkills || data.skills?.softSkills || []).map((sf, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
                      {sf}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Dil Bilikləri ({data.languages?.length || 0})
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.languages?.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-800">
                      {lang.language} {lang.proficiency ? `(${lang.proficiency})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Keyword Analysis & Ethical Recommendations */}
          {data.keywordAnalysis && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>ATS Açar Söz Analizi & Etik Tövsiyələr</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 block mb-1">Uyğun Açar Sözlər (Matched)</span>
                  <div className="flex flex-wrap gap-1">
                    {data.keywordAnalysis.matchedKeywords.map((k, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white text-emerald-800 text-[11px] font-bold rounded border border-emerald-200">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-xs font-bold text-amber-800 block mb-1">Qismən Uyğun (Partially Matched)</span>
                  <div className="flex flex-wrap gap-1">
                    {data.keywordAnalysis.partiallyMatchedKeywords.map((k, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white text-amber-800 text-[11px] font-bold rounded border border-amber-200">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Çatışmayan Açar Sözlər (Missing)</span>
                  <div className="flex flex-wrap gap-1">
                    {data.keywordAnalysis.missingKeywords.map((k, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white text-slate-700 text-[11px] font-medium rounded border border-slate-300">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ethical Recommendations Box */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-blue-950 mb-1">Etik ATS Optimallaşdırma Qaydası:</div>
                  <ul className="space-y-0.5">
                    {data.keywordAnalysis.ethicalRecommendations.map((rec, rIdx) => (
                      <li key={rIdx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: JOB MATCH ANALYSIS */}
      {activeTab === 'jobmatch' && (
        <div className="space-y-6">
          {data.jobMatchAnalysis ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Vakansiya Uyğunluq Təhlili: {data.jobMatchAnalysis.targetJobTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {data.jobMatchAnalysis.summary}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-indigo-700">
                    {data.jobMatchAnalysis.totalMatchScore}%
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {data.jobMatchAnalysis.matchLevel}
                  </span>
                </div>
              </div>

              {/* 7-Part Weighted Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  7-Hissəli Çəkili Meyarlar (100% Şkala)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: '1. Required Skills (30%)', item: data.jobMatchAnalysis.requiredSkillsScore, max: 30 },
                    { label: '2. Experience (25%)', item: data.jobMatchAnalysis.relevantExperienceScore, max: 25 },
                    { label: '3. Responsibilities (15%)', item: data.jobMatchAnalysis.responsibilitiesAlignmentScore, max: 15 },
                    { label: '4. Education (10%)', item: data.jobMatchAnalysis.educationScore, max: 10 },
                    { label: '5. Keywords (10%)', item: data.jobMatchAnalysis.keywordsScore, max: 10 },
                    { label: '6. Certifications (5%)', item: data.jobMatchAnalysis.certificationsScore, max: 5 },
                    { label: '7. Languages (5%)', item: data.jobMatchAnalysis.languagesScore, max: 5 }
                  ].map((w, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{w.label}</span>
                        <span className="text-indigo-700">{w.item?.score ?? 0}/{w.max}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{w.item?.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements Table */}
              {data.jobMatchAnalysis.requirements && data.jobMatchAnalysis.requirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Tələblər üzrə Faktiki Nəticələr (Status & Sübut)
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Tələb</th>
                          <th className="p-3">Kateqoriya</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">CV-də Sübut / Qeyd</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {data.jobMatchAnalysis.requirements.map((req, rIdx) => {
                          const statusColor =
                            req.status === 'MATCH'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : req.status === 'PARTIAL MATCH'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : req.status === 'CONTRADICTED'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200';

                          return (
                            <tr key={rIdx} className="hover:bg-slate-50/70">
                              <td className="p-3 font-bold text-slate-900">{req.requirement}</td>
                              <td className="p-3 text-slate-600">{req.category}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${statusColor}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600">
                                <div>{req.evidence}</div>
                                {req.note && <div className="text-[10px] text-slate-400 mt-0.5">{req.note}</div>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 text-center space-y-4">
              <Target className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h3 className="text-base font-black text-slate-800">
                  İş Təsviri (Job Description) daxil edilməyib
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Vakansiya tələblərini analiz pəncərəsində daxil edərək 7-hissəli dəqiq uyğunluq faizini və tələb-tələb müqayisəsini əldə edə bilərsiniz.
                </p>
              </div>

              {/* Matchable Profile Preview */}
              <div className="max-w-xl mx-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
                <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Avtomatik Vakansiya Parametrləri:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>• <strong>Əsas Peşə:</strong> {data.candidateProfile?.primaryProfession}</div>
                  <div>• <strong>Karyera Səviyyəsi:</strong> {data.candidateProfile?.careerLevel}</div>
                  <div>• <strong>Ümumi Təcrübə:</strong> {data.candidateProfile?.totalExperience}</div>
                  <div>• <strong>Təhsil Səviyyəsi:</strong> {data.candidateProfile?.educationLevel}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ACHIEVEMENTS & EVIDENCE */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Achievement Analysis */}
          {data.achievementAnalysis && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Nailiyyətlərin Təsnifatı & Keyfiyyəti</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Quantified Achievements */}
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-2">
                    Rəqəmsal & Faizlə Təsdiqlənmiş Nailiyyətlər ({data.achievementAnalysis.quantifiedAchievements.length})
                  </span>
                  {data.achievementAnalysis.quantifiedAchievements.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-emerald-950">
                      {data.achievementAnalysis.quantifiedAchievements.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Ölçülə bilən rəqəm və faizlər aşkar edilmədi.</p>
                  )}
                </div>

                {/* Generic Achievements */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-2">
                    Ümumi / Ölçülməyən Nailiyyətlər ({data.achievementAnalysis.genericAchievements.length})
                  </span>
                  {data.achievementAnalysis.genericAchievements.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {data.achievementAnalysis.genericAchievements.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Bütün nailiyyətlər aydın ifadə olunub.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Experience Relevance */}
          {data.experienceRelevance && data.experienceRelevance.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>İş Təcrübələrinin Uyğunluq Dərəcəsi (Relevance)</span>
              </h3>
              <div className="space-y-2 text-xs">
                {data.experienceRelevance.map((rel, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900">{rel.company} — {rel.position}</span>
                      <p className="text-slate-600 mt-0.5">{rel.reason}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-bold self-start sm:self-auto text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {rel.relevanceType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence References */}
          {data.evidenceReferences && data.evidenceReferences.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Quote className="w-5 h-5 text-blue-600" />
                <span>Mənbə Sübutları (Source References from CV)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {data.evidenceReferences.map((ev, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900">{ev.fact}</div>
                    <div className="text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-200">
                      "{ev.sourceQuote}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: QUALITY AUDIT & RED FLAGS */}
      {activeTab === 'quality' && (
        <div className="space-y-6">
          {/* Red Flags Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Risk və Uyğunsuzluqlar ({data.redFlags?.length || 0})</span>
            </h3>

            {data.redFlags && data.redFlags.length > 0 ? (
              <div className="space-y-3">
                {data.redFlags.map((rf, idx) => (
                  <div key={idx} className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-rose-900">{rf.type}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold uppercase text-[10px]">
                        {rf.severity}
                      </span>
                    </div>
                    <p className="text-rose-800">{rf.description}</p>
                    {rf.detail && <p className="text-rose-700 italic">{rf.detail}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Heç bir kritik risk və ya uyğunsuzluq aşkar edilmədi.</span>
              </div>
            )}
          </div>

          {/* Strategic Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <span>Strateji Təkmilləşdirmə Tövsiyələri</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {data.recommendations.map((rec, idx) => (
                  <li key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                    <span className="font-bold text-blue-600 shrink-0">{idx + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 9-Point Quality Grid */}
          {data.qualityAnalysis && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>9 Standart Keyfiyyət Meyarı üzrə Qiymətləndirmə</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {Object.entries(data.qualityAnalysis).map(([k, val]: [string, any], idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="capitalize">{k}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${getScoreBadge(val?.score || 75)}`}>
                        {val?.score || 75}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{val?.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
