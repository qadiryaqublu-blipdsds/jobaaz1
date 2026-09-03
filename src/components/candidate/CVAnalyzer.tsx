import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  BarChart3,
  ShieldCheck,
  Wand2,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  RotateCw,
  FileCheck,
  ArrowRight,
  BookOpen,
  Compass,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { CVData, Vacancy, CVAnalysisResult, AnalyzeCVRequest } from '../../types';
import { safeFetchJson } from '../../utils/apiHelper';
import { CVAnalyzerHeader } from './CVAnalyzerHeader';
import { CVInputSection } from './CVInputSection';
import { ScoreOverviewCard } from './ScoreOverviewCard';
import { CandidateProfileHistoryCard } from './CandidateProfileHistoryCard';
import { CareerValuationSummaryCard } from './CareerValuationSummaryCard';
import { AutoCVBuilder } from './AutoCVBuilder';
import { ATSChecklistCard } from './ATSChecklistCard';
import { StrengthsWeaknessesCard } from './StrengthsWeaknessesCard';
import { BulletImprovementsCard } from './BulletImprovementsCard';
import { SkillsMatrixCard } from './SkillsMatrixCard';
import { JobMatchCard } from './JobMatchCard';
import { ProfileSummaryCard } from './ProfileSummaryCard';
import { InterviewQuestionsCard } from './InterviewQuestionsCard';
import { FollowUpChat } from './FollowUpChat';
import { ExportReportModal } from './ExportReportModal';
import { JobiaSectionFooter } from '../JobiaSectionFooter';

interface CVAnalyzerProps {
  cvData: CVData;
  vacancies: Vacancy[];
  initialTargetVacancy?: Vacancy | null;
  onNavigateToBuilder: () => void;
  onImportCVData?: (newCV: CVData) => void;
}

