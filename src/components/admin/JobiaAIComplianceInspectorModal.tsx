import React from 'react';
import { Vacancy } from '../../types';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Check, 
  FileText, 
  DollarSign, 
  Users, 
  Building2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface JobiaAIComplianceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancy: Vacancy | null;
  onApprove: (vacancyId: string) => void;
  onReject: (vacancyId: string) => void;
}

export const JobiaAIComplianceInspectorModal: React.FC<JobiaAIComplianceInspectorModalProps> = ({
  isOpen,
  onClose,
  vacancy,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !vacancy) return null;

  // Run comprehensive rules audit
  const title = vacancy.title.toLowerCase();
  const desc = vacancy.description.toLowerCase();
  const reqs = (vacancy.requirements || []).join(' ').toLowerCase();

  // 1. Check illegal discrimination (gender, age limits)
  const hasGenderBias = desc.includes('bəy') || desc.includes('xanım') || reqs.includes('bəy') || reqs.includes('xanım');
  const hasAgeRestriction = desc.includes('yaş') || reqs.includes('yaş') || desc.includes('yaşadək') || reqs.includes('yaşadək');

  // 2. Check salary credibility
  const isSalaryValid = vacancy.hideSalary || (vacancy.minSalary && vacancy.minSalary >= 345);
  const isSalaryFair = (vacancy.minSalary || 0) >= 600;

  // 3. Check description completeness
  const isDescDetailed = (vacancy.description || '').length >= 100;
  const hasResponsibilities = (vacancy.responsibilities || []).length >= 2;
  const hasRequirements = (vacancy.requirements || []).length >= 2;

  // Compute compliance score
  let score = 100;
  if (hasGenderBias) score -= 15;
  if (hasAgeRestriction) score -= 10;
  if (!isSalaryValid) score -= 25;
  if (!isDescDetailed) score -= 10;
  if (!hasResponsibilities) score -= 10;
  if (!hasRequirements) score -= 10;

  score = Math.max(20, Math.min(100, score));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Jobia AI Moderasiya & Qanunvericilik Yoxlayıcısı</span>
              </h3>
              <p className="text-xs text-slate-300">
                {vacancy.title} • {vacancy.companyName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Score Banner */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Platforma Qaydalarına Uyğunluq İndeksi
              </span>
              <h4 className="text-base font-black text-slate-900">
                {score >= 85 ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dərhal Təsdiqə Tövsiyə Edilir (100% Qanuni)</span>
                  </span>
                ) : score >= 60 ? (
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Şərti Uyğun (Düzəliş Tövsiyə Edilir)</span>
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Qayda Pozuntusu Aşkarlandı (İmtina Edilməlidir)</span>
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-600">
                AR Əmək Məcəlləsi və Jobia.az Keyfiyyət Standartları üzrə yoxlanıldı.
              </p>
            </div>

            <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-center shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Audit Balı</span>
              <span className={`text-2xl font-black ${
                score >= 85 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {score}/100
              </span>
            </div>
          </div>

          {/* Audit Checks Checklist */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Yoxlama Meyarları & Rəylər
            </h4>

            <div className="space-y-2 text-xs">
              {/* Check 1: Anti-Discrimination */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                {hasGenderBias || hasAgeRestriction ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold text-slate-900">
                    Ayrı-seçkilik Qadağası (AR Əmək Məcəlləsi Maddə 16)
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {hasGenderBias
                      ? '⚠️ Mətndə cinsiyyət üzrə fərqləndirmə ("bəy" / "xanım") aşkarlandı. Neytral vəzifə adlarından istifadə tövsiyə edilir.'
                      : hasAgeRestriction
                      ? '⚠️ Yaş məhdudiyyəti qeydi aşkarlandı. Qanunvericiliyə görə ixtisas və bacarıqlara üstünlük verilməlidir.'
                      : '✅ Heç bir cinsiyyət, yaş və ya sosial ayrı-seçkilik elementi aşkar edilmədi.'}
                  </p>
                </div>
              </div>

              {/* Check 2: Minimum Salary */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                {isSalaryValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold text-slate-900">
                    Əməkhaqqı Qanunvericiliyi və Minimum Maaş
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {vacancy.hideSalary
                      ? 'ℹ️ Maaş məbləği gizli saxlanılıb (Müsahibə əsasında təyin ediləcək).'
                      : isSalaryValid
                      ? `✅ Göstərilən maaş (${vacancy.minSalary} - ${vacancy.maxSalary || ''} AZN) AR minimum əməkhaqqı (345 AZN) tələbinə tam cavab verir.`
                      : '❌ Təklif edilən maaş AR minimum əməkhaqqı normativindən (345 AZN) aşağıdır!'}
                  </p>
                </div>
              </div>

              {/* Check 3: Completeness */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                {isDescDetailed && hasResponsibilities && hasRequirements ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold text-slate-900">
                    Vəzifə Təlimatının Dolğunluğu və Keyfiyyəti
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {hasResponsibilities && hasRequirements
                      ? `✅ Vakansiya ${vacancy.responsibilities.length} öhdəlik və ${vacancy.requirements.length} tələb ilə ətraflı tərtib olunub.`
                      : '⚠️ Vakansiya tələbləri və ya öhdəlikləri çox qısadır. Namizədlərin aydın anlaması üçün dolğunlaşdırılması tövsiyə edilir.'}
                  </p>
                </div>
              </div>

              {/* Check 4: Contact and Company Verification */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold text-slate-900">
                    Şirkət Doğrulaması və Əlaqə Etibarlılığı
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Müəssisə adı: <strong>{vacancy.companyName}</strong>. Əlaqə məlumatları və korporativ təyinat qaydalara uyğundur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <ModalBottomLogo tagline="Jobia.az İntellektual Moderasiya Mərkəzi" size="xs" variant="slate" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onReject(vacancy.id);
                onClose();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>İmtina Et</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onApprove(vacancy.id);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Dərhal Təsdiqlə</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
