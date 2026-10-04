import React, { useState, useMemo } from 'react';
import { GigProfile, GigOffer, TutorTeachingFormat } from '../../types';
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
  BookOpen, 
  CheckCircle2, 
  Layers,
  Check,
  Calendar,
  Gift
} from 'lucide-react';

interface TutorsHubViewProps {
  onShowToast?: (message: string) => void;
}

export const TutorsHubView: React.FC<TutorsHubViewProps> = ({ onShowToast }) => {
  const { language } = useLanguage();

  // Load tutors and tutor requests
  const [tutors, setTutors] = useState<GigProfile[]>(() => 
    getGigProfiles().filter((p) => p.type === 'tutor_instructor')
  );
  const [offers, setOffers] = useState<GigOffer[]>(() => 
    getGigOffers().filter((o) => o.type === 'need_tutor')
  );

  // Filter States
  const [activeTab, setActiveTab] = useState<'tutors' | 'requests'>('tutors');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [onlyTrialLesson, setOnlyTrialLesson] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'monthly_low' | 'monthly_high' | 'experience'>('rating');

  // Modals
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
  const [selectedDetailProfile, setSelectedDetailProfile] = useState<GigProfile | null>(null);

  // Subject categories
  const subjectCategories = useMemo(() => {
    const set = new Set<string>();
    tutors.forEach((t) => set.add(t.category));
    offers.forEach((o) => set.add(o.category));
    return Array.from(set);
  }, [tutors, offers]);

  // Filtered Tutors
  const filteredTutors = useMemo(() => {
    return tutors.filter((t) => {
      if (selectedSubjectCategory !== 'all' && t.category !== selectedSubjectCategory) return false;
      if (onlyTrialLesson && !t.trialLessonAvailable) return false;
      if (onlyVerified && !t.verified) return false;

      // Format filter
      if (selectedFormat !== 'all') {
        if (!t.formats || !t.formats.includes(selectedFormat as TutorTeachingFormat)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.fullName.toLowerCase().includes(q);
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesCat = t.category.toLowerCase().includes(q);
        const matchesLoc = t.location.toLowerCase().includes(q);
        const matchesSkills = t.subjectsOrSkills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesTitle && !matchesCat && !matchesLoc && !matchesSkills) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'monthly_low') {
        const valA = a.monthlyRate || (a.hourlyRate ? a.hourlyRate * 8 : 0);
        const valB = b.monthlyRate || (b.hourlyRate ? b.hourlyRate * 8 : 0);
        return valA - valB;
      }
      if (sortBy === 'monthly_high') {
        const valA = a.monthlyRate || (a.hourlyRate ? a.hourlyRate * 8 : 0);
        const valB = b.monthlyRate || (b.hourlyRate ? b.hourlyRate * 8 : 0);
        return valB - valA;
      }
      return 0;
    });
  }, [tutors, selectedSubjectCategory, selectedFormat, onlyTrialLesson, onlyVerified, searchQuery, sortBy]);

  // Filtered Student Requests
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      if (selectedSubjectCategory !== 'all' && o.category !== selectedSubjectCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = o.title.toLowerCase().includes(q);
        const matchesPoster = o.posterName.toLowerCase().includes(q);
        const matchesLoc = o.location.toLowerCase().includes(q);
        if (!matchesTitle && !matchesPoster && !matchesLoc) return false;
      }
      return true;
    });
  }, [offers, selectedSubjectCategory, searchQuery]);

  const handleProfileCreated = (newProf: GigProfile) => {
    if (newProf.type === 'tutor_instructor') {
      setTutors((prev) => [newProf, ...prev]);
    }
    if (onShowToast) {
      onShowToast(`Təbriklər, ${newProf.fullName}! Müəllimlik profiliniz uğurla dərc edildi.`);
    }
  };

  const handleOfferCreated = (newOff: GigOffer) => {
    if (newOff.type === 'need_tutor') {
      setOffers((prev) => [newOff, ...prev]);
    }
    if (onShowToast) {
      onShowToast(`Repetitor axtarışı elanınız dərc edildi! Müəllimlər sizinlə əlaqə saxlayacaq.`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. CLEAN MINIMALIST HEADER (Consistent with Vacancies) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fərdi Təhsil & Repetitorluq</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {tutors.length} müəllim • {offers.length} tələbə elanı
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            🎓 Repetitor Axtar & Kurs Müəllimləri
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal leading-relaxed">
            Xarici dillər, IELTS, İT və DİM buraxılış-qəbul imtahanları üçün peşəkar repetitorları sınaq dərsi ilə asanlıqla seçin.
          </p>
        </div>

        {/* Action CTAs (Jobia Signature Emerald) */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsCreateProfileOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Müəllim Profili Yarat (+ Pulsuz)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOfferOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 active:scale-98 text-emerald-800 border border-emerald-300 font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-emerald-600" />
            <span>Müəllim Axtarıram (Elan Ver)</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB SWITCHER */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('tutors')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tutors'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Müəllimlər və Repetitorlar</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeTab === 'tutors' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {filteredTutors.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Tələbə & Valideyn Elanları</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeTab === 'requests' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {filteredOffers.length}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOfferOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fərdi müəllim axtarışını elan et</span>
        </button>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fənn, imtahan və ya müəllim adı (Məs: IELTS, Riyaziyyat, Python, Rus dili)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedSubjectCategory}
              onChange={(e) => setSelectedSubjectCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 bg-white"
            >
              <option value="all">Bütün Fənlər & Sahələr</option>
              {subjectCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 bg-white"
            >
              <option value="all">Bütün Formatlar</option>
              <option value="online">💻 Onlayn (Zoom/Meet)</option>
              <option value="in_person">🏫 Əyani (Məkan)</option>
              <option value="student_home">🏠 Tələbənin evində</option>
              <option value="tutor_place">📍 Müəllimin ofisində</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 bg-white"
            >
              <option value="rating">Reytinq: Ən yüksək</option>
              <option value="experience">Təcrübə: Ən çox</option>
              <option value="monthly_low">Aylıq qiymət: Ucuzdan bahaya</option>
              <option value="monthly_high">Aylıq qiymət: Bahadan ucuza</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1">
            Özəllik:
          </span>

          <button
            type="button"
            onClick={() => setOnlyTrialLesson(!onlyTrialLesson)}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer border ${
              onlyTrialLesson
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🎁 Pulsuz Sınaq Dərsi (Trial Lesson) Olanlar
          </button>

          <button
            type="button"
            onClick={() => setSelectedFormat(selectedFormat === 'online' ? 'all' : 'online')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer border ${
              selectedFormat === 'online'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            💻 Yalnız Onlayn Dərslər
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
            🛡️ Sertifikatlı & Təsdiqlənmiş Müəllimlər
          </button>

          {(selectedSubjectCategory !== 'all' || selectedFormat !== 'all' || onlyTrialLesson || onlyVerified || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedSubjectCategory('all');
                setSelectedFormat('all');
                setOnlyTrialLesson(false);
                setOnlyVerified(false);
                setSearchQuery('');
              }}
              className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
            >
              Filtrləri sıfırla
            </button>
          )}
        </div>
      </div>

      {/* 4. TUTORS FEED */}
      {activeTab === 'tutors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Mövcud Kurs Müəllimləri və Repetitorlar</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                {filteredTutors.length}
              </span>
            </h2>
          </div>

          {filteredTutors.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Axtarışa uyğun müəllim tapılmadı</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Fənn və ya format filtrini dəyişin. Siz də dərhal öz müəllimlik profilinizi yarada bilərsiniz.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateProfileOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                İlk Müəllim Profilini Sən Yarat (+ Pulsuz)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTutors.map((p) => {
                const whatsAppLink = buildGigWhatsAppLink(p);

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedDetailProfile(p)}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                  >
                    <div>
                      {/* Top Row: Initials, Title, Badges */}
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
                              <span title="Təsdiqlənmiş Müəllim">
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

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                          {p.category}
                        </span>

                        {p.trialLessonAvailable && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-950 border border-emerald-300">
                            🎁 Sınaq Dərsi Var
                          </span>
                        )}

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          🎓 {p.experienceYears} il təcrübə
                        </span>
                      </div>

                      {/* Formats */}
                      {p.formats && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {p.formats.map((fmt) => (
                            <span key={fmt} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50/80 text-emerald-900 border border-emerald-200">
                              {fmt === 'online' ? '💻 Onlayn' : fmt === 'in_person' ? '🏫 Əyani' : '🏠 Evdə'}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bio snippet */}
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-2.5 leading-relaxed">
                        {p.bio}
                      </p>

                      {/* Subjects */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {p.subjectsOrSkills.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                      <div>
                        {p.monthlyRate ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-emerald-800 tabular-nums">
                              {p.monthlyRate} {p.currency}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold">/ay</span>
                          </div>
                        ) : p.hourlyRate ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-emerald-800 tabular-nums">
                              {p.hourlyRate} {p.currency}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">/saat</span>
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

      {/* 5. STUDENT REQUESTS FEED */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>📢 Tələbə və Valideyn Axtarışları (Elanlar)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                  {filteredOffers.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Şagirdlər və valideynlər tərəfindən açılmış fərdi repetitor tələbləri
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOfferOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tələb Elan Et</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOffers.map((off) => {
              const whatsAppLink = buildOfferWhatsAppLink(off);

              return (
                <div
                  key={off.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                          {off.category}
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
                      <span>Əlaqə Saxla (WhatsApp)</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODALS */}
      <GigProfileCreateModal
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        onProfileCreated={handleProfileCreated}
        initialType="tutor_instructor"
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

      <SectionBottomLogo tagline="Azərbaycanın Ən Ağıllı Repetitorlar və Kurs Müəllimləri Birjası" />

    </div>
  );
};
