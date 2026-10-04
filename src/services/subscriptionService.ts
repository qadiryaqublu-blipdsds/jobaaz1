import {
  SubscriptionPlan,
  UserSubscription,
  PaymentTransaction,
  UserRole,
  PlanTier,
  BillingCycle,
  OneOffServiceItem,
  AICreditPackage
} from '../types';
import { 
  saveUserSubscriptionToFirestore, 
  recordPaymentToFirestore, 
  updateSubscriptionStatusInFirestore 
} from './firestoreService';

const SUBSCRIPTION_STORAGE_KEY = 'jobia_subscriptions_db';
const TRANSACTIONS_STORAGE_KEY = 'jobia_transactions_db';

// Master Plans Catalog (TRS Section 8.2 & 8.3)
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // -------------------------------------------------------------
  // EMPLOYER / BUSINESS PLANS (TRS Section 8.3)
  // -------------------------------------------------------------
  {
    id: 'plan-employer-free',
    role: 'business',
    tier: 'FREE',
    name: 'Free (Başlanğıc)',
    tagline: 'Kiçik şirkətlər və ilk dəfə işçi axtaranlar üçün baza paketi.',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '1 aktiv vakansiya elanı',
      'Standart müraciətlərin qəbul edilməsi və idarə edilməsi',
      'Əsas namizəd CV baxışı və status dəyişmə',
      'Standart e-poçt dəstəyi',
    ],
    limits: {
      maxActiveJobs: 1,
      canUseAICandidateMatching: false,
      canUseAIInterviewSummary: false,
      canGenerateJobOffers: false,
      canSearchCandidateDatabase: false,
      canExportCandidateData: false,
      hasPriorityListing: false,
      hasTeamMembers: false,
      canUseAIATSAnalysis: false,
      canUseAIInterviewPrep: false,
      hasAllCVTemplates: false,
      hasPriorityApplicationBadge: false,
      canUseSalaryTrendsIntelligence: false,
    },
  },
  {
    id: 'plan-employer-starter',
    role: 'business',
    tier: 'STARTER',
    name: 'Starter',
    tagline: '3 aktiv vakansiya və AI alətləri ilə sürətli işə qəbul başlanğıcı.',
    priceMonthly: 49,
    priceYearly: 39,
    badge: 'Sürətli Başlanğıc',
    features: [
      '3 aktiv vakansiya elanı',
      'AI alətləri üçün 10 başlanğıc krediti',
      'AI Vakansiya Mətni Generatoru (1 kredit / elan)',
      'Kadr Bankına giriş və namizəd profilləri',
      'Namizəd qeydləri və shortlist sistemi',
      'Prioritet texniki dəstək',
    ],
    limits: {
      maxActiveJobs: 3,
      canUseAICandidateMatching: true,
      canUseAIInterviewSummary: true,
      canGenerateJobOffers: true,
      canSearchCandidateDatabase: true,
      canExportCandidateData: true,
      hasPriorityListing: false,
      hasTeamMembers: false,
      canUseAIATSAnalysis: false,
      canUseAIInterviewPrep: false,
      hasAllCVTemplates: false,
      hasPriorityApplicationBadge: false,
      canUseSalaryTrendsIntelligence: false,
    },
  },
  {
    id: 'plan-employer-business',
    role: 'business',
    tier: 'BUSINESS',
    name: 'Business',
    tagline: '10 aktiv vakansiya, genişləndirilmiş AI imkanları və kadr analitikası.',
    priceMonthly: 99,
    priceYearly: 79,
    badge: 'Ən Populyar',
    isPopular: true,
    features: [
      '10 aktiv vakansiya elanı',
      'Genişləndirilmiş AI imkanları (30 AI krediti)',
      'AI ilə Rəsmi Vəzifə Təlimatı Hazırlanması (12 bölməli)',
      'AI Namizəd Uyğunluq Skoru və Açar söz təhlili',
      'Elektron İş Təklifləri (Job Offer) və A4 PDF təsdiqi',
      'Kadr Bankı və qabaqcıl namizəd filtrləməsi',
      'Vakansiyaların önə çıxarılması (Featured)',
      'İşə qəbul analitikası və hesabatlar',
    ],
    limits: {
      maxActiveJobs: 10,
      canUseAICandidateMatching: true,
      canUseAIInterviewSummary: true,
      canGenerateJobOffers: true,
      canSearchCandidateDatabase: true,
      canExportCandidateData: true,
      hasPriorityListing: true,
      hasTeamMembers: false,
      canUseAIATSAnalysis: false,
      canUseAIInterviewPrep: false,
      hasAllCVTemplates: false,
      hasPriorityApplicationBadge: false,
      canUseSalaryTrendsIntelligence: false,
    },
  },
  {
    id: 'plan-employer-corporate',
    role: 'business',
    tier: 'CORPORATE',
    name: 'Corporate',
    tagline: 'Çoxsaylı vakansiyalar, komanda üzvləri və fərdi prioritet dəstək.',
    priceMonthly: 199,
    priceYearly: 159,
    badge: 'Korporativ Lider',
    features: [
      'Çoxsaylı (25+) aktiv vakansiya elanı',
      'Komanda üzvləri üçün çoxistifadəçili giriş (Multi-user ATS)',
      '100 AI Krediti (bütün alətlər üçün limitsiz güc)',
      'Limitsiz Kadr Bankı və birbaşa namizəd dəvətləri',
      'AI Vəzifə Təlimatları və Şirkət xüsusi HR şablonları',
      'Toplu (Bulk) namizəd idarəetməsi və Excel/PDF ixracı',
      'Vakansiyaların axtarışda ƏN ÖNDƏ yerləşdirilməsi',
      '7/24 Şəxsi HR Menecer & VIP Dəstək xətti',
    ],
    limits: {
      maxActiveJobs: 9999,
      canUseAICandidateMatching: true,
      canUseAIInterviewSummary: true,
      canGenerateJobOffers: true,
      canSearchCandidateDatabase: true,
      canExportCandidateData: true,
      hasPriorityListing: true,
      hasTeamMembers: true,
      canUseAIATSAnalysis: false,
      canUseAIInterviewPrep: false,
      hasAllCVTemplates: false,
      hasPriorityApplicationBadge: false,
      canUseSalaryTrendsIntelligence: false,
    },
  },

  // -------------------------------------------------------------
  // CANDIDATE PLANS (TRS Section 8.2)
  // -------------------------------------------------------------
  {
    id: 'plan-candidate-free',
    role: 'candidate',
    tier: 'FREE',
    name: 'Standart Namizəd',
    tagline: 'Karyerasına yeni başlayan və iş axtaran namizədlər üçün pulsuz paket.',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Standart CV Yaradılması (Pulsuz)',
      'Peşəkar Onlayn CV Profili',
      'Bütün vakansiyalara 1 kliklə limitsiz müraciət',
      'CV-ni PDF kimi birbaşa yükləmə',
      'Müraciət statusları və anlıq bildirişlər',
      'İş Təkliflərini Onlayn Portaldan cavablama',
    ],
    limits: {
      maxActiveJobs: 0,
      canUseAICandidateMatching: false,
      canUseAIInterviewSummary: false,
      canGenerateJobOffers: false,
      canSearchCandidateDatabase: false,
      canExportCandidateData: false,
      hasPriorityListing: false,
      hasTeamMembers: false,
      canUseAIATSAnalysis: false,
      canUseAIInterviewPrep: false,
      hasAllCVTemplates: false,
      hasPriorityApplicationBadge: false,
      canUseSalaryTrendsIntelligence: true,
    },
  },
  {
    id: 'plan-candidate-premium',
    role: 'candidate',
    tier: 'PREMIUM',
    name: 'Candidate Premium AI',
    tagline: 'Müsahibələrdən 3 qat daha tez keçmək və arzuladığı işi tapmaq istəyənlər üçün.',
    priceMonthly: 9,
    priceYearly: 7, // 7 AZN/ay (illik ödənişdə 84 AZN)
    badge: 'Karyera Sürətləndirici',
    isPopular: true,
    features: [
      'Bütün Premium CV Şablonları (Modern, Corporate, Minimal, Tech)',
      'Limitsiz AI ATS CV Analizi və Uyğunluq Skoru',
      'Vakansiyaya uyğun CV optimallaşdırılması',
      'AI Müsahibə Simulyatoru və Vakansiyaya Özəl Sual-Cavablar',
      'İşəgötürənin müraciət siyahısında "Premium Namizəd" nişanı',
      'Dərinləşdirilmiş Maaş Trendləri və Şirkət İnsights',
      'Sürətli PDF İxracı və limitsiz versiyalama',
    ],
    limits: {
      maxActiveJobs: 0,
      canUseAICandidateMatching: false,
      canUseAIInterviewSummary: false,
      canGenerateJobOffers: false,
      canSearchCandidateDatabase: false,
      canExportCandidateData: false,
      hasPriorityListing: false,
      hasTeamMembers: false,
      canUseAIATSAnalysis: true,
      canUseAIInterviewPrep: true,
      hasAllCVTemplates: true,
      hasPriorityApplicationBadge: true,
      canUseSalaryTrendsIntelligence: true,
    },
  },
];

