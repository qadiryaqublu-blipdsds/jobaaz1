import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export const AICVAnalyzerLoading: React.FC = () => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: language === 'en' ? 'Extracting document text & structure...' : language === 'ru' ? 'Извлечение текста и структуры документа...' : 'Sənəddən mətn və struktur çıxarılır...',
      desc: language === 'en' ? 'Parsing PDF/DOCX or text buffer without loss' : language === 'ru' ? 'Обработка буфера без потери данных' : 'PDF/DOCX və ya mətn buferi itkisiz emal olunur',
      icon: FileText
    },
    {
      title: language === 'en' ? 'Factual verification (Zero-hallucination scan)...' : language === 'ru' ? 'Фактическая верификация (Zero-hallucination)...' : 'Faktiki yoxlama (Zero-hallucination scan)...',
      desc: language === 'en' ? 'Scanning only verified dates, companies, degrees, and skills' : language === 'ru' ? 'Поиск только подтвержденных дат, компаний, степеней и навыков' : 'Yalnız təsdiqlənmiş tarixlər, şirkətlər, ixtisas və bacarıqlar çıxarılır',
      icon: ShieldCheck
    },
    {
      title: language === 'en' ? 'Calculating ATS Compatibility & parsing risks...' : language === 'ru' ? 'Расчет ATS совместимости и рисков парсинга...' : 'ATS uyğunluq balı və oxunma riskləri hesablanır...',
      desc: language === 'en' ? 'Evaluating 10 standard ATS criteria and formatting' : language === 'ru' ? 'Оценка 10 стандартных критериев ATS и формата' : '10 standart ATS meyarı və formatlaşdırma qiymətləndirilir',
      icon: Cpu
    },
    {
      title: language === 'en' ? 'Synthesizing candidate profile & quality audit...' : language === 'ru' ? 'Синтез профиля кандидата и аудит качества...' : 'Namizəd profili və keyfiyyət auditi hazırlanır...',
      desc: language === 'en' ? 'Building matchable attributes and verified summary' : language === 'ru' ? 'Формирование профиля и точного резюме' : 'Vakansiyalara uyğunlaşdırma parametrləri və xülasə tərtib olunur',
      icon: Sparkles
    }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1800);
    const timer2 = setTimeout(() => setCurrentStep(2), 3800);
    const timer3 = setTimeout(() => setCurrentStep(3), 6200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <div className="relative inline-flex items-center justify-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
          <Sparkles className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-wider border border-white/20">
          JOBIA AI ATS
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
        {language === 'en' ? 'Analyzing CV with Jobia AI' : language === 'ru' ? 'Анализ резюме с помощью Jobia AI' : 'CV Jobia AI ilə analiz olunur'}
      </h3>
      <p className="text-sm text-slate-600 mb-10 max-w-md mx-auto">
        {language === 'en'
          ? 'Strict factual extraction in progress: no assumptions, no hallucinated dates or skills.'
          : language === 'ru'
          ? 'Строго фактическое извлечение: никаких домыслов, вымышленных дат или навыков.'
          : 'Dəqiq faktiki çıxarış icra olunur: heç bir fərziyyə, uydurma tarix və ya bacarıq əlavə edilmir.'}
      </p>

      {/* Steps List */}
      <div className="space-y-3.5 text-left max-w-md mx-auto">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const StepIcon = step.icon;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all duration-500 flex items-start gap-3.5 ${
                isCurrent
                  ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                  : isDone
                  ? 'bg-emerald-50/50 border-emerald-200 opacity-90'
                  : 'bg-slate-50 border-slate-200/80 opacity-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 text-white animate-bounce'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-blue-900' : isDone ? 'text-emerald-900' : 'text-slate-600'}`}>
                  {step.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-xs text-slate-600 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Factual Extraction First → Analysis Second → Generation Last</span>
      </div>
    </div>
  );
};
