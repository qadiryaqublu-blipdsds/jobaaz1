import { CVData } from '../types';

export type OpenCVPackageType = 'short' | 'standard' | 'annual';
export type OpenCVStatus = 'active' | 'pending_moderation' | 'expired' | 'hidden';

export interface OpenCVContactRequest {
  id: string;
  openCvId: string;
  employerName: string;
  employerCompany: string;
  employerEmail: string;
  employerPhone: string;
  positionOffered: string;
  salaryOffered?: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
}

export interface OpenCVRecord {
  id: string;
  slug: string;
  candidateId: string;
  fullName: string;
  displayName: string;
  nameFormat: 'full' | 'initial_only'; // e.g. "Əhməd Məmmədov" vs "Əhməd M."
  profession: string;
  category: string;
  city: string;
  experienceYears: number;
  expectedSalary?: number;
  skills: string[];
  languages: { language: string; level: string }[];
  educationLevel: string;
  summary: string;
  showPhoto: boolean;
  photoUrl?: string;
  phoneHidden: boolean; // default true - contact unlocked only upon request acceptance
  emailHidden: boolean; // default true
  directPhone?: string;
  directEmail?: string;
  packageType: OpenCVPackageType;
  packagePrice: number; // in AZN
  isFeatured: boolean; // "Önə çıxarılmış" badge
  featuredPrice?: number;
  publishedAt: string;
  expiresAt: string;
  daysRemaining: number;
  status: OpenCVStatus;
  viewsCount: number;
  contactRequests: OpenCVContactRequest[];
  cvData?: Partial<CVData>;
  seoTitle: string;
  seoDescription: string;
}

export const OPEN_CV_PACKAGES = [
  {
    type: 'short' as OpenCVPackageType,
    name: 'Qısa Müddətli',
    durationDays: 30,
    durationText: '1 ay (30 gün)',
    price: 9, // AZN
    isPopular: false,
    description: 'Sınaq və təcili iş axtaranlar üçün ilkin yayım paketi.'
  },
  {
    type: 'standard' as OpenCVPackageType,
    name: 'Standart Paket',
    durationDays: 90,
    durationText: '3 ay (90 gün)',
    price: 19, // AZN
    isPopular: true,
    description: 'Ən çox seçilən: axtarış sistemlərində tam indekslənmə və maksimum müraciət şansı.'
  },
  {
    type: 'annual' as OpenCVPackageType,
    name: 'İllik Karyera Paketi',
    durationDays: 365,
    durationText: '12 ay (365 gün)',
    price: 49, // AZN (Normalda 108 AZN, 55% endirim)
    isPopular: false,
    description: 'Davamlı təkliflər almaq və peşəkar profilini internetdə daimi açıq saxlamaq üçün.'
  }
];

export const FEATURED_ADDON_PRICE = 15; // AZN extra for featured badge at top of catalog