// -------------------------------------------------------------
// ONE-OFF PAY-AS-YOU-GO SERVICES (TRS Section 8.4)
// -------------------------------------------------------------
export const ONE_OFF_EMPLOYER_SERVICES: OneOffServiceItem[] = [
  {
    id: 'srv-premium-job',
    name: 'Premium Vakansiya',
    price: 20,
    unit: 'elan',
    description: 'Vakansiyanın 30 gün boyunca axtarış nəticələrində xüsusi VIP nişanla ən üst pillələrdə yerləşməsi.',
    category: 'employer'
  },
  {
    id: 'srv-ai-vacancy-generation',
    name: 'AI ilə Vakansiya Hazırlanması',
    price: 5,
    unit: 'elan',
    description: 'Yalnız vəzifə adını daxil etməklə 1-kliklə peşəkar, cəlbedici və ATS-standartlı elan mətni.',
    category: 'employer',
    creditsCost: 1
  },
  {
    id: 'srv-ai-job-description',
    name: 'AI ilə Rəsmi Vəzifə Təlimatının Hazırlanması',
    price: 10,
    unit: 'sənəd',
    description: 'Azərbaycan Əmək Məcəlləsinə tam uyğun 12-bəndlik rəsmi korporativ vəzifə təlimatı və Word/PDF ixracı.',
    category: 'employer',
    creditsCost: 2
  },
  {
    id: 'srv-candidate-deep-cv-analysis',
    name: 'Genişləndirilmiş CV Analizi',
    price: 1,
    unit: 'CV',
    description: 'Namizədin təqdim etdiyi CV-nin 10 ATS meyarı və faktual dəqiqlik üzrə dərindən auditi.',
    category: 'employer',
    creditsCost: 1
  },
  {
    id: 'srv-ai-match-candidate',
    name: 'AI ilə Namizəd Uyğunluğunun Təhlili',
    price: 1,
    unit: 'namizəd',
    description: 'Namizədin bacarıq və təcrübəsinin konkret vakansiyanın tələbləri ilə 7-faktorlu dəqiq müqayisəsi.',
    category: 'employer',
    creditsCost: 1
  },
  {
    id: 'srv-boost-vacancy',
    name: 'Vakansiyanın Önə Çıxarılması',
    price: 15,
    unit: 'həftə',
    description: 'Vakansiyanın ana səhifədə və kateqoriyalarda "Seçilmiş Elan" rəngli çərçivəsində göstərilməsi.',
    category: 'employer'
  },
  {
    id: 'srv-custom-hr-doc',
    name: 'Şirkət üçün Xüsusi HR Sənədi Hazırlanması',
    price: 0,
    unit: 'fərdi',
    description: 'Daxili nizamnamələr, ştat cədvəli və xüsusi daxili qaydalar üzrə fərdi hüquqi HR layihələndirilməsi.',
    category: 'employer'
  }
];

