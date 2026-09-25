import React, { useState, useEffect, useRef } from 'react';
import { UserRole, User, UserSubscription } from '../types';
import { JobiaLogo } from './JobiaLogo';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Search, 
  TrendingUp, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Calculator, 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  User as UserIcon, 
  Plus, 
  Compass, 
  CreditCard, 
  LogIn, 
  LogOut, 
  ChevronRight, 
  X,
  Flame,
  Briefcase,
  Crown,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  BellRing,
  GripVertical,
  Palmtree,
  UserCheck,
  Award,
  BarChart3,
  Users
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  candidateTab: 'jobs' | 'nearby-map' | 'my-applications' | 'salary-trends' | 'salary-calculator' | 'vacation-calculator' | 'calculia' | 'google-chat' | 'cv-analyzer' | 'cv-creator' | 'network';
  onCandidateTabChange: (tab: 'jobs' | 'nearby-map' | 'my-applications' | 'salary-trends' | 'salary-calculator' | 'vacation-calculator' | 'calculia' | 'google-chat' | 'cv-analyzer' | 'cv-creator' | 'network') => void;
  businessTab?: 'vacancies' | 'applicants' | 'offers' | 'analytics' | 'templates' | 'company-profile' | 'talent-pool' | 'vacation-calculator';
  onBusinessTabChange?: (tab: 'vacancies' | 'applicants' | 'offers' | 'analytics' | 'templates' | 'company-profile' | 'talent-pool' | 'vacation-calculator') => void;
  applicationsCount?: number;
  offersCount?: number;
  activeVacanciesCount?: number;
  pendingApprovalsCount?: number;
  savedJobsCount?: number;
  onOpenJobAlerts?: () => void;
  onOpenGoogleChat?: () => void;
  onPostJobClick?: () => void;
  onOpenIntroTour?: () => void;
  onOpenPricing?: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: UserRole) => void;
  onOpenProfileModal?: (initialTab?: 'profile' | 'settings' | 'security') => void;
  onLogout?: () => void;
  currentUser: User | null;
  currentSubscription: UserSubscription | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 420;
