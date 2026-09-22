import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserEmailPreferences, 
  EmailAlertFrequency,
  CVData
} from '../../types';
import { 
  updateUserEmailPreferencesInFirestore,
  saveCandidateProfile,
  saveCandidatePlatformCV
} from '../../services/firestoreService';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  User as UserIcon, 
  Settings, 
  Mail, 
  Bell, 
  BellOff, 
  Zap, 
  Calendar, 
  Clock, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Briefcase, 
  DollarSign, 
  Send, 
  Eye, 
  Sliders, 
  CheckCircle2,
  ExternalLink,
  Laptop,
  Save,
  FileText,
  Download,
  Plus,
  Trash2,
  GraduationCap,
  Languages,
  MapPin,
  Phone,
  Edit3,
  CheckCircle,
  UserCheck,
  LogOut,
  Loader2
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { CANDIDATE_REGIONS, SPECIAL_WORK_PREFERENCES, detectRegionId } from '../../data/candidateRegions';
import { CVRenderer } from '../cv-templates/CVRenderer';
import { downloadCVAsPDF } from '../../utils/pdfExport';
import { usePDFDownload } from '../../hooks/usePDFDownload';
import { PDFDownloadProgressToast } from '../common/PDFDownloadProgressToast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  candidateCV?: CVData;
  onUpdateCandidateCV?: (cv: CVData) => void;
  onUpdateUser: (updatedUser: User) => void;
  onOpenVerifyModal?: (user: User) => void;
  onOpenPricing?: () => void;
  initialTab?: 'profile' | 'settings' | 'security';
  onNavigateToTab?: (tab: any) => void;
  onLogout?: () => void;
}

const DEFAULT_PREFERENCES: UserEmailPreferences = {
  jobAlertFrequency: 'instant',
  categories: ['İnformasiya Texnologiyaları', 'Dizayn & Yaradıcılıq'],
  minSalary: 0,
  remoteOnly: false,
  minMatchScore: 70,
  applicationStatusUpdates: true,
  interviewAndOfferAlerts: true,
  newsletterDigest: false,
};

