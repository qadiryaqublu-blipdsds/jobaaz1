import React, { useState } from 'react';
import { X, Copy, Check, Printer, FileDown, Download } from 'lucide-react';
import { CVAnalysisResult } from '../../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CVAnalysisResult;
  language?: 'az' | 'en' | 'tr' | 'ru';
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const executiveSummaryStr =
    typeof result.executiveSummary === 'object' && result.executiveSummary !== null
      ? (result.executiveSummary as any).verdict || ''
      : result.executiveSummary || result.candidateSummary || result.summaryFeedback || '';

  const generateMarkdownReport = () => {
    return `# CV Təhlili və Karyera Qiymətləndirmə Hesabatı
**Namizəd:** ${result.candidateName || 'Namizəd'}
**Vəzifə:** ${result.detectedRole || 'Müəyyən edilməyib'} (${result.seniorityLevel || 'Orta'})
**Tarix:** ${new Date().toLocaleDateString('az-AZ')}
**Ümumi ATS Balı:** ${result.overallScore ?? result.score ?? 0}/100 (${result.scoreLabel || 'Hesabat'})

---

## 1. Ümumi Xülasə
${executiveSummaryStr}

## 2. Təcrübə Sahəsi və Karyera Uyğunluğu
- **Əsas İxtisas Sahəsi:** ${result.careerFit?.primaryDomain || result.detectedRole || 'Müəyyən edilməyib'}
- **Təxmini Ümumi Təcrübə Müddəti:** ${result.careerFit?.totalExperienceEstimate || 'Müəyyən edilməyib'}
${result.careerFit?.growthTrajectory ? `- **Karyera İnkişaf Xətti:** ${result.careerFit.growthTrajectory}` : ''}

### Uyğun Gələn Vəzifələr və Sahələr:
${result.careerFit?.suitableRoles?.map((r) => `- **${r.role}** (${r.matchPercentage}% uyğun): ${r.reason}`).join('\n') || 'Məlumat yoxdur'}

### Tövsiyə Olunan Sektorlar:
${result.careerFit?.recommendedIndustries?.join(', ') || 'Ümumi'}

## 3. İş Tarixçəsi (Harada və Hansı İşlərdə İşləyib)
${result.experienceHistory?.length ? result.experienceHistory.map((exp, i) => `### ${i + 1}. ${exp.role} @ ${exp.company}
- **Dövr:** ${exp.period}
- **Sahə:** ${exp.domain || 'Ümumi'}
- **Əsas Öhdəliklər:**
${exp.responsibilities?.map((r) => `  * ${r}`).join('\n') || '  * Qeyd edilməyib'}`).join('\n\n') : 'İş təcrübəsi qeyd olunmayıb.'}

## 4. Təhsil Məlumatları (Təhsili Hardadır, Dərəcə, İxtisas)
${result.educationHistory?.length ? result.educationHistory.map((edu, i) => `### ${i + 1}. ${edu.institution}
- **Dərəcə:** ${edu.degree}
- **İxtisas:** ${edu.fieldOfStudy}
- **Dövr:** ${edu.period}
${edu.details ? `- **Əlavə Məlumat:** ${edu.details}` : ''}`).join('\n\n') : 'Təhsil məlumatı qeyd olunmayıb.'}

## 5. Qiymətləndirmə Metrikaları
${(result.metrics || []).map((m) => `- **${m.name}:** ${m.score}/100 — ${m.feedback}`).join('\n')}

## 6. Əsas Üstünlüklər
${(result.strengths || []).map((s) => `- ${s}`).join('\n')}

## 7. Boşluqlar və Çatışmazlıqlar
${(result.weaknesses || []).map((w) => `- ${w}`).join('\n')}

## 8. Təkmilləşdirilmiş Cümlələr (STAR Metodu)
${(result.bulletImprovements || [])
  .map(
    (b, i) => `### Nümunə ${i + 1}:
- **Əvvəl:** "${b.originalOrWeakness}"
- **Sonra:** "${b.improved}"
- *Niyə:* ${b.explanation}`
  )
  .join('\n\n')}

## 9. Tövsiyə Olunan Profil Xülasəsi
"${result.suggestedProfileSummary || ''}"

## 10. Gözlənilən Müsahibə Sualları
${(result.interviewQuestions || [])
  .map(
    (q, i) => `### Sual ${i + 1} (${q.category}):
- **Sual:** ${q.question}
- **Məqsəd:** ${q.whyAsked}
- **Tövsiyə:** ${q.sampleAnswerTips}`
  )
  .join('\n\n')}
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>CV Analiz Hesabatı - ${result.candidateName || 'Namizəd'}</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; line-height: 1.6; color: #1e293b; }
          h1 { color: #1e3a8a; border-bottom: 2pt solid #2563eb; padding-bottom: 4pt; }
          h2 { color: #1e40af; margin-top: 16pt; border-bottom: 1pt solid #cbd5e1; padding-bottom: 2pt; }
          h3 { color: #0f172a; margin-top: 10pt; }
          ul { padding-left: 20px; }
          li { margin-bottom: 4px; }
          .score { background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>CV Analizi və Karyera Qiymətləndirmə Hesabatı</h1>
        <p><strong>Namizəd:</strong> ${result.candidateName || 'Namizəd'} | <strong>Vəzifə:</strong> ${result.detectedRole || 'Mütəxəssis'} | <strong>ATS Balı:</strong> <span class="score">${result.overallScore ?? result.score ?? 0}/100 (${result.scoreLabel || 'Hesabat'})</span></p>
        
        <h2>1. Ümumi Xülasə</h2>
        <p>${executiveSummaryStr}</p>

        <h2>2. Təcrübə Sahəsi və Karyera Uyğunluğu</h2>
        <p><strong>Əsas İxtisas Sahəsi:</strong> ${result.careerFit?.primaryDomain || result.detectedRole || 'Müəyyən edilməyib'}</p>
        <p><strong>Təxmini Təcrübə:</strong> ${result.careerFit?.totalExperienceEstimate || 'Müəyyən edilməyib'}</p>
        <p><strong>Karyera İnkişaf Xətti:</strong> ${result.careerFit?.growthTrajectory || 'Müsbət'}</p>

        <h3>Uyğun Gələn Vəzifələr:</h3>
        <ul>
          ${result.careerFit?.suitableRoles?.map((r) => `<li><strong>${r.role}</strong> (${r.matchPercentage}%): ${r.reason}</li>`).join('') || '<li>Məlumat yoxdur</li>'}
        </ul>

        <h2>3. İş Tarixçəsi</h2>
        ${result.experienceHistory?.map((e) => `
          <h3>${e.role} @ ${e.company} (${e.period})</h3>
          <ul>
            ${e.responsibilities?.map((r) => `<li>${r}</li>`).join('') || ''}
          </ul>
        `).join('') || '<p>Qeyd edilməyib</p>'}

        <h2>4. Təhsil Məlumatları</h2>
        ${result.educationHistory?.map((edu) => `
          <p><strong>${edu.degree}</strong>, ${edu.fieldOfStudy} — <em>${edu.institution}</em> (${edu.period})</p>
        `).join('') || '<p>Qeyd edilməyib</p>'}

        <h2>5. Qiymətləndirmə Metrikaları</h2>
        <ul>
          ${(result.metrics || []).map((m) => `<li><strong>${m.name}:</strong> ${m.score}/100 — ${m.feedback}</li>`).join('')}
        </ul>

        <h2>6. Əsas Üstünlüklər</h2>
        <ul>
          ${(result.strengths || []).map((s) => `<li>${s}</li>`).join('')}
        </ul>

        <h2>7. Boşluqlar və Çatışmazlıqlar</h2>
        <ul>
          ${(result.weaknesses || []).map((w) => `<li>${w}</li>`).join('')}
        </ul>

        <h2>8. Tövsiyə Olunan Profil Xülasəsi</h2>
        <p><em>"${result.suggestedProfileSummary || ''}"</em></p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_Analiz_Hesabati_${(result.candidateName || 'Namizəd').replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const textContent = generateMarkdownReport();
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_Analiz_Hesabati_${(result.candidateName || 'Namizəd').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                Hesabat
              </span>
              <h3 className="text-base font-bold text-slate-800">
                Təhlil Hesabatının İxracı
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content preview */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Çap / PDF Yadda Saxla</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDoc}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-600" />
              <span>Word (.doc) İndir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Mətn (.txt) İndir</span>
            </button>

            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Kopyala</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap max-h-96 overflow-y-auto select-all leading-relaxed">
            {generateMarkdownReport()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;
