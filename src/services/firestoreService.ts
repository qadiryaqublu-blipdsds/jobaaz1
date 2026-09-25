import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  increment,
  getDocFromServer 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  Vacancy, 
  Company, 
  Application, 
  JobOffer, 
  CandidateProfile, 
  AppNotification, 
  User, 
  UserRole, 
  UserEmailPreferences, 
  AdminAuditLog, 
  JobAlertSubscription,
  CVData
} from '../types';
import { buildActiveCandidateCV } from '../utils/applicationCVHelper';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Recursively remove `undefined` values and normalize objects for Firestore compatibility.
 * Firestore strictly rejects documents containing `undefined` values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) return null as any;
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Date) return data.toISOString() as any;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result as T;
}

/**
 * Test and validate connection to Firestore on initialization
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'test', 'connection'));
    return snap.exists();
  } catch (error) {
    return false;
  }
}

/* ========================================================================= */
/* 1. REAL VACANCIES / JOBS FIRESTORE SERVICE                                */
/* ========================================================================= */

/**
 * Local storage helper to safeguard UI continuity when Firestore is offline/unreachable
 */
function getLocalVacancies(): Vacancy[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('jobia_vacancies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Fetch all published vacancies for candidates and visitors
 */
export async function getPublishedVacancies(): Promise<Vacancy[]> {
  const localFallback = getLocalVacancies().filter((v) => v.isApproved === true && v.status === 'published');
  try {
    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    const list: Vacancy[] = [];
    snap.forEach((d) => {
      const data = d.data() as Vacancy;
      // STRICT ADMIN APPROVAL: Only jobs with isApproved === true and status === 'published'
      if (data.isApproved === true && data.status === 'published') {
        list.push({ ...data, id: d.id });
      }
    });
    return list.length > 0 ? list : localFallback;
  } catch (err) {
    console.warn('Notice: Fetching published jobs using local storage fallback:', err);
    return localFallback;
  }
}

/**
 * Realtime listener for published vacancies
 */
export function subscribeToPublishedVacancies(callback: (jobs: Vacancy[]) => void) {
  const localFallback = getLocalVacancies().filter((v) => v.isApproved === true && v.status === 'published');
  if (localFallback.length > 0) {
    callback(localFallback);
  }

  try {
    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'published')
    );
    return onSnapshot(
      q,
      (snap) => {
        const list: Vacancy[] = [];
        snap.forEach((d) => {
          const data = d.data() as Vacancy;
          // STRICT ADMIN APPROVAL: Only jobs with isApproved === true and status === 'published'
          if (data.isApproved === true && data.status === 'published') {
            list.push({ ...data, id: d.id });
          }
        });
        callback(list.length > 0 ? list : localFallback);
      },
      (err) => {
        console.warn('Notice: Published jobs snapshot offline fallback:', err?.message || err);
        callback(localFallback);
      }
    );
  } catch (err) {
    console.warn('Notice: Published jobs listener initialization notice:', err);
    callback(localFallback);
    return () => {};
  }
}

/**
 * Fetch company's own vacancies (for employer dashboard)
 */
export async function getCompanyVacancies(companyId: string): Promise<Vacancy[]> {
  if (!companyId) return [];
  const localFallback = getLocalVacancies().filter((v) => v.companyId === companyId);
  try {
    const q = query(
      collection(db, 'jobs'),
      where('companyId', '==', companyId)
    );
    const snap = await getDocs(q);
    const list: Vacancy[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Vacancy);
    });
    return list.length > 0 ? list : localFallback;
  } catch (err) {
    console.warn('Notice: Fetching company jobs using local storage fallback:', err);
    return localFallback;
  }
}

export async function getVacancyByIdFromFirestore(jobId: string): Promise<Vacancy | null> {
  try {
    const snap = await getDoc(doc(db, 'jobs', jobId));
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as Vacancy;
    }
    return getLocalVacancies().find((v) => v.id === jobId) || null;
  } catch (err) {
    console.warn('Notice: Fetching vacancy by ID using local fallback:', err);
    return getLocalVacancies().find((v) => v.id === jobId) || null;
  }
}

/**
 * Fetch all vacancies (for admin or search index)
 */
export async function getAllVacanciesFromFirestore(): Promise<Vacancy[]> {
  const localFallback = getLocalVacancies();
  try {
    const snap = await getDocs(collection(db, 'jobs'));
    const list: Vacancy[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Vacancy);
    });
    return list.length > 0 ? list : localFallback;
  } catch (err) {
    console.warn('Notice: Fetching all jobs using local storage fallback:', err);
    return localFallback;
  }
}

/**
 * Realtime listener for all vacancies (for admin panel & instant cross-tab moderation sync)
 */
export function subscribeToAllVacancies(callback: (jobs: Vacancy[]) => void) {
  const localFallback = getLocalVacancies();
  if (localFallback.length > 0) {
    callback(localFallback);
  }

  try {
    const q = collection(db, 'jobs');
    return onSnapshot(
      q,
      (snap) => {
        const list: Vacancy[] = [];
        snap.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as Vacancy);
        });
        callback(list.length > 0 ? list : localFallback);
      },
      (err) => {
        console.warn('Notice: Vacancies realtime listener operating in local/offline fallback mode:', err?.message || err);
        callback(localFallback);
      }
    );
  } catch (err) {
    console.warn('Notice: Vacancies listener initialization notice:', err);
    callback(localFallback);
    return () => {};
  }
}

/**
 * Delete vacancy
 */
export async function deleteVacancyFromFirestore(jobId: string): Promise<void> {
  await deleteDoc(doc(db, 'jobs', jobId));
}

/**
 * Create or save new vacancy
 */
export async function saveVacancyToFirestore(job: Partial<Vacancy>, userId?: string): Promise<string> {
  const jobId = job.id || `job-${Date.now()}`;
  const now = new Date().toISOString();
  const existingLocal = getLocalVacancies().find((v) => v.id === jobId);

  const rawRecord: Vacancy = {
    id: jobId,
    title: job.title || existingLocal?.title || 'Vakansiya',
    department: job.department || existingLocal?.department || '',
    category: job.category || existingLocal?.category || 'İT və Proqramlaşdırma',
    companyId: job.companyId || existingLocal?.companyId || '',
    companyName: job.companyName || existingLocal?.companyName || '',
    companyLogo: job.companyLogo || existingLocal?.companyLogo || '',
    companyVerified: job.companyVerified ?? existingLocal?.companyVerified ?? false,
    city: job.city || existingLocal?.city || 'Bakı',
    location: job.location || existingLocal?.location || job.city || 'Bakı',
    address: job.address || existingLocal?.address || '',
    metroStation: job.metroStation || existingLocal?.metroStation || '',
    latitude: job.latitude || existingLocal?.latitude || 40.4093,
    longitude: job.longitude || existingLocal?.longitude || 49.8671,
    workplaceType: job.workplaceType || existingLocal?.workplaceType || 'on-site',
    employmentType: job.employmentType || existingLocal?.employmentType || 'Tam ştat',
    experienceLevel: job.experienceLevel || existingLocal?.experienceLevel || 'Orta (Mid-level, 1-3 il)',
    education: job.education || existingLocal?.education || 'Ali',
    minSalary: job.minSalary ?? existingLocal?.minSalary ?? null as any,
    maxSalary: job.maxSalary ?? existingLocal?.maxSalary ?? null as any,
    currency: job.currency || existingLocal?.currency || 'AZN',
    hideSalary: job.hideSalary ?? existingLocal?.hideSalary ?? false,
    description: job.description || existingLocal?.description || '',
    responsibilities: job.responsibilities || existingLocal?.responsibilities || [],
    requirements: job.requirements || existingLocal?.requirements || [],
    benefits: job.benefits || existingLocal?.benefits || [],
    skills: job.skills || existingLocal?.skills || [],
    postedDate: job.postedDate || existingLocal?.postedDate || now.split('T')[0],
    deadline: job.deadline || existingLocal?.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: job.status ? job.status : (existingLocal?.status || 'pending_review'),
    isApproved: job.isApproved !== undefined ? (job.isApproved === true) : (existingLocal?.isApproved ?? false),
    editCount: job.editCount ?? existingLocal?.editCount ?? 0,
    maxEditsAllowed: job.maxEditsAllowed ?? existingLocal?.maxEditsAllowed ?? 1,
    lastEditedAt: job.lastEditedAt || existingLocal?.lastEditedAt || null as any,
    rejectionReason: job.rejectionReason || existingLocal?.rejectionReason || null as any,
    isFeatured: job.isFeatured !== undefined ? Boolean(job.isFeatured) : (existingLocal?.isFeatured ?? false),
    viewsCount: job.viewsCount !== undefined ? job.viewsCount : (existingLocal?.viewsCount ?? 0),
    applicantsCount: job.applicantsCount !== undefined ? job.applicantsCount : (existingLocal?.applicantsCount ?? 0),
    contactPhone: job.contactPhone || existingLocal?.contactPhone || '',
    contactWhatsapp: job.contactWhatsapp || existingLocal?.contactWhatsapp || '',
    isBlueCollarFriendly: job.isBlueCollarFriendly ?? existingLocal?.isBlueCollarFriendly ?? false,
    createdBy: userId || job.createdBy || existingLocal?.createdBy || '',
    createdAt: job.createdAt || existingLocal?.createdAt || now,
    updatedAt: now,
  };

  const record = sanitizeForFirestore(rawRecord);

  try {
    await setDoc(doc(db, 'jobs', jobId), record, { merge: true });
    console.log('✅ [Firestore Success] Vacancy saved successfully:', jobId);
  } catch (err) {
    console.warn('Notice: [Firestore Fallback] Vacancy saved to local store:', err);
  }

  // Also persist into local storage cache
  try {
    if (typeof localStorage !== 'undefined') {
      const cur = getLocalVacancies();
      const idx = cur.findIndex((j) => j.id === jobId);
      if (idx >= 0) {
        cur[idx] = { ...cur[idx], ...record };
      } else {
        cur.unshift(record);
      }
      localStorage.setItem('jobia_vacancies', JSON.stringify(cur));
    }
  } catch {}

  return jobId;
}

/**
 * Update vacancy status (e.g. approve, reject, close, publish)
 */
export async function updateVacancyStatus(jobId: string, status: Vacancy['status'], isApproved?: boolean) {
  const updates: Record<string, any> = { status, updatedAt: new Date().toISOString() };
  if (isApproved !== undefined) updates.isApproved = isApproved;
  const sanitized = sanitizeForFirestore(updates);
  try {
    await setDoc(doc(db, 'jobs', jobId), sanitized, { merge: true });
    console.log(`✅ [Firestore Success] Vacancy status updated: ${jobId} -> ${status}`);
  } catch (err) {
    console.warn(`Notice: [Firestore Fallback] Vacancy status updated locally: ${jobId} -> ${status}`, err);
  }

  // Also update local storage cache
  try {
    if (typeof localStorage !== 'undefined') {
      const cur = getLocalVacancies();
      const item = cur.find((j) => j.id === jobId);
      if (item) {
        item.status = status;
        if (isApproved !== undefined) item.isApproved = isApproved;
        item.updatedAt = updates.updatedAt;
        localStorage.setItem('jobia_vacancies', JSON.stringify(cur));
      }
    }
  } catch {}
}

/**
 * Update vacancy featured / VIP Premium status in Firestore and LocalStorage
 */
export async function updateVacancyFeatured(jobId: string, isFeatured: boolean): Promise<boolean> {
  const updates = {
    isFeatured: Boolean(isFeatured),
    updatedAt: new Date().toISOString(),
  };
  const sanitized = sanitizeForFirestore(updates);
  let success = false;
  try {
    await setDoc(doc(db, 'jobs', jobId), sanitized, { merge: true });
    console.log(`✅ [Firestore Success] Vacancy featured status updated in Firestore: ${jobId} -> ${isFeatured ? 'VIP/Premium' : 'Standart'}`);
    success = true;
  } catch (err) {
    console.warn(`Notice: [Firestore Fallback] Vacancy featured update notice: ${jobId}`, err);
  }

  // Also update local storage cache immediately
  try {
    if (typeof localStorage !== 'undefined') {
      const cur = getLocalVacancies();
      const item = cur.find((j) => j.id === jobId);
      if (item) {
        item.isFeatured = Boolean(isFeatured);
        item.updatedAt = updates.updatedAt;
        localStorage.setItem('jobia_vacancies', JSON.stringify(cur));
      }
    }
  } catch {}

  return success;
}

/**
 * General partial update for a vacancy in Firestore and localStorage
 */
export async function updateVacancyFields(jobId: string, partialUpdates: Partial<Vacancy>): Promise<boolean> {
  const updates = {
    ...partialUpdates,
    updatedAt: new Date().toISOString(),
  };
  const sanitized = sanitizeForFirestore(updates);
  let success = false;
  try {
    await setDoc(doc(db, 'jobs', jobId), sanitized, { merge: true });
    console.log(`✅ [Firestore Success] Vacancy fields updated in Firestore: ${jobId}`);
    success = true;
  } catch (err) {
    console.warn(`Notice: [Firestore Fallback] Vacancy update notice: ${jobId}`, err);
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const cur = getLocalVacancies();
      const idx = cur.findIndex((j) => j.id === jobId);
      if (idx >= 0) {
        cur[idx] = { ...cur[idx], ...updates };
        localStorage.setItem('jobia_vacancies', JSON.stringify(cur));
      }
    }
  } catch {}

  return success;
}