export const CVAnalyzer: React.FC<CVAnalyzerProps> = ({
  cvData,
  vacancies,
  initialTargetVacancy,
  onNavigateToBuilder,
  onImportCVData,
}) => {
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<AnalyzeCVRequest | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'az' | 'en' | 'tr' | 'ru'>('az');
  const [activeViewTab, setActiveViewTab] = useState<'all' | 'profile' | 'valuation' | 'ats' | 'bullets' | 'interview' | 'chat' | 'builder'>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Selected target vacancy from platform if available
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>(
    initialTargetVacancy ? initialTargetVacancy.id : 'general'
  );
  const selectedVacancy = useMemo(() => {
    return vacancies.find((v) => v.id === selectedVacancyId) || initialTargetVacancy || null;
  }, [vacancies, selectedVacancyId, initialTargetVacancy]);

  const handleAnalyze = async (payload: AnalyzeCVRequest) => {
    setIsLoading(true);
    setError(null);
    setLastPayload(payload);

    try {
      const vacancyDesc = selectedVacancy
        ? `${selectedVacancy.title} - ${selectedVacancy.description || ''}\nTələblər: ${(selectedVacancy.requirements || []).join(', ')}`
        : payload.jobDescription;

      const response = await safeFetchJson<CVAnalysisResult>('/api/analyze-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          language: selectedLanguage,
          targetJobTitle: selectedVacancy?.title || undefined,
          vacancyDescription: vacancyDesc,
        }),
        timeoutMs: 60000,
      });

      if (!response.ok || !response.data) {
        throw new Error(response.error || 'CV təhlil edilərkən xəta baş verdi.');
      }

      const data = response.data;

      setAnalysisResult(data);

      // Trigger celebratory confetti if score is solid (65+)
      const score = data.overallScore ?? data.score ?? 0;
      if (score >= 65 || data.status === 'uygundur') {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore confetti error
        }
      }

      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Serverlə əlaqə qurularkən gözlənilməz xəta baş verdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzePlatformCV = () => {
    handleAnalyze({
      cvData,
      targetJobTitle: selectedVacancy?.title || cvData.personalInfo?.jobTitle,
      jobDescription: selectedVacancy
        ? `${selectedVacancy.title}\nTələblər: ${(selectedVacancy.requirements || []).join(', ')}`
        : undefined,
      language: selectedLanguage,
      focusArea: 'comprehensive',
    });
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setActiveViewTab('all');
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header bar with Language selector & controls */}
      <CVAnalyzerHeader
        onReset={handleReset}
        hasAnalysis={Boolean(analysisResult)}
        onPrint={() => setIsExportModalOpen(true)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />

      {/* Target vacancy quick selector bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
            🎯
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Müqayisə Üçün Hədəf Vakansiya
            </span>
            <span className="text-xs font-semibold text-slate-800">
              {selectedVacancy ? selectedVacancy.title : 'Ümumi Bazar Standartları'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedVacancyId}
            onChange={(e) => setSelectedVacancyId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="general">Ümumi Əmək Bazarı Standartları</option>
            {vacancies.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} ({v.companyName || 'Şirkət'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error notification banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-slate-900">Təhlil Xətası</span>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {lastPayload && (
              <button
                type="button"
                onClick={() => handleAnalyze(lastPayload)}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Yenidən Cəhd Et</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setError(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      )}

      {/* Input section when not analyzed */}
      {!analysisResult && (
        <div className="space-y-6">
          {/* Quick Platform CV Card if candidate has info in builder */}
          {cvData && cvData.personalInfo && cvData.personalInfo.fullName && (
            <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-white p-4 sm:p-5 rounded-2xl border border-indigo-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                      Platforma Profiliniz
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-indigo-600 border border-indigo-200">
                      Hazırdır
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {cvData.personalInfo.fullName} • {cvData.personalInfo.jobTitle || 'Mütəxəssis'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {(cvData.experiences || []).length} iş yeri, {(cvData.skills || []).length} bacarıq
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleAnalyzePlatformCV}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer disabled:bg-slate-400"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Bu CV-ni Analiz Et</span>
              </button>
            </div>
          )}

          {/* Main Input Component (File upload, text, samples) */}
          <CVInputSection
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            selectedLanguage={selectedLanguage}
          />
        </div>
      )}

      {/* Analysis Result View */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Navigation Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setActiveViewTab('all')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeViewTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 inline mr-1" />
                Bütün Hesabat
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('profile')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeViewTab === 'profile'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-3.5 h-3.5 inline mr-1" />
                Təcrübə & Təhsil
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('valuation')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeViewTab === 'valuation'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                Karyera Dəyərləndirməsi
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('ats')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeViewTab === 'ats'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                ATS & Bacarıqlar
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('bullets')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeViewTab === 'bullets'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 inline mr-1" />
                Cümlə İslahı
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('interview')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeViewTab === 'interview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 inline mr-1" />
                Müsahibə Sualları
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('chat')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeViewTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                Karyera Çatı
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('builder')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeViewTab === 'builder'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1" />
                ✨ CV Qurucu
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="text-xs px-3.5 py-1.5 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              >
                Hesabatı İxrac Et
              </button>

              <button
                type="button"
                onClick={() => setActiveViewTab('builder')}
                className="text-xs px-3.5 py-1.5 rounded-lg font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>CV Qurucunu Aç</span>
              </button>
            </div>
          </div>

          {/* Builder View */}
          {activeViewTab === 'builder' ? (
            <AutoCVBuilder
              initialData={analysisResult}
              onNavigateBack={() => setActiveViewTab('all')}
            />
          ) : (
            <>
              {/* 1. Score Overview Card (Always at the top) */}
              <ScoreOverviewCard result={analysisResult} />

              {/* 2. Candidate Experience & Education History + Career Domain Fit */}
              {(activeViewTab === 'all' || activeViewTab === 'profile') && (
                <CandidateProfileHistoryCard result={analysisResult} />
              )}

              {/* 3. Recommended Profile Summary / Bio Card */}
              {(activeViewTab === 'all' || activeViewTab === 'bullets') && (
                <ProfileSummaryCard summary={analysisResult.suggestedProfileSummary} />
              )}

              {/* 4. Job Match Card if target job is active */}
              {(activeViewTab === 'all' || activeViewTab === 'ats') && analysisResult.jobMatch && (
                <JobMatchCard jobMatch={analysisResult.jobMatch} />
              )}

              {/* 5. Strengths & Weaknesses */}
              {(activeViewTab === 'all' || activeViewTab === 'ats') && (
                <StrengthsWeaknessesCard
                  strengths={analysisResult.strengths}
                  weaknesses={analysisResult.weaknesses}
                />
              )}

              {/* 6. ATS Standards Audit */}
              {(activeViewTab === 'all' || activeViewTab === 'ats') && (
                <ATSChecklistCard atsChecks={analysisResult.atsChecks} />
              )}

              {/* 7. Skills Matrix & Missing Recommended Skills */}
              {(activeViewTab === 'all' || activeViewTab === 'ats') && (
                <SkillsMatrixCard
                  skillsFound={analysisResult.skillsFound}
                  missingRecommendedSkills={analysisResult.missingRecommendedSkills}
                />
              )}

              {/* 8. Bullet Improvements using STAR method */}
              {(activeViewTab === 'all' || activeViewTab === 'bullets') && (
                <BulletImprovementsCard
                  improvements={analysisResult.bulletImprovements}
                />
              )}

              {/* 9. Interview Questions & Answer Guidance */}
              {(activeViewTab === 'all' || activeViewTab === 'interview') && (
                <InterviewQuestionsCard
                  questions={analysisResult.interviewQuestions}
                />
              )}

              {/* 10. Career Valuation Summary (At the end of analysis report) */}
              {(activeViewTab === 'all' || activeViewTab === 'valuation') && (
                <CareerValuationSummaryCard
                  result={analysisResult}
                  language={selectedLanguage}
                  onOpenCvBuilder={() => setActiveViewTab('builder')}
                />
              )}

              {/* 11. Follow-up Interactive Career Chat */}
              {(activeViewTab === 'all' || activeViewTab === 'chat') && (
                <FollowUpChat
                  analysisResult={analysisResult}
                  selectedLanguage={selectedLanguage}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Export Report Modal */}
      {analysisResult && (
        <ExportReportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          result={analysisResult}
        />
      )}

      {/* Section Footer */}
      <JobiaSectionFooter />
    </div>
  );
};

export default CVAnalyzer;
