import React from 'react';
import { Vacancy } from '../../types';
import { 
  X, 
  ArrowRightLeft, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Zap, 
  MessageCircle, 
  Send,
  Building2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { calculateGrossToNet } from '../../services/salaryCalculator';
import { useLanguage } from '../../context/LanguageContext';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface JobComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJobs: Vacancy[];
  onRemoveJob: (jobId: string) => void;
  onSelectJob: (job: Vacancy) => void;
  onQuickApply?: (job: Vacancy) => void;
  onOpenWhatsApp?: (job: Vacancy) => void;
}

export const JobComparisonModal: React.FC<JobComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedJobs,
  onRemoveJob,
  onSelectJob,
  onQuickApply,
  onOpenWhatsApp,
}) => {
  const { language } = useLanguage();

  if (!isOpen || selectedJobs.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {language === 'en'
                    ? 'Side-by-Side Job Comparison'
                    : language === 'ru'
                    ? 'Сравнение вакансий бок о бок'
                    : 'Vakansiyaların Yan-yana Müqayisəsi'}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {selectedJobs.length} {language === 'en' ? 'jobs' : language === 'ru' ? 'вакансии' : 'vakansiya'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'en'
                  ? 'Compare gross and net salaries, work modes, and perks at a glance'
                  : language === 'ru'
                  ? 'Сравните оклад, налоги на руки, график и условия в одной таблице'
                  : 'Gross və net maaşları, iş rejimini və şirkət təminatlarını birbaşa müqayisə edin'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Comparison Grid */}
        <div className="overflow-x-auto overflow-y-auto flex-1 p-4 sm:p-6 text-xs text-slate-700">
          <div 
            className="grid gap-4 sm:gap-6 min-w-[620px]"
            style={{
              gridTemplateColumns: `repeat(${selectedJobs.length}, minmax(220px, 1fr))`
            }}
          >
            {selectedJobs.map((job) => {
              // Net salary estimations
              const minGross = job.minSalary || 0;
              const maxGross = job.maxSalary || 0;
              const avgGross = maxGross ? (minGross + maxGross) / 2 : minGross;

              const netMin = minGross > 0 ? Math.round(calculateGrossToNet(minGross, { sector: 'private_non_oil', taxBenefit: 0 }).net) : 0;
              const netMax = maxGross > 0 ? Math.round(calculateGrossToNet(maxGross, { sector: 'private_non_oil', taxBenefit: 0 }).net) : 0;

              return (
                <div
                  key={job.id}
                  className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-blue-400 transition-colors"
                >
                  {/* Job Head */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <img
                        src={job.companyLogo}
                        alt={job.companyName}
                        className="w-12 h-12 rounded-xl object-cover bg-white p-0.5 border border-slate-200 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveJob(job.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Müqayisədən çıxar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.companyName}</span>
                      {job.companyVerified && (
                        <span title="Təsdiqlənmiş Şirkət">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Criteria 1: Salary (Gross vs Net) */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {language === 'en' ? 'Salary & Net Payout' : language === 'ru' ? 'Оклад и Чистыми (Net)' : 'Maaş və Net (Xalis)'}
                    </span>
                    {job.hideSalary ? (
                      <span className="text-xs font-semibold text-slate-500">Müsahibə əsasında</span>
                    ) : (
                      <>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm tabular-nums">
                          {job.minSalary} - {job.maxSalary} {job.currency}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">(Gross)</span>
                        </div>
                        {netMin > 0 && (
                          <div className="text-[11px] font-semibold text-emerald-700 tabular-nums flex items-center gap-1 pt-1 border-t border-slate-100">
                            <span>~{netMin.toLocaleString()}{netMax ? ` - ${netMax.toLocaleString()}` : ''} {job.currency}</span>
                            <span className="text-[10px] text-emerald-800 font-normal">net</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Criteria 2: Work Mode & Location */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {language === 'en' ? 'Format & Location' : language === 'ru' ? 'Формат и Город' : 'Rejim və Şəhər'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.employmentType}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {job.category}
                    </div>
                  </div>

                  {/* Criteria 3: Experience */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {language === 'en' ? 'Experience Required' : language === 'ru' ? 'Требуемый опыт' : 'Tələb Olunan Təcrübə'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.experienceLevel}</span>
                    </div>
                  </div>

                  {/* Criteria 4: Required Skills */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5 shadow-2xs flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {language === 'en' ? 'Key Skills' : language === 'ru' ? 'Ключевые навыки' : 'Əsas Bacarıqlar'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {job.skills && job.skills.length > 0 ? (
                        job.skills.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="text-[10px] font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[11px]">Qeyd edilməyib</span>
                      )}
                    </div>
                  </div>

                  {/* Criteria 5: Perks & Benefits */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {language === 'en' ? 'Benefits & Perks' : language === 'ru' ? 'Условия и льготы' : 'Təminatlar və Üstünlüklər'}
                    </span>
                    {job.benefits && job.benefits.length > 0 ? (
                      <div className="space-y-1">
                        {job.benefits.slice(0, 3).map((ben, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{ben}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Standart paket</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-1.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectJob(job);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span>{language === 'en' ? 'View Details' : language === 'ru' ? 'Подробнее' : 'Ətraflı Bax'}</span>
                    </button>

                    {onQuickApply && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onQuickApply(job);
                        }}
                        className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{language === 'en' ? '1-Click Apply' : language === 'ru' ? 'Отклик в 1 клик' : '1-Kliklə Müraciət'}</span>
                      </button>
                    )}

                    {onOpenWhatsApp && (
                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp(job)}
                        className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom Logo */}
        <ModalBottomLogo
          tagline={
            language === 'en'
              ? 'Jobia.az Objective Career Comparison'
              : language === 'ru'
              ? 'Jobia.az Объективное сравнение вакансий'
              : 'Jobia.az Şəffaf və Obyektiv Vakansiya Müqayisəsi'
          }
          variant="slate"
        />
      </div>
    </div>
  );
};
