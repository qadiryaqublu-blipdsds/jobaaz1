import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Briefcase,
  GraduationCap,
  Award,
  Phone,
  Mail,
  Lock,
  Unlock,
  CheckCircle2,
  ExternalLink,
  Download,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  X,
  UserCheck,
  Building2,
  Send,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Eye,
  Compass,
  Map,
  Truck,
  Globe,
  Layers,
  RotateCcw,
  Loader2,
  CreditCard,
  AlertCircle,
  Check,
  Zap,
  ShieldAlert,
  LogIn,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { CandidateProfile, User, Company } from '../../types';
import {
  CANDIDATE_REGIONS,
  SPECIAL_WORK_PREFERENCES,
  RegionMatchMode,
  isCandidateInRegion,
  getRegionDisplayName,
} from '../../data/candidateRegions';
import { GoogleCandidateMap } from './GoogleCandidateMap';
import {
  getPublicCandidateProfiles,
  getEmployerUnlockedCandidateIds,
  unlockCandidateForEmployer
} from '../../services/firestoreService';
import { 
  checkFeatureAccess, 
  getUserActiveSubscription, 
  applySubscriptionUpgrade, 
  SUBSCRIPTION_PLANS,
  formatPrice 
} from '../../services/subscriptionService';
import { formatCardNumber } from '../../services/paymentService';
import { CVRenderer } from '../cv-templates/CVRenderer';
import { downloadCVAsPDF } from '../../utils/pdfExport';
import { usePDFDownload } from '../../hooks/usePDFDownload';
import { PDFDownloadProgressToast } from '../common/PDFDownloadProgressToast';
import { SectionBottomLogo } from '../common/SectionBottomLogo';

interface CandidateTalentPoolProps {
  currentUser: User | null;
  activeCompany: Company;
  onInviteToInterview?: (candidate: CandidateProfile) => void;
  onSendJobOffer?: (candidate: CandidateProfile) => void;
  onOpenPricingModal?: () => void;
  onRequireAuth?: () => void;
}

