import React, { useState, useMemo } from 'react';
import { GigProfile, GigOffer, GigProfileType, GigAvailability } from '../../types';
import { 
  getGigProfiles, 
  getGigOffers, 
  buildGigWhatsAppLink, 
  buildOfferWhatsAppLink 
} from '../../services/gigService';
import { GigProfileCreateModal } from './GigProfileCreateModal';
import { GigOfferCreateModal } from './GigOfferCreateModal';
import { GigProfileDetailModal } from './GigProfileDetailModal';
import { useLanguage } from '../../context/LanguageContext';
import { SectionBottomLogo } from '../common/SectionBottomLogo';
import { 
  Search, 
  Sparkles, 
  Plus, 
  Megaphone, 
  ShieldCheck, 
  Star, 
  Clock, 
  MapPin, 
  DollarSign, 
  MessageCircle, 
  Phone, 
  Award, 
  GraduationCap, 
  Briefcase, 
  Filter, 
  Zap, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  SlidersHorizontal,
  Layers,
  ChevronRight
} from 'lucide-react';

interface GigTutorHubViewProps {
  onShowToast?: (message: string) => void;
}

export const GigTutorHubView: React.FC<GigTutorHubViewProps> = ({ onShowToast }) => {
  const { language } = useLanguage();

  // Data State
  const [profiles, setProfiles] = useState<GigProfile[]>(() => getGigProfiles());
  const [offers, setOffers] = useState<GigOffer[]>(() => getGigOffers());

  // Filter States
  const [activeTab, setActiveTab] = useState<'all' | 'casual_workers' | 'tutors' | 'offers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyTrialLesson, setOnlyTrialLesson] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'rate_low' | 'rate_high' | 'experience'>('rating');

  // Modals
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [createProfileInitialType, setCreateProfileInitialType] = useState<GigProfileType>('casual_worker');
  const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
  const [selectedDetailProfile, setSelectedDetailProfile] = useState<GigProfile | null>(null);

  // Categories list
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => set.add(p.category));
    offers.forEach((o) => set.add(o.category));
    return Array.from(set);
  }, [profiles, offers]);

  // Filtered Profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // Tab filter
      if (activeTab === 'casual_workers' && p.type !== 'casual_worker') return false;
      if (activeTab === 'tutors' && p.type !== 'tutor_instructor') return false;
      if (activeTab === 'offers') return false;

      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      // Availability filter
      if (availabilityFilter !== 'all' && p.availability !== availabilityFilter) return false;

      // Verified filter
      if (onlyVerified && !p.verified) return false;

      // Trial lesson filter (for tutors)
      if (onlyTrialLesson && (!p.trialLessonAvailable || p.type !== 'tutor_instructor')) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.fullName.toLowerCase().includes(query);
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        const matchesLocation = p.location.toLowerCase().includes(query);
        const matchesSkills = p.subjectsOrSkills.some((s) => s.toLowerCase().includes(query));
        if (!matchesName && !matchesTitle && !matchesCategory && !matchesLocation && !matchesSkills) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'rate_low') {
        const rateA = a.hourlyRate || (a.dailyRate ? a.dailyRate / 8 : 0);
        const rateB = b.hourlyRate || (b.dailyRate ? b.dailyRate / 8 : 0);
        return rateA - rateB;
      }
      if (sortBy === 'rate_high') {
        const rateA = a.hourlyRate || (a.dailyRate ? a.dailyRate / 8 : 0);
        const rateB = b.hourlyRate || (b.dailyRate ? b.dailyRate / 8 : 0);
        return rateB - rateA;
      }
      return 0;
    });
  }, [profiles, activeTab, selectedCategory, availabilityFilter, onlyVerified, onlyTrialLesson, searchQuery, sortBy]);

  // Filtered Offers
  const filteredOffers = useMemo(() => {
    if (activeTab === 'casual_workers' || activeTab === 'tutors') return [];
    return offers.filter((o) => {
      if (selectedCategory !== 'all' && o.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = o.title.toLowerCase().includes(query);
        const matchesPoster = o.posterName.toLowerCase().includes(query);
        const matchesLocation = o.location.toLowerCase().includes(query);
        if (!matchesTitle && !matchesPoster && !matchesLocation) return false;
      }
      return true;
    });
  }, [offers, activeTab, selectedCategory, searchQuery]);

  const handleProfileCreated = (newProf: GigProfile) => {
    setProfiles((prev) => [newProf, ...prev]);
    if (onShowToast) {
      onShowToast(`Təbriklər, ${newProf.fullName}! Profiliniz uğurla dərc edildi və axtarışa əlavə olundu.`);
    }
  };

  const handleOfferCreated = (newOff: GigOffer) => {
    setOffers((prev) => [newOff, ...prev]);
    if (onShowToast) {
      onShowToast(`Elanınız uğurla yerləşdirildi! İcraçılar və ya müəllimlər sizinlə əlaqə saxlayacaq.`);
    }
  };

  const totalWorkers = profiles.filter((p) => p.type === 'casual_worker').length;
  const totalTutors = profiles.filter((p) => p.type === 'tutor_instructor').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. CLEAN MINIMALIST HEADER (Consistent with Vacancies) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Günlük İşçilər & Repetitorlar</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {totalWorkers} icraçı • {totalTutors} müəllim • {offers.length} aktiv sifariş
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Günlük İşçilər & Fərdi Repetitorlar Mərkəzi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal leading-relaxed">
            Saatlıq/günlük personal və fərdi kurs müəllimlərini birbaşa WhatsApp ilə tapın və ya sifariş elan edin.
          </p>
        </div>

        {/* Action CTAs (Jobia Signature Emerald) */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setCreateProfileInitialType('casual_worker');
              setIsCreateProfileOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>İcraçı / Müəllim Profili Yarat (+ Pulsuz)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOfferOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 active:scale-98 text-emerald-800 border border-emerald-300 font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-emerald-600" />
            <span>İşçi və ya Müəllim Axtarıram (Elan Ver)</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN SEGMENTED NAVIGATION BAR */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all' as const, label: 'Hamısı', count: profiles.length + offers.length, icon: Layers },
            { id: 'casual_workers' as const, label: '⚡ Günlük / Saatlıq İşçilər', count: totalWorkers, icon: Briefcase },
            { id: 'tutors' as const, label: '🎓 Kurs Müəllimləri & Repetitorlar', count: totalTutors, icon: GraduationCap },
            { id: 'offers' as const, label: '📢 Aktiv Sifarişlər & Çağırışlar', count: offers.length, icon: Megaphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Add Buttons on bar */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => {
              setCreateProfileInitialType('tutor_instructor');
              setIsCreateProfileOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Müəllim kimi qoşul</span>
          </button>
        </div>
      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ad, peşə, fənn və ya bacarıq axtarın (Məs: Ofisiant, IELTS, Usta, Python, Riyaziyyat)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 bg-white"
            >
              <option value="all">Bütün Kateqoriyalar</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 bg-white"
            >
              <option value="rating">Reytinq: Ən yüksək</option>
              <option value="experience">Təcrübə: Ən çox</option>
              <option value="rate_low">Tarif: Aşağıdan yuxarıya</option>
              <option value="rate_high">Tarif: Yuxarıdan aşağıya</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1">
            Sürətli Filtrlər:
          </span>

          <button
            type="button"
            onClick={() => setAvailabilityFilter(availabilityFilter === 'available_today' ? 'all' : 'available_today')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer border ${
              availabilityFilter === 'available_today'
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            ⚡ Yalnız Bugün Hazır Olanlar
          </button>

          <button
            type="button"
            onClick={() => setOnlyTrialLesson(!onlyTrialLesson)}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer border ${
              onlyTrialLesson
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🎁 Pulsuz Sınaq Dərsi Olanlar
          </button>

          <button
            type="button"
            onClick={() => setOnlyVerified(!onlyVerified)}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer border ${
              onlyVerified
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🛡️ Yalnız Təsdiqlənmiş Mütəxəssislər
          </button>

          {(selectedCategory !== 'all' || availabilityFilter !== 'all' || onlyVerified || onlyTrialLesson || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setAvailabilityFilter('all');
                setOnlyVerified(false);
                setOnlyTrialLesson(false);
                setSearchQuery('');
              }}
              className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
            >
              Filtrləri sıfırla
            </button>
          )}
        </div>
      </div>

      {/* 4. RESULTS SECTION */}
      <div className="space-y-6">
        
        {/* PROFILES GRID */}
        {activeTab !== 'offers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Mütəxəssislər & İcraçılar</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                  {filteredProfiles.length}
                </span>
              </h2>
            </div>

            {filteredProfiles.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Uyğun mütəxəssis tapılmadı</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Axtarış sözünü dəyişin və ya filtrləri sıfırlayın. Siz də dərhal öz xidmət profilinizi yarada bilərsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateProfileOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  İlk Profili Sən Yarat (+ Pulsuz)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProfiles.map((p) => {
                  const isTutor = p.type === 'tutor_instructor';
                  const whatsAppLink = buildGigWhatsAppLink(p);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedDetailProfile(p)}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                    >
                      <div>
                        {/* Header Row: Initials, Title, Badges */}
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-2xs shrink-0 bg-gradient-to-br from-emerald-600 to-teal-700">
                            {p.fullName.charAt(0)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-900 truncate text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                                {p.fullName}
                              </span>
                              {p.verified && (
                                <span title="Təsdiqlənmiş Peşəkar">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-bold text-slate-600 truncate mt-0.5">
                              {p.title}
                            </p>

                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                              <span className="flex items-center gap-1 text-amber-600 font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {p.rating.toFixed(1)} ({p.reviewsCount})
                              </span>
                              <span>•</span>
                              <span className="truncate">{p.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges / Pill Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                            {p.category}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-950 border border-emerald-200">
                            {p.availability === 'available_today' ? '⚡ Bugün Hazır' :
                             p.availability === 'weekends' ? '📅 Həftəsonu' :
                             p.availability === 'evenings' ? '🌙 Axşamlar' : '🕒 Çevik'}
                          </span>

                          {p.trialLessonAvailable && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-950 border border-emerald-300">
                              🎁 Sınaq Dərsi Var
                            </span>
                          )}
                        </div>

                        {/* Bio snippet */}
                        <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-3 leading-relaxed">
                          {p.bio}
                        </p>

                        {/* Skills / Subjects Tags */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {p.subjectsOrSkills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {s}
                            </span>
                          ))}
                          {p.subjectsOrSkills.length > 3 && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              +{p.subjectsOrSkills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom: Rates & Actions */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                        <div>
                          {p.hourlyRate ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-emerald-800 tabular-nums">
                                {p.hourlyRate} {p.currency}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">/saat</span>
                            </div>
                          ) : p.dailyRate ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-emerald-800 tabular-nums">
                                {p.dailyRate} {p.currency}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold">/gün</span>
                            </div>
                          ) : p.monthlyRate ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-emerald-800 tabular-nums">
                                {p.monthlyRate} {p.currency}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold">/ay</span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-500">Razılaşma ilə</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailProfile(p)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Profil
                          </button>

                          <a
                            href={whatsAppLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
                            title="WhatsApp ilə yaz"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* OFFERS SECTION */}
        {(activeTab === 'all' || activeTab === 'offers') && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>📢 Aktiv Sifarişlər & Çağırışlar</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                    {filteredOffers.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  İşəgötürənlər və fərdilər tərəfindən açılmış saatlıq işçi və repetitor axtarışı elanları
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateOfferOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Elan Ver</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOffers.map((off) => {
                const whatsAppLink = buildOfferWhatsAppLink(off);

                return (
                  <div
                    key={off.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                            {off.type === 'need_tutor' ? '🎓 Müəllim Lazımdır' : '⚡ Günlük İşçi Lazımdır'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{off.createdAt}</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          {off.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {off.posterName} • <span className="text-slate-700">{off.location}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-black text-xs block">
                          {off.rateOffered}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      {off.description}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{off.dateOrSchedule}</span>
                      </div>

                      <a
                        href={whatsAppLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Müraciət Et (WhatsApp)</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* MODALS */}
      <GigProfileCreateModal
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        onProfileCreated={handleProfileCreated}
        initialType={createProfileInitialType}
      />

      <GigOfferCreateModal
        isOpen={isCreateOfferOpen}
        onClose={() => setIsCreateOfferOpen(false)}
        onOfferCreated={handleOfferCreated}
      />

      <GigProfileDetailModal
        isOpen={Boolean(selectedDetailProfile)}
        onClose={() => setSelectedDetailProfile(null)}
        profile={selectedDetailProfile}
      />

      {/* Brand Footer */}
      <SectionBottomLogo tagline="Azərbaycanın Ən Ağıllı Günlük Kadr və Kurs Müəllimləri Birjası" />

    </div>
  );
};