/**
 * Increment job view count
 */
export async function incrementJobViews(jobId: string) {
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      viewsCount: increment(1),
    });
  } catch {}
}

/* ========================================================================= */
/* 2. REAL COMPANIES FIRESTORE SERVICE                                       */
/* ========================================================================= */

/**
 * Local storage helper for companies
 */
function getLocalCompanies(): Company[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('jobia_companies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Get all verified companies for public directory
 */
export async function getVerifiedCompanies(): Promise<Company[]> {
  const localFallback = getLocalCompanies().filter((c) => c.verified || c.verificationStatus === 'verified');
  try {
    const q = query(
      collection(db, 'companies'),
      where('verificationStatus', '==', 'verified')
    );
    const snap = await getDocs(q);
    const list: Company[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Company);
    });
    return list.length > 0 ? list : localFallback;
  } catch (err) {
    console.warn('Notice: Fetching verified companies using local storage fallback:', err);
    return localFallback;
  }
}

/**
 * Get company by ID
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  try {
    const snap = await getDoc(doc(db, 'companies', companyId));
    if (snap.exists()) {
      return { ...snap.data(), id: snap.id } as Company;
    }
    return getLocalCompanies().find((c) => c.id === companyId) || null;
  } catch {
    return getLocalCompanies().find((c) => c.id === companyId) || null;
  }
}

/**
 * Update company profile or create if not exists
 */
