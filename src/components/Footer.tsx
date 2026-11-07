import React, { useState } from 'react';
import { JobiaLogo } from './JobiaLogo';
import { UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LegalInfoModal } from './common/LegalInfoModal';
import { BrandCoverModal } from './common/BrandCoverModal';
import { 
  Mail, 
  Send, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Check, 
  Sparkles,
  Share2
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
  const { language } = useLanguage();
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'cookies' | 'security' | 'compliance' | null>(null);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitted(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubmitted(false);
    }, 2800);
  };

  return (
    <footer id="jobia-main-footer" className="relative w-full max-w-full overflow-hidden bg-white border-t border-slate-200/80 mt-16 text-slate-700">
      {/* GIANT FAINT WATERMARK "JOBIA" BACKGROUND (Matching prototype image_6c47657d.png) */}
      <div 
        className="pointer-events-none select-none absolute bottom-0 right-0 sm:right-6 lg:right-16 text-[110px] sm:text-[180px] lg:text-[240px] font-black text-[#00a859]/[0.05] tracking-widest leading-none z-0"
        aria-hidden="true"
        style={{ fontFamily: "'Onest', 'Inter', sans-serif" }}
      >
        JOBIA
      </div>

      <div className="relative z-10 w-full max-w-full px-5 sm:px-8 lg:px-12 xl:px-16 pt-12 pb-8">
        {/* 4 STRUCTURED COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* COLUMN 1: LOGO, TAGLINE, NEWSLETTER CAPSULE & SOCIAL ICONS (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Logo */}
            <div>
              <JobiaLogo size="md" />
            </div>

            {/* Tagline */}
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
              Doğru işi və doğru istedadı bir araya gətirən ağıllı karyera platforması.
            </p>

            {/* Support / Newsletter Title */}
            <div className="pt-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00a859]">
                DƏSTƏK LAZIMDIR?
              </span>

              {/* Newsletter Capsule Input */}
              <form onSubmit={handleNewsletterSubmit} className="mt-2 max-w-sm">
                <div className="flex items-center bg-white border border-slate-200/90 rounded-full p-1 pl-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#00a859] focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="E-poçt ünvanınız"
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none pr-1"
                    disabled={newsletterSubmitted}
                  />
                  <button
                    type="submit"
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs ${
                      newsletterSubmitted 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-[#00a859] hover:bg-[#00924d] text-white active:scale-90'
                    }`}
                    title="Göndər"
                  >
                    {newsletterSubmitted ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {newsletterSubmitted && (
                  <p className="text-[11px] font-bold text-[#00a859] mt-1.5 pl-3">
                    Təşəkkür edirik! Dəstək komandamız tezliklə sizinlə əlaqə saxlayacaq.
                  </p>
                )}
              </form>
            </div>

            {/* Social Media Icons */}
            <div className="pt-2 flex items-center gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <span className="text-xs font-semibold text-slate-500 pl-1">
                Bizi izləyin
              </span>
            </div>
          </div>

          {/* COLUMN 2: NAMİZƏDLƏR (lg:col-span-2 or 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#00a859]">
              NAMİZƏDLƏR
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('jobs');
                  }}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  Vakansiyalar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('nearby-map');
                  }}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  Xəritədə vakansiyalar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('salary-calculator');
                  }}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  Maaş kalkulyatoru
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('candidate');
                    if (onNavigateCandidateTab) onNavigateCandidateTab('vacation-calculator');
                  }}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  Məzuniyyət kalkulyatoru
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: ŞİRKƏTLƏR (lg:col-span-2 or 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#00a859]">
              ŞİRKƏTLƏR
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  İşəgötürən kabineti
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  Vakansiya yerləşdir
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onRoleChange) onRoleChange('business');
                  }}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  Namizəd bazası
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPricing) onOpenPricing();
                  }}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  Planlar və qiymətlər
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: DƏSTƏK (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#00a859]">
              DƏSTƏK
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenIntroTour) onOpenIntroTour();
                  }}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  Platformanı tanı
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenHelpContact) onOpenHelpContact('faq');
                  }}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  Tez-tez verilən suallar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenHelpContact) onOpenHelpContact('contact');
                  }}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  Bizimlə əlaqə
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('compliance')}
                  className="hover:text-slate-950 transition-colors cursor-pointer text-left"
                >
                  Əmək məcəlləsinə uyğunluq
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM LEGAL & COPYRIGHT ROW (Matching prototype image_6c47657d.png) */}
        <div className="mt-12 pt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <div>
            © 2026 Jobia.az. Bütün hüquqlar qorunur.
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-500">
            <button
              type="button"
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Məxfilik
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              İstifadə qaydaları
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('cookies')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Kuki
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('security')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Təhlükəsizlik
            </button>
            <button
              type="button"
              onClick={() => setIsCoverModalOpen(true)}
              className="hover:text-[#00a859] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              title="Rəsmi Üz Qabığı Bələdçisi"
            >
              <Share2 className="w-3 h-3 text-[#00a859]" />
              <span>Üz Qabığı</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legal Info Modals */}
      <LegalInfoModal
        type={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />

      {/* Official Brand Cover & OpenGraph Modal */}
      <BrandCoverModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;
