/**
 * AI Credit, Cost, Price and Profit Margin Management Service
 * Specification Section 22: AI xidmətləri, kredit və ödəniş sistemi
 * Real AI unit cost vs customer sale price vs platform profit margin
 */

export interface AIOperationPricing {
  key: string;
  name: string;
  description: string;
  category: 'candidate' | 'business' | 'shared';
  creditsCost: number; // e.g. 1 credit = 0.50 AZN
  salePriceAZN: number; // in AZN
  realApiCostAZN: number; // actual Gemini API token/compute cost
  grossProfitAZN: number;
  marginPercent: number;
  freeTrialAllowed: boolean;
  isEnabled: boolean; // Feature flag controllable by admin
}

export interface AITransactionRecord {
  id: string;
  userId: string;
  userName?: string;
  companyId?: string;
  companyName?: string;
  operationKey: string;
  operationName: string;
  creditsDeducted: number;
  amountAZN: number;
  realApiCostAZN: number;
  profitAZN: number;
  isFreeTrial: boolean;
  status: 'success' | 'failed' | 'refunded';
  refundReason?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserAICreditWallet {
  userId: string;
  balanceCredits: number;
  totalPurchasedCredits: number;
  totalSpentCredits: number;
  usedFreeTrials: Record<string, boolean>; // e.g. { 'cv_deep_analysis': true }
  lastUpdated: string;
}

export const DEFAULT_AI_PRICING: AIOperationPricing[] = [
  {
    key: 'cv_deep_analysis',
    name: 'CV Dərin Analizi & ATS Skoru',
    description: 'CV strukturunun, açar sözlərinin və ATS uyğunluğunun 0-100 bal ilə təhlili',
    category: 'candidate',
    creditsCost: 1,
    salePriceAZN: 0.50,
    realApiCostAZN: 0.04,
    grossProfitAZN: 0.46,
    marginPercent: 92.0,
    freeTrialAllowed: true,
    isEnabled: true
  },
  {
    key: 'cv_ai_creator',
    name: 'AI ilə CV Tərtibatı (Sual-Cavab)',
    description: 'Suallar vasitəsilə 4 dildə peşəkar A4 CV mətninin sıfırdan hazırlanması',
    category: 'candidate',
    creditsCost: 2,
    salePriceAZN: 1.00,
    realApiCostAZN: 0.07,
    grossProfitAZN: 0.93,
    marginPercent: 93.0,
    freeTrialAllowed: true,
    isEnabled: true
  },
  {
    key: 'linkedin_profile_audit',
    name: 'LinkedIn Profilinin Analizi',
    description: 'Başlıq, haqqımda bölməsi və açar sözlərin peşəkar audit tövsiyələri',
    category: 'candidate',
    creditsCost: 2,
    salePriceAZN: 1.00,
    realApiCostAZN: 0.05,
    grossProfitAZN: 0.95,
    marginPercent: 95.0,
    freeTrialAllowed: true,
    isEnabled: true
  },
  {
    key: 'ai_interview_simulator',
    name: 'AI Müsahibə Məşqi & Dəyərləndirmə',
    description: 'STAR metodu, emosional inam, nitq tempi və texniki arqumentasiya təhlili',
    category: 'candidate',
    creditsCost: 4,
    salePriceAZN: 2.00,
    realApiCostAZN: 0.12,
    grossProfitAZN: 1.88,
    marginPercent: 94.0,
    freeTrialAllowed: true,
    isEnabled: true
  },
  {
    key: 'voice_form_filling',
    name: 'Səsli Ərizə və Forma Doldurma',
    description: 'Azərbaycan dilində nitqi mətndən sahələrə çevirib rəsmi ərizə yaratma',
    category: 'shared',
    creditsCost: 1,
    salePriceAZN: 0.50,
    realApiCostAZN: 0.03,
    grossProfitAZN: 0.47,
    marginPercent: 94.0,
    freeTrialAllowed: true,
    isEnabled: true
  },
  {
    key: 'vacancy_ai_generator',
    name: 'AI Vakansiya Mətni & Tələblər',
    description: 'Vəzifə adı əsasında öhdəlik, tələb və iş şəraitinin avtomatik yazılması',
    category: 'business',
    creditsCost: 2,
    salePriceAZN: 1.00,
    realApiCostAZN: 0.05,
    grossProfitAZN: 0.95,
    marginPercent: 95.0,
    freeTrialAllowed: true,
    isEnabled: true
  },
  {
    key: 'candidate_match_deep',
    name: 'AI Namizəd-Vakansiya Dərin Uyğunlaşdırma',
    description: 'Vakansiya tələbləri ilə namizəd təcrübəsinin izahlı faizlə müqayisəsi',
    category: 'business',
    creditsCost: 1,
    salePriceAZN: 0.50,
    realApiCostAZN: 0.04,
    grossProfitAZN: 0.46,
    marginPercent: 92.0,
    freeTrialAllowed: true,
    isEnabled: true
  },
  {
    key: 'bulk_cv_parsing_unit',
    name: 'Toplu CV Emalı (Hər 1 CV faylı üçün)',
    description: 'PDF/DOCX sənədindən sahələrin, təcrübənin və bacarıqların avtomatik çıxarılması',
    category: 'business',
    creditsCost: 0.5,
    salePriceAZN: 0.25,
    realApiCostAZN: 0.03,
    grossProfitAZN: 0.22,
    marginPercent: 88.0,
    freeTrialAllowed: false,
    isEnabled: true
  }
];

export const AI_CREDIT_TOPUP_PACKAGES = [
  {
    id: 'pkg-50',
    credits: 50,
    priceAZN: 15,
    savingsText: 'Standart qiymət',
    isPopular: false,
    description: 'Fərdi namizədlər və kiçik şirkətlər üçün ideal başlanğıc.'
  },
  {
    id: 'pkg-150',
    credits: 150,
    priceAZN: 35,
    savingsText: '22% Qənaət',
    isPopular: true,
    description: 'Ən çox seçilən: aktiv işə qəbul və ya fərdi karyera hazırlığı üçün.'
  },
  {
    id: 'pkg-400',
    credits: 400,
    priceAZN: 75,
    savingsText: '37% Qənaət',
    isPopular: false,
    description: 'Böyük komandalar və toplu CV analizi aparan HR departamentləri üçün.'
  },
  {
    id: 'pkg-1000',
    credits: 1000,
    priceAZN: 150,
    savingsText: '50% Qənaət',
    isPopular: false,
    description: 'Enterprise şirkətlər üçün limitsiz təhlil və kadr bazası emalı paketi.'
  }
];

const WALLET_STORAGE_KEY_PREFIX = 'jobia_ai_wallet_';
const PRICING_STORAGE_KEY = 'jobia_ai_pricing_config';
const TRANSACTIONS_STORAGE_KEY = 'jobia_ai_transactions';

export function getAIPricingConfig(): AIOperationPricing[] {
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    if (!raw) return DEFAULT_AI_PRICING;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_AI_PRICING;
  } catch {
    return DEFAULT_AI_PRICING;
  }
}

