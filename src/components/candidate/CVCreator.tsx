import React, { useState, useEffect, useRef } from 'react';
import { 
  CVData, 
  CVTemplateType, 
  CVLanguage, 
  CVPhotoSize, 
  CVPhotoShape, 
  User as UserType 
} from '../../types';
import { CV_TEMPLATES, CVTemplateMeta } from '../cv-templates/templateRegistry';
import { CVRenderer } from '../cv-templates/CVRenderer';
import { downloadCVAsPDF } from '../../utils/pdfExport';
import { saveCandidatePlatformCV } from '../../services/firestoreService';
import { useLanguage } from '../../context/LanguageContext';

// Extracted Clean Subcomponents
import { CVCreatorHeader } from './cv-creator/CVCreatorHeader';
import { CVCreatorEditor } from './cv-creator/CVCreatorEditor';
import { CVCreatorLivePreview } from './cv-creator/CVCreatorLivePreview';
import { CVCreatorTemplates } from './cv-creator/CVCreatorTemplates';
import { CVCreatorAiModal } from './cv-creator/CVCreatorAiModal';
import { CVCreatorClearModal } from './cv-creator/CVCreatorClearModal';
import { SectionBottomLogo } from '../common/SectionBottomLogo';
import { PDFDownloadProgressToast } from '../common/PDFDownloadProgressToast';

import { 
  Sparkles, 
  Eye, 
  Edit3, 
  FileDown, 
  Check, 
  Loader2, 
  Maximize2,
  Share2,
  FileCheck2,
  ChevronLeft
} from 'lucide-react';

export const EMPTY_BLANK_CV_DATA: CVData = {
  id: 'my-custom-cv',
  title: 'Mənim CV-im',
  language: 'az',
  lastUpdated: new Date().toISOString(),
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: '',
    photoUrl: undefined,
    photoSize: '112px',
    photoShape: 'circle'
  },
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  certificates: []
};

export const SAMPLE_DEMO_CV_DATA: CVData = {
  id: 'my-custom-cv',
  title: 'Mənim CV-im',
  language: 'az',
  lastUpdated: new Date().toISOString(),
  personalInfo: {
    fullName: 'Fərid Həsənov',
    jobTitle: 'Senior Frontend Developer',
    email: 'farid.hasanov@example.com',
    phone: '+994 50 456 78 90',
    address: 'Bakı, Azərbaycan',
    linkedin: 'linkedin.com/in/faridhasanov',
    github: 'github.com/faridhasanov',
    portfolio: 'faridhasanov.dev',
    summary: 'Müasir web tətbiqləri, React ekosistemi və yüksək yüklü frontend sistemlərin yaradılmasında 5+ il təcrübəyə malik Mühəndis. Performans optimallaşdırılması, təmiz kod və komanda rəhbərliyi üzrə güclü təcrübəyə sahibəm. ATS uyğunluğu və yüksək keyfiyyətli istifadəçi təcrübəsinə fokuslanıram.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    photoSize: '112px',
    photoShape: 'circle'
  },
  experiences: [
    {
      id: 'exp-1',
      company: 'PASHA Bank OJSC',
      position: 'Senior Frontend Developer',
      location: 'Bakı, Azərbaycan',
      startDate: '03.2022',
      endDate: 'İndiyədək',
      current: true,
      description: '• Rəqəmsal korporativ bankçılıq tətbiqinin arxitekturasını qurdum, səhifə yüklənməsini 40% sürətləndirdim.\n• 8 nəfərlik mühəndis komandasında kod keyfiyyətinə və arxitektura standartlarına rəhbərlik etdim.\n• CI/CD konveyerlərini və vahid test (unit test) örtüyünü 85%-ə qədər artırdım.'
    },
    {
      id: 'exp-2',
      company: 'Azercell Telecom',
      position: 'Frontend Developer',
      location: 'Bakı, Azərbaycan',
      startDate: '09.2019',
      endDate: '02.2022',
      current: false,
      description: '• Şəxsi kabinet və abunə idarəetmə interfeyslərini React və Redux ilə tərtib etdim.\n• Mobil uyğunluğu və qlobal əlçatanlığı (a11y) təmin edərək istifadəçi məmnuniyyətini 25% artırdım.'
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'ADA Universiteti',
      degree: 'Bakalavr',
      fieldOfStudy: 'Kompüter Elmləri',
      startDate: '2015',
      endDate: '2019',
      current: false,
      gpa: '3.75 / 4.0'
    }
  ],
  skills: [
    { id: 'sk-1', name: 'TypeScript & JavaScript', level: 'Əla / Ekspert', category: 'Texniki' },
    { id: 'sk-2', name: 'React & Next.js', level: 'Əla / Ekspert', category: 'Texniki' },
    { id: 'sk-3', name: 'Tailwind CSS & UI/UX', level: 'Əla / Ekspert', category: 'Texniki' },
    { id: 'sk-4', name: 'RESTful API & GraphQL', level: 'Yaxşı', category: 'Texniki' },
    { id: 'sk-5', name: 'Git / GitHub & CI/CD', level: 'Yaxşı', category: 'Alət / Proqram' },
    { id: 'sk-6', name: 'Agile & Scrum', level: 'Əla / Ekspert', category: 'Soft skill' }
  ],
  languages: [
    { id: 'lang-1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
    { id: 'lang-2', language: 'İngilis dili', proficiency: 'C1-C2 (Sərbəst)' },
    { id: 'lang-3', language: 'Rus dili', proficiency: 'B1-B2 (Orta/İşgüzar)' }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Fintech Dashboard Web App',
      link: 'https://github.com/faridhasanov/fintech-dashboard',
      description: 'Gündəlik maliyyə tranzaksiyalarını vizuallaşdıran interaktiv idarəetmə paneli.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS']
    }
  ],
  certificates: [
    {
      id: 'cert-1',
      name: 'Meta Certified Frontend Developer',
      issuer: 'Coursera / Meta',
      issueDate: '2023'
    }
  ]
};

