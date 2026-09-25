import React, { useState, useRef } from 'react';
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
  UploadCloud
} from 'lucide-react';

interface CVCreatorAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCvData: (data: CVData) => void;
  photoUrl?: string;
  autoTriggerImageUpload?: boolean;
}

export const CVCreatorAiModal: React.FC<CVCreatorAiModalProps> = ({
  isOpen,
  onClose,
  onApplyCvData,
  photoUrl,
  autoTriggerImageUpload = false
}) => {
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Image upload state for CV photo / gallery scan
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto trigger file picker if launched specifically in image mode
  React.useEffect(() => {
    if (isOpen && autoTriggerImageUpload && !selectedImageBase64) {
      const timer = setTimeout(() => {
        fileInputRef.current?.click();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoTriggerImageUpload, selectedImageBase64]);

  // Voice recording state for the modal
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const recognitionRef = React.useRef<any>(null);
  const baselineTextRef = React.useRef<string>('');

  React.useEffect(() => {
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
    reader.onerror = () => {
      setErrorMsg('Şəkli oxumaq mümkün olmadı.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImageBase64(null);
    setSelectedImageMime(null);
    setSelectedImageName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startVoiceRecording = async () => {
    setErrorMsg('');
    audioChunksRef.current = [];
    baselineTextRef.current = pastedText.trim();
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
                mimeType: cleanMime
              })
            });
            const data = await res.json();
            if (data.success && data.transcribedText) {
              setPastedText(baselineTextRef.current ? `${baselineTextRef.current}\n\n${data.transcribedText}` : data.transcribedText);
              setStatusMsg('✨ Səs uğurla mətnə çevrildi!');
              setTimeout(() => setStatusMsg(''), 3000);
            } else {
              // If live transcription already captured text, keep it
              if (pastedText.trim() && pastedText.trim() !== baselineTextRef.current) {
                setStatusMsg('✨ Nitq qeydə alındı.');
                setTimeout(() => setStatusMsg(''), 3000);
              } else {
                setErrorMsg(data.error || 'Səs transkripsiya edilə bilmədi. Mikrofona bir daha aydın danışın.');
              }
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
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
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

  const handleGenerate = async () => {
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
        }, 800);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-white to-indigo-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI İlə Mətndən və ya Şəkildən CV Yarat
              </h3>
              <p className="text-xs text-slate-500">
                Qalereyadan şəkil yükləyin, səslə deyin və ya mətn yapışdırın
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Quick Info Tip */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-purple-900 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Necə işləyir?</span>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Köhnə CV-nizin və ya sənədlərinizin şəklini yükləyə, mikrofona danışa və ya LinkedIn mətnini yapışdıra bilərsiniz. Süni intellekt məlumatları avtomatik ayıraraq rəsmi CV strukturuna çevirir.
              </p>
            </div>
          </div>

          {/* Uploaded Image Preview */}
          {selectedImageBase64 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/90 border border-indigo-200 animate-fadeIn">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedImageBase64}
                  alt="Yüklənmiş CV Şəkli"
                  className="w-12 h-12 rounded-lg object-cover border border-indigo-300 shadow-2xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-indigo-950 truncate flex items-center gap-1.5">
                    <span className="truncate">{selectedImageName || 'CV Şəkli'}</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-200 text-[10px] text-indigo-900 font-bold">
                      Şəkil Yükləndi
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
                className="p-1.5 rounded-lg text-indigo-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 ml-2"
                title="Şəkli sil"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Text Area & Action Buttons */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedImageBase64 ? 'Əlavə Qeydlər (İstəyə görə):' : 'Mətn Sahəsi:'}</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {/* Voice Dictation Button */}
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    disabled={isLoading || isTranscribing}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-all cursor-pointer text-[11px]"
                    title="Mikrofona danışaraq mətni bura əlavə et"
                  >
                    <Mic className="w-3.5 h-3.5 text-rose-600" />
                    <span>Səslə De</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all cursor-pointer text-[11px] animate-pulse"
                    title="Səs yazısını saxla"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Dayandır ({recordingSeconds}s)</span>
                  </button>
                )}

                {/* Gallery / Image Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isTranscribing}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 transition-all cursor-pointer text-[11px]"
                  title="Qalereyadan və ya kompüterdən CV şəkli yüklə"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Şəkildən Oxu</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => setPastedText(sampleLinkedInText)}
                  className="text-purple-700 hover:text-purple-900 font-bold hover:underline"
                >
                  Nümunə mətn qoy
                </button>
                {pastedText && (
                  <>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setPastedText('')}
                      className="text-rose-600 hover:text-rose-800 font-bold hover:underline"
                    >
                      Təmizlə
                    </button>
                  </>
                )}
              </div>
            </div>

            <textarea
              rows={selectedImageBase64 ? 5 : 8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={
                selectedImageBase64
                  ? "İstəsəniz şəkildən əlavə qeydlərinizi də bura yaza bilərsiniz (Məs: 'Maaş gözləntisi 1500 AZN, sürücülük vəsiqəm B kateqoriyasıdır')..."
                  : "LinkedIn 'About & Experience' bölməsini, köhnə CV mətninizi və ya sərbəst qeydlərinizi bura yapışdırın..."
              }
              className="w-full p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50/50 text-xs text-slate-900 font-mono leading-relaxed"
            />
          </div>

          {/* Status & Error Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {statusMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || (!pastedText.trim() && !selectedImageBase64)}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Hazırlanır...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>{selectedImageBase64 ? 'AI İlə Şəkildən CV Yarat' : 'AI İlə CV-ni Yarat'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