const DEFAULT_SIDEBAR_WIDTH = 250;

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onRoleChange,
  candidateTab,
  onCandidateTabChange,
  businessTab = 'vacancies',
  onBusinessTabChange,
  applicationsCount = 0,
  offersCount = 0,
  activeVacanciesCount = 0,
  pendingApprovalsCount = 0,
  savedJobsCount = 0,
  onOpenJobAlerts,
  onOpenGoogleChat,
  onPostJobClick,
  onOpenIntroTour,
  onOpenPricing,
  onOpenAuthModal,
  onOpenProfileModal,
  onLogout,
  currentUser,
  currentSubscription,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { dict, brandAcronym, language } = useLanguage();
  const planTier = currentSubscription?.tier || 'FREE';
  const isPaidPlan = planTier !== 'FREE';

  // Fluid Resizing State
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jobia_sidebar_width');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= MIN_SIDEBAR_WIDTH && val <= MAX_SIDEBAR_WIDTH) {
          return val;
        }
      }
    } catch {}
    return DEFAULT_SIDEBAR_WIDTH;
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);

  // Mouse & Touch Drag Handlers for Splitter
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = isCollapsed ? 80 : sidebarWidth;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartXRef.current;
      const targetWidth = dragStartWidthRef.current + deltaX;
      const clampedWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, targetWidth));
      setSidebarWidth(clampedWidth);

      // If sidebar was collapsed and dragged out, uncollapse
      if (isCollapsed && clampedWidth > 160) {
        onToggleCollapse?.();
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      setSidebarWidth((current) => {
        try {
          localStorage.setItem('jobia_sidebar_width', current.toString());
        } catch {}
        return current;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSplitterTouchStart = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    setIsDragging(true);
    dragStartXRef.current = e.touches[0].clientX;
    dragStartWidthRef.current = isCollapsed ? 80 : sidebarWidth;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!moveEvent.touches[0]) return;
      const deltaX = moveEvent.touches[0].clientX - dragStartXRef.current;
      const targetWidth = dragStartWidthRef.current + deltaX;
      const clampedWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, targetWidth));
      setSidebarWidth(clampedWidth);

      if (isCollapsed && clampedWidth > 160) {
        onToggleCollapse?.();
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      setSidebarWidth((current) => {
        try {
          localStorage.setItem('jobia_sidebar_width', current.toString());
        } catch {}
        return current;
      });
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleTabClick = (tab: 'jobs' | 'nearby-map' | 'my-applications' | 'salary-trends' | 'salary-calculator' | 'vacation-calculator' | 'calculia' | 'google-chat' | 'cv-analyzer' | 'cv-creator' | 'network') => {
    onCandidateTabChange(tab);
    onCloseMobile();
  };

  const handleRoleSelect = (role: UserRole) => {
    onRoleChange(role);
    onCloseMobile();
  };

  // Primary Core Navigation for Candidates
  const primaryNavItems = [
    {
      id: 'jobs' as const,
      label: dict.nav.jobs,
      icon: Search,
      badge: null,
      color: 'blue',
    },
    {
      id: 'network' as const,
      label: language === 'en' ? 'Network' : language === 'ru' ? 'Сеть' : 'Peşəkar Şəbəkə',
      icon: Users,
      badge: null,
      color: 'blue',
    },
    {
      id: 'cv-creator' as const,
      label: language === 'en' ? 'CV Creator' : language === 'ru' ? 'Конструктор резюме' : 'CV Yaradıcı',
      icon: FileText,
      badge: null,
      color: 'blue',
    },
    {
      id: 'cv-analyzer' as const,
      label: 'AI CV Analizator',
      icon: Sparkles,
      badge: null,
      color: 'blue',
    },
    {
      id: 'my-applications' as const,
      label: dict.nav.myApplications,
      icon: CheckCircle2,
      badge: applicationsCount > 0 ? applicationsCount : null,
      badgeClass: 'bg-blue-600 text-white font-bold',
      color: 'blue',
    },
  ];

  // Secondary Tools Navigation for Candidates (Ayrı-ayrı Maaşını hesabla və Məzuniyyətini hesabla)
  const toolsNavItems = [
    {
      id: 'salary-calculator' as const,
      label: language === 'en' ? 'Calculate Salary' : language === 'ru' ? 'Рассчитать зарплату' : 'Maaşını hesabla',
      icon: Calculator,
      badge: null,
      color: 'blue',
    },
    {
      id: 'vacation-calculator' as const,
      label: language === 'en' ? 'Calculate Vacation' : language === 'ru' ? 'Рассчитать отпуск' : 'Məzuniyyətini hesabla',
      icon: Palmtree,
      badge: null,
      color: 'blue',
    },
    {
      id: 'nearby-map' as const,
      label: dict.nav.nearbyJobs || (language === 'en' ? 'Jobs on Map' : language === 'ru' ? 'Вакансии на карте' : 'Xəritədə Vakansiyalar'),
      icon: Compass,
      badge: null,
      color: 'blue',
    },
    {
      id: 'salary-trends' as const,
      label: dict.nav.salaryTrends,
      icon: TrendingUp,
      badge: null,
      color: 'blue',
    },
    {
      id: 'job-alerts' as any,
      label: language === 'en' ? 'Job Alerts' : language === 'ru' ? 'Уведомления' : 'İzləmə & Bildirişlər',
      icon: BellRing,
      badge: null,
      color: 'blue',
      onClick: () => {
        if (onOpenJobAlerts) {
          onOpenJobAlerts();
          onCloseMobile();
        }
      }
    },
    {
      id: 'talent-pool' as any,
      label: language === 'en' ? 'Candidate Pool' : language === 'ru' ? 'База кадров' : 'Kadr Bankı',
      icon: UserCheck,
      badge: null,
      color: 'blue',
      onClick: () => {
        onRoleChange('business');
        if (onBusinessTabChange) onBusinessTabChange('talent-pool');
        onCloseMobile();
      }
    },
    {
      id: 'google-chat' as const,
      label: dict.nav.googleChat,
      icon: MessageSquare,
      badge: null,
      color: 'blue',
      onClick: () => {
        if (onOpenGoogleChat) onOpenGoogleChat();
        else handleTabClick('google-chat');
      }
    },
  ];

  const navItems = [
    ...primaryNavItems,
    ...toolsNavItems,
    {
      id: 'settings' as any,
      label: dict.nav.settings || (language === 'en' ? 'Settings' : language === 'ru' ? 'Настройки' : 'Tənzimləmələr'),
      icon: Settings,
      badge: null,
      color: 'blue',
      onClick: () => {
        if (onOpenProfileModal) {
          onOpenProfileModal('settings');
          onCloseMobile();
        } else {
          handleTabClick('settings' as any);
        }
      }
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Left Vertical Sidebar with dynamic width */}
      <aside
        id="app-left-sidebar"
        style={{
          width: isOpenMobile ? undefined : (isCollapsed ? '80px' : `${sidebarWidth}px`),
        }}
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col justify-between shadow-lg lg:shadow-none lg:sticky lg:top-0 lg:h-screen lg:shrink-0 ${
          isDragging ? 'transition-none select-none' : 'transition-[width] duration-200 ease-in-out'
        } ${
          isOpenMobile ? 'translate-x-0 !w-72' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Right Vertical Resizing Splitter (Desktop Only) */}
        <div
          onMouseDown={handleSplitterMouseDown}
          onTouchStart={handleSplitterTouchStart}
          className={`hidden lg:flex absolute -right-1.5 top-0 bottom-0 w-3 cursor-col-resize z-50 items-center justify-center group select-none ${
            isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'
          } transition-opacity`}
          title={dict.common.dragToResize || 'Ölçünü dəyişmək üçün sürüşdürün'}
        >
          <div
            className={`w-1 h-full rounded-full transition-colors ${
              isDragging ? 'bg-blue-600 shadow-sm' : 'bg-transparent group-hover:bg-blue-400/80 group-active:bg-blue-600'
            }`}
          />
          <div
            className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white border border-slate-300 shadow-xs rounded px-0.5 py-1 pointer-events-none transition-all ${
              isDragging ? 'opacity-100 ring-2 ring-blue-500/30' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <GripVertical className="w-3 h-3 text-slate-500" />
          </div>
        </div>

        {/* TOP SECTION: LOGO & COLLAPSE / CLOSE BUTTON */}
        <div className={`border-b border-slate-100 flex items-center shrink-0 ${
          isCollapsed ? 'flex-col gap-2 justify-center items-center py-3 px-1' : 'justify-between p-3.5'
        }`}>
          <div 
            onClick={() => {
              onRoleChange('candidate');
              onCandidateTabChange('jobs');
              onCloseMobile();
            }}
            className="flex items-center gap-2 cursor-pointer select-none group min-w-0"
            title={`jobia.az - ${dict.common.home || 'Ana səhifə'}`}
          >
            <JobiaLogo size={isCollapsed ? "xs" : "md"} className="group-hover:opacity-90 transition-opacity shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-[10px] font-black tracking-wider text-emerald-700 uppercase leading-none truncate">
                  {brandAcronym}
                </span>
                <span className="text-[9px] text-slate-500 font-semibold leading-tight mt-0.5 truncate">
                  {dict.common.smartPlatform || 'Ağıllı İş Platforması'}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button when expanded */}
          {onToggleCollapse && !isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shrink-0"
              title={dict.common.collapseSidebar || 'Paneli yığcamlaşdır'}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {/* Desktop Toggle Button when collapsed */}
          {onToggleCollapse && isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 cursor-pointer transition-colors shrink-0"
              title={dict.common.expandSidebar || 'Paneli genişləndir'}
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE VERTICAL BUTTONS CONTAINER */}
        <div className={`flex-1 overflow-y-auto min-h-0 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 ${
          isCollapsed ? 'px-2 py-3' : 'px-3.5 py-3.5'
        }`}>
          
          {/* 1. ROLE SWITCHER VERTICAL PILLS (With RBAC Role Isolation) */}
          <div>
            {!isCollapsed && (
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1.5 block">
                {currentUser?.role === 'candidate' 
                  ? (language === 'en' ? 'Candidate Mode' : language === 'ru' ? 'Режим соискателя' : 'Namizəd Rejimi')
                  : currentUser?.role === 'business' 
                  ? (language === 'en' ? 'Employer Mode' : language === 'ru' ? 'Режим работодателя' : 'İşəgötürən Rejimi')
                  : (language === 'en' ? 'Select Role' : language === 'ru' ? 'Роль' : 'İstifadəçi Rejimi')}
              </label>
            )}
            
            {/* If user is logged in as Candidate */}
            {currentUser?.role === 'candidate' ? (
              isCollapsed ? (
                <div className="flex flex-col items-center">
                  <div 
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs"
                    title={language === 'en' ? 'Candidate Portal' : language === 'ru' ? 'Портал соискателя' : 'Namizəd Portalı'}
                  >
                    <UserIcon className="w-5 h-5" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-2 bg-blue-50/90 border border-blue-200/80 rounded-xl shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black text-blue-950 truncate">
                      {language === 'en' ? 'Candidate Portal' : language === 'ru' ? 'Портал соискателя' : 'Namizəd Portalı'}
                    </span>
                    <span className="text-[9px] text-blue-700 font-semibold truncate">{currentUser.fullName || currentUser.email}</span>
                  </div>
                </div>
              )
            ) : currentUser?.role === 'business' ? (
              /* If user is logged in as Employer (Business) */
              isCollapsed ? (
                <div className="flex flex-col items-center">
                  <div 
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs"
                    title={language === 'en' ? 'Employer Dashboard' : language === 'ru' ? 'Панель работодателя' : 'İşəgötürən Paneli'}
                  >
                    <Building2 className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-white/15 text-blue-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black text-white truncate">
                      {language === 'en' ? 'Employer Dashboard' : language === 'ru' ? 'Панель работодателя' : 'İşəgötürən Paneli'}
                    </span>
                    <span className="text-[9px] text-slate-300 font-semibold truncate">{currentUser.companyName || currentUser.fullName}</span>
                  </div>
                </div>
              )
            ) : currentUser?.role === 'admin' ? (
              /* If user is logged in as Admin: allow switching to test/moderate all views */
              isCollapsed ? (
                <div className="flex flex-col gap-1.5 items-center">
                  <button
                    id="sidebar-role-candidate"
                    onClick={() => handleRoleSelect('candidate')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      currentRole === 'candidate'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={dict.nav.candidate}
                  >
                    <UserIcon className="w-5 h-5" />
                  </button>
                  <button
                    id="sidebar-role-business"
                    onClick={() => handleRoleSelect('business')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      currentRole === 'business'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={dict.nav.employer}
                  >
                    <Building2 className="w-5 h-5" />
                  </button>
                  <button
                    id="sidebar-role-admin"
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative cursor-pointer ${
                      currentRole === 'admin'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={dict.nav.admin}
                  >
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    {pendingApprovalsCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
                  <button
                    id="sidebar-role-candidate"
                    onClick={() => handleRoleSelect('candidate')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      currentRole === 'candidate'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 mb-0.5" />
                    <span className="truncate">{dict.nav.candidate}</span>
                  </button>

                  <button
                    id="sidebar-role-business"
                    onClick={() => handleRoleSelect('business')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      currentRole === 'business'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-0.5" />
                    <span className="truncate">{dict.nav.employer}</span>
                  </button>

                  <button
                    id="sidebar-role-admin"
                    onClick={() => handleRoleSelect('admin')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all relative cursor-pointer ${
                      currentRole === 'admin'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mb-0.5 text-blue-400" />
                    <span className="truncate">{dict.nav.admin}</span>
                    {pendingApprovalsCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
                    )}
                  </button>
                </div>
              )
            ) : (
              /* Guest / Visitor (Not logged in): Allow previewing Candidate vs Employer */
              isCollapsed ? (
                <div className="flex flex-col gap-1.5 items-center">
                  <button
                    id="sidebar-role-candidate"
                    onClick={() => handleRoleSelect('candidate')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      currentRole === 'candidate'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={dict.nav.candidate}
                  >
                    <UserIcon className="w-5 h-5" />
                  </button>
                  <button
                    id="sidebar-role-business"
                    onClick={() => handleRoleSelect('business')}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      currentRole === 'business'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={dict.nav.employer}
                  >
                    <Building2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
                  <button
                    id="sidebar-role-candidate"
                    onClick={() => handleRoleSelect('candidate')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      currentRole === 'candidate'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 mb-0.5" />
                    <span className="truncate">{dict.nav.candidate}</span>
                  </button>

                  <button
                    id="sidebar-role-business"
                    onClick={() => handleRoleSelect('business')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      currentRole === 'business'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-0.5" />
                    <span className="truncate">{dict.nav.employer}</span>
                  </button>
                </div>
              )
            )}
          </div>

          {/* 2. PRIMARY ACTION BUTTON: POST JOB (Only shown to Employers/Admin or Guests) */}
          {currentUser?.role !== 'candidate' && (
            <div>
              {isCollapsed ? (
                <button
                  id="sidebar-post-job-btn-collapsed"
                  onClick={() => {
                    if (onPostJobClick) onPostJobClick();
                    else handleRoleSelect('business');
                    onCloseMobile();
                  }}
                  className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
                  title={language === 'en' ? 'Post a Job (+ Free)' : language === 'ru' ? 'Разместить вакансию (+ Бесплатно)' : 'Elan Yerləşdir (+ Pulsuz)'}
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              ) : (
                <button
                  id="sidebar-post-job-btn"
                  onClick={() => {
                    if (onPostJobClick) onPostJobClick();
                    else handleRoleSelect('business');
                    onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span>{language === 'en' ? 'Post a Job' : language === 'ru' ? 'Разместить вакансию' : 'Elan Yerləşdir'}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                    {language === 'en' ? '+ Free' : language === 'ru' ? '+ Бесплатно' : '+ Pulsuz'}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* 3. PROMINENT VIP SUBSCRIPTION SPOTLIGHT (REQUEST #3) */}
          {onOpenPricing && (
            <div>
              {isCollapsed ? (
                <button
                  id="sidebar-vip-spotlight-collapsed"
                  onClick={() => {
                    onOpenPricing();
                    onCloseMobile();
                  }}
                  className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                  title={`👑 ${language === 'en' ? 'VIP Plans & Pricing' : language === 'ru' ? 'VIP Тарифы и цены' : 'VIP Planlar və Tariflər'}`}
                >
                  <Crown className="w-5 h-5 text-amber-600" />
                </button>
              ) : (
                <div 
                  onClick={() => {
                    onOpenPricing();
                    onCloseMobile();
                  }}
                  className="p-2.5 rounded-xl bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex items-center justify-between"
                  title="VIP & PRO Planlar"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs shrink-0">
                      <Crown className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-950 truncate">
                          {language === 'en' ? 'VIP & PRO Plans' : language === 'ru' ? 'VIP & PRO Тарифы' : 'VIP & PRO Planlar'}
                        </span>
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-200/80 text-amber-900 shrink-0">
                          {isPaidPlan ? planTier : 'PRO'}
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-800/80 truncate">
                        {language === 'en' ? 'Top ranking & AI tools' : language === 'ru' ? 'Приоритет и AI' : 'Ön sıralar və AI üstünlüklər'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              )}
            </div>
          )}

          {/* 4. VERTICAL NAVIGATION BUTTONS */}
          {currentRole === 'candidate' && (
            <div className="space-y-3">
              {/* Core / Main Navigation */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1 block">
                    {language === 'en' ? 'Main' : language === 'ru' ? 'Основное' : 'Əsas Bölmələr'}
                  </label>
                )}

                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = candidateTab === item.id;

                  if (isCollapsed) {
                    return (
                      <button
                        key={item.id}
                        id={`sidebar-tab-collapsed-${item.id}`}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all cursor-pointer relative ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title={`${item.label} ${item.badge ? `(${item.badge})` : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.badge && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white" />
                        )}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      id={`sidebar-tab-${item.id}`}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs font-black'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100 text-slate-600 group-hover:text-slate-900'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeClass || 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tools & Tracking Section */}
              <div className="space-y-1 pt-1 border-t border-slate-100">
                {!isCollapsed && (
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1 block">
                    {language === 'en' ? 'Tools' : language === 'ru' ? 'Инструменты' : 'Faydalı Alətlər'}
                  </label>
                )}

                {toolsNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = candidateTab === item.id;

                  if (isCollapsed) {
                    return (
                      <button
                        key={item.id}
                        id={`sidebar-tab-collapsed-${item.id}`}
                        onClick={() => {
                          if (item.onClick) item.onClick();
                          else handleTabClick(item.id);
                        }}
                        className={`w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all cursor-pointer relative ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title={item.label}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      id={`sidebar-tab-${item.id}`}
                      onClick={() => {
                        if (item.onClick) item.onClick();
                        else handleTabClick(item.id);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100/80 text-slate-500 group-hover:text-slate-800'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* BUSINESS / EMPLOYER ROLE BUTTONS */}
          {currentRole === 'business' && (
            <div className="space-y-1">
              {!isCollapsed && (
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1 block">
                  {language === 'en' ? 'Employer Hub' : language === 'ru' ? 'Панель работодателя' : 'İşəgötürən Paneli'}
                </label>
              )}

              {isCollapsed ? (
                <div className="flex flex-col gap-1.5 items-center">
                  <button
                    id="sidebar-collapsed-business-talent-pool"
                    onClick={() => {
                      if (onBusinessTabChange) onBusinessTabChange('talent-pool');
                      onCloseMobile();
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      businessTab === 'talent-pool'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={language === 'en' ? 'Candidate Pool' : language === 'ru' ? 'База кадров' : 'Kadr Bankı'}
                  >
                    <UserCheck className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      if (onBusinessTabChange) onBusinessTabChange('vacancies');
                      onCloseMobile();
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      businessTab === 'vacancies'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={language === 'en' ? 'Company Vacancies' : language === 'ru' ? 'Вакансии компании' : 'Şirkət Vakansiyaları'}
                  >
                    <Briefcase className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      if (onBusinessTabChange) onBusinessTabChange('applicants');
                      onCloseMobile();
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      businessTab === 'applicants'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={language === 'en' ? 'Job Applicants' : language === 'ru' ? 'Отклики' : 'Gələn Müraciətlər'}
                  >
                    <FileText className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      if (onBusinessTabChange) onBusinessTabChange('offers');
                      onCloseMobile();
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      businessTab === 'offers'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={language === 'en' ? 'Job Offers & Interviews' : language === 'ru' ? 'Офферы и интервью' : 'Müsahibə & Təkliflər'}
                  >
                    <Award className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      if (onPostJobClick) onPostJobClick();
                      onCloseMobile();
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                    title={language === 'en' ? 'Publish New Job' : language === 'ru' ? 'Опубликовать вакансию' : 'Yeni Elan Dərc Et'}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <button
                    id="sidebar-business-tab-talent-pool"
                    onClick={() => {
                      if (onBusinessTabChange) onBusinessTabChange('talent-pool');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                      businessTab === 'talent-pool'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${businessTab === 'talent-pool' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{language === 'en' ? 'Candidate Pool' : language === 'ru' ? 'База кадров' : 'Kadr Bankı'}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${businessTab === 'talent-pool' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'}`}>
                      TOP
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (onBusinessTabChange) onBusinessTabChange('vacancies');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                      businessTab === 'vacancies'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${businessTab === 'vacancies' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{language === 'en' ? 'Company Vacancies' : language === 'ru' ? 'Вакансии компании' : 'Şirkət Vakansiyaları'}</span>
                    </div>
                    {activeVacanciesCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${businessTab === 'vacancies' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {activeVacanciesCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onBusinessTabChange) onBusinessTabChange('applicants');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                      businessTab === 'applicants'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${businessTab === 'applicants' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{language === 'en' ? 'Job Applicants' : language === 'ru' ? 'Отклики' : 'Gələn Müraciətlər'}</span>
                    </div>
                    {applicationsCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${businessTab === 'applicants' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
                        {applicationsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onBusinessTabChange) onBusinessTabChange('offers');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                      businessTab === 'offers'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${businessTab === 'offers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{language === 'en' ? 'Offers & Interviews' : language === 'ru' ? 'Офферы и интервью' : 'Müsahibə & Təkliflər'}</span>
                    </div>
                    {offersCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${businessTab === 'offers' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                        {offersCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onBusinessTabChange) onBusinessTabChange('analytics');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                      businessTab === 'analytics'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${businessTab === 'analytics' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <BarChart3 className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{language === 'en' ? 'Recruiting Analytics' : language === 'ru' ? 'Аналитика найма' : 'Analitika'}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (onBusinessTabChange) onBusinessTabChange('company-profile');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                      businessTab === 'company-profile'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${businessTab === 'company-profile' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{language === 'en' ? 'Company Profile' : language === 'ru' ? 'Профиль компании' : 'Müəssisə Profili'}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (onBusinessTabChange) onBusinessTabChange('vacation-calculator');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
                      businessTab === 'vacation-calculator'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${businessTab === 'vacation-calculator' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Palmtree className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{language === 'en' ? 'Vacation Calculator' : language === 'ru' ? 'Калькулятор отпускных' : 'Məzuniyyət Hesabla'}</span>
                    </div>
                  </button>

                  <div className="pt-2">
                    <button
                      id="sidebar-business-post-job-btn"
                      onClick={() => {
                        if (onPostJobClick) onPostJobClick();
                        onCloseMobile();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'en' ? 'Publish New Job' : language === 'ru' ? 'Опубликовать вакансию' : 'Yeni Elan Dərc Et'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADMIN ROLE BUTTONS */}
          {currentRole === 'admin' && (
            <div className="space-y-1">
              {!isCollapsed && (
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 mb-1 block">
                  {language === 'en' ? 'Administration' : language === 'ru' ? 'Администрирование' : 'İdarəetmə'}
                </label>
              )}

              {isCollapsed ? (
                <button
                  onClick={() => {
                    onRoleChange('admin');
                    onCloseMobile();
                  }}
                  className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-slate-900 text-blue-400 shadow-xs cursor-pointer"
                  title={language === 'en' ? 'Admin Dashboard' : language === 'ru' ? 'Панель управления' : 'Admin İdarəetmə'}
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onRoleChange('admin');
                    onCloseMobile();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-slate-900 text-white shadow-xs cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-white/20 text-blue-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>{language === 'en' ? 'Admin Dashboard' : language === 'ru' ? 'Панель управления' : 'Admin İdarəetmə'}</span>
                </button>
              )}
            </div>
          )}

          {/* 5. QUICK GUIDE / TOUR */}
          {onOpenIntroTour && (
            <div className="pt-2 border-t border-slate-100">
              {isCollapsed ? (
                <button
                  id="sidebar-intro-tour-btn-collapsed"
                  onClick={() => {
                    onOpenIntroTour();
                    onCloseMobile();
                  }}
                  className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  title={language === 'en' ? 'Platform Tour & Guide' : language === 'ru' ? 'Гид по платформе' : 'Addımlı Bələdçi'}
                >
                  <Compass className="w-5 h-5 animate-pulse" />
                </button>
              ) : (
                <button
                  id="sidebar-intro-tour-btn"
                  onClick={() => {
                    onOpenIntroTour();
                    onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span>{language === 'en' ? 'Platform Tour & Guide' : language === 'ru' ? 'Гид по платформе' : 'Addımlı Bələdçi'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: USER PROFILE & COLLAPSE TRIGGER */}
        {currentUser && (
          <div className={`border-t border-slate-100 bg-slate-50/70 ${isCollapsed ? 'p-2 space-y-2' : 'p-3.5 space-y-2.5'}`}>
            <div className={`flex items-center bg-white rounded-xl border border-slate-200 shadow-2xs ${
              isCollapsed ? 'justify-center p-1.5' : 'justify-between gap-2 p-2'
            }`}>
              <button
                type="button"
                onClick={() => onOpenProfileModal?.(currentUser?.role === 'candidate' ? 'profile' : 'settings')}
                className="flex items-center gap-2 min-w-0 text-left cursor-pointer focus:outline-hidden group"
                title={
                  currentUser?.role === 'candidate'
                    ? (language === 'en' ? 'My Profile & Ready CV' : language === 'ru' ? 'Мой профиль и резюме' : 'Profilim və Hazır CV-m')
                    : (language === 'en' ? 'Profile & Notification Settings' : language === 'ru' ? 'Настройки профиля и уведомлений' : 'Profil və Bildiriş Tənzimləmələri')
                }
              >
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0 group-hover:border-blue-400 transition-colors"
                />
                {!isCollapsed && (
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                )}
              </button>

              {!isCollapsed && (
                <div className="flex items-center gap-1 shrink-0">
                  {onOpenProfileModal && (
                    <button
                      id="sidebar-settings-btn"
                      type="button"
                      onClick={() => onOpenProfileModal('settings')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title={language === 'en' ? 'Notification Settings' : language === 'ru' ? 'Настройки уведомлений' : 'Bildiriş Tənzimləmələri'}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                  {onLogout && (
                    <button
                      id="sidebar-logout-btn"
                      type="button"
                      onClick={onLogout}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title={dict.nav.logout}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </aside>
    </>
  );
};

