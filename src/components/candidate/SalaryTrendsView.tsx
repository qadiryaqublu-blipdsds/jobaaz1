import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  ComposedChart,
  ReferenceLine,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { STORED_SALARY_TRENDS } from '../../data/salaryTrendsData';
import { Vacancy, RoleSalaryStats } from '../../types';
import { generateCustomRoleSalaryStats } from '../../utils/salaryMarketAnalyzer';
import { D3SalaryExpectationChart } from './D3SalaryExpectationChart';
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Award, 
  MapPin, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Search, 
  ArrowUpRight, 
  ChevronRight,
  Info,
  Calendar,
  Building2,
  Loader2,
  X,
  RotateCcw,
  Target,
  Sliders,
  Zap,
  BarChart3,
  ArrowRight,
  Minus,
  Plus,
  HelpCircle,
  Percent
} from 'lucide-react';

interface SalaryTrendsViewProps {
  vacancies: Vacancy[];
  onSelectVacancy?: (vacancy: Vacancy) => void;
}

const POPULAR_MARKET_ROLES = [
  'Python Developer',
  'Frontend Developer',
  'Baş Mühasib',
  'Satış Meneceri',
  'Sürücü / Ekspeditor',
  'Qrafik Dizayner',
  'Hüquqşünas',
  'DevOps Mühəndisi',
  'Həkim / Tibb Bacısı',
  'Kassir / Operator',
  'HR Menecer',
  'Data Analitik'
];

