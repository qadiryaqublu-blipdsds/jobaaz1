import React, { useState } from 'react';
import { 
  CVLanguage 
} from '../../../types';
import { 
  Save, 
  Sparkles, 
  Eye, 
  Edit3, 
  Trash2, 
  Layers, 
  Check, 
  Loader2, 
  FileDown, 
  Languages, 
  MoreVertical,
  ChevronLeft,
  FileCheck2,
  ChevronDown,
  Globe,
  CheckCircle2
} from 'lucide-react';

interface CVCreatorHeaderProps {
  activeTab: 'editor' | 'templates' | 'preview';
  setActiveTab: (tab: 'editor' | 'templates' | 'preview') => void;
  currentLanguage: CVLanguage;
  onLanguageChange: (lang: CVLanguage) => void;
  onTranslateContent: () => void;
  isTranslating: boolean;
  onOpenAiModal: () => void;
  onOpenClearModal: () => void;
  onLoadSampleData: () => void;
  onSaveData: () => void;
  saveSuccess: boolean;
  lastSavedTime: string | null;
  onDownloadPDF: () => void;
  isDownloadingPdf: boolean;
  pdfProgressText: string;
  pdfProgressPercent?: number;
  pdfSuccess?: boolean;
  onOpenATSAnalyzer?: () => void;
  onBackToPortal?: () => void;
  cvTitle: string;
  onCvTitleChange: (val: string) => void;
  isMobilePreviewActive?: boolean;
  onToggleMobilePreview?: () => void;
}

