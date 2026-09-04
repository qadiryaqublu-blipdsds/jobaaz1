import React, { useState, useEffect, useRef } from 'react';
import { 
  CVData, 
  CVTemplateType, 
  ExperienceItem, 
  EducationItem, 
  SkillItem, 
  LanguageItem, 
  ProjectItem, 
  CertificateItem 
} from '../../types';
import { CV_TEMPLATES, CVTemplateMeta } from '../cv-templates/templateRegistry';
import { CVRenderer } from '../cv-templates/CVRenderer';
import { downloadCVAsPDF } from '../../utils/pdfExport';
import {
  Download,
  Wand2,
  Sparkles,
  Eye,
  Edit3,
  Trash2,
  Plus,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Layers,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Code,
  User,
  ChevronRight,
  FileCheck,
  Check,
  Camera,
  Loader2,
  FileDown
} from 'lucide-react';

const INITIAL_CV_DATA: CVData = {
  id: 'my-custom-cv',
  title: 'Mənim CV-im',
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
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
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
      title: 'Real-time FinTech Dashboard',
      link: 'https://github.com/faridhasanov/fintech-portal',
      description: 'Real vaxt maliyyə məlumatlarının və qrafiklərinin təhlili üçün korporativ portal.',
      technologies: ['React', 'TypeScript', 'Tailwind', 'Chart.js']
    }
  ],
  certificates: [
    {
      id: 'cert-1',
      name: 'Meta Certified Front-End Developer',
      issuer: 'Meta / Coursera',
      issueDate: '2022'
    }
  ]
};

const STORAGE_KEY = 'jobia_cv_creator_data';
const STORAGE_TEMPLATE_KEY = 'jobia_cv_creator_template';

interface CVCreatorProps {
  onBackToPortal?: () => void;
}

