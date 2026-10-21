import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  Layers, 
  BarChart3, 
  Bot, 
  FileText, 
  ShieldCheck, 
  Download, 
  Calculator, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Check, 
  ExternalLink,
  ChevronRight,
  Zap,
  Building2,
  Users,
  Award,
  Globe
} from 'lucide-react';
import { JobiaLogo } from '../JobiaLogo';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { useLanguage } from '../../context/LanguageContext';

export interface PlatformEcosystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string, role?: 'candidate' | 'business') => void;
}

export const PlatformEcosystemModal: React.FC<PlatformEcosystemModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'hr-enterprise' | 'candidate-ai' | 'finance-legal'>('all');

  if (!isOpen) return null;

  const handleAction = (tab: string, role?: 'candidate' | 'business') => {
    if (onNavigateToTab) {
      onNavigateToTab(tab, role);
    }
    onClose();
  };

  const capabilities = [
    {
      id: 'time-to-fill',
      category: 'hr-enterprise',
      title: 'Time to Fill / Time to Hire Analitikası',
      badge: 'Enterprise HR',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Clock,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      summary: 'Vakansiyanın açılmasından iş təklifinin qəbuluna qədər hər günün dəqiq uçotu, orta vakansiya dolma müddəti və gecikmə xəbərdarlıqları.',
      stats: 'Median: 18.4 gün • Bazar norması: 24 gün',
      features: [
        'Vakansiyanın elanından ilk namizədə qədər keçən saatlar',
        'Müsahibə mərhələləri üzrə xərclənən günlər (Time in Stage)',
        'Sahə və vəzifə səviyyələri üzrə gecikmə səbəblərinin auditi',
        'Recruiting xərcləri (Cost per Hire) və büdcə qənaəti'
      ],
      actionTab: 'analytics',
      actionRole: 'business' as const,
      actionText: 'HR Analitikasına Bax',
    },
    {
      id: 'recruitment-funnel',
      category: 'hr-enterprise',
      title: '11 Mərhələli Recruitment Funnel',
      badge: 'ATS Workflow',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      icon: Layers,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      summary: 'İş elanından sınaq müddətinin sonuna qədər namizəd axınının hər pilləsini idarə edən tam rəqəmsal konversiya boru xətti.',
      stats: '11 Faza: Sourcing ➔ Sınaq Müddəti',
      features: [
        '1. Sourcing & Elan ➔ 2. İlkin Skrininq ➔ 3. AI Skorinq',
        '4. İR Müsahibə ➔ 5. Texniki İmtahan ➔ 6. Komplayens & Referans',
        '7. Rəhbər Müsahibəsi ➔ 8. Rəsmi Job Offer ➔ 9. Pre-onboarding',
        '10. Rəsmi İşə Qəbul ➔ 11. Sınaq Müddəti Monitorinqi'
      ],
      actionTab: 'applicants',
      actionRole: 'business' as const,
      actionText: 'Funnel və Namizədlər',
    },
    {
      id: 'market-benchmarks',
      category: 'hr-enterprise',
      title: 'Bazar Benchmarkları & Əmək Bazarı Analitikası',
      badge: 'Market Intel',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: BarChart3,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      summary: 'Bakı və regionlar üzrə sahəvi median maaşlar, ən çox tələb olunan bacarıqlar və işəgötürənlərin real bazar rəqabətlilik indeksi.',
      stats: '450+ Şirkət & 12 Əsas Sahə',
      features: [
        'Bankçılıq, İT, Pərakəndə və Logistika sektorları üzrə median maaşlar',
        'Top 10 ən çox axtarılan texnoloji və peşəkar bacarıq',
        'Təsdiqlənmiş işəgötürən verifikasiyası və rəqabət hesabatı',
        'Rüblük və illik əmək bazarı dinamikası qrafikləri'
      ],
      actionTab: 'salary-trends',
      actionRole: 'candidate' as const,
      actionText: 'Bazar Analitikasına Keç',
    },
    {
      id: 'ai-interview',
      category: 'candidate-ai',
      title: 'AI Müsahibə Dəyərləndirməsi & Məşqi',
      badge: 'AI Powered',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: Bot,
      iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
      summary: 'Real-vaxt səsli və mətnli süni intellekt müsahibəçisi ilə namizədin STAR metodologiyası üzrə 100 ballıq obyektiv dəyərləndirilməsi.',
      stats: 'STAR Metodu • Səsli & Mətnli Canlı Dialoq',
      features: [
        'Vakansiyanın tələblərinə uyğun fərdiləşdirilmiş suallar',
        'Nitq aydınlığı, texniki bilik və problem həlletmə xalları',
        'Namizəd üçün ətraflı güclü və zəif tərəflər hesabatı',
        'İşəgötürənlər üçün vahid AI Namizəd İmtahan protokolu'
      ],
      actionTab: 'practice-interview',
      actionRole: 'candidate' as const,
      actionText: 'Müsahibə Məşqinə Başla',
    },
    {
      id: 'job-offer-workflow',
      category: 'hr-enterprise',
      title: 'AI Job Offer Tərtibatı & 1 Kliklə E-poçt Göndərişi',
      badge: 'Smart Workflow',
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
      icon: FileText,
      iconColor: 'text-rose-600 bg-rose-50 border-rose-200',
      summary: 'AR Əmək Məcəlləsinə tam uyğun ikidilli (AZ / EN) rəsmi iş təklifləri, bonus və sınaq müddəti şərtləri ilə 1 kliklə avtomatlaşdırılmış SMTP göndərişi.',
      stats: '1-Kliklə Göndəriş • Audit Qeydiyyatı',
      features: [
        'Rəsmi korporativ şablonlar (İdarə Heyəti, İT, Mütəxəssis)',
        'Net və Gross əməkhaqqı, bonuslar və tibbi sığorta təfərrüatları',
        'Namizədin e-poçtuna birbaşa təhlükəsiz keçid və PDF əlavəsi',
        'Təklifin baxılma, qəbul və ya rədd edilmə statusunun canlı izlənməsi'
      ],
      actionTab: 'offers',
      actionRole: 'business' as const,
      actionText: 'Job Offer Sistemini Aç',
    },
    {
      id: 'secure-candidate-portal',
      category: 'candidate-ai',
      title: 'Təhlükəsiz Namizəd Portalı & Rəqəmsal İmza',
      badge: 'Security & Legal',
      badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
      icon: ShieldCheck,
      iconColor: 'text-teal-600 bg-teal-50 border-teal-200',
      summary: 'Namizədlərə ünvanlanmış iş təkliflərinin təhlükəsiz şifrələnmiş portaldan onlayn nəzərdən keçirilməsi, qəbulu və ya rəsmi rəyi.',
      stats: '256-bit SSL • Rəsmi Təsdiq Protokolu',
      features: [
        'Unikal və təhlükəsiz tokenlə qorunan təklif linkləri',
        'Onlayn təsdiq və elektron qəbul qeydiyyatı (Audit Trail)',
        'İşə qəbul sənədlərinin siyahısı və ilk iş günü təlimatları',
        'Namizədin müraciətlərini və statuslarını mərkəzi kabinetdə idarəsi'
      ],
      actionTab: 'my-applications',
      actionRole: 'candidate' as const,
      actionText: 'Namizəd Portalına Keç',
    },
    {
      id: 'pdf-generation',
      category: 'candidate-ai',
      title: 'Birbaşa A4 PDF Generasiyası',
      badge: 'Print Ready',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: Download,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
      summary: 'Beynəlxalq standartlara cavab verən, çapa hazır 300 DPI vektor A4 PDF formatında CV və rəsmi Job Offer sənədlərinin anlıq ixracı.',
      stats: '300 DPI Vektor • Standart A4 Format',
      features: [
        '30 müxtəlif beynəlxalq şablonda pixel-perfect A4 tərtibatı',
        'ATS skanerləri tərəfindən 100% oxunaqlı mətn qatı',
        'Şirkət loqosu və rəsmi möhür yeri ilə Job Offer PDF-i',
        'İstənilən cihazda tək kliklə dərhal yükləmə imkanı'
      ],
      actionTab: 'cv-creator',
      actionRole: 'candidate' as const,
      actionText: 'CV Yaradıcı & PDF Yüklə',
    },
    {
      id: 'tax-calculator',
      category: 'finance-legal',
      title: 'AR Vergi & Məzuniyyət Kalkulyatoru',
      badge: '2026 AR Məcəlləsi',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: Calculator,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      summary: '2026-cı il AR Vergi Məcəlləsinə əsasən Gross ↔ Net əməkhaqqı çeviricisi, qeyri-neft özəl sektor güzəşti, DSMF, İTS və Əmək Məcəlləsi Maddə 140 məzuniyyət hesablaması.',
      stats: 'Gross ↔ Net • Maddə 140 Məzuniyyət',
      features: [
        'Neft-qaz və qeyri-neft özəl sektor üzrə fərqli vergi dərəcələri',
        'DSMF (3% və ya pilləli), İcbari Tibbi Sığorta (2%) və İşsizlik (0.5%)',
        'Son 12 ayın qazancı əsasında rəsmi məzuniyyət pulunun dəqiq cədvəli',
        'İşəgötürən üçün ümumi fond xərclərinin detallı büdcə açılışı'
      ],
      actionTab: 'salary-calculator',
      actionRole: 'candidate' as const,
      actionText: 'Maaşını və Vergiləri Hesabla',
    },
    {
      id: 'smart-cv-ats',
      category: 'candidate-ai',
      title: 'AI Dəstəkli CV Hazırlama & Dərin ATS Auditi',
      badge: 'Smart Resume',
      badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      icon: Sparkles,
      iconColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      summary: '30 beynəlxalq şablon, Peşəkar Xülasə Blueprint, Google XYZ nailiyyət formulu, açar sözlər çatışmazlığı və 10 meyar üzrə ATS yoxlanışı.',
      stats: '10 ATS Meyarı • Açar Sözlər Matrisi',
      features: [
        'Mövcud CV-nin söz sayı, oxunaqlıq və açar söz sıxlığı analizi',
        'Aparıcı HR standartlarına uyğun 3 nüsxə hazır Peşəkar Xülasə qaralaması',
        'Vakansiyanın tələb etdiyi lakin CV-də çatışmayan sənaye terminləri',
        'Google XYZ formatında passiv cümlələrin aktiv nailiyyətə çevrilməsi'
      ],
      actionTab: 'cv-analyzer',
      actionRole: 'candidate' as const,
      actionText: 'Dərin ATS Auditini Sına',
    },
    {
      id: 'web-aggregator',
      category: 'candidate-ai',
      title: 'Aparıcı Şirkətlərdən Canlı Elanlar & Veb Aqreqator',
      badge: 'Canlı Baza',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Search,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      summary: 'Azərbaycanın bütün aparıcı platformalarından (Boss.az, HelloJob, JobSearch, Tap.az, Rabota.az) elanların vahid axtarış pəncərəsində aqreqasiyası.',
      stats: 'Bütün Veb Portalları Bir Yerdə',
      features: [
        'PAŞA Holdinq, Kapital Bank, Azercell, SOCAR və digər nəhənglərin elanları',
        '1 Kliklə Sürətli Müraciət və rəsmi WhatsApp ilə birbaşa əlaqə',
        'Şəhərlər və interaktiv xəritə üzrə yaxınlıqdakı işlərin təyini',
        'Açar sözlər və şirkət izləməsi üzrə canlı bildiriş xidməti'
      ],
      actionTab: 'jobs',
      actionRole: 'candidate' as const,
      actionText: 'Bütün Vakansiyalara Bax',
    }
  ];

  const filteredCapabilities = capabilities.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <JobiaLogo size="xs" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 border border-blue-700/50 px-2.5 py-0.5 rounded-full">
                  Müasir Vakansiya və Ağıllı Karyera Portalı
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-xs text-slate-300 hidden sm:inline font-medium">
                  Rəsmi İR & İşə Qəbul Ekosistemi
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                jobia.az Tam Platforma Ekosistemi & İmkanlar
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Azərbaycanın müasir vakansiya, ağıllı CV, tam HR işə qəbul və Enterprise Recruiting Analytics platforması. Time to Fill / Time to Hire analitikası, 11 mərhələli recruitment funnel, bazar benchmarkları, AI müsahibə və iş təklifi workflow-u.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 pt-4 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              Hamısı ({capabilities.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('hr-enterprise')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'hr-enterprise'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Enterprise HR & Analitika</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('candidate-ai')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'candidate-ai'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Karyera & ATS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('finance-legal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'finance-legal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>AR Vergi & Qanunvericilik</span>
            </button>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCapabilities.map((cap) => {
              const CapIcon = cap.icon;
              return (
                <div
                  key={cap.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon, Badge & Title */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${cap.iconColor}`}>
                          <CapIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border mb-1 ${cap.badgeColor}`}>
                            {cap.badge}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                            {cap.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cap.summary}
                    </p>

                    {/* Stats Pill */}
                    <div className="text-[11px] font-mono font-semibold text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="truncate">{cap.stats}</span>
                    </div>

                    {/* Bullet Points */}
                    <ul className="space-y-1.5 pt-1">
                      {cap.features.map((feat, idx) => (
                        <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-snug">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-500">
                      {cap.category === 'hr-enterprise' ? 'İşəgötürənlər üçün aktivdir' : cap.category === 'finance-legal' ? 'AR Qanunvericiliyi 2026' : 'Namizədlər üçün pulsuzdur'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAction(cap.actionTab, cap.actionRole)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group-hover:bg-blue-600 group-hover:text-white"
                    >
                      <span>{cap.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <ModalBottomLogo />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
