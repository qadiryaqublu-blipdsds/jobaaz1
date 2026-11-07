import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserRole, User, UserSubscription, Company, AppNotification, Vacancy, BusinessTabType, CandidateTabType } from '../types';
import { JobiaLogo } from './JobiaLogo';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Menu, 
  LogIn, 
  LogOut, 
  Plus, 
  Sparkles,
  User as UserIcon,
  Bell,
  CheckCircle2,
  Search,
  Users,
  FileText,
  Calculator,
  Palmtree,
  Compass,
  TrendingUp,
  BellRing,
  MessageSquare,
  UserCheck,
  Briefcase,
  BarChart3,
  ShieldCheck,
  Building2,
  Crown,
  ChevronDown,
  FileCheck2,
  X,
  Sun,
  Moon,
  Mic,
  Globe,
  Camera
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { NotificationCenterOverlay } from './notifications/NotificationCenterOverlay';

interface HeaderProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  candidateTab?: CandidateTabType;
  onCandidateTabChange?: (tab: CandidateTabType) => void;
  businessTab?: BusinessTabType;
  onBusinessTabChange?: (tab: BusinessTabType) => void;
  applicationsCount?: number;
  offersCount?: number;
  activeVacanciesCount?: number;
  pendingApprovalsCount?: number;
  savedJobsCount?: number;
  onOpenGoogleChat?: () => void;
  onOpenJobAlerts?: () => void;
  onPostJobClick?: () => void;
  onOpenGuestJobModal?: () => void;
  onOpenOpenCVModal?: () => void;
  onOpenAICreditWallet?: () => void;
  onOpenIntroTour?: () => void;
  onToggleMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapseSidebar?: () => void;
  currentUser?: User | null;
  currentSubscription?: UserSubscription | null;
  notifications?: AppNotification[];
  onNavigateNotification?: (notification: AppNotification) => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: UserRole) => void;
  onOpenVerifyModal?: (user: User) => void;
  onOpenProfileModal?: (initialTab?: 'profile' | 'settings' | 'security') => void;
  onOpenPricing?: () => void;
  onLogout?: () => void;
  selectedCompany?: string;
  onSelectCompany?: (companyName: string) => void;
  companies?: Company[];
  vacancies?: Vacancy[];
}

