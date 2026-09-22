import React, { useState, useMemo, useEffect, useDeferredValue, useRef } from 'react';
import { Vacancy, CVData, Company } from '../../types';
import { JOB_CATEGORIES, CITIES, SAMPLE_COMPANIES } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { safeFetchJson } from '../../utils/apiHelper';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  Crown,
  Bookmark, 
  Calendar, 
  ChevronRight, 
  Award,
  CheckCircle2,
  TrendingUp,
  StickyNote,
  Send,
  Save,
  Edit3,
  X,
  Zap,
  Filter,
  Briefcase,
  Layers,
  ArrowUpDown,
  Building2,
  RotateCcw,
  Bot,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Check,
  PhoneCall,
  SlidersHorizontal,
  Info,
  Eye,
  Heart,
  Laptop,
  Code,
  GraduationCap,
  Palette,
  ShoppingBag,
  Cog,
  Users,
  Landmark,
  Megaphone,
  UserCheck,
  CheckCircle,
  FileCheck,
  Flame,
  ArrowUpRight,
  Factory,
  Stethoscope,
  BookOpen,
  Utensils,
  Scale,
  Truck,
  ChevronDown,
  Compass,
  Bell,
  BellRing,
  PanelLeftClose,
  PanelLeftOpen,
  GripVertical,
  Loader2,
  Target
} from 'lucide-react';
import { JobiaLogo } from '../JobiaLogo';
import { SectionBottomLogo } from '../common/SectionBottomLogo';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { normalizeAzText, evaluateJobDomainMatch, evaluateSmartAiJobMatch } from '../../utils/domainSearch';
import { JobAlertManagerModal } from './JobAlertManagerModal';
import { JobAlertSubscription, User } from '../../types';
import { getJobAlertSubscription, saveJobAlertSubscription } from '../../services/firestoreService';
import {
  getLocalizedCategory,
  getLocalizedEmploymentType,
  getLocalizedExperience,
  getLocalizedCity,
  getLocalizedIndustry,
  getLocalizedSortOption,
  getLocalizedJobTitle,
  getLocalizedVacancyTitle,
  getLocalizedVacancyDescription,
  getLocalizedVacancyRequirements
} from '../../i18n/localizeData';

interface JobExplorerProps {
  vacancies: Vacancy[];
  companies?: Company[];
  onSelectVacancy: (vacancy: Vacancy) => void;
  savedJobIds: string[];
  onToggleBookmark: (jobId: string) => void;
  jobNotes?: Record<string, string>;
  onSaveJobNote?: (jobId: string, note: string) => void;
  onQuickApply?: (vacancy: Vacancy) => void;
  onOpenSalaryTrends?: () => void;
  onOpenCalculia?: () => void;
  onOpenNearbyMap?: () => void;
  onOpenIntroTour?: () => void;
  userCV: CVData;
  selectedCompany?: string;
  onSelectCompany?: (company: string) => void;
  currentUser?: User | null;
  onShowToast?: (message: string) => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: 'candidate' | 'business' | 'admin') => void;
  onOpenProfileModal?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

interface AIMatchResult {
  id: string;
  matchScore: number;
  matchReason: string;
  keyHighlights: string[];
}

interface CitySearchSelectProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  className?: string;
}

