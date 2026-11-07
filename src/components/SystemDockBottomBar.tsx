import React from 'react';
import { User, UserRole, UserSubscription, CandidateTabType, BusinessTabType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calculator, 
  FileText, 
  Sparkles, 
  User as UserIcon, 
  Search, 
  Camera, 
  Crown, 
  LogIn, 
  Palmtree,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

export interface SystemDockBottomBarProps {
  currentUser?: User | null;
  currentSubscription?: UserSubscription | null;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  candidateTab?: CandidateTabType;
  onCandidateTabChange?: (tab: CandidateTabType) => void;
  businessTab?: BusinessTabType;
  onBusinessTabChange?: (tab: BusinessTabType) => void;
  onOpenPricing?: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: UserRole) => void;
  onOpenProfileModal?: (initialTab?: 'profile' | 'settings' | 'security') => void;
  onLogout?: () => void;
}

export const SystemDockBottomBar: React.FC<SystemDockBottomBarProps> = ({
  currentUser,
  currentSubscription,
  currentRole = 'candidate',
  onRoleChange,
  candidateTab = 'jobs',
  onCandidateTabChange,
  businessTab = 'vacancies',
  onBusinessTabChange,
  onOpenPricing,
  onOpenAuthModal,
  onOpenProfileModal,
}) => {
  const { language } = useLanguage();

  const handleNavClick = (tab: CandidateTabType) => {
    if (currentRole !== 'candidate' && onRoleChange) {
      onRoleChange('candidate');
    }
    if (onCandidateTabChange) {
      onCandidateTabChange(tab);
    }
  };

  const handleFaceAttendanceClick = () => {
    if (currentRole !== 'business' && onRoleChange) {
      onRoleChange('business');
    }
    if (onBusinessTabChange) {
      onBusinessTabChange('face-attendance');
    }
  };

  const isSalaryActive = candidateTab === 'salary-calculator' || candidateTab === 'calculia';
  const isCVCreatorActive = candidateTab === 'cv-creator';
  const isCVAnalyzerActive = candidateTab === 'cv-analyzer';
  const isJobsActive = candidateTab === 'jobs' && currentRole === 'candidate';
  const isFaceAttendanceActive = currentRole === 'business' && businessTab === 'face-attendance';

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP FLOATING CAPSULE DOCK (Anchored bottom center, visible on md+)  */}
      {/* ========================================================================= */}
      <nav 
        aria-label="Desktop Sistem Alətləri Naviqasiyası"
        className="hidden md:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-40 items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-full select-none transition-all hover:shadow-[0_16px_48px_rgba(0,0,0,0.16)] animate-in fade-in slide-in-from-bottom-3 duration-200"
      >
        {/* Brand Tool Tag */}
        <div className="pl-3 pr-2 flex items-center gap-1.5 border-r border-slate-200 text-xs font-black text-[#00a859]">
          <span className="w-2 h-2 rounded-full bg-[#00a859] animate-pulse" />
          <span className="tracking-tight">ALƏTLƏR</span>
        </div>

        {/* 1. Vakansiyalar */}
        <button
          type="button"
          onClick={() => handleNavClick('jobs')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap leading-none ${
            isJobsActive
              ? 'bg-[#00a859] text-white shadow-sm shadow-emerald-600/30'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
          }`}
          title="Vakansiyalar və İş Axtarışı"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Vakansiyalar</span>
        </button>

        {/* 2. Maaş kalkulyatoru */}
        <button
          type="button"
          onClick={() => handleNavClick('salary-calculator')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap leading-none ${
            isSalaryActive
              ? 'bg-[#00a859] text-white shadow-sm shadow-emerald-600/30'
              : 'text-slate-700 hover:text-slate-950 hover:bg-emerald-50/70 hover:text-[#00a859]'
          }`}
          title="AR Vergi və Maaş Kalkulyatoru (Gross ↔ Net)"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Maaş Kalkulyatoru</span>
        </button>

        {/* 3. CV Generator */}
        <button
          type="button"
          onClick={() => handleNavClick('cv-creator')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap leading-none ${
            isCVCreatorActive
              ? 'bg-[#00a859] text-white shadow-sm shadow-emerald-600/30'
              : 'text-slate-700 hover:text-slate-950 hover:bg-emerald-50/70 hover:text-[#00a859]'
          }`}
          title="Peşəkar A4 CV Yaradıcı və 30 Şablon"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>CV Generator</span>
        </button>

        {/* 4. ATS Analizator */}
        <button
          type="button"
          onClick={() => handleNavClick('cv-analyzer')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap leading-none ${
            isCVAnalyzerActive
              ? 'bg-[#00a859] text-white shadow-sm shadow-emerald-600/30'
              : 'text-slate-700 hover:text-slate-950 hover:bg-emerald-50/70 hover:text-[#00a859]'
          }`}
          title="AI ATS CV Analizatoru və Audit"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ATS Analizator</span>
        </button>

        {/* 5. Üz Davamiyyəti */}
        <button
          type="button"
          onClick={handleFaceAttendanceClick}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap leading-none ${
            isFaceAttendanceActive
              ? 'bg-[#00a859] text-white shadow-sm shadow-emerald-600/30'
              : 'text-slate-700 hover:text-slate-950 hover:bg-emerald-50/70 hover:text-[#00a859]'
          }`}
          title="Kamera ilə Üz Tanıma və Davamiyyət Sistemi"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Üz Davamiyyəti</span>
        </button>

        {/* 6. Məzuniyyət */}
        <button
          type="button"
          onClick={() => handleNavClick('vacation-calculator')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap leading-none ${
            candidateTab === 'vacation-calculator'
              ? 'bg-[#00a859] text-white shadow-sm shadow-emerald-600/30'
              : 'text-slate-700 hover:text-slate-950 hover:bg-emerald-50/70 hover:text-[#00a859]'
          }`}
          title="AR Əmək Məcəlləsi Məzuniyyət Hesablayıcı"
        >
          <Palmtree className="w-3.5 h-3.5" />
          <span>Məzuniyyət</span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* 7. VIP Planlar */}
        {onOpenPricing && (
          <button
            type="button"
            onClick={onOpenPricing}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all cursor-pointer flex items-center gap-1.5 leading-none"
            title="VIP Planlar və Qiymətlər"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Planlar</span>
          </button>
        )}

        {/* 8. Profil / Daxil ol */}
        {currentUser ? (
          <button
            type="button"
            onClick={() => onOpenProfileModal?.('settings')}
            className="pl-1 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 transition-all cursor-pointer flex items-center gap-1.5 leading-none ml-0.5 active:scale-95"
            title="İstifadəçi Profili və Tənzimləmələr"
          >
            <div className="w-6 h-6 rounded-full bg-[#00a859] text-white text-[10px] font-black flex items-center justify-center shrink-0">
              {currentUser.fullName ? currentUser.fullName.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-bold text-slate-800 max-w-[70px] truncate">
              {currentUser.fullName.split(' ')[0]}
            </span>
          </button>
        ) : (
          onOpenAuthModal && (
            <button
              type="button"
              onClick={() => onOpenAuthModal('login', currentRole)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#00a859] hover:bg-[#00924d] text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5 leading-none active:scale-95 ml-0.5"
              title="Daxil ol / Qeydiyyat"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Daxil ol</span>
            </button>
          )
        )}
      </nav>

      {/* ========================================================================= */}
      {/* 2. MOBILE FIXED BOTTOM BAR (Anchored at very bottom for all phones < md) */}
      {/* ========================================================================= */}
      <nav 
        aria-label="Mobil Sistem Alətləri Naviqasiyası"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.09)] px-2 pt-1.5 select-none transition-all"
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0.6rem))' }}
      >
        <div className="grid grid-cols-5 items-center justify-items-center gap-1 max-w-md mx-auto">
          {/* Item 1: Vakansiyalar */}
          <button
            type="button"
            onClick={() => handleNavClick('jobs')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isJobsActive ? 'text-[#00a859] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${isJobsActive ? 'bg-emerald-50 text-[#00a859]' : 'text-slate-500'}`}>
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5 leading-none">
              Vakansiya
            </span>
          </button>

          {/* Item 2: Maaş Kalkulyatoru */}
          <button
            type="button"
            onClick={() => handleNavClick('salary-calculator')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isSalaryActive ? 'text-[#00a859] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${isSalaryActive ? 'bg-emerald-50 text-[#00a859]' : 'text-slate-500'}`}>
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5 leading-none truncate max-w-[56px]">
              Maaş
            </span>
          </button>

          {/* Item 3: CV Generator */}
          <button
            type="button"
            onClick={() => handleNavClick('cv-creator')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isCVCreatorActive ? 'text-[#00a859] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${isCVCreatorActive ? 'bg-emerald-50 text-[#00a859]' : 'text-slate-500'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5 leading-none truncate max-w-[56px]">
              CV Yarat
            </span>
          </button>

          {/* Item 4: ATS Analizator */}
          <button
            type="button"
            onClick={() => handleNavClick('cv-analyzer')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isCVAnalyzerActive ? 'text-[#00a859] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${isCVAnalyzerActive ? 'bg-emerald-50 text-[#00a859]' : 'text-slate-500'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5 leading-none truncate max-w-[56px]">
              ATS Audit
            </span>
          </button>

          {/* Item 5: Profil və ya Daxil ol */}
          {currentUser ? (
            <button
              type="button"
              onClick={() => onOpenProfileModal?.('settings')}
              className="flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer text-slate-700 active:scale-95"
            >
              <div className="w-6 h-6 rounded-full bg-[#00a859] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {currentUser.fullName ? currentUser.fullName.substring(0, 2).toUpperCase() : 'U'}
              </div>
              <span className="text-[10px] font-bold tracking-tight mt-0.5 leading-none truncate max-w-[56px]">
                {currentUser.fullName.split(' ')[0]}
              </span>
            </button>
          ) : (
            onOpenAuthModal && (
              <button
                type="button"
                onClick={() => onOpenAuthModal('login', currentRole)}
                className="flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer text-emerald-700 active:scale-95"
              >
                <div className="p-1 rounded-lg bg-emerald-50 text-[#00a859]">
                  <UserIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-tight mt-0.5 leading-none">
                  Giriş
                </span>
              </button>
            )
          )}
        </div>
      </nav>
    </>
  );
};

// Also export as MobileFrozenBottomBar for 100% backwards compatibility
export const MobileFrozenBottomBar = SystemDockBottomBar;

export default SystemDockBottomBar;
