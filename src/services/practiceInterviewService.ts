import { PracticeInterviewSentimentResult, InterviewQuestion, PracticeInterviewSessionItem } from '../types';
import { safeFetchJson } from '../utils/apiHelper';

export interface EvaluatePracticePayload {
  question: string;
  candidateAnswer: string;
  transcript?: string;
  vacancyTitle?: string;
  companyName?: string;
  category?: string;
  audioDurationSeconds?: number;
}

/**
 * Send candidate mock interview audio transcript for AI-powered sentiment & speech dynamics analysis.
 */
export async function evaluatePracticeSentiment(
  payload: EvaluatePracticePayload
): Promise<{ success: boolean; result?: PracticeInterviewSentimentResult; error?: string }> {
  try {
    const res = await safeFetchJson<PracticeInterviewSentimentResult & { success: boolean; error?: string }>(
      '/api/ai/sentiment-analysis',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok && res.data && res.data.success !== false) {
      return {
        success: true,
        result: res.data,
      };
    }

    return {
      success: false,
      error: res.data?.error || res.error || 'Sentiment analizi tamamlana bilmədi',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Şəbəkə xətası baş verdi',
    };
  }
}

/**
 * Fetch tailored practice interview questions for a role or vacancy.
 */
export async function fetchPracticeQuestions(
  roleTitle: string,
  companyName: string = 'Jobia Partnyor Şirkəti'
): Promise<{ questions: InterviewQuestion[]; tips: string[] }> {
  try {
    const res = await safeFetchJson<{ questions: InterviewQuestion[]; tips: string[] }>(
      '/api/ai/interview-prep',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyTitle: roleTitle,
          companyName,
          requirements: ['Müasir texniki biliklər', 'Komanda ilə ünsiyyət', 'Problem həll etmə'],
        }),
      }
    );

    if (res.ok && res.data?.questions) {
      return res.data;
    }
  } catch (err) {
    console.warn('Practice questions fetch fallback:', err);
  }

  // Fallback preset questions
  return {
    questions: [
      {
        id: 'pq-1',
        category: 'Texniki',
        difficulty: 'Orta',
        question: `"${roleTitle}" vəzifəsində qarşılaşdığınız ən mürəkkəb problemi necə aşkar edib həll etmisiniz?`,
        whyAsked: 'Müsahibəçi sizin analitik təfəkkürünüzü, metodologiyanızı və real təcrübənizi yoxlayır.',
        suggestedAnswerTip: 'STAR metodundan istifadə edin: Vəziyyət, Tapşırıq, Şəxsi addımlarınız və Ölçülə bilən nəticə.',
        sampleAnswerAz: 'Layihə zamanı yaranan problemi təhlil edərək kök səbəbi tapdım, komanda ilə çevik optimallaşdırma apardım və səmərəliliyi 30% artırdım.',
        keyCriteria: ['Analitik düşüncə', 'Fərdi rol', 'Ölçülə bilən nəticə'],
      },
      {
        id: 'pq-2',
        category: 'Davranış və Situasiya',
        difficulty: 'Orta',
        question: 'Gərgin son tarix (deadline) və ya gözlənilməz dəyişiklik zamanı komanda daxilində prioritetləri necə idarə edirsiniz?',
        whyAsked: 'Stressə dözümlülüyünüzü, çevikliyinizi və emosional intellektinizi aşkar edir.',
        suggestedAnswerTip: 'Təmkinli səs tonu ilə danışın, təcili və vacib tapşırıqları necə ayırdığınızı izah edin.',
        sampleAnswerAz: 'Əvvəlcə tapşırıqları biznes dəyərinə görə sıraladım, maraqlı tərəflərə dərhal şəffaf status bildirdim və layihəni vaxtında təhvil verdim.',
        keyCriteria: ['Prioritetləşdirmə', 'Şəffaflıq', 'Stress menecmenti'],
      },
      {
        id: 'pq-3',
        category: 'Şirkət Uyğunluğu',
        difficulty: 'Başlanğıc',
        question: `Niyə məhz ${companyName} şirkətində və bu sahədə karyeranızı inkişaf etdirmək istəyirsiniz?`,
        whyAsked: 'Daxili motivasiyanızı, şirkət haqqında biliklərinizi və uzunmüddətli sadiqliyinizi ölçür.',
        suggestedAnswerTip: 'Pozitiv enerji və inamla danışın, şirkətin dəyərləri ilə öz hədəflərinizi əlaqələndirin.',
        sampleAnswerAz: 'Şirkətinizin innovativ yanaşmasını və peşəkar mühitini yüksək qiymətləndirirəm. Mənim təcrübəm və enerjim şirkətin uğurlarına dəyərli qatqı təmin edəcək.',
        keyCriteria: ['Motivasiya', 'Şirkət mədəniyyəti', 'Dəyər qatqısı'],
      },
    ],
    tips: [
      'Mikrofona danışarkən dik oturun və dərindən nəfəs alın; bu səs tonunuzu daha güclü və inamlı edir.',
      '1.5 - 2 dəqiqə ərzində cavabınızı bitirməyə çalışın (ideal danışıq sürəti: 120-150 söz/dəqiqə).',
      'Parazit sözlərdən ("ııı", "şey", "yəni") yayınmaq üçün cümlələr arasında 1 saniyəlik təmkinli pauza verin.',
    ],
  };
}

