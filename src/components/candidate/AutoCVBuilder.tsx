import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Printer,
  FileDown,
  Copy,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Wrench,
  User,
} from 'lucide-react';
import { CVAnalysisResult } from '../../types';

interface AutoCVBuilderProps {
  initialData?: CVAnalysisResult | null;
  onNavigateBack?: () => void;
}

interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  period: string;
  responsibilities: string;
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  period: string;
}

export const AutoCVBuilder: React.FC<AutoCVBuilderProps> = ({ initialData, onNavigateBack }) => {
  const cvPrintRef = useRef<HTMLDivElement>(null);

  // CV Form States
  const [fullName, setFullName] = useState('Murad Əliyev');
  const [targetRole, setTargetRole] = useState('Senior Frontend Developer');
  const [email, setEmail] = useState('murad.aliyev@email.com');
  const [phone, setPhone] = useState('+994 50 123 45 67');
  const [location, setLocation] = useState('Bakı, Azərbaycan');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/murad-aliyev');
  const [summary, setSummary] = useState(
    '5+ il təcrübəyə malik, yüksək performanslı veb və mobil interfeyslərin qurulmasında ixtisaslaşmış proqram təminatı mühəndisi. React, TypeScript və müasir bulud həlləri ilə istifadəçi təcrübəsini optimallaşdırmaqda və sistem arxitekturasını miqyaslandırmaqda sübut edilmiş uğurlara malikdir.'
  );

  const [experiences, setExperiences] = useState<ExperienceEntry[]>([
    {
      id: '1',
      company: 'Tech Solutions MMC',
      role: 'Senior Frontend Developer',
      period: '2023 - Hazırda',
      responsibilities:
        '• React 18 və TypeScript ilə yüksək yüklü platformanın arxitekturasını yenidən qurdu, səhifə açılış sürətini 40% artırdı.\n• Komanda daxilində kod keyfiyyətini və test əhatəliliyini 85%-ə çatdırdı.\n• REST və GraphQL API inteqrasiyalarını idarə edərək server sorğularını 25% azaltdı.',
    },
    {
      id: '2',
      company: 'Digital Innovation Lab',
      role: 'Frontend Developer',
      period: '2021 - 2023',
      responsibilities:
        '• 10+ korporativ müştəri üçün responsiv və müasir veb tətbiqlər hazırladı.\n• UI komponent kitabxanasını inkişaf etdirərək komandanın təhvil müddətini 30% sürətləndirdi.',
    },
  ]);

  const [educations, setEducations] = useState<EducationEntry[]>([
    {
      id: '1',
      institution: 'Azərbaycan Dövlət Neft və Sənaye Universiteti (ADNSU)',
      degree: 'Bakalavr',
      fieldOfStudy: 'Kompüter Mühəndisliyi',
      period: '2017 - 2021',
    },
  ]);

  const [skills, setSkills] = useState('JavaScript, TypeScript, React, Next.js, Redux, Tailwind CSS, Node.js, Git, REST API, Docker');
  const [languages, setLanguages] = useState('Azərbaycan dili (Ana dili), İngilis dili (C1 Peşəkar), Rus dili (B2 Sərbəst)');
  const [certifications, setCertifications] = useState('AWS Certified Solutions Architect, Meta Frontend Professional Certificate, Scrum Fundamentals');

  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const [copied, setCopied] = useState(false);

  // Auto-populate from analysis if initialData is provided
  useEffect(() => {
    if (initialData) {
      populateFromAnalysisData(initialData);
    }
  }, [initialData]);

  const populateFromAnalysisData = (data: CVAnalysisResult) => {
    if (data.candidateName && data.candidateName !== 'Namizəd') {
      setFullName(data.candidateName);
    }
    if (data.detectedRole) {
      setTargetRole(data.detectedRole);
    }
    if (data.suggestedProfileSummary) {
      setSummary(data.suggestedProfileSummary);
    }

    // Populate experiences
    if (data.experienceHistory && data.experienceHistory.length > 0) {
      const mapped: ExperienceEntry[] = data.experienceHistory.map((exp, idx) => ({
        id: String(idx + 1),
        company: exp.company || 'Şirkət',
        role: exp.role || 'Vəzifə',
        period: exp.period || 'Müddət',
        responsibilities: exp.responsibilities?.length
          ? exp.responsibilities.map((r) => `• ${r}`).join('\n')
          : '• Əsas fəaliyyət və layihələr üzərində iş.',
      }));
      setExperiences(mapped);
    }

    // Populate educations
    if (data.educationHistory && data.educationHistory.length > 0) {
      const mappedEdu: EducationEntry[] = data.educationHistory.map((edu, idx) => ({
        id: String(idx + 1),
        institution: edu.institution || 'Təhsil Müəssisəsi',
        degree: edu.degree || 'Dərəcə',
        fieldOfStudy: edu.fieldOfStudy || 'İxtisas',
        period: edu.period || 'İllər',
      }));
      setEducations(mappedEdu);
    }

    // Populate skills
    if (data.skillsFound && data.skillsFound.length > 0) {
      const allSkills = data.skillsFound.flatMap((c) => c.skills);
      if (allSkills.length > 0) {
        setSkills(allSkills.join(', '));
      }
    }
  };

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        company: 'Yeni Şirkət',
        role: 'Vəzifə',
        period: '2023 - Hazırda',
        responsibilities: '• Əsas layihələrin həyata keçirilməsi və nailiyyətlər...',
      },
    ]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const handleUpdateExperience = (id: string, field: keyof ExperienceEntry, value: string) => {
    setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleAddEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now().toString(),
        institution: 'Universitet / Məktəb',
        degree: 'Bakalavr',
        fieldOfStudy: 'İxtisas',
        period: '2018 - 2022',
      },
    ]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducations(educations.filter((e) => e.id !== id));
  };

  const handleUpdateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setEducations(educations.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textCV = `
${fullName.toUpperCase()}
${targetRole}
${email} | ${phone} | ${location} | ${linkedin}

XÜLASƏ:
${summary}

İŞ TƏCRÜBƏSİ:
${experiences
  .map(
    (exp) => `
${exp.role} @ ${exp.company} (${exp.period})
${exp.responsibilities}
`
  )
  .join('\n')}

TƏHSİL:
${educations
  .map(
    (edu) => `
${edu.degree} - ${edu.fieldOfStudy}
${edu.institution} (${edu.period})
`
  )
  .join('\n')}

BACARIQLAR:
${skills}

DİLLƏR:
${languages}

SERTİFİKATLAR:
${certifications}
    `.trim();

    navigator.clipboard.writeText(textCV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${fullName} - CV</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; line-height: 1.5; color: #1e293b; }
          h1 { margin-bottom: 2px; color: #0f172a; font-size: 24pt; }
          h2 { color: #334155; font-size: 14pt; margin-top: 2px; border-bottom: 1.5pt solid #cbd5e1; padding-bottom: 4px; }
          h3 { color: #1e3a8a; font-size: 12pt; margin-top: 14pt; margin-bottom: 4pt; border-bottom: 1pt solid #2563eb; padding-bottom: 2pt; text-transform: uppercase; }
          p.contact { font-size: 10pt; color: #64748b; margin-top: 2px; }
          p.summary { font-size: 10.5pt; color: #334155; text-align: justify; }
          .job-title { font-weight: bold; font-size: 11pt; color: #0f172a; }
          .company { color: #2563eb; font-weight: bold; }
          .period { font-style: italic; color: #64748b; font-size: 10pt; }
          ul { margin-top: 3pt; margin-bottom: 8pt; padding-left: 20px; }
          li { font-size: 10pt; margin-bottom: 3pt; }
        </style>
      </head>
      <body>
        <h1>${fullName}</h1>
        <h2>${targetRole}</h2>
        <p class="contact">${email} | ${phone} | ${location} | ${linkedin}</p>

        <h3>Peşəkar Xülasə</h3>
        <p class="summary">${summary}</p>

        <h3>İş Təcrübəsi</h3>
        ${experiences
          .map(
            (e) => `
          <p><span class="job-title">${e.role}</span> — <span class="company">${e.company}</span> <span class="period">(${e.period})</span></p>
          <ul>
            ${e.responsibilities
              .split('\n')
              .filter((r) => r.trim())
              .map((r) => `<li>${r.replace(/^•\s*/, '')}</li>`)
              .join('')}
          </ul>
        `
          )
          .join('')}

        <h3>Təhsil</h3>
        ${educations
          .map(
            (edu) => `
          <p><strong>${edu.degree}</strong>, ${edu.fieldOfStudy} — <em>${edu.institution}</em> (${edu.period})</p>
        `
          )
          .join('')}

        <h3>Bacarıqlar</h3>
        <p>${skills}</p>

        <h3>Dillər</h3>
        <p>${languages}</p>

        <h3>Sertifikatlar</h3>
        <p>${certifications}</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${fullName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const textCV = `
${fullName.toUpperCase()}
${targetRole}
${email} | ${phone} | ${location} | ${linkedin}

XÜLASƏ:
${summary}

İŞ TƏCRÜBƏSİ:
${experiences
  .map(
    (exp) => `
${exp.role} @ ${exp.company} (${exp.period})
${exp.responsibilities}
`
  )
  .join('\n')}

TƏHSİL:
${educations
  .map(
    (edu) => `
${edu.degree} - ${edu.fieldOfStudy}
${edu.institution} (${edu.period})
`
  )
  .join('\n')}

BACARIQLAR:
${skills}

DİLLƏR:
${languages}

SERTİFİKATLAR:
${certifications}
    `.trim();

    const blob = new Blob([textCV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${fullName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="auto-cv-builder-section" className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Ağıllı CV Qurucu & Redaktor</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
            CV analizi nəticələri əsasında avtomatik doldurulmuş məlumatları redaktə edin, müasir şablon seçin və birbaşa PDF / Word (.doc) kimi ixrac edin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateBack && (
            <button
              type="button"
              onClick={onNavigateBack}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
            >
              &larr; Analizə Qayıt
            </button>
          )}

          {initialData && (
            <button
              type="button"
              onClick={() => populateFromAnalysisData(initialData)}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Analizdən Doldur</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Çap / PDF Yadda Saxla</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDoc}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Word (.doc) İndir</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Column: Left = Form Inputs, Right = Live CV Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: CV Data Input Form */}
        <div className="lg:col-span-6 space-y-5">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">Şəxsi Məlumatlar</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Ad və Soyad</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Hədəf Vəzifə</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Telefon</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Məkan / Şəhər</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">LinkedIn və ya Portfel</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Peşəkar Xülasə (Summary / Bio)</label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Work Experience Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">İş Təcrübəsi</h4>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>İş Yeri Əlavə Et</span>
              </button>
            </div>

            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">İş Yeri #{exp.id}</span>
                    {experiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Vəzifə"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Şirkət adı"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Dövr (məs: 2021 - 2023)"
                      value={exp.period}
                      onChange={(e) => handleUpdateExperience(exp.id, 'period', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      placeholder="Öhdəliklər və nailiyyətlər (hər sətirdə bir maddə)"
                      value={exp.responsibilities}
                      onChange={(e) => handleUpdateExperience(exp.id, 'responsibilities', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Təhsil Məlumatları</h4>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Təhsil Əlavə Et</span>
              </button>
            </div>

            <div className="space-y-3">
              {educations.map((edu) => (
                <div key={edu.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Təhsil Pilləsi</span>
                    {educations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Müəssisə (ADNSU, BDU...)"
                      value={edu.institution}
                      onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Dərəcə (Bakalavr, Magistr...)"
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="İxtisas sahəsi"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleUpdateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Dövr (məs: 2017 - 2021)"
                      value={edu.period}
                      onChange={(e) => handleUpdateEducation(edu.id, 'period', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills, Languages & Certifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Wrench className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">Bacarıqlar, Dillər və Sertifikatlar</h4>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Açar Bacarıqlar (vergüllə ayrılmış)</label>
              <textarea
                rows={2}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, SQL, Agile..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Dillər</label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="Azərbaycan dili (Ana dili), İngilis dili (C1)..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Sertifikatlar və Nailiyyətlər</label>
              <input
                type="text"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="AWS Certified, Scrum Master..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Live CV Preview Document */}
        <div className="lg:col-span-6 space-y-4 sticky top-6">
          {/* Template Selector & Action Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Şablon:</span>
              <button
                type="button"
                onClick={() => setSelectedTemplate('modern')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedTemplate === 'modern' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Müasir
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('classic')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedTemplate === 'classic' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Klassik
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('minimal')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedTemplate === 'minimal' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Minimal
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyText}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Mətni kopyala"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Mətn kimi (.txt) yüklə"
              >
                .TXT
              </button>
              <button
                type="button"
                onClick={handleDownloadDoc}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Word kimi (.doc) yüklə"
              >
                .DOC
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                title="Çap / PDF Yadda saxla"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Çap / PDF</span>
              </button>
            </div>
          </div>

          {/* Printable Document Box */}
          <div
            ref={cvPrintRef}
            id="printable-cv-document"
            className={`bg-white rounded-xl shadow-lg border border-slate-300 p-8 sm:p-10 font-sans text-slate-800 transition-all ${
              selectedTemplate === 'classic' ? 'font-serif border-slate-400' : ''
            }`}
          >
            {/* Header / Name / Title */}
            <div
              className={`pb-4 mb-4 border-b ${
                selectedTemplate === 'modern'
                  ? 'border-indigo-600 border-b-2'
                  : selectedTemplate === 'minimal'
                  ? 'border-slate-300'
                  : 'border-slate-800 border-b-2 text-center'
              }`}
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {fullName || 'Ad Soyad'}
              </h1>
              <p
                className={`text-sm sm:text-base font-bold mt-0.5 ${
                  selectedTemplate === 'modern' ? 'text-indigo-600' : 'text-slate-700'
                }`}
              >
                {targetRole || 'Vəzifə'}
              </p>
              <div
                className={`flex flex-wrap gap-2 text-xs text-slate-600 mt-2 ${
                  selectedTemplate === 'classic' ? 'justify-center' : ''
                }`}
              >
                {email && <span>{email}</span>}
                {phone && <span>• {phone}</span>}
                {location && <span>• {location}</span>}
                {linkedin && <span>• {linkedin}</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="mb-5">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    selectedTemplate === 'modern'
                      ? 'text-indigo-700 font-extrabold'
                      : 'text-slate-900 border-b border-slate-200 pb-0.5'
                  }`}
                >
                  Peşəkar Xülasə
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed text-justify">{summary}</p>
              </div>
            )}

            {/* Work Experience */}
            {experiences.length > 0 && (
              <div className="mb-5 space-y-3">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                    selectedTemplate === 'modern'
                      ? 'text-indigo-700 font-extrabold'
                      : 'text-slate-900 border-b border-slate-200 pb-0.5'
                  }`}
                >
                  İş Təcrübəsi
                </h2>
                {experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex items-start justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{exp.role}</span>{' '}
                        <span className="text-slate-400">@</span>{' '}
                        <span className="font-semibold text-indigo-700">{exp.company}</span>
                      </div>
                      <span className="text-slate-500 font-medium shrink-0 italic">{exp.period}</span>
                    </div>
                    {exp.responsibilities && (
                      <ul className="text-xs text-slate-700 space-y-0.5 pl-4 list-disc marker:text-indigo-500">
                        {exp.responsibilities
                          .split('\n')
                          .filter((r) => r.trim())
                          .map((r, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {r.replace(/^•\s*/, '')}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <div className="mb-5 space-y-2">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    selectedTemplate === 'modern'
                      ? 'text-indigo-700 font-extrabold'
                      : 'text-slate-900 border-b border-slate-200 pb-0.5'
                  }`}
                >
                  Təhsil
                </h2>
                {educations.map((edu) => (
                  <div key={edu.id} className="flex items-start justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{edu.degree}</span> -{' '}
                      <span className="font-semibold text-slate-800">{edu.fieldOfStudy}</span>
                      <p className="text-[11px] text-slate-600">{edu.institution}</p>
                    </div>
                    <span className="text-slate-500 italic shrink-0">{edu.period}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {skills && (
              <div className="mb-4">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    selectedTemplate === 'modern'
                      ? 'text-indigo-700 font-extrabold'
                      : 'text-slate-900 border-b border-slate-200 pb-0.5'
                  }`}
                >
                  Bacarıqlar
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">{skills}</p>
              </div>
            )}

            {/* Languages & Certifications */}
            {(languages || certifications) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                {languages && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Dillər:</span>
                    <span className="text-slate-700">{languages}</span>
                  </div>
                )}
                {certifications && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Sertifikatlar:</span>
                    <span className="text-slate-700">{certifications}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
