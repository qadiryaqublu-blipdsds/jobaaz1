import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  ClipboardPaste,
  Sparkles,
  AlertCircle,
  X,
  CheckCircle2,
  FileCheck,
  Shield,
  Zap
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface AICVAnalyzerInputProps {
  onAnalyze: (payload: {
    cvText?: string;
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
    jobDescription?: string;
  }) => void;
  isLoading: boolean;
}

const SAMPLE_CV_DEV = `Kamran Məmmədov
Email: kamran.mammadov@example.com | Tel: +994 50 123 45 67
Bakı, Azərbaycan | linkedin.com/in/kamran-mammadov

Peşəkar Xülasə:
5 ildən artıq təcrübəyə malik Senior Frontend Developer. Yüksək yüklü SPA platformalarının, reaktiv istifadəçi interfeyslərinin və dizayn sistemlərinin qurulmasında ixtisaslaşmışam.

İş Təcrübəsi:
PASHA Bank OJSC — Senior Frontend Developer
03.2021 — Davam edir (Bakı, Azərbaycan)
• React, TypeScript və Redux Toolkit ilə rəqəmsal bankçılıq tətbiqinin yeni modulunun arxitekturasını qurdum.
• Komanda ilə birlikdə platformanın yüklənmə sürətini 38% artırdıq və Core Web Vitals göstəricilərini optimallaşdırdıq.
• 6 nəfərlik frontend mühəndislər komandasına mentorluq və kod təhlili (code review) etdim.

ATL Tech — Frontend Developer
09.2019 — 02.2021 (Bakı, Azərbaycan)
• Müxtəlif dövlət və korporativ layihələrin veb interfeyslərini React və REST API əsasında hazırladım.
• Dizayn komandası ilə Figma üzərindən reusable UI komponent kitabxanası formalaşdırdım.

Təhsil:
Bakı Dövlət Universiteti
Bakalavr, Kompüter Elmləri
2015 — 2019

Texniki Bacarıqlar:
JavaScript (ES6+), TypeScript, React, Next.js, Redux Toolkit, HTML5, CSS3, Tailwind CSS, REST API, Git, Docker, Jest.

Soft Bacarıqlar:
Komanda ilə iş, Problemlərin analitik həlli, Mentorluq, Çevik metodologiya (Agile/Scrum).

Xarici Dillər:
Azərbaycan dili (Ana dili), İngilis dili (Professional - C1), Rus dili (Danışıq - B2).

Sertifikatlar:
Meta Certified Front-End Developer (2022) — Meta`;

const SAMPLE_CV_FINANCE = `Leyla Əliyeva
Email: leyla.aliyeva.fin@example.com | Tel: +994 55 987 65 43
Bakı, Azərbaycan

Haqqımda:
Maliyyə hesabatlılığı, vergi uçotu və büdcə planlaşdırması üzrə 4 illik təcrübəyə malik aparıcı mühasib.

İş Təcrübəsi:
Veysəloğlu Şirkətlər Qrupu — Baş Mühasib
01.2022 — İndiki vaxt
• 1C 8.3 sistemində gündəlik mühasibat əməliyyatlarının və vergi bəyannamələrinin vaxtında təqdim edilməsinə cavabdehlik.
• Şirkətin aylıq maliyyə hesabatlarının (P&L, Balance Sheet) hazırlanması.
• Vergi yoxlamalarının uğurla keçirilməsi və vergi risklərinin minimuma endirilməsi.

Azərsun Holdinq — Mühasib köməkçisi
06.2020 — 12.2021
• Bank-kassa əməliyyatlarının aparılması və ilkin sənədlərin uçota alınması.
• Debitor və kreditor borcların üzləşdirilməsi.

Təhsil:
Azərbaycan Dövlət İqtisad Universiteti (UNEC)
Bakalavr, Maliyyə və Mühasibat uçotu
2016 — 2020

Bacarıqlar:
1C 8.3 Mühasibat, MS Excel (Advanced, Pivot, VLOOKUP), Vergi Məcəlləsi, Maliyyə hesabatları, Büdcələmə, BTP sistemi.

Dillər:
Azərbaycan dili (Əla), İngilis dili (Orta - B1), Rus dili (Yaxşı - B2).`;

