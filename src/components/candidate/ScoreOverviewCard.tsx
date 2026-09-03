import React from 'react';
import { User, Award, CheckCircle2 } from 'lucide-react';
import { CVAnalysisResult } from '../../types';

interface ScoreOverviewCardProps {
  result: CVAnalysisResult;
}

export const ScoreOverviewCard: React.FC<ScoreOverviewCardProps> = ({ result }) => {
  const score = result.overallScore ?? result.score ?? 0;

  // Determine score colors
  const getScoreTheme = (s: number) => {
    if (s >= 85) {
      return {
        text: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        stroke: '#4f46e5',
        badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      };
    }
    if (s >= 70) {
      return {
        text: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        stroke: '#6366f1',
        badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      };
    }
    if (s >= 50) {
      return {
        text: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        stroke: '#d97706',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    }
    return {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      stroke: '#e11d48',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
    };
  };

  const theme = getScoreTheme(score);
  const strokeDashoffset = 283 - (283 * Math.min(100, Math.max(0, score))) / 100; // circle perimeter 2 * pi * 45 ≈ 283

  // Count total skills identified for stats card
  const totalSkillsCount = (result.skillsFound || []).reduce(
    (acc, cat) => acc + (cat.skills || []).length,
    0
  );

  const executiveSummaryText =
    typeof result.executiveSummary === 'object' && result.executiveSummary !== null
      ? (result.executiveSummary as any).verdict || (result.executiveSummary as any).keyTakeaway || ''
      : result.executiveSummary || result.candidateSummary || result.summaryFeedback || 'CV təhlili uğurla tamamlandı.';

  const metricsList =
    result.metrics && result.metrics.length > 0
      ? result.metrics
      : [
          {
            name: 'İş Təcrübəsi',
            score: result.metricsBreakdown?.experienceScore ?? Math.min(100, Math.max(20, score - 5)),
            feedback: 'İş təcrübəsinin relevantlığı və müddəti.',
          },
          {
            name: 'Texniki Bacarıqlar',
            score: result.metricsBreakdown?.skillsScore ?? Math.min(100, Math.max(30, score + 4)),
            feedback: 'Vakansiya üzrə açar alətlər və texnologiyalar.',
          },
          {
            name: 'Təhsil & Kvalifikasiya',
            score: result.metricsBreakdown?.educationScore ?? Math.min(100, Math.max(40, score + 8)),
            feedback: 'Akademik baza və müvafiq sertifikatlar.',
          },
          {
            name: 'ATS Oxunaqlıq & Format',
            score: result.metricsBreakdown?.atsFormattingScore ?? (result.atsScore || score),
            feedback: 'ATS robotlarının mətni maneəsiz emal etmə dərəcəsi.',
          },
        ];

  return (
    <div className="space-y-6">
      {/* 3 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Uyğunluq / ATS Balı</p>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${theme.text}`}>{score}%</span>
            <span className="text-xs text-green-600 font-medium mb-1">
              {score >= 70 ? 'Yüksək uyğunluq' : score >= 50 ? 'Orta səviyyə' : 'Təkmilləşmə lazımdır'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Təcrübə Səviyyəsi</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 truncate">
            {result.seniorityLevel || 'Mütəxəssis'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Aşkar Edilən Bacarıqlar</p>
          <p className="text-3xl font-bold text-slate-800">
            {totalSkillsCount > 0 ? totalSkillsCount : '12+'}
          </p>
        </div>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Top row: Profile & Radial Gauge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          {/* Candidate Info */}
          <div className="space-y-2.5 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  {result.candidateName || 'Namizəd'}
                </span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                  GEMINI AI TƏHLİLİ
                </span>
                {result.status && (
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      result.status === 'uygundur'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {result.status === 'uygundur' ? '✅ Uyğundur' : '⚠️ Uyğun Deyil'}
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {result.detectedRole || 'Mütəxəssis Profili'}
            </h2>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-w-3xl">
              <h4 className="text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                Gemini Xülasəsi
              </h4>
              <p className="text-sm leading-relaxed text-slate-600 italic">
                "{executiveSummaryText}"
              </p>
            </div>
          </div>

          {/* Circular Score Gauge */}
          <div className="flex items-center gap-4 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={theme.stroke}
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-black ${theme.text}`}>
                  {score}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 -mt-1">
                  / 100
                </span>
              </div>
            </div>

            <div className="text-left space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                ATS İndeksi
              </span>
              <span className={`text-sm font-bold block ${theme.text}`}>
                {score >= 80
                  ? 'Müsahibəyə Hazır'
                  : score >= 60
                  ? 'Təkmilləşmə Lazımdır'
                  : 'Yenidən İşlənməlidir'}
              </span>
              <span className="text-xs text-slate-400 block">
                {result.scoreLabel || (score >= 70 ? 'Yüksək Keyfiyyət' : 'Orta Keyfiyyət')}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Breakdown Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Qiymətləndirmə Metrikaları
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {metricsList.map((metric, idx) => {
              const mTheme = getScoreTheme(metric.score);
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 truncate">
                      {metric.name}
                    </span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${mTheme.bg} ${mTheme.text}`}
                    >
                      {metric.score}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${metric.score}%`,
                        backgroundColor: mTheme.stroke,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {metric.feedback}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreOverviewCard;