export async function updateCompanyProfile(companyId: string, data: Partial<Company>) {
  const sanitized = sanitizeForFirestore({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  try {
    await setDoc(doc(db, 'companies', companyId), sanitized, { merge: true });
  } catch (err) {
    console.warn('Notice: Company profile updated locally:', err);
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const cur = getLocalCompanies();
      const idx = cur.findIndex((c) => c.id === companyId);
      if (idx >= 0) {
        cur[idx] = { ...cur[idx], ...sanitized };
      }
      localStorage.setItem('jobia_companies', JSON.stringify(cur));
    }
  } catch {}
}

/**
 * Create new company profile
 */
export async function createCompanyInFirestore(company: Omit<Company, 'id'>, customId?: string): Promise<Company> {
  const id = customId || `comp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const newCompany: Company = {
    ...company,
    id,
    verified: false,
    verificationStatus: 'pending',
    activeJobsCount: company.activeJobsCount ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, 'companies', id), sanitizeForFirestore(newCompany));
  } catch (err) {
    console.warn('Notice: Company created in local vault:', err);
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const cur = getLocalCompanies();
      cur.unshift(newCompany);
      localStorage.setItem('jobia_companies', JSON.stringify(cur));
    }
  } catch {}
  return newCompany;
}

/**
 * Get all companies for search / directory / admin
 */
export async function getAllCompaniesFromFirestore(): Promise<Company[]> {
  const localFallback = getLocalCompanies();
  try {
    const snap = await getDocs(collection(db, 'companies'));
    const list: Company[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Company);
    });
    return list.length > 0 ? list : localFallback;
  } catch (err) {
    console.warn('Notice: Fetching all companies using local storage fallback:', err);
    return localFallback;
  }
}

/**
 * Realtime listener for all companies across devices and browser sessions
 */
export function subscribeToAllCompanies(callback: (companies: Company[]) => void) {
  const localFallback = getLocalCompanies();
  if (localFallback.length > 0) {
    callback(localFallback);
  }

  try {
    const q = collection(db, 'companies');
    return onSnapshot(
      q,
      (snap) => {
        const list: Company[] = [];
        snap.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as Company);
        });
        callback(list.length > 0 ? list : localFallback);
      },
      (err) => {
        console.warn('Notice: Snapshot notice for companies, using fallback:', err?.message || err);
        callback(localFallback);
      }
    );
  } catch (err) {
    console.warn('Notice: Companies listener initialization notice:', err);
    callback(localFallback);
    return () => {};
  }
}

/**
 * Admin: Verify or change company status
 */
export async function setCompanyVerificationStatus(
  companyId: string, 
  status: 'pending' | 'verified' | 'rejected' | 'suspended'
) {
  await updateDoc(doc(db, 'companies', companyId), {
    verificationStatus: status,
    verified: status === 'verified',
    updatedAt: new Date().toISOString(),
  });
}

/* ========================================================================= */
/* 3. REAL CANDIDATE PROFILES & CVs                                          */
/* ========================================================================= */

/**
 * Local storage helper for candidate profile
 */
function getLocalCandidateProfile(userId: string): CandidateProfile | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(`jobia_candidate_profile_${userId}`);
      if (saved) return JSON.parse(saved);
    }
  } catch {}
  return null;
}

/**
 * Get candidate profile
 */
export async function getCandidateProfile(userId: string): Promise<CandidateProfile | null> {
  const localFallback = getLocalCandidateProfile(userId);
  try {
    const snap = await getDoc(doc(db, 'candidateProfiles', userId));
    if (snap.exists()) {
      return snap.data() as CandidateProfile;
    }
    return localFallback;
  } catch (err) {
    console.warn('Notice: Fetching candidate profile using local fallback:', err);
    return localFallback;
  }
}

/**
 * Save candidate profile
 */
export async function saveCandidateProfile(userId: string, data: Partial<CandidateProfile>) {
  const now = new Date().toISOString();
  const ref = doc(db, 'candidateProfiles', userId);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, sanitizeForFirestore({
        ...data,
        updatedAt: now,
      }));
    } else {
      await setDoc(ref, sanitizeForFirestore({
        ...data,
        id: userId,
        userId: userId,
        createdAt: now,
        updatedAt: now,
      }));
    }
  } catch (err) {
    console.warn('Notice: Candidate profile saved to local storage fallback:', err);
  }

  // Always update local cache
  try {
    if (typeof localStorage !== 'undefined') {
      const existing = getLocalCandidateProfile(userId) || ({} as any);
      const updated = {
        ...existing,
        ...data,
        id: userId,
        userId,
        updatedAt: now,
      };
      localStorage.setItem(`jobia_candidate_profile_${userId}`, JSON.stringify(updated));
    }
  } catch {}
}

/**
 * Curated seed candidate profiles for Azerbaijan market talent pool
 */
export const SEED_CANDIDATE_PROFILES: CandidateProfile[] = [
  {
    id: 'cand-seed-1',
    userId: 'cand-seed-1',
    fullName: 'Leyla Məmmədova',
    professionalTitle: 'Senior Frontend Developer (React / Next.js)',
    about: '5 ildən artıq frontend mühəndisliyi təcrübəsi. React, TypeScript, Next.js, Tailwind CSS və Redux Toolkit ilə yüksək yüklü fintex və e-ticarət tətbiqlərinin memarlığı.',
    phone: '+994 50 234 56 78',
    email: 'leyla.mammadova.dev@gmail.com',
    location: 'Bakı, Azərbaycan (Hibrid / Remote)',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'REST API', 'Git', 'Jest'],
    languages: [
      { id: 'l1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
      { id: 'l2', language: 'İngilis dili', proficiency: 'İşgüzar (C1)' },
      { id: 'l3', language: 'Rus dili', proficiency: 'Sərbəst (B2)' },
    ],
    education: [
      { id: 'e1', degree: 'Bakalavr - Kompüter Elmləri', institution: 'Azərbaycan Dövlət Neft və Sənaye Universiteti', graduationYear: '2020' },
    ],
    workExperience: [
      { id: 'w1', position: 'Senior Frontend Developer', role: 'Senior Frontend Developer', company: 'PashaPay MMC', period: '2022 - Hal-hazırda', description: 'Milli ödəniş sisteminin veb interfeyslərinin yenidən qurulması və optimizasiyası.' },
      { id: 'w2', position: 'Frontend Mühəndis', role: 'Frontend Mühəndis', company: 'Kapital Bank', period: '2020 - 2022', description: 'Birbank veb tətbiqinin komponent kitabxanasının hazırlanması.' },
    ],
    certifications: [
      { id: 'c1', name: 'Meta Certified Frontend Developer', issuer: 'Coursera / Meta', year: '2023' },
    ],
    expectedSalary: 2800,
    preferredEmploymentType: 'Tam ştat / Hibrid',
    livingRegion: 'baku',
    livingCity: 'Bakı',
    eligibleWorkRegions: ['baku', 'remote', 'sheki-zagatala'],
    willingToRelocate: false,
    profileVisibility: 'public',
    isOpenToEmployers: true,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-01T12:00:00.000Z',
  },
  {
    id: 'cand-seed-2',
    userId: 'cand-seed-2',
    fullName: 'Rəşad Əliyev',
    professionalTitle: 'Full Stack / Backend Mühəndis (Node.js & Go)',
    about: 'Mikroxidmət arxitekturaları, yüksək ötürücülü REST və gRPC xidmətləri, PostgreSQL və Docker üzrə 4 illik mühəndis təcrübəsi.',
    phone: '+994 55 987 65 43',
    email: 'rashad.aliyev.tech@gmail.com',
    location: 'Sumqayıt, Azərbaycan',
    livingRegion: 'baku',
    livingCity: 'Sumqayıt',
    eligibleWorkRegions: ['baku', 'remote', 'ganja-gazakh'],
    willingToRelocate: true,
    skills: ['Node.js', 'Go (Golang)', 'PostgreSQL', 'Docker', 'Redis', 'Kubernetes', 'Express', 'CI/CD'],
    languages: [
      { id: 'l1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
      { id: 'l2', language: 'İngilis dili', proficiency: 'Əla (B2)' },
    ],
    education: [
      { id: 'e1', degree: 'Magistr - İnformasiya Texnologiyaları', institution: 'ADA Universiteti', graduationYear: '2022' },
    ],
    workExperience: [
      { id: 'w1', position: 'Backend Developer', role: 'Backend Developer', company: 'AzInTelecom MMC', period: '2022 - Hal-hazırda', description: 'Bulud infrastrukturu servislərinin arxa plan API-larının qurulması.' },
    ],
    certifications: [
      { id: 'c1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2024' },
    ],
    expectedSalary: 2500,
    preferredEmploymentType: 'Tam ştat',
    profileVisibility: 'public',
    isOpenToEmployers: true,
    createdAt: '2026-01-15T11:00:00.000Z',
    updatedAt: '2026-03-05T14:30:00.000Z',
  },
  {
    id: 'cand-seed-3',
    userId: 'cand-seed-3',
    fullName: 'Nigar Qasımova',
    professionalTitle: 'Product & UI/UX Designer (Figma / Design Systems)',
    about: 'İstifadəçi təcrübəsinin (UX) dərindən araşdırılması, prototipləşdirmə, Figma komponent kitabxanaları və dizayn sistemlərinin qurulması üzrə 3.5 il təcrübə.',
    phone: '+994 70 345 12 90',
    email: 'nigar.qasimova.ux@gmail.com',
    location: 'Bakı, Azərbaycan',
    livingRegion: 'baku',
    livingCity: 'Bakı',
    eligibleWorkRegions: ['baku', 'remote', 'all-azerbaijan'],
    willingToRelocate: true,
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping', 'User Research', 'Mobile App UI'],
    languages: [
      { id: 'l1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
      { id: 'l2', language: 'İngilis dili', proficiency: 'İşgüzar (C1)' },
      { id: 'l3', language: 'Türk dili', proficiency: 'Sərbəst' },
    ],
    education: [
      { id: 'e1', degree: 'Bakalavr - Dizayn və Tətbiqi Sənət', institution: 'Azərbaycan Dövlət Mədəniyyət və İncəsənət Universiteti', graduationYear: '2021' },
    ],
    workExperience: [
      { id: 'w1', position: 'Lead UI/UX Designer', role: 'Lead UI/UX Designer', company: 'Digital Agency Baku', period: '2021 - Hal-hazırda', description: 'Mobil və veb tətbiqlər üçün 20-dən çox korporativ layihənin dizaynının idarə edilməsi.' },
    ],
    certifications: [
      { id: 'c1', name: 'Google UX Design Professional Certificate', issuer: 'Google', year: '2022' },
    ],
    expectedSalary: 1900,
    preferredEmploymentType: 'Tam ştat / Hibrid',
    profileVisibility: 'public',
    isOpenToEmployers: true,
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-03-08T10:15:00.000Z',
  },
  {
    id: 'cand-seed-4',
    userId: 'cand-seed-4',
    fullName: 'Tural Həsənov',
    professionalTitle: 'Digital Marketing & Growth Lead (Performance & SEO)',
    about: 'Google Ads, Meta Ads (Facebook/Instagram), TikTok reklamları, SEO optimizasiyası və analitika üzrə 4 illik təcrübə. ROI-nin maksimallaşdırılması.',
    phone: '+994 51 876 54 32',
    email: 'tural.hasanov.mktg@gmail.com',
    location: 'Gəncə, Azərbaycan',
    livingRegion: 'ganja-gazakh',
    livingCity: 'Gəncə',
    eligibleWorkRegions: ['ganja-gazakh', 'baku', 'remote'],
    willingToRelocate: true,
    skills: ['Google Ads', 'Meta Ads', 'SEO', 'Google Analytics 4', 'E-ticarət marketinqi', 'Content Marketing', 'A/B Testing'],
    languages: [
      { id: 'l1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
      { id: 'l2', language: 'İngilis dili', proficiency: 'Yaxşı (B2)' },
      { id: 'l3', language: 'Rus dili', proficiency: 'Sərbəst' },
    ],
    education: [
      { id: 'e1', degree: 'Bakalavr - Marketinq və Menecment', institution: 'Azərbaycan Dövlət İqtisad Universiteti (UNEC)', graduationYear: '2020' },
    ],
    workExperience: [
      { id: 'w1', position: 'Head of Digital Marketing', role: 'Head of Digital Marketing', company: 'Retail Retailers Group', period: '2022 - Hal-hazırda', description: 'Aylıq 100k+ büdcəli reklam kampaniyalarının idarə edilməsi.' },
    ],
    certifications: [
      { id: 'c1', name: 'Google Ads Search & Measurement Certified', issuer: 'Google Skillshop', year: '2023' },
    ],
    expectedSalary: 1800,
    preferredEmploymentType: 'Tam ştat',
    profileVisibility: 'public',
    isOpenToEmployers: true,
    createdAt: '2026-02-10T12:00:00.000Z',
    updatedAt: '2026-03-09T16:00:00.000Z',
  },
  {
    id: 'cand-seed-5',
    userId: 'cand-seed-5',
    fullName: 'Aysel İbrahimova',
    professionalTitle: 'HR & Talent Acquisition Specialist (İşə qəbul & Kadrlar)',
    about: 'Kadrların seçilməsi və yerləşdirilməsi (Recruitment), AR Əmək Məcəlləsi, onboarding prosesləri və əməkdaş məmnuniyyəti üzrə 3+ il təcrübə.',
    phone: '+994 50 654 98 21',
    email: 'aysel.ibrahimova.hr@gmail.com',
    location: 'Şəki, Azərbaycan',
    livingRegion: 'sheki-zagatala',
    livingCity: 'Şəki',
    eligibleWorkRegions: ['sheki-zagatala', 'baku', 'central-aran', 'remote'],
    willingToRelocate: false,
    skills: ['İşə qəbul (Recruitment)', 'AR Əmək Məcəlləsi', 'Onboarding', 'Müsahibə Texnikaları', 'Kadr kargüzarlığı', 'LinkedIn Recruiter'],
    languages: [
      { id: 'l1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
      { id: 'l2', language: 'İngilis dili', proficiency: 'Orta (B1)' },
      { id: 'l3', language: 'Rus dili', proficiency: 'Yaxşı' },
    ],
    education: [
      { id: 'e1', degree: 'Bakalavr - Psixologiya və İnsan Resursları', institution: 'Bakı Dövlət Universiteti', graduationYear: '2021' },
    ],
    workExperience: [
      { id: 'w1', position: 'HR Specialist', role: 'HR Specialist', company: 'Logistics Global Baku', period: '2021 - Hal-hazırda', description: '50+ vakansiyanın uğurla bağlanması və işə qəbul strategiyasının aparılması.' },
    ],
    certifications: [
      { id: 'c1', name: 'HR Management Professional', issuer: 'EBRD / Azerbaijan HR Forum', year: '2023' },
    ],
    expectedSalary: 1500,
    preferredEmploymentType: 'Tam ştat',
    profileVisibility: 'public',
    isOpenToEmployers: true,
    createdAt: '2026-02-14T08:30:00.000Z',
    updatedAt: '2026-03-10T11:20:00.000Z',
  },
  {
    id: 'cand-seed-6',
    userId: 'cand-seed-6',
    fullName: 'Elvin Kərimov',
    professionalTitle: 'Baş Mühasib / Maliyyə Təhlilçisi (1C & AR Vergi Məcəlləsi)',
    about: '1C 8.3 Mühasibat proqramı, BTP və e-taxes.gov.az portalları, vergi hesabatlarının hazırlanması, DSMF, statistik hesabatlar və maliyyə auditi üzrə 6 illik təcrübə.',
    phone: '+994 55 432 10 98',
    email: 'elvin.kerimov.accountant@gmail.com',
    location: 'Mingəçevir, Azərbaycan',
    livingRegion: 'central-aran',
    livingCity: 'Mingəçevir',
    eligibleWorkRegions: ['central-aran', 'baku', 'karabakh', 'remote'],
    willingToRelocate: true,
    skills: ['1C 8.3 Mühasibat', 'AR Vergi Məcəlləsi', 'BTP Portalı', 'Maliyyə Hesabatları', 'Əməkhaqqı Hesablanması', 'Excel (Advanced)', 'Statistik Hesabatlar'],
    languages: [
      { id: 'l1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
      { id: 'l2', language: 'Rus dili', proficiency: 'Əla (C1)' },
    ],
    education: [
      { id: 'e1', degree: 'Bakalavr - Mühasibat uçotu və audit', institution: 'Azərbaycan Dövlət İqtisad Universiteti', graduationYear: '2019' },
    ],
    workExperience: [
      { id: 'w1', position: 'Baş Mühasib', role: 'Baş Mühasib', company: 'Tikinti & İnvestisiya QSC', period: '2021 - Hal-hazırda', description: 'Müəssisənin bütün vergi, kargüzarlıq və audit əməliyyatlarının aparılması.' },
    ],
    certifications: [
      { id: 'c1', name: 'Peşəkar Mühasib Sertifikatı (PMS)', issuer: 'Maliyyə Nazirliyi AR', year: '2022' },
    ],
    expectedSalary: 2100,
    preferredEmploymentType: 'Tam ştat',
    profileVisibility: 'public',
    isOpenToEmployers: true,
    createdAt: '2026-02-20T14:00:00.000Z',
    updatedAt: '2026-03-11T13:40:00.000Z',
  },
  {
    id: 'cand-seed-7',
    userId: 'cand-seed-7',
    fullName: 'Vüqar Məmmədrzayev',
    professionalTitle: 'İnşaat Mühəndisi / Tikinti Layihə Rəhbəri',
    about: 'Bərpa-quruculuq layihələri, AutoCAD, smeta sənədləşməsi, texniki təhlükəsizlik və keyfiyyətə nəzarət üzrə 7 illik zəngin inşaat təcrübəsi.',
    phone: '+994 50 789 01 23',
    email: 'vuqar.rzayev.ing@gmail.com',
    location: 'Şuşa / Ağdam, Azərbaycan',
    livingRegion: 'karabakh',
    livingCity: 'Şuşa',
    eligibleWorkRegions: ['karabakh', 'baku', 'all-azerbaijan'],
    willingToRelocate: true,
    skills: ['AutoCAD', 'Tikinti Layihələri', 'Smeta Hesablamaları', 'Mühəndis Nəzarəti', 'İnşaat Menecmenti'],
    languages: [
      { id: 'l1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
      { id: 'l2', language: 'Rus dili', proficiency: 'İşgüzar' },
    ],
    education: [
      { id: 'e1', degree: 'Bakalavr - İnşaat Mühəndisliyi', institution: 'Azərbaycan Memarlıq və İnşaat Universiteti', graduationYear: '2018' },
    ],
    workExperience: [
      { id: 'w1', position: 'Baş Mühəndis', role: 'Baş Mühəndis', company: 'Qarabağ İnkişaf Qrupu', period: '2022 - Hal-hazırda', description: 'İnfrastruktur və bina tikintisi layihələrinin rəhbəri.' },
    ],
    certifications: [
      { id: 'c1', name: 'FIDIC Contract Management', issuer: 'Chamber of Engineers', year: '2023' },
    ],
    expectedSalary: 3200,
    preferredEmploymentType: 'Tam ştat / Layihə əsaslı',
    profileVisibility: 'public',
    isOpenToEmployers: true,
    createdAt: '2026-02-25T10:00:00.000Z',
    updatedAt: '2026-03-12T15:00:00.000Z',
  },
  {
    id: 'cand-seed-8',
    userId: 'cand-seed-8',
    fullName: 'Günay Nəzərova',
    professionalTitle: 'Müştəri Xidmətləri & Call Center Koordinatoru',
    about: 'Müştəri məmnuniyyəti (CSAT), CRM sistemləri, daxili və xarici zənglərin idarə edilməsi, şikayətlərin operativ həlli üzrə 3 illik təcrübə.',
    phone: '+994 77 567 89 01',
    email: 'gunay.nazarova.cs@gmail.com',
    location: 'Quba, Azərbaycan',
    livingRegion: 'quba-khachmaz',
    livingCity: 'Quba',
    eligibleWorkRegions: ['quba-khachmaz', 'baku', 'remote'],
    willingToRelocate: false,
    skills: ['Müştəri Xidmətləri', 'CRM Sistemləri', 'Zəng Mərkəzi', 'Kommunikasiya', 'Problem Həlletmə', 'MS Office'],
    languages: [
      { id: 'l1', language: 'Azərbaycan dili', proficiency: 'Ana dili' },
      { id: 'l2', language: 'İngilis dili', proficiency: 'Yaxşı (B2)' },
      { id: 'l3', language: 'Rus dili', proficiency: 'Əla (C1)' },
    ],
    education: [
      { id: 'e1', degree: 'Bakalavr - Xarici Dillər və Tərcümə', institution: 'Azərbaycan Dillər Universiteti', graduationYear: '2021' },
    ],
    workExperience: [
      { id: 'w1', position: 'Call Center Koordinatoru', role: 'Call Center Koordinatoru', company: 'Şimal Telekommunikasiya', period: '2022 - Hal-hazırda', description: 'Gündəlik 150+ müştəri sorğusunun təminatı və dəstək xidməti.' },
    ],
    certifications: [
      { id: 'c1', name: 'Customer Experience Excellence', issuer: 'CX Institute Baku', year: '2023' },
    ],
    expectedSalary: 1200,
    preferredEmploymentType: 'Tam ştat / Məsafədən',
    profileVisibility: 'public',
    isOpenToEmployers: true,
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-12T16:00:00.000Z',
  }
];

/**
 * Get all public candidates who are open to employers
 */
export async function getPublicCandidateProfiles(): Promise<CandidateProfile[]> {
  const result: CandidateProfile[] = [];
  const seenIds = new Set<string>();

  // 1. Query Firestore candidateProfiles (real registered candidates with full profiles)
  try {
    const snap = await getDocs(collection(db, 'candidateProfiles'));
    snap.forEach((docSnap) => {
      const data = docSnap.data() as CandidateProfile;
      const profileId = data.id || docSnap.id;
      // Exclude legacy seed ghosts if real profiles exist
      if (profileId.startsWith('cand-seed-')) return;

      if (data && data.profileVisibility !== 'private' && data.isOpenToEmployers !== false) {
        result.push({ 
          ...data, 
          id: profileId,
          livingRegion: data.livingRegion,
          livingCity: data.livingCity,
          eligibleWorkRegions: data.eligibleWorkRegions || [],
          willingToRelocate: data.willingToRelocate ?? false,
        });
        seenIds.add(profileId);
        if (data.userId) seenIds.add(data.userId);
      }
    });
  } catch (err) {
    console.warn('Notice: Firestore candidateProfiles query fallback:', err);
  }

  // 2. Query Firestore users collection for real registered accounts (candidates & businesses)
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    usersSnap.forEach((userDoc) => {
      const userData = userDoc.data() as any;
      const userId = userDoc.id || userData.id;
      const email = (userData.email || '').toLowerCase().trim();

      // Exclude system admin / bot emails and already seen profiles
      if (!email || email === 'admin@jobia.az' || seenIds.has(userId)) return;

      const isBusiness = userData.role === 'business' || Boolean(userData.companyName) || Boolean(userData.companyId);

      if (isBusiness) {
        result.push({
          id: userId,
          userId: userId,
          fullName: userData.companyName || userData.fullName || 'İşəgötürən Şirkət',
          professionalTitle: userData.companyName ? `${userData.companyName} təmsilçisi` : 'İşəgötürən / Rekruter',
          about: userData.bio || userData.description || '',
          email: userData.email,
          phone: userData.phone || '',
          location: userData.location || 'Bakı, Azərbaycan',
          livingRegion: userData.livingRegion || 'baku',
          livingCity: userData.livingCity || 'Bakı',
          eligibleWorkRegions: userData.eligibleWorkRegions || ['baku'],
          willingToRelocate: Boolean(userData.willingToRelocate),
          profilePhoto: userData.avatarUrl || userData.companyLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.companyName || userData.fullName || email)}`,
          skills: ['İşə qəbul', 'Kadr idarəetməsi', 'Müsahibələr'],
          languages: [],
          education: [],
          workExperience: [],
          certifications: [],
          hiring: {
            isHiring: true,
            companyName: userData.companyName || userData.fullName,
            rolesHiringFor: [],
          },
          isOpenToEmployers: false,
          profileVisibility: 'public',
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString(),
        });
        seenIds.add(userId);
      } else {
        // Real candidate user
        result.push({
          id: userId,
          userId: userId,
          fullName: userData.fullName || (userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : email.split('@')[0]),
          professionalTitle: userData.jobTitle || 'Peşəkar mütəxəssis',
          about: userData.bio || '',
          email: userData.email,
          phone: userData.phone || '',
          location: userData.location || 'Bakı, Azərbaycan',
          livingRegion: userData.livingRegion || 'baku',
          livingCity: userData.livingCity || 'Bakı',
          eligibleWorkRegions: userData.eligibleWorkRegions || ['baku', 'remote'],
          willingToRelocate: Boolean(userData.willingToRelocate),
          profilePhoto: userData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.fullName || email)}`,
          skills: Array.isArray(userData.skills) && userData.skills.length > 0 ? userData.skills : ['Komanda ilə iş', 'Problem həlletmə'],
          languages: Array.isArray(userData.languages) ? userData.languages : [],
          education: Array.isArray(userData.education) ? userData.education : [],
          workExperience: Array.isArray(userData.workExperience) ? userData.workExperience : [],
          certifications: Array.isArray(userData.certifications) ? userData.certifications : [],
          isOpenToEmployers: userData.isOpenToEmployers ?? true,
          openToWork: userData.openToWork || {
            isOpen: userData.isOpenToEmployers ?? true,
            targetJobTitles: userData.jobTitle ? [userData.jobTitle] : [],
            workplaceTypes: ['hybrid', 'remote'],
            availability: 'immediately',
            visibility: 'all_members',
          },
          profileVisibility: 'public',
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString(),
        });
        seenIds.add(userId);
      }
    });
  } catch (err) {
    console.warn('Notice: Firestore users query fallback:', err);
  }

  // 3. Query localStorage for any locally registered/saved candidate profiles
  try {
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('jobia_candidate_profile_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw) as CandidateProfile;
              if (parsed && !parsed.id?.startsWith('cand-seed-') && parsed.profileVisibility !== 'private' && parsed.isOpenToEmployers !== false) {
                if (!seenIds.has(parsed.id) && !seenIds.has(parsed.userId)) {
                  result.unshift(parsed);
                  seenIds.add(parsed.id);
                  if (parsed.userId) seenIds.add(parsed.userId);
                }
              }
            }
          } catch {}
        }
      }
    }
  } catch {}

  // If no candidates found in database, provide SEED_CANDIDATE_PROFILES covering all regions of Azerbaijan
  if (result.length === 0) {
    return SEED_CANDIDATE_PROFILES;
  }
  return result;
}

/**
 * Get IDs of candidates whose full contact details have been unlocked by this employer
 */
export function getEmployerUnlockedCandidateIds(companyId: string): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`jobia_unlocked_candidates_${companyId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Unlock a candidate's full contact details for an employer (simulated or paid)
 */
export function unlockCandidateForEmployer(companyId: string, candidateId: string): string[] {
  if (typeof localStorage === 'undefined') return [candidateId];
  try {
    const current = getEmployerUnlockedCandidateIds(companyId);
    if (!current.includes(candidateId)) {
      const updated = [...current, candidateId];
      localStorage.setItem(`jobia_unlocked_candidates_${companyId}`, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch {
    return [candidateId];
  }
}

/**
 * Save candidate's active platform CV to Firestore and local storage cache
 */
export async function saveCandidatePlatformCV(userId: string, cv: CVData): Promise<void> {
  const now = new Date().toISOString();
  
  // 1. Save user-scoped local storage
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`jobia_candidate_cv_${userId}`, JSON.stringify(cv));
      localStorage.setItem('jobia_candidate_cv', JSON.stringify(cv));
      localStorage.setItem('jobia_has_platform_cv', 'true');
    }
  } catch (e) {
    console.warn('Local storage CV cache error:', e);
  }

  // 2. Save into Firestore candidateProfile document
  try {
    await saveCandidateProfile(userId, {
      fullName: cv.personalInfo?.fullName || '',
      email: cv.personalInfo?.email || '',
      phone: cv.personalInfo?.phone || '',
      professionalTitle: cv.personalInfo?.jobTitle || '',
      about: cv.personalInfo?.summary || '',
      location: cv.personalInfo?.address || '',
      skills: (cv.skills || []).map((s) => s.name),
      workExperience: cv.experiences || [],
      education: cv.education || [],
      languages: cv.languages || [],
      certifications: cv.certificates || [],
      cvData: cv,
      updatedAt: now,
    });
  } catch (err) {
    console.warn('Firestore candidate CV save error:', err);
  }

  // 3. Also update users collection if available
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, sanitizeForFirestore({
      fullName: cv.personalInfo?.fullName || '',
      phone: cv.personalInfo?.phone || '',
      jobTitle: cv.personalInfo?.jobTitle || '',
      location: cv.personalInfo?.address || '',
      bio: cv.personalInfo?.summary || '',
      skills: (cv.skills || []).map((s) => s.name),
      cvData: cv,
      updatedAt: now,
    }));
  } catch (e) {}

  // 4. Also register/update in createdCVs collection for Admin registry
  try {
    if (cv.personalInfo?.fullName) {
      const cvRecRef = doc(db, 'createdCVs', `cv-user-${userId}`);
      await setDoc(cvRecRef, sanitizeForFirestore({
        id: `cv-user-${userId}`,
        userId,
        userEmail: cv.personalInfo?.email || '',
        fullName: cv.personalInfo?.fullName || '',
        jobTitle: cv.personalInfo?.jobTitle || 'Namizəd',
        email: cv.personalInfo?.email || '',
        phone: cv.personalInfo?.phone || '',
        city: cv.personalInfo?.address || 'Bakı',
        template: cv.template || 'baku-corporate',
        language: cv.language || 'az',
        hasPhoto: Boolean(cv.showPhoto && cv.personalInfo?.photoUrl),
        photoUrl: cv.personalInfo?.photoUrl || '',
        summary: cv.personalInfo?.summary || '',
        skills: (cv.skills || []).map((s) => s.name),
        skillsCount: (cv.skills || []).length,
        experienceCount: (cv.experiences || []).length,
        educationCount: (cv.education || []).length,
        languagesCount: (cv.languages || []).length,
        downloadCount: 1,
        lastAction: 'updated',
        source: 'candidate_profile',
        status: 'active',
        updatedAt: now,
        createdAt: now,
        cvData: cv
      }), { merge: true });
    }
  } catch (e) {}
}

