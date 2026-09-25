import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Gift, 
  Calendar, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ChevronRight, 
  ShieldCheck, 
  X, 
  Radio, 
  Volume2, 
  VolumeX, 
  UserCheck, 
  Users, 
  Sparkles, 
  LogIn, 
  Building2, 
  User, 
  Filter,
  Send,
  ArrowRight
} from 'lucide-react';
import { AppNotification, User as UserType, UserRole } from '../../types';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotificationFromFirestore, 
  clearAllNotificationsForUser 
} from '../../services/firestoreService';

interface NotificationCenterOverlayProps {
  currentUser: UserType | null;
  currentRole?: UserRole;
  applicationsCount?: number;
  activeVacanciesCount?: number;
  pendingApprovalsCount?: number;
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateNotification?: (notification: AppNotification) => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: UserRole) => void;
  onPostJobClick?: () => void;
  onExploreJobs?: () => void;
}

export const NotificationCenterOverlay: React.FC<NotificationCenterOverlayProps> = ({
  currentUser,
  currentRole,
  applicationsCount = 0,
  activeVacanciesCount = 0,
  pendingApprovalsCount = 0,
  notifications = [],
  isOpen,
  onClose,
  onNavigateNotification,
  onOpenAuthModal,
  onPostJobClick,
  onExploreJobs,
}) => {
  const effectiveRole: UserRole = currentRole || currentUser?.role || 'candidate';
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Play gentle subtle notification bell chime using Web Audio API
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext policy
    }
  };

  // 100% REAL NOTIFICATIONS: Exclude any mock simulation, test or senseless items
  const realNotifications = notifications.filter((n) => {
    if (!n || !n.id) return false;
    if (n.data?.isSimulation) return false;
    if (n.userId === 'demo-candidate') return false;
    const title = (n.title || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();
    if (title.includes('mock') || title.includes('simulyasiya') || title.includes('test bildiriş')) return false;
    if (msg.includes('mock') || msg.includes('simulyasiya')) return false;
    return true;
  });

  const unreadCount = realNotifications.filter((n) => !n.isRead).length;

  // Filter list tailored to active tab
  const filteredNotifications = realNotifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'offers') return n.type === 'job_offer';
    if (activeFilter === 'interviews') return n.type === 'interview_invite';
    if (activeFilter === 'applications') return n.type === 'application_submitted' || n.type === 'status_changed';
    if (activeFilter === 'matching_jobs') return n.type === 'new_matching_vacancy';
    if (activeFilter === 'applicants') return n.type === 'new_applicant';
    if (activeFilter === 'approvals') return n.type === 'vacancy_approval' || n.type === 'company_verification';
    if (activeFilter === 'general') return n.type === 'general';
    return true;
  });

  // Close on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const trigger = document.getElementById('header-notification-center-btn');
        if (trigger && trigger.contains(event.target as Node)) return;
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Format relative time in clear Azerbaijani
  const formatTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'İndicə';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dəq əvvəl`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat əvvəl`;
      if (diffInSeconds < 172800) return 'Dünən';
      
      return date.toLocaleDateString('az-AZ', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return 'Bu yaxınlarda';
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }
    if (onNavigateNotification) {
      onNavigateNotification(notif);
    }
    onClose();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(currentUser || 'all');
  };

  const handleClearAll = async () => {
    try {
      localStorage.removeItem('jobia_notifications_store');
    } catch {}
    await clearAllNotificationsForUser(currentUser || 'all');
  };

  const handleDeleteItem = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    await deleteNotificationFromFirestore(notifId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop for seamless outside tap */}
      <div 
        className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-2xs sm:hidden"
        onClick={onClose}
      />

      <div
        ref={containerRef}
        id="realtime-notification-center-overlay"
        className="fixed inset-x-2.5 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[460px] max-w-[calc(100vw-1.25rem)] sm:max-w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden flex flex-col max-h-[calc(100dvh-4.5rem)] sm:max-h-[85vh] animate-in fade-in zoom-in-95 duration-150 origin-top-right text-slate-800"
        style={{
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.05)',
        }}
      >
        {/* 1. TOP HEADER: TITLE & CONTROLS */}
        <div className="p-3 sm:p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 rounded-xl bg-white/10 text-white border border-white/10">
              <Bell className="w-4 h-4 text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-slate-900"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Bildirişlər Paneli
                </h3>
                {unreadCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/90 text-white text-[10px] font-bold tracking-wide">
                    {unreadCount} yeni
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium">
                    Hamısı oxunub
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] text-slate-300 font-medium">
                  Real Firestore sinxronizasiyası
                </span>
              </div>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={soundEnabled ? 'Bildiriş səsi aktivdir' : 'Səssiz rejim'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-300" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Hamısını oxunmuş kimi qeyd et"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Oxundu</span>
              </button>
            )}
            {realNotifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-1 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-rose-500/20 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-white/10"
                title="Bütün bildirişləri təmizlə"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Təmizlə</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
              title="Bağla"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. REAL USER STATUS & CONTEXT CARD (Statusuna görə real panel) */}
        <div className="p-3 bg-slate-50/90 border-b border-slate-200/80 shrink-0">
          {currentUser ? (
            effectiveRole === 'candidate' ? (
              // CANDIDATE REAL STATUS
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'N'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.fullName || currentUser.email}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Namizəd
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-2 mt-0.5">
                      <span>Müraciətlər: <b className="text-slate-800">{applicationsCount}</b></span>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">🎯 Təkliflərə Açıq</span>
                    </div>
                  </div>
                </div>
                {onExploreJobs && (
                  <button
                    type="button"
                    onClick={() => {
                      onExploreJobs();
                      onClose();
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
                  >
                    Vakansiyalar →
                  </button>
                )}
              </div>
            ) : effectiveRole === 'business' ? (
              // EMPLOYER REAL STATUS
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.companyName || currentUser.fullName || 'İşəgötürən Şirkət'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        İşəgötürən
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-2 mt-0.5">
                      <span>Aktiv vakansiyalar: <b className="text-slate-800">{activeVacanciesCount}</b></span>
                      <span>•</span>
                      <span>Gələn müraciətlər: <b className="text-slate-800">{applicationsCount}</b></span>
                    </div>
                  </div>
                </div>
                {onPostJobClick && (
                  <button
                    type="button"
                    onClick={() => {
                      onPostJobClick();
                      onClose();
                    }}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 hover:underline shrink-0"
                  >
                    + Vakansiya
                  </button>
                )}
              </div>
            ) : (
              // ADMIN REAL STATUS
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.fullName || currentUser.email}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Sistem İnzibatçısı
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-2 mt-0.5">
                      <span>Təsdiq gözləyən: <b className="text-amber-700">{pendingApprovalsCount}</b></span>
                      <span>•</span>
                      <span className="text-purple-600 font-medium">Nəzarət Aktiv</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            // GUEST / NOT LOGGED IN STATUS
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">Qonaq İstifadəçi</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200/80 text-slate-600">
                      Giriş edilməyib
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Şəxsi müraciət statuslarınızı izləmək üçün daxil olun
                  </p>
                </div>
              </div>
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuthModal('login', 'candidate');
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Daxil Ol</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. ROLE-SPECIFIC FILTER TABS */}
        <div className="px-3 pt-2 pb-1.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Hamısı ({realNotifications.length})
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-700 border border-red-200/60 hover:bg-red-100'
              }`}
            >
              Oxunmamış ({unreadCount})
            </button>
          )}

          {effectiveRole === 'candidate' ? (
            <>
              <button
                type="button"
                onClick={() => setActiveFilter('offers')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === 'offers'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                İş Təklifləri
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('interviews')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === 'interviews'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Müsahibələr
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('applications')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === 'applications'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Müraciət Statusları
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('matching_jobs')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === 'matching_jobs'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Uyğun Vakansiyalar
              </button>
            </>
          ) : effectiveRole === 'business' ? (
            <>
              <button
                type="button"
                onClick={() => setActiveFilter('applicants')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === 'applicants'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Gələn Müraciətlər
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('offers')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === 'offers'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Təklif Cavabları
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('approvals')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === 'approvals'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Təsdiqlər & Status
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveFilter('approvals')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === 'approvals'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                Təsdiq Sorğuları
              </button>
            </>
          )}
        </div>

        {/* 4. REAL NOTIFICATION LIST CONTENT */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5 sm:p-2">
          {filteredNotifications.length === 0 ? (
            // REAL EMPTY STATE TAILORED TO USER STATUS
            <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {activeFilter === 'unread' 
                  ? 'Bütün bildirişlər oxunub' 
                  : 'Hələlik yeni bildiriş yoxdur'}
              </h4>
              
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                {!currentUser ? (
                  'Qonaq rejimindəsiniz. İş müraciətlərinizi və şirkət təkliflərini real vaxtda izləmək üçün daxil olun.'
                ) : effectiveRole === 'candidate' ? (
                  applicationsCount > 0 
                    ? `Sizin ${applicationsCount} aktiv müraciətiniz var. İşəgötürənlər müraciətinizə baxdıqda və ya müsahibə təyin etdikdə anında burada görünəcək.`
                    : 'Sizə uyğun vakansiyalara müraciət etdikdə işəgötürənlərin cavabları və müsahibə dəvətləri burada canlı görünəcək.'
                ) : effectiveRole === 'business' ? (
                  activeVacanciesCount > 0
                    ? `${activeVacanciesCount} aktiv vakansiyanız üzrə yeni namizəd müraciəti daxil olduqda bildirişlər dərhal bura göndəriləcək.`
                    : 'Kadr axtarışına başlamaq və müraciətlər qəbul etmək üçün yeni vakansiya yerləşdirə bilərsiniz.'
                ) : (
                  'Sistemdə yeni təsdiq sorğusu və ya moderasiya əməliyyatı olduqda bildirişlər burada əks olunacaq.'
                )}
              </p>

              <div className="mt-4 flex items-center gap-2">
                {!currentUser && onOpenAuthModal ? (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal('login', 'candidate');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Daxil Ol / Qeydiyyat</span>
                  </button>
                ) : effectiveRole === 'candidate' && onExploreJobs ? (
                  <button
                    type="button"
                    onClick={() => {
                      onExploreJobs();
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Vakansiyaları Kəşf Et</span>
                  </button>
                ) : effectiveRole === 'business' && onPostJobClick ? (
                  <button
                    type="button"
                    onClick={() => {
                      onPostJobClick();
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>+ Yeni Vakansiya Yerləşdir</span>
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            // REAL NOTIFICATION CARDS
            filteredNotifications.map((notif) => {
              const isOffer = notif.type === 'job_offer';
              const isInterview = notif.type === 'interview_invite';
              const isApplication = notif.type === 'application_submitted';
              const isStatus = notif.type === 'status_changed';
              const isApplicant = notif.type === 'new_applicant';
              const isApproval = notif.type === 'vacancy_approval' || notif.type === 'company_verification';
              const isMatchingJob = notif.type === 'new_matching_vacancy';

              return (
                <div
                  key={notif.id}
                  id={`notification-item-${notif.id}`}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${
                    !notif.isRead 
                      ? 'bg-blue-50/50 border-l-3 border-l-blue-600' 
                      : 'border-l-3 border-l-transparent'
                  }`}
                >
                  {/* Type Icon */}
                  <div className="shrink-0 mt-0.5">
                    {isOffer ? (
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80">
                        <Gift className="w-4 h-4" />
                      </div>
                    ) : isInterview ? (
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80">
                        <Calendar className="w-4 h-4" />
                      </div>
                    ) : isMatchingJob ? (
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/80">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    ) : isApplicant ? (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    ) : isApproval ? (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    ) : isStatus ? (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                        <Eye className="w-4 h-4" />
                      </div>
                    ) : isApplication ? (
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80">
                        <Send className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                        <Bell className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isOffer && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                          Rəsmi İş Təklifi
                        </span>
                      )}
                      {isInterview && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/70">
                          Müsahibə Dəvəti
                        </span>
                      )}
                      {isMatchingJob && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/70 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Uyğun Vakansiya</span>
                        </span>
                      )}
                      {isApplicant && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200/70">
                          Yeni Müraciət
                        </span>
                      )}
                      {isStatus && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200/70">
                          Status Yenilənməsi
                        </span>
                      )}
                      {isApplication && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/70">
                          Müraciətiniz Çatdırıldı
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTimeAgo(notif.createdAt)}</span>
                      </span>
                    </div>

                    <h5 className={`text-xs font-bold mt-1 text-slate-900 leading-snug ${!notif.isRead ? 'font-black' : ''}`}>
                      {notif.title}
                    </h5>

                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Action pill */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 group-hover:text-blue-700">
                        <span>{isOffer ? 'Təklifə bax' : isInterview ? 'Dəvətə bax' : isApplicant ? 'Müraciəti aç' : isMatchingJob ? 'Vakansiyanı Aç' : 'Ətraflı bax'}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Individual Delete Button on Hover */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(e, notif.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all absolute top-2 right-2 cursor-pointer"
                    title="Bildirişi sil"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* 5. FOOTER: REAL STATUS & SUMMARY */}
        <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Cəmi: <b className="text-slate-800">{realNotifications.length}</b> ({unreadCount} oxunmamış)
            </span>
          </div>

          {realNotifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
              title="Bütün bildirişləri təmizlə"
            >
              <Trash2 className="w-3 h-3" />
              <span>Hamısını Təmizlə</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