// Pre-seeded authentic Azerbaijani Open CVs across top demanded industries (agriculture, IT, finance, logistics, healthcare)
export const INITIAL_OPEN_CVS: OpenCVRecord[] = [
  {
    id: 'opencv-agronom-baki-01',
    slug: 'aqronom-baki-ramil-q',
    candidateId: 'cand-open-01',
    fullName: 'Ramil Qasımov',
    displayName: 'Ramil Q.',
    nameFormat: 'initial_only',
    profession: 'Aqronom / Aqrar Mühəndis',
    category: 'Kənd təsərrüfatı və Ekologiya',
    city: 'Bakı',
    experienceYears: 7,
    expectedSalary: 1800,
    skills: ['Damcı suvarma sistemləri', 'İstixana idarəetməsi', 'Bitki mühafizəsi', 'Aqrokimyəvi analiz', 'Qlobal GAP sertifikasiyası'],
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'İngilis', level: 'Orta (B1)' },
      { language: 'Rus', level: 'Yaxşı (B2)' }
    ],
    educationLevel: 'Ali (Azərbaycan Dövlət Aqrar Universiteti)',
    summary: '7 illik intensiv bağçılıq və istixana idarəçiliyi təcrübəsinə malik aqronom. Müasir suvarma, torpaq məhsuldarlığının artırılması və xəstəliklərə qarşı bioloji mübarizə sahəsində ixtisaslaşmışam.',
    showPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    phoneHidden: true,
    emailHidden: true,
    directPhone: '+994 50 443 21 09',
    directEmail: 'ramil.qasimov.agronom@gmail.com',
    packageType: 'standard',
    packagePrice: 19,
    isFeatured: true,
    featuredPrice: 15,
    publishedAt: '2026-09-15T09:00:00Z',
    expiresAt: '2026-12-15T09:00:00Z',
    daysRemaining: 55,
    status: 'active',
    viewsCount: 342,
    contactRequests: [
      {
        id: 'req-01',
        openCvId: 'opencv-agronom-baki-01',
        employerName: 'Əli Məmmədov',
        employerCompany: 'Aqrovest MMC',
        employerEmail: 'hr@agrovest.az',
        employerPhone: '+994 12 555 40 20',
        positionOffered: 'Baş Aqronom',
        salaryOffered: '2000 - 2400 AZN',
        message: 'Hörmətli Ramil bəy, Şəmkir və Quba rayonlarındakı intensiv bağ sahələrimizə rəhbərlik üçün təcrübəniz diqqətimizi cəlb etdi.',
        status: 'accepted',
        createdAt: '2026-10-10T14:30:00Z',
        respondedAt: '2026-10-10T16:15:00Z'
      }
    ],
    seoTitle: 'Aqronom Ramil Q. CV - Bakı və Regionlar | Jobia.az',
    seoDescription: '7 illik aqronomluq təcrübəsi, istixana və damcı suvarma mütəxəssisi. Əlaqə saxlayın və tam CV-ni nəzərdən keçirin.'
  },
  {
    id: 'opencv-muhasib-baki-02',
    slug: 'bas-muhasib-baki-nigar-m',
    candidateId: 'cand-open-02',
    fullName: 'Nigar Məmmədova',
    displayName: 'Nigar Məmmədova',
    nameFormat: 'full',
    profession: 'Baş Mühasib / Maliyyə Meneceri',
    category: 'Maliyyə və Mühasibat',
    city: 'Bakı',
    experienceYears: 9,
    expectedSalary: 2500,
    skills: ['1C 8.3 UPP', 'BTP və e-taxes.gov.az', 'PMS sertifikatı', 'MHBS (IFRS)', 'Vergi auditi', 'DSMF bəyannamələri'],
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'İngilis', level: 'Yaxşı (B2)' },
      { language: 'Rus', level: 'Sərbəst (C1)' }
    ],
    educationLevel: 'Magistr (Azərbaycan Dövlət İqtisad Universiteti - UNEC)',
    summary: 'İstehsal, ticarət və xidmət sahələrində 9 illik baş mühasib stajı. PMS sertifikatlı, AR Vergi Məcəlləsinə tam hakim, dövlət yoxlamalarından problemsiz keçid təcrübəsi.',
    showPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    phoneHidden: true,
    emailHidden: true,
    directPhone: '+994 55 612 88 44',
    directEmail: 'nigar.muhasib@azfinance.az',
    packageType: 'annual',
    packagePrice: 49,
    isFeatured: true,
    featuredPrice: 15,
    publishedAt: '2026-08-20T10:00:00Z',
    expiresAt: '2027-08-20T10:00:00Z',
    daysRemaining: 303,
    status: 'active',
    viewsCount: 680,
    contactRequests: [
      {
        id: 'req-02',
        openCvId: 'opencv-muhasib-baki-02',
        employerName: 'Kamran Babayev',
        employerCompany: 'Prime Retail Group',
        employerEmail: 'jobs@primeretail.az',
        employerPhone: '+994 12 404 12 89',
        positionOffered: 'Maliyyə Direktoru Müavini',
        salaryOffered: '2800 AZN Net',
        message: 'Nigar xanım, 1C və vergi hesabatlılığı üzrə təcrübənizi çox yüksək qiymətləndiririk. Sizinlə görüşmək istərdik.',
        status: 'pending',
        createdAt: '2026-10-18T11:00:00Z'
      }
    ],
    seoTitle: 'Baş Mühasib Nigar Məmmədova CV - Bakı | Jobia.az',
    seoDescription: 'PMS sertifikatlı, 9 illik baş mühasib təcrübəsi. 1C, IFRS və AR vergi qanunvericiliyi üzrə peşəkar namizəd.'
  },
  {
    id: 'opencv-dev-baki-03',
    slug: 'senior-frontend-developer-farid-a',
    candidateId: 'cand-open-03',
    fullName: 'Fərid Əsədov',
    displayName: 'Fərid Ə.',
    nameFormat: 'initial_only',
    profession: 'Senior Frontend Mühəndisi (React / Next.js / TypeScript)',
    category: 'İnformasiya Texnologiyaları',
    city: 'Bakı',
    experienceYears: 6,
    expectedSalary: 3500,
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'GraphQL', 'Jest & Cypress', 'CI/CD Docker'],
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'İngilis', level: 'Sərbəst (C1)' },
      { language: 'Rus', level: 'Orta (B1)' }
    ],
    educationLevel: 'Bakalavr (Bakı Dövlət Universiteti - Tətbiqi Riyaziyyat)',
    summary: 'Fintech və E-ticarət layihələrində 6 illik təcrübəyə malik Senior Frontend proqramçı. Yüksək yüklü sistemlər, SPA/SSR arxitekturası və veb performans optimallaşdırması üzrə dərin biliklər.',
    showPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    phoneHidden: true,
    emailHidden: true,
    directPhone: '+994 70 882 19 05',
    directEmail: 'farid.asedov.tech@gmail.com',
    packageType: 'standard',
    packagePrice: 19,
    isFeatured: false,
    publishedAt: '2026-10-01T12:00:00Z',
    expiresAt: '2026-12-31T12:00:00Z',
    daysRemaining: 71,
    status: 'active',
    viewsCount: 421,
    contactRequests: [],
    seoTitle: 'Senior Frontend Mühəndisi Fərid Ə. CV | Jobia.az',
    seoDescription: 'React, TypeScript, Next.js mütəxəssisi. 6 illik beynəlxalq fintech və veb təcrübəsi.'
  },
  {
    id: 'opencv-hekim-gence-04',
    slug: 'kardioloq-hekim-gence-leyla-h',
    candidateId: 'cand-open-04',
    fullName: 'Leyla Həsənova',
    displayName: 'Leyla H.',
    nameFormat: 'initial_only',
    profession: 'Həkim-Kardioloq',
    category: 'Səhiyyə və Tibb',
    city: 'Gəncə',
    experienceYears: 8,
    expectedSalary: 2200,
    skills: ['Exokardioqrafiya (ECHO)', 'EKQ təhlili', 'Holter monitorinqi', 'Hipertoniya müalicəsi', 'Treadmill stress testi'],
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'Türk', level: 'Sərbəst (C1)' },
      { language: 'Rus', level: 'Yaxşı (B2)' }
    ],
    educationLevel: 'Rezidentura (Azərbaycan Tibb Universiteti)',
    summary: '8 illik staja malik sertifikatlaşdırılmış həkim-kardioloq. Türkiyədə ixtisasartırma kursları keçmiş, müasir kardioloji diaqnostika metodlarına tam yiyələnmişəm.',
    showPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1594824813576-9051d95c2901?auto=format&fit=crop&w=400&q=80',
    phoneHidden: true,
    emailHidden: true,
    directPhone: '+994 50 334 11 22',
    directEmail: 'dr.leyla.kardio@gmail.com',
    packageType: 'standard',
    packagePrice: 19,
    isFeatured: true,
    featuredPrice: 15,
    publishedAt: '2026-09-25T08:00:00Z',
    expiresAt: '2026-12-25T08:00:00Z',
    daysRemaining: 65,
    status: 'active',
    viewsCount: 290,
    contactRequests: [],
    seoTitle: 'Həkim-Kardioloq Leyla H. CV - Gəncə | Jobia.az',
    seoDescription: 'Exokardioqrafiya və ürək-damar xəstəlikləri üzrə 8 illik təcrübəli kardioloq.'
  },
  {
    id: 'opencv-surucu-baki-05',
    slug: 'profesional-surucu-baki-vuqar-n',
    candidateId: 'cand-open-05',
    fullName: 'Vüqar Nəcəfov',
    displayName: 'Vüqar Nəcəfov',
    nameFormat: 'full',
    profession: 'Şəxsi Sürücü / Korporativ Sürücü',
    category: 'Nəqliyyat və Loqistika',
    city: 'Bakı',
    experienceYears: 12,
    expectedSalary: 1200,
    skills: ['B, C kateqoriyalı sürücülük vəsiqəsi', 'Təhlükəsiz idarəetmə sertifikatı', 'Bakı və region yollarını mükəmməl bilmə', 'Premium avtomobillərin idarəsi', 'Avtomobilə texniki qulluq'],
    languages: [
      { language: 'Azərbaycan', level: 'Ana dili' },
      { language: 'Rus', level: 'Danışıq (B1)' }
    ],
    educationLevel: 'Orta ixtisas',
    summary: '12 illik qəzasız sürücülük təcrübəsinə malik, intizamlı, səliqəli şəxsi və ya korporativ sürücü. Rəhbər şəxslərin daşınması, ezamiyyətlər və yol təhlükəsizliyi qaydalarına ciddi riayət.',
    showPhoto: false,
    phoneHidden: true,
    emailHidden: true,
    directPhone: '+994 55 901 32 45',
    directEmail: 'vuqar.surucu@mail.ru',
    packageType: 'short',
    packagePrice: 9,
    isFeatured: false,
    publishedAt: '2026-10-05T14:00:00Z',
    expiresAt: '2026-11-05T14:00:00Z',
    daysRemaining: 15,
    status: 'active',
    viewsCount: 195,
    contactRequests: [],
    seoTitle: 'Şəxsi Sürücü Vüqar Nəcəfov CV - Bakı | Jobia.az',
    seoDescription: '12 illik qəzasız staj, B və C kateqoriyalı sürücülük vəsiqəsi olan etibarlı sürücü.'
  }
];