export const Header: React.FC<HeaderProps> = ({
  currentRole = 'candidate',
  onRoleChange,
  candidateTab = 'jobs',
  onCandidateTabChange,
  businessTab = 'vacancies',
  onBusinessTabChange,
  applicationsCount = 0,
  offersCount = 0,
  activeVacanciesCount = 0,
  pendingApprovalsCount = 0,
  onToggleMobileSidebar,
  currentUser,
  notifications = [],
  onNavigateNotification,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenPricing,
  onLogout,
  onPostJobClick,
  onOpenGuestJobModal,
  onOpenAICreditWallet,
  onOpenJobAlerts,
  onOpenGoogleChat,
  onOpenIntroTour,
}) => {
  const { dict, language } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Portal Dropdowns State & Positioning
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [toolsCoords, setToolsCoords] = useState<{ top: number; left: number } | null>(null);

  const [isBusinessMoreOpen, setIsBusinessMoreOpen] = useState(false);
  const [businessCoords, setBusinessCoords] = useState<{ top: number; left: number } | null>(null);

  const toolsBtnRef = useRef<HTMLButtonElement>(null);
  const businessBtnRef = useRef<HTMLButtonElement>(null);

  // Close dropdowns on window resize or scroll
  useEffect(() => {
    const handleClose = () => {
      setIsToolsDropdownOpen(false);
      setIsBusinessMoreOpen(false);
    };
    window.addEventListener('resize', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, []);

  const unreadNotificationsCount = useMemo(() => {
    return (notifications || []).filter((n) => !n.isRead).length;
  }, [notifications]);

  // Is candidate on one of the secondary tools?
  const isCandidateToolActive = [
    'network',
    'smart-forms',
    'salary-calculator',
    'vacation-calculator',
    'nearby-map',
    'salary-trends',
    'google-chat',
    'practice-interview',
  ].includes(candidateTab);

  // Is business on one of the secondary HR tools?
  const isBusinessSecondaryActive = [
    'smart-cv-pool',
    'open-cv-catalog',
    'smart-forms',
    'interviews',
    'email-history',
    'team-users',
    'vacation-calculator',
    'templates',
    'company-profile',
  ].includes(businessTab);

  // Toggle Tools Dropdown with precise rect coordinates
  const handleToggleToolsDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isToolsDropdownOpen) {
      setIsToolsDropdownOpen(false);
    } else {
      setIsBusinessMoreOpen(false);
      const rect = e.currentTarget.getBoundingClientRect();
      const dropdownWidth = 280;
      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 12) {
        left = window.innerWidth - dropdownWidth - 12;
      }
      setToolsCoords({
        top: rect.bottom + 6,
        left: Math.max(12, left),
      });
      setIsToolsDropdownOpen(true);
    }
  };

  // Toggle Business More Dropdown with precise rect coordinates
  const handleToggleBusinessMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isBusinessMoreOpen) {
      setIsBusinessMoreOpen(false);
    } else {
      setIsToolsDropdownOpen(false);
      const rect = e.currentTarget.getBoundingClientRect();
      const dropdownWidth = 260;
      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 12) {
        left = window.innerWidth - dropdownWidth - 12;
      }
      setBusinessCoords({
        top: rect.bottom + 6,
        left: Math.max(12, left),
      });
      setIsBusinessMoreOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 w-full max-w-full shadow-2xs">
      {/* 1. TOP MAIN NAVIGATION ROW */}
      <div className="w-full max-w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 w-full">
          
          {/* LEFT: Mobile Menu Button & Platform Logo */}
          <div className="flex items-center gap-2 shrink-0">
            {onToggleMobileSidebar && (
              <button
                id="header-mobile-menu-btn"
                type="button"
                onClick={onToggleMobileSidebar}
                className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer transition-colors"
                title={language === 'en' ? 'Open menu' : language === 'ru' ? 'Меню' : 'Menyu'}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Brand Logo with prototype styling */}
            <div 
              onClick={() => {
                if (onRoleChange && currentRole !== 'candidate') onRoleChange('candidate');
                if (onCandidateTabChange) onCandidateTabChange('jobs');
              }}
              className="cursor-pointer select-none flex items-center shrink-0 pr-1 group"
              title="jobia.az - Ana səhifə"
            >
              <JobiaLogo size="md" />
            </div>
          </div>

          {/* CENTER: FLOATING CAPSULE NAVIGATION (Matches prototype image_cb4301c5.png) */}
          <nav className="hidden lg:flex items-center">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-2xs text-xs font-semibold text-slate-600">
              {/* Vakansiyalar */}
              <button
                type="button"
                onClick={() => {
                  if (onRoleChange && currentRole !== 'candidate') onRoleChange('candidate');
                  onCandidateTabChange?.('jobs');
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap leading-none ${
                  currentRole === 'candidate' && candidateTab === 'jobs'
                    ? 'text-slate-950 font-black bg-slate-100 shadow-2xs'
                    : 'hover:text-slate-950 hover:bg-slate-50 font-medium'
                }`}
              >
                Vakansiyalar
              </button>

              {/* Peşəkar şəbəkə */}
              <button
                type="button"
                onClick={() => {
                  if (onRoleChange && currentRole !== 'candidate') onRoleChange('candidate');
                  onCandidateTabChange?.('network');
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap leading-none ${
                  currentRole === 'candidate' && candidateTab === 'network'
                    ? 'text-slate-950 font-black bg-slate-100 shadow-2xs'
                    : 'hover:text-slate-950 hover:bg-slate-50 font-medium'
                }`}
              >
                Peşəkar şəbəkə
              </button>

              {/* CV barat / CV yarat */}
              <button
                type="button"
                onClick={() => {
                  if (onRoleChange && currentRole !== 'candidate') onRoleChange('candidate');
                  onCandidateTabChange?.('cv-creator');
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap leading-none ${
                  currentRole === 'candidate' && candidateTab === 'cv-creator'
                    ? 'text-slate-950 font-black bg-slate-100 shadow-2xs'
                    : 'hover:text-slate-950 hover:bg-slate-50 font-medium'
                }`}
              >
                CV yarat
              </button>

              {/* AI analizator */}
              <button
                type="button"
                onClick={() => {
                  if (onRoleChange && currentRole !== 'candidate') onRoleChange('candidate');
                  onCandidateTabChange?.('cv-analyzer');
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap leading-none ${
                  currentRole === 'candidate' && candidateTab === 'cv-analyzer'
                    ? 'text-slate-950 font-black bg-slate-100 shadow-2xs'
                    : 'hover:text-slate-950 hover:bg-slate-50 font-medium'
                }`}
              >
                AI analizator
              </button>

              {/* Alətlər Dropdown Trigger */}
              <div className="relative">
                <button
                  ref={toolsBtnRef}
                  type="button"
                  onClick={handleToggleToolsDropdown}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap leading-none flex items-center gap-1 ${
                    isCandidateToolActive || isToolsDropdownOpen
                      ? 'text-[#00a859] font-bold bg-emerald-50'
                      : 'hover:text-slate-950 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span>Alətlər</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Haqqımızda */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenIntroTour) onOpenIntroTour();
                }}
                className="px-3 py-1 rounded-full hover:text-slate-950 hover:bg-slate-50 font-medium transition-all cursor-pointer whitespace-nowrap leading-none"
              >
                Haqqımızda
              </button>

              {/* + Elan yerləşdir (Inside capsule per prototype) */}
              <button
                type="button"
                onClick={() => {
                  if (onPostJobClick) onPostJobClick();
                  else if (onOpenGuestJobModal) onOpenGuestJobModal();
                }}
                className="px-3 py-1 rounded-full text-slate-800 hover:text-slate-950 hover:bg-slate-50 font-bold transition-all cursor-pointer whitespace-nowrap leading-none flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-[#00a859] stroke-[2.5]" />
                <span>Elan yerləşdir</span>
              </button>

              {/* Divider in capsule */}
              <div className="h-3.5 w-px bg-slate-200 mx-0.5" />

              {/* Dark mode moon/sun icon in capsule */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title={isDark ? 'İşıqlı rejim' : 'Qaranlıq rejim'}
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Language switcher in capsule */}
              <div className="shrink-0">
                <LanguageSwitcher 
                  buttonClassName="px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 border-0 shadow-none"
                />
              </div>
            </div>
          </nav>

          {/* RIGHT: PLANLAR PILL + NOTIFICATIONS + USER AVATAR CAPSULE */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            {/* 👑 Planlar Pill (Emerald green border & text per prototype image_cb4301c5.png) */}
            {onOpenPricing && (
              <button
                type="button"
                onClick={onOpenPricing}
                className="h-9 px-3.5 rounded-full text-xs font-bold text-[#00a859] border border-[#00a859] hover:bg-emerald-50/70 transition-all cursor-pointer select-none flex items-center gap-1.5 leading-none shadow-2xs shrink-0"
                title="VIP Abunəlik Planları və Qiymətlər"
              >
                <Crown className="w-3.5 h-3.5 text-[#00a859] shrink-0" />
                <span>Planlar</span>
              </button>
            )}

            {/* Notification Bell in circular light grey button */}
            <div className="relative">
              <button
                id="header-notification-center-btn"
                type="button"
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className={`w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer select-none active:scale-95 ${
                  isNotificationsOpen ? 'ring-2 ring-[#00a859] bg-emerald-50 text-[#00a859]' : 'text-slate-700'
                }`}
                title={unreadNotificationsCount > 0 ? `${unreadNotificationsCount} oxunmamış bildiriş` : 'Bildirişlər'}
                aria-label="Bildirişlər"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-black shadow-xs ring-2 ring-white tabular-nums">
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay Menu */}
              <NotificationCenterOverlay
                currentUser={currentUser || null}
                currentRole={currentRole}
                applicationsCount={applicationsCount}
                activeVacanciesCount={activeVacanciesCount}
                pendingApprovalsCount={pendingApprovalsCount}
                notifications={notifications}
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                onNavigateNotification={onNavigateNotification}
                onOpenAuthModal={onOpenAuthModal}
                onPostJobClick={onPostJobClick}
                onExploreJobs={() => {
                  if (onRoleChange && currentRole !== 'candidate') onRoleChange('candidate');
                  if (onCandidateTabChange) onCandidateTabChange('jobs');
                  setIsNotificationsOpen(false);
                }}
              />
            </div>

            {/* User Profile Pill Capsule (Matches 'QA Qadir ⌵' prototype pill) */}
            {currentUser ? (
              <button
                id="header-user-profile-btn"
                type="button"
                onClick={() => onOpenProfileModal?.(currentUser.role === 'candidate' ? 'profile' : 'settings')}
                className="h-9 px-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer select-none flex items-center gap-2 shadow-2xs active:scale-98"
                title="İstifadəçi Profili və Tənzimləmələr"
              >
                {/* Round Initial Avatar badge in warm red/coral matching prototype */}
                <div className="w-6 h-6 rounded-full bg-[#e0564c] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
                  {currentUser.fullName ? currentUser.fullName.substring(0, 2).toUpperCase() : 'QA'}
                </div>
                <span className="text-xs font-bold text-slate-800 max-w-[85px] truncate leading-none">
                  {currentUser.fullName.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ) : (
              onOpenAuthModal && (
                <button
                  id="header-auth-trigger-btn"
                  type="button"
                  onClick={() => onOpenAuthModal('login', currentRole)}
                  className="h-9 px-4 flex items-center justify-center gap-1.5 rounded-full text-xs font-bold bg-[#00a859] hover:bg-[#00924d] text-white cursor-pointer shadow-xs active:scale-95 transition-all shrink-0 whitespace-nowrap leading-none"
                  title="Daxil ol / Qeydiyyat"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>{dict.nav.login}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* 2. PERMANENT SYSTEM TOOLS SUB-NAVIGATION BAR (User questionnaire requirement) */}
      <div className="w-full border-t border-slate-100 bg-slate-50/80 backdrop-blur-xs px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none text-xs">
        {/* Direct Access Chips for System Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
            Alətlər:
          </span>

          {/* 1. Üz Davamiyyəti (Face Attendance) */}
          <button
            type="button"
            onClick={() => {
              if (onRoleChange && currentRole !== 'business') onRoleChange('business');
              onBusinessTabChange?.('face-attendance');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer leading-none ${
              currentRole === 'business' && businessTab === 'face-attendance'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200/80 hover:border-emerald-300'
            }`}
            title="Kamera ilə Üz Tanıma və Davamiyyət Sistemi"
          >
            <Camera className="w-3 h-3 text-[#00a859]" />
            <span>Üz Davamiyyəti</span>
          </button>

          {/* 2. HR Analitika (Time to Hire) */}
          <button
            type="button"
            onClick={() => {
              if (onRoleChange && currentRole !== 'business') onRoleChange('business');
              onBusinessTabChange?.('analytics');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer leading-none ${
              currentRole === 'business' && businessTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200/80 hover:border-blue-300'
            }`}
            title="Time to Fill / Time to Hire HR Analitikası"
          >
            <BarChart3 className="w-3 h-3 text-blue-600" />
            <span>HR Analitika</span>
          </button>

          {/* 3. Maaş Kalkulyatoru */}
          <button
            type="button"
            onClick={() => {
              if (onRoleChange && currentRole !== 'candidate') onRoleChange('candidate');
              onCandidateTabChange?.('salary-calculator');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer leading-none ${
              currentRole === 'candidate' && candidateTab === 'salary-calculator'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200/80 hover:border-emerald-300'
            }`}
            title="Gross ↔ Net Vergi Kalkulyatoru"
          >
            <Calculator className="w-3 h-3 text-emerald-600" />
            <span>Maaş Kalkulyatoru</span>
          </button>

          {/* 4. Məzuniyyət Hesablayıcı */}
          <button
            type="button"
            onClick={() => {
              if (onRoleChange && currentRole !== 'candidate') onRoleChange('candidate');
              onCandidateTabChange?.('vacation-calculator');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer leading-none ${
              currentRole === 'candidate' && candidateTab === 'vacation-calculator'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200/80 hover:border-amber-300'
            }`}
            title="AR Əmək Məcəlləsi Məzuniyyət Kalkulyatoru"
          >
            <Palmtree className="w-3 h-3 text-amber-600" />
            <span>Məzuniyyət</span>
          </button>

          {/* 5. Xəritədə Vakansiyalar */}
          <button
            type="button"
            onClick={() => {
              if (onRoleChange && currentRole !== 'candidate') onRoleChange('candidate');
              onCandidateTabChange?.('nearby-map');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer leading-none ${
              currentRole === 'candidate' && candidateTab === 'nearby-map'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-white hover:bg-teal-50 text-slate-700 border border-slate-200/80 hover:border-teal-300'
            }`}
            title="Xəritədə Yaxın Vakansiyalar"
          >
            <Globe className="w-3 h-3 text-teal-600" />
            <span>Xəritə</span>
          </button>

          {/* 6. Komanda Çatı */}
          {onOpenGoogleChat && (
            <button
              type="button"
              onClick={onOpenGoogleChat}
              className="px-2.5 py-1 rounded-lg font-bold bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200/80 hover:border-indigo-300 flex items-center gap-1.5 transition-all cursor-pointer leading-none"
              title="Komanda ilə Canlı Əlaqə və Google Chat"
            >
              <MessageSquare className="w-3 h-3 text-indigo-600" />
              <span>Komanda Çatı</span>
            </button>
          )}

          {/* 7. AI Müsahibə Məşqi */}
          <button
            type="button"
            onClick={() => {
              if (onRoleChange && currentRole !== 'candidate') onRoleChange('candidate');
              onCandidateTabChange?.('practice-interview');
            }}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer leading-none ${
              currentRole === 'candidate' && candidateTab === 'practice-interview'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200/80 hover:border-purple-300'
            }`}
            title="AI ilə İnteraktiv Müsahibə Məşqi"
          >
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>AI Müsahibə</span>
          </button>
        </div>

        {/* Right side role indicator switch */}
        {onRoleChange && (
          <div className="flex items-center gap-1 shrink-0 ml-auto pl-2 border-l border-slate-200">
            <button
              type="button"
              onClick={() => onRoleChange('candidate')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                currentRole === 'candidate' ? 'bg-[#00a859] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Namizəd
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('business')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                currentRole === 'business' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              İşəgötürən
            </button>
            {currentUser?.role === 'admin' && (
              <button
                type="button"
                onClick={() => onRoleChange('admin')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  currentRole === 'admin' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            )}
          </div>
        )}
      </div>

      {/* PORTAL: CANDIDATE GROUPED TOOLS DROPDOWN */}
      {isToolsDropdownOpen && toolsCoords && typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998] bg-black/5"
            onClick={() => setIsToolsDropdownOpen(false)}
          />

          <div
            style={{
              position: 'fixed',
              top: `${toolsCoords.top}px`,
              left: `${toolsCoords.left}px`,
            }}
            className="z-[9999] w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Karyera və Hesablama Alətləri</span>
              <button 
                type="button" 
                onClick={() => setIsToolsDropdownOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. Maaşını hesabla */}
            <button
              type="button"
              onClick={() => {
                onCandidateTabChange?.('salary-calculator');
                setIsToolsDropdownOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                candidateTab === 'salary-calculator' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Maaşını hesabla</div>
                <div className="text-[10px] text-slate-500">Gross &rarr; Net vergi kalkulyatoru</div>
              </div>
            </button>

            {/* 2. Məzuniyyətini hesabla */}
            <button
              type="button"
              onClick={() => {
                onCandidateTabChange?.('vacation-calculator');
                setIsToolsDropdownOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                candidateTab === 'vacation-calculator' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <Palmtree className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Məzuniyyətini hesabla</div>
                <div className="text-[10px] text-slate-500">Kompensasiya və məzuniyyət pulu</div>
              </div>
            </button>

            {/* 3. Xəritədə Vakansiyalar */}
            <button
              type="button"
              onClick={() => {
                onCandidateTabChange?.('nearby-map');
                setIsToolsDropdownOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                candidateTab === 'nearby-map' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Xəritədə Vakansiyalar</div>
                <div className="text-[10px] text-slate-500">Məsafə və metro stansiyaları</div>
              </div>
            </button>

            {/* 4. Əmək haqqı trendləri */}
            <button
              type="button"
              onClick={() => {
                onCandidateTabChange?.('salary-trends');
                setIsToolsDropdownOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                candidateTab === 'salary-trends' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Əmək haqqı trendləri</div>
                <div className="text-[10px] text-slate-500">Bazar analitikası və indekslər</div>
              </div>
            </button>

            <div className="my-1 border-t border-slate-100" />

            {/* 5. AI Müsahibə Məşqi (Single unified entry) */}
            <button
              type="button"
              onClick={() => {
                onCandidateTabChange?.('practice-interview');
                setIsToolsDropdownOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                candidateTab === 'practice-interview' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">AI Müsahibə Məşqi</div>
                <div className="text-[10px] text-slate-500">Səsli STAR cavab və sentiment analizi</div>
              </div>
            </button>

            {/* 6. Peşəkar Şəbəkə */}
            <button
              type="button"
              onClick={() => {
                onCandidateTabChange?.('network');
                setIsToolsDropdownOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                candidateTab === 'network' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Peşəkar Şəbəkə</div>
                <div className="text-[10px] text-slate-500">Mütəxəssislər və HR əlaqələri</div>
              </div>
            </button>

            {/* 7. Ağıllı Formalar & E-İmza */}
            <button
              type="button"
              onClick={() => {
                onCandidateTabChange?.('smart-forms');
                setIsToolsDropdownOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                candidateTab === 'smart-forms' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Ağıllı Formalar & E-İmza</div>
                <div className="text-[10px] text-slate-500">Rəsmi ərizə və müqavilə şablonları</div>
              </div>
            </button>

            {/* 8. Üz Davamiyyəti & Kamera PWA (Direct shortcut) */}
            <button
              type="button"
              onClick={() => {
                onRoleChange?.('business');
                onBusinessTabChange?.('face-attendance');
                setIsToolsDropdownOpen(false);
              }}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer text-slate-700 hover:bg-blue-50"
            >
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Üz Davamiyyəti (Kamera PWA)</div>
                <div className="text-[10px] text-slate-500">Biometrik giriş/çıxış və tabel uçotu</div>
              </div>
            </button>

            <div className="my-1 border-t border-slate-100" />

            {/* 9. İzləmə & Bildirişlər */}
            {onOpenJobAlerts && (
              <button
                type="button"
                onClick={() => {
                  onOpenJobAlerts();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">İzləmə & Bildirişlər</div>
                  <div className="text-[10px] text-slate-500">Xüsusi vakansiya abunəliyi</div>
                </div>
              </button>
            )}

            {/* 10. Google Chat Hub */}
            <button
              type="button"
              onClick={() => {
                if (onOpenGoogleChat) onOpenGoogleChat();
                else onCandidateTabChange?.('google-chat');
                setIsToolsDropdownOpen(false);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                candidateTab === 'google-chat' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Google Chat Hub</div>
                <div className="text-[10px] text-slate-500">Birbaşa əlaqə və komanda otaqları</div>
              </div>
            </button>
          </div>
        </>,
        document.body
      )}

      {/* PORTAL: BUSINESS GROUPED HR TOOLS DROPDOWN */}
      {isBusinessMoreOpen && businessCoords && typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998] bg-black/5"
            onClick={() => setIsBusinessMoreOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: `${businessCoords.top}px`,
              left: `${businessCoords.left}px`,
            }}
            className="z-[9999] w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Digər HR & İdarəetmə Alətləri</span>
              <button 
                type="button" 
                onClick={() => setIsBusinessMoreOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onBusinessTabChange?.('smart-cv-pool');
                setIsBusinessMoreOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                businessTab === 'smart-cv-pool' ? 'bg-blue-50 text-blue-700' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Ağıllı CV Baza & Skorinq</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onBusinessTabChange?.('open-cv-catalog');
                setIsBusinessMoreOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                businessTab === 'open-cv-catalog' ? 'bg-blue-50 text-blue-700' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Açıq CV Kataloqu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onBusinessTabChange?.('smart-forms');
                setIsBusinessMoreOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                businessTab === 'smart-forms' ? 'bg-blue-50 text-blue-700' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Ağıllı Formalar & E-İmza</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onBusinessTabChange?.('interviews');
                setIsBusinessMoreOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                businessTab === 'interviews' ? 'bg-blue-50 text-blue-700' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <BellRing className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Müsahibələr & 24s Xatırlatma</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onBusinessTabChange?.('team-users');
                setIsBusinessMoreOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                businessTab === 'team-users' ? 'bg-blue-50 text-blue-700' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Komanda & Rollar (RBAC)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onBusinessTabChange?.('vacation-calculator');
                setIsBusinessMoreOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                businessTab === 'vacation-calculator' ? 'bg-blue-50 text-blue-700' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Palmtree className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Məzuniyyət Kalkulyatoru</span>
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                onBusinessTabChange?.('company-profile');
                setIsBusinessMoreOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                businessTab === 'company-profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Müəssisə Profili</span>
            </button>
          </div>
        </>,
        document.body
      )}
    </header>
  );
};
