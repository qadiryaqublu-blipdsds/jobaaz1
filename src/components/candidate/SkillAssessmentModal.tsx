import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  X, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  RotateCcw,
  Check,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';
import { ModalPortal } from '../common/ModalPortal';

interface SkillAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkillVerified?: (skillName: string, score: number) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizTopic {
  id: string;
  name: string;
  badge: string;
  questions: Question[];
}

const QUIZ_TOPICS: QuizTopic[] = [
  {
    id: 'frontend',
    name: 'Frontend & React Mühəndisliyi',
    badge: 'Təsdiqlənmiş React Developer',
    questions: [
      {
        id: 1,
        question: 'React-də useEffect hook-u boş asılılıq massivi ilə (`[]`) nə vaxt icra olunur?',
        options: [
          'Hər dəfə komponent yenidən render olanda',
          'Yalnız komponent ilk dəfə mount (quraşdırıldıqda)',
          'Yalnız state dəyişəndə',
          'Heç vaxt icra olunmur'
        ],
        correctIndex: 1,
        explanation: 'Boş massiv [] hook-un yalnız ilk renderdən sonra (mount) bir dəfə işə düşməsini təmin edir.'
      },
      {
        id: 2,
        question: 'Virtual DOM-un əsas üstünlüyü nədir?',
        options: [
          'Brauzerin birbaşa real DOM əməliyyatlarını minimuma endirərək render performansını artırmaq',
          'Server tərəfində SQL sorğularını sürətləndirmək',
          'CSS fayllarının həcmini azaltmaq',
          'Təhlükəsizlik parollarını şifrələmək'
        ],
        correctIndex: 0,
        explanation: 'Virtual DOM yaddaşda saxlanılan diff alqoritmi ilə yalnız dəyişən qovşaqları real DOM-a tətbiq edir.'
      },
      {
        id: 3,
        question: 'TypeScript-də "interface" və "type" arasındakı fərq nədir?',
        options: [
          'Heç bir fərq yoxdur',
          'Interface sonradan genişləndirilə (declaration merging) bilər, type isə unikal tip tərifidir',
          'Interface yalnız rəqəmlər üçündür',
          'Type yalnız funksiyalarda işləyir'
        ],
        correctIndex: 1,
        explanation: 'Interface-lər eyni adda təkrar elan edildikdə avtomatik birləşir (merging), type isə sabitlənmiş tərifdir.'
      }
    ]
  },
  {
    id: 'excel_finance',
    name: 'Maliyyə & Excel Analitikası',
    badge: 'Təsdiqlənmiş Excel Eksperti',
    questions: [
      {
        id: 1,
        question: 'MS Excel-də XLOOKUP (XQARŞILIQ) funksiyasının VLOOKUP-a nisbətən əsas üstünlüyü nədir?',
        options: [
          'Həm sola, həm də sağa axtarış apara bilməsi və sütun indeks nömrəsi tələb etməməsi',
          'Yalnız böyük hərflərlə işləməsi',
          'Faylın həcmini 50% kiçiltməsi',
          'İnternetsiz işləyə bilməməsi'
        ],
        correctIndex: 0,
        explanation: 'XLOOKUP axtarış və qaytarma diapazonunu sərbəst seçməyə imkan verir və sola axtarış apara bilir.'
      },
      {
        id: 2,
        question: 'Pivot Table (Yekun Cədvəl) nə üçün istifadə olunur?',
        options: [
          'Böyük məlumat massivlərini tez və dinamik şəkildə qruplaşdırmaq və yekun hesabat hazırlamaq üçün',
          'Qrafik dizayn eskizləri çəkmək üçün',
          'Parolları bərpa etmək üçün',
          'Mətnləri Azərbaycan dilinə tərcümə etmək üçün'
        ],
        correctIndex: 0,
        explanation: 'Pivot Table sətir, sütun və qiymət filtirləri ilə anında analitik yekun tərtib edir.'
      }
    ]
  },
  {
    id: 'english_business',
    name: 'İşgüzar İngilis Dili (Business English)',
    badge: 'Təsdiqlənmiş İşgüzar İngilis Dili',
    questions: [
      {
        id: 1,
        question: 'Rəsmi korporativ e-poçtda "Cavabınızı səbirsizliklə gözləyirəm" cümləsinin ən düzgün forması hansıdır?',
        options: [
          'I am looking forward to hearing from you.',
          'I look forward to hear you.',
          'I wait your answer quickly.',
          'Please answer me soonest.'
        ],
        correctIndex: 0,
        explanation: '"look forward to" ifadəsindən sonra fel -ing şəkilçisi qəbul edir: hearing from you.'
      }
    ]
  }
];