const STORAGE_KEY = 'jobia_open_cv_catalog';

export function getStoredOpenCVs(): OpenCVRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_OPEN_CVS));
      return INITIAL_OPEN_CVS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_OPEN_CVS;
  } catch {
    return INITIAL_OPEN_CVS;
  }
}

export function saveStoredOpenCVs(records: OpenCVRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save OpenCV records to localStorage', err);
  }
}

export function getOpenCVBySlugOrId(identifier: string): OpenCVRecord | undefined {
  const list = getStoredOpenCVs();
  return list.find((c) => c.slug === identifier || c.id === identifier);
}

export function getCandidateOpenCV(candidateId: string): OpenCVRecord | undefined {
  const list = getStoredOpenCVs();
  return list.find((c) => c.candidateId === candidateId);
}

export function publishCandidateOpenCV(params: {
  candidateId: string;
  fullName: string;
  nameFormat: 'full' | 'initial_only';
  profession: string;
  category: string;
  city: string;
  experienceYears: number;
  expectedSalary?: number;
  skills: string[];
  languages: { language: string; level: string }[];
  educationLevel: string;
  summary: string;
  showPhoto: boolean;
  photoUrl?: string;
  directPhone?: string;
  directEmail?: string;
  packageType: OpenCVPackageType;
  isFeatured: boolean;
  cvData?: Partial<CVData>;
}): OpenCVRecord {
  const list = getStoredOpenCVs();
  const selectedPkg = OPEN_CV_PACKAGES.find((p) => p.type === params.packageType) || OPEN_CV_PACKAGES[1];
  
  // Calculate price
  let totalPrice = selectedPkg.price;
  if (params.isFeatured) {
    totalPrice += FEATURED_ADDON_PRICE;
  }

  // Generate unique slug
  const cleanProf = params.profession
    .toLowerCase()
    .replace(/[^a-z0-9а-яəıöğçşü]+/gi, '-')
    .slice(0, 30);
  const cleanCity = params.city
    .toLowerCase()
    .replace(/[^a-z0-9а-яəıöğçşü]+/gi, '-')
    .slice(0, 15);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const slug = `${cleanProf}-${cleanCity}-${randomSuffix}`;

  const displayName = params.nameFormat === 'initial_only'
    ? `${params.fullName.split(' ')[0]} ${params.fullName.split(' ')[1]?.[0] || ''}.`.trim()
    : params.fullName;

  const now = new Date();
  const expires = new Date(now.getTime() + selectedPkg.durationDays * 24 * 60 * 60 * 1000);

  const existingIndex = list.findIndex((c) => c.candidateId === params.candidateId);

  const record: OpenCVRecord = {
    id: existingIndex >= 0 ? list[existingIndex].id : `opencv-${Date.now()}`,
    slug: existingIndex >= 0 ? list[existingIndex].slug : slug,
    candidateId: params.candidateId,
    fullName: params.fullName,
    displayName,
    nameFormat: params.nameFormat,
    profession: params.profession,
    category: params.category || 'Ümumi',
    city: params.city || 'Bakı',
    experienceYears: params.experienceYears || 0,
    expectedSalary: params.expectedSalary,
    skills: params.skills,
    languages: params.languages,
    educationLevel: params.educationLevel || 'Göstərilməyib',
    summary: params.summary,
    showPhoto: params.showPhoto,
    photoUrl: params.photoUrl,
    phoneHidden: true,
    emailHidden: true,
    directPhone: params.directPhone,
    directEmail: params.directEmail,
    packageType: params.packageType,
    packagePrice: selectedPkg.price,
    isFeatured: params.isFeatured,
    featuredPrice: params.isFeatured ? FEATURED_ADDON_PRICE : 0,
    publishedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    daysRemaining: selectedPkg.durationDays,
    status: 'active',
    viewsCount: existingIndex >= 0 ? list[existingIndex].viewsCount : 1,
    contactRequests: existingIndex >= 0 ? list[existingIndex].contactRequests : [],
    cvData: params.cvData,
    seoTitle: `${params.profession} ${displayName} CV - ${params.city} | Jobia.az`,
    seoDescription: `${params.profession} üzrə peşəkar Açıq CV. ${params.experienceYears} il təcrübə, bacarıqlar və birbaşa əlaqə sorğusu.`
  };

  if (existingIndex >= 0) {
    list[existingIndex] = record;
  } else {
    list.unshift(record);
  }

  saveStoredOpenCVs(list);
  return record;
}