const AVAILABLE_CATEGORIES = [
  'İnformasiya Texnologiyaları',
  'Dizayn & Yaradıcılıq',
  'Marketinq & PR',
  'Maliyyə & Mühasibat',
  'Satış & Müştəri Xidmətləri',
  'İdarəetmə & HR',
  'Mühəndislik',
  'Təhsil & Təlim',
  'Səhiyyə & Tibb',
  'Logistika & Nəqliyyat',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  candidateCV,
  onUpdateCandidateCV,
  onUpdateUser,
  onOpenVerifyModal,
  onOpenPricing,
  initialTab,
  onNavigateToTab,
  onLogout,
}) => {
  const { language } = useLanguage();
  const defaultTab = initialTab || (currentUser?.role === 'candidate' ? 'profile' : 'settings');
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security'>(defaultTab);

  // Email Preferences State
  const [preferences, setPreferences] = useState<UserEmailPreferences>(() => {
    return currentUser?.emailPreferences || DEFAULT_PREFERENCES;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  // Candidate Profile State
  const [profileFullName, setProfileFullName] = useState(currentUser?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || candidateCV?.personalInfo?.phone || '');
  const [profileJobTitle, setProfileJobTitle] = useState(currentUser?.jobTitle || candidateCV?.personalInfo?.jobTitle || '');
  const [profileLocation, setProfileLocation] = useState(currentUser?.location || candidateCV?.personalInfo?.address || 'Bakı, Azərbaycan');
  const [profileLivingRegion, setProfileLivingRegion] = useState<string>(() => {
    return currentUser?.livingRegion || detectRegionId(currentUser?.location) || 'baku';
  });
  const [profileLivingCity, setProfileLivingCity] = useState<string>(() => {
    return currentUser?.livingCity || (currentUser?.location ? currentUser.location.split(',')[0].trim() : 'Bakı');
  });
  const [profileEligibleWorkRegions, setProfileEligibleWorkRegions] = useState<string[]>(() => {
    if (currentUser?.eligibleWorkRegions && currentUser.eligibleWorkRegions.length > 0) {
      return currentUser.eligibleWorkRegions;
    }
    return ['baku', 'remote'];
  });
  const [profileWillingToRelocate, setProfileWillingToRelocate] = useState<boolean>(() => {
    return currentUser?.willingToRelocate ?? true;
  });
  const [profileBio, setProfileBio] = useState(currentUser?.bio || candidateCV?.personalInfo?.summary || '');
  const [profileExpectedSalary, setProfileExpectedSalary] = useState<string>(currentUser?.expectedSalary ? String(currentUser.expectedSalary) : '');
  const [profileSkills, setProfileSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [showCVPreview, setShowCVPreview] = useState(false);
  const [inlineCVExpanded, setInlineCVExpanded] = useState(false);
  const {
    isDownloading: isDownloadingPDF,
    progressPercent: pdfProgressPercent,
    progressStatus: pdfProgressStatus,
    showToast: showPdfToast,
    fileName: pdfFileName,
    downloadPDF: triggerDownloadPDF,
    dismissToast: dismissPdfToast,
  } = usePDFDownload();
  const [isOpenToEmployers, setIsOpenToEmployers] = useState<boolean>(() => {
    if (currentUser?.isOpenToEmployers !== undefined) return currentUser.isOpenToEmployers;
    if (currentUser?.profileVisibility !== undefined) return currentUser.profileVisibility === 'public';
    return true;
  });

  // Synchronize when currentUser changes or modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setActiveTab(initialTab || (currentUser.role === 'candidate' ? 'profile' : 'settings'));
      if (currentUser.emailPreferences) {
        setPreferences(currentUser.emailPreferences);
      }
      setProfileFullName(currentUser.fullName || '');
      setProfilePhone(currentUser.phone || candidateCV?.personalInfo?.phone || '');
      setProfileJobTitle(currentUser.jobTitle || candidateCV?.personalInfo?.jobTitle || '');
      setProfileLocation(currentUser.location || candidateCV?.personalInfo?.address || 'Bakı, Azərbaycan');
      setProfileLivingRegion(currentUser.livingRegion || detectRegionId(currentUser.location) || 'baku');
      setProfileLivingCity(currentUser.livingCity || (currentUser.location ? currentUser.location.split(',')[0].trim() : 'Bakı'));
      setProfileEligibleWorkRegions(
        (currentUser.eligibleWorkRegions && currentUser.eligibleWorkRegions.length > 0)
          ? currentUser.eligibleWorkRegions
          : ['baku', 'remote']
      );
      setProfileWillingToRelocate(currentUser.willingToRelocate ?? true);
      setProfileBio(currentUser.bio || candidateCV?.personalInfo?.summary || '');
      setProfileExpectedSalary(currentUser.expectedSalary ? String(currentUser.expectedSalary) : '');
      setIsOpenToEmployers(
        currentUser.isOpenToEmployers !== undefined
          ? currentUser.isOpenToEmployers
          : currentUser.profileVisibility !== 'private'
      );
      
      const skills = (currentUser.skills && currentUser.skills.length > 0)
        ? currentUser.skills
        : (candidateCV?.skills && candidateCV.skills.length > 0)
        ? candidateCV.skills.map((s) => s.name)
        : [];
      setProfileSkills(skills);

      setSaveSuccess(false);
      setProfileSaveSuccess(false);
      setTestSentMessage(null);
      setShowCVPreview(false);
    }
  }, [isOpen, initialTab, currentUser, candidateCV]);

  if (!isOpen || !currentUser) return null;

  const hasSavedCV = Boolean(
    (candidateCV && (
      (candidateCV.experiences && candidateCV.experiences.length > 0) ||
      (candidateCV.education && candidateCV.education.length > 0) ||
      (candidateCV.skills && candidateCV.skills.length > 0) ||
      Boolean(candidateCV.personalInfo?.jobTitle && candidateCV.personalInfo.jobTitle.trim())
    )) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('jobia_has_platform_cv') === 'true')
  );

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !profileSkills.includes(trimmed)) {
      setProfileSkills([...profileSkills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileSkills(profileSkills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSavingProfile(true);
    try {
      const updatedUser: User = {
        ...currentUser,
        fullName: profileFullName.trim() || currentUser.fullName,
        phone: profilePhone.trim(),
        jobTitle: profileJobTitle.trim(),
        location: profileLocation.trim(),
        livingRegion: profileLivingRegion,
        livingCity: profileLivingCity.trim(),
        eligibleWorkRegions: profileEligibleWorkRegions,
        willingToRelocate: profileWillingToRelocate,
        bio: profileBio.trim(),
        skills: profileSkills,
        expectedSalary: profileExpectedSalary ? Number(profileExpectedSalary) : undefined,
        isOpenToEmployers: isOpenToEmployers,
        profileVisibility: isOpenToEmployers ? 'public' : 'private',
      };

      // 1. Save to Firestore candidate profile
      await saveCandidateProfile(currentUser.id, {
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        professionalTitle: updatedUser.jobTitle || '',
        location: updatedUser.location || '',
        livingRegion: profileLivingRegion,
        livingCity: profileLivingCity.trim(),
        eligibleWorkRegions: profileEligibleWorkRegions,
        willingToRelocate: profileWillingToRelocate,
        about: updatedUser.bio || '',
        skills: updatedUser.skills || [],
        expectedSalary: updatedUser.expectedSalary,
        isOpenToEmployers: isOpenToEmployers,
        profileVisibility: isOpenToEmployers ? 'public' : 'private',
      });

      // 2. Synchronize candidateCV if present
      if (candidateCV && onUpdateCandidateCV) {
        const updatedCV: CVData = {
          ...candidateCV,
          personalInfo: {
            ...candidateCV.personalInfo,
            fullName: updatedUser.fullName,
            phone: updatedUser.phone || candidateCV.personalInfo.phone,
            jobTitle: updatedUser.jobTitle || candidateCV.personalInfo.jobTitle,
            address: updatedUser.location || candidateCV.personalInfo.address,
            summary: updatedUser.bio || candidateCV.personalInfo.summary,
          },
          skills: profileSkills.map((name, idx) => ({
            id: `skill-prof-${idx}-${Date.now()}`,
            name,
            level: 'Əla / Ekspert',
            category: 'Texniki',
          })),
        };
        onUpdateCandidateCV(updatedCV);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`jobia_candidate_cv_${currentUser.id}`, JSON.stringify(updatedCV));
          localStorage.setItem('jobia_candidate_cv', JSON.stringify(updatedCV));
        }
        try {
          await saveCandidatePlatformCV(currentUser.id, updatedCV);
        } catch (cvErr) {
          console.warn('Could not sync candidate CV to Firestore:', cvErr);
        }
      }

      onUpdateUser(updatedUser);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!candidateCV || !currentUser) return;
    try {
      const fileName = `${currentUser.fullName.trim().replace(/\s+/g, '_')}_CV.pdf`;
      await triggerDownloadPDF('candidate-profile-cv-render-zone', { fileName });
    } catch (err) {
      console.error('Failed to download CV PDF:', err);
    }
  };

  const handleFrequencySelect = (freq: EmailAlertFrequency) => {
    setPreferences((prev) => ({
      ...prev,
      jobAlertFrequency: freq,
    }));
  };

  const handleToggleCategory = (cat: string) => {
    setPreferences((prev) => {
      const exists = prev.categories.includes(cat);
      const updated = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: updated };
    });
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const updatedPrefs = {
        ...preferences,
        updatedAt: new Date().toISOString(),
      };
      await updateUserEmailPreferencesInFirestore(currentUser.id, currentUser.email, updatedPrefs);

      const updatedUser: User = {
        ...currentUser,
        emailPreferences: updatedPrefs,
      };
      onUpdateUser(updatedUser);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save email preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestAlert = () => {
    setTestSentMessage(`✅ Nümunə "${preferences.jobAlertFrequency === 'daily' ? 'Gündəlik Xülasə' : preferences.jobAlertFrequency === 'weekly' ? 'Həftəlik Xülasə' : 'Anlıq Xəbərdarlıq'}" bildirişi ${currentUser.email} ünvanına simulyasiya edildi.`);
    setTimeout(() => setTestSentMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`}
                alt={currentUser.fullName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-xs"
              />
              {currentUser.emailVerified ? (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" title="Təsdiqlənib" />
              ) : (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white" title="Təsdiqlənməyib" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {currentUser.fullName}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  currentUser.role === 'business'
                    ? 'bg-purple-100 text-purple-800'
                    : currentUser.role === 'admin'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {currentUser.role === 'business' ? 'İşəgötürən' : currentUser.role === 'admin' ? 'Admin' : 'Namizəd'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                <span>{currentUser.email}</span>
                {currentUser.emailVerified ? (
                  <span className="inline-flex items-center text-emerald-600 text-[11px] font-semibold">
                    <Check className="w-3 h-3 ml-0.5 inline" /> Təsdiqlənib
                  </span>
                ) : (
                  <span className="inline-flex items-center text-amber-600 text-[11px] font-semibold">
                    <AlertCircle className="w-3 h-3 ml-0.5 inline" /> Təsdiqlənməyib
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onLogout && (
              <button
                id="user-profile-modal-logout-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer shadow-2xs active:scale-95"
                title={language === 'en' ? 'Log out' : language === 'ru' ? 'Выйти' : 'Hesabdan çıxış et'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Sign out' : language === 'ru' ? 'Выход' : 'Çıxış'}</span>
              </button>
            )}
            {!currentUser.emailVerified && onOpenVerifyModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVerifyModal(currentUser);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                E-poçtu Təsdiqlə ⚡
              </button>
            )}
            <button
              id="close-user-profile-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              title="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HORIZONTAL TAB SELECTOR */}
        <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
          <button
            id="user-profile-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{currentUser.role === 'candidate' ? 'Namizəd Profili & CV' : 'Hesab Məlumatları'}</span>
            {currentUser.role === 'candidate' && hasSavedCV && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Aktiv CV sistemdə mövcuddur" />
            )}
          </button>

          <button
            id="user-profile-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Tənzimləmələr & Bildirişlər</span>
            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
              YENİ
            </span>
          </button>

          <button
            id="user-profile-tab-security"
            onClick={() => setActiveTab('security')}
            className={`py-3.5 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Təhlükəsizlik</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: SETTINGS & EMAIL PREFERENCES (REQUESTED MAIN FEATURE) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* SECTION: Notification Frequency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Vakansiya E-poçt Bildirişləri Tezliyi</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Yeni vakansiyalar paylaşıldıqda e-poçtunuza necə və hansı intervalla xəbərdarlıq göndərilsin?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  
                  {/* Option 1: Instant Alerts */}
                  <div
                    id="pref-freq-instant"
                    onClick={() => handleFrequencySelect('instant')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      preferences.jobAlertFrequency === 'instant'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          preferences.jobAlertFrequency === 'instant' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Anlıq Bildirişlər</div>
                          <div className="text-[10px] text-blue-700 font-semibold">Instant Alerts</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        Tövsiyə olunan
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                      Sizə uyğun yeni vakansiya dərc olunan kimi dərhal e-poçtunuza birbaşa müraciət linki ilə göndərilir.
                    </p>
                  </div>

                  {/* Option 2: Daily Digest */}
                  <div
                    id="pref-freq-daily"
                    onClick={() => handleFrequencySelect('daily')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      preferences.jobAlertFrequency === 'daily'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          preferences.jobAlertFrequency === 'daily' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Gündəlik Xülasə</div>
                          <div className="text-[10px] text-slate-500 font-medium">Daily Digest</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        Saat 09:00
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                      Hər səhər profilinizə və tələblərinizə ən çox uyğun gələn 5-10 seçilmiş vakansiyanın təmiz xülasəsi.
                    </p>
                  </div>

                  {/* Option 3: Weekly Digest */}
                  <div
                    id="pref-freq-weekly"
                    onClick={() => handleFrequencySelect('weekly')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      preferences.jobAlertFrequency === 'weekly'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          preferences.jobAlertFrequency === 'weekly' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Həftəlik Xülasə</div>
                          <div className="text-[10px] text-slate-500 font-medium">Weekly Digest</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        Bazar ertəsi
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                      Həftədə bir dəfə bazarda ən yüksək maaşlı və reytinqli vakansiyaların həftəlik icmalı.
                    </p>
                  </div>

                  {/* Option 4: Disabled */}
                  <div
                    id="pref-freq-disabled"
                    onClick={() => handleFrequencySelect('disabled')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      preferences.jobAlertFrequency === 'disabled'
                        ? 'border-slate-600 bg-slate-100 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          preferences.jobAlertFrequency === 'disabled' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <BellOff className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Bildirişləri Dayandır</div>
                          <div className="text-[10px] text-slate-500 font-medium">Notifications Off</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
                      E-poçt vasitəsilə vakansiya təklifləri göndərilməyəcək. Yalnız saytdaxili bildirişlər aktiv qalacaq.
                    </p>
                  </div>

                </div>
              </div>

              {/* SECTION: Filtering Criteria (Shown when frequency != 'disabled') */}
              {preferences.jobAlertFrequency !== 'disabled' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900">Bildiriş Meyarları və Ağıllı Filtirlər</h4>
                  </div>

                  {/* Category Pills */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">
                      Maraqlandığınız Kateqoriyalar (Seçilmiş sahələr üzrə göndəriləcək):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_CATEGORIES.map((cat) => {
                        const isSelected = preferences.categories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleToggleCategory(cat)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            <span>{cat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Minimum Salary and Remote Filter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Minimum Maaş Şərti (AZN):
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="pref-min-salary-input"
                          type="number"
                          value={preferences.minSalary || ''}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            minSalary: e.target.value ? parseInt(e.target.value, 10) : 0,
                          })}
                          placeholder="Məs: 1000 (Boş buraxsanız hamısı)"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Yalnız bu məbləğdən yuxarı elanlar üzrə xəbərdarlıq göndəriləcək.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Ağıllı ATS Uyğunluq Həddi:
                      </label>
                      <select
                        id="pref-min-match-select"
                        value={preferences.minMatchScore || 70}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          minMatchScore: parseInt(e.target.value, 10),
                        })}
                        className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Bütün uyğun vakansiyalar (0%+)</option>
                        <option value={60}>Orta və yuxarı uyğunluq (60%+)</option>
                        <option value={75}>Yüksək dərəcəli uyğunluq (75%+)</option>
                        <option value={85}>Yalnız mükəmməl uyğunluq (85%+)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        AI tərəfindən hesablanan ATS balına əsasən filtrlənir.
                      </span>
                    </div>
                  </div>

                  {/* Remote only toggle */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-blue-600" />
                        <span>Yalnız Məsafədən (Remote) Vakansiyalar</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Ofisdən işləməyi tələb etməyən uzaqdan iş bildirişləri
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="pref-remote-toggle"
                        type="checkbox"
                        checked={preferences.remoteOnly || false}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          remoteOnly: e.target.checked,
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                </div>
              )}

              {/* SECTION: Lifecycle Alerts */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900">Müraciət və Təklif Bildirişləri</h4>
                
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Müraciət Statusu Dəyişiklikləri</div>
                      <p className="text-[11px] text-slate-500">İşəgötürən CV-nizə baxdıqda və ya statusu dəyişdikdə e-poçt alın</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="pref-status-toggle"
                        type="checkbox"
                        checked={preferences.applicationStatusUpdates}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          applicationStatusUpdates: e.target.checked,
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Müsahibə Dəvətləri & Rəsmi İş Təklifləri (Job Offer)</div>
                      <p className="text-[11px] text-slate-500">Şirkət sizə müsahibə və ya təklif göndərdikdə dərhal e-poçt xəbərdarlığı</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="pref-offers-toggle"
                        type="checkbox"
                        checked={preferences.interviewAndOfferAlerts}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          interviewAndOfferAlerts: e.target.checked,
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Karyera Məsləhətləri & Əmək Bazarı Hesabatı</div>
                      <p className="text-[11px] text-slate-500">Həftəlik əmək bazarı təhlili, maaş trendləri və faydalı HR məsləhətləri</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="pref-newsletter-toggle"
                        type="checkbox"
                        checked={preferences.newsletterDigest}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          newsletterDigest: e.target.checked,
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                </div>
              </div>

              {/* LIVE EMAIL PREVIEW & TEST DISPATCH BUTTON */}
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{showEmailPreview ? 'Nümunə E-poçtu Gizlət' : 'Nümunə E-poçta Bax'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTestAlert}
                    className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    <span>Test E-poçtu Göndər</span>
                  </button>
                </div>

                {testSentMessage && (
                  <span className="text-xs text-emerald-700 font-medium animate-fade-in">
                    {testSentMessage}
                  </span>
                )}
              </div>

              {/* EMAIL MOCK PREVIEW DRAWER */}
              {showEmailPreview && (
                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-inner space-y-3 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="text-xs text-slate-400">
                      Kimdən: <span className="text-white font-mono">Jobia.az Bildiriş Mərkəzi &lt;alerts@jobia.az&gt;</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold">
                      {preferences.jobAlertFrequency === 'daily' ? 'DAILY DIGEST' : preferences.jobAlertFrequency === 'weekly' ? 'WEEKLY DIGEST' : 'INSTANT ALERT'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-blue-300">
                    Mövzu: {preferences.jobAlertFrequency === 'daily'
                      ? `🌅 Günün ən yaxşı vakansiyaları (${currentUser.fullName.split(' ')[0]} üçün)`
                      : preferences.jobAlertFrequency === 'weekly'
                      ? `📊 Həftəlik seçilmiş vakansiya xülasəsi - Jobia.az`
                      : `🔔 Yeni uyğun vakansiya: "Senior Frontend Developer" - Paşa Bank`}
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs space-y-2">
                    <p className="text-slate-300 text-[11px]">
                      Salam {currentUser.fullName}, sizin profiliniz və tələbləriniz üzrə yeni vakansiya qeydə alındı:
                    </p>
                    <div className="bg-slate-900/90 p-2.5 rounded border border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-xs">Senior Frontend Developer (React / TS)</div>
                        <div className="text-[11px] text-slate-400">Paşa Bank • Bakı (Hibrid) • 3,200 - 4,500 AZN</div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-900/60 text-emerald-300 font-bold text-[10px] rounded">
                        94% Uyğunluq
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded text-[11px] font-bold">
                        Vakansiyanı Aç və Müraciət Et →
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Bu e-poçt Jobia.az profilinizin "Tənzimləmələr" bölməsindəki seçimlərinizə əsasən göndərilib.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PROFILE & DIGITAL CV */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in text-left">
              {currentUser.role === 'candidate' ? (
                <>
                  {/* CARD 1: PLATFORM CV PERSISTENCE STATUS */}
                  <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    hasSavedCV
                      ? 'bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border-emerald-200 shadow-xs'
                      : 'bg-gradient-to-br from-blue-50/80 to-slate-50 border-blue-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          hasSavedCV ? 'bg-emerald-600 text-white shadow-xs' : 'bg-blue-600 text-white'
                        }`}>
                          {hasSavedCV ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">
                              {hasSavedCV ? 'Rəsmi Rəqəmsal CV Profilinizdə Aktivdir' : 'Profilinizdə Hələ CV Yaradılmayıb'}
                            </h4>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              hasSavedCV ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {hasSavedCV ? '✓ 1 TOXUNUŞLA MÜRACİƏTƏ HAZIR' : 'TÖVSİYƏ OLUNUR'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xl">
                            {hasSavedCV
                              ? 'Bu CV profilinizdə daimi saxlanılır. İstənilən vakansiyaya müraciət etdikdə bu CV və bütün peşəkar məlumatlarınız işəgötürənə birbaşa və dərhal göndərilir.'
                              : 'CV Yaradıcı ilə bir neçə dəqiqəyə peşəkar CV hazırlayın — məlumatlarınız profilinizdə saxlanılacaq və vakansiyalara müraciət zamanı birbaşa göndəriləcək.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 sm:self-center">
                        {hasSavedCV && candidateCV && (
                          <>
                            <button
                              type="button"
                              onClick={() => setShowCVPreview(true)}
                              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>Önizləmə</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleDownloadPDF}
                              disabled={isDownloadingPDF}
                              className="relative overflow-hidden px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-90"
                            >
                              {isDownloadingPDF && (
                                <div
                                  className="absolute inset-y-0 left-0 bg-emerald-100 transition-all duration-300"
                                  style={{ width: `${Math.max(6, Math.min(100, pdfProgressPercent))}%` }}
                                />
                              )}
                              <span className="relative z-10 flex items-center gap-1.5">
                                {isDownloadingPDF ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                    <span className="font-extrabold text-emerald-600">{pdfProgressPercent}%</span>
                                    <span>{pdfProgressStatus || 'Hazırlanır...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>PDF Yüklə</span>
                                  </>
                                )}
                              </span>
                            </button>
                          </>
                        )}
                        {onNavigateToTab && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onNavigateToTab('cv-creator');
                            }}
                            className={`px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                              hasSavedCV ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{hasSavedCV ? 'CV-ni Redaktə Et' : 'İndi CV Yarat 🚀'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* CV Summary Pills if saved */}
                    {hasSavedCV && candidateCV && (
                      <div className="mt-4 pt-3.5 border-t border-emerald-200/70 space-y-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-700">Aktiv Məlumatlar:</span>
                          <span className="px-2.5 py-1 bg-white/90 border border-emerald-200 rounded-lg font-semibold text-emerald-900">
                            💼 {candidateCV.experiences?.length || 0} İş Təcrübəsi
                          </span>
                          <span className="px-2.5 py-1 bg-white/90 border border-emerald-200 rounded-lg font-semibold text-emerald-900">
                            🎓 {candidateCV.education?.length || 0} Təhsil Dərəcəsi
                          </span>
                          <span className="px-2.5 py-1 bg-white/90 border border-emerald-200 rounded-lg font-semibold text-emerald-900">
                            ⚡ {candidateCV.skills?.length || 0} Bacarıq
                          </span>
                          <span className="px-2.5 py-1 bg-white/90 border border-emerald-200 rounded-lg font-semibold text-emerald-900">
                            🌐 {candidateCV.languages?.length || 0} Xarici Dil
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 rounded-lg font-bold text-emerald-950 capitalize">
                            🎨 Şablon: {candidateCV.template || 'modern-emerald'}
                          </span>
                        </div>

                        {/* One-Click Apply Feature Banner */}
                        <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
                          <Zap className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-black">1 Kliklə Birbaşa Müraciət Təmin Edilib: </span>
                            <span className="text-slate-700">
                              Bütün vakansiyalarda mövcud olan <strong>"⚡ Hazır CV-mlə Müraciət Et (1 Kliklə)"</strong> düyməsini basdığınız an, işəgötürənə birbaşa profilinizdəki bu rəsmi CV və məlumatlarınız təqdim olunur.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setInlineCVExpanded(!inlineCVExpanded)}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 cursor-pointer ml-1"
                          >
                            {inlineCVExpanded ? 'CV-ni Bağla ▲' : 'Tam CV-yə Bax ▼'}
                          </button>
                        </div>

                        {/* Inline CV Expandable Viewer */}
                        {inlineCVExpanded && (
                          <div className="mt-3 p-3 sm:p-4 bg-slate-100/90 rounded-xl border border-slate-300 shadow-inner animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-slate-800">
                                İşəgötürənlərə Təqdim Olunan Rəsmi CV Görünüşü:
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowCVPreview(true)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                              >
                                Böyük Ekranda Aç ↗
                              </button>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden p-2 sm:p-4 max-h-[500px] overflow-y-auto">
                              <CVRenderer
                                data={candidateCV}
                                template={candidateCV.template || 'modern-emerald'}
                                showPhoto={candidateCV.showPhoto !== false}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CARD 1.5: EMPLOYER DISCOVERY & TALENT POOL PERMISSION TOGGLE */}
                  <div
                    id="candidate-employer-visibility-card"
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isOpenToEmployers
                        ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-blue-50/30 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50/90 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isOpenToEmployers
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">
                              İşəgötürənlərin qarşısına çıxmağa icazə ver (Kadr Bankı)
                            </h4>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md transition-colors ${
                                isOpenToEmployers
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {isOpenToEmployers ? '✓ AKTİVDİR • İŞƏGÖTÜRƏNLƏR SİZİ GÖRÜR' : '✕ DEAKTİVDİR • PROFİL GİZLİDİR'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                            Bu seçim aktiv olduqda profiliniz, ixtisasınız və bacarıqlarınız Jobia <strong>Kadr Bankında (Namizədlər Bazası)</strong> işəgötürən şirkətlərə təqdim edilir. Şirkətlər CV-nizlə tanış olaraq sizə birbaşa müsahibə və iş təklifi göndərə bilərlər.
                          </p>
                        </div>
                      </div>

                      {/* Interactive Switch */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-bold text-slate-700">
                          {isOpenToEmployers ? 'İcazə verilib' : 'Bağlıdır'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-candidate-open-to-employers"
                            type="checkbox"
                            checked={isOpenToEmployers}
                            onChange={(e) => setIsOpenToEmployers(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: EDITABLE CANDIDATE INFORMATION */}
                  <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-blue-600" />
                          <span>Şəxsi & Peşəkar Profil Məlumatları</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Bu məlumatlar müraciət formalarında avtomatik doldurulur və işəgötürənlərə təqdim edilir.
                        </p>
                      </div>
                      {profileSaveSuccess && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 animate-fade-in">
                          <Check className="w-3.5 h-3.5" /> Yadda saxlanıldı!
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ad və Soyad <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={profileFullName}
                          onChange={(e) => setProfileFullName(e.target.value)}
                          placeholder="Məsələn: Əli Məmmədov"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          E-poçt Ünvanı
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            disabled
                            value={currentUser.email}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium cursor-not-allowed"
                          />
                          {currentUser.emailVerified && (
                            <span className="absolute right-2.5 top-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              ✓ Təsdiqlənib
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Əlaqə Nömrəsi / WhatsApp <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="+994 50 123 45 67"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          İxtisas / Peşəkar Titul
                        </label>
                        <input
                          type="text"
                          value={profileJobTitle}
                          onChange={(e) => setProfileJobTitle(e.target.value)}
                          placeholder="Məsələn: Senior Frontend Developer"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Şəhər / Ünvan
                        </label>
                        <input
                          type="text"
                          value={profileLocation}
                          onChange={(e) => setProfileLocation(e.target.value)}
                          placeholder="Bakı, Azərbaycan"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Gözlənilən Əməkhaqqı (AZN)
                        </label>
                        <input
                          type="number"
                          value={profileExpectedSalary}
                          onChange={(e) => setProfileExpectedSalary(e.target.value)}
                          placeholder="Məsələn: 2500"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    {/* REGIONAL LIVING & WORK PREFERENCES (XƏRİTƏ & REGİON PARAMETRLƏRİ) */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">Yaşayış Məkanı və İşləməyə Uyğun Regionlar</h5>
                            <p className="text-[11px] text-slate-500">İşəgötürənlərin sizi Azərbaycan xəritəsində və regionlar üzrə rahat tapması üçün seçin</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Harada Yaşayırsınız? (Region)
                          </label>
                          <select
                            value={profileLivingRegion}
                            onChange={(e) => {
                              const regId = e.target.value;
                              setProfileLivingRegion(regId);
                              const targetReg = CANDIDATE_REGIONS.find((r) => r.id === regId);
                              if (targetReg) {
                                setProfileLivingCity(targetReg.centerCity);
                                setProfileLocation(`${targetReg.centerCity}, Azərbaycan`);
                              }
                            }}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900 cursor-pointer"
                          >
                            {CANDIDATE_REGIONS.map((reg) => (
                              <option key={reg.id} value={reg.id}>
                                {reg.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Şəhər / Rayon
                          </label>
                          <input
                            type="text"
                            value={profileLivingCity}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProfileLivingCity(val);
                              setProfileLocation(`${val ? val + ', ' : ''}Azərbaycan`);
                            }}
                            placeholder="Məsələn: Bakı (və ya Gəncə, Sumqayıt, Şəki...)"
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900"
                          />
                        </div>
                      </div>

                      {/* WORK-ELIGIBLE REGIONS MULTI-SELECT */}
                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>İşləmək üçün uyğun olduğunuz məkanlar və regionlar</span>
                          <span className="text-[10px] text-blue-700 font-normal">Bir neçə seçim edə bilərsiniz</span>
                        </label>

                        {/* Special preferences: Remote & All Azerbaijan */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {SPECIAL_WORK_PREFERENCES.map((pref) => {
                            const isSelected = profileEligibleWorkRegions.includes(pref.id);
                            return (
                              <button
                                key={pref.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setProfileEligibleWorkRegions(profileEligibleWorkRegions.filter((r) => r !== pref.id));
                                  } else {
                                    setProfileEligibleWorkRegions([...profileEligibleWorkRegions, pref.id]);
                                  }
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-blue-300 hover:bg-blue-50/50'
                                }`}
                              >
                                <span>{pref.icon}</span>
                                <span>{pref.shortName}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Geographic regions */}
                        <div className="flex flex-wrap gap-1.5">
                          {CANDIDATE_REGIONS.map((reg) => {
                            const isSelected = profileEligibleWorkRegions.includes(reg.id);
                            return (
                              <button
                                key={reg.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setProfileEligibleWorkRegions(profileEligibleWorkRegions.filter((r) => r !== reg.id));
                                  } else {
                                    setProfileEligibleWorkRegions([...profileEligibleWorkRegions, reg.id]);
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                {reg.shortName}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* RELOCATION / EZAMİYYƏT SWITCH */}
                      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <span className="text-xs font-bold text-slate-800 block">
                            Ezamiyyətə və ya başqa rayona köçməyə hazıram
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            İşəgötürənlər vakansiyanın yerləşdiyi rayondan asılı olmayaraq profilinizi nəzərdən keçirə bilər.
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={profileWillingToRelocate}
                            onChange={(e) => setProfileWillingToRelocate(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-blue-600 shadow-inner" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Haqqında / Peşəkar Xülasə
                      </label>
                      <textarea
                        rows={3}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        placeholder="Peşəkar fəaliyyətiniz, təcrübəniz və nailiyyətləriniz haqqında qısa xülasə..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none font-medium text-slate-900 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Skills Tag Cloud */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Əsas Bacarıqlar & Texnologiyalar
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                          placeholder="Bacarıq əlavə et (məs. React, Python, Mühasibat)"
                          className="flex-1 text-xs p-2 rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Əlavə Et
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 min-h-8 p-2 rounded-xl bg-slate-50 border border-slate-200">
                        {profileSkills.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">Hələlik bacarıq əlavə edilməyib</span>
                        ) : (
                          profileSkills.map((sk) => (
                            <span
                              key={sk}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs"
                            >
                              <span>{sk}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(sk)}
                                className="text-slate-400 hover:text-red-500 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingProfile ? 'Yadda Saxlanılır...' : 'Məlumatları Yadda Saxla'}</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Business / Admin Profile Summary */
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Tam Ad:</span>
                    <span className="text-sm font-bold text-slate-900">{currentUser.fullName}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">E-poçt:</span>
                    <span className="text-sm font-bold text-slate-900">{currentUser.email}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Telefon:</span>
                    <span className="text-sm font-bold text-slate-900">{currentUser.phone || 'Qeyd olunmayıb'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Şirkət / Təşkilat:</span>
                    <span className="text-sm font-bold text-slate-900">{currentUser.companyName || 'Fərdi'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Hesab Növü:</span>
                    <span className="text-sm font-bold capitalize text-slate-900">{currentUser.role}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Qeydiyyat Tarixi:</span>
                    <span className="text-sm font-bold text-slate-900">
                      {currentUser.createdAt ? currentUser.createdAt.split('T')[0] : '2026'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY & ACCESS */}
          {activeTab === 'security' && (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">E-poçt Doğrulaması</div>
                    <p className="text-[11px] text-slate-500">Hesabınızın təhlükəsizliyi və rəsmi əlaqə üçün</p>
                  </div>
                  {currentUser.emailVerified ? (
                    <span className="text-xs font-bold text-emerald-700 px-2.5 py-1 bg-emerald-100 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Təsdiqlənib
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenVerifyModal) onOpenVerifyModal(currentUser);
                      }}
                      className="text-xs font-bold text-white px-3 py-1 bg-amber-500 hover:bg-amber-600 rounded-lg cursor-pointer"
                    >
                      Kodu Daxil Et ⚡
                    </button>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Şifrə və Giriş Təhlükəsizliyi</div>
                    <p className="text-[11px] text-slate-500">Firebase Auth ilə qorunan şifrələnmiş sessiya</p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 px-2.5 py-1 bg-slate-200/80 rounded-lg">
                    Aktiv Qorunur
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-fade-in">
                <Check className="w-4 h-4" /> Tənzimləmələr uğurla yadda saxlanıldı!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            {activeTab === 'settings' && (
              <button
                id="save-email-preferences-btn"
                type="button"
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Saxlanılır...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tənzimləmələri Yadda Saxla</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <ModalBottomLogo />

        {/* CV PREVIEW MODAL OVERLAY */}
        {showCVPreview && candidateCV && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
            <div className="bg-slate-100 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300">
              {/* Header */}
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Rəqəmsal CV-nin Tam Önizləməsi</h3>
                    <p className="text-[11px] text-slate-500">Bu sənəd müraciət zamanı birbaşa işəgötürənə təqdim olunur</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloadingPDF}
                    className="relative overflow-hidden px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-95"
                  >
                    {isDownloadingPDF && (
                      <div
                        className="absolute inset-y-0 left-0 bg-emerald-800/80 transition-all duration-300"
                        style={{ width: `${Math.max(6, Math.min(100, pdfProgressPercent))}%` }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {isDownloadingPDF ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-200" />
                          <span className="font-extrabold text-emerald-200">{pdfProgressPercent}%</span>
                          <span>{pdfProgressStatus || 'Hazırlanır...'}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Yüklə</span>
                        </>
                      )}
                    </span>
                  </button>
                  {onNavigateToTab && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCVPreview(false);
                        onClose();
                        onNavigateToTab('cv-creator');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Redaktə Et</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCVPreview(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-slate-200/60">
                <div className="w-full max-w-[210mm] bg-white shadow-lg rounded-sm overflow-hidden">
                  <CVRenderer
                    data={candidateCV}
                    template={candidateCV.template || 'modern-emerald'}
                    id="candidate-profile-cv-render-zone"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OFF-SCREEN RENDER ZONE FOR PDF EXPORT IF PREVIEW IS NOT OPEN */}
        {!showCVPreview && candidateCV && (
          <div className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none w-[210mm]">
            <CVRenderer
              data={candidateCV}
              template={candidateCV.template || 'modern-emerald'}
              id="candidate-profile-cv-render-zone"
            />
          </div>
        )}
      </div>

      {/* PDF Export Floating Progress Bar & Toast */}
      <PDFDownloadProgressToast
        isDownloading={isDownloadingPDF}
        progressPercent={pdfProgressPercent}
        progressStatus={pdfProgressStatus}
        showToast={showPdfToast}
        fileName={pdfFileName}
        onDismissToast={dismissPdfToast}
      />
    </div>
  );
};

export default UserProfileModal;