// -------------------------------------------------------------
// CANDIDATE MICRO-SERVICES & CREDIT PACKAGES (TRS Section 8.2)
// -------------------------------------------------------------
export const CANDIDATE_MICRO_SERVICES: OneOffServiceItem[] = [
  {
    id: 'cand-standard-cv',
    name: 'Standart CV Yaradılması',
    price: 0,
    unit: 'CV',
    description: 'Müasir onlayn CV redaktoru və klassik şablon ilə tam pulsuz peşəkar CV hazırlama.',
    category: 'candidate'
  },
  {
    id: 'cand-basic-ats-analysis',
    name: 'Əsas AI CV Analizi',
    price: 1,
    unit: 'analiz',
    description: 'CV-nin əsas ATS uyğunluq balı, format və struktur qiymətləndirməsi.',
    category: 'candidate',
    creditsCost: 1
  },
  {
    id: 'cand-deep-ats-analysis',
    name: 'Genişləndirilmiş AI CV Analizi',
    price: 3,
    unit: 'analiz',
    description: '10 ATS meyarı, 23 bölməli faktual hesabat, orfoqrafik yoxlama və peşəkar düzəliş məsləhətləri.',
    category: 'candidate',
    creditsCost: 2
  },
  {
    id: 'cand-vacancy-cv-optimizer',
    name: 'Vakansiyaya Uyğun CV Optimallaşdırılması',
    price: 2,
    unit: 'optimallaşdırma',
    description: 'Müraciət etmək istədiyiniz vakansiya elanına uyğun olaraq CV-dəki açar sözlərin AI ilə uyğunlaşdırılması.',
    category: 'candidate',
    creditsCost: 1
  },
  {
    id: 'cand-premium-cv-templates',
    name: 'Premium CV Şablonları',
    price: 2,
    unit: 'şablon',
    description: 'İsveçrə, Zümrüd, Texnoloji və Korporativ beynəlxalq dizayn şablonları.',
    category: 'candidate'
  }
];

