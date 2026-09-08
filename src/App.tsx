import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserRole, 
  Vacancy, 
  Company, 
  Application, 
  CVData, 
  ApplicationStatus,
  CVTemplateType,
  JobOffer,
  OfferAuditLog,
  JobOfferTemplate,
  User,
  AuthSession,
  UserSubscription,
  SubscriptionPlan,
  BillingCycle,
  AppNotification
} from './types';
import { 
  SAMPLE_VACANCIES, 
  SAMPLE_COMPANIES, 
  SAMPLE_APPLICATIONS, 
  SAMPLE_CANDIDATE_CV,
  INITIAL_EMPTY_CV
} from './data/mockData';
import { getCurrentUser, getCurrentSession, logoutUser } from './services/authService';
import { getUserSubscription, checkFeatureAccess, SUBSCRIPTION_PLANS } from './services/subscriptionService';
import { 
  getPublishedVacancies, 
  getAllVacanciesFromFirestore, 
  getAllCompaniesFromFirestore,
  getAllApplicationsFromFirestore,
  getCandidateApplications,
  getCompanyApplications,
  saveVacancyToFirestore,
  updateVacancyStatus,
  deleteVacancyFromFirestore,
  createJobOfferInFirestore,
  respondToJobOffer,
  getCompanyOffers,
  getCandidateOffers,
  saveCandidateProfile,
  getCandidateProfile,
  setCompanyVerificationStatus,
  updateApplicationStatus,
  submitJobApplication,
  updateCompanyProfile,
  saveApplicationDirectToFirestore,
  subscribeToUserNotifications,
  subscribeToAllVacancies,
  subscribeToAllCompanies,
  subscribeToCompanyApplications,
  subscribeToCandidateApplications,
  getVacancyByIdFromFirestore,
  recordAdminAuditLog,
  notifySubscribersOfNewVacancy
} from './services/firestoreService';
import { calculateApplicationMatchScore } from './utils/applicationMatcher';
import { Header } from './components/Header';
import { LiveNotificationToast } from './components/notifications/LiveNotificationToast';
import { JobiaLogo, HireMeLogo } from './components/JobiaLogo';
import { JobExplorer } from './components/candidate/JobExplorer';
import { JobDetailModal } from './components/candidate/JobDetailModal';
import { JobAlertManagerModal } from './components/candidate/JobAlertManagerModal';
import { NearbyJobsMap } from './components/candidate/NearbyJobsMap';
import { InterviewPrepModal } from './components/candidate/InterviewPrepModal';
import { MyApplications } from './components/candidate/MyApplications';
import { SalaryTrendsView } from './components/candidate/SalaryTrendsView';
import { BusinessDashboard } from './components/business/BusinessDashboard';
import { PostJobModal } from './components/business/PostJobModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GoogleChatHub } from './components/chat/GoogleChatHub';
import { CVRenderer } from './components/cv-templates/CVRenderer';
import { downloadCVAsPDF, generateCVFileName } from './utils/pdfExport';
import { CandidateOfferPortal } from './components/interview-offer/CandidateOfferPortal';
import { getOfferTemplates, saveOfferTemplates } from './services/offerTemplateService';
import { calculateNetSalary } from './services/salaryCalculator';
import { SalariaCalculator } from './components/candidate/SalariaCalculator';
import { DeepCVAnalyzerView } from './components/candidate/cv-analyzer/DeepCVAnalyzerView';
import { CVCreator } from './components/candidate/CVCreator';
import { AuthModal } from './components/auth/AuthModal';
import { VerifyAccountModal } from './components/auth/VerifyAccountModal';
import { PricingPage } from './components/subscription/PricingPage';
import { CheckoutModal } from './components/subscription/CheckoutModal';
import { PaywallModal } from './components/subscription/PaywallModal';
import { IntroTourModal } from './components/IntroTourModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { MobileFrozenBottomBar } from './components/MobileFrozenBottomBar';
import { ModalBottomLogo } from './components/ModalBottomLogo';
import { 
  resendVerificationEmail, 
  checkAndSyncVerificationStatus, 
  checkVerificationRateLimit 
} from './services/firebaseAuth';
import { ShieldAlert, ShieldCheck, RefreshCw, Mail } from 'lucide-react';
import { 
  X, 
  CheckCircle, 
  Sparkles, 
  Heart, 
  Download, 
  Loader2, 
  Printer, 
  MessageSquare, 
  Award,
  CreditCard,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';

// Helper function to safely merge applications from Firestore and LocalStorage
function mergeApplicationLists(firestoreApps: Application[], localApps: Application[]): Application[] {
  const map = new Map<string, Application>();

  // 1. First add local applications
  (localApps || []).forEach((app) => {
    if (app && app.id) {
      map.set(app.id, app);
    }
  });

  // 2. Merge Firestore applications (Firestore takes priority for status/notes, but keeps full local CV data if present)
  (firestoreApps || []).forEach((fsApp) => {
    if (fsApp && fsApp.id) {
      const existing = map.get(fsApp.id);
      map.set(fsApp.id, {
        ...fsApp,
        cvFileData: existing?.cvFileData || fsApp.cvFileData,
        cvData: fsApp.cvData || existing?.cvData,
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    const timeA = new Date(a.appliedDate || (a as any).createdAt || 0).getTime();
    const timeB = new Date(b.appliedDate || (b as any).createdAt || 0).getTime();
    return timeB - timeA;
  });
}

/**
 * Merge Firestore vacancies with locally stored vacancies so that newly created
 * or edited vacancies are immediately preserved and synced across sessions.
 */
function mergeVacancyLists(remoteVacancies: Vacancy[], localVacancies: Vacancy[]): Vacancy[] {
  const map = new Map<string, Vacancy>();

  // 1. Seed with local vacancies
  (localVacancies || []).forEach((vac) => {
    if (vac && vac.id) {
      map.set(vac.id, vac);
    }
  });

  // 2. Merge remote Firestore vacancies
  (remoteVacancies || []).forEach((rVac) => {
    if (rVac && rVac.id) {
      const existing = map.get(rVac.id);
      if (!existing) {
        map.set(rVac.id, rVac);
      } else {
        const remoteUpdated = new Date(rVac.updatedAt || rVac.createdAt || 0).getTime();
        const localUpdated = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        if (remoteUpdated >= localUpdated) {
          map.set(rVac.id, { ...existing, ...rVac });
        } else {
          map.set(rVac.id, existing);
        }
      }
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    const timeA = new Date(a.createdAt || a.postedDate || 0).getTime();
    const timeB = new Date(b.createdAt || b.postedDate || 0).getTime();
    return timeB - timeA;
  });
}

export default function App() {
  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('candidate');
  const [candidateTab, setCandidateTab] = useState<'jobs' | 'nearby-map' | 'my-applications' | 'salary-trends' | 'calculia' | 'google-chat' | 'cv-analyzer' | 'cv-creator'>('jobs');
  const [calculiaSubTab, setCalculiaSubTab] = useState<'calculia' | 'vacatia'>('calculia');
  const [analyzerPrefillText, setAnalyzerPrefillText] = useState<string>('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('Hamısı');
  const [isPricingViewOpen, setIsPricingViewOpen] = useState(false);
  const [isIntroTourOpen, setIsIntroTourOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jobia_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jobia_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Auto-launch intro tour for first-time visitors
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('jobia_intro_tour_completed');
    if (!hasCompletedTour) {
      const timer = setTimeout(() => {
        setIsIntroTourOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => getCurrentSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('candidate');
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [userToVerify, setUserToVerify] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'settings' | 'security'>('settings');
  const [isGlobalJobAlertModalOpen, setIsGlobalJobAlertModalOpen] = useState(false);

  const handleOpenProfileModal = (initialTab: 'profile' | 'settings' | 'security' = 'settings') => {
    if (!currentUser) {
      handleOpenAuth('login', currentRole);
      return;
    }
    setProfileModalTab(initialTab);
    setIsProfileModalOpen(true);
  };

  // Subscription & Monetization State
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(() => {
    const user = getCurrentUser();
    return getUserSubscription(user?.id, user?.role || 'candidate');
  });
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [checkoutCycle, setCheckoutCycle] = useState<BillingCycle>('yearly');

  // Paywall Modal State
  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState(false);
  const [paywallProps, setPaywallProps] = useState<{
    requiredTier: string;
    featureTitle: string;
    featureDescription?: string;
  }>({
    requiredTier: 'PRO',
    featureTitle: 'Premium Funksiya',
  });

  // Core Data State - Clean Real Firestore Storage
  const [vacancies, setVacancies] = useState<Vacancy[]>(() => {
    try {
      const saved = localStorage.getItem('jobia_vacancies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem('jobia_companies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [activeCompany, setActiveCompany] = useState<Company>(() => {
    if (currentUser?.companyId) {
      return {
        id: currentUser.companyId,
        name: currentUser.companyName || 'Müəssisə',
        logo: currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.companyName || 'Company')}`,
        verified: true,
        industry: 'Müəssisə və Biznes',
        location: 'Bakı, Azərbaycan',
        email: currentUser.email || 'info@company.az',
        description: currentUser.companyDescription || 'Şirkət haqqında rəsmi məlumat',
        employeeCount: '10-50',
        activeJobsCount: 0,
      };
    }
    return {
      id: 'comp-default',
      name: 'Müəssisə',
      logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Company',
      verified: true,
      industry: 'Müəssisə və Biznes',
      location: 'Bakı, Azərbaycan',
      email: 'info@company.az',
      description: 'Şirkət haqqında rəsmi məlumat',
      employeeCount: '10-50',
      activeJobsCount: 0,
    };
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const saved = localStorage.getItem('jobia_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sessionUser = getCurrentSession()?.user;
          if (sessionUser?.role === 'admin') return parsed;
          if (sessionUser?.role === 'candidate') {
            const userEmail = sessionUser.email?.toLowerCase().trim();
            return parsed.filter(
              (a) =>
                a.candidateId === sessionUser.id ||
                (userEmail && a.candidateEmail && a.candidateEmail.toLowerCase().trim() === userEmail)
            );
          }
          if (sessionUser?.role === 'business') {
            const compId = sessionUser.companyId;
            const compName = sessionUser.companyName?.toLowerCase().trim();
            return parsed.filter(
              (a) =>
                (compId && a.companyId === compId) ||
                (compName && a.companyName && a.companyName.toLowerCase().trim() === compName)
            );
          }
          // Unauthenticated Guest: only show guest applications created by this browser
          const guestIdsRaw = localStorage.getItem('jobia_guest_application_ids');
          const guestIds: string[] = guestIdsRaw ? JSON.parse(guestIdsRaw) : [];
          if (guestIds.length > 0) {
            return parsed.filter((a) => guestIds.includes(a.id) && (a.isGuestApplication || !a.candidateId));
          }
        }
      }
    } catch (e) {}
    return [];
  });

  const [candidateCV, setCandidateCV] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem('jobia_candidate_cv');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.personalInfo) return parsed;
      }
    } catch (e) {}
    return INITIAL_EMPTY_CV;
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jobia_saved_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [jobNotes, setJobNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('jobia_job_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return {};
  });

  // Job Offers & Audit Trail State
  const [jobOffers, setJobOffers] = useState<JobOffer[]>(() => {
    try {
      const saved = localStorage.getItem('jobia_job_offers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [offerAuditLogs, setOfferAuditLogs] = useState<OfferAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('jobia_offer_audit_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Automatically sync activeCompany when currentUser logs in as business
  useEffect(() => {
    if (currentUser?.role === 'business' && currentUser.companyId) {
      const existing = companies.find(
        (c) => c.id === currentUser.companyId || 
               (currentUser.companyName && c.name?.toLowerCase().trim() === currentUser.companyName.toLowerCase().trim())
      );
      if (existing) {
        setActiveCompany(existing);
      } else {
        setActiveCompany({
          id: currentUser.companyId,
          name: currentUser.companyName || 'Müəssisə',
          logo: currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.companyName || 'Company')}`,
          verified: false,
          industry: 'İnformasiya Texnologiyaları',
          location: 'Bakı, Azərbaycan',
          email: currentUser.email || '',
          description: currentUser.companyDescription || 'Şirkət haqqında rəsmi məlumat',
          employeeCount: '1-10',
          activeJobsCount: 0,
        });
      }
    }
  }, [currentUser, companies]);

  // Sync initial data from Firestore with role-based security
  useEffect(() => {
    async function loadInitialFirestoreData() {
      try {
        const [allJobs, allComps] = await Promise.all([
          getAllVacanciesFromFirestore(),
          getAllCompaniesFromFirestore(),
        ]);

        // Merge Firestore vacancies with local vacancies so newly posted/edited jobs are always retained
        try {
          const localSavedJobs = localStorage.getItem('jobia_vacancies');
          const localJobs: Vacancy[] = localSavedJobs ? JSON.parse(localSavedJobs) : [];
          const mergedJobs = mergeVacancyLists(allJobs || [], localJobs);
          setVacancies(mergedJobs);
        } catch {
          if (Array.isArray(allJobs) && allJobs.length > 0) setVacancies(allJobs);
        }

        if (Array.isArray(allComps)) setCompanies(allComps);

        // Strict Role-Isolated Application Fetching:
        // Regular candidates only get their own applications; employers only get their company's applications; guests get none from Firestore.
        let roleApps: Application[] = [];
        if (currentUser?.role === 'admin') {
          roleApps = await getAllApplicationsFromFirestore();
        } else if (currentUser?.role === 'candidate') {
          roleApps = await getCandidateApplications(currentUser.id, currentUser.email);
        } else if (currentUser?.role === 'business' && (currentUser.companyId || currentUser.companyName)) {
          roleApps = await getCompanyApplications(currentUser.companyId || '', currentUser.companyName);
        } else {
          // Unauthenticated guest: strictly 0 remote applications
          roleApps = [];
        }

        // Merge Firestore applications with local applications strictly for this user or guest device
        try {
          const localSaved = localStorage.getItem('jobia_applications');
          const localApps: Application[] = localSaved ? JSON.parse(localSaved) : [];
          let filteredLocal: Application[] = [];
          if (currentUser?.role === 'admin') {
            filteredLocal = localApps;
          } else if (currentUser?.role === 'candidate') {
            const userEmail = currentUser.email?.toLowerCase().trim();
            filteredLocal = localApps.filter(
              (a) =>
                a.candidateId === currentUser.id ||
                (userEmail && a.candidateEmail && a.candidateEmail.toLowerCase().trim() === userEmail)
            );
          } else if (currentUser?.role === 'business') {
            const compId = currentUser.companyId;
            const compName = currentUser.companyName?.toLowerCase().trim();
            filteredLocal = localApps.filter(
              (a) =>
                (compId && a.companyId === compId) ||
                (compName && a.companyName && a.companyName.toLowerCase().trim() === compName)
            );
          } else {
            const guestIdsRaw = localStorage.getItem('jobia_guest_application_ids');
            const guestIds: string[] = guestIdsRaw ? JSON.parse(guestIdsRaw) : [];
            filteredLocal = localApps.filter((a) => guestIds.includes(a.id) && (a.isGuestApplication || !a.candidateId));
          }

          const merged = mergeApplicationLists(roleApps, filteredLocal);
          setApplications(merged);
          localStorage.setItem('jobia_applications', JSON.stringify(merged));
        } catch {
          setApplications(roleApps);
        }

        if (currentUser?.role === 'candidate') {
          const [candOffers, candProf] = await Promise.all([
            getCandidateOffers(currentUser.id, currentUser.email),
            getCandidateProfile(currentUser.id),
          ]);
          if (Array.isArray(candOffers)) setJobOffers(candOffers);
          if (candProf) {
            setCandidateCV((prev) => ({
              ...prev,
              personalInfo: {
                ...prev.personalInfo,
                fullName: currentUser.fullName,
                email: currentUser.email,
                phone: currentUser.phone || prev.personalInfo.phone,
                jobTitle: candProf.professionalTitle || prev.personalInfo.jobTitle,
                summary: candProf.about || prev.personalInfo.summary,
              },
            }));
          }
        } else if (currentUser?.role === 'business' && currentUser.companyId) {
          const compOffers = await getCompanyOffers(currentUser.companyId);
          if (Array.isArray(compOffers)) setJobOffers(compOffers);
        }
      } catch (err) {
        console.warn('Firestore initial sync notice:', err);
      }
    }
    loadInitialFirestoreData();
  }, [currentUser]);

  // Realtime subscription to all vacancies for instant sync across browser tabs and devices
  useEffect(() => {
    const unsubscribe = subscribeToAllVacancies((remoteJobs) => {
      try {
        const localSaved = localStorage.getItem('jobia_vacancies');
        const localJobs: Vacancy[] = localSaved ? JSON.parse(localSaved) : [];
        const merged = mergeVacancyLists(remoteJobs || [], localJobs);
        setVacancies(merged);
      } catch {
        if (Array.isArray(remoteJobs) && remoteJobs.length > 0) {
          setVacancies(remoteJobs);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Realtime subscription to all companies for instant sync across devices
  useEffect(() => {
    const unsubscribe = subscribeToAllCompanies((remoteComps) => {
      if (Array.isArray(remoteComps) && remoteComps.length > 0) {
        setCompanies((prev) => {
          const compMap = new Map<string, Company>();
          prev.forEach((c) => compMap.set(c.id, c));
          remoteComps.forEach((c) => compMap.set(c.id, c));
          return Array.from(compMap.values());
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Realtime subscription to Applications based on current user role (Instant cross-network apply sync)
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'business') {
      const companyJobIds = vacancies
        .filter((v) => v.companyId === currentUser.companyId || v.createdBy === currentUser.id || v.createdBy === currentUser.email)
        .map((v) => v.id);

      const unsubscribe = subscribeToCompanyApplications(
        currentUser.companyId,
        currentUser.companyName,
        companyJobIds,
        (remoteApps) => {
          setApplications((prev) => mergeApplicationLists(remoteApps, prev));
        }
      );
      return () => unsubscribe();
    } else if (currentUser.role === 'candidate') {
      const unsubscribe = subscribeToCandidateApplications(
        currentUser.id,
        currentUser.email,
        (remoteApps) => {
          setApplications((prev) => mergeApplicationLists(remoteApps, prev));
        }
      );
      return () => unsubscribe();
    }
  }, [currentUser, vacancies]);

  // Cross-Network Direct Shared Vacancy Linking (?job=... or ?vacancy=...)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const sharedJobId = searchParams.get('job') || searchParams.get('vacancy');
      if (sharedJobId) {
        const found = vacancies.find((v) => v.id === sharedJobId);
        if (found) {
          setSelectedJobForDetail(found);
          setCandidateTab('jobs');
        } else {
          getVacancyByIdFromFirestore(sharedJobId).then((remoteJob) => {
            if (remoteJob) {
              setSelectedJobForDetail(remoteJob);
              setCandidateTab('jobs');
            }
          });
        }
      }
    } catch {}
  }, [vacancies]);

  const [offerTemplates, setOfferTemplates] = useState<JobOfferTemplate[]>(() => {
    try {
      return getOfferTemplates();
    } catch {
      return [];
    }
  });

  // Candidate Portal Navigation / Token State
  const [activePortalOffer, setActivePortalOffer] = useState<JobOffer | null>(null);

  // Modals & Drawers State
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Vacancy | null>(null);
  const [selectedJobForInterview, setSelectedJobForInterview] = useState<Vacancy | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [isGoogleChatModalOpen, setIsGoogleChatModalOpen] = useState(false);
  const [viewingSubmittedCVApp, setViewingSubmittedCVApp] = useState<Application | null>(null);
  const [selectedSubmittedTemplate, setSelectedSubmittedTemplate] = useState<CVTemplateType>('modern-emerald');
  const [isDownloadingSubmittedCV, setIsDownloadingSubmittedCV] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResendingVerif, setIsResendingVerif] = useState(false);
  const [isCheckingVerifStatus, setIsCheckingVerifStatus] = useState(false);

  // Real-time Notification Center State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [incomingToastNotif, setIncomingToastNotif] = useState<AppNotification | null>(null);

  // Real-time Notification Subscription
  useEffect(() => {
    const targetUserId = currentUser?.id || currentUser?.email || 'all';
    let isFirstBatch = true;
    let seenIds = new Set<string>();

    const unsubscribe = subscribeToUserNotifications(targetUserId, (notifList) => {
      setNotifications(notifList);

      if (!isFirstBatch) {
        // Look for any newly arrived unread notification
        const newest = notifList.find((n) => !seenIds.has(n.id) && !n.isRead);
        if (newest) {
          setIncomingToastNotif(newest);
        }
      } else {
        isFirstBatch = false;
      }
      seenIds = new Set(notifList.map((n) => n.id));
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle click on a notification to seamlessly navigate to destination
  const handleNavigateNotification = (notif: AppNotification) => {
    setIsPricingViewOpen(false);
    if (notif.type === 'new_matching_vacancy') {
      if (currentRole !== 'candidate') {
        setCurrentRole('candidate');
      }
      setCandidateTab('jobs');
      const vacId = notif.data?.vacancyId;
      if (vacId) {
        const foundJob = vacancies.find((v) => v.id === vacId);
        if (foundJob) {
          setSelectedJobForDetail(foundJob);
        }
      }
      return;
    }

    if (notif.type === 'job_offer') {
      if (currentRole !== 'candidate') {
        setCurrentRole('candidate');
      }
      setCandidateTab('my-applications');
    } else if (notif.type === 'interview_invite' || notif.type === 'status_changed') {
      if (currentRole !== 'candidate') {
        setCurrentRole('candidate');
      }
      setCandidateTab('my-applications');
    } else if (notif.type === 'new_applicant') {
      if (currentRole !== 'business') {
        setCurrentRole('business');
      }
    } else {
      if (currentRole !== 'candidate') {
        setCurrentRole('candidate');
      }
      setCandidateTab('my-applications');
    }
  };

  // Refresh user and subscription whenever role or user changes
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setAuthSession(getCurrentSession());
    if (user) {
      setCurrentSubscription(getUserSubscription(user.id, user.role));
      // Strict role isolation: candidate cannot view business/admin, business cannot view candidate/admin
      if (user.role === 'candidate' && currentRole !== 'candidate') {
        setCurrentRole('candidate');
      } else if (user.role === 'business' && currentRole !== 'business') {
        setCurrentRole('business');
      }
    } else {
      setCurrentSubscription(getUserSubscription(undefined, currentRole));
    }
  }, [currentRole]);

  // Sync active company when employer is logged in
  useEffect(() => {
    if (currentUser?.role === 'business') {
      const compId = currentUser.companyId || `comp-${currentUser.id}`;
      const matched = companies.find(
        (c) => c.id === compId || (c.name && currentUser.companyName && c.name.toLowerCase() === currentUser.companyName.toLowerCase())
      );
      if (matched) {
        setActiveCompany(matched);
      } else if (currentUser.companyName) {
        const userComp: Company = {
          id: compId,
          name: currentUser.companyName,
          logo: currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.companyName)}`,
          verified: false,
          verificationStatus: 'pending',
          industry: 'Müəssisə və Biznes',
          location: 'Bakı, Azərbaycan',
          email: currentUser.email || 'info@company.az',
          phone: currentUser.phone || '',
          description: currentUser.companyDescription || 'Şirkət haqqında rəsmi məlumat',
          employeeCount: '10-50',
          activeJobsCount: vacancies.filter((v) => v.companyId === compId).length,
        };
        setActiveCompany(userComp);
      }
    }
  }, [currentUser, companies]);

  // Safe role change with strict RBAC enforcement
  const handleRoleChangeWithRBAC = (newRole: UserRole) => {
    if (currentUser) {
      if (currentUser.role === 'candidate' && newRole !== 'candidate') {
        showToast('⚠️ Namizəd hesabı ilə yalnız Namizəd bölməsini istifadə edə bilərsiniz.');
        return;
      }
      if (currentUser.role === 'business' && newRole !== 'business') {
        showToast('⚠️ İşəgötürən hesabı ilə yalnız İşəgötürən bölməsini istifadə edə bilərsiniz.');
        return;
      }
    }
    setCurrentRole(newRole);
  };

  // Direct verification helpers
  const handleResendVerifEmail = async () => {
    if (!currentUser) return;
    setIsResendingVerif(true);
    try {
      const res = await resendVerificationEmail(currentUser.id, currentUser.email);
      if (res.success) {
        showToast(res.message);
      } else {
        showToast(`⚠️ ${res.message}`);
      }
    } catch (err: any) {
      showToast('Xəta baş verdi: ' + (err.message || 'Yenidən cəhd edin'));
    } finally {
      setIsResendingVerif(false);
    }
  };

  const handleCheckVerifStatus = async () => {
    if (!currentUser) return;
    setIsCheckingVerifStatus(true);
    try {
      const res = await checkAndSyncVerificationStatus(currentUser.id);
      if (res.verified) {
        const updated = getCurrentUser();
        if (updated) {
          setCurrentUser(updated);
        }
        showToast('🎉 Təbriklər! E-poçt ünvanınız uğurla təsdiqləndi!');
      } else {
        showToast('ℹ️ E-poçt hələ təsdiqlənməyib. Zəhmət olmasa gələn qutunuzu və spam qovluğunu yoxlayın.');
      }
    } catch (err: any) {
      showToast('Yoxlanış zamanı xəta baş verdi.');
    } finally {
      setIsCheckingVerifStatus(false);
    }
  };

  // Check URL token for direct candidate offer acceptance portal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('offerToken');
    if (token) {
      const match = jobOffers.find((o) => o.secureToken === token);
      if (match) {
        setActivePortalOffer(match);
      }
    }
  }, [jobOffers]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('jobia_vacancies', JSON.stringify(vacancies));
  }, [vacancies]);

  useEffect(() => {
    localStorage.setItem('jobia_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('jobia_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('jobia_candidate_cv', JSON.stringify(candidateCV));
  }, [candidateCV]);

  useEffect(() => {
    localStorage.setItem('jobia_saved_jobs', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    localStorage.setItem('jobia_job_notes', JSON.stringify(jobNotes));
  }, [jobNotes]);

  useEffect(() => {
    localStorage.setItem('jobia_job_offers', JSON.stringify(jobOffers));
  }, [jobOffers]);

  useEffect(() => {
    localStorage.setItem('jobia_offer_audit_logs', JSON.stringify(offerAuditLogs));
  }, [offerAuditLogs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trigger Paywall helper
  const triggerPaywall = (requiredTier: string, featureTitle: string, featureDescription?: string) => {
    setPaywallProps({
      requiredTier,
      featureTitle,
      featureDescription,
    });
    setIsPaywallModalOpen(true);
  };

  // Handle Auth success
  const handleAuthSuccess = (user: User, session: AuthSession) => {
    setCurrentUser(user);
    setAuthSession(session);
    setCurrentRole(user.role);
    setCurrentSubscription(getUserSubscription(user.id, user.role));
    showToast(`Xoş gəldiniz, ${user.fullName}!`);
  };

  // Handle Logout
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthSession(null);
    setJobOffers([]);
    try {
      const guestIdsRaw = localStorage.getItem('jobia_guest_application_ids');
      const guestIds: string[] = guestIdsRaw ? JSON.parse(guestIdsRaw) : [];
      if (guestIds.length > 0) {
        const localSaved = localStorage.getItem('jobia_applications');
        const localApps: Application[] = localSaved ? JSON.parse(localSaved) : [];
        const guestOnly = localApps.filter(
          (a) => guestIds.includes(a.id) && (a.isGuestApplication || !a.candidateId)
        );
        localStorage.setItem('jobia_applications', JSON.stringify(guestOnly));
        setApplications(guestOnly);
      } else {
        localStorage.removeItem('jobia_applications');
        setApplications([]);
      }
    } catch {
      setApplications([]);
    }
    setCurrentSubscription(getUserSubscription(undefined, currentRole));
    showToast('Sistemdən uğurla çıxış edildi.');
  };

  // Handle Opening Auth Modal
  const handleOpenAuth = (mode: 'login' | 'register' = 'login', role?: UserRole) => {
    setAuthModalMode(mode);
    setAuthModalRole(role || currentRole);
    setIsAuthModalOpen(true);
  };

  // Handle Plan selection for checkout
  const handleSelectPlan = (plan: SubscriptionPlan, cycle: BillingCycle) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutCycle(cycle);
    setIsPricingViewOpen(false);
    setIsCheckoutModalOpen(true);
  };

  // Handle Checkout success
  const handleCheckoutSuccess = (newSub: UserSubscription) => {
    setCurrentSubscription(newSub);
    setIsCheckoutModalOpen(false);
    showToast(`Təbriklər! ${newSub.tier} abunəliyiniz aktivləşdirildi!`);
  };

  // Save personal candidate note for a vacancy
  const handleSaveJobNote = (jobId: string, note: string) => {
    setJobNotes((prev) => ({
      ...prev,
      [jobId]: note
    }));
    showToast(note.trim() ? 'Qeyd yadda saxlanıldı' : 'Qeyd silindi');
  };

  // Toggle Job Bookmark
  const handleToggleBookmark = (jobId: string) => {
    setSavedJobIds((prev) => {
      const exists = prev.includes(jobId);
      const updated = exists ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      showToast(exists ? 'Vakansiya yaddaşdan silindi' : 'Vakansiya yadda saxlanıldı');
      return updated;
    });
  };

  // Strictly isolated applications visible to Candidate or Guest
  const candidateVisibleApplications = useMemo(() => {
    if (currentUser?.role === 'candidate') {
      const userEmail = currentUser.email?.toLowerCase().trim();
      return applications.filter(
        (a) =>
          a.candidateId === currentUser.id ||
          (userEmail && a.candidateEmail && a.candidateEmail.toLowerCase().trim() === userEmail)
      );
    }

    // If unauthenticated guest: ONLY show applications submitted by this specific browser
    if (!currentUser) {
      try {
        const guestIdsRaw = localStorage.getItem('jobia_guest_application_ids');
        const guestIds: string[] = guestIdsRaw ? JSON.parse(guestIdsRaw) : [];
        if (guestIds.length > 0) {
          return applications.filter(
            (a) => guestIds.includes(a.id) && (a.isGuestApplication || !a.candidateId)
          );
        }
      } catch (e) {}
      return [];
    }

    return [];
  }, [applications, currentUser]);

  // Strictly isolated applications visible to Employer
  const businessVisibleApplications = useMemo(() => {
    if (!currentUser || currentUser.role !== 'business') return [];
    const compId = currentUser.companyId;
    const compName = currentUser.companyName?.toLowerCase().trim();
    return applications.filter((a) => {
      if (compId && a.companyId === compId) return true;
      if (compName && a.companyName && a.companyName.toLowerCase().trim() === compName) return true;
      return false;
    });
  }, [applications, currentUser]);

  // Role-isolated application counter for Header, Sidebar, and badges
  const roleApplicationsCount = useMemo(() => {
    if (currentRole === 'candidate') return candidateVisibleApplications.length;
    if (currentRole === 'business') return businessVisibleApplications.length;
    if (currentRole === 'admin' && currentUser?.role === 'admin') return applications.length;
    return 0;
  }, [currentRole, candidateVisibleApplications.length, businessVisibleApplications.length, applications.length, currentUser]);

  // STRICT ADMIN APPROVAL MANDATE:
  // 1. Verified Companies: Only companies approved by admin (verified === true || verificationStatus === 'verified')
  const verifiedCompanies = useMemo(() => {
    return companies.filter(
      (c) => c.verified === true || c.verificationStatus === 'verified'
    );
  }, [companies]);

  // 2. Published Vacancies: Only vacancies strictly approved by admin (isApproved === true && status === 'published')
  // and whose company is verified by admin (if companyId is present).
  const publishedVacancies = useMemo(() => {
    const verifiedIds = new Set(verifiedCompanies.map((c) => c.id));
    return vacancies.filter((v) => {
      // Must be strictly approved by admin with published status
      if (v.isApproved !== true || v.status !== 'published') return false;
      // If linked to a company, that company must be verified by admin
      if (v.companyId && !verifiedIds.has(v.companyId)) return false;
      return true;
    });
  }, [vacancies, verifiedCompanies]);

  // Submit Job Application (Supports both registered candidates with active CV & guest applicants with file attachments)
  const handleApplyToJob = async (
    vacancy: Vacancy, 
    coverNote: string, 
    cv: CVData,
    attachment?: { fileName: string; fileType: string; fileData: string }
  ) => {
    const applicantEmail = (cv?.personalInfo?.email || currentUser?.email || '').trim();
    const applicantName = (cv?.personalInfo?.fullName || currentUser?.fullName || '').trim() || (currentUser ? 'Namizəd' : 'Qonaq Namizəd');
    const applicantPhone = (cv?.personalInfo?.phone || currentUser?.phone || '').trim();

    if (!applicantEmail) {
      showToast('Zəhmət olmasa e-poçt ünvanınızı daxil edin.');
      return;
    }

    const alreadyApplied = applications.some(
      (a) => (a.vacancyId === vacancy.id || a.jobId === vacancy.id) && 
             a.candidateEmail && a.candidateEmail.toLowerCase().trim() === applicantEmail.toLowerCase()
    );

    if (alreadyApplied) {
      showToast('Siz bu vakansiyaya artıq müraciət etmisiniz.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const isGuest = !currentUser || currentUser.role !== 'candidate';

    // Calculate real multi-dimensional ATS match score (prevents artificial 84% score on empty CVs)
    const matchEval = calculateApplicationMatchScore(
      vacancy,
      cv,
      attachment,
      coverNote
    );

    const newApp: Application = {
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      vacancyId: vacancy.id,
      jobId: vacancy.id,
      vacancyTitle: vacancy.title,
      companyId: vacancy.companyId,
      companyName: vacancy.companyName,
      companyLogo: vacancy.companyLogo,
      candidateId: currentUser?.id,
      candidateName: applicantName,
      candidateEmail: applicantEmail,
      candidatePhone: applicantPhone,
      appliedDate: today,
      status: 'Müraciət edildi',
      matchScore: matchEval.score, // Real ATS evaluation (e.g. 12% for empty CV, up to 97% for qualified match)
      matchHighlights: matchEval.highlights,
      coverNote: coverNote?.trim() || undefined,
      cvData: {
        ...cv,
        personalInfo: {
          ...cv.personalInfo,
          fullName: applicantName,
          email: applicantEmail,
          phone: applicantPhone,
        }
      },
      cvFileName: attachment?.fileName,
      cvFileType: attachment?.fileType,
      cvFileData: attachment?.fileData,
      isGuestApplication: isGuest,
    };

    // 1. Immediately update in-memory state
    setApplications((prev) => [newApp, ...prev.filter(a => a.id !== newApp.id)]);

    // 2. Persist guest application ID if not authenticated
    if (isGuest) {
      try {
        const guestIdsRaw = localStorage.getItem('jobia_guest_application_ids');
        const guestIds: string[] = guestIdsRaw ? JSON.parse(guestIdsRaw) : [];
        if (!guestIds.includes(newApp.id)) {
          guestIds.push(newApp.id);
          localStorage.setItem('jobia_guest_application_ids', JSON.stringify(guestIds));
        }
      } catch (e) {}
    }

    // 3. Immediately persist to localStorage
    try {
      const existingSaved = localStorage.getItem('jobia_applications');
      const parsedApps: Application[] = existingSaved ? JSON.parse(existingSaved) : [];
      const updatedApps = [newApp, ...parsedApps.filter(a => a.id !== newApp.id)];
      localStorage.setItem('jobia_applications', JSON.stringify(updatedApps));
    } catch (lsErr) {
      console.warn('LocalStorage save application notice:', lsErr);
    }

    // 4. Increase applicant count on vacancy
    setVacancies((prev) =>
      prev.map((v) => (v.id === vacancy.id ? { ...v, applicantsCount: (v.applicantsCount || 0) + 1 } : v))
    );

    // 5. Sync to Firestore in background
    try {
      await saveApplicationDirectToFirestore(newApp);
    } catch (e) {
      console.warn('Firestore application sync info:', e);
    }

    showToast('Təbriklər! Müraciətiniz və CV sənədiniz uğurla şirkətə göndərildi.');
  };

  // Save candidate CV
  const handleSaveCV = async (updatedCV: CVData) => {
    setCandidateCV(updatedCV);
    if (currentUser?.id) {
      try {
        await saveCandidateProfile(currentUser.id, {
          fullName: updatedCV.personalInfo.fullName,
          email: updatedCV.personalInfo.email,
          phone: updatedCV.personalInfo.phone,
          location: updatedCV.personalInfo.address,
          professionalTitle: updatedCV.personalInfo.jobTitle,
          about: updatedCV.personalInfo.summary,
        });
      } catch (e) {
        console.warn('Firestore CV profile sync info:', e);
      }
    }
    showToast('CV məlumatlarınız uğurla yadda saxlanıldı.');
  };

  // Handle Business posting new job (Direct & frictionless with verification guard)
  const handleAttemptPostJob = () => {
    if (currentUser && !currentUser.emailVerified) {
      showToast('⚠️ Elan yerləşdirmək üçün zəhmət olmasa e-poçt ünvanınızı təsdiqləyin.');
      setUserToVerify(currentUser);
      setIsVerifyModalOpen(true);
      return;
    }
    setEditingVacancy(null);
    setIsPostJobModalOpen(true);
  };

  // Handle Business editing an existing vacancy (1-time edit permission)
  const handleOpenEditJob = (job: Vacancy) => {
    if ((job.editCount || 0) >= (job.maxEditsAllowed || 1)) {
      showToast('⚠️ Bu vakansiya üzrə 1 dəfəlik redaktə hüququnuzdan artıq istifadə etmisiniz.');
      return;
    }
    setEditingVacancy(job);
    setIsPostJobModalOpen(true);
  };

  const handleSaveNewJob = async (newJob: Partial<Vacancy>) => {
    const today = new Date().toISOString().split('T')[0];
    const deadlineDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const isEdit = !!newJob.id && vacancies.some((v) => v.id === newJob.id);
    const existingJob = isEdit ? vacancies.find((v) => v.id === newJob.id) : null;

    const fullJob: Vacancy = {
      id: newJob.id || `vac-${Date.now()}`,
      title: newJob.title || 'Vakansiya',
      companyId: activeCompany.id,
      companyName: activeCompany.name,
      companyLogo: activeCompany.logo,
      companyVerified: activeCompany.verified ?? false,
      category: newJob.category || 'İT və Proqramlaşdırma',
      employmentType: newJob.employmentType || 'Tam ştat',
      experienceLevel: newJob.experienceLevel || 'Orta (Mid-level, 1-3 il)',
      city: newJob.city || 'Bakı',
      location: newJob.location || newJob.city || 'Bakı',
      address: newJob.address || `${newJob.city || 'Bakı'}, Azərbaycan`,
      metroStation: newJob.metroStation,
      latitude: newJob.latitude || 40.4093,
      longitude: newJob.longitude || 49.8671,
      minSalary: newJob.minSalary,
      maxSalary: newJob.maxSalary,
      currency: newJob.currency || 'AZN',
      hideSalary: newJob.hideSalary || false,
      description: newJob.description || '',
      responsibilities: newJob.responsibilities || [],
      requirements: newJob.requirements || [],
      benefits: newJob.benefits || [],
      skills: newJob.skills || [],
      postedDate: newJob.postedDate || today,
      deadline: newJob.deadline || deadlineDate,
      isFeatured: newJob.isFeatured ?? false,
      isApproved: currentUser?.role === 'admin' ? true : false,
      status: currentUser?.role === 'admin' ? 'published' : 'pending_review',
      editCount: isEdit ? ((existingJob?.editCount || 0) + 1) : 0,
      maxEditsAllowed: 1,
      lastEditedAt: isEdit ? new Date().toISOString() : undefined,
      viewsCount: existingJob?.viewsCount || 1,
      applicantsCount: existingJob?.applicantsCount || 0,
      contactPhone: newJob.contactPhone || activeCompany.phone,
      contactWhatsapp: newJob.contactWhatsapp || activeCompany.phone,
      isBlueCollarFriendly: newJob.isBlueCollarFriendly ?? false,
      createdBy: currentUser?.id || currentUser?.email,
      createdAt: existingJob?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEdit) {
      setVacancies((prev) => prev.map((v) => (v.id === fullJob.id ? fullJob : v)));
      showToast(
        currentUser?.role === 'admin'
          ? 'Vakansiya uğurla redaktə edildi və yeniləndi!'
          : 'Vakansiya redaktə edildi və təkrar admin təsdiqinə göndərildi.'
      );
    } else {
      setVacancies((prev) => [fullJob, ...prev]);
      showToast(
        currentUser?.role === 'admin'
          ? 'Vakansiya dərhal dərc edildi və bütün platformada aktivləşdirildi!'
          : 'Vakansiya uğurla qəbul edildi! Admin təsdiqindən sonra dərc olunacaq.'
      );
    }

    // Persist to Firestore
    try {
      await saveVacancyToFirestore(fullJob, currentUser?.id);
    } catch (e) {
      console.warn('Firestore save vacancy notice:', e);
    }

    // If published directly by admin (Zero-Bypass Moderation policy satisfied), notify matching subscribers
    if (!isEdit && currentUser?.role === 'admin' && fullJob.status === 'published' && fullJob.isApproved) {
      notifySubscribersOfNewVacancy(fullJob)
        .then((res) => {
          if (res.notifiedCount > 0) {
            console.log(`[Job Alerts] Sent in-app notifications to ${res.notifiedCount} candidate subscriber(s).`);
          }
        })
        .catch((err) => console.warn('[Job Alerts] Error notifying subscribers:', err));
    }

    setIsPostJobModalOpen(false);
    setEditingVacancy(null);
  };

  // Handle Business updating application status
  const handleUpdateApplicationStatus = async (appId: string, status: ApplicationStatus, notes?: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status, recruiterNotes: notes } : a))
    );
    try {
      await updateApplicationStatus(appId, status, notes);
    } catch (e) {
      console.warn('Firestore application status sync notice:', e);
    }
    showToast('Namizəd statusu və qeydi yeniləndi.');
  };

  // Handle Job Offer workflow creation & updates
  const handleSaveJobOffer = async (offer: JobOffer, log: OfferAuditLog) => {
    setJobOffers((prev) => {
      const idx = prev.findIndex((o) => o.id === offer.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = offer;
        return copy;
      }
      return [offer, ...prev];
    });

    setOfferAuditLogs((prev) => [log, ...prev]);

    try {
      await createJobOfferInFirestore(offer);
    } catch (e) {
      console.warn('Firestore job offer save notice:', e);
    }

    showToast('İş təklifi məlumatları və audit qeydi qeydə alındı.');
  };

  // Handle Candidate response to offer
  const handleUpdateOfferStatus = async (
    offerId: string,
    status: any,
    declineReason?: any,
    auditLog?: OfferAuditLog
  ) => {
    const now = new Date().toISOString();
    setJobOffers((prev) =>
      prev.map((o) => {
        if (o.id !== offerId) return o;
        return {
          ...o,
          status,
          declineReason: declineReason || o.declineReason,
          acceptedAt: status === 'ACCEPTED' ? now : o.acceptedAt,
          declinedAt: status === 'DECLINED' ? now : o.declinedAt,
          viewedAt: status === 'VIEWED' && !o.viewedAt ? now : o.viewedAt,
          updatedAt: now,
        };
      })
    );

    if (auditLog) {
      setOfferAuditLogs((prev) => [auditLog, ...prev]);
    }

    // Persist to Firestore
    try {
      await respondToJobOffer(offerId, status, declineReason);
    } catch (e) {
      console.warn('Firestore respond to offer notice:', e);
    }

    // Also update associated application status if accepted or declined
    const targetOffer = jobOffers.find((o) => o.id === offerId);
    if (targetOffer) {
      if (status === 'ACCEPTED') {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === targetOffer.applicationId || a.candidateEmail === targetOffer.candidateEmail
              ? { ...a, status: 'Qəbul edildi', recruiterNotes: 'Namizəd rəsmi iş təklifini qəbul etdi.' }
              : a
          )
        );
      } else if (status === 'DECLINED') {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === targetOffer.applicationId || a.candidateEmail === targetOffer.candidateEmail
              ? { ...a, status: 'İmtina edildi', recruiterNotes: `Namizəd təklifdən imtina etdi (${declineReason?.category || ''}).` }
              : a
          )
        );
      }
    }
  };

  const handleUpdateCompany = async (updated: Company) => {
    setCompanies((prev) => {
      const exists = prev.some((c) => c.id === updated.id);
      return exists ? prev.map((c) => (c.id === updated.id ? updated : c)) : [updated, ...prev];
    });
    setActiveCompany(updated);

    // Sync company logo to all vacancies of this company
    if (updated.logo) {
      setVacancies((prev) =>
        prev.map((v) => (v.companyId === updated.id || v.companyName === updated.name ? { ...v, companyLogo: updated.logo } : v))
      );
    }

    // Update active user company details in storage
    if (currentUser && currentUser.role === 'business') {
      const updatedUser: User = {
        ...currentUser,
        companyName: updated.name,
        companyDescription: updated.description,
        avatarUrl: updated.logo || currentUser.avatarUrl,
        phone: updated.phone || currentUser.phone,
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('jobia_active_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }

    // Persist company profile directly to Firestore
    try {
      await updateCompanyProfile(updated.id, updated);
      showToast('Müəssisə profili və loqosu uğurla yadda saxlanıldı.');
    } catch (e) {
      console.warn('Firestore update company error:', e);
      showToast('Müəssisə məlumatları yadda saxlanıldı.');
    }
  };

  const handleUpdateTemplates = (updated: JobOfferTemplate[]) => {
    setOfferTemplates(updated);
    saveOfferTemplates(updated);
    showToast('Təklif şablonları yeniləndi.');
  };

  // Admin Actions
  const handleApproveVacancy = async (jobId: string) => {
    const targetJob = vacancies.find((v) => v.id === jobId);
    const jobTitle = targetJob?.title || 'Vakansiya';
    const compName = targetJob?.companyName || '';
    const adminId = currentUser?.id || 'user-admin-root';
    const adminEmail = currentUser?.email || 'admin@jobia.az';
    const adminName = currentUser?.fullName || 'Sistem Administratoru';

    setVacancies((prev) => prev.map((v) => (v.id === jobId ? { ...v, isApproved: true, status: 'published' } : v)));
    try {
      await updateVacancyStatus(jobId, 'published', true);
    } catch (e) {
      console.warn('Firestore approve notice:', e);
    }

    // Record audit log identifying which admin account performed approval
    await recordAdminAuditLog({
      action: 'approve_vacancy',
      adminId,
      adminEmail,
      adminName,
      adminRole: 'admin',
      targetType: 'vacancy',
      targetId: jobId,
      targetName: compName ? `${jobTitle} (${compName})` : jobTitle,
      previousStatus: targetJob?.status || 'pending_review',
      newStatus: 'published',
      details: `Admin ${adminName} (${adminEmail}) "${jobTitle}" vakansiyasını yoxlayaraq təsdiqlədi və platformada dərc etdi.`,
    }).catch(() => {});

    // Trigger in-app notifications for candidates subscribed to this job's category or company
    if (targetJob) {
      const approvedJobForNotification = {
        ...targetJob,
        isApproved: true,
        status: 'published' as const,
      };
      notifySubscribersOfNewVacancy(approvedJobForNotification)
        .then((res) => {
          if (res.notifiedCount > 0) {
            console.log(`[Job Alerts] Sent in-app notifications to ${res.notifiedCount} candidate subscriber(s).`);
          }
        })
        .catch((err) => console.warn('[Job Alerts] Error notifying subscribers:', err));
    }

    showToast('Vakansiya təsdiqləndi və saytda dərc edildi.');
  };

  const handleRejectVacancy = async (jobId: string) => {
    const targetJob = vacancies.find((v) => v.id === jobId);
    const jobTitle = targetJob?.title || 'Vakansiya';
    const compName = targetJob?.companyName || '';
    const adminId = currentUser?.id || 'user-admin-root';
    const adminEmail = currentUser?.email || 'admin@jobia.az';
    const adminName = currentUser?.fullName || 'Sistem Administratoru';

    setVacancies((prev) => prev.map((v) => (v.id === jobId ? { ...v, isApproved: false, status: 'rejected' } : v)));
    try {
      await updateVacancyStatus(jobId, 'rejected', false);
    } catch (e) {
      console.warn('Firestore reject notice:', e);
    }

    // Record audit log identifying which admin account performed rejection
    await recordAdminAuditLog({
      action: 'reject_vacancy',
      adminId,
      adminEmail,
      adminName,
      adminRole: 'admin',
      targetType: 'vacancy',
      targetId: jobId,
      targetName: compName ? `${jobTitle} (${compName})` : jobTitle,
      previousStatus: targetJob?.status || 'published',
      newStatus: 'rejected',
      details: `Admin ${adminName} (${adminEmail}) "${jobTitle}" vakansiyasını dərcdən çıxardı (imtina etdi).`,
    }).catch(() => {});

    showToast('Vakansiya dərcdən çıxarıldı.');
  };

  const handleToggleFeatureVacancy = async (jobId: string) => {
    const targetJob = vacancies.find((v) => v.id === jobId);
    const willBeFeatured = targetJob ? !targetJob.isFeatured : true;
    const adminId = currentUser?.id || 'user-admin-root';
    const adminEmail = currentUser?.email || 'admin@jobia.az';
    const adminName = currentUser?.fullName || 'Sistem Administratoru';

    setVacancies((prev) =>
      prev.map((v) => (v.id === jobId ? { ...v, isFeatured: !v.isFeatured } : v))
    );

    await recordAdminAuditLog({
      action: 'toggle_featured_vacancy',
      adminId,
      adminEmail,
      adminName,
      adminRole: 'admin',
      targetType: 'vacancy',
      targetId: jobId,
      targetName: targetJob?.title || 'Vakansiya',
      previousStatus: targetJob?.isFeatured ? 'Önə Çıxarılıb' : 'Standart',
      newStatus: willBeFeatured ? 'Önə Çıxarılıb' : 'Standart',
      details: `Admin ${adminName} (${adminEmail}) vakansiyanın Premium statusunu dəyişdirdi (${willBeFeatured ? 'Önə Çıxarıldı' : 'Standart'}).`,
    }).catch(() => {});

    showToast('Vakansiyanın Premium statusu dəyişdirildi.');
  };

  const handleDeleteVacancy = async (jobId: string) => {
    const targetJob = vacancies.find((v) => v.id === jobId);
    const adminId = currentUser?.id || 'user-admin-root';
    const adminEmail = currentUser?.email || 'admin@jobia.az';
    const adminName = currentUser?.fullName || 'Sistem Administratoru';

    setVacancies((prev) => prev.filter((v) => v.id !== jobId));
    try {
      await deleteVacancyFromFirestore(jobId);
    } catch (e) {
      console.warn('Firestore delete notice:', e);
    }

    await recordAdminAuditLog({
      action: 'delete_vacancy',
      adminId,
      adminEmail,
      adminName,
      adminRole: 'admin',
      targetType: 'vacancy',
      targetId: jobId,
      targetName: targetJob?.title || jobId,
      previousStatus: targetJob?.status || 'published',
      newStatus: 'deleted',
      details: `Admin ${adminName} (${adminEmail}) "${targetJob?.title || jobId}" vakansiyasını həmişəlik sildi.`,
    }).catch(() => {});

    showToast('Vakansiya silindi.');
  };

  const handleRefreshAdminData = async () => {
    try {
      const [allJobs, allComps, allApps] = await Promise.all([
        getAllVacanciesFromFirestore(),
        getAllCompaniesFromFirestore(),
        getAllApplicationsFromFirestore(),
      ]);
      if (Array.isArray(allJobs) && allJobs.length > 0) {
        const localSavedJobs = localStorage.getItem('jobia_vacancies');
        const localJobs: Vacancy[] = localSavedJobs ? JSON.parse(localSavedJobs) : [];
        const mergedJobs = mergeVacancyLists(allJobs, localJobs);
        setVacancies(mergedJobs);
      }
      if (Array.isArray(allComps)) setCompanies(allComps);
      if (Array.isArray(allApps)) setApplications(allApps);
      showToast('Bütün vakansiyalar və istifadəçi məlumatları Firestore ilə sinxronlaşdırıldı.');
    } catch (e) {
      console.warn('Admin refresh error:', e);
    }
  };

  const handleToggleCompanyVerified = async (companyId: string) => {
    const targetComp = companies.find((c) => c.id === companyId);
    const newVerified = targetComp ? !(targetComp.verified === true || targetComp.verificationStatus === 'verified') : true;
    const newStatus = newVerified ? 'verified' : 'pending';
    const compName = targetComp?.name || 'Şirkət';
    const adminId = currentUser?.id || 'user-admin-root';
    const adminEmail = currentUser?.email || 'admin@jobia.az';
    const adminName = currentUser?.fullName || 'Sistem Administratoru';

    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, verified: newVerified, verificationStatus: newStatus } : c))
    );
    try {
      await setCompanyVerificationStatus(companyId, newStatus);
    } catch (e) {
      console.warn('Firestore company verification status notice:', e);
    }

    // Record audit log identifying which admin account performed company approval / revoke
    await recordAdminAuditLog({
      action: newVerified ? 'approve_company' : 'revoke_company',
      adminId,
      adminEmail,
      adminName,
      adminRole: 'admin',
      targetType: 'company',
      targetId: companyId,
      targetName: compName,
      previousStatus: targetComp?.verificationStatus || (targetComp?.verified ? 'verified' : 'pending'),
      newStatus: newStatus,
      details: newVerified
        ? `Admin ${adminName} (${adminEmail}) "${compName}" şirkətini rəsmi təsdiqlədi və platformada dərc etdi.`
        : `Admin ${adminName} (${adminEmail}) "${compName}" şirkətinin rəsmi statusunu ləğv etdi və dərcdən çıxardı.`,
    }).catch(() => {});

    showToast(newVerified ? 'Şirkət təsdiqləndi və platformada dərc edildi!' : 'Şirkətin təsdiqi ləğv edildi və dərcdən çıxarıldı.');
  };

  // If candidate is viewing their secure offer link portal
  if (activePortalOffer) {
    return (
      <CandidateOfferPortal
        offer={activePortalOffer}
        onUpdateOfferStatus={(offerId, status, reason, log) => {
          handleUpdateOfferStatus(offerId, status, reason, log);
          setActivePortalOffer((prev) => (prev ? { ...prev, status, declineReason: reason } : null));
        }}
        onBackToApp={() => {
          setActivePortalOffer(null);
          // clear query string from browser
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      />
    );
  }

  // If Pricing View is active
  if (isPricingViewOpen) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <Header
          currentRole={currentRole}
          onRoleChange={(role) => setCurrentRole(role)}
          candidateTab={candidateTab}
          onCandidateTabChange={(tab) => setCandidateTab(tab)}
          applicationsCount={roleApplicationsCount}
          savedJobsCount={savedJobIds.length}
          activeVacanciesCount={publishedVacancies.length}
          pendingApprovalsCount={vacancies.filter((v) => v.isApproved !== true || v.status !== 'published').length}
          companies={verifiedCompanies}
          currentUser={currentUser}
          currentSubscription={currentSubscription}
          onOpenAuthModal={handleOpenAuth}
          onOpenVerifyModal={(u) => {
            setUserToVerify(u);
            setIsVerifyModalOpen(true);
          }}
          onOpenProfileModal={handleOpenProfileModal}
          onOpenPricing={() => setIsPricingViewOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 w-full max-w-full">
          <PricingPage
            currentUser={currentUser}
            currentRole={currentRole}
            currentSubscription={currentSubscription}
            onSelectPlan={handleSelectPlan}
            onBack={() => setIsPricingViewOpen(false)}
            onRequireAuth={() => handleOpenAuth('login', currentRole)}
          />
        </main>
        <Footer
          currentRole={currentRole}
          onRoleChange={(role) => setCurrentRole(role)}
          onNavigateCandidateTab={(tab) => {
            setIsPricingViewOpen(false);
            setCandidateTab(tab);
          }}
          onOpenPricing={() => setIsPricingViewOpen(true)}
        />
        {/* Checkout Modal */}
        {isCheckoutModalOpen && selectedPlanForCheckout && (
          <CheckoutModal
            isOpen={isCheckoutModalOpen}
            onClose={() => setIsCheckoutModalOpen(false)}
            plan={selectedPlanForCheckout}
            billingCycle={checkoutCycle}
            currentUser={currentUser}
            currentRole={currentRole}
            onSuccess={handleCheckoutSuccess}
            onRequireAuth={() => handleOpenAuth('login', currentRole)}
          />
        )}
        {/* Mobile Frozen Bottom Bar */}
        <MobileFrozenBottomBar
          currentUser={currentUser}
          currentSubscription={currentSubscription}
          currentRole={currentRole}
          onOpenPricing={() => setIsPricingViewOpen(true)}
          onOpenAuthModal={handleOpenAuth}
          onOpenProfileModal={handleOpenProfileModal}
          onLogout={handleLogout}
        />

        {/* User Profile & Email Notification Preferences Modal */}
        {isProfileModalOpen && currentUser && (
          <UserProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentUser={currentUser}
            initialTab={profileModalTab}
            onUpdateUser={(updatedUser) => {
              setCurrentUser(updatedUser);
              showToast('Tənzimləmələr və bildiriş parametrləri uğurla yadda saxlanıldı!');
            }}
            onOpenVerifyModal={(u) => {
              setIsProfileModalOpen(false);
              setUserToVerify(u);
              setIsVerifyModalOpen(true);
            }}
            onOpenPricing={() => {
              setIsProfileModalOpen(false);
              setIsPricingViewOpen(true);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-full bg-slate-50 text-slate-800 flex overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Left Vertical Sidebar (Yuxarıdan aşağı düzülmüş naviqasiya və əməliyyat buttonları) */}
      <Sidebar
        currentRole={currentRole}
        onRoleChange={handleRoleChangeWithRBAC}
        candidateTab={candidateTab}
        onCandidateTabChange={(tab) => setCandidateTab(tab)}
        applicationsCount={roleApplicationsCount}
        savedJobsCount={savedJobIds.length}
        activeVacanciesCount={publishedVacancies.length}
        pendingApprovalsCount={vacancies.filter((v) => v.isApproved !== true || v.status !== 'published').length}
        onOpenJobAlerts={() => setIsGlobalJobAlertModalOpen(true)}
        onOpenGoogleChat={() => {
          if (currentRole === 'candidate') {
            setCandidateTab('google-chat');
          } else {
            setIsGoogleChatModalOpen(true);
          }
        }}
        currentUser={currentUser}
        currentSubscription={currentSubscription}
        onOpenAuthModal={handleOpenAuth}
        onOpenProfileModal={handleOpenProfileModal}
        onOpenPricing={() => setIsPricingViewOpen(true)}
        onLogout={handleLogout}
        onPostJobClick={handleAttemptPostJob}
        onOpenIntroTour={() => setIsIntroTourOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Platform Header (Frozen at top) */}
        <Header
          currentRole={currentRole}
          onRoleChange={handleRoleChangeWithRBAC}
          candidateTab={candidateTab}
          onCandidateTabChange={(tab) => setCandidateTab(tab)}
          companies={verifiedCompanies}
          selectedCompany={selectedCompanyFilter}
          onSelectCompany={(comp) => {
            setSelectedCompanyFilter(comp);
            if (currentRole !== 'candidate') handleRoleChangeWithRBAC('candidate');
            if (candidateTab !== 'jobs') setCandidateTab('jobs');
          }}
          applicationsCount={roleApplicationsCount}
          savedJobsCount={savedJobIds.length}
          activeVacanciesCount={publishedVacancies.length}
          pendingApprovalsCount={vacancies.filter((v) => v.isApproved !== true || v.status !== 'published').length}
          onOpenGoogleChat={() => {
            if (currentRole === 'candidate') {
              setCandidateTab('google-chat');
            } else {
              setIsGoogleChatModalOpen(true);
            }
          }}
          currentUser={currentUser}
          currentSubscription={currentSubscription}
          notifications={notifications}
          onNavigateNotification={handleNavigateNotification}
          onOpenAuthModal={handleOpenAuth}
          onOpenVerifyModal={(u) => {
            setUserToVerify(u);
            setIsVerifyModalOpen(true);
          }}
          onOpenProfileModal={handleOpenProfileModal}
          onOpenPricing={() => setIsPricingViewOpen(true)}
          onLogout={handleLogout}
          onPostJobClick={handleAttemptPostJob}
          onOpenIntroTour={() => setIsIntroTourOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapseSidebar={handleToggleSidebarCollapse}
        />

        {/* Scrollable Main Area (Body + Footer scroll smoothly under frozen header & sidebar) */}
        <div id="main-content-scroll" className="flex-1 overflow-y-auto min-h-0 w-full flex flex-col scroll-smooth">
          {/* Main App Container */}
          <main className="flex-1 w-full max-w-full px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 sm:py-6 lg:py-8 pb-20 md:pb-8">
            {/* Unverified Account Security Alert Banner */}
            {currentUser && !currentUser.emailVerified && (
              <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300/80 shadow-xs animate-fadeIn">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                        E-poçt Təsdiqi Tələb Olunur
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                          Təsdiqlənməyib
                        </span>
                      </h4>
                      <p className="text-xs text-amber-900/90 mt-0.5 max-w-2xl leading-relaxed">
                        Hörmətli <strong>{currentUser.fullName}</strong>, <strong>{currentUser.email}</strong> ünvanına göndərilən 6-rəqəmli təhlükəsizlik kodunu və ya təsdiq linkini daxil edərək hesabınızı aktivləşdirin. Əks halda vakansiyalara müraciət və elan dərc etmə funksiyaları məhdudlaşdırılır.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
                    <button
                      onClick={() => {
                        setUserToVerify(currentUser);
                        setIsVerifyModalOpen(true);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xs hover:shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>Kodu Daxil Et</span>
                    </button>

                    <button
                      onClick={handleResendVerifEmail}
                      disabled={isResendingVerif}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-amber-900 border border-amber-300/80 hover:bg-amber-50 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {isResendingVerif ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                      <span>Yenidən Göndər</span>
                    </button>

                    <button
                      onClick={handleCheckVerifStatus}
                      disabled={isCheckingVerifStatus}
                      className="p-2 rounded-xl text-amber-800 hover:text-amber-950 hover:bg-amber-100/80 border border-amber-200/80 transition-all cursor-pointer"
                      title="Statusu Yenilə"
                    >
                      <RefreshCw className={`w-4 h-4 ${isCheckingVerifStatus ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
        {/* VIP Pricing / Veb-Planlar View OR Role Views */}
        {isPricingViewOpen ? (
          <PricingPage
            currentUser={currentUser}
            currentRole={currentRole}
            currentSubscription={currentSubscription}
            onSelectPlan={(plan, cycle) => {
              setSelectedPlanForCheckout(plan);
              setCheckoutCycle(cycle);
              setIsCheckoutModalOpen(true);
            }}
            onBack={() => setIsPricingViewOpen(false)}
            onRequireAuth={() => handleOpenAuth('login', currentRole)}
          />
        ) : (
          <>
            {/* CANDIDATE ROLE VIEWS */}
            {currentRole === 'candidate' && (
              <div>
                {candidateTab === 'jobs' && (
                  <JobExplorer
                    vacancies={publishedVacancies}
                    onSelectVacancy={(job) => setSelectedJobForDetail(job)}
                    savedJobIds={savedJobIds}
                    onToggleBookmark={handleToggleBookmark}
                    jobNotes={jobNotes}
                    onSaveJobNote={handleSaveJobNote}
                    selectedCompany={selectedCompanyFilter}
                    onSelectCompany={setSelectedCompanyFilter}
                    onQuickApply={(job) => {
                      handleApplyToJob(job, 'Tez müraciət vasitəsilə göndərildi.', candidateCV);
                    }}
                    onOpenSalaryTrends={() => setCandidateTab('salary-trends')}
                    onOpenNearbyMap={() => setCandidateTab('nearby-map')}
                    onOpenCalculia={() => setCandidateTab('calculia')}
                    onOpenIntroTour={() => setIsIntroTourOpen(true)}
                    userCV={candidateCV}
                    currentUser={currentUser}
                    onShowToast={showToast}
                  />
                )}

                {candidateTab === 'nearby-map' && (
                  <NearbyJobsMap
                    vacancies={publishedVacancies}
                    onSelectVacancy={(job) => setSelectedJobForDetail(job)}
                    savedJobIds={savedJobIds}
                    onToggleBookmark={handleToggleBookmark}
                    onQuickApply={(job) => {
                      handleApplyToJob(job, 'Xəritə vasitəsilə tez müraciət.', candidateCV);
                    }}
                  />
                )}

                {candidateTab === 'salary-trends' && (
                  <SalaryTrendsView
                    vacancies={publishedVacancies}
                    onSelectVacancy={(job) => setSelectedJobForDetail(job)}
                  />
                )}

                {candidateTab === 'calculia' && (
                  <SalariaCalculator
                    defaultSubTab={calculiaSubTab}
                    onExploreJobs={() => setCandidateTab('jobs')}
                  />
                )}

                {candidateTab === 'cv-analyzer' && (
                  <DeepCVAnalyzerView initialCVText={analyzerPrefillText} />
                )}

                {candidateTab === 'cv-creator' && (
                  <CVCreator
                    onApplyWithCV={() => {
                      setCandidateTab('jobs');
                    }}
                    onOpenATSAnalyzer={(cvText) => {
                      setAnalyzerPrefillText(cvText);
                      setCandidateTab('cv-analyzer');
                    }}
                  />
                )}

                {candidateTab === 'my-applications' && (
                  <MyApplications
                    applications={candidateVisibleApplications}
                    offers={jobOffers}
                    onOpenCVModal={(app) => setViewingSubmittedCVApp(app)}
                    onExploreJobs={() => setCandidateTab('jobs')}
                    onViewOffer={(offer) => setActivePortalOffer(offer)}
                    currentUser={currentUser}
                    onOpenAuthModal={(mode, role) => handleOpenAuth(mode || 'login', role || 'candidate')}
                  />
                )}

                {candidateTab === 'google-chat' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCandidateTab('jobs')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        ← Vakansiyalara qayıt
                      </button>
                      <span className="text-xs text-slate-500">Google Chat ilə real-vaxt komanda və rekruter əlaqəsi</span>
                    </div>
                    <div className="h-[750px] max-h-[85vh]">
                      <GoogleChatHub
                        vacancies={vacancies}
                        applications={applications}
                        candidateCV={candidateCV}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BUSINESS / RECRUITER ROLE VIEW */}
            {currentRole === 'business' && (
              <BusinessDashboard
                currentUser={currentUser}
                companies={companies}
                activeCompany={activeCompany}
                setActiveCompany={setActiveCompany}
                vacancies={vacancies}
                applications={applications}
                offers={jobOffers}
                auditLogs={offerAuditLogs}
                templates={offerTemplates}
                onOpenPostJobModal={handleAttemptPostJob}
                onOpenEditJobModal={handleOpenEditJob}
                onUpdateApplicationStatus={handleUpdateApplicationStatus}
                onDeleteJob={handleDeleteVacancy}
                onSaveOffer={handleSaveJobOffer}
                onUpdateOfferStatus={handleUpdateOfferStatus}
                onUpdateTemplates={handleUpdateTemplates}
                onUpdateCompany={handleUpdateCompany}
                onOpenCandidatePortal={(offer) => setActivePortalOffer(offer)}
                onShareToGoogleChat={(app) => {
                  setIsGoogleChatModalOpen(true);
                }}
                onOpenAuthModal={handleOpenAuth}
              />
            )}

            {/* ADMIN ROLE VIEW */}
            {currentRole === 'admin' && (
              currentUser?.role === 'admin' ? (
                <AdminDashboard
                  vacancies={vacancies}
                  companies={companies}
                  applications={applications}
                  currentAdminUser={currentUser}
                  onApproveVacancy={handleApproveVacancy}
                  onRejectVacancy={handleRejectVacancy}
                  onToggleFeatureVacancy={handleToggleFeatureVacancy}
                  onDeleteVacancy={handleDeleteVacancy}
                  onToggleCompanyVerified={handleToggleCompanyVerified}
                  onRefresh={handleRefreshAdminData}
                />
              ) : (
                <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
                  <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto border border-slate-200 shadow-2xs">
                    <ShieldCheck className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Admin Girişi Tələb Olunur</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Bu panel yalnız sistem inzibatçısı səlahiyyətinə malik hesablar üçün nəzərdə tutulub. Davam etmək üçün admin hesabınızla daxil olun.
                  </p>
                  <button
                    onClick={() => handleOpenAuth('login', 'admin')}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Admin Hesabı ilə Daxil Ol
                  </button>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* ============================================================== */}
      {/* GLOBAL REALTIME NOTIFICATION TOAST OVERLAY */}
      {/* ============================================================== */}
      <LiveNotificationToast
        notification={incomingToastNotif}
        onClose={() => setIncomingToastNotif(null)}
        onOpenCenter={() => {
          const btn = document.getElementById('header-notification-center-btn');
          if (btn) btn.click();
        }}
        onNavigate={handleNavigateNotification}
      />

      {/* ============================================================== */}
      {/* GLOBAL MODALS */}
      {/* ============================================================== */}

      {/* 1. Auth Modal (Login / Register / Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        initialRole={authModalRole}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 1.1 Verify Account Modal (6-Digit Email Verification Code) */}
      {isVerifyModalOpen && userToVerify && (
        <VerifyAccountModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          user={userToVerify}
          onVerificationSuccess={(verifiedUser, session) => {
            handleAuthSuccess(verifiedUser, session || authSession!);
            setIsVerifyModalOpen(false);
            setUserToVerify(null);
          }}
        />
      )}

      {/* 2. Checkout Modal (Card input, test autofill, instant subscription activation) */}
      {isCheckoutModalOpen && selectedPlanForCheckout && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          plan={selectedPlanForCheckout}
          billingCycle={checkoutCycle}
          currentUser={currentUser}
          currentRole={currentRole}
          onSuccess={handleCheckoutSuccess}
          onRequireAuth={() => handleOpenAuth('login', currentRole)}
        />
      )}

      {/* 3. Feature Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallModalOpen}
        onClose={() => setIsPaywallModalOpen(false)}
        requiredTier={paywallProps.requiredTier}
        featureTitle={paywallProps.featureTitle}
        featureDescription={paywallProps.featureDescription}
        userRole={currentRole}
        onUpgradeClick={() => {
          setIsPaywallModalOpen(false);
          setIsPricingViewOpen(true);
        }}
      />

      {/* 4. Job Detail & Apply Modal */}
      {selectedJobForDetail && (
        <JobDetailModal
          vacancy={selectedJobForDetail}
          onClose={() => setSelectedJobForDetail(null)}
          savedCV={candidateCV}
          currentUser={currentUser}
          onOpenAuthModal={(mode, role) => handleOpenAuth(mode || 'login', role || 'candidate')}
          onApply={handleApplyToJob}
          hasApplied={applications.some(
            (a) => a.vacancyId === selectedJobForDetail.id && (
              (currentUser && a.candidateId === currentUser.id) ||
              (a.candidateEmail && candidateCV.personalInfo.email && a.candidateEmail.toLowerCase() === candidateCV.personalInfo.email.toLowerCase())
            )
          )}
          jobNote={jobNotes[selectedJobForDetail.id] || ''}
          onSaveJobNote={(note) => handleSaveJobNote(selectedJobForDetail.id, note)}
          isSaved={savedJobIds.includes(selectedJobForDetail.id)}
          onToggleBookmark={() => handleToggleBookmark(selectedJobForDetail.id)}
          onOpenInterviewPrep={(vac) => setSelectedJobForInterview(vac)}
          onShareToGoogleChat={(vac) => {
            setIsGoogleChatModalOpen(true);
          }}
        />
      )}

      {/* 5. AI Interview Preparation Modal */}
      {selectedJobForInterview && (
        <InterviewPrepModal
          vacancy={selectedJobForInterview}
          onClose={() => setSelectedJobForInterview(null)}
        />
      )}

      {/* 6. Post Job Modal (Business) */}
      {isPostJobModalOpen && (
        <PostJobModal
          company={activeCompany}
          editingJob={editingVacancy}
          onClose={() => {
            setIsPostJobModalOpen(false);
            setEditingVacancy(null);
          }}
          onSaveJob={handleSaveNewJob}
        />
      )}

      {/* 7. Viewing Submitted Application CV Modal */}
      {viewingSubmittedCVApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {viewingSubmittedCVApp.vacancyTitle} üçün Göndərilən CV
                </h3>
                <p className="text-xs text-slate-500">
                  Şirkət: {viewingSubmittedCVApp.companyName} • Status: {viewingSubmittedCVApp.status}
                </p>
              </div>

              {/* Template Picker in Modal */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg text-xs font-medium shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold px-1.5 uppercase">Şablon:</span>
                <button
                  type="button"
                  onClick={() => setSelectedSubmittedTemplate('modern-emerald')}
                  className={`px-2 py-1 rounded-md transition-all text-xs cursor-pointer ${
                    selectedSubmittedTemplate === 'modern-emerald' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Zümrüd
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmittedTemplate('classic-corporate')}
                  className={`px-2 py-1 rounded-md transition-all text-xs cursor-pointer ${
                    selectedSubmittedTemplate === 'classic-corporate' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Klassik
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmittedTemplate('minimal-indigo')}
                  className={`px-2 py-1 rounded-md transition-all text-xs cursor-pointer ${
                    selectedSubmittedTemplate === 'minimal-indigo' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Minimal
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmittedTemplate('slate-tech')}
                  className={`px-2 py-1 rounded-md transition-all text-xs cursor-pointer ${
                    selectedSubmittedTemplate === 'slate-tech' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tech
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-modal-download-cv-pdf"
                  onClick={async () => {
                    if (isDownloadingSubmittedCV) return;
                    setIsDownloadingSubmittedCV(true);
                    try {
                      const fileName = generateCVFileName(viewingSubmittedCVApp.cvData);
                      await downloadCVAsPDF('modal-submitted-cv-export', { fileName });
                      showToast('CV uğurla PDF kimi birbaşa yükləndi!');
                    } catch (err) {
                      console.error('PDF export error:', err);
                      window.print();
                    } finally {
                      setIsDownloadingSubmittedCV(false);
                    }
                  }}
                  disabled={isDownloadingSubmittedCV}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                  title="CV-ni dərhal PDF formatında yüklə"
                >
                  {isDownloadingSubmittedCV ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloadingSubmittedCV ? 'PDF Hazırlanır...' : 'CV-ni PDF kimi yüklə'}</span>
                </button>
                <button
                  onClick={() => setViewingSubmittedCVApp(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-100 flex-1">
              <CVRenderer id="modal-submitted-cv-export" data={viewingSubmittedCVApp.cvData} template={selectedSubmittedTemplate} />
            </div>

            {/* Dynamic moving Jobia Logo at bottom of CV modal */}
            <ModalBottomLogo
              tagline="Jobia.az Rəsmi Namizəd CV Baxışı və İxracı"
              variant="slate"
              size="xs"
            />
          </div>
        </div>
      )}

      {/* 8. Google Chat Floating / Modal Workspace */}
      {isGoogleChatModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh] max-h-[850px]">
            <div className="p-3.5 px-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Google Chat Hub</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      Komanda & HR Əlaqəsi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Real-vaxt Google Chat otaqları, vakansiya və namizəd kartlarının birbaşa paylaşımı
                  </p>
                </div>
              </div>

              <button
                id="btn-close-google-chat-modal"
                onClick={() => setIsGoogleChatModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                title="Bağla"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <GoogleChatHub
                vacancies={vacancies}
                applications={applications}
                candidateCV={candidateCV}
                onClose={() => setIsGoogleChatModalOpen(false)}
              />
            </div>

            {/* Dynamic moving Jobia Logo at bottom of Google Chat modal */}
            <ModalBottomLogo
              tagline="Jobia.az & Google Chat Canlı Əlaqə Mərkəzi"
              variant="slate"
              size="xs"
            />
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
          <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Intro Tour / Platform Guide Modal */}
      <IntroTourModal
        isOpen={isIntroTourOpen}
        onClose={() => setIsIntroTourOpen(false)}
        onNavigateToTab={(tab, role) => {
          setIsPricingViewOpen(false);
          if (role) {
            setCurrentRole(role);
          }
          if (role === 'candidate' && tab) {
            setCandidateTab(tab);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* User Profile & Notification / Email Preferences Modal */}
      {isProfileModalOpen && currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          initialTab={profileModalTab}
          onUpdateUser={(updatedUser) => {
            setCurrentUser(updatedUser);
            showToast('Tənzimləmələr və bildiriş parametrləri uğurla yadda saxlanıldı!');
          }}
          onOpenVerifyModal={(u) => {
            setIsProfileModalOpen(false);
            setUserToVerify(u);
            setIsVerifyModalOpen(true);
          }}
          onOpenPricing={() => {
            setIsProfileModalOpen(false);
            setIsPricingViewOpen(true);
          }}
        />
      )}

      {/* Global Candidate Job Alerts & Notifications Modal */}
      <JobAlertManagerModal
        isOpen={isGlobalJobAlertModalOpen}
        onClose={() => setIsGlobalJobAlertModalOpen(false)}
        currentUser={currentUser}
        onShowToast={showToast}
      />

        {/* Footer with large logo and sweet slogan */}
        <Footer
          currentRole={currentRole}
          onRoleChange={(role) => {
            setIsPricingViewOpen(false);
            setCurrentRole(role);
          }}
          onNavigateCandidateTab={(tab) => {
            setIsPricingViewOpen(false);
            setCurrentRole('candidate');
            setCandidateTab(tab);
          }}
          onOpenPricing={() => setIsPricingViewOpen(true)}
          onOpenIntroTour={() => setIsIntroTourOpen(true)}
        />
        </div>
      </div>

      {/* Mobile Frozen Bottom Bar (VIP Planlar / PRO & Daxil ol / Qeydiyyat) */}
      <MobileFrozenBottomBar
        currentUser={currentUser}
        currentSubscription={currentSubscription}
        currentRole={currentRole}
        onOpenPricing={() => setIsPricingViewOpen(true)}
        onOpenAuthModal={handleOpenAuth}
        onOpenProfileModal={handleOpenProfileModal}
        onLogout={handleLogout}
      />
    </div>
  );
}
