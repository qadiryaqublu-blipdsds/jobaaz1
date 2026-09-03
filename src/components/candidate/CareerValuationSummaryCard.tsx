import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Building2,
  CheckCircle,
  FileDown,
  Printer,
  Sparkles,
  ArrowRight,
  Briefcase,
  Copy,
  Check,
} from 'lucide-react';
import { CVAnalysisResult } from '../../types';

interface CareerValuationSummaryCardProps {
  result: CVAnalysisResult;
  language?: 'az' | 'en' | 'tr' | 'ru';
  onOpenCvBuilder?: () => void;
}

export const CareerValuationSummaryCard: React.FC<CareerValuationSummaryCardProps> = ({
  result,
  language = 'az',
  onOpenCvBuilder,
}) => {
  const [copied, setCopied] = useState(false);

  const { careerFit, detectedRole, seniorityLevel, overallScore } = result;

  const executiveSummaryStr =
    typeof result.executiveSummary === 'object' && result.executiveSummary !== null
      ? (result.executiveSummary as any).verdict || ''
      : result.executiveSummary || result.candidateSummary || result.summaryFeedback || '';

  // Derive top industries with dynamic reasons if not provided
  const industries = careerFit?.recommendedIndustries?.length
    ? careerFit.recommendedIndustries
    : ['İnformasiya Texnologiyaları & SaaS', 'Bankçılıq & FinTech', 'E-Ticarət & Retail', 'Telekommunikasiya', 'Konsaltinq'];

  const suitableRoles = careerFit?.suitableRoles?.length
    ? careerFit.suitableRoles
    : [
        {
          role: detectedRole || 'Əsas Mütəxəssis',
          matchPercentage: Math.max(overallScore, 85),
          reason: 'Mövcud təcrübə və bacarıq dəsti ilə birbaşa tam uyğunluq təşkil edir.',
        },
      ];

  const handleCopySummary = () => {
    const summaryText = `
=== Karyera və Bazar Dəyərləndirməsi Hesabatı ===
Namizəd: ${result.candidateName || 'Namizəd'}
İxtisas: ${detectedRole || 'Mütəxəssis'} (${seniorityLevel || 'Middle/Senior'})
Ümumi ATS Balı: ${overallScore}/100

1. Tələbatın Yüksək Olduğu Sahələr:
${industries.map((ind, i) => `${i + 1}. ${ind}`).join('\n')}

2. Ən Uyğun Vəzifələr:
${suitableRoles.map((r) => `- ${r.role} (${r.matchPercentage}% uyğun): ${r.reason}`).join('\n')}

3. Karyera İnkişaf Potensialı:
${careerFit?.growthTrajectory || 'Karyera yüksəlişi və komanda rəhbərliyi potensialı mövcuddur.'}

4. Rekruter / HR Rəyi:
${executiveSummaryStr}
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Karyera Dəyərləndirməsi Hesabatı</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; line-height: 1.6; color: #222; }
        h1 { color: #1e3a8a; border-bottom: 2px solid #2563eb; padding-bottom: 6px; }
        h2 { color: #1e40af; margin-top: 20px; }
        .badge { background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 4px; font-weight: bold; }
        .card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; margin-bottom: 12px; }
        ul { margin-top: 6px; }
        li { margin-bottom: 4px; }
      </style>
      </head>
      <body>
        <h1>Karyera və Bazar Dəyərləndirməsi Hesabatı</h1>
        <p><strong>Namizəd:</strong> ${result.candidateName || 'Namizəd'} | <strong>Vəzifə:</strong> ${detectedRole || 'Mütəxəssis'} | <strong>ATS Balı:</strong> ${overallScore}/100</p>
        
        <h2>1. Tələbatın Yüksək Olduğu Sahələr</h2>
        <ul>
          ${industries.map((ind) => `<li><strong>${ind}</strong></li>`).join('')}
        </ul>

        <h2>2. Ən Uyğun Vəzifələr</h2>
        <ul>
          ${suitableRoles.map((r) => `<li><strong>${r.role}</strong> (${r.matchPercentage}%): ${r.reason}</li>`).join('')}
        </ul>

        <h2>3. Karyera İnkişaf Potensialı</h2>
        <p>${careerFit?.growthTrajectory || 'Yüksək inkişaf potensialı qeyd olunur.'}</p>

        <h2>4. Rekruter / HR Rəyi</h2>
        <p>${executiveSummaryStr}</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Karyera_Deyerlendirme_${(result.candidateName || 'Namizəd').replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="career-valuation-summary"
      className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm p-6 sm:p-8 space-y-6 overflow-hidden relative"
    >
      {/* Top Banner with actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Karyera & Bazar Dəyərləndirməsi
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {seniorityLevel || 'Middle'} • {careerFit?.totalExperienceEstimate || '3+ il'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            CV Təhlili və Karyera Perspektivi İcmalı
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Bu icmal namizədin əmək bazarındakı cari rəqabət gücünü, ən çox tələbat olan sahələri və dəyərini artırmaq üçün strateji addımları əhatə edir.
          </p>
        </div>

        {/* Action Buttons: Download / Print / Copy */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadDoc}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
            title="Word faylı kimi saxla"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Word (.doc) İndir</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
            title="Çap et"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Çap</span>
          </button>
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600 font-bold">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Kopyala</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Viable Domains & Industries Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm sm:text-base font-bold text-slate-900">
            Tələbatın Ən Yüksək Olduğu Sahələr və Sektorlar
          </h4>
        </div>
        <p className="text-xs text-slate-500">Namizədin təcrübə və bacarıqlarının ən çox ehtiyac duyulduğu sənaye sahələri:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {industries.map((ind, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200 hover:border-indigo-300 transition-all flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                #{i + 1}
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-slate-900">{ind}</h5>
                <span className="inline-block text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Tələbat: Yüksək
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Suitable Roles Breakdown */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm sm:text-base font-bold text-slate-900">
            Ən Uyğun Vəzifələr və Rol Təhlili
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suitableRoles.map((roleItem, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{roleItem.role}</span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {roleItem.matchPercentage}% Uyğun
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{roleItem.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Market Seniority & Growth Trajectory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Bazar Səviyyəsi & Rəqabətlilik
            </h5>
          </div>
          <div className="space-y-1 text-xs text-slate-700">
            <p>
              • <strong>Təcrübə Səviyyəsi:</strong>{' '}
              <span className="text-indigo-700 font-bold">{seniorityLevel || 'Orta / Senior'}</span>
            </p>
            <p>
              • <strong>Ümumi ATS İndeksi:</strong>{' '}
              <span className="text-slate-900 font-bold">{overallScore}/100</span> ({result.scoreLabel})
            </p>
            <p>
              • <strong>Bazar Rəqabətliliyi:</strong> Namizədin təcrübəsi cari vakansiyaların əksəriyyəti üçün güclü zəmin yaradır.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              İnkişaf Trayektoriyası
            </h5>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {careerFit?.growthTrajectory ||
              'Texniki dərəcəsini və rəhbərlik səlahiyyətlərini artırmaqla növbəti 1-2 il ərzində Baş Mütəxəssis (Senior) və ya Komanda Rəhbəri (Tech Lead) mövqelərinə inamla irəliləyə bilər.'}
          </p>
        </div>
      </div>

      {/* 4. Action plan to increase value */}
      <div className="p-4 sm:p-5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2.5">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-indigo-600" />
          <h5 className="text-xs sm:text-sm font-bold text-indigo-950">
            Dəyəri Artırmaq Üçün Fəaliyyət Planı
          </h5>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-indigo-900">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
            <span>CV-dəki öhdəlikləri faiz və rəqəmlərlə (STAR metodu ilə) ölçülə bilən edin.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
            <span>Çatışmayan və tövsiyə olunan əsas açar sözləri və alətləri CV-yə inteqrasiya edin.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
            <span>Beynəlxalq sertifikatlar (Cloud, Agile, ixtisas sertifikatları) əlavə edərək dəyəri artırın.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
            <span>LinkedIn profilini və portfel linklərini yeniləyərək birbaşa əlaqə yaradın.</span>
          </li>
        </ul>
      </div>

      {/* 5. HR / Recruiter Final Verdict */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-400" />
            HR Ekspert Yekun Rəyi
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {result.scoreLabel}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {executiveSummaryStr}
        </p>
      </div>

      {/* Call to Action: Auto CV Builder */}
      {onOpenCvBuilder && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl text-white">
          <div className="space-y-0.5 text-center sm:text-left">
            <h5 className="text-sm font-bold">Bu analizə əsasən avtomatik yeni CV formalaşdırmaq istəyirsiniz?</h5>
            <p className="text-xs text-indigo-100">
              Analizdən əldə olunan bütün düzəlişlər, təcrübə və təhsil məlumatları ilə dərhal peşəkar CV yaradın.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCvBuilder}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 transition-colors shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>CV Qurucuya Keç</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