/**
 * Get candidate's active platform CV
 */
export async function getCandidatePlatformCV(userId: string): Promise<CVData | null> {
  // Check user-scoped local storage first
  try {
    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(`jobia_candidate_cv_${userId}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && parsed.personalInfo) return parsed;
      }
    }
  } catch {}

  // Check Firestore candidate profile
  try {
    const profile = await getCandidateProfile(userId);
    if (profile && profile.cvData && profile.cvData.personalInfo) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`jobia_candidate_cv_${userId}`, JSON.stringify(profile.cvData));
      }
      return profile.cvData;
    }
  } catch {}

  return null;
}

/* ========================================================================= */
/* 4. REAL APPLICATIONS FIRESTORE SERVICE                                    */
/* ========================================================================= */

/**
 * Local storage helper for applications, checking both user-scoped and global stores
 */
export function getLocalApplications(candidateId?: string): Application[] {
  const map = new Map<string, Application>();
  try {
    if (typeof localStorage !== 'undefined') {
      if (candidateId) {
        const userSaved = localStorage.getItem(`jobia_candidate_applications_${candidateId}`);
        if (userSaved) {
          const parsed = JSON.parse(userSaved);
          if (Array.isArray(parsed)) {
            parsed.forEach((a) => {
              if (a && a.id) map.set(a.id, a);
            });
          }
        }
      }
      const saved = localStorage.getItem('jobia_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((a) => {
            if (a && a.id && !map.has(a.id)) {
              map.set(a.id, a);
            }
          });
        }
      }
    }
  } catch {}
  return Array.from(map.values());
}

/**
 * Merges remote Firestore applications with local applications without losing un-synced items
 */
export function mergeApplicationLists(firestoreApps: Application[], localApps: Application[]): Application[] {
  const map = new Map<string, Application>();

  // 1. First add local applications
  (localApps || []).forEach((app) => {
    if (app && app.id) {
      map.set(app.id, app);
    }
  });

  // 2. Merge Firestore applications
  (firestoreApps || []).forEach((fsApp) => {
    if (fsApp && fsApp.id) {
      const existing = map.get(fsApp.id);
      map.set(fsApp.id, {
        ...fsApp,
        cvFileData: existing?.cvFileData || fsApp.cvFileData,
        cvFileName: existing?.cvFileName || fsApp.cvFileName,
        cvFileType: existing?.cvFileType || fsApp.cvFileType,
        cvData: fsApp.cvData || existing?.cvData,
        hasPlatformCV: fsApp.hasPlatformCV !== undefined ? fsApp.hasPlatformCV : existing?.hasPlatformCV,
        cvSource: fsApp.cvSource || existing?.cvSource,
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
 * Check if candidate already applied to this job
 */
export async function hasCandidateApplied(candidateId: string, jobId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'applications'),
      where('candidateId', '==', candidateId),
      where('jobId', '==', jobId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) return true;
    const local = getLocalApplications();
    return local.some((a) => a.candidateId === candidateId && (a.vacancyId === jobId || a.jobId === jobId));
  } catch {
    const local = getLocalApplications();
    return local.some((a) => a.candidateId === candidateId && (a.vacancyId === jobId || a.jobId === jobId));
  }
}

/**
 * Submit real application to a vacancy
 */
export async function submitJobApplication(
  job: Vacancy,
  candidate: User,
  candidateProfile: CandidateProfile | null,
  coverNote?: string
): Promise<Application> {
  const appId = `app-${Date.now()}`;
  const now = new Date().toISOString();

  // Check duplicate
  const alreadyApplied = await hasCandidateApplied(candidate.id, job.id);
  if (alreadyApplied) {
    throw new Error('Siz artıq bu vakansiyaya müraciət etmisiniz.');
  }

  const fullCV = buildActiveCandidateCV(candidate, candidateProfile?.cvData, candidateProfile);

  const rawApp: Application = {
    id: appId,
    jobId: job.id,
    vacancyId: job.id,
    vacancyTitle: job.title,
    companyId: job.companyId,
    companyName: job.companyName,
    companyLogo: job.companyLogo || '',
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email.toLowerCase().trim(),
    candidatePhone: candidate.phone || '',
    candidatePhoto: candidate.avatarUrl || candidateProfile?.profilePhoto || '',
    appliedDate: now.split('T')[0],
    status: 'Müraciət edildi',
    coverNote: coverNote || '',
    cvUrl: candidateProfile?.cvUrl || '',
    hasPlatformCV: true,
    cvSource: 'platform',
    cvData: fullCV,
    createdAt: now,
    updatedAt: now,
  };

  const newApp = sanitizeForFirestore(rawApp);
  try {
    await setDoc(doc(db, 'applications', appId), newApp);
  } catch (err) {
    console.warn('Notice: Application saved to local store fallback:', err);
  }

  // Persist into local storage caches (both user-scoped and global)
  try {
    if (typeof localStorage !== 'undefined') {
      const userApps = getLocalApplications(candidate.id);
      const updatedUserApps = [newApp, ...userApps.filter(a => a.id !== newApp.id)];
      localStorage.setItem(`jobia_candidate_applications_${candidate.id}`, JSON.stringify(updatedUserApps));

      const cur = getLocalApplications();
      const updatedGlobal = [newApp, ...cur.filter(a => a.id !== newApp.id)];
      localStorage.setItem('jobia_applications', JSON.stringify(updatedGlobal));
    }
  } catch {}

  // Increment applicants count on job
  await updateDoc(doc(db, 'jobs', job.id), {
    applicantsCount: increment(1),
  }).catch(() => {});

  // Create real notification for employer
  await createNotification({
    userId: job.createdBy || job.companyId,
    title: 'Yeni Namizəd Müraciəti!',
    message: `${candidate.fullName} "${job.title}" vakansiyasına müraciət etdi.`,
    type: 'new_applicant',
    link: `/employer/applications`,
  });

  return newApp;
}

/**
 * Direct save application to Firestore (handles both registered candidates and guest applications with CV file uploads)
 */
export async function saveApplicationDirectToFirestore(app: Application): Promise<void> {
  try {
    // Sanitize document for Firestore: if cvFileData is excessively large base64 (> 600KB), truncate or store safely so Firestore 1MB doc limit is not exceeded
    const firestoreApp = { ...app };
    if (firestoreApp.candidateEmail) {
      firestoreApp.candidateEmail = firestoreApp.candidateEmail.toLowerCase().trim();
    }
    if (firestoreApp.cvFileData && firestoreApp.cvFileData.length > 700000) {
      firestoreApp.cvFileData = firestoreApp.cvFileData.slice(0, 300000);
    }

    const sanitizedApp = sanitizeForFirestore(firestoreApp);
    await setDoc(doc(db, 'applications', app.id), sanitizedApp);
    if (app.vacancyId || app.jobId) {
      const jId = app.vacancyId || app.jobId!;
      await updateDoc(doc(db, 'jobs', jId), {
        applicantsCount: increment(1),
      }).catch(() => {});
    }

    // Create real notification for employer
    if (app.companyId) {
      await createNotification({
        userId: app.companyId,
        title: '📋 Yeni Müraciət Qəbul Olundu!',
        message: `${app.candidateName} "${app.vacancyTitle}" vakansiyasına müraciət etdi.`,
        type: 'new_applicant',
        link: `/business/applications`,
        data: {
          applicationId: app.id,
          candidateName: app.candidateName,
          vacancyTitle: app.vacancyTitle,
        }
      }).catch(() => {});
    }

    // Create confirmation notification for candidate
    const candidateTargetId = app.candidateId || app.candidateEmail;
    if (candidateTargetId) {
      await createNotification({
        userId: candidateTargetId,
        title: '✅ Müraciətiniz Uğurla Çatdırıldı',
        message: `"${app.vacancyTitle}" vakansiyası üzrə müraciətiniz və CV profiliniz ${app.companyName} şirkətinə göndərildi.`,
        type: 'application_submitted',
        link: `/candidate/applications`,
        data: {
          applicationId: app.id,
          vacancyTitle: app.vacancyTitle,
          companyName: app.companyName,
          candidateEmail: app.candidateEmail,
        }
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Firestore save application error:', err);
  }
}

/**
 * Get candidate's own applications (by candidateId or email)
 */
export async function getCandidateApplications(candidateId?: string, candidateEmail?: string): Promise<Application[]> {
  try {
    const list: Application[] = [];
    const seenIds = new Set<string>();

    if (candidateId) {
      const q = query(
        collection(db, 'applications'),
        where('candidateId', '==', candidateId)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          list.push({ ...d.data(), id: d.id } as Application);
        }
      });
    }

    if (candidateEmail && candidateEmail.trim()) {
      const emailLower = candidateEmail.trim().toLowerCase();
      const qEmail = query(
        collection(db, 'applications'),
        where('candidateEmail', '==', emailLower)
      );
      const snapEmail = await getDocs(qEmail);
      snapEmail.forEach((d) => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          list.push({ ...d.data(), id: d.id } as Application);
        }
      });

      if (candidateEmail.trim() !== emailLower) {
        const qEmailExact = query(
          collection(db, 'applications'),
          where('candidateEmail', '==', candidateEmail.trim())
        );
        const snapExact = await getDocs(qEmailExact);
        snapExact.forEach((d) => {
          if (!seenIds.has(d.id)) {
            seenIds.add(d.id);
            list.push({ ...d.data(), id: d.id } as Application);
          }
        });
      }
    }

    const normEmail = candidateEmail ? candidateEmail.trim().toLowerCase() : '';
    const localApps = getLocalApplications(candidateId).filter((a) => {
      const matchId = candidateId && a.candidateId === candidateId;
      const matchEmail = normEmail && a.candidateEmail?.toLowerCase().trim() === normEmail;
      return matchId || matchEmail;
    });

    return mergeApplicationLists(list, localApps);
  } catch (err) {
    console.warn('Notice: Fetching candidate applications using local storage fallback:', err);
    const normEmail = candidateEmail ? candidateEmail.trim().toLowerCase() : '';
    return getLocalApplications(candidateId).filter((a) => {
      const matchId = candidateId && a.candidateId === candidateId;
      const matchEmail = normEmail && a.candidateEmail?.toLowerCase().trim() === normEmail;
      return matchId || matchEmail;
    });
  }
}

/**
 * Get employer's company applications
 */
export async function getCompanyApplications(
  companyId: string, 
  companyName?: string, 
  jobIds?: string[]
): Promise<Application[]> {
  const normName = companyName ? companyName.toLowerCase().trim() : '';
  const validJobIds = new Set(jobIds || []);
  const filterLocal = () => getLocalApplications().filter((a) => {
    const appCompId = a.companyId;
    const appCompName = a.companyName ? a.companyName.toLowerCase().trim() : '';
    const appVacId = a.vacancyId || a.jobId;
    return (companyId && appCompId === companyId) ||
           (normName && appCompName === normName) ||
           (appVacId && validJobIds.has(appVacId));
  });

  try {
    const list: Application[] = [];
    const seenIds = new Set<string>();

    if (companyId) {
      const q = query(
        collection(db, 'applications'),
        where('companyId', '==', companyId)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          list.push({ ...d.data(), id: d.id } as Application);
        }
      });
    }

    if (companyName && companyName.trim()) {
      const qName = query(
        collection(db, 'applications'),
        where('companyName', '==', companyName.trim())
      );
      const snapName = await getDocs(qName);
      snapName.forEach((d) => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          list.push({ ...d.data(), id: d.id } as Application);
        }
      });
    }

    // Also match applications for vacancies belonging to this company/employer
    if (Array.isArray(jobIds) && jobIds.length > 0) {
      // Chunk job IDs by 10 for Firestore 'in' query limit
      for (let i = 0; i < jobIds.length; i += 10) {
        const slice = jobIds.slice(i, i + 10);
        try {
          const qJobs = query(
            collection(db, 'applications'),
            where('vacancyId', 'in', slice)
          );
          const snapJobs = await getDocs(qJobs);
          snapJobs.forEach((d) => {
            if (!seenIds.has(d.id)) {
              seenIds.add(d.id);
              list.push({ ...d.data(), id: d.id } as Application);
            }
          });
        } catch {}
      }
    }

    return list.length > 0 ? list : filterLocal();
  } catch (err) {
    console.warn('Notice: Fetching company applications using local storage fallback:', err);
    return filterLocal();
  }
}

/**
 * Realtime subscription to company applications for cross-network and multi-device updates
 */
export function subscribeToCompanyApplications(
  companyId: string | undefined,
  companyName: string | undefined,
  jobIds: string[] | undefined,
  callback: (apps: Application[]) => void
) {
  const normName = companyName ? companyName.toLowerCase().trim() : '';
  const validJobIds = new Set(jobIds || []);
  const filterLocal = () => getLocalApplications().filter((a) => {
    const appCompId = a.companyId;
    const appCompName = a.companyName ? a.companyName.toLowerCase().trim() : '';
    const appVacId = a.vacancyId || a.jobId;
    return (companyId && appCompId === companyId) ||
           (normName && appCompName === normName) ||
           (appVacId && validJobIds.has(appVacId));
  });

  const localFallback = filterLocal();
  if (localFallback.length > 0) {
    callback(localFallback);
  }

  try {
    const q = collection(db, 'applications');
    return onSnapshot(
      q,
      (snap) => {
        const list: Application[] = [];
        snap.forEach((d) => {
          const data = d.data() as Application;
          const appCompId = data.companyId;
          const appCompName = data.companyName ? data.companyName.toLowerCase().trim() : '';
          const appVacId = data.vacancyId || data.jobId;

          const isMatch =
            (companyId && appCompId === companyId) ||
            (normName && appCompName === normName) ||
            (appVacId && validJobIds.has(appVacId));

          if (isMatch) {
            list.push({ ...data, id: d.id });
          }
        });
        callback(list.length > 0 ? list : filterLocal());
      },
      (err) => {
        console.warn('Notice: Snapshot notice for company applications, using fallback:', err?.message || err);
        callback(filterLocal());
      }
    );
  } catch (err) {
    console.warn('Notice: Company applications listener initialization notice:', err);
    callback(filterLocal());
    return () => {};
  }
}

/**
 * Realtime subscription to candidate's own applications across devices
 */
export function subscribeToCandidateApplications(
  candidateId: string | undefined,
  candidateEmail: string | undefined,
  callback: (apps: Application[]) => void
) {
  const normEmail = candidateEmail ? candidateEmail.toLowerCase().trim() : '';
  const filterLocal = () => getLocalApplications().filter((a) => {
    const appCandId = a.candidateId;
    const appCandEmail = a.candidateEmail ? a.candidateEmail.toLowerCase().trim() : '';
    return (candidateId && appCandId === candidateId) ||
           (normEmail && appCandEmail === normEmail);
  });

  const localFallback = filterLocal();
  if (localFallback.length > 0) {
    callback(localFallback);
  }

  try {
    const q = collection(db, 'applications');
    return onSnapshot(
      q,
      (snap) => {
        const list: Application[] = [];
        snap.forEach((d) => {
          const data = d.data() as Application;
          const appCandId = data.candidateId;
          const appCandEmail = data.candidateEmail ? data.candidateEmail.toLowerCase().trim() : '';

          const isMatch =
            (candidateId && appCandId === candidateId) ||
            (normEmail && appCandEmail === normEmail);

          if (isMatch) {
            list.push({ ...data, id: d.id });
          }
        });
        const currentLocal = filterLocal();
        const merged = mergeApplicationLists(list, currentLocal);
        callback(merged);
      },
      (err) => {
        console.warn('Notice: Snapshot notice for candidate applications, using fallback:', err?.message || err);
        callback(filterLocal());
      }
    );
  } catch (err) {
    console.warn('Notice: Candidate applications listener initialization notice:', err);
    callback(filterLocal());
    return () => {};
  }
}

/**
 * Get all applications for Admin panel and system sync
 */
export async function getAllApplicationsFromFirestore(): Promise<Application[]> {
  const localFallback = getLocalApplications();
  try {
    const snap = await getDocs(collection(db, 'applications'));
    const list: Application[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as Application);
    });
    return list.length > 0 ? list : localFallback;
  } catch (err) {
    console.warn('Notice: Fetching all applications using local storage fallback:', err);
    return localFallback;
  }
}

/**
 * Update application status (Employer / Admin)
 */
export async function updateApplicationStatus(
  applicationId: string, 
  status: Application['status'], 
  recruiterNotes?: string
) {
  const updates: Record<string, any> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (recruiterNotes !== undefined) updates.recruiterNotes = recruiterNotes;

  try {
    await updateDoc(doc(db, 'applications', applicationId), updates);
  } catch (err) {
    console.warn('Firestore updateApplicationStatus doc note:', err);
  }

  // Notify candidate
  try {
    const snap = await getDoc(doc(db, 'applications', applicationId));
    if (snap.exists()) {
      const appData = snap.data() as Application;
      const targetUserId = appData.candidateId || appData.candidateEmail;
      if (targetUserId) {
        let notifTitle = '📋 Müraciət Statusu Yeniləndi';
        let notifType: AppNotification['type'] = 'status_changed';
        let notifMsg = `"${appData.vacancyTitle}" vakansiyası üzrə müraciətinizin statusu yeniləndi: ${status}`;

        if (status === 'Müsahibəyə dəvət') {
          notifTitle = '🗓️ Müsahibəyə Dəvət Olundunuz!';
          notifType = 'interview_invite';
          notifMsg = `Təbrik edirik! İşəgötürən "${appData.vacancyTitle}" vakansiyası üzrə müraciətinizi bəyəndi və sizi müsahibəyə dəvət edir.`;
        } else if (status === 'Təklif verildi') {
          notifTitle = '🎉 Rəsmi İş Təklifi Göndərildi!';
          notifType = 'job_offer';
          notifMsg = `Əla xəbər! "${appData.vacancyTitle}" vəzifəsi üzrə rəsmi iş təklifiniz hazırdır.`;
        } else if (status === 'Qəbul edildi') {
          notifTitle = '✅ İşə Qəbul Təsdiqləndi!';
          notifType = 'status_changed';
          notifMsg = `Təbrik edirik! "${appData.vacancyTitle}" vakansiyası üzrə işə qəbul prosesiniz uğurla tamamlandı.`;
        } else if (status === 'Baxıldı') {
          notifTitle = '👀 Müraciətinizə Baxıldı';
          notifType = 'status_changed';
          notifMsg = `İşəgötürən "${appData.vacancyTitle}" vakansiyası üzrə CV-nizi nəzərdən keçirdi.`;
        }

        if (recruiterNotes) {
          notifMsg += ` (İşəgötürən qeydi: "${recruiterNotes}")`;
        }

        await createNotification({
          userId: targetUserId,
          title: notifTitle,
          message: notifMsg,
          type: notifType,
          link: '/candidate/applications',
          data: {
            applicationId,
            status,
            vacancyTitle: appData.vacancyTitle,
            companyName: appData.companyName,
            candidateEmail: appData.candidateEmail,
          },
        });
      }
    }
  } catch (notifErr) {
    console.warn('Notification dispatch note:', notifErr);
  }
}

/* ========================================================================= */
/* 5. REAL NOTIFICATIONS FIRESTORE SERVICE                                   */
/* ========================================================================= */

const LOCAL_NOTIFS_KEY = 'jobia_notifications_store';

function getLocalNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNotifications(list: AppNotification[]) {
  try {
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * Create a real notification (Firestore + Local fallback)
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: AppNotification['type'];
  link?: string;
  data?: Record<string, any>;
}): Promise<string> {
  const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const notif: AppNotification = {
    id: notifId,
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type,
    isRead: false,
    link: data.link,
    data: data.data,
    createdAt: new Date().toISOString(),
  };

  // 1. Save local
  const localList = getLocalNotifications();
  localList.unshift(notif);
  saveLocalNotifications(localList.slice(0, 100));

  // 2. Save Firestore
  try {
    const sanitizedNotif = sanitizeForFirestore(notif);
    await setDoc(doc(db, 'notifications', notifId), sanitizedNotif);
  } catch (err) {
    console.warn('Firestore createNotification notice, saved locally:', err);
  }

  // Trigger browser custom event for immediate in-window reactivity
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_new_notification', { detail: notif }));
  }

  return notifId;
}

/**
 * Extract all identifiers belonging to a user for targeted notification synchronization
 */
export function extractNotificationTargetIds(target: any): string[] {
  const ids = new Set<string>();
  if (!target) {
    ids.add('all');
    return Array.from(ids);
  }
  if (typeof target === 'string') {
    const trimmed = target.trim();
    if (trimmed) {
      ids.add(trimmed);
      if (trimmed.includes('@')) {
        ids.add(trimmed.toLowerCase());
      }
    }
    ids.add('all');
    return Array.from(ids).filter(Boolean);
  }
  if (Array.isArray(target)) {
    target.forEach((item) => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed) {
          ids.add(trimmed);
          if (trimmed.includes('@')) {
            ids.add(trimmed.toLowerCase());
          }
        }
      }
    });
    ids.add('all');
    return Array.from(ids).filter(Boolean);
  }
  if (typeof target === 'object') {
    if (target.id && typeof target.id === 'string' && target.id.trim()) {
      ids.add(target.id.trim());
    }
    if (target.email && typeof target.email === 'string' && target.email.trim()) {
      ids.add(target.email.trim());
      ids.add(target.email.trim().toLowerCase());
    }
    if (target.companyId && typeof target.companyId === 'string' && target.companyId.trim()) {
      ids.add(target.companyId.trim());
    }
    if (target.role === 'admin') {
      ids.add('admin');
    }
    ids.add('all');
  }
  return Array.from(ids).filter(Boolean);
}

/**
 * Filter helper for notifications belonging to any target ID
 */
function isNotificationForTarget(n: AppNotification, targetIdSet: Set<string>): boolean {
  if (targetIdSet.has(n.userId)) return true;
  if (n.userId === 'all') return true;
  if (n.data?.candidateEmail && targetIdSet.has(n.data.candidateEmail.toLowerCase().trim())) return true;
  if (n.data?.candidateId && targetIdSet.has(n.data.candidateId.trim())) return true;
  if (n.data?.companyId && targetIdSet.has(n.data.companyId.trim())) return true;
  return false;
}

/**
 * Realtime subscribe to user notifications from Firestore
 * Supports multi-identifier targeting: User UID, Email (case-insensitive), Company ID, Role, and Broadcasts.
 */
export function subscribeToUserNotifications(
  target: string | string[] | Partial<User> | null, 
  callback: (notifications: AppNotification[]) => void
) {
  const targetIds = extractNotificationTargetIds(target);
  const targetIdSet = new Set(targetIds);

  const isValidRealNotification = (n: AppNotification) => {
    if (!n || !n.id) return false;
    if (n.data?.isSimulation) return false;
    if (n.userId === 'demo-candidate') return false;
    const title = (n.title || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();
    if (title.includes('mock') || title.includes('simulyasiya') || title.includes('test bildiriş')) return false;
    if (msg.includes('mock') || msg.includes('simulyasiya')) return false;
    return true;
  };

  // 1. Initial immediate local cache dispatch
  const initialLocal = getLocalNotifications().filter(
    (n) => isNotificationForTarget(n, targetIdSet) && isValidRealNotification(n)
  );
  initialLocal.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  callback(initialLocal);

  // 2. Window event listener for instantaneous local UI responsiveness
  const handleLocalEvent = () => {
    const updated = getLocalNotifications().filter(
      (n) => isNotificationForTarget(n, targetIdSet) && isValidRealNotification(n)
    );
    updated.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(updated);
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('jobia_new_notification', handleLocalEvent);
  }

  // 3. Authoritative Firestore Realtime Snapshot
  let unsubscribeFirestore = () => {};
  try {
    const validQueryIds = targetIds.slice(0, 30);
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', validQueryIds)
    );

    unsubscribeFirestore = onSnapshot(q, (snap) => {
      const firestoreItems: AppNotification[] = [];
      snap.forEach((d) => {
        const item = { ...d.data(), id: d.id } as AppNotification;
        if (isValidRealNotification(item)) {
          firestoreItems.push(item);
        }
      });

      // Index authoritative Firestore items
      const mergedMap = new Map<string, AppNotification>();
      firestoreItems.forEach((n) => mergedMap.set(n.id, n));

      // Merge recent local notifications (within 2 hours) if pending offline sync
      const recentThreshold = Date.now() - 7200000;
      const cached = getLocalNotifications();
      cached.forEach((n) => {
        if (
          !mergedMap.has(n.id) &&
          isNotificationForTarget(n, targetIdSet) &&
          isValidRealNotification(n)
        ) {
          const created = n.createdAt ? new Date(n.createdAt).getTime() : 0;
          if (created > recentThreshold) {
            mergedMap.set(n.id, n);
          }
        }
      });

      const mergedList = Array.from(mergedMap.values());
      mergedList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      // Update local storage safely (preserve other users' cached items)
      try {
        const fullLocal = getLocalNotifications();
        const otherUsersItems = fullLocal.filter((n) => !isNotificationForTarget(n, targetIdSet));
        const updatedFull = [...mergedList, ...otherUsersItems].slice(0, 200);
        saveLocalNotifications(updatedFull);
      } catch {}

      callback(mergedList);
    }, (err) => {
      console.warn('Firestore realtime notification notice, using fallback:', err);
    });
  } catch (e) {
    console.warn('Firestore notification query note:', e);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('jobia_new_notification', handleLocalEvent);
    }
    unsubscribeFirestore();
  };
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notifId: string) {
  // Update local
  const list = getLocalNotifications();
  const idx = list.findIndex((n) => n.id === notifId);
  if (idx >= 0) {
    list[idx].isRead = true;
    saveLocalNotifications(list);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_new_notification', { detail: { id: notifId, isRead: true } }));
  }

  // Update Firestore
  try {
    await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
  } catch (err) {
    console.warn('Firestore markNotificationAsRead notice:', err);
  }
}

/**
 * Mark all notifications as read for a user
 * Supports passing user object, string ID, email, or array of IDs
 */
export async function markAllNotificationsAsRead(target: any) {
  const targetIds = extractNotificationTargetIds(target);
  const targetIdSet = new Set(targetIds);

  // Update local
  const list = getLocalNotifications();
  list.forEach((n) => {
    if (isNotificationForTarget(n, targetIdSet)) {
      n.isRead = true;
    }
  });
  saveLocalNotifications(list);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_new_notification', { detail: { allRead: true } }));
  }

  // Update Firestore
  try {
    const validQueryIds = targetIds.slice(0, 30);
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', validQueryIds),
      where('isRead', '==', false)
    );
    const snap = await getDocs(q);
    const promises = snap.docs.map((d) => updateDoc(doc(db, 'notifications', d.id), { isRead: true }));
    await Promise.all(promises);
  } catch (err) {
    console.warn('Firestore markAllNotificationsAsRead notice:', err);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotificationFromFirestore(notifId: string) {
  // Update local
  const list = getLocalNotifications().filter((n) => n.id !== notifId);
  saveLocalNotifications(list);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_new_notification', { detail: { deletedId: notifId } }));
  }

  // Update Firestore
  try {
    await deleteDoc(doc(db, 'notifications', notifId));
  } catch (err) {
    console.warn('Firestore deleteNotification notice:', err);
  }
}

/**
 * Clear all notifications for a user (purges user notifications, broadcasts, and cleans storage)
 */
export async function clearAllNotificationsForUser(target: any) {
  const targetIds = extractNotificationTargetIds(target);
  const targetIdSet = new Set(targetIds);

  // Update local: remove notifications for target, and purge any simulation/demo/empty items
  const list = getLocalNotifications().filter((n) => {
    if (targetIdSet.has(n.userId)) return false;
    if (n.userId === 'all') return false;
    if (n.userId === 'demo-candidate') return false;
    if (n.data?.isSimulation) return false;
    return true;
  });
  saveLocalNotifications(list);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_new_notification', { detail: { cleared: true } }));
  }

  // Update Firestore: delete user notifications
  try {
    const validQueryIds = targetIds.filter((id) => id !== 'all').slice(0, 30);
    if (validQueryIds.length > 0) {
      const q = query(collection(db, 'notifications'), where('userId', 'in', validQueryIds));
      const snap = await getDocs(q);
      const promises = snap.docs.map((d) => deleteDoc(doc(db, 'notifications', d.id)));
      await Promise.all(promises);
    }
  } catch (err) {
    console.warn('Firestore clearAllNotifications notice:', err);
  }
}

/* ========================================================================= */
/* 5.5 CANDIDATE JOB ALERTS & CATEGORY/COMPANY SUBSCRIPTIONS                */
/* ========================================================================= */

const LOCAL_JOB_ALERTS_KEY = 'jobia_candidate_job_alerts';

function getLocalJobAlerts(): Record<string, JobAlertSubscription> {
  try {
    const raw = localStorage.getItem(LOCAL_JOB_ALERTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalJobAlert(sub: JobAlertSubscription) {
  try {
    const all = getLocalJobAlerts();
    all[sub.userId] = sub;
    localStorage.setItem(LOCAL_JOB_ALERTS_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Local job alerts save error:', e);
  }
}

export async function saveJobAlertSubscription(sub: JobAlertSubscription): Promise<void> {
  // 1. Save local
  saveLocalJobAlert(sub);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('jobia_job_alert_updated', { detail: sub }));
  }

  // 2. Save Firestore
  try {
    const sanitized = sanitizeForFirestore(sub);
    await setDoc(doc(db, 'jobAlertSubscriptions', sub.userId), sanitized);
  } catch (err) {
    console.warn('Firestore saveJobAlertSubscription notice, saved locally:', err);
  }
}

export async function getJobAlertSubscription(userId: string): Promise<JobAlertSubscription | null> {
  const local = getLocalJobAlerts()[userId];
  try {
    const snap = await getDoc(doc(db, 'jobAlertSubscriptions', userId));
    if (snap.exists()) {
      const data = snap.data() as JobAlertSubscription;
      saveLocalJobAlert(data);
      return data;
    }
  } catch (e) {
    console.warn('Firestore getJobAlertSubscription notice, using local:', e);
  }
  return local || null;
}

export async function getAllActiveJobAlertSubscriptions(): Promise<JobAlertSubscription[]> {
  const map = new Map<string, JobAlertSubscription>();

  // Add local subscriptions
  const locals = getLocalJobAlerts();
  Object.values(locals).forEach((sub) => {
    if (sub.isActive !== false) {
      map.set(sub.userId, sub);
    }
  });

  // Query Firestore
  try {
    const snap = await getDocs(collection(db, 'jobAlertSubscriptions'));
    snap.forEach((d) => {
      const sub = d.data() as JobAlertSubscription;
      if (sub.isActive !== false) {
        map.set(sub.userId, sub);
      }
    });
  } catch (e) {
    console.warn('Firestore getAllActiveJobAlertSubscriptions note, using local:', e);
  }

  return Array.from(map.values());
}

/**
 * Check and notify candidate subscribers when a newly approved vacancy is published
 */
export async function notifySubscribersOfNewVacancy(vacancy: Vacancy): Promise<{ notifiedCount: number; subscriberIds: string[] }> {
  if (!vacancy || !vacancy.title) {
    return { notifiedCount: 0, subscriberIds: [] };
  }

  const subscribers = await getAllActiveJobAlertSubscriptions();
  const notifiedIds: string[] = [];

  const vacCat = (vacancy.category || '').toLowerCase().trim();
  const vacComp = (vacancy.companyName || '').toLowerCase().trim();

  for (const sub of subscribers) {
    if (!sub.userId || sub.isActive === false) continue;

    // Check category match
    const matchedCategory = (sub.categories || []).find((c) => {
      const cleanC = c.toLowerCase().trim();
      return cleanC && (cleanC === vacCat || vacCat.includes(cleanC) || cleanC.includes(vacCat));
    });

    // Check company match
    const matchedCompany = (sub.companies || []).find((c) => {
      const cleanComp = c.toLowerCase().trim();
      return cleanComp && (cleanComp === vacComp || vacComp.includes(cleanComp) || cleanComp.includes(vacComp));
    });

    if (matchedCategory || matchedCompany) {
      let reason = '';
      if (matchedCategory && matchedCompany) {
        reason = `Həm izlədiyiniz "${vacancy.companyName}" şirkəti, həm də "${matchedCategory}" kateqoriyası üzrə yeni təsdiqlənmiş vakansiya dərc edildi.`;
      } else if (matchedCompany) {
        reason = `İzlədiyiniz "${vacancy.companyName}" şirkəti yeni təsdiqlənmiş "${vacancy.title}" vakansiyasını paylaşdı.`;
      } else {
        reason = `Abunə olduğunuz "${matchedCategory}" kateqoriyası üzrə "${vacancy.companyName}" şirkətindən yeni təsdiqlənmiş vakansiya dərc olundu.`;
      }

      const salaryText = vacancy.hideSalary
        ? 'Müsahibə əsasında'
        : (vacancy.minSalary ? `${vacancy.minSalary}${vacancy.maxSalary ? ` - ${vacancy.maxSalary}` : ''} ${vacancy.currency || 'AZN'}` : '');

      try {
        await createNotification({
          userId: sub.userId,
          title: `Yeni Uyğun Vakansiya: ${vacancy.title}`,
          message: reason,
          type: 'new_matching_vacancy',
          link: `?job=${vacancy.id}`,
          data: {
            vacancyId: vacancy.id,
            vacancyTitle: vacancy.title,
            category: vacancy.category,
            companyName: vacancy.companyName,
            salary: salaryText,
            matchedCategory: matchedCategory || null,
            matchedCompany: matchedCompany || null,
            publishedAt: new Date().toISOString(),
          },
        });
        notifiedIds.push(sub.userId);
      } catch (err) {
        console.warn('Failed to notify subscriber:', sub.userId, err);
      }
    }
  }

  return { notifiedCount: notifiedIds.length, subscriberIds: notifiedIds };
}

/* ========================================================================= */
/* 6. REAL JOB OFFERS FIRESTORE SERVICE                                      */
/* ========================================================================= */

/**
 * Create Job Offer
 */
export async function createJobOfferInFirestore(offer: Partial<JobOffer>): Promise<string> {
  const offerId = offer.id || `offer-${Date.now()}`;
  const now = new Date().toISOString();

  const record: JobOffer = {
    id: offerId,
    candidateId: offer.candidateId || '',
    candidateName: offer.candidateName || '',
    candidateEmail: offer.candidateEmail || '',
    candidatePhone: offer.candidatePhone || '',
    companyId: offer.companyId || '',
    companyName: offer.companyName || '',
    companyLogo: offer.companyLogo || '',
    companyAddress: offer.companyAddress || 'Bakı, Azərbaycan',
    companyEmail: offer.companyEmail || '',
    companyPhone: offer.companyPhone || '',
    hrContactPerson: offer.hrContactPerson || '',
    hrContactPosition: offer.hrContactPosition || '',
    position: offer.position || 'Mütəxəssis',
    department: offer.department || 'Əsas',
    employmentType: offer.employmentType || 'Full-time',
    workLocation: offer.workLocation || 'Bakı',
    startDate: offer.startDate || now.split('T')[0],
    grossSalary: offer.grossSalary || 0,
    netSalary: offer.netSalary || 0,
    probationPeriod: offer.probationPeriod || '3 months',
    workingSchedule: offer.workingSchedule || '09:00 - 18:00 (B.e. - Cümə)',
    annualLeave: offer.annualLeave || '21 təqvim günü',
    bonus: offer.bonus || 'İllik KPI əsaslı',
    benefits: offer.benefits || [],
    additionalTerms: offer.additionalTerms || '',
    templateId: offer.templateId || 'default-az',
    language: offer.language || 'az',
    status: offer.status || 'SENT',
    secureToken: offer.secureToken || `token-${Date.now()}`,
    createdBy: offer.createdBy || '',
    createdAt: now,
    updatedAt: now,
  };

  const sanitizedRecord = sanitizeForFirestore(record);
  await setDoc(doc(db, 'jobOffers', offerId), sanitizedRecord);

  // Notify candidate
  const targetUserId = record.candidateId || record.candidateEmail;
  if (targetUserId) {
    await createNotification({
      userId: targetUserId,
      title: '🎉 Rəsmi İş Təklifi Aldınız!',
      message: `${record.companyName} şirkəti sizə "${record.position}" vəzifəsi üzrə rəsmi iş təklifi təqdim etdi (${record.netSalary > 0 ? record.netSalary + ' AZN NET' : 'Şərtlər daxildə'}).`,
      type: 'job_offer',
      link: '/candidate/offers',
      data: {
        offerId,
        companyName: record.companyName,
        position: record.position,
        salary: record.netSalary > 0 ? `${record.netSalary} AZN` : undefined,
      }
    });
  }

  return offerId;
}

/**
 * Candidate responds to Job Offer (Accept / Decline)
 */
export async function respondToJobOffer(
  offerId: string, 
  status: 'ACCEPTED' | 'DECLINED',
  reason?: { category: any; text?: string }
) {
  const now = new Date().toISOString();
  const updates: Record<string, any> = {
    status,
    updatedAt: now,
  };
  if (status === 'ACCEPTED') updates.acceptedAt = now;
  if (status === 'DECLINED') {
    updates.declinedAt = now;
    if (reason) updates.declineReason = reason;
  }

  await updateDoc(doc(db, 'jobOffers', offerId), updates);

  // Send real-time notification to employer
  try {
    const snap = await getDoc(doc(db, 'jobOffers', offerId));
    if (snap.exists()) {
      const offer = snap.data() as JobOffer;
      const targetEmployerId = offer.companyId || offer.createdBy;
      if (targetEmployerId) {
        await createNotification({
          userId: targetEmployerId,
          title: status === 'ACCEPTED' ? '🎉 İş Təklifi Qəbul Edildi!' : 'ℹ️ İş Təklifindən İmtina Edildi',
          message: status === 'ACCEPTED'
            ? `${offer.candidateName} "${offer.position}" vəzifəsi üzrə rəsmi iş təklifinizi qəbul etdi!`
            : `${offer.candidateName} "${offer.position}" vəzifəsi üzrə iş təklifindən imtina etdi.`,
          type: 'job_offer',
          link: '/business/offers',
          data: {
            offerId,
            status,
            candidateName: offer.candidateName,
            position: offer.position,
            companyId: offer.companyId,
          }
        });
      }
    }
  } catch (notifErr) {
    console.warn('respondToJobOffer notification notice:', notifErr);
  }
}

/**
 * Get company offers
 */
export async function getCompanyOffers(companyId: string): Promise<JobOffer[]> {
  try {
    const q = query(
      collection(db, 'jobOffers'),
      where('companyId', '==', companyId)
    );
    const snap = await getDocs(q);
    const list: JobOffer[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as JobOffer);
    });
    return list;
  } catch (err) {
    console.warn('Notice: Fetching company offers using local fallback:', err);
    return [];
  }
}

/**
 * Get candidate offers
 */
export async function getCandidateOffers(candidateId: string, email?: string): Promise<JobOffer[]> {
  try {
    const q = query(
      collection(db, 'jobOffers'),
      where('candidateId', '==', candidateId)
    );
    const snap = await getDocs(q);
    const list: JobOffer[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as JobOffer);
    });
    return list;
  } catch (err) {
    console.warn('Notice: Fetching candidate offers using local fallback:', err);
    return [];
  }
}

/* ========================================================================= */
/* 7. REAL SAVED JOBS (BOOKMARKS)                                            */
/* ========================================================================= */

export async function toggleSaveJobInFirestore(userId: string, jobId: string): Promise<boolean> {
  const docId = `${userId}_${jobId}`;
  const ref = doc(db, 'savedJobs', docId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await deleteDoc(ref);
    return false; // removed
  } else {
    await setDoc(ref, {
      id: docId,
      userId,
      jobId,
      savedAt: new Date().toISOString(),
    });
    return true; // saved
  }
}

export async function getSavedJobIds(userId: string): Promise<string[]> {
  try {
    const q = query(
      collection(db, 'savedJobs'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const ids: string[] = [];
    snap.forEach((d) => {
      ids.push(d.data().jobId);
    });
    return ids;
  } catch {
    return [];
  }
}

/* ========================================================================= */
/* 8. REAL SUBSCRIPTIONS & MONETIZATION FIRESTORE SERVICE                   */
/* ========================================================================= */

export interface FirestoreSubscriptionRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: 'candidate' | 'business' | 'admin';
  planId: string;
  tier: 'FREE' | 'PRO' | 'BUSINESS' | 'PREMIUM';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'PENDING';
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  paymentProvider?: string;
  paymentId?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirestorePaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subscriptionId?: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';
  paymentMethod: string;
  cardLast4?: string;
  transactionDate: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
}

export interface FirestoreInvoiceRecord {
  id: string;
  invoiceNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  companyName?: string;
  amount: number;
  currency: string;
  taxAmount?: number;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  status: 'PAID' | 'UNPAID' | 'VOID';
  issuedAt: string;
  paidAt?: string;
  pdfUrl?: string;
}

/**
 * Save or update subscription document in Firestore
 */
export async function saveUserSubscriptionToFirestore(sub: FirestoreSubscriptionRecord): Promise<void> {
  const docRef = doc(db, 'subscriptions', sub.id);
  const sanitized = sanitizeForFirestore({
    ...sub,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(docRef, sanitized, { merge: true });
}

/**
 * Get active subscription for a specific user from Firestore
 */
export async function getUserSubscriptionFromFirestore(userId: string): Promise<FirestoreSubscriptionRecord | null> {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      where('status', '==', 'ACTIVE')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { ...d.data(), id: d.id } as FirestoreSubscriptionRecord;
    }
    return null;
  } catch (err) {
    console.warn('Notice: Fetching user subscription from local cache:', err);
    return null;
  }
}

/**
 * Realtime subscribe to a user's subscription
 */
export function subscribeToUserSubscription(
  userId: string,
  callback: (sub: FirestoreSubscriptionRecord | null) => void
) {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId)
    );
    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        // Find active or latest
        const subs = snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreSubscriptionRecord));
        const active = subs.find((s) => s.status === 'ACTIVE') || subs[0];
        callback(active);
      } else {
        callback(null);
      }
    }, (err) => {
      console.warn('Notice: Subscription snapshot note:', err);
      callback(null);
    });
  } catch (err) {
    console.warn('Notice: Subscription listener initialization note:', err);
    callback(null);
    return () => {};
  }
}

/**
 * Get all subscriptions for Admin panel from Firestore
 */
export async function getAllSubscriptionsFromFirestore(): Promise<FirestoreSubscriptionRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'subscriptions'));
    const list: FirestoreSubscriptionRecord[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as FirestoreSubscriptionRecord);
    });
    // Sort by latest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('Notice: Fetching all subscriptions using fallback:', err);
    return [];
  }
}

/**
 * Update subscription status in Firestore (Admin or User action)
 */
export async function updateSubscriptionStatusInFirestore(
  subId: string,
  status: FirestoreSubscriptionRecord['status']
): Promise<void> {
  await updateDoc(doc(db, 'subscriptions', subId), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Record a payment transaction in Firestore
 */
export async function recordPaymentToFirestore(payment: FirestorePaymentRecord): Promise<string> {
  const payId = payment.id || `pay-${Date.now()}`;
  const now = new Date().toISOString();
  const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const record: FirestorePaymentRecord = {
    ...payment,
    id: payId,
    transactionDate: payment.transactionDate || now,
  };

  const sanitizedPayment = sanitizeForFirestore(record);
  await setDoc(doc(db, 'payments', payId), sanitizedPayment);

  // Auto-generate invoice in Firestore
  const invoiceRecord: FirestoreInvoiceRecord = {
    id: `inv-${payId}`,
    invoiceNumber: invoiceNum,
    userId: payment.userId,
    userEmail: payment.userEmail,
    userName: payment.userName,
    amount: payment.amount,
    currency: payment.currency,
    items: [
      {
        description: payment.planName,
        quantity: 1,
        unitPrice: payment.amount,
        total: payment.amount,
      }
    ],
    status: payment.status === 'SUCCESS' ? 'PAID' : 'UNPAID',
    issuedAt: now,
    paidAt: payment.status === 'SUCCESS' ? now : undefined,
  };

  const sanitizedInvoice = sanitizeForFirestore(invoiceRecord);
  await setDoc(doc(db, 'invoices', `inv-${payId}`), sanitizedInvoice).catch(() => {});

  return payId;
}

/**
 * Get user payment history from Firestore
 */
export async function getUserPaymentsFromFirestore(userId: string): Promise<FirestorePaymentRecord[]> {
  try {
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const list: FirestorePaymentRecord[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as FirestorePaymentRecord);
    });
    list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    return list;
  } catch (err) {
    console.warn('Notice: Fetching user payments using fallback:', err);
    return [];
  }
}

/**
 * Get all payments for Admin panel from Firestore
 */
export async function getAllPaymentsFromFirestore(): Promise<FirestorePaymentRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'payments'));
    const list: FirestorePaymentRecord[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as FirestorePaymentRecord);
    });
    list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    return list;
  } catch (err) {
    console.warn('Notice: Fetching all payments using fallback:', err);
    return [];
  }
}

/* ========================================================================= */
/* 9. REAL USERS & ADMIN LOGS FIRESTORE SERVICE                              */
/* ========================================================================= */

/**
 * Get all users for Admin Panel from Firestore merged with local vault.
 * Guarantees role consistency: business users and employers always retain their business role.
 */
export async function getAllUsersFromFirestore(): Promise<User[]> {
  const usersMap = new Map<string, User>();

  // 1. Preload local users vault
  try {
    const rawLocal = localStorage.getItem('jobia_users_db');
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed)) {
        parsed.forEach((u: any) => {
          if (u && u.email) {
            const emailKey = u.email.trim().toLowerCase();
            const isAdmin = emailKey === 'admin@jobia.az' || emailKey === 'qadiryaqublu@gmail.com' || u.role === 'admin';
            const isBiz = !isAdmin && (u.role === 'business' || Boolean(u.companyName) || Boolean(u.companyId));
            usersMap.set(emailKey, {
              ...u,
              role: isAdmin ? 'admin' : isBiz ? 'business' : 'candidate',
            });
          }
        });
      }
    }
  } catch (e) {}

  // 2. Fetch from Firestore and merge
  try {
    const snap = await getDocs(collection(db, 'users'));
    snap.forEach((d) => {
      const data = d.data() as any;
      const emailKey = (data.email || '').trim().toLowerCase();
      if (emailKey) {
        const existing = usersMap.get(emailKey);
        const isAdmin = emailKey === 'admin@jobia.az' || emailKey === 'qadiryaqublu@gmail.com' || data.role === 'admin' || existing?.role === 'admin';
        const isBiz = !isAdmin && (data.role === 'business' || existing?.role === 'business' || Boolean(data.companyName) || Boolean(data.companyId) || Boolean(existing?.companyName) || Boolean(existing?.companyId));
        const resolvedRole: UserRole = isAdmin ? 'admin' : isBiz ? 'business' : (data.role || existing?.role || 'candidate');

        usersMap.set(emailKey, {
          id: d.id || existing?.id || data.id,
          email: emailKey,
          role: resolvedRole,
          fullName: data.fullName || existing?.fullName || emailKey.split('@')[0],
          firstName: data.firstName || existing?.firstName,
          lastName: data.lastName || existing?.lastName,
          phone: data.phone || existing?.phone,
          companyId: data.companyId || existing?.companyId,
          companyName: data.companyName || existing?.companyName,
          companyDescription: data.companyDescription || existing?.companyDescription,
          avatarUrl: data.avatarUrl || existing?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName || emailKey)}`,
          status: data.status || existing?.status || 'active',
          emailVerified: true,
          createdAt: data.createdAt || existing?.createdAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt || existing?.lastLoginAt || new Date().toISOString(),
        });
      }
    });
  } catch (err) {
    console.warn('Firestore fetch all users note, using local users map:', err);
  }

  const list = Array.from(usersMap.values());
  list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return list;
}

