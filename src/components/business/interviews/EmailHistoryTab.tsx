import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Company, EmailHistoryItem, SmtpConfigStatus } from '../../../types';
import {
  fetchEmailHistory,
  resendInterviewReminderEmail,
  sendTestReminderEmail,
  deleteEmailHistoryLog,
  trigger24hReminders,
  fetchSmtpStatus,
} from '../../../services/interviewService';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Zap,
  Server,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Trash2,
  Copy,
  Check,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Info,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

interface EmailHistoryTabProps {
  company: Company;
  onOpenCandidateDetail?: (candidateEmail: string) => void;
  onNavigateToInterviews?: () => void;
}

export const EmailHistoryTab: React.FC<EmailHistoryTabProps> = ({
  company,
  onOpenCandidateDetail,
  onNavigateToInterviews,
}) => {
  const [emailLogs, setEmailLogs] = useState<EmailHistoryItem[]>([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    deliveredCount: 0,
    failedCount: 0,
    automated24hCount: 0,
    manualCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedTriggerFilter, setSelectedTriggerFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // SMTP Status state
  const [smtpStatus, setSmtpStatus] = useState<SmtpConfigStatus>({
    configured: false,
    host: '',
    port: 587,
    from: 'jobia.az <noreply@jobia.az>',
    secure: false,
    mode: 'simulation',
  });

  // Action states
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isTriggering24h, setIsTriggering24h] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [previewItem, setPreviewItem] = useState<EmailHistoryItem | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [testCandidateName, setTestCandidateName] = useState('Əli Məmmədov');
  const [testJobTitle, setTestJobTitle] = useState('Senior Full Stack Developer');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Load email history & SMTP status
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [historyRes, smtpRes] = await Promise.all([
        fetchEmailHistory({
          companyId: company.id,
          status: selectedStatusFilter !== 'all' ? selectedStatusFilter : undefined,
          search: searchQuery.trim() || undefined,
        }),
        fetchSmtpStatus(),
      ]);

      if (historyRes.success && historyRes.emailLogs) {
        setEmailLogs(historyRes.emailLogs);
        if (historyRes.stats) {
          setStats(historyRes.stats);
        }
      }
      setSmtpStatus(smtpRes);
    } catch (err: any) {
      showToast('E-poçt tarixçəsi yüklənərkən xəta baş verdi', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [company.id, selectedStatusFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Resend
  const handleResend = async (item: EmailHistoryItem) => {
    setResendingId(item.id);
    try {
      const res = await resendInterviewReminderEmail(item.id);
      if (res.success) {
        showToast(
          `${item.candidateName} üçün xatırlatma e-poçtu yenidən uğurla göndərildi!`,
          'success'
        );
        loadData();
      } else {
        showToast(res.error || 'Yenidən göndəriş zamanı xəta baş verdi', 'error');
      }
    } catch {
      showToast('Şəbəkə xətası', 'error');
    } finally {
      setResendingId(null);
    }
  };

  // Handle Delete
  const handleDelete = async (item: EmailHistoryItem) => {
    if (!window.confirm(`"${item.candidateName}" üçün göndərilmiş e-poçt bildiriş qeydini tarixçədən silmək istədiyinizə əminsiniz?`)) {
      return;
    }
    setDeletingId(item.id);
    try {
      const res = await deleteEmailHistoryLog(item.id);
      if (res.success) {
        setEmailLogs((prev) => prev.filter((l) => l.id !== item.id));
        showToast('E-poçt bildiriş qeydi uğurla silindi', 'success');
      } else {
        showToast(res.error || 'Qeyd silinə bilmədi', 'error');
      }
    } catch {
      showToast('Şəbəkə xətası', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle Trigger 24h cron scan
  const handleTrigger24h = async () => {
    setIsTriggering24h(true);
    try {
      const res = await trigger24hReminders();
      if (res.success) {
        showToast(
          `24 saatlıq avtomatik xatırlatma yoxlanıldı: ${res.triggeredCount} yeni e-poçt göndərildi (${res.checkedTotal} müsahibə yoxlandı).`,
          'success'
        );
        loadData();
      } else {
        showToast(res.error || 'Yoxlama xətası', 'error');
      }
    } catch {
      showToast('Şəbəkə xətası', 'error');
    } finally {
      setIsTriggering24h(false);
    }
  };

  // Handle Copy Message ID
  const handleCopyMessageId = (msgId: string) => {
    navigator.clipboard.writeText(msgId);
    setCopiedId(msgId);
    showToast('Message-ID kopyalandı', 'info');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Handle Send Test Email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailInput.trim() || !testEmailInput.includes('@')) {
      showToast('Zəhmət olmasa düzgün e-poçt ünvanı daxil edin', 'error');
      return;
    }
    setIsSendingTest(true);
    try {
      const res = await sendTestReminderEmail({
        recipientEmail: testEmailInput.trim(),
        candidateName: testCandidateName.trim() || 'Sınaq Namizəd',
        jobTitle: testJobTitle.trim() || 'Senior Full Stack Developer',
        companyName: company.name,
        companyId: company.id,
      });

      if (res.success) {
        showToast(
          `Sınaq xatırlatma e-poçtu ${testEmailInput} ünvanına uğurla göndərildi!`,
          'success'
        );
        setIsTestModalOpen(false);
        setTestEmailInput('');
        loadData();
      } else {
        showToast(res.error || 'Sınaq məktubu göndərilə bilmədi', 'error');
      }
    } catch {
      showToast('Şəbəkə xətası baş verdi', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Filtered and Sorted items
  const filteredItems = useMemo(() => {
    let result = [...emailLogs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.candidateName.toLowerCase().includes(q) ||
          item.candidateEmail.toLowerCase().includes(q) ||
          item.jobTitle.toLowerCase().includes(q) ||
          item.messageId.toLowerCase().includes(q) ||
          (item.statusDetails && item.statusDetails.toLowerCase().includes(q))
      );
    }

    if (selectedStatusFilter !== 'all') {
      result = result.filter((item) => item.deliveryStatus === selectedStatusFilter);
    }

    if (selectedTriggerFilter !== 'all') {
      result = result.filter((item) => item.triggerType === selectedTriggerFilter);
    }

    result.sort((a, b) => {
      const timeA = new Date(a.sentAt).getTime();
      const timeB = new Date(b.sentAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [emailLogs, searchQuery, selectedStatusFilter, selectedTriggerFilter, sortOrder]);

  // Format timestamp in Azerbaijani
  const formatTimestamp = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return isoStr;

      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = [
        'Yanvar',
        'Fevral',
        'Mart',
        'Aprel',
        'May',
        'İyun',
        'İyul',
        'Avqust',
        'Sentyabr',
        'Oktyabr',
        'Noyabr',
        'Dekabr',
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
    } catch {
      return isoStr;
    }
  };

  const getRelativeTime = (isoStr: string) => {
    try {
      const now = Date.now();
      const sent = new Date(isoStr).getTime();
      const diffMs = now - sent;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'İndicə';
      if (diffMins < 60) return `${diffMins} dəqiqə əvvəl`;
      if (diffHours < 24) return `${diffHours} saat əvvəl`;
      return `${diffDays} gün əvvəl`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header & Action Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>E-poçt Tarixçəsi & Xatırlatma Reyestri</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {filteredItems.length} qeyd
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Müsahibələr üçün avtomatik və əl ilə göndərilən 24 saatlıq bildirişlərin göndəriş vaxtları və çatdırılma statusları
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* SMTP Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700">
            <Server className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold">SMTP:</span>
            {smtpStatus.mode === 'real' ? (
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Canlı ({smtpStatus.host}:{smtpStatus.port})
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Simulyasiya Rejimi (Aktiv)
              </span>
            )}
          </div>

          {/* Trigger 24h cron scan button */}
          <button
            onClick={handleTrigger24h}
            disabled={isTriggering24h}
            className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="24 saatlıq intervalda olan bütün müsahibələri skan edir və xatırlatmaları avtomatik göndərir"
          >
            {isTriggering24h ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>24h Yoxla & Göndər</span>
          </button>

          {/* Send Test Email button */}
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sınaq Xatırlatması</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Siyahını təzələ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Link back to interviews calendar if available */}
          {onNavigateToInterviews && (
            <button
              onClick={onNavigateToInterviews}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Müsahibələr Lövhəsi</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Sent */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Ümumi Göndərişlər</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalSent}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{emailLogs.length}</span> aktiv qeydiyyatda
          </div>
        </div>

        {/* Delivered / Verified */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Uğurlu Çatdırılma</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.deliveredCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {stats.totalSent > 0 ? Math.round((stats.deliveredCount / stats.totalSent) * 100) : 100}% Uğur dərəcəsi
            </span>
          </div>
        </div>

        {/* Automated 24h Reminders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">24h Avtomatik Sistem</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700">{stats.automated24hCount}</div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium">
            Avtomatik tetiklənmə
          </div>
        </div>

        {/* Failed / Errors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Xəta / Göndərilməyən</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700">{stats.failedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.failedCount === 0 ? 'Heç bir xəta yoxdur' : 'Yenidən cəhd tələb olunur'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Namizədin adı, e-poçt ünvanı, vəzifə və ya Message-ID üzrə axtar..."
            className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters and Sorters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Bütün Statuslar</option>
              <option value="delivered">Çatdırıldı (Delivered)</option>
              <option value="simulated">Simulyasiya (Simulated)</option>
              <option value="sent">Göndərildi (Sent)</option>
              <option value="failed">Uğursuz (Failed)</option>
            </select>
          </div>

          {/* Trigger Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <select
              value={selectedTriggerFilter}
              onChange={(e) => setSelectedTriggerFilter(e.target.value)}
              className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Bütün Növlər</option>
              <option value="automated_24h">24h Avtomatik Sistem</option>
              <option value="manual_recruiter">Rekruter Əl ilə</option>
              <option value="worker_cron">Cron Worker</option>
              <option value="test_ping">Sınaq Göndərişi</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest">Ən Son Göndərilənlər</option>
              <option value="oldest">Ən Əvvəl Göndərilənlər</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedStatusFilter !== 'all' || selectedTriggerFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatusFilter('all');
                setSelectedTriggerFilter('all');
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Sıfırla</span>
            </button>
          )}
        </div>
      </div>

      {/* Email History List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
            <p className="text-sm font-medium text-slate-600">E-poçt xatırlatma tarixçəsi yüklənir...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-indigo-100">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Heç bir e-poçt bildiriş qeydi tapılmadı</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              {searchQuery || selectedStatusFilter !== 'all' || selectedTriggerFilter !== 'all'
                ? 'Seçilmiş süzgəclərə uyğun heç bir e-poçt bildirişi tapılmadı. Süzgəcləri təmizləyərək yenidən yoxlayın.'
                : 'Müsahibələr təyin edildikdə və ya 24 saat qalmış sistem tərəfindən namizədlərə xatırlatma göndərildikdə, bütün loglar burada əks olunacaq.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setIsTestModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>İlk Sınaq E-poçtunu Göndər</span>
              </button>
              {onNavigateToInterviews && (
                <button
                  onClick={onNavigateToInterviews}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Müsahibə Təyin Et</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Namizəd & Əlaqə</th>
                  <th className="py-3 px-4">Vakansiya & Müsahibə Vaxtı</th>
                  <th className="py-3 px-4">Göndərilmə Tarixi (Zaman Damğası)</th>
                  <th className="py-3 px-4">Çatdırılma Statusu</th>
                  <th className="py-3 px-4">Tətik Növü</th>
                  <th className="py-3 px-4">Message-ID</th>
                  <th className="py-3 px-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((item) => {
                  const isDelivered = item.deliveryStatus === 'delivered';
                  const isSimulated = item.deliveryStatus === 'simulated';
                  const isFailed = item.deliveryStatus === 'failed';
                  const isSent = item.deliveryStatus === 'sent';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Candidate Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.candidateAvatar ? (
                            <img
                              src={item.candidateAvatar}
                              alt={item.candidateName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                              {item.candidateName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{item.candidateName}</span>
                              {onOpenCandidateDetail && (
                                <button
                                  onClick={() => onOpenCandidateDetail(item.candidateEmail)}
                                  className="text-slate-400 hover:text-blue-600 cursor-pointer"
                                  title="Namizəd profilinə bax"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {item.candidateEmail}
                            </div>
                            {item.candidatePhone && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                {item.candidatePhone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Job & Interview Info */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-slate-900">{item.jobTitle}</div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-0.5">
                            <span className="flex items-center gap-1 font-mono font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {item.interviewDate} • {item.interviewTime}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                item.interviewType === 'online'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {item.interviewType === 'online' ? 'Onlayn (Google Meet/Zoom)' : 'Ofis'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Timestamp Sent */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatTimestamp(item.sentAt)}</span>
                          </div>
                          <div className="text-[10px] text-indigo-600 font-medium">
                            {getRelativeTime(item.sentAt)}
                          </div>
                        </div>
                      </td>

                      {/* Delivery Status */}
                      <td className="py-3 px-4">
                        <div>
                          {isDelivered && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Çatdırıldı (250 OK)</span>
                            </span>
                          )}

                          {isSimulated && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs" title="SMTP Simulyasiyası vasitəsilə test mühitində qəbul edildi">
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span>Simulyasiya (Uğurlu)</span>
                            </span>
                          )}

                          {isSent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Send className="w-3 h-3 text-blue-600" />
                              <span>Göndərildi</span>
                            </span>
                          )}

                          {isFailed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Uğursuz (Xəta)</span>
                            </span>
                          )}

                          {item.statusDetails && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]" title={item.statusDetails}>
                              {item.statusDetails}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Trigger Type */}
                      <td className="py-3 px-4">
                        {item.triggerType === 'automated_24h' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            <Clock className="w-3 h-3 text-cyan-600" />
                            <span>24h Avtomatik</span>
                          </span>
                        )}
                        {item.triggerType === 'manual_recruiter' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            <User className="w-3 h-3 text-indigo-600" />
                            <span>HR Əl ilə</span>
                          </span>
                        )}
                        {item.triggerType === 'worker_cron' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            <Server className="w-3 h-3 text-slate-600" />
                            <span>Cron Worker</span>
                          </span>
                        )}
                        {item.triggerType === 'test_ping' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>Sınaq Pinqi</span>
                          </span>
                        )}
                      </td>

                      {/* Message ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200 w-fit">
                          <span className="truncate max-w-[120px]" title={item.messageId}>
                            {item.messageId}
                          </span>
                          <button
                            onClick={() => handleCopyMessageId(item.messageId)}
                            className="p-0.5 hover:text-blue-600 text-slate-400 cursor-pointer"
                            title="Message-ID kopyala"
                          >
                            {copiedId === item.messageId ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Preview Email Body */}
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Məktub mətninə və dizaynına bax"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Resend reminder email */}
                          <button
                            onClick={() => handleResend(item)}
                            disabled={resendingId === item.id}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="E-poçt xatırlatmasını namizədə yenidən göndər"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${resendingId === item.id ? 'animate-spin text-blue-600' : ''}`}
                            />
                          </button>

                          {/* Delete log */}
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Bu qeydi tarixçədən sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Göstərilir: <span className="font-bold text-slate-800">{filteredItems.length}</span> / {emailLogs.length} e-poçt qeydi
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Çatdırıldı ({stats.deliveredCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span> 24h Avtomatik ({stats.automated24hCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Xəta ({stats.failedCount})
            </span>
          </div>
        </div>
      </div>

      {/* MODAL: Email Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Göndərilmiş E-poçt Bildirişinin Tam Məzmunu
                  </h3>
                  <p className="text-xs text-slate-500">
                    {previewItem.candidateName} • {previewItem.jobTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Envelope Meta Info */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-1">
                  <div className="text-slate-500">Kimdən:</div>
                  <div className="font-semibold text-slate-800 font-mono">
                    {company.name} &lt;noreply@jobia.az&gt;
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-1">
                  <div className="text-slate-500">Kimə (Alıcı):</div>
                  <div className="font-bold text-slate-900 font-mono">
                    {previewItem.candidateName} &lt;{previewItem.candidateEmail}&gt;
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-1">
                  <div className="text-slate-500">Mövzu:</div>
                  <div className="font-bold text-indigo-900">{previewItem.subject}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-1">
                  <div className="text-slate-500">Göndəriş Vaxtı:</div>
                  <div className="font-semibold text-slate-700">
                    {formatTimestamp(previewItem.sentAt)} ({getRelativeTime(previewItem.sentAt)})
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="text-slate-500">Message-ID & Status:</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {previewItem.messageId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        previewItem.deliveryStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : previewItem.deliveryStatus === 'simulated'
                          ? 'bg-indigo-100 text-indigo-800'
                          : previewItem.deliveryStatus === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {previewItem.deliveryStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rendered Email Mockup */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold tracking-wider uppercase opacity-90">
                      Jobia HR Müsahibə Xatırlatması
                    </span>
                    <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-semibold">
                      24 Saatlıq Bildiriş
                    </span>
                  </div>
                  <h4 className="text-lg font-bold">Müsahibə Xatırlatması: {previewItem.jobTitle}</h4>
                  <p className="text-xs opacity-90 mt-0.5">{company.name} İnsan Resursları Departamenti</p>
                </div>

                <div className="p-5 bg-white space-y-4 text-xs text-slate-700">
                  <p>
                    Hörmətli <strong className="text-slate-900">{previewItem.candidateName}</strong>,
                  </p>
                  <p>
                    Bu bildiriş <strong>{company.name}</strong> şirkətində{' '}
                    <strong className="text-blue-600">{previewItem.jobTitle}</strong> vəzifəsi üzrə təyin
                    edilmiş müsahibəniz barədə 24 saatlıq rəsmi xatırlatmadır.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-slate-900">Tarix və Saat:</span>
                      <span className="font-mono text-blue-700 font-bold">
                        {previewItem.interviewDate} — {previewItem.interviewTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">Format və Keçid:</span>
                      <span className="font-mono text-slate-800">{previewItem.locationOrLink}</span>
                    </div>
                  </div>

                  {previewItem.emailBodyPreview && (
                    <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-slate-600 font-sans leading-relaxed text-[11px]">
                      {previewItem.emailBodyPreview}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 italic">
                    * Müsahibəyə 10 dəqiqə qalmış internet bağlantınızı və mikrofonunuzu yoxlamağınız tövsiyə olunur.
                  </p>
                </div>

                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Jobia Kadr & Rekrutinq İdarəetmə Sistemi</span>
                  <span>Avtomatlaşdırılmış SMTP Şəbəkəsi</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleCopyMessageId(previewItem.messageId)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl bg-white hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Message-ID Kopyala</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleResend(previewItem);
                    setPreviewItem(null);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Yenidən Göndər</span>
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  Bağla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Send Test Reminder Email */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Sınaq Xatırlatma E-poçtu Göndər
                </h3>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                SMTP konfiqurasiyasını və poçt qutusuna çatdırılmanı dərhal sınaqdan keçirmək üçün istənilən e-poçt ünvanına nümunə xatırlatma göndərin.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alıcı E-poçt Ünvanı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder="hr@sirketiniz.az və ya sexsi@mail.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Namizəd Adı
                </label>
                <input
                  type="text"
                  value={testCandidateName}
                  onChange={(e) => setTestCandidateName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vakansiya / Vəzifə
                </label>
                <input
                  type="text"
                  value={testJobTitle}
                  onChange={(e) => setTestJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Sınaq məktubu göndərildikdən sonra dərhal bu tarixçə cədvəlinin ən yuxarısında <strong>Sınaq Pinqi</strong> statusu ilə əks olunacaq.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingTest ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSendingTest ? 'Göndərilir...' : 'Sınaq Məktubunu Göndər'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
