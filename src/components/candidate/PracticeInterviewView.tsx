import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Vacancy,
  InterviewQuestion,
  PracticeInterviewSentimentResult,
  PracticeInterviewSessionItem,
} from '../../types';
import {
  evaluatePracticeSentiment,
  fetchPracticeQuestions,
  savePracticeSessionToStorage,
} from '../../services/practiceInterviewService';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Gauge,
  Activity,
  Flame,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Download,
  Share2,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Briefcase,
  Layers,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface PracticeInterviewViewProps {
  vacancies?: Vacancy[];
  initialVacancy?: Vacancy | null;
  onSelectVacancyForPrep?: (vac: Vacancy) => void;
}

const ROLE_PRESETS = [
  { id: 'frontend', title: 'Senior / Middle Frontend Developer', category: 'İT & Proqramlaşdırma' },
  { id: 'backend', title: 'Backend Software Engineer (Node/Python/Go)', category: 'İT & Proqramlaşdırma' },
  { id: 'uiux', title: 'UX/UI & Product Designer', category: 'Dizayn' },
  { id: 'finance', title: 'Maliyyə Analitiki & Baş Mühasib', category: 'Maliyyə & Mühasibat' },
  { id: 'marketing', title: 'Rəqəmsal Marketinq & Growth Meneceri', category: 'Marketinq & PR' },
  { id: 'hr', title: 'İnsan Resursları (HR) Mütəxəssisi', category: 'İnsan Resursları' },
  { id: 'sales', title: 'Korporativ Satış & B2B Meneceri', category: 'Satış' },
  { id: 'customer', title: 'Müştəri Xidmətləri & Call Center Təmsilçisi', category: 'Xidmət & Dəstək' },
];

