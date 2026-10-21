import React, { useState, useEffect, useMemo } from 'react';
import { ScheduledInterview, Company, SmtpConfigStatus } from '../../../types';
import { 
  fetchScheduledInterviews, 
  sendInterviewReminder, 
  trigger24hReminders, 
  toggleAutoReminder, 
  deleteInterview,
  fetchSmtpStatus 
} from '../../../services/interviewService';
import { InterviewSchedulerModal } from './InterviewSchedulerModal';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Send, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Eye, 
  ExternalLink,
  Sparkles,
  Info,
  Server,
  Zap,
  Check
} from 'lucide-react';

interface InterviewReminderManagerProps {
  company: Company;
  onOpenCandidateDetail?: (candidateEmail: string) => void;
  onOpenEmailHistory?: () => void;
}

export const InterviewReminderManager: React.FC<InterviewReminderManagerProps> = ({
  company,
  onOpenCandidateDetail,
  onOpenEmailHistory,
}) => {
  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [smtpStatus, setSmtpStatus] = useState<SmtpConfigStatus>({
    configured: false,
    host: '',
    port: 587,
    from: 'jobia.az <noreply@jobia.az>',
    secure: false,
    mode: 'simulation',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTriggering24h, setIsTriggering24h] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'next24h' | 'pending' | 'sent'>('all');

  // Modals
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState(false);
  const [selectedInterviewForEdit, setSelectedInterviewForEdit] = useState<ScheduledInterview | null>(null);
  const [previewInterview, setPreviewInterview] = useState<ScheduledInterview | null>(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [list, smtp] = await Promise.all([
        fetchScheduledInterviews(company.id),
        fetchSmtpStatus(),
      ]);
      setInterviews(list);
      setSmtpStatus(smtp);
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      if (!silent) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [company.id]);

  // Handle manual trigger of 24h reminders
  const handleTrigger24hCheck = async () => {
    try {
      setIsTriggering24h(true);
      const res = await trigger24hReminders();
      if (res.success) {
        showToast(
          `24 saatlıq xatırlatma yoxlaması tamamlandı: ${res.triggeredCount} namizədə SMTP ilə bildiriş göndərildi.`,
          'success'
        );
        await loadData(true);
      } else {
        showToast(res.error || 'Yoxlama zamanı xəta baş verdi', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Xəta baş verdi', 'error');
    } finally {
      setIsTriggering24h(false);
    }
  };

  // Handle immediate dispatch for a single interview
  const handleSendReminderNow = async (interview: ScheduledInterview) => {
    try {
      setSendingReminderId(interview.id);
      const res = await sendInterviewReminder(interview.id);
      if (res.success && res.interview) {
        showToast(
          `«${interview.candidateName}» üçün xatırlatma e-poçtu SMTP vasitəsilə uğurla göndərildi!`,
          'success'
        );
        setInterviews((prev) => prev.map((i) => (i.id === interview.id ? res.interview! : i)));
      } else {
        showToast(res.error || 'E-poçt göndərilə bilmədi', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'E-poçt göndərilə bilmədi', 'error');
    } finally {
      setSendingReminderId(null);
    }
  };

  // Handle toggling auto 24h reminder
  const handleToggleAutoReminder = async (interviewId: string) => {
    try {
      const res = await toggleAutoReminder(interviewId);
      if (res.success && res.interview) {
        setInterviews((prev) => prev.map((i) => (i.id === interviewId ? res.interview! : i)));
        showToast(
          res.interview.autoReminder24h
            ? '24 saat əvvəl avtomatik xatırlatma aktivləşdirildi.'
            : 'Avtomatik xatırlatma deaktiv edildi.',
          'info'
        );
      }
    } catch (err: any) {
      showToast(err?.message || 'Xəta baş verdi', 'error');
    }
  };

  // Handle deleting interview
  const handleDeleteInterview = async (interviewId: string) => {
    if (!window.confirm('Bu müsahibə qeydini silmək istədiyinizə əminsiniz?')) return;
    try {
      const res = await deleteInterview(interviewId);
      if (res.success) {
        setInterviews((prev) => prev.filter((i) => i.id !== interviewId));
        showToast('Müsahibə qeydi silindi.', 'info');
      }
    } catch (err: any) {
      showToast(err?.message || 'Silinərkən xəta baş verdi', 'error');
    }
  };

  // Calculations & Filtering
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const enrichedInterviews = useMemo(() => {
    return interviews.map((inv) => {
      const epoch = new Date(`${inv.interviewDate}T${inv.interviewTime || '10:00'}:00`).getTime();
      const diffMs = epoch - now;
      const isPast = diffMs < 0;
      const isNext24h = diffMs > 0 && diffMs <= oneDayMs;
      const hoursRemaining = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));

      return {
        ...inv,
        epoch,
        isPast,
        isNext24h,
        hoursRemaining,
      };
    });
  }, [interviews, now]);

  const stats = useMemo(() => {
    const total = enrichedInterviews.length;
    const next24h = enrichedInterviews.filter((i) => i.isNext24h).length;
    const remindersSent = enrichedInterviews.filter((i) => i.reminderStatus === 'sent').length;
    const pendingAuto = enrichedInterviews.filter((i) => i.autoReminder24h && i.reminderStatus === 'pending').length;

    return { total, next24h, remindersSent, pendingAuto };
  }, [enrichedInterviews]);

  const filteredInterviews = useMemo(() => {
    return enrichedInterviews.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.candidateName.toLowerCase().includes(q) ||
        inv.candidateEmail.toLowerCase().includes(q) ||
        inv.jobTitle.toLowerCase().includes(q) ||
        inv.interviewDate.includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'next24h') return inv.isNext24h;
      if (statusFilter === 'pending') return inv.autoReminder24h && inv.reminderStatus === 'pending';
      if (statusFilter === 'sent') return inv.reminderStatus === 'sent';

      return true;
    });
  }, [enrichedInterviews, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
          >
            Bağla
          </button>
        </div>
      )}

      {/* SMTP SYSTEM STATUS BANNER */}
      <div className="bg-white border border-slate-200/90 text-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-slate-900">Mövcud SMTP E-poçt & Xatırlatma Sistemi</h3>
                  {smtpStatus.configured ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Real SMTP Aktivdir
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      İşə Hazır Rejim (Simulyasiya & Audit)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Müsahibə tarixinə 24 saat qalmış təyin edilmiş namizədlərə avtomatik olaraq rəsmi görüş dəvəti və xatırlatma məktubu çatdırılır.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-2 font-mono text-[11px]">
              <span className="text-slate-400">Host:</span>
              <span className="text-slate-900 font-semibold">{smtpStatus.host || 'Mühit dəyişəni (SMTP_HOST)'}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">Port:</span>
              <span className="text-blue-700 font-semibold">{smtpStatus.port}</span>
            </div>

            <button
              onClick={() => {
                setIsRefreshing(true);
                loadData(true);
              }}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
              title="Yenilə"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {onOpenEmailHistory && (
              <button
                onClick={onOpenEmailHistory}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Bütün göndərilmiş müsahibə xatırlatma e-poçtlarının siyahısı və çatdırılma statusları"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>E-poçt Tarixçəsi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* METRIC STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Cəmi Müsahibələr
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <span className="text-[10px] text-slate-400 font-medium">Bütün təyin edilmiş görüşlər</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200/90 bg-gradient-to-br from-white to-blue-50/40 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600" />
            Növbəti 24 Saatda
          </span>
          <div className="text-2xl font-black text-blue-900 mt-1">{stats.next24h}</div>
          <span className="text-[10px] text-blue-700 font-medium">24h xatırlatma hədəfində olanlar</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/90 bg-gradient-to-br from-white to-emerald-50/40 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            24h Xatırlatma Göndərildi
          </span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{stats.remindersSent}</div>
          <span className="text-[10px] text-emerald-700 font-medium">SMTP ilə çatdırılmış bildirişlər</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/90 bg-gradient-to-br from-white to-amber-50/40 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
            <Bell className="w-3 h-3 text-amber-600" />
            Gözləyən 24h Bildirişlər
          </span>
          <div className="text-2xl font-black text-amber-900 mt-1">{stats.pendingAuto}</div>
          <span className="text-[10px] text-amber-700 font-medium">Vaxtı çatanda avtomatik göndəriləcək</span>
        </div>
      </div>

      {/* TOOLBAR CONTROLS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Namizəd adı, e-poçt və ya vakansiya axtar..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hamısı ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('next24h')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'next24h' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Növbəti 24 Saat ({stats.next24h})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Gözləmədə ({stats.pendingAuto})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('sent')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'sent' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Göndərilənlər ({stats.remindersSent})
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Automated 24h Trigger Button */}
          <button
            type="button"
            onClick={handleTrigger24hCheck}
            disabled={isTriggering24h}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Müsahibəsinə 24 saat qalmış bütün namizədlərə SMTP ilə xatırlatma e-poçtlarını dərhal icra et"
          >
            {isTriggering24h ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>24 Saatlıq Xatırlatmaları Yoxla & İcra Et</span>
          </button>

          {/* New Interview Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedInterviewForEdit(null);
              setIsSchedulerModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Müsahibə Təyin Et</span>
          </button>
        </div>
      </div>

      {/* SCHEDULED INTERVIEWS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Namizəd</th>
                <th className="py-3 px-4">Vakansiya</th>
                <th className="py-3 px-4">Tarix & Saat</th>
                <th className="py-3 px-4">Format / Keçid</th>
                <th className="py-3 px-4">24h Avto Xatırlatma</th>
                <th className="py-3 px-4">Xatırlatma Statusu</th>
                <th className="py-3 px-4 text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Müsahibələr yüklənir...</span>
                  </td>
                </tr>
              ) : filteredInterviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">Heç bir müsahibə tapılmadı</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Yeni müsahibə təyin edərək 24 saatlıq SMTP xatırlatma sistemini aktivləşdirə bilərsiniz.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInterviews.map((inv) => {
                  const isOnline = inv.interviewType === 'online';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Candidate */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {inv.candidateAvatar ? (
                            <img
                              src={inv.candidateAvatar}
                              alt={inv.candidateName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {inv.candidateName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{inv.candidateName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{inv.candidateEmail}</span>
                            </div>
                            {inv.candidatePhone && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                <span>{inv.candidatePhone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Job Title */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{inv.jobTitle}</div>
                        {inv.interviewerName && (
                          <div className="text-[10px] text-slate-500">
                            HR: {inv.interviewerName}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>{inv.interviewDate}</span>
                          <span className="text-slate-400 font-normal">|</span>
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{inv.interviewTime}</span>
                        </div>

                        {/* Timing badge */}
                        <div className="mt-1">
                          {inv.isPast ? (
                            <span className="text-[10px] font-medium text-slate-400">
                              Müsahibə vaxtı keçib
                            </span>
                          ) : inv.isNext24h ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-max">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Sabah ({inv.hoursRemaining} saat qalıb — 24h pəncərəsi)
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500">
                              {inv.hoursRemaining > 24
                                ? `${Math.floor(inv.hoursRemaining / 24)} gün sonra`
                                : `${inv.hoursRemaining} saat sonra`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Format & Link */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          {isOnline ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                              <Video className="w-3 h-3 text-purple-600" />
                              Onlayn Video
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              Ofis
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-blue-600 truncate mt-1 max-w-[200px]" title={inv.locationOrLink}>
                          <a
                            href={inv.locationOrLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span className="truncate">{inv.locationOrLink}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        </div>
                      </td>

                      {/* 24h Auto Reminder Switch */}
                      <td className="py-3 px-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inv.autoReminder24h}
                            onChange={() => handleToggleAutoReminder(inv.id)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 relative"></div>
                          <span className="text-[11px] font-bold text-slate-700">
                            {inv.autoReminder24h ? 'Aktiv (24h)' : 'Qapalı'}
                          </span>
                        </label>
                      </td>

                      {/* Reminder Status */}
                      <td className="py-3 px-4">
                        {inv.reminderStatus === 'sent' ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              SMTP ilə Göndərildi
                            </span>
                            {inv.reminderSentAt && (
                              <div className="text-[9px] text-slate-400 font-mono">
                                {new Date(inv.reminderSentAt).toLocaleTimeString('az-AZ', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: '2-digit',
                                  month: '2-digit',
                                })}
                              </div>
                            )}
                          </div>
                        ) : inv.reminderStatus === 'failed' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 w-max">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Xəta
                          </span>
                        ) : inv.autoReminder24h ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 w-max">
                            <Bell className="w-3 h-3 text-blue-600" />
                            24h Qabaq Planlaşdırılıb
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Deaktivdir</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send reminder now via SMTP */}
                          <button
                            type="button"
                            onClick={() => handleSendReminderNow(inv)}
                            disabled={sendingReminderId === inv.id}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Xatırlatma e-poçtunu mövcud SMTP ilə dərhal göndər"
                          >
                            {sendingReminderId === inv.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>{inv.reminderStatus === 'sent' ? 'Yenidən Göndər' : 'İndi Göndər'}</span>
                          </button>

                          {/* Preview Email */}
                          <button
                            type="button"
                            onClick={() => setPreviewInterview(inv)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Xatırlatma E-poçtuna Bax"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInterviewForEdit(inv);
                              setIsSchedulerModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Redaktə Et"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteInterview(inv.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE / EDIT MODAL */}
      <InterviewSchedulerModal
        isOpen={isSchedulerModalOpen}
        onClose={() => {
          setIsSchedulerModalOpen(false);
          setSelectedInterviewForEdit(null);
        }}
        company={company}
        existingInterview={selectedInterviewForEdit}
        onSaved={(saved) => {
          loadData(true);
        }}
      />

      {/* PREVIEW EMAIL MODAL */}
      {previewInterview && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  SMTP Xatırlatma Məktubunun Canlı Önizləməsi ({previewInterview.candidateEmail})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewInterview(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-slate-100 max-h-[70vh] overflow-y-auto">
              <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden max-w-lg mx-auto">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 text-center">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
                    ⏰ 24 Saat Önədən Avtomatik Xatırlatma
                  </span>
                  <h3 className="text-lg font-black mt-2">{previewInterview.companyName}</h3>
                  <p className="text-xs text-blue-100">Müsahibə Təqvimi və Təsdiq Bildirişi</p>
                </div>

                <div className="p-6 space-y-4 text-xs text-slate-700">
                  <p className="text-sm font-bold text-slate-900">Salam, {previewInterview.candidateName}!</p>
                  <p className="leading-relaxed">
                    «<strong>{previewInterview.companyName}</strong>» şirkətində «<strong>{previewInterview.jobTitle}</strong>» vakansiyası üzrə sabah baş tutacaq fərdi müsahibənizi xatırladırıq.
                  </p>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-bold text-center">
                    📅 SABAH SAAT {previewInterview.interviewTime}-DA GÖRÜŞÜNÜZ PLANLAŞDIRILIB
                  </div>

                  <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-2 font-bold text-slate-500 w-1/3">Vəzifə:</td>
                        <td className="p-2 font-semibold text-slate-900">{previewInterview.jobTitle}</td>
                      </tr>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <td className="p-2 font-bold text-slate-500">Tarix & Saat:</td>
                        <td className="p-2 font-bold text-blue-600">
                          {previewInterview.interviewDate} • {previewInterview.interviewTime}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-2 font-bold text-slate-500">Müsahibə Formatı:</td>
                        <td className="p-2 font-semibold text-slate-900">
                          {previewInterview.interviewType === 'online' ? '💻 Onlayn Video Konfrans' : '🏢 Ofisdə Görüş'}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-slate-500">Ünvan / Keçid:</td>
                        <td className="p-2 font-mono text-blue-600 break-all">{previewInterview.locationOrLink}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="text-center pt-2">
                    <span className="inline-block px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-sm">
                      {previewInterview.interviewType === 'online' ? 'Görüş Otağına Daxil Olun →' : 'Ünvanı Xəritədə Açın →'}
                    </span>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-[11px] text-purple-900 space-y-1">
                    <p className="font-bold">💡 Müsahibə Öncesi Tövsiyələr:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Görüş vaxtından 5-10 dəqiqə əvvəl hazır olun.</li>
                      <li>Kamera, mikrofon və stabil internet bağlantısını sınaqdan keçirin.</li>
                      <li>CV və portfoliosunuzu hazır saxlayın.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
                  © {previewInterview.companyName} • jobia.az SMTP avtomatlaşdırılmış xidməti
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setPreviewInterview(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200"
              >
                Bağla
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = previewInterview;
                  setPreviewInterview(null);
                  handleSendReminderNow(target);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Bu E-poçtu İndi Göndər (SMTP)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