export function saveAIPricingConfig(config: AIOperationPricing[]): void {
  try {
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save AI pricing config', err);
  }
}

export function toggleAIFeatureFlag(operationKey: string, enabled: boolean): void {
  const list = getAIPricingConfig();
  const item = list.find((p) => p.key === operationKey);
  if (item) {
    item.isEnabled = enabled;
    saveAIPricingConfig(list);
  }
}

export function getUserAICreditWallet(userId: string): UserAICreditWallet {
  try {
    const raw = localStorage.getItem(`${WALLET_STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  const defaultWallet: UserAICreditWallet = {
    userId,
    balanceCredits: 10, // 10 welcome credits upon signup!
    totalPurchasedCredits: 0,
    totalSpentCredits: 0,
    usedFreeTrials: {},
    lastUpdated: new Date().toISOString()
  };
  saveUserAICreditWallet(defaultWallet);
  return defaultWallet;
}

export function saveUserAICreditWallet(wallet: UserAICreditWallet): void {
  try {
    wallet.lastUpdated = new Date().toISOString();
    localStorage.setItem(`${WALLET_STORAGE_KEY_PREFIX}${wallet.userId}`, JSON.stringify(wallet));
  } catch (err) {
    console.warn('Failed to save AI credit wallet', err);
  }
}

export function getAllAITransactions(): AITransactionRecord[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordAITransaction(tx: Omit<AITransactionRecord, 'id' | 'timestamp'>): AITransactionRecord {
  const fullTx: AITransactionRecord = {
    ...tx,
    id: `aitx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString()
  };

  try {
    const list = getAllAITransactions();
    list.unshift(fullTx);
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
  } catch (err) {
    console.warn('Failed to record AI transaction', err);
  }

  return fullTx;
}

/**
 * Execute AI operation with credit check, free trial validation, and rollback on failure
 */
export async function executeAIOperationWithCredits<T>(params: {
  userId: string;
  userName?: string;
  companyId?: string;
  companyName?: string;
  operationKey: string;
  action: () => Promise<T>;
}): Promise<{ result: T; isFreeTrial: boolean; creditsCharged: number }> {
  const pricingList = getAIPricingConfig();
  const pricing = pricingList.find((p) => p.key === params.operationKey);

  if (!pricing) {
    throw new Error(`Naməlum AI əməliyyatı: ${params.operationKey}`);
  }

  if (!pricing.isEnabled) {
    throw new Error(`Bu AI xidməti müvəqqəti olaraq administrator tərəfindən dayandırılıb.`);
  }

  const wallet = getUserAICreditWallet(params.userId);

  // Check if free trial applies and has not been used yet
  let isFreeTrial = false;
  if (pricing.freeTrialAllowed && !wallet.usedFreeTrials[params.operationKey]) {
    isFreeTrial = true;
  }

  const creditsRequired = isFreeTrial ? 0 : pricing.creditsCost;

  if (!isFreeTrial && wallet.balanceCredits < creditsRequired) {
    throw new Error(
      `Kifayət qədər AI krediti yoxdur. Tələb olunan: ${creditsRequired} kredit, Mövcud balans: ${wallet.balanceCredits} kredit. Zəhmət olmasa balansı artırın.`
    );
  }

  // Deduct credits optimistically
  if (!isFreeTrial) {
    wallet.balanceCredits -= creditsRequired;
    wallet.totalSpentCredits += creditsRequired;
  } else {
    wallet.usedFreeTrials[params.operationKey] = true;
  }
  saveUserAICreditWallet(wallet);

  try {
    const result = await params.action();

    // Log successful transaction
    recordAITransaction({
      userId: params.userId,
      userName: params.userName,
      companyId: params.companyId,
      companyName: params.companyName,
      operationKey: pricing.key,
      operationName: pricing.name,
      creditsDeducted: creditsRequired,
      amountAZN: isFreeTrial ? 0 : pricing.salePriceAZN,
      realApiCostAZN: pricing.realApiCostAZN,
      profitAZN: isFreeTrial ? -pricing.realApiCostAZN : pricing.grossProfitAZN,
      isFreeTrial,
      status: 'success'
    });

    return { result, isFreeTrial, creditsCharged: creditsRequired };
  } catch (err: any) {
    // ROLLBACK credits on failure as strictly required by Section 22
    if (!isFreeTrial) {
      wallet.balanceCredits += creditsRequired;
      wallet.totalSpentCredits = Math.max(0, wallet.totalSpentCredits - creditsRequired);
      saveUserAICreditWallet(wallet);
    } else {
      wallet.usedFreeTrials[params.operationKey] = false; // Restore trial if failed
      saveUserAICreditWallet(wallet);
    }

    recordAITransaction({
      userId: params.userId,
      userName: params.userName,
      companyId: params.companyId,
      companyName: params.companyName,
      operationKey: pricing.key,
      operationName: pricing.name,
      creditsDeducted: 0,
      amountAZN: 0,
      realApiCostAZN: 0,
      profitAZN: 0,
      isFreeTrial,
      status: 'refunded',
      refundReason: `Əməliyyat xətası: ${err.message || 'Bilinməyən xəta'}. Kreditlər bərpa edildi.`
    });

    throw err;
  }
}

export function topUpUserAICredits(userId: string, packageId: string): UserAICreditWallet {
  const pkg = AI_CREDIT_TOPUP_PACKAGES.find((p) => p.id === packageId) || AI_CREDIT_TOPUP_PACKAGES[0];
  const wallet = getUserAICreditWallet(userId);
  wallet.balanceCredits += pkg.credits;
  wallet.totalPurchasedCredits += pkg.credits;
  saveUserAICreditWallet(wallet);

  recordAITransaction({
    userId,
    operationKey: 'credit_topup',
    operationName: `Kredit Balansı Artırıldı (+${pkg.credits} Kredit)`,
    creditsDeducted: 0,
    amountAZN: pkg.priceAZN,
    realApiCostAZN: 0,
    profitAZN: pkg.priceAZN, // Sale of credits
    isFreeTrial: false,
    status: 'success',
    metadata: { packageId, credits: pkg.credits, priceAZN: pkg.priceAZN }
  });

  return wallet;
}
