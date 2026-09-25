import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { NotificationCenterOverlay } from './notifications/NotificationCenterOverlay';

interface HeaderProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  candidateTab?: 'jobs' | 'my-applications' | 'salary-trends' | 'salary-calculator' | 'vacation-calculator' | 'calculia' | 'nearby-map' | 'google-chat' | 'cv-analyzer' | 'cv-creator' | 'network';
  onCandidateTabChange?: (tab: 'jobs' | 'my-applications' | 'salary-trends' | 'salary-calculator' | 'vacation-calculator' | 'calculia' | 'nearby-map' | 'google-chat' | 'cv-analyzer' | 'cv-creator' | 'network') => void;
  applicationsCount?: number;
  activeVacanciesCount?: number;
  pendingApprovalsCount?: number;
  savedJobsCount?: number;
  onOpenGoogleChat?: () => void;
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
  applicationsCount = 0,
  activeVacanciesCount = 0,
  pendingApprovalsCount = 0,
  savedJobsCount = 0,
  onToggleMobileSidebar,
  isSidebarCollapsed = false,
  onToggleCollapseSidebar,
  currentUser,
  currentSubscription,
  notifications = [],
  onNavigateNotification,
  onOpenAuthModal,
  onOpenVerifyModal,
  onOpenProfileModal,
  onOpenPricing,
  onLogout,
  onPostJobClick,
  selectedCompany = 'Hamısı',
  onSelectCompany,
  companies = [],
  vacancies = [],
}) => {
  const { dict, language } = useLanguage();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const unreadNotificationsCount = useMemo(() => {
    return (notifications || []).filter((n) => !n.isRead).length;
  }, [notifications]);

  // Robust company list compilation:
  // Strictly includes only real registered companies from database and companies with published vacancies
  // Every registered company is strictly unique (deduplicated by normalized name)
  const realCompaniesWithJobs = useMemo(() => {
    const map = new Map<string, Company>();

    // 1. From real companies prop (Firestore database)
    if (Array.isArray(companies)) {
      for (const c of companies) {
        if (c && c.name && c.name.trim()) {
          const norm = c.name.trim().toLowerCase();
          map.set(norm, {
            ...c,
            name: c.name.trim(),
            verified: c.verified ?? (c.verificationStatus === 'verified'),
            logo: c.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name.trim())}&backgroundColor=0284c7,16a34a,d97706,4f46e5`,
          });
        }
      }
    }

    // 2. From real vacancies prop (companies with active published vacancies)
    if (Array.isArray(vacancies)) {
      for (const v of vacancies) {
        if (v.isApproved !== false && (v.status === 'published' || !v.status) && v.companyName && v.companyName.trim()) {
          const norm = v.companyName.trim().toLowerCase();
          if (!map.has(norm)) {
            map.set(norm, {
              id: v.companyId || `comp-${norm.replace(/[^a-z0-9]/g, '-')}`,
              name: v.companyName.trim(),
              logo: (v as any).companyLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.companyName.trim())}&backgroundColor=0284c7,16a34a,d97706,4f46e5`,
              verified: true,
              verificationStatus: 'verified',
              industry: (v as any).industry || v.category || 'Biznes və Xidmət',
              location: v.city || 'Bakı',
              city: v.city || 'Bakı',
              description: `${v.companyName.trim()} rəsmi işəgötürəndir.`,
              employeeCount: '10-50',
              activeJobsCount: 1,
              email: (v as any).contactEmail || '',
            });
          }
        }
      }
    }

    return Array.from(map.values());
  }, [companies, vacancies]);

  // Display list: strictly unique real registered companies with jobs
  const displayCompanies = realCompaniesWithJobs;

  // Seamless looping marquee track for real companies only
  const marqueeItems = useMemo(() => {
    if (displayCompanies.length === 0) return [];
    let base = [...displayCompanies];
    while (base.length > 0 && base.length < 8) {
      base = [...base, ...displayCompanies];
    }
    return [...base, ...base];
  }, [displayCompanies]);

  const handleCompanyClick = (name: string) => {
    if (onRoleChange && currentRole !== 'candidate') {
      onRoleChange('candidate');
    }
    if (onCandidateTabChange && candidateTab !== 'jobs') {
      onCandidateTabChange('jobs');
    }
    if (onSelectCompany) {
      onSelectCompany(name === selectedCompany ? 'Hamısı' : name);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 w-full max-w-full shadow-2xs">
      <div className="w-full max-w-full px-1.5 sm:px-4 md:px-5">
        <div className="flex items-center justify-between gap-1 sm:gap-2.5 py-1 min-h-[56px] w-full max-w-full">
          
          {/* LEFT: Sidebar Toggle & Mobile Brand Logo */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mobile Menu Hamburger */}
            {onToggleMobileSidebar && (
              <button
                id="header-mobile-menu-btn"
                type="button"
                onClick={onToggleMobileSidebar}
                className="p-1 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer transition-colors"
                title={language === 'en' ? 'Open navigation' : language === 'ru' ? 'Меню' : 'Menyu'}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Mobile Logo Brand */}
            <div 
              onClick={() => handleCompanyClick('Hamısı')}
              className="cursor-pointer select-none flex items-center lg:hidden"
              title="jobia.az"
            >
              <JobiaLogo size="sm" className="origin-left" />
            </div>
          </div>

          {/* MIDDLE: TOP REAL COMPANY STATUS / SLOW MOVING CONTINUOUS FRAMES BAR */}
          <div className="flex-1 flex items-center min-w-0 px-1 sm:px-2 py-0.5 relative overflow-hidden">
            {marqueeItems.length > 0 ? (
              <div className="flex-1 min-w-0 relative select-none flex items-center overflow-hidden">
                {/* Left Gradient Fade */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-3 sm:w-6 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />

                {/* Right Gradient Fade */}
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-3 sm:w-6 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

                {/* Slow Continuous Moving Company Frames Track */}
                <div 
                  className="header-marquee-track flex items-center gap-2 sm:gap-2.5 py-1 px-1 select-none w-max"
                  style={{
                    animation: 'header-marquee-scroll 50s linear infinite',
                    willChange: 'transform',
                  }}
                >
                  {marqueeItems.map((company, idx) => {
                    const isSelected = selectedCompany.toLowerCase() === company.name.toLowerCase() ||
                      (selectedCompany !== 'Hamısı' && company.name.toLowerCase().includes(selectedCompany.toLowerCase()));
                    const safeLogo = company.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(company.name)}&backgroundColor=0284c7,16a34a,d97706,4f46e5`;
                    return (
                      <button
                        key={`real-company-${company.id || company.name}-${idx}`}
                        id={`company-frame-${company.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${idx}`}
                        type="button"
                        onClick={() => handleCompanyClick(company.name)}
                        className={`group/cframe shrink-0 flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                          isSelected
                            ? 'bg-blue-50 border border-blue-500 shadow-xs ring-1 ring-blue-500'
                            : 'bg-slate-50/90 hover:bg-blue-50/90 border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-xs'
                        }`}
                        title={`${company.name} (${language === 'en' ? 'Click to filter vacancies' : language === 'ru' ? 'Фильтровать вакансии' : 'Vakansiyaları süzgəcdən keçir'})`}
                      >
                        {/* Company Logo in sleek square frame */}
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg overflow-hidden bg-white border border-slate-200/90 p-0.5 aspect-square flex items-center justify-center shrink-0 shadow-2xs group-hover/cframe:scale-105 transition-transform">
                          <img
                            src={safeLogo}
                            alt={company.name}
                            loading="lazy"
                            draggable={false}
                            className="w-full h-full object-cover rounded-md pointer-events-none"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(company.name)}&backgroundColor=0284c7,16a34a,d97706,4f46e5`;
                            }}
                          />
                        </div>

                        {/* Company Name & Verified Badge */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-slate-800 group-hover/cframe:text-blue-700 whitespace-nowrap">
                            {company.name}
                          </span>
                          {company.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium select-none truncate">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">
                  {language === 'en'
                    ? 'Official Verified Jobs & Career Portal'
                    : language === 'ru'
                    ? 'Официальный портал вакансий и трудоустройства'
                    : 'Azərbaycanın Rəsmi Vakansiyalar və İşə Qəbul Portalı'}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT ACTION BAR: NOTIFICATIONS BELL WITH BADGE & DROPDOWN, USER AUTH / PROFILE / LOGOUT, & LANGUAGE SWITCHER */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0 pl-1.5 sm:pl-2.5 border-l border-slate-200">
            {/* 1. Interactive Notifications Bell with Badge & Dropdown */}
            <div className="relative">
              <button
                id="header-notification-center-btn"
                type="button"
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg transition-all cursor-pointer select-none active:scale-95 ${
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
                <Bell className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isNotificationsOpen ? 'text-white' : 'text-slate-700'}`} />
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

            {/* 2. User Profile Capsule & Dedicated Logout Button (for Mobile & Desktop) */}
            {currentUser ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  id="header-user-profile-btn"
                  type="button"
                  onClick={() => onOpenProfileModal?.(currentUser.role === 'candidate' ? 'profile' : 'settings')}
                  className="h-7 sm:h-8 flex items-center gap-1 sm:gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-1.5 sm:px-2 rounded-lg border border-slate-200/90 transition-all cursor-pointer select-none active:scale-98"
                  title={
                    currentUser.role === 'candidate'
                      ? (language === 'en' ? 'My Profile & Ready CV' : language === 'ru' ? 'Мой профиль и готовое резюме' : 'Profilim və Hazır CV-m')
                      : (language === 'en' ? 'Profile & Settings' : language === 'ru' ? 'Профиль и настройки' : 'Profil və Tənzimləmələr')
                  }
                >
                  <div className="relative shrink-0">
                    <img
                      src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName)}`}
                      alt={currentUser.fullName}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-slate-300"
                    />
                    {currentUser.emailVerified ? (
                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-white" title={language === 'en' ? 'Email Verified' : language === 'ru' ? 'Email подтвержден' : 'E-poçt Təsdiqlənib'} />
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full border border-white" title={language === 'en' ? 'Email Not Verified' : language === 'ru' ? 'Email не подтвержден' : 'E-poçt Təsdiqlənməyib'} />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-800 max-w-[50px] sm:max-w-[85px] truncate leading-none">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </button>

                {/* Prominent Direct Logout Button (next to user panel & language switcher, 1-tap logout on mobile) */}
                {onLogout && (
                  <button
                    id="header-quick-logout-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogout();
                    }}
                    className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/90 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 shrink-0"
                    title={language === 'en' ? 'Sign out of account' : language === 'ru' ? 'Выйти из аккаунта' : 'Hesabdan çıxış et'}
                    aria-label="Hesabdan çıxış et"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  id="header-auth-trigger-btn"
                  type="button"
                  onClick={() => onOpenAuthModal('login', currentRole)}
                  className="animate-auth-trigger h-7 sm:h-8 px-2 sm:px-3 flex items-center justify-center gap-1 rounded-lg text-[10px] sm:text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 transition-all shrink-0 whitespace-nowrap leading-none"
                  title={language === 'en' ? 'Sign In / Register' : language === 'ru' ? 'Вход / Регистрация' : 'Daxil ol / Qeydiyyat'}
                >
                  <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="tracking-tight whitespace-nowrap font-bold">
                    {dict.nav.login}
                  </span>
                </button>
              )
            )}

            {/* 3. Language Switcher */}
            <div className="shrink-0">
              <LanguageSwitcher 
                className=""
                buttonClassName="h-7 sm:h-8 flex items-center justify-center gap-1 px-1.5 sm:px-2 rounded-lg text-[10px] sm:text-xs font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/90 transition-all cursor-pointer shadow-2xs hover:border-slate-300 leading-none"
              />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};