// -------------------------------------------------------------
// LOCALSTORAGE PERSISTENCE & ANALYTICS HELPER FUNCTIONS
// -------------------------------------------------------------
export const PRACTICE_SESSIONS_STORAGE_KEY = 'jobia_candidate_practice_sessions';

export const INITIAL_SAMPLE_PRACTICE_SESSIONS: PracticeInterviewSessionItem[] = [
  {
    id: 'sample-session-1',
    questionId: 'pq-frontend-1',
    roleTitle: 'Senior Frontend Engineer',
    companyName: 'PASHA Bank',
    category: 'Texniki & Arxitektura',
    audioDurationSeconds: 84,
    question: 'Böyük həcmli maliyyə məlumatlarının render performansını və komponentlərin təkrar renderini necə optimallaşdırmısınız?',
    transcript: 'PASHA Bank platformasında minlərlə sətirlik tranzaksiya cədvəlində render ləngiməsi müşahidə olunurdu. Mən virtualizasiya (react-window) tətbiq edərək DOM düyünlərini 5000-dən 25-ə endirdim. useMemo və React.memo ilə lazımsız renderləri aradan qaldırdım və nəticədə FPS sabit 60-a yüksəldi, yüklənmə vaxtı 40% azaldı.',
    completedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    sentimentResult: {
      overallSentimentScore: 92,
      technicalFeedbackScore: 95,
      technicalCritique: 'Mükəmməl texniki dərinlik. Virtualizasiya, memoizasiya və konkret ölçülə bilən metrikalar (FPS 60, 40% azalma) STAR metodunun hər dörd mərhələsinə tam cavab verir.',
      primarySentiment: 'İnamlı və Məqsədyönlü (Confident)',
      secondarySentiment: 'Pozitiv və Həll Yönümlü (Solution-Oriented)',
      sentimentTone: 'confident',
      metrics: {
        confidence: 94,
        positivity: 90,
        clarity: 95,
        composure: 92,
        professionalism: 96,
      },
      speechDynamics: {
        wordsPerMinute: 138,
        paceVerdict: 'optimal',
        paceFeedback: 'Danışıq sürətiniz idealdır (138 söz/dəqiqə). Dinləyici üçün anlaşıqlı və təmkinli bir tempdir.',
        fillerWordsCount: 0,
        detectedFillerWords: [],
        articulationScore: 95,
      },
      starAnalysis: {
        situation: 'PASHA Bank platformasında minlərlə sətirlik tranzaksiya cədvəlində render gecikməsi yaranmışdı.',
        task: 'DOM performansını optimallaşdırmaq və FPS sabitliyini təmin etmək.',
        action: 'react-window virtualizasiyası və memoizasiya ilə lazımsız renderlərin aradan qaldırılması.',
        result: 'DOM düyünləri 5000-dən 25-ə endirildi, yüklənmə müddəti 40% azaldıldı.',
      },
      strengths: [
        'Konkret ölçülə bilən nəticələr (40% azalma, 60 FPS)',
        'Dəqiq texniki terminologiya (react-window, virtualization)',
        'Sərbəst və parazit sözlərsiz nitq tonu',
      ],
      growthAreas: [
        'Gələcəkdə server-side pagination ilə necə inteqrasiya edildiyini də əlavə etmək olar.',
      ],
      voiceAndDeliveryTips: [
        'Uğur metrikalarını (40%, 60 FPS) səs tonunu cüzi ucaldaraq vurğulamaq dinləyicidə daha güclü təəssürat yaradır.',
      ],
      polishedExecutiveAnswer: 'PASHA Bank-da minlərlə sətirlik maliyyə cədvəlində render ləngiməsi yaranarkən, mən react-window virtualizasiyası tətbiq edərək DOM elementlərini 5000-dən 25-ə endirdim. useMemo və React.memo optimizasiyası ilə lazımsız renderləri aradan qaldırdım. Nəticədə FPS sabit 60-a çatdı və yüklənmə vaxtı 40% qısaldı.',
      evaluatedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    },
  },
  {
    id: 'sample-session-2',
    questionId: 'pq-backend-1',
    roleTitle: 'Backend Software Engineer',
    companyName: 'Kapital Bank',
    category: 'Texniki & Sistem Dizaynı',
    audioDurationSeconds: 72,
    question: 'Yüksək yüklü (high-load) mikroservis arxitekturasında məlumatların ardıcıllığını və keşlənmə strategiyasını necə qurmusunuz?',
    transcript: 'Ödəniş axınında transactional ardıcıllıq üçün Redis keşləmə və Kafka mesaj növbəsindən istifadə etdik. Baza sorğularını azaltmaq üçün read-heavy əməliyyatları Redis Cluster-ə yönləndirdik və bazaya düşən yükü 65% azaltdıq.',
    completedAt: new Date(Date.now() - 3600 * 1000 * 42).toISOString(),
    sentimentResult: {
      overallSentimentScore: 86,
      technicalFeedbackScore: 89,
      technicalCritique: 'Kafka və Redis klaster arxitekturası üzrə addımlar aydın izah olunub. Məlumatın eventual consistency məsələsinə də qısa toxunmaq fikri tamamlaya bilər.',
      primarySentiment: 'Təmkinli və Analitik (Composed)',
      secondarySentiment: 'Peşəkar və Dəqiq (Precise)',
      sentimentTone: 'positive',
      metrics: {
        confidence: 86,
        positivity: 82,
        clarity: 88,
        composure: 90,
        professionalism: 92,
      },
      speechDynamics: {
        wordsPerMinute: 130,
        paceVerdict: 'optimal',
        paceFeedback: 'Mülayim və mühəndis təmkinliyinə uyğun ritm (130 söz/dəqiqə).',
        fillerWordsCount: 1,
        detectedFillerWords: [{ word: 'yəni', count: 1 }],
        articulationScore: 88,
      },
      starAnalysis: {
        situation: 'Yüksək yüklü ödəniş axınlarında məlumat bazasının həddən artıq yüklənməsi.',
        task: 'Sorğu gecikməsini azaltmaq və keşlənmə strategiyası qurmaq.',
        action: 'Redis Cluster və Kafka asinxron mesaj növbəsinin tətbiqi.',
        result: 'Əsas verilənlər bazasına düşən yük 65% azaldıldı.',
      },
      strengths: [
        'Müasir paylanmış sistemlər (Redis, Kafka) üzrə praktiki nümunə',
        'Biznes nəticəsi: bazaya yük 65% azalıb',
      ],
      growthAreas: [
        '"Yəni" parazit sözünü azaltmaq və keş invalidasiya strategiyasını qeyd etmək.',
      ],
      voiceAndDeliveryTips: [
        'Fikirlər arasında tələsmədən bir saniyəlik fasilə verərək tərəddüd sözlərindən qaçın.',
      ],
      polishedExecutiveAnswer: 'Yüksək yüklü ödəniş sistemlərində transactional davamlılığı təmin etmək üçün Redis Cluster keşləməsi və Kafka mesaj növbəsindən istifadə etdim. Read-heavy sorğuları keşə yönləndirərək əsas bazaya düşən yükü 65% azaltdıq və sistemin sabitliyini təmin etdik.',
      evaluatedAt: new Date(Date.now() - 3600 * 1000 * 42).toISOString(),
    },
  },
  {
    id: 'sample-session-3',
    questionId: 'pq-uiux-1',
    roleTitle: 'UX/UI & Product Designer',
    companyName: 'PASHA Life',
    category: 'Situasiya & Metodologiya',
    audioDurationSeconds: 65,
    question: 'İstifadəçi testi zamanı gözlənilməz rəylər alarkən dizayn hipotezlərinizi necə dəyişir və maraqlı tərəfləri necə inandırırsınız?',
    transcript: 'Biz sığorta kabinetinin checkout axınında konversiyanın aşağı olduğunu gördük. 8 nəfərlik istifadəçi testi apardıq və istifadəçilərin 3-cü addımda çaşqınlıq yaşadığını aşkar etdik. A/B testlə yeni prototipi sınaqdan keçirdik və checkout konversiyasını 18% artırdıq.',
    completedAt: new Date(Date.now() - 3600 * 1000 * 70).toISOString(),
    sentimentResult: {
      overallSentimentScore: 90,
      technicalFeedbackScore: 92,
      technicalCritique: 'İstifadəçi testi, keyfiyyət analizi və A/B test nəticələri əsasında qərar vermə qabiliyyəti yüksək səviyyədə çatdırılıb.',
      primarySentiment: 'Pozitiv və Empatik (Empathetic)',
      secondarySentiment: 'Nəticəyönümlü (Data-Driven)',
      sentimentTone: 'positive',
      metrics: {
        confidence: 90,
        positivity: 92,
        clarity: 92,
        composure: 89,
        professionalism: 92,
      },
      speechDynamics: {
        wordsPerMinute: 142,
        paceVerdict: 'optimal',
        paceFeedback: 'Çox dinamik və enerjili təqdimat tərzi (142 söz/dəqiqə).',
        fillerWordsCount: 0,
        detectedFillerWords: [],
        articulationScore: 92,
      },
      starAnalysis: {
        situation: 'Sığorta kabinetində checkout axınında qeyri-kafi konversiya dərəcəsi.',
        task: 'Problemli addımı tapmaq və istifadəçi mərkəzli həll irəli sürmək.',
        action: '8 nəfərlik istifadəçi testi və yeni UI prototipinin A/B sınağı.',
        result: 'Checkout konversiyası 18% artırıldı.',
      },
      strengths: [
        'Məlumat və sınaq əsaslı dizayn düşüncəsi (Data-driven Design)',
        'Konkret 18% konversiya artımı nəticəsi',
      ],
      growthAreas: [
        'Məhsul meneceri ilə maraqların necə uzlaşdırıldığını bir cümlə ilə əlavə etmək.',
      ],
      voiceAndDeliveryTips: [
        'Pozitiv enerjinizi saxlayın, komanda ilə əməkdaşlıq ruhunu vurğulayın.',
      ],
      polishedExecutiveAnswer: 'Sığorta kabinetində istifadəçi testləri apararaq 3-cü addımda istifadəçilərin tərəddüdünü aşkar etdik. Hipotezimizi dəyişərək formanı sadələşdirdik və A/B test nəticəsində checkout konversiyasını 18% artırmağa nail olduq.',
      evaluatedAt: new Date(Date.now() - 3600 * 1000 * 70).toISOString(),
    },
  },
];

