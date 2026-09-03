import React from 'react';
import { RefreshCw, Printer } from 'lucide-react';

interface CVAnalyzerHeaderProps {
  onReset: () => void;
  hasAnalysis: boolean;
  onPrint?: () => void;
  selectedLanguage: 'az' | 'en' | 'tr' | 'ru';
  onLanguageChange: (lang: 'az' | 'en' | 'tr' | 'ru') => void;
}

export const CVAnalyzerHeader: React.FC<CVAnalyzerHeaderProps> = ({
  onReset,
  hasAnalysis,
  onPrint,
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border border-slate-200 rounded-2xl shadow-xs mb-6 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic shadow-xs">
          G
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-800">
            CV Analizatoru <span className="text-indigo-600">AI</span>
          </h2>
          <span className="hidden sm:inline-flex px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-full">
            GEMINI 2.5 FLASH
          </span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Selector */}
        <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-semibold border border-slate-200">
          <button
            type="button"
            onClick={() => onLanguageChange('az')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              selectedLanguage === 'az'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Azərbaycan dili"
          >
            AZE
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              selectedLanguage === 'en'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="English"
          >
            ENG
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('tr')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              selectedLanguage === 'tr'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Türkçe"
          >
            TUR
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('ru')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              selectedLanguage === 'ru'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Русский"
          >
            RUS
          </button>
        </div>

        {hasAnalysis && (
          <>
            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="Hesabatı çap et və ya PDF kimi saxla"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">Çap / PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Yeni Analiz</span>
            </button>
          </>
        )}

        {/* Sleek status indicator avatar */}
        <div
          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold"
          title="Sistem Hazırdır"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default CVAnalyzerHeader;