export function hideOrRevokeOpenCV(candidateId: string): boolean {
  const list = getStoredOpenCVs();
  const item = list.find((c) => c.candidateId === candidateId);
  if (!item) return false;
  item.status = 'hidden';
  saveStoredOpenCVs(list);
  return true;
}

export function submitOpenCVContactRequest(params: {
  openCvId: string;
  employerName: string;
  employerCompany: string;
  employerEmail: string;
  employerPhone: string;
  positionOffered: string;
  salaryOffered?: string;
  message: string;
}): OpenCVContactRequest {
  const list = getStoredOpenCVs();
  const cv = list.find((c) => c.id === params.openCvId || c.slug === params.openCvId);
  if (!cv) {
    throw new Error('CV tapılmadı');
  }

  const newReq: OpenCVContactRequest = {
    id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    openCvId: cv.id,
    employerName: params.employerName,
    employerCompany: params.employerCompany,
    employerEmail: params.employerEmail,
    employerPhone: params.employerPhone,
    positionOffered: params.positionOffered,
    salaryOffered: params.salaryOffered,
    message: params.message,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  cv.contactRequests = cv.contactRequests || [];
  cv.contactRequests.unshift(newReq);
  saveStoredOpenCVs(list);
  return newReq;
}

export function respondToOpenCVContactRequest(
  openCvId: string,
  requestId: string,
  action: 'accepted' | 'declined'
): boolean {
  const list = getStoredOpenCVs();
  const cv = list.find((c) => c.id === openCvId);
  if (!cv || !cv.contactRequests) return false;

  const req = cv.contactRequests.find((r) => r.id === requestId);
  if (!req) return false;

  req.status = action;
  req.respondedAt = new Date().toISOString();
  saveStoredOpenCVs(list);
  return true;
}

export function incrementOpenCVViews(openCvId: string): void {
  const list = getStoredOpenCVs();
  const cv = list.find((c) => c.id === openCvId || c.slug === openCvId);
  if (cv) {
    cv.viewsCount = (cv.viewsCount || 0) + 1;
    saveStoredOpenCVs(list);
  }
}
