import React, { useState } from 'react';
import { Sparkles, Shield, Award, Cpu, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { CVAnalyzerResult } from '../../../types/cvAnalyzer';
import { buildFactualDeepFallback } from '../../../utils/deepCvAnalyzer';
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
    linkedinUrl?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/deep-cv-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          language
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();

      // Detect if server or proxy returned HTML (e.g. Nginx warmup page, 502/504 gateway error, etc.)
      const isHtmlResponse =
        contentType.includes('text/html') ||
        responseText.trim().startsWith('<') ||
        responseText.toLowerCase().includes('<!doctype') ||
        responseText.toLowerCase().includes('<html');

      if (isHtmlResponse) {
        console.warn('Deep CV Analyzer received HTML response from proxy/server. Engaging client-side fallback.');
        const usableText = payload.cvText || (payload.linkedinUrl ? `LinkedIn Profil: ${payload.linkedinUrl}` : '');
        if (usableText && usableText.trim().length > 15) {
          const fallbackData = buildFactualDeepFallback(
            usableText,
            payload.fileName,
            language,
            payload.jobDescription
          );
          setResult(fallbackData);
          return;
        }

        throw new Error(
          language === 'en'
            ? 'The AI analysis service is warming up. Please try again in a few moments.'
            : language === 'ru'
            ? 'Сервис анализа подготавливается. Пожалуйста, повторите попытку через несколько секунд.'
            : 'AI Analiz xidməti hazırda aktivləşir. Zəhmət olmasa bir neçə saniyə sonra yenidən cəhd edin.'
        );
      }

      // Safe JSON parsing to prevent any SyntaxError
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        console.warn('Deep CV Analyzer JSON parse failed. Utilizing factual extraction fallback:', parseErr);
        const usableText = payload.cvText || (payload.linkedinUrl ? `LinkedIn Profil: ${payload.linkedinUrl}` : '');
        if (usableText && usableText.trim().length > 15) {
          const fallbackData = buildFactualDeepFallback(
            usableText,
            payload.fileName,
            language,
            payload.jobDescription
          );
          setResult(fallbackData);
          return;
        }

        throw new Error(
          language === 'en'
            ? 'Unable to process CV analysis result. Please verify your input and try again.'
            : language === 'ru'
            ? 'Не удалось обработать результат анализа резюме. Пожалуйста, попробуйте еще раз.'
            : 'CV analizinin nəticəsini oxumaq mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.'
        );
      }

      if (!response.ok) {
        const errorMsg = data.message || data.error || (
          language === 'en'
            ? 'An error occurred during CV analysis.'
            : language === 'ru'
            ? 'Произошла ошибка при анализе резюме.'
            : 'CV analizi zamanı xəta baş verdi.'
        );

        // If client provided text, fallback to factual analyzer rather than failing completely
        const usableText = payload.cvText || (payload.linkedinUrl ? `LinkedIn Profil: ${payload.linkedinUrl}` : '');
        if (usableText && usableText.trim().length > 15) {
          console.warn('API returned non-OK status. Engaging factual deep fallback:', errorMsg);
          const fallbackData = buildFactualDeepFallback(
            usableText,
            payload.fileName,
            language,
            payload.jobDescription
          );
          setResult(fallbackData);
          return;
        }

        throw new Error(errorMsg);
      }

      setResult(data as CVAnalyzerResult);
    } catch (err: any) {
      console.warn('CV Analyzer handling notice:', err?.message || err);

      // Final safety net: if text or profile exists, provide immediate analysis
      const usableText = payload.cvText || (payload.linkedinUrl ? `LinkedIn Profil: ${payload.linkedinUrl}` : '');
      if (usableText && usableText.trim().length > 15) {
        try {
          const fallbackData = buildFactualDeepFallback(
            usableText,
            payload.fileName,
            language,
            payload.jobDescription
          );
          setResult(fallbackData);
          return;
        } catch {
          // ignore
        }
      }

      setError(
        err?.message || (
          language === 'en'
            ? 'An error occurred. Please try again.'
            : language === 'ru'
            ? 'Произошла ошибка. Пожалуйста, попробуйте еще раз.'
            : 'Xəta baş verdi. Zəhmət olmasa təkrar cəhd edin.'
        )
      );
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