export const AICVAnalyzerInput: React.FC<AICVAnalyzerInputProps> = ({ onAnalyze, isLoading }) => {
  const { language } = useLanguage();
  const [activeMode, setActiveMode] = useState<'upload' | 'text'>('upload');
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJobDesc, setShowJobDesc] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    base64: string;
    mimeType: string;
    name: string;
    sizeFormatted: string;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    const isDocx = file.name.endsWith('.docx') || file.name.endsWith('.doc') || file.name.endsWith('.pdf') || file.name.endsWith('.txt');

    if (!validTypes.includes(file.type) && !isDocx) {
      setErrorMsg(
        language === 'en'
          ? 'Only PDF, DOC, and DOCX files are supported.'
          : language === 'ru'
          ? 'Поддерживаются только файлы PDF, DOC и DOCX.'
          : 'Yalnız PDF, DOC və DOCX faylları dəstəklənir.'
      );
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg(
        language === 'en'
          ? 'File size exceeds 15MB limit.'
          : language === 'ru'
          ? 'Размер файла превышает 15 МБ.'
          : 'Fayl ölçüsü 15 MB limitini keçir.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const sizeKb = Math.round(file.size / 1024);
      const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      setSelectedFile({
        file,
        base64,
        mimeType: file.type || 'application/pdf',
        name: file.name,
        sizeFormatted
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = () => {
    setErrorMsg(null);
    if (activeMode === 'upload') {
      if (!selectedFile) {
        setErrorMsg(
          language === 'en'
            ? 'Please select a PDF or DOCX file to analyze.'
            : language === 'ru'
            ? 'Пожалуйста, выберите файл PDF или DOCX для анализа.'
            : 'Zəhmət olmasa analiz üçün PDF və ya DOCX faylı seçin.'
        );
        return;
      }
      onAnalyze({
        fileBase64: selectedFile.base64,
        mimeType: selectedFile.mimeType,
        fileName: selectedFile.name,
        jobDescription: jobDescription.trim() || undefined
      });
    } else {
      if (!cvText || cvText.trim().length < 30) {
        setErrorMsg(
          language === 'en'
            ? 'Please paste at least 30 characters of CV text.'
            : language === 'ru'
            ? 'Пожалуйста, вставьте не менее 30 символов текста резюме.'
            : 'Zəhmət olmasa ən azı 30 simvol CV mətni daxil edin.'
        );
        return;
      }
      onAnalyze({
        cvText: cvText.trim(),
        jobDescription: jobDescription.trim() || undefined
      });
    }
  };

  const loadSample = (sampleText: string) => {
    setActiveMode('text');
    setCvText(sampleText);
    setErrorMsg(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-7 max-w-3xl mx-auto">
      {/* Mode Tabs */}
      <div className="flex items-center p-1 bg-slate-100/90 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveMode('upload');
            setErrorMsg(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all ${
            activeMode === 'upload'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>{language === 'en' ? 'Upload CV' : language === 'ru' ? 'Загрузить CV' : 'CV Faylı Yüklə'}</span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hidden sm:inline">
            PDF, DOCX
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMode('text');
            setErrorMsg(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all ${
            activeMode === 'text'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          <span>{language === 'en' ? 'Paste CV Text' : language === 'ru' ? 'Вставить текст' : 'CV Mətnini Yapışdır'}</span>
        </button>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs sm:text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab 1: Upload */}
      {activeMode === 'upload' && (
        <div>
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                {language === 'en'
                  ? 'Click to browse or drag and drop your CV here'
                  : language === 'ru'
                  ? 'Нажмите для выбора или перетащите файл сюда'
                  : 'CV faylını seçin və ya bura sürükləyin'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                {language === 'en'
                  ? 'Supported formats: PDF, DOC, DOCX (up to 15 MB)'
                  : language === 'ru'
                  ? 'Поддерживаемые форматы: PDF, DOC, DOCX (до 15 МБ)'
                  : 'Dəstəklənən formatlar: PDF, DOC, DOCX (maksimum 15 MB)'}
              </p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/60 text-slate-700 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Hallucination Factual Extraction</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{selectedFile.sizeFormatted}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Hazırdır
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                title="Faylı sil"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Textarea */}
      {activeMode === 'text' && (
        <div>
          <div className="relative">
            <textarea
              rows={9}
              value={cvText}
              onChange={(e) => {
                setCvText(e.target.value);
                setErrorMsg(null);
              }}
              placeholder={
                language === 'en'
                  ? 'Paste your entire CV text here (Personal information, Experience, Education, Skills, Languages...)'
                  : language === 'ru'
                  ? 'Вставьте сюда полный текст вашего резюме (Личные данные, Опыт, Образование, Навыки...)'
                  : 'CV mətininizi tam olaraq bura yapışdırın (Əlaqə məlumatları, İş təcrübəsi, Təhsil, Bacarıqlar, Dillər...)'
              }
              className="w-full p-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-mono resize-y leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5 px-1">
              <span>
                {cvText.length} {language === 'en' ? 'characters' : language === 'ru' ? 'символов' : 'simvol'}
              </span>
              {cvText.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCvText('')}
                  className="text-slate-500 hover:text-rose-600 transition-colors"
                >
                  {language === 'en' ? 'Clear' : language === 'ru' ? 'Очистить' : 'Təmizlə'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Test Samples */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'en' ? 'Test with sample CV:' : language === 'ru' ? 'Тестовый образец:' : 'Sürətli yoxlama nümunəsi:'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadSample(SAMPLE_CV_DEV)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-colors"
          >
            Frontend Developer CV
          </button>
          <button
            type="button"
            onClick={() => loadSample(SAMPLE_CV_FINANCE)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-colors"
          >
            Mühasibat & Maliyyə CV
          </button>
        </div>
      </div>

      {/* Optional Job Description Input */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowJobDesc(!showJobDesc)}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {language === 'en'
                ? '+ Add Job Description for deep matching (Optional)'
                : language === 'ru'
                ? '+ Добавить описание вакансии для глубокого соответствия (Необязательно)'
                : '+ Vakansiya Tələbləri / İş Təsvirini əlavə et (Könüllü - 7 Meyarlı Uyğunluq)'}
            </span>
          </span>
          <span className="text-[11px] text-blue-600 font-semibold">
            {showJobDesc ? 'Gizlət' : 'Göstər'}
          </span>
        </button>

        {showJobDesc && (
          <div className="mt-2.5 space-y-1.5">
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Paste target job description or requirements here to calculate exact 7-part weighted match...'
                  : language === 'ru'
                  ? 'Вставьте требования вакансии сюда для расчета 7-компонентного соответствия...'
                  : 'Vakansiya tələblərini və ya iş elanının mətnini bura yapışdırın (7-hissəli dəqiq uyğunluq faizi üçün)...'
              }
              className="w-full p-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 placeholder:text-slate-400 font-mono resize-y"
            />
            <p className="text-[11px] text-slate-400">
              💡 Daxil edildikdə sistem: Tələblər Cədvəli (MATCH, PARTIAL MATCH, NOT FOUND, CONTRADICTED) və 7 çəkili göstərici hesablayacaq.
            </p>
          </div>
        )}
      </div>

      {/* Submit Action */}
      <div className="mt-6">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleStartAnalysis}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          <Sparkles className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform" />
          <span>
            {language === 'en'
              ? 'Analyze CV with Gemini 3.8 Flash'
              : language === 'ru'
              ? 'Анализировать резюме (Gemini 3.8 Flash)'
              : 'Gemini 3.8 Flash ilə CV-ni Analiz Et'}
          </span>
        </button>
        <p className="text-[11px] text-slate-400 text-center mt-2">
          🔒 Factual Extraction First → Zero Hallucination Guarantee
        </p>
      </div>
    </div>
  );
};