export const SkillAssessmentModal: React.FC<SkillAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSkillVerified,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(QUIZ_TOPICS[0].id);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeTopic = QUIZ_TOPICS.find(t => t.id === selectedTopicId) || QUIZ_TOPICS[0];
  const currentQuestion = activeTopic.questions[currentQuestionIdx];

  const handleSelectAnswer = (optionIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: optionIdx }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < activeTopic.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizCompleted(true);
      // Calculate score
      let correct = 0;
      activeTopic.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) correct++;
      });
      const scorePct = Math.round((correct / activeTopic.questions.length) * 100);
      if (scorePct >= 70 && onSkillVerified) {
        onSkillVerified(activeTopic.badge, scorePct);
      }
    }
  };

  const handleReset = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
  };

  // Score stats
  let correctCount = 0;
  activeTopic.questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) correctCount++;
  });
  const scorePercent = Math.round((correctCount / activeTopic.questions.length) * 100);
  const isPassed = scorePercent >= 70;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scale-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shrink-0 shadow-xs">
                <BrainCircuit className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Sürətli Bacarıq Yoxlanışı & Sertifikat</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Testi keçərək profilinizə rəsmi təsdiqlənmiş nişan qazanın.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4 text-xs">
            {/* Topic Switcher Pills if not yet in middle of quiz */}
            {!quizCompleted && currentQuestionIdx === 0 && (
              <div className="space-y-1.5 pb-2 border-b border-slate-100">
                <label className="font-bold text-slate-700 block text-xs">Yoxlanılacaq İstiqamət:</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUIZ_TOPICS.map(topic => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        handleReset();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                        selectedTopicId === topic.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {topic.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!quizCompleted ? (
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                  <span>Sualların gedişatı:</span>
                  <span>{currentQuestionIdx + 1} / {activeTopic.questions.length}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300" 
                    style={{ width: `${((currentQuestionIdx + 1) / activeTopic.questions.length) * 100}%` }}
                  />
                </div>

                {/* Question */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">
                    Sual {currentQuestionIdx + 1}
                  </span>
                  <p className="font-bold text-slate-900 text-sm leading-snug">
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectAnswer(idx)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span>{option}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Ləğv et
                  </button>

                  <button
                    type="button"
                    disabled={selectedAnswers[currentQuestionIdx] === undefined}
                    onClick={handleNext}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>{currentQuestionIdx === activeTopic.questions.length - 1 ? 'Nəticəni Gör' : 'Növbəti Sual'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Quiz Result Screen */
              <div className="text-center py-4 space-y-4 animate-scale-up">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center font-bold text-2xl shadow-lg border ${
                  isPassed 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-300' 
                    : 'bg-amber-50 text-amber-600 border-amber-300'
                }`}>
                  {isPassed ? <Award className="w-8 h-8 text-emerald-600" /> : <RotateCcw className="w-8 h-8 text-amber-600" />}
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {isPassed ? 'Təbrik edirik! Uğurla Keçdiniz' : 'Daha çox çalışmağa ehtiyac var'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Nəticəniz: <strong className="text-slate-800">{correctCount} / {activeTopic.questions.length} düzgün ({scorePercent}%)</strong>
                  </p>
                </div>

                {isPassed ? (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1.5 max-w-sm mx-auto">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{activeTopic.badge}</span>
                    </span>
                    <p className="text-[11px] text-emerald-800">
                      Bu rəsmi təsdiqlənmiş nişan profilinizə və CV-nizə əlavə edildi. İşəgötürənlər üçün etibar reytinqiniz artdı!
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Təsdiq nişanı qazanmaq üçün minimum 70% bal tələb olunur. İstənilən vaxt yenidən cəhd edə bilərsiniz.
                  </p>
                )}

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Yenidən Sına
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Tamamlandı
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
