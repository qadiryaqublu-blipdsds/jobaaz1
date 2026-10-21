import React, { useState } from 'react';
import { 
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
  ChevronDown,
  Building2,
  Users,
  Award,
  Zap,
  Info
} from 'lucide-react';

interface PlatformEcosystemBannerProps {
  onNavigateToTab?: (tab: string) => void;
  onOpenEcosystemModal?: () => void;
}

export const PlatformEcosystemBanner: React.FC<PlatformEcosystemBannerProps> = ({
  onNavigateToTab,
  onOpenEcosystemModal,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jobia_ecosystem_banner_expanded') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jobia_ecosystem_banner_expanded', String(next));
      } catch {}
      return next;
    });
  };

  const featurePillars = [
    {
      id: 'time-to-fill',
      title: 'Time to Fill / Time to Hire',
      subtitle: 'Vakansiya bağlanma sürəti & HR KPI-ları',
      badge: 'HR Analitika',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Clock,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
      tab: 'analytics',
      actionLabel: 'Analitikaya Bax',
      metric: 'Median 18.4 gün',
    },
    {
      id: 'recruitment-funnel',
      title: '11 Mərhələli Funnel',
      subtitle: 'Sourcing-dən sınaq müddətinə qədər workflow',
      badge: 'Recruitment',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      icon: Layers,
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      tab: 'applicants',
      actionLabel: 'Funnelə Bax',
      metric: '11 Faza ATS',
    },
    {
      id: 'market-benchmarks',
      title: 'Bazar Benchmarkları',
      subtitle: 'Sahəvi median maaşlar və bazar tendensiyaları',
      badge: 'Əmək Bazarı',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: BarChart3,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tab: 'salary-trends',
      actionLabel: 'Maaş Trendləri',
      metric: 'Canlı Statistika',
    },
    {
      id: 'ai-interview',
      title: 'AI Müsahibə & Dəyərləndirmə',
      subtitle: 'Real-vaxt səsli və mətnli STAR müsahibə məşqi',
      badge: 'AI Aləti',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: Bot,
      iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
      tab: 'practice-interview',
      actionLabel: 'Müsahibə Məşqi',
      metric: '100 Ballıq Skorinq',
    },
    {
      id: 'job-offer',
      title: 'AI Job Offer & 1-Klik E-poçt',
      subtitle: 'AR Əmək Məcəlləsinə uyğun rəsmi iş təklifi',
      badge: 'Rəsmi Sənəd',
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
      icon: FileText,
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
      tab: 'offers',
      actionLabel: 'Job Offer Portalı',
      metric: 'İkidilli Şablon',
    },
    {
      id: 'candidate-portal',
      title: 'Təhlükəsiz Namizəd Portalı',
      subtitle: 'Şifrələnmiş təklif qəbulu və status izləmə',
      badge: '256-bit SSL',
      badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
      icon: ShieldCheck,
      iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
      tab: 'my-applications',
      actionLabel: 'Müraciətlərim',
      metric: 'Rəqəmsal İmza',
    },
    {
      id: 'a4-pdf',
      title: 'Birbaşa A4 PDF Generasiyası',
      subtitle: '300 DPI vektor CV və rəsmi sənəd ixracı',
      badge: 'Çapa Hazır',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: Download,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
      tab: 'cv-creator',
      actionLabel: 'CV Yaradıcı',
      metric: '30 Beynəlxalq Şablon',
    },
    {
      id: 'tax-calculator',
      title: 'AR Vergi & Məzuniyyət',
      subtitle: '2026 AR Vergi simulyatoru, Gross ↔ Net və Maddə 140',
      badge: 'Maliyyə',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: Calculator,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tab: 'salary-calculator',
      actionLabel: 'Maaşını Hesabla',
      metric: '100% Rəsmi Qanun',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 rounded-2xl border border-blue-900/60 shadow-lg p-4 sm:p-5 text-white relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 relative z-10">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-bold text-blue-300 bg-blue-900/60 border border-blue-700/60 px-2.5 py-0.5 rounded-full text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>jobia.az • Müasir Vakansiya və Ağıllı Karyera Portalı</span>
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">
              Bakı, Azərbaycan • Rəsmi İR & İşə Qəbul Ekosistemi
            </span>
          </div>

          <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight">
            Azərbaycanın Tam HR İşə Qəbul, Ağıllı CV və Enterprise Recruiting Analytics Platforması
          </h2>

          <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
            Time to Fill / Time to Hire analitikası, 11 mərhələli recruitment funnel, bazar benchmarkları, AI müsahibə və iş təklifi workflow-u, AR Vergi kalkulyatoru, birbaşa A4 PDF generasiyası və təhlükəsiz namizəd portali.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenEcosystemModal && (
            <button
              type="button"
              onClick={onOpenEcosystemModal}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Bütün İmkanlara Bax</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleExpand}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title={isExpanded ? 'Bələdçini yığcamlaşdır' : 'Bələdçini aç'}
          >
            <span>{isExpanded ? 'Yığcam Et' : 'Bələdçini Aç'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Interactive Capability Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-4 mt-3 border-t border-white/10 relative z-10">
          {featurePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                onClick={() => onNavigateToTab?.(pillar.tab)}
                className="bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-blue-400/50 p-3 transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <strong className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                        {pillar.title}
                      </strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-normal line-clamp-2">
                    {pillar.subtitle}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-emerald-300 font-semibold">
                    {pillar.metric}
                  </span>
                  <span className="font-bold text-blue-300 group-hover:text-white flex items-center gap-1">
                    <span>{pillar.actionLabel}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