export const SalaryTrendsView: React.FC<SalaryTrendsViewProps> = ({
  vacancies,
  onSelectVacancy,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(STORED_SALARY_TRENDS[0].roleId);
  const [selectedCategory, setSelectedCategory] = useState<string>('Hamısı');
  const [searchQuery, setSearchQuery] = useState('');
  const [customAnalyzedStats, setCustomAnalyzedStats] = useState<RoleSalaryStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currency, setCurrency] = useState<'AZN' | 'USD'>('AZN');
  const [chartType, setChartType] = useState<'d3_benchmark' | 'timeline' | 'experience' | 'cities' | 'expectation'>('d3_benchmark');
  const [userExpectationAZN, setUserExpectationAZN] = useState<number>(2500);
  const [expectationScope, setExpectationScope] = useState<'category_roles' | 'experience_levels' | 'market_spread'>('category_roles');

  // Conversion rate (1 USD = 1.7 AZN)
  const rate = currency === 'USD' ? 1 / 1.7 : 1;
  const currencySymbol = currency === 'USD' ? '$' : '₼';

  const formatMoney = (amount: number) => {
    const val = Math.round(amount * rate);
    return `${val.toLocaleString()} ${currencySymbol}`;
  };

  // Perform dynamic full market analysis for any given position title
  const executeMarketAnalysis = (roleName: string) => {
    const cleanRole = roleName.trim();
    if (!cleanRole) return;

    setIsAnalyzing(true);
    // Smooth micro-delay for clean UX feedback
    setTimeout(() => {
      // Check if it exactly matches one of the stored presets first
      const exactPreset = STORED_SALARY_TRENDS.find(
        (r) => r.roleName.toLowerCase() === cleanRole.toLowerCase() ||
               r.roleName.toLowerCase().startsWith(cleanRole.toLowerCase())
      );

      if (exactPreset) {
        setSelectedRoleId(exactPreset.roleId);
        setCustomAnalyzedStats(null);
      } else {
        const stats = generateCustomRoleSalaryStats(cleanRole, vacancies);
        setCustomAnalyzedStats(stats);
      }
      setIsAnalyzing(false);
    }, 180);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      executeMarketAnalysis(searchQuery);
    }
  };

  const handleResetToPresets = () => {
    setCustomAnalyzedStats(null);
    setSearchQuery('');
    setSelectedRoleId(STORED_SALARY_TRENDS[0].roleId);
  };

  // Active role object: either custom analyzed role or chosen preset
  const currentRole: RoleSalaryStats = useMemo(() => {
    if (customAnalyzedStats) {
      return customAnalyzedStats;
    }
    return (
      STORED_SALARY_TRENDS.find((r) => r.roleId === selectedRoleId) ||
      STORED_SALARY_TRENDS[0]
    );
  }, [customAnalyzedStats, selectedRoleId]);

  // Filtered preset roles list for selection carousel
  const filteredRoles = useMemo(() => {
    return STORED_SALARY_TRENDS.filter((role) => {
      if (selectedCategory !== 'Hamısı' && role.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() && !customAnalyzedStats) {
        const q = searchQuery.toLowerCase();
        return (
          role.roleName.toLowerCase().includes(q) ||
          role.category.toLowerCase().includes(q) ||
          role.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery, customAnalyzedStats]);

  // Match live vacancies stored in the portal for this role
  const matchingVacancies = useMemo(() => {
    const roleKeywords = currentRole.roleName.toLowerCase().split(/[ /()]/).filter((w) => w.length > 2);
    return vacancies.filter((v) => {
      if (v.isApproved !== true || v.status !== 'published') return false;
      const titleLower = v.title.toLowerCase();
      const catLower = v.category.toLowerCase();
      return (
        catLower === currentRole.category.toLowerCase() ||
        roleKeywords.some((kw) => titleLower.includes(kw))
      );
    });
  }, [vacancies, currentRole]);

  // Compute live active vacancies salary average
  const liveSalaryStats = useMemo(() => {
    const validSalaries = matchingVacancies
      .filter((v) => !v.hideSalary && v.minSalary && v.maxSalary)
      .map((v) => ({
        min: v.minSalary || 0,
        max: v.maxSalary || 0,
        mid: ((v.minSalary || 0) + (v.maxSalary || 0)) / 2,
      }));

    if (validSalaries.length === 0) return null;
    const avg = Math.round(validSalaries.reduce((acc, curr) => acc + curr.mid, 0) / validSalaries.length);
    const min = Math.min(...validSalaries.map((s) => s.min));
    const max = Math.max(...validSalaries.map((s) => s.max));
    return { avg, min, max, count: validSalaries.length };
  }, [matchingVacancies]);

  // Formatted chart data with currency scaling
  const timelineChartData = useMemo(() => {
    return currentRole.trendHistory.map((pt) => ({
      period: pt.period,
      'Minimum Maaş': Math.round(pt.minSalary * rate),
      'Orta Bazar Maaşı': Math.round(pt.avgSalary * rate),
      'Maksimum Maaş': Math.round(pt.maxSalary * rate),
      'Vakansiya Sayı': pt.openingsCount,
    }));
  }, [currentRole, rate]);

  const experienceChartData = useMemo(() => {
    return currentRole.experienceBreakdown.map((exp) => ({
      level: exp.level,
      'Orta Maaş': Math.round(exp.avgSalary * rate),
      'Min': Math.round(exp.minSalary * rate),
      'Maks': Math.round(exp.maxSalary * rate),
      sampleSize: exp.sampleSize,
    }));
  }, [currentRole, rate]);

  const cityChartData = useMemo(() => {
    return currentRole.cityComparison.map((city) => ({
      city: city.city,
      'Orta Maaş': Math.round(city.avgSalary * rate),
    }));
  }, [currentRole, rate]);

  const categoriesList = ['Hamısı', ...Array.from(new Set(STORED_SALARY_TRENDS.map((r) => r.category)))];

  // Active Category Name (derived from selected category or current role)
  const activeCategory = selectedCategory !== 'Hamısı' ? selectedCategory : currentRole.category;

  // Aggregate market salary data for the active category
  const categoryMarketStats = useMemo(() => {
    // Find all preset roles in this category
    const rolesInCategory = STORED_SALARY_TRENDS.filter((r) => r.category === activeCategory);
    
    // Fallback if none found or custom role analyzed
    if (rolesInCategory.length === 0) {
      return {
        categoryName: activeCategory,
        roles: [currentRole],
        minSalary: currentRole.currentMinSalary,
        avgSalary: currentRole.currentAvgSalary,
        maxSalary: currentRole.currentMaxSalary,
        experienceBreakdown: currentRole.experienceBreakdown,
        yearlyGrowth: currentRole.yearlyGrowthPct,
        topSkills: currentRole.topSkillsValue,
      };
    }

    const minSalary = Math.min(...rolesInCategory.map((r) => r.currentMinSalary));
    const maxSalary = Math.max(...rolesInCategory.map((r) => r.currentMaxSalary));
    const avgSalary = Math.round(
      rolesInCategory.reduce((acc, r) => acc + r.currentAvgSalary, 0) / rolesInCategory.length
    );

    // Aggregate experience levels across all roles in this category
    const standardLevels = ['Junior (0-1 il)', 'Mid-level (1-3 il)', 'Senior (3-5+ il)', 'Lead / Rəhbər (5+ il)'];
    const experienceBreakdown = standardLevels.map((lvlName, idx) => {
      const expList = rolesInCategory
        .map((r) => r.experienceBreakdown[idx])
        .filter(Boolean);

      if (expList.length === 0) {
        return {
          level: lvlName,
          minSalary: Math.round(minSalary * (0.6 + idx * 0.2)),
          avgSalary: Math.round(avgSalary * (0.65 + idx * 0.22)),
          maxSalary: Math.round(maxSalary * (0.65 + idx * 0.22)),
          sampleSize: 20
        };
      }

      return {
        level: lvlName,
        minSalary: Math.min(...expList.map((e) => e.minSalary)),
        avgSalary: Math.round(expList.reduce((acc, e) => acc + e.avgSalary, 0) / expList.length),
        maxSalary: Math.max(...expList.map((e) => e.maxSalary)),
        sampleSize: expList.reduce((acc, e) => acc + e.sampleSize, 0)
      };
    });

    const yearlyGrowth = +(
      rolesInCategory.reduce((acc, r) => acc + r.yearlyGrowthPct, 0) / rolesInCategory.length
    ).toFixed(1);

    return {
      categoryName: activeCategory,
      roles: rolesInCategory,
      minSalary,
      avgSalary,
      maxSalary,
      experienceBreakdown,
      yearlyGrowth,
      topSkills: rolesInCategory[0]?.topSkillsValue || currentRole.topSkillsValue,
    };
  }, [activeCategory, currentRole]);

  // Scaled values based on active currency
  const userExpectationScaled = Math.round(userExpectationAZN * rate);
  const categoryAvgScaled = Math.round(categoryMarketStats.avgSalary * rate);
  const categoryMinScaled = Math.round(categoryMarketStats.minSalary * rate);
  const categoryMaxScaled = Math.round(categoryMarketStats.maxSalary * rate);

  // Delta calculations
  const salaryDifference = userExpectationAZN - categoryMarketStats.avgSalary;
  const salaryDiffPercent = Math.round(
    ((userExpectationAZN - categoryMarketStats.avgSalary) / categoryMarketStats.avgSalary) * 100
  );

  // Percentile within category range (clamped between 0% and 100%)
  const marketPercentile = useMemo(() => {
    const range = categoryMarketStats.maxSalary - categoryMarketStats.minSalary;
    if (range <= 0) return 50;
    const p = Math.round(
      ((userExpectationAZN - categoryMarketStats.minSalary) / range) * 100
    );
    return Math.max(0, Math.min(100, p));
  }, [userExpectationAZN, categoryMarketStats]);

  // Vacancies meeting or exceeding user expectation
  const vacanciesMeetingExpectation = useMemo(() => {
    return matchingVacancies.filter((v) => {
      if (v.hideSalary) return false;
      const effectiveMax = v.maxSalary || v.minSalary || 0;
      return effectiveMax >= userExpectationAZN;
    });
  }, [matchingVacancies, userExpectationAZN]);

  // Diagnostic status & recommendations
  const expectationStatus = useMemo(() => {
    if (userExpectationAZN < categoryMarketStats.minSalary) {
      return {
        badge: 'Bazar Minimumundan Aşağı',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        badgeBg: 'bg-amber-100 text-amber-800',
        title: 'Maaş gözləntiniz bazar minimumundan azdır',
        desc: 'Bu rəqəm işəgötürənlər üçün çox cəlbedici olsa da, bazar dəyərinizdən aşağı əmək haqqı almaq riskiniz var. Əmək haqqı danışıqlarında daha cəsarətli tələb irəli sürə bilərsiniz.',
        advice: `Müsahibələrdə minimum ${formatMoney(categoryMarketStats.minSalary)} və ya kateqoriya ortalaması olan ${formatMoney(categoryMarketStats.avgSalary)} məbləğini hədəfləməyiniz tövsiyə edilir.`,
        levelMatch: 'Təcrübəçi / İlkin Başlanğıc (Junior)',
        percentDiffText: `${Math.abs(salaryDiffPercent)}% bazar ortalamasından aşağı`,
        statusType: 'below_min'
      };
    }
    if (userExpectationAZN < categoryMarketStats.avgSalary * 0.9) {
      return {
        badge: 'Bazar Ortalamasından Aşağı',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        badgeBg: 'bg-blue-100 text-blue-800',
        title: 'Gözləntiniz orta bazar səviyyəsindən bir qədər aşağıdır',
        desc: 'Şirkətlərin büdcəsinə çox asan uyğunlaşır və iş təklifi alma şansınız yüksəkdir. Danışıqlarda orta həddə yaxınlaşmaq mümkündür.',
        advice: `Portfelinizi və nailiyyətlərinizi təqdim edərək ${formatMoney(categoryMarketStats.avgSalary)} tələb edə bilərsiniz.`,
        levelMatch: 'Junior+ / Mid-level başlanğıcı',
        percentDiffText: `${Math.abs(salaryDiffPercent)}% bazar ortalamasından aşağı`,
        statusType: 'below_avg'
      };
    }
    if (userExpectationAZN <= categoryMarketStats.avgSalary * 1.15) {
      return {
        badge: 'Bazarın Qızıl Ortası (Optimal)',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badgeBg: 'bg-emerald-100 text-emerald-800',
        title: 'Gözləntiniz bazar ortalaması ilə tam balanslaşdırılıb',
        desc: 'Mükəmməl rəqabətədavamlı mövqedəsiniz! Həm yerli şirkətlər, həm də holdinqlər üçün ən optimal və real büdcə aralığıdır.',
        advice: 'Tələb olunan bacarıqları göstərərək müsahibələrdə bu məbləği asanlıqla təsdiqlədə bilərsiniz.',
        levelMatch: 'Təcrübəli Mid-level / Güclü Mütəxəssis',
        percentDiffText: salaryDiffPercent >= 0 ? `+${salaryDiffPercent}% bazar ortalaması ilə eyni` : `${Math.abs(salaryDiffPercent)}% bazar ortalaması ilə eyni`,
        statusType: 'optimal'
      };
    }
    if (userExpectationAZN <= categoryMarketStats.maxSalary) {
      return {
        badge: 'Senior & İxtisaslaşmış Səviyyə',
        color: 'text-purple-700 bg-purple-50 border-purple-200',
        badgeBg: 'bg-purple-100 text-purple-800',
        title: 'Gözləntiniz bazar ortalamasından yüksəkdir (Senior)',
        desc: 'Bu maaş səviyyəsi dərin texniki təcrübə, layihə rəhbərliyi və ya xüsusi çətin bacarıqlar tələb edir.',
        advice: `Bu gözləntini əsaslandırmaq üçün CV-nizdə ölçülə bilən nəticələri və ${categoryMarketStats.topSkills[0]?.skill || 'liderlik bacarıqlarını'} qabardın.`,
        levelMatch: 'Senior / Aparıcı Mütəxəssis (3-5+ il)',
        percentDiffText: `+${salaryDiffPercent}% bazar ortalamasından yuxarı`,
        statusType: 'senior'
      };
    }
    return {
      badge: 'Bazar Maksimumunu Üstələyir (Top / Qlobal)',
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      title: 'Gözləntiniz yerli bazar maksimumunu aşır',
      desc: 'Bu gəlir səviyyəsi yerli bazar standartlarından yüksəkdir. Əsasən xarici şirkətlərə distant (remote) iş, beynəlxalq layihələr və ya C-level rəhbər vəzifələr üçün xarakterikdir.',
      advice: 'Xarici remote vakansiyalara müraciət edin və ingilis dilli beynəlxalq layihələrdə iştirakınızı təqdim edin.',
      levelMatch: 'Lead / Principal / Beynəlxalq Remote',
      percentDiffText: `+${salaryDiffPercent}% yerli bazar həddindən yuxarı`,
      statusType: 'global'
    };
  }, [userExpectationAZN, categoryMarketStats, salaryDiffPercent, rate]);

  // Chart datasets for Expectation comparison
  // 1. Roles in this category vs User Expectation
  const categoryRolesExpectationData = useMemo(() => {
    return categoryMarketStats.roles.map((r) => ({
      roleName: r.roleName.split('(')[0].trim(),
      fullName: r.roleName,
      'Bazar Minimumu': Math.round(r.currentMinSalary * rate),
      'Bazar Ortalaması': Math.round(r.currentAvgSalary * rate),
      'Bazar Maksimumu': Math.round(r.currentMaxSalary * rate),
      'Sizin Gözləntiniz': userExpectationScaled,
    }));
  }, [categoryMarketStats, rate, userExpectationScaled]);

  // 2. Experience levels in this category vs User Expectation
  const experienceExpectationData = useMemo(() => {
    return categoryMarketStats.experienceBreakdown.map((exp) => ({
      level: exp.level,
      'Bazar Minimumu': Math.round(exp.minSalary * rate),
      'Bazar Ortalaması': Math.round(exp.avgSalary * rate),
      'Bazar Maksimumu': Math.round(exp.maxSalary * rate),
      'Sizin Gözləntiniz': userExpectationScaled,
      sampleSize: exp.sampleSize,
    }));
  }, [categoryMarketStats, rate, userExpectationScaled]);

  // 3. Market Range Spread Breakdown
  const marketSpreadData = useMemo(() => {
    return [
      {
        dimension: 'Bazar Minimumu',
        amount: categoryMinScaled,
        fill: '#94a3b8',
        desc: 'Bu kateqoriyada ən aşağı qeydə alınan hədd'
      },
      {
        dimension: 'Bazar Ortalaması',
        amount: categoryAvgScaled,
        fill: '#2563eb',
        desc: 'Bazar üzrə ümumi orta əmək haqqı'
      },
      {
        dimension: 'Sizin Gözləntiniz',
        amount: userExpectationScaled,
        fill: '#7c3aed',
        desc: 'Tələb etdiyiniz hədəf maaş'
      },
      {
        dimension: 'Bazar Maksimumu',
        amount: categoryMaxScaled,
        fill: '#10b981',
        desc: 'Bu kateqoriyada ən yüksək təklif olunan hədd'
      }
    ];
  }, [categoryMinScaled, categoryAvgScaled, userExpectationScaled, categoryMaxScaled]);

  // Custom tooltip for Sleek theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[170px]">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            const isExpectation = entry.name === 'Sizin Gözləntiniz';
            return (
              <div 
                key={`item-${index}`} 
                className={`flex items-center justify-between gap-3 ${isExpectation ? 'bg-purple-950/60 px-1.5 py-0.5 rounded font-bold text-purple-200 border border-purple-800/60' : ''}`}
              >
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                  {entry.name}:
                </span>
                <span className={`font-bold ${isExpectation ? 'text-purple-300' : 'text-white'}`}>
                  {entry.name === 'Vakansiya Sayı' ? `${entry.value} elan` : `${entry.value.toLocaleString()} ${currencySymbol}`}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Azərbaycan Əmək Bazarı & Recharts Analitikası</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Vəzifələr Üzrə Maaş Trendləri və Bazar İcmalı
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Tarixi və cari vakansiya məlumatları əsasında formalaşdırılmış interaktiv qrafiklər, təcrübə səviyyələri və bazar proqnozları.
          </p>
        </div>

        {/* Currency toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center text-xs font-medium">
            <button
              onClick={() => setCurrency('AZN')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                currency === 'AZN'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ₼ AZN
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Market Position Analyzer & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bütün bazar üzrə istənilən vəzifə adı yazın (məs: Python Developer, Baş Mühasib, Sürücü, Satış Meneceri...)"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  if (customAnalyzedStats) handleResetToPresets();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Təmizlə"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!searchQuery.trim() || isAnalyzing}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Analiz Edilir...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Bazar Üzrə Analiz Et</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Clickable Popular Position Chips */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>Populyar vəzifə axtarışları (bir kliklə analiz):</span>
            {customAnalyzedStats && (
              <button
                type="button"
                onClick={handleResetToPresets}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Standart siyahıya qayıt</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {POPULAR_MARKET_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setSearchQuery(role);
                  executeMarketAnalysis(role);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all border ${
                  currentRole.roleName.toLowerCase() === role.toLowerCase()
                    ? 'bg-blue-50 border-blue-400 text-blue-800 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Analyzed Role Active Badge Banner */}
        {customAnalyzedStats && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-950 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>
                <strong>«{customAnalyzedStats.roleName}»</strong> vəzifəsi üzrə bütün Azərbaycan əmək bazarı, cari vakansiyalar və tarixi analitika emal edildi.
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetToPresets}
              className="px-3 py-1 bg-white hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 shadow-2xs transition-colors shrink-0 text-xs"
            >
              Standart Şablonlara Qayıt
            </button>
          </div>
        )}

        {/* Categories & Presets Carousel when not in custom role mode */}
        {!customAnalyzedStats && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none text-xs">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Roles Carousel / Horizontal Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {filteredRoles.map((role) => (
                <button
                  key={role.roleId}
                  onClick={() => {
                    setSelectedRoleId(role.roleId);
                    setCustomAnalyzedStats(null);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all border shrink-0 ${
                    selectedRoleId === role.roleId
                      ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>{role.roleName.split('(')[0].trim()}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                    {formatMoney(role.currentAvgSalary)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Stats Cards for Selected Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Cari Orta Maaş</span>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{currentRole.yearlyGrowthPct}%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">
            {formatMoney(currentRole.currentAvgSalary)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            İllik artım tempi: <span className="font-semibold text-slate-700">Davamlı yüksələn</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Bazar Aralığı</span>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Min - Maks
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">
            {formatMoney(currentRole.currentMinSalary)} - {formatMoney(currentRole.currentMaxSalary)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Real bazar diapazonu
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Bazar Tələbatı</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {currentRole.demandLevel}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">
            {currentRole.demandLevel}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Portalda <span className="font-bold text-blue-600">{matchingVacancies.length}</span> aktiv elan
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Uzaqdan / Remote Əlavəsi</span>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Qlobal
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5">
            {formatMoney(currentRole.cityComparison.find(c => c.city.includes('Remote'))?.avgSalary || currentRole.currentAvgSalary * 1.35)}
          </div>
          <p className="text-[11px] text-purple-700 font-medium mt-1">
            Yerli tariflərdən ~35-40% yüksək
          </p>
        </div>
      </div>

      {/* Interactive Quick Benchmark & Expectation Launch Bar */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">
                Gözləntiniz: <strong className="text-purple-700">{formatMoney(userExpectationAZN)}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-600">
                «{categoryMarketStats.categoryName}» Ortalaması: <strong className="text-blue-700">{formatMoney(categoryMarketStats.avgSalary)}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${expectationStatus.color}`}>
                {expectationStatus.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Kateqoriya üzrə bazar aralığı: {formatMoney(categoryMarketStats.minSalary)} - {formatMoney(categoryMarketStats.maxSalary)} ({marketPercentile}-ci persentil)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setChartType('d3_benchmark')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 self-start md:self-auto ${
            chartType === 'd3_benchmark'
              ? 'bg-purple-700 text-white shadow-purple-200'
              : 'bg-white hover:bg-purple-600 hover:text-white text-purple-700 border border-purple-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>{chartType === 'd3_benchmark' ? 'D3.js Qrafik Açıqdır' : 'D3.js İnteraktiv Qrafikdə Müqayisə Et'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Visualization Interactive Section */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{currentRole.roleName}</span>
              <span className="text-xs font-normal text-slate-500">({currentRole.category})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{currentRole.description}</p>
          </div>

          {/* Chart View Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1 text-xs font-medium w-full sm:w-auto overflow-x-auto scrollbar-none">
            <button
              onClick={() => setChartType('d3_benchmark')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                chartType === 'd3_benchmark'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 font-bold'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>D3.js Real Bazar & Gözlənti</span>
            </button>
            <button
              onClick={() => setChartType('timeline')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                chartType === 'timeline'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maaş Dinamikası
            </button>
            <button
              onClick={() => setChartType('experience')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                chartType === 'experience'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Təcrübə Səviyyəsi
            </button>
            <button
              onClick={() => setChartType('cities')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                chartType === 'cities'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Şəhər & Remote
            </button>
            <button
              onClick={() => setChartType('expectation')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                chartType === 'expectation'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Maaş Cədvəli & Recharts</span>
            </button>
          </div>
        </div>

        {/* 0. D3.JS INTERACTIVE MARKET SALARY BENCHMARK & USER EXPECTATION CHART */}
        {chartType === 'd3_benchmark' && (
          <div className="space-y-4">
            <D3SalaryExpectationChart
              roleName={currentRole.roleName}
              category={currentRole.category}
              minSalary={currentRole.currentMinSalary}
              avgSalary={currentRole.currentAvgSalary}
              maxSalary={currentRole.currentMaxSalary}
              experienceBreakdown={currentRole.experienceBreakdown}
              matchingVacancies={matchingVacancies}
              userExpectationAZN={userExpectationAZN}
              onUpdateUserExpectation={setUserExpectationAZN}
              currency={currency}
              rate={rate}
              onSelectVacancy={onSelectVacancy}
            />
          </div>
        )}

        {/* 1. TIMELINE RECHARTS VISUALIZATION */}
        {chartType === 'timeline' && (
          <div className="space-y-4">
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineChartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val.toLocaleString()} ${currencySymbol}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="Maksimum Maaş"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMax)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Orta Bazar Maaşı"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAvg)"
                  />
                  <Line
                    type="monotone"
                    dataKey="Minimum Maaş"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#94a3b8' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Qrafikdə son 8 rüb üzrə real iş təklifləri və əmək bazarı sorğularının orta rəqəmləri əks olunmuşdur.</span>
              </span>
              <span className="font-bold text-slate-900 hidden sm:inline">
                Davamlı artım: +{currentRole.yearlyGrowthPct}%
              </span>
            </div>
          </div>
        )}

        {/* 2. EXPERIENCE LEVEL RECHARTS VISUALIZATION */}
        {chartType === 'experience' && (
          <div className="space-y-4">
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={experienceChartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="level" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val.toLocaleString()} ${currencySymbol}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>}
                  />
                  <Bar dataKey="Orta Maaş" fill="#2563eb" radius={[6, 6, 0, 0]}>
                    {experienceChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 3 ? '#1e40af' : index === 2 ? '#2563eb' : index === 1 ? '#3b82f6' : '#60a5fa'} 
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="Min" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Maks" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {currentRole.experienceBreakdown.map((exp, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block text-xs">{exp.level}</span>
                  <div className="text-sm font-bold text-blue-700 mt-1">
                    {formatMoney(exp.avgSalary)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Aralıq: {formatMoney(exp.minSalary)} - {formatMoney(exp.maxSalary)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CITIES & REMOTE COMPARISON RECHARTS */}
        {chartType === 'cities' && (
          <div className="space-y-4">
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cityChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val.toLocaleString()} ${currencySymbol}`}
                  />
                  <YAxis 
                    dataKey="city" 
                    type="category"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} 
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Orta Maaş" fill="#2563eb" radius={[0, 6, 6, 0]}>
                    {cityChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.city.includes('Remote') ? '#7c3aed' : '#2563eb'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
              <span>
                💡 <strong>Distant (Remote) İş İmkanları:</strong> Xarici və beynəlxalq şirkətlərə uzaqdan çalışan Azərbaycanlı mütəxəssislər orta hesabla <strong>{formatMoney(currentRole.cityComparison.find(c => c.city.includes('Remote'))?.avgSalary || 0)}</strong> qazanırlar.
              </span>
            </div>
          </div>
        )}

        {/* 4. INTERACTIVE EXPECTATION VS MARKET SALARY RANGE RECHARTS COMPARISON */}
        {chartType === 'expectation' && (
          <div className="space-y-6 animate-fade-in">
            {/* Interactive Expectation Controls Card */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-blue-900/50 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-semibold mb-2">
                    <Target className="w-3.5 h-3.5 text-purple-400" />
                    <span>İnteraktiv Maaş Müqayisəsi & Qrafik</span>
                  </div>
                  <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Maaş Gözləntiniz vs Bazar Diapazonu</span>
                    <span className="text-xs font-medium text-blue-300 px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-700/60">
                      {categoryMarketStats.categoryName}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Aylıq arzuladığınız maaş məbləğini daxil edin və ya sürüşdürücüdən istifadə edərək bu kateqoriya üzrə bazarın minimum, orta və maksimum hədləri ilə canlı müqayisə edin.
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${expectationStatus.color}`}>
                    {expectationStatus.badge}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Bazar Ortalamasından: <strong className={salaryDifference >= 0 ? 'text-green-400' : 'text-amber-400'}>
                      {salaryDifference >= 0 ? '+' : ''}{salaryDiffPercent}% ({salaryDifference >= 0 ? '+' : ''}{formatMoney(salaryDifference)})
                    </strong>
                  </span>
                </div>
              </div>

              {/* Slider & Quick Input Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* Left: Input & Stepper Buttons */}
                <div className="lg:col-span-5 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Aylıq Əmək Haqqı Gözləntiniz:</span>
                    <span className="text-[11px] text-purple-300 font-bold">
                      {formatMoney(userExpectationAZN)}
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUserExpectationAZN((prev) => Math.max(300, prev - 250))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold border border-slate-700 transition-colors cursor-pointer shrink-0"
                      title="-250 ₼"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="300"
                        max="25000"
                        step="50"
                        value={userExpectationScaled}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setUserExpectationAZN(Math.round(val / rate));
                        }}
                        className="w-full bg-slate-800/90 text-white font-bold text-base sm:text-lg px-4 py-2 rounded-xl border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-center"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        {currencySymbol}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUserExpectationAZN((prev) => Math.min(25000, prev + 250))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold border border-slate-700 transition-colors cursor-pointer shrink-0"
                      title="+250 ₼"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">Sürətli seçimlər:</span>
                    {[1000, 1800, 2500, 3500, 5000, 7000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setUserExpectationAZN(amt)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all border ${
                          userExpectationAZN === amt
                            ? 'bg-purple-600 text-white border-purple-400 font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        {formatMoney(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Interactive Range Slider & Category Presets */}
                <div className="lg:col-span-7 space-y-3.5 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                    <span>İnteraktiv diapazon sürüşdürücüsü:</span>
                    <span className="text-purple-300 font-bold">
                      Bazarın {marketPercentile}-ci persentili
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="range"
                      min="500"
                      max="10000"
                      step="50"
                      value={userExpectationAZN}
                      onChange={(e) => setUserExpectationAZN(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                      <span>500 ₼</span>
                      <span>Kateqoriya Ortalaması: {formatMoney(categoryMarketStats.avgSalary)}</span>
                      <span>10 000 ₼+</span>
                    </div>
                  </div>

                  {/* One-click alignment buttons */}
                  <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setUserExpectationAZN(categoryMarketStats.avgSalary)}
                      className="px-2.5 py-1 bg-blue-900/60 hover:bg-blue-800 text-blue-200 rounded-lg border border-blue-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span>Kateqoriya Ortasına Bərabərləşdir ({formatMoney(categoryMarketStats.avgSalary)})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserExpectationAZN(currentRole.currentAvgSalary)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Briefcase className="w-3 h-3 text-blue-400" />
                      <span>{currentRole.roleName.split('(')[0].trim()} ({formatMoney(currentRole.currentAvgSalary)})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Visual Spectrum / Horizontal Range Bar */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>«{categoryMarketStats.categoryName}» Kateqoriyasının Bazar Spektri:</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Bazar Aralığı: {formatMoney(categoryMarketStats.minSalary)} - {formatMoney(categoryMarketStats.maxSalary)}
                  </span>
                </div>

                {/* Progress bar with markers */}
                <div className="relative pt-6 pb-2">
                  <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex relative border border-slate-700">
                    <div className="w-1/3 bg-slate-600/70 h-full border-r border-slate-800/60" title="Aşağı Diapazon" />
                    <div className="w-1/3 bg-blue-600/70 h-full border-r border-slate-800/60" title="Orta Bazar Aralığı" />
                    <div className="w-1/3 bg-emerald-600/70 h-full" title="Yüksək Bazar Aralığı" />
                  </div>

                  {/* Marker Pin for User Expectation */}
                  <div 
                    className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300"
                    style={{ left: `${Math.max(5, Math.min(95, marketPercentile))}%` }}
                  >
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white shadow-md border border-purple-300 whitespace-nowrap">
                      Sizin Gözlənti: {formatMoney(userExpectationAZN)}
                    </span>
                    <div className="w-0.5 h-3 bg-purple-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-400 ring-2 ring-purple-200" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Minimum: <strong className="text-slate-200">{formatMoney(categoryMarketStats.minSalary)}</strong></span>
                  <span>Orta Bazar: <strong className="text-blue-300">{formatMoney(categoryMarketStats.avgSalary)}</strong></span>
                  <span>Maksimum: <strong className="text-emerald-300">{formatMoney(categoryMarketStats.maxSalary)}</strong></span>
                </div>
              </div>
            </div>

            {/* Scope Switcher & Category Quick Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              {/* Category Quick Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-[11px] font-semibold text-slate-500 shrink-0 mr-1">Kateqoriya:</span>
                {categoriesList.filter(c => c !== 'Hamısı').map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      const matchingPreset = STORED_SALARY_TRENDS.find(r => r.category === cat);
                      if (matchingPreset) setSelectedRoleId(matchingPreset.roleId);
                    }}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-xs font-medium transition-colors border ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sub-chart scope toggles */}
              <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1 text-xs font-medium self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setExpectationScope('category_roles')}
                  className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                    expectationScope === 'category_roles'
                      ? 'bg-white text-blue-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kateqoriya Vəzifələri
                </button>
                <button
                  onClick={() => setExpectationScope('experience_levels')}
                  className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                    expectationScope === 'experience_levels'
                      ? 'bg-white text-blue-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Təcrübə Səviyyələri
                </button>
                <button
                  onClick={() => setExpectationScope('market_spread')}
                  className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all cursor-pointer ${
                    expectationScope === 'market_spread'
                      ? 'bg-white text-blue-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bazar Aralığı Paylanması
                </button>
              </div>
            </div>

            {/* CHART 1: Category Roles vs User Expectation */}
            {expectationScope === 'category_roles' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                  <span className="font-semibold text-slate-800">
                    «{categoryMarketStats.categoryName}» kateqoriyasındakı vəzifələr üzrə bazar aralığı və sizin gözlənti xəttiniz:
                  </span>
                  <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Bənövşəyi xətt: Sizin Gözləntiniz ({formatMoney(userExpectationAZN)})
                  </span>
                </div>

                <div className="h-88 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryRolesExpectationData}
                      margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="roleName" 
                        tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={45}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        tickFormatter={(val) => `${val.toLocaleString()} ${currencySymbol}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="top" 
                        height={40} 
                        formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>}
                      />
                      <ReferenceLine 
                        y={userExpectationScaled} 
                        stroke="#8b5cf6" 
                        strokeWidth={2.5} 
                        strokeDasharray="5 5"
                        label={{
                          value: `Gözlənti: ${formatMoney(userExpectationAZN)}`,
                          fill: '#7c3aed',
                          fontSize: 11,
                          fontWeight: 'bold',
                          position: 'top'
                        }}
                      />
                      <Bar dataKey="Bazar Minimumu" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Bazar Ortalaması" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Bazar Maksimumu" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Sizin Gözləntiniz" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* CHART 2: Experience Levels vs User Expectation */}
            {expectationScope === 'experience_levels' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                  <span className="font-semibold text-slate-800">
                    Təcrübə pillələri (Junior, Mid, Senior, Lead) ilə maaş gözləntinizin müqayisəsi:
                  </span>
                  <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Bənövşəyi xətt: Sizin Gözləntiniz ({formatMoney(userExpectationAZN)})
                  </span>
                </div>

                <div className="h-88 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={experienceExpectationData}
                      margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="level" 
                        tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        tickFormatter={(val) => `${val.toLocaleString()} ${currencySymbol}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="top" 
                        height={40} 
                        formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>}
                      />
                      <ReferenceLine 
                        y={userExpectationScaled} 
                        stroke="#8b5cf6" 
                        strokeWidth={2.5} 
                        strokeDasharray="5 5"
                        label={{
                          value: `Gözlənti: ${formatMoney(userExpectationAZN)}`,
                          fill: '#7c3aed',
                          fontSize: 11,
                          fontWeight: 'bold',
                          position: 'top'
                        }}
                      />
                      <Bar dataKey="Bazar Minimumu" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Bazar Ortalaması" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Bazar Maksimumu" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Sizin Gözləntiniz" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* CHART 3: Market Spread Breakdown */}
            {expectationScope === 'market_spread' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                  <span className="font-semibold text-slate-800">
                    Bazar Aralığı Hədləri ilə Sizin Maaş Gözləntiniz:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Kateqoriya: <strong className="text-slate-800">{categoryMarketStats.categoryName}</strong>
                  </span>
                </div>

                <div className="h-88 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={marketSpreadData}
                      margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="dimension" 
                        tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        tickFormatter={(val) => `${val.toLocaleString()} ${currencySymbol}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                        {marketSpreadData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Comprehensive Diagnostic Insights & Career Advice Block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kateqoriya Ortalaması</span>
                <div className="text-xl font-bold text-blue-700">
                  {formatMoney(categoryMarketStats.avgSalary)}
                </div>
                <p className="text-[11px] text-slate-500">
                  Diapazon: {formatMoney(categoryMarketStats.minSalary)} - {formatMoney(categoryMarketStats.maxSalary)}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-1">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Sizin Gözləntiniz</span>
                <div className="text-xl font-bold text-purple-900">
                  {formatMoney(userExpectationAZN)}
                </div>
                <p className="text-[11px] text-purple-700 font-medium">
                  {expectationStatus.percentDiffText}
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Gözləntiyə Uyğun Elanlar</span>
                <div className="text-xl font-bold text-emerald-800">
                  {vacanciesMeetingExpectation.length} aktiv vakansiya
                </div>
                <p className="text-[11px] text-emerald-700">
                  ≥ {formatMoney(userExpectationAZN)} maaş təklif edən şirkətlər
                </p>
              </div>
            </div>

            {/* Personalized Guidance Banner */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${expectationStatus.color}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{expectationStatus.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${expectationStatus.badgeBg}`}>
                    {expectationStatus.levelMatch}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">
                  {expectationStatus.desc}
                </p>
                <p className="text-slate-800 font-semibold text-xs pt-1">
                  💡 <strong>Tövsiyə:</strong> {expectationStatus.advice}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Grid: Top Value Skills & Live Vacancies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Skills That Boost Salary */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Ən Çox Dəyər Qatan Bacarıqlar</span>
            </h4>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              Maaş Artımı
            </span>
          </div>

          <div className="space-y-2.5">
            {currentRole.topSkillsValue.map((skillItem, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{skillItem.skill}</span>
                </div>
                <span className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 shrink-0">
                  {skillItem.salaryBoost}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500">
            📌 Bu bacarıqları CV-nizə əlavə edərək və layihələrlə təsdiqləyərək şirkətlərlə əmək haqqı danışıqlarında üstünlük qazana bilərsiniz.
          </div>
        </div>

        {/* Right Column: Portalda Bu Vəzifə Üzrə Mövcud Aktiv Vakansiyalar */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Portalda Aktiv Uyğun Vakansiyalar ({matchingVacancies.length})</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bu sahə üzrə dərhal müraciət edə biləcəyiniz elanlar
              </p>
            </div>

            {liveSalaryStats && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Elanlar üzrə orta</span>
                <span className="text-xs font-bold text-blue-700">{formatMoney(liveSalaryStats.avg)}</span>
              </div>
            )}
          </div>

          {matchingVacancies.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
              Bu vəzifə üzrə hazırda yeni vakansiya elanı gözlənilir. Digər kateqoriyalara baxa bilərsiniz.
            </div>
          ) : (
            <div className="space-y-2.5">
              {matchingVacancies.slice(0, 4).map((vac) => (
                <div
                  key={vac.id}
                  onClick={() => onSelectVacancy && onSelectVacancy(vac)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer bg-white flex items-center justify-between gap-3 text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={vac.companyLogo}
                      alt={vac.companyName}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {vac.title}
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        {vac.companyName} • {vac.city} • {vac.employmentType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {vac.hideSalary ? 'Müsahibə ilə' : `${formatMoney(vac.minSalary || 0)} - ${formatMoney(vac.maxSalary || 0)}`}
                    </span>
                    <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
