import React, { useState } from 'react';
import { JobiaLogo } from './JobiaLogo';
import { UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LegalInfoModal, LegalModalType } from './common/LegalInfoModal';
import { 
  Briefcase, 
  Sparkles, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Heart, 
  CheckCircle, 
  MessageSquare,
  Building2,
  Lock,
  Zap,
  Calculator,
  Palmtree,
  FileCheck,
  Scale,
  Phone,
  Mail,
  MapPin,
  Globe,
  Map as MapIcon,
  ShieldAlert,
  UserCheck,
  HelpCircle
} from 'lucide-react';

interface FooterProps {
  currentRole: UserRole;
  onNavigateCandidateTab?: (tab: 'jobs' | 'nearby-map' | 'my-applications' | 'salary-trends' | 'salary-calculator' | 'vacation-calculator' | 'calculia' | 'google-chat') => void;
  onRoleChange?: (role: UserRole) => void;
  onOpenPricing?: () => void;
  onOpenIntroTour?: () => void;
  onOpenHelpContact?: (initialTab?: 'faq' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentRole,
  onNavigateCandidateTab,
  onRoleChange,
  onOpenPricing,
  onOpenIntroTour,
  onOpenHelpContact,
}) => {
  const { dict, brandAcronym, brandAcronymFull, language } = useLanguage();
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'cookies' | 'security' | 'compliance' | null>(null);

  return (
    <footer id="jobia-main-footer" className="w-full max-w-full overflow-hidden bg-white border-t border-slate-200 mt-12 text-slate-700">
      {/* Main Footer Links & Structured Columns */}
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Jobia.az (About, Legal, Credentials) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <JobiaLogo size="sm" withSubtitle={true} subtitle="Job Intelligence & Automation" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'en' 
                ? 'Jobia.az — Modern employment platform connecting job seekers with leading employers across Azerbaijan.'
                : language === 'ru'
                ? 'Jobia.az — современная платформа, соединяющая соискателей с ведущими компаниями на рынке труда Азербайджана.'
                : 'Jobia.az — Azərbaycanın rəqəmsal əmək bazarında iş axtaranlar ilə aparıcı şirkətləri birləşdirən müasir platformadır.'}
            </p>
            <div className="pt-1 text-xs text-slate-600 font-medium space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{language === 'en' ? 'Daily Updated Official Jobs' : language === 'ru' ? 'Ежедневно обновляемые вакансии' : 'Gündəlik Yenilənən Rəsmi Vakansiyalar'}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {brandAcronymFull}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{language === 'en' ? 'TIN' : language === 'ru' ? 'ИНН' : 'VÖEN'}: <strong>1406283921</strong> ({language === 'en' ? 'State Registration' : language === 'ru' ? 'Госрегистрация' : 'Dövlət Qeydiyyatı'})</span>
              </div>
            </div>
            <div className="pt-2">
              <LanguageSwitcher variant="buttons" />
            </div>
          </div>

          {/* Col 2: İş Axtaranlar (For Candidates) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              {language === 'en' ? 'Job Seekers' : language === 'ru' ? 'Соискателям' : 'İş Axtaranlar'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('jobs');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dict.nav.jobs}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('nearby-map');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-semibold text-blue-600"
                >
                  <MapIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{dict.nav.nearbyJobs || (language === 'en' ? 'Jobs on Map' : language === 'ru' ? 'Поиск на карте' : 'Xəritə ilə Axtarış')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('salary-trends');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dict.nav.salaryTrends}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="footer-nav-salary-calc"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('salary-calculator');
                  }}
                  className="hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-bold text-slate-700"
                >
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'en' ? 'Calculate Salary' : language === 'ru' ? 'Рассчитать зарплату' : 'Maaşını hesabla'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="footer-nav-vacation-calc"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('vacation-calculator');
                  }}
                  className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-bold text-slate-700"
                >
                  <Palmtree className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'en' ? 'Calculate Vacation' : language === 'ru' ? 'Рассчитать отпуск' : 'Məzuniyyətini hesabla'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: İşəgötürənlər (For Employers) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              {language === 'en' ? 'Employers' : language === 'ru' ? 'Работодателям' : 'İşəgötürənlər'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'en' ? 'Employer Cabinet' : language === 'ru' ? 'Кабинет работодателя' : 'İşəgötürən Kabineti'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-semibold text-blue-600"
                >
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'en' ? 'Post a Vacancy' : language === 'ru' ? 'Разместить вакансию' : 'Vakansiya Yerləşdir'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'en' ? 'Company Profile & Verification' : language === 'ru' ? 'Профиль компании и верификация' : 'Şirkət Profili & Verifikasiya'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'en' ? 'Official Job Offer Portal' : language === 'ru' ? 'Официальный портал офферов' : 'Rəsmi İş Təklifi (Job Offer) Portalı'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPricing) onOpenPricing();
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'en' ? 'Recruiting Analytics & Pricing' : language === 'ru' ? 'Аналитика рекрутинга и цены' : 'Recruiting Analytics & Qiymətlər'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('admin');
                  }}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-semibold text-slate-700"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{dict.nav.admin}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Hüquqi & Əlaqə */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              {language === 'en' ? 'Legal & Security' : language === 'ru' ? 'Правовая информация' : 'Hüquqi & Təhlükəsizlik'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('privacy')}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'en' ? 'Privacy Policy' : language === 'ru' ? 'Политика конфиденциальности' : 'Məxfilik Siyasəti (Privacy Policy)'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('terms')}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'en' ? 'Terms of Service' : language === 'ru' ? 'Пользовательское соглашение' : 'İstifadəçi Müqaviləsi (Terms of Service)'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('cookies')}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'en' ? 'Cookie Policy' : language === 'ru' ? 'Политика файлов cookie' : 'Kuki (Cookie) Siyasəti'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('security')}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'en' ? 'Security & SSL Standards' : language === 'ru' ? 'Безопасность и стандарты SSL' : 'Təhlükəsizlik & SSL Standartları'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('compliance')}
                  className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-semibold text-slate-800"
                >
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'en' ? 'Labor Code Compliance' : language === 'ru' ? 'Соответствие трудовому кодексу АР' : 'AR Əmək Məcəlləsi Uyğunluğu'}</span>
                </button>
              </li>
              {onOpenHelpContact && (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => onOpenHelpContact('faq')}
                      className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-semibold text-blue-700"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>{language === 'en' ? 'FAQ & Help Center' : language === 'ru' ? 'Частые вопросы (FAQ)' : 'Tez-tez Verilən Suallar (FAQ)'}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onOpenHelpContact('contact')}
                      className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer text-left font-semibold text-indigo-700"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'en' ? 'Contact & Feedback' : language === 'ru' ? 'Связаться с нами' : 'Bizimlə Əlaqə & Dəstək'}</span>
                    </button>
                  </li>
                </>
              )}
              <li className="pt-2 text-slate-500 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <a href="mailto:support@jobia.az" className="hover:text-blue-600 font-medium">support@jobia.az</a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>+994 (12) 404-18-18</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{language === 'en' ? 'Baku, Azure Business Center' : language === 'ru' ? 'Баку, Azure Бизнес-центр' : 'Bakı, Azure Biznes Mərkəzi'}</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Slogan, Jobia Logo & Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <JobiaLogo size="xs" withSubtitle={true} subtitle="Job Intelligence & Automation" showDotPing={true} />
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>{language === 'en' ? '© 2026 All rights reserved.' : language === 'ru' ? '© 2026 Все права защищены.' : '© 2026 Bütün hüquqlar qorunur.'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
            <span>{dict.brand.slogan || (language === 'en' ? "Azerbaijan's Smartest Job & Career Platform" : language === 'ru' ? 'Самая умная платформа вакансий и карьеры в Азербайджане' : 'Azərbaycanın Ən Ağıllı Vakansiya və Karyera Platforması')}</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline ml-0.5" />
          </div>
        </div>
      </div>

      {/* Legal Info Modals */}
      <LegalInfoModal
        type={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </footer>
  );
};

export default Footer;
