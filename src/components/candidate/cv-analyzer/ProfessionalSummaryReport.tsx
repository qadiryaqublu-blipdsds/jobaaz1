import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  Filter,
  Compass,
  Zap,
  Target,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CVAnalyzerResult } from '../../../types/cvAnalyzer';
import { useLanguage } from '../../../context/LanguageContext';

interface ProfessionalSummaryReportProps {
  data: CVAnalyzerResult;
}

type SummaryStyleKey = 'executive' | 'metrics' | 'technical' | 'elevator';

export const ProfessionalSummaryReport: React.FC<ProfessionalSummaryReportProps> = ({ data }) => {
  const { language } = useLanguage();
  const [activeStyle, setActiveStyle] = useState<SummaryStyleKey>('metrics');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'matched' | 'missing'>('all');
  const [keywordSearch, setKeywordSearch] = useState('');
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);

  // Extract candidate context
  const fullName = data.personalInfo?.fullName || 'Namizəd';
  const profession =
    data.candidateProfile?.primaryProfession ||
    (data.workExperience && data.workExperience.length > 0 ? data.workExperience[0].position : 'Mütəxəssis');
  const totalExp =
    data.careerTimeline?.totalIdentifiableExperience ||
    data.candidateProfile?.totalExperience ||
    `${data.workExperience?.length || 1} il`;
  const level = data.candidateProfile?.careerLevel || 'Mid-Level';
  
  // Extract existing summary
  const existingSummary =
    data.professionalSummary?.originalSummary ||
    data.professionalSummary?.aiGeneratedSummary ||
    '';
  const hasExistingSummary = Boolean(existingSummary && existingSummary.trim().length > 10);

  // Compute word and character statistics
  const wordCount = useMemo(() => {
    if (!existingSummary) return 0;
    return existingSummary.trim().split(/\s+/).filter(Boolean).length;
  }, [existingSummary]);

  const wordCountStatus = useMemo(() => {
    if (wordCount === 0) return { label: 'Yoxdur', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (wordCount < 30) return { label: 'Çox qısa (<30 söz)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (wordCount > 100) return { label: 'Həddən artıq uzun (>100 söz)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'Optimal həcm (40-80 söz)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }, [wordCount]);

  // Aggregate detected vs missing keywords
  const matchedKeywords = useMemo(() => {
    const list = [...(data.keywordAnalysis?.matchedKeywords || [])];
    if (data.skills?.technicalSkills) {
      data.skills.technicalSkills.forEach(s => {
        if (!list.includes(s)) list.push(s);
      });
    }
    return list;
  }, [data.keywordAnalysis, data.skills]);

  const missingKeywords = useMemo(() => {
    return data.keywordAnalysis?.missingKeywords || [];
  }, [data.keywordAnalysis]);

  // Top hard skills and tools for draft synthesis
  const topSkills = useMemo(() => {
    const combined = [
      ...(data.skills?.technicalSkills || []),
      ...(data.skills?.softwareTools || []),
      ...(data.candidateProfile?.keySkills || [])
    ];
    return Array.from(new Set(combined.filter(Boolean))).slice(0, 6);
  }, [data.skills, data.candidateProfile]);

  // Most prominent achievements or responsibilities
  const prominentImpact = useMemo(() => {
    const ach = data.achievementAnalysis?.quantifiedAchievements?.[0];
    if (ach) return ach;
    const firstExp = data.workExperience?.[0];
    if (firstExp?.achievements?.[0]) return firstExp.achievements[0];
    if (firstExp?.responsibilities?.[0]) return firstExp.responsibilities[0];
    return null;
  }, [data.achievementAnalysis, data.workExperience]);

  // Generate 4 distinct tailored summary drafts based on actual CV facts
  const tailoredDrafts = useMemo(() => {
    const skillsList = topSkills.length > 0 ? topSkills.slice(0, 4).join(', ') : 'müasir texnologiyalar və idarəetmə metodologiyaları';
    const topKeywords = matchedKeywords.slice(0, 3).join(', ') || 'layihə idarəetməsi və analitika';
    const recentCompany = data.workExperience?.[0]?.company ? `(${data.workExperience[0].company} daxil olmaqla)` : '';

    if (language === 'en') {
      return {
        executive: {
          title: 'Executive & Strategic Leadership',
          subtitle: 'Best for Senior, Lead and Department Manager roles',
          text: `Accomplished and results-driven ${profession} with ${totalExp} of comprehensive experience leading high-impact initiatives ${recentCompany}. Proven expertise in ${skillsList}, team leadership, and strategic planning. Spearheaded operational enhancements that directly streamlined workflows, increased team velocity, and aligned department execution with overarching company targets. Recognized for exceptional stakeholder communication and cross-functional leadership in fast-paced corporate environments.`,
          keyHighlights: [profession, totalExp, ...topSkills.slice(0, 3)]
        },
        metrics: {
          title: 'Results & Metrics-Driven',
          subtitle: 'Optimized with Google XYZ formula for highest ATS impact',
          text: `High-performing ${profession} offering ${totalExp} of progressive career achievements in developing, optimizing, and scaling key processes. Demonstrated success utilizing ${skillsList} to achieve measurable efficiency gains ${prominentImpact ? `such as "${prominentImpact}"` : 'and reduce project delivery turnaround'}. Consistently leverages data-driven insights and rigorous quality standards to deliver robust, scalable solutions on schedule and within budget.`,
          keyHighlights: [profession, totalExp, ...topSkills.slice(0, 3), 'data-driven insights']
        },
        technical: {
          title: 'Technical Specialist & Keyword-Dense',
          subtitle: 'Saturated with verified ATS domain keywords for maximum search ranking',
          text: `Detail-oriented ${profession} specializing in core industry standards, technical implementations, and hands-on tool execution. Proficient in ${skillsList}, with in-depth knowledge of ${topKeywords}. Adept at architectural problem-solving, code/workflow optimization, system integration, and rigorous testing methodologies. Highly adaptable with a strong track record of rapidly adopting modern engineering paradigms.`,
          keyHighlights: [profession, ...topSkills, ...matchedKeywords.slice(0, 3)]
        },
        elevator: {
          title: 'Concise Elevator Pitch',
          subtitle: '3-sentence punchy summary perfect for LinkedIn About or short CV formats',
          text: `Versatile ${profession} with ${totalExp} of proven track record delivering strategic impact across modern business domains. Core strengths encompass ${skillsList} alongside rapid execution and collaborative problem-solving. Passionate about driving organizational efficiency and delivering high-standard solutions that generate quantifiable business growth.`,
          keyHighlights: [profession, totalExp, ...topSkills.slice(0, 2)]
        }
      };
    }

    if (language === 'ru') {
      return {
        executive: {
          title: 'Исполнительный и Руководящий стиль',
          subtitle: 'Идеально для Senior, Team Lead и руководящих должностей',
          text: `Опытный и ориентированный на результат ${profession} с ${totalExp} успешного практического опыта руководства проектами ${recentCompany}. Глубокая экспертиза в направлениях: ${skillsList}, а также в стратегическом планировании и управлении кросс-функциональными командами. Успешно внедрил ключевые оптимизации процессов, способствовавшие росту продуктивности и достижению бизнес-целей компании.`,
          keyHighlights: [profession, totalExp, ...topSkills.slice(0, 3)]
        },
        metrics: {
          title: 'Результативно-Метрический (Google XYZ)',
          subtitle: 'Фокус на оцифрованных результатах и высокой оценке ATS',
          text: `Квалифицированный ${profession} с подтвержденным ${totalExp} опытом эффективной реализации и оптимизации ключевых рабочих процессов. Продемонстрировал измеримые успехи с применением ${skillsList} ${prominentImpact ? `(включая "${prominentImpact}")` : 'и существенное сокращение сроков поставки задач'}. Системно применяет доказательный подход и контроль качества для стабильного масштабирования решений.`,
          keyHighlights: [profession, totalExp, ...topSkills.slice(0, 3)]
        },
        technical: {
          title: 'Технический специалист (ATS Keyword Rich)',
          subtitle: 'Максимальная плотность ключевых отраслевых терминов для рекрутеров',
          text: `Высококвалифицированный ${profession}, специализирующийся на передовых отраслевых стандартах и архитектурных решениях. Владеет инструментарием: ${skillsList}, а также компетенциями в области: ${topKeywords}. Эксперт в проектировании, системной интеграции и тестировании. Быстро адаптируется к новым технологическим стекам и методологиям.`,
          keyHighlights: [profession, ...topSkills, ...matchedKeywords.slice(0, 3)]
        },
        elevator: {
          title: 'Краткий Elevator Pitch',
          subtitle: '3 емких предложения для профиля LinkedIn или компактного резюме',
          text: `Универсальный ${profession} с ${totalExp} доказанного опыта достижения высоких результатов в динамичной корпоративной среде. Ключевые компетенции: ${skillsList}, стратегическое мышление и оперативное решение нестандартных задач. Нацелен на долгосрочный вклад в технологическое и коммерческое развитие компании.`,
          keyHighlights: [profession, totalExp, ...topSkills.slice(0, 2)]
        }
      };
    }

    // Azerbaijani default
    return {
      executive: {
        title: 'İcraçı & Strateji Liderlik',
        subtitle: 'Senior, Team Lead və Şöbə Rəhbəri vəzifələri üçün ideal format',
        text: `${totalExp} zəngin peşəkar təcrübəyə malik, nəticəyönümlü ${profession} ${recentCompany}. Əsas səriştələr: ${skillsList}, komandanın idarə edilməsi, layihə planlaması və strateji hədəflərin icrası. Şirkət hədəflərinə vaxtında və keyfiyyətlə çatmaq üçün proseslərin avtomatlaşdırılmasını və şöbələrarası effektiv koordinasiyanı uğurla təmin etmişdir.`,
        keyHighlights: [profession, totalExp, ...topSkills.slice(0, 3)]
      },
      metrics: {
        title: 'Nəticəyönümlü & Metrikalı (Google XYZ)',
        subtitle: 'Ölçülə bilən nailiyyətlər və ən yüksək ATS reytinqi üçün',
        text: `${totalExp} praktiki staja malik ${profession}. ${skillsList} alətlərindən istifadə edərək əməliyyat səmərəliliyinin artırılması ${prominentImpact ? `(o cümlədən: "${prominentImpact}")` : 'və layihələrin çatdırılma müddətinin tezləşdirilməsi'} üzrə davamlı uğurlar əldə etmişdir. Qərarların qəbulunda analitik yanaşmanı, keyfiyyət standartlarını və komanda dinamikasını yüksək səviyyədə saxlayır.`,
        keyHighlights: [profession, totalExp, ...topSkills.slice(0, 3)]
      },
      technical: {
        title: 'Texniki Mütəxəssis (Açar Sözlərlə Zəngin)',
        subtitle: 'HR skanerləri və sahəvi axtarış sistemləri üçün maksimum sıxlıq',
        text: `Müasir standartlar və alətlər üzrə ixtisaslaşmış ${profession}. Dərin bilik və bacarıq sahələri: ${skillsList}, həmçinin ${topKeywords}. Texniki problemlərin operativ həlli, sistem arxitekturası, proseslərin optimallaşdırılması və testləşdirilməsi üzrə praktiki bacarıqlara malikdir. Yeni texnologiyaları sürətlə mənimsəyir və komandada tətbiq edir.`,
        keyHighlights: [profession, ...topSkills, ...matchedKeywords.slice(0, 3)]
      },
      elevator: {
        title: 'Qısa Elevator Pitch (LinkedIn & Xülasə)',
        subtitle: '3 cümləlik dinamik təqdimat — LinkedIn "About" və ya kompakt CV üçün',
        text: `${totalExp} uğurlu iş təcrübəsinə malik dinamik ${profession}. Əsas güclü tərəfləri: ${skillsList}, operativ icraçılıq və analitik düşüncə. Şirkətin biznes hədəflərinə birbaşa dəyər qatan, keyfiyyətli və ölçülə bilən nəticələr təqdim etməyə fokuslanmışdır.`,
        keyHighlights: [profession, totalExp, ...topSkills.slice(0, 2)]
      }
    };
  }, [language, profession, totalExp, topSkills, matchedKeywords, prominentImpact, data.workExperience]);

  // Handle clipboard copy
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2200);
  };

  // Handle text file export
  const handleDownloadDraft = (title: string, text: string) => {
    const blob = new Blob([`${title.toUpperCase()}\n\n${text}\n\nGenerated via Jobia.az Deep CV Analyzer`], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Jobia_Professional_Summary_${profession.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ATS Section Structure Checklist Data
  const structuralSections = useMemo(() => {
    return [
      {
        order: 1,
        title: language === 'en' ? 'Contact Information' : language === 'ru' ? 'Контактные данные' : 'Əlaqə Məlumatları',
        detected: Boolean(data.personalInfo?.email && data.personalInfo?.phone),
        standardRole: language === 'en' ? 'Must be at the very top. Include Name, Phone, Email, City, LinkedIn.' : 'Sənədin ən başında olmalıdır. Ad, Telefon, Email, Şəhər, LinkedIn.',
        score: data.atsAnalysis?.criteriaBreakdown?.contactInfo?.score ?? 95,
        tip: language === 'en' ? 'Avoid putting contact info inside headers/footers in Word as ATS readers skip them.' : 'Word sənədinin "Header/Footer" hissəsində yazmayın; bəzi ATS skanerləri həmin zonanı oxumur.'
      },
      {
        order: 2,
        title: language === 'en' ? 'Professional Summary' : language === 'ru' ? 'Профессиональное резюме' : 'Peşəkar Xülasə (Summary)',
        detected: hasExistingSummary,
        standardRole: language === 'en' ? 'Directly follows contact info. 3-5 sentences summarizing role, years & value.' : 'Əlaqə məlumatlarından dərhal sonra. 3-5 cümlə: ixtisas, staj və dəyər təklifi.',
        score: data.atsAnalysis?.criteriaBreakdown?.professionalSummary?.score ?? (hasExistingSummary ? 85 : 30),
        tip: hasExistingSummary
          ? (language === 'en' ? 'Ensure first sentence defines your exact job title.' : 'İlk cümlədə hədəflədiyiniz dəqiq vakansiya adını qeyd edin.')
          : (language === 'en' ? 'CRITICAL: Add a professional summary to hook the recruiter within 6 seconds.' : 'MÜHÜM: CV-yə mütləq peşəkar xülasə əlavə edin; rekruterlər ilk 6 saniyədə bura baxır.')
      },
      {
        order: 3,
        title: language === 'en' ? 'Work Experience' : language === 'ru' ? 'Опыт работы' : 'İş Təcrübəsi (Ters-Xronoloji)',
        detected: (data.workExperience?.length || 0) > 0,
        standardRole: language === 'en' ? 'Reverse chronological order. Company, Title, Dates, Bullets.' : 'Ən son işdən başlayaraq geriyə doğru. Şirkət, Vəzifə, Tarixlər, Maddələr.',
        score: data.atsAnalysis?.criteriaBreakdown?.workExperience?.score ?? 90,
        tip: language === 'en' ? 'Use action verbs + Google XYZ formula (Accomplished [X] as measured by [Y] by doing [Z]).' : 'Google XYZ qaydası ilə yazın: [X] nəticəsini [Y] göstəricisi ilə [Z] edərək əldə etdim.'
      },
      {
        order: 4,
        title: language === 'en' ? 'Key Skills & Technologies' : language === 'ru' ? 'Ключевые навыки' : 'Bacarıqlar & Texnologiyalar',
        detected: (topSkills.length > 0) || (matchedKeywords.length > 0),
        standardRole: language === 'en' ? 'Categorized hard and soft skills for ATS keyword parsing.' : 'Texniki və sahəvi bacarıqlar aydın şəkildə qruplaşdırılmalıdır.',
        score: data.atsAnalysis?.criteriaBreakdown?.skills?.score ?? 85,
        tip: language === 'en' ? 'Do not use graphical rating stars/bars (e.g. Python 4/5); write plain text lists.' : 'Bacarıqları qrafik ulduz və ya faizlərlə göstərməyin; ATS yalnız adi mətni oxuyur.'
      },
      {
        order: 5,
        title: language === 'en' ? 'Education' : language === 'ru' ? 'Образование' : 'Təhsil (Ali / Orta İxtisas)',
        detected: (data.education?.length || 0) > 0,
        standardRole: language === 'en' ? 'Degree, Field of Study, Institution, Graduation Year.' : 'Dərəcə, İxtisas, Universitet və Məzuniyyət ili.',
        score: data.atsAnalysis?.criteriaBreakdown?.education?.score ?? 90,
        tip: language === 'en' ? 'Place below experience if you have 2+ years of professional history.' : 'Əgər 2 ildən çox iş stajınız varsa, təhsili iş təcrübəsindən sonra yerləşdirin.'
      },
      {
        order: 6,
        title: language === 'en' ? 'Certifications & Languages' : language === 'ru' ? 'Сертификаты и языки' : 'Sertifikatlar & Dillər',
        detected: (data.certifications?.length || 0) > 0 || (data.languages?.length || 0) > 0,
        standardRole: language === 'en' ? 'Official credentials, issuing body, validity and language proficiencies.' : 'Rəsmi beynəlxalq sertifikatlar və dillər üzrə səviyyələr (B2, C1, Fluent).',
        score: 85,
        tip: language === 'en' ? 'List certifications with official credential name and issue date.' : 'Sertifikatın rəsmi adını və verildiyi ili qeyd edin.'
      }
    ];
  }, [language, data, hasExistingSummary, topSkills, matchedKeywords]);

  // Filtered keywords list
  const filteredKeywords = useMemo(() => {
    let combined: Array<{ term: string; status: 'matched' | 'missing'; advice: string }> = [];

    matchedKeywords.forEach(term => {
      combined.push({
        term,
        status: 'matched',
        advice: language === 'en' ? 'Detected in your CV. Highlight in summary to reinforce seniority.' : 'CV-nizdə mövcuddur. Xülasədə qeyd edərək peşəkarlığı gücləndirin.'
      });
    });

    missingKeywords.forEach(term => {
      combined.push({
        term,
        status: 'missing',
        advice: language === 'en' ? 'Missing in CV. Recommended to include if you have practical exposure.' : 'CV-də aşkar edilmədi. Əgər təcrübəniz varsa, mütləq xülasəyə əlavə edin.'
      });
    });

    if (keywordFilter === 'matched') {
      combined = combined.filter(k => k.status === 'matched');
    } else if (keywordFilter === 'missing') {
      combined = combined.filter(k => k.status === 'missing');
    }

    if (keywordSearch.trim()) {
      const q = keywordSearch.toLowerCase();
      combined = combined.filter(k => k.term.toLowerCase().includes(q));
    }

    return combined;
  }, [matchedKeywords, missingKeywords, keywordFilter, keywordSearch, language]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                {language === 'en' ? 'ATS Optimization Module' : language === 'ru' ? 'Модуль оптимизации ATS' : 'ATS Optimizasiya Modulu'}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-slate-300 font-medium">
                {language === 'en' ? 'Professional Summary & Structural Audit' : language === 'ru' ? 'Профессиональное резюме и аудит структуры' : 'Peşəkar Xülasə & Struktur Bələdçisi'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>
                {language === 'en'
                  ? 'CV Structure & Actionable Summary Blueprint'
                  : language === 'ru'
                  ? 'Структура резюме и готовые формулировки'
                  : 'CV Strukturu və Fərdi Peşəkar Xülasə Layihəsi'}
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {language === 'en'
                ? 'Actionable advice on CV section hierarchy, industry keyword density, and 4 copy-ready summary drafts tailored to your profile.'
                : language === 'ru'
                ? 'Рекомендации по иерархии разделов резюме, плотности ключевых слов и 4 готовых варианта резюме под ваш профиль.'
                : 'CV bölmələrinin düzgün ardıcıllığı, sahəvi açar sözlərin analizi və profilinizə uyğun 4 hazır peşəkar xülasə variantı.'}
            </p>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15 shrink-0">
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-300">Xülasə Həcmi</div>
              <div className="text-sm font-black text-white font-mono tabular-nums">
                {wordCount} <span className="text-xs font-normal text-slate-300">söz</span>
              </div>
            </div>
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-300">Açar Sözlər</div>
              <div className="text-sm font-black text-emerald-400 font-mono tabular-nums">
                {matchedKeywords.length} <span className="text-xs font-normal text-slate-300">aşkar</span>
              </div>
            </div>
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-300">Çatışmayan</div>
              <div className="text-sm font-black text-amber-300 font-mono tabular-nums">
                {missingKeywords.length} <span className="text-xs font-normal text-slate-300">tövsiyə</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Section 1: Current Summary Diagnostic */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">
                {language === 'en' ? 'Current Professional Summary in CV' : 'Mövcud CV-dəki Peşəkar Xülasə'}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${wordCountStatus.color}`}>
                {wordCountStatus.label}
              </span>
              {hasExistingSummary && (
                <button
                  type="button"
                  onClick={() => handleCopy('original', existingSummary)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedKey === 'original' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'original' ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              )}
            </div>
          </div>

          {hasExistingSummary ? (
            <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              "{existingSummary}"
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-950">CV-nizdə Peşəkar Xülasə (Summary) aşkar edilmədi!</strong>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  ATS sistemləri və insan rekruterləri ilk növbədə namizədin ümumi profilini oxuyur. Aşağıdakı hazır şablonlardan birini seçərək CV-nizin ən yuxarı hissəsinə əlavə etməniz tövsiyə olunur. Bu addım ATS balınızı 15-20 bal artıra bilər.
                </p>
              </div>
            </div>
          )}

          {/* Diagnostic Advice bullet points */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/90 text-slate-600">
              <strong className="block text-slate-900 font-bold mb-0.5">1. Standart Həcm</strong>
              <span>Tövsiyə olunan uzunluq 3-5 cümlə və ya 50-75 sözdür. Çox uzun xülasələr oxunmur.</span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/90 text-slate-600">
              <strong className="block text-slate-900 font-bold mb-0.5">2. Dəqiq Vəzifə Adı</strong>
              <span>İlk 10 söz daxilində vəzifənizi ({profession}) və ümumi stajınızı ({totalExp}) qeyd edin.</span>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/90 text-slate-600">
              <strong className="block text-slate-900 font-bold mb-0.5">3. Ölçülən Dəyər</strong>
              <span>Təkcə öhdəlikləri deyil, şirkətə gətirdiyiniz ölçülən faydanı (faiz, optimizasiya) daxil edin.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Multi-Style Tailored Rewrite Studio */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Hazır Peşəkar Xülasə Variantları (CV-niz üçün optimallaşdırılmış)</span>
              </h4>
              <p className="text-xs text-slate-500">
                Faktiki təcrübəniz və açar sözləriniz əsasında tərtib edilmiş 4 fərqli üslub. İstədiyinizi bir kliklə kopyalayın.
              </p>
            </div>
          </div>

          {/* Style Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {(['metrics', 'executive', 'technical', 'elevator'] as SummaryStyleKey[]).map(key => {
              const draft = tailoredDrafts[key];
              const isActive = activeStyle === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveStyle(key)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {draft.title}
                </button>
              );
            })}
          </div>

          {/* Active Draft Display Card */}
          {(() => {
            const currentDraft = tailoredDrafts[activeStyle];
            return (
              <div className="p-5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                      {currentDraft.title}
                    </span>
                    <span className="text-xs text-slate-500">{currentDraft.subtitle}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(activeStyle, currentDraft.text)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        copiedKey === activeStyle
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {copiedKey === activeStyle ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === activeStyle ? 'Kopyalandı!' : 'Mətni Kopyala'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadDraft(currentDraft.title, currentDraft.text)}
                      title="Mətni .txt olaraq yüklə"
                      className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Draft Content */}
                <div className="p-4 bg-white rounded-lg border border-slate-200/90 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans shadow-2xs">
                  {currentDraft.text}
                </div>

                {/* Embedded Highlights Strip */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-600">
                  <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Əhatə olunan açar sözlər:</span>
                  {currentDraft.keyHighlights.map((hl, hIdx) => (
                    <span
                      key={hIdx}
                      className="px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-900 border border-blue-200 text-[11px] font-medium"
                    >
                      ✓ {hl}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Section 3: Missing vs Detected Industry Keywords Matrix */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Sahəvi Açar Sözlər & Xülasə Yerləşdirmə Bələdçisi</span>
              </h4>
              <p className="text-xs text-slate-500">
                ATS sistemlərində ən yüksək xal toplayan terminlər və onların xülasədə düzgün istifadə qaydası.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setKeywordFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  keywordFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Hamısı ({matchedKeywords.length + missingKeywords.length})
              </button>
              <button
                type="button"
                onClick={() => setKeywordFilter('matched')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  keywordFilter === 'matched' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Aşkar Edilənlər ({matchedKeywords.length})
              </button>
              <button
                type="button"
                onClick={() => setKeywordFilter('missing')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  keywordFilter === 'missing' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Çatışmayanlar ({missingKeywords.length})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keywordSearch}
              onChange={e => setKeywordSearch(e.target.value)}
              placeholder="Açar sözlərdə axtarış edin..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Keywords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredKeywords.length > 0 ? (
              filteredKeywords.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs transition-all ${
                    item.status === 'matched'
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                      : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-900">{item.term}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        item.status === 'matched'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status === 'matched' ? '✓ CV-də var' : '+ Tövsiyə'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">{item.advice}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                Uyğun açar söz tapılmadı.
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Section-by-Section Structural Hierarchy Checklist */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Qızıl Standart: ATS Bölmələrinin İyerarxiyası və Sıralaması</span>
              </h4>
              <p className="text-xs text-slate-500">
                CV bölmələrinin beynəlxalq ATS alqoritmləri üçün tövsiyə olunan ardıcıllığı və vəziyyəti.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{isChecklistExpanded ? 'Yığcam et' : 'Hamısını aç'}</span>
              {isChecklistExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isChecklistExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {structuralSections.map(sec => (
                <div
                  key={sec.order}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {sec.order}
                      </span>
                      <strong className="text-xs sm:text-sm font-bold text-slate-900">{sec.title}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {sec.detected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mövcuddur</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Çatışmır</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{sec.standardRole}</p>

                  <div className="pt-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-md border border-slate-100">
                    💡 <strong>Məsləhət:</strong> {sec.tip}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Google XYZ Sentence Transformation Examples */}
        <div className="p-4 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-black text-xs">
              XYZ
            </div>
            <div className="space-y-1">
              <strong className="text-xs sm:text-sm font-bold text-slate-900">
                Google XYZ Qaydası ilə Cümlələrin Təkmilləşdirilməsi
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                Məqsəd təkcə vəzifə öhdəliklərini sadalamaq deyil, onların nəticəsini sübut etməkdir:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2 text-xs">
                <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-lg text-rose-900">
                  <span className="font-bold text-rose-800 block mb-0.5">❌ Zəif (Passiv vəzifə):</span>
                  <span>"Müştərilərlə əlaqələrin saxlanılması və hesabatların hazırlanması."</span>
                </div>
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900">
                  <span className="font-bold text-emerald-800 block mb-0.5">✅ Güclü (Google XYZ):</span>
                  <span>"CRM alətini tətbiq edərək 40+ korporativ müştəri bazasında təkrar satışları 6 ayda 24% artırdım."</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
