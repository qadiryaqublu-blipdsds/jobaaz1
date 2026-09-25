import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Vacancy, Application, Company, ApplicationStatus, JobOffer, JobOfferTemplate, OfferAuditLog, User, UserRole, CVTemplateType } from '../../types';
import { CVRenderer } from '../cv-templates/CVRenderer';
import { CV_TEMPLATES } from '../cv-templates/templateRegistry';
import { downloadCVAsPDF, generateCVFileName } from '../../utils/pdfExport';
import { usePDFDownload } from '../../hooks/usePDFDownload';
import { PDFDownloadProgressToast } from '../common/PDFDownloadProgressToast';
import { fileToDataUrl, generateSeedAvatar } from '../../utils/imageUpload';
import { isPlatformCreatedCV, ensureApplicationCV } from '../../utils/applicationCVHelper';
import { JobOffersTable } from '../interview-offer/JobOffersTable';
import { InterviewModal } from '../interview-offer/InterviewModal';
import { JobOfferTemplatesModal } from '../interview-offer/JobOfferTemplatesModal';
import { OfferAuditLogModal } from '../interview-offer/OfferAuditLogModal';
import { RecruitingAnalyticsDashboard } from './analytics/RecruitingAnalyticsDashboard';
import { CandidateKanbanBoard } from './CandidateKanbanBoard';
import { CandidateComparatorModal } from './CandidateComparatorModal';
import { EmployerCostCalculatorModal } from './EmployerCostCalculatorModal';
import { JobiaAICandidateEvaluatorModal } from './JobiaAICandidateEvaluatorModal';
import { CandidateTalentPool } from './CandidateTalentPool';
import { ModalPortal } from '../common/ModalPortal';
import { useLanguage } from '../../context/LanguageContext';
import {
  getLocalizedCategory,
  getLocalizedCity,
  getLocalizedEmploymentType,
  getLocalizedExperienceLevel,
  getLocalizedIndustry,
  getLocalizedApplicationStatus,
  getLocalizedOfferStatus,
  getLocalizedJobTitle,
} from '../../i18n/localizeData';
import { 
  Building2, 
  Plus, 
  Briefcase, 
  Users, 
  Sparkles, 
  ChevronRight, 
  Filter, 
  FileText, 
  X, 
  CheckCircle, 
  Download, 
  Loader2, 
  MessageSquare,
  Award,
  Send,
  Sliders,
  ShieldCheck,
  History,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Clock,
  LogIn,
  UserPlus,
  Edit3,
  Globe,
  Phone,
  Mail,
  MapPin,
  Save,
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  Eye,
  AlertTriangle,
  Lock,
  Unlock,
  Check,
  LayoutGrid,
  List,
  Calculator,
  Scale,
  CheckSquare,
  Square,
  UserCheck,
  Palmtree
} from 'lucide-react';
import { VacationCalculatorView } from '../candidate/VacationCalculatorView';