export const PracticeInterviewView: React.FC<PracticeInterviewViewProps> = ({
  vacancies = [],
  initialVacancy = null,
  onSelectVacancyForPrep,
}) => {
  // Target role / vacancy state
  const [selectedRoleTitle, setSelectedRoleTitle] = useState<string>(
    initialVacancy?.title || ROLE_PRESETS[0].title
  );
  const [selectedCompany, setSelectedCompany] = useState<string>(
    initialVacancy?.companyName || 'PASHA Bank / Kapital Bank'
  );

  // Questions state
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);

  // Recording & Audio States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [audioTranscript, setAudioTranscript] = useState<string>('');

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Live Canvas Audio Visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);

  // AI Sentiment Evaluation state
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState<boolean>(false);
  const [sessionResults, setSessionResults] = useState<Record<number, PracticeInterviewSessionItem>>({});
  const [activeAnalysis, setActiveAnalysis] = useState<PracticeInterviewSentimentResult | null>(null);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load questions when selected role changes
  const loadQuestions = useCallback(async () => {
    setIsLoadingQuestions(true);
    try {
      const data = await fetchPracticeQuestions(selectedRoleTitle, selectedCompany);
      setQuestions(data.questions || []);
      setTips(data.tips || []);
      setCurrentQuestionIndex(0);
      setRecordedAudioUrl(null);
      setAudioTranscript('');
      setActiveAnalysis(null);
    } catch {
      showToast('Suallar yüklənərkən xəta baş verdi', 'error');
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [selectedRoleTitle, selectedCompany]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Sync initial vacancy if passed
  useEffect(() => {
    if (initialVacancy) {
      setSelectedRoleTitle(initialVacancy.title);
      setSelectedCompany(initialVacancy.companyName);
    }
  }, [initialVacancy]);

  // Clean up audio objects on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  // Real-time Canvas Waveform Animation
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient background glow
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.85;

        // Dynamic gradient based on amplitude
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, '#6366f1'); // Indigo
        grad.addColorStop(0.5, '#3b82f6'); // Blue
        grad.addColorStop(1, '#10b981'); // Emerald peak

        ctx.fillStyle = grad;
        ctx.fillRect(x, height - barHeight, barWidth - 1.5, barHeight);

        x += barWidth + 1;
        if (x > width) break;
      }
    };

    render();
  }, []);

  // Idle Waveform when not recording
  useEffect(() => {
    if (!isRecording && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let step = 0;
      let idleAnim: number;

      const drawIdle = () => {
        idleAnim = requestAnimationFrame(drawIdle);
        step += 0.04;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const centerY = height / 2;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#cbd5e1'; // slate-300

        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * 0.03 + step) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      drawIdle();
      return () => cancelAnimationFrame(idleAnim);
    }
  }, [isRecording]);

  // Start Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        showToast('Brauzeriniz mikrofon yazma imkanını dəstəkləmir.', 'error');
        return;
      }

      // Reset previous audio
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
        setRecordedAudioUrl(null);
      }
      setRecordedAudioBlob(null);
      audioChunksRef.current = [];
      setRecordingSeconds(0);
      setAudioTranscript('');
      setActiveAnalysis(null);

      // Acquire mic stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Initialize AudioContext & Analyser for Waveform
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Start waveform rendering
      drawWaveform();

      // Setup MediaRecorder
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        setRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
      };

      recorder.start(250);
      setIsRecording(true);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Setup live SpeechRecognition for transcript
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'az-AZ';

          let finalTranscript = '';
          rec.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                finalTranscript += ' ' + event.results[i][0].transcript;
              } else {
                interim += event.results[i][0].transcript;
              }
            }
            const combined = (finalTranscript + ' ' + interim).trim();
            if (combined) {
              setAudioTranscript(combined);
            }
          };

          rec.onerror = () => {};
          rec.start();
          speechRecognitionRef.current = rec;
        } catch (recErr) {
          console.warn('SpeechRecognition init error:', recErr);
        }
      }

      showToast('Mikrofon aktivdir. Zəhmət olmasa cavabınızı danışın...', 'info');
    } catch (err: any) {
      console.error('Mic access error:', err);
      showToast('Mikrofona giriş rədd edildi və ya cihaz tapılmadı. Brauzer icazələrini yoxlayın.', 'error');
      setIsRecording(false);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRecording(false);
    showToast('Səs yazısı uğurla qeydə alındı! İndi AI Sentiment analizini başladın.', 'success');
  };

  // Run AI Sentiment Analysis
  const handleAnalyzeSentiment = async () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    if (!audioTranscript.trim() && !recordedAudioBlob) {
      showToast('Zəhmət olmasa əvvəlcə mikrofondan istifadə edərək cavabınızı səsləndirin.', 'error');
      return;
    }

    setIsAnalyzingSentiment(true);
    try {
      const res = await evaluatePracticeSentiment({
        question: currentQ.question,
        candidateAnswer: audioTranscript.trim() || 'Namizəd sualı şifahi cavablandırdı.',
        transcript: audioTranscript.trim(),
        vacancyTitle: selectedRoleTitle,
        companyName: selectedCompany,
        category: currentQ.category,
        audioDurationSeconds: recordingSeconds || 60,
      });

      if (res.success && res.result) {
        setActiveAnalysis(res.result);

        // Save into session results
        const sessionItem: PracticeInterviewSessionItem = {
          id: `item-${Date.now()}`,
          questionId: currentQ.id || `q-${currentQuestionIndex + 1}`,
          question: currentQ.question,
          category: currentQ.category,
          roleTitle: selectedRoleTitle,
          companyName: selectedCompany,
          audioBlobUrl: recordedAudioUrl || undefined,
          audioDurationSeconds: recordingSeconds,
          transcript: audioTranscript.trim(),
          sentimentResult: res.result,
          completedAt: new Date().toISOString(),
        };

        setSessionResults((prev) => ({
          ...prev,
          [currentQuestionIndex]: sessionItem,
        }));

        savePracticeSessionToStorage(sessionItem);

        showToast('AI Sentiment Analizi və Nitq Dinamikası uğurla tamamlandı!', 'success');
      } else {
        showToast(res.error || 'Sentiment analizi zamanı xəta baş verdi', 'error');
      }
    } catch {
      showToast('Şəbəkə xətası baş verdi', 'error');
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  // Switch Question
  const handleSelectQuestion = (idx: number) => {
    if (isRecording) {
      stopRecording();
    }
    setCurrentQuestionIndex(idx);
    setRecordingSeconds(0);
    const existing = sessionResults[idx];
    if (existing) {
      setAudioTranscript(existing.transcript);
      setRecordedAudioUrl(existing.audioBlobUrl || null);
      setActiveAnalysis(existing.sentimentResult || null);
    } else {
      setAudioTranscript('');
      setRecordedAudioUrl(null);
      setActiveAnalysis(null);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  // Format timer into mm:ss
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(sessionResults).length;
  const overallAvgScore =
    answeredCount > 0
      ? Math.round(
          Object.values(sessionResults).reduce(
            (acc, curr) => acc + (curr.sentimentResult?.overallSentimentScore || 75),
            0
          ) / answeredCount
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all transform animate-in fade-in slide-in-from-bottom-3 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
              : toast.type === 'error'
              ? 'bg-rose-50 text-rose-950 border-rose-300'
              : 'bg-indigo-50 text-indigo-950 border-indigo-300'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Header & Role Selector */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 shadow-2xs">
              <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Səsli Müsahibə Məşqi & AI Sentiment Analizi</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-indigo-500 text-white">
                Live Speech
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Mikrofonla Müsahibə Məşqi Edin, AI Emosional Ton və Çıxışınızı Analiz Etsin
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real müsahibə suallarını səsləndirin. Süni intellekt danışıq tonunuzu, özünüzə inamı (confidence),
              nitq sürətini (WPM), parazit sözləri və STAR metoduna uyğunluğu dərhal qiymətləndirsin.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex sm:flex-col items-center justify-between sm:justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[170px] shrink-0 text-center">
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
              Ümumi Sentiment Balı
            </span>
            <div className="text-3xl sm:text-4xl font-black text-amber-300 my-1">
              {overallAvgScore > 0 ? `${overallAvgScore}` : '—'}
              <span className="text-sm font-semibold text-white/80"> / 100</span>
            </div>
            <span className="text-[11px] text-emerald-300 font-semibold">
              {answeredCount > 0 ? `${answeredCount} sual tamamlandı` : 'Məşqə başlayın'}
            </span>
          </div>
        </div>

        {/* Role & Vacancy Selector Toolbar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-indigo-200 font-bold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Məşq Vəzifəsi:
            </span>
            <select
              value={selectedRoleTitle}
              onChange={(e) => setSelectedRoleTitle(e.target.value)}
              className="bg-slate-800/90 text-white font-medium border border-white/20 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer text-xs"
            >
              <optgroup label="✨ Populyar Vəzifə Presetləri">
                {ROLE_PRESETS.map((p) => (
                  <option key={p.id} value={p.title}>
                    {p.title} ({p.category})
                  </option>
                ))}
              </optgroup>
              {vacancies.length > 0 && (
                <optgroup label="🏢 Platformadakı Canlı Vakansiyalar">
                  {vacancies.slice(0, 15).map((v) => (
                    <option key={v.id} value={v.title}>
                      {v.title} — {v.companyName}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            <button
              onClick={loadQuestions}
              disabled={isLoadingQuestions}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15"
              title="Yeni suallar yarat"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuestions ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-indigo-200 text-[11px]">
            <span>Şirkət Konteksti:</span>
            <span className="font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
              {selectedCompany}
            </span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Navigator & Recording Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Stepper Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                Müsahibə Sualları ({questions.length})
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Sual {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {questions.map((q, idx) => {
                const isSelected = currentQuestionIndex === idx;
                const completed = sessionResults[idx];
                const score = completed?.sentimentResult?.overallSentimentScore;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuestion(idx)}
                    className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : completed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>Sual {idx + 1}</span>
                      {completed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    </div>
                    {score !== undefined && (
                      <span className={`text-[9px] font-black px-1.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-200/80 text-emerald-900'}`}>
                        {score} bal
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Card */}
          {currentQ && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {currentQ.category}
                  </span>
                  {currentQ.difficulty && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Səviyyə: {currentQ.difficulty}
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  Tövsiyə müddət: <strong>60-90 saniyə</strong>
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                "{currentQ.question}"
              </h2>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>İşəgötürənin məqsədi:</span>
                </div>
                <p className="text-[11px] leading-relaxed pl-5 text-slate-600">{currentQ.whyAsked}</p>
              </div>
            </div>
          )}

          {/* Interactive Microphone & Waveform Studio */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${isRecording ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isRecording ? 'Danışığınız qeydə alınır...' : 'Canlı Səsli Cavablandırma Studiyası'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRecording ? 'Mikrofona aydın və təmkinlə danışın' : 'Mikrofonu aktivləşdirərək cavabınızı səsləndirin'}
                  </p>
                </div>
              </div>

              {/* Live Timer Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold bg-slate-50 border-slate-200 text-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatTimer(recordingSeconds)}</span>
                {recordingSeconds >= 45 && recordingSeconds <= 120 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="İdeal müddət"></span>
                )}
                {recordingSeconds > 120 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" title="Bir qədər uzundur"></span>
                )}
              </div>
            </div>

            {/* Live Waveform Canvas */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-950 p-4 overflow-hidden flex flex-col items-center justify-center min-h-[110px]">
              <canvas
                ref={canvasRef}
                width={560}
                height={90}
                className="w-full h-[90px] block"
              />

              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-rose-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>CANLI YAZILIR (REC)</span>
                </div>
              )}
            </div>

            {/* Recording Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Mic className="w-4 h-4 text-amber-300" />
                  <span>Mikrofonu Başlat & Cavabla</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 animate-pulse"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Yazmanı Tamamla ({formatTimer(recordingSeconds)})</span>
                </button>
              )}

              {/* Recorded Audio Playback Bar */}
              {recordedAudioUrl && !isRecording && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <audio
                    ref={audioPlayerRef}
                    src={recordedAudioUrl}
                    onPlay={() => setIsPlayingAudio(true)}
                    onPause={() => setIsPlayingAudio(false)}
                    onEnded={() => setIsPlayingAudio(false)}
                    className="hidden"
                  />
                  <button
                    onClick={() => {
                      if (!audioPlayerRef.current) return;
                      if (isPlayingAudio) audioPlayerRef.current.pause();
                      else audioPlayerRef.current.play();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingAudio ? 'Dayandır' : 'Səsimi Dinlə'}</span>
                  </button>

                  <a
                    href={recordedAudioUrl}
                    download={`jobia-practice-${currentQuestionIndex + 1}.webm`}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                    title="Audio faylı yüklə (.webm)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={startRecording}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                    title="Yenidən səsləndir"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Real-Time Transcript Textarea */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Səsdən Çıxarılmış Transkript (Nitq mətni):</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {audioTranscript.trim().split(/\s+/).filter(Boolean).length} söz
                </span>
              </div>

              <textarea
                rows={4}
                value={audioTranscript}
                onChange={(e) => setAudioTranscript(e.target.value)}
                placeholder="Mikrofona danışdıqca nitqiniz avtomatik olaraq bura yazılacaq. Ehtiyac olduqda mətni klaviatura ilə redaktə edə bilərsiniz..."
                className="w-full p-3.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all leading-relaxed placeholder-slate-400"
              />
            </div>

            {/* Trigger Sentiment Analysis Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 italic">
                * Danışıq tonu, WPM tempi, parazit sözlər və inam dərəcəsi təhlil ediləcək.
              </span>

              <button
                onClick={handleAnalyzeSentiment}
                disabled={isAnalyzingSentiment || (!audioTranscript.trim() && !recordedAudioBlob)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzingSentiment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI Sentiment Analizi Aparılır...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>AI Sentiment Analizi Al</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Sentiment Report & Delivery Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {!activeAnalysis ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                <Activity className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  AI Sentiment Analizi Gözlənilir
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Sol tərəfdəki mikrofon vasitəsilə suala şifahi cavab verin və "AI Sentiment Analizi Al"
                  düyməsinə klikləyin. Səs tonunuzun inamı, pozitivliyi, sürəti və STAR analizi burada əks olunacaq.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-[11px] space-y-2 text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sistem Nələri Yoxlayır?</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>✓ Özünə inam & Qətiyyət</div>
                  <div>✓ Danışıq sürəti (WPM)</div>
                  <div>✓ Pozitiv enerji & Həvəs</div>
                  <div>✓ Parazit sözlər ("ııı", "şey")</div>
                  <div>✓ Aydınlıq və diksiya</div>
                  <div>✓ STAR nəticə faktları</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
              {/* Overall Sentiment Score Hero */}
              <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                      Sentiment Dərəcəsi
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {activeAnalysis.primarySentiment}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{activeAnalysis.secondarySentiment}</p>
                  </div>

                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-xl border shadow-xs ${
                      activeAnalysis.overallSentimentScore >= 85
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : activeAnalysis.overallSentimentScore >= 70
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    <span>{activeAnalysis.overallSentimentScore}</span>
                    <span className="text-[9px] font-bold opacity-70 uppercase">/ 100</span>
                  </div>
                </div>

                {/* 5 Core Sentiment & Delivery Metrics */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    5 Əsas Çatdırılma və Emosional Metrik:
                  </span>

                  {/* 1. Confidence */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <span>🎯 Özünə İnam & Qətiyyət:</span>
                      </span>
                      <span className="font-bold text-indigo-700">{activeAnalysis.metrics.confidence}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700"
                        style={{ width: `${activeAnalysis.metrics.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* 2. Positivity */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <span>🌟 Pozitivlik & Həvəs:</span>
                      </span>
                      <span className="font-bold text-emerald-700">{activeAnalysis.metrics.positivity}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${activeAnalysis.metrics.positivity}%` }}
                      />
                    </div>
                  </div>

                  {/* 3. Clarity */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <span>🔍 Aydınlıq & Diksiya:</span>
                      </span>
                      <span className="font-bold text-blue-700">{activeAnalysis.metrics.clarity}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${activeAnalysis.metrics.clarity}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. Composure */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <span>🧘 Təmkin & Soyuqqanlılıq:</span>
                      </span>
                      <span className="font-bold text-purple-700">{activeAnalysis.metrics.composure}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${activeAnalysis.metrics.composure}%` }}
                      />
                    </div>
                  </div>

                  {/* 5. Professionalism */}
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <span>💼 Peşəkarlıq & İşgüzar Etika:</span>
                      </span>
                      <span className="font-bold text-slate-800">{activeAnalysis.metrics.professionalism}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-slate-800 rounded-full transition-all duration-700"
                        style={{ width: `${activeAnalysis.metrics.professionalism}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Speech Dynamics & Filler Words Card */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Danışıq Sürəti</span>
                    <div className="font-black text-slate-900 text-sm">
                      {activeAnalysis.speechDynamics.wordsPerMinute} WPM
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                      {activeAnalysis.speechDynamics.paceFeedback}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Parazit Sözlər</span>
                    <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{activeAnalysis.speechDynamics.fillerWordsCount} ədəd</span>
                      {activeAnalysis.speechDynamics.fillerWordsCount <= 1 ? (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.2 rounded">Təmiz</span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded">Tənzimlə</span>
                      )}
                    </div>
                    {activeAnalysis.speechDynamics.detectedFillerWords.length > 0 ? (
                      <div className="text-[10px] text-slate-500 mt-1 truncate" title={activeAnalysis.speechDynamics.detectedFillerWords.map(f => `${f.word} (${f.count})`).join(', ')}>
                        {activeAnalysis.speechDynamics.detectedFillerWords.map(f => f.word).join(', ')}
                      </div>
                    ) : (
                      <p className="text-[10px] text-emerald-600 mt-0.5">Parazit söz aşkar edilmədi</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Growth Areas */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                {/* Strengths */}
                <div className="space-y-1.5">
                  <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Güclü Danışıq Xüsusiyyətləriniz:</span>
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 pl-5 list-disc">
                    {activeAnalysis.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Growth areas */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Təkmilləşdirilməli Məqamlar:</span>
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 pl-5 list-disc">
                    {activeAnalysis.growthAreas.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                {/* Voice & Delivery Tips */}
                {activeAnalysis.voiceAndDeliveryTips.length > 0 && (
                  <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                    <span className="font-bold block flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Səs & Bədən Dili Tövsiyələri:</span>
                    </span>
                    <ul className="text-[11px] text-indigo-800 space-y-1 pl-4 list-disc">
                      {activeAnalysis.voiceAndDeliveryTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Polished Executive Answer Version */}
              {activeAnalysis.polishedExecutiveAnswer && (
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>AI Tərəfindən Təkmilləşdirilmiş İdeal Səsli Nitq Versiyası:</span>
                    </span>
                    <button
                      onClick={() => handleCopy(activeAnalysis.polishedExecutiveAnswer, 'exec-ans')}
                      className="p-1 text-slate-300 hover:text-white rounded transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'exec-ans' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'exec-ans' ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic font-sans pr-2">
                    "{activeAnalysis.polishedExecutiveAnswer}"
                  </p>
                </div>
              )}

              {/* Next Question Navigation Button */}
              {currentQuestionIndex < questions.length - 1 && (
                <button
                  onClick={() => handleSelectQuestion(currentQuestionIndex + 1)}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Növbəti Suala Keç ({currentQuestionIndex + 2})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Modal Bottom Logo */}
      <ModalBottomLogo
        tagline="Jobia.az Səsli Müsahibə Məşqi və AI Sentiment Analizatoru"
        variant="slate"
        size="xs"
      />
    </div>
  );
};
