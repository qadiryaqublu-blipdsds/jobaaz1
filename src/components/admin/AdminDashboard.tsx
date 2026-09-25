import React, { useState, useMemo } from 'react';
import { 
  Vacancy, 
  Application, 
  Company, 
  User, 
  UserRole,
  UserSubscription, 
  SubscriptionStatus,
  PaymentTransaction,
  AdminAuditLog,
  AdminAuditAction 
} from '../../types';
import { 
  getStoredSubscriptions, 
  saveStoredSubscriptions,
  getStoredTransactions
} from '../../services/subscriptionService';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  toggleUserAccountStatus 
} from '../../services/authService';
import {
  getAllSubscriptionsFromFirestore,
  getAllPaymentsFromFirestore,
  getAllUsersFromFirestore,
  updateSubscriptionStatusInFirestore,
  updateUserStatusInFirestore,
  updateUserRoleInFirestore,
  getAllAdminAuditLogsFromFirestore,
  subscribeToAdminAuditLogs,
  getStoredAdminAuditLogs,
  recordAdminAuditLog
} from '../../services/firestoreService';
import { 
  ShieldCheck, 
  XCircle, 
  Star, 
  Trash2, 
  Search, 
  Check,
  CreditCard,
  Users,
  Building2,
  FileText,
  UserCheck,
  UserX,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Eye,
  X,
  Clock,
  MapPin,
  Phone,
  Globe,
  History,
  Download,
  CheckCircle2,
  Filter,
  ArrowRight,
  CheckSquare,
  Square,
  Layers,
  Plus
} from 'lucide-react';
import { CreateCompanyModal } from './CreateCompanyModal';
import { JobiaAIComplianceInspectorModal } from './JobiaAIComplianceInspectorModal';
import { AdminCreatedCVsRegistry } from './AdminCreatedCVsRegistry';
import { JobiaSectionFooter } from '../JobiaSectionFooter';
import { useLanguage } from '../../context/LanguageContext';
import {
  getLocalizedCategory,
  getLocalizedCity,
  getLocalizedEmploymentType,
  getLocalizedExperienceLevel,
  getLocalizedApplicationStatus,
  getLocalizedIndustry,
} from '../../i18n/localizeData';

