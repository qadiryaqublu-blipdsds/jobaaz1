import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  FileText,
  Briefcase,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Zap,
} from 'lucide-react';
import { SAMPLE_CVS } from '../../data/sampleCVs';
import { AnalyzeCVRequest, SampleCV } from '../../types';

interface CVInputSectionProps {
  onAnalyze: (payload: AnalyzeCVRequest) => void;
  isLoading: boolean;
  selectedLanguage: 'az' | 'en' | 'tr' | 'ru';
}

export const CVInputSection: React.FC<CVInputSectionProps> = ({
  onAnalyze,
  isLoading,
  selectedLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [cvText, setCvText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    file: File;
    base64: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [showJobInput, setShowJobInput] = useState(false);
  const [focusArea, setFocusArea] = useState<'comprehensive' | 'ats_only' | 'interview_prep'>('comprehensive');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read file to base64
  const processFile = (file: File) => {
    setErrorMessage(null);
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/webp',
      'text/plain',
    ];

    const isDoc = file.name.endsWith('.doc') || file.name.endsWith('.docx');
    const isTxt = file.name.endsWith('.txt');
    const isPdf = file.name.endsWith('.pdf') || file.type.includes('pdf');

    if (!validTypes.includes(file.type) && !isDoc && !isTxt && !isPdf && !file.type.startsWith('image/')) {
      setErrorMessage('Zəhmət olmasa PDF, Word (.doc, .docx), şəkil (PNG, JPG) və ya TXT faylı seçin.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('Fayl ölçüsü maksimum 20MB ola bilər.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedFile({ file, base64 });
    };
    reader.onerror = () => {
      setErrorMessage('Fayl oxunarkən xəta baş verdi.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSample = (sample: SampleCV) => {
    setActiveTab('text');
    setCvText(sample.cvText);
    if (sample.jobDescription) {
      setJobDescription(sample.jobDescription);
      setShowJobInput(true);
    }
    setUploadedFile(null);
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    setErrorMessage(null);

    if (activeTab === 'upload') {
      if (!uploadedFile) {
        setErrorMessage('Zəhmət olmasa CV faylınızı yükləyin və ya "Mətn daxil et" bölməsinə keçin.');
        return;
      }
      onAnalyze({
        fileBase64: uploadedFile.base64,
        mimeType: uploadedFile.file.type || 'application/pdf',
        fileName: uploadedFile.file.name,
        jobDescription: jobDescription.trim() || undefined,
        language: selectedLanguage,
        focusArea,
      });
    } else {
      if (!cvText.trim()) {
        setErrorMessage('Zəhmət olmasa CV mətnini daxil edin və ya nümunələrdən birini seçin.');
        return;
      }
      onAnalyze({
        cvText: cvText.trim(),
        jobDescription: jobDescription.trim() || undefined,
        language: selectedLanguage,
        focusArea,
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Sample CV shortcut chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Zap className="w-4 h-4 text-indigo-600" />
          <span className="uppercase tracking-wide text-[11px] text-slate-500">Sınaq üçün hazır CV-lər:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_CVS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleLoadSample(sample)}
              className="text-xs px-3 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 transition-all font-medium cursor-pointer"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Fayl Yüklə (PDF, Word, Şəkil, TXT)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Mətn Daxil Et</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* File upload tab */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="cv-file-input"
              />

              {!uploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    CV Faylını Seçin və ya Buraya Sürükləyin
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    PDF, DOC, DOCX, TXT və ya Şəkil formatları (Maks. 20MB)
                  </p>
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50">
                    Kompüterdən fayl seç
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(uploadedFile.file.size / 1024).toFixed(1)} KB • {uploadedFile.file.type || 'Sənəd'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Faylı sil"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Text input tab */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <label htmlFor="cv-text-input" className="block text-xs font-semibold text-slate-700">
                CV Məzmunu (İş təcrübəsi, təhsil, bacarıqlar və s.):
              </label>
              <textarea
                id="cv-text-input"
                rows={9}
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Məsələn:
Ad Soyad: Murad Əliyev
Əlaqə: murad@email.com | +994 50 123 45 67

Təcrübə:
Frontend Developer | Şirkət MMC (2022 - Hazırda)
- React və TypeScript ilə platformanın yaradılması
- Saytın sürətinin artırılması..."
                className="w-full p-3.5 text-sm font-mono bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all resize-y"
              />
              <div className="flex justify-between text-xs text-slate-500 px-1">
                <span>{cvText.length} simvol</span>
                {cvText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCvText('')}
                    className="text-red-500 hover:underline cursor-pointer"
                  >
                    Mətni təmizlə
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Optional Job Description input toggle */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setShowJobInput(!showJobInput)}
              className="flex items-center justify-between w-full py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-500" />
                <span>Hədəf Vakansiya Tələbləri (Job Description) ilə Müqayisə</span>
                <span className="text-slate-400 font-normal">(Opsional)</span>
              </span>
              {showJobInput ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showJobInput && (
              <div className="mt-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs text-slate-600">
                  Müraciət etmək istədiyiniz vakansiyanın tələblərini bura yapışdırın. Gemini CV-nin həmin vakansiyaya uyğunluq faizini və çatışmayan açar sözləri müəyyən edəcək.
                </p>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Vakansiya tələblərini bura yapışdırın (məs: 3+ il React təcrübəsi, Redux, Docker, CI/CD, komandada iş...)"
                  className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
                />
              </div>
            )}
          </div>

          {/* Focus mode selector */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Fokus:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFocusArea('comprehensive')}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  focusArea === 'comprehensive'
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Hərtərəfli Təhlil
              </button>
              <button
                type="button"
                onClick={() => setFocusArea('ats_only')}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  focusArea === 'ats_only'
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ATS & Format Yoxlanışı
              </button>
              <button
                type="button"
                onClick={() => setFocusArea('interview_prep')}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  focusArea === 'interview_prep'
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Müsahibə Hazırlığı
              </button>
            </div>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <X className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className={`w-full py-3.5 px-6 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2.5 transition-colors shadow-sm cursor-pointer ${
              isLoading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemini CV-ni təhlil edir...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>CV-ni Dərin Təhlil Et</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVInputSection;