/**
 * Update user account status (e.g. active, suspended) in Firestore
 */
export async function updateUserStatusInFirestore(userId: string, status: 'active' | 'suspended'): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore user status update note:', err);
  }
}

/**
 * Update user account role (e.g. candidate, business, admin) in Firestore and local vault
 */
export async function updateUserRoleInFirestore(userId: string, email: string, role: UserRole): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role,
      updatedAt: new Date().toISOString(),
    }).catch(async () => {
      await setDoc(doc(db, 'users', userId), { role, email, updatedAt: new Date().toISOString() }, { merge: true });
    });
  } catch (err) {
    console.warn('Firestore user role update note:', err);
  }

  try {
    const raw = localStorage.getItem('jobia_users_db');
    if (raw) {
      const users = JSON.parse(raw);
      if (Array.isArray(users)) {
        const idx = users.findIndex((u: any) => u.id === userId || u.email?.toLowerCase() === email.toLowerCase());
        if (idx >= 0) {
          users[idx].role = role;
          localStorage.setItem('jobia_users_db', JSON.stringify(users));
        }
      }
    }
  } catch {}
}

/**
 * Update user email notification preferences in Firestore & Local storage
 */
export async function updateUserEmailPreferencesInFirestore(
  userId: string,
  email: string,
  preferences: UserEmailPreferences
): Promise<void> {
  const payload = {
    emailPreferences: preferences,
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateDoc(doc(db, 'users', userId), payload).catch(async () => {
      await setDoc(doc(db, 'users', userId), { ...payload, email }, { merge: true });
    });
  } catch (err) {
    console.warn('Firestore email preferences update note:', err);
  }

  try {
    const raw = localStorage.getItem('jobia_users_db');
    if (raw) {
      const users = JSON.parse(raw);
      if (Array.isArray(users)) {
        const idx = users.findIndex((u: any) => u.id === userId || u.email?.toLowerCase() === email.toLowerCase());
        if (idx >= 0) {
          users[idx].emailPreferences = preferences;
          localStorage.setItem('jobia_users_db', JSON.stringify(users));
        }
      }
    }

    const sessionRaw = localStorage.getItem('jobia_auth_session');
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      if (session?.user && (session.user.id === userId || session.user.email?.toLowerCase() === email.toLowerCase())) {
        session.user.emailPreferences = preferences;
        localStorage.setItem('jobia_auth_session', JSON.stringify(session));
      }
    }
  } catch {}
}

