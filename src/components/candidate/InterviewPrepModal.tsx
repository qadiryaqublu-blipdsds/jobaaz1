import React, { useState, useEffect, useRef } from 'react';
import { Vacancy, InterviewQuestion, CandidateAnswerEvaluation } from '../../types';
import {
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  MessageSquareQuote,
  RefreshCw,
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  Send,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  FileText,
  BarChart2,
  Clock,
  Target,
  Search,
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { safeFetchJson } from '../../utils/apiHelper';

interface InterviewPrepModalProps {
  vacancy: Vacancy | null;
  onClose: () => void;
  onOpenVoicePractice?: (vacancy: Vacancy) => void;
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({
  vacancy,
  onClose,
  onOpenVoicePractice,
}) => {
  if (!vacancy) return null;

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'questions' | 'simulator' | 'report'>('questions');

  // Loading & Data states
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Hamısı');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Simulator states
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<Record<number, CandidateAnswerEvaluation>>({});

  // Practice Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviewData();
  }, [vacancy]);

  // Practice Stopwatch effect
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'az-AZ';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setUserAnswer((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e?.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition init note:', err);
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Brauzeriniz səslə daxiletməni dəstəkləmir və ya mikrofon icazəsi tələb olunur. Zəhmət olmasa cavabınızı klaviatura ilə daxil edin.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        if (!isTimerRunning) {
          setIsTimerRunning(true);
        }
      } catch (err) {
        console.warn('Error starting voice recognition:', err);
        setIsRecording(false);
      }
    }
  };

  const fetchInterviewData = async () => {
    setLoading(true);
    try {
      const res = await safeFetchJson<any>('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyTitle: vacancy.title,
          companyName: vacancy.companyName,
          requirements: vacancy.requirements,
        }),
      });
      if (res.ok && res.data) {
        setQuestions(res.data.questions || []);
        setTips(res.data.tips || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('Zəhmət olmasa qiymətləndirmə üçün suala cavabınızı yazın və ya səslə daxil edin.');
      return;
    }

    const currentQuestion = questions[selectedQuestionIndex];
    if (!currentQuestion) return;

    setIsEvaluating(true);
    setIsTimerRunning(false);

    try {
      const res = await safeFetchJson<any>('/api/ai/evaluate-interview-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyTitle: vacancy.title,
          companyName: vacancy.companyName,
          requirements: vacancy.requirements,
          question: currentQuestion.question,
          category: currentQuestion.category,
          userAnswer: userAnswer.trim(),
          answerDurationSeconds: timerSeconds,
        }),
      });

      if (res.ok && res.data && res.data.success) {
        const evalData: CandidateAnswerEvaluation = {
          questionId: currentQuestion.id || `q-${selectedQuestionIndex + 1}`,
          question: currentQuestion.question,
          category: currentQuestion.category,
          userAnswer: userAnswer.trim(),
          score: res.data.score || 75,
          grade: res.data.grade || 'Yaxşı',
          feedback: res.data.feedback || '',
          strengths: res.data.strengths || [],
          improvements: res.data.improvements || [],
          starBreakdown: res.data.starBreakdown,
          refinedAnswerAz: res.data.refinedAnswerAz || '',
          keyAdvice: res.data.keyAdvice || '',
          evaluatedAt: new Date().toISOString(),
        };

        setEvaluations((prev) => ({
          ...prev,
          [selectedQuestionIndex]: evalData,
        }));
      } else {
        alert(res.error || 'Cavab qiymətləndirilərkən xəta baş verdi');
      }
    } catch (err) {
      console.error('Answer evaluation error:', err);
      alert('Şəbəkə xətası baş verdi.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleJumpToSimulator = (index: number) => {
    setSelectedQuestionIndex(index);
    setActiveTab('simulator');
    setTimerSeconds(0);
    setIsTimerRunning(false);
    const existing = evaluations[index];
    if (existing) {
      setUserAnswer(existing.userAnswer);
    } else {
      setUserAnswer('');
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesCat = activeCategory === 'Hamısı' || q.category === activeCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.whyAsked.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Calculate statistics across completed simulator answers
  const evaluatedCount = Object.keys(evaluations).length;
  const avgScore =
    evaluatedCount > 0
      ? Math.round(
          Object.values(evaluations).reduce((acc, curr) => acc + curr.score, 0) / evaluatedCount
        )
      : 0;

  const currentQ = questions[selectedQuestionIndex];
  const currentEvaluation = evaluations[selectedQuestionIndex];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 text-blue-800 border border-blue-200 text-[11px] font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Müsahibə Hazırlığı & Canlı Simulyator</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>{vacancy.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-semibold font-mono">
                {vacancy.companyName}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Vakansiya tələblərinə uyğunlaşdırılmış real suallar, cavabların AI analizi və STAR metodologiyası üzrə fərdi qiymətləndirmə
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-5 bg-white border-b border-slate-200 flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Suallar & Bələdçi</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'questions' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {questions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>2. Canlı Müsahibə & AI Qiymətləndirmə</span>
              {evaluatedCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'simulator' ? 'bg-indigo-700 text-white' : 'bg-emerald-600 text-white'}`}>
                  {evaluatedCount}/{questions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>3. Nəticə Raporu</span>
              {avgScore > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'report' ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'}`}>
                  {avgScore} bal
                </span>
              )}
            </button>

            {onOpenVoicePractice && (
              <button
                onClick={() => {
                  onClose();
                  onOpenVoicePractice(vacancy);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs ml-auto"
                title="Mikrofonla cavabları səsləndirərək AI emosional və ritm analizini yoxlayın"
              >
                <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Mikrofonla Məşq & AI Sentiment</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">Yeni</span>
              </button>
            )}
          </div>

          {/* Quick Stats Indicator */}
          {evaluatedCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Qiymətləndirildi:</span>
              <span className="font-bold text-slate-800">{evaluatedCount} / {questions.length}</span>
              <span className="text-slate-300">•</span>
              <span>Orta Bal:</span>
              <span className="font-bold text-emerald-600">{avgScore} / 100</span>
            </div>
          )}
        </div>

        {/* Tab 1: Questions & Guide */}
        {activeTab === 'questions' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="font-bold text-slate-800 text-sm">
                  Süni İntellekt Vakansiya Üzrə Müsahibə Bələdçisi Hazırlayır...
                </p>
                <p className="text-slate-400 text-xs">
                  {vacancy.title} vəzifəsinin tələbləri, texniki meyarlar və STAR modeli analiz edilir
                </p>
              </div>
            ) : (
              <>
                {/* General Tips */}
                {tips.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Uğurlu Müsahibə Üçün 4 Əsas Qayda</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                      {tips.map((t, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="font-bold text-blue-600">•</span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['Hamısı', 'Texniki', 'Davranış və Situasiya', 'Şirkət Uyğunluğu', 'Problem Həll Etmə'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Suallar üzrə axtar..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Questions Accordion */}
                <div className="space-y-3">
                  {filteredQuestions.map((q, idx) => {
                    const isOpen = expandedIndex === idx;
                    const evalResult = evaluations[idx];

                    return (
                      <div
                        key={idx}
                        className={`border rounded-xl overflow-hidden bg-white shadow-xs transition-all ${
                          evalResult ? 'border-emerald-300' : 'border-slate-200'
                        }`}
                      >
                        {/* Question bar */}
                        <div className="w-full p-4 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors">
                          <button
                            onClick={() => setExpandedIndex(isOpen ? null : idx)}
                            className="flex-1 text-left space-y-1.5 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {q.category}
                              </span>
                              {q.difficulty && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  q.difficulty === 'Mütəxəssis'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : q.difficulty === 'Orta'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {q.difficulty}
                                </span>
                              )}
                              {evalResult && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Bal: {evalResult.score}/100 ({evalResult.grade})</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {idx + 1}. {q.question}
                            </h4>
                          </button>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleJumpToSimulator(idx)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200"
                              title="Bu sualı canlı olaraq cavablandır və AI ilə qiymətləndir"
                            >
                              <Mic className="w-3 h-3 text-indigo-600" />
                              <span>{evalResult ? 'Yenidən Sına' : 'Canlı Sına'}</span>
                            </button>
                            <button
                              onClick={() => setExpandedIndex(isOpen ? null : idx)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isOpen && (
                          <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-3 animate-fade-in">
                            {/* Key Criteria */}
                            {q.keyCriteria && q.keyCriteria.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Əsas meyarlar:</span>
                                {q.keyCriteria.map((c, i) => (
                                  <span key={i} className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                                    ✓ {c}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Why asked */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                              <span className="font-bold text-slate-800 text-[11px] block mb-0.5">
                                🧐 İşəgötürən bu sualla nəyi yoxlayır?
                              </span>
                              <p className="text-slate-600 leading-relaxed text-[11px]">{q.whyAsked}</p>
                            </div>

                            {/* Suggested Answer Tip */}
                            <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200">
                              <span className="font-bold text-blue-900 text-[11px] block mb-0.5">
                                💡 Cavablandırma Taktikası (STAR Metodu):
                              </span>
                              <p className="text-blue-800 leading-relaxed text-[11px]">{q.suggestedAnswerTip}</p>
                            </div>

                            {/* Sample Azerbaijani Answer */}
                            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-1.5 relative group">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                                  <MessageSquareQuote className="w-4 h-4" />
                                  <span>Nümunəvi Güclü Cavab (Azərbaycan dilində):</span>
                                </div>
                                <button
                                  onClick={() => handleCopyText(q.sampleAnswerAz, `sample-${idx}`)}
                                  className="text-slate-400 hover:text-white p-1 rounded transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
                                  title="Mətni kopyala"
                                >
                                  {copiedKey === `sample-${idx}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                  <span>{copiedKey === `sample-${idx}` ? 'Kopyalandı' : 'Kopyala'}</span>
                                </button>
                              </div>
                              <p className="text-slate-300 leading-relaxed text-[11px] italic font-sans pr-2">
                                "{q.sampleAnswerAz}"
                              </p>
                            </div>

                            {/* Action to Jump directly to Simulator */}
                            <div className="pt-1 flex items-center justify-end">
                              <button
                                onClick={() => handleJumpToSimulator(idx)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Bu Sualı Canlı Cavabla və AI ilə Qiymətləndir</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Interactive Interview Simulator & Answer Evaluation */}
        {activeTab === 'simulator' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs">
            {questions.length === 0 ? (
              <div className="py-16 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="font-semibold text-slate-700">Müsahibə sualları hazırlanır...</p>
              </div>
            ) : (
              <>
                {/* Step / Question Selector */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                    <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Sual:</span>
                    {questions.map((q, idx) => {
                      const isCompleted = Boolean(evaluations[idx]);
                      const isSelected = selectedQuestionIndex === idx;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedQuestionIndex(idx);
                            const prevAns = evaluations[idx];
                            if (prevAns) {
                              setUserAnswer(prevAns.userAnswer);
                            } else {
                              setUserAnswer('');
                            }
                            setTimerSeconds(0);
                            setIsTimerRunning(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{idx + 1}</span>
                          {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => {
                        if (selectedQuestionIndex > 0) {
                          handleJumpToSimulator(selectedQuestionIndex - 1);
                        }
                      }}
                      disabled={selectedQuestionIndex === 0}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer text-slate-600"
                      title="Əvvəlki sual"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-slate-600">
                      {selectedQuestionIndex + 1} / {questions.length}
                    </span>
                    <button
                      onClick={() => {
                        if (selectedQuestionIndex < questions.length - 1) {
                          handleJumpToSimulator(selectedQuestionIndex + 1);
                        }
                      }}
                      disabled={selectedQuestionIndex === questions.length - 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer text-slate-600"
                      title="Növbəti sual"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Active Question Banner */}
                {currentQ && (
                  <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {currentQ.category}
                        </span>
                        {currentQ.difficulty && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            Səviyyə: {currentQ.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Practice Stopwatch */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {formatTimer(timerSeconds)}
                        </span>
                        <button
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className="p-1 hover:text-blue-600 cursor-pointer text-slate-500"
                          title={isTimerRunning ? 'Dayandır' : 'Taymeri başlat'}
                        >
                          {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            setIsTimerRunning(false);
                            setTimerSeconds(0);
                          }}
                          className="p-1 hover:text-rose-600 cursor-pointer text-slate-400"
                          title="Sıfırla"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      "{currentQ.question}"
                    </h3>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-800">
                        🎯 Məsləhət (STAR Metodu): {currentQ.suggestedAnswerTip}
                      </div>
                      <div className="text-slate-500">
                        İdeal cavab müddəti: <strong>1 - 2 dəqiqə</strong>. Konkret situasiya, qarşıdakı tapşırıq, atdığınız addım və əldə etdiyiniz ölçülə bilən nəticəni qeyd edin.
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidate Answer Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Sizin Cavabınız</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        ({userAnswer.trim().split(/\s+/).filter(Boolean).length} söz)
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      {/* Voice Recording Button */}
                      <button
                        onClick={toggleVoiceRecording}
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isRecording
                            ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title={isRecording ? 'Yazmanı dayandır' : 'Mikrofonla səslə cavabla'}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Dinləyirəm... (Dayandır)</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5 text-blue-600" />
                            <span>Səslə Cavabla (Mikrofon)</span>
                          </>
                        )}
                      </button>

                      {/* Quick Sample Paste Button */}
                      {currentQ && (
                        <button
                          onClick={() => {
                            setUserAnswer(currentQ.sampleAnswerAz);
                          }}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                          title="Nümunəvi mətni cavab sahəsinə köçür və üzərində dəyişiklik et"
                        >
                          Nümunə Mətn
                        </button>
                      )}

                      {userAnswer && (
                        <button
                          onClick={() => setUserAnswer('')}
                          className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          Təmizlə
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={`"${vacancy.title}" vəzifəsi üçün bu suala necə cavab verərdiniz? Öz təcrübənizi, real situasiyanı və əldə etdiyiniz nəticəni qeyd edin və ya yuxarıdakı "Səslə Cavabla" düyməsinə klikləyərək danışın...`}
                    className="w-full p-4 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all leading-relaxed placeholder-slate-400"
                  />

                  {/* Evaluate Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 italic">
                      * Süni intellekt cavabınızı STAR metodu, vəzifə tələbləri və peşəkar standartlar üzrə təhlil edəcək.
                    </span>

                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={isEvaluating || !userAnswer.trim()}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEvaluating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI Cavabı Təhlil Edir...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Cavabımı AI ilə Qiymətləndir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Evaluation Results Card */}
                {currentEvaluation && (
                  <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-md space-y-5 animate-fade-in">
                    {/* Score & Grade Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-lg border ${
                            currentEvaluation.score >= 85
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : currentEvaluation.score >= 70
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : currentEvaluation.score >= 50
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          <span>{currentEvaluation.score}</span>
                          <span className="text-[9px] font-bold uppercase opacity-75">/ 100</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900">
                              AI Qiymətləndirmə Nəticəsi: {currentEvaluation.grade}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                currentEvaluation.score >= 85
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : currentEvaluation.score >= 70
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {currentEvaluation.score >= 85
                                ? 'Yüksək Hazırlıq'
                                : currentEvaluation.score >= 70
                                ? 'Yaxşı Nəticə'
                                : 'Təkmilləşdirilməlidir'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {currentEvaluation.feedback}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* STAR Breakdown */}
                    {currentEvaluation.starBreakdown && (
                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-indigo-600" />
                          <span>STAR Metodologiyası Üzrə Detallı Təhlil:</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="font-bold text-blue-700 block mb-0.5">
                              S - Situasiya (Situation):
                            </span>
                            <p className="text-slate-600">{currentEvaluation.starBreakdown.situation}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="font-bold text-indigo-700 block mb-0.5">
                              T - Tapşırıq (Task):
                            </span>
                            <p className="text-slate-600">{currentEvaluation.starBreakdown.task}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="font-bold text-emerald-700 block mb-0.5">
                              A - Fəaliyyət (Action):
                            </span>
                            <p className="text-slate-600">{currentEvaluation.starBreakdown.action}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <span className="font-bold text-purple-700 block mb-0.5">
                              R - Nəticə (Result):
                            </span>
                            <p className="text-slate-600">{currentEvaluation.starBreakdown.result}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Strengths */}
                      <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
                        <h5 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Güclü Tərəfləriniz:</span>
                        </h5>
                        <ul className="space-y-1.5 text-[11px] text-emerald-800">
                          {currentEvaluation.strengths.map((str, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="font-bold text-emerald-600">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 space-y-2">
                        <h5 className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>Təkmilləşdirilməli Məqamlar:</span>
                        </h5>
                        <ul className="space-y-1.5 text-[11px] text-rose-800">
                          {currentEvaluation.improvements.map((imp, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="font-bold text-rose-600">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* AI Polished / Refined Answer Version */}
                    {currentEvaluation.refinedAnswerAz && (
                      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-slate-100 p-4 rounded-xl space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                            <Sparkles className="w-4 h-4" />
                            <span>AI Tərəfindən Təkmilləşdirilmiş İdeal Cavabınız:</span>
                          </div>
                          <button
                            onClick={() => handleCopyText(currentEvaluation.refinedAnswerAz, 'refined-ans')}
                            className="text-slate-300 hover:text-white p-1 rounded transition-colors text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === 'refined-ans' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedKey === 'refined-ans' ? 'Kopyalandı' : 'Kopyala'}</span>
                          </button>
                        </div>
                        <p className="text-slate-200 leading-relaxed text-[11px] italic font-sans pr-2">
                          "{currentEvaluation.refinedAnswerAz}"
                        </p>
                      </div>
                    )}

                    {/* Key Advice */}
                    {currentEvaluation.keyAdvice && (
                      <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Qızıl Məsləhət:</strong> {currentEvaluation.keyAdvice}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Controls */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setTimerSeconds(0);
                          setIsTimerRunning(false);
                        }}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        Yenidən Cəhd Et
                      </button>

                      {selectedQuestionIndex < questions.length - 1 ? (
                        <button
                          onClick={() => handleJumpToSimulator(selectedQuestionIndex + 1)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <span>Növbəti Suala Keç ({selectedQuestionIndex + 2})</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('report')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Award className="w-4 h-4" />
                          <span>Yekun Nəticə Raporuna Bax</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 3: Performance Report & Export */}
        {activeTab === 'report' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs">
            {/* Hero Performance Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Müsahibə Hazırlığı Hesabatı</span>
                </div>
                <h3 className="text-xl font-black">
                  {vacancy.title} — {vacancy.companyName}
                </h3>
                <p className="text-xs text-indigo-100 max-w-lg">
                  {evaluatedCount === 0
                    ? 'Hələ heç bir sualı canlı simulyatorda cavablandırmamısınız. "Canlı Müsahibə" bölməsinə keçərək cavablarınızı AI ilə qiymətləndirin.'
                    : `${questions.length} sualdan ${evaluatedCount} ədədi üzrə AI dəyərləndirməsi tamamlandı.`}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 min-w-[130px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                  Ümumi Bal
                </span>
                <span className="text-3xl font-black mt-0.5">{avgScore}</span>
                <span className="text-[10px] text-amber-200 font-semibold">
                  {avgScore >= 85 ? '🌟 Əla Hazırlıq' : avgScore >= 70 ? '👍 Yaxşı Səviyyə' : avgScore > 0 ? 'Məşq Lazımdır' : '0 / 100'}
                </span>
              </div>
            </div>

            {/* Answered Questions Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                <span>Qiymətləndirilmiş Sualların Siyahısı</span>
                <button
                  onClick={() => {
                    const reportText = `JOBIA.AZ AI MÜSAHİBƏ HAZIRLIĞI HESABATI
Vakansiya: ${vacancy.title}
Şirkət: ${vacancy.companyName}
Ümumi Bal: ${avgScore} / 100
Tamamlanan Suallar: ${evaluatedCount} / ${questions.length}

${Object.entries(evaluations).map(([idx, item]) => `
-----------------------------------------
Sual ${Number(idx) + 1}: ${item.question}
Bal: ${item.score}/100 (${item.grade})
Namizədin Cavabı: ${item.userAnswer}
AI Rəyi: ${item.feedback}
Təkmilləşdirilmiş Versiya: ${item.refinedAnswerAz}
Qızıl Məsləhət: ${item.keyAdvice}
`).join('\n')}`;
                    handleCopyText(reportText, 'report-all');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'report-all' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'report-all' ? 'Hesabat Kopyalandı' : 'Bütün Hesabatı Kopyala'}</span>
                </button>
              </h4>

              {evaluatedCount === 0 ? (
                <div className="py-12 text-center bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <Mic className="w-8 h-8 text-indigo-500 mx-auto mb-2 opacity-60" />
                  <p className="font-bold text-slate-800 text-sm">Hələ ki heç bir sual cavablandırılmayıb</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Sualları cavablandırmaq və AI tərəfindən bal almaq üçün Canlı Simulyatora keçid edin.
                  </p>
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Canlı Simulyatora Başla</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(evaluations).map(([qIdx, evalItem]) => {
                    const idx = Number(qIdx);
                    return (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {evalItem.category}
                            </span>
                            <h5 className="font-bold text-slate-900 text-xs">
                              {idx + 1}. {evalItem.question}
                            </h5>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                              evalItem.score >= 85
                                ? 'bg-emerald-100 text-emerald-800'
                                : evalItem.score >= 70
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {evalItem.score} / 100 ({evalItem.grade})
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-[11px] text-slate-600">
                          <strong>Sizin Cavabınız:</strong> "{evalItem.userAnswer}"
                        </div>

                        <div className="text-[11px] text-slate-700">
                          <strong>AI Rəyi:</strong> {evalItem.feedback}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleJumpToSimulator(idx)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                          >
                            Yenidən Cavabla & Yüksəlt →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic moving Jobia Logo at bottom */}
        <ModalBottomLogo
          tagline="Jobia.az AI Müsahibə Hazırlığı və Canlı Simulyatoru"
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
