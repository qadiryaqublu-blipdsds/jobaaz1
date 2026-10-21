import React, { useState, useEffect, useMemo } from 'react';
import {
  PracticeInterviewSessionItem,
  PracticeInterviewSentimentResult,
} from '../../types';
import {
  getStoredPracticeSessions,
  deletePracticeSessionFromStorage,
  getPracticeAnalyticsSummary,
  PracticeAnalyticsSummary,
} from '../../services/practiceInterviewService';
import { useLanguage } from '../../context/LanguageContext';
import {
  Mic,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Copy,
  Check,
  ChevronRight,
  Search,
  Filter,
  BarChart3,
  Trash2,
  ExternalLink,
  Target,
  AlertCircle,
  Zap,
  Building2,
  Briefcase,
  X,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface PracticeInterviewDashboardWidgetProps {
  onNavigateToPractice?: (roleTitle?: string, companyName?: string) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const PracticeInterviewDashboardWidget: React.FC<PracticeInterviewDashboardWidgetProps> = ({
  onNavigateToPractice,
  className = '',
  defaultExpanded = true,
}) => {
  const { language } = useLanguage();
  const [sessions, setSessions] = useState<PracticeInterviewSessionItem[]>([]);
  const [selectedSessionForDetail, setSelectedSessionForDetail] =
    useState<PracticeInterviewSessionItem | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Hamısı');
  const [sortBy, setSortBy] = useState<'date' | 'sentiment' | 'technical'>('date');

  // Audio Playback in widget
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load sessions from storage and listen to cross-tab updates
  const loadSessions = () => {
    const data = getStoredPracticeSessions();
    setSessions(data);
  };

  useEffect(() => {
    loadSessions();

    const handleUpdate = () => {
      loadSessions();
    };

    window.addEventListener('jobia_practice_sessions_updated', handleUpdate);
    return () => {
      window.removeEventListener('jobia_practice_sessions_updated', handleUpdate);
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, []);

  // Summary Metrics
  const summary: PracticeAnalyticsSummary = useMemo(() => {
    return getPracticeAnalyticsSummary(sessions);
  }, [sessions]);

  // Unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['Hamısı', ...Array.from(set)];
  }, [sessions]);

  // Filtered & Sorted Sessions
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((s) => {
        const matchesCat =
          selectedCategory === 'Hamısı' || s.category === selectedCategory;
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          !q ||
          s.question.toLowerCase().includes(q) ||
          s.transcript.toLowerCase().includes(q) ||
          s.roleTitle?.toLowerCase().includes(q) ||
          s.companyName?.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'sentiment') {
          return (
            (b.sentimentResult?.overallSentimentScore || 0) -
            (a.sentimentResult?.overallSentimentScore || 0)
          );
        }
        if (sortBy === 'technical') {
          return (
            (b.sentimentResult?.technicalFeedbackScore || 0) -
            (a.sentimentResult?.technicalFeedbackScore || 0)
          );
        }
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      });
  }, [sessions, selectedCategory, searchQuery, sortBy]);

  // Audio playback handler
  const handleTogglePlayAudio = (session: PracticeInterviewSessionItem) => {
    if (activePlayingId === session.id) {
      if (audioElement) {
        audioElement.pause();
        setActivePlayingId(null);
      }
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    if (session.audioBlobUrl) {
      const audio = new Audio(session.audioBlobUrl);
      audio.onended = () => setActivePlayingId(null);
      audio.onerror = () => {
        // Synthesize simulated speech if blob URL is expired
        synthesizeSpeech(session.transcript, session.id);
      };
      audio.play().catch(() => {
        synthesizeSpeech(session.transcript, session.id);
      });
      setAudioElement(audio);
      setActivePlayingId(session.id);
    } else {
      // Speech synthesis fallback
      synthesizeSpeech(session.transcript, session.id);
    }
  };

  const synthesizeSpeech = (text: string, id: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setActivePlayingId(null);
      utterance.onerror = () => setActivePlayingId(null);
      window.speechSynthesis.speak(utterance);
      setActivePlayingId(id);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bu sınaq müsahibəsi təhlil qeydini silmək istədiyinizə əminsiniz?')) {
      const updated = deletePracticeSessionFromStorage(id);
      setSessions(updated);
      if (selectedSessionForDetail?.id === id) {
        setSelectedSessionForDetail(null);
      }
    }
  };

  const getToneBadgeClass = (tone?: string) => {
    switch (tone) {
      case 'confident':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'positive':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'hesitant':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'nervous':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Main Header & Widget Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        {/* Subtle accent glow in header */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-100/40 via-indigo-50/20 to-transparent pointer-events-none rounded-bl-full" />

        <div className="relative z-1 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Mic className="w-5 h-5 animate-pulse text-purple-100" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>AI Müsahibə Məşqi & Sentiment Raporu</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
                    {sessions.length} Sınaq Qeydi
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Mikrofonla qeydə alınmış cavabların emosional inam, nitq dinamikası və texniki STAR təhlili
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onNavigateToPractice && (
              <button
                type="button"
                onClick={() => onNavigateToPractice()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Mic className="w-3.5 h-3.5 text-amber-300" />
                <span>Yeni Məşq Başlat</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/70" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Top Executive Metrics: Dual Big Scores & Dynamics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          {/* Card 1: Overall Sentiment Score */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Orta Sentiment Balı</span>
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getToneBadgeClass(summary.overallTone)}`}>
                {summary.topPrimarySentiment}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {summary.averageSentimentScore}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
              <span className="text-[11px] font-bold text-emerald-600 ml-auto">
                {summary.averageSentimentScore >= 85 ? 'Yüksək İnam' : summary.averageSentimentScore >= 70 ? 'Müsbət' : 'İnkişaf lazımdır'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, summary.averageSentimentScore))}%` }}
              />
            </div>
          </div>

          {/* Card 2: Technical Feedback Score */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Texniki Rəy & STAR</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                STAR Dəqiqliyi
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
                {summary.averageTechnicalScore}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 100</span>
              <span className="text-[11px] font-bold text-indigo-600 ml-auto">
                {summary.averageTechnicalScore >= 85 ? 'Dərin Ekspertiza' : 'Orta Dərəcə'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, summary.averageTechnicalScore))}%` }}
              />
            </div>
          </div>

          {/* Card 3: Speech Pace & WPM */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Danışıq Sürəti</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                110-165 İdeal
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {summary.averageWpm}
              </span>
              <span className="text-xs text-slate-500 font-bold">söz/dəq</span>
              <span className="text-[11px] font-bold text-slate-600 ml-auto">
                {summary.averageWpm >= 110 && summary.averageWpm <= 165
                  ? 'Optimal Ritm'
                  : summary.averageWpm > 165
                  ? 'Sürətli'
                  : 'Təmkinli / Yavaş'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(10, (summary.averageWpm / 200) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Card 4: Filler Words & Articulation */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-emerald-600" />
                <span>Parazit Söz Sayı</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700">
                Nitq Təmizliyi
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {summary.totalFillerWords}
              </span>
              <span className="text-xs text-slate-500 font-bold">ədəd</span>
              <span className="text-[11px] font-bold text-emerald-600 ml-auto">
                {summary.totalFillerWords <= 2 ? 'Səlis Nitq' : 'Nəzarətdədir'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {summary.totalFillerWords === 0
                ? 'Heç bir parazit söz ("ııı", "şey", "yəni") aşkar olunmadı.'
                : 'Parazit sözləri azaltmaq üçün cümlə arası pauzaları qoruyun.'}
            </p>
          </div>
        </div>

        {/* 3. Skill Radar Breakdown Progress Bars */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span>5-Pilləli Emosional İntellekt və Korporativ Hazırlıq Matrisi</span>
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Bütün sınaq sessiyalarının orta çəkisi
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Confidence */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                <span>Özünəinam</span>
                <span className="font-bold text-purple-700">{summary.metricsAvg.confidence}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${summary.metricsAvg.confidence}%` }}
                />
              </div>
            </div>

            {/* Clarity */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                <span>Fikir Aydınlığı</span>
                <span className="font-bold text-indigo-700">{summary.metricsAvg.clarity}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${summary.metricsAvg.clarity}%` }}
                />
              </div>
            </div>

            {/* Positivity */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                <span>Pozitiv Enerji</span>
                <span className="font-bold text-emerald-700">{summary.metricsAvg.positivity}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${summary.metricsAvg.positivity}%` }}
                />
              </div>
            </div>

            {/* Composure */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                <span>Təmkinlilik</span>
                <span className="font-bold text-blue-700">{summary.metricsAvg.composure}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${summary.metricsAvg.composure}%` }}
                />
              </div>
            </div>

            {/* Professionalism */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                <span>Peşəkarlıq</span>
                <span className="font-bold text-slate-900">{summary.metricsAvg.professionalism}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-900 h-full rounded-full"
                  style={{ width: `${summary.metricsAvg.professionalism}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recorded Sessions Explorer */}
      <div className="space-y-4">
        {/* Toolbar & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sual, transkript və ya şirkət üzrə axtar..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-hidden focus:border-purple-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-hidden focus:border-purple-500"
            >
              <option value="date">Ən Son Qeydlər</option>
              <option value="sentiment">Sentiment Balına görə</option>
              <option value="technical">Texniki Rəy Balına görə</option>
            </select>
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {searchQuery || selectedCategory !== 'Hamısı'
                ? 'Filtrə uyğun qeydə alınmış sınaq müsahibəsi tapılmadı.'
                : 'Hələ heç bir sınaq müsahibə cavabı qeydə alınmayıb.'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Mikrofon vasitəsilə suallara cavab verin; sistem nitqinizi mətnə çevirərək dərin emosional və texniki təhlil təqdim edəcək.
            </p>
            {onNavigateToPractice && (
              <button
                type="button"
                onClick={() => onNavigateToPractice()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                İlk Səsli Məşqi Başlat
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const res = session.sentimentResult;
              const isPlaying = activePlayingId === session.id;

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-purple-300 p-5 shadow-2xs transition-all space-y-4"
                >
                  {/* Top Bar: Target Role & Dual Scores */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {session.roleTitle && (
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                            {session.roleTitle}
                          </span>
                        )}
                        {session.companyName && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-600 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {session.companyName}
                            </span>
                          </>
                        )}
                        {session.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {session.category}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Müddət: {session.audioDurationSeconds} san</span>
                        <span>•</span>
                        <span>{new Date(session.completedAt).toLocaleDateString('az-AZ')}</span>
                      </div>
                    </div>

                    {/* Dual Score Pills */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Sentiment Score */}
                      <div className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                        <div>
                          <div className="text-[9px] font-bold text-purple-700 uppercase tracking-wider">
                            Sentiment
                          </div>
                          <div className="text-sm font-black text-purple-900 leading-none">
                            {res?.overallSentimentScore || 80}
                            <span className="text-[10px] text-purple-500 font-semibold">/100</span>
                          </div>
                        </div>
                      </div>

                      {/* Technical Score */}
                      <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <div className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider">
                            Texniki Rəy
                          </div>
                          <div className="text-sm font-black text-indigo-900 leading-none">
                            {res?.technicalFeedbackScore || 85}
                            <span className="text-[10px] text-indigo-500 font-semibold">/100</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question Title */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                      Müsahibə Sualı
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      "{session.question}"
                    </h4>
                  </div>

                  {/* Candidate Transcript with Audio Player Button */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-slate-400" />
                        <span>Səsləndirilmiş Cavabın Transkripti</span>
                      </span>

                      {/* Audio listen button */}
                      <button
                        type="button"
                        onClick={() => handleTogglePlayAudio(session)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isPlaying
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3 h-3 text-white" />
                            <span>Dayandır</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-purple-600" />
                            <span>Səsi Dinlə</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{session.transcript}"
                    </p>
                  </div>

                  {/* Speech Dynamics & Critique Summary */}
                  {res && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Dynamics */}
                      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Nitq Dinamikası</span>
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {res.speechDynamics?.wordsPerMinute} söz/dəq
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {res.speechDynamics?.paceFeedback}
                        </p>
                        {res.speechDynamics?.fillerWordsCount > 0 && (
                          <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                            Parazit söz: {res.speechDynamics.fillerWordsCount} ədəd (
                            {res.speechDynamics.detectedFillerWords.map((f) => f.word).join(', ')})
                          </div>
                        )}
                      </div>

                      {/* Technical Critique */}
                      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                        <div className="font-bold text-indigo-950 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Target className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Texniki & STAR Qiyməti</span>
                          </span>
                          <span className="text-[11px] font-bold text-indigo-700">
                            {res.technicalFeedbackScore || 85} bal
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {res.technicalCritique ||
                            'Cavabda STAR modelinin fəaliyyət və nəticə addımları sistemli şəkildə ifadə olunub.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Polished Executive Answer Box */}
                  {res?.polishedExecutiveAnswer && (
                    <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>AI Tərəfindən İdeal STAR Şablonu</span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(res.polishedExecutiveAnswer, `ans-${session.id}`)
                          }
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `ans-${session.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Kopyalandı!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-purple-600" />
                              <span>Kopyala</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-purple-950 leading-relaxed font-medium">
                        "{res.polishedExecutiveAnswer}"
                      </p>
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedSessionForDetail(session)}
                      className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Tam Təhlilə & Bələdçiyə Bax</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      {onNavigateToPractice && (
                        <button
                          type="button"
                          onClick={() =>
                            onNavigateToPractice(session.roleTitle, session.companyName)
                          }
                          className="px-2.5 py-1 text-slate-700 hover:text-purple-700 font-semibold flex items-center gap-1 cursor-pointer"
                          title="Bu sualı yenidən səsləndirərək məşq edin"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Yenidən Məşq Et</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDelete(session.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-md hover:bg-rose-50"
                        title="Bu qeydi sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Deep Detail Modal */}
      {selectedSessionForDetail && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Sınaq Müsahibəsi Ətraflı Nəticə Raporu
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    {selectedSessionForDetail.roleTitle || 'Vakansiya'} •{' '}
                    {selectedSessionForDetail.companyName || 'Şirkət'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSessionForDetail(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Question */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase">
                  Sual ({selectedSessionForDetail.category || 'Ümumi'})
                </span>
                <p className="text-sm font-bold text-slate-900">
                  "{selectedSessionForDetail.question}"
                </p>
              </div>

              {/* Dual Big Scores in Modal */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                  <span className="text-[10px] font-bold text-purple-800 uppercase">
                    Emosional Sentiment Balı
                  </span>
                  <div className="text-2xl font-black text-purple-950">
                    {selectedSessionForDetail.sentimentResult?.overallSentimentScore || 85} / 100
                  </div>
                  <p className="text-[11px] text-purple-700 font-medium">
                    {selectedSessionForDetail.sentimentResult?.primarySentiment}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase">
                    Texniki & STAR Balı
                  </span>
                  <div className="text-2xl font-black text-indigo-950">
                    {selectedSessionForDetail.sentimentResult?.technicalFeedbackScore || 88} / 100
                  </div>
                  <p className="text-[11px] text-indigo-700 font-medium">
                    {selectedSessionForDetail.sentimentResult?.technicalCritique?.slice(0, 70)}...
                  </p>
                </div>
              </div>

              {/* STAR Breakdown */}
              {selectedSessionForDetail.sentimentResult?.starAnalysis && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span>STAR Metodu Analitik Matrisi</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-bold text-blue-700 block">S - Situasiya (Context):</span>
                      <span className="text-slate-600">
                        {selectedSessionForDetail.sentimentResult.starAnalysis.situation}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-bold text-indigo-700 block">T - Tapşırıq (Task):</span>
                      <span className="text-slate-600">
                        {selectedSessionForDetail.sentimentResult.starAnalysis.task}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-bold text-purple-700 block">A - Fəaliyyət (Action):</span>
                      <span className="text-slate-600">
                        {selectedSessionForDetail.sentimentResult.starAnalysis.action}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-bold text-emerald-700 block">R - Nəticə (Result):</span>
                      <span className="text-slate-600">
                        {selectedSessionForDetail.sentimentResult.starAnalysis.result}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths & Growth Areas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ən Güclü Məqamlar</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-emerald-950">
                    {selectedSessionForDetail.sentimentResult?.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-900 uppercase flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>Təkmilləşdirilməli Nöqtələr</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-amber-950">
                    {selectedSessionForDetail.sentimentResult?.growthAreas.map((grw, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{grw}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Voice & Delivery Coaching Tips */}
              {selectedSessionForDetail.sentimentResult?.voiceAndDeliveryTips && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-800 uppercase flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Nitq Mütəxəssisindən Praktiki Məsləhətlər</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {selectedSessionForDetail.sentimentResult.voiceAndDeliveryTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedSessionForDetail(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Bağla
              </button>

              {onNavigateToPractice && (
                <button
                  type="button"
                  onClick={() => {
                    const role = selectedSessionForDetail.roleTitle;
                    const comp = selectedSessionForDetail.companyName;
                    setSelectedSessionForDetail(null);
                    onNavigateToPractice(role, comp);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sualı Yenidən Məşq Et</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
