import React, { useState } from 'react';
import { Application, ApplicationStatus, JobOffer } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedApplicationStatus, getLocalizedOfferStatus } from '../../i18n/localizeData';
import { 
  User, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send,
  Search,
  CheckSquare,
  Square,
  Users,
  Building2,
  FileText
} from 'lucide-react';

interface CandidateKanbanBoardProps {
  applications: Application[];
  offers: JobOffer[];
  onOpenApplicantModal: (applicant: Application) => void;
  onUpdateApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  onOpenInterviewModal: (app: Application) => void;
  onOpenOfferModal: (app: Application) => void;
  selectedCandidateIds: string[];
  onToggleCandidateSelection: (candidateId: string) => void;
  onOpenJobiaAIEvaluation: (applicant: Application) => void;
}

interface ColumnConfig {
  status: ApplicationStatus;
  titleEn: string;
  titleRu: string;
  titleAz: string;
  color: string;
  borderHover: string;
  bgLight: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PIPELINE_COLUMNS: ColumnConfig[] = [
  {
    status: 'Müraciət edildi',
    titleEn: 'New Application',
    titleRu: 'Новые заявки',
    titleAz: 'Yeni Müraciət',
    color: 'border-slate-300',
    borderHover: 'hover:border-slate-400',
    bgLight: 'bg-slate-50',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-800',
    icon: Clock,
  },
  {
    status: 'Baxıldı',
    titleEn: 'Reviewed & Shortlist',
    titleRu: 'Просмотрено / Отбор',
    titleAz: 'Baxıldı & İlkin Seçim',
    color: 'border-blue-300',
    borderHover: 'hover:border-blue-400',
    bgLight: 'bg-blue-50/50',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    icon: Eye,
  },
  {
    status: 'Müsahibəyə dəvət',
    titleEn: 'Interview Stage',
    titleRu: 'Этап собеседования',
    titleAz: 'Müsahibə Mərhələsi',
    color: 'border-amber-300',
    borderHover: 'hover:border-amber-400',
    bgLight: 'bg-amber-50/40',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    icon: Calendar,
  },
  {
    status: 'Təklif verildi',
    titleEn: 'Job Offer Sent',
    titleRu: 'Предложение работы',
    titleAz: 'İş Təklifi (Offer)',
    color: 'border-indigo-300',
    borderHover: 'hover:border-indigo-400',
    bgLight: 'bg-indigo-50/40',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    icon: Send,
  },
  {
    status: 'Qəbul edildi',
    titleEn: 'Hired / Accepted',
    titleRu: 'Принят / Нанят',
    titleAz: 'Qəbul Edildi (Uğurlu)',
    color: 'border-emerald-300',
    borderHover: 'hover:border-emerald-400',
    bgLight: 'bg-emerald-50/40',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    icon: CheckCircle2,
  },
  {
    status: 'İmtina edildi',
    titleEn: 'Rejected / Declined',
    titleRu: 'Отклонено',
    titleAz: 'İmtina Edildi',
    color: 'border-rose-300',
    borderHover: 'hover:border-rose-400',
    bgLight: 'bg-rose-50/40',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    icon: AlertCircle,
  },
];

export const CandidateKanbanBoard: React.FC<CandidateKanbanBoardProps> = ({
  applications,
  offers,
  onOpenApplicantModal,
  onUpdateApplicationStatus,
  onOpenInterviewModal,
  onOpenOfferModal,
  selectedCandidateIds,
  onToggleCandidateSelection,
  onOpenJobiaAIEvaluation,
}) => {
  const { language } = useLanguage();
  const [searchFilter, setSearchFilter] = useState('');

  const filteredApps = applications.filter((app) => {
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase();
    return (
      app.candidateName.toLowerCase().includes(query) ||
      app.candidateEmail.toLowerCase().includes(query) ||
      app.vacancyTitle.toLowerCase().includes(query)
    );
  });

  const getNextStatus = (current: ApplicationStatus): ApplicationStatus | null => {
    const statuses: ApplicationStatus[] = ['Müraciət edildi', 'Baxıldı', 'Müsahibəyə dəvət', 'Təklif verildi', 'Qəbul edildi'];
    const idx = statuses.indexOf(current);
    if (idx >= 0 && idx < statuses.length - 1) return statuses[idx + 1];
    return null;
  };

  const getPrevStatus = (current: ApplicationStatus): ApplicationStatus | null => {
    const statuses: ApplicationStatus[] = ['Müraciət edildi', 'Baxıldı', 'Müsahibəyə dəvət', 'Təklif verildi', 'Qəbul edildi'];
    const idx = statuses.indexOf(current);
    if (idx > 0) return statuses[idx - 1];
    if (current === 'İmtina edildi') return 'Baxıldı';
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Search & Quick Stats bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'en'
                ? 'Search by candidate name, role or email...'
                : language === 'ru'
                ? 'Поиск по имени соискателя, должности или e-mail...'
                : 'Namizəd adı, vəzifə və ya e-poçt üzrə axtar...'
            }
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Users className="w-4 h-4 text-blue-600" />
          <span>
            {language === 'en' ? 'Total: ' : language === 'ru' ? 'Всего: ' : 'Ümumi: '}
            <strong className="text-slate-800">{applications.length}</strong>
            {language === 'en' ? ' candidates' : language === 'ru' ? ' соискателей' : ' namizəd'}
          </span>
          {selectedCandidateIds.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px]">
              {selectedCandidateIds.length} {language === 'en' ? 'selected' : language === 'ru' ? 'выбрано' : 'namizəd seçilib'}
            </span>
          )}
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="flex gap-4 min-w-[1240px] items-start">
          {PIPELINE_COLUMNS.map((col) => {
            const colApps = filteredApps.filter((a) => (a.status || 'Gözləyir') === col.status);
            const Icon = col.icon;
            const columnHeaderTitle =
              language === 'en' ? col.titleEn : language === 'ru' ? col.titleRu : col.titleAz;

            return (
              <div
                key={col.status}
                className={`flex-1 min-w-[260px] max-w-[320px] bg-slate-100/70 rounded-xl p-3 border ${col.color} flex flex-col min-h-[460px] max-h-[750px] shadow-2xs`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${col.badgeBg} ${col.badgeText}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{columnHeaderTitle}</h4>
                    </div>
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText}`}>
                    {colApps.length}
                  </span>
                </div>

                {/* Candidate Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {colApps.length === 0 ? (
                    <div className="h-32 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs p-3 text-center">
                      <span>
                        {language === 'en'
                          ? 'No candidates in this stage'
                          : language === 'ru'
                          ? 'Нет соискателей на этом этапе'
                          : 'Bu mərhələdə namizəd yoxdur'}
                      </span>
                    </div>
                  ) : (
                    colApps.map((app) => {
                      const nextStatus = getNextStatus(app.status || 'Müraciət edildi');
                      const prevStatus = getPrevStatus(app.status || 'Müraciət edildi');
                      const existingOffer = offers.find(
                        (o) => o.applicationId === app.id || o.candidateEmail === app.candidateEmail
                      );
                      const isSelected = selectedCandidateIds.includes(app.id);

                      return (
                        <div
                          key={app.id}
                          className={`bg-white p-3 rounded-xl border transition-all shadow-2xs hover:shadow-sm space-y-2 ${
                            isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Card Top: Checkbox, Name, and Match Score */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onToggleCandidateSelection(app.id)}
                                className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                title={
                                  isSelected
                                    ? language === 'en' ? 'Deselect' : language === 'ru' ? 'Отменить выбор' : 'Seçimi ləğv et'
                                    : language === 'en' ? 'Select to compare' : language === 'ru' ? 'Выбрать для сравнения' : 'Müqayisə üçün seç'
                                }
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                              <h5
                                onClick={() => onOpenApplicantModal(app)}
                                className="font-bold text-slate-900 text-xs hover:text-blue-600 cursor-pointer line-clamp-1"
                              >
                                {app.candidateName}
                              </h5>
                            </div>

                            {app.matchScore !== undefined && (
                              <span
                                className={`text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0 ${
                                  app.matchScore >= 80
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : app.matchScore >= 60
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                {app.matchScore}%
                              </span>
                            )}
                          </div>

                          {/* Applied Vacancy */}
                          <div className="text-[11px] text-slate-600 line-clamp-1 font-medium">
                            {app.vacancyTitle}
                          </div>

                          {/* Offer Status Badge if exists */}
                          {existingOffer && (
                            <div className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center justify-between">
                              <span>{language === 'en' ? 'Offer: ' : language === 'ru' ? 'Предложение: ' : 'Təklif: '}{existingOffer.position}</span>
                              <span className="font-bold">{getLocalizedOfferStatus(existingOffer.status, language)}</span>
                            </div>
                          )}

                          {/* Date and Quick Action Buttons */}
                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                            <span className="text-slate-400 font-medium">
                              {app.appliedDate?.slice(5) || (language === 'en' ? 'New' : language === 'ru' ? 'Новый' : 'Yeni')}
                            </span>

                            <div className="flex items-center gap-1">
                              {/* Jobia AI Evaluation trigger */}
                              <button
                                type="button"
                                onClick={() => onOpenJobiaAIEvaluation(app)}
                                className="p-1 rounded text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                title={
                                  language === 'en'
                                    ? 'Jobia AI Evaluation & HR Questions'
                                    : language === 'ru'
                                    ? 'Оценка Jobia AI и вопросы для HR'
                                    : 'Jobia AI Dəyərləndirməsi və HR Sualları'
                                }
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>

                              {/* View detail trigger */}
                              <button
                                type="button"
                                onClick={() => onOpenApplicantModal(app)}
                                className="p-1 rounded text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                title={
                                  language === 'en'
                                    ? 'View full candidate application'
                                    : language === 'ru'
                                    ? 'Просмотреть заявку целиком'
                                    : 'Tam müraciətə baxış'
                                }
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Backward Status shift arrow */}
                              {prevStatus && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateApplicationStatus(app.id, prevStatus)}
                                  className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title={
                                    language === 'en'
                                      ? `Move to previous stage (${getLocalizedApplicationStatus(prevStatus, language)})`
                                      : language === 'ru'
                                      ? `Переместить на предыдущий этап (${getLocalizedApplicationStatus(prevStatus, language)})`
                                      : `Əvvəlki mərhələyə keçir (${prevStatus})`
                                  }
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Forward Status shift arrow */}
                              {nextStatus && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateApplicationStatus(app.id, nextStatus)}
                                  className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-bold cursor-pointer"
                                  title={
                                    language === 'en'
                                      ? `Move to next stage (${getLocalizedApplicationStatus(nextStatus, language)})`
                                      : language === 'ru'
                                      ? `Переместить на следующий этап (${getLocalizedApplicationStatus(nextStatus, language)})`
                                      : `Növbəti mərhələyə keçir (${nextStatus})`
                                  }
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