/**
 * Retrieve saved candidate practice interview sessions from localStorage.
 */
export function getStoredPracticeSessions(): PracticeInterviewSessionItem[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_PRACTICE_SESSIONS;
  try {
    const raw = localStorage.getItem(PRACTICE_SESSIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRACTICE_SESSIONS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PRACTICE_SESSIONS));
      return INITIAL_SAMPLE_PRACTICE_SESSIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_PRACTICE_SESSIONS;
  } catch (err) {
    console.warn('Failed to parse practice sessions from localStorage:', err);
    return INITIAL_SAMPLE_PRACTICE_SESSIONS;
  }
}

/**
 * Save or prepend a new recorded practice interview session.
 */
export function savePracticeSessionToStorage(item: PracticeInterviewSessionItem): PracticeInterviewSessionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredPracticeSessions();
    const updated = [item, ...current.filter((s) => s.id !== item.id)];
    localStorage.setItem(PRACTICE_SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for cross-component live sync
    window.dispatchEvent(new CustomEvent('jobia_practice_sessions_updated', { detail: updated }));
    return updated;
  } catch (err) {
    console.warn('Failed to save practice session to localStorage:', err);
    return [];
  }
}

/**
 * Delete a saved session by ID.
 */
export function deletePracticeSessionFromStorage(id: string): PracticeInterviewSessionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredPracticeSessions();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem(PRACTICE_SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('jobia_practice_sessions_updated', { detail: updated }));
    return updated;
  } catch (err) {
    console.warn('Failed to delete practice session from localStorage:', err);
    return [];
  }
}