interface AdminDashboardProps {
  vacancies: Vacancy[];
  companies: Company[];
  applications: Application[];
  currentAdminUser?: User | null;
  onApproveVacancy: (id: string) => void;
  onRejectVacancy: (id: string) => void;
  onToggleFeatureVacancy: (id: string) => void;
  onDeleteVacancy: (id: string) => void;
  onToggleCompanyVerified: (id: string) => void;
  onRefresh?: () => void;
  onCreateCompany?: (companyData: Omit<Company, 'id'>) => Promise<Company>;
  onOpenPostJobModal?: (preselectedCompany?: Company) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  vacancies,
  companies,
  applications,
  currentAdminUser,
  onApproveVacancy,
  onRejectVacancy,
  onToggleFeatureVacancy,
  onDeleteVacancy,
  onToggleCompanyVerified,
  onRefresh,
  onCreateCompany,
  onOpenPostJobModal,
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'vacancies' | 'subscriptions' | 'users' | 'companies' | 'applications' | 'created_cvs' | 'approval_history'>('vacancies');
  const [searchQuery, setSearchQuery] = useState('');
  const [vacancyModerationFilter, setVacancyModerationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedVacancyForDetail, setSelectedVacancyForDetail] = useState<Vacancy | null>(null);
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] = useState(false);
  const [companySearchText, setCompanySearchText] = useState('');

  const filteredAdminCompanies = useMemo(() => {
    if (!companySearchText.trim()) return companies;
    const q = companySearchText.toLowerCase().trim();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q)
    );
  }, [companies, companySearchText]);
  
  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => getStoredAdminAuditLogs());
  const [auditFilterType, setAuditFilterType] = useState<'all' | 'vacancy_approvals' | 'vacancy_rejections' | 'company_approvals' | 'company_revokes' | 'other'>('all');
  const [auditAdminFilter, setAuditAdminFilter] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Fallback / Active admin user object
  const currentAdmin = currentAdminUser || {
    id: 'user-admin-1',
    email: 'admin@jobia.az',
    fullName: 'Sistem Administratoru',
    role: 'admin' as UserRole,
  };

  // Local state for live user and subscription updates in admin panel
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(() => getStoredSubscriptions());
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => getStoredTransactions());
  const [isLoadingFirestore, setIsLoadingFirestore] = useState(false);

  const fetchFirestoreData = async () => {
    setIsLoadingFirestore(true);
    try {
      const [fbUsers, fbSubs, fbPayments, fbLogs] = await Promise.all([
        getAllUsersFromFirestore(),
        getAllSubscriptionsFromFirestore(),
        getAllPaymentsFromFirestore(),
        getAllAdminAuditLogsFromFirestore(),
      ]);
      setUsers(fbUsers);
      setSubscriptions(fbSubs as UserSubscription[]);
      setTransactions(fbPayments as PaymentTransaction[]);
      if (Array.isArray(fbLogs) && fbLogs.length > 0) {
        setAuditLogs(fbLogs);
      }
    } catch (e) {
      console.warn('Firestore admin fetch warning, using local cache:', e);
    } finally {
      setIsLoadingFirestore(false);
    }
  };

  React.useEffect(() => {
    fetchFirestoreData();
    const unsub = subscribeToAdminAuditLogs((logs) => {
      setAuditLogs(logs);
    });
    return () => unsub();
  }, []);

  const handleRefresh = () => {
    setUsers(getStoredUsers());
    setSubscriptions(getStoredSubscriptions());
    setTransactions(getStoredTransactions());
    setAuditLogs(getStoredAdminAuditLogs());
    fetchFirestoreData();
    if (onRefresh) onRefresh();
  };

  // Toggle user status
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const currentUser = users.find((u) => u.id === userId);
      const newStatus = currentUser?.status === 'active' ? 'suspended' : 'active';

      // Update state directly for instant feedback
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );

      // sync to local vault
      try {
        toggleUserAccountStatus(userId);
      } catch (err) {
        console.warn('Local toggle warning:', err);
      }

      // sync to Firestore
      await updateUserStatusInFirestore(userId, newStatus).catch(() => {});

      // Record audit log
      await recordAdminAuditLog({
        action: 'change_user_status',
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        adminName: currentAdmin.fullName,
        adminRole: 'admin',
        targetType: 'user',
        targetId: userId,
        targetName: currentUser?.fullName || currentUser?.email || userId,
        previousStatus: currentUser?.status || 'active',
        newStatus,
        details: `Admin ${currentAdmin.fullName} (${currentAdmin.email}) istifadəçi hesabının statusunu dəyişdi: ${newStatus === 'active' ? 'Aktiv' : 'Deaktiv'}.`,
      }).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle user role between 'business' and 'candidate' (Admin management)
  const handleToggleUserRole = async (userId: string, currentRole: UserRole, email: string) => {
    if (currentRole === 'admin') return;
    const newRole: UserRole = currentRole === 'business' ? 'candidate' : 'business';
    
    // Update local state
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    // Sync to Firestore and localStorage
    try {
      await updateUserRoleInFirestore(userId, email, newRole);

      // Record audit log
      await recordAdminAuditLog({
        action: 'change_user_role',
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        adminName: currentAdmin.fullName,
        adminRole: 'admin',
        targetType: 'user',
        targetId: userId,
        targetName: email,
        previousStatus: currentRole,
        newStatus: newRole,
        details: `Admin ${currentAdmin.fullName} (${currentAdmin.email}) "${email}" istifadəçisinin rolunu dəyişdi: ${currentRole} → ${newRole}.`,
      }).catch(() => {});
    } catch (err) {
      console.warn('Role update notice:', err);
    }
  };

  // Toggle subscription status
  const handleToggleSubStatus = async (subId: string) => {
    const updated: UserSubscription[] = subscriptions.map((s) => {
      if (s.id === subId) {
        return {
          ...s,
          status: (s.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE') as SubscriptionStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    setSubscriptions(updated);
    saveStoredSubscriptions(updated);

    const target = updated.find((s) => s.id === subId);
    if (target) {
      // Record audit log
      await recordAdminAuditLog({
        action: 'change_subscription_status',
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        adminName: currentAdmin.fullName,
        adminRole: 'admin',
        targetType: 'subscription',
        targetId: subId,
        targetName: `${target.tier} Plan (${target.userName || target.userId})`,
        previousStatus: target.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE',
        newStatus: target.status,
        details: `Admin ${currentAdmin.fullName} (${currentAdmin.email}) abunəliyin statusunu dəyişdi: ${target.status}.`,
      }).catch(() => {});

      await updateSubscriptionStatusInFirestore(subId, target.status as any).catch(() => {});
    }
  };

  // Calculate MRR / ARR and Stats
  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
  const totalMRR = activeSubs.reduce((sum, s) => {
    if (s.tier === 'FREE') return sum;
    return sum + (s.billingCycle === 'yearly' ? s.amount / 12 : s.amount);
  }, 0);

  const totalRevenue = transactions
    .filter((t) => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  // Robust status calculations - STRICT ADMIN APPROVAL MANDATE
  const isJobApproved = (v: Vacancy) => v.isApproved === true && v.status === 'published';
  const isJobRejected = (v: Vacancy) => v.status === 'rejected';
  const isJobPending = (v: Vacancy) => !isJobApproved(v) && !isJobRejected(v);

  const approvedVacanciesCount = vacancies.filter(isJobApproved).length;
  const pendingVacanciesCount = vacancies.filter(isJobPending).length;
  const rejectedVacanciesCount = vacancies.filter(isJobRejected).length;

  const filteredVacancies = vacancies.filter((v) => {
    if (vacancyModerationFilter === 'pending' && !isJobPending(v)) return false;
    if (vacancyModerationFilter === 'approved' && !isJobApproved(v)) return false;
    if (vacancyModerationFilter === 'rejected' && !isJobRejected(v)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (v.title && v.title.toLowerCase().includes(q)) ||
      (v.companyName && v.companyName.toLowerCase().includes(q)) ||
      (v.category && v.category.toLowerCase().includes(q)) ||
      (v.city && v.city.toLowerCase().includes(q))
    );
  });

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.companyName && u.companyName.toLowerCase().includes(q))
    );
  });

  const filteredSubs = subscriptions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.userName.toLowerCase().includes(q) ||
      s.userEmail.toLowerCase().includes(q) ||
      s.tier.toLowerCase().includes(q)
    );
  });

  // Interactive Admin Tools: Multi-Select & Jobia AI Compliance Inspector
  const [selectedVacancyIds, setSelectedVacancyIds] = useState<string[]>([]);
  const [inspectedVacancy, setInspectedVacancy] = useState<Vacancy | null>(null);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);

  const toggleSelectVacancy = (id: string) => {
    setSelectedVacancyIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFilteredVacancies = () => {
    if (selectedVacancyIds.length === filteredVacancies.length && filteredVacancies.length > 0) {
      setSelectedVacancyIds([]);
    } else {
      setSelectedVacancyIds(filteredVacancies.map((v) => v.id));
    }
  };

  const handleBulkApprove = () => {
    if (selectedVacancyIds.length === 0) return;
    const confirmMsg = language === 'en'
      ? `Are you sure you want to approve and publish ${selectedVacancyIds.length} selected vacancies?`
      : language === 'ru'
      ? `Вы уверены, что хотите одобрить и опубликовать ${selectedVacancyIds.length} выбранных вакансий?`
      : `Seçilmiş ${selectedVacancyIds.length} vakansiyanı dərhal təsdiqləyib dərc etmək istəyirsiniz?`;
    if (window.confirm(confirmMsg)) {
      selectedVacancyIds.forEach((id) => onApproveVacancy(id));
      setSelectedVacancyIds([]);
    }
  };

  const handleBulkReject = () => {
    if (selectedVacancyIds.length === 0) return;
    const confirmMsg = language === 'en'
      ? `Are you sure you want to reject/unpublish ${selectedVacancyIds.length} selected vacancies?`
      : language === 'ru'
      ? `Вы уверены, что хотите снять с публикации/отклонить ${selectedVacancyIds.length} выбранных вакансий?`
      : `Seçilmiş ${selectedVacancyIds.length} vakansiyanı dərcdən çıxarmaq / imtina etmək istəyirsiniz?`;
    if (window.confirm(confirmMsg)) {
      selectedVacancyIds.forEach((id) => onRejectVacancy(id));
      setSelectedVacancyIds([]);
    }
  };

  const handleBulkFeature = async () => {
    if (selectedVacancyIds.length === 0) return;
    const idsToProcess = [...selectedVacancyIds];
    setSelectedVacancyIds([]);
    for (const id of idsToProcess) {
      await onToggleFeatureVacancy(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>
              {language === 'en'
                ? 'jobia.az Master Administrator & Monetization Panel'
                : language === 'ru'
                ? 'Главная панель администратора и монетизации jobia.az'
                : 'jobia.az Baş İnzibatçı və Monetizasiya Paneli'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {language === 'en'
              ? 'Platform Management Center'
              : language === 'ru'
              ? 'Центр управления платформой'
              : 'Platforma İdarəetmə Mərkəzi'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'en'
              ? 'Subscriptions, financial flows, user moderation and vacancy control.'
              : language === 'ru'
              ? 'Подписки, финансовые потоки, модерация пользователей и контроль вакансий.'
              : 'Abunəliklər, maliyyə axınları, istifadəçilərin moderasiyası və vakansiya nəzarəti.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Refresh' : language === 'ru' ? 'Обновить' : 'Yenilə'}</span>
          </button>
          <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-medium text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {language === 'en' ? 'System Active' : language === 'ru' ? 'Система активна' : 'Sistem Aktivdir'}
          </span>
        </div>
      </div>

      {/* Actionable Pending Moderation Banner */}
      {pendingVacanciesCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs shrink-0">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>
                  {language === 'en'
                    ? `${pendingVacanciesCount} new vacancies awaiting admin approval`
                    : language === 'ru'
                    ? `${pendingVacanciesCount} новых вакансий ожидают одобрения администратора`
                    : `${pendingVacanciesCount} yeni vakansiya admin təsdiqi gözləyir`}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                  {language === 'en' ? 'Review' : language === 'ru' ? 'Рассмотрите' : 'Nəzərdən Keçirin'}
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5">
                {language === 'en'
                  ? 'Review job postings submitted by employers, approve to publish or reject.'
                  : language === 'ru'
                  ? 'Проверьте объявления работодателей, подтвердите для публикации или отклоните.'
                  : 'İşəgötürənlər tərəfindən göndərilən elanları yoxlayın, təsdiqləyərək saytda dərc edin və ya imtina edin.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('approval_history')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <History className="w-4 h-4 text-blue-600" />
              <span>
                {language === 'en'
                  ? `Approval History (${auditLogs.length})`
                  : language === 'ru'
                  ? `История согласований (${auditLogs.length})`
                  : `Təsdiq Tarixçəsi (${auditLogs.length})`}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('vacancies');
                setVacancyModerationFilter('pending');
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? `View Pending (${pendingVacanciesCount})`
                  : language === 'ru'
                  ? `Ожидающие (${pendingVacanciesCount})`
                  : `Təsdiq Gözləyənlərə Bax (${pendingVacanciesCount})`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Financial & Platform KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'en' ? 'Monthly Revenue (MRR)' : language === 'ru' ? 'Ежемесячный доход (MRR)' : 'Aylıq Gəlir (MRR)'}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{Math.round(totalMRR)} AZN</div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            {language === 'en' ? 'From active subscriptions' : language === 'ru' ? 'По активным подпискам' : 'Real abunəliklər üzrə'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'en' ? 'Paid Subscribers' : language === 'ru' ? 'Платные подписчики' : 'Ödənişli Abunəçilər'}
            </span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {activeSubs.filter((s) => s.tier !== 'FREE').length}
          </div>
          <span className="text-[11px] text-blue-600 font-medium">Pro, Business & Premium</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'en' ? 'Registered Users' : language === 'ru' ? 'Зарегистрированные пользователи' : 'Qeydiyyatlı İstifadəçilər'}
            </span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
          <span className="text-[11px] text-purple-600 font-medium">
            {users.filter((u) => u.role === 'business').length} {language === 'en' ? 'Companies' : language === 'ru' ? 'Компаний' : 'Şirkət'} • {users.filter((u) => u.role === 'candidate').length} {language === 'en' ? 'Candidates' : language === 'ru' ? 'Кандидатов' : 'Namizəd'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'en' ? 'Vacancies' : language === 'ru' ? 'Вакансии' : 'Vakansiyalar'}
            </span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{vacancies.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {approvedVacanciesCount} {language === 'en' ? 'active approved' : language === 'ru' ? 'активно опубликовано' : 'aktiv təsdiqli'}
          </span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('approval_history')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'approval_history'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-3.5 h-3.5 text-inherit" />
          <span>
            {language === 'en'
              ? 'Approval History'
              : language === 'ru'
              ? 'История согласований'
              : 'Təsdiq Tarixçəsi (Approval History)'}
          </span>
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'approval_history' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-700'}`}>
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'subscriptions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>
            {language === 'en'
              ? `Subscriptions & Payments (${subscriptions.length})`
              : language === 'ru'
              ? `Подписки и платежи (${subscriptions.length})`
              : `Abunəliklər və Ödənişlər (${subscriptions.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>
            {language === 'en'
              ? `Users (${users.length})`
              : language === 'ru'
              ? `Пользователи (${users.length})`
              : `İstifadəçilər (${users.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vacancies')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'vacancies'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>
            {language === 'en'
              ? `Vacancy Moderation (${vacancies.length})`
              : language === 'ru'
              ? `Модерация вакансий (${vacancies.length})`
              : `Vakansiya Moderasiyası (${vacancies.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'companies'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>
            {language === 'en'
              ? `Companies (${companies.length})`
              : language === 'ru'
              ? `Компании (${companies.length})`
              : `Şirkətlər (${companies.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'applications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>
            {language === 'en'
              ? `Applications (${applications.length})`
              : language === 'ru'
              ? `Отклики (${applications.length})`
              : `Müraciətlər (${applications.length})`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('created_cvs')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'created_cvs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-inherit" />
          <span>
            {language === 'en'
              ? 'CV Creators Registry'
              : language === 'ru'
              ? 'База созданных резюме'
              : 'CV Hazırlayanlar Bazası'}
          </span>
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'created_cvs' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            Data
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SUBSCRIPTIONS & MONETIZATION MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  {language === 'en'
                    ? 'All Active and Historical Subscriptions'
                    : language === 'ru'
                    ? 'Все активные и архивные подписки'
                    : 'Bütün Aktiv və Tarixi Abunəliklər'}
                </h3>
                <p className="text-slate-500 text-[11px]">
                  {language === 'en'
                    ? 'Monetization status of employers and candidates'
                    : language === 'ru'
                    ? 'Статус монетизации работодателей и соискателей'
                    : 'İşəgötürən və namizədlərin monetizasiya statusu'}
                </p>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Search user or plan...'
                      : language === 'ru'
                      ? 'Поиск пользователя или тарифа...'
                      : 'İstifadəçi və ya plan axtar...'
                  }
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:bg-white focus:border-blue-600 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                  <tr>
                    <th className="p-3.5">
                      {language === 'en' ? 'User / Company' : language === 'ru' ? 'Пользователь / Компания' : 'İstifadəçi / Şirkət'}
                    </th>
                    <th className="p-3.5">
                      {language === 'en' ? 'Role' : language === 'ru' ? 'Роль' : 'Rol'}
                    </th>
                    <th className="p-3.5">
                      {language === 'en' ? 'Plan & Tier' : language === 'ru' ? 'Тариф и уровень' : 'Plan & Dərəcə'}
                    </th>
                    <th className="p-3.5">
                      {language === 'en' ? 'Amount' : language === 'ru' ? 'Сумма' : 'Dövriyyə / Məbləğ'}
                    </th>
                    <th className="p-3.5">
                      {language === 'en' ? 'Period' : language === 'ru' ? 'Срок' : 'Müddət'}
                    </th>
                    <th className="p-3.5">
                      {language === 'en' ? 'Status' : language === 'ru' ? 'Статус' : 'Status'}
                    </th>
                    <th className="p-3.5 text-right">
                      {language === 'en' ? 'Action' : language === 'ru' ? 'Действие' : 'Əməliyyat'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                        {language === 'en'
                          ? 'No active subscriptions found.'
                          : language === 'ru'
                          ? 'Пока нет активных подписок.'
                          : 'Hələ ki heç bir aktiv abunəlik mövcud deyil.'}
                      </td>
                    </tr>
                  ) : (
                    filteredSubs.map((sub) => {
                    const isExp = new Date(sub.endDate) < new Date();
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{sub.userName}</div>
                          <div className="text-[11px] text-slate-500">{sub.userEmail}</div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              sub.role === 'business'
                                ? 'bg-slate-100 text-slate-800'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {sub.role === 'business'
                              ? (language === 'en' ? 'Employer' : language === 'ru' ? 'Работодатель' : 'İşəgötürən')
                              : (language === 'en' ? 'Candidate' : language === 'ru' ? 'Соискатель' : 'Namizəd')}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-black ${
                              sub.tier === 'BUSINESS'
                                ? 'bg-purple-100 text-purple-800'
                                : sub.tier === 'PRO'
                                ? 'bg-blue-100 text-blue-800'
                                : sub.tier === 'PREMIUM'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {sub.tier}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{sub.amount} AZN</div>
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">
                            {sub.billingCycle === 'yearly'
                              ? (language === 'en' ? 'Yearly' : language === 'ru' ? 'Годовой' : 'İllik')
                              : (language === 'en' ? 'Monthly' : language === 'ru' ? 'Месячный' : 'Aylıq')}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="text-slate-800 font-medium">
                            {new Date(sub.startDate).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'az-AZ')} -{' '}
                            {new Date(sub.endDate).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'az-AZ')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {isExp
                              ? (language === 'en' ? 'Expired' : language === 'ru' ? 'Истек' : 'Müddəti bitib')
                              : (language === 'en' ? 'Active' : language === 'ru' ? 'Действует' : 'Davam edir')}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              sub.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {sub.status === 'ACTIVE'
                              ? (language === 'en' ? 'Active' : language === 'ru' ? 'Активен' : 'Aktiv')
                              : (language === 'en' ? 'Suspended' : language === 'ru' ? 'Приостановлен' : 'Dayandırılıb')}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleToggleSubStatus(sub.id)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                              sub.status === 'ACTIVE'
                                ? 'border-red-200 text-red-700 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {sub.status === 'ACTIVE'
                              ? (language === 'en' ? 'Suspend' : language === 'ru' ? 'Приостановить' : 'Dayandır')
                              : (language === 'en' ? 'Activate' : language === 'ru' ? 'Активировать' : 'Aktivləşdir')}
                          </button>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Transactions Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-black text-xs text-slate-900">
              {language === 'en'
                ? `Recent Payment Transactions (${transactions.length})`
                : language === 'ru'
                ? `Журнал недавних транзакций оплаты (${transactions.length})`
                : `Son Ödəniş Tranzaksiyaları Jurnalı (${transactions.length})`}
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">
                  {language === 'en'
                    ? 'No payment transactions recorded yet.'
                    : language === 'ru'
                    ? 'Транзакции оплаты пока не зарегистрированы.'
                    : 'Hələ ki heç bir ödəniş tranzaksiyası qeydə alınmayıb.'}
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900">{tx.planName}</div>
                      <div className="text-slate-500 text-[11px]">
                        {tx.userName} ({tx.userEmail}) • {tx.paymentMethod}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900 text-sm">{tx.amount} {tx.currency}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">
                        ✓ {language === 'en' ? 'Paid' : language === 'ru' ? 'Оплачено' : 'Ödənilib'} ({new Date(tx.transactionDate).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'az-AZ')})
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: USERS MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="font-black text-slate-900 text-sm">
              {language === 'en'
                ? `All Registered Users (${users.length})`
                : language === 'ru'
                ? `Все зарегистрированные пользователи (${users.length})`
                : `Qeydiyyatdan Keçmiş Bütün İstifadəçilər (${users.length})`}
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Search name, email or company...'
                    : language === 'ru'
                    ? 'Поиск по имени, email или компании...'
                    : 'Ad, e-poçt və ya şirkət axtar...'
                }
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:bg-white focus:border-blue-600 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                <tr>
                  <th className="p-3.5">
                    {language === 'en' ? 'User' : language === 'ru' ? 'Пользователь' : 'İstifadəçi'}
                  </th>
                  <th className="p-3.5">
                    {language === 'en' ? 'Role' : language === 'ru' ? 'Роль' : 'Rol'}
                  </th>
                  <th className="p-3.5">
                    {language === 'en' ? 'Phone / Company' : language === 'ru' ? 'Телефон / Компания' : 'Telefon / Şirkət'}
                  </th>
                  <th className="p-3.5">
                    {language === 'en' ? 'Registration Date' : language === 'ru' ? 'Дата регистрации' : 'Qeydiyyat Tarixi'}
                  </th>
                  <th className="p-3.5">
                    {language === 'en' ? 'Account Status' : language === 'ru' ? 'Статус аккаунта' : 'Hesab Statusu'}
                  </th>
                  <th className="p-3.5 text-right">
                    {language === 'en' ? 'Actions' : language === 'ru' ? 'Действия' : 'Əməliyyatlar'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      {language === 'en'
                        ? 'No users found.'
                        : language === 'ru'
                        ? 'Пользователи не найдены.'
                        : 'Heç bir istifadəçi tapılmadı.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{user.fullName}</div>
                          <div className="text-[11px] text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'business'
                              ? 'bg-slate-800 text-white'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.role === 'admin'
                            ? 'Admin'
                            : user.role === 'business'
                            ? (language === 'en' ? 'Employer' : language === 'ru' ? 'Работодатель' : 'İşəgötürən')
                            : (language === 'en' ? 'Candidate' : language === 'ru' ? 'Соискатель' : 'Namizəd')}
                        </span>
                        {user.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(user.id, user.role, user.email)}
                            className="text-[10px] text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 p-1 rounded border border-transparent hover:border-emerald-200 transition-colors cursor-pointer"
                            title={
                              user.role === 'business'
                                ? (language === 'en' ? 'Switch to Candidate role' : language === 'ru' ? 'Переключить на соискателя' : 'Namizəd roluna keçir')
                                : (language === 'en' ? 'Switch to Employer role' : language === 'ru' ? 'Переключить на работодателя' : 'İşəgötürən roluna keçir')
                            }
                          >
                            ⇄
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{user.companyName || '-'}</div>
                      <div className="text-[11px] text-slate-500">
                        {user.phone || (language === 'en' ? 'Not specified' : language === 'ru' ? 'Не указан' : 'Göstərilməyib')}
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'az-AZ')}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.status === 'active'
                          ? (language === 'en' ? 'Active' : language === 'ru' ? 'Активен' : 'Aktiv')
                          : (language === 'en' ? 'Inactive' : language === 'ru' ? 'Неактивен' : 'Deaktiv')}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                            user.status === 'active'
                              ? 'border-red-200 text-red-700 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {user.status === 'active'
                            ? (language === 'en' ? 'Deactivate' : language === 'ru' ? 'Деактивировать' : 'Deaktiv Et')
                            : (language === 'en' ? 'Activate' : language === 'ru' ? 'Активировать' : 'Aktivləşdir')}
                        </button>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: VACANCIES MODERATION TABLE */}
      {/* ============================================================== */}
      {activeTab === 'vacancies' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
          {/* Header Controls & Filter Pills */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setVacancyModerationFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  vacancyModerationFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {language === 'en'
                  ? `All (${vacancies.length})`
                  : language === 'ru'
                  ? `Все (${vacancies.length})`
                  : `Hamısı (${vacancies.length})`}
              </button>
              <button
                onClick={() => setVacancyModerationFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  vacancyModerationFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  ⏳ {language === 'en'
                    ? `Pending Approval (${pendingVacanciesCount})`
                    : language === 'ru'
                    ? `Ожидают проверки (${pendingVacanciesCount})`
                    : `Təsdiq Gözləyənlər (${pendingVacanciesCount})`}
                </span>
              </button>
              <button
                onClick={() => setVacancyModerationFilter('approved')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  vacancyModerationFilter === 'approved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  ✓ {language === 'en'
                    ? `Published (${approvedVacanciesCount})`
                    : language === 'ru'
                    ? `Опубликованные (${approvedVacanciesCount})`
                    : `Dərc Edilənlər (${approvedVacanciesCount})`}
                </span>
              </button>
              <button
                onClick={() => setVacancyModerationFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                  vacancyModerationFilter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>
                  {language === 'en'
                    ? `Rejected (${rejectedVacanciesCount})`
                    : language === 'ru'
                    ? `Отклоненные (${rejectedVacanciesCount})`
                    : `İmtina Edilənlər (${rejectedVacanciesCount})`}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Search vacancy or company...'
                      : language === 'ru'
                      ? 'Поиск вакансии или компании...'
                      : 'Vakansiya və ya şirkət axtar...'
                  }
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:bg-white focus:border-blue-600 text-xs"
                />
              </div>

              {onOpenPostJobModal && (
                <button
                  type="button"
                  onClick={() => onOpenPostJobModal()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                  title="Admin kimi yeni vakansiya dərc et"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en'
                      ? 'Post Vacancy'
                      : language === 'ru'
                      ? 'Создать вакансию'
                      : 'Yeni Vakansiya Yarat'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Bulk Moderation Action Bar */}
          {selectedVacancyIds.length > 0 && (
            <div className="bg-slate-900 text-white p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 animate-fade-in">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white">
                  {language === 'en'
                    ? `${selectedVacancyIds.length} vacancies selected`
                    : language === 'ru'
                    ? `Выбрано вакансий: ${selectedVacancyIds.length}`
                    : `${selectedVacancyIds.length} vakansiya seçildi`}
                </span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  {language === 'en'
                    ? '(Bulk approve, reject or VIP status)'
                    : language === 'ru'
                    ? '(Массовое одобрение, отклонение или VIP-статус)'
                    : '(Toplu təsdiq, imtina və ya VIP status)'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkApprove}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={
                    language === 'en'
                      ? 'Immediately approve all selected vacancies'
                      : language === 'ru'
                      ? 'Немедленно одобрить все выбранные вакансии'
                      : 'Seçilmiş bütün vakansiyaları dərhal təsdiqlə'
                  }
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en' ? 'Bulk Approve' : language === 'ru' ? 'Одобрить выбранные' : 'Toplu Təsdiqlə'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkReject}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={
                    language === 'en'
                      ? 'Unpublish / reject all selected vacancies'
                      : language === 'ru'
                      ? 'Снять с публикации / отклонить все выбранные вакансии'
                      : 'Seçilmiş bütün vakansiyaları dərcdən çıxar / imtina et'
                  }
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en' ? 'Bulk Reject' : language === 'ru' ? 'Отклонить выбранные' : 'Toplu İmtina'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkFeature}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={
                    language === 'en'
                      ? 'Toggle VIP status for selected vacancies'
                      : language === 'ru'
                      ? 'Изменить VIP статус выбранных вакансий'
                      : 'Seçilmiş vakansiyaların VIP statusunu dəyiş'
                  }
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en' ? 'Bulk VIP' : language === 'ru' ? 'Сделать VIP' : 'Toplu VIP'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedVacancyIds([])}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Clear Selection' : language === 'ru' ? 'Сбросить выбор' : 'Seçimi Sıfırla'}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAllFilteredVacancies}
                      className="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                      title={
                        selectedVacancyIds.length > 0 && selectedVacancyIds.length === filteredVacancies.length
                          ? (language === 'en' ? 'Deselect all' : language === 'ru' ? 'Снять все выделения' : 'Bütün seçimləri ləğv et')
                          : (language === 'en' ? 'Select all filtered' : language === 'ru' ? 'Выбрать все отфильтрованные' : 'Bütün filtr olunmuşları seç')
                      }
                    >
                      {selectedVacancyIds.length > 0 && selectedVacancyIds.length === filteredVacancies.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">
                    {language === 'en' ? 'Vacancy & Company' : language === 'ru' ? 'Вакансия и Компания' : 'Vakansiya & Şirkət'}
                  </th>
                  <th className="p-3.5">
                    {language === 'en' ? 'Category' : language === 'ru' ? 'Категория' : 'Kateqoriya'}
                  </th>
                  <th className="p-3.5">
                    {language === 'en' ? 'Salary' : language === 'ru' ? 'Зарплата' : 'Maaş'}
                  </th>
                  <th className="p-3.5">
                    {language === 'en' ? 'Status' : language === 'ru' ? 'Статус' : 'Status'}
                  </th>
                  <th className="p-3.5">
                    {language === 'en' ? 'Edits' : language === 'ru' ? 'Правки' : 'Redaktə'}
                  </th>
                  <th className="p-3.5">Featured</th>
                  <th className="p-3.5 text-right">
                    {language === 'en' ? 'Actions' : language === 'ru' ? 'Действия' : 'Əməliyyatlar'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVacancies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      {language === 'en'
                        ? 'No vacancies found for this filter.'
                        : language === 'ru'
                        ? 'Вакансий по этому фильтру не найдено.'
                        : 'Bu filtr üzrə vakansiya tapılmadı.'}
                    </td>
                  </tr>
                ) : (
                  filteredVacancies.map((job) => {
                    const isApproved = isJobApproved(job);
                    const isPending = isJobPending(job);
                    const isRejected = isJobRejected(job);
                    const isSelected = selectedVacancyIds.includes(job.id);

                    return (
                      <tr key={job.id} className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelectVacancy(job.id)}
                            className="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </button>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={job.companyLogo}
                              alt={job.companyName}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{job.title}</span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {job.companyName} • {getLocalizedCity(job.city || 'Bakı', language)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                            {getLocalizedCategory(job.category, language)}
                          </span>
                        </td>

                        <td className="p-3.5 font-bold text-blue-700">
                          {job.hideSalary
                            ? (language === 'en' ? 'By agreement' : language === 'ru' ? 'По договоренности' : 'Gizli (Razılaşma ilə)')
                            : `${job.minSalary || 0} - ${job.maxSalary || 0} ${job.currency || 'AZN'}`}
                        </td>

                        <td className="p-3.5">
                          {isApproved && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>
                                ✓ {language === 'en' ? 'Published' : language === 'ru' ? 'Опубликовано' : 'Dərc edilib'}
                              </span>
                            </span>
                          )}
                          {isPending && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max animate-pulse">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>
                                ⏳ {language === 'en' ? 'Pending' : language === 'ru' ? 'В ожидании' : 'Gözləmədə'}
                              </span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                              <X className="w-3 h-3 text-red-600" />
                              <span>
                                ✕ {language === 'en' ? 'Rejected' : language === 'ru' ? 'Отклонено' : 'İmtina edilib'}
                              </span>
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {(job.editCount || 0) >= 1 ? (
                            <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
                              {language === 'en'
                                ? `${job.editCount || 1} time edited`
                                : language === 'ru'
                                ? `Отредактировано: ${job.editCount || 1}`
                                : `${job.editCount || 1} dəfə redaktə olunub`}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">
                              {language === 'en'
                                ? 'Original version'
                                : language === 'ru'
                                ? 'Первоначальная версия'
                                : 'İlkin variant (0 redaktə)'}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <button
                            onClick={() => onToggleFeatureVacancy(job.id)}
                            className={`p-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                              job.isFeatured
                                ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5" fill={job.isFeatured ? 'currentColor' : 'none'} />
                            <span>
                              {job.isFeatured
                                ? 'VIP Premium'
                                : (language === 'en' ? 'Standard' : language === 'ru' ? 'Стандарт' : 'Standart')}
                            </span>
                          </button>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Jobia AI Compliance Inspector */}
                            <button
                              onClick={() => {
                                setInspectedVacancy(job);
                                setIsInspectorModalOpen(true);
                              }}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md border border-indigo-200 transition-colors cursor-pointer"
                              title={
                                language === 'en'
                                  ? 'Jobia AI Compliance & Quality Check'
                                  : language === 'ru'
                                  ? 'Проверка соответствия правилам Jobia AI'
                                  : 'Jobia AI Qayda və Keyfiyyət Yoxlaması'
                              }
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>

                            {/* Preview Full Detail */}
                            <button
                              onClick={() => setSelectedVacancyForDetail(job)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                              title={
                                language === 'en'
                                  ? 'Preview Vacancy Details'
                                  : language === 'ru'
                                  ? 'Полный просмотр вакансии'
                                  : 'Vakansiyaya Tam Baxış'
                              }
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Approve */}
                            {!isApproved ? (
                              <button
                                onClick={() => onApproveVacancy(job.id)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors cursor-pointer"
                                title={
                                  language === 'en'
                                    ? 'Approve and Publish'
                                    : language === 'ru'
                                    ? 'Одобрить и опубликовать'
                                    : 'Təsdiqlə və Dərc Et'
                                }
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : null}

                            {/* Reject / Unpublish */}
                            {isApproved ? (
                              <button
                                onClick={() => onRejectVacancy(job.id)}
                                className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors cursor-pointer"
                                title={
                                  language === 'en'
                                    ? 'Unpublish / Reject'
                                    : language === 'ru'
                                    ? 'Снять с публикации'
                                    : 'Dərcdən çıxar'
                                }
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            ) : null}

                            {/* Delete Vacancy */}
                            <button
                              onClick={() => {
                                const confirmMsg = language === 'en'
                                  ? `Are you sure you want to permanently delete "${job.title}"? This cannot be undone.`
                                  : language === 'ru'
                                  ? `Вы уверены, что хотите навсегда удалить "${job.title}"? Это действие необратимо.`
                                  : `"${job.title}" vakansiyasını həmişəlik silmək istəyirsiniz? Bu əməliyyat geri qaytarılmır.`;
                                if (window.confirm(confirmMsg)) {
                                  onDeleteVacancy(job.id);
                                }
                              }}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md border border-red-200 transition-colors cursor-pointer"
                              title={
                                language === 'en'
                                  ? 'Delete permanently'
                                  : language === 'ru'
                                  ? 'Удалить навсегда'
                                  : 'Həmişəlik Sil'
                              }
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
      )}

      {/* ============================================================== */}
      {/* TAB 4: COMPANIES MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-800">
                  {language === 'en'
                    ? `Registered Businesses & Companies (${companies.length})`
                    : language === 'ru'
                    ? `Зарегистрированные компании и бизнесы (${companies.length})`
                    : `Qeydiyyatdan Keçmiş Bizneslər və Şirkətlər (${companies.length})`}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Vakansiyaları idarə etmək və şirkət adından paylaşımlar etmək üçün şirkətlər reyestri.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companySearchText}
                  onChange={(e) => setCompanySearchText(e.target.value)}
                  placeholder="Şirkət axtar..."
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-600 font-medium"
                />
              </div>

              {onCreateCompany && (
                <button
                  type="button"
                  onClick={() => setIsCreateCompanyModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Yeni Şirkət Yarat</span>
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredAdminCompanies.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium">
                {companySearchText.trim()
                  ? 'Axtarışa uyğun şirkət tapılmadı.'
                  : language === 'en'
                  ? 'No companies registered yet.'
                  : language === 'ru'
                  ? 'Пока нет зарегистрированных компаний.'
                  : 'Hələ ki heç bir şirkət qeydiyyatdan keçməyib.'}
              </div>
            ) : (
              filteredAdminCompanies.map((comp) => {
                const count = vacancies.filter((v) => v.companyId === comp.id).length;

                return (
                  <div key={comp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={comp.logo}
                        alt={comp.name}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">{comp.name}</h4>
                          {comp.verified || comp.verificationStatus === 'verified' ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              ✓ {language === 'en' ? 'Verified (Live)' : language === 'ru' ? 'Подтверждено' : 'Təsdiqlənib'}
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                              ⏳ {language === 'en' ? 'Pending Admin Approval' : language === 'ru' ? 'Ожидает одобрения' : 'Gözləmədə'}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 truncate mt-0.5">
                          {getLocalizedIndustry(comp.industry || '', language)} • {getLocalizedCity(comp.location || 'Bakı', language)} {comp.phone ? `• ${comp.phone}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg text-xs">
                        {count} {language === 'en' ? 'Vacancies' : language === 'ru' ? 'Вакансий' : 'Vakansiya'}
                      </span>

                      {onOpenPostJobModal && (
                        <button
                          type="button"
                          onClick={() => onOpenPostJobModal(comp)}
                          className="px-3 py-1.5 rounded-lg font-bold text-xs bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Bu şirkət adından yeni vakansiya paylaş"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Vakansiya Paylaş</span>
                        </button>
                      )}

                      <button
                        onClick={() => onToggleCompanyVerified(comp.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer text-xs ${
                          comp.verified || comp.verificationStatus === 'verified'
                            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                        }`}
                      >
                        {comp.verified || comp.verificationStatus === 'verified'
                          ? (language === 'en' ? 'Revoke (Hide)' : language === 'ru' ? 'Отозвать' : 'Təsdiqi Ləğv Et')
                          : (language === 'en' ? 'Verify (Publish)' : language === 'ru' ? 'Подтвердить' : 'Təsdiqlə')}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: APPLICATIONS LOG */}
      {/* ============================================================== */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
            {language === 'en'
              ? `All Job Applications on Platform (${applications.length})`
              : language === 'ru'
              ? `Все отклики на платформе (${applications.length})`
              : `Platformada Edilmiş Bütün Müraciətlər (${applications.length})`}
          </div>

          <div className="divide-y divide-slate-100">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium">
                {language === 'en'
                  ? 'No job applications recorded yet.'
                  : language === 'ru'
                  ? 'Откликов пока нет.'
                  : 'Hələ ki heç bir müraciət qeydə alınmayıb.'}
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{app.candidateName}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-blue-700">{app.vacancyTitle}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'en' ? 'Company' : language === 'ru' ? 'Компания' : 'Şirkət'}: <span className="font-semibold text-slate-700">{app.companyName}</span> • {language === 'en' ? 'Date' : language === 'ru' ? 'Дата' : 'Tarix'}: {app.appliedDate} • Email: {app.candidateEmail}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {app.matchScore && (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {app.matchScore}% {language === 'en' ? 'Match' : language === 'ru' ? 'Совпадение' : 'Uyğunluq'}
                      </span>
                    )}
                    <span className="bg-slate-100 font-medium text-slate-800 px-3 py-1 rounded-full border border-slate-200 text-xs">
                      {getLocalizedApplicationStatus(app.status, language)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: APPROVAL HISTORY & AUDIT LOGS */}
      {/* ============================================================== */}
      {activeTab === 'approval_history' && (
        <div className="space-y-6">
          {/* Header & Export Control Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                  <History className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === 'en'
                    ? 'Approval History & Audit Trail'
                    : language === 'ru'
                    ? 'История подтверждений и журнал аудита'
                    : 'Təsdiq Tarixçəsi və Audit Jurnalı (Approval History)'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {language === 'en'
                  ? 'Every vacancy and company status modification, responsible admin account, exact timestamp, and details are logged.'
                  : language === 'ru'
                  ? 'Каждое изменение статуса вакансии или компании регистрируется с указанием администратора, точного времени и деталей.'
                  : 'Platformadakı hər bir vakansiya və şirkət statusunun dəyişdirilməsi, təsdiqləyən və ya imtina edən admin hesabı, dəqiq tarix və detallarla rəsmi qeydə alınır.'}
              </p>
              <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  {language === 'en' ? 'Current Active Admin:' : language === 'ru' ? 'Текущий активный админ:' : 'Hazırkı Fəal Admin:'}{' '}
                  <strong className="text-slate-900">{currentAdmin.fullName}</strong> ({currentAdmin.email})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRefresh}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title={language === 'en' ? 'Refresh audit logs' : language === 'ru' ? 'Обновить логи' : 'Audit loqlarını yenilə'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Refresh' : language === 'ru' ? 'Обновить' : 'Yenilə'}</span>
              </button>

              <button
                onClick={() => {
                  const headers = language === 'en'
                    ? ['ID', 'Date', 'Admin Name', 'Admin Email', 'Role', 'Action', 'Target Type', 'Target ID', 'Target Name', 'Previous Status', 'New Status', 'Details']
                    : language === 'ru'
                    ? ['ID', 'Дата', 'Имя админа', 'Email админа', 'Роль', 'Действие', 'Тип цели', 'ID цели', 'Название цели', 'Предыдущий статус', 'Новый статус', 'Детали']
                    : ['ID', 'Tarix', 'Admin Adı', 'Admin E-poçtu', 'Rol', 'Əməliyyat', 'Hədəf Növü', 'Hədəf ID', 'Hədəf Adı', 'Əvvəlki Status', 'Yeni Status', 'Detallar'];
                  const rows = auditLogs.map((l) => [
                    `"${l.id}"`,
                    `"${new Date(l.timestamp).toLocaleString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'az-AZ')}"`,
                    `"${(l.adminName || '').replace(/"/g, '""')}"`,
                    `"${(l.adminEmail || '').replace(/"/g, '""')}"`,
                    `"${l.adminRole || 'admin'}"`,
                    `"${l.action}"`,
                    `"${l.targetType}"`,
                    `"${l.targetId}"`,
                    `"${(l.targetName || '').replace(/"/g, '""')}"`,
                    `"${(l.previousStatus || '').replace(/"/g, '""')}"`,
                    `"${(l.newStatus || '').replace(/"/g, '""')}"`,
                    `"${(l.details || '').replace(/"/g, '""')}"`
                  ]);
                  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `jobia_admin_approval_history_${new Date().toISOString().slice(0, 10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Export CSV' : language === 'ru' ? 'Экспорт в CSV' : 'CSV İxrac Et'}</span>
              </button>
            </div>
          </div>

          {/* Audit Key Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'en' ? 'Total Logs' : language === 'ru' ? 'Всего записей' : 'Ümumi Qeydlər'}
              </span>
              <div className="text-xl font-black text-slate-900 mt-1">{auditLogs.length}</div>
              <span className="text-[11px] text-slate-500">
                {language === 'en' ? 'System audit events' : language === 'ru' ? 'Событий аудита' : 'Sistem audit hadisəsi'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                {language === 'en' ? 'Job Approvals' : language === 'ru' ? 'Одобрения вакансий' : 'Vakansiya Təsdiqi'}
              </span>
              <div className="text-xl font-black text-emerald-700 mt-1">
                {auditLogs.filter(l => l.action === 'approve_vacancy').length}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">
                {language === 'en' ? 'Published live' : language === 'ru' ? 'Опубликовано' : 'Platformada dərc olundu'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                {language === 'en' ? 'Job Rejections' : language === 'ru' ? 'Отклонения вакансий' : 'Vakansiya İmtinası'}
              </span>
              <div className="text-xl font-black text-amber-700 mt-1">
                {auditLogs.filter(l => l.action === 'reject_vacancy').length}
              </div>
              <span className="text-[11px] text-amber-600 font-medium">
                {language === 'en' ? 'Unpublished / Rejected' : language === 'ru' ? 'Снято с публикации' : 'Dərcdən çıxarıldı'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                {language === 'en' ? 'Company Approvals' : language === 'ru' ? 'Верификации компаний' : 'Şirkət Təsdiqləri'}
              </span>
              <div className="text-xl font-black text-purple-700 mt-1">
                {auditLogs.filter(l => l.action === 'approve_company').length}
              </div>
              <span className="text-[11px] text-purple-600 font-medium">
                {language === 'en' ? 'Official verification' : language === 'ru' ? 'Официальная проверка' : 'Rəsmi verifikasiya'}
              </span>
            </div>
          </div>

          {/* Search, Filter & Admin Account Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
                <button
                  onClick={() => setAuditFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    auditFilterType === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {language === 'en'
                    ? `All (${auditLogs.length})`
                    : language === 'ru'
                    ? `Все (${auditLogs.length})`
                    : `Hamısı (${auditLogs.length})`}
                </button>

                <button
                  onClick={() => setAuditFilterType('vacancy_approvals')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    auditFilterType === 'vacancy_approvals'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  ✓ {language === 'en' ? 'Job Approvals' : language === 'ru' ? 'Одобрения вакансий' : 'Vakansiya Təsdiqləri'} ({auditLogs.filter(l => l.action === 'approve_vacancy').length})
                </button>

                <button
                  onClick={() => setAuditFilterType('vacancy_rejections')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    auditFilterType === 'vacancy_rejections'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  ✕ {language === 'en' ? 'Job Rejections' : language === 'ru' ? 'Отклонения вакансий' : 'Vakansiya İmtinaları'} ({auditLogs.filter(l => l.action === 'reject_vacancy').length})
                </button>

                <button
                  onClick={() => setAuditFilterType('company_approvals')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    auditFilterType === 'company_approvals'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  🏢 {language === 'en' ? 'Company Approvals' : language === 'ru' ? 'Верификации компаний' : 'Şirkət Təsdiqləri'} ({auditLogs.filter(l => l.action === 'approve_company').length})
                </button>

                <button
                  onClick={() => setAuditFilterType('other')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    auditFilterType === 'other'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ⚙️ {language === 'en' ? 'Other Changes' : language === 'ru' ? 'Другие изменения' : 'Digər Dəyişikliklər'}
                </button>
              </div>

              {/* Admin Selector Dropdown */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                  {language === 'en' ? 'Admin Filter:' : language === 'ru' ? 'Фильтр админа:' : 'Admin Filtri:'}
                </span>
                <select
                  value={auditAdminFilter}
                  onChange={(e) => setAuditAdminFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">
                    {language === 'en' ? 'All Admins (All)' : language === 'ru' ? 'Все администраторы' : 'Bütün Adminlər (Hamısı)'}
                  </option>
                  {Array.from(new Set(auditLogs.map(l => l.adminEmail).filter(Boolean))).map((email) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Search admin name, email, vacancy, company or detail...'
                    : language === 'ru'
                    ? 'Поиск по имени админа, email, вакансии, компании или детали...'
                    : 'Admin adı, e-poçtu, vakansiya adı, şirkət adı və ya detal üzrə axtarın...'
                }
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {auditSearchQuery && (
                <button
                  onClick={() => setAuditSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  {language === 'en' ? 'Clear' : language === 'ru' ? 'Очистить' : 'Təmizlə'}
                </button>
              )}
            </div>
          </div>

          {/* Audit Logs Table / Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">
                      {language === 'en' ? 'Admin Account' : language === 'ru' ? 'Аккаунт администратора' : 'Təsdiqləyən Admin Hesabı'}
                    </th>
                    <th className="py-3 px-4">
                      {language === 'en' ? 'Action Type' : language === 'ru' ? 'Тип операции' : 'Əməliyyat Növü'}
                    </th>
                    <th className="py-3 px-4">
                      {language === 'en' ? 'Target (Job / Company)' : language === 'ru' ? 'Цель (Вакансия / Компания)' : 'Hədəf (Vakansiya / Şirkət)'}
                    </th>
                    <th className="py-3 px-4">
                      {language === 'en' ? 'Status Transition' : language === 'ru' ? 'Смена статуса' : 'Status Dəyişikliyi'}
                    </th>
                    <th className="py-3 px-4">
                      {language === 'en' ? 'Details & Notes' : language === 'ru' ? 'Детали и примечания' : 'Detallar və Qeyd'}
                    </th>
                    <th className="py-3 px-4 text-right">
                      {language === 'en' ? 'Date & Time' : language === 'ru' ? 'Дата и время' : 'Tarix və Saat'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(() => {
                    const filtered = auditLogs.filter((log) => {
                      if (auditFilterType === 'vacancy_approvals' && log.action !== 'approve_vacancy') return false;
                      if (auditFilterType === 'vacancy_rejections' && log.action !== 'reject_vacancy') return false;
                      if (auditFilterType === 'company_approvals' && log.action !== 'approve_company') return false;
                      if (auditFilterType === 'company_revokes' && log.action !== 'revoke_company') return false;
                      if (auditFilterType === 'other' && ['approve_vacancy', 'reject_vacancy', 'approve_company', 'revoke_company'].includes(log.action)) return false;

                      if (auditAdminFilter !== 'all' && log.adminEmail !== auditAdminFilter) return false;

                      if (auditSearchQuery.trim()) {
                        const q = auditSearchQuery.toLowerCase();
                        const matchAdmin = (log.adminName || '').toLowerCase().includes(q) || (log.adminEmail || '').toLowerCase().includes(q);
                        const matchTarget = (log.targetName || '').toLowerCase().includes(q) || (log.targetId || '').toLowerCase().includes(q);
                        const matchDetails = (log.details || '').toLowerCase().includes(q);
                        const matchAction = (log.action || '').toLowerCase().includes(q);
                        if (!matchAdmin && !matchTarget && !matchDetails && !matchAction) return false;
                      }

                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <History className="w-8 h-8 text-slate-300" />
                              <div className="text-sm font-bold text-slate-700">
                                {language === 'en'
                                  ? 'No matching audit records found'
                                  : language === 'ru'
                                  ? 'Соответствующие записи аудита не найдены'
                                  : 'Uyğun audit qeydi tapılmadı'}
                              </div>
                              <p className="text-xs text-slate-400 max-w-sm">
                                {language === 'en'
                                  ? 'No approval or status modification logs match the selected filters.'
                                  : language === 'ru'
                                  ? 'Нет записей аудита, соответствующих выбранным фильтрам.'
                                  : 'Seçilmiş filtrlərə uyğun heç bir təsdiq və ya status dəyişikliyi jurnalı mövcud deyil.'}
                              </p>
                              {(auditFilterType !== 'all' || auditAdminFilter !== 'all' || auditSearchQuery) && (
                                <button
                                  onClick={() => {
                                    setAuditFilterType('all');
                                    setAuditAdminFilter('all');
                                    setAuditSearchQuery('');
                                  }}
                                  className="mt-2 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                                >
                                  {language === 'en'
                                    ? 'Reset all filters'
                                    : language === 'ru'
                                    ? 'Сбросить все фильтры'
                                    : 'Bütün filtrləri sıfırla'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((log) => {
                      let actionBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {log.action}
                        </span>
                      );

                      if (log.action === 'approve_vacancy') {
                        actionBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>
                              {language === 'en'
                                ? 'Vacancy Approved'
                                : language === 'ru'
                                ? 'Вакансия одобрена'
                                : 'Vakansiya Təsdiqləndi'}
                            </span>
                          </span>
                        );
                      } else if (log.action === 'reject_vacancy') {
                        actionBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <XCircle className="w-3 h-3 text-amber-600" />
                            <span>
                              {language === 'en'
                                ? 'Vacancy Rejected'
                                : language === 'ru'
                                ? 'Вакансия отклонена'
                                : 'Vakansiya İmtina Edildi'}
                            </span>
                          </span>
                        );
                      } else if (log.action === 'approve_company') {
                        actionBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Building2 className="w-3 h-3 text-purple-600" />
                            <span>
                              {language === 'en'
                                ? 'Company Approved'
                                : language === 'ru'
                                ? 'Компания одобрена'
                                : 'Şirkət Təsdiqləndi'}
                            </span>
                          </span>
                        );
                      } else if (log.action === 'revoke_company') {
                        actionBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>
                              {language === 'en'
                                ? 'Company Revoked'
                                : language === 'ru'
                                ? 'Верификация компании отозвана'
                                : 'Şirkət Ləğv Edildi'}
                            </span>
                          </span>
                        );
                      } else if (log.action === 'toggle_featured_vacancy') {
                        actionBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Star className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                            <span>
                              {language === 'en'
                                ? 'VIP Status Changed'
                                : language === 'ru'
                                ? 'VIP статус изменен'
                                : 'Premium Dəyişdirildi'}
                            </span>
                          </span>
                        );
                      } else if (log.action === 'delete_vacancy') {
                        actionBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span>
                              {language === 'en'
                                ? 'Vacancy Deleted'
                                : language === 'ru'
                                ? 'Вакансия удалена'
                                : 'Vakansiya Silindi'}
                            </span>
                          </span>
                        );
                      } else if (log.action === 'change_user_status' || log.action === 'change_user_role') {
                        actionBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Users className="w-3 h-3 text-blue-600" />
                            <span>
                              {language === 'en'
                                ? 'User Modified'
                                : language === 'ru'
                                ? 'Изменение пользователя'
                                : 'İstifadəçi Dəyişikliyi'}
                            </span>
                          </span>
                        );
                      }

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Admin Column */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                                {(log.adminName || log.adminEmail || 'A')[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">
                                  {log.adminName || 'Admin'}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono truncate">
                                  {log.adminEmail}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Action Type */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            {actionBadge}
                          </td>

                          {/* Target Column */}
                          <td className="py-3.5 px-4 align-top">
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">
                                {log.targetName || log.targetId}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                                  log.targetType === 'vacancy'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : log.targetType === 'company'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {log.targetType === 'vacancy'
                                    ? (language === 'en' ? 'Vacancy' : language === 'ru' ? 'Вакансия' : 'Vakansiya')
                                    : log.targetType === 'company'
                                    ? (language === 'en' ? 'Company' : language === 'ru' ? 'Компания' : 'Şirkət')
                                    : log.targetType}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  #{log.targetId}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Status Transition */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 text-[11px] font-semibold">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {log.previousStatus || '—'}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                log.newStatus === 'published' || log.newStatus === 'verified' || log.newStatus === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.newStatus === 'rejected' || log.newStatus === 'deleted'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {log.newStatus || '—'}
                              </span>
                            </div>
                          </td>

                          {/* Details / Note */}
                          <td className="py-3.5 px-4 align-top text-xs text-slate-600 max-w-xs">
                            <p className="line-clamp-2" title={log.details}>
                              {log.details}
                            </p>
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                            <div className="font-bold text-slate-900 text-xs">
                              {new Date(log.timestamp).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'az-AZ', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(log.timestamp).toLocaleTimeString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'az-AZ', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: CREATED CVS REGISTRY (DATA COLLECTION) */}
      {/* ============================================================== */}
      {activeTab === 'created_cvs' && (
        <AdminCreatedCVsRegistry onRefreshParent={fetchFirestoreData} />
      )}

      {/* ============================================================== */}
      {/* ADMIN VACANCY FULL PREVIEW & MODERATION MODAL */}
      {/* ============================================================== */}
      {selectedVacancyForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedVacancyForDetail.companyLogo}
                  alt={selectedVacancyForDetail.companyName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {selectedVacancyForDetail.title}
                    </h3>
                    {selectedVacancyForDetail.isApproved !== false && selectedVacancyForDetail.status === 'published' ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> {language === 'en' ? 'Published' : language === 'ru' ? 'Опубликовано' : 'Dərc edilib'}
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-700" /> {language === 'en' ? 'Pending Approval' : language === 'ru' ? 'Ожидает одобрения' : 'Təsdiq Gözləyir'}
                      </span>
                    )}
                    {(selectedVacancyForDetail.editCount || 0) >= 1 && (
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        {language === 'en'
                          ? `Edited ${selectedVacancyForDetail.editCount} time(s)`
                          : language === 'ru'
                          ? `Отредактировано ${selectedVacancyForDetail.editCount} раз(а)`
                          : `${selectedVacancyForDetail.editCount} dəfə redaktə olunub`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedVacancyForDetail.companyName} • {getLocalizedCategory(selectedVacancyForDetail.category, language)} • {getLocalizedCity(selectedVacancyForDetail.city || 'Bakı', language)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedVacancyForDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    {language === 'en' ? 'Salary' : language === 'ru' ? 'Зарплата' : 'Maaş'}
                  </div>
                  <div className="font-bold text-blue-700 text-sm mt-0.5">
                    {selectedVacancyForDetail.hideSalary
                      ? (language === 'en' ? 'Negotiable' : language === 'ru' ? 'По договоренности' : 'Razılaşma ilə')
                      : `${selectedVacancyForDetail.minSalary || 0} - ${selectedVacancyForDetail.maxSalary || 0} ${selectedVacancyForDetail.currency || 'AZN'}`}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    {language === 'en' ? 'Work Schedule' : language === 'ru' ? 'График работы' : 'İş Qrafiki'}
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {getLocalizedEmploymentType(selectedVacancyForDetail.employmentType || 'Tam ştat', language)}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    {language === 'en' ? 'Experience' : language === 'ru' ? 'Опыт работы' : 'Təcrübə'}
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 truncate">
                    {getLocalizedExperienceLevel(selectedVacancyForDetail.experienceLevel || '1-3 il', language)}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    {language === 'en' ? 'Deadline' : language === 'ru' ? 'Крайний срок' : 'Son Tarix'}
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedVacancyForDetail.deadline || (language === 'en' ? '30 days' : language === 'ru' ? '30 дней' : '30 gün')}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedVacancyForDetail.description && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">
                    {language === 'en' ? 'Job Description' : language === 'ru' ? 'Описание работы' : 'İşin Təsviri'}
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line text-slate-700 leading-relaxed">
                    {selectedVacancyForDetail.description}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {selectedVacancyForDetail.responsibilities && selectedVacancyForDetail.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">
                    {language === 'en' ? 'Key Responsibilities' : language === 'ru' ? 'Обязанности' : 'Vəzifə Öhdəlikləri'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700">
                    {selectedVacancyForDetail.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {selectedVacancyForDetail.requirements && selectedVacancyForDetail.requirements.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">
                    {language === 'en' ? 'Requirements' : language === 'ru' ? 'Требования' : 'Tələblər'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700">
                    {selectedVacancyForDetail.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-blue-900">
                    {language === 'en' ? 'Contact Details' : language === 'ru' ? 'Контактная информация' : 'Əlaqə Məlumatları'}
                  </div>
                  <div className="text-blue-700 text-xs mt-0.5">
                    {language === 'en' ? 'Phone / WhatsApp' : language === 'ru' ? 'Телефон / WhatsApp' : 'Telefon / WhatsApp'}:{' '}
                    {selectedVacancyForDetail.contactPhone || selectedVacancyForDetail.contactWhatsapp || (language === 'en' ? 'Not specified' : language === 'ru' ? 'Не указано' : 'Qeyd edilməyib')}
                  </div>
                </div>
                {selectedVacancyForDetail.createdBy && (
                  <div className="text-[11px] text-blue-600 bg-white px-3 py-1 rounded-lg border border-blue-200">
                    {language === 'en' ? 'Creator ID' : language === 'ru' ? 'ID автора' : 'Paylaşan ID'}: {selectedVacancyForDetail.createdBy}
                  </div>
                )}
              </div>

              {/* Vacancy Approval History Audit Trail */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <History className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {language === 'en'
                        ? 'Approval & Moderation History for This Vacancy'
                        : language === 'ru'
                        ? 'История модерации этой вакансии'
                        : 'Bu Vakansiyanın Təsdiq və Moderasiya Tarixçəsi'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    {language === 'en' ? 'Audit Log' : language === 'ru' ? 'Аудит-лог' : 'Audit Loqu'}
                  </span>
                </div>

                {(() => {
                  const jobLogs = auditLogs.filter((l) => l.targetId === selectedVacancyForDetail.id);
                  if (jobLogs.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 italic">
                        {language === 'en'
                          ? 'No moderation actions recorded for this vacancy yet.'
                          : language === 'ru'
                          ? 'Для этой вакансии пока нет записей модерации.'
                          : 'Bu vakansiya üçün hələ qeydə alınmış heç bir moderasiya əməliyyatı yoxdur.'}
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                      {jobLogs.map((log) => (
                        <div key={log.id} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900">{log.adminName}</span>
                              <span className="text-[11px] text-slate-500 font-mono">({log.adminEmail})</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                log.action === 'approve_vacancy'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.action === 'reject_vacancy'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {log.action === 'approve_vacancy'
                                  ? (language === 'en' ? '✓ Approved' : language === 'ru' ? '✓ Одобрено' : '✓ Təsdiqləndi')
                                  : log.action === 'reject_vacancy'
                                  ? (language === 'en' ? '✕ Rejected' : language === 'ru' ? '✕ Отклонено' : '✕ İmtina Edildi')
                                  : log.action}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1">{log.details}</p>
                          </div>
                          <div className="text-[10px] text-slate-400 text-right shrink-0 font-mono">
                            {new Date(log.timestamp).toLocaleString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'az-AZ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onToggleFeatureVacancy(selectedVacancyForDetail.id);
                    setSelectedVacancyForDetail((prev) => prev ? { ...prev, isFeatured: !prev.isFeatured } : null);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedVacancyForDetail.isFeatured
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Star className="w-4 h-4" fill={selectedVacancyForDetail.isFeatured ? 'currentColor' : 'none'} />
                  <span>
                    {selectedVacancyForDetail.isFeatured
                      ? (language === 'en' ? 'VIP Premium (Active)' : language === 'ru' ? 'VIP Премиум (Активен)' : 'VIP Premium (Aktivdir)')
                      : (language === 'en' ? 'Make VIP Premium' : language === 'ru' ? 'Сделать VIP' : 'VIP Premium Et')}
                  </span>
                </button>

                <button
                  onClick={() => {
                    const confirmMsg = language === 'en'
                      ? `Are you sure you want to permanently delete "${selectedVacancyForDetail.title}"?`
                      : language === 'ru'
                      ? `Вы уверены, что хотите навсегда удалить вакансию "${selectedVacancyForDetail.title}"?`
                      : `"${selectedVacancyForDetail.title}" vakansiyasını həmişəlik silmək istəyirsiniz?`;
                    if (window.confirm(confirmMsg)) {
                      onDeleteVacancy(selectedVacancyForDetail.id);
                      setSelectedVacancyForDetail(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{language === 'en' ? 'Delete Permanently' : language === 'ru' ? 'Удалить навсегда' : 'Həmişəlik Sil'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Jobia AI Compliance Inspector */}
                <button
                  type="button"
                  onClick={() => {
                    setInspectedVacancy(selectedVacancyForDetail);
                    setIsInspectorModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title={
                    language === 'en'
                      ? 'Jobia AI Legal Compliance & Quality Check'
                      : language === 'ru'
                      ? 'Проверка качества и законодательства Jobia AI'
                      : 'Jobia AI Qanunvericilik və Keyfiyyət Yoxlaması'
                  }
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'en' ? 'Jobia AI Check' : language === 'ru' ? 'Проверить Jobia AI' : 'Jobia AI Yoxla'}</span>
                </button>

                {selectedVacancyForDetail.isApproved === false || selectedVacancyForDetail.status !== 'published' ? (
                  <button
                    onClick={() => {
                      onApproveVacancy(selectedVacancyForDetail.id);
                      setSelectedVacancyForDetail((prev) => prev ? { ...prev, isApproved: true, status: 'published' } : null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{language === 'en' ? 'Approve & Publish' : language === 'ru' ? 'Одобрить и опубликовать' : 'Təsdiqlə və Dərc Et'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onRejectVacancy(selectedVacancyForDetail.id);
                      setSelectedVacancyForDetail((prev) => prev ? { ...prev, isApproved: false, status: 'rejected' } : null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{language === 'en' ? 'Unpublish (Reject)' : language === 'ru' ? 'Снять с публикации' : 'Dərcdən Çıxar (İmtina)'}</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedVacancyForDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Close' : language === 'ru' ? 'Закрыть' : 'Bağla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Jobia AI Compliance Inspector Modal for Admin */}
      <JobiaAIComplianceInspectorModal
        isOpen={isInspectorModalOpen}
        onClose={() => {
          setIsInspectorModalOpen(false);
          setInspectedVacancy(null);
        }}
        vacancy={inspectedVacancy}
        onApprove={(vacId) => {
          onApproveVacancy(vacId);
          if (selectedVacancyForDetail?.id === vacId) {
            setSelectedVacancyForDetail((prev) => prev ? { ...prev, isApproved: true, status: 'published' } : null);
          }
        }}
        onReject={(vacId) => {
          onRejectVacancy(vacId);
          if (selectedVacancyForDetail?.id === vacId) {
            setSelectedVacancyForDetail((prev) => prev ? { ...prev, isApproved: false, status: 'rejected' } : null);
          }
        }}
      />

      {/* Create Company Modal for Admin */}
      {onCreateCompany && (
        <CreateCompanyModal
          isOpen={isCreateCompanyModalOpen}
          onClose={() => setIsCreateCompanyModalOpen(false)}
          onCreateCompany={onCreateCompany}
          onCompanyCreated={(newComp) => {
            if (onOpenPostJobModal) {
              onOpenPostJobModal(newComp);
            }
          }}
        />
      )}
    </div>
  );
};
