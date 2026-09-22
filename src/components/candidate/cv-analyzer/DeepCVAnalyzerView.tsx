import React, { useState } from 'react';
import { Sparkles, Shield, Award, Cpu, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { CVAnalyzerResult } from '../../../types/cvAnalyzer';
import { AICVAnalyzerInput } from './AICVAnalyzerInput';
import { AICVAnalyzerLoading } from './AICVAnalyzerLoading';
import { AICVAnalyzerDashboard } from './AICVAnalyzerDashboard';
import { SectionBottomLogo } from '../../common/SectionBottomLogo';

interface DeepCVAnalyzerViewProps {
  initialCVText?: string;
}

export const DeepCVAnalyzerView: React.FC<DeepCVAnalyzerViewProps> = ({ initialCVText }) => {
  const { language } = useLanguage();
  const [result, setResult] = useState<CVAnalyzerResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (payload: {
    cvText?: string;
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
    jobDescription?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/deep-cv-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          language
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'CV analizi zamanı xəta baş verdi.');
      }

      const data: CVAnalyzerResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('CV Analyzer client error:', err);
      setError(err.message || 'Xəta baş verdi. Zəhmət olmasa təkrar cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Title & Subtitle */}
        {!result && !isLoading && (
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {language === 'en'
                  ? 'Jobia.az • Professional ATS CV Analyzer'
                  : language === 'ru'
                  ? 'Jobia.az • Профессиональный ATS Анализатор'
                  : 'Jobia.az • Peşəkar ATS CV Analizatoru'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {language === 'en'
                ? 'AI CV Analyzer & ATS Audit'
                : language === 'ru'
                ? 'ИИ Анализатор Резюме и ATS Аудит'
                : 'AI CV Analizator və ATS Auditi'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {language === 'en'
                ? 'Deterministic ATS compatibility analysis. 10 ATS criteria, 9-point quality audit, and instant job matching profile.'
                : language === 'ru'
                ? 'Детерминированный анализ совместимости с ATS. 10 критериев ATS, аудит качества по 9 пунктам и профиль для вакансий.'
                : 'Dəqiq ATS uyğunluq analizi. 10 ATS meyarı, 9 keyfiyyət auditi və vakansiyalara uyğunlaşdırma profili.'}
            </p>

            {/* Micro value badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {language === 'en' ? 'ATS Standard Accuracy' : language === 'ru' ? '100% Точность ATS' : '100% ATS Dəqiqlik'}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>10 ATS Meyarı</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>Multimodal PDF / DOCX</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-600 hover:text-rose-900 font-bold shrink-0"
            >
              Bağla
            </button>
          </div>
        )}

        {/* View States */}
        {isLoading ? (
          <AICVAnalyzerLoading />
        ) : result ? (
          <AICVAnalyzerDashboard data={result} onReset={handleReset} />
        ) : (
          <AICVAnalyzerInput onAnalyze={handleAnalyze} isLoading={isLoading} initialCVText={initialCVText} />
        )}

        {/* Section bottom logo */}
        <SectionBottomLogo size="sm" />
      </div>
    </div>
  );
};
export default DeepCVAnalyzerView;
