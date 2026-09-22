import React, { useState } from 'react';
import { 
  CVData, 
  ExperienceItem, 
  EducationItem, 
  SkillItem, 
  LanguageItem, 
  ProjectItem, 
  CertificateItem,
  CVPhotoShape,
  CVPhotoSize
} from '../../../types';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Code,
  Layers,
  Plus,
  Trash2,
  Sparkles,
  Camera,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  Link as LinkIcon,
  HelpCircle,
  Mic
} from 'lucide-react';

interface CVCreatorEditorProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  showPhoto: boolean;
  setShowPhoto: (show: boolean) => void;
  onOpenAiModal?: () => void;
}

export const CVCreatorEditor: React.FC<CVCreatorEditorProps> = ({
  cvData,
  setCvData,
  showPhoto,
  setShowPhoto
}) => {
  // Accordion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    experience: true,
    education: false,
    skills: true,
    languages: false,
    projects: false,
    certificates: false
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // AI enhancement for summary
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
          language: cvData.language || 'az'
        })
      });
      const data = await res.json();
      if (data && data.text) {
        setCvData((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            summary: data.text
          }
        }));
      }
    } catch (e) {
      console.error('Summary improvement error', e);
    } finally {
      setImprovingSummary(false);
    }
  };

  // AI enhancement for experience description
  const [improvingExpId, setImprovingExpId] = useState<string | null>(null);
  const handleImproveExpWithAI = async (exp: ExperienceItem) => {
    setImprovingExpId(exp.id);
    try {
      const res = await fetch('/api/ai/generate-cv-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bullet',
          role: exp.position,
          company: exp.company,
          currentText: exp.description,
          language: cvData.language || 'az'
        })
      });
      const data = await res.json();
      if (data && data.text) {
        setCvData((prev) => ({
          ...prev,
          experiences: prev.experiences.map((item) =>
            item.id === exp.id ? { ...item, description: data.text } : item
          )
        }));
      }
    } catch (e) {
      console.error('Experience improvement error', e);
    } finally {
      setImprovingExpId(null);
    }
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Zəhmət olmasa şəkil formatında fayl seçin.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Şəkil ölçüsü maksimum 5MB ola bilər.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCvData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          photoUrl: reader.result as string
        }
      }));
      setShowPhoto(true);
    };
    reader.readAsDataURL(file);
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: 'Yeni Şirkət',
      position: cvData.personalInfo.jobTitle || 'Mütəxəssis',
      startDate: '2022',
      endDate: '',
      current: true,
      location: 'Bakı',
      description: '• Əsas vəzifə öhdəliklərini icra etdim.\n• Biznes proseslərinin optimallaşdırılmasına töhfə verdim.'
    };
    setCvData((prev) => ({
      ...prev,
      experiences: [newExp, ...prev.experiences]
    }));
    setExpandedSections((prev) => ({ ...prev, experience: true }));
  };

  const handleRemoveExperience = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id)
    }));
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: 'Universitet',
      degree: 'Bakalavr',
      fieldOfStudy: 'İxtisas',
      startDate: '2018',
      endDate: '2022',
      current: false,
      gpa: '3.8 / 4.0'
    };
    setCvData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
    setExpandedSections((prev) => ({ ...prev, education: true }));
  };

  const handleRemoveEducation = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id)
    }));
  };

  // Skills handlers
  const [newSkillInput, setNewSkillInput] = useState('');
  const handleAddSkillFromInput = () => {
    if (!newSkillInput.trim()) return;
    const newSkill: SkillItem = {
      id: `sk-${Date.now()}`,
      name: newSkillInput.trim(),
      level: 'Yaxşı',
      category: 'Texniki'
    };
    setCvData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
    setNewSkillInput('');
  };

  const handleRemoveSkill = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id)
    }));
  };

  // Language handlers
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
    setExpandedSections((prev) => ({ ...prev, languages: true }));
  };

  const handleRemoveLanguage = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== id)
    }));
  };

  // Projects handlers
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: 'Yeni Layihə',
      description: 'Layihənin qısa məqsədi və texnologiyaları.',
      technologies: ['React', 'TypeScript']
    };
    setCvData((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProj]
    }));
    setExpandedSections((prev) => ({ ...prev, projects: true }));
  };

  const handleRemoveProject = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p) => p.id !== id)
    }));
  };

  // Certificates handlers
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
    setExpandedSections((prev) => ({ ...prev, certificates: true }));
  };

  const handleRemoveCertificate = (id: string) => {
    setCvData((prev) => ({
      ...prev,
      certificates: (prev.certificates || []).filter((c) => c.id !== id)
    }));
  };

  // Quick skill suggestions
  const suggestedSkills = [
    'MS Excel', '1C 8.3', 'SQL', 'Git', 'Agile / Scrum', 'REST API', 'JavaScript', 
    'Python', 'Maliyyə Analizi', 'B2B Satış', 'Müştəri Xidmətləri', 'SMM', 'SEO'
  ].filter((s) => !cvData.skills.some((sk) => sk.name.toLowerCase() === s.toLowerCase()));

  // Calculate completeness
  let score = 20; // base
  if (cvData.personalInfo.fullName) score += 15;
  if (cvData.personalInfo.jobTitle) score += 10;
  if (cvData.personalInfo.summary) score += 15;
  if (cvData.experiences.length > 0) score += 20;
  if (cvData.education.length > 0) score += 10;
  if (cvData.skills.length >= 3) score += 10;
  const completionScore = Math.min(score, 100);

  return (
    <div className="space-y-4">
      {/* Completeness Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <span>CV Tamlıq Dərəcəsi</span>
            <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
              completionScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {completionScore}%
            </span>
          </span>
          <span className="text-slate-400 text-[11px]">
            {completionScore >= 85 ? '🌟 ATS üçün hazırdır' : 'Bölmələri dolduraraq balınızı artırın'}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              completionScore >= 80 ? 'bg-emerald-500' : completionScore >= 50 ? 'bg-amber-500' : 'bg-slate-400'
            }`}
            style={{ width: `${completionScore}%` }}
          />
        </div>
      </div>

      {/* 1. ŞƏXSİ MƏLUMATLAR & FOTO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('personal')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Şəxsi Məlumatlar & Profil Şəkli</h3>
              <p className="text-xs text-slate-500">Ad, soyad, vəzifə, əlaqə vasitələri və xülasə</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cvData.personalInfo.fullName && (
              <span className="hidden sm:inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                ✓ Doldurulub
              </span>
            )}
            {expandedSections.personal ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.personal && (
          <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
            {/* Photo settings & upload */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative group shrink-0">
                  {cvData.personalInfo.photoUrl ? (
                    <img 
                      src={cvData.personalInfo.photoUrl} 
                      alt="Profil" 
                      className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-xs" 
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 border border-slate-300">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Profil Fotoşəkili</span>
                    <label className="flex items-center gap-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showPhoto}
                        onChange={(e) => setShowPhoto(e.target.checked)}
                        className="w-3.5 h-3.5 text-emerald-600 rounded"
                      />
                      <span className="text-[11px] text-slate-500 font-medium">CV-də göstər</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tövsiyə: Yüksək keyfiyyətli, işgüzar portret (maks. 5MB)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <label className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Şəkil Seç</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </label>
                {cvData.personalInfo.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setCvData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, photoUrl: undefined } }))}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Şəkli sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Ad və Soyad *</label>
                <input
                  type="text"
                  placeholder="məs: Rəşad Quliyev"
                  value={cvData.personalInfo.fullName}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">İxtisas / Vəzifə Başlığı *</label>
                <input
                  type="text"
                  placeholder="məs: Senior Java Developer"
                  value={cvData.personalInfo.jobTitle}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, jobTitle: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">E-poçt ünvanı *</label>
                <input
                  type="email"
                  placeholder="reshad.quliyev@example.com"
                  value={cvData.personalInfo.email}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, email: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Əlaqə Nömrəsi *</label>
                <input
                  type="tel"
                  placeholder="+994 50 123 45 67"
                  value={cvData.personalInfo.phone}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Şəhər / Ünvan</label>
                <input
                  type="text"
                  placeholder="Bakı, Azərbaycan"
                  value={cvData.personalInfo.address}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, address: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">LinkedIn Profili</label>
                <input
                  type="text"
                  placeholder="linkedin.com/in/profil"
                  value={cvData.personalInfo.linkedin || ''}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">GitHub / Behance / Link</label>
                <input
                  type="text"
                  placeholder="github.com/profil"
                  value={cvData.personalInfo.github || ''}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, github: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Portfolio Vebsaytı</label>
                <input
                  type="text"
                  placeholder="portfolio.az"
                  value={cvData.personalInfo.portfolio || ''}
                  onChange={(e) => setCvData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, portfolio: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Summary with AI Assistant */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Haqqımda / Peşəkar Xülasə (Professional Summary)
                </label>
                <button
                  type="button"
                  onClick={handleImproveSummaryWithAI}
                  disabled={improvingSummary}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 disabled:opacity-50"
                  title="AI ilə peşəkar, cəlbedici xülasə mətni yarat"
                >
                  {improvingSummary ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  )}
                  <span>{improvingSummary ? 'Hazırlanır...' : '✨ AI ilə Xülasə Yaz'}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={cvData.personalInfo.summary}
                onChange={(e) => setCvData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, summary: e.target.value }
                }))}
                placeholder="Özünüz, əsas sahəniz, təcrübə iliniz və ən böyük nailiyyətləriniz haqqında 2-4 cümləlik güclü xülasə..."
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-xs text-slate-900 leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. İŞ TƏCRÜBƏSİ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('experience')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">İş Təcrübəsi</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {cvData.experiences.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">İş yerləri, vəzifələr və əsas nailiyyətlər</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expandedSections.experience ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.experience && (
          <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Təcrübələrinizi ən son işinizdən başlayaraq qeyd edin.
              </span>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>İş Yeri Əlavə Et</span>
              </button>
            </div>

            {cvData.experiences.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">İş təcrübəsi qeyd olunmayıb</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Tələbə və ya yeni məzun olsanız, təcrübə proqramlarını və ya layihələri əlavə edə bilərsiniz.</p>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Təcrübə Əlavə Et
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cvData.experiences.map((exp, idx) => (
                  <div 
                    key={exp.id} 
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {exp.position || 'Vəzifə'} — {exp.company || 'Şirkət'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Bu təcrübəni sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Şirkət / Müəssisə Adı *</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCvData(prev => ({
                              ...prev,
                              experiences: prev.experiences.map(item => item.id === exp.id ? { ...item, company: val } : item)
                            }));
                          }}
                          placeholder="məs: Kapital Bank ASC"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Vəzifə *</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCvData(prev => ({
                              ...prev,
                              experiences: prev.experiences.map(item => item.id === exp.id ? { ...item, position: val } : item)
                            }));
                          }}
                          placeholder="məs: Java Mühəndisi"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-slate-700 font-bold mb-1">Başlama Tarixi</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCvData(prev => ({
                                ...prev,
                                experiences: prev.experiences.map(item => item.id === exp.id ? { ...item, startDate: val } : item)
                              }));
                            }}
                            placeholder="məs: 03.2021"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-slate-700 font-bold mb-1">Bitmə Tarixi</label>
                          <input
                            type="text"
                            disabled={exp.current}
                            value={exp.current ? 'İndiyədək' : exp.endDate || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCvData(prev => ({
                                ...prev,
                                experiences: prev.experiences.map(item => item.id === exp.id ? { ...item, endDate: val } : item)
                              }));
                            }}
                            placeholder="məs: 09.2023"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!exp.current}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setCvData(prev => ({
                                ...prev,
                                experiences: prev.experiences.map(item => item.id === exp.id ? { ...item, current: checked, endDate: checked ? '' : item.endDate } : item)
                              }));
                            }}
                            className="w-4 h-4 rounded text-blue-600"
                          />
                          <span className="font-bold text-slate-700">Hazırda burada işləyirəm</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Öhdəliklər və Nailiyyətlər (Maddə işarələri ilə)
                        </label>
                        <button
                          type="button"
                          onClick={() => handleImproveExpWithAI(exp)}
                          disabled={improvingExpId === exp.id}
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          {improvingExpId === exp.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-purple-600" />
                          )}
                          <span>✨ AI ilə Nailiyyət Yaz</span>
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={exp.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCvData(prev => ({
                            ...prev,
                            experiences: prev.experiences.map(item => item.id === exp.id ? { ...item, description: val } : item)
                          }));
                        }}
                        placeholder="• Nəticəyönümlü öhdəliklər və nailiyyətlər..."
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 leading-relaxed font-normal"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. TƏHSİL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('education')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Təhsil</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {cvData.education.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">Universitet, dərəcə və ixtisas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expandedSections.education ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.education && (
          <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Ali təhsil və ya kollec məlumatlarınızı daxil edin.
              </span>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Təhsil Əlavə Et</span>
              </button>
            </div>

            <div className="space-y-3">
              {cvData.education.map((edu, idx) => (
                <div key={edu.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                    <span className="text-xs font-bold text-slate-800">
                      {edu.institution || 'Müəssisə'} — {edu.fieldOfStudy || 'İxtisas'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Universitet / Məktəb *</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCvData(prev => ({
                            ...prev,
                            education: prev.education.map(item => item.id === edu.id ? { ...item, institution: val } : item)
                          }));
                        }}
                        placeholder="məs: Bakı Dövlət Universiteti"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Dərəcə & İxtisas *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCvData(prev => ({
                              ...prev,
                              education: prev.education.map(item => item.id === edu.id ? { ...item, degree: val } : item)
                            }));
                          }}
                          placeholder="Bakalavr / Magistr"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                        />
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCvData(prev => ({
                              ...prev,
                              education: prev.education.map(item => item.id === edu.id ? { ...item, fieldOfStudy: val } : item)
                            }));
                          }}
                          placeholder="Kompüter Elmləri"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Başlama İli</label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCvData(prev => ({
                              ...prev,
                              education: prev.education.map(item => item.id === edu.id ? { ...item, startDate: val } : item)
                            }));
                          }}
                          placeholder="2018"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Bitmə İli</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCvData(prev => ({
                              ...prev,
                              education: prev.education.map(item => item.id === edu.id ? { ...item, endDate: val } : item)
                            }));
                          }}
                          placeholder="2022"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">GPA / Orta Qiymət (İstəyə görə)</label>
                      <input
                        type="text"
                        value={edu.gpa || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCvData(prev => ({
                            ...prev,
                            education: prev.education.map(item => item.id === edu.id ? { ...item, gpa: val } : item)
                          }));
                        }}
                        placeholder="məs: 3.8 / 4.0 və ya 92 / 100"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. BACARIQLAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('skills')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Bacarıqlar və Alətlər</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {cvData.skills.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">Texniki, proqram və fərdi səriştələr</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expandedSections.skills ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.skills && (
          <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
            {/* Input to add skills */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkillFromInput()}
                placeholder="Yeni bacarıq yazın və Enter basın (məs: PostgreSQL, Figma, Danışıqlar)..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkillFromInput}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-2xs inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Əlavə et
              </button>
            </div>

            {/* Current skills tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {cvData.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold"
                >
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="text-purple-400 hover:text-purple-800 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Quick Suggestions */}
            {suggestedSkills.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Tövsiyə olunan açar sözlər (kliklə əlavə et):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkills.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setCvData(prev => ({
                          ...prev,
                          skills: [...prev.skills, { id: `sk-${Date.now()}-${s}`, name: s, level: 'Yaxşı', category: 'Texniki' }]
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-slate-600 text-[11px] font-semibold transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. DİLLƏR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('languages')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Xarici Dillər</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {cvData.languages.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">Bildiyiniz dillər və səviyyələri</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expandedSections.languages ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.languages && (
          <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Məsələn: Azərbaycan dili (Ana dili), İngilis dili (C1-C2)</span>
              <button
                type="button"
                onClick={handleAddLanguage}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Dil Əlavə Et
              </button>
            </div>

            <div className="space-y-2">
              {cvData.languages.map((lang) => (
                <div key={lang.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={lang.language || (lang as any).name || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCvData(prev => ({
                          ...prev,
                          languages: prev.languages.map(l => l.id === lang.id ? { ...l, language: val, name: val } : l)
                        }));
                      }}
                      placeholder="Dilin adı"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                    />
                    <input
                      type="text"
                      value={lang.proficiency || (lang as any).level || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCvData(prev => ({
                          ...prev,
                          languages: prev.languages.map(l => l.id === lang.id ? { ...l, proficiency: val, level: val } : l)
                        }));
                      }}
                      placeholder="Səviyyə (məs: C1-C2 Sərbəst, Ana dili)"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. LAYİHƏLƏR & PORTFOLIO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('projects')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Layihələr & Portfolio</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {cvData.projects?.length || 0}
                </span>
              </div>
              <p className="text-xs text-slate-500">Real layihələr və iş nümunələri</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expandedSections.projects ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.projects && (
          <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Müstəqil və ya komanda ilə hazırladığınız layihələr</span>
              <button
                type="button"
                onClick={handleAddProject}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Layihə Əlavə Et
              </button>
            </div>

            <div className="space-y-3">
              {(cvData.projects || []).map((proj) => (
                <div key={proj.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCvData(prev => ({
                          ...prev,
                          projects: (prev.projects || []).map(p => p.id === proj.id ? { ...p, title: val } : p)
                        }));
                      }}
                      placeholder="Layihənin adı"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold flex-1 mr-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(proj.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={proj.link || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCvData(prev => ({
                        ...prev,
                        projects: (prev.projects || []).map(p => p.id === proj.id ? { ...p, link: val } : p)
                      }));
                    }}
                    placeholder="Layihə linki (məs: https://layihe.az)"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-[11px]"
                  />
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCvData(prev => ({
                        ...prev,
                        projects: (prev.projects || []).map(p => p.id === proj.id ? { ...p, description: val } : p)
                      }));
                    }}
                    placeholder="Layihənin məqsədi və gətirdiyi fayda..."
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. SERTİFİKATLAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('certificates')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Sertifikatlar & Təlimlər</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {cvData.certificates?.length || 0}
                </span>
              </div>
              <p className="text-xs text-slate-500">Beynəlxalq və yerli peşəkar sertifikatlar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expandedSections.certificates ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {expandedSections.certificates && (
          <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Əldə etdiyiniz peşəkar sertifikatları əlavə edin</span>
              <button
                type="button"
                onClick={handleAddCertificate}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Sertifikat Əlavə Et
              </button>
            </div>

            <div className="space-y-2">
              {(cvData.certificates || []).map((cert) => (
                <div key={cert.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCvData(prev => ({
                          ...prev,
                          certificates: (prev.certificates || []).map(c => c.id === cert.id ? { ...c, name: val } : c)
                        }));
                      }}
                      placeholder="Sertifikat adı"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                    />
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCvData(prev => ({
                          ...prev,
                          certificates: (prev.certificates || []).map(c => c.id === cert.id ? { ...c, issuer: val } : c)
                        }));
                      }}
                      placeholder="Verən təşkilat"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      value={cert.issueDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCvData(prev => ({
                          ...prev,
                          certificates: (prev.certificates || []).map(c => c.id === cert.id ? { ...c, issueDate: val } : c)
                        }));
                      }}
                      placeholder="İl (məs: 2023)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertificate(cert.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