/**
 * Clear all practice sessions.
 */
export function clearPracticeSessionsFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PRACTICE_SESSIONS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('jobia_practice_sessions_updated', { detail: [] }));
  } catch (err) {
    console.warn('Failed to clear practice sessions:', err);
  }
}

/**
 * Calculate aggregate analytics from a collection of practice interview sessions.
 */
export interface PracticeAnalyticsSummary {
  totalSessions: number;
  averageSentimentScore: number;
  averageTechnicalScore: number;
  averageWpm: number;
  totalFillerWords: number;
  topPrimarySentiment: string;
  strongestCategory: string;
  overallTone: 'confident' | 'positive' | 'neutral' | 'nervous' | 'hesitant';
  metricsAvg: {
    confidence: number;
    positivity: number;
    clarity: number;
    composure: number;
    professionalism: number;
  };
}

export function getPracticeAnalyticsSummary(sessions: PracticeInterviewSessionItem[]): PracticeAnalyticsSummary {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      averageSentimentScore: 0,
      averageTechnicalScore: 0,
      averageWpm: 0,
      totalFillerWords: 0,
      topPrimarySentiment: 'Qeydə alınmayıb',
      strongestCategory: 'Ümumi',
      overallTone: 'neutral',
      metricsAvg: {
        confidence: 0,
        positivity: 0,
        clarity: 0,
        composure: 0,
        professionalism: 0,
      },
    };
  }

  let totalSentiment = 0;
  let totalTechnical = 0;
  let totalWpm = 0;
  let totalFillers = 0;
  let totalConfidence = 0;
  let totalPositivity = 0;
  let totalClarity = 0;
  let totalComposure = 0;
  let totalProfessionalism = 0;

  sessions.forEach((s) => {
    const res = s.sentimentResult;
    if (res) {
      totalSentiment += res.overallSentimentScore || 75;
      totalTechnical += res.technicalFeedbackScore || res.overallSentimentScore || 78;
      totalWpm += res.speechDynamics?.wordsPerMinute || 130;
      totalFillers += res.speechDynamics?.fillerWordsCount || 0;
      totalConfidence += res.metrics?.confidence || 75;
      totalPositivity += res.metrics?.positivity || 75;
      totalClarity += res.metrics?.clarity || 75;
      totalComposure += res.metrics?.composure || 75;
      totalProfessionalism += res.metrics?.professionalism || 80;
    }
  });

  const count = sessions.length;
  const avgSentiment = Math.round(totalSentiment / count);
  const avgTechnical = Math.round(totalTechnical / count);

  return {
    totalSessions: count,
    averageSentimentScore: avgSentiment,
    averageTechnicalScore: avgTechnical,
    averageWpm: Math.round(totalWpm / count),
    totalFillerWords: totalFillers,
    topPrimarySentiment: avgSentiment >= 88 ? 'İnamlı və Qətiyyətli' : avgSentiment >= 78 ? 'Pozitiv və Təmkinli' : 'İnkişaf Mərhələsində',
    strongestCategory: 'Texniki & Arxitektura',
    overallTone: avgSentiment >= 85 ? 'confident' : avgSentiment >= 75 ? 'positive' : 'neutral',
    metricsAvg: {
      confidence: Math.round(totalConfidence / count),
      positivity: Math.round(totalPositivity / count),
      clarity: Math.round(totalClarity / count),
      composure: Math.round(totalComposure / count),
      professionalism: Math.round(totalProfessionalism / count),
    },
  };
}
