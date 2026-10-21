import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  Download,
  Sparkles,
  Clipboard,
  Layers,
  ArrowRight,
  Loader2,
  Trash2,
  Cpu,
  Check,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  Globe2,
  Award,
  Code,
  FolderGit2,
  Paperclip,
  Clock,
  Calendar,
  Building,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  SmartCandidate,
  Vacancy,
  RecruitmentCriteria,
  CandidateWorkExperience,
  CandidateEducation,
  CandidateCertification,
  CandidateProject,
  SmartCandidatePipelineStage
} from '../../../types';
import {
  parseUploadedFilesWithAI,
  parseRawTextWithAI,
  parseRawTextToCandidate,
  downloadSampleCSVTemplate,
  SAMPLE_DEMO_CANDIDATES,
  fileToBase64
} from '../../../utils/cvParserHelper';
import { safeAlert } from '../../../utils/dialogHelper';

interface UploadCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCandidates: (candidates: SmartCandidate[]) => void;
  vacancies?: Vacancy[];
  targetCriteria?: RecruitmentCriteria;
}

export const UploadCVModal: React.FC<UploadCVModalProps> = ({
  isOpen,
  onClose,
  onAddCandidates,
  vacancies = [],
  targetCriteria,
}) => {
  const [activeTab, setActiveTab] = useState<'bulk-file' | 'manual' | 'paste'>('bulk-file');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [progressStatus, setProgressStatus] = useState<{
    current: number;
    total: number;
    fileName: string;
    statusText: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualFileInputRef = useRef<HTMLInputElement>(null);

  // Paste Text State
  const [pasteText, setPasteText] = useState('');

  // -------------------------------------------------------------
  // COMPREHENSIVE MANUAL FORM STATE
  // -------------------------------------------------------------
  const [manualForm, setManualForm] = useState({
    // Section 1: Personal & Contact
    fullName: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    gender: 'Kişi' as 'Kişi' | 'Qadın',
    maritalStatus: 'Subay' as 'Subay' | 'Ailəli',
    militaryStatus: 'Hərbi xidmətdə olub' as string,
    drivingLicense: 'B',
    email: '',
    phone: '',
    birthDate: '',
    city: 'Bakı',
    country: 'Azərbaycan',
    address: '',
    linkedinUrl: '',
    portfolioUrl: '',

    // Section 2: Professional Profile
    jobTitle: '',
    alternativeTitles: '',
    careerLevel: 'Middle' as 'Junior' | 'Middle' | 'Senior' | 'Lead' | 'Executive' | 'Stajor',
    experienceYears: 2,
    summary: '',

    // Section 3: Compensation & Employment
    employmentStatus: 'Aktiv axtarır',
    availabilityDate: 'Dərhal hazır',
    preferredWorkModes: ['Hibrid'] as string[],
    preferredJobTypes: ['Tam ştat'] as string[],
    minSalary: 1000,
    expectedSalary: 1500,
    maxSalary: 2000,
    currency: 'AZN',
    salaryPeriod: 'Aylıq Net',
    relocationPreference: false,
    travelPreference: false,

    // Section 4: Skills
    skills: '',
    softSkills: '',
    toolsAndTechnologies: '',

    // Section 5: Pipeline & Notes
    pipelineStage: 'sourced' as SmartCandidatePipelineStage,
    tags: '',
    notes: '',
  });

  // Dynamic Lists for Manual Entry
  const [workExperiences, setWorkExperiences] = useState<CandidateWorkExperience[]>([
    {
      id: 'exp-' + Date.now(),
      companyName: '',
      jobTitle: '',
      industry: '',
      startDate: '',
      endDate: '',
      isCurrent: true,
      city: 'Bakı',
      responsibilities: '',
      achievements: '',
      toolsUsed: [],
    },
  ]);

  const [educationHistory, setEducationHistory] = useState<CandidateEducation[]>([
    {
      id: 'edu-' + Date.now(),
      institution: '',
      degree: 'Bakalavr',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      gpa: '',
      city: 'Bakı',
    },
  ]);

  const [languages, setLanguages] = useState<{ language: string; level: string }[]>([
    { language: 'Azərbaycan', level: 'Ana dili' },
    { language: 'İngilis', level: 'B2' },
  ]);

  const [certifications, setCertifications] = useState<CandidateCertification[]>([]);
  const [projects, setProjects] = useState<CandidateProject[]>([]);

  // Attached Physical CV File for Manual Entry
  const [attachedFile, setAttachedFile] = useState<{
    file: File;
    name: string;
    size: number;
    type: string;
    dataUrl: string;
  } | null>(null);

  if (!isOpen) return null;

  // File Handlers for Bulk File Upload
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Physical file attachment for manual entry
  const handleManualFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const dataUrl = await fileToBase64(file);
        setAttachedFile({
          file,
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          dataUrl,
        });
      } catch (err) {
        safeAlert('Fayl oxuna bilmədi.');
      }
    }
  };

  // Add/Remove Dynamic List Helpers
  const handleAddExperience = () => {
    setWorkExperiences(prev => [
      ...prev,
      {
        id: 'exp-' + Date.now() + Math.random(),
        companyName: '',
        jobTitle: '',
        industry: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        city: 'Bakı',
        responsibilities: '',
        achievements: '',
        toolsUsed: [],
      },
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    setWorkExperiences(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddEducation = () => {
    setEducationHistory(prev => [
      ...prev,
      {
        id: 'edu-' + Date.now() + Math.random(),
        institution: '',
        degree: 'Bakalavr',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        gpa: '',
        city: 'Bakı',
      },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducationHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddLanguage = () => {
    setLanguages(prev => [...prev, { language: '', level: 'B1' }]);
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCertification = () => {
    setCertifications(prev => [
      ...prev,
      {
        id: 'cert-' + Date.now(),
        name: '',
        issuer: '',
        issueDate: '',
        credentialId: '',
      },
    ]);
  };

  const handleRemoveCertification = (index: number) => {
    setCertifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProject = () => {
    setProjects(prev => [
      ...prev,
      {
        id: 'proj-' + Date.now(),
        title: '',
        role: '',
        technologies: [],
        description: '',
        link: '',
      },
    ]);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  // Process selected bulk files with AI
  const handleProcessBulkFiles = async () => {
    if (selectedFiles.length === 0) {
      safeAlert('Zəhmət olmasa ən azı bir fayl seçin və ya yükləyin.');
      return;
    }

    try {
      setIsProcessing(true);
      setProgressStatus({
        current: 0,
        total: selectedFiles.length,
        fileName: selectedFiles[0]?.name || '',
        statusText: 'AI Təhlili başladılır...',
      });

      const parsedCandidates = await parseUploadedFilesWithAI(
        selectedFiles,
        vacancies,
        targetCriteria,
        (current, total, fileName, statusText) => {
          setProgressStatus({ current, total, fileName, statusText });
        }
      );

      if (parsedCandidates.length === 0) {
        throw new Error('Fayllardan namizəd məlumatları oxuna bilmədi.');
      }

      onAddCandidates(parsedCandidates);
      setSelectedFiles([]);
      setProgressStatus(null);
      onClose();
    } catch (err: any) {
      safeAlert(err.message || 'Fayllar AI ilə emal edilərkən xəta baş verdi.');
    } finally {
      setIsProcessing(false);
      setProgressStatus(null);
    }
  };

  // Process manual comprehensive entry
  const handleSaveManualCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.fullName.trim() || !manualForm.jobTitle.trim()) {
      safeAlert('Zəhmət olmasa namizədin adını və əsas vəzifəsini daxil edin.');
      return;
    }

    const title = manualForm.jobTitle.trim();
    const skillsArray = manualForm.skills
      .split(/[,;]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const softSkillsArray = manualForm.softSkills
      .split(/[,;]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const toolsArray = manualForm.toolsAndTechnologies
      .split(/[,;]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const altTitlesArray = manualForm.alternativeTitles
      .split(/[,;]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const tagsArray = manualForm.tags
      .split(/[,;]+/)
      .map(s => s.trim())
      .filter(Boolean);

    // Filter valid work experiences
    const validExperiences = workExperiences.filter(exp => exp.companyName.trim() || exp.jobTitle.trim());

    // Filter valid education entries
    const validEducation = educationHistory.filter(edu => edu.institution.trim());

    // Filter valid languages
    const validLanguages = languages.filter(l => l.language.trim());

    // Vacancy matching
    let bestMatchingVacancyId: string | undefined;
    let bestMatchingVacancyTitle: string | undefined;
    let bestMatchScore = 75;
    if (vacancies && vacancies.length > 0) {
      const matched = vacancies.find(v =>
        v.title.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(v.title.toLowerCase())
      );
      if (matched) {
        bestMatchingVacancyId = matched.id;
        bestMatchingVacancyTitle = matched.title;
        bestMatchScore = 90;
      }
    }

    const newCandidate: SmartCandidate = {
      id: 'cand-man-' + Math.random().toString(36).substring(2, 9),
      fullName: manualForm.fullName.trim(),
      firstName: manualForm.firstName.trim() || manualForm.fullName.trim().split(' ')[0],
      lastName: manualForm.lastName.trim() || manualForm.fullName.trim().split(' ').slice(1).join(' '),
      fatherName: manualForm.fatherName.trim() || undefined,
      gender: manualForm.gender,
      maritalStatus: manualForm.maritalStatus,
      militaryStatus: manualForm.militaryStatus,
      drivingLicense: manualForm.drivingLicense || undefined,
      birthDate: manualForm.birthDate || undefined,
      linkedinUrl: manualForm.linkedinUrl.trim() || undefined,
      portfolioUrl: manualForm.portfolioUrl.trim() || undefined,
      email: manualForm.email.trim() || `namized.${Date.now().toString().slice(-4)}@jobia.az`,
      phone: manualForm.phone.trim() || '+994 50 000 00 00',
      jobTitle: title,
      suitablePositions: [title, ...altTitlesArray],
      bestMatchingVacancyId,
      bestMatchingVacancyTitle,
      bestMatchScore,
      matchRationale: bestMatchingVacancyTitle ? `«${bestMatchingVacancyTitle}» vakansiyasına uyğunlaşdırıldı.` : undefined,
      experienceYears: Number(manualForm.experienceYears) || 0,
      careerLevel: manualForm.careerLevel,
      summary: manualForm.summary.trim() || `${title} sahəsində ${manualForm.experienceYears} il təcrübəli namizəd.`,
      skills: skillsArray.length > 0 ? skillsArray : [title, 'Ümumi Bacarıqlar'],
      softSkills: softSkillsArray.length > 0 ? softSkillsArray : undefined,
      toolsAndTechnologies: toolsArray.length > 0 ? toolsArray : undefined,
      educationLevel: (validEducation[0]?.degree as any) || 'Bakalavr',
      educationDetails: validEducation[0] ? `${validEducation[0].institution} (${validEducation[0].degree})` : 'Ali Təhsil',
      expectedSalary: Number(manualForm.expectedSalary) || 0,
      minSalary: Number(manualForm.minSalary) || undefined,
      maxSalary: Number(manualForm.maxSalary) || undefined,
      currency: manualForm.currency || 'AZN',
      salaryPeriod: manualForm.salaryPeriod || 'Aylıq Net',
      location: manualForm.city ? `${manualForm.city}, ${manualForm.country}` : 'Bakı, Azərbaycan',
      employmentStatus: manualForm.employmentStatus,
      availabilityDate: manualForm.availabilityDate,
      preferredWorkModes: manualForm.preferredWorkModes,
      preferredJobTypes: manualForm.preferredJobTypes,
      relocationPreference: manualForm.relocationPreference,
      travelPreference: manualForm.travelPreference,
      languages: validLanguages.length > 0 ? validLanguages : [{ language: 'Azərbaycan', level: 'Ana dili' }],
      workExperiences: validExperiences.length > 0 ? validExperiences : undefined,
      educationHistory: validEducation.length > 0 ? validEducation : undefined,
      certifications: certifications.filter(c => c.name.trim()).length > 0 ? certifications.filter(c => c.name.trim()) : undefined,
      projects: projects.filter(p => p.title.trim()).length > 0 ? projects.filter(p => p.title.trim()) : undefined,
      sourceFormat: attachedFile ? 'pdf' : 'manual',
      fileName: attachedFile ? attachedFile.name : `${manualForm.fullName.replace(/\s+/g, '_')}_CV.pdf`,
      originalFileName: attachedFile ? attachedFile.name : undefined,
      fileDataUrl: attachedFile ? attachedFile.dataUrl : undefined,
      fileMimeType: attachedFile ? attachedFile.type : 'application/pdf',
      fileSize: attachedFile ? attachedFile.size : undefined,
      tags: tagsArray.length > 0 ? tagsArray : [title, 'Əl ilə əlavə'],
      pipelineStage: manualForm.pipelineStage,
      notes: manualForm.notes.trim() || `Əl ilə daxil edilmiş namizəd: ${title}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddCandidates([newCandidate]);
    onClose();
  };

  // Process pasted raw CV text with AI
  const handleParsePastedText = async () => {
    if (!pasteText.trim()) {
      safeAlert('Zəhmət olmasa namizədin CV mətnini daxil edin.');
      return;
    }

    try {
      setIsProcessing(true);
      const candidate = await parseRawTextWithAI(pasteText, 'yapışdırılmış_cv.txt', vacancies, targetCriteria);
      onAddCandidates([candidate]);
      setPasteText('');
      onClose();
    } catch (err: any) {
      console.warn('AI paste error, fallback:', err);
      const candidate = parseRawTextToCandidate(pasteText, 'yapışdırılmış_cv.txt');
      onAddCandidates([candidate]);
      setPasteText('');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  // 1-Click Load Demo Candidates
  const handleLoadDemoCandidates = () => {
    const freshDemo = SAMPLE_DEMO_CANDIDATES.map((c, idx) => ({
      ...c,
      id: `cand-demo-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
    }));
    onAddCandidates(freshDemo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  CV Data Warehouse & Kadr İdxalı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Gemini AI Dəstəkli
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Toplu və tək fayl yükləmə, Gemini AI təhlili və bütün sahələri əhatə edən geniş əl ilə qeydiyyat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets & Instant Demo Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Sınaq üçün hazır Azərbaycan kadr bazası və ya CSV şablonu:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadDemoCandidates}
              disabled={isProcessing}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>15 Nümunə Kadr Yüklə</span>
            </button>
            <button
              type="button"
              onClick={downloadSampleCSVTemplate}
              disabled={isProcessing}
              className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="CSV cədvəl şablonunu endir"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nümunə CSV Şablonu</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 px-4 sm:px-5 pt-2.5 gap-2 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('bulk-file')}
            disabled={isProcessing}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'bulk-file'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Toplu və Tək CV (PDF, DOCX, TXT)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            disabled={isProcessing}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Əl ilə Ətraflı Məlumat Əlavə Et (Tam Anket)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            disabled={isProcessing}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            <span>CV Mətnini Yapışdır (AI ilə)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* AI Progress Bar Modal Banner */}
          {isProcessing && (
            <div className="mb-4 p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 text-slate-800 shadow-2xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                      Süni İntellekt CV Təhlili İcra Edir...
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    </h4>
                    <p className="text-[11px] text-blue-700 font-medium">
                      {progressStatus?.statusText || 'CV oxunur, əsas vəzifə və uyğunluq dərəcəsi hesablanır...'}
                    </p>
                  </div>
                </div>
                {progressStatus && progressStatus.total > 0 && (
                  <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md">
                    {progressStatus.current}/{progressStatus.total} ({Math.round((progressStatus.current / progressStatus.total) * 100)}%)
                  </span>
                )}
              </div>

              {progressStatus && progressStatus.total > 0 && (
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.max(5, (progressStatus.current / progressStatus.total) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 1: BULK FILE UPLOAD */}
          {activeTab === 'bulk-file' && (
            <div className="space-y-4">
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/80 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all space-y-3 ${
                  isProcessing ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.docx,.txt,.json,.pdf,.png,.jpg,.jpeg"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-xs border border-blue-100">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    CV fayllarını (PDF, Word, Excel, Şəkil) buraya atın və ya seçin
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    İstər 1 ədəd PDF CV, istərsə də 20+ toplu sənəd — AI hər birini ayrılıqda dəqiq təhlil edir və fiziki faylı bazaya saxlayır.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Kompüterdən Fayl(lar) Seç</span>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Seçilmiş Fayllar ({selectedFiles.length}):</span>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setSelectedFiles([])}
                      className="text-red-600 hover:underline cursor-pointer disabled:opacity-40"
                    >
                      Hamısını sil
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {selectedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{f.name}</span>
                          <span className="text-[10px] text-slate-400">
                            ({(f.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleRemoveFile(i)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Fiziki CV və AI İnteqrasiyası:</span>
                </div>
                <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside">
                  <li><strong>Fiziki Sənəd Baxışı:</strong> Yüklənən hər bir PDF/Word faylı namizəd kartında fiziki sənəd kimi saxlanılır və istənilən an bir kliklə sənədin özünə baxmaq mümkündür.</li>
                  <li><strong>Əsas Vəzifə və Bacarıqlar:</strong> Gemini AI namizədin faktiki ən əsas peşəsini dəqiq müəyyən edir.</li>
                  <li><strong>Vakansiya Uyğunluğu:</strong> Şirkətinizin aktiv vakansiyaları ilə müqayisə edilərək reytinq xalı verilir.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: COMPREHENSIVE MANUAL CANDIDATE FORM */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSaveManualCandidate} className="space-y-6">
              {/* SECTION 1: Personal & Contact Information */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>1. Şəxsi və Əlaqə Məlumatları</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Ad və Soyad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.fullName}
                      onChange={e => setManualForm({ ...manualForm, fullName: e.target.value })}
                      placeholder="Məs. Murad Əliyev"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Əlaqə Telefonu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.phone}
                      onChange={e => setManualForm({ ...manualForm, phone: e.target.value })}
                      placeholder="+994 50 123 45 67"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      E-poçt Ünvanı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={manualForm.email}
                      onChange={e => setManualForm({ ...manualForm, email: e.target.value })}
                      placeholder="namized@example.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Şəhər / Rayon
                    </label>
                    <input
                      type="text"
                      value={manualForm.city}
                      onChange={e => setManualForm({ ...manualForm, city: e.target.value })}
                      placeholder="Məs. Bakı, Nəsimi"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Ölkə
                    </label>
                    <input
                      type="text"
                      value={manualForm.country}
                      onChange={e => setManualForm({ ...manualForm, country: e.target.value })}
                      placeholder="Azərbaycan"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Doğum Tarixi / Yaş
                    </label>
                    <input
                      type="date"
                      value={manualForm.birthDate}
                      onChange={e => setManualForm({ ...manualForm, birthDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Ata Adı
                    </label>
                    <input
                      type="text"
                      value={manualForm.fatherName}
                      onChange={e => setManualForm({ ...manualForm, fatherName: e.target.value })}
                      placeholder="Məs. İlham oğlu"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Cinsiyyət
                    </label>
                    <select
                      value={manualForm.gender}
                      onChange={e => setManualForm({ ...manualForm, gender: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="Kişi">Kişi</option>
                      <option value="Qadın">Qadın</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Ailə Vəziyyəti
                    </label>
                    <select
                      value={manualForm.maritalStatus}
                      onChange={e => setManualForm({ ...manualForm, maritalStatus: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="Subay">Subay</option>
                      <option value="Ailəli">Ailəli</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Hərbi Xidmət
                    </label>
                    <select
                      value={manualForm.militaryStatus}
                      onChange={e => setManualForm({ ...manualForm, militaryStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="Hərbi xidmətdə olub">Hərbi xidmətdə olub (Yararlı)</option>
                      <option value="Möhlət hüququ var">Möhlət hüququ var</option>
                      <option value="Yararsız">Yararsız</option>
                      <option value="Tələb olunmur">Tələb olunmur (Qadın / Azad)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Sürücülük Vəsiqəsi
                    </label>
                    <select
                      value={manualForm.drivingLicense}
                      onChange={e => setManualForm({ ...manualForm, drivingLicense: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="">Yoxdur</option>
                      <option value="B">Kateqoriya B (Minik)</option>
                      <option value="BC">Kateqoriya BC (Minik və Yük)</option>
                      <option value="BCD">Kateqoriya BCD (Avtobus daxil)</option>
                      <option value="A, B">Kateqoriya A, B</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      LinkedIn Profili
                    </label>
                    <input
                      type="url"
                      value={manualForm.linkedinUrl}
                      onChange={e => setManualForm({ ...manualForm, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Portfolio / GitHub / Şəxsi Vebsayt Linki
                    </label>
                    <input
                      type="url"
                      value={manualForm.portfolioUrl}
                      onChange={e => setManualForm({ ...manualForm, portfolioUrl: e.target.value })}
                      placeholder="https://github.com/username və ya portfolio linki"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Professional Role & Career Profile */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>2. Vəzifə və Karyera Profili</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Əsas Vəzifə / Peşə Başlığı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.jobTitle}
                      onChange={e => setManualForm({ ...manualForm, jobTitle: e.target.value })}
                      placeholder="Məs. Senior React Developer, Baş Mühasib, HR Menecer"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Karyera Səviyyəsi
                    </label>
                    <select
                      value={manualForm.careerLevel}
                      onChange={e => setManualForm({ ...manualForm, careerLevel: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="Stajor">Stajor / Təcrübəçi</option>
                      <option value="Junior">Junior (0-2 il)</option>
                      <option value="Middle">Middle (2-5 il)</option>
                      <option value="Senior">Senior (5+ il)</option>
                      <option value="Lead">Team Lead / Rəhbər</option>
                      <option value="Executive">Executive / C-Level</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Alternativ / Uyğun Vəzifə Adları (vergüllə ayırın)
                    </label>
                    <input
                      type="text"
                      value={manualForm.alternativeTitles}
                      onChange={e => setManualForm({ ...manualForm, alternativeTitles: e.target.value })}
                      placeholder="Məs. Frontend Mühəndisi, Web Developer, Full-stack UI"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Ümumi İş Təcrübəsi (İllərlə)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="40"
                      value={manualForm.experienceYears}
                      onChange={e => setManualForm({ ...manualForm, experienceYears: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="font-bold text-slate-700 block mb-1">
                      Peşəkar Xülasə / Haqqında (Bio)
                    </label>
                    <textarea
                      rows={2}
                      value={manualForm.summary}
                      onChange={e => setManualForm({ ...manualForm, summary: e.target.value })}
                      placeholder="Namizədin ümumi peşəkar təcrübəsi, əsas fəaliyyət sahələri və nailiyyətləri haqqında xülasə..."
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Compensation & Employment Preferences */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>3. Maaş Gözləntiləri və İş Rejimi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Gözlənilən Maaş <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="300"
                      value={manualForm.expectedSalary}
                      onChange={e => setManualForm({ ...manualForm, expectedSalary: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-bold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Minimum Maaş
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={manualForm.minSalary}
                      onChange={e => setManualForm({ ...manualForm, minSalary: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Valyuta
                    </label>
                    <select
                      value={manualForm.currency}
                      onChange={e => setManualForm({ ...manualForm, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="AZN">AZN (₼)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Maaş Dövrü
                    </label>
                    <select
                      value={manualForm.salaryPeriod}
                      onChange={e => setManualForm({ ...manualForm, salaryPeriod: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="Aylıq Net">Aylıq Net (Ələ çatan)</option>
                      <option value="Aylıq Gross">Aylıq Gross (Vergilər daxil)</option>
                      <option value="İllik">İllik</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Məşğulluq Statusu
                    </label>
                    <select
                      value={manualForm.employmentStatus}
                      onChange={e => setManualForm({ ...manualForm, employmentStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="Aktiv axtarır">Aktiv axtarır</option>
                      <option value="Təkliflərə açıq">Təkliflərə açıq</option>
                      <option value="İşləyir, amma maraqlıdır">İşləyir, amma maraqlıdır</option>
                      <option value="Tələbə">Tələbə</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Mövcudluq Tarixi
                    </label>
                    <select
                      value={manualForm.availabilityDate}
                      onChange={e => setManualForm({ ...manualForm, availabilityDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="Dərhal hazır">Dərhal hazır</option>
                      <option value="2 həftə ərzində">2 həftə ərzində</option>
                      <option value="1 ay sonra">1 ay sonra</option>
                      <option value="Danışıqlar əsasında">Danışıqlar əsasında</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                      <input
                        type="checkbox"
                        checked={manualForm.relocationPreference}
                        onChange={e => setManualForm({ ...manualForm, relocationPreference: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Relokasiyaya razıdır (Köçmə)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                      <input
                        type="checkbox"
                        checked={manualForm.travelPreference}
                        onChange={e => setManualForm({ ...manualForm, travelPreference: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Ezamiyyətlərə hazırdır</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Work Experience List (Dinamik Siyahı) */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>4. İş Təcrübələri ({workExperiences.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Təcrübə Əlavə Et</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {workExperiences.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5 text-xs relative"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>İş Yeri #{idx + 1}</span>
                        {workExperiences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(idx)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Sil</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="font-semibold text-slate-600 block mb-1">Şirkət Adı</label>
                          <input
                            type="text"
                            value={exp.companyName}
                            onChange={e => {
                              const updated = [...workExperiences];
                              updated[idx].companyName = e.target.value;
                              setWorkExperiences(updated);
                            }}
                            placeholder="Məs. Pasha Bank, SOCAR"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 block mb-1">Vəzifə</label>
                          <input
                            type="text"
                            value={exp.jobTitle}
                            onChange={e => {
                              const updated = [...workExperiences];
                              updated[idx].jobTitle = e.target.value;
                              setWorkExperiences(updated);
                            }}
                            placeholder="Məs. Frontend Mühəndisi"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 block mb-1">Fəaliyyət Sahəsi</label>
                          <input
                            type="text"
                            value={exp.industry || ''}
                            onChange={e => {
                              const updated = [...workExperiences];
                              updated[idx].industry = e.target.value;
                              setWorkExperiences(updated);
                            }}
                            placeholder="Məs. Bankçılıq, İT, Ticarət"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 block mb-1">Başlama Tarixi</label>
                          <input
                            type="text"
                            value={exp.startDate || ''}
                            onChange={e => {
                              const updated = [...workExperiences];
                              updated[idx].startDate = e.target.value;
                              setWorkExperiences(updated);
                            }}
                            placeholder="Məs. 2021-03"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 block mb-1">Bitmə Tarixi</label>
                          <input
                            type="text"
                            disabled={exp.isCurrent}
                            value={exp.endDate || ''}
                            onChange={e => {
                              const updated = [...workExperiences];
                              updated[idx].endDate = e.target.value;
                              setWorkExperiences(updated);
                            }}
                            placeholder={exp.isCurrent ? 'Hazırda çalışır' : 'Məs. 2023-11'}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden disabled:bg-slate-100"
                          />
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={exp.isCurrent}
                              onChange={e => {
                                const updated = [...workExperiences];
                                updated[idx].isCurrent = e.target.checked;
                                if (e.target.checked) updated[idx].endDate = '';
                                setWorkExperiences(updated);
                              }}
                              className="rounded text-blue-600"
                            />
                            <span>Hazırda burada işləyir</span>
                          </label>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="font-semibold text-slate-600 block mb-1">Öhdəliklər və Təsvir</label>
                          <textarea
                            rows={2}
                            value={exp.responsibilities || ''}
                            onChange={e => {
                              const updated = [...workExperiences];
                              updated[idx].responsibilities = e.target.value;
                              setWorkExperiences(updated);
                            }}
                            placeholder="Vəzifə öhdəlikləri və icra olunan işlər..."
                            className="w-full p-2 border border-slate-200 rounded-lg outline-hidden resize-none"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="font-semibold text-slate-600 block mb-1">Əldə Olunmuş Nailiyyətlər & KPI Nəticələri</label>
                          <input
                            type="text"
                            value={exp.achievements || ''}
                            onChange={e => {
                              const updated = [...workExperiences];
                              updated[idx].achievements = e.target.value;
                              setWorkExperiences(updated);
                            }}
                            placeholder="Məs. Satışları 35% artırdı, sistemin cavab vaxtını 50% sürətləndirdi"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: Education List (Dinamik Təhsil) */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>5. Təhsil Məlumatları ({educationHistory.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Təhsil Əlavə Et</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {educationHistory.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span>Təhsil Müəssisəsi #{idx + 1}</span>
                        {educationHistory.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(idx)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Sil</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className="font-semibold text-slate-600 block mb-1">Universitet / Müəssisə</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={e => {
                              const updated = [...educationHistory];
                              updated[idx].institution = e.target.value;
                              setEducationHistory(updated);
                            }}
                            placeholder="Məs. Bakı Dövlət Universiteti, UNEC, ADA"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 block mb-1">Dərəcə</label>
                          <select
                            value={edu.degree}
                            onChange={e => {
                              const updated = [...educationHistory];
                              updated[idx].degree = e.target.value;
                              setEducationHistory(updated);
                            }}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden"
                          >
                            <option value="Orta">Orta / Peşə</option>
                            <option value="Kollec">Kollec / Subbakalavr</option>
                            <option value="Bakalavr">Bakalavr</option>
                            <option value="Magistr">Magistr</option>
                            <option value="Doktorantura">Doktorantura (PhD)</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 block mb-1">İxtisas / Fakültə</label>
                          <input
                            type="text"
                            value={edu.fieldOfStudy || ''}
                            onChange={e => {
                              const updated = [...educationHistory];
                              updated[idx].fieldOfStudy = e.target.value;
                              setEducationHistory(updated);
                            }}
                            placeholder="Məs. Maliyyə, Kompüter Elmləri"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 block mb-1">İllər (Başlama - Bitmə)</label>
                          <input
                            type="text"
                            value={edu.startDate ? `${edu.startDate} — ${edu.endDate}` : ''}
                            onChange={e => {
                              const parts = e.target.value.split(/[-—]/);
                              const updated = [...educationHistory];
                              updated[idx].startDate = parts[0]?.trim() || '';
                              updated[idx].endDate = parts[1]?.trim() || '';
                              setEducationHistory(updated);
                            }}
                            placeholder="Məs. 2017 — 2021"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-600 block mb-1">GPA / Bal</label>
                          <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={e => {
                              const updated = [...educationHistory];
                              updated[idx].gpa = e.target.value;
                              setEducationHistory(updated);
                            }}
                            placeholder="Məs. 3.8 / 4.0 və ya 92 bal"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 6: Skills Matrix */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span>6. Bacarıqlar və Kompetensiyalar</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Əsas & Texniki Bacarıqlar (Hard Skills - vergüllə ayırın)
                    </label>
                    <input
                      type="text"
                      value={manualForm.skills}
                      onChange={e => setManualForm({ ...manualForm, skills: e.target.value })}
                      placeholder="Məs. React, TypeScript, Tailwind, 1C 8.3, BTP, Maliyyə Hesabatları, SQL"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Şəxsi / Yumşaq Bacarıqlar (Soft Skills - vergüllə ayırın)
                    </label>
                    <input
                      type="text"
                      value={manualForm.softSkills}
                      onChange={e => setManualForm({ ...manualForm, softSkills: e.target.value })}
                      placeholder="Məs. Komanda Liderliyi, Problem Həlli, Güclü Kommunikasiya, Vaxtın İdarəedilməsi"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      İstifadə Edilən Alətlər və Proqramlar (vergüllə ayırın)
                    </label>
                    <input
                      type="text"
                      value={manualForm.toolsAndTechnologies}
                      onChange={e => setManualForm({ ...manualForm, toolsAndTechnologies: e.target.value })}
                      placeholder="Məs. Figma, Git, Jira, Excel Advanced, Docker, Postman, SAP"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 7: Foreign Languages (Dillər) */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                    <Globe2 className="w-4 h-4 text-blue-600" />
                    <span>7. Xarici Dil Bilikləri ({languages.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Dil Əlavə Et</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {languages.map((l, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-xs"
                    >
                      <input
                        type="text"
                        value={l.language}
                        onChange={e => {
                          const updated = [...languages];
                          updated[idx].language = e.target.value;
                          setLanguages(updated);
                        }}
                        placeholder="Məs. İngilis, Rus"
                        className="flex-1 px-2.5 py-1 border border-slate-200 rounded-lg outline-hidden"
                      />
                      <select
                        value={l.level}
                        onChange={e => {
                          const updated = [...languages];
                          updated[idx].level = e.target.value;
                          setLanguages(updated);
                        }}
                        className="px-2 py-1 border border-slate-200 rounded-lg outline-hidden"
                      >
                        <option value="Ana dili">Ana dili</option>
                        <option value="C2">C2 - Sərbəst</option>
                        <option value="C1">C1 - İrəli</option>
                        <option value="B2">B2 - Yaxşı</option>
                        <option value="B1">B1 - Orta</option>
                        <option value="A2">A2 - Baza</option>
                        <option value="A1">A1 - Başlanğıc</option>
                      </select>
                      {languages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(idx)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 8: Certifications & Projects */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>8. Sertifikatlar və Layihələr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddCertification}
                      className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 hover:bg-blue-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sertifikat</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1 hover:bg-purple-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Layihə</span>
                    </button>
                  </div>
                </div>

                {certifications.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 block">Sertifikatlar:</span>
                    {certifications.map((cert, idx) => (
                      <div key={cert.id || idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <input
                          type="text"
                          value={cert.name}
                          onChange={e => {
                            const u = [...certifications];
                            u[idx].name = e.target.value;
                            setCertifications(u);
                          }}
                          placeholder="Sertifikat Adı"
                          className="sm:col-span-2 px-2 py-1 border border-slate-200 rounded outline-hidden"
                        />
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={e => {
                            const u = [...certifications];
                            u[idx].issuer = e.target.value;
                            setCertifications(u);
                          }}
                          placeholder="Verən Təşkilat"
                          className="px-2 py-1 border border-slate-200 rounded outline-hidden"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={cert.issueDate || ''}
                            onChange={e => {
                              const u = [...certifications];
                              u[idx].issueDate = e.target.value;
                              setCertifications(u);
                            }}
                            placeholder="İl / Tarix"
                            className="flex-1 px-2 py-1 border border-slate-200 rounded outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCertification(idx)}
                            className="text-red-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-600 block">Layihələr / Portfello:</span>
                    {projects.map((proj, idx) => (
                      <div key={proj.id || idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <input
                          type="text"
                          value={proj.title}
                          onChange={e => {
                            const u = [...projects];
                            u[idx].title = e.target.value;
                            setProjects(u);
                          }}
                          placeholder="Layihə Adı"
                          className="px-2 py-1 border border-slate-200 rounded outline-hidden"
                        />
                        <input
                          type="text"
                          value={proj.link || ''}
                          onChange={e => {
                            const u = [...projects];
                            u[idx].link = e.target.value;
                            setProjects(u);
                          }}
                          placeholder="Link / GitHub"
                          className="px-2 py-1 border border-slate-200 rounded outline-hidden"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={proj.description || ''}
                            onChange={e => {
                              const u = [...projects];
                              u[idx].description = e.target.value;
                              setProjects(u);
                            }}
                            placeholder="Qısa təsvir"
                            className="flex-1 px-2 py-1 border border-slate-200 rounded outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(idx)}
                            className="text-red-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 9: Physical CV File Attachment (Orijinal Fayl Qoşulması) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-blue-200">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-950">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <span>9. Fiziki CV Sənədinin Qoşulması (PDF, Word, Şəkil)</span>
                  </div>
                  {attachedFile && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Fayl Qoşuldu
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600">
                  Namizədin orijinal CV faylını əlavə edin ki, bazada onun üzərinə kliklədikdə fiziki PDF/Word sənədi açılsın:
                </div>

                <div className="flex items-center gap-3">
                  <input
                    ref={manualFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt"
                    onChange={handleManualFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => manualFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white border border-blue-300 hover:border-blue-500 text-blue-700 font-bold text-xs shadow-2xs flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{attachedFile ? 'Faylı Dəyişdir' : 'Kompüterdən CV Faylı Seç (PDF)'}</span>
                  </button>

                  {attachedFile && (
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-blue-200 text-xs">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-slate-800">{attachedFile.name}</span>
                      <span className="text-[10px] text-slate-400">
                        ({(attachedFile.size / 1024).toFixed(1)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 10: Recruiting Status & Internal Notes */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>10. Rekrutinq Mərhələsi və Qeydlər</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      İlkin Rekrutinq Mərhələsi
                    </label>
                    <select
                      value={manualForm.pipelineStage}
                      onChange={e => setManualForm({ ...manualForm, pipelineStage: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-bold"
                    >
                      <option value="sourced">📥 Daxil Olmuş (Sourced)</option>
                      <option value="screened">🔍 İlkin Skrininq (Screened)</option>
                      <option value="interview">📅 Müsahibə Təyin Edildi (Interview)</option>
                      <option value="shortlist">⭐ Qısa Siyahı (Shortlist)</option>
                      <option value="offer">📄 İş Təklifi (Offered)</option>
                      <option value="hired">🎉 İşə Qəbul (Hired)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Teqlər (vergüllə ayırın)
                    </label>
                    <input
                      type="text"
                      value={manualForm.tags}
                      onChange={e => setManualForm({ ...manualForm, tags: e.target.value })}
                      placeholder="Məs. VIP, Təcili, A Kateqoriya"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Daxili HR Rekruter Qeydləri
                    </label>
                    <textarea
                      rows={2}
                      value={manualForm.notes}
                      onChange={e => setManualForm({ ...manualForm, notes: e.target.value })}
                      placeholder="Müsahibə təəssüratı, xüsusi tələblər və ya komanda rəyi..."
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Bütün Məlumatlarla Birlikdə Bazaya Əlavə Et</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PASTE TEXT PARSER */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Namizədin CV mətnini və ya anketini buraya yapışdırın:
                </label>
                <textarea
                  rows={9}
                  disabled={isProcessing}
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  placeholder="Məsələn:&#10;Murad Əliyev&#10;murad@example.com | +994 50 123 45 67&#10;İş təcrübəsi: 2021-2025 Kapital Bank - Baş Mühasib. 1C 8.3, Vergi Məcəlləsi, BTP...&#10;Təhsil: UNEC Maliyyə..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-hidden resize-none leading-relaxed disabled:opacity-50"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 max-w-sm">
                  Gemini AI ad, əsas vəzifə, staj, bacarıqlar və vakansiya uyğunluğunu dərhal çıxaracaq.
                </span>
                <button
                  type="button"
                  disabled={isProcessing || !pasteText.trim()}
                  onClick={handleParsePastedText}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI Analiz Edir...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>AI ilə Dəqiq Analiz Et və Əlavə Et</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {activeTab === 'bulk-file' && (
              <span>Seçilmiş fayllar: <strong>{selectedFiles.length} ədəd</strong></span>
            )}
            {activeTab === 'manual' && (
              <span>Ətraflı anket: <strong>10 strukturlaşdırılmış bölmə</strong></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer disabled:opacity-40"
            >
              Bağla
            </button>
            {activeTab === 'bulk-file' && (
              <button
                type="button"
                onClick={handleProcessBulkFiles}
                disabled={isProcessing || selectedFiles.length === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI ilə Təhlil Edilir...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{selectedFiles.length} Faylı AI ilə Analiz Et və Əlavə Et</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
