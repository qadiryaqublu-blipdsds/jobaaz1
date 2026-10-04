import React from 'react';
import { Vacancy } from '../../types';
import { ArrowRightLeft, X, Trash2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface JobComparisonDockProps {
  selectedJobs: Vacancy[];
  onRemoveJob: (jobId: string) => void;
  onClearAll: () => void;
  onOpenModal: () => void;
}

export const JobComparisonDock: React.FC<JobComparisonDockProps> = ({
  selectedJobs,
  onRemoveJob,
  onClearAll,
  onOpenModal,
}) => {
  const { language } = useLanguage();

  if (selectedJobs.length === 0) return null;

  return (
    <aside
      aria-label={language === 'en' ? 'Job comparison tray' : language === 'ru' ? 'Панель сравнения вакансий' : 'Vakansiya müqayisə paneli'}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 p-2.5 sm:p-3 animate-fade-in"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: Selected Vacancies */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full w-full sm:w-auto py-0.5">
          <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {selectedJobs.length}/3 {language === 'en' ? 'selected' : language === 'ru' ? 'выбрано' : 'seçilib'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {selectedJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 bg-slate-800 border border-slate-700 rounded-xl text-xs shrink-0 max-w-[160px] sm:max-w-[200px]"
              >
                <img
                  src={job.companyLogo}
                  alt={job.companyName}
                  className="w-5 h-5 rounded-md object-cover bg-white shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="truncate font-medium text-slate-200 text-[11px]" title={job.title}>
                  {job.title}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveJob(job.id)}
                  className="text-slate-400 hover:text-white p-0.5 ml-auto cursor-pointer"
                  title="Çıxar"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onClearAll}
            className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            {language === 'en' ? 'Clear' : language === 'ru' ? 'Очистить' : 'Təmizlə'}
          </button>

          <button
            type="button"
            onClick={onOpenModal}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>
              {language === 'en'
                ? `Compare (${selectedJobs.length})`
                : language === 'ru'
                ? `Сравнить (${selectedJobs.length})`
                : `Müqayisə Et (${selectedJobs.length})`}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
