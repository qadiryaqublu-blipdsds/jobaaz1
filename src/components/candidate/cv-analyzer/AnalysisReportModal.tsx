import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  FileText,
  Target,
  Layers,
  Search,
  Filter,
  ArrowRight,
  Info,
  ShieldAlert,
  Zap,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { CVAnalyzerResult, DetailedKeywordItem, ConcreteAdviceItem } from '../../../types/cvAnalyzer';

interface AnalysisReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CVAnalyzerResult;
}

export const AnalysisReportModal: React.FC<AnalysisReportModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const [copied, setCopied] = useState(false);
  const [activeKeywordFilter, setActiveKeywordFilter] = useState<'all' | 'missing' | 'matched'>('missing');
  const [keywordSearch, setKeywordSearch] = useState('');
  const [copiedSentenceIndex, setCopiedSentenceIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const candidateName = data.personalInfo?.fullName || 'Namizəd';
  const roleName = data.candidateProfile?.primaryProfession || data.workExperience?.[0]?.position || 'Peşəkar Mütəxəssis';
  const atsScore = data.atsAnalysis?.atsScore ?? data.atsScoreBreakdown?.totalScore ?? 75;

  const detailedKeywords = data.keywordAnalysis?.detailedKeywords || [];
  const concreteAdvice = data.keywordAnalysis?.concreteAdvice || [];
  const categoryBreakdown = data.keywordAnalysis?.categoryBreakdown || [
    {
      category: 'technical',
      categoryLabel: 'Texniki Bacarıqlar',
      matchedCount: data.keywordAnalysis?.matchedKeywords?.length || 4,
      missingCount: data.keywordAnalysis?.missingKeywords?.length || 3,
      totalCount: 7,
      matchRate: 57
    },
    {
      category: 'tool',
      categoryLabel: 'Proqram və Alətlər',
      matchedCount: data.skills?.softwareTools?.length || 3,
      missingCount: 2,
      totalCount: 5,
      matchRate: 60
    },
    {
      category: 'industry',
      categoryLabel: 'Sahəvi Metodologiyalar',
      matchedCount: 2,
      missingCount: 2,
      totalCount: 4,
      matchRate: 50
    },
    {
      category: 'soft',
      categoryLabel: 'Soft & Liderlik',
      matchedCount: data.skills?.softSkills?.length || 3,
      missingCount: 1,
      totalCount: 4,
      matchRate: 75
    }
  ];

  // Prepare chart data for Recharts
  const chartData = categoryBreakdown.map((item) => ({
    name: item.categoryLabel,
    'Mövcud Açar Sözlər': item.matchedCount,
    'Çatışmayan Açar Sözlər': item.missingCount,
    'Uyğunluq %': item.matchRate
  }));

  // Filter keywords list
  const filteredKeywords = detailedKeywords.filter((kw) => {
    if (activeKeywordFilter === 'missing' && kw.status !== 'missing') return false;
    if (activeKeywordFilter === 'matched' && kw.status !== 'matched') return false;
    if (keywordSearch.trim()) {
      const q = keywordSearch.toLowerCase();
      return (
        kw.name.toLowerCase().includes(q) ||
        (kw.placementAdvice && kw.placementAdvice.toLowerCase().includes(q)) ||
        (kw.sampleSentence && kw.sampleSentence.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const missingCount = detailedKeywords.filter((k) => k.status === 'missing').length || data.keywordAnalysis?.missingKeywords?.length || 0;
  const matchedCount = detailedKeywords.filter((k) => k.status === 'matched').length || data.keywordAnalysis?.matchedKeywords?.length || 0;

  const handleCopyReport = () => {
    const reportMarkdown = `# CV ATS ANALİZ VƏ TƏKMİLLƏŞDİRMƏ HESABATI
**Namizəd:** ${candidateName}
**Vəzifə / Sahə:** ${roleName}
**ATS Balı:** ${atsScore}/100 (${data.atsAnalysis?.scoreLabel || 'Təhlil Edildi'})
**Tarix:** ${new Date().toLocaleDateString('az-AZ')}

---

## 1. AÇAR SÖZ UYĞUNLUĞU VƏ BOŞLUQLAR
- Mövcud aşkar edilən açar sözlər: ${data.keywordAnalysis?.matchedKeywords?.join(', ') || 'Qeyd olunmayıb'}
- Çatışmayan kritik açar sözlər: ${data.keywordAnalysis?.missingKeywords?.join(', ') || 'Hamısı mövcuddur'}

---

## 2. KONKRET TƏKMİLLƏŞDİRMƏ PLANLARI
${concreteAdvice.map((adv, idx) => `### ${idx + 1}. ${adv.title} (${adv.impactScore})
- **Cari Vəziyyət:** ${adv.currentState}
- **Konkret Həll:** ${adv.actionableFix}
- **Zəif Nümunə (Əvvəl):** "${adv.beforeExample}"
- **Güclü Nümunə (Sonra):** "${adv.afterExample}"
`).join('\n')}

---
Hesabat Jobia AI Platforması tərəfindən avtomatik tərtib edilmişdir.`;

    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopySentence = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSentenceIndex(index);
    setTimeout(() => setCopiedSentenceIndex(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="ats-analysis-report-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0 border-b border-indigo-900/40">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  CV ATS Analiz Hesabatı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Rəsmi Qiymətləndirmə
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                {candidateName} • {roleName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="report-close-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 bg-slate-50/50">
          {/* Executive Score Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center shrink-0">
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center font-black shadow-inner border-2 ${
                      atsScore >= 80
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : atsScore >= 60
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl tracking-tight leading-none">{atsScore}</span>
                    <span className="text-[11px] font-semibold opacity-75 mt-1">/ 100 Bal</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        atsScore >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : atsScore >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {data.atsAnalysis?.scoreLabel || (atsScore >= 80 ? 'Müsahibəyə Hazır' : 'Təkmilləşmə Tələb Olunur')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {data.atsAnalysis?.compatibilityAssessment || 'ATS Uyğunluq Skrini'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    Ümumi ATS Keçid və Reytinq İcmalı
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                    {data.executiveSummary || `${candidateName} üçün CV strukturu təhlil edildi. Aşağıdakı açar söz qrafikini və konkret təkmilləşdirmə tövsiyələrini tətbiq edərək balınızı 90+-a yüksəldə bilərsiniz.`}
                  </p>
                </div>
              </div>

              {/* Quick Metrics Pills */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 shrink-0">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Aşkar edilən</div>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{matchedCount} Açar Söz</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">Çatışmayan</div>
                  <div className="text-base sm:text-lg font-extrabold text-rose-700 mt-0.5 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>{missingCount} Vacib Söz</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5">
              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>ATS Oxunaqlığı</span>
                  <span className="text-indigo-600">{data.atsScoreBreakdown?.atsReadability?.score || 16}/20</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${((data.atsScoreBreakdown?.atsReadability?.score || 16) / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Açar Söz Zənginliyi</span>
                  <span className="text-purple-600">{data.atsScoreBreakdown?.keywordOptimization?.score || 14}/20</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all"
                    style={{ width: `${((data.atsScoreBreakdown?.keywordOptimization?.score || 14) / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>İş Təcrübəsi Strukturu</span>
                  <span className="text-emerald-600">{data.atsScoreBreakdown?.workExperienceStructure?.score || 12}/15</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${((data.atsScoreBreakdown?.workExperienceStructure?.score || 12) / 15) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Məzmun Tamlığı</span>
                  <span className="text-blue-600">{data.atsScoreBreakdown?.contentCompleteness?.score || 15}/20</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${((data.atsScoreBreakdown?.contentCompleteness?.score || 15) / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Interactive Missing Keywords Graph & Visualizer */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Açar Sözlər və Boşluqlar Qrafiki
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Namizədin CV-sində mövcud olan və ATS robotunun sahəniz ({roleName}) üzrə tələb etdiyi çatışmayan açar sözlərin vizual nisbəti.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                  <span>Mövcud</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium ml-2">
                  <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
                  <span>Çatışmayan</span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart Container */}
            <div className="w-full h-64 sm:h-72 bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-200/60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar
                    dataKey="Mövcud Açar Sözlər"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey="Çatışmayan Açar Sözlər"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Keywords Filter & Search Bar */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveKeywordFilter('missing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeKeywordFilter === 'missing'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Çatışmayan Sözlər ({missingCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveKeywordFilter('matched')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeKeywordFilter === 'matched'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mövcud Sözlər ({matchedCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveKeywordFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeKeywordFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Hamısı ({detailedKeywords.length || matchedCount + missingCount})</span>
                </button>
              </div>

              {/* Keyword Search Input */}
              <div className="relative sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  placeholder="Açar söz axtar..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-xs bg-white text-slate-800"
                />
              </div>
            </div>

            {/* Keyword Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {filteredKeywords.length > 0 ? (
                filteredKeywords.map((kw, idx) => (
                  <div
                    key={`${kw.name}-${idx}`}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                      kw.status === 'missing'
                        ? 'bg-rose-50/40 border-rose-200/70 hover:border-rose-300'
                        : 'bg-emerald-50/40 border-emerald-200/70 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{kw.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              kw.category === 'technical'
                                ? 'bg-blue-100 text-blue-800'
                                : kw.category === 'tool'
                                ? 'bg-purple-100 text-purple-800'
                                : kw.category === 'industry'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {kw.category === 'technical'
                              ? 'Texniki'
                              : kw.category === 'tool'
                              ? 'Alət'
                              : kw.category === 'industry'
                              ? 'Sahəvi'
                              : 'Soft Skill'}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              kw.importance === 'critical'
                                ? 'bg-rose-100 text-rose-800'
                                : kw.importance === 'recommended'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {kw.importance === 'critical'
                              ? 'Kritik Vacib'
                              : kw.importance === 'recommended'
                              ? 'Tövsiyə olunan'
                              : 'Üstünlük'}
                          </span>
                        </div>

                        {kw.placementAdvice && (
                          <div className="text-xs text-slate-600 mt-1.5 flex items-start gap-1.5">
                            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{kw.placementAdvice}</span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {kw.status === 'missing' ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[11px] font-extrabold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Çatışmır
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Mövcuddur
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Concrete Contextual Example Sentence with 1-Click Copy */}
                    {kw.sampleSentence && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex items-start justify-between gap-2 bg-white/70 p-2 rounded-lg">
                        <div className="text-[11px] text-slate-700 italic leading-relaxed">
                          <span className="font-semibold not-italic text-slate-900 block mb-0.5">
                            💡 Tövsiyə olunan cümlə formatı:
                          </span>
                          &ldquo;{kw.sampleSentence}&rdquo;
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopySentence(kw.sampleSentence!, idx)}
                          className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                          title="Cümləni kopyala"
                        >
                          {copiedSentenceIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Kopyalandı</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Kopyala</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                  Axtarışınıza uyğun açar söz tapılmadı.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Concrete Actionable Improvement Plans */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Konkret Təkmilləşdirmə Məsləhətləri (Action Plan)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  CV-nizi ATS robotları və rekruterlər üçün mükəmməl səviyyəyə çatdırmaq üçün addım-ba-addım dəyişiklik planı.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {concreteAdvice.map((adv) => (
                <div
                  key={adv.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                          adv.priority === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : adv.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {adv.priority === 'high' ? 'Yüksək Prioritet' : 'Orta Prioritet'}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">{adv.title}</h4>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 self-start sm:self-auto flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      {adv.impactScore}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-600 space-y-1 leading-relaxed">
                    <p>
                      <strong className="text-slate-800 font-semibold">Cari Çatışmazlıq:</strong>{' '}
                      {adv.currentState}
                    </p>
                    <p>
                      <strong className="text-indigo-700 font-semibold">Düzəliş Qaydası:</strong>{' '}
                      {adv.actionableFix}
                    </p>
                  </div>

                  {/* Before vs After Comparison Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {/* Before / Weak Example */}
                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80">
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs mb-1">
                        <X className="w-3.5 h-3.5" />
                        <span>Əvvəl (Qeyri-dəqiq və Zəif):</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white/70 p-2 rounded-lg border border-rose-100">
                        &ldquo;{adv.beforeExample}&rdquo;
                      </p>
                    </div>

                    {/* After / High Impact Example */}
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs mb-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Sonra (Rəqəmsal və Təsirli):</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-mono bg-white/80 p-2 rounded-lg border border-emerald-100 font-medium">
                        &ldquo;{adv.afterExample}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: ATS Format & Parsing Checklist */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  ATS Format və Texniki Standartlar Qaydaları
                </h3>
                <p className="text-xs text-slate-500">
                  Müasir işəqəbul sistemlərində (Taleo, Workday, Greenhouse, SAP SuccessFactors) 100% təmiz tanınma üçün təlimat.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sadə Tək Sütun</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  İki və ya üç sütunlu qrafik tərtibatlar bəzi köhnə ATS sistemlərində sətirlərin qarışmasına səbəb olur. Tək sütun ən təhlükəsizdir.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Standart Bölmə Başlıqları</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Başlıqlar dəqiq olmalıdır: &quot;İş Təcrübəsi&quot;, &quot;Təhsil&quot;, &quot;Bacarıqlar&quot;. Kreativ bəzəkli başlıqlardan çəkinin.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xronoloji Ardıcıllıq</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Ən son iş yerinizi ən üstdə yazın (Tərs xronoloji sıra). Hər iş üçün aydın tarixlər (Ay/İl - Ay/İl) qeyd edilməlidir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Bu hesabatdakı məsləhətləri birbaşa <strong>CV Yaradıcı</strong> bölməsində tətbiq edə bilərsiniz.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyReport}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Kopyalandı' : 'Mətni Kopyala'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Çap Et / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
