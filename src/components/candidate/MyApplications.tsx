import React, { useState, useEffect, useMemo } from 'react';
import { Application, ApplicationStatus, JobOffer, User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedApplicationStatus, getLocalizedOfferStatus } from '../../i18n/localizeData';
import { 
  CheckCircle2, 
  Building2, 
  Calendar, 
  MessageSquare, 
  Eye, 
  Briefcase,
  Award,
  ChevronRight,
  LogIn,
  UserPlus,
  Lock,
  Mic,
  Sparkles,
  Target,
  BarChart3
} from 'lucide-react';
import { PracticeInterviewDashboardWidget } from './PracticeInterviewDashboardWidget';
import { getStoredPracticeSessions, getPracticeAnalyticsSummary } from '../../services/practiceInterviewService';

interface MyApplicationsProps {
  applications: Application[];
  offers?: JobOffer[];
  onOpenCVModal: (app: Application) => void;
  onExploreJobs: () => void;
  onViewOffer?: (offer: JobOffer) => void;
  currentUser?: User | null;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: 'candidate' | 'business') => void;
  onNavigateToPractice?: (roleTitle?: string, companyName?: string) => void;
}

export const MyApplications: React.FC<MyApplicationsProps> = ({
  applications,
  offers = [],
  onOpenCVModal,
  onExploreJobs,
  onViewOffer,
  currentUser,
  onOpenAuthModal,
  onNavigateToPractice,
}) => {
  const { language, dict } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'practice-dashboard'>('applications');
  const [practiceSessions, setPracticeSessions] = useState(() => getStoredPracticeSessions());

  useEffect(() => {
    const handleUpdate = () => {
      setPracticeSessions(getStoredPracticeSessions());
    };
    window.addEventListener('jobia_practice_sessions_updated', handleUpdate);
    return () => window.removeEventListener('jobia_practice_sessions_updated', handleUpdate);
  }, []);

  const practiceSummary = useMemo(() => {
    return getPracticeAnalyticsSummary(practiceSessions);
  }, [practiceSessions]);

  const getStatusBadge = (status: ApplicationStatus | string) => {
    switch (status) {
      case 'Müsahibəyə dəvət':
      case 'Müsahibə':
        return 'bg-purple-100 text-purple-800 border-purple-200 font-semibold';
      case 'Təklif verildi':
      case 'Təklif göndərildi':
      case 'Qəbul edildi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      case 'Baxıldı':
      case 'Baxılır':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'İmtina edildi':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Müraciət edildi':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // If user is not logged in / not registered, show clean authentication gateway
  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-5 shadow-xs max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-100 shadow-2xs">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {dict.applications.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              {language === 'en'
                ? 'Sign in or register to track your job applications, view review statuses by companies, and accept official job offers.'
                : language === 'ru'
                ? 'Войдите или зарегистрируйтесь, чтобы отслеживать отклики на вакансии, видеть статус рассмотрения компаниями и принимать официальные офферы.'
                : 'Vakansiya müraciətlərinizi izləmək, göndərdiyiniz CV-lərə şirkətlərin baxış vəziyyətini görmək və rəsmi iş təkliflərini qəbul etmək üçün sistemə daxil olun və ya qeydiyyatdan keçin.'}
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-blue-600 font-bold text-xs flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Live Status' : language === 'ru' ? 'Живой статус' : 'Canlı Status'}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {language === 'en'
                  ? 'Instantly see when employers view your CV and their feedback.'
                  : language === 'ru'
                  ? 'Мгновенно узнавайте, когда работодатели просматривают резюме.'
                  : 'İşəgötürənin CV-nizə baxış vaxtını və rəylərini anında görün.'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-indigo-600 font-bold text-xs flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Interviews' : language === 'ru' ? 'Собеседования' : 'Müsahibələr'}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {language === 'en'
                  ? 'Confirm meeting invitations or sync them to your calendar.'
                  : language === 'ru'
                  ? 'Подтверждайте приглашения на встречи и добавляйте их в календарь.'
                  : 'Gələn görüş dəvətlərini təsdiqləyin və ya təqvimə əlavə edin.'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-emerald-600 font-bold text-xs flex items-center gap-1 mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Official Offer' : language === 'ru' ? 'Официальный оффер' : 'Rəsmi Təklif'}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {language === 'en'
                  ? 'Review salary and contract terms and respond online.'
                  : language === 'ru'
                  ? 'Отвечайте на условия по зарплате и контракту онлайн.'
                  : 'Maaş və müqavilə şərtlərini elektron qaydada cavablayın.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => onOpenAuthModal?.('login', 'candidate')}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{dict.nav.login}</span>
            </button>
            <button
              onClick={() => onOpenAuthModal?.('register', 'candidate')}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{dict.nav.register}</span>
            </button>
            <button
              onClick={onExploreJobs}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {dict.applications.exploreJobs}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveSubTab('applications')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'applications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{dict.applications.title}</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeSubTab === 'applications'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {applications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('practice-dashboard')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'practice-dashboard'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
              : 'text-purple-700 bg-purple-50/80 hover:bg-purple-100 border border-purple-200/60'
          }`}
        >
          <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>AI Müsahibə Məşqi & Sentiment Raporu</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeSubTab === 'practice-dashboard'
                ? 'bg-white/20 text-white'
                : 'bg-purple-200 text-purple-900'
            }`}
          >
            {practiceSummary.totalSessions} Qeyd
          </span>
        </button>
      </div>

      {/* VIEW: PRACTICE INTERVIEW DASHBOARD */}
      {activeSubTab === 'practice-dashboard' ? (
        <PracticeInterviewDashboardWidget onNavigateToPractice={onNavigateToPractice} />
      ) : (
        /* VIEW: APPLICATIONS & HIGHLIGHT BANNER */
        <div className="space-y-5">
          {/* Practice Interview Readiness Highlight Card */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50/60 to-white p-4 sm:p-5 rounded-2xl border border-purple-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Mic className="w-5 h-5 text-purple-100 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    Sınaq Müsahibəsi Hazırlıq & Sentiment İndeksi
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                    {practiceSummary.topPrimarySentiment}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-bold text-purple-900">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Sentiment: {practiceSummary.averageSentimentScore}/100</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 font-bold text-indigo-900">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Texniki STAR: {practiceSummary.averageTechnicalScore}/100</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">
                    Orta Ritm: {practiceSummary.averageWpm} söz/dəq
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSubTab('practice-dashboard')}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Dərin Təhlil Panelinə Bax</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {onNavigateToPractice && (
                <button
                  type="button"
                  onClick={() => onNavigateToPractice()}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5 text-amber-300" />
                  <span>Yeni Səsli Məşq</span>
                </button>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span>{dict.applications.title} ({applications.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {dict.applications.subtitle}
              </p>
            </div>

            <button
              onClick={onExploreJobs}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{dict.applications.exploreJobs}</span>
            </button>
          </div>

      {/* Empty State for Authenticated User */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {dict.applications.noApplications}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'en'
              ? 'Visit the jobs section to send your CV to relevant vacancies in 1 click.'
              : language === 'ru'
              ? 'Перейдите в раздел вакансий, чтобы отправить резюме в 1 клик.'
              : 'Vakansiyalar bölməsinə keçid edərək sizə uyğun iş elanlarına 1 kliklə CV-nizi göndərə bilərsiniz.'}
          </p>
          <button
            onClick={onExploreJobs}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors inline-block shadow-sm cursor-pointer"
          >
            {dict.applications.exploreJobs}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const appOffer = offers.find(
              (o) => o.applicationId === app.id || o.candidateEmail === app.candidateEmail
            );

            return (
              <div
                key={app.id}
                className={`bg-white p-5 rounded-xl border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  appOffer ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={app.companyLogo}
                    alt={app.companyName}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{app.vacancyTitle}</h3>
                      {appOffer && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>
                            {language === 'en' ? 'OFFICIAL OFFER' : language === 'ru' ? 'ОФИЦИАЛЬНЫЙ ОФФЕР' : 'RƏSMİ İŞ TƏKLİFİ'} ({getLocalizedOfferStatus(appOffer.status, language)})
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {app.companyName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dict.applications.appliedAt} {app.appliedDate}
                      </span>
                    </div>

                    {/* Recruiter feedback notes if any */}
                    {app.recruiterNotes && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 mt-2 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-slate-900">
                            {language === 'en' ? "Employer's Note:" : language === 'ru' ? 'Заметка работодателя:' : 'İşəgötürənin Qeydi:'}
                          </span>
                          <span className="text-[11px] text-slate-600">{app.recruiterNotes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Details */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {getLocalizedApplicationStatus(app.status, language)}
                  </span>

                  <div className="flex items-center gap-2">
                    {appOffer && onViewOffer && (
                      <button
                        onClick={() => onViewOffer(appOffer)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>
                          {language === 'en' ? 'View & Respond to Offer' : language === 'ru' ? 'Просмотреть и ответить на оффер' : 'Təklifə Bax və Cavabla'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenCVModal(app)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Submitted CV' : language === 'ru' ? 'Отправленное резюме' : 'Göndərilən CV'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      )}
    </div>
  );
};