export const CandidateTalentPool: React.FC<CandidateTalentPoolProps> = ({
  currentUser,
  activeCompany,
  onInviteToInterview,
  onSendJobOffer,
  onOpenPricingModal,
  onRequireAuth
}) => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Hamısı');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [regionMatchMode, setRegionMatchMode] = useState<RegionMatchMode>('any');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('Hamısı');
  const [selectedExperience, setSelectedExperience] = useState('Hamısı');
  const [showRegionalMap, setShowRegionalMap] = useState<boolean>(false);

  // Paywall & Unlocking State
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [paywallCandidate, setPaywallCandidate] = useState<CandidateProfile | null>(null);
  const [previewingCandidateCV, setPreviewingCandidateCV] = useState<CandidateProfile | null>(null);
  const [isProcessingUnlock, setIsProcessingUnlock] = useState(false);
  const [unlockSuccessMessage, setUnlockSuccessMessage] = useState<string | null>(null);

  // PDF Export hook for employer downloading candidate CV
  const {
    isDownloading: isDownloadingTalentPDF,
    progressPercent: talentPdfProgressPercent,
    progressStatus: talentPdfProgressStatus,
    showToast: showTalentPdfToast,
    fileName: talentPdfFileName,
    downloadPDF: triggerTalentPDFDownload,
    dismissToast: dismissTalentPdfToast
  } = usePDFDownload();

  // Check if current user is an employer
  const isEmployerUser = Boolean(currentUser && currentUser.role === 'business');

  // Employer subscription status
  const [activeSub, setActiveSub] = useState(() => 
    getUserActiveSubscription(currentUser?.id, 'business', currentUser?.email)
  );

  // Local storage quick unlock flag for this company
  const [localUnlocked, setLocalUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const cid = activeCompany?.id || currentUser?.id;
    return cid ? localStorage.getItem(`jobia_kadr_bank_unlocked_${cid}`) === 'true' : false;
  });

  // Strict check: ONLY an employer who has made payment can open the talent bank!
  const isKadrBankUnlocked = useMemo(() => {
    if (!isEmployerUser) return false;
    if (localUnlocked) return true;
    if (activeCompany?.subscriptionPlan === 'BUSINESS' || activeCompany?.subscriptionPlan === 'PRO') {
      return true;
    }
    if (activeSub && activeSub.status === 'ACTIVE' && activeSub.tier !== 'FREE') {
      if (activeSub.amount > 0 || checkFeatureAccess(activeSub, 'canSearchCandidateDatabase').allowed) {
        return true;
      }
    }
    return false;
  }, [isEmployerUser, localUnlocked, activeCompany, activeSub]);

  const hasGlobalSubscription = isKadrBankUnlocked;

  // Payment form states for Kadr Banki checkout
  const [payTier, setPayTier] = useState<'PRO' | 'BUSINESS'>('PRO');
  const [payCycle, setPayCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [payCardNumber, setPayCardNumber] = useState('');
  const [payCardHolder, setPayCardHolder] = useState(currentUser?.fullName || activeCompany?.name || 'Müəssisə Rəhbəri');
  const [payExpiry, setPayExpiry] = useState('12/28');
  const [payCvv, setPayCvv] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<string | null>(null);

  const handleFillDemoCard = () => {
    setPayCardNumber('4128 5543 8921 4242');
    setPayCardHolder(currentUser?.fullName || activeCompany?.name || 'Müəssisə Rəhbəri');
    setPayExpiry('12/28');
    setPayCvv('789');
    setPaymentError(null);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setPayCardNumber(formatted);
    }
  };

  const handleProcessPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser || currentUser.role !== 'business') {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    const cleanCard = payCardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15 && cleanCard !== '4128554389214242') {
      setPaymentError('Zəhmət olmasa düzgün 16 rəqəmli bank kart nömrəsi daxil edin və ya "Sınaq Kartını Doldur" düyməsindən istifadə edin.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 450));

      const planId = payTier === 'PRO' ? 'plan-employer-pro' : 'plan-employer-business';
      const result = applySubscriptionUpgrade({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.fullName || activeCompany.name || 'İşəgötürən',
        role: 'business',
        planId,
        billingCycle: payCycle,
        cardLast4: cleanCard.slice(-4) || '4242',
        paymentMethod: 'Bank Kartı (Onlayn Ödəniş - Kadr Bankı)'
      });

      const cid = activeCompany?.id || currentUser?.id;
      if (cid) {
        localStorage.setItem(`jobia_kadr_bank_unlocked_${cid}`, 'true');
      }
      if (activeCompany) {
        activeCompany.subscriptionPlan = payTier;
      }

      setLocalUnlocked(true);
      setActiveSub(result.subscription);
      setPaymentSuccessNotice(`🎉 Təbriklər! ${payTier === 'PRO' ? 'Pro Recruiter' : 'Enterprise'} planı aktivləşdirildi və Kadr Bankı tam açıldı!`);
      setTimeout(() => setPaymentSuccessNotice(null), 6000);
    } catch (err: any) {
      console.error('Payment failed:', err);
      setPaymentError(err.message || 'Ödəniş zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Load candidate profiles and unlocked states
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedCandidates, unlocked] = await Promise.all([
          getPublicCandidateProfiles(),
          Promise.resolve(getEmployerUnlockedCandidateIds(activeCompany.id || currentUser?.id || 'default_company'))
        ]);
        if (isMounted) {
          setCandidates(loadedCandidates);
          setUnlockedIds(unlocked);
        }
      } catch (err) {
        console.error('Error loading talent pool:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeCompany.id, currentUser?.id]);

  // Extract unique locations and top skills for filters
  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      if (c.location) {
        const city = c.location.split(',')[0].trim();
        if (city) set.add(city);
      }
    });
    return ['Hamısı', ...Array.from(set)];
  }, [candidates]);

  const topSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach((c) => {
      c.skills?.forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill]) => skill);
    return ['Hamısı', ...sorted];
  }, [candidates]);

  // Filtering candidates
  const filteredCandidates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return candidates.filter((cand) => {
      // Must have opted in to employer discovery
      if (cand.isOpenToEmployers === false || cand.profileVisibility === 'private') {
        return false;
      }

      if (q) {
        const textToMatch = `${cand.fullName} ${cand.professionalTitle} ${cand.about || ''} ${cand.skills?.join(' ') || ''}`.toLowerCase();
        if (!textToMatch.includes(q)) return false;
      }

      if (selectedLocation !== 'Hamısı') {
        if (!cand.location?.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // Regional Geo & Work-Eligibility Filter
      if (selectedRegion !== 'all') {
        if (!isCandidateInRegion(cand, selectedRegion, regionMatchMode)) {
          return false;
        }
      }

      if (selectedSkillFilter !== 'Hamısı') {
        const hasSkill = cand.skills?.some(
          (s) => s.toLowerCase() === selectedSkillFilter.toLowerCase()
        );
        if (!hasSkill) return false;
      }

      if (selectedExperience !== 'Hamısı') {
        const expCount = cand.workExperience?.length || 0;
        if (selectedExperience === 'junior' && expCount > 1) return false;
        if (selectedExperience === 'mid' && (expCount < 2 || expCount > 4)) return false;
        if (selectedExperience === 'senior' && expCount < 4) return false;
      }

      return true;
    });
  }, [candidates, searchQuery, selectedLocation, selectedSkillFilter, selectedExperience, selectedRegion, regionMatchMode]);

  // Is a specific candidate unlocked for this employer?
  const isCandidateUnlocked = (candidateId: string) => {
    if (hasGlobalSubscription) return true;
    return unlockedIds.includes(candidateId);
  };

  // Handle single candidate contact unlock (simulated checkout / 1-click unlock)
  const handleUnlockCandidate = async (candidate: CandidateProfile) => {
    setIsProcessingUnlock(true);
    try {
      const updated = unlockCandidateForEmployer(activeCompany.id || currentUser?.id || 'default_company', candidate.id);
      setUnlockedIds(updated);
      setUnlockSuccessMessage(`🎉 ${candidate.fullName} adlı namizədin əlaqə məlumatları uğurla açıldı!`);
      setPaywallCandidate(null);
      setTimeout(() => setUnlockSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to unlock candidate:', err);
    } finally {
      setIsProcessingUnlock(false);
    }
  };

  // Mask phone and email for locked profiles
  const maskPhone = (phone: string) => {
    if (!phone) return '+994 (50) •••-••-••';
    const clean = phone.trim();
    if (clean.length < 7) return '+994 (50) •••-••-••';
    return clean.slice(0, 7) + ' •••-••-' + clean.slice(-2);
  };

  const maskEmail = (email: string) => {
    if (!email) return 'k•••••@gmail.com';
    const parts = email.split('@');
    if (parts.length < 2) return 'k•••••@gmail.com';
    const name = parts[0];
    const maskedName = name.length > 2 ? name[0] + '•••••' + name.slice(-1) : '•••••';
    return `${maskedName}@${parts[1]}`;
  };

  if (!isKadrBankUnlocked) {
    const unitPrice = payCycle === 'yearly' ? (payTier === 'PRO' ? 39 : 99) : (payTier === 'PRO' ? 49 : 129);
    const totalAmount = payCycle === 'yearly' ? unitPrice * 12 : unitPrice;

    return (
      <div className="space-y-6 animate-fade-in text-left max-w-5xl mx-auto py-2">
        {/* Main Paywall Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0b1b2b] via-[#102a45] to-[#0b1b2b] text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#00a859]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Yalnız Ödənişli İşəgötürənlər Üçün Açıqdır</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                Kadr Bankına Giriş Bağlıdır
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Hörmətli işəgötürən, Kadr Bankı xidmətindən istifadə etmək və Azərbaycanın ən zəngin namizəd bazasını açmaq üçün ödəniş tələb olunur. Ödəniş təsdiqləndikdən sonra 1 500+ təsdiqlənmiş namizədin canlı CV-ləri, birbaşa əlaqə vasitələri (telefon, e-poçt, WhatsApp), region xəritəsi və PDF yükləmə imkanları dərhal açılacaqdır.
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* If user is NOT logged in or NOT business */}
            {!isEmployerUser ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-amber-950">
                    İşəgötürən Şirkət Hesabı Tələb Olunur
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800/90 leading-relaxed">
                    Kadr Bankı yalnız rəsmi qeydiyyatdan keçmiş şirkətlər və işəgötürənlər üçün nəzərdə tutulub. Giriş əldə etmək üçün əvvəlcə işəgötürən kimi daxil olun və ya yeni şirkət profili yaradın.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onRequireAuth?.()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>İşəgötürən Kimi Giriş Et</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequireAuth?.()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs sm:text-sm border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-slate-400" />
                    <span>Yeni Müəssisə Qeydiyyatı</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Employer is logged in -> Show Plan Selection & Instant Payment Form */
              <div className="space-y-8">
                {paymentSuccessNotice && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{paymentSuccessNotice}</span>
                  </div>
                )}

                {paymentError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Step 1: Choose Employer Plan */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#00a859] text-white flex items-center justify-center text-xs font-black">1</span>
                        <span>İşəgötürən Paketini Seçin</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Kadr Bankını dərhal açmaq üçün uyğun paketi seçin.
                      </p>
                    </div>

                    {/* Cycle Toggle */}
                    <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 self-start sm:self-auto text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setPayCycle('monthly')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          payCycle === 'monthly'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Aylıq
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayCycle('yearly')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                          payCycle === 'yearly'
                            ? 'bg-white text-[#00a859] shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>İllik</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#00a859]/10 text-[#00a859] font-black">
                          -20%
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option 1: Pro Recruiter */}
                    <div
                      onClick={() => setPayTier('PRO')}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        payTier === 'PRO'
                          ? 'border-[#00a859] bg-[#00a859]/5 ring-2 ring-[#00a859]/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                            Populyar Seçim
                          </span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${payTier === 'PRO' ? 'border-[#00a859] bg-[#00a859] text-white' : 'border-slate-300'}`}>
                            {payTier === 'PRO' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-slate-900">Pro Recruiter</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Aktiv işçi axtaran və namizəd bazasını açmaq istəyən şirkətlər üçün.
                          </p>
                        </div>

                        <div className="pt-2">
                          <span className="text-3xl font-black text-slate-900">
                            {payCycle === 'yearly' ? '39' : '49'} ₼
                          </span>
                          <span className="text-xs text-slate-500 font-medium"> / ay</span>
                          {payCycle === 'yearly' && (
                            <span className="block text-[11px] text-[#00a859] font-bold mt-0.5">
                              İllik hesablaşma: 468 ₼ (120 ₼ qənaət)
                            </span>
                          )}
                        </div>

                        <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                          <li className="flex items-center gap-2 font-bold text-slate-900">
                            <CheckCircle2 className="w-4 h-4 text-[#00a859] shrink-0" />
                            <span>Kadr Bankına TAM Giriş (Bütün Namizədlər)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#00a859] shrink-0" />
                            <span>Telefon, E-poçt və WhatsApp əlaqələrinə baxış</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#00a859] shrink-0" />
                            <span>5 aktiv vakansiya elanı</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#00a859] shrink-0" />
                            <span>Rəsmi A4 PDF CV yükləmə & çap</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#00a859] shrink-0" />
                            <span>AI Namizəd Uyğunluq Skoru & Smart Offer</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Option 2: Enterprise / Business */}
                    <div
                      onClick={() => setPayTier('BUSINESS')}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        payTier === 'BUSINESS'
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                            Limitsiz Korporativ
                          </span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${payTier === 'BUSINESS' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                            {payTier === 'BUSINESS' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-slate-900">Enterprise / Business</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Böyük şirkətlər, holdinqlər və limitsiz işə qəbul üçün.
                          </p>
                        </div>

                        <div className="pt-2">
                          <span className="text-3xl font-black text-slate-900">
                            {payCycle === 'yearly' ? '99' : '129'} ₼
                          </span>
                          <span className="text-xs text-slate-500 font-medium"> / ay</span>
                          {payCycle === 'yearly' && (
                            <span className="block text-[11px] text-blue-600 font-bold mt-0.5">
                              İllik hesablaşma: 1 188 ₼ (360 ₼ qənaət)
                            </span>
                          )}
                        </div>

                        <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
                          <li className="flex items-center gap-2 font-bold text-slate-900">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Limitsiz Kadr Bankı və VIP Axtarış</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Limitsiz aktiv vakansiya elanları</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Bütün AI Alətləri (ATS, Müsahibə xülasəsi)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Komanda HR menecerləri idarəetməsi</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>7/24 Şəxsi HR Menecer & VIP Dəstək</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Instant Card Checkout Form */}
                <form onSubmit={handleProcessPayment} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#00a859] text-white flex items-center justify-center text-xs font-black">2</span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        Təhlükəsiz Onlayn Ödəniş və Kadr Bankının Açılması
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={handleFillDemoCard}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Sınaq Kartını Doldur (Test)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Kart Nömrəsi</label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={payCardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4128 •••• •••• 4242"
                          maxLength={19}
                          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Kart Sahibi</label>
                      <input
                        type="text"
                        required
                        value={payCardHolder}
                        onChange={(e) => setPayCardHolder(e.target.value)}
                        placeholder="Şirkət nümayəndəsinin adı"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Bitmə Tarixi</label>
                        <input
                          type="text"
                          required
                          value={payExpiry}
                          onChange={(e) => setPayExpiry(e.target.value)}
                          placeholder="12/28"
                          maxLength={5}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 text-center"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">CVV</label>
                        <input
                          type="password"
                          required
                          value={payCvv}
                          onChange={(e) => setPayCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#00a859] focus:ring-2 focus:ring-[#00a859]/20 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-3 text-slate-500 text-xs">
                      <ShieldCheck className="w-5 h-5 text-[#00a859]" />
                      <span>256-bit SSL Təhlükəsiz Ödəniş • Visa / MasterCard / Birbank</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full sm:w-auto px-8 py-3 bg-[#00a859] hover:bg-[#00924c] disabled:opacity-50 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Ödəniş Təsdiqlənir...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{totalAmount} ₼ Ödə və Kadr Bankını Aç</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Teaser Preview: 3 Blurred Candidate Cards */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Kadr Bankında Sizi Gözləyən Namizədlər (İlkin Baxış)</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Cəmi: 1 500+ peşəkar
                </span>
              </div>

              <div className="relative">
                {/* Overlay Lock Banner */}
                <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white">
                  <div className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center mb-3 shadow-lg">
                    <Lock className="w-6 h-6 text-amber-500" />
                  </div>
                  <h4 className="text-base sm:text-lg font-black tracking-tight">
                    Namizədlərin Canlı CV-ləri və Əlaqələri Kilidlidir
                  </h4>
                  <p className="text-xs text-slate-200 mt-1 max-w-md">
                    Bütün namizədlərin birbaşa telefon nömrələri, e-poçtları və tam təcrübə sənədləri ödənişdən sonra tam açılır.
                  </p>
                </div>

                {/* 3 Sample Dummy / Blurred Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 filter blur-[1.5px] pointer-events-none select-none opacity-50">
                  {[
                    { name: 'Rauf Əliyev', title: 'Senior Full Stack Developer', city: 'Bakı', exp: '6 il', skills: ['React', 'Node.js', 'PostgreSQL'] },
                    { name: 'Leyla Qasımova', title: 'Baş Mühasib / Maliyyə Meneceri', city: 'Bakı', exp: '8 il', skills: ['1C 8.3', 'Vergi', 'IFRS'] },
                    { name: 'Tural Məmmədov', title: 'B2B Satış və Əməliyyat Direktoru', city: 'Sumqayıt', exp: '5 il', skills: ['B2B Sales', 'CRM', 'Tərəfdaşlıq'] },
                  ].map((cand, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                          {cand.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{cand.name}</div>
                          <div className="text-[11px] text-slate-500">{cand.title}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>📍 {cand.city}</span>
                        <span>•</span>
                        <span>💼 {cand.exp} təcrübə</span>
                      </div>
                      <div className="flex gap-1 flex-wrap pt-1">
                        {cand.skills.map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <SectionBottomLogo />
      </div>
    );
  }

  return (
    <div className="space-y-2.5 animate-fade-in text-left">
      {/* Top Header & Search Bar styled with Jobia logo colors */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2.5 sm:p-3 space-y-2">
        {/* Title row with pure 'Kadr Bankı' branding */}
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00a859]/10 text-[#00a859] flex items-center justify-center font-black">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#0b1b2b] tracking-tight leading-none">
                Kadr Bankı
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#00a859]/10 text-[#00a859] text-[11px] font-bold border border-[#00a859]/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00a859]" />
              Ödənişli Giriş: Limitsiz Kadr Bankı
            </span>

            <button
              type="button"
              onClick={() => setShowRegionalMap(!showRegionalMap)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                showRegionalMap
                  ? 'bg-[#00a859] text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-[#0b1b2b] border border-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-current" />
              <span>{showRegionalMap ? 'Xəritəni Bağla' : 'Xəritə'}</span>
            </button>
          </div>
        </div>

        {/* Search and Filters row */}
        <div className="flex flex-col sm:flex-row items-stretch gap-1.5">
          {/* Main Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="talent-pool-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vəzifə, namizəd və ya bacarıq axtarın..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-[#00a859] focus:bg-white rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 p-0.5 rounded cursor-pointer transition-colors"
                title="Təmizlə"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Region Selector */}
          <div className="w-full sm:w-40 shrink-0">
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                if (e.target.value !== 'all') setSelectedLocation('Hamısı');
              }}
              className="w-full py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:border-[#00a859] focus:bg-white outline-none cursor-pointer shadow-2xs transition-all"
            >
              <option value="all">📍 Bütün Regionlar</option>
              {CANDIDATE_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.shortName}
                </option>
              ))}
              <option value="remote">🌐 Remote</option>
            </select>
          </div>

          {/* Experience Selector */}
          <div className="w-full sm:w-32 shrink-0">
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:border-[#00a859] focus:bg-white outline-none cursor-pointer shadow-2xs transition-all"
            >
              <option value="Hamısı">💼 Təcrübə</option>
              <option value="junior">Junior (&lt; 1 il)</option>
              <option value="mid">Mid (1-3 il)</option>
              <option value="senior">Senior (4+ il)</option>
            </select>
          </div>

          {(searchQuery || selectedRegion !== 'all' || selectedExperience !== 'Hamısı' || selectedSkillFilter !== 'Hamısı') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('all');
                setSelectedLocation('Hamısı');
                setSelectedSkillFilter('Hamısı');
                setSelectedExperience('Hamısı');
              }}
              className="px-2 py-1.5 text-slate-500 hover:text-rose-600 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0 border border-slate-200"
              title="Filtrləri sıfırla"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Sıfırla</span>
            </button>
          )}
        </div>

        {/* Counter indicator bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-0.5 pt-0.5">
          <span>
            Tapılan namizəd: <strong className="text-[#0b1b2b]">{filteredCandidates.length}</strong>
          </span>
          <span className="text-[10px] text-slate-400">
            Kompakt Kadr Bankı Görünüşü
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {unlockSuccessMessage && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00a859] shrink-0" />
            <span>{unlockSuccessMessage}</span>
          </div>
          <button
            onClick={() => setUnlockSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* REAL GOOGLE MAPS CANDIDATE SELECTOR WITH COMPACT DETAILS BOX */}
      {showRegionalMap && (
        <GoogleCandidateMap
          candidates={filteredCandidates}
          selectedRegion={selectedRegion}
          onSelectRegion={(regId) => setSelectedRegion(regId)}
          isCandidateUnlocked={isCandidateUnlocked}
          onUnlockCandidate={(cand) => setPaywallCandidate(cand)}
          onPreviewCV={(cand) => setPreviewingCandidateCV(cand)}
          maskPhone={maskPhone}
          maskEmail={maskEmail}
          onCloseMap={() => setShowRegionalMap(false)}
        />
      )}

      {/* Candidate Cards Grid - COMPACT DESIGN THAT TAKES MINIMAL SPACE */}
      {isLoading ? (
        <div className="py-12 text-center space-y-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="w-5 h-5 border-2 border-[#00a859] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Yüklənir...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="py-10 text-center space-y-2 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Axtarışınıza uyğun namizəd tapılmadı.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLocation('Hamısı');
              setSelectedRegion('all');
              setRegionMatchMode('any');
              setSelectedSkillFilter('Hamısı');
              setSelectedExperience('Hamısı');
            }}
            className="px-3 py-1 bg-[#00a859] hover:bg-[#00914c] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Filtrləri Sıfırla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5">
          {filteredCandidates.map((candidate) => {
            const isUnlocked = isCandidateUnlocked(candidate.id);

            return (
              <div
                key={candidate.id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-[#00a859]/50 p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-2 group"
              >
                {/* Header: Avatar, Name, Title, and Salary */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={
                          candidate.profilePhoto ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(candidate.fullName)}`
                        }
                        alt={candidate.fullName}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-white p-0.5 shadow-2xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 leading-tight">
                        <h3 className="text-xs sm:text-[13px] font-bold text-[#0b1b2b] truncate group-hover:text-[#00a859] transition-colors">
                          {candidate.fullName}
                        </h3>
                        <p className="text-[11px] text-slate-600 font-medium truncate">
                          {candidate.professionalTitle}
                        </p>
                      </div>
                    </div>

                    {candidate.expectedSalary ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#00a859]/10 text-[#00a859] border border-[#00a859]/20 font-black text-[11px] shrink-0 whitespace-nowrap">
                        {candidate.expectedSalary.toLocaleString()} ₼
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        {candidate.livingCity || candidate.location || 'Bakı'}
                      </span>
                    )}
                  </div>

                  {/* Compact meta row: Location & Work Experience */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium truncate">
                    <span className="flex items-center gap-0.5 text-slate-600 truncate">
                      <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      <span className="truncate">{candidate.livingCity || candidate.location || 'Bakı'}</span>
                    </span>

                    {candidate.workExperience && candidate.workExperience.length > 0 && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-0.5 text-slate-600 shrink-0">
                          <Briefcase className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>{candidate.workExperience.length} iş</span>
                        </span>
                      </>
                    )}

                    {candidate.willingToRelocate && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-[#00a859] font-bold shrink-0">Ezamiyyət</span>
                      </>
                    )}
                  </div>

                  {/* Micro skills tags (compact 2-3 pills max) */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-1.5 py-0.5 bg-slate-50 border border-slate-200/80 text-slate-700 rounded text-[10px] font-medium truncate max-w-[110px]"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="text-slate-400 text-[9px] font-bold">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Micro contact row */}
                  <div className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200/70 text-[10px] flex items-center justify-between gap-1 text-slate-600">
                    <div className="flex items-center gap-1 min-w-0">
                      <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      {isUnlocked ? (
                        <a href={`tel:${candidate.phone}`} className="hover:underline text-[#00a859] font-bold truncate">
                          {candidate.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 font-mono truncate">
                          {maskPhone(candidate.phone)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 min-w-0">
                      <Mail className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      {isUnlocked ? (
                        <a href={`mailto:${candidate.email}`} className="hover:underline text-[#00a859] font-bold truncate max-w-[100px]">
                          {candidate.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 font-mono truncate max-w-[90px]">
                          {maskEmail(candidate.email)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions: Ultra-compact button row */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                  {isUnlocked ? (
                    <div className="flex items-center justify-between w-full gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewingCandidateCV(candidate)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[#0b1b2b] text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                        title="CV-yə tam bax"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>CV</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {onInviteToInterview && (
                          <button
                            type="button"
                            onClick={() => onInviteToInterview(candidate)}
                            className="px-2 py-1 bg-[#00a859] hover:bg-[#00914c] text-white text-[10px] font-bold rounded-md transition-all shadow-2xs flex items-center gap-0.5 cursor-pointer"
                          >
                            <Calendar className="w-2.5 h-2.5" />
                            <span>Müsahibə</span>
                          </button>
                        )}

                        {onSendJobOffer && (
                          <button
                            type="button"
                            onClick={() => onSendJobOffer(candidate)}
                            className="px-2 py-1 bg-[#0b1b2b] hover:bg-slate-800 text-white text-[10px] font-bold rounded-md transition-colors flex items-center gap-0.5 cursor-pointer"
                          >
                            <Award className="w-2.5 h-2.5" />
                            <span>Təklif</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id={`unlock-candidate-btn-${candidate.id}`}
                      onClick={() => setPaywallCandidate(candidate)}
                      className="w-full py-1.5 px-2 bg-[#00a859] hover:bg-[#00914c] active:scale-98 text-white font-bold text-xs rounded-lg transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-3 h-3 text-emerald-200" />
                      <span>Əlaqəni Aç (19 ₼)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section Bottom Logo */}
      <SectionBottomLogo size="sm" tagline="İşəgötürənlər üçün rəsmi Kadr Bankı və birbaşa namizəd bazası" />

      {/* ========================================================================= */}
      {/* TALENT POOL PAYWALL / UNLOCK MODAL                                        */}
      {/* ========================================================================= */}
      {paywallCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] my-auto rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative">
            <button
              onClick={() => setPaywallCandidate(null)}
              className="absolute right-3.5 top-3.5 z-10 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 min-h-0">
              {/* Modal Header */}
              <div className="text-center space-y-1.5 pt-1">
                <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mx-auto border border-slate-200">
                  <Lock className="w-5 h-5 text-slate-600" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Namizədin Əlaqə Vasitələri
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  <strong>{paywallCandidate.fullName}</strong> ({paywallCandidate.professionalTitle}) ilə birbaşa əlaqə və tam CV:
                </p>
              </div>

              {/* What you get list */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Birbaşa telefon və WhatsApp nömrəsi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Şəxsi e-poçt ünvanı</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Rəsmi PDF CV faylı</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Müsahibə dəvəti və ya iş təklifi göndərmə imkanı</span>
                </div>
              </div>

              {/* Unlock Options */}
              <div className="space-y-2.5">
                {/* Option 1: Instant Single Candidate Unlock (19 AZN) */}
                <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Tək Namizəd Əlaqəsi</div>
                    <div className="text-[11px] text-slate-500">Yalnız bu namizədin məlumatlarını dərhal açın</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-slate-900">19 ₼</div>
                    <button
                      type="button"
                      disabled={isProcessingUnlock}
                      onClick={() => handleUnlockCandidate(paywallCandidate)}
                      className="mt-1 px-3.5 py-1.5 bg-[#00a859] hover:bg-[#00914c] active:scale-98 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingUnlock ? 'Açılır...' : 'Aç'}
                    </button>
                  </div>
                </div>

                {/* Option 2: Full Subscription Upgrade */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Pro / Business Abunəlik</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Bütün namizədlər bazasına limitsiz giriş
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-slate-900">49 ₼ <span className="text-[10px] text-slate-400 font-normal">/ ay</span></div>
                    <button
                      type="button"
                      onClick={() => {
                        setPaywallCandidate(null);
                        if (onOpenPricingModal) onOpenPricingModal();
                      }}
                      className="mt-1 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Planlar →
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setPaywallCandidate(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  İmtina Et və Bağla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANDIDATE FULL CV PREVIEW MODAL                                           */}
      {/* ========================================================================= */}
      {previewingCandidateCV && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] my-auto">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    previewingCandidateCV.profilePhoto ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(previewingCandidateCV.fullName)}`
                  }
                  alt={previewingCandidateCV.fullName}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {previewingCandidateCV.fullName} - Rəsmi CV
                  </h3>
                  <p className="text-xs text-slate-500">
                    {previewingCandidateCV.professionalTitle} • {previewingCandidateCV.phone} • {previewingCandidateCV.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await triggerTalentPDFDownload('talent-pool-cv-render-container', {
                      fileName: `${previewingCandidateCV.fullName.replace(/\s+/g, '_')}_CV.pdf`,
                    });
                  }}
                  disabled={isDownloadingTalentPDF}
                  className="relative overflow-hidden px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-95"
                >
                  {isDownloadingTalentPDF && (
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-800/80 transition-all duration-300"
                      style={{ width: `${Math.max(6, Math.min(100, talentPdfProgressPercent))}%` }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isDownloadingTalentPDF ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-200" />
                        <span className="font-extrabold text-blue-200">{talentPdfProgressPercent}%</span>
                        <span>{talentPdfProgressStatus || 'Hazırlanır...'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF Yüklə</span>
                      </>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => setPreviewingCandidateCV(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
              <div
                id="talent-pool-cv-render-container"
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 max-w-3xl mx-auto"
              >
                <CVRenderer
                  data={
                    previewingCandidateCV.cvData || {
                      id: previewingCandidateCV.id,
                      title: `${previewingCandidateCV.fullName} - CV`,
                      lastUpdated: previewingCandidateCV.updatedAt || new Date().toISOString(),
                      personalInfo: {
                        fullName: previewingCandidateCV.fullName,
                        jobTitle: previewingCandidateCV.professionalTitle,
                        email: previewingCandidateCV.email,
                        phone: previewingCandidateCV.phone,
                        address: previewingCandidateCV.location,
                        summary: previewingCandidateCV.about,
                      },
                      experiences: previewingCandidateCV.workExperience?.map((w) => ({
                        id: w.id,
                        company: w.company,
                        position: w.position || w.role || 'Mütəxəssis',
                        role: w.role || w.position || 'Mütəxəssis',
                        location: w.location || '',
                        startDate: w.startDate || (w.period ? w.period.split('-')[0]?.trim() : '') || '',
                        endDate: w.endDate || (w.period ? w.period.split('-')[1]?.trim() : '') || '',
                        period: w.period || `${w.startDate || ''} - ${w.endDate || ''}`,
                        current: w.current !== undefined ? w.current : Boolean(w.period?.includes('Hal-hazırda')),
                        description: w.description,
                      })) || [],
                      education: previewingCandidateCV.education?.map((e) => ({
                        id: e.id,
                        institution: e.institution || e.school || '',
                        school: e.institution || e.school || '',
                        degree: e.degree,
                        fieldOfStudy: e.fieldOfStudy || '',
                        startDate: e.startDate || '',
                        endDate: e.endDate || e.graduationYear || '',
                        graduationYear: e.graduationYear || e.endDate || '',
                        current: e.current || false,
                        description: e.description || '',
                      })) || [],
                      skills: previewingCandidateCV.skills?.map((s, idx) => ({
                        id: `s-${idx}`,
                        name: s,
                        level: 'Yaxşı',
                        category: 'Texniki',
                      })) || [],
                      languages: previewingCandidateCV.languages?.map((l) => ({
                        id: l.id,
                        language: l.language,
                        proficiency: l.proficiency,
                      })) || [],
                      certificates: previewingCandidateCV.certifications?.map((c) => ({
                        id: c.id,
                        name: c.name,
                        issuer: c.issuer,
                        issueDate: c.issueDate || c.year || '',
                        year: c.year || c.issueDate || '',
                      })) || [],
                      projects: [],
                      template: previewingCandidateCV.cvData?.template || (previewingCandidateCV as any).preferredCvTemplate || 'modern-emerald',
                    }
                  }
                  template={previewingCandidateCV.cvData?.template || (previewingCandidateCV as any).preferredCvTemplate || 'modern-emerald'}
                  showPhoto={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Floating Progress & Toast */}
      <PDFDownloadProgressToast
        isDownloading={isDownloadingTalentPDF}
        progressPercent={talentPdfProgressPercent}
        progressStatus={talentPdfProgressStatus}
        showToast={showTalentPdfToast}
        fileName={talentPdfFileName}
        onDismissToast={dismissTalentPdfToast}
      />
    </div>
  );
};