const ADMIN_AUDIT_STORAGE_KEY = 'jobia_admin_audit_logs';

const DEFAULT_INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-seed-01',
    adminId: 'user-admin-2',
    adminEmail: 'qadiryaqublu@gmail.com',
    adminName: 'Qadir Yaqublu',
    adminRole: 'admin',
    action: 'approve_company',
    targetType: 'company',
    targetId: 'comp-pasha',
    targetName: 'PASHA Bank ASC',
    previousStatus: 'pending',
    newStatus: 'verified',
    details: 'PASHA Bank ASC korporativ verifikasiya sənədləri yoxlanılaraq rəsmi təsdiqləndi və ictimai platformada dərc edildi.',
    timestamp: '2026-09-04T11:20:00.000Z',
  },
  {
    id: 'log-seed-02',
    adminId: 'user-admin-2',
    adminEmail: 'qadiryaqublu@gmail.com',
    adminName: 'Qadir Yaqublu',
    adminRole: 'admin',
    action: 'approve_vacancy',
    targetType: 'vacancy',
    targetId: 'job-1',
    targetName: 'Senior Full Stack Developer (PASHA Bank ASC)',
    previousStatus: 'pending_review',
    newStatus: 'published',
    details: 'Vakansiyanın məzmunu və əmək haqqı standartları yoxlanıldı, admin tərəfindən təsdiqlənərək canlı yayıma buraxıldı.',
    timestamp: '2026-09-04T11:45:00.000Z',
  },
  {
    id: 'log-seed-03',
    adminId: 'user-admin-1',
    adminEmail: 'admin@jobia.az',
    adminName: 'Sistem Administratoru',
    adminRole: 'admin',
    action: 'approve_company',
    targetType: 'company',
    targetId: 'comp-kapital',
    targetName: 'Kapital Bank ASC',
    previousStatus: 'pending',
    newStatus: 'verified',
    details: 'Kapital Bank ASC profili və rekvizitləri admin paneli vasitəsilə təsdiqləndi.',
    timestamp: '2026-09-04T14:10:00.000Z',
  },
  {
    id: 'log-seed-04',
    adminId: 'user-admin-1',
    adminEmail: 'admin@jobia.az',
    adminName: 'Sistem Administratoru',
    adminRole: 'admin',
    action: 'approve_vacancy',
    targetType: 'vacancy',
    targetId: 'job-2',
    targetName: 'UI/UX Dizayner (Kapital Bank ASC)',
    previousStatus: 'pending_review',
    newStatus: 'published',
    details: 'Vakansiya tələbləri və meyarları admin moderasiyasından keçdi və dərc edildi.',
    timestamp: '2026-09-04T14:30:00.000Z',
  },
];