export const CVCreator: React.FC<CVCreatorProps> = ({ onBackToPortal }) => {
  // Load initial data
  const [cvData, setCvData] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cached CV data', e);
    }
    return INITIAL_CV_DATA;
  });

  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplateType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TEMPLATE_KEY);
      if (saved) return saved as CVTemplateType;
    } catch {}
    return 'modern-emerald';
  });

  const [showPhoto, setShowPhoto] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'preview'>('editor');
  const [editorSection, setEditorSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certificates'>('personal');

  // AI Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiJobTitle, setAiJobTitle] = useState('');
  const [aiExperienceLevel, setAiExperienceLevel] = useState<'junior' | 'mid' | 'senior' | 'lead'>('mid');
  const [aiFullName, setAiFullName] = useState('');
  const [aiCity, setAiCity] = useState('Bakı, Azərbaycan');
  const [aiSkillsHint, setAiSkillsHint] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  // Single-Click PDF Download State
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Template filter category
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('Hamısı');

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
    } catch {}
  }, [cvData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TEMPLATE_KEY, selectedTemplate);
    } catch {}
  }, [selectedTemplate]);

  // Handle Profile Photo Upload
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Zəhmət olmasa şəkil formatında (PNG, JPG, WebP) fayl seçin.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Şəkil ölçüsü maksimum 5MB ola bilər.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCvData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          photoUrl: dataUrl
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  // One-Click PDF Download
  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    setPdfProgressText('PDF formatı hesablanır...');
    setPdfSuccess(false);

    try {
      const cleanName = (cvData.personalInfo.fullName || 'Namized').replace(/[^a-zA-Z0-9əğıöşüƏĞIÖŞÜ_-]/g, '_');
      const cleanTitle = (cvData.personalInfo.jobTitle || 'CV').replace(/[^a-zA-Z0-9əğıöşüƏĞIÖŞÜ_-]/g, '_');
      const fileName = `Jobia_CV_${cleanName}_${cleanTitle}.pdf`;

      await downloadCVAsPDF('cv-live-creator-export', {
        fileName,
        onProgress: (status) => setPdfProgressText(status)
      });

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err: any) {
      console.error('PDF export error', err);
      alert('PDF yüklənərkən xəta baş verdi: ' + (err?.message || 'Zəhmət olmasa yenidən yoxlayın.'));
    } finally {
      setIsDownloadingPdf(false);
      setPdfProgressText('');
    }
  };

  // Full AI Generation Trigger
  const handleGenerateFullCV = async () => {
    if (!aiJobTitle.trim()) {
      alert('Zəhmət olmasa vəzifə və ya ixtisas adını daxil edin.');
      return;
    }

    setIsAiGenerating(true);
    setAiSuccessMessage('');

    try {
      const res = await fetch('/api/ai/generate-full-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: aiJobTitle.trim(),
          experienceLevel: aiExperienceLevel,
          fullName: aiFullName.trim() || cvData.personalInfo.fullName || 'Əli Məmmədov',
          city: aiCity.trim() || 'Bakı, Azərbaycan',
          skillsSummary: aiSkillsHint.trim(),
          photoUrl: cvData.personalInfo.photoUrl
        })
      });

      const data = await res.json();
      if (data && data.cvData) {
        setCvData(data.cvData);
        setAiSuccessMessage(
          data.source === 'gemini_ai'
            ? '✨ CV Gemini AI tərəfindən uğurla generasiya edildi və formaya yerləşdirildi!'
            : '✨ CV peşəkar intellektual baza tərəfindən uğurla generasiya edildi!'
        );
        setTimeout(() => {
          setIsAiModalOpen(false);
          setAiSuccessMessage('');
          setActiveTab('preview');
        }, 1200);
      }
    } catch (err: any) {
      console.error('Full AI generation error', err);
      alert('AI ilə generasiya zamanı xəta baş verdi. Zəhmət olmasa yenidən yoxlayın.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // AI improve single field (Summary)
  const [improvingSummary, setImprovingSummary] = useState(false);
  const handleImproveSummaryWithAI = async () => {
    setImprovingSummary(true);
    try {
      const res = await fetch('/api/ai/generate-cv-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'summary',
          role: cvData.personalInfo.jobTitle,
          currentText: cvData.personalInfo.summary,
          keywords: cvData.skills.map((s) => s.name).slice(0, 5)
        })
      });
      const json = await res.json();
      if (json.content) {
        setCvData((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            summary: json.content
          }
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImprovingSummary(false);
    }
  };

  // Add experience
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: 'Yeni Şirkət',
      position: cvData.personalInfo.jobTitle || 'Mütəxəssis',
      location: 'Bakı, Azərbaycan',
      startDate: '2023',
      endDate: 'İndiyədək',
      current: true,
      description: '• Əsas vəzifə və öhdəliklərin icrası.\n• Proseslərin təkmilləşdirilməsi və ölçülə bilən nəticələr.'
    };
    setCvData((prev) => ({
      ...prev,
      experiences: [newExp, ...prev.experiences]
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id)
    }));
  };

  // Add education
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: 'Universitet',
      degree: 'Bakalavr',
      fieldOfStudy: 'İxtisas',
      startDate: '2018',
      endDate: '2022',
      current: false,
      gpa: '3.6 / 4.0'
    };
    setCvData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((ed) => ed.id !== id)
    }));
  };

  // Add skill
  const handleAddSkill = (name = 'Yeni Bacarıq', category: SkillItem['category'] = 'Texniki') => {
    const newSkill: SkillItem = {
      id: `sk-${Date.now()}`,
      name,
      level: 'Yaxşı',
      category
    };
    setCvData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const handleRemoveSkill = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id)
    }));
  };

  // Add language
  const handleAddLanguage = () => {
    const newLang: LanguageItem = {
      id: `lang-${Date.now()}`,
      language: 'İngilis dili',
      proficiency: 'B1-B2 (Orta/İşgüzar)'
    };
    setCvData((prev) => ({
      ...prev,
      languages: [...prev.languages, newLang]
    }));
  };

  const handleRemoveLanguage = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== id)
    }));
  };

  // Add Project
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: 'Yeni Layihə',
      description: 'Layihənin qısa təsviri və gətirdiyi dəyər.',
      technologies: ['React', 'Node.js']
    };
    setCvData((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProj]
    }));
  };

  const handleRemoveProject = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p) => p.id !== id)
    }));
  };

  // Add Certificate
  const handleAddCertificate = () => {
    const newCert: CertificateItem = {
      id: `cert-${Date.now()}`,
      name: 'Peşəkar Sertifikat',
      issuer: 'Təşkilat / Platforma',
      issueDate: '2023'
    };
    setCvData((prev) => ({
      ...prev,
      certificates: [...(prev.certificates || []), newCert]
    }));
  };

  const handleRemoveCertificate = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      certificates: (prev.certificates || []).filter((c) => c.id !== id)
    }));
  };

  // Filter templates
  const categories = ['Hamısı', 'Modern', 'Klassik', 'ATS', 'Kreativ', 'Texnoloji', 'Akademik'];
  const filteredTemplates = templateCategoryFilter === 'Hamısı'
    ? CV_TEMPLATES
    : CV_TEMPLATES.filter((t) => t.category === templateCategoryFilter);

  const currentTemplateMeta = CV_TEMPLATES.find((t) => t.id === selectedTemplate) || CV_TEMPLATES[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation & Action Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              >
                ← Portala qayıt
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  Jobia CV Yaradıcı
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  11 Şablon & AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Məlumatları daxil edin, AI ilə zənginləşdirin və bir kliklə PDF endirin
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Auto-generate button */}
            <button
              onClick={() => {
                setAiJobTitle(cvData.personalInfo.jobTitle || 'Frontend Developer');
                setAiFullName(cvData.personalInfo.fullName || '');
                setIsAiModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">AI ilə Avtomatik Yarat</span>
              <span className="sm:hidden">AI Yarat</span>
            </button>

            {/* Direct One-Click PDF Download Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition-all disabled:opacity-50"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">{pdfProgressText || 'PDF hazırlanır...'}</span>
                  <span className="sm:hidden">Gözləyin...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Endirildi!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>PDF Endir (1 Klik)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (Editor, 11 Templates, Live Preview) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between border-t border-slate-100 bg-slate-50/70">
          <div className="flex gap-1 py-1.5">
            <button
              onClick={() => setActiveTab('editor')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Redaktə et</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'templates'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Şablonlar (11 Forma)</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                {CV_TEMPLATES.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Tam Baxış & Çap</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentTemplateMeta.colorTheme }} />
              <span className="font-semibold text-slate-700">{currentTemplateMeta.name}</span>
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPhoto}
                onChange={(e) => setShowPhoto(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[11px] font-medium text-slate-600">Şəkli göstər</span>
            </label>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* TAB 1: TEMPLATES PICKER */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    CV Dizayn Şablonları (11 Fərqli Forma)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    İstədiyiniz formanı seçin — məlumatlarınız avtomatik olaraq həmin şablona tətbiq olunur.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Fotoşəkil:</span>
                  <button
                    onClick={() => setShowPhoto(!showPhoto)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      showPhoto ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {showPhoto ? 'Şəkilli' : 'Şəkilsiz (Anonim/ATS)'}
                  </button>
                </div>
              </div>

              {/* Category filter pills */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTemplateCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      templateCategoryFilter === cat
                        ? 'bg-slate-900 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl.id);
                    }}
                    className={`group relative rounded-xl border-2 p-5 bg-white cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {/* Color Banner / Indicator */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded-full shadow-xs border border-white"
                          style={{ backgroundColor: tmpl.colorTheme }}
                        />
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {tmpl.name}
                          </h3>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {tmpl.category}
                          </span>
                        </div>
                      </div>

                      {tmpl.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {tmpl.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed min-h-[38px] mb-4">
                      {tmpl.description}
                    </p>

                    {/* Preview Thumbnail Representation */}
                    <div className="h-28 rounded-lg bg-slate-50 border border-slate-200 p-2.5 flex flex-col justify-between overflow-hidden relative">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 rounded w-16"
                            style={{ backgroundColor: tmpl.colorTheme }}
                          />
                          <div className="h-2 bg-slate-200 rounded w-24" />
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded w-full" />
                        <div className="h-1.5 bg-slate-200 rounded w-4/5" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
                        <div className="col-span-2 space-y-1">
                          <div className="h-1.5 bg-slate-300 rounded w-2/3" />
                          <div className="h-1 bg-slate-200 rounded w-full" />
                          <div className="h-1 bg-slate-200 rounded w-5/6" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 bg-slate-300 rounded w-full" />
                          <div className="h-1 bg-slate-200 rounded w-3/4" />
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Seçilib
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Select / Preview CTA */}
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium">
                        {isSelected ? 'Cari şablon' : 'Kliklə seçin'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(tmpl.id);
                          setActiveTab('preview');
                        }}
                        className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        Önbaxışa keç →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: EDITOR (SPLIT VIEW ON DESKTOP) */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Section Navigation & Forms (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Section Sub-Navigation Tabs */}
              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-1">
                {[
                  { id: 'personal', label: 'Şəxsi & Foto', icon: User },
                  { id: 'experience', label: 'Təcrübə', count: cvData.experiences?.length, icon: Briefcase },
                  { id: 'education', label: 'Təhsil', count: cvData.education?.length, icon: GraduationCap },
                  { id: 'skills', label: 'Bacarıqlar', count: cvData.skills?.length, icon: Code },
                  { id: 'languages', label: 'Dillər', count: cvData.languages?.length, icon: Globe },
                  { id: 'projects', label: 'Layihələr', count: cvData.projects?.length, icon: Layers },
                  { id: 'certificates', label: 'Sertifikatlar', count: cvData.certificates?.length, icon: Award }
                ].map((sec) => {
                  const Icon = sec.icon;
                  const isActive = editorSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setEditorSection(sec.id as any)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sec.label}</span>
                      {typeof sec.count === 'number' && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {sec.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 1. PERSONAL INFO SECTION */}
              {editorSection === 'personal' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Şəxsi Məlumatlar və Profil Şəkli</h2>
                      <p className="text-xs text-slate-500">Namizədin əsas kimlik, əlaqə və bioqrafiya məlumatları</p>
                    </div>
                  </div>

                  {/* Profile Photo Uploader */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group shrink-0">
                      {cvData.personalInfo.photoUrl ? (
                        <img
                          src={cvData.personalInfo.photoUrl}
                          alt="Profil"
                          className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center border-2 border-dashed border-slate-300">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="font-bold text-xs text-slate-900">Profil Fotoşəkli</div>
                      <p className="text-[11px] text-slate-500">
                        PNG, JPG və ya WebP formatında peşəkar şəklinizi yükləyin (maksimum 5MB).
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Şəkil Yüklə</span>
                        </button>
                        {cvData.personalInfo.photoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setCvData((prev) => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, photoUrl: undefined }
                              }));
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium"
                          >
                            Şəkli sil
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ad və Soyad *</label>
                      <input
                        type="text"
                        value={cvData.personalInfo.fullName || ''}
                        onChange={(e) =>
                          setCvData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                          }))
                        }
                        placeholder="Məs: Fərid Həsənov"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Vəzifə / İxtisas *</label>
                      <input
                        type="text"
                        value={cvData.personalInfo.jobTitle || ''}
                        onChange={(e) =>
                          setCvData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, jobTitle: e.target.value }
                          }))
                        }
                        placeholder="Məs: Senior Frontend Developer"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={cvData.personalInfo.email || ''}
                        onChange={(e) =>
                          setCvData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, email: e.target.value }
                          }))
                        }
                        placeholder="ad@example.com"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Telefon *</label>
                      <input
                        type="tel"
                        value={cvData.personalInfo.phone || ''}
                        onChange={(e) =>
                          setCvData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, phone: e.target.value }
                          }))
                        }
                        placeholder="+994 50 123 45 67"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Şəhər / Ünvan</label>
                      <input
                        type="text"
                        value={cvData.personalInfo.address || ''}
                        onChange={(e) =>
                          setCvData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, address: e.target.value }
                          }))
                        }
                        placeholder="Bakı, Azərbaycan"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">LinkedIn Profili</label>
                      <input
                        type="text"
                        value={cvData.personalInfo.linkedin || ''}
                        onChange={(e) =>
                          setCvData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                          }))
                        }
                        placeholder="linkedin.com/in/profil"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">GitHub / Behance</label>
                      <input
                        type="text"
                        value={cvData.personalInfo.github || ''}
                        onChange={(e) =>
                          setCvData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, github: e.target.value }
                          }))
                        }
                        placeholder="github.com/istifadeci"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Şəxsi Vebsayt / Portfolio</label>
                      <input
                        type="text"
                        value={cvData.personalInfo.portfolio || ''}
                        onChange={(e) =>
                          setCvData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, portfolio: e.target.value }
                          }))
                        }
                        placeholder="menimvebsaytim.az"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Professional Summary with AI rewrite button */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-slate-700 text-xs">
                        Haqqımda / Peşəkar Xülasə (Summary)
                      </label>
                      <button
                        type="button"
                        onClick={handleImproveSummaryWithAI}
                        disabled={improvingSummary}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        {improvingSummary ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>AI yazır...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>AI ilə təkmilləşdir</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={cvData.personalInfo.summary || ''}
                      onChange={(e) =>
                        setCvData((prev) => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, summary: e.target.value }
                        }))
                      }
                      placeholder="Özünüz haqqında 3-4 cümləlik güclü, nəticəyönümlü xülasə..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* 2. EXPERIENCE SECTION */}
              {editorSection === 'experience' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">İş Təcrübələri</h2>
                      <p className="text-xs text-slate-500">Ən son iş yerindən başlayaraq xronoloji qeyd edin</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>İş yeri əlavə et</span>
                    </button>
                  </div>

                  {cvData.experiences?.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Hələ ki iş təcrübəsi əlavə olunmayıb. Yuxarıdakı düymə ilə əlavə edin.
                    </div>
                  )}

                  <div className="space-y-4">
                    {cvData.experiences?.map((exp, idx) => (
                      <div key={exp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-800">
                            #{idx + 1} {exp.position || 'Vəzifə'} — {exp.company || 'Şirkət'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="p-1 rounded-md text-red-500 hover:bg-red-100"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Şirkət / Təşkilat</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCvData((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map((x) =>
                                    x.id === exp.id ? { ...x, company: val } : x
                                  )
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Vəzifə</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCvData((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map((x) =>
                                    x.id === exp.id ? { ...x, position: val } : x
                                  )
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Başlama Tarixi</label>
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCvData((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map((x) =>
                                    x.id === exp.id ? { ...x, startDate: val } : x
                                  )
                                }));
                              }}
                              placeholder="03.2021"
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-semibold text-slate-700">Bitmə Tarixi</label>
                              <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!exp.current}
                                  onChange={(e) => {
                                    const isCur = e.target.checked;
                                    setCvData((prev) => ({
                                      ...prev,
                                      experiences: prev.experiences.map((x) =>
                                        x.id === exp.id
                                          ? { ...x, current: isCur, endDate: isCur ? 'İndiyədək' : '' }
                                          : x
                                      )
                                    }));
                                  }}
                                  className="w-3 h-3 rounded"
                                />
                                <span>Cari iş yeri</span>
                              </label>
                            </div>
                            <input
                              type="text"
                              disabled={exp.current}
                              value={exp.current ? 'İndiyədək' : exp.endDate}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCvData((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map((x) =>
                                    x.id === exp.id ? { ...x, endDate: val } : x
                                  )
                                }));
                              }}
                              placeholder="05.2023"
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1 text-xs">
                            Nailiyyətlər və Vəzifələr (Hər bənd üçün • işarəsi istifadə edin)
                          </label>
                          <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCvData((prev) => ({
                                ...prev,
                                experiences: prev.experiences.map((x) =>
                                  x.id === exp.id ? { ...x, description: val } : x
                                )
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. EDUCATION SECTION */}
              {editorSection === 'education' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Təhsil Məlumatları</h2>
                      <p className="text-xs text-slate-500">Ali və ya orta ixtisas təhsili məlumatları</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Təhsil əlavə et</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {cvData.education?.map((edu, idx) => (
                      <div key={edu.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-800">
                            #{idx + 1} {edu.degree} — {edu.institution}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(edu.id)}
                            className="p-1 rounded-md text-red-500 hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Təhsil Müəssisəsi</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCvData((prev) => ({
                                  ...prev,
                                  education: prev.education.map((x) =>
                                    x.id === edu.id ? { ...x, institution: val } : x
                                  )
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Dərəcə</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCvData((prev) => ({
                                  ...prev,
                                  education: prev.education.map((x) =>
                                    x.id === edu.id ? { ...x, degree: val } : x
                                  )
                                }));
                              }}
                              placeholder="Bakalavr / Magistr"
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">İxtisas / Fakültə</label>
                            <input
                              type="text"
                              value={edu.fieldOfStudy}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCvData((prev) => ({
                                  ...prev,
                                  education: prev.education.map((x) =>
                                    x.id === edu.id ? { ...x, fieldOfStudy: val } : x
                                  )
                                }));
                              }}
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">İllər</label>
                              <input
                                type="text"
                                value={`${edu.startDate} – ${edu.endDate}`}
                                onChange={(e) => {
                                  const parts = e.target.value.split('–').map((p) => p.trim());
                                  setCvData((prev) => ({
                                    ...prev,
                                    education: prev.education.map((x) =>
                                      x.id === edu.id
                                        ? { ...x, startDate: parts[0] || '', endDate: parts[1] || '' }
                                        : x
                                    )
                                  }));
                                }}
                                placeholder="2016 – 2020"
                                className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">GPA (Orta bal)</label>
                              <input
                                type="text"
                                value={edu.gpa || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCvData((prev) => ({
                                    ...prev,
                                    education: prev.education.map((x) =>
                                      x.id === edu.id ? { ...x, gpa: val } : x
                                    )
                                  }));
                                }}
                                placeholder="3.8 / 4.0"
                                className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white text-[11px]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. SKILLS SECTION */}
              {editorSection === 'skills' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Bacarıqlar və Kompetensiyalar</h2>
                      <p className="text-xs text-slate-500">Texniki, fərdi və proqram təminatı səriştələri</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddSkill()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Bacarıq əlavə et</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {cvData.skills?.map((skill) => (
                      <div key={skill.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCvData((prev) => ({
                                ...prev,
                                skills: prev.skills.map((s) => (s.id === skill.id ? { ...s, name: val } : s))
                              }));
                            }}
                            className="w-full font-bold px-2 py-1 rounded border border-slate-200 bg-white text-xs"
                          />
                          <div className="flex items-center gap-2">
                            <select
                              value={skill.level}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setCvData((prev) => ({
                                  ...prev,
                                  skills: prev.skills.map((s) => (s.id === skill.id ? { ...s, level: val } : s))
                                }));
                              }}
                              className="text-[11px] px-1.5 py-0.5 rounded border border-slate-200 bg-white"
                            >
                              <option value="Başlanğıc">Başlanğıc</option>
                              <option value="Orta">Orta</option>
                              <option value="Yaxşı">Yaxşı</option>
                              <option value="Əla / Ekspert">Əla / Ekspert</option>
                            </select>

                            <select
                              value={skill.category}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setCvData((prev) => ({
                                  ...prev,
                                  skills: prev.skills.map((s) => (s.id === skill.id ? { ...s, category: val } : s))
                                }));
                              }}
                              className="text-[11px] px-1.5 py-0.5 rounded border border-slate-200 bg-white"
                            >
                              <option value="Texniki">Texniki</option>
                              <option value="Soft skill">Soft skill</option>
                              <option value="Alət / Proqram">Alət / Proqram</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. LANGUAGES SECTION */}
              {editorSection === 'languages' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Xarici Dillər</h2>
                      <p className="text-xs text-slate-500">Bilik səviyyəsi ilə birlikdə qeyd edin</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddLanguage}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Dil əlavə et</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {cvData.languages?.map((lang) => (
                      <div key={lang.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={lang.language}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCvData((prev) => ({
                                ...prev,
                                languages: prev.languages.map((l) =>
                                  l.id === lang.id ? { ...l, language: val } : l
                                )
                              }));
                            }}
                            className="px-2.5 py-1.5 rounded border border-slate-300 bg-white font-medium"
                          />
                          <select
                            value={lang.proficiency}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCvData((prev) => ({
                                ...prev,
                                languages: prev.languages.map((l) =>
                                  l.id === lang.id ? { ...l, proficiency: val } : l
                                )
                              }));
                            }}
                            className="px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                          >
                            <option value="Ana dili">Ana dili</option>
                            <option value="C1-C2 (Sərbəst)">C1-C2 (Sərbəst / Peşəkar)</option>
                            <option value="B1-B2 (Orta/İşgüzar)">B1-B2 (Orta / İşgüzar)</option>
                            <option value="A1-A2 (Başlanğıc)">A1-A2 (Başlanğıc)</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(lang.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. PROJECTS SECTION */}
              {editorSection === 'projects' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Portfolio & Layihələr</h2>
                      <p className="text-xs text-slate-500">İştirak etdiyiniz əsas layihələr</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Layihə əlavə et</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {cvData.projects?.map((proj) => (
                      <div key={proj.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCvData((prev) => ({
                                ...prev,
                                projects: (prev.projects || []).map((p) =>
                                  p.id === proj.id ? { ...p, title: val } : p
                                )
                              }));
                            }}
                            className="font-bold px-2 py-1 rounded border border-slate-300 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(proj.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={proj.link || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCvData((prev) => ({
                              ...prev,
                              projects: (prev.projects || []).map((p) =>
                                p.id === proj.id ? { ...p, link: val } : p
                              )
                            }));
                          }}
                          placeholder="https://layihe-linki.az"
                          className="w-full px-2 py-1 rounded border border-slate-300 bg-white text-[11px]"
                        />
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCvData((prev) => ({
                              ...prev,
                              projects: (prev.projects || []).map((p) =>
                                p.id === proj.id ? { ...p, description: val } : p
                              )
                            }));
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 bg-white text-xs"
                          placeholder="Layihə haqqında qısa məlumat..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. CERTIFICATES SECTION */}
              {editorSection === 'certificates' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Sertifikatlar</h2>
                      <p className="text-xs text-slate-500">Beynəlxalq və yerli peşəkar sertifikatlar</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCertificate}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sertifikat əlavə et</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {cvData.certificates?.map((cert) => (
                      <div key={cert.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCvData((prev) => ({
                                ...prev,
                                certificates: (prev.certificates || []).map((c) =>
                                  c.id === cert.id ? { ...c, name: val } : c
                                )
                              }));
                            }}
                            placeholder="Sertifikat adı"
                            className="px-2 py-1 rounded border border-slate-300 bg-white font-medium"
                          />
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCvData((prev) => ({
                                ...prev,
                                certificates: (prev.certificates || []).map((c) =>
                                  c.id === cert.id ? { ...c, issuer: val } : c
                                )
                              }));
                            }}
                            placeholder="Təşkilat"
                            className="px-2 py-1 rounded border border-slate-300 bg-white"
                          />
                          <input
                            type="text"
                            value={cert.issueDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCvData((prev) => ({
                                ...prev,
                                certificates: (prev.certificates || []).map((c) =>
                                  c.id === cert.id ? { ...c, issueDate: val } : c
                                )
                              }));
                            }}
                            placeholder="İl (məs: 2023)"
                            className="px-2 py-1 rounded border border-slate-300 bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCertificate(cert.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Sticky Document Preview (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Canlı Önbaxış</span>
                    <span className="text-[11px] text-slate-500">
                      ({currentTemplateMeta.name})
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>Tam ekrana bax</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Scaled Preview Frame */}
                <div className="bg-slate-200/80 p-3 rounded-xl border border-slate-300 overflow-hidden shadow-inner max-h-[calc(100vh-160px)] overflow-y-auto">
                  <div className="origin-top scale-[0.55] sm:scale-[0.65] -mb-[40%] transition-transform">
                    <CVRenderer
                      data={cvData}
                      template={selectedTemplate}
                      showPhoto={showPhoto}
                      id="cv-live-creator-preview"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FULL LIVE PREVIEW & EXPORT VIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  CV Çap və İxrac Səhifəsi ({currentTemplateMeta.name})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  CV birbaşa A4 formatında tərtib olunub. "PDF Endir (1 Klik)" düyməsi ilə dərhal yükləyin.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('templates')}
                  className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Şablonu dəyiş
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPdf}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{pdfProgressText || 'PDF hazırlanır...'}</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>PDF Kimi Endir (1 Klik)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Target Element for Live Rendering and PDF Export */}
            <div className="bg-slate-100 p-4 sm:p-8 rounded-2xl border border-slate-200 flex justify-center overflow-x-auto shadow-inner">
              <div className="w-full max-w-[850px] shadow-lg rounded-lg overflow-hidden bg-white">
                <CVRenderer
                  data={cvData}
                  template={selectedTemplate}
                  showPhoto={showPhoto}
                  id="cv-live-creator-export"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Hidden target element for PDF export when on other tabs */}
      {activeTab !== 'preview' && (
        <div className="fixed -left-[9999px] -top-[9999px] w-[850px] pointer-events-none opacity-0">
          <CVRenderer
            data={cvData}
            template={selectedTemplate}
            showPhoto={showPhoto}
            id="cv-live-creator-export"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI AUTO-GENERATION MODAL */}
      {/* ========================================================================= */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-xs">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Süni İntellekt (AI) ilə Avtomatik CV Yarat</h3>
                    <p className="text-xs text-purple-200 mt-0.5">
                      Vəzifəni daxil edin, AI bütün CV-ni saniyələr içində tərtib etsin
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  disabled={isAiGenerating}
                  className="p-1 rounded-lg text-white/80 hover:bg-white/20"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {aiSuccessMessage ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-bold space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div>{aiSuccessMessage}</div>
                  <div className="text-[11px] text-emerald-600 font-normal">
                    Pəncərə bağlanır və önbaxışa yönləndirilirsiniz...
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Hansı vəzifə üçün CV yaradılsın? *
                    </label>
                    <input
                      type="text"
                      value={aiJobTitle}
                      onChange={(e) => setAiJobTitle(e.target.value)}
                      placeholder="Məs: Senior Frontend Developer, Baş Mühasib, HR Menecer"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-medium text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Təcrübə Səviyyəsi
                      </label>
                      <select
                        value={aiExperienceLevel}
                        onChange={(e) => setAiExperienceLevel(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                      >
                        <option value="junior">Junior (1-2 il)</option>
                        <option value="mid">Mid-level (3-5 il)</option>
                        <option value="senior">Senior (5-8 il)</option>
                        <option value="lead">Team Lead / Rəhbər (8+ il)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Namizədin Adı & Soyadı
                      </label>
                      <input
                        type="text"
                        value={aiFullName}
                        onChange={(e) => setAiFullName(e.target.value)}
                        placeholder="Əli Məmmədov"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Şəhər / Region
                    </label>
                    <input
                      type="text"
                      value={aiCity}
                      onChange={(e) => setAiCity(e.target.value)}
                      placeholder="Bakı, Azərbaycan"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Xüsusi qeydlər və ya əsas bacarıqlar (İstəyə görə)
                    </label>
                    <textarea
                      rows={2}
                      value={aiSkillsHint}
                      onChange={(e) => setAiSkillsHint(e.target.value)}
                      placeholder="Məs: PASHA Bank təcrübəsi, React, Redux, Docker bilikləri"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-normal"
                    />
                  </div>

                  {/* Preset Quick Chips */}
                  <div className="pt-1">
                    <span className="text-[11px] text-slate-500 block mb-1.5 font-semibold">
                      Sürətli seçimlər:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Senior Frontend Developer',
                        'Rəqəmsal Marketinq Meneceri',
                        'Baş Mühasib / Maliyyəçi',
                        'İnsan Resursları (HR) Mütəxəssisi',
                        'Python & Data Analitik'
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setAiJobTitle(chip)}
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 text-[11px] font-medium transition-colors"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                disabled={isAiGenerating}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs"
              >
                İmtina
              </button>
              <button
                type="button"
                onClick={handleGenerateFullCV}
                disabled={isAiGenerating || !!aiSuccessMessage}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI CV-ni tərtib edir...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>CV-ni Tam Generasiya Et</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
