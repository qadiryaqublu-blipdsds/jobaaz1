import React from 'react';
import { Sparkles, X, CheckCircle2, ShieldCheck, Zap, ArrowRight, Lock } from 'lucide-react';
import { PlanTier, UserRole } from '../../types';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { useLanguage } from '../../context/LanguageContext';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: PlanTier | string;
  featureTitle: string;
  featureDescription?: string;
  userRole: UserRole;
  onUpgradeClick: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  requiredTier,
  featureTitle,
  featureDescription,
  userRole,
  onUpgradeClick,
}) => {
  const { language } = useLanguage();
  if (!isOpen) return null;

  const isEn = language === 'en';
  const isRu = language === 'ru';
  const isEmployer = userRole === 'business';

  const proFeatures = isEmployer
    ? isEn
      ? [
          '5 Active Job Postings and Unlimited Candidate Inflow',
          'AI Candidate Match Score and Keyword Deep-Dive',
          'AI Interview Summary and Evaluation Breakdown',
          'Official AI Job Offer Letters & Candidate Portal',
          'A4 Export & E-Signature Audit Trail',
        ]
      : isRu
      ? [
          '5 активных вакансий и неограниченный приток кандидатов',
          'AI-оценка соответствия кандидатов и ключевые слова',
          'AI-резюме собеседований и оценка навыков',
          'Официальные AI-офферы (Job Offer) и портал кандидата',
          'Экспорт в формате А4 и трекинг электронной подписи',
        ]
      : [
          '5 Aktiv Vakansiya Elanı və Limitsiz Namizəd Qəbulu',
          'AI Namizəd Uyğunluq Skoru və Açar Söz Analizi',
          'AI Müsahibə Xülasəsi və Dəyərləndirmə Hesabatı',
          'Rəsmi AI Job Offer (İş Təklifi) və Namizəd Portalı',
          'A4 formatda Rəsmi PDF İxracı və E-İmza İzləmə',
        ]
    : isEn
    ? [
        '4 Modern Premium CV Templates (Emerald, Corporate, Minimalist, Tech)',
        'AI ATS CV Analysis, Match Score, and Improvement Tips',
        'AI Interview Simulator with Tailored Q&A Practice',
        '"Premium Candidate" Badge in Employer Inboxes',
        'Salary Trends and Corporate Insights Analytics',
      ]
    : isRu
    ? [
        '4 современных премиум-шаблона резюме (Изумруд, Корпоративный, Минимал, Тех)',
        'AI ATS анализ резюме, баллы соответствия и рекомендации',
        'AI-симулятор собеседований с индивидуальными вопросами',
        'Бейдж "Премиум кандидат" в списке работодателя',
        'Тренды зарплат и аналитика компаний',
      ]
    : [
        '4 Müasir Premium CV Şablonu (Zümrüd, Korporativ, Minimalist, Tech)',
        'AI ATS CV Analizi, Uyğunluq Skoru və Təkmilləşdirmə Məsləhətləri',
        'AI Müsahibə Simulyatoru və Vakansiyaya Özəl Sual-Cavablar',
        'İşəgötürən müraciət siyahısında "Premium Namizəd" Nişanı',
        'Maaş Trendləri və Şirkət İnsights Analitikası',
      ];

  const defaultDesc = isEn
    ? `This feature is included in the ${requiredTier} plan. Please upgrade your subscription to unlock full access.`
    : isRu
    ? `Эта функция входит в тариф ${requiredTier}. Повысьте свой план для получения полного доступа.`
    : `Bu funksiya ${requiredTier} planına daxildir. Zəhmət olmasa planınızı yüksəldərək tam girişi aktivləşdirin.`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with decorative badge */}
        <div className="p-6 bg-gradient-to-br from-[#0b1b2b] via-[#0d2238] to-[#0b1b2b] text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#00a859]/20 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#00a859]/20 text-[#00a859] border border-[#00a859]/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>{requiredTier} {isEn ? 'Plan Feature' : isRu ? 'Функция тарифа' : 'Plan İmkanı'}</span>
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {featureTitle}
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            {featureDescription || defaultDesc}
          </p>
        </div>

        {/* Feature List */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            {isEn ? `Included in ${requiredTier} Plan:` : isRu ? `Преимущества тарифа ${requiredTier}:` : `${requiredTier} Planına Daxil Olan Üstünlüklər:`}
          </h3>

          <ul className="space-y-2.5">
            {proFeatures.map((f, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <div className="w-4 h-4 rounded-full bg-[#00a859]/10 text-[#00a859] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">{f}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block">{isEn ? 'Starts at:' : isRu ? 'Стоимость от:' : 'Aylıq cəmi:'}</span>
              <span className="text-lg font-black text-[#0b1b2b]">
                {isEmployer ? '39 AZN' : '7 AZN'}{' '}
                <span className="text-xs font-normal text-slate-500">{isEn ? '/mo' : isRu ? '/мес' : '/aydan'}</span>
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onUpgradeClick();
              }}
              className="px-5 py-2.5 bg-[#00a859] hover:bg-[#00914c] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isEn ? `Upgrade to ${requiredTier}` : isRu ? `Перейти на ${requiredTier}` : `${requiredTier}-a Keç`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic moving Jobia Logo at bottom */}
        <ModalBottomLogo
          tagline={isEn ? 'Jobia.az VIP Plans & Exclusive Features' : isRu ? 'Jobia.az VIP Планы и возможности' : 'Jobia.az VIP Plan və Xüsusiyyətlər'}
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
