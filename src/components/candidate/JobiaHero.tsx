import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight, ShieldCheck, Briefcase, ChevronLeft, ChevronRight, Pause, Play, Sparkles, MapPin } from 'lucide-react';
import { Vacancy } from '../../types';

interface JobiaHeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: () => void;
  onSelectVacancy?: (vacancy: Vacancy) => void;
  vacancies?: Vacancy[];
  onNavigateToTab?: (tab: string) => void;
}

export const JobiaHero: React.FC<JobiaHeroProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSelectVacancy,
  vacancies = [],
  onNavigateToTab,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Discovery featured jobs for slider rotation
  const discoveryJobs = [
    {
      title: 'Baş aşpaz',
      company: 'Gabala Hospitality Group',
      code: 'GH',
      location: 'Qəbələ',
      badge: 'KƏŞF ETMƏYƏ DƏYƏR',
      category: 'Turizm və Qonaqpərvərlik',
      salary: '2500 - 3200 ₼',
    },
    {
      title: 'Senior Frontend Developer',
      company: 'Pasha Technology MMC',
      code: 'PT',
      location: 'Bakı, Port Baku',
      badge: 'PREMİUM VAKANSİYA',
      category: 'İT və Proqramlaşdırma',
      salary: '3500 - 4800 ₼',
    },
    {
      title: 'İnsan Resursları Direktoru (HRD)',
      company: 'Bravo Supermarketlər MMC',
      code: 'BR',
      location: 'Bakı',
      badge: 'TOP ŞİRKƏT',
      category: 'İnsan Resursları (HR)',
      salary: '3000 - 4200 ₼',
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % discoveryJobs.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, discoveryJobs.length]);

  const activeDiscovery = discoveryJobs[currentSlide];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const handleDiscoveryClick = () => {
    // Try to find matching vacancy from real list or fallback
    const matched = vacancies.find(
      (v) =>
        v.title.toLowerCase().includes(activeDiscovery.title.toLowerCase()) ||
        v.companyName.toLowerCase().includes(activeDiscovery.company.toLowerCase())
    );
    if (matched && onSelectVacancy) {
      onSelectVacancy(matched);
    } else if (onNavigateToTab) {
      onNavigateToTab('jobs');
    }
  };

  const totalActiveVacancies = vacancies.filter((v) => v.status === 'published' && v.isApproved).length || 12;
  const verifiedCompaniesCount = 10;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50/60 via-white to-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 lg:p-10 mb-6 shadow-2xs">
      {/* Background Subtle Radial Glow */}
      <div 
        className="pointer-events-none absolute -right-24 -top-24 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* LEFT COLUMN: HERO HEADLINE & SEARCH PILL */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-[11px] font-extrabold tracking-wider text-slate-800 uppercase">
            <span className="w-2 h-2 rounded-full bg-[#00a859] animate-pulse" />
            <span>KARYERANDA YENİ SƏHİFƏ</span>
          </div>

          {/* Main Title Matching Prototype */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Doğru iş.
            </h1>
            <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black text-[#00a859] tracking-tight leading-[1.08]">
              Yeni başlanğıc.
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
            Bacarıqlarına uyğun vakansiyaları tap. Növbəti karyera addımını <strong className="text-slate-900 font-bold">JOBIA</strong> ilə at.
          </p>

          {/* Big Floating Capsule Search Bar */}
          <form onSubmit={handleFormSubmit} className="pt-1">
            <div className="relative flex items-center bg-white border border-slate-200 rounded-full p-1.5 pl-5 shadow-sm hover:border-slate-300 focus-within:border-[#00a859] focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all max-w-xl">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
              <input
                id="hero-main-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Vəzifə, peşə və ya şirkət adı"
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none pr-2"
              />
              <button
                type="submit"
                id="hero-search-submit-btn"
                className="h-10 sm:h-11 px-5 sm:px-7 rounded-full bg-[#00a859] hover:bg-[#00924d] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <span>İş axtar</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Trust Badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-[#00a859] shrink-0" />
            <span>Yeni imkanları bir axtarışla kəşf et</span>
          </div>
        </div>

        {/* RIGHT COLUMN: DARK EMERALD CONSTELLATION RADAR CARD */}
        <div className="lg:col-span-5 relative">
          <div className="relative bg-[#06241a] border border-emerald-800/50 rounded-3xl p-6 sm:p-7 overflow-hidden shadow-2xl min-h-[380px] flex flex-col justify-between">
            {/* Background subtle radial rings */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_45%,_rgba(0,168,89,0.3)_0%,_transparent_65%)]"
              aria-hidden="true"
            />

            {/* Top Card Title & Compass Icon */}
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                  SƏNİN KARYERA XƏRİTƏN
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5 tracking-tight">
                  Bacarıqlarından yeni imkanlara.
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full border border-emerald-500/40 bg-emerald-950/80 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Interactive Constellation / Radar Orbit Diagram */}
            <div className="relative my-6 h-48 flex items-center justify-center">
              {/* Concentric Radar Orbits */}
              <div className="absolute w-44 h-44 rounded-full border border-emerald-500/20" />
              <div className="absolute w-32 h-32 rounded-full border border-emerald-500/30" />
              <div className="absolute w-20 h-20 rounded-full border border-emerald-500/40" />

              {/* Connecting Laser Lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 200">
                <line x1="150" y1="100" x2="150" y2="30" stroke="#00a859" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
                <line x1="150" y1="100" x2="70" y2="150" stroke="#00a859" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
                <line x1="150" y1="100" x2="230" y2="150" stroke="#00a859" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
              </svg>

              {/* Center Glowing Hub: JOBIA */}
              <div className="relative z-10 px-3.5 py-1.5 rounded-full bg-emerald-900/90 border border-emerald-400 text-emerald-100 font-black text-xs tracking-wider shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>JOBIA</span>
              </div>

              {/* Node 1: Top - CV profili */}
              <div 
                onClick={() => onNavigateToTab?.('cv-creator')}
                className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 rounded-full bg-[#0a3826] border border-emerald-400/80 text-[10px] font-bold text-emerald-100 shadow-md flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                title="Ağıllı CV Tərtibatı"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>CV profili</span>
              </div>

              {/* Node 2: Bottom Left - AI analiz */}
              <div 
                onClick={() => onNavigateToTab?.('cv-analyzer')}
                className="absolute bottom-2 left-4 z-10 px-2.5 py-1 rounded-full bg-[#0a3826] border border-emerald-400/80 text-[10px] font-bold text-emerald-100 shadow-md flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                title="AI ATS Analizi"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>AI analiz</span>
              </div>

              {/* Node 3: Bottom Right - Vakansiyalar */}
              <div 
                onClick={() => onNavigateToTab?.('jobs')}
                className="absolute bottom-2 right-4 z-10 px-2.5 py-1 rounded-full bg-[#0a3826] border border-emerald-400/80 text-[10px] font-bold text-emerald-100 shadow-md flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                title="Vakansiyalar"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Vakansiyalar</span>
              </div>
            </div>

            {/* FLOATING DISCOVERY CARD (Matching Gabala Hospitality Prototype Card) */}
            <div 
              onClick={handleDiscoveryClick}
              className="relative z-20 bg-white rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-100 max-w-[270px] -mt-4 cursor-pointer hover:shadow-2xl transition-all group"
            >
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-[#00a859]">
                {activeDiscovery.badge}
              </div>
              <div className="flex items-center gap-2.5 mt-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
                  {activeDiscovery.code}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#00a859] transition-colors">
                    {activeDiscovery.title}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {activeDiscovery.company}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{activeDiscovery.location}</span>
                </span>
                <span className="text-[#00a859] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Vakansiyaya bax</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* FLOATING DARK STATS BADGE (Bottom-Right) */}
            <div className="absolute bottom-4 right-4 z-10 bg-[#083021]/90 backdrop-blur-xs border border-emerald-700/60 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-300">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div className="text-[10px] font-semibold leading-tight">
                <div><strong className="text-emerald-300 font-bold">{totalActiveVacancies}</strong> Aktiv vakansiya</div>
                <div className="text-slate-300">{verifiedCompaniesCount} Təsdiqli şirkət</div>
              </div>
            </div>
          </div>

          {/* SLIDER PAGINATION CONTROLS (Bottom beneath card) */}
          <div className="flex items-center justify-between mt-3 px-1">
            {/* Indicators */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="w-6 h-1.5 rounded-full bg-[#00a859]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-[11px] font-mono text-slate-400 pl-1">
                0{currentSlide + 1} / 0{discoveryJobs.length}
              </span>
            </div>

            {/* Arrows & Pause Button */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + discoveryJobs.length) % discoveryJobs.length)}
                className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                title="Əvvəlki"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % discoveryJobs.length)}
                className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                title="Növbəti"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                title={isPlaying ? 'Durdur' : 'Davam et'}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