// -------------------------------------------------------------
// AI CREDIT PACKAGES (TRS Section 8.2 & 8.5)
// -------------------------------------------------------------
export const AI_CREDIT_PACKAGES: AICreditPackage[] = [
  {
    id: 'credit-pkg-5',
    credits: 5,
    price: 5,
    badge: 'Baza Paket',
    description: '5 AI Əməliyyat Krediti (1 kredit = 1 AZN). CV analizi və ya vakansiya mətni üçün ideal.',
    savings: 'Standart Tarif'
  },
  {
    id: 'credit-pkg-15',
    credits: 15,
    price: 10,
    badge: '33% Qənaət',
    description: '15 AI Əməliyyat Krediti (Hər kredit cəmi 0.66 AZN). Vəzifə təlimatları və dərin analizlər üçün sərfəli.',
    savings: '5 AZN Qənaət'
  }
];

// -------------------------------------------------------------
// AI CREDIT USAGE RULES (TRS Section 8.5)
// -------------------------------------------------------------
export const AI_CREDIT_RULES = [
  { service: 'AI Vakansiya Mətni', cost: '1 kredit', icon: 'Briefcase' },
  { service: 'AI Vəzifə Təlimatı (12 bölməli rəsmi sənəd)', cost: '2 kredit', icon: 'FileText' },
  { service: 'Əsas CV Analizi', cost: '1 kredit', icon: 'CheckCircle' },
  { service: 'Genişləndirilmiş Faktual CV Analizi', cost: '2 kredit', icon: 'Sparkles' },
  { service: 'Vakansiyaya Uyğunluq Analizi (Matching)', cost: '1 kredit', icon: 'Target' },
];

export function formatPrice(amount: number): string {
  const rounded = Math.round((Number(amount) || 0) * 100) / 100;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2);
}