interface BusinessDashboardProps {
  currentUser?: User | null;
  companies: Company[];
  activeCompany: Company;
  setActiveCompany: (c: Company) => void;
  vacancies: Vacancy[];
  applications: Application[];
  offers: JobOffer[];
  auditLogs: OfferAuditLog[];
  templates: JobOfferTemplate[];
  onOpenPostJobModal: () => void;
  onOpenEditJobModal?: (job: Vacancy) => void;
  onUpdateApplicationStatus: (appId: string, status: ApplicationStatus, notes?: string) => void;
  onDeleteJob: (jobId: string) => void;
  onSaveOffer: (offer: JobOffer, log: OfferAuditLog) => void;
  onUpdateOfferStatus: (offerId: string, status: any, reason?: any, log?: OfferAuditLog) => void;
  onUpdateTemplates: (templates: JobOfferTemplate[]) => void;
  onUpdateCompany: (company: Company) => void;
  onOpenCandidatePortal: (offer: JobOffer) => void;
  onShareToGoogleChat?: (applicant: Application) => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: UserRole) => void;
  onOpenPricingModal?: () => void;
  businessTab?: 'vacancies' | 'applicants' | 'offers' | 'analytics' | 'templates' | 'company-profile' | 'talent-pool' | 'vacation-calculator';
  onBusinessTabChange?: (tab: 'vacancies' | 'applicants' | 'offers' | 'analytics' | 'templates' | 'company-profile' | 'talent-pool' | 'vacation-calculator') => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  currentUser,
  companies,
  activeCompany,
  setActiveCompany,
  vacancies,
  applications,
  offers,
  auditLogs,
  templates,
  onOpenPostJobModal,
  onOpenEditJobModal,
  onUpdateApplicationStatus,
  onDeleteJob,
  onSaveOffer,
  onUpdateOfferStatus,
  onUpdateTemplates,
  onUpdateCompany,
  onOpenCandidatePortal,
  onShareToGoogleChat,
  onOpenAuthModal,
  onOpenPricingModal,
  businessTab,
  onBusinessTabChange,
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'vacancies' | 'applicants' | 'offers' | 'analytics' | 'templates' | 'company-profile' | 'talent-pool' | 'vacation-calculator'>(
    businessTab || 'vacancies'
  );
  const [gateViewTab, setGateViewTab] = useState<'portal' | 'talent-pool'>(
    businessTab === 'talent-pool' ? 'talent-pool' : 'portal'
  );

  // Sync external businessTab changes
  useEffect(() => {
    if (businessTab) {
      setActiveTab(businessTab);
      if (businessTab === 'talent-pool') {
        setGateViewTab('talent-pool');
      }
    }
  }, [businessTab]);

  const handleTabSwitch = (tab: 'vacancies' | 'applicants' | 'offers' | 'analytics' | 'templates' | 'company-profile' | 'talent-pool' | 'vacation-calculator') => {
    setActiveTab(tab);
    if (onBusinessTabChange) {
      onBusinessTabChange(tab);
    }
  };
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Vacancy | null>(null);
  const [filterVacancyId, setFilterVacancyId] = useState<string>('all');
  const [recruiterNotesInput, setRecruiterNotesInput] = useState('');
  const [selectedNewStatus, setSelectedNewStatus] = useState<ApplicationStatus>('Baxıldı');
  const {
    isDownloading: isDownloadingApplicantPDF,
    progressPercent: applicantPdfProgressPercent,
    progressStatus: applicantPdfProgressStatus,
    showToast: showApplicantPdfToast,
    fileName: applicantPdfFileName,
    downloadPDF: triggerApplicantPDFDownload,
    dismissToast: dismissApplicantPdfToast,
  } = usePDFDownload();

  // Workflow Modals
  const [activeInterviewApp, setActiveInterviewApp] = useState<Application | null>(null);
  const [editingOffer, setEditingOffer] = useState<JobOffer | undefined>(undefined);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [selectedAuditLogOffer, setSelectedAuditLogOffer] = useState<{ id: string; name: string } | null>(null);

  // Interactive Employer Feature States
  const [applicantViewMode, setApplicantViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isComparatorModalOpen, setIsComparatorModalOpen] = useState(false);
  const [isCostCalculatorModalOpen, setIsCostCalculatorModalOpen] = useState(false);
  const [candidateForJobiaAI, setCandidateForJobiaAI] = useState<Application | null>(null);
  const [isJobiaAIModalOpen, setIsJobiaAIModalOpen] = useState(false);
  const [applicantViewerTemplate, setApplicantViewerTemplate] = useState<CVTemplateType | null>(null);

  useEffect(() => {
    if (selectedApplicant) {
      const initialTemplate = selectedApplicant.cvTemplate || selectedApplicant.cvData?.template || 'modern-emerald';
      setApplicantViewerTemplate(initialTemplate);
    } else {
      setApplicantViewerTemplate(null);
    }
  }, [selectedApplicant]);

  const effectiveApplicantCV = useMemo(() => {
    if (!selectedApplicant) return null;
    return ensureApplicationCV(selectedApplicant);
  }, [selectedApplicant]);

  const toggleCandidateSelection = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Editable company form state
  const [editedCompany, setEditedCompany] = useState<Company>(activeCompany);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [companySaveSuccess, setCompanySaveSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Keep editedCompany in sync when activeCompany changes
  useEffect(() => {
    setEditedCompany(activeCompany);
  }, [activeCompany]);

  // Handle local company logo file upload
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const dataUrl = await fileToDataUrl(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.9,
        maxFileSizeMB: 5,
      });
      setEditedCompany((prev) => ({ ...prev, logo: dataUrl }));
    } catch (err: any) {
      alert(err.message || 'Loqo yüklənərkən xəta baş verdi.');
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  // Generate seed logo
  const handleGenerateCompanyLogo = () => {
    const seed = editedCompany.name.trim() || 'Company';
    const logoUrl = generateSeedAvatar(seed, 'initials');
    setEditedCompany((prev) => ({ ...prev, logo: logoUrl }));
  };

  // Remove company logo
  const handleRemoveCompanyLogo = () => {
    setEditedCompany((prev) => ({ ...prev, logo: '' }));
  };

  // Company specific data (Strictly includes all vacancies created by this user/company regardless of moderation status)
  const companyJobs = vacancies.filter((v) => 
    v.companyId === activeCompany.id || 
    (currentUser && v.createdBy === currentUser.id) ||
    (currentUser?.email && v.createdBy === currentUser.email) ||
    (currentUser?.companyId && v.companyId === currentUser.companyId) ||
    (v.companyName && activeCompany.name && v.companyName.toLowerCase().trim() === activeCompany.name.toLowerCase().trim()) ||
    (v.companyName && currentUser?.companyName && v.companyName.toLowerCase().trim() === currentUser.companyName.toLowerCase().trim())
  );

  const companyApplications = useMemo(() => {
    if (!currentUser || currentUser.role !== 'business') return [];
    const validCompanyId = currentUser.companyId || (activeCompany.id !== 'comp-default' ? activeCompany.id : null);
    const validCompanyName = (currentUser.companyName || (activeCompany.name !== 'Müəssisə' ? activeCompany.name : '')).toLowerCase().trim();

    return applications.filter((a) => {
      if (validCompanyId && a.companyId === validCompanyId) return true;
      if (validCompanyName && a.companyName && a.companyName.toLowerCase().trim() === validCompanyName) return true;
      if (companyJobs.some((j) => j.id === a.vacancyId || (a.jobId && j.id === a.jobId))) return true;
      return false;
    });
  }, [currentUser, activeCompany, applications, companyJobs]);

  const companyOffers = offers.filter((o) => 
    o.companyId === activeCompany.id || 
    (o.companyName && activeCompany.name && o.companyName.toLowerCase().trim() === activeCompany.name.toLowerCase().trim())
  );
  const companyLogs = auditLogs.filter((l) => companyOffers.some((o) => o.id === l.offerId));

  // Filtered applicants
  const filteredApplicants = companyApplications.filter((a) => {
    if (filterVacancyId !== 'all' && a.vacancyId !== filterVacancyId) return false;
    return true;
  });

  const handleOpenApplicantModal = (app: Application) => {
    setSelectedApplicant(app);
    setSelectedNewStatus(app.status);
    setRecruiterNotesInput(app.recruiterNotes || '');
  };

  const handleSaveApplicantStatus = () => {
    if (selectedApplicant) {
      onUpdateApplicationStatus(selectedApplicant.id, selectedNewStatus, recruiterNotesInput);
      setSelectedApplicant((prev) =>
        prev ? { ...prev, status: selectedNewStatus, recruiterNotes: recruiterNotesInput } : null
      );
    }
  };

  const handleStartInterviewWorkflow = (app: Application, existingOffer?: JobOffer) => {
    setActiveInterviewApp(app);
    setEditingOffer(existingOffer);
  };

  const handleToggleApprovalSetting = (enabled: boolean) => {
    const updated = { ...activeCompany, requireOfferApproval: enabled };
    setActiveCompany(updated);
    onUpdateCompany(updated);
  };

  const handleSaveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    try {
      setActiveCompany(editedCompany);
      onUpdateCompany(editedCompany);
      setCompanySaveSuccess(true);
      setTimeout(() => setCompanySaveSuccess(false), 3000);
    } finally {
      setIsSavingCompany(false);
    }
  };

  /* ========================================================================= */
  /* 1. GATE VIEW: WHEN NOT LOGGED IN AS EMPLOYER (ZERO MOCK COMPANIES)       */
  /* ========================================================================= */
  if (!currentUser || currentUser.role !== 'business') {
    return (
      <div className="space-y-6 py-4 sm:py-6 animate-fade-in">
        {/* Navigation & Mode Switcher for Employers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              id="gate-view-tab-talent-pool"
              onClick={() => {
                setGateViewTab('talent-pool');
                onBusinessTabChange?.('talent-pool');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                gateViewTab === 'talent-pool'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-200" />
              <span>Kadr Bankı</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/90 text-white">
                Açıq Baza
              </span>
            </button>

            <button
              id="gate-view-tab-portal"
              onClick={() => {
                setGateViewTab('portal');
                onBusinessTabChange?.('vacancies');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                gateViewTab === 'portal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>İşəgötürən Şəxsi Kabineti & Giriş</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAuthModal?.('login', 'business')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>İşəgötürən Girişi</span>
            </button>
            <button
              onClick={() => onOpenAuthModal?.('register', 'business')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-300" />
              <span>Yeni Müəssisə Qeydiyyatı</span>
            </button>
          </div>
        </div>

        {gateViewTab === 'talent-pool' ? (
          <div className="space-y-4">
            <CandidateTalentPool
              currentUser={null}
              activeCompany={activeCompany}
              onOpenPricingModal={onOpenPricingModal}
              onRequireAuth={() => onOpenAuthModal?.('login', 'business')}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Gate Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-blue-100">
                <Building2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {language === 'en'
                    ? 'Employer Portal'
                    : language === 'ru'
                    ? 'Кабинет работодателя'
                    : 'İşəgötürən Şəxsi Kabineti'}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {language === 'en'
                    ? 'Sign in or register your enterprise to post vacancies, track applicant CVs, and extend official electronic Job Offers.'
                    : language === 'ru'
                    ? 'Войдите или зарегистрируйте компанию для размещения вакансий, просмотра резюме кандидатов и отправки официальных офферов.'
                    : 'Müəssisəniz adına rəsmi vakansiyalar yerləşdirmək, daxil olan müraciətləri izləmək və rəsmi elektron iş təklifləri (Job Offer) təqdim etmək üçün daxil olun və ya müəssisənizi qeydiyyatdan keçirin.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  id="business-gate-login-btn"
                  onClick={() => onOpenAuthModal?.('login', 'business')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {language === 'en'
                      ? 'Sign In as Employer'
                      : language === 'ru'
                      ? 'Войти как работодатель'
                      : 'İşəgötürən Kimi Daxil Ol'}
                  </span>
                </button>

                <button
                  id="business-gate-register-btn"
                  onClick={() => onOpenAuthModal?.('register', 'business')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-slate-300" />
                  <span>
                    {language === 'en'
                      ? 'Register New Enterprise'
                      : language === 'ru'
                      ? 'Регистрация предприятия'
                      : 'Yeni Müəssisə Qeydiyyatı'}
                  </span>
                </button>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'en'
                    ? 'Vacancy Management'
                    : language === 'ru'
                    ? 'Управление вакансиями'
                    : 'Vakansiyaların İdarə Edilməsi'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'en'
                    ? 'Publish vacancies, set salary ranges, and reach top matching candidates across Azerbaijan and remotely.'
                    : language === 'ru'
                    ? 'Создавайте вакансии, устанавливайте диапазон зарплат и мгновенно публикуйте их для соискателей.'
                    : 'Müəssisənizin adına vakansiyalar yaradın, əməkhaqqı aralığını təyin edin və dərhal dərc edərək namizədlər üçün əlçatan edin.'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'en'
                    ? 'Candidate Applications & CVs'
                    : language === 'ru'
                    ? 'Отклики и резюме соискателей'
                    : 'Namizəd Müraciətləri & CV-lər'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'en'
                    ? 'Review full-format CVs with ATS matching scores, export to PDF, and update application stages easily.'
                    : language === 'ru'
                    ? 'Просматривайте полные резюме кандидатов с баллами ATS-соответствия, скачивайте PDF и управляйте этапами.'
                    : 'Vakansiyalarınıza müraciət edən namizədlərin tam formatlı CV sənədlərini incələyin, PDF olaraq yükləyin və statuslarını yeniləyin.'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'en'
                    ? 'Official Job Offers'
                    : language === 'ru'
                    ? 'Электронные офферы (Job Offer)'
                    : 'Rəsmi Elektron İş Təklifləri (Job Offer)'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'en'
                    ? 'Send officially verifiable electronic Job Offers, customize legal clauses, and receive digital candidate sign-offs.'
                    : language === 'ru'
                    ? 'Отправляйте официальные цифровые офферы, настраивайте пункты и получайте электронное согласие кандидатов.'
                    : 'Namizədlərə elektron təsdiqlənən rəsmi iş təklifləri göndərin, şablonlar yaradın və qəbul/imtina cavablarını canlı izləyin.'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'en'
                    ? 'Real-Time HR Analytics'
                    : language === 'ru'
                    ? 'HR-аналитика в реальном времени'
                    : 'Real-Vaxt İR Analitikası'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'en'
                    ? 'Track pipeline conversion, time-to-hire, funnel stages, and compensation benchmarks from a unified analytics view.'
                    : language === 'ru'
                    ? 'Отслеживайте воронку найма, конверсию этапов, сроки закрытия вакансий и бюджет в реальном времени.'
                    : 'Müraciət sayı, müsahibə konversiyası, baxış statistikası və büdcə analizlərini vahid analitika panelində izləyin.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ========================================================================= */
  /* 2. AUTHENTICATED EMPLOYER DASHBOARD (REAL USER COMPANY & REAL VACANCIES)   */
  /* ========================================================================= */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Company Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <img
            src={activeCompany.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeCompany.name)}`}
            alt={activeCompany.name}
            className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{activeCompany.name}</h1>
              {activeCompany.verified ? (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Təsdiqlənmiş Müəssisə</span>
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Moderasiyada
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {activeCompany.industry || 'Müəssisə'} • {activeCompany.location || 'Bakı, Azərbaycan'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
              {activeCompany.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {activeCompany.email}
                </span>
              )}
              {activeCompany.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {activeCompany.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('company-profile')}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Müəssisə Məlumatları</span>
          </button>

          <button
            onClick={onOpenPostJobModal}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Vakansiya Elan Et</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Aktiv Elanlar</span>
            <h3 className="text-xl font-bold text-slate-900">{companyJobs.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Gələn Müraciətlər</span>
            <h3 className="text-xl font-bold text-slate-900">{companyApplications.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Müsahibə Mərhələsi</span>
            <h3 className="text-xl font-bold text-slate-900">
              {companyApplications.filter((a) => a.status === 'Müsahibəyə dəvət' || a.status === 'Baxıldı').length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Verilən İş Təklifləri</span>
            <h3 className="text-xl font-bold text-emerald-700">{companyOffers.length}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 text-xs font-medium w-full overflow-x-auto scrollbar-none shadow-2xs">
        <button
          onClick={() => handleTabSwitch('vacancies')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer font-bold ${
            activeTab === 'vacancies' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Vakansiyalarım ({companyJobs.length})
        </button>

        <button
          onClick={() => handleTabSwitch('applicants')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer font-bold ${
            activeTab === 'applicants' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Gələn Müraciətlər ({companyApplications.length})
        </button>

        <button
          id="btn-business-tab-talent-pool"
          onClick={() => handleTabSwitch('talent-pool')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
            activeTab === 'talent-pool'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Kadr Bankı</span>
        </button>

        <button
          onClick={() => handleTabSwitch('offers')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
            activeTab === 'offers' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Müsahibə & Təkliflər ({companyOffers.length})</span>
        </button>

        <button
          onClick={() => handleTabSwitch('analytics')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analitika</span>
        </button>

        <button
          onClick={() => setIsTemplatesModalOpen(true)}
          className="px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer hover:bg-slate-100"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Offer Şablonları</span>
        </button>

        <button
          onClick={() => handleTabSwitch('company-profile')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer font-bold ${
            activeTab === 'company-profile' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Müəssisə Profili
        </button>

        <button
          id="btn-business-tab-vacation-calculator"
          onClick={() => handleTabSwitch('vacation-calculator')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
            activeTab === 'vacation-calculator'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100'
          }`}
          title="İşçilərin Məzuniyyət Haqqı Hesablaması, Direktor İmzası və Kütləvi Excel (AR Əmək Məcəlləsi Maddə 140)"
        >
          <Palmtree className="w-3.5 h-3.5" />
          <span>Məzuniyyət Kalkulyatoru</span>
        </button>

        <button
          onClick={() => setIsCostCalculatorModalOpen(true)}
          className="px-3.5 py-1.5 rounded-md whitespace-nowrap transition-colors text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold flex items-center gap-1.5 cursor-pointer ml-auto"
          title="AR 2026 Vergi və İşəgötürən Xərc Simulyatoru"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-600" />
          <span>Maaş & Vergi Kalkulyatoru</span>
        </button>
      </div>

      {/* TAB 1: Company Vacancies */}
      {activeTab === 'vacancies' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'en'
                  ? `Manage Vacancies (${companyJobs.length})`
                  : language === 'ru'
                  ? `Управление вакансиями (${companyJobs.length})`
                  : `Vakansiyalarınızın İdarə Edilməsi (${companyJobs.length})`}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'en'
                  ? 'All active, pending review, and completed vacancies along with 1-time edit privileges.'
                  : language === 'ru'
                  ? 'Все опубликованные, ожидающие проверки и завершенные вакансии с правом однократного редактирования.'
                  : 'Paylaşdığınız bütün aktiv, gözləmədə və tamamlanmış vakansiyaların statusu və 1 dəfəlik redaktə hüququ.'}
              </p>
            </div>
            <button
              onClick={onOpenPostJobModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? 'Post New Vacancy'
                  : language === 'ru'
                  ? 'Разместить вакансию'
                  : 'Yeni Vakansiya Yerləşdir'}
              </span>
            </button>
          </div>

          {companyJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">
                {language === 'en'
                  ? 'No active vacancies posted yet'
                  : language === 'ru'
                  ? 'У вашей компании пока нет активных вакансий'
                  : 'Müəssisənizin aktiv vakansiyası yoxdur'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {language === 'en'
                  ? 'Publish your first vacancy to start receiving high-quality candidate applications.'
                  : language === 'ru'
                  ? 'Опубликуйте первую вакансию, чтобы начать получать отклики от квалифицированных кандидатов.'
                  : 'İlk vakansiyanızı yerləşdirərək ixtisaslı namizədlərdən müraciətlər qəbul etməyə başlayın.'}
              </p>
              <button
                onClick={onOpenPostJobModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {language === 'en'
                  ? 'Post First Vacancy'
                  : language === 'ru'
                  ? 'Опубликовать первую вакансию'
                  : 'İlk Vakansiyanı Yerləşdir'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyJobs.map((job) => {
                const jobApplicants = applications.filter((a) => a.vacancyId === job.id || a.jobId === job.id);
                const isApproved = job.isApproved === true && job.status === 'published';
                const isRejected = job.status === 'rejected';
                const isPending = !isApproved && !isRejected;
                const editCount = job.editCount || 0;
                const canEdit = editCount < (job.maxEditsAllowed || 1);

                return (
                  <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {getLocalizedCategory(job.category, language)}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {getLocalizedCity(job.city, language)}
                          </span>
                        </div>

                        {/* Moderation Status Badge */}
                        {isApproved && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>
                              {language === 'en' ? 'Published' : language === 'ru' ? 'Опубликовано' : 'Təsdiqlənib (Yayımdadır)'}
                            </span>
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>
                              {language === 'en' ? 'Pending Review' : language === 'ru' ? 'На модерации' : 'Admin Təsdiqi Gözləyir'}
                            </span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 shrink-0">
                            <X className="w-3 h-3 text-red-600" />
                            <span>
                              {language === 'en' ? 'Rejected' : language === 'ru' ? 'Отклонено' : 'İmtina Edilib'}
                            </span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-blue-700 font-black">
                            {job.hideSalary
                              ? (language === 'en' ? 'Salary Negotiable' : language === 'ru' ? 'По договоренности' : 'Maaş gizli (Razılaşma ilə)')
                              : `${job.minSalary || 0} - ${job.maxSalary || 0} ${job.currency || 'AZN'}`}
                          </p>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {getLocalizedEmploymentType(job.employmentType, language)}
                          </span>
                        </div>
                      </div>

                      {/* 1-Time Edit Permission & Status Box */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {canEdit ? (
                            <span className="text-blue-700 font-bold flex items-center gap-1">
                              <Unlock className="w-3.5 h-3.5 text-blue-600" />
                              <span>
                                {language === 'en'
                                  ? `1-Time Edit Available (${editCount}/1)`
                                  : language === 'ru'
                                  ? `Право 1-кратного редактирования (${editCount}/1)`
                                  : `1 Dəfəlik Redaktə Hüququ Var (${editCount}/1)`}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-500 font-semibold flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {language === 'en'
                                  ? 'Edit Limit Reached (1/1 used)'
                                  : language === 'ru'
                                  ? 'Лимит редактирования исчерпан (1/1)'
                                  : 'Redaktə Limiti Dolub (1/1 istifadə olunub)'}
                              </span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {job.postedDate ? `${language === 'en' ? 'Posted' : language === 'ru' ? 'Опубликовано' : 'Paylaşılıb'}: ${job.postedDate}` : ''}
                        </span>
                      </div>

                      {/* Moderation Info Notice for Pending Jobs */}
                      {isPending && (
                        <div className="p-2 bg-amber-50/80 rounded-lg border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            {language === 'en'
                              ? 'This vacancy will be visible in the public job catalog once approved by an admin.'
                              : language === 'ru'
                              ? 'Эта вакансия будет опубликована в общем каталоге после проверки администратором.'
                              : 'Bu vakansiya admin təsdiqindən sonra ümumi vakansiyalar bölməsində yayımlanacaq.'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {language === 'en' ? 'Deadline' : language === 'ru' ? 'Дедлайн' : 'Son müraciət'}:{' '}
                          <strong className="text-slate-700">{job.deadline}</strong>
                        </span>
                        <span className="font-bold text-blue-700">
                          {jobApplicants.length}{' '}
                          {language === 'en' ? 'Applicants' : language === 'ru' ? 'откликов' : 'Namizəd müraciəti'}
                        </span>
                      </div>

                      {/* Action buttons toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedJobForDetail(job)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title={language === 'en' ? 'View vacancy details' : language === 'ru' ? 'Посмотреть детали вакансии' : 'Vakansiyanın tam məlumatlarını görüntülə'}
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>{language === 'en' ? 'Details' : language === 'ru' ? 'Детали' : 'Tam Baxış'}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (canEdit && onOpenEditJobModal) {
                                onOpenEditJobModal(job);
                              } else {
                                alert(
                                  language === 'en'
                                    ? 'You have already used your 1-time edit right for this vacancy (1/1 limit reached). Please contact platform admin for further changes.'
                                    : language === 'ru'
                                    ? 'Вы уже использовали право однократного редактирования (лимит 1/1 исчерпан). Свяжитесь с администрацией для изменений.'
                                    : 'Bu vakansiya üzrə 1 dəfəlik redaktə hüququnuzdan artıq istifadə etmisiniz (1/1 limit dolub). Əlavə dəyişiklik üçün platforma admini ilə əlaqə saxlayın.'
                                );
                              }
                            }}
                            disabled={!canEdit}
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                              canEdit
                                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                            }`}
                            title={canEdit ? (language === 'en' ? 'Edit vacancy (1-time right)' : language === 'ru' ? 'Редактировать вакансию (1 раз)' : 'Vakansiyanı redaktə et (1 dəfəlik hüquq)') : (language === 'en' ? 'Edit limit reached' : language === 'ru' ? 'Лимит исчерпан' : 'Redaktə hüququ istifadə edilib (1/1)')}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>
                              {canEdit
                                ? (language === 'en' ? 'Edit' : language === 'ru' ? 'Редактировать' : 'Redaktə Et')
                                : (language === 'en' ? 'Edited (1/1)' : language === 'ru' ? 'Отредактировано (1/1)' : 'Redaktə Edilib (1/1)')}
                            </span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setFilterVacancyId(job.id);
                              setActiveTab('applicants');
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>
                              {language === 'en' ? 'Applicants' : language === 'ru' ? 'Отклики' : 'Müraciətlər'} ({jobApplicants.length})
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              const confirmMsg = language === 'en'
                                ? `Are you sure you want to permanently delete "${job.title}"?`
                                : language === 'ru'
                                ? `Вы уверены, что хотите удалить вакансию "${job.title}"?`
                                : `"${job.title}" vakansiyasını həmişəlik silmək istədiyinizdən əminsiniz?`;
                              if (window.confirm(confirmMsg)) {
                                onDeleteJob(job.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title={language === 'en' ? 'Delete Vacancy' : language === 'ru' ? 'Удалить вакансию' : 'Vakansiyanı Sil'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Applicants list & screening */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Top Control Bar: Filter, View Switcher, and Stats */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-700">
                  {language === 'en' ? 'By Vacancy:' : language === 'ru' ? 'По вакансии:' : 'Vakansiya üzrə:'}
                </span>
                <select
                  value={filterVacancyId}
                  onChange={(e) => setFilterVacancyId(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-md outline-none font-medium text-xs"
                >
                  <option value="all">
                    {language === 'en' ? 'All Vacancies' : language === 'ru' ? 'Все вакансии' : 'Bütün Vakansiyalar'} ({companyApplications.length})
                  </option>
                  {companyJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Switcher: Kanban vs Table */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setApplicantViewMode('kanban')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    applicantViewMode === 'kanban'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Kanban Board' : language === 'ru' ? 'Канбан-доска' : 'Kanban Lövhəsi'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setApplicantViewMode('table')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    applicantViewMode === 'table'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Table View' : language === 'ru' ? 'Таблица' : 'Cədvəl Siyahısı'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium">
                {language === 'en' ? 'Total:' : language === 'ru' ? 'Всего:' : 'Cəmi:'}{' '}
                <strong className="font-bold text-slate-900">{filteredApplicants.length}</strong>{' '}
                {language === 'en' ? 'candidates' : language === 'ru' ? 'кандидатов' : 'namizəd'}
              </span>

              {selectedCandidateIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsComparatorModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en' ? 'Compare' : language === 'ru' ? 'Сравнить' : 'Müqayisə Et'} ({selectedCandidateIds.length})
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Floating Comparison Sticky Alert if Candidates are Selected */}
          {selectedCandidateIds.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-3.5 rounded-xl shadow-md border border-indigo-700 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-cyan-300">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">
                    {language === 'en'
                      ? `${selectedCandidateIds.length} candidate(s) selected for comparison`
                      : language === 'ru'
                      ? `${selectedCandidateIds.length} канд. выбрано для сравнения`
                      : `${selectedCandidateIds.length} namizəd müqayisə üçün seçildi`}
                  </h4>
                  <p className="text-[11px] text-indigo-200">
                    {language === 'en'
                      ? 'Analyze qualifications, experience, skills, and ATS matching metrics side-by-side'
                      : language === 'ru'
                      ? 'Анализируйте квалификацию, опыт, навыки и показатели соответствия бок о бок'
                      : 'Namizədlərin ixtisas, təcrübə, bacarıq və uyğunluq göstəricilərini yan-yana təhlil edin'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsComparatorModalOpen(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en' ? 'Compare Side-by-Side' : language === 'ru' ? 'Сравнить бок о бок' : 'Yan-yana Müqayisə Et'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCandidateIds([])}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Clear Selection' : language === 'ru' ? 'Сбросить' : 'Seçimi Təmizlə'}
                </button>
              </div>
            </div>
          )}

          {filteredApplicants.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs shadow-sm">
              {language === 'en'
                ? 'No applications found for the selected vacancy.'
                : language === 'ru'
                ? 'Откликов по выбранной вакансии не найдено.'
                : 'Seçilmiş vakansiya üzrə müraciət tapılmadı.'}
            </div>
          ) : applicantViewMode === 'kanban' ? (
            /* KANBAN BOARD VIEW */
            <CandidateKanbanBoard
              applications={filteredApplicants}
              offers={companyOffers}
              onOpenApplicantModal={handleOpenApplicantModal}
              onUpdateApplicationStatus={onUpdateApplicationStatus}
              onOpenInterviewModal={(app) => {
                const existingOffer = companyOffers.find((o) => o.applicationId === app.id || o.candidateEmail === app.candidateEmail);
                handleStartInterviewWorkflow(app, existingOffer);
              }}
              onOpenOfferModal={(app) => {
                const existingOffer = companyOffers.find((o) => o.applicationId === app.id || o.candidateEmail === app.candidateEmail);
                handleStartInterviewWorkflow(app, existingOffer);
              }}
              selectedCandidateIds={selectedCandidateIds}
              onToggleCandidateSelection={toggleCandidateSelection}
              onOpenJobiaAIEvaluation={(app) => {
                setCandidateForJobiaAI(app);
                setIsJobiaAIModalOpen(true);
              }}
            />
          ) : (
            /* TABLE / LIST VIEW */
            <div className="space-y-3">
              {filteredApplicants.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2 shadow-2xs">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-800">
                    {language === 'en' ? 'No applications found' : language === 'ru' ? 'Отклики не найдены' : 'Müraciət tapılmadı'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {language === 'en'
                      ? 'No candidate applications match the selected filter.'
                      : language === 'ru'
                      ? 'Нет откликов соискателей по выбранному фильтру.'
                      : 'Seçilmiş filtr üzrə heç bir namizəd müraciəti mövcud deyil.'}
                  </p>
                </div>
              ) : (
                filteredApplicants.map((app) => {
                const existingAppOffer = companyOffers.find((o) => o.applicationId === app.id || o.candidateEmail === app.candidateEmail);
                const isSelected = selectedCandidateIds.includes(app.id);

                return (
                  <div
                    key={app.id}
                    className={`bg-white p-5 rounded-xl border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleCandidateSelection(app.id)}
                        className="mt-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title={isSelected ? (language === 'en' ? 'Deselect' : language === 'ru' ? 'Снять выбор' : 'Seçimi ləğv et') : (language === 'en' ? 'Select to compare' : language === 'ru' ? 'Выбрать для сравнения' : 'Müqayisə üçün seç')}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div
                        onClick={() => handleOpenApplicantModal(app)}
                        className="space-y-1 cursor-pointer flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{app.candidateName}</h3>
                          {app.matchScore && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              <span>{app.matchScore}% {language === 'en' ? 'Match' : language === 'ru' ? 'Соответствие' : 'Uyğunluq'}</span>
                            </span>
                          )}
                          {existingAppOffer && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Offer: {getLocalizedOfferStatus(existingAppOffer.status, language)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-blue-700 font-semibold">{app.vacancyTitle}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span>{app.candidateEmail}</span>
                          <span>•</span>
                          <span>{app.candidatePhone}</span>
                          <span>•</span>
                          <span>{language === 'en' ? 'Applied' : language === 'ru' ? 'Подано' : 'Müraciət'}: {app.appliedDate}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">
                            Status: {getLocalizedApplicationStatus(app.status || 'Müraciət edildi', language)}
                          </span>
                        </div>

                        {app.coverNote && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md mt-2 line-clamp-1 italic">
                            "{app.coverNote}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Jobia AI Assessment button */}
                      <button
                        type="button"
                        onClick={() => {
                          setCandidateForJobiaAI(app);
                          setIsJobiaAIModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={language === 'en' ? 'Jobia AI Evaluation & HR Questions' : language === 'ru' ? 'Оценка Jobia AI и вопросы для HR' : 'Jobia AI Dəyərləndirməsi və HR Sualları'}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{language === 'en' ? 'AI Analysis' : language === 'ru' ? 'ИИ-анализ' : 'Jobia AI Analizi'}</span>
                      </button>

                      {/* One-Click Interview & Offer trigger */}
                      <button
                        onClick={() => handleStartInterviewWorkflow(app, existingAppOffer)}
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                        <span>{language === 'en' ? 'Interview & Offer' : language === 'ru' ? 'Интервью и оффер' : 'Müsahibə & Offer'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenApplicantModal(app)}
                        className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{language === 'en' ? 'Review' : language === 'ru' ? 'Просмотр' : 'İncələ'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </div>
                  </div>
                );
              }))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Job Offers & Acceptance Process */}
      {activeTab === 'offers' && (
        <JobOffersTable
          offers={companyOffers}
          auditLogs={companyLogs}
          onOpenAuditLog={(offerId, candidateName) => setSelectedAuditLogOffer({ id: offerId, name: candidateName })}
          onResendOffer={(offer) => {
            const app: Application = {
              id: offer.applicationId || `app-${offer.id}`,
              vacancyId: '',
              vacancyTitle: offer.position,
              companyId: offer.companyId,
              companyName: offer.companyName,
              companyLogo: offer.companyLogo,
              candidateName: offer.candidateName,
              candidateEmail: offer.candidateEmail,
              candidatePhone: offer.candidatePhone,
              appliedDate: offer.createdAt.split('T')[0],
              status: 'Təklif verildi',
              cvData: {} as any,
            };
            handleStartInterviewWorkflow(app, offer);
          }}
          onOpenOfferWorkflow={(offer) => {
            const app: Application = {
              id: offer.applicationId || `app-${offer.id}`,
              vacancyId: '',
              vacancyTitle: offer.position,
              companyId: offer.companyId,
              companyName: offer.companyName,
              companyLogo: offer.companyLogo,
              candidateName: offer.candidateName,
              candidateEmail: offer.candidateEmail,
              candidatePhone: offer.candidatePhone,
              appliedDate: offer.createdAt.split('T')[0],
              status: 'Təklif verildi',
              cvData: {} as any,
            };
            handleStartInterviewWorkflow(app, offer);
          }}
          onOpenCandidatePortal={onOpenCandidatePortal}
        />
      )}

      {/* TAB 4: Company Profile & Settings */}
      {activeTab === 'company-profile' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'en'
                  ? 'Company Profile & HR Settings'
                  : language === 'ru'
                  ? 'Профиль компании и настройки HR'
                  : 'Müəssisə Profili və HR Tənzimləmələri'}
              </h3>
              <p className="text-slate-500 mt-0.5 text-xs">
                {language === 'en'
                  ? 'Manage enterprise public profile, contact details, and job offer approval policy.'
                  : language === 'ru'
                  ? 'Управляйте официальными данными предприятия, контактами и правилами согласования офферов.'
                  : 'Müəssisənizin rəsmi məlumatlarını, HR əlaqələrini və iş təklifi qaydalarını tənzimləyin.'}
              </p>
            </div>
            {companySaveSuccess && (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'en' ? 'Saved' : language === 'ru' ? 'Сохранено' : 'Yadda saxlanıldı'}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCompanyProfile} className="space-y-5">
            {/* Offer Approval toggle */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-slate-900 text-xs">
                    {language === 'en'
                      ? 'Require Management Approval Before Sending Job Offers'
                      : language === 'ru'
                      ? 'Требовать подтверждение руководства перед отправкой офферов'
                      : 'İş Təklifləri Göndərilməzdən Əvvəl Rəhbərlik Təsdiqi Tələb Olunsun'}
                  </h4>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {language === 'en'
                    ? 'When enabled, job offers prepared by HR recruiters require executive authorization before dispatching to candidates.'
                    : language === 'ru'
                    ? 'При включении, подготовленный HR-специалистом оффер сначала поступает на одобрение руководителю.'
                    : 'Aktiv olduqda, HR əməkdaşının hazırladığı iş təklifi (Job Offer) birbaşa namizədə göndərilmir, əvvəlcə rəhbər tərəfindən təsdiq (Approval) gözləyir.'}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={editedCompany.requireOfferApproval || false}
                  onChange={(e) => setEditedCompany({ ...editedCompany, requireOfferApproval: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Company Logo Upload & Preview Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>
                    {language === 'en' ? 'Company Logo / Avatar' : language === 'ru' ? 'Логотип компании' : 'Şirkət Loqosu / Profil Şəkli'}
                  </span>
                </label>
                {editedCompany.logo && (
                  <button
                    type="button"
                    onClick={handleRemoveCompanyLogo}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'en' ? 'Remove Logo' : language === 'ru' ? 'Удалить логотип' : 'Loqonu Sil'}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Logo Preview */}
                <div className="relative shrink-0">
                  {editedCompany.logo ? (
                    <img
                      src={editedCompany.logo}
                      alt={editedCompany.name || 'Company Logo'}
                      className="w-18 h-18 rounded-2xl object-cover border-2 border-slate-300 shadow-2xs bg-white p-1"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-18 h-18 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6 stroke-1" />
                      <span className="text-[9px] font-semibold mt-0.5">
                        {language === 'en' ? 'No logo' : language === 'ru' ? 'Нет логотипа' : 'Loqo yoxdur'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Actions */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                      id="company-logo-file-input"
                    />
                    <button
                      type="button"
                      disabled={isUploadingLogo}
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isUploadingLogo ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isUploadingLogo
                          ? (language === 'en' ? 'Uploading...' : language === 'ru' ? 'Загрузка...' : 'Yüklənir...')
                          : (language === 'en' ? 'Upload from Device' : language === 'ru' ? 'Загрузить с устройства' : 'Kompüterdən Loqo Yüklə')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateCompanyLogo}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {language === 'en' ? 'Generate Logo' : language === 'ru' ? 'Сгенерировать' : 'Avtomatik Loqo Yarat'}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {language === 'en' ? 'or URL:' : language === 'ru' ? 'или URL:' : 'və ya URL:'}
                    </span>
                    <input
                      type="url"
                      value={editedCompany.logo || ''}
                      onChange={(e) => setEditedCompany({ ...editedCompany, logo: e.target.value })}
                      placeholder="https://example.com/company-logo.png"
                      className="flex-1 p-1.5 text-[11px] rounded-md border border-slate-200 bg-white focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'Company Name *' : language === 'ru' ? 'Название компании *' : 'Müəssisə Adı *'}
                </label>
                <input
                  type="text"
                  required
                  value={editedCompany.name}
                  onChange={(e) => setEditedCompany({ ...editedCompany, name: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Pasha Holding' : language === 'ru' ? 'Например: Pasha Holding' : 'Məs: Paşa Holdinq'}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'Industry / Sector *' : language === 'ru' ? 'Сфера деятельности *' : 'Fəaliyyət Sahəsi *'}
                </label>
                <input
                  type="text"
                  required
                  value={editedCompany.industry}
                  onChange={(e) => setEditedCompany({ ...editedCompany, industry: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. IT & Telecom' : language === 'ru' ? 'Например: ИТ и Телеком' : 'Məs: İT və Telekommunikasiya'}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'Location / City *' : language === 'ru' ? 'Адрес / Город *' : 'Ünvan / Şəhər *'}
                </label>
                <input
                  type="text"
                  required
                  value={editedCompany.location}
                  onChange={(e) => setEditedCompany({ ...editedCompany, location: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Baku, Nizami str. 45' : language === 'ru' ? 'Например: Баку, ул. Низами 45' : 'Məs: Bakı, Nizami küç. 45'}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'Employee Count' : language === 'ru' ? 'Количество сотрудников' : 'İşçi Sayı'}
                </label>
                <input
                  type="text"
                  value={editedCompany.employeeCount || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, employeeCount: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. 50-250 employees' : language === 'ru' ? 'Например: 50-250 человек' : 'Məs: 50-250 nəfər'}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'Official Email' : language === 'ru' ? 'Официальный Email' : 'Rəsmi E-poçt'}
                </label>
                <input
                  type="email"
                  value={editedCompany.email || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, email: e.target.value })}
                  placeholder="hr@company.az"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'Contact Phone' : language === 'ru' ? 'Контактный телефон' : 'Əlaqə Telefonu'}
                </label>
                <input
                  type="tel"
                  value={editedCompany.phone || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, phone: e.target.value })}
                  placeholder="+994 50 123 45 67"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'HR Contact Person' : language === 'ru' ? 'Контактное лицо HR' : 'HR Əlaqədar Şəxs'}
                </label>
                <input
                  type="text"
                  value={editedCompany.hrContactName || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, hrContactName: e.target.value })}
                  placeholder={language === 'en' ? 'Full Name' : language === 'ru' ? 'Имя и фамилия' : 'Ad və Soyad'}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'en' ? 'HR Position' : language === 'ru' ? 'Должность HR' : 'HR Vəzifəsi'}
                </label>
                <input
                  type="text"
                  value={editedCompany.hrContactPosition || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, hrContactPosition: e.target.value })}
                  placeholder={language === 'en' ? 'e.g. Lead Talent Acquisition' : language === 'ru' ? 'Например: Главный HR-менеджер' : 'Məs: Baş İR Meneceri'}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {language === 'en' ? 'Company Description' : language === 'ru' ? 'О компании' : 'Müəssisə Haqqında Təsvir'}
              </label>
              <textarea
                rows={3}
                value={editedCompany.description || ''}
                onChange={(e) => setEditedCompany({ ...editedCompany, description: e.target.value })}
                placeholder={language === 'en' ? 'Short description of enterprise mission and focus...' : language === 'ru' ? 'Краткая информация о деятельности и миссии...' : 'Müəssisənizin fəaliyyət istiqaməti və missiyası haqqında qısa məlumat...'}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg resize-none text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingCompany}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSavingCompany ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {isSavingCompany
                    ? (language === 'en' ? 'Saving...' : language === 'ru' ? 'Сохранение...' : 'Yadda saxlanılır...')
                    : (language === 'en' ? 'Save Changes' : language === 'ru' ? 'Сохранить изменения' : 'Dəyişiklikləri Yadda Saxla')}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: RECRUITING ANALYTICS */}
      {activeTab === 'analytics' && (
        <RecruitingAnalyticsDashboard
          company={activeCompany}
          vacancies={companyJobs}
          applications={companyApplications}
          offers={companyOffers}
        />
      )}

      {/* TAB: CANDIDATE TALENT POOL / KADR BANKI */}
      {activeTab === 'talent-pool' && (
        <CandidateTalentPool
          currentUser={currentUser || null}
          activeCompany={activeCompany}
          onOpenPricingModal={onOpenPricingModal}
        />
      )}

      {/* TAB: VACATION CALCULATOR (HR & ƏMƏKHAQQI) */}
      {activeTab === 'vacation-calculator' && (
        <div className="space-y-4">
          <VacationCalculatorView
            currentUser={currentUser}
            companies={companies}
            activeCompany={activeCompany}
            onOpenAuthModal={onOpenAuthModal}
          />
        </div>
      )}

      {/* Candidate CV & Review Drawer/Modal */}
      {selectedApplicant && (() => {
        const candidateChosenTemplate: CVTemplateType = selectedApplicant.cvTemplate || selectedApplicant.cvData?.template || 'modern-emerald';
        const currentActiveTemplate: CVTemplateType = candidateChosenTemplate;
        const currentShowPhoto = selectedApplicant.showPhoto !== false && selectedApplicant.cvData?.showPhoto !== false;
        const currentTemplateMeta = CV_TEMPLATES.find((t) => t.id === currentActiveTemplate);

        return (
          <ModalPortal>
            <div 
              className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedApplicant(null);
              }}
            >
              <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] my-auto">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4 shrink-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {language === 'en'
                          ? `Application Review: ${selectedApplicant.vacancyTitle}`
                          : language === 'ru'
                          ? `Просмотр отклика: ${selectedApplicant.vacancyTitle}`
                          : `Müraciət İncələməsi: ${selectedApplicant.vacancyTitle}`}
                      </span>
                      {selectedApplicant.isGuestApplication && (
                        <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {language === 'en'
                            ? 'Guest Application'
                            : language === 'ru'
                            ? 'Отклик без регистрации'
                            : 'Qeydiyyatsız Müraciət'}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedApplicant.candidateName}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{selectedApplicant.candidateEmail}</span>
                      <span>•</span>
                      <span>{selectedApplicant.candidatePhone}</span>
                    </div>
                  </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Jobia AI Candidate Evaluator */}
                <button
                  type="button"
                  onClick={() => {
                    setCandidateForJobiaAI(selectedApplicant);
                    setIsJobiaAIModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title={language === 'en' ? 'Jobia AI Evaluation & HR Interview Questions' : language === 'ru' ? 'Оценка Jobia AI и вопросы для интервью' : 'Jobia AI Dəyərləndirməsi və HR Müsahibə Sualları'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'en' ? 'AI Analysis' : language === 'ru' ? 'ИИ-анализ' : 'Jobia AI Analizi'}</span>
                </button>

                {/* Fast Track to AI Interview & Offer Modal */}
                <button
                  onClick={() => {
                    const existingAppOffer = companyOffers.find((o) => o.applicationId === selectedApplicant.id || o.candidateEmail === selectedApplicant.candidateEmail);
                    handleStartInterviewWorkflow(selectedApplicant, existingAppOffer);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>
                    {language === 'en'
                      ? 'Interview & Offer Workflow'
                      : language === 'ru'
                      ? 'Интервью и оффер'
                      : 'Müsahibə & Təklif Workflow'}
                  </span>
                </button>

                {onShareToGoogleChat && (
                  <button
                    id="btn-business-share-applicant-chat"
                    onClick={() => onShareToGoogleChat(selectedApplicant)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    title={language === 'en' ? 'Share candidate in Google Chat space' : language === 'ru' ? 'Поделиться кандидатом в Google Chat' : 'Bu namizədi Google Chat komanda otağında paylaşın'}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Google Chat</span>
                  </button>
                )}

                <button
                  id="btn-business-download-applicant-pdf"
                  onClick={async () => {
                    if (isDownloadingApplicantPDF) return;
                    try {
                      const fileName = generateCVFileName(effectiveApplicantCV || selectedApplicant.cvData);
                      await triggerApplicantPDFDownload('applicant-cv-export', { fileName });
                    } catch (err) {
                      console.error('PDF export error:', err);
                      window.print();
                    }
                  }}
                  disabled={isDownloadingApplicantPDF}
                  className="relative overflow-hidden px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-95"
                  title={language === 'en' ? 'Download candidate CV as PDF' : language === 'ru' ? 'Скачать резюме кандидата в PDF' : 'Namizədin CV-sini PDF olaraq kompüterə yükləyin'}
                >
                  {isDownloadingApplicantPDF && (
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-800/80 transition-all duration-300"
                      style={{ width: `${Math.max(6, Math.min(100, applicantPdfProgressPercent))}%` }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isDownloadingApplicantPDF ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-200" />
                        <span className="font-extrabold text-emerald-200">{applicantPdfProgressPercent}%</span>
                        <span>{applicantPdfProgressStatus || (language === 'en' ? 'Loading...' : language === 'ru' ? 'Загрузка...' : 'Hazırlanır...')}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>CV PDF</span>
                      </>
                    )}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content: Recruiter Action Bar + CV Renderer */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Recruiter Status Updater Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {language === 'en' ? 'Candidate Status:' : language === 'ru' ? 'Статус кандидата:' : 'Namizədin Statusu:'}
                    </span>
                    <select
                      value={selectedNewStatus}
                      onChange={(e) => setSelectedNewStatus(e.target.value as ApplicationStatus)}
                      className="p-2 rounded-lg bg-white border border-slate-300 font-semibold text-slate-900 outline-none"
                    >
                      <option value="Müraciət edildi">{getLocalizedApplicationStatus('Müraciət edildi', language)}</option>
                      <option value="Baxıldı">{getLocalizedApplicationStatus('Baxıldı', language)}</option>
                      <option value="Müsahibəyə dəvət">{getLocalizedApplicationStatus('Müsahibəyə dəvət', language)}</option>
                      <option value="Təklif verildi">{getLocalizedApplicationStatus('Təklif verildi', language)}</option>
                      <option value="Qəbul edildi">{getLocalizedApplicationStatus('Qəbul edildi', language)}</option>
                      <option value="İmtina edildi">{getLocalizedApplicationStatus('İmtina edildi', language)}</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveApplicantStatus}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    {language === 'en' ? 'Save Status & Note' : language === 'ru' ? 'Сохранить статус и заметку' : 'Statusu və Qeydi Yadda Saxla'}
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {language === 'en'
                      ? 'Employer Note / Feedback (Candidate will see this)'
                      : language === 'ru'
                      ? 'Заметка работодателя / Обратная связь (видна кандидату)'
                      : 'İşəgötürən Qeydi / Namizədə Feedback (Namizəd də görəcək)'}
                  </label>
                  <textarea
                    rows={2}
                    value={recruiterNotesInput}
                    onChange={(e) => setRecruiterNotesInput(e.target.value)}
                    placeholder={
                      language === 'en'
                        ? 'e.g. You are invited for a technical interview on August 28 at 15:00...'
                        : language === 'ru'
                        ? 'Например: Вы приглашены на техническое собеседование 28 августа в 15:00...'
                        : 'Məsələn: 28 Avqust saat 15:00-da texniki müsahibəyə dəvət olunursunuz...'
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none resize-none"
                  />
                </div>
              </div>

              {/* ATS Evaluation & Match Score Breakdown */}
              {selectedApplicant.matchScore !== undefined && (
                <div className={`p-4 rounded-xl border ${
                  selectedApplicant.matchScore >= 75
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : selectedApplicant.matchScore >= 45
                    ? 'bg-blue-50/70 border-blue-200'
                    : 'bg-amber-50/70 border-amber-200'
                } space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 ${
                        selectedApplicant.matchScore >= 75 ? 'text-emerald-600' : selectedApplicant.matchScore >= 45 ? 'text-blue-600' : 'text-amber-600'
                      }`} />
                      <span className="font-bold text-slate-900 text-sm">
                        {language === 'en' ? 'ATS Match Score:' : language === 'ru' ? 'Степень соответствия ATS:' : 'ATS Uyğunluq Dərəcəsi:'} {selectedApplicant.matchScore}%
                      </span>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      selectedApplicant.matchScore >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedApplicant.matchScore >= 45
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedApplicant.matchScore >= 80
                        ? (language === 'en' ? 'Excellent Match' : language === 'ru' ? 'Отличное соответствие' : 'Mükəmməl Uyğunluq')
                        : selectedApplicant.matchScore >= 50
                        ? (language === 'en' ? 'Good Match' : language === 'ru' ? 'Хорошее соответствие' : 'Kafi / Yaxşı Uyğunluq')
                        : (language === 'en' ? 'Low Match' : language === 'ru' ? 'Низкое соответствие' : 'Kritik Uyğunsuzluq (Boş və ya zəif CV)')}
                    </span>
                  </div>
                  {selectedApplicant.matchHighlights && selectedApplicant.matchHighlights.length > 0 && (
                    <ul className="space-y-1 mt-2 text-xs text-slate-700">
                      {selectedApplicant.matchHighlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Cover Note if provided */}
              {selectedApplicant.coverNote && (
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">
                    {language === 'en' ? 'Cover Letter:' : language === 'ru' ? 'Сопроводительное письмо:' : 'Namizədin Müşayiət Məktubu:'}
                  </span>
                  <p className="text-slate-700 italic leading-relaxed">"{selectedApplicant.coverNote}"</p>
                </div>
              )}

              {/* Uploaded CV file if applicant attached a file (PDF/Word/DOCX) */}
              {selectedApplicant.cvFileData && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-lg shrink-0 shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        {selectedApplicant.isGuestApplication
                          ? (language === 'en' ? 'Uploaded CV File (Guest)' : language === 'ru' ? 'Загруженный файл резюме (гость)' : 'Qeydiyyatsız Namizədin Yüklədiyi CV Faylı')
                          : (language === 'en' ? 'Attached Original CV Document' : language === 'ru' ? 'Прикрепленный документ резюме' : 'Qoşulmuş Orijinal CV Sənədi')}
                      </span>
                      <h4 className="font-bold text-emerald-950 text-xs sm:text-sm mt-1">
                        {selectedApplicant.cvFileName || 'Namizəd_CV.pdf'}
                      </h4>
                    </div>
                  </div>

                  <a
                    href={selectedApplicant.cvFileData}
                    download={selectedApplicant.cvFileName || `${selectedApplicant.candidateName}_CV.pdf`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>{language === 'en' ? 'Download / Open File' : language === 'ru' ? 'Скачать / Открыть файл' : 'Faylı Yüklə / Aç'}</span>
                  </a>
                </div>
              )}

              {/* Platform-generated CV: Automatically shown ONLY when candidate registered and created CV on the platform */}
              {isPlatformCreatedCV(selectedApplicant) ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>
                        {language === 'en' ? 'Official Platform CV' : language === 'ru' ? 'Официальное резюме с платформы' : 'Platforma Üzərindən Hazırlanmış Rəsmi CV'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>{language === 'en' ? 'Submitted Design:' : language === 'ru' ? 'Выбранный шаблон:' : 'Namizədin Göndərdiyi Şablon:'}</span>
                        <strong className="text-blue-900">{currentTemplateMeta?.name || 'Zümrüd'}</strong>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        {language === 'en' ? 'Original Candidate Design' : language === 'ru' ? 'Оригинальный дизайн' : 'Orijinal Təsdiqlənmiş Dizayn'}
                      </span>
                    </div>
                  </div>

                  {/* Accurate Template CV Rendered identically to candidate CV creator */}
                  <div className="bg-white rounded-xl border border-slate-200 p-2 sm:p-4 shadow-2xs overflow-hidden">
                    <CVRenderer
                      id="applicant-cv-export"
                      data={effectiveApplicantCV || selectedApplicant.cvData}
                      template={currentActiveTemplate}
                      showPhoto={currentShowPhoto}
                    />
                  </div>
                </div>
              ) : selectedApplicant.isGuestApplication ? (
                /* Unregistered applicant without platform CV: NO official platform CV section needed */
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 border border-blue-100">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-800">
                      {language === 'en' ? 'Direct Guest Application' : language === 'ru' ? 'Прямой отклик без регистрации' : 'Qeydiyyatsız Birbaşa Müraciət'}
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      {language === 'en'
                        ? 'The candidate applied directly without registration and provided their resume file. Use the "Download / Open File" button above to view it.'
                        : language === 'ru'
                        ? 'Кандидат откликнулся без регистрации и прикрепил файл резюме. Используйте кнопку «Скачать / Открыть файл» выше для просмотра.'
                        : 'Namizəd platformada qeydiyyatdan keçmədən birbaşa müraciət edib və öz rəsmi CV faylını təqdim edib. Namizədin tam sənədinə baxmaq üçün yuxarıdakı «Faylı Yüklə / Aç» düyməsindən istifadə edə bilərsiniz.'}
                    </p>
                  </div>
                </div>
              ) : selectedApplicant.cvFileData ? (
                /* Registered applicant who attached external CV file instead of platform CV */
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-800">
                      {language === 'en' ? 'Attached CV Document' : language === 'ru' ? 'Прикрепленный документ CV' : 'Qoşulmuş CV Sənədi'}
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      {language === 'en'
                        ? 'The candidate is registered in the system and provided an external CV document. You can view it using the green panel above.'
                        : language === 'ru'
                        ? 'Кандидат зарегистрирован в системе и прикрепил внешний документ резюме. Вы можете просмотреть его в зеленой панели выше.'
                        : 'Namizəd sistemdə qeydiyyatdan keçib və xarici CV sənədini təqdim edib. Sənədə yuxarıdakı yaşıl paneldən baxa bilərsiniz.'}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </ModalPortal>
    );
  })()}

      {/* 7-Step AI Interview & Job Offer Workflow Modal */}
      {activeInterviewApp && (
        <InterviewModal
          application={activeInterviewApp}
          company={activeCompany}
          existingOffer={editingOffer}
          onClose={() => {
            setActiveInterviewApp(null);
            setEditingOffer(undefined);
          }}
          onSaveOffer={(savedOffer, log) => {
            onSaveOffer(savedOffer, log);
          }}
          onUpdateAppStatus={(appId, status, notes) => {
            onUpdateApplicationStatus(appId, status, notes);
          }}
        />
      )}

      {/* Templates Management Modal */}
      {isTemplatesModalOpen && (
        <JobOfferTemplatesModal
          templates={templates}
          onUpdateTemplates={onUpdateTemplates}
          onClose={() => setIsTemplatesModalOpen(false)}
        />
      )}

      {/* Full Vacancy Details Modal for Employer */}
      {selectedJobForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] my-auto">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {getLocalizedCategory(selectedJobForDetail.category, language)}
                  </span>
                  {selectedJobForDetail.isApproved !== false && selectedJobForDetail.status === 'published' ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{language === 'en' ? 'Approved & Published' : language === 'ru' ? 'Одобрено и активно' : 'Təsdiqlənib & Yayımdadır'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>{language === 'en' ? 'Pending Admin Review' : language === 'ru' ? 'На проверке у админа' : 'Admin Təsdiqi Gözləyir'}</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{selectedJobForDetail.title}</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {activeCompany.name} • {getLocalizedCity(selectedJobForDetail.city, language)}
                </p>
              </div>

              <button
                onClick={() => setSelectedJobForDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 divide-y divide-slate-100">
              {/* Moderation & Edit Limit Status Banner */}
              <div className="space-y-2 pt-0">
                {selectedJobForDetail.isApproved === false || selectedJobForDetail.status === 'pending_review' ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-amber-950">
                        {language === 'en' ? 'Moderation Notice:' : language === 'ru' ? 'Информация о модерации:' : 'Moderasiya Məlumatı:'}
                      </strong>
                      <span className="text-[11px] leading-relaxed">
                        {language === 'en'
                          ? 'This vacancy is currently awaiting administrative approval. Once approved, it will be published in the public directory.'
                          : language === 'ru'
                          ? 'Эта вакансия сейчас на проверке администратора. После одобрения она появится в общем каталоге вакансий.'
                          : 'Bu vakansiya hal-hazırda admin təsdiqindədir. Admin təsdiq edən kimi platformanın ümumi "Vakansiyalar" bölməsində bütün namizədlərə görünəcək.'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-emerald-950">
                        {language === 'en' ? 'Vacancy is Active:' : language === 'ru' ? 'Вакансия активна:' : 'Vakansiya Aktivdir:'}
                      </strong>
                      <span className="text-[11px] leading-relaxed">
                        {language === 'en'
                          ? 'Vacancy is approved by administration and accepting applications.'
                          : language === 'ru'
                          ? 'Вакансия проверена администрацией, кандидаты могут подавать отклики.'
                          : 'Vakansiya admin tərəfindən təsdiqlənib və namizədlər müraciət edə bilir.'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(selectedJobForDetail.editCount || 0) < (selectedJobForDetail.maxEditsAllowed || 1) ? (
                      <>
                        <Unlock className="w-4 h-4 text-blue-600" />
                        <div>
                          <strong className="block text-xs font-bold text-slate-900">
                            {language === 'en' ? '1-Time Edit Right: Available' : language === 'ru' ? 'Право 1-кратного редактирования: Доступно' : '1 Dəfəlik Redaktə Hüququ: Mövcuddur'}
                          </strong>
                          <span className="text-[11px] text-slate-500">
                            {language === 'en'
                              ? 'You have not edited this vacancy yet (0/1 used).'
                              : language === 'ru'
                              ? 'Вы еще не редактировали эту вакансию (0/1 использовано).'
                              : 'Siz bu vakansiyanı hələ redaktə etməmisiniz (0/1 istifadə edilib).'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-500" />
                        <div>
                          <strong className="block text-xs font-bold text-slate-900">
                            {language === 'en' ? '1-Time Edit Right: Used' : language === 'ru' ? 'Право 1-кратного редактирования: Использовано' : '1 Dəfəlik Redaktə Hüququ: İstifadə Olunub'}
                          </strong>
                          <span className="text-[11px] text-slate-500">
                            {language === 'en'
                              ? 'Maximum 1 edit limit reached (1/1 used).'
                              : language === 'ru'
                              ? 'Лимит в 1 редактирование исчерпан (1/1).'
                              : 'Maksimum 1 redaktə limiti dolmuşdur (1/1 istifadə edilib).'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Overview Grid */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    {language === 'en' ? 'Offered Salary' : language === 'ru' ? 'Зарплата' : 'Maaş Təklifi'}
                  </span>
                  <span className="text-sm font-black text-blue-700 mt-0.5 block">
                    {selectedJobForDetail.hideSalary
                      ? (language === 'en' ? 'Negotiable' : language === 'ru' ? 'По договоренности' : 'Razılaşma ilə')
                      : `${selectedJobForDetail.minSalary || 0} - ${selectedJobForDetail.maxSalary || 0} ${selectedJobForDetail.currency || 'AZN'}`}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    {language === 'en' ? 'Employment' : language === 'ru' ? 'График работы' : 'İş Qrafiki'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {getLocalizedEmploymentType(selectedJobForDetail.employmentType || 'Tam ştat', language)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    {language === 'en' ? 'Experience Level' : language === 'ru' ? 'Опыт работы' : 'Təcrübə Səviyyəsi'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {getLocalizedExperienceLevel(selectedJobForDetail.experienceLevel || 'Orta', language)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    {language === 'en' ? 'City / Location' : language === 'ru' ? 'Город / Адрес' : 'Şəhər / Ünvan'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block line-clamp-1">
                    {getLocalizedCity(selectedJobForDetail.city, language)}
                  </span>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="pt-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  {language === 'en' ? 'Job Description' : language === 'ru' ? 'Описание работы' : 'İşin Təsviri'}
                </h4>
                <p className="whitespace-pre-line text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                  {selectedJobForDetail.description || (language === 'en' ? 'No description provided.' : language === 'ru' ? 'Описание не указано.' : 'Xüsusi təsvir qeyd edilməyib.')}
                </p>
              </div>

              {/* Responsibilities */}
              {selectedJobForDetail.responsibilities && selectedJobForDetail.responsibilities.length > 0 && (
                <div className="pt-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    {language === 'en' ? 'Key Responsibilities' : language === 'ru' ? 'Обязанности' : 'Vəzifə Öhdəlikləri'}
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {selectedJobForDetail.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {selectedJobForDetail.requirements && selectedJobForDetail.requirements.length > 0 && (
                <div className="pt-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    {language === 'en' ? 'Requirements' : language === 'ru' ? 'Требования к кандидату' : 'Namizədə Tələblər'}
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {selectedJobForDetail.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {selectedJobForDetail.benefits && selectedJobForDetail.benefits.length > 0 && (
                <div className="pt-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    {language === 'en' ? 'Benefits & Perks' : language === 'ru' ? 'Условия и льготы' : 'İş Şəraiti və Təminatlar'}
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {selectedJobForDetail.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Tags */}
              {selectedJobForDetail.skills && selectedJobForDetail.skills.length > 0 && (
                <div className="pt-4 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    {language === 'en' ? 'Required Skills' : language === 'ru' ? 'Требуемые навыки' : 'Tələb Olunan Bacarıqlar'}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJobForDetail.skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      {language === 'en' ? 'Contact Phone' : language === 'ru' ? 'Контактный телефон' : 'Əlaqə Telefonu'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {selectedJobForDetail.contactPhone || activeCompany.phone || (language === 'en' ? 'Not specified' : language === 'ru' ? 'Не указан' : 'Qeyd edilməyib')}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      {language === 'en' ? 'WhatsApp / Address' : language === 'ru' ? 'WhatsApp / Адрес' : 'WhatsApp / Ünvan'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {selectedJobForDetail.contactWhatsapp || selectedJobForDetail.address || (language === 'en' ? 'Not specified' : language === 'ru' ? 'Не указан' : 'Qeyd edilməyib')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const confirmMsg = language === 'en'
                    ? `Are you sure you want to permanently delete "${selectedJobForDetail.title}"?`
                    : language === 'ru'
                    ? `Вы уверены, что хотите удалить вакансию "${selectedJobForDetail.title}"?`
                    : `"${selectedJobForDetail.title}" vakansiyasını həmişəlik silmək istəyirsiniz?`;
                  if (window.confirm(confirmMsg)) {
                    onDeleteJob(selectedJobForDetail.id);
                    setSelectedJobForDetail(null);
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs border border-red-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Delete Vacancy' : language === 'ru' ? 'Удалить вакансию' : 'Vakansiyanı Sil'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const canEdit = (selectedJobForDetail.editCount || 0) < (selectedJobForDetail.maxEditsAllowed || 1);
                    if (canEdit && onOpenEditJobModal) {
                      const jobToEdit = selectedJobForDetail;
                      setSelectedJobForDetail(null);
                      onOpenEditJobModal(jobToEdit);
                    } else {
                      alert(
                        language === 'en'
                          ? 'You have already used your 1-time edit right for this vacancy.'
                          : language === 'ru'
                          ? 'Вы уже использовали право 1-кратного редактирования этой вакансии.'
                          : 'Bu vakansiya üzrə 1 dəfəlik redaktə hüququnuzdan artıq istifadə etmisiniz.'
                      );
                    }
                  }}
                  disabled={(selectedJobForDetail.editCount || 0) >= (selectedJobForDetail.maxEditsAllowed || 1)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                    (selectedJobForDetail.editCount || 0) < (selectedJobForDetail.maxEditsAllowed || 1)
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    {(selectedJobForDetail.editCount || 0) < (selectedJobForDetail.maxEditsAllowed || 1)
                      ? (language === 'en' ? 'Edit (1-Time)' : language === 'ru' ? 'Редактировать (1 раз)' : 'Redaktə Et (1 Dəfəlik)')
                      : (language === 'en' ? 'Edit Limit Reached' : language === 'ru' ? 'Лимит исчерпан' : 'Redaktə Limiti Dolub')}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedJobForDetail(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Close' : language === 'ru' ? 'Закрыть' : 'Bağla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {selectedAuditLogOffer && (
        <OfferAuditLogModal
          logs={auditLogs}
          offerId={selectedAuditLogOffer.id}
          candidateName={selectedAuditLogOffer.name}
          onClose={() => setSelectedAuditLogOffer(null)}
        />
      )}

      {/* Interactive Candidate Side-by-Side Comparator Modal */}
      <CandidateComparatorModal
        isOpen={isComparatorModalOpen}
        onClose={() => setIsComparatorModalOpen(false)}
        candidates={companyApplications.filter((a) => selectedCandidateIds.includes(a.id))}
        offers={companyOffers}
        onOpenApplicantDetail={(cand) => {
          setIsComparatorModalOpen(false);
          handleOpenApplicantModal(cand);
        }}
        onOpenInterviewModal={(cand) => {
          setIsComparatorModalOpen(false);
          const existingOffer = companyOffers.find((o) => o.applicationId === cand.id || o.candidateEmail === cand.candidateEmail);
          handleStartInterviewWorkflow(cand, existingOffer);
        }}
        onOpenOfferModal={(cand) => {
          setIsComparatorModalOpen(false);
          const existingOffer = companyOffers.find((o) => o.applicationId === cand.id || o.candidateEmail === cand.candidateEmail);
          handleStartInterviewWorkflow(cand, existingOffer);
        }}
      />

      {/* Interactive Employer Cost & Salary Tax Simulator Modal */}
      <EmployerCostCalculatorModal
        isOpen={isCostCalculatorModalOpen}
        onClose={() => setIsCostCalculatorModalOpen(false)}
      />

      {/* Interactive Jobia AI Candidate Evaluator & Interview Question Generator Modal */}
      <JobiaAICandidateEvaluatorModal
        isOpen={isJobiaAIModalOpen}
        onClose={() => {
          setIsJobiaAIModalOpen(false);
          setCandidateForJobiaAI(null);
        }}
        applicant={candidateForJobiaAI}
        vacancy={companyJobs.find((j) => j.id === candidateForJobiaAI?.vacancyId) || null}
        onScheduleInterview={(app) => {
          const existingOffer = companyOffers.find((o) => o.applicationId === app.id || o.candidateEmail === app.candidateEmail);
          handleStartInterviewWorkflow(app, existingOffer);
        }}
        onSendOffer={(app) => {
          const existingOffer = companyOffers.find((o) => o.applicationId === app.id || o.candidateEmail === app.candidateEmail);
          handleStartInterviewWorkflow(app, existingOffer);
        }}
        onUpdateApplicationStatus={(appId, newStatus) => {
          onUpdateApplicationStatus(appId, newStatus);
          if (candidateForJobiaAI && candidateForJobiaAI.id === appId) {
            setCandidateForJobiaAI((prev) => prev ? { ...prev, status: newStatus } : null);
          }
          if (selectedApplicant && selectedApplicant.id === appId) {
            setSelectedApplicant((prev) => prev ? { ...prev, status: newStatus } : null);
          }
        }}
      />

      {/* PDF Export Floating Progress & Toast */}
      <PDFDownloadProgressToast
        isDownloading={isDownloadingApplicantPDF}
        progressPercent={applicantPdfProgressPercent}
        progressStatus={applicantPdfProgressStatus}
        showToast={showApplicantPdfToast}
        fileName={applicantPdfFileName}
        onDismissToast={dismissApplicantPdfToast}
      />
    </div>
  );
};