export const CVCreatorHeader: React.FC<CVCreatorHeaderProps> = ({
  activeTab,
  setActiveTab,
  currentLanguage,
  onLanguageChange,
  onTranslateContent,
  isTranslating,
  onOpenAiModal,
  onOpenClearModal,
  onLoadSampleData,
  onSaveData,
  saveSuccess,
  lastSavedTime,
  onDownloadPDF,
  isDownloadingPdf,
  pdfProgressText,
  pdfProgressPercent = 0,
  pdfSuccess = false,
  onOpenATSAnalyzer,
  onBackToPortal,
  cvTitle,
  onCvTitleChange
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const langLabels: Record<CVLanguage, { label: string; flag: string; title: string }> = {
    az: { label: 'AZ', flag: '🇦🇿', title: 'Azərbaycan dili' },
    en: { label: 'EN', flag: '🇬🇧', title: 'English' },
    ru: { label: 'RU', flag: '🇷🇺', title: 'Русский' },
    tr: { label: 'TR', flag: '🇹🇷', title: 'Türkçe' }
  };

  const currentLangInfo = langLabels[currentLanguage] || langLabels.az;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left section: Back button & Title */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                title="Portala qayıt"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={cvTitle}
                    onChange={(e) => onCvTitleChange(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    autoFocus
                    className="text-xs sm:text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[140px] sm:max-w-[200px]"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(true)}
                    className="group flex items-center gap-1 text-left truncate"
                    title="CV başlığını dəyişmək üçün klikləyin"
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight truncate max-w-[130px] sm:max-w-[180px]">
                      {cvTitle || 'Mənim CV-im'}
                    </span>
                    <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-slate-700 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}

                <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  CV Studio
                </span>
              </div>

              {/* Status indicator */}
              <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate hidden sm:block">
                {lastSavedTime ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Qorunur: {lastSavedTime}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Dəyişikliklər avtomatik qorunur</span>
                )}
              </div>
            </div>
          </div>

          {/* Center section: Studio View Mode Switcher (Desktop only) */}
          <nav aria-label="Studio görünüş rejimi" className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Redaktə</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'templates'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Şablonlar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Tam A4 Önbaxış</span>
            </button>
          </nav>

          {/* Right section: Clean, Non-overlapping Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* 1. Language Dropdown Selector (Compact & Clean) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                  setIsMenuOpen(false);
                }}
                className="inline-flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all border border-slate-200/80"
                title={`CV dili: ${currentLangInfo.title}`}
              >
                <span className="text-sm leading-none">{currentLangInfo.flag}</span>
                <span className="font-mono text-[11px] sm:text-xs">{currentLangInfo.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {isLangDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsLangDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs font-semibold text-slate-700 animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      CV Dili
                    </div>
                    {(['az', 'en', 'ru', 'tr'] as CVLanguage[]).map((lang) => {
                      const isActive = currentLanguage === lang;
                      const info = langLabels[lang];
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            onLanguageChange(lang);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            isActive ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{info.flag}</span>
                            <span>{info.title}</span>
                          </span>
                          {isActive && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* 2. Quick AI Fill Button */}
            <button
              type="button"
              onClick={onOpenAiModal}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
              title="Mətn yapışdırıb AI ilə avtomatik doldur"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="hidden sm:inline">AI ilə Doldur</span>
              <span className="sm:hidden text-[11px]">AI</span>
            </button>

            {/* 3. Primary PDF Download Button with animated progress bar */}
            <button
              id="btn-cv-header-download-pdf"
              type="button"
              onClick={onDownloadPDF}
              disabled={isDownloadingPdf}
              className={`relative overflow-hidden inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0 border ${
                pdfSuccess
                  ? 'bg-emerald-700 border-emerald-500 ring-2 ring-emerald-400/40'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 border-emerald-500/80 disabled:opacity-95'
              }`}
              title="CV-ni rəsmi A4 PDF formatında endir"
            >
              {/* Inner animated progress bar fill on button */}
              {isDownloadingPdf && (
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-800/85 transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(6, Math.min(100, pdfProgressPercent))}%` }}
                />
              )}

              <span className="relative z-10 flex items-center gap-1.5">
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-200 shrink-0" />
                    <span className="tabular-nums font-extrabold text-emerald-200">
                      {pdfProgressPercent > 0 ? `${pdfProgressPercent}%` : ''}
                    </span>
                    <span className="hidden sm:inline text-[11px] font-semibold text-emerald-100">
                      {pdfProgressText || 'Hazırlanır...'}
                    </span>
                    <span className="sm:hidden text-[11px]">PDF...</span>
                  </>
                ) : pdfSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                    <span className="text-emerald-100 font-bold">Endirildi!</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">PDF Endir</span>
                    <span className="sm:hidden text-[11px]">PDF</span>
                  </>
                )}
              </span>
            </button>

            {/* 4. More Actions Menu (Secondary Items Consolidated) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  setIsLangDropdownOpen(false);
                }}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
                title="Digər seçimlər"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-semibold text-slate-700 animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      CV Əməliyyatları
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSaveData();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Save className="w-4 h-4 text-emerald-600" />
                      <span>{saveSuccess ? '✓ Yadda Saxlanıldı!' : 'CV-ni Yadda Saxla'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadSampleData();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Nümunə CV Yüklə</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onTranslateContent();
                        setIsMenuOpen(false);
                      }}
                      disabled={isTranslating}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-purple-700 disabled:opacity-50"
                    >
                      <Languages className="w-4 h-4 text-purple-600" />
                      <span>AI ilə Tərcümə Et ({currentLanguage.toUpperCase()})</span>
                    </button>

                    {onOpenATSAnalyzer && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenATSAnalyzer();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-700"
                      >
                        <FileCheck2 className="w-4 h-4 text-blue-600" />
                        <span>ATS Analizatoru ilə Yoxla</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={() => {
                        onOpenClearModal();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Bütün Məlumatları Təmizlə</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View Switcher Tabs (Unified & Responsive) */}
        <div className="lg:hidden flex items-center border-t border-slate-100 py-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1 ${
              activeTab === 'editor'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Redaktə</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1 ${
              activeTab === 'templates'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Şablonlar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1 ${
              activeTab === 'preview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Önbaxış</span>
          </button>
        </div>
      </div>
    </header>
  );
};