export function getStoredSubscriptions(): UserSubscription[] {
  const raw = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredSubscriptions(subs: UserSubscription[]): void {
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subs));
}

export function getStoredTransactions(): PaymentTransaction[] {
  const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredTransactions(txs: PaymentTransaction[]): void {
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(txs));
}

// Get plans filtered by user role
export function getPlansByRole(role: UserRole): SubscriptionPlan[] {
  if (role === 'admin') {
    return SUBSCRIPTION_PLANS;
  }
  return SUBSCRIPTION_PLANS.filter((p) => p.role === (role === 'business' ? 'business' : 'candidate'));
}

// Get active subscription for a specific user
export function getUserActiveSubscription(userId?: string, role: UserRole = 'candidate', userEmail?: string): UserSubscription {
  const subs = getStoredSubscriptions();
  
  // Find subscription by userId or userEmail
  const match = subs.find(
    (s) => (userId && s.userId === userId) || (userEmail && s.userEmail.toLowerCase() === userEmail.toLowerCase())
  );

  if (match && match.status === 'ACTIVE') {
    return match;
  }

  // Fallback: Default Free Subscription
  const defaultPlanId = role === 'business' ? 'plan-employer-free' : 'plan-candidate-free';
  return {
    id: `sub-default-${userId || 'guest'}`,
    userId: userId || 'guest',
    userEmail: userEmail || 'user@jobia.az',
    userName: 'İstifadəçi',
    role,
    planId: defaultPlanId,
    tier: 'FREE',
    status: 'ACTIVE',
    billingCycle: 'monthly',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 0,
    currency: 'AZN',
    paymentProvider: 'AZERI_GATEWAY',
    paymentId: 'none',
    autoRenew: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const getUserSubscription = getUserActiveSubscription;

// Helper: Check feature permission based on user plan / tier
export function checkFeatureAccess(
  subOrRole: UserSubscription | UserRole,
  featureOrTier: keyof SubscriptionPlan['limits'] | string,
  countOrFeature?: number | keyof SubscriptionPlan['limits'],
  extraCount?: number
): { allowed: boolean; requiredPlan: string; limit?: number; message?: string } {
  let planTier: string = 'FREE';
  let feature: keyof SubscriptionPlan['limits'];
  let currentCount: number | undefined;

  if (typeof subOrRole === 'object' && subOrRole !== null) {
    planTier = subOrRole.tier;
    feature = featureOrTier as keyof SubscriptionPlan['limits'];
    currentCount = typeof countOrFeature === 'number' ? countOrFeature : undefined;
  } else {
    planTier = (typeof featureOrTier === 'string' ? featureOrTier : 'FREE');
    feature = countOrFeature as keyof SubscriptionPlan['limits'];
    currentCount = extraCount;
  }

  const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === planTier) || SUBSCRIPTION_PLANS[0];
  
  if (feature === 'maxActiveJobs') {
    const limit = plan.limits.maxActiveJobs;
    if (currentCount !== undefined && currentCount >= limit) {
      return {
        allowed: false,
        requiredPlan: limit === 1 ? 'PRO' : 'BUSINESS',
        limit,
        message: `Cari planınızda maksimum ${limit} aktiv vakansiya yerləşdirə bilərsiniz. Limitsiz vakansiya üçün planınızı yüksəldin.`,
      };
    }
    return { allowed: true, requiredPlan: plan.tier, limit };
  }

  if ((feature as string) === 'post_jobs') {
    const limit = plan.limits.maxActiveJobs;
    if (currentCount !== undefined && currentCount >= limit) {
      return {
        allowed: false,
        requiredPlan: 'PRO',
        limit,
        message: `Cari pulsuz planınızda maksimum ${limit} aktiv vakansiya yerləşdirə bilərsiniz.`,
      };
    }
    return { allowed: true, requiredPlan: plan.tier, limit };
  }

  const isAllowed = Boolean(plan.limits[feature]);
  if (!isAllowed) {
    let requiredPlan = 'PRO';
    if (feature === 'hasTeamMembers') {
      requiredPlan = 'BUSINESS';
    } else if (feature === 'canSearchCandidateDatabase') {
      requiredPlan = 'PRO';
    } else if (feature === 'canUseAIATSAnalysis' || feature === 'canUseAIInterviewPrep' || feature === 'hasAllCVTemplates') {
      requiredPlan = 'PREMIUM';
    }

    return {
      allowed: false,
      requiredPlan,
      message: `Bu funksiya ${requiredPlan} planına daxildir. Zəhmət olmasa planınızı yüksəldin.`,
    };
  }

  return { allowed: true, requiredPlan: plan.tier };
}

// Activate / Upgrade subscription with payment transaction
export function applySubscriptionUpgrade(data: {
  userId: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  planId: string;
  billingCycle: BillingCycle;
  cardLast4?: string;
  paymentMethod?: string;
}): { subscription: UserSubscription; transaction: PaymentTransaction } {
  const targetPlan = SUBSCRIPTION_PLANS.find((p) => p.id === data.planId);
  if (!targetPlan) {
    throw new Error('Seçilmiş plan tapılmadı.');
  }

  const subs = getStoredSubscriptions();
  const txs = getStoredTransactions();

  const now = new Date();
  const durationMonths = data.billingCycle === 'yearly' ? 12 : 1;
  const endDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);

  const rawAmount = data.billingCycle === 'yearly' ? targetPlan.priceYearly * 12 : targetPlan.priceMonthly;
  const amount = Math.round(rawAmount * 100) / 100;

  const txId = `tx-${Date.now()}`;
  const subId = `sub-${Date.now()}`;

  const newSub: UserSubscription = {
    id: subId,
    userId: data.userId,
    userEmail: data.userEmail,
    userName: data.userName,
    role: data.role,
    planId: targetPlan.id,
    tier: targetPlan.tier,
    status: 'ACTIVE',
    billingCycle: data.billingCycle,
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    amount,
    currency: 'AZN',
    paymentProvider: 'AZERI_GATEWAY',
    paymentId: txId,
    autoRenew: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const newTx: PaymentTransaction = {
    id: txId,
    userId: data.userId,
    userEmail: data.userEmail,
    userName: data.userName,
    subscriptionId: subId,
    planName: `${targetPlan.name} (${data.billingCycle === 'yearly' ? 'İllik' : 'Aylıq'})`,
    amount,
    currency: 'AZN',
    status: 'SUCCESS',
    paymentMethod: data.paymentMethod || 'Bank Kartı (Onlayn Ödəniş)',
    cardLast4: data.cardLast4 || '4242',
    transactionDate: now.toISOString(),
  };

  const existingIdx = subs.findIndex(
    (s) => s.userId === data.userId || (data.userEmail && s.userEmail.toLowerCase() === data.userEmail.toLowerCase())
  );
  if (existingIdx >= 0) {
    subs[existingIdx] = newSub;
  } else {
    subs.unshift(newSub);
  }

  txs.unshift(newTx);

  saveStoredSubscriptions(subs);
  saveStoredTransactions(txs);

  saveUserSubscriptionToFirestore(newSub).catch((err) => {
    console.warn('Firestore subscription sync warning:', err);
  });

  recordPaymentToFirestore(newTx).catch((err) => {
    console.warn('Firestore payment record sync warning:', err);
  });

  return { subscription: newSub, transaction: newTx };
}

// Cancel subscription
export function cancelUserSubscription(subId: string): UserSubscription {
  const subs = getStoredSubscriptions();
  const match = subs.find((s) => s.id === subId);
  if (!match) throw new Error('Abunəlik tapılmadı');

  match.status = 'CANCELLED';
  match.autoRenew = false;
  match.updatedAt = new Date().toISOString();

  saveStoredSubscriptions(subs);

  updateSubscriptionStatusInFirestore(subId, 'CANCELLED').catch((err) => {
    console.warn('Firestore cancel sync warning:', err);
  });

  return match;
}