const CitySearchSelect: React.FC<CitySearchSelectProps> = ({
  selectedCity,
  onSelectCity,
  className = '',
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredCities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return CITIES;
    return CITIES.filter((c) => c.toLowerCase().includes(q) || getLocalizedCity(c, language).toLowerCase().includes(q));
  }, [searchQuery, language]);

  const isCustomCity = searchQuery.trim() !== '' && !CITIES.some((c) => c.toLowerCase() === searchQuery.toLowerCase().trim());

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        id="city-search-select-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between pl-8 pr-2.5 py-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 focus:border-blue-600 rounded-xl text-xs font-semibold text-slate-800 outline-none transition-all cursor-pointer truncate shadow-2xs text-left"
        title={language === 'en' ? 'Select or search city' : language === 'ru' ? 'Выбрать или найти город' : 'Şəhər seç və ya axtar'}
      >
        <MapPin className="w-3.5 h-3.5 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <span className="truncate">
          {selectedCity === 'Hamısı' ? (language === 'en' ? '📍 All Cities' : language === 'ru' ? '📍 Все города' : '📍 Bütün Şəhərlər') : `📍 ${getLocalizedCity(selectedCity, language)}`}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {selectedCity !== 'Hamısı' && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSelectCity('Hamısı');
              }}
              className="p-1 hover:bg-slate-200/80 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              title={language === 'en' ? 'Reset city' : language === 'ru' ? 'Сбросить город' : 'Şəhəri sıfırla'}
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 animate-fade-in">
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search or enter city...' : language === 'ru' ? 'Поиск или ввод города...' : 'Şəhər axtar və ya daxil et...'}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs font-medium text-slate-800 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Popular Chips */}
          <div className="flex items-center gap-1 flex-wrap mb-2 pb-2 border-b border-slate-100">
            {['Hamısı', 'Bakı', 'Sumqayıt', 'Gəncə', 'Xırdalan', 'Şuşa', 'Uzaqdan / Remote'].map((quickCity) => (
              <button
                key={quickCity}
                type="button"
                onClick={() => {
                  onSelectCity(quickCity);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                  selectedCity === quickCity
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {quickCity === 'Hamısı'
                  ? (language === 'en' ? 'All' : language === 'ru' ? 'Все' : 'Hamısı')
                  : getLocalizedCity(quickCity, language)}
              </button>
            ))}
          </div>

          {/* City list */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
            <button
              type="button"
              onClick={() => {
                onSelectCity('Hamısı');
                setIsOpen(false);
                setSearchQuery('');
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                selectedCity === 'Hamısı' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>{language === 'en' ? '📍 All Cities' : language === 'ru' ? '📍 Все города' : '📍 Bütün Şəhərlər'}</span>
              {selectedCity === 'Hamısı' && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </button>

            {filteredCities.map((city) => {
              const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    onSelectCity(city);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer ${
                    isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{getLocalizedCity(city, language)}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              );
            })}

            {/* Custom manual city typed */}
            {isCustomCity && (
              <button
                type="button"
                onClick={() => {
                  onSelectCity(searchQuery.trim());
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 flex items-center justify-between cursor-pointer border border-amber-200 mt-1"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">
                    {language === 'en' ? `Search for city "${searchQuery.trim()}"` : language === 'ru' ? `Поиск по городу "${searchQuery.trim()}"` : `"${searchQuery.trim()}" şəhəri üzrə axtar`}
                  </span>
                </div>
                <span className="text-[10px] font-black text-amber-700 uppercase shrink-0">
                  {language === 'en' ? '+ Select' : language === 'ru' ? '+ Выбрать' : '+ Seç'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const COMPANY_INDUSTRIES = [
  'Bank və Maliyyə Texnologiyaları',
  'İnvestisiya və Holdinqlər',
  'İT və Telekommunikasiya',
  'Pərakəndə Ticarət və FMCG',
  'Mühəndislik və Tikinti',
  'Səhiyyə və Tibb',
  'Təhsil və Təlim',
  'Otelçilik və Restoran (HoReCa)',
  'Hüquq və Konsaltinq',
  'Logistika və Nəqliyyat',
  'İstehsalat və Sənaye',
];

/**
 * Accurately determines if a vacancy matches a target corporate industry (Sahə).
 * Evaluates:
 * 1. Direct match on vacancy's explicit industry field (if populated)
 * 2. Company's registered industry (via companyId or companyName lookup)
 * 3. Exact semantic category-to-industry mappings
 * 4. Sector-specific corporate keywords in company name
 * Guarded against empty-string substring matches that would cause over-counting.
 */
export const isVacancyInIndustry = (
  v: Vacancy,
  targetIndustry: string,
  companyIndustryMap?: Map<string, string>
): boolean => {
  if (!targetIndustry || targetIndustry === 'Hamısı') return true;

  const targetNorm = normalizeAzText(targetIndustry);
  if (!targetNorm) return true;

  // 1. Direct match on vacancy's explicit industry field if present
  const jobInd = (v as any).industry ? normalizeAzText((v as any).industry) : '';
  if (jobInd && jobInd.length >= 3) {
    if (jobInd === targetNorm || targetNorm.includes(jobInd) || jobInd.includes(targetNorm)) {
      return true;
    }
  }

  // 2. Company's registered industry
  const compNameLower = (v.companyName || '').toLowerCase().trim();
  const compId = v.companyId || '';
  const compIndRaw = companyIndustryMap
    ? (companyIndustryMap.get(compId) || companyIndustryMap.get(compNameLower) || '')
    : '';
  const compInd = compIndRaw ? normalizeAzText(compIndRaw) : '';

  if (compInd && compInd.length >= 3) {
    if (compInd === targetNorm || targetNorm.includes(compInd) || compInd.includes(targetNorm)) {
      return true;
    }
  }

  // 3. Known Category to Industry exact mapping
  const vCat = v.category ? normalizeAzText(v.category) : '';
  
  const industryCategoryMap: Record<string, string[]> = {
    'bank ve maliyye texnologiyalari': ['maliyye ve muhasibat', 'bankciliq ve sigorta'],
    'investisiya ve holdinqler': ['investisiya ve holdinqler', 'investisiya'],
    'it ve telekommunikasiya': ['it ve proqramlasdirma'],
    'perakende ticaret ve fmcg': ['satis ve musteri xidmetleri'],
    'muhendislik ve tikinti': ['muhendislik ve tikinti'],
    'sehiyye ve tibb': ['tibb eczaciliq ve sehiyye'],
    'tehsil ve telim': ['tehsil elm ve telim', 'telebeler ve tecrubeciler'],
    'otelcilik ve restoran horeca': ['restoran otel ve turizm horeca'],
    'huquq ve konsaltinq': ['huquq ve komplayens'],
    'logistika ve neqliyyat': ['logistika neqliyyat ve anbar'],
    'istehsalat ve senaye': ['istehsalat senaye ve texnologiya', 'energetika neft qaz ve meden'],
  };

  const matchedCategories = industryCategoryMap[targetNorm];
  if (matchedCategories && vCat && vCat.length >= 3) {
    if (matchedCategories.some((mc) => vCat === mc || vCat.includes(mc) || mc.includes(vCat))) {
      return true;
    }
  }

  // 4. Sector-specific corporate keywords in company name
  const compNorm = normalizeAzText(v.companyName || '');
  if (compNorm && compNorm.length >= 2) {
    if (targetNorm === 'bank ve maliyye texnologiyalari') {
      const bankKeywords = ['bank', 'bokt', 'pay', 'kapital', 'pasha', 'abb', 'yelo', 'unibank', 'rabita', 'fintech', 'kredit'];
      if (bankKeywords.some((kw) => compNorm.includes(kw))) return true;
    } else if (targetNorm === 'investisiya ve holdinqler') {
      const investKeywords = ['holdinq', 'holding', 'invest', 'investisiya'];
      if (investKeywords.some((kw) => compNorm.includes(kw))) return true;
    } else if (targetNorm === 'it ve telekommunikasiya') {
      const itKeywords = ['telekom', 'telecom', 'cell', 'tech', 'software', 'soft', 'it', 'digital', 'cloud'];
      if (itKeywords.some((kw) => compNorm.includes(kw))) return true;
    } else if (targetNorm === 'perakende ticaret ve fmcg') {
      const retailKeywords = ['supermarket', 'market', 'bazar', 'bravo', 'araz', 'rahat', 'retail', 'fmcg', 'irsad', 'irshad', 'kontakt', 'albali', 'veyseloglu'];
      if (retailKeywords.some((kw) => compNorm.includes(kw))) return true;
    } else if (targetNorm === 'muhendislik ve tikinti') {
      const buildKeywords = ['tikinti', 'insaat', 'construction', 'pmd', 'proyekt', 'engineering', 'muhendislik'];
      if (buildKeywords.some((kw) => compNorm.includes(kw))) return true;
    } else if (targetNorm === 'sehiyye ve tibb') {
      const medKeywords = ['hospital', 'klinik', 'medical', 'tibb', 'saglam', 'apteka', 'aptek', 'avromed', 'zeytun'];
      if (medKeywords.some((kw) => compNorm.includes(kw))) return true;
    } else if (targetNorm === 'tehsil ve telim') {
      const eduKeywords = ['mekteb', 'tedris', 'universitet', 'kurs', 'telim', 'akademiya', 'academy', 'education', 'school'];
      if (eduKeywords.some((kw) => compNorm.includes(kw))) return true;
    } else if (targetNorm === 'otelcilik ve restoran horeca') {
      const horecaKeywords = ['hotel', 'otel', 'restoran', 'restaurant', 'cafe', 'kafe', 'lounge', 'horeca', 'resort', 'turizm'];
      if (horecaKeywords.some((kw) => compNorm.includes(kw))) return true;
    } else if (targetNorm === 'huquq ve konsaltinq') {
      const lawKeywords = ['huquq', 'law', 'legal', 'konsaltinq', 'consulting', 'audit', 'komplayens'];
      if (lawKeywords.some((kw) => compNorm.includes(kw))) return true;
    } else if (targetNorm === 'logistika ve neqliyyat') {
      const logKeywords = ['logistika', 'logistics', 'karqo', 'cargo', 'express', 'kuryer', 'anbar', 'neqliyyat', 'transport', 'airlines', 'silk way'];
      if (logKeywords.some((kw) => compNorm.includes(kw))) return true;
    } else if (targetNorm === 'istehsalat ve senaye') {
      const indKeywords = ['socar', 'neft', 'qaz', 'oil', 'gas', 'zavod', 'fabrik', 'istehsal', 'senaye', 'enerji', 'energy'];
      if (indKeywords.some((kw) => compNorm.includes(kw))) return true;
    }
  }

  return false;
};

export const FEATURED_COMPANIES = [
  { name: 'PAŞA Holdinq MMC', logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=120&q=80', isPartner: true },
  { name: 'Kapital Bank ASC', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80', isHot: true },
  { name: 'Azercell Telekom MMC', logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=120&q=80' },
  { name: 'SOCAR Downstream MMC', logo: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80' },
  { name: 'Bravo Supermarketlər MMC', logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=120&q=80' },
  { name: 'ABB Bank ASC', logo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=120&q=80' },
  { name: 'PashaPay MMC', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80', isHot: true },
  { name: 'Veysəloğlu Şirkətlər Qrupu MMC', logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=120&q=80' },
  { name: 'İrşad Electronics MMC', logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=120&q=80' },
  { name: 'Silk Way West Airlines QSC', logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=120&q=80' },
  { name: 'PMD Projects MMC', logo: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=120&q=80' },
  { name: 'Baku Medical Plaza QSC', logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=120&q=80' },
  { name: 'IRES MMC', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&q=80', isPartner: true },
  { name: 'Kollekta MMC', logo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=120&q=80' },
  { name: 'International BOKT ASC', logo: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=120&q=80' },
];

export const LANDING_CATEGORIES = [
  { id: 'it', name: 'IT və Proqramlaşdırma', categoryKey: 'İT və Proqramlaşdırma', count: '340+', icon: Laptop, color: 'text-blue-600 bg-blue-50 border-blue-100 hover:border-blue-300' },
  { id: 'marketing', name: 'Marketinq və PR', categoryKey: 'Marketinq, Reklam və PR', count: '185+', icon: Megaphone, color: 'text-rose-600 bg-rose-50 border-rose-100 hover:border-rose-300' },
  { id: 'finance', name: 'Maliyyə və Mühasibat', categoryKey: 'Maliyyə və Mühasibat', count: '290+', icon: Landmark, color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300' },
  { id: 'education', name: 'Təhsil və Təlim', categoryKey: 'Təhsil, Elm və Təlim', count: '120+', icon: GraduationCap, color: 'text-amber-600 bg-amber-50 border-amber-100 hover:border-amber-300' },
  { id: 'design', name: 'Dizayn və Kreativ', categoryKey: 'Dizayn və Yaradıcılıq', count: '95+', icon: Palette, color: 'text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-300' },
  { id: 'sales', name: 'Satış və Müştəri Xidmətləri', categoryKey: 'Satış və Müştəri Xidmətləri', count: '410+', icon: ShoppingBag, color: 'text-cyan-600 bg-cyan-50 border-cyan-100 hover:border-cyan-300' },
  { id: 'engineering', name: 'Mühəndislik və İstehsalat', categoryKey: 'Mühəndislik və Tikinti', count: '215+', icon: Cog, color: 'text-orange-600 bg-orange-50 border-orange-100 hover:border-orange-300' },
  { id: 'hr', name: 'İnzibati və İnsan Resursları', categoryKey: 'İnsan Resursları (HR)', count: '160+', icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:border-indigo-300' },
];

export const JobExplorer: React.FC<JobExplorerProps> = ({
  vacancies,
  companies = [],
  onSelectVacancy,
  savedJobIds,
  onToggleBookmark,
  jobNotes = {},
  onSaveJobNote,
  onQuickApply,
  onOpenSalaryTrends,
  onOpenCalculia,
  onOpenNearbyMap,
  onOpenIntroTour,
  userCV,
  selectedCompany: propSelectedCompany = 'Hamısı',
  onSelectCompany,
  currentUser,
  onShowToast,
  onOpenAuthModal,
  onOpenProfileModal,
  onNavigateToTab,
}) => {
  const { dict, language, brandAcronym, brandSlogan, t } = useLanguage();

  // Task 1: Category Filters Column Dynamic Resizing & Collapsible State
  const MIN_FILTER_WIDTH = 220;
  const MAX_FILTER_WIDTH = 440;
  const DEFAULT_FILTER_WIDTH = 250;

  const [filterColumnWidth, setFilterColumnWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jobia_vacancies_filter_width');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= MIN_FILTER_WIDTH && val <= MAX_FILTER_WIDTH) {
          return val;
        }
      }
    } catch {}
    return DEFAULT_FILTER_WIDTH;
  });

  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jobia_vacancies_filter_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleFiltersCollapse = () => {
    setIsFiltersCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jobia_vacancies_filter_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const [isFilterDragging, setIsFilterDragging] = useState(false);
  const filterDragStartXRef = useRef(0);
  const filterDragStartWidthRef = useRef(DEFAULT_FILTER_WIDTH);

  const handleFilterSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFilterDragging(true);
    filterDragStartXRef.current = e.clientX;
    filterDragStartWidthRef.current = isFiltersCollapsed ? 60 : filterColumnWidth;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - filterDragStartXRef.current;
      const targetWidth = filterDragStartWidthRef.current + deltaX;
      const clampedWidth = Math.min(MAX_FILTER_WIDTH, Math.max(MIN_FILTER_WIDTH, targetWidth));
      setFilterColumnWidth(clampedWidth);

      if (isFiltersCollapsed && clampedWidth > 180) {
        setIsFiltersCollapsed(false);
        try {
          localStorage.setItem('jobia_vacancies_filter_collapsed', 'false');
        } catch {}
      }
    };

    const handleMouseUp = () => {
      setIsFilterDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      setFilterColumnWidth((current) => {
        try {
          localStorage.setItem('jobia_vacancies_filter_width', current.toString());
        } catch {}
        return current;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleFilterSplitterTouchStart = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    setIsFilterDragging(true);
    filterDragStartXRef.current = e.touches[0].clientX;
    filterDragStartWidthRef.current = isFiltersCollapsed ? 60 : filterColumnWidth;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!moveEvent.touches[0]) return;
      const deltaX = moveEvent.touches[0].clientX - filterDragStartXRef.current;
      const targetWidth = filterDragStartWidthRef.current + deltaX;
      const clampedWidth = Math.min(MAX_FILTER_WIDTH, Math.max(MIN_FILTER_WIDTH, targetWidth));
      setFilterColumnWidth(clampedWidth);

      if (isFiltersCollapsed && clampedWidth > 180) {
        setIsFiltersCollapsed(false);
        try {
          localStorage.setItem('jobia_vacancies_filter_collapsed', 'false');
        } catch {}
      }
    };

    const handleTouchEnd = () => {
      setIsFilterDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      setFilterColumnWidth((current) => {
        try {
          localStorage.setItem('jobia_vacancies_filter_width', current.toString());
        } catch {}
        return current;
      });
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Mode: 'simple' (accessible for blue-collar / everyone) vs 'detailed' (advanced with full AI/ATS)
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>(() => {
    try {
      const saved = localStorage.getItem('jobia_explorer_view_mode');
      if (saved === 'simple' || saved === 'detailed') return saved;
    } catch {
      // fallback
    }
    return 'simple'; // Default to friendly simple mode for everyone
  });

  const handleSetViewMode = (mode: 'simple' | 'detailed') => {
    setViewMode(mode);
    try {
      localStorage.setItem('jobia_explorer_view_mode', mode);
    } catch {
      // ignore
    }
  };

  // Job Alert & Subscriptions State
  const [isJobAlertModalOpen, setIsJobAlertModalOpen] = useState(false);
  const [candidateAlertSubscription, setCandidateAlertSubscription] = useState<JobAlertSubscription | null>(null);

  const candidateUserId = currentUser?.id || 'candidate-guest-session';

  useEffect(() => {
    let active = true;
    getJobAlertSubscription(candidateUserId).then((sub) => {
      if (active && sub) {
        setCandidateAlertSubscription(sub);
      }
    });

    const handleSubUpdated = (e: Event) => {
      const detail = (e as CustomEvent<JobAlertSubscription>).detail;
      if (detail) {
        setCandidateAlertSubscription(detail);
      }
    };

    window.addEventListener('jobia_job_alert_updated', handleSubUpdated);
    return () => {
      active = false;
      window.removeEventListener('jobia_job_alert_updated', handleSubUpdated);
    };
  }, [candidateUserId]);

  const activeAlertsCount = candidateAlertSubscription?.isActive !== false
    ? (candidateAlertSubscription?.categories?.length || 0) + (candidateAlertSubscription?.companies?.length || 0)
    : 0;

  const handleToggleCategoryAlert = async (e: React.MouseEvent, categoryName: string) => {
    e.stopPropagation();
    const currentCats = candidateAlertSubscription?.categories || [];
    const isSubscribed = currentCats.includes(categoryName);
    const updatedCats = isSubscribed
      ? currentCats.filter((c) => c !== categoryName)
      : [...currentCats, categoryName];

    const updatedSub: JobAlertSubscription = {
      id: candidateAlertSubscription?.id || `alert-${candidateUserId}`,
      userId: candidateUserId,
      userEmail: currentUser?.email,
      userName: currentUser?.fullName,
      categories: updatedCats,
      companies: candidateAlertSubscription?.companies || [],
      isActive: true,
      frequency: 'instant',
      createdAt: candidateAlertSubscription?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCandidateAlertSubscription(updatedSub);
    await saveJobAlertSubscription(updatedSub);
    if (onShowToast) {
      onShowToast(
        isSubscribed
          ? `"${categoryName}" izləmə siyahınızdan çıxarıldı.`
          : `"${categoryName}" kateqoriyası üzrə yeni vakansiyalar üçün canlı bildiriş aktivləşdirildi!`
      );
    }
  };

  const handleToggleCompanyAlert = async (e: React.MouseEvent, companyName: string) => {
    e.stopPropagation();
    const currentComps = candidateAlertSubscription?.companies || [];
    const isSubscribed = currentComps.some((c) => c.toLowerCase() === companyName.toLowerCase());
    const updatedComps = isSubscribed
      ? currentComps.filter((c) => c.toLowerCase() !== companyName.toLowerCase())
      : [...currentComps, companyName];

    const updatedSub: JobAlertSubscription = {
      id: candidateAlertSubscription?.id || `alert-${candidateUserId}`,
      userId: candidateUserId,
      userEmail: currentUser?.email,
      userName: currentUser?.fullName,
      categories: candidateAlertSubscription?.categories || [],
      companies: updatedComps,
      isActive: true,
      frequency: 'instant',
      createdAt: candidateAlertSubscription?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCandidateAlertSubscription(updatedSub);
    await saveJobAlertSubscription(updatedSub);
    if (onShowToast) {
      onShowToast(
        isSubscribed
          ? `"${companyName}" izləmə siyahınızdan çıxarıldı.`
          : `"${companyName}" şirkətinin yeni təsdiqlənmiş vakansiyaları üçün canlı bildiriş aktivləşdirildi!`
      );
    }
  };

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('Hamısı');
  const [selectedCompany, setSelectedCompany] = useState<string>(propSelectedCompany);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Hamısı');
  const [companySearchQuery, setCompanySearchQuery] = useState<string>('');
  const deferredCompanySearchQuery = useDeferredValue(companySearchQuery);
  const [selectedCity, setSelectedCity] = useState<string>('Hamısı');
  const [selectedType, setSelectedType] = useState<string>('Hamısı');
  const [selectedExperience, setSelectedExperience] = useState<string>('Hamısı');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyEasyApply, setOnlyEasyApply] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'salary-desc' | 'views-desc' | 'title-asc' | 'company-asc' | 'ai-match'>('newest');

  // Keep internal selectedCompany synced with prop
  useEffect(() => {
    if (propSelectedCompany !== undefined) {
      setSelectedCompany(propSelectedCompany);
    }
  }, [propSelectedCompany]);

  const handleSetCompany = (company: string) => {
    setSelectedCompany(company);
    if (onSelectCompany) {
      onSelectCompany(company);
    }
  };

  // Blue collar quick profession selection state (for simple view)
  const [quickProfessionFilter, setQuickProfessionFilter] = useState<string>('all');

  // Simple Mode Direct Quick Apply Modal State
  const [quickApplyJob, setQuickApplyJob] = useState<Vacancy | null>(null);
  const [quickApplicantName, setQuickApplicantName] = useState(userCV.personalInfo.fullName || '');
  const [quickApplicantPhone, setQuickApplicantPhone] = useState(userCV.personalInfo.phone || '');
  const [quickApplySuccess, setQuickApplySuccess] = useState(false);

  // AI Smart Search States
  const [isAiModeActive, setIsAiModeActive] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMatchesMap, setAiMatchesMap] = useState<Record<string, AIMatchResult>>({});
  const [aiSearchSummary, setAiSearchSummary] = useState<string | null>(null);
  const [hasActiveAiFilter, setHasActiveAiFilter] = useState(false);

  // Mobile dedicated filter modal state ('none' | 'categories' | 'industries' | 'companies' | 'filters' | 'ai')
  const [mobileFilterModal, setMobileFilterModal] = useState<'none' | 'categories' | 'industries' | 'companies' | 'filters' | 'ai'>('none');

  // Private note editing
  const [editingNoteJobId, setEditingNoteJobId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // Keep quick applicant info synced with user CV when available
  useEffect(() => {
    if (userCV?.personalInfo?.fullName && !quickApplicantName) {
      setQuickApplicantName(userCV.personalInfo.fullName);
    }
    if (userCV?.personalInfo?.phone && !quickApplicantPhone) {
      setQuickApplicantPhone(userCV.personalInfo.phone);
    }
  }, [userCV, quickApplicantName, quickApplicantPhone]);

  // Helper to format date in clean friendly local text (Bu gün, Dünən, etc.)
  const formatJobDate = (dateStr: string) => {
    try {
      const today = new Date();
      const postDate = new Date(dateStr);
      const diffTime = today.getTime() - postDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return language === 'en' ? 'Today' : language === 'ru' ? 'Сегодня' : 'Bu gün';
      }
      if (diffDays === 1) {
        return language === 'en' ? 'Yesterday' : language === 'ru' ? 'Вчера' : 'Dünən';
      }
      if (diffDays < 7) {
        return language === 'en' ? `${diffDays}d ago` : language === 'ru' ? `${diffDays} дн. назад` : `${diffDays} gün əvvəl`;
      }
      
      const monthsAz = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'];
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthsRu = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      
      const day = postDate.getDate();
      const monthIdx = postDate.getMonth();
      const monthStr = language === 'en' ? monthsEn[monthIdx] : language === 'ru' ? monthsRu[monthIdx] : monthsAz[monthIdx];
      return `${day} ${monthStr}`;
    } catch {
      return dateStr;
    }
  };

  // Helper for view count (e.g., 1400 -> 1.4K)
  const formatViewsCount = (count?: number) => {
    if (!count) return '45';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace('.0', '')}K`;
    }
    return count.toString();
  };

  // Posted Date filter in simple view (1 gün, 3 gün, 1 həftə, 2 həftə, Hamısı)
  const [postedDateFilter, setPostedDateFilter] = useState<string>('all');

  // Pre-calculate count of vacancies per category (Job Categories) - single pass O(N)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Hamısı: 0 };
    JOB_CATEGORIES.forEach((cat) => {
      counts[cat] = 0;
    });
    for (let i = 0; i < vacancies.length; i++) {
      const v = vacancies[i];
      if (v.isApproved !== true || v.status !== 'published') continue;
      counts.Hamısı = (counts.Hamısı || 0) + 1;
      if (counts[v.category] !== undefined) {
        counts[v.category] += 1;
      }
    }
    return counts;
  }, [vacancies]);

  // Companies List with Stats & Logotypes - single pass
  const companyListWithStats = useMemo(() => {
    const map: Record<string, { count: number; logo: string; verified: boolean; industry?: string }> = {};
    
    // Seed with real verified registered companies
    if (companies && Array.isArray(companies)) {
      for (let i = 0; i < companies.length; i++) {
        const c = companies[i];
        if (c.name && (c.verified || c.verificationStatus === 'verified')) {
          map[c.name] = {
            count: 0,
            logo: c.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}&backgroundColor=0284c7,16a34a,d97706,4f46e5`,
            verified: true,
            industry: c.industry,
          };
        }
      }
    }

    // Count and merge from actual approved published vacancies
    for (let i = 0; i < vacancies.length; i++) {
      const v = vacancies[i];
      if (v.isApproved !== true || v.status !== 'published' || !v.companyName) continue;
      const cName = v.companyName.trim();
      if (!map[cName]) {
        map[cName] = {
          count: 0,
          logo: v.companyLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cName)}&backgroundColor=0284c7,16a34a,d97706,4f46e5`,
          verified: true,
          industry: (v as any).industry || v.category,
        };
      }
      map[cName].count += 1;
    }

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        ...data,
      }))
      .filter((c) => c.count > 0 || (companies && companies.some((comp) => comp.name === c.name)))
      .sort((a, b) => b.count - a.count);
  }, [vacancies, companies]);

  // Filtered Company List for Sidebar search
  const filteredCompaniesForSidebar = useMemo(() => {
    if (!deferredCompanySearchQuery.trim()) return companyListWithStats;
    const q = deferredCompanySearchQuery.toLowerCase();
    return companyListWithStats.filter((c) => c.name.toLowerCase().includes(q));
  }, [companyListWithStats, deferredCompanySearchQuery]);

  // Company industry fast lookup cache
  const companyIndustryLookup = useMemo(() => {
    const map = new Map<string, string>();
    if (companies && Array.isArray(companies)) {
      for (let i = 0; i < companies.length; i++) {
        const c = companies[i];
        if (c.industry) {
          if (c.id) map.set(c.id, c.industry.trim());
          if (c.name) map.set(c.name.toLowerCase().trim(), c.industry.trim());
        }
      }
    }
    for (let i = 0; i < SAMPLE_COMPANIES.length; i++) {
      const c = SAMPLE_COMPANIES[i];
      if (c.industry) {
        if (c.id) map.set(c.id, c.industry.trim());
        if (c.name) map.set(c.name.toLowerCase().trim(), c.industry.trim());
      }
    }
    return map;
  }, [companies]);

  // Pre-calculate count of vacancies per Industry - single pass O(N)
  const industryStats = useMemo(() => {
    const counts: Record<string, number> = { 'Hamısı': 0 };
    for (let k = 0; k < COMPANY_INDUSTRIES.length; k++) {
      counts[COMPANY_INDUSTRIES[k]] = 0;
    }

    const activeList = vacancies.filter((v) => v.isApproved !== false && (v.status === 'published' || !v.status));
    counts['Hamısı'] = activeList.length;

    for (let i = 0; i < activeList.length; i++) {
      const v = activeList[i];
      for (let j = 0; j < COMPANY_INDUSTRIES.length; j++) {
        const ind = COMPANY_INDUSTRIES[j];
        if (isVacancyInIndustry(v, ind, companyIndustryLookup)) {
          counts[ind] = (counts[ind] || 0) + 1;
        }
      }
    }

    return counts;
  }, [vacancies, companyIndustryLookup]);

  // Quick Profession Buttons (Especially for Blue Collar & Service Roles)
  const quickProfessions = useMemo(() => {
    if (language === 'en') {
      return [
        { id: 'all', label: 'All Jobs', icon: '🌐', keywords: [] },
        { id: 'driver', label: 'Driver', icon: '🚗', keywords: ['sürücü', 'driver', 'şəxsi sürücü', 'avto'] },
        { id: 'seller', label: 'Cashier / Sales', icon: '🛒', keywords: ['kassir', 'satıcı', 'satış', 'kassa', 'sales', 'məsləhətçi'] },
        { id: 'courier', label: 'Courier / Delivery', icon: '🛵', keywords: ['kuryer', 'courier', 'çatdırılma', 'moto'] },
        { id: 'security', label: 'Security Guard', icon: '🛡️', keywords: ['mühafizə', 'mühafizəçi', 'təhlükəsizlik', 'security', 'keşikçi'] },
        { id: 'cook', label: 'Cook / Kitchen', icon: '🍳', keywords: ['aşpaz', 'mətbəx', 'qabyuyan', 'cook', 'chef'] },
        { id: 'worker', label: 'Technician / Handyman', icon: '🔨', keywords: ['fəhlə', 'usta', 'elektrik', 'santexnik', 'təmir', 'texnik'] },
        { id: 'cleaner', label: 'Cleaning Staff', icon: '🧹', keywords: ['xadimə', 'təmizlik', 'cleaner'] },
        { id: 'warehouse', label: 'Warehouse / Packer', icon: '📦', keywords: ['anbar', 'anbardar', 'paketləyici', 'fəhlə', 'warehouse'] },
        { id: 'operator', label: 'Call Center', icon: '📞', keywords: ['operator', 'zəng', 'call center', 'müştəri xidmətləri'] },
        { id: 'office', label: 'Office & Admin', icon: '🏢', keywords: ['ofis', 'inzibati', 'menecer', 'köməkçi', 'admin'] },
      ];
    }
    if (language === 'ru') {
      return [
        { id: 'all', label: 'Все вакансии', icon: '🌐', keywords: [] },
        { id: 'driver', label: 'Водитель', icon: '🚗', keywords: ['sürücü', 'водитель', 'driver', 'şəxsi sürücü', 'avto'] },
        { id: 'seller', label: 'Продавец / Кассир', icon: '🛒', keywords: ['kassir', 'satıcı', 'кассир', 'продавец', 'satış', 'kassa'] },
        { id: 'courier', label: 'Курьер / Доставка', icon: '🛵', keywords: ['kuryer', 'курьер', 'доставка', 'çatdırılma', 'moto'] },
        { id: 'security', label: 'Охранник', icon: '🛡️', keywords: ['mühafizə', 'mühafizəçi', 'охранник', 'təhlükəsizlik', 'security'] },
        { id: 'cook', label: 'Повар / Кухня', icon: '🍳', keywords: ['aşpaz', 'повар', 'mətbəx', 'qabyuyan', 'посудомойщица'] },
        { id: 'worker', label: 'Мастер / Электрик', icon: '🔨', keywords: ['fəhlə', 'usta', 'мастер', 'электрик', 'santexnik', 'texnik'] },
        { id: 'cleaner', label: 'Уборщица / Клининг', icon: '🧹', keywords: ['xadimə', 'уборщица', 'клининг', 'təmizlik'] },
        { id: 'warehouse', label: 'Кладовщик / Склад', icon: '📦', keywords: ['anbar', 'anbardar', 'кладовщик', 'склад', 'paketləyici'] },
        { id: 'operator', label: 'Оператор колл-центра', icon: '📞', keywords: ['operator', 'оператор', 'zəng', 'call center'] },
        { id: 'office', label: 'Офис / Администрация', icon: '🏢', keywords: ['ofis', 'офис', 'администратор', 'menecer'] },
      ];
    }
    return [
      { id: 'all', label: 'Bütün Vakansiyalar', icon: '🌐', keywords: [] },
      { id: 'driver', label: 'Sürücü', icon: '🚗', keywords: ['sürücü', 'driver', 'şəxsi sürücü', 'avto', 'sürücülük'] },
      { id: 'seller', label: 'Satıcı / Kassir', icon: '🛒', keywords: ['kassir', 'satıcı', 'satış', 'kassa', 'məsləhətçi'] },
      { id: 'courier', label: 'Kuryer / Çatdırılma', icon: '🛵', keywords: ['kuryer', 'çatdırılma', 'moto', 'kuryerlik'] },
      { id: 'security', label: 'Mühafizəçi', icon: '🛡️', keywords: ['mühafizə', 'mühafizəçi', 'təhlükəsizlik', 'keşikçi'] },
      { id: 'cook', label: 'Aşpaz / Mətbəx', icon: '🍳', keywords: ['aşpaz', 'mətbəx', 'qabyuyan', 'restoran'] },
      { id: 'worker', label: 'Fəhlə / Usta', icon: '🔨', keywords: ['fəhlə', 'usta', 'elektrik', 'santexnik', 'təmir', 'texnik'] },
      { id: 'cleaner', label: 'Xadimə / Təmizlik', icon: '🧹', keywords: ['xadimə', 'təmizlik', 'təmizkar'] },
      { id: 'warehouse', label: 'Anbardar / Paketləyici', icon: '📦', keywords: ['anbar', 'anbardar', 'paketləyici', 'sayım'] },
      { id: 'operator', label: 'Zəng Mərkəzi / Operator', icon: '📞', keywords: ['operator', 'zəng', 'call center', 'müştəri xidmətləri'] },
      { id: 'office', label: 'Ofis və İnzibati İşlər', icon: '🏢', keywords: ['ofis', 'inzibati', 'menecer', 'köməkçi', 'katibə'] },
    ];
  }, [language]);

  // AI Smart Search function
  const handleRunAiSearch = async (customPrompt?: string, useCVProfile: boolean = false) => {
    const queryToUse = customPrompt !== undefined ? customPrompt : aiPrompt;
    setIsAiSearching(true);
    setIsAiModeActive(true);
    setHasActiveAiFilter(true);

    try {
      const response = await safeFetchJson<any>('/api/ai/smart-search-vacancies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToUse,
          candidateCV: useCVProfile ? userCV : undefined,
          vacancies: vacancies.filter((v) => v.isApproved !== false && v.status === 'published'),
        }),
      });

      if (!response.ok || !response.data) {
        throw new Error(response.error || 'AI axtarış xətası');
      }

      const data = response.data;
      if (data && Array.isArray(data.matchedVacancies)) {
        const mapping: Record<string, AIMatchResult> = {};
        data.matchedVacancies.forEach((m: AIMatchResult) => {
          if (m && m.id && typeof m.matchScore === 'number' && m.matchScore >= 60) {
            mapping[m.id] = m;
          }
        });
        setAiMatchesMap(mapping);
        setSortBy('ai-match');

        const matchCount = Object.keys(mapping).length;
        if (useCVProfile) {
          setAiSearchSummary(
            language === 'en'
              ? `AI identified ${matchCount} precise matches for your profile (${userCV.personalInfo.jobTitle || 'CV'}).`
              : language === 'ru'
              ? `ИИ подобрал ${matchCount} точных вакансий по вашему резюме (${userCV.personalInfo.jobTitle || 'Резюме'}).`
              : `CV profilinizə (${userCV.personalInfo.jobTitle || 'İxtisas'}) uyğun ${matchCount} dəqiq vakansiya tapıldı.`
          );
        } else if (queryToUse.trim()) {
          setAiSearchSummary(
            language === 'en'
              ? `AI found ${matchCount} relevant matches for "${queryToUse}" (non-matching jobs filtered out).`
              : language === 'ru'
              ? `ИИ нашел ${matchCount} точных вакансий по запросу "${queryToUse}" (нерелевантные скрыты).`
              : `"${queryToUse}" sorğusuna dəqiq cavab verən ${matchCount} vakansiya tapıldı (uyğunsuz elanlar gizlədildi).`
          );
        } else {
          setAiSearchSummary(`${matchCount} uyğun vakansiya tapıldı.`);
        }
      }
    } catch (err) {
      console.warn('AI Smart Search local fallback matching:', err);
      const mapping: Record<string, AIMatchResult> = {};
      vacancies.forEach((job) => {
        if (job.isApproved !== true || job.status !== 'published') return;
        const res = evaluateSmartAiJobMatch(job, {
          query: useCVProfile ? '' : queryToUse,
          candidateCV: useCVProfile ? userCV : undefined,
          minAcceptableScore: 60,
        });
        if (res.isMatch && res.matchScore >= 60) {
          mapping[job.id] = {
            id: job.id,
            matchScore: res.matchScore,
            matchReason: res.matchReason,
            keyHighlights: res.keyHighlights,
          };
        }
      });
      setAiMatchesMap(mapping);
      setSortBy('ai-match');
      const matchCount = Object.keys(mapping).length;
      if (useCVProfile) {
        setAiSearchSummary(
          language === 'en'
            ? `AI identified ${matchCount} precise matches for your profile.`
            : language === 'ru'
            ? `ИИ подобрал ${matchCount} точных вакансий по вашему резюме.`
            : `CV profilinizə (${userCV.personalInfo.jobTitle || 'İxtisas'}) uyğun ${matchCount} dəqiq vakansiya tapıldı.`
        );
      } else {
        setAiSearchSummary(
          language === 'en'
            ? `AI found ${matchCount} relevant matches for "${queryToUse}".`
            : language === 'ru'
            ? `ИИ нашел ${matchCount} точных вакансий по запросу "${queryToUse}".`
            : `"${queryToUse}" sorğusuna dəqiq cavab verən ${matchCount} vakansiya tapıldı (uyğunsuz elanlar gizlədildi).`
        );
      }
    } finally {
      setIsAiSearching(false);
    }
  };

  // Clear only AI search filter
  const handleClearAiSearch = () => {
    setHasActiveAiFilter(false);
    setAiMatchesMap({});
    setAiSearchSummary(null);
    setAiPrompt('');
    setSortBy('newest');
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Hamısı');
    setSelectedCompany('Hamısı');
    setSelectedIndustry('Hamısı');
    setCompanySearchQuery('');
    setSelectedCity('Hamısı');
    setSelectedType('Hamısı');
    setSelectedExperience('Hamısı');
    setMinSalaryFilter(0);
    setOnlyFeatured(false);
    setOnlyEasyApply(false);
    setOnlySaved(false);
    setSortBy('newest');
    setQuickProfessionFilter('all');
    setPostedDateFilter('all');
    setIsAiModeActive(false);
    setHasActiveAiFilter(false);
    setAiPrompt('');
    setAiMatchesMap({});
    setAiSearchSummary(null);
  };

  // Quick Preset Prompts
  const quickAiPrompts = useMemo(() => {
    if (language === 'en') {
      return [
        { label: '🎯 Match My CV', isCV: true },
        { label: '🚀 High Salary (2500+ AZN)', prompt: '2500 AZN and higher salary vacancies' },
        { label: '💻 Frontend & Dev', prompt: 'React, TypeScript, JavaScript and Developer roles' },
        { label: '🏠 Full Remote', prompt: 'Remote work vacancies' },
        { label: '🎓 Students & Internships', prompt: 'Internship and junior entry level programs' },
        { label: '📊 Finance & Accounting', prompt: 'Financial analyst, 1C and accounting roles' },
        { label: '🏥 Medical & Pharmacy', prompt: 'Doctors, pharmacists and healthcare roles' },
        { label: '🚚 Logistics & Supply', prompt: 'Logistics, transport and supply chain vacancies' },
      ];
    }
    if (language === 'ru') {
      return [
        { label: '🎯 По моему резюме', isCV: true },
        { label: '🚀 Высокая зарплата (2500+ AZN)', prompt: 'Вакансии с зарплатой от 2500 AZN и выше' },
        { label: '💻 Frontend и Разработка', prompt: 'React, TypeScript, JavaScript и веб-разработка' },
        { label: '🏠 Удаленная работа (Remote)', prompt: 'Удаленный формат работы Remote' },
        { label: '🎓 Для студентов и стажеров', prompt: 'Программы стажировок и вакансии для начинающих' },
        { label: '📊 Финансы и Бухгалтерия', prompt: 'Финансовые аналитики, 1C и бухучет' },
        { label: '🏥 Медицина и Фармацевтика', prompt: 'Врачи, фармацевты и здравоохранение' },
        { label: '🚚 Логистика и Снабжение', prompt: 'Логистика, таможня и закупки' },
      ];
    }
    return [
      { label: '🎯 Mənim CV-mə Görə', isCV: true },
      { label: '🚀 Yüksək Maaşlı (2500+ AZN)', prompt: '2500 AZN və daha yüksək maaşlı vakansiyalar' },
      { label: '💻 Frontend & Proqramlaşdırma', prompt: 'React, TypeScript, JavaScript və Proqramlaşdırma' },
      { label: '🏠 Tam Uzaqdan (Remote)', prompt: 'Uzaqdan Remote iş rejimi olan vakansiyalar' },
      { label: '🎓 Tələbə & Təcrübə Proqramları', prompt: 'Tələbələr və yeni başlayanlar üçün təcrübə proqramları' },
      { label: '📊 Maliyyə & 1C Mühasibat', prompt: 'Maliyyə analitiki, 1C və mühasibatlıq elanları' },
      { label: '🏥 Tibb & Əczaçılıq', prompt: 'Həkim, əczaçı və səhiyyə vakansiyaları' },
      { label: '🚚 Logistika & Təchizat', prompt: 'Logistika, nəqliyyat və gömrük vakansiyaları' },
    ];
  }, [language]);

  // Precomputed job search metadata cache for O(1) instant text queries and sorting
  const jobSearchMetadata = useMemo(() => {
    const map = new Map<string, { corpus: string; postedTime: number; companyLower: string; titleLower: string }>();
    const now = Date.now();
    for (let i = 0; i < vacancies.length; i++) {
      const v = vacancies[i];
      const corpus = normalizeAzText(
        `${v.title} ${v.companyName} ${v.skills.join(' ')} ${v.description} ${v.category} ${v.city} ${(v.requirements || []).join(' ')} ${(v.responsibilities || []).join(' ')}`
      );
      let pTime = now;
      try {
        pTime = new Date(v.postedDate).getTime() || now;
      } catch {
        pTime = now;
      }
      map.set(v.id, {
        corpus,
        postedTime: pTime,
        companyLower: normalizeAzText(v.companyName),
        titleLower: normalizeAzText(v.title),
      });
    }
    return map;
  }, [vacancies]);

  // Filtering & Sorting (High Performance O(N) single-pass filter with Semantic Domain Matching)
  const filteredAndSortedVacancies = useMemo(() => {
    const q = deferredSearchQuery.trim();
    const isCompFiltered = selectedCompany !== 'Hamısı';
    const compLower = normalizeAzText(selectedCompany);
    const isCatFiltered = selectedCategory !== 'Hamısı';
    const isIndFiltered = selectedIndustry !== 'Hamısı';
    const indLower = normalizeAzText(selectedIndustry);
    const isCityFiltered = selectedCity !== 'Hamısı';
    const isTypeFiltered = selectedType !== 'Hamısı';
    const isExpFiltered = selectedExperience !== 'Hamısı';
    const isDateFiltered = postedDateFilter !== 'all';
    const currentRefTime = Date.now();

    const selectedProf = quickProfessionFilter !== 'all' 
      ? quickProfessions.find((p) => p.id === quickProfessionFilter) 
      : null;
    const profKeywords = selectedProf && selectedProf.keywords.length > 0 ? selectedProf.keywords : null;

    const result: Vacancy[] = [];

    for (let i = 0; i < vacancies.length; i++) {
      const job = vacancies[i];
      if (job.isApproved !== true || job.status !== 'published') continue;

      // STRICT AI SEARCH FILTERING:
      // If AI search is active, ONLY output vacancies that matched the AI criteria (matchScore >= 60)!
      // Non-matching vacancies MUST BE EXCLUDED ("qalanını çıxarmasın")!
      if (hasActiveAiFilter) {
        const aiMatch = aiMatchesMap[job.id];
        if (!aiMatch || aiMatch.matchScore < 60) {
          continue; // EXCLUDE non-matching jobs!
        }
      }

      const meta = jobSearchMetadata.get(job.id);
      const corpus = meta ? meta.corpus : '';

      // Quick Profession Filter
      if (profKeywords) {
        let matchesProf = false;
        for (let k = 0; k < profKeywords.length; k++) {
          const normKw = normalizeAzText(profKeywords[k]);
          if (corpus.includes(normKw)) {
            matchesProf = true;
            break;
          }
        }
        if (!matchesProf) continue;
      }

      // Robust Semantic & Domain Keyword Search
      if (q) {
        const domainMatch = evaluateJobDomainMatch(job, q);
        if (!domainMatch.isMatch) {
          continue;
        }
      }

      // Category filter
      if (isCatFiltered && job.category !== selectedCategory) {
        continue;
      }

      // Company filter (supports formal names like MMC, ASC, QSC and base names)
      if (isCompFiltered) {
        const jobComp = meta?.companyLower || '';
        const cleanSelected = compLower.replace(/\b(mmc|asc|qsc|llc|inc|holdinq|holding|telecom|telekom|bank|supermarket|supermarketler|sirketler qrupu)\b/gi, '').trim();
        const cleanJobComp = jobComp.replace(/\b(mmc|asc|qsc|llc|inc|holdinq|holding|telecom|telekom|bank|supermarket|supermarketler|sirketler qrupu)\b/gi, '').trim();
        
        const isCompMatch = jobComp === compLower ||
          jobComp.includes(compLower) ||
          compLower.includes(jobComp) ||
          (cleanSelected.length >= 3 && cleanJobComp.length >= 3 && (cleanJobComp.includes(cleanSelected) || cleanSelected.includes(cleanJobComp)));
        
        if (!isCompMatch) {
          continue;
        }
      }

      // Company Industry filter
      if (isIndFiltered) {
        if (!isVacancyInIndustry(job, selectedIndustry, companyIndustryLookup)) {
          continue;
        }
      }

      // City filter - flexible exact and manual city keyword matching
      if (isCityFiltered) {
        const cityQuery = normalizeAzText(selectedCity);
        const jobCity = normalizeAzText(job.city || '');
        const jobLoc = normalizeAzText(job.location || '');
        if (!jobCity.includes(cityQuery) && !jobLoc.includes(cityQuery)) {
          continue;
        }
      }

      // Employment type filter
      if (isTypeFiltered && job.employmentType !== selectedType) {
        continue;
      }

      // Experience level filter
      if (isExpFiltered && job.experienceLevel !== selectedExperience) {
        continue;
      }

      // Featured only
      if (onlyFeatured && !job.isFeatured) {
        continue;
      }

      // Easy Apply only (LinkedIn model)
      if (onlyEasyApply && job.isEasyApply === false) {
        continue;
      }

      // Saved only
      if (onlySaved && !savedJobIds.includes(job.id)) {
        continue;
      }

      // Min salary filter
      if (minSalaryFilter > 0 && job.maxSalary && job.maxSalary < minSalaryFilter) {
        continue;
      }

      // Posted Date filter
      if (isDateFiltered && meta) {
        const diffDays = (currentRefTime - meta.postedTime) / (1000 * 60 * 60 * 24);
        if (postedDateFilter === '1_day' && diffDays > 1) continue;
        if (postedDateFilter === '3_days' && diffDays > 3) continue;
        if (postedDateFilter === '1_week' && diffDays > 7) continue;
        if (postedDateFilter === '10_days' && diffDays > 10) continue;
        if (postedDateFilter === '2_weeks' && diffDays > 14) continue;
      }

      result.push(job);
    }

    // Fast Sorting
    result.sort((a, b) => {
      if (hasActiveAiFilter || sortBy === 'ai-match') {
        const scoreA = aiMatchesMap[a.id]?.matchScore || 0;
        const scoreB = aiMatchesMap[b.id]?.matchScore || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
      }

      // If user typed a search query, prioritize higher domain match relevance
      if (q && sortBy === 'newest') {
        const scoreA = evaluateJobDomainMatch(a, q).score;
        const scoreB = evaluateJobDomainMatch(b, q).score;
        if (Math.abs(scoreB - scoreA) >= 20) {
          return scoreB - scoreA;
        }
      }

      if (sortBy === 'salary-desc') {
        return (b.maxSalary || 0) - (a.maxSalary || 0);
      }

      if (sortBy === 'views-desc') {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }

      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === 'company-asc') {
        return a.companyName.localeCompare(b.companyName);
      }

      // Default: Featured first, then newest date
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      const tA = jobSearchMetadata.get(a.id)?.postedTime || 0;
      const tB = jobSearchMetadata.get(b.id)?.postedTime || 0;
      return tB - tA;
    });

    return result;
  }, [
    vacancies,
    jobSearchMetadata,
    deferredSearchQuery,
    quickProfessionFilter,
    quickProfessions,
    selectedCategory,
    selectedCompany,
    selectedIndustry,
    companyIndustryLookup,
    selectedCity,
    selectedType,
    selectedExperience,
    minSalaryFilter,
    postedDateFilter,
    onlyFeatured,
    onlyEasyApply,
    onlySaved,
    sortBy,
    savedJobIds,
    aiMatchesMap,
    hasActiveAiFilter,
  ]);

  // High performance pagination & DOM windowing (prevents browser freezing & lagging)
  const [visibleCount, setVisibleCount] = useState<number>(20);

  useEffect(() => {
    setVisibleCount(20);
  }, [
    deferredSearchQuery,
    quickProfessionFilter,
    postedDateFilter,
    selectedCategory,
    selectedCompany,
    selectedIndustry,
    selectedCity,
    selectedType,
    selectedExperience,
    minSalaryFilter,
    onlyFeatured,
    onlyEasyApply,
    onlySaved,
    sortBy,
    hasActiveAiFilter,
  ]);

  const visibleVacancies = useMemo(() => {
    return filteredAndSortedVacancies.slice(0, visibleCount);
  }, [filteredAndSortedVacancies, visibleCount]);

  const activeFiltersCount = [
    searchQuery.trim() !== '',
    quickProfessionFilter !== 'all',
    postedDateFilter !== 'all',
    selectedCategory !== 'Hamısı',
    selectedCompany !== 'Hamısı',
    selectedIndustry !== 'Hamısı',
    selectedCity !== 'Hamısı',
    selectedType !== 'Hamısı',
    selectedExperience !== 'Hamısı',
    minSalaryFilter > 0,
    onlyFeatured,
    onlyEasyApply,
    onlySaved,
    hasActiveAiFilter,
  ].filter(Boolean).length;

  // Handle Quick Direct WhatsApp Message
  const handleOpenWhatsApp = (job: Vacancy) => {
    const phone = job.contactWhatsapp || '994502001122';
    const text = encodeURIComponent(
      `Salam! jobia.az portalında yerləşdirdiyiniz "${job.title}" (${job.companyName}) vakansiyası ilə maraqlanıram. Zəhmət olmasa əlavə məlumat verərdiniz.`
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  // Handle Simple Quick Apply Submission
  const handleConfirmQuickApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickApplyJob) return;

    if (onQuickApply) {
      onQuickApply(quickApplyJob);
    }
    setQuickApplySuccess(true);
    setTimeout(() => {
      setQuickApplySuccess(false);
      setQuickApplyJob(null);
    }, 1800);
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. TOP BAR: INTEGRATED SEARCH & VIEW MODE BAR                             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 sm:p-4 space-y-3">
        {/* Row 1: Search input and City selector */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          {/* Main search */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="top-quick-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchQuery('');
              }}
              placeholder={language === 'en' ? 'Search by title, company or keyword...' : language === 'ru' ? 'Поиск по должности, компании или ключевым словам...' : 'Vəzifə, şirkət və ya açar sözlə axtarın...'}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                id="top-quick-search-clear-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 p-1 rounded-lg cursor-pointer transition-colors"
                title={language === 'en' ? 'Clear search' : language === 'ru' ? 'Очистить' : 'Təmizlə'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* City selector with manual search */}
          <div className="w-full sm:w-52 md:w-56 shrink-0 relative z-20">
            <CitySearchSelect
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
            />
          </div>
        </div>

        {/* Row 2: Action Toolbar (Bütün Filtrlər, ⚡ Tez Müraciət, AI ilə Axtarış, Xəritədə Axtarış) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1 border-t border-slate-100/90">
          {/* Button 1: Consolidated Filters Button */}
          <button
            type="button"
            id="btn-all-filters-consolidated"
            onClick={() => {
              setMobileFilterModal('filters');
              if (isFiltersCollapsed && window.innerWidth >= 1024) {
                handleToggleFiltersCollapse();
              }
            }}
            className={`h-10 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap ${
              activeFiltersCount > 0
                ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/40'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
            title={dict.filters?.title || (language === 'en' ? 'All Filters' : language === 'ru' ? 'Все фильтры' : 'Bütün Filtrlər')}
          >
            <div className="flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 -ml-0.5 opacity-80" />
            </div>
            <span className="truncate">
              {dict.filters?.title || (language === 'en' ? 'Filters' : language === 'ru' ? 'Фильтры' : 'Filtrlər')}
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-blue-700 text-[10px] sm:text-xs font-black shrink-0">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Button 2: LinkedIn Model Tez Müraciət (Easy Apply) */}
          <button
            type="button"
            id="btn-easy-apply-toggle"
            onClick={() => setOnlyEasyApply((prev) => !prev)}
            className={`h-10 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap ${
              onlyEasyApply
                ? 'bg-blue-700 text-white shadow-xs ring-2 ring-blue-400/40'
                : 'bg-blue-50/90 hover:bg-blue-100/90 text-blue-800 border border-blue-200/90'
            }`}
            title="LinkedIn modeli: 1 kliklə asan müraciət olunan vakansiyalar"
          >
            <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${onlyEasyApply ? 'fill-white text-white' : 'fill-blue-600 text-blue-600'}`} />
            <span className="truncate">Tez Müraciət</span>
          </button>

          {/* Button 3: AI Search Button (AI ilə axtarış) */}
          <button
            type="button"
            id="btn-ai-search"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileFilterModal('ai');
              } else {
                setIsAiModeActive(!isAiModeActive);
              }
            }}
            className={`h-10 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap ${
              isAiModeActive || hasActiveAiFilter
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80'
            }`}
            title={dict.jobExplorer?.aiSearch || (language === 'en' ? 'AI Search' : language === 'ru' ? 'AI Поиск' : 'AI Axtarış')}
          >
            <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isAiModeActive || hasActiveAiFilter ? 'text-white' : 'text-blue-600'}`} />
            <span className="truncate">
              {language === 'en' ? 'AI Search' : language === 'ru' ? 'AI Поиск' : 'AI Axtarış'}
            </span>
          </button>

          {/* Button 4: Nearby Map Search */}
          {onOpenNearbyMap && (
            <button
              type="button"
              id="btn-nearby-map-search"
              onClick={onOpenNearbyMap}
              className="h-10 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
              title={language === 'en' ? 'Map Search' : language === 'ru' ? 'Поиск на карте' : 'Xəritədə Axtarış'}
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
              <span className="truncate">
                {language === 'en' ? 'Map' : language === 'ru' ? 'Карта' : 'Xəritədə'}
              </span>
            </button>
          )}
        </div>

        {/* Active Filter Chips Bar (Instant visibility & 1-click reset) */}
        {activeFiltersCount > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-blue-600" />
                {dict.filters?.activeFilters || 'Filtrlər'}:
              </span>

              {quickProfessionFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
                  {quickProfessions.find((p) => p.id === quickProfessionFilter)?.label}
                  <button type="button" onClick={() => setQuickProfessionFilter('all')} className="hover:text-rose-600 cursor-pointer">✕</button>
                </span>
              )}

              {selectedCategory !== 'Hamısı' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
                  📁 {getLocalizedCategory(selectedCategory, language)}
                  <button type="button" onClick={() => setSelectedCategory('Hamısı')} className="hover:text-rose-600 cursor-pointer">✕</button>
                </span>
              )}

              {selectedCity !== 'Hamısı' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
                  📍 {getLocalizedCity(selectedCity, language)}
                  <button type="button" onClick={() => setSelectedCity('Hamısı')} className="hover:text-rose-600 cursor-pointer">✕</button>
                </span>
              )}

              {minSalaryFilter > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  💰 {minSalaryFilter}+ AZN
                  <button type="button" onClick={() => setMinSalaryFilter(0)} className="hover:text-rose-600 cursor-pointer">✕</button>
                </span>
              )}

              {onlyFeatured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-300">
                  👑 VIP Premium
                  <button type="button" onClick={() => setOnlyFeatured(false)} className="hover:text-rose-600 cursor-pointer">✕</button>
                </span>
              )}

              {onlyEasyApply && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 text-[11px] font-bold border border-blue-300">
                  ⚡ Tez Müraciət (Easy Apply)
                  <button type="button" onClick={() => setOnlyEasyApply(false)} className="hover:text-rose-600 cursor-pointer">✕</button>
                </span>
              )}

              {searchQuery.trim() !== '' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                  🔍 "{searchQuery}"
                  <button type="button" onClick={() => setSearchQuery('')} className="hover:text-rose-600 cursor-pointer">✕</button>
                </span>
              )}
            </div>

            <button
              type="button"
              id="top-reset-all-filters-btn"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer hover:underline shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{dict.filters?.reset || 'Bütün filtrləri sıfırla'}</span>
            </button>
          </div>
        )}

        {/* AI SMART SEARCH BAR (Accessible directly from top) */}
        {isAiModeActive && (
          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/90 space-y-2.5 animate-fade-in relative">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>{language === 'en' ? 'AI Smart Search Assistant' : language === 'ru' ? 'AI Умный поиск' : 'AI Ağıllı Axtarış Köməkçisi'}</span>
              </div>
              <button
                type="button"
                id="btn-close-ai-search-panel"
                onClick={() => setIsAiModeActive(false)}
                className="px-2 py-0.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title={language === 'en' ? 'Close AI Search' : language === 'ru' ? 'Закрыть AI поиск' : 'AI Axtarış panelini bağla'}
              >
                <X className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Close' : language === 'ru' ? 'Закрыть' : 'Bağla'}</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Sparkles className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunAiSearch();
                  }}
                  placeholder={dict.jobExplorer.aiSearchPromptPlaceholder || 'Tələblərinizi yazın (Məs: Bakıda 1500+ remote backend developer)...'}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRunAiSearch()}
                  disabled={isAiSearching}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  {isAiSearching ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{dict.jobExplorer.searching || 'Axtarılır...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{dict.jobExplorer.runAiSearch || 'AI Axtarış'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleRunAiSearch(undefined, true)}
                  disabled={isAiSearching}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  <span>🎯 CV-yə görə</span>
                </button>
              </div>
            </div>

            {/* Quick AI Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-slate-700 mr-1 flex items-center gap-1">
                Hazır Şablonlar:
              </span>
              {quickAiPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (p.isCV) {
                      handleRunAiSearch(undefined, true);
                    } else if (p.prompt) {
                      setAiPrompt(p.prompt);
                      handleRunAiSearch(p.prompt);
                    }
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN LAYOUT: LEFT FILTERS + RIGHT VACANCIES (IMMEDIATE)       */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row gap-3.5 sm:gap-4 xl:gap-5 items-start relative">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: DESKTOP FILTERS (Hidden on mobile for instant vacancy view)  */}
        {/* ========================================================================= */}
        <aside
          id="vacancies-category-filters-column"
          style={{
            width: isFiltersCollapsed ? '54px' : `${filterColumnWidth}px`,
          }}
          className={`hidden lg:block shrink-0 relative ${
            isFilterDragging ? 'transition-none select-none' : 'transition-[width] duration-200 ease-in-out'
          }`}
        >
          {isFiltersCollapsed ? (
            /* Collapsed Strip View */
            <div className="bg-white rounded-2xl border border-slate-200 p-2 space-y-3 flex flex-col items-center shadow-xs">
              <button
                type="button"
                onClick={handleToggleFiltersCollapse}
                className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                title={dict.common?.expandFilters || 'Filtrləri Aç'}
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <div className="w-full border-t border-slate-100 my-1" />
              <button
                type="button"
                onClick={handleToggleFiltersCollapse}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-sm"
                title={dict.filters?.categories || 'Vəzifə Kateqoriyaları'}
              >
                📁
              </button>
              <button
                type="button"
                onClick={handleToggleFiltersCollapse}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-sm"
                title={dict.filters?.industries || 'Şirkətlərin Kateqoriyası'}
              >
                🏢
              </button>
              <button
                type="button"
                onClick={handleToggleFiltersCollapse}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-sm"
                title={dict.filters?.companies || 'Şirkətlərin Adı'}
              >
                🏛️
              </button>
            </div>
          ) : (
            /* Full Expanded Filters Column */
            <div className="space-y-3.5">
              {/* Header with Quick Collapse Toggle */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  <span>{dict.filters?.title || 'Filtrlər'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleToggleFiltersCollapse}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                  title={dict.common?.collapseFilters || 'Filtrləri yığcamlaşdır'}
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* Active Filter Chips & Reset */}
              {activeFiltersCount > 0 && (
                <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-3 space-y-2 shadow-2xs animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-blue-600" />
                      <span>{dict.filters?.activeFilters || 'Aktiv Filtrlər'} ({activeFiltersCount})</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{dict.filters?.reset || 'Sıfırla'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {selectedCategory !== 'Hamısı' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                        📁 {getLocalizedCategory(selectedCategory, language)}
                        <button type="button" onClick={() => setSelectedCategory('Hamısı')} className="text-blue-400 hover:text-blue-700">✕</button>
                      </span>
                    )}
                    {selectedIndustry !== 'Hamısı' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                        🏢 {getLocalizedIndustry(selectedIndustry, language)}
                        <button type="button" onClick={() => setSelectedIndustry('Hamısı')} className="text-blue-400 hover:text-blue-700">✕</button>
                      </span>
                    )}
                    {selectedCompany !== 'Hamısı' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                        🏛️ {selectedCompany}
                        <button type="button" onClick={() => setSelectedCompany('Hamısı')} className="text-blue-400 hover:text-blue-700">✕</button>
                      </span>
                    )}
                    {selectedCity !== 'Hamısı' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                        📍 {getLocalizedCity(selectedCity, language)}
                        <button type="button" onClick={() => setSelectedCity('Hamısı')} className="text-blue-400 hover:text-blue-700">✕</button>
                      </span>
                    )}
                    {minSalaryFilter > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                        💰 {minSalaryFilter}+ AZN
                        <button type="button" onClick={() => setMinSalaryFilter(0)} className="text-blue-400 hover:text-blue-700">✕</button>
                      </span>
                    )}
                    {onlyFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200 shadow-2xs">
                        <Crown className="w-3 h-3 fill-current text-amber-600" /> VIP Premium
                        <button type="button" onClick={() => setOnlyFeatured(false)} className="text-amber-700 hover:text-amber-950">✕</button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 text-[11px] font-bold border border-blue-200 shadow-2xs">
                        🔍 {searchQuery}
                        <button type="button" onClick={() => setSearchQuery('')} className="text-blue-400 hover:text-blue-700">✕</button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* CARD 1: VƏZİFƏLƏRİN KATEQORİYASI (Job Categories) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      📁
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {dict.filters?.categories || 'Vəzifə Kateqoriyaları'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsJobAlertModalOpen(true)}
                      className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title={dict.filters?.followCategoryTip || 'Kateqoriya izləmə tənzimləmələri'}
                    >
                      <Bell className="w-2.5 h-2.5" />
                      <span>{dict.filters?.follow || 'İzlə'}</span>
                    </button>
                    <span className="text-[11px] font-bold text-slate-500">
                      {JOB_CATEGORIES.length}
                    </span>
                  </div>
                </div>

                <div className="p-2 max-h-64 overflow-y-auto scrollbar-thin space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('Hamısı')}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedCategory === 'Hamısı'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{dict.filters?.allCategories || 'Bütün Kateqoriyalar'}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedCategory === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {vacancies.filter((v) => v.isApproved !== false).length}
                    </span>
                  </button>

                  {JOB_CATEGORIES.map((cat) => {
                    const count = categoryCounts[cat] || 0;
                    const isSelected = selectedCategory === cat;
                    const isAlertSubscribed =
                      candidateAlertSubscription?.isActive !== false &&
                      (candidateAlertSubscription?.categories || []).includes(cat);

                    return (
                      <div key={cat} className="group/cat flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(isSelected ? 'Hamısı' : cat)}
                          className={`flex-1 px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer min-w-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          <span className="truncate pr-2">{getLocalizedCategory(cat, language)}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {count}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleToggleCategoryAlert(e, cat)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                            isAlertSubscribed
                              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                              : 'text-slate-300 hover:text-blue-600 hover:bg-slate-100 opacity-60 group-hover/cat:opacity-100'
                          }`}
                          title={
                            isAlertSubscribed
                              ? `"${getLocalizedCategory(cat, language)}" ${dict.filters?.following || 'izlənilir'}`
                              : `"${getLocalizedCategory(cat, language)}" ${dict.filters?.followTip || 'üzrə yeni vakansiyaları izlə'}`
                          }
                        >
                          {isAlertSubscribed ? (
                            <BellRing className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Bell className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CARD 2: ŞİRKƏTLƏRİN KATEQORİYASI / SAHƏLƏRİ (Company Industries) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      🏢
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {dict.filters?.industries || 'Şirkətlərin Kateqoriyası'}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {COMPANY_INDUSTRIES.length}
                  </span>
                </div>

                <div className="p-2 max-h-56 overflow-y-auto scrollbar-thin space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedIndustry('Hamısı')}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedIndustry === 'Hamısı'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{dict.filters?.allIndustries || 'Bütün Sahələr'}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedIndustry === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {industryStats['Hamısı'] || vacancies.filter((v) => v.isApproved !== false && (v.status === 'published' || !v.status)).length}
                    </span>
                  </button>

                  {COMPANY_INDUSTRIES.map((ind) => {
                    const count = industryStats[ind] || 0;
                    const isSelected = selectedIndustry === ind;
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => setSelectedIndustry(isSelected ? 'Hamısı' : ind)}
                        className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <span className="truncate pr-2">{getLocalizedIndustry(ind, language)}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CARD 3: ŞİRKƏTLƏRİN ADI (Companies List with search) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        🏛️
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        {dict.filters?.companies || 'Şirkətlərin Adı'}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {companyListWithStats.length}
                    </span>
                  </div>

                  {/* Mini Company Search Input */}
                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={companySearchQuery}
                      onChange={(e) => setCompanySearchQuery(e.target.value)}
                      placeholder={dict.filters?.searchCompanyPlaceholder || 'Şirkət axtar...'}
                      className="w-full pl-7 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500"
                    />
                    {companySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCompanySearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-2 max-h-60 overflow-y-auto scrollbar-thin space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCompany('Hamısı')}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedCompany === 'Hamısı'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{dict.filters?.allCompanies || 'Bütün Şirkətlər'}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedCompany === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {vacancies.filter((v) => v.isApproved !== false).length}
                    </span>
                  </button>

                  {filteredCompaniesForSidebar.map((comp) => {
                    const isSelected = selectedCompany.toLowerCase() === comp.name.toLowerCase();
                    const isCompSubscribed =
                      candidateAlertSubscription?.isActive !== false &&
                      (candidateAlertSubscription?.companies || []).some(
                        (c) => c.toLowerCase() === comp.name.toLowerCase()
                      );

                    return (
                      <div key={comp.name} className="group/comp flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCompany(isSelected ? 'Hamısı' : comp.name)}
                          className={`flex-1 px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer min-w-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <img
                              src={comp.logo}
                              alt={comp.name}
                              className="w-4 h-4 rounded object-cover border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <span className="truncate">{comp.name}</span>
                            {comp.verified && (
                              <CheckCircle className={`w-3 h-3 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                            )}
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {comp.count}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleToggleCompanyAlert(e, comp.name)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                            isCompSubscribed
                              ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                              : 'text-slate-300 hover:text-indigo-600 hover:bg-slate-100 opacity-60 group-hover/comp:opacity-100'
                          }`}
                          title={
                            isCompSubscribed
                              ? `"${comp.name}" ${dict.filters?.following || 'izlənilir'}`
                              : `"${comp.name}" ${dict.filters?.followCompanyTip || 'şirkətini izlə'}`
                          }
                        >
                          {isCompSubscribed ? (
                            <BellRing className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <Bell className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CARD 4: ŞƏHƏR VƏ MAAŞ FİLTRİ */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{dict.filters?.cityAndSalary || 'Şəhər və Əməkhaqqı'}</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {language === 'en' ? 'City' : language === 'ru' ? 'Город' : 'Şəhər'}:
                    </label>
                    <CitySearchSelect
                      selectedCity={selectedCity}
                      onSelectCity={setSelectedCity}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      {dict.jobExplorer?.minSalary || 'Minimum Maaş'}:
                    </label>
                    <select
                      value={minSalaryFilter}
                      onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value={0}>💰 {dict.filters?.allSalaries || 'Bütün Maaşlar'}</option>
                      <option value={500}>500+ AZN</option>
                      <option value={800}>800+ AZN</option>
                      <option value={1000}>1,000+ AZN</option>
                      <option value={1500}>1,500+ AZN</option>
                      <option value={2000}>2,000+ AZN</option>
                      <option value={3000}>3,000+ AZN</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/60 transition-colors cursor-pointer">
                      <div className="flex items-center gap-1.5">
                        <Crown className={`w-3.5 h-3.5 ${onlyFeatured ? 'text-amber-600 fill-amber-600' : 'text-amber-500'}`} />
                        <span className="text-[11px] font-black text-amber-950">
                          {language === 'en' ? 'VIP Premium Only' : language === 'ru' ? 'Только VIP Премиум' : 'Yalnız VIP Premium'}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={onlyFeatured}
                        onChange={(e) => setOnlyFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vertical Resizing Splitter (Desktop Only) */}
          {!isFiltersCollapsed && (
            <div
              onMouseDown={handleFilterSplitterMouseDown}
              onTouchStart={handleFilterSplitterTouchStart}
              className={`hidden lg:flex absolute -right-3 top-0 bottom-0 w-3 cursor-col-resize z-30 items-center justify-center group select-none ${
                isFilterDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'
              } transition-opacity`}
              title={dict.common?.dragToResize || 'Ölçünü dəyişmək üçün sürüşdürün'}
            >
              <div
                className={`w-1 h-full rounded-full transition-colors ${
                  isFilterDragging ? 'bg-blue-600 shadow-sm' : 'bg-transparent group-hover:bg-blue-400/80 group-active:bg-blue-600'
                }`}
              />
              <div
                className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white border border-slate-300 shadow-xs rounded px-0.5 py-1.5 pointer-events-none transition-all ${
                  isFilterDragging ? 'opacity-100 ring-2 ring-blue-500/30' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <GripVertical className="w-3 h-3 text-slate-500" />
              </div>
            </div>
          )}
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: VACANCIES FEED (TOP PRIORITY - IMMEDIATELY SEEN ON MOBILE)  */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 w-full space-y-3.5">
          {/* Top Bar above Vacancies list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {dict.filters?.vacancies || 'Vakansiyalar'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {filteredAndSortedVacancies.length} {dict.filters?.jobsFound || 'elan tapıldı'}
              </span>
            </div>

            {/* View Mode & Sort Controls */}
            <div className="flex items-center gap-2">
              <div className="h-8 inline-flex p-0.5 bg-slate-100/90 rounded-xl border border-slate-200 shadow-2xs items-center">
                <button
                  type="button"
                  onClick={() => handleSetViewMode('simple')}
                  className={`h-full px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'simple'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={dict.jobExplorer?.simple || (language === 'en' ? 'Simple' : language === 'ru' ? 'Простой' : 'Sadə')}
                >
                  <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="hidden sm:inline">{dict.jobExplorer?.simple || (language === 'en' ? 'Simple' : language === 'ru' ? 'Простой' : 'Sadə')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetViewMode('detailed')}
                  className={`h-full px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === 'detailed'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={dict.jobExplorer?.detailed || (language === 'en' ? 'Detailed' : language === 'ru' ? 'Подробный' : 'Ətraflı')}
                >
                  <SlidersHorizontal className="w-3 h-3 text-slate-600 shrink-0" />
                  <span className="hidden sm:inline">{dict.jobExplorer?.detailed || (language === 'en' ? 'Detailed' : language === 'ru' ? 'Подробный' : 'Ətraflı')}</span>
                </button>
              </div>

              <span className="text-xs text-slate-500 font-bold hidden md:inline">{dict.filters?.sort || 'Sıralama'}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="newest">🕒 {dict.filters?.newest || 'Ən yeni elanlar'}</option>
                <option value="salary-desc">💰 {dict.filters?.salaryDesc || 'Maaşa görə (çoxdan aza)'}</option>
                <option value="views-desc">👁️ {dict.filters?.viewsDesc || 'Ən çox baxılanlar'}</option>
                <option value="title-asc">🔤 {dict.filters?.titleAsc || 'Vəzifə (A-Z)'}</option>
                <option value="company-asc">🏢 {dict.filters?.companyAsc || 'Şirkət (A-Z)'}</option>
              </select>
            </div>
          </div>

          {/* Active AI Search Filter Info Banner */}
          {hasActiveAiFilter && (
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                      {language === 'en' ? 'AI Smart Filter Active' : language === 'ru' ? 'Активен умный ИИ-фильтр' : 'Ağıllı AI Filtri Aktivdir'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                      {filteredAndSortedVacancies.length} {language === 'en' ? 'matching jobs' : language === 'ru' ? 'подходящих вакансий' : 'uyğun vakansiya'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-900/80 mt-1 font-medium">
                    {aiSearchSummary || (language === 'en' ? 'Only vacancies strictly matching your criteria are shown. Non-matching jobs are excluded.' : language === 'ru' ? 'Отображаются только подходящие вакансии. Нерелевантные исключены.' : 'Yalnız sorğunuza tam uyğun gələn vakansiyalar göstərilir. Uyğunsuz elanlar gizlədildi.')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={handleClearAiSearch}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-100/50 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Clear AI Filter' : language === 'ru' ? 'Сбросить ИИ' : 'AI Filtrini Sıfırla'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Active VIP Premium Filter Notification Bar */}
          {onlyFeatured && (
            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Crown className="w-5 h-5 fill-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      {language === 'en' ? 'VIP Premium Filter Active' : language === 'ru' ? 'Активен VIP фильтр' : 'VIP Premium Filtri Aktivdir'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 text-[11px] font-bold">
                      {filteredAndSortedVacancies.length} {language === 'en' ? 'featured vacancies' : language === 'ru' ? 'премиум вакансий' : 'seçilmiş vakansiya'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/80 mt-0.5 font-medium">
                    {language === 'en' 
                      ? 'Displaying high-priority vacancies from verified and premium employers.' 
                      : language === 'ru' 
                      ? 'Показаны приоритетные вакансии от верифицированных работодателей.' 
                      : 'Yalnız təsdiqlənmiş işəgötürənlərin ən yüksək prioritetli VIP premium elanları göstərilir.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setOnlyFeatured(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Show All Jobs' : language === 'ru' ? 'Все вакансии' : 'Bütün Elanları Göstər'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. MODE A: SIMPLE & ACCESSIBLE VIEW (JOBSEARCH STYLE ROWS)                */}
          {/* ========================================================================= */}
          {viewMode === 'simple' && (
            <div className="space-y-2.5 animate-fade-in">
              {filteredAndSortedVacancies.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-sm">
                  <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${hasActiveAiFilter ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                    {hasActiveAiFilter ? <Sparkles className="w-7 h-7" /> : <Search className="w-7 h-7" />}
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {hasActiveAiFilter
                      ? (language === 'en' ? 'No Matching Vacancies Found for this AI Query' : language === 'ru' ? 'Нет вакансий, соответствующих ИИ-запросу' : 'Bu AI Sorğusuna Uyğun Vakansiya Tapılmadı')
                      : dict.jobExplorer.noJobsFound}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {hasActiveAiFilter
                      ? (language === 'en' ? 'AI excluded non-matching vacancies to ensure precision. Try a different query or show all vacancies.' : language === 'ru' ? 'ИИ исключил неподходящие вакансии для обеспечения точности. Попробуйте другой запрос или покажите все вакансии.' : 'Dəqiqliyi təmin etmək üçün tələblərə cavab verməyən elanlar gizlədildi. Sorğunu dəyişə və ya bütün vakansiyaları bərpa edə bilərsiniz.')
                      : dict.jobExplorer.noJobsFoundDesc}
                  </p>
                  <button
                    type="button"
                    onClick={hasActiveAiFilter ? handleClearAiSearch : handleResetFilters}
                    className="px-4 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs bg-blue-600 hover:bg-blue-700"
                  >
                    {hasActiveAiFilter 
                      ? (language === 'en' ? 'Show All Vacancies' : language === 'ru' ? 'Показать все вакансии' : 'Bütün Vakansiyaları Göstər')
                      : dict.jobExplorer.resetFilters}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {visibleVacancies.map((job) => {
                    const isSaved = savedJobIds.includes(job.id);
                    const aiMatch = aiMatchesMap[job.id];
                    const isRecentlyPosted = (() => {
                      try {
                        const today = Date.now();
                        const pDate = new Date(job.postedDate).getTime();
                        return (today - pDate) / (1000 * 60 * 60 * 24) <= 2;
                      } catch {
                        return false;
                      }
                    })();

                    return (
                      <div
                        key={job.id}
                        id={`simple-job-row-${job.id}`}
                        onClick={() => onSelectVacancy(job)}
                        className={`group relative rounded-2xl p-3.5 sm:p-4 transition-all duration-150 cursor-pointer flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3 overflow-hidden ${
                          job.isFeatured
                            ? 'bg-white hover:bg-amber-50/20 border border-amber-300/90 hover:border-amber-400 shadow-2xs hover:shadow-xs'
                            : 'bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        {/* Clean indicator bar for VIP featured vacancies */}
                        {job.isFeatured && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                        )}

                        {/* Left & Middle Info Block */}
                        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                          {/* Company Logo with chic border & fallback */}
                          <div className="relative shrink-0">
                            <img
                              src={job.companyLogo}
                              alt={job.companyName}
                              loading="lazy"
                              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover bg-white p-0.5 group-hover:scale-105 transition-transform ${
                                job.isFeatured
                                  ? 'border border-amber-300 ring-1 ring-amber-200 shadow-2xs'
                                  : 'border border-slate-200 shadow-2xs'
                              }`}
                              referrerPolicy="no-referrer"
                            />
                            {job.companyVerified && (
                              <span 
                                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold border-2 border-white shadow-2xs"
                                title="Təsdiqlənmiş Şirkət"
                              >
                                ✓
                              </span>
                            )}
                          </div>

                          {/* Job Title, Badges & Company Meta */}
                          <div className="min-w-0 flex-1">
                            {/* Title Row + Badges */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className={`text-[15px] sm:text-base font-bold transition-colors truncate ${
                                job.isFeatured 
                                  ? 'text-slate-950 font-bold group-hover:text-amber-800' 
                                  : 'text-slate-900 group-hover:text-blue-600'
                              }`}>
                                {job.title}
                              </h3>

                              {job.isFeatured && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/90 shadow-2xs uppercase tracking-wider shrink-0">
                                  <Crown className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>VIP</span>
                                </span>
                              )}

                              {isRecentlyPosted && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                                  <span>Yeni</span>
                                </span>
                              )}

                              {job.isEasyApply !== false && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/90 shrink-0" title="1 kliklə sürətli müraciət">
                                  <Zap className="w-2.5 h-2.5 text-blue-600 fill-blue-600 shrink-0" />
                                  <span>Tez Müraciət</span>
                                </span>
                              )}

                              {aiMatch && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/90 shadow-2xs shrink-0" title={aiMatch.matchReason}>
                                  <Sparkles className="w-3 h-3 text-indigo-600" />
                                  <span>{aiMatch.matchScore}%</span>
                                </span>
                              )}
                            </div>

                            {/* Company & Details Row */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 mt-1 font-medium">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCompany(job.companyName);
                                }}
                                className="font-semibold text-slate-800 hover:text-blue-600 hover:underline"
                              >
                                {job.companyName}
                              </button>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {job.city}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {job.employmentType}
                              </span>
                              <span className="text-slate-300 hidden sm:inline">•</span>
                              <span className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                                {job.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Meta & Action Items */}
                        <div className="flex flex-wrap items-center justify-between 2xl:justify-end gap-2.5 shrink-0 pt-2.5 2xl:pt-0 border-t 2xl:border-t-0 border-slate-100 w-full 2xl:w-auto">
                          {/* Salary Badge & Meta Stats Group */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Salary Badge */}
                            {job.hideSalary ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 whitespace-nowrap">
                                💰 {dict.jobExplorer.negotiableSalary}
                              </span>
                            ) : job.isFeatured ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-950 border border-amber-200/90 font-bold text-xs sm:text-[13px] shadow-2xs whitespace-nowrap">
                                <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{job.minSalary} - {job.maxSalary} {job.currency}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs sm:text-[13px] shadow-2xs whitespace-nowrap">
                                <DollarSign className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                <span>{job.minSalary} - {job.maxSalary} {job.currency}</span>
                              </span>
                            )}

                            {/* Views Count & Date Tag */}
                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
                              <span className="inline-flex items-center gap-1 text-slate-400" title="Baxış sayı">
                                <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{formatViewsCount(job.viewsCount)}</span>
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold whitespace-nowrap">
                                {formatJobDate(job.postedDate)}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons (1-Click Apply, WhatsApp, Bookmark) */}
                          <div className="flex items-center gap-1.5 shrink-0 ml-auto md:ml-0">
                            {/* 1-Click Fast Apply */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickApplyJob(job);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer whitespace-nowrap shrink-0"
                              title={language === 'en' ? '1-Click Quick Apply' : language === 'ru' ? 'Быстрый отклик в 1 клик' : '1 Kliklə Müraciət Et'}
                            >
                              <Send className="w-3 h-3 text-white shrink-0" />
                              <span>{language === 'en' ? '1-Click' : language === 'ru' ? '1 Клик' : '1 Klik'}</span>
                            </button>

                            {/* Direct WhatsApp Contact */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenWhatsApp(job);
                              }}
                              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0"
                              title={language === 'en' ? 'Direct contact via WhatsApp' : language === 'ru' ? 'Связаться через WhatsApp' : 'WhatsApp ilə birbaşa əlaqə'}
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>

                            {/* Direct Call Button if Phone available */}
                            {job.contactPhone && (
                              <a
                                href={`tel:${job.contactPhone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg font-bold text-xs flex items-center justify-center transition-all shrink-0"
                                title={language === 'en' ? `Call: ${job.contactPhone}` : language === 'ru' ? `Позвонить: ${job.contactPhone}` : `Zəng et: ${job.contactPhone}`}
                              >
                                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              </a>
                            )}

                            {/* Save Bookmark */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleBookmark(job.id);
                              }}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                                isSaved
                                  ? 'bg-amber-50 border-amber-300 text-amber-500'
                                  : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                              }`}
                              title={isSaved ? dict.jobExplorer.saved : dict.jobExplorer.saveJob}
                            >
                              <Bookmark className="w-3.5 h-3.5 shrink-0" fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Load More & Pagination for Simple View */}
                  {filteredAndSortedVacancies.length > visibleCount && (
                    <div className="pt-3 pb-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 20)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>{language === 'en' ? 'Show more jobs (+20)' : language === 'ru' ? 'Показать еще (+20)' : 'Daha çox elan göstər (+20)'}</span>
                        <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {language === 'en' ? 'Remaining:' : language === 'ru' ? 'Осталось:' : 'Qalan:'} {filteredAndSortedVacancies.length - visibleCount}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisibleCount(filteredAndSortedVacancies.length)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        {language === 'en' ? `Show all ${filteredAndSortedVacancies.length} jobs` : language === 'ru' ? `Показать все ${filteredAndSortedVacancies.length} вакансий` : `Bütün ${filteredAndSortedVacancies.length} elanı göstər`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. MODE B: DETAILED ADVANCED VIEW                                         */}
          {/* ========================================================================= */}
          {viewMode === 'detailed' && (
            <div className="space-y-4 animate-fade-in">
              {/* Detailed Cards Grid */}
              {filteredAndSortedVacancies.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3 shadow-sm">
                  <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${hasActiveAiFilter ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                    {hasActiveAiFilter ? <Sparkles className="w-7 h-7" /> : <Search className="w-7 h-7" />}
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {hasActiveAiFilter
                      ? (language === 'en' ? 'No Matching Vacancies Found for this AI Query' : language === 'ru' ? 'Нет вакансий, соответствующих ИИ-запросу' : 'Bu AI Sorğusuna Uyğun Vakansiya Tapılmadı')
                      : dict.jobExplorer.noJobsFound}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {hasActiveAiFilter
                      ? (language === 'en' ? 'AI excluded non-matching vacancies to ensure precision. Try a different query or show all vacancies.' : language === 'ru' ? 'ИИ исключил неподходящие вакансии для обеспечения точности. Попробуйте другой запрос или покажите все вакансии.' : 'Dəqiqliyi təmin etmək üçün tələblərə cavab verməyən elanlar gizlədildi. Sorğunu dəyişə və ya bütün vakansiyaları bərpa edə bilərsiniz.')
                      : dict.jobExplorer.noJobsFoundDesc}
                  </p>
                  <button
                    type="button"
                    onClick={hasActiveAiFilter ? handleClearAiSearch : handleResetFilters}
                    className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ${hasActiveAiFilter ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {hasActiveAiFilter 
                      ? (language === 'en' ? 'Show All Vacancies' : language === 'ru' ? 'Показать все вакансии' : 'Bütün Vakansiyaları Göstər')
                      : dict.jobExplorer.resetFilters}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                  {visibleVacancies.map((job) => {
                    const isSaved = savedJobIds.includes(job.id);
                    const aiMatch = aiMatchesMap[job.id];
                    return (
                      <div
                        key={job.id}
                        onClick={() => onSelectVacancy(job)}
                        className={`group rounded-2xl border p-4 sm:p-5 transition-all duration-150 hover:shadow-sm cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                          job.isFeatured
                            ? 'border border-amber-300 bg-white hover:bg-amber-50/20 shadow-2xs hover:shadow-xs'
                            : 'bg-white border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* VIP Premium Header Banner */}
                          {job.isFeatured && (
                            <div className="flex items-center justify-between gap-2 pb-2.5 mb-1 border-b border-amber-200/80 -mt-1">
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold shadow-2xs tracking-wide uppercase">
                                <Crown className="w-3.5 h-3.5 fill-amber-600 text-amber-600 shrink-0" />
                                <span>VIP PREMİUM VAKANSİYA</span>
                              </div>
                              <span className="text-[10px] font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200/80">
                                ⭐ TOP SEÇİM
                              </span>
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <img
                                src={job.companyLogo}
                                alt={job.companyName}
                                loading="lazy"
                                className={`w-12 h-12 rounded-xl object-cover bg-white p-0.5 shadow-2xs group-hover:scale-105 transition-transform ${
                                  job.isFeatured
                                    ? 'border border-amber-300 ring-1 ring-amber-200'
                                    : 'border border-slate-200'
                                }`}
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h3 className={`font-bold transition-colors text-sm line-clamp-1 ${
                                  job.isFeatured ? 'text-slate-950 group-hover:text-amber-800' : 'text-slate-900 group-hover:text-blue-600'
                                }`}>
                                  {getLocalizedJobTitle(job.title, language)}
                                </h3>
                                <p className="text-xs text-slate-600 font-semibold">{job.companyName}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleBookmark(job.id);
                              }}
                              className="text-slate-400 hover:text-amber-500 p-1 cursor-pointer"
                              title={isSaved ? dict.jobExplorer.saved : dict.jobExplorer.saveJob}
                            >
                              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                              <MapPin className="w-3 h-3 text-slate-400" /> {getLocalizedCity(job.city, language)}
                            </span>
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                              <Clock className="w-3 h-3 text-slate-400" /> {getLocalizedEmploymentType(job.employmentType, language)}
                            </span>
                          </div>

                          {/* AI Match percentage badge and reasoning */}
                          {aiMatch && (
                            <div className="p-2.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex flex-col gap-1 text-xs">
                              <div className="flex items-center justify-between font-bold text-blue-950">
                                <span className="flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{language === 'en' ? 'AI Match Analysis:' : language === 'ru' ? 'AI Анализ совпадения:' : 'AI Uyğunluq Analizi:'}</span>
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-xs shadow-2xs">
                                  {aiMatch.matchScore}%
                                </span>
                              </div>
                              {aiMatch.matchReason && (
                                <p className="text-[11px] text-blue-900/80 font-medium line-clamp-2 mt-0.5">
                                  {aiMatch.matchReason}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Salary Tag */}
                          <div>
                            {job.hideSalary ? (
                              <span className="text-xs font-semibold text-slate-500">
                                {language === 'en' ? 'Salary negotiable' : language === 'ru' ? 'По договоренности' : 'Maaş razılaşma ilə'}
                              </span>
                            ) : job.isFeatured ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold bg-amber-50 text-amber-950 border border-amber-200/90 shadow-2xs">
                                <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{job.minSalary} - {job.maxSalary} {job.currency}</span>
                              </span>
                            ) : (
                              <span className="text-xs sm:text-sm font-bold text-slate-800">
                                {job.minSalary} - {job.maxSalary} {job.currency}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400">
                            {formatJobDate(job.postedDate)}
                          </span>
                          <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            {language === 'en' ? 'View Details' : language === 'ru' ? 'Подробнее' : 'Ətraflı bax'} <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More & Pagination for Detailed View */}
              {filteredAndSortedVacancies.length > visibleCount && (
                <div className="pt-3 pb-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 20)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{language === 'en' ? 'Show more jobs (+20)' : language === 'ru' ? 'Показать еще (+20)' : 'Daha çox elan göstər (+20)'}</span>
                    <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {language === 'en' ? 'Remaining:' : language === 'ru' ? 'Осталось:' : 'Qalan:'} {filteredAndSortedVacancies.length - visibleCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleCount(filteredAndSortedVacancies.length)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    {language === 'en' ? `Show all ${filteredAndSortedVacancies.length} jobs` : language === 'ru' ? `Показать все ${filteredAndSortedVacancies.length} вакансий` : `Bütün ${filteredAndSortedVacancies.length} elanı göstər`}
                  </button>
                </div>
              )}
              {/* Jobia Logo at bottom of vacancy listing */}
              <SectionBottomLogo
                tagline={language === 'en' ? 'Azerbaijan\'s Smartest Job & Career Platform' : language === 'ru' ? 'Самая умная платформа вакансий в Азербайджане' : 'Azərbaycanın Ən Ağıllı Vakansiya və Karyera Platforması'}
              />
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 4. WHY US? / NİYƏ BİZ? (3 Sütunlu Korporativ Üstünlüklər Bölməsi)         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black tracking-wide uppercase border border-blue-100">
            <Award className="w-3.5 h-3.5" />
            <span>
              {language === 'en' ? `WHY ${brandAcronym || 'JOBIA.AZ'}?` : language === 'ru' ? `ПОЧЕМУ ${brandAcronym || 'JOBIA.AZ'}?` : `NİYƏ ${brandAcronym || 'JOBİA.AZ'}?`}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            {language === 'en' ? 'Trust Your Career in Reliable Hands' : language === 'ru' ? 'Доверьте свою карьеру надежным рукам' : 'Karyeranızı Etibarlı Əllərə Əmanət Edin'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {language === 'en'
              ? 'Our 3 core values making job search fast, transparent, and professional'
              : language === 'ru'
              ? 'Наши 3 ключевые ценности, делающие поиск работы быстрым, прозрачным и надежным'
              : 'Azərbaycanda iş axtarışını sürətli, şəffaf və peşəkar edən 3 əsas dəyərimiz'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Card 1: 100% Yoxlanılmış Şirkətlər */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 hover:shadow-xs transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center border border-blue-200 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'en' ? '100% Verified Companies' : language === 'ru' ? '100% Проверенные компании' : '100% Yoxlanılmış Şirkətlər'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {language === 'en'
                ? 'Only officially verified corporate listings are published. No fake jobs or agency commissions.'
                : language === 'ru'
                ? 'Публикуются вакансии только официально подтвержденных компаний. Без фейков и скрытых комиссий.'
                : 'Yalnız rəsmi VÖEN və hüquqi qeydiyyatı təsdiq olunmuş korporativ şirkətlərin elanları dərc olunur. Saxta elanlara və vasitəçi komissiyalarına qətiyyən yer verilmir.'}
            </p>
          </div>

          {/* Card 2: Şəffaf Maaşlar & Birbaşa Əlaqə */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 hover:shadow-xs transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'en' ? 'Transparent Salaries & Direct Contact' : language === 'ru' ? 'Прозрачные зарплаты и прямой контакт' : 'Şəffaf Maaşlar və Birbaşa Əlaqə'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {language === 'en'
                ? 'Clear salary ranges matching market standards, 1-click apply, direct WhatsApp and official digital Job Offer feature.'
                : language === 'ru'
                ? 'Четкие диапазоны зарплат по рынку, отклик в 1 клик, прямой WhatsApp и возможность официального цифрового Job Offer.'
                : 'Bazar standartlarına uyğun dəqiq maaş intervalları, 1-kliklə müraciət, birbaşa WhatsApp və rəsmi rəqəmsal iş təklifi (Job Offer) imkanı.'}
            </p>
          </div>

          {/* Card 3: AI Dəstəkli Axtarış və Uyğunlaşdırma */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 hover:shadow-xs transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center border border-purple-200 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'en' ? 'AI-Powered Search & Matching' : language === 'ru' ? 'ИИ-поиск и подбор вакансий' : 'Süni İntellekt Dəstəyi'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {language === 'en'
                ? 'Discover vacancies that best match your qualifications and career expectations through smart AI recommendations.'
                : language === 'ru'
                ? 'Мгновенно находите вакансии, наиболее подходящие под вашу квалификацию с помощью умных рекомендаций.'
                : 'Ağıllı axtarış və tövsiyələr sayəsində ixtisasınıza və gözləntilərinizə ən uyğun vakansiyaları dərhal kəşf edin.'}
            </p>
          </div>
        </div>

        {/* Section bottom logo */}
        <SectionBottomLogo size="xs" />
      </div>

      {/* ========================================================================= */}
      {/* 5. FAST 1-CLICK QUICK APPLY MODAL FOR SIMPLE VIEW                          */}
      {/* ========================================================================= */}
      {quickApplyJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-black">
                    {language === 'en' ? '1-Click Fast Apply' : language === 'ru' ? 'Быстрый отклик в 1 клик' : '1 Kliklə Sürətli Müraciət'}
                  </h3>
                  <p className="text-xs text-emerald-100 truncate max-w-xs">{getLocalizedJobTitle(quickApplyJob.title, language)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickApplyJob(null)}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {quickApplySuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-slate-900">
                  {language === 'en' ? 'Application Received!' : language === 'ru' ? 'Отклик принят!' : 'Müraciətiniz Qəbul Olundu!'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'en'
                    ? `${quickApplyJob.companyName} will contact you as soon as possible.`
                    : language === 'ru'
                    ? `Компания ${quickApplyJob.companyName} свяжется с вами в кратчайшие сроки.`
                    : `${quickApplyJob.companyName} şirkəti sizinlə ən qısa zamanda əlaqə saxlayacaqdır.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmQuickApply} className="p-5 space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <img
                    src={quickApplyJob.companyLogo}
                    alt={quickApplyJob.companyName}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{getLocalizedJobTitle(quickApplyJob.title, language)}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {quickApplyJob.companyName} • {getLocalizedCity(quickApplyJob.city, language)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'en' ? 'Your Full Name:' : language === 'ru' ? 'Ваше имя и фамилия:' : 'Adınız və Soyadınız:'}
                    </label>
                    <input
                      type="text"
                      required
                      value={quickApplicantName}
                      onChange={(e) => setQuickApplicantName(e.target.value)}
                      placeholder={language === 'en' ? 'Full Name' : language === 'ru' ? 'Имя Фамилия' : 'Adınız və Soyadınız'}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'en' ? 'Phone / WhatsApp:' : language === 'ru' ? 'Номер телефона / WhatsApp:' : 'Əlaqə Telefonunuz (WhatsApp):'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={quickApplicantPhone}
                      onChange={(e) => setQuickApplicantPhone(e.target.value)}
                      placeholder={language === 'en' ? 'e.g. +994 50 123 45 67' : language === 'ru' ? 'напр. +994 50 123 45 67' : 'Məs: +994 50 123 45 67'}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickApplyJob(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    {dict.common?.cancel || (language === 'en' ? 'Cancel' : language === 'ru' ? 'Отмена' : 'Ləğv et')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === 'en' ? 'Submit Application' : language === 'ru' ? 'Отправить заявку' : 'Müraciəti Tamamla'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. COMPREHENSIVE FILTER MODAL                                             */}
      {/* ========================================================================= */}
      {mobileFilterModal !== 'none' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full sm:max-w-xl md:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header with Tabs */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-black">
                  {mobileFilterModal === 'categories' && (language === 'en' ? '📁 Job Categories' : language === 'ru' ? '📁 Категории вакансий' : '📁 Vəzifə Kateqoriyaları')}
                  {mobileFilterModal === 'companies' && (language === 'en' ? '🏛️ Companies' : language === 'ru' ? '🏛️ Компании' : '🏛️ Şirkətlər')}
                  {mobileFilterModal === 'industries' && (language === 'en' ? '🏢 Industries' : language === 'ru' ? '🏢 Сферы деятельности' : '🏢 Şirkət Sahələri')}
                  {mobileFilterModal === 'filters' && (language === 'en' ? '⚙️ All Filters' : language === 'ru' ? '⚙️ Bütün Filtrlər' : '⚙️ Bütün Filtrlər')}
                  {mobileFilterModal === 'ai' && (language === 'en' ? '🤖 AI Smart Search' : language === 'ru' ? '🤖 Умный ИИ-поиск' : '🤖 AI Ağıllı Axtarış')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterModal('none')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Fast Sub-tabs */}
            <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0 scrollbar-none text-xs font-bold">
              <button
                type="button"
                onClick={() => setMobileFilterModal('categories')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  mobileFilterModal === 'categories' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                📁 {language === 'en' ? 'Categories' : language === 'ru' ? 'Категории' : 'Kateqoriyalar'}
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterModal('companies')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  mobileFilterModal === 'companies' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏛️ {language === 'en' ? 'Companies' : language === 'ru' ? 'Компании' : 'Şirkətlər'}
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterModal('industries')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  mobileFilterModal === 'industries' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏢 {language === 'en' ? 'Industries' : language === 'ru' ? 'Сферы' : 'Sahələr'}
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterModal('filters')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  mobileFilterModal === 'filters' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                ⚙️ {language === 'en' ? 'Parameters' : language === 'ru' ? 'Параметры' : 'Parametrlər'}
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterModal('ai')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  mobileFilterModal === 'ai' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                🤖 {language === 'en' ? 'AI Search' : language === 'ru' ? 'ИИ Поиск' : 'AI Axtarış'}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {/* VIEW 1: CATEGORIES */}
              {mobileFilterModal === 'categories' && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('Hamısı');
                      setMobileFilterModal('none');
                    }}
                    className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all ${
                      selectedCategory === 'Hamısı'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>📁 {language === 'en' ? 'All Categories' : language === 'ru' ? 'Все категории' : 'Bütün Kateqoriyalar'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      selectedCategory === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {vacancies.length}
                    </span>
                  </button>

                  {JOB_CATEGORIES.map((cat) => {
                    const count = categoryCounts[cat] || 0;
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(isSelected ? 'Hamısı' : cat);
                          setMobileFilterModal('none');
                        }}
                        className={`w-full p-3 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span className="truncate pr-2">{getLocalizedCategory(cat, language)}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* VIEW 2: COMPANIES */}
              {mobileFilterModal === 'companies' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={companySearchQuery}
                      onChange={(e) => setCompanySearchQuery(e.target.value)}
                      placeholder={language === 'en' ? 'Search by company name...' : language === 'ru' ? 'Поиск по названию компании...' : 'Şirkət adı üzrə axtar...'}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500 font-medium"
                    />
                    {companySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCompanySearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCompany('Hamısı');
                        setMobileFilterModal('none');
                      }}
                      className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all ${
                        selectedCompany === 'Hamısı'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>🏛️ {language === 'en' ? 'All Companies' : language === 'ru' ? 'Все компании' : 'Bütün Şirkətlər'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        selectedCompany === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {vacancies.length}
                      </span>
                    </button>

                    {filteredCompaniesForSidebar.map((comp) => {
                      const isSelected = selectedCompany.toLowerCase() === comp.name.toLowerCase();
                      return (
                        <button
                          key={comp.name}
                          type="button"
                          onClick={() => {
                            setSelectedCompany(isSelected ? 'Hamısı' : comp.name);
                            setMobileFilterModal('none');
                          }}
                          className={`w-full p-3 rounded-xl text-left text-xs flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            <img
                              src={comp.logo}
                              alt={comp.name}
                              className="w-5 h-5 rounded object-cover border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <span className="truncate">{comp.name}</span>
                            {comp.verified && (
                              <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                            )}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {comp.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 3: INDUSTRIES */}
              {mobileFilterModal === 'industries' && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndustry('Hamısı');
                      setMobileFilterModal('none');
                    }}
                    className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all ${
                      selectedIndustry === 'Hamısı'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>🏢 {language === 'en' ? 'All Industries' : language === 'ru' ? 'Все сферы' : 'Bütün Sahələr'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      selectedIndustry === 'Hamısı' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {industryStats['Hamısı'] || vacancies.filter((v) => v.isApproved !== false && (v.status === 'published' || !v.status)).length}
                    </span>
                  </button>

                  {COMPANY_INDUSTRIES.map((ind) => {
                    const count = industryStats[ind] || 0;
                    const isSelected = selectedIndustry === ind;
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => {
                          setSelectedIndustry(isSelected ? 'Hamısı' : ind);
                          setMobileFilterModal('none');
                        }}
                        className={`w-full p-3 rounded-xl text-left text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 font-medium'
                        }`}
                      >
                        <span className="truncate pr-2">{getLocalizedIndustry(ind, language)}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* VIEW 4: ALL ADVANCED FILTERS */}
              {mobileFilterModal === 'filters' && (
                <div className="space-y-4 text-xs">
                  {/* City Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'en' ? '📍 City / Region:' : language === 'ru' ? '📍 Город / Регион:' : '📍 Şəhər / Region:'}
                    </label>
                    <CitySearchSelect
                      selectedCity={selectedCity}
                      onSelectCity={setSelectedCity}
                    />
                  </div>

                  {/* Quick Profession / Role Filter */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      💼 {language === 'en' ? 'Quick Profession / Role:' : language === 'ru' ? 'Специальность / Профессия:' : 'Peşə / İxtisas:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                      {quickProfessions.map((prof) => {
                        const isSelected = quickProfessionFilter === prof.id;
                        return (
                          <button
                            key={prof.id}
                            type="button"
                            onClick={() => setQuickProfessionFilter(isSelected ? 'all' : prof.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>{prof.icon}</span>
                            <span>{prof.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Salary Filter with Quick Pills */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'en' ? '💰 Minimum Salary:' : language === 'ru' ? '💰 Минимальная зарплата:' : '💰 Minimum Əməkhaqqı:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        { label: language === 'en' ? 'All' : language === 'ru' ? 'Все' : 'Hamısı', value: 0 },
                        { label: '500+ AZN', value: 500 },
                        { label: '800+ AZN', value: 800 },
                        { label: '1000+ AZN', value: 1000 },
                        { label: '1500+ AZN', value: 1500 },
                        { label: '2000+ AZN', value: 2000 },
                      ].map((sal) => (
                        <button
                          key={sal.value}
                          type="button"
                          onClick={() => setMinSalaryFilter(sal.value)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer whitespace-nowrap border ${
                            minSalaryFilter === sal.value
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {sal.label}
                        </button>
                      ))}
                    </div>
                    <select
                      value={minSalaryFilter}
                      onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                    >
                      <option value={0}>{dict.filters?.allSalaries || (language === 'en' ? 'All Salaries' : language === 'ru' ? 'Все зарплаты' : 'Bütün Maaşlar')}</option>
                      <option value={500}>500+ AZN</option>
                      <option value={800}>800+ AZN</option>
                      <option value={1000}>1,000+ AZN</option>
                      <option value={1500}>1,500+ AZN</option>
                      <option value={2000}>2,000+ AZN</option>
                      <option value={3000}>3,000+ AZN</option>
                    </select>
                  </div>

                  {/* Job Type & Experience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? '💼 Job Type:' : language === 'ru' ? '💼 Тип занятости:' : '💼 İş Rejimi:'}
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                      >
                        <option value="Hamısı">{language === 'en' ? 'All Types' : language === 'ru' ? 'Все типы' : 'Bütün Rejimlər'}</option>
                        <option value="Tam ştat">{getLocalizedEmploymentType('Tam ştat', language)}</option>
                        <option value="Yarım ştat">{getLocalizedEmploymentType('Yarım ştat', language)}</option>
                        <option value="Uzaqdan (Remote)">{getLocalizedEmploymentType('Uzaqdan (Remote)', language)}</option>
                        <option value="Hibrid">{getLocalizedEmploymentType('Hibrid', language)}</option>
                        <option value="Təcrübəçi">{getLocalizedEmploymentType('Təcrübəçi', language)}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? '🎓 Experience:' : language === 'ru' ? '🎓 Опыт работы:' : '🎓 Təcrübə:'}
                      </label>
                      <select
                        value={selectedExperience}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                      >
                        <option value="Hamısı">{language === 'en' ? 'All' : language === 'ru' ? 'Все' : 'Hamısı'}</option>
                        <option value="Tələb olunmur">{getLocalizedExperience('Tələb olunmur', language)}</option>
                        <option value="1 ildən az">{getLocalizedExperience('1 ildən az', language)}</option>
                        <option value="1-3 il">{getLocalizedExperience('1-3 il', language)}</option>
                        <option value="3-5 il">{getLocalizedExperience('3-5 il', language)}</option>
                        <option value="5 ildən çox">{getLocalizedExperience('5 ildən çox', language)}</option>
                      </select>
                    </div>
                  </div>

                  {/* Posted Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'en' ? '🕒 Posted Time:' : language === 'ru' ? '🕒 Время публикации:' : '🕒 Dərc Olunma Vaxtı:'}
                    </label>
                    <select
                      value={postedDateFilter}
                      onChange={(e) => setPostedDateFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                    >
                      <option value="all">{language === 'en' ? 'All time' : language === 'ru' ? 'Все время' : 'Bütün dövr'}</option>
                      <option value="1_day">{language === 'en' ? 'Last 24 hours' : language === 'ru' ? 'Последние 24 часа' : 'Son 24 saat'}</option>
                      <option value="3_days">{language === 'en' ? 'Last 3 days' : language === 'ru' ? 'Последние 3 дня' : 'Son 3 gün'}</option>
                      <option value="1_week">{language === 'en' ? 'Last 7 days' : language === 'ru' ? 'Последняя неделя' : 'Son 1 həftə'}</option>
                      <option value="2_weeks">{language === 'en' ? 'Last 2 weeks' : language === 'ru' ? 'Последние 2 недели' : 'Son 2 həftə'}</option>
                    </select>
                  </div>

                  {/* VIP Premium Vacancies Filter */}
                  <div>
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-600 fill-amber-600" />
                        <span className="text-xs font-black text-amber-950">
                          {language === 'en' ? 'VIP Premium Vacancies Only' : language === 'ru' ? 'Только VIP Премиум' : 'Yalnız VIP Premium Vakansiyalar'}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={onlyFeatured}
                        onChange={(e) => setOnlyFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      {dict.filters?.reset || (language === 'en' ? 'Reset Filters' : language === 'ru' ? 'Сбросить фильтры' : 'Filtrləri Sıfırla')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileFilterModal('none')}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                    >
                      {language === 'en' ? `Apply (${filteredAndSortedVacancies.length} jobs)` : language === 'ru' ? `Применить (${filteredAndSortedVacancies.length} вак.)` : `Tətbiq et (${filteredAndSortedVacancies.length} elan)`}
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 5: MOBILE AI SMART SEARCH */}
              {mobileFilterModal === 'ai' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-black">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>{language === 'en' ? 'AI Smart Vacancy Search' : language === 'ru' ? 'Умный ИИ подбор вакансий' : 'AI Ağıllı Vakansiya Axtarışı'}</span>
                    </div>
                    <p className="text-[11px] text-indigo-800/90 font-medium">
                      {language === 'en'
                        ? 'Search jobs using natural language (e.g. Remote React 1500+ AZN). AI strictly matches relevant jobs and filters out the rest.'
                        : language === 'ru'
                        ? 'Ищите вакансии свободным языком. ИИ отбирает только точные совпадения и скрывает нерелевантные.'
                        : 'İstədiyiniz vəzifəni, şəhəri və ya maaşı sərbəst yazın. AI yalnız tələblərə cavab verən vakansiyaları saxlayır və digərlərini gizlədir.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRunAiSearch();
                            setMobileFilterModal('none');
                          }
                        }}
                        placeholder={language === 'en' ? 'e.g. Remote Frontend Developer 1500+ AZN' : language === 'ru' ? 'напр. Удаленный Frontend 1500+ AZN' : 'Məs: Remote Frontend Developer 1500+ AZN'}
                        className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                      />
                      {aiPrompt && (
                        <button
                          type="button"
                          onClick={() => setAiPrompt('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isAiSearching || !aiPrompt.trim()}
                        onClick={() => {
                          handleRunAiSearch();
                          setMobileFilterModal('none');
                        }}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {isAiSearching ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{language === 'en' ? 'Searching...' : language === 'ru' ? 'Поиск...' : 'Axtarılır...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{language === 'en' ? 'Search with AI' : language === 'ru' ? 'Найти через ИИ' : 'AI ilə Axtar'}</span>
                          </>
                        )}
                      </button>

                      {hasActiveAiFilter && (
                        <button
                          type="button"
                          onClick={() => {
                            handleClearAiSearch();
                            setMobileFilterModal('none');
                          }}
                          className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                        >
                          {language === 'en' ? 'Reset' : language === 'ru' ? 'Сбросить' : 'Sıfırla'}
                        </button>
                      )}
                    </div>
                  </div>

                  {userCV && (
                    <button
                      type="button"
                      disabled={isAiSearching}
                      onClick={() => {
                        handleRunAiSearch(undefined, true);
                        setMobileFilterModal('none');
                      }}
                      className="w-full p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>{language === 'en' ? '📄 Find Jobs Matching My CV' : language === 'ru' ? '📄 Подобрать по моему резюме' : '📄 CV-yə ən uyğun vakansiyalar'}</span>
                    </button>
                  )}

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      {language === 'en' ? 'Sample Prompts:' : language === 'ru' ? 'Примеры запросов:' : 'Hazır Nümunələr:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickAiPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (p.isCV) {
                              handleRunAiSearch(undefined, true);
                            } else if (p.prompt) {
                              setAiPrompt(p.prompt);
                              handleRunAiSearch(p.prompt);
                            }
                            setMobileFilterModal('none');
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Close */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {filteredAndSortedVacancies.length} {language === 'en' ? 'vacancies found' : language === 'ru' ? 'вакансий найдено' : 'vakansiya tapıldı'}
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterModal('none')}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {language === 'en' ? 'View Vacancies' : language === 'ru' ? 'Смотреть вакансии' : 'Vakansiyalara Bax'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE JOB ALERTS & SUBSCRIPTIONS MODAL */}
      <JobAlertManagerModal
        isOpen={isJobAlertModalOpen}
        onClose={() => setIsJobAlertModalOpen(false)}
        currentUser={currentUser || null}
        onAlertsUpdated={(sub) => setCandidateAlertSubscription(sub)}
        onShowToast={onShowToast}
      />
    </div>
  );
};
