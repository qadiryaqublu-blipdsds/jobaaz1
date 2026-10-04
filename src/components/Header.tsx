import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserRole, User, UserSubscription, Company, AppNotification, Vacancy } from '../types';
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
  Settings,
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
  CreditCard,
  X
} from 'lucide-react';
import { NotificationCenterOverlay } from './notifications/NotificationCenterOverlay';

interface HeaderProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  candidateTab?: 'jobs' | 'my-applications' | 'salary-trends' | 'salary-calculator' | 'vacation-calculator' | 'calculia' | 'nearby-map' | 'google-chat' | 'cv-analyzer' | 'cv-creator' | 'network';
  onCandidateTabChange?: (tab: 'jobs' | 'my-applications' | 'salary-trends' | 'salary-calculator' | 'vacation-calculator' | 'calculia' | 'nearby-map' | 'google-chat' | 'cv-analyzer' | 'cv-creator' | 'network') => void;
  businessTab?: 'vacancies' | 'applicants' | 'offers' | 'analytics' | 'templates' | 'company-profile' | 'talent-pool' | 'vacation-calculator';
  onBusinessTabChange?: (tab: 'vacancies' | 'applicants' | 'offers' | 'analytics' | 'templates' | 'company-profile' | 'talent-pool' | 'vacation-calculator') => void;
  applicationsCount?: number;
  offersCount?: number;
  activeVacanciesCount?: number;
  pendingApprovalsCount?: number;
  savedJobsCount?: number;
  onOpenGoogleChat?: () => void;
  onOpenJobAlerts?: () => void;
  onPostJobClick?: () => void;
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
  onOpenJobAlerts,
  onOpenGoogleChat,
}) => {
  const { dict, language } = useLanguage();

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
    'salary-calculator',
    'vacation-calculator',
    'nearby-map',
    'salary-trends',
    'google-chat',
  ].includes(candidateTab);

  // Toggle Tools Dropdown with precise rect coordinates
  const handleToggleToolsDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isToolsDropdownOpen) {
      setIsToolsDropdownOpen(false);
    } else {
      setIsBusinessMoreOpen(false);
      const rect = e.currentTarget.getBoundingClientRect();
      const dropdownWidth = 260;
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
      const dropdownWidth = 240;
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
      <div className="w-full max-w-full px-2 sm:px-4 md:px-5">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 h-14 w-full">
          
          {/* 1. LEFT: Mobile Menu Button & Platform Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
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

            {/* Brand Logo */}
            <div 
              onClick={() => {
                if (onRoleChange && currentRole !== 'candidate') onRoleChange('candidate');
                if (onCandidateTabChange) onCandidateTabChange('jobs');
              }}
              className="cursor-pointer select-none flex items-center shrink-0 pr-1 group"
              title="jobia.az - Ana səhifə"
            >
              <JobiaLogo size="sm" className="group-hover:opacity-95 transition-opacity" />
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block h-6 w-px bg-slate-200/90 mx-1 shrink-0" />
          </div>

          {/* 2. CENTER: PURE NAVIGATION LINKS (Role Switcher Removed as user requested; fully visible and accessible) */}
          <nav className="flex-1 min-w-0 flex items-center gap-1 sm:gap-1.5 lg:gap-2 overflow-x-auto scrollbar-none py-1">
            
            {/* A. CANDIDATE / JOB SEEKER NAVIGATION (Default & for job seekers) */}
            {currentRole === 'candidate' && (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* 1. Vakansiyalar */}
                <button
                  type="button"
                  onClick={() => onCandidateTabChange?.('jobs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                    candidateTab === 'jobs'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                  }`}
                >
                  <Search className={`w-3.5 h-3.5 shrink-0 ${candidateTab === 'jobs' ? 'text-white' : 'text-blue-600'}`} />
                  <span>{dict.nav.jobs}</span>
                </button>

                {/* 2. Peşəkar Şəbəkə */}
                <button
                  type="button"
                  onClick={() => onCandidateTabChange?.('network')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                    candidateTab === 'network'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className={`w-3.5 h-3.5 shrink-0 ${candidateTab === 'network' ? 'text-white' : 'text-indigo-600'}`} />
                  <span>{language === 'en' ? 'Network' : language === 'ru' ? 'Сеть' : 'Peşəkar Şəbəkə'}</span>
                </button>

                {/* 3. CV Yaradıcı */}
                <button
                  type="button"
                  onClick={() => onCandidateTabChange?.('cv-creator')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                    candidateTab === 'cv-creator'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100'
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${candidateTab === 'cv-creator' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{language === 'en' ? 'CV Creator' : language === 'ru' ? 'Конструктор CV' : 'CV Yaradıcı'}</span>
                </button>

                {/* 4. AI CV Analizator */}
                <button
                  type="button"
                  onClick={() => onCandidateTabChange?.('cv-analyzer')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                    candidateTab === 'cv-analyzer'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-amber-700 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 shrink-0 ${candidateTab === 'cv-analyzer' ? 'text-white' : 'text-amber-500'}`} />
                  <span>{language === 'en' ? 'AI ATS Audit' : language === 'ru' ? 'ATS Аудит' : 'AI Analizator'}</span>
                </button>

                {/* 5. Müraciətlərim */}
                <button
                  type="button"
                  onClick={() => onCandidateTabChange?.('my-applications')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                    candidateTab === 'my-applications'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${candidateTab === 'my-applications' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{language === 'en' ? 'Applications' : language === 'ru' ? 'Отклики' : 'Müraciətlər'}</span>
                  {applicationsCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                      candidateTab === 'my-applications' ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
                    }`}>
                      {applicationsCount}
                    </span>
                  )}
                </button>

                {/* 6. Smart Tools Dropdown Menu (Portal-based, NEVER clipped, works 100% on all screens) */}
                <div className="relative">
                  <button
                    ref={toolsBtnRef}
                    type="button"
                    onClick={handleToggleToolsDropdown}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                      isCandidateToolActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isToolsDropdownOpen
                        ? 'bg-slate-200 text-slate-900 ring-2 ring-blue-500/20'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Calculator className={`w-3.5 h-3.5 shrink-0 ${isCandidateToolActive ? 'text-white' : 'text-slate-600'}`} />
                    <span>{language === 'en' ? 'Tools' : language === 'ru' ? 'Инструменты' : 'Alətlər'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* B. BUSINESS / EMPLOYER NAVIGATION (When employer is logged in) */}
            {currentRole === 'business' && (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* Vakansiyalarım */}
                <button
                  type="button"
                  onClick={() => onBusinessTabChange?.('vacancies')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                    businessTab === 'vacancies'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase className={`w-3.5 h-3.5 shrink-0 ${businessTab === 'vacancies' ? 'text-white' : 'text-blue-600'}`} />
                  <span>Vakansiyalarım</span>
                </button>

                {/* Namizədlər */}
                <button
                  type="button"
                  onClick={() => onBusinessTabChange?.('applicants')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                    businessTab === 'applicants'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className={`w-3.5 h-3.5 shrink-0 ${businessTab === 'applicants' ? 'text-white' : 'text-indigo-600'}`} />
                  <span>Namizədlər</span>
                  {applicationsCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                      businessTab === 'applicants' ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
                    }`}>
                      {applicationsCount}
                    </span>
                  )}
                </button>

                {/* İş Təklifləri */}
                <button
                  type="button"
                  onClick={() => onBusinessTabChange?.('offers')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                    businessTab === 'offers'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100'
                  }`}
                >
                  <FileCheck2 className={`w-3.5 h-3.5 shrink-0 ${businessTab === 'offers' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>Təkliflər</span>
                  {offersCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
                      businessTab === 'offers' ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
                    }`}>
                      {offersCount}
                    </span>
                  )}
                </button>

                {/* Kadr Bankı */}
                <button
                  type="button"
                  onClick={() => onBusinessTabChange?.('talent-pool')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                    businessTab === 'talent-pool'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-purple-700 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className={`w-3.5 h-3.5 shrink-0 ${businessTab === 'talent-pool' ? 'text-white' : 'text-purple-600'}`} />
                  <span>Kadr Bankı</span>
                </button>

                {/* Analitika */}
                <button
                  type="button"
                  onClick={() => onBusinessTabChange?.('analytics')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                    businessTab === 'analytics'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-teal-700 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${businessTab === 'analytics' ? 'text-white' : 'text-teal-600'}`} />
                  <span>Analitika</span>
                </button>

                {/* Əlavə Business Dropdown (Portal-based) */}
                <div className="relative">
                  <button
                    ref={businessBtnRef}
                    type="button"
                    onClick={handleToggleBusinessMore}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                      isBusinessMoreOpen
                        ? 'bg-slate-200 text-slate-900 ring-2 ring-blue-500/20'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Daha çox</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isBusinessMoreOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* C. ADMIN NAVIGATION (When admin is logged in) */}
            {currentRole === 'admin' && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>İnzibatçı Paneli</span>
                </span>
                <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                  {activeVacanciesCount} aktiv vakansiya {pendingApprovalsCount > 0 ? `(${pendingApprovalsCount} təsdiq gözləyən)` : ''}
                </span>
              </div>
            )}
          </nav>

          {/* 3. RIGHT: + ELAN YERLƏŞDİR + VIP PLANLAR + NOTIFICATIONS + LANGUAGE + PROFILE */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 pl-1 border-l border-slate-200/90 ml-1">
            
            {/* + Elan Yerləşdir Button */}
            {onPostJobClick && (
              <button
                id="header-post-job-btn"
                type="button"
                onClick={onPostJobClick}
                className="h-9 px-2.5 sm:px-3.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer shrink-0 leading-none"
                title="Yeni vakansiya yerləşdir"
              >
                <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Elan Yerləşdir</span>
                <span className="sm:hidden whitespace-nowrap">Elan</span>
              </button>
            )}

            {/* VIP Planlar / Pricing */}
            {onOpenPricing && (
              <button
                type="button"
                onClick={onOpenPricing}
                className="h-9 px-2.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1.5 transition-all cursor-pointer select-none shrink-0 leading-none shadow-2xs"
                title="VIP Abunəlik Planları"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="hidden md:inline whitespace-nowrap">Planlar</span>
              </button>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="header-notification-center-btn"
                type="button"
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                  isNotificationsOpen
                    ? 'bg-blue-600 text-white shadow-xs'
                    : unreadNotificationsCount > 0
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                title={
                  unreadNotificationsCount > 0
                    ? `${unreadNotificationsCount} oxunmamış bildiriş`
                    : 'Bildirişlər Mərkəzi'
                }
                aria-label="Bildirişlər"
                aria-expanded={isNotificationsOpen}
              >
                <Bell className={`w-4 h-4 ${isNotificationsOpen ? 'text-white' : 'text-slate-700'}`} />
                {unreadNotificationsCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-black shadow-xs ring-2 ring-white">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] rounded-full bg-red-500 opacity-75 animate-ping pointer-events-none" />
                  </>
                )}
              </button>

              {/* Notification Dropdown Menu */}
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

            {/* User Profile Capsule or Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  id="header-user-profile-btn"
                  type="button"
                  onClick={() => onOpenProfileModal?.(currentUser.role === 'candidate' ? 'profile' : 'settings')}
                  className="h-9 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2 sm:px-2.5 rounded-xl border border-slate-200/90 transition-all cursor-pointer select-none active:scale-98"
                  title="Profil və Tənzimləmələr"
                >
                  <div className="relative shrink-0">
                    <img
                      src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName)}`}
                      alt={currentUser.fullName}
                      className="w-5 h-5 rounded-full object-cover border border-slate-300"
                    />
                    {currentUser.emailVerified ? (
                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-white" />
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full border border-white" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[80px] truncate leading-none hidden sm:inline">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </button>

                {/* Direct Logout Button */}
                {onLogout && (
                  <button
                    id="header-quick-logout-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogout();
                    }}
                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 shrink-0"
                    title={language === 'en' ? 'Sign out' : language === 'ru' ? 'Выйти' : 'Çıxış'}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  id="header-auth-trigger-btn"
                  type="button"
                  onClick={() => onOpenAuthModal('login', currentRole)}
                  className="h-9 px-3 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs hover:shadow-md active:scale-95 transition-all shrink-0 whitespace-nowrap leading-none"
                  title="Daxil ol / Qeydiyyat"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>{dict.nav.login}</span>
                </button>
              )
            )}

            {/* Language Switcher */}
            <div className="shrink-0">
              <LanguageSwitcher 
                className=""
                buttonClassName="h-9 flex items-center justify-center gap-1 px-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/90 transition-all cursor-pointer shadow-2xs hover:border-slate-300 leading-none"
              />
            </div>
          </div>

        </div>
      </div>

      {/* PORTAL: CANDIDATE TOOLS DROPDOWN (Rendered at root level so it NEVER gets clipped or cut off!) */}
      {isToolsDropdownOpen && toolsCoords && typeof document !== 'undefined' && createPortal(
        <>
          {/* Invisible Backdrop to close on click outside */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/5"
            onClick={() => setIsToolsDropdownOpen(false)}
          />

          {/* Floating Dropdown Box */}
          <div
            style={{
              position: 'fixed',
              top: `${toolsCoords.top}px`,
              left: `${toolsCoords.left}px`,
            }}
            className="z-[9999] w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
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
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 shrink-0">
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
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 shrink-0">
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
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
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
              <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Əmək haqqı trendləri</div>
                <div className="text-[10px] text-slate-500">Bazar analitikası və indekslər</div>
              </div>
            </button>

            <div className="my-1 border-t border-slate-100" />

            {/* 5. İzləmə & Bildirişlər */}
            {onOpenJobAlerts && (
              <button
                type="button"
                onClick={() => {
                  onOpenJobAlerts();
                  setIsToolsDropdownOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600 shrink-0">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">İzləmə & Bildirişlər</div>
                  <div className="text-[10px] text-slate-500">Xüsusi vakansiya abunəliyi</div>
                </div>
              </button>
            )}

            {/* 6. Google Chat */}
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
              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-600 shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Google Chat Hub</div>
                <div className="text-[10px] text-slate-500">Birbaşa əlaqə və bildirişlər</div>
              </div>
            </button>
          </div>
        </>,
        document.body
      )}

      {/* PORTAL: BUSINESS MORE DROPDOWN (Rendered at root level so it NEVER gets clipped!) */}
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
            className="z-[9999] w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Əlavə İdarəetmə</span>
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
                onBusinessTabChange?.('company-profile');
                setIsBusinessMoreOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer text-slate-800"
            >
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Müəssisə Profili</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onBusinessTabChange?.('templates');
                setIsBusinessMoreOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer text-slate-800"
            >
              <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Təklif Şablonları</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onBusinessTabChange?.('vacation-calculator');
                setIsBusinessMoreOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer text-slate-800"
            >
              <Palmtree className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Məzuniyyət Kalkulyatoru</span>
            </button>
          </div>
        </>,
        document.body
      )}
    </header>
  );
};