export const formatCVDataToPlainText = (cv: CVData): string => {
  const parts: string[] = [];
  if (cv.personalInfo.fullName) parts.push(cv.personalInfo.fullName);
  if (cv.personalInfo.jobTitle) parts.push(cv.personalInfo.jobTitle);
  const contacts = [
    cv.personalInfo.email && `Email: ${cv.personalInfo.email}`,
    cv.personalInfo.phone && `Tel: ${cv.personalInfo.phone}`,
    cv.personalInfo.address && `Ünvan: ${cv.personalInfo.address}`,
    cv.personalInfo.linkedin && `LinkedIn: ${cv.personalInfo.linkedin}`,
    cv.personalInfo.github && `GitHub: ${cv.personalInfo.github}`,
  ].filter(Boolean);
  if (contacts.length > 0) parts.push(contacts.join(' | '));
  if (cv.personalInfo.summary) {
    parts.push(`\nHaqqımda:\n${cv.personalInfo.summary}`);
  }
  if (cv.experiences && cv.experiences.length > 0) {
    parts.push('\nİş Təcrübəsi:');
    cv.experiences.forEach((exp, idx) => {
      parts.push(`${idx + 1}. ${exp.company} — ${exp.position} (${exp.startDate} – ${exp.current ? 'İndiyədək' : exp.endDate || ''}${exp.location ? `, ${exp.location}` : ''})`);
      if (exp.description) parts.push(exp.description);
    });
  }
  if (cv.education && cv.education.length > 0) {
    parts.push('\nTəhsil:');
    cv.education.forEach((edu) => {
      parts.push(`• ${edu.institution} — ${edu.degree || ''} ${edu.fieldOfStudy || ''} (${edu.startDate || ''} – ${edu.endDate || ''})${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`);
    });
  }
  if (cv.skills && cv.skills.length > 0) {
    parts.push('\nBacarıqlar:');
    parts.push(cv.skills.map((s) => s.name).join(', '));
  }
  if (cv.languages && cv.languages.length > 0) {
    parts.push('\nDillər:');
    cv.languages.forEach((l) => {
      parts.push(`• ${l.name || (l as any).language} — ${l.level || (l as any).proficiency}`);
    });
  }
  if (cv.certificates && cv.certificates.length > 0) {
    parts.push('\nSertifikatlar:');
    cv.certificates.forEach((c) => {
      parts.push(`• ${c.name} (${c.issuer}, ${c.issueDate})`);
    });
  }
  return parts.join('\n');
};