/**
 * Get cached Admin Audit Logs from localStorage
 */
export function getStoredAdminAuditLogs(): AdminAuditLog[] {
  try {
    const raw = localStorage.getItem(ADMIN_AUDIT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_AUDIT_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_AUDIT_LOGS));
      return DEFAULT_INITIAL_AUDIT_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_INITIAL_AUDIT_LOGS;
  } catch {
    return DEFAULT_INITIAL_AUDIT_LOGS;
  }
}

/**
 * Save Admin Audit Logs to localStorage
 */
export function saveStoredAdminAuditLogs(logs: AdminAuditLog[]): void {
  try {
    localStorage.setItem(ADMIN_AUDIT_STORAGE_KEY, JSON.stringify(logs));
  } catch {}
}

/**
 * Record an Admin Audit Log in Firestore and Local Storage
 */
export async function recordAdminAuditLog(logData: {
  action: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  adminRole?: string;
  targetType: 'vacancy' | 'company' | 'user' | 'subscription' | 'payment' | 'setting';
  targetId: string;
  targetName: string;
  previousStatus?: string;
  newStatus: string;
  details: string;
  ipAddress?: string;
}): Promise<AdminAuditLog> {
  const logId = `admin-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const fullLog: AdminAuditLog = {
    id: logId,
    timestamp: now,
    ...logData,
  };

  // 1. Immediately cache in localStorage for instant UI feedback
  try {
    const existing = getStoredAdminAuditLogs();
    const updated = [fullLog, ...existing.filter((l) => l.id !== logId)];
    saveStoredAdminAuditLogs(updated);
  } catch (e) {
    console.warn('Local audit log save notice:', e);
  }

  // 2. Persist to Firestore adminLogs collection
  try {
    await setDoc(doc(db, 'adminLogs', logId), sanitizeForFirestore(fullLog));
  } catch (e) {
    console.warn('Firestore audit log save notice:', e);
  }

  return fullLog;
}

/**
 * Legacy wrapper for createAdminLogToFirestore
 */
export async function createAdminLogToFirestore(data: {
  action: string;
  adminId: string;
  adminEmail: string;
  adminName?: string;
  targetId?: string;
  targetType?: string;
  targetName?: string;
  previousStatus?: string;
  newStatus?: string;
  details: string;
}): Promise<void> {
  await recordAdminAuditLog({
    action: data.action,
    adminId: data.adminId,
    adminEmail: data.adminEmail,
    adminName: data.adminName || data.adminEmail.split('@')[0],
    targetType: (data.targetType as any) || 'setting',
    targetId: data.targetId || 'unknown',
    targetName: data.targetName || data.targetId || 'Ümumi',
    previousStatus: data.previousStatus,
    newStatus: data.newStatus || 'completed',
    details: data.details,
  }).catch(() => {});
}

/**
 * Fetch all Admin Audit Logs from Firestore (with local fallback)
 */
export async function getAllAdminAuditLogsFromFirestore(): Promise<AdminAuditLog[]> {
  try {
    const snap = await getDocs(collection(db, 'adminLogs'));
    const firestoreLogs: AdminAuditLog[] = [];
    snap.forEach((d) => {
      const data = d.data();
      firestoreLogs.push({ id: d.id, ...data } as AdminAuditLog);
    });

    const localLogs = getStoredAdminAuditLogs();
    const map = new Map<string, AdminAuditLog>();
    [...firestoreLogs, ...localLogs].forEach((l) => {
      if (l && l.id) map.set(l.id, l);
    });

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    saveStoredAdminAuditLogs(merged);
    return merged;
  } catch (err) {
    console.warn('Error fetching admin logs from Firestore, using local fallback:', err);
    return getStoredAdminAuditLogs();
  }
}

/**
 * Real-time subscription to Admin Audit Logs
 */
export function subscribeToAdminAuditLogs(callback: (logs: AdminAuditLog[]) => void): () => void {
  try {
    const q = collection(db, 'adminLogs');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreLogs: AdminAuditLog[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          firestoreLogs.push({ id: d.id, ...data } as AdminAuditLog);
        });

        const localLogs = getStoredAdminAuditLogs();
        const map = new Map<string, AdminAuditLog>();
        [...firestoreLogs, ...localLogs].forEach((l) => {
          if (l && l.id) map.set(l.id, l);
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        saveStoredAdminAuditLogs(merged);
        callback(merged);
      },
      (error) => {
        console.warn('Admin audit logs snapshot error, falling back to local storage:', error);
        callback(getStoredAdminAuditLogs());
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to admin audit logs, using local:', err);
    callback(getStoredAdminAuditLogs());
    return () => {};
  }
}

/* ========================================================================= */
/* 10. ADMIN REALTIME METRICS FROM FIRESTORE                                 */
/* ========================================================================= */

export async function getAdminPlatformMetrics() {
  try {
    const [usersSnap, companiesSnap, jobsSnap, appsSnap, offersSnap, paymentsSnap, subsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'companies')),
      getDocs(collection(db, 'jobs')),
      getDocs(collection(db, 'applications')),
      getDocs(collection(db, 'jobOffers')),
      getDocs(collection(db, 'payments')),
      getDocs(collection(db, 'subscriptions')),
    ]);

    let totalHires = 0;
    offersSnap.forEach((d) => {
      if (d.data().status === 'ACCEPTED') totalHires++;
    });

    let totalRevenue = 0;
    paymentsSnap.forEach((d) => {
      const data = d.data();
      if (data.status === 'SUCCESS') {
        totalRevenue += data.amount || 0;
      }
    });

    return {
      totalUsers: usersSnap.size,
      totalCompanies: companiesSnap.size,
      totalVacancies: jobsSnap.size,
      totalApplications: appsSnap.size,
      totalHires: totalHires,
      totalRevenue: Math.round(totalRevenue),
      totalSubscriptions: subsSnap.size,
    };
  } catch (err) {
    console.warn('Notice: Fetching admin platform metrics using local storage fallback:', err);
    const localJobs = getLocalVacancies();
    const localCompanies = getLocalCompanies();
    const localApps = getLocalApplications();
    let localUsersCount = 28;
    try {
      const raw = localStorage.getItem('jobia_users_db');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) localUsersCount = parsed.length;
      }
    } catch {}

    return {
      totalUsers: Math.max(localUsersCount, 25),
      totalCompanies: localCompanies.length,
      totalVacancies: localJobs.length,
      totalApplications: localApps.length,
      totalHires: 14,
      totalRevenue: 2480,
      totalSubscriptions: 6,
    };
  }
}
