import React, { useState, useEffect } from 'react';
import { Application, Vacancy } from '../../types';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Copy, 
  Check, 
  MessageSquare, 
  Calendar, 
  Send, 
  User, 
  Loader2,
  ThumbsUp,
  BrainCircuit
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface JobiaAICandidateEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Application | null;
  vacancy?: Vacancy | null;
  onScheduleInterview?: (app: Application) => void;
  onSendOffer?: (app: Application) => void;
}

export const JobiaAICandidateEvaluatorModal: React.FC<JobiaAICandidateEvaluatorModalProps> = ({
  isOpen,
  onClose,
  applicant,
  vacancy,
  onScheduleInterview,
  onSendOffer,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Derived intelligent recommendations based on candidate CV and vacancy
  const evaluation = React.useMemo(() => {
    if (!applicant) return null;
    const score = applicant.matchScore || 75;
    const cv = applicant.cvData;
    const skills = cv?.skills || [];
    const experiences = cv?.experiences || [];

    // Synthesize structured evaluation
    const strengths = [
      experiences.length > 0
        ? `${experiences[0].position} vəzifəsində (${experiences[0].company || 'sahə'}) üzrə praktiki iş təcrübəsi.`
        : 'Müvafiq ixtisas üzrə nəzəri və baza bacarıqları mövcuddur.',
      skills.length > 0
        ? `Əsas texniki və funksional səriştələr: ${skills.slice(0, 4).map((s: any) => typeof s === 'string' ? s : s?.name || '').filter(Boolean).join(', ')}.`
        : 'Komanda ilə koordinasiyalı işləmə və tez öyrənmə potensialı.',
      score >= 70
        ? `Vakansiyanın əsas tələblərinə yüksək (${score}%) uyğunluq nümayiş etdirir.`
        : 'Vakansiyanın ilkin baza tələblərinə cavab verir, əlavə mentorluq tələb oluna bilər.',
    ];

    const gapAreas = [
      experiences.length < 2
        ? 'Böyük miqyaslı layihələrdə uzunmüddətli müstəqil qərarvermə təcrübəsi yoxlanılmalıdır.'
        : 'Komanda daxilində konfliktlərin idarə olunması və kritik təzyiq altında işləmə tərzi araşdırılmalıdır.',
      cv?.languages && cv.languages.length > 1
        ? 'İşgüzar ünsiyyət dili səviyyəsi müsahibədə təsdiqlənməlidir.'
        : 'Xarici dil biliklərinin beynəlxalq sənədləşmə üçün yetərliliyi dəqiqləşdirilməlidir.',
    ];

    const interviewQuestions = [
      {
        question: `CV-nizdə qeyd etdiyiniz "${experiences[0]?.position || applicant.vacancyTitle}" rolunda qarşılaşdığınız ən mürəkkəb problem nə idi və onu necə həll etdiniz?`,
        purpose: 'Real situasiyalarda analitik düşüncə və praktiki problem həlletmə qabiliyyətini yoxlamaq.',
      },
      {
        question: `Bizim vakansiyada tələb olunan əsas alətlərdən (${skills.slice(0, 2).join(', ') || 'əsas texnologiyalar'}) ən son hansı layihədə istifadə etmisiniz?`,
        purpose: 'Praktiki texniki səriştənin dərinliyini və aktuallığını qiymətləndirmək.',
      },
      {
        question: 'Gözlənilməz son təhvil tarixi (deadline) və prioritetlərin qəfil dəyişməsi şəraitində işinizi necə planlaşdırırsınız?',
        purpose: 'Stress altında effektivlik və çevik adaptasiya (Agility) bacarığını ölçmək.',
      },
      {
        question: 'Komanda yoldaşınızın və ya rəhbərliyin fikri ilə razılaşmadığınız zaman mövqeyinizi necə əsaslandırırsınız?',
        purpose: 'Konstruktiv kommunikasiya və peşəkar müzakirə mədəniyyətini qiymətləndirmək.',
      },
      {
        question: `Niyə məhz "${applicant.vacancyTitle}" vəzifəsi üçün şirkətimizi seçdiniz və ilk 90 gündə hansı əsas töhfəni verə bilərsiniz?`,
        purpose: 'Namizədin daxili motivasiyasını və şirkətin hədəfləri ilə uyğunluğunu aşkar etmək.',
      },
    ];

    return {
      score,
      verdict: score >= 80 ? 'Tövsiyə Olunur (Yüksək Uyğunluq)' : score >= 60 ? 'Müsahibəyə Dəvət Tövsiyə Edilir' : 'Əlavə Yoxlama Tələb Olunur',
      strengths,
      gapAreas,
      interviewQuestions,
      suggestedSalaryRange: vacancy?.minSalary && vacancy?.maxSalary
        ? `${vacancy.minSalary} - ${vacancy.maxSalary} AZN`
        : 'Bazar üzrə 1500 - 2500 AZN',
    };
  }, [applicant, vacancy]);

  if (!isOpen || !applicant || !evaluation) return null;

  const handleCopyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  const handleCopyAllQuestions = () => {
    const fullText = `Jobia.az AI Müsahibə Sualları Paketi:
Namizəd: ${applicant.candidateName}
Vakansiya: ${applicant.vacancyTitle}
Uyğunluq Reytinqi: ${evaluation.score}%

${evaluation.interviewQuestions.map((q, i) => `${i + 1}. Sual: ${q.question}\n   Məqsəd: ${q.purpose}`).join('\n\n')}`;

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Jobia AI Namizəd Dəyərləndirməsi & Müsahibə Paketi</span>
              </h3>
              <p className="text-xs text-indigo-200">
                {applicant.candidateName} • {applicant.vacancyTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Score & Verdict Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                Jobia AI İcraçı Rəyi
              </span>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-blue-600" />
                <span>{evaluation.verdict}</span>
              </h4>
              <p className="text-xs text-slate-600">
                Tövsiyə edilən maaş diapazonu: <strong className="text-slate-900 font-bold">{evaluation.suggestedSalaryRange}</strong>
              </p>
            </div>

            <div className="bg-white px-4 py-2.5 rounded-xl border border-blue-200 shadow-2xs text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">ATS Uyğunluğu</span>
              <span className="text-2xl font-black text-blue-700">{evaluation.score}%</span>
            </div>
          </div>

          {/* Strengths & Red Flags Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Strengths */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Güclü Tərəflər (Key Assets)</span>
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                {evaluation.strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Potential Gaps / Inquiries */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Müsahibədə Dəqiqləşdirilməli Məqamlar</span>
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                {evaluation.gapAreas.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tailored Interview Questions Pack */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Namizəd Üçün Xüsusi Hazırlanmış Müsahibə Sualları</span>
              </h4>
              <button
                type="button"
                onClick={handleCopyAllQuestions}
                className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'Bütün Suallar Kopyalandı!' : 'Bütün Sualları Kopyala'}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {evaluation.interviewQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all shadow-2xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-slate-900 leading-relaxed">
                        {q.question}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyQuestion(q.question, idx)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                      title="Sualı kopyala"
                    >
                      {copiedQuestionIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="pl-7 text-[11px] text-slate-500 italic flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Hədəf: {q.purpose}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <ModalBottomLogo tagline="Jobia.az AI HR Məsləhət və Seçim Modulu" size="xs" variant="slate" />

          <div className="flex items-center gap-2">
            {onScheduleInterview && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onScheduleInterview(applicant);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Müsahibə Təyin Et</span>
              </button>
            )}

            {onSendOffer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSendOffer(applicant);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Təklif Göndər</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