const STORAGE_KEY = 'jobia_cv_creator_data';
const STORAGE_TEMPLATE_KEY = 'jobia_cv_creator_template';
const STORAGE_LAST_SAVED_KEY = 'jobia_cv_last_saved_time';

interface CVCreatorProps {
  onBackToPortal?: () => void;
  onApplyWithCV?: (cv: CVData) => void;
  onOpenATSAnalyzer?: (cvText: string) => void;
  initialData?: CVData;
  currentUser?: UserType | null;
  onSaveCandidateCV?: (cv: CVData) => void;
}

export const CVCreator: React.FC<CVCreatorProps> = ({
  onBackToPortal,
  onApplyWithCV,
  onOpenATSAnalyzer,
  initialData,
  currentUser,
  onSaveCandidateCV
}) => {
  const { language } = useLanguage();

  // Active studio view
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'preview'>('editor');

  // Load Initial CV Data
  const [cvData, setCvData] = useState<CVData>(() => {
    if (initialData && initialData.personalInfo && initialData.personalInfo.fullName) {
      return initialData;
    }
    try {
      if (currentUser?.id) {
        const userSaved = localStorage.getItem(`jobia_candidate_cv_${currentUser.id}`);
        if (userSaved) {
          const parsed = JSON.parse(userSaved);
          if (parsed && parsed.personalInfo && parsed.personalInfo.fullName) {
            return parsed;
          }
        }
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.personalInfo) {
          return parsed;
        }
      }
      const globalSaved = localStorage.getItem('jobia_candidate_cv');
      if (globalSaved) {
        const parsed = JSON.parse(globalSaved);
        if (parsed && parsed.personalInfo) {
          return parsed;
        }
      }
    } catch {}
    return SAMPLE_DEMO_CV_DATA;
  });

  // Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TEMPLATE_KEY);
      if (saved && CV_TEMPLATES.some((t) => t.id === saved)) {
        return saved as CVTemplateType;
      }
    } catch {}
    return cvData.template || 'simple-clean';
  });

  // Photo toggle
  const [showPhoto, setShowPhoto] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('jobia_cv_show_photo');
      if (saved !== null) return saved === 'true';
    } catch {}
    return cvData.showPhoto ?? true;
  });

  // Language state
  const [currentLanguage, setCurrentLanguage] = useState<CVLanguage>(cvData.language || 'az');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateNotification, setTranslateNotification] = useState<string | null>(null);

  // Auto-save status
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_LAST_SAVED_KEY);
    } catch {}
    return null;
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // PDF Export state
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');
  const [pdfProgressPercent, setPdfProgressPercent] = useState(0);
  const [showPdfToast, setShowPdfToast] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Full Preview Zoom Mode
  const [previewZoomMode, setPreviewZoomMode] = useState<'fit' | '100%'>('fit');
  const [previewScale, setPreviewScale] = useState(1);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  // Calculate preview scale in Full Preview
  useEffect(() => {
    if (activeTab !== 'preview') return;
    const calculateScale = () => {
      if (previewWrapperRef.current && previewZoomMode === 'fit') {
        const containerWidth = previewWrapperRef.current.clientWidth - 48;
        const scale = Math.min(Math.max(containerWidth / 800, 0.4), 1);
        setPreviewScale(scale);
      } else {
        setPreviewScale(1);
      }
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [activeTab, previewZoomMode]);

  // Sync to local storage & Firestore
  useEffect(() => {
    try {
      const toStore: CVData = {
        ...cvData,
        template: selectedTemplate,
        showPhoto: showPhoto,
        language: currentLanguage
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      if (cvData && cvData.personalInfo?.fullName) {
        localStorage.setItem('jobia_candidate_cv', JSON.stringify(toStore));
        localStorage.setItem('jobia_has_platform_cv', 'true');
        if (currentUser?.id) {
          localStorage.setItem(`jobia_candidate_cv_${currentUser.id}`, JSON.stringify(toStore));
        }
        if (onSaveCandidateCV) {
          onSaveCandidateCV(toStore);
        }
      }
    } catch {}
  }, [cvData, selectedTemplate, showPhoto, currentLanguage, currentUser?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TEMPLATE_KEY, selectedTemplate);
    } catch {}
    setCvData((prev) => (prev.template !== selectedTemplate ? { ...prev, template: selectedTemplate } : prev));
  }, [selectedTemplate]);

  useEffect(() => {
    try {
      localStorage.setItem('jobia_cv_show_photo', String(showPhoto));
    } catch {}
    setCvData((prev) => (prev.showPhoto !== showPhoto ? { ...prev, showPhoto } : prev));
  }, [showPhoto]);

  // Manual save
  const handleSaveData = () => {
    try {
      const updated: CVData = {
        ...cvData,
        template: selectedTemplate,
        showPhoto: showPhoto,
        language: currentLanguage,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem('jobia_candidate_cv', JSON.stringify(updated));
      localStorage.setItem(STORAGE_TEMPLATE_KEY, selectedTemplate);
      localStorage.setItem('jobia_cv_show_photo', String(showPhoto));
      localStorage.setItem('jobia_has_platform_cv', 'true');

      if (currentUser?.id) {
        localStorage.setItem(`jobia_candidate_cv_${currentUser.id}`, JSON.stringify(updated));
        saveCandidatePlatformCV(currentUser.id, updated).catch((err) => {
          console.warn('Firestore sync failed:', err);
        });
      }

      if (onSaveCandidateCV) {
        onSaveCandidateCV(updated);
      }

      const timeStr = new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem(STORAGE_LAST_SAVED_KEY, timeStr);
      setLastSavedTime(timeStr);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (e) {
      console.error('Failed to save CV', e);
    }
  };

  // Clear CV
  const handleClearAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_LAST_SAVED_KEY);
      localStorage.removeItem('jobia_has_platform_cv');
      if (currentUser?.id) {
        localStorage.removeItem(`jobia_candidate_cv_${currentUser.id}`);
      }
    } catch {}
    setCvData(EMPTY_BLANK_CV_DATA);
    setLastSavedTime(null);
  };

  // Load sample data
  const handleLoadSampleData = () => {
    setCvData(SAMPLE_DEMO_CV_DATA);
    localStorage.setItem('jobia_has_platform_cv', 'true');
    if (currentUser?.id) {
      localStorage.setItem(`jobia_candidate_cv_${currentUser.id}`, JSON.stringify(SAMPLE_DEMO_CV_DATA));
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // AI Content Translation
  const handleTranslateContentWithAI = async (targetLang = currentLanguage) => {
    setIsTranslating(true);
    const langNames: Record<CVLanguage, string> = {
      az: 'Azərbaycan dili',
      en: 'İngilis dili (English)',
      ru: 'Rus dili (Русский)',
      tr: 'Türk dili (Türkçe)'
    };
    const targetName = langNames[targetLang] || targetLang.toUpperCase();
    setTranslateNotification(`AI bütün CV məlumatlarını ${targetName} dilinə tərcümə edir...`);

    setCvData((prev) => ({ ...prev, language: targetLang }));
    setCurrentLanguage(targetLang);

    try {
      const res = await fetch('/api/ai/translate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvData: { ...cvData, language: targetLang },
          targetLanguage: targetLang
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.cvData) {
          const fullTranslated = { ...data.cvData, language: targetLang };
          setCvData(fullTranslated);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fullTranslated));
          } catch (_) {}
          setTranslateNotification(`✅ Bütün CV məzmunu ${targetName} dilinə tərcümə edildi!`);
        }
      }
    } catch (err) {
      console.warn('AI translation failed:', err);
    } finally {
      setIsTranslating(false);
      setTimeout(() => setTranslateNotification(null), 4000);
    }
  };

  // PDF Export
  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    setPdfProgressText('CV oxunur və formatlaşdırılır...');
    setPdfProgressPercent(12);
    setPdfSuccess(false);
    setShowPdfToast(false);

    const cleanName = (cvData.personalInfo.fullName || 'Namized').replace(/[^a-zA-Z0-9əğıöşüƏĞIÖŞÜ_-]/g, '_');
    const cleanTitle = (cvData.personalInfo.jobTitle || 'CV').replace(/[^a-zA-Z0-9əğıöşüƏĞIÖŞÜ_-]/g, '_');
    const fileName = `Jobia_CV_${cleanName}_${cleanTitle}.pdf`;
    setPdfFileName(fileName);

    try {
      await downloadCVAsPDF('cv-live-creator-export', {
        fileName,
        onProgress: (status, percent) => {
          setPdfProgressText(status);
          setPdfProgressPercent(percent);
        }
      });

      setPdfProgressPercent(100);
      setPdfProgressText('Uğurla tamamlandı!');
      setPdfSuccess(true);

      setTimeout(() => {
        setIsDownloadingPdf(false);
        setShowPdfToast(true);
      }, 350);

      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err: any) {
      console.error('PDF export error', err);
      setIsDownloadingPdf(false);
      setPdfProgressPercent(0);
      alert('PDF yüklənərkən xəta baş verdi: ' + (err?.message || 'Zəhmət olmasa yenidən cəhd edin.'));
    }
  };

  const currentTemplateMeta = CV_TEMPLATES.find((t) => t.id === selectedTemplate) || CV_TEMPLATES[0];

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 pb-16">
      {/* Studio Unified Header */}
      <CVCreatorHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLanguage={currentLanguage}
        onLanguageChange={(lang) => {
          setCurrentLanguage(lang);
          setCvData((prev) => ({ ...prev, language: lang }));
        }}
        onTranslateContent={() => handleTranslateContentWithAI(currentLanguage)}
        isTranslating={isTranslating}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenClearModal={() => setIsClearModalOpen(true)}
        onLoadSampleData={handleLoadSampleData}
        onSaveData={handleSaveData}
        saveSuccess={saveSuccess}
        lastSavedTime={lastSavedTime}
        onDownloadPDF={handleDownloadPDF}
        isDownloadingPdf={isDownloadingPdf}
        pdfProgressText={pdfProgressText}
        pdfProgressPercent={pdfProgressPercent}
        pdfSuccess={pdfSuccess}
        onOpenATSAnalyzer={
          onOpenATSAnalyzer
            ? () => {
                const text = formatCVDataToPlainText(cvData);
                onOpenATSAnalyzer(text);
              }
            : undefined
        }
        onBackToPortal={onBackToPortal}
        cvTitle={cvData.title || 'Mənim CV-im'}
        onCvTitleChange={(val) => setCvData((prev) => ({ ...prev, title: val }))}
      />

      {/* Global Notification Banner */}
      {translateNotification && (
        <div className="bg-purple-600 text-white text-xs py-2 px-4 text-center font-medium shadow-sm flex items-center justify-center gap-2 animate-in fade-in-50">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>{translateNotification}</span>
        </div>
      )}

      {/* Main Studio Viewport */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5">
        {/* VIEW 1: EDITOR (Interactive Form + Sticky Live Document Preview) */}
        {activeTab === 'editor' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Form Editor: 7 cols on desktop, full width on mobile */}
              <div className="lg:col-span-7 space-y-4">
                <CVCreatorEditor
                  cvData={cvData}
                  setCvData={setCvData}
                  showPhoto={showPhoto}
                  setShowPhoto={setShowPhoto}
                />

                {/* Mobile Quick Action to View Full Live Preview */}
                <div className="lg:hidden pt-2 pb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Canlı Sənəd Önbaxışına Keç ({currentTemplateMeta.name}) →</span>
                  </button>
                </div>
              </div>

              {/* Right Sticky Preview: 5 cols on desktop, hidden on mobile in editor mode */}
              <div className="hidden lg:block lg:col-span-5">
                <CVCreatorLivePreview
                  cvData={cvData}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                  showPhoto={showPhoto}
                  setShowPhoto={setShowPhoto}
                  onGoToFullPreview={() => setActiveTab('preview')}
                  onGoToTemplates={() => setActiveTab('templates')}
                  onDownloadPDF={handleDownloadPDF}
                  isDownloadingPdf={isDownloadingPdf}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TEMPLATES & DESIGN */}
        {activeTab === 'templates' && (
          <CVCreatorTemplates
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            showPhoto={showPhoto}
            setShowPhoto={setShowPhoto}
            onApplyAndEdit={() => setActiveTab('editor')}
            onApplyAndPreview={() => setActiveTab('preview')}
          />
        )}

        {/* VIEW 3: FULL A4 PREVIEW & PDF EXPORT */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    Rəsmi A4 Sənəd Önbaxışı
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    {currentTemplateMeta.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Beynəlxalq A4 çap standartında yüksək keyfiyyətli PDF ixracı.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom mode */}
                <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewZoomMode('fit')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      previewZoomMode === 'fit'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ekrana Sığdır
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoomMode('100%')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      previewZoomMode === '100%'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    100% Real A4
                  </button>
                </div>

                {/* PDF Download Button from Preview Toolbar */}
                <button
                  id="btn-preview-toolbar-download-pdf"
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPdf}
                  className={`relative overflow-hidden px-3.5 py-1.5 rounded-xl text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border ${
                    pdfSuccess
                      ? 'bg-emerald-700 border-emerald-600 ring-2 ring-emerald-400/40'
                      : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 disabled:opacity-95'
                  }`}
                  title="CV-ni rəsmi A4 PDF formatında endir"
                >
                  {isDownloadingPdf && (
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-800/85 transition-all duration-300 ease-out"
                      style={{ width: `${Math.max(6, Math.min(100, pdfProgressPercent))}%` }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isDownloadingPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-200" />
                        <span className="font-extrabold text-emerald-200">{pdfProgressPercent}%</span>
                        <span className="hidden sm:inline text-[11px] font-semibold">{pdfProgressText || 'PDF hazırlanır...'}</span>
                      </>
                    ) : pdfSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Endirildi!</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF Endir</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Document Canvas Frame */}
            <div 
              ref={previewWrapperRef}
              className="bg-slate-200/90 rounded-2xl border border-slate-300 p-4 sm:p-8 flex justify-center overflow-x-auto shadow-inner min-h-[600px]"
            >
              {previewZoomMode === 'fit' && previewScale < 1 ? (
                <div
                  style={{
                    width: Math.round(800 * previewScale),
                    height: 'auto',
                    overflow: 'hidden'
                  }}
                  className="transition-all shadow-2xl rounded-xl bg-white border border-slate-300 shrink-0"
                >
                  <div
                    style={{
                      width: 800,
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top left'
                    }}
                    className="bg-white"
                  >
                    <CVRenderer
                      data={cvData}
                      template={selectedTemplate}
                      showPhoto={showPhoto}
                      id="cv-live-creator-preview-fullscreen"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-[800px] min-w-[800px] shadow-2xl rounded-xl bg-white border border-slate-300 shrink-0">
                  <CVRenderer
                    data={cvData}
                    template={selectedTemplate}
                    showPhoto={showPhoto}
                    id="cv-live-creator-preview-fullscreen"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Bottom Logo */}
        <SectionBottomLogo size="sm" tagline="Peşəkar CV hazırlama və PDF yükləmə aləti" />
      </main>

      {/* Hidden container strictly for 100% pixel-perfect PDF export */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px',
          width: '800px',
          backgroundColor: '#ffffff'
        }}
      >
        <CVRenderer
          data={cvData}
          template={selectedTemplate}
          showPhoto={showPhoto}
          id="cv-live-creator-export"
        />
      </div>

      {/* AI CV Import Modal */}
      <CVCreatorAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyCvData={(newData) => {
          setCvData(newData);
          setActiveTab('editor');
        }}
        photoUrl={cvData.personalInfo.photoUrl}
      />

      {/* Confirmation Modal to Clear Data */}
      <CVCreatorClearModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirmClear={handleClearAllData}
      />

      {/* Real-time PDF Export Progress Bar & Animated Success Toast */}
      <PDFDownloadProgressToast
        isDownloading={isDownloadingPdf}
        progressPercent={pdfProgressPercent}
        progressStatus={pdfProgressText}
        showToast={showPdfToast}
        fileName={pdfFileName}
        onDismissToast={() => setShowPdfToast(false)}
      />
    </div>
  );
};
export default CVCreator;
