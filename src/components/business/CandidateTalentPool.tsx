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
  Loader2
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
import { checkFeatureAccess, getUserActiveSubscription } from '../../services/subscriptionService';
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

  // Check if current employer has subscription feature access
  const subscriptionAccess = useMemo(() => {
    const sub = getUserActiveSubscription(currentUser?.id, 'business', currentUser?.email);
    return checkFeatureAccess(sub, 'canSearchCandidateDatabase');
  }, [currentUser]);

  const hasGlobalSubscription = Boolean(
    activeCompany?.subscriptionPlan === 'BUSINESS' ||
    subscriptionAccess.allowed
  );

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
            {hasGlobalSubscription ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00a859]/10 text-[#00a859] text-[10px] font-bold border border-[#00a859]/20">
                <CheckCircle2 className="w-3 h-3 text-[#00a859]" />
                Limitsiz Giriş
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400">
                <Lock className="w-2.5 h-2.5" />
                Əlaqələr qorunur
              </span>
            )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
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
                      template: 'modern-emerald',
                    }
                  }
                  template="modern-emerald"
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
