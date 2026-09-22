import React, { useState, useRef } from 'react';
import { Vacancy, CVData, User, UserRole } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  Building2, 
  MapPin, 
  Clock, 
  Briefcase, 
  DollarSign, 
  CheckCircle, 
  Calendar, 
  Share2, 
  Sparkles, 
  FileText,
  Send,
  MessageSquare,
  Bookmark,
  StickyNote,
  Save,
  Check,
  UploadCloud,
  Paperclip,
  Trash2,
  AlertCircle,
  UserCheck,
  LogIn,
  FileCheck,
  ArrowLeft,
  Crown,
  Bell,
  BellRing,
  Zap,
  ArrowRight
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { JobAlertSubscription } from '../../types';
import { getJobAlertSubscription, saveJobAlertSubscription } from '../../services/firestoreService';
import { buildActiveCandidateCV } from '../../utils/applicationCVHelper';
import { 
  getLocalizedCategory, 
  getLocalizedCity, 
  getLocalizedEmploymentType, 
  getLocalizedExperienceLevel, 
  getLocalizedJobTitle 
} from '../../i18n/localizeData';

interface JobDetailModalProps {
  vacancy: Vacancy | null;
  onClose: () => void;
  savedCV: CVData;
  currentUser?: User | null;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: UserRole) => void;
  onApply: (
    vacancy: Vacancy, 
    coverNote: string, 
    cvData: CVData, 
    attachment?: { fileName: string; fileType: string; fileData: string }
  ) => void;
  hasApplied: boolean;
  jobNote?: string;
  onSaveJobNote?: (note: string) => void;
  isSaved?: boolean;
  onToggleBookmark?: () => void;
  onOpenInterviewPrep: (vacancy: Vacancy) => void;
  onShareToGoogleChat?: (vacancy: Vacancy) => void;
  onViewApplications?: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  vacancy,
  onClose,
  savedCV,
  currentUser,
  onOpenAuthModal,
  onApply,
  hasApplied,
  jobNote = '',
  onSaveJobNote,
  isSaved = false,
  onToggleBookmark,
  onOpenInterviewPrep,
  onShareToGoogleChat,
  onViewApplications,
}) => {
  const { dict, language } = useLanguage();
  if (!vacancy) return null;

  const isCandidateUser = Boolean(currentUser && currentUser.role === 'candidate');
  const [isApplying, setIsApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentNote, setCurrentNote] = useState(jobNote);
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  // Applicant fields state
  const [applicantName, setApplicantName] = useState(() => {
    if (isCandidateUser && currentUser) {
      return currentUser.fullName || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || savedCV.personalInfo.fullName || '';
    }
    return '';
  });
  const [applicantEmail, setApplicantEmail] = useState(() => {
    if (isCandidateUser && currentUser) return currentUser.email || savedCV.personalInfo.email || '';
    return '';
  });
  const [applicantPhone, setApplicantPhone] = useState(() => {
    if (isCandidateUser && currentUser) return currentUser.phone || savedCV.personalInfo.phone || '';
    return '';
  });
  const [applicantJobTitle, setApplicantJobTitle] = useState(() => {
    if (isCandidateUser) return savedCV.personalInfo.jobTitle || '';
    return '';
  });
  const [applicantSummary, setApplicantSummary] = useState('');
  const [applicantPortfolio, setApplicantPortfolio] = useState('');

  // CV File Upload State (for PDF/DOC/DOCX files)
  const [cvFileAttachment, setCvFileAttachment] = useState<{
    fileName: string;
    fileSize: string;
    fileType: string;
    fileData: string;
  } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Keep state in sync if user status changes
  React.useEffect(() => {
    if (isCandidateUser && currentUser) {
      setApplicantName(currentUser.fullName || savedCV.personalInfo.fullName || '');
      setApplicantEmail(currentUser.email || savedCV.personalInfo.email || '');
      setApplicantPhone(currentUser.phone || savedCV.personalInfo.phone || '');
      setApplicantJobTitle(savedCV.personalInfo.jobTitle || '');
    }
  }, [isCandidateUser, currentUser, savedCV]);

  // Candidate Alert Follow State for Company and Category
  const [candidateSubscription, setCandidateSubscription] = useState<JobAlertSubscription | null>(null);
  const [isFollowingCompany, setIsFollowingCompany] = useState(false);
  const [isFollowingCategory, setIsFollowingCategory] = useState(false);

  const candidateUserId = currentUser?.id || 'candidate-guest-session';

  React.useEffect(() => {
    if (!vacancy) return;
    let active = true;
    getJobAlertSubscription(candidateUserId).then((sub) => {
      if (!active) return;
      if (sub) {
        setCandidateSubscription(sub);
        const compFollow = (sub.companies || []).some(
          (c) => c.toLowerCase() === vacancy.companyName.toLowerCase()
        );
        const catFollow = (sub.categories || []).includes(vacancy.category);
        setIsFollowingCompany(compFollow);
        setIsFollowingCategory(catFollow);
      }
    });
    return () => {
      active = false;
    };
  }, [vacancy, candidateUserId]);

  const handleToggleFollowCompany = async () => {
    if (!vacancy) return;
    const currentComps = candidateSubscription?.companies || [];
    const isNowFollowing = !isFollowingCompany;
    const updatedComps = isNowFollowing
      ? [...currentComps.filter((c) => c.toLowerCase() !== vacancy.companyName.toLowerCase()), vacancy.companyName]
      : currentComps.filter((c) => c.toLowerCase() !== vacancy.companyName.toLowerCase());

    setIsFollowingCompany(isNowFollowing);
    const updatedSub: JobAlertSubscription = {
      id: candidateSubscription?.id || `alert-${candidateUserId}`,
      userId: candidateUserId,
      userEmail: currentUser?.email,
      userName: currentUser?.fullName,
      categories: candidateSubscription?.categories || [],
      companies: updatedComps,
      isActive: true,
      frequency: 'instant',
      createdAt: candidateSubscription?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCandidateSubscription(updatedSub);
    await saveJobAlertSubscription(updatedSub);
    window.dispatchEvent(new CustomEvent('jobia_job_alert_updated', { detail: updatedSub }));
  };

  const handleToggleFollowCategory = async () => {
    if (!vacancy) return;
    const currentCats = candidateSubscription?.categories || [];
    const isNowFollowing = !isFollowingCategory;
    const updatedCats = isNowFollowing
      ? [...currentCats.filter((c) => c !== vacancy.category), vacancy.category]
      : currentCats.filter((c) => c !== vacancy.category);

    setIsFollowingCategory(isNowFollowing);
    const updatedSub: JobAlertSubscription = {
      id: candidateSubscription?.id || `alert-${candidateUserId}`,
      userId: candidateUserId,
      userEmail: currentUser?.email,
      userName: currentUser?.fullName,
      categories: updatedCats,
      companies: candidateSubscription?.companies || [],
      isActive: true,
      frequency: 'instant',
      createdAt: candidateSubscription?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCandidateSubscription(updatedSub);
    await saveJobAlertSubscription(updatedSub);
    window.dispatchEvent(new CustomEvent('jobia_job_alert_updated', { detail: updatedSub }));
  };

  // Share URL helper
  const getJobShareUrl = () => {
    try {
      const shareUrl = new URL(window.location.origin + window.location.pathname);
      shareUrl.searchParams.set('job', vacancy.id);
      return shareUrl.toString();
    } catch {
      return `${window.location.origin}/?job=${vacancy.id}`;
    }
  };

  const jobShareUrl = getJobShareUrl();

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(jobShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      navigator.clipboard.writeText(`${window.location.origin}/?job=${vacancy.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSaveNote = () => {
    if (onSaveJobNote) {
      onSaveJobNote(currentNote);
      setIsNoteSaved(true);
      setTimeout(() => setIsNoteSaved(false), 2000);
    }
  };

  // Process File Upload
  const processCVFile = (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('CV faylının ölçüsü maksimum 10 MB ola bilər.');
      return;
    }

    const fileSizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCvFileAttachment({
        fileName: file.name,
        fileSize: fileSizeStr,
        fileType: file.type || 'application/pdf',
        fileData: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCVFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCVFile(e.dataTransfer.files[0]);
    }
  };

  const submitApplication = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormValidationError(null);

    const name = applicantName.trim() || (isCandidateUser && currentUser?.fullName ? currentUser.fullName : '');
    const email = applicantEmail.trim() || (isCandidateUser && currentUser?.email ? currentUser.email : '');
    const phone = applicantPhone.trim() || (isCandidateUser && currentUser?.phone ? currentUser.phone : '');

    if (!name) {
      setFormValidationError(language === 'en' ? 'Please enter your full name.' : language === 'ru' ? 'Пожалуйста, введите имя и фамилию.' : 'Zəhmət olmasa ad və soyadınızı daxil edin.');
      return;
    }
    if (!phone) {
      setFormValidationError(language === 'en' ? 'Please enter your phone number.' : language === 'ru' ? 'Пожалуйста, введите номер телефона.' : 'Zəhmət olmasa əlaqə telefonunuzu daxil edin.');
      return;
    }
    if (!email) {
      setFormValidationError(language === 'en' ? 'Please enter your email address.' : language === 'ru' ? 'Пожалуйста, введите адрес электронной почты.' : 'Zəhmət olmasa e-poçt ünvanınızı daxil edin.');
      return;
    }

    // Unregistered guest applicants must attach their CV file
    if (!isCandidateUser && !cvFileAttachment) {
      setFormValidationError(
        language === 'en'
          ? 'Please attach your CV file (PDF or Word) to submit your application.'
          : language === 'ru'
          ? 'Пожалуйста, прикрепите файл вашего резюме (PDF или Word).'
          : 'Qeydiyyatsız müraciət üçün zəhmət olmasa CV faylınızı (PDF və ya Word) əlavə edin.'
      );
      return;
    }

    // Construct real CV data from the form or registered user using active candidate profile
    const activeBaseCV = buildActiveCandidateCV(currentUser, savedCV);
    const applicationCV: CVData = {
      ...activeBaseCV,
      template: activeBaseCV.template || (localStorage.getItem('jobia_cv_creator_template') as any) || 'modern-emerald',
      showPhoto: activeBaseCV.showPhoto !== undefined ? activeBaseCV.showPhoto : localStorage.getItem('jobia_cv_show_photo') !== 'false',
      personalInfo: {
        ...activeBaseCV.personalInfo,
        fullName: name,
        email: email,
        phone: phone,
        jobTitle: applicantJobTitle.trim() || activeBaseCV.personalInfo.jobTitle || vacancy.title,
        summary: applicantSummary.trim() || activeBaseCV.personalInfo.summary || '',
        portfolio: applicantPortfolio.trim() || activeBaseCV.personalInfo.portfolio || '',
      }
    };

    const attachmentPayload = cvFileAttachment ? {
      fileName: cvFileAttachment.fileName,
      fileType: cvFileAttachment.fileType,
      fileData: cvFileAttachment.fileData,
    } : undefined;

    onApply(vacancy, coverNote, applicationCV, attachmentPayload);
    setIsApplying(false);
    onClose();
  };

  // Instant One-Click Application with Candidate's Ready Platform CV
  const handleOneClickApply = () => {
    const name = applicantName.trim() || currentUser?.fullName || savedCV.personalInfo.fullName || 'Namizəd';
    const email = applicantEmail.trim() || currentUser?.email || savedCV.personalInfo.email || '';
    const phone = applicantPhone.trim() || currentUser?.phone || savedCV.personalInfo.phone || '';

    if (!email) {
      setIsApplying(true);
      setFormValidationError(
        language === 'en'
          ? 'Please provide your email address to complete your application.'
          : language === 'ru'
          ? 'Пожалуйста, укажите ваш email для завершения отклика.'
          : 'Müraciəti tamamlamaq üçün zəhmət olmasa e-poçt ünvanınızı daxil edin.'
      );
      return;
    }

    const activeBaseCV = buildActiveCandidateCV(currentUser, savedCV);
    const applicationCV: CVData = {
      ...activeBaseCV,
      template: activeBaseCV.template || (localStorage.getItem('jobia_cv_creator_template') as any) || 'modern-emerald',
      showPhoto: activeBaseCV.showPhoto !== undefined ? activeBaseCV.showPhoto : localStorage.getItem('jobia_cv_show_photo') !== 'false',
      personalInfo: {
        ...activeBaseCV.personalInfo,
        fullName: name,
        email: email,
        phone: phone,
        jobTitle: applicantJobTitle.trim() || activeBaseCV.personalInfo.jobTitle || currentUser?.jobTitle || vacancy.title,
        summary: applicantSummary.trim() || activeBaseCV.personalInfo.summary || currentUser?.bio || '',
        portfolio: applicantPortfolio.trim() || activeBaseCV.personalInfo.portfolio || '',
      }
    };

    onApply(
      vacancy,
      coverNote.trim() || (language === 'en'
        ? 'Applied with official Jobia profile CV (One-click direct application).'
        : language === 'ru'
        ? 'Отклик отправлен с готовым официальным резюме из профиля Jobia (В 1 клик).'
        : 'Profilimdəki rəsmi Jobia CV-si ilə müraciət edildi (1 kliklə birbaşa müraciət).'),
      applicationCV
    );
    setIsApplying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3 shrink-0">
          <div className="flex flex-col xs:flex-row items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <img
              src={vacancy.companyLogo}
              alt={vacancy.companyName}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleToggleFollowCategory}
                  className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    isFollowingCategory
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200/80'
                  }`}
                  title={
                    isFollowingCategory
                      ? `"${vacancy.category}" ${language === 'en' ? 'category followed' : language === 'ru' ? 'категория отслеживается' : 'kateqoriyası izlənilir'}`
                      : `"${vacancy.category}" ${language === 'en' ? 'follow category' : language === 'ru' ? 'отслеживать категорию' : 'kateqoriyası üzrə yeni vakansiyaları izlə'}`
                  }
                >
                  <Bell className={`w-3 h-3 ${isFollowingCategory ? 'fill-current' : ''}`} />
                  <span>{getLocalizedCategory(vacancy.category, language)}</span>
                  {isFollowingCategory && (
                    <span className="text-[9px] opacity-90 font-black">
                      ✓ {language === 'en' ? 'Following' : language === 'ru' ? 'Отслеживается' : 'İzlənilir'}
                    </span>
                  )}
                </button>
                {vacancy.isFeatured && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-xs ring-1 ring-amber-400/80 uppercase tracking-wide">
                    <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950 shrink-0" />
                    <span>VIP PREMİUM</span>
                  </span>
                )}
                <span className="bg-green-100 text-green-700 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {language === 'en' ? 'ACTIVE' : language === 'ru' ? 'АКТИВНО' : 'AKTİV'}
                </span>
              </div>
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 mt-1 leading-tight break-words">
                {isApplying 
                  ? (language === 'en' ? `Apply: ${getLocalizedJobTitle(vacancy.title, language)}` : language === 'ru' ? `Отклик: ${getLocalizedJobTitle(vacancy.title, language)}` : `Müraciət: ${vacancy.title}`)
                  : getLocalizedJobTitle(vacancy.title, language)}
              </h2>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 sm:gap-x-4 text-[11px] sm:text-xs text-slate-600 mt-1.5 sm:mt-2 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{vacancy.companyName}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleFollowCompany}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                      isFollowingCompany
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                    title={
                      isFollowingCompany
                        ? `"${vacancy.companyName}" ${language === 'en' ? 'company followed' : language === 'ru' ? 'компания отслеживается' : 'izlənilir'}`
                        : `"${vacancy.companyName}" ${language === 'en' ? 'follow company' : language === 'ru' ? 'отслеживать компанию' : 'şirkətinin vakansiyalarını izlə'}`
                    }
                  >
                    <BellRing className={`w-2.5 h-2.5 ${isFollowingCompany ? 'text-blue-700' : 'text-slate-500'}`} />
                    <span>{isFollowingCompany ? (language === 'en' ? 'Following' : language === 'ru' ? 'Отслеживается' : 'İzlənilir') : (language === 'en' ? 'Follow' : language === 'ru' ? 'Подписаться' : 'İzlə')}</span>
                  </button>
                </div>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {getLocalizedCity(vacancy.city, language)}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {getLocalizedEmploymentType(vacancy.employmentType, language)}
                </span>
                <span className="flex items-center gap-1 text-blue-700 font-bold">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {vacancy.hideSalary
                    ? (language === 'en' ? 'Negotiable' : language === 'ru' ? 'По договоренности' : 'Müsahibə əsasında')
                    : `${vacancy.minSalary} - ${vacancy.maxSalary} ${vacancy.currency}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleBookmark && !isApplying && (
              <button
                onClick={onToggleBookmark}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-amber-50 border-amber-200 text-amber-500'
                    : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title={isSaved ? dict.jobExplorer.saved : dict.jobExplorer.saveJob}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Scrollable Content */}
        {isApplying ? (
          /* ========================================================================= */
          /* APPLICATION VIEW (SCROLLABLE FORM WITH PROMINENT STICKY SUBMIT BAR) */
          /* ========================================================================= */
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-700 text-xs sm:text-sm bg-slate-50/40">
            <form id="job-apply-form" onSubmit={submitApplication} className="space-y-4">
              {/* Breadcrumb Back Button */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/70">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en' ? 'Back to vacancy details' : language === 'ru' ? 'Вернуться к описанию вакансии' : 'Vakansiya tələblərinə qayıt'}
                  </span>
                </button>
                <span className="text-[11px] text-slate-500 font-medium">
                  {vacancy.companyName}
                </span>
              </div>

              {/* Validation Alert */}
              {formValidationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-semibold">{formValidationError}</span>
                </div>
              )}

              {/* Candidate State / Notice Card */}
              {isCandidateUser ? (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 p-4 rounded-xl border border-emerald-300 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm">{currentUser?.fullName || applicantName}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          {language === 'en' ? 'Profile CV Active' : language === 'ru' ? 'Резюме активно' : 'Profil CV-si Aktivdir'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {applicantEmail} {applicantPhone ? `• ${applicantPhone}` : ''}
                        {applicantJobTitle ? ` • ${applicantJobTitle}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-3.5 rounded-xl text-[11px] text-amber-900 space-y-1.5 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {language === 'en' ? 'Direct Application without Registration' : language === 'ru' ? 'Прямой отклик без регистрации' : 'Qeydiyyatsız Birbaşa Müraciət'}
                      </span>
                    </div>
                    {onOpenAuthModal && (
                      <button
                        type="button"
                        onClick={() => onOpenAuthModal('login', 'candidate')}
                        className="text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>{language === 'en' ? 'Sign In' : language === 'ru' ? 'Войти в аккаунт' : 'Hesaba Daxil Ol'}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    {language === 'en'
                      ? 'Fill in your contact details below and attach your CV (PDF/DOCX). Your application will be sent directly to the employer.'
                      : language === 'ru'
                      ? 'Заполните ваши контактные данные ниже и прикрепите резюме (PDF/DOCX). Ваш отклик будет отправлен напрямую работодателю.'
                      : 'Aşağıdakı əlaqə məlumatlarınızı doldurun və CV faylınızı (PDF/DOCX) əlavə edin. Müraciətiniz birbaşa işəgötürənə çatdırılacaq.'}
                  </p>
                </div>
              )}

              {/* Contact Info Inputs */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {language === 'en' ? 'Contact & Candidate Information' : language === 'ru' ? 'Контакты и информация кандидата' : 'Əlaqə və Namizəd Məlumatları'}
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'en' ? 'Full Name' : language === 'ru' ? 'Имя и Фамилия' : 'Ad və Soyad'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder={language === 'en' ? 'e.g. John Doe' : language === 'ru' ? 'напр. Иван Иванов' : 'Məsələn: Əli Məmmədov'}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'en' ? 'Phone Number (WhatsApp)' : language === 'ru' ? 'Номер телефона (WhatsApp)' : 'Əlaqə Telefonu (WhatsApp)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="+994 50 123 45 67"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'en' ? 'Email Address' : language === 'ru' ? 'Электронная почта' : 'E-poçt Ünvanı'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'en' ? 'Specialization / Current Title' : language === 'ru' ? 'Специальность / Текущая должность' : 'İxtisas / Mövcud Vəzifə'}
                    </label>
                    <input
                      type="text"
                      value={applicantJobTitle}
                      onChange={(e) => setApplicantJobTitle(e.target.value)}
                      placeholder={getLocalizedJobTitle(vacancy.title, language)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* DEDICATED CV FILE UPLOAD SECTION */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'en' ? 'CV File (PDF, DOC, DOCX)' : language === 'ru' ? 'Файл резюме (PDF, DOC, DOCX)' : 'CV Faylı (PDF, DOC, DOCX)'}{' '}
                    {!isCandidateUser && (
                      <span className="text-blue-600 font-bold">
                        ({language === 'en' ? 'Recommended' : language === 'ru' ? 'Рекомендуется' : 'Tövsiyə olunur'})
                      </span>
                    )}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {language === 'en' ? 'Max 10 MB' : language === 'ru' ? 'Максимум 10 МБ' : 'Maksimum 10 MB'}
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                />

                {cvFileAttachment ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-emerald-950 text-xs truncate">
                          {cvFileAttachment.fileName}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-medium">
                          {cvFileAttachment.fileSize} • {language === 'en' ? 'File successfully attached' : language === 'ru' ? 'Файл успешно прикреплен' : 'Fayl uğurla əlavə edildi'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                      >
                        {language === 'en' ? 'Change' : language === 'ru' ? 'Изменить' : 'Dəyiş'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCvFileAttachment(null)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title={language === 'en' ? 'Remove file' : language === 'ru' ? 'Удалить файл' : 'Faylı sil'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDraggingFile
                        ? 'border-blue-500 bg-blue-50/70'
                        : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
                    }`}
                  >
                    <UploadCloud className="w-7 h-7 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-800">
                      {language === 'en' ? (
                        <>Drag and drop your CV here or <span className="text-blue-600 underline">browse files</span></>
                      ) : language === 'ru' ? (
                        <>Перетащите резюме сюда или <span className="text-blue-600 underline">выберите файл</span></>
                      ) : (
                        <>CV sənədinizi buraya sürükləyin və ya <span className="text-blue-600 underline">kompüterdən seçin</span></>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {language === 'en' ? 'Supported formats: PDF, Word (DOC, DOCX)' : language === 'ru' ? 'Поддерживаемые форматы: PDF, Word (DOC, DOCX)' : 'Dəstəklənən formatlar: PDF, Word (DOC, DOCX)'}
                    </p>
                  </div>
                )}
              </div>

              {/* Optional Links and Notes */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'en' ? 'Portfolio / LinkedIn / GitHub Link (Optional)' : language === 'ru' ? 'Ссылка на портфолио / LinkedIn / GitHub (Необязательно)' : 'Portfolio / LinkedIn / GitHub Linki (İxtiyari)'}
                  </label>
                  <input
                    type="url"
                    value={applicantPortfolio}
                    onChange={(e) => setApplicantPortfolio(e.target.value)}
                    placeholder={language === 'en' ? 'https://linkedin.com/in/your-profile or portfolio URL' : language === 'ru' ? 'https://linkedin.com/in/ваш-профиль или ссылка' : 'https://linkedin.com/in/profiliniz və ya portfolio linki'}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'en' ? 'Note to Employer / Cover Letter (Optional)' : language === 'ru' ? 'Сопроводительное письмо работодателю (Необязательно)' : 'İşəgötürənə Qeyd / Müşayiət Məktubu (İxtiyari)'}
                  </label>
                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder={language === 'en' ? 'Hello, I believe my experience and skills make me a great fit for this position...' : language === 'ru' ? 'Здравствуйте, мой опыт работы и навыки соответствуют требованиям этой вакансии...' : 'Salam, bu vakansiya üzrə təcrübəmin şirkətiniz üçün faydalı olacağına inanıram...'}
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-none bg-white font-medium text-slate-900"
                  />
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* ========================================================================= */
          /* JOB DETAILS VIEW (DEFAULT) */
          /* ========================================================================= */
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs sm:text-sm">
            {/* Quick AI Action Card for Candidates */}
            <div>
              <button
                onClick={() => {
                  onClose();
                  onOpenInterviewPrep(vacancy);
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-4 h-4 group-hover:scale-105 transition-transform" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{dict.jobDetail.interviewPrep}</div>
                  <div className="text-[11px] text-slate-600">
                    {language === 'en' ? 'Expected interview questions and answers' : language === 'ru' ? 'Ожидаемые вопросы и ответы для собеседования' : 'Bu vəzifə üçün gözlənilən suallar və cavablar'}
                  </div>
                </div>
              </button>
            </div>

            {/* PERSONAL CANDIDATE NOTES BOX */}
            {onSaveJobNote && (
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <StickyNote className="w-4 h-4 text-amber-600" />
                    <span>{dict.jobExplorer.addNote}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {isNoteSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isNoteSaved ? (language === 'en' ? 'Saved' : language === 'ru' ? 'Сохранено' : 'Saxlanıldı') : dict.jobExplorer.saveNote}</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder={language === 'en' ? 'Personal note about this vacancy...' : language === 'ru' ? 'Личная заметка о вакансии...' : 'Bu vakansiya haqqında şəxsi qeydiniz...'}
                  className="w-full text-xs p-2.5 rounded-lg border border-amber-200 bg-white focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'en' ? 'Job Description' : language === 'ru' ? 'Описание вакансии' : 'Vakansiya Haqqında'}
              </h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">{vacancy.description}</p>
            </div>

            {/* Responsibilities */}
            {vacancy.responsibilities && vacancy.responsibilities.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {language === 'en' ? 'Responsibilities' : language === 'ru' ? 'Обязанности' : 'Vəzifə Öhdəlikləri'}
                </h3>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 text-xs sm:text-sm">
                  {vacancy.responsibilities.map((resp, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {vacancy.requirements && vacancy.requirements.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {language === 'en' ? 'Requirements' : language === 'ru' ? 'Требования к кандидату' : 'Namizədə Tələblər'}
                </h3>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 text-xs sm:text-sm">
                  {vacancy.requirements.map((req, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {vacancy.benefits && vacancy.benefits.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {language === 'en' ? 'Benefits & Perks' : language === 'ru' ? 'Условия и преимущества' : 'Təminatlar və Üstünlüklər'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {vacancy.benefits.map((ben, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800">
                      <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{ben}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Required */}
            {vacancy.skills && vacancy.skills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {language === 'en' ? 'Required Skills' : language === 'ru' ? 'Требуемые навыки' : 'Tələb Olunan Bacarıqlar'}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {vacancy.skills.map((skill, idx) => (
                    <span key={idx} className="text-xs font-medium bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meta dates */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'en' ? 'Posted' : language === 'ru' ? 'Дата публикации' : 'Elan tarixi'}: {vacancy.postedDate}</span>
                <span className="mx-1">•</span>
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold text-slate-700">{dict.jobExplorer.deadline} {vacancy.deadline}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{vacancy.viewsCount} {dict.jobExplorer.sortViews}</span>
                <span>{vacancy.applicantsCount} {language === 'en' ? 'applicants' : language === 'ru' ? 'откликов' : 'müraciət'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PERSISTENT STICKY MODAL FOOTER */}
        {/* ========================================================================= */}
        {isApplying ? (
          <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0 shadow-lg">
            <button
              type="button"
              onClick={() => setIsApplying(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Back / Cancel' : language === 'ru' ? 'Назад / Отмена' : 'Geri / Ləğv et'}</span>
            </button>

            <button
              type="button"
              onClick={() => submitApplication()}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'en' ? 'Submit Application' : language === 'ru' ? 'Отправить заявку' : 'Müraciəti Göndər'}</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 sm:p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5 max-w-full">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
                title={copied ? (language === 'en' ? 'Link copied!' : language === 'ru' ? 'Ссылка скопирована!' : 'Link kopyalandı!') : (language === 'en' ? 'Copy Link' : language === 'ru' ? 'Копировать' : 'Linki Kopyala')}
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{copied ? (language === 'en' ? 'Link copied!' : language === 'ru' ? 'Ссылка скопирована!' : 'Link kopyalandı!') : (language === 'en' ? 'Copy Link' : language === 'ru' ? 'Копировать' : 'Linki Kopyala')}</span>
              </button>

              {onShareToGoogleChat && (
                <button
                  type="button"
                  onClick={() => onShareToGoogleChat(vacancy)}
                  className="p-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Google Chat"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Google Chat</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-end w-full sm:w-auto shrink-0">
              {hasApplied ? (
                <div className="w-full sm:w-auto flex flex-wrap items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{language === 'en' ? 'You have already applied to this job' : language === 'ru' ? 'Вы уже откликнулись на эту вакансию' : 'Siz bu vakansiyaya artıq müraciət etmisiniz'}</span>
                  </div>
                  {onViewApplications && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewApplications();
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                    >
                      <span>{language === 'en' ? 'My Applications' : language === 'ru' ? 'Мои отклики' : 'Müraciətlərimə Bax'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : isCandidateUser ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  {/* ONE-TOUCH DIRECT APPLY WITH SAVED PROFILE/CV */}
                  <button
                    id="btn-one-click-apply"
                    type="button"
                    onClick={handleOneClickApply}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all cursor-pointer ring-2 ring-emerald-400/40"
                    title={language === 'en' ? 'One-click instant application with your profile CV' : language === 'ru' ? 'Отклик в 1 клик с готовым резюме' : 'Profilinizdəki hazır rəsmi CV ilə dərhal müraciət edin'}
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
                    <span className="whitespace-nowrap">
                      {language === 'en'
                        ? '⚡ One-Click Apply with Ready CV'
                        : language === 'ru'
                        ? '⚡ Откликнуться готовым CV (1 клик)'
                        : '⚡ Hazır CV-mlə Müraciət Et (1 Kliklə)'}
                    </span>
                  </button>

                  <button
                    id="btn-apply-job"
                    type="button"
                    onClick={() => setIsApplying(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                    title={language === 'en' ? 'Open form to add note or update details' : language === 'ru' ? 'Открыть форму с примечанием' : 'Qeyd əlavə et / Formla müraciət'}
                  >
                    <span>{language === 'en' ? 'Add Note / Form' : language === 'ru' ? 'С примечанием' : 'Qeyd əlavə et'}</span>
                  </button>
                </div>
              ) : (
                <button
                  id="btn-apply-job"
                  onClick={() => setIsApplying(true)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{dict.jobExplorer.applyNow}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic moving Jobia Logo at bottom of modal */}
        <ModalBottomLogo
          tagline={
            language === 'en'
              ? 'Jobia.az Official Vacancy Details'
              : language === 'ru'
              ? 'Jobia.az Официальные детали вакансии'
              : 'Jobia.az Rəsmi Vakansiya Təfərrüatları'
          }
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
