import React, { useState, useRef, useEffect } from 'react';
import { CVData } from '../../../types';
import { 
  X, 
  Sparkles, 
  Clipboard, 
  Loader2, 
  Check, 
  AlertCircle, 
  FileText,
  Lightbulb,
  Mic,
  MicOff,
  Image as ImageIcon,
  UploadCloud,
  Link as LinkIcon,
  Globe,
  Share2,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  FileUp
} from 'lucide-react';
import { 
  extractTextFromDocument, 
  readFileAsBase64, 
  formatFileSize 
} from '../../../utils/fileExtractor';

interface CVCreatorAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCvData: (data: CVData) => void;
  photoUrl?: string;
  autoTriggerImageUpload?: boolean;
  initialMode?: 'file' | 'social' | 'text' | 'voice' | 'image';
}

export const CVCreatorAiModal: React.FC<CVCreatorAiModalProps> = ({
  isOpen,
  onClose,
  onApplyCvData,
  photoUrl,
  autoTriggerImageUpload = false,
  initialMode = 'file'
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'social' | 'text' | 'voice' | 'image'>(
    autoTriggerImageUpload ? 'image' : (initialMode || 'file')
  );

  // File Upload Mode state (PDF, Word, TXT, Image)
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const [cvFileBase64, setCvFileBase64] = useState<string | null>(null);
  const [cvFileMime, setCvFileMime] = useState<string | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvFileSize, setCvFileSize] = useState<string | null>(null);
  const [cvExtractedText, setCvExtractedText] = useState<string>('');
  const [cvFileNotes, setCvFileNotes] = useState<string>('');
  const [isExtractingFile, setIsExtractingFile] = useState<boolean>(false);
  const [isDragOverFile, setIsDragOverFile] = useState<boolean>(false);
  const cvFileInputRef = useRef<HTMLInputElement | null>(null);

  // Social Profile Mode state
  const [socialPlatform, setSocialPlatform] = useState<'linkedin' | 'facebook'>('linkedin');
  const [socialUrl, setSocialUrl] = useState('');
  const [socialNotes, setSocialNotes] = useState('');

  // Text Mode state
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Image upload state for CV photo / gallery scan
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Voice recording state for the modal
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const baselineTextRef = useRef<string>('');

  useEffect(() => {
    if (isOpen) {
      if (autoTriggerImageUpload) {
        setActiveTab('image');
        const timer = setTimeout(() => {
          fileInputRef.current?.click();
        }, 150);
        return () => clearTimeout(timer);
      } else if (initialMode) {
        setActiveTab(initialMode);
      }
    }
  }, [isOpen, autoTriggerImageUpload, initialMode]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Zəhmət olmasa düzgün şəkil formatı (JPG, PNG, WEBP) seçin.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Şəkil ölçüsü 15MB-dan kiçik olmalıdır.');
      return;
    }

    setErrorMsg('');
    setSelectedImageName(file.name);
    setSelectedImageMime(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageBase64(reader.result as string);
      setStatusMsg('📷 Şəkil uğurla seçildi! İstəsəniz aşağıda əlavə qeydlər də yaza bilərsiniz.');
      setTimeout(() => setStatusMsg(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImageBase64(null);
    setSelectedImageMime(null);
    setSelectedImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startVoiceRecording = async () => {
    setErrorMsg('');
    setStatusMsg('');
    audioChunksRef.current = [];
    baselineTextRef.current = pastedText;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Brauzer mikrofonu dəstəkləmir.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      // Live Web Speech Recognition for instant speech feedback
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'az-AZ';
          let liveSpeech = '';
          rec.onresult = (ev: any) => {
            let interim = '';
            for (let i = ev.resultIndex; i < ev.results.length; ++i) {
              if (ev.results[i].isFinal) {
                liveSpeech += ' ' + ev.results[i][0].transcript;
              } else {
                interim += ev.results[i][0].transcript;
              }
            }
            const currentTotal = (liveSpeech + ' ' + interim).trim();
            if (currentTotal) {
              setPastedText(baselineTextRef.current ? `${baselineTextRef.current}\n\n${currentTotal}` : currentTotal);
            }
          };
          rec.onerror = () => {};
          rec.start();
          recognitionRef.current = rec;
        } catch {}
      }

      recorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
          recognitionRef.current = null;
        }
        const cleanMime = (mediaRecorderRef.current?.mimeType || 'audio/webm').split(';')[0];
        const blob = new Blob(audioChunksRef.current, { type: cleanMime });
        if (blob.size < 500) {
          setErrorMsg('Səs yazısı çox qısadır. Zəhmət olmasa bir neçə saniyə danışın.');
          return;
        }

        setIsTranscribing(true);
        setStatusMsg('🎙️ Səs Gemini 3.5 Transcribe modeli ilə yoxlanılır və mətn dəqiqləşdirilir...');
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            const res = await fetch('/api/ai/transcribe-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64,
                mimeType: cleanMime,
                clientTranscribedText: pastedText.trim()
              })
            });
            const data = await res.json();
            if (data.success && data.transcribedText) {
              setPastedText(baselineTextRef.current ? `${baselineTextRef.current}\n\n${data.transcribedText}` : data.transcribedText);
              setStatusMsg('✨ Səs uğurla mətnə çevrildi!');
              setTimeout(() => setStatusMsg(''), 3000);
            } else if (pastedText.trim() && pastedText.trim() !== baselineTextRef.current) {
              setStatusMsg('✨ Nitq qeydə alındı.');
              setTimeout(() => setStatusMsg(''), 3000);
            } else {
              setErrorMsg(data.error || 'Səs transkripsiya edilə bilmədi. Mikrofona bir daha aydın danışın.');
            }
            setIsTranscribing(false);
          };
          reader.readAsDataURL(blob);
        } catch (e: any) {
          console.error(e);
          setErrorMsg('Səs çevrilərkən xəta baş verdi.');
          setIsTranscribing(false);
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Mikrofon icazəsi tələb olunur.');
    }
  };

  const stopVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  if (!isOpen) return null;

  const sampleLinkedInText = `Rəşad Quliyev
Bakı, Azərbaycan | +994 50 123 45 67 | reshad.q@example.com | linkedin.com/in/reshadq

Vəzifə: Baş Proqram Təminatı Mühəndisi (Lead Software Engineer)

Haqqımda:
7 ildən artıq təcrübəyə malik Full Stack mühəndis. Yüksək yüklü fintex və elektron ticarət sistemlərinin memarlığı, mikroxidmətlər və bulud həllərində dərin təcrübə.

İş Təcrübəsi:
1. Şirkət: FinTech Solutions LLC (2021 - Hazırda)
Vəzifə: Lead Software Engineer
- 10+ mühəndisdən ibarət komandaya texniki rəhbərlik etdim.
- Günlük 2 milyondan çox tranzaksiyanı emal edən ödəniş şlüzünün performansını 35% artırdım.
- CI/CD və avtomatlaşdırılmış testləri tətbiq edərək reliz vaxtını 4 dəfə qısaltdım.

2. Şirkət: Global Digital Agency (2018 - 2021)
Vəzifə: Senior Full Stack Developer
- React və Node.js əsaslı beynəlxalq layihələri sıfırdan hazırladım.
- PostgreSQL verilənlər bazası sorğularını optimallaşdıraraq cavab müddətini 250ms-ə endirdim.

Təhsil:
Bakı Dövlət Universiteti | Kompüter Elmləri | Bakalavr (2014 - 2018) | GPA: 3.8 / 4.0

Bacarıqlar:
TypeScript, React, Node.js, Next.js, PostgreSQL, Docker, Kubernetes, AWS, Redis, GraphQL, Agile/Scrum.

Dillər:
- Azərbaycan dili: Ana dili
- İngilis dili: Professional Working (C1)
- Rus dili: Danışıq səviyyəsi (B2)`;

  // Select and locally parse uploaded CV file
  const handleSelectCvFile = async (file: File) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Fayl ölçüsü 25MB-dan kiçik olmalıdır.');
      return;
    }
    setErrorMsg('');
    setSelectedCvFile(file);
    setCvFileName(file.name);
    setCvFileMime(file.type || 'application/octet-stream');
    setCvFileSize(formatFileSize(file.size));
    setIsExtractingFile(true);
    setStatusMsg('Fayl oxunur və məlumatlar çıxarılır...');

    try {
      const base64 = await readFileAsBase64(file);
      setCvFileBase64(base64);
      const text = await extractTextFromDocument(file);
      setCvExtractedText(text || '');
      const wordCount = (text || '').split(/\s+/).filter(Boolean).length;
      setStatusMsg(`✓ "${file.name}" seçildi! ${wordCount > 10 ? `(~${wordCount} söz aşkarlandı)` : ''}`);
    } catch (err) {
      console.warn('Local extraction note:', err);
      setStatusMsg(`✓ "${file.name}" seçildi.`);
    } finally {
      setIsExtractingFile(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  // Generate CV from Uploaded File (PDF, Word, TXT, Image)
  const handleGenerateFromFile = async () => {
    if (!selectedCvFile && !cvExtractedText && !cvFileBase64) {
      setErrorMsg('Zəhmət olmasa bir CV faylı (PDF, Word, Şəkil və ya TXT) seçin.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setStatusMsg(`AI "${cvFileName || 'CV faylını'}" təhlil edir və yeni CV yaradır...`);

    try {
      const res = await fetch('/api/ai/generate-cv-from-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: cvFileBase64,
          mimeType: cvFileMime,
          fileName: cvFileName,
          extractedText: cvExtractedText,
          notes: cvFileNotes.trim() || undefined,
          photoUrl
        })
      });

      const json = await res.json();
      if (json && json.cvData) {
        setStatusMsg('🎉 Yeni CV fayl məlumatları əsasında uğurla yaradıldı!');
        setTimeout(() => {
          onApplyCvData(json.cvData);
          onClose();
        }, 700);
      } else {
        throw new Error(json.error || 'CV faylı emal edilə bilmədi.');
      }
    } catch (err: any) {
      console.error('File CV error:', err);
      setErrorMsg(err?.message || 'Fayl emal edilərkən xəta baş verdi. Zəhmət olmasa faylı yoxlayıb yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate CV from LinkedIn or Facebook Profile URL
  const handleGenerateFromSocial = async () => {
    const url = socialUrl.trim();
    if (!url) {
      setErrorMsg(
        socialPlatform === 'linkedin'
          ? 'Zəhmət olmasa LinkedIn profil linkinizi daxil edin (məsələn: linkedin.com/in/ad-soyad).'
          : 'Zəhmət olmasa Facebook profil linkinizi daxil edin (məsələn: facebook.com/ad-soyad).'
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setStatusMsg(
      `AI ${socialPlatform === 'linkedin' ? 'LinkedIn' : 'Facebook'} profil məlumatlarını təhlil edir və CV-yə çevirir...`
    );

    try {
      const res = await fetch('/api/ai/generate-cv-from-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileUrl: url,
          platform: socialPlatform,
          rawPastedText: socialNotes.trim() || undefined,
          photoUrl
        })
      });

      const json = await res.json();
      if (json && json.cvData) {
        setStatusMsg('🎉 Profil məlumatları əsasında CV uğurla yaradıldı!');
        setTimeout(() => {
          onApplyCvData(json.cvData);
          onClose();
        }, 700);
      } else {
        throw new Error(json.error || 'Profil məlumatları emal edilə bilmədi.');
      }
    } catch (err: any) {
      console.error('Social CV error:', err);
      setErrorMsg(err?.message || 'Profil məlumatları çıxarılarkən xəta baş verdi. Zəhmət olmasa linki yoxlayıb yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate CV from Text, Voice or Image
  const handleGenerateFromContent = async () => {
    const text = pastedText.trim();
    if (!text && !selectedImageBase64) {
      setErrorMsg('Zəhmət olmasa mətn daxil edin və ya qalereyadan CV şəkli yükləyin.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setStatusMsg(
      selectedImageBase64 
        ? 'AI şəkildəki məlumatları oxuyur və CV bölmələrini peşəkar şəkildə formalaşdırır...'
        : 'AI mətni təhlil edir və CV bölmələrini peşəkar şəkildə formalaşdırır...'
    );

    try {
      const res = await fetch('/api/ai/generate-full-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPastedText: text,
          imageBase64: selectedImageBase64,
          imageMimeType: selectedImageMime,
          photoUrl
        })
      });

      const json = await res.json();
      if (json && json.cvData) {
        setStatusMsg('🎉 CV uğurla yaradıldı!');
        setTimeout(() => {
          onApplyCvData(json.cvData);
          onClose();
        }, 700);
      } else {
        throw new Error(json.error || 'CV məlumatları emal edilə bilmədi.');
      }
    } catch (err: any) {
      console.error('AI CV error:', err);
      setErrorMsg(err?.message || 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI ilə Ağıllı CV Yarat
              </h3>
              <p className="text-xs text-slate-500">
                Köhnə CV faylınızı yükləyin (PDF, Word, Şəkil, TXT), sosial profil linki qoyun və ya mətn yapışdırın
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 sm:px-6 pt-3 pb-1 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 bg-slate-200/70 rounded-xl">
            {/* 1. File Upload Tab (PDF, Word, TXT, Image) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('file');
                setErrorMsg('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                activeTab === 'file'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fayl Yüklə (PDF / Word)</span>
            </button>

            {/* 2. LinkedIn & Facebook Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('social');
                setErrorMsg('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                activeTab === 'social'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>LinkedIn / Facebook</span>
            </button>

            {/* 3. Text Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('text');
                setErrorMsg('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                activeTab === 'text'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Mətn və ya Qeydlər</span>
            </button>

            {/* 4. Voice Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('voice');
                setErrorMsg('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                activeTab === 'voice'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-rose-600" />
              <span>Səslə Diktə</span>
            </button>

            {/* 5. Image Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('image');
                setErrorMsg('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap leading-none ${
                activeTab === 'image'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Şəkil / Sənəd OCR</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">

          {/* TAB 1: FILE UPLOAD (PDF, WORD DOCX/DOC, TXT, IMAGE) */}
          {activeTab === 'file' && (
            <div className="space-y-4 animate-in fade-in-50">
              {/* Quick Info Tip */}
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 flex items-start gap-2.5">
                <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">İstənilən CV Faylından Yeni CV Yaratmaq</span>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Kompüter və ya telefonunuzdakı köhnə CV sənədini (PDF, Word DOCX/DOC, Şəkil JPG/PNG və ya TXT) yükləyin. Jobia AI bütün məlumatları dəqiqliklə oxuyaraq müasir, beynəlxalq ATS standartlı CV formalaşdıracaq.
                  </p>
                </div>
              </div>

              {/* Drag & Drop Area */}
              {!selectedCvFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOverFile(true); }}
                  onDragLeave={() => setIsDragOverFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOverFile(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleSelectCvFile(file);
                  }}
                  onClick={() => cvFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    isDragOverFile
                      ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={cvFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSelectCvFile(file);
                    }}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">
                      Köhnə CV faylınızı bura atın və ya <span className="text-emerald-700 underline font-extrabold">cihazdan seçin</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Dəstəklənən formatlar: PDF, Word (DOCX / DOC), Şəkil (PNG / JPG), TXT, RTF (25MB-dək)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold">PDF</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">Word .docx / .doc</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">Şəkil JPG / PNG</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">TXT</span>
                  </div>
                </div>
              ) : (
                <div className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50/40 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {cvFileName?.endsWith('.pdf') ? 'PDF' : cvFileName?.includes('.doc') ? 'DOC' : cvFileMime?.startsWith('image/') ? 'IMG' : 'TXT'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {cvFileName}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                          <span className="font-semibold text-slate-600">{cvFileSize}</span>
                          {cvExtractedText && (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Mətn oxundu (~{cvExtractedText.split(/\s+/).filter(Boolean).length} söz)</span>
                            </span>
                          )}
                          {isExtractingFile && (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                              <span>Mətn oxunur...</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCvFile(null);
                        setCvFileBase64(null);
                        setCvFileMime(null);
                        setCvFileName(null);
                        setCvFileSize(null);
                        setCvExtractedText('');
                        if (cvFileInputRef.current) cvFileInputRef.current.value = '';
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title="Faylı dəyiş / sil"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Text Preview if available */}
                  {cvExtractedText && (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-100 text-[11px] text-slate-600 max-h-24 overflow-y-auto leading-relaxed font-mono">
                      {cvExtractedText.slice(0, 350)}...
                    </div>
                  )}
                </div>
              )}

              {/* Optional Notes or Target Position */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hədəf Vəzifə və ya Əlavə Qeydlər (İstəyə görə):</span>
                </label>
                <input
                  type="text"
                  value={cvFileNotes}
                  onChange={(e) => setCvFileNotes(e.target.value)}
                  placeholder="Məsələn: 'Senior Frontend Developer vəzifəsinə uyğunlaşdır' və ya 'Maliyyə sahəsində təcrübəmi vurğula'"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL PROFILE (LINKEDIN / FACEBOOK) */}
          {activeTab === 'social' && (
            <div className="space-y-4 animate-in fade-in-50">
              {/* Quick Info Tip */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/90 text-blue-950 flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Sosial Profilinizlə 1-kliklə CV Yaratmaq</span>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    LinkedIn və ya Facebook profil linkinizi yapışdırın. Jobia AI profil məlumatlarınızı, ad-soyadınızı, təcrübələrinizi və bacarıqlarınızı dərhal beynəlxalq standartlı rəsmi CV-yə çevirəcək.
                  </p>
                </div>
              </div>

              {/* Platform Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Sosial Şəbəkəni Seçin:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSocialPlatform('linkedin');
                      if (!socialUrl || socialUrl.includes('facebook')) {
                        setSocialUrl('https://linkedin.com/in/');
                      }
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                      socialPlatform === 'linkedin'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md bg-[#0077b5] text-white flex items-center justify-center font-black text-xs">
                      in
                    </div>
                    <span>LinkedIn Profili</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSocialPlatform('facebook');
                      if (!socialUrl || socialUrl.includes('linkedin')) {
                        setSocialUrl('https://facebook.com/');
                      }
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                      socialPlatform === 'facebook'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-1 ring-indigo-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md bg-[#1877f2] text-white flex items-center justify-center font-black text-xs">
                      f
                    </div>
                    <span>Facebook Profili</span>
                  </button>
                </div>
              </div>

              {/* URL Input Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>{socialPlatform === 'linkedin' ? 'LinkedIn Profil Linki:' : 'Facebook Profil Linki:'}</span>
                  </label>
                  {/* Sample links */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Nümunə:</span>
                    <button
                      type="button"
                      onClick={() => setSocialUrl(socialPlatform === 'linkedin' ? 'https://linkedin.com/in/elmir-qasimov' : 'https://facebook.com/elmir.qasimov')}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      elmir-qasimov
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => setSocialUrl(socialPlatform === 'linkedin' ? 'https://linkedin.com/in/ayten-hesenova' : 'https://facebook.com/ayten.hesenova')}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      ayten-hesenova
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    value={socialUrl}
                    onChange={(e) => setSocialUrl(e.target.value)}
                    placeholder={
                      socialPlatform === 'linkedin'
                        ? 'https://www.linkedin.com/in/ad-soyad/'
                        : 'https://www.facebook.com/ad-soyad'
                    }
                    className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-medium text-slate-800 shadow-2xs"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  {socialUrl && (
                    <button
                      type="button"
                      onClick={() => setSocialUrl('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Optional Extra Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Əlavə Qeydlər və ya Hədəf Vəzifə (İstəyə görə):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Məsələn: Senior Frontend Developer</span>
                </label>
                <textarea
                  value={socialNotes}
                  onChange={(e) => setSocialNotes(e.target.value)}
                  placeholder="CV-də xüsusi qeyd etmək istədiyiniz təcrübələr, vəzifə istəyi və ya əsas bacarıqları bura yaza bilərsiniz..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* TAB 2 & 3: TEXT & VOICE DICTATION */}
          {(activeTab === 'text' || activeTab === 'voice') && (
            <div className="space-y-4 animate-in fade-in-50">
              {/* Quick Info Tip */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-purple-900 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Mətn və ya Səslə CV Tərtibi</span>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    Köhnə CV mətninizi yapışdıra, sərbəst qeydlər yaza və ya mikrofona danışaraq təcrübənizi bölüşə bilərsiniz. Süni intellekt məlumatları rəsmi CV standartlarına salacaq.
                  </p>
                </div>
              </div>

              {/* Voice Dictation Control Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Mic className={`w-4 h-4 ${isRecording ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`} />
                  <div>
                    <div className="font-bold text-slate-800 text-xs">
                      {isRecording ? `Səs yazılır: ${recordingSeconds} saniyə...` : 'Səslə Diktə İmkanı'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isRecording ? 'Aydın danışın, nitqiniz anında mətnə çevrilir' : 'Mikrofona danışaraq CV məlumatlarınızı diktə edin'}
                    </div>
                  </div>
                </div>

                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    disabled={isLoading || isTranscribing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all cursor-pointer text-xs shadow-2xs"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Diktəyə Başla</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all cursor-pointer text-xs animate-pulse shadow-xs"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Dayandır ({recordingSeconds}s)</span>
                  </button>
                )}
              </div>

              {/* Text Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>CV Mətni və ya Tərcümeyi-hal:</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPastedText(sampleLinkedInText)}
                      className="text-purple-700 hover:text-purple-900 font-bold hover:underline text-[11px]"
                    >
                      Nümunə mətn qoy
                    </button>
                    {pastedText && (
                      <button
                        type="button"
                        onClick={() => setPastedText('')}
                        className="text-slate-400 hover:text-rose-600 text-[11px]"
                      >
                        Təmizlə
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Köhnə CV mətninizi, qeydlərinizi və ya iş təcrübənizi bura yapışdırın..."
                  rows={7}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* TAB 4: IMAGE SCAN (OCR) */}
          {activeTab === 'image' && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/90 text-indigo-950 flex items-start gap-2.5">
                <ImageIcon className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Şəkildən və Sənədlərdən CV Yaratmaq</span>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    Kağız CV-nizin, diplomunuzun və ya kompüterdəki CV skrinşotunun şəklini yükləyin. Jobia Vision AI mətni oxuyacaq və formatlaşdıracaq.
                  </p>
                </div>
              </div>

              {selectedImageBase64 ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={selectedImageBase64}
                      alt="CV Şəkli"
                      className="w-14 h-14 rounded-lg object-cover border border-indigo-300 shadow-2xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-indigo-950 truncate flex items-center gap-1.5">
                        <span className="truncate">{selectedImageName || 'CV Şəkli'}</span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-200 text-[10px] text-indigo-900 font-bold">
                          Yükləndi
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-800/90 truncate mt-0.5">
                        AI şəkildəki bütün təcrübə, təhsil və əlaqə məlumatlarını oxuyacaq.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 ml-2"
                    title="Şəkli sil"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl bg-indigo-50/40 hover:bg-indigo-50 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="p-3 rounded-full bg-white text-indigo-600 shadow-xs group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-slate-800 text-xs">
                    CV Şəklini Seçmək üçün Klikləyin
                  </div>
                  <div className="text-[11px] text-slate-500">
                    JPG, PNG və ya WEBP (Maksimum 15 MB)
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              {/* Extra text alongside image */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  Şəklə Əlavə Qeydlər (İstəyə görə):
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Şəkilə əlavə olaraq qeyd etmək istədiyiniz məlumatlar..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn font-semibold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 font-bold transition-colors cursor-pointer text-xs"
          >
            Ləğv et
          </button>

          {activeTab === 'file' ? (
            <button
              type="button"
              onClick={handleGenerateFromFile}
              disabled={isLoading || (!selectedCvFile && !cvExtractedText && !cvFileBase64)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fayl Oxunur və CV Tərtib Edilir...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Fayldan Yeni CV Yarat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          ) : activeTab === 'social' ? (
            <button
              type="button"
              onClick={handleGenerateFromSocial}
              disabled={isLoading || !socialUrl.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Profil Analiz Edilir...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Profili İdxal Et və CV Yarat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerateFromContent}
              disabled={isLoading || (!pastedText.trim() && !selectedImageBase64)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI CV Tərtib Edir...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{selectedImageBase64 ? 'Şəkildən CV Yarat' : 'Mətndən CV Yarat'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
