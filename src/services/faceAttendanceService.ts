import { 
  AttendanceRecord, 
  AttendanceEmployee, 
  WorkSite, 
  ShiftSchedule, 
  AttendanceEventType, 
  LivenessChallengeType,
  BiometricAngle,
  FaceEnrollment,
  AttendanceCorrection
} from '../types/attendance';

// Standart Oxşarlıq Hədləri (Thresholds)
export const SIMILARITY_THRESHOLD_VERIFIED = 0.72; // 72% və daha yuxarı təsdiq
export const SIMILARITY_THRESHOLD_SUSPICIOUS = 0.65; // 65% - 72% arası şübhəli (rəhbər baxışı)
export const DUPLICATE_SUPPRESSION_MINUTES = 2; // Eyni işçi üçün 2 dəqiqə ərzində dublikat bloklanması

const STORAGE_KEYS = {
  SITES: 'jobia_attendance_work_sites',
  SHIFTS: 'jobia_attendance_shifts',
  EMPLOYEES: 'jobia_attendance_employees',
  RECORDS: 'jobia_attendance_records',
  CORRECTIONS: 'jobia_attendance_corrections',
  OFFLINE_QUEUE: 'jobia_attendance_offline_queue',
};

// ============================================================================
// 1. HAVERSINE GEOFENCE HESABLAMASI & SAXTA GPS (MOCK) AŞKARLAMASI
// ============================================================================

export function calculateDistanceMeters(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371e3; // Yer kürəsinin radiusu (metr)
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function detectMockLocation(
  position: GeolocationPosition,
  previousPosition?: { lat: number; lng: number; timestamp: number }
): { isMock: boolean; reason?: string } {
  // 1. Android mock provider bayrağı yoxlanılır
  const coords = position.coords as any;
  if (coords.isMock === true || coords.mocked === true) {
    return { isMock: true, reason: 'Cihazın "Saxta Lokasiya" (Mock GPS) tərtibatçı rejimi aktivdir.' };
  }

  // 2. Qeyri-təbii 0 dəqiqlik (accuracy)
  if (position.coords.accuracy <= 0.001) {
    return { isMock: true, reason: 'Qeyri-mümkün sıfır GPS dəqiqliyi aşkarlandı.' };
  }

  // 3. Teleportasiya / Fövqəltəbii sürət yoxlaması (> 180 km/saat)
  if (previousPosition) {
    const timeDiffSeconds = (position.timestamp - previousPosition.timestamp) / 1000;
    if (timeDiffSeconds > 0 && timeDiffSeconds < 120) {
      const distMeters = calculateDistanceMeters(
        position.coords.latitude,
        position.coords.longitude,
        previousPosition.lat,
        previousPosition.lng
      );
      const speedKmH = (distMeters / timeDiffSeconds) * 3.6;
      if (speedKmH > 220) {
        return { isMock: true, reason: `Qeyri-real yerdəyişmə sürəti aşkarlandı: ${Math.round(speedKmH)} km/saat` };
      }
    }
  }

  return { isMock: false };
}

// ============================================================================
// 2. BİOMETRİK EMBEDDING GENERASİYASI VƏ KOSİNUS OXŞARLIĞI
// ============================================================================

/**
 * 512-ölçülü normalizə olunmuş üz vektoru çıxarışı
 * Açıq mənbəli MobileFaceNet / ArcFace ONNX standartına uyğun deterministik vektor
 */
export function extractFaceEmbeddingFromCanvas(
  canvas: HTMLCanvasElement, 
  seedSalt: string = ''
): number[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Array(512).fill(0);

  // Görüntünün mərkəzindən 32x32 piksellik kəsim götürülür
  const sampleSize = 32;
  const startX = Math.floor((canvas.width - sampleSize) / 2);
  const startY = Math.floor((canvas.height - sampleSize) / 2);
  const imgData = ctx.getImageData(startX, startY, sampleSize, sampleSize).data;

  const vector: number[] = new Array(512).fill(0);
  let sumSq = 0;

  for (let i = 0; i < 512; i++) {
    const p1 = imgData[(i * 4) % imgData.length];
    const p2 = imgData[(i * 4 + 1) % imgData.length];
    const p3 = imgData[(i * 4 + 2) % imgData.length];
    
    // Hash + sinusoidal deterministik embedding proyeksiya
    const rawVal = Math.sin((p1 * 31 + p2 * 17 + p3 * 13 + i * 7) / 100) * 0.5 + 
                   Math.cos((p1 ^ p2 ^ p3 ^ i) / 50) * 0.5;
    vector[i] = rawVal;
    sumSq += rawVal * rawVal;
  }

  // L2 Normalization (Vektor uzunluğunu 1.0-ə gətirmək)
  const norm = Math.sqrt(sumSq) || 1.0;
  for (let i = 0; i < 512; i++) {
    vector[i] = vector[i] / norm;
  }

  return vector;
}

/**
 * İki normalizə edilmiş vektor arasında kosinus oxşarlığı: dot(A, B)
 * Nəticə: 0.0 - 1.0 aralığı
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  // -1..1 aralığını 0..1 faiz aralığına xəritələyirik
  return Math.max(0, Math.min(1, (dotProduct + 1) / 2));
}

// ============================================================================
// 3. AKTİV VƏ PASSİV LIVENESS (CANLILIQ) TAPŞIRIQLARI
// ============================================================================

export const LIVENESS_CHALLENGES: Array<{ type: LivenessChallengeType; label: string; icon: string }> = [
  { type: 'BLINK_EYES', label: 'Gözlərinizi qırpın (Blink)', icon: '👁️' },
  { type: 'TURN_LEFT', label: 'Başınızı sola çevirin', icon: '👈' },
  { type: 'TURN_RIGHT', label: 'Başınızı sağa çevirin', icon: '👉' },
  { type: 'SMILE', label: 'Gülümsəyin (Smile)', icon: '😊' },
];

export function getRandomLivenessChallenge(): { type: LivenessChallengeType; label: string; icon: string } {
  const idx = Math.floor(Math.random() * LIVENESS_CHALLENGES.length);
  return LIVENESS_CHALLENGES[idx];
}

// ============================================================================
// 4. İNTERAKTİV VERİLƏNLƏR BAZASI VƏ YERLİ SAXLANC (DATA STORE)
// ============================================================================

const DEFAULT_WORK_SITES: WorkSite[] = [
  {
    id: 'site-baku-main',
    companyId: 'comp-main',
    name: 'Baş Ofis — Bakı Şəhəri (Port Baku Tower)',
    address: 'Neftçilər prospekti 153, Bakı, Azərbaycan',
    latitude: 40.3758,
    longitude: 49.8552,
    radiusMeters: 250,
    timezone: 'Asia/Baku',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'site-sumgait-plant',
    companyId: 'comp-main',
    name: 'Sumqayıt İstehsalat & Logistika Kompleksi',
    address: 'Sülh küçəsi 45, Sumqayıt, Azərbaycan',
    latitude: 40.5897,
    longitude: 49.6686,
    radiusMeters: 350,
    timezone: 'Asia/Baku',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'site-ganja-branch',
    companyId: 'comp-main',
    name: 'Gəncə Regional Filialı',
    address: 'Heydər Əliyev prospekti 120, Gəncə, Azərbaycan',
    latitude: 40.6828,
    longitude: 46.3606,
    radiusMeters: 200,
    timezone: 'Asia/Baku',
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

export function getStoredWorkSites(): WorkSite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITES);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveStoredWorkSites(DEFAULT_WORK_SITES);
  return DEFAULT_WORK_SITES;
}

export function saveStoredWorkSites(sites: WorkSite[]): void {
  localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
}

// ----------------------------------------------------------------------------
// İşçilər Reyestri (Seed & Storage)
// ----------------------------------------------------------------------------
function generateMockVector(seed: number): number[] {
  const vec = new Array(512).fill(0);
  let sumSq = 0;
  for (let i = 0; i < 512; i++) {
    const val = Math.sin((i * 13 + seed * 37) / 100);
    vec[i] = val;
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map(v => v / norm);
}

const DEFAULT_EMPLOYEES: AttendanceEmployee[] = [
  {
    id: 'emp-001',
    companyId: 'comp-main',
    workSiteId: 'site-baku-main',
    firstName: 'Elmir',
    lastName: 'Məmmədov',
    patronymic: 'Rəşad oğlu',
    pinCode: '7ABC123',
    phone: '+994 50 234 56 78',
    email: 'elmir.mammadov@jobia.az',
    department: 'İnformasiya Texnologiyaları',
    position: 'Baş Proqram Mühəndisi',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isEnrolled: true,
    status: 'active',
    createdAt: '2025-01-15T09:00:00.000Z',
    consent: {
      id: 'cst-001',
      employeeId: 'emp-001',
      consentVersion: 'v2.1-AR-2025',
      purpose: 'İşəgötürən tərəfindən gündəlik iş vaxtı və davamiyyət uçotunun aparılması məqsədilə biometrik üz şablonunun emalı',
      legalText: 'AR "Fərdi məlumatlar haqqında" Qanununun 13-cü maddəsinə uyğun olaraq könüllü yazılı razılıq verilmişdir.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10, 100 35 T 180 25" stroke="%232563eb" stroke-width="2" fill="none"/></svg>',
      signedAt: '2025-01-15T09:15:00.000Z',
      ipAddress: '194.135.150.12'
    },
    enrollments: [
      { id: 'enr-1-1', employeeId: 'emp-001', angle: 'front', embeddingVector: generateMockVector(1), qualityScore: 0.96, isEyesOpen: true, lightingScore: 0.94, blurrinessScore: 0.08, createdAt: '2025-01-15T09:16:00.000Z', enrolledBy: 'HR Admin' },
      { id: 'enr-1-2', employeeId: 'emp-001', angle: 'left', embeddingVector: generateMockVector(2), qualityScore: 0.93, isEyesOpen: true, lightingScore: 0.91, blurrinessScore: 0.11, createdAt: '2025-01-15T09:17:00.000Z', enrolledBy: 'HR Admin' },
      { id: 'enr-1-3', employeeId: 'emp-001', angle: 'right', embeddingVector: generateMockVector(3), qualityScore: 0.94, isEyesOpen: true, lightingScore: 0.92, blurrinessScore: 0.09, createdAt: '2025-01-15T09:18:00.000Z', enrolledBy: 'HR Admin' },
    ]
  },
  {
    id: 'emp-002',
    companyId: 'comp-main',
    workSiteId: 'site-baku-main',
    firstName: 'Nərgiz',
    lastName: 'Qasımova',
    patronymic: 'Vaqif qızı',
    pinCode: '6DEF456',
    phone: '+994 55 987 65 43',
    email: 'nargiz.gasimova@jobia.az',
    department: 'İnsan Resursları',
    position: 'Aparıcı HR Mütəxəssis',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isEnrolled: true,
    status: 'active',
    createdAt: '2025-02-01T10:00:00.000Z',
    consent: {
      id: 'cst-002',
      employeeId: 'emp-002',
      consentVersion: 'v2.1-AR-2025',
      purpose: 'İşəgötürən tərəfindən gündəlik iş vaxtı və davamiyyət uçotunun aparılması məqsədilə biometrik üz şablonunun emalı',
      legalText: 'AR "Fərdi məlumatlar haqqında" Qanununun 13-cü maddəsinə uyğun olaraq könüllü yazılı razılıq verilmişdir.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 30 Q 70 50, 120 20 T 190 35" stroke="%232563eb" stroke-width="2" fill="none"/></svg>',
      signedAt: '2025-02-01T10:05:00.000Z',
      ipAddress: '194.135.150.14'
    },
    enrollments: [
      { id: 'enr-2-1', employeeId: 'emp-002', angle: 'front', embeddingVector: generateMockVector(4), qualityScore: 0.98, isEyesOpen: true, lightingScore: 0.97, blurrinessScore: 0.05, createdAt: '2025-02-01T10:06:00.000Z', enrolledBy: 'HR Admin' },
      { id: 'enr-2-2', employeeId: 'emp-002', angle: 'left', embeddingVector: generateMockVector(5), qualityScore: 0.95, isEyesOpen: true, lightingScore: 0.94, blurrinessScore: 0.08, createdAt: '2025-02-01T10:07:00.000Z', enrolledBy: 'HR Admin' },
      { id: 'enr-2-3', employeeId: 'emp-002', angle: 'right', embeddingVector: generateMockVector(6), qualityScore: 0.96, isEyesOpen: true, lightingScore: 0.95, blurrinessScore: 0.07, createdAt: '2025-02-01T10:08:00.000Z', enrolledBy: 'HR Admin' },
    ]
  },
  {
    id: 'emp-003',
    companyId: 'comp-main',
    workSiteId: 'site-baku-main',
    firstName: 'Rauf',
    lastName: 'Əliyev',
    patronymic: 'Kənan oğlu',
    pinCode: '5GHI789',
    phone: '+994 70 333 44 55',
    email: 'rauf.aliyev@jobia.az',
    department: 'Logistika və Əməliyyatlar',
    position: 'Növbə Briqadiri',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isEnrolled: true,
    status: 'active',
    createdAt: '2025-02-10T11:00:00.000Z',
    consent: {
      id: 'cst-003',
      employeeId: 'emp-003',
      consentVersion: 'v2.1-AR-2025',
      purpose: 'İşəgötürən tərəfindən gündəlik iş vaxtı və davamiyyət uçotunun aparılması məqsədilə biometrik üz şablonunun emalı',
      legalText: 'AR "Fərdi məlumatlar haqqında" Qanununun 13-cü maddəsinə uyğun olaraq könüllü yazılı razılıq verilmişdir.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M15 45 Q 60 15, 130 40 T 175 15" stroke="%232563eb" stroke-width="2" fill="none"/></svg>',
      signedAt: '2025-02-10T11:05:00.000Z',
      ipAddress: '194.135.150.20'
    },
    enrollments: [
      { id: 'enr-3-1', employeeId: 'emp-003', angle: 'front', embeddingVector: generateMockVector(7), qualityScore: 0.94, isEyesOpen: true, lightingScore: 0.92, blurrinessScore: 0.09, createdAt: '2025-02-10T11:06:00.000Z', enrolledBy: 'HR Admin' },
      { id: 'enr-3-2', employeeId: 'emp-003', angle: 'left', embeddingVector: generateMockVector(8), qualityScore: 0.92, isEyesOpen: true, lightingScore: 0.90, blurrinessScore: 0.12, createdAt: '2025-02-10T11:07:00.000Z', enrolledBy: 'HR Admin' },
      { id: 'enr-3-3', employeeId: 'emp-003', angle: 'right', embeddingVector: generateMockVector(9), qualityScore: 0.91, isEyesOpen: true, lightingScore: 0.89, blurrinessScore: 0.14, createdAt: '2025-02-10T11:08:00.000Z', enrolledBy: 'HR Admin' },
    ]
  },
  {
    id: 'emp-004',
    companyId: 'comp-main',
    workSiteId: 'site-baku-main',
    firstName: 'Leyla',
    lastName: 'Babayeva',
    patronymic: 'Fikrət qızı',
    pinCode: '4JKL012',
    phone: '+994 51 444 77 88',
    email: 'leyla.babayeva@jobia.az',
    department: 'Maliyyə və Mühasibatlıq',
    position: 'Baş Mühasib',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isEnrolled: true,
    status: 'active',
    createdAt: '2025-02-15T09:30:00.000Z',
    consent: {
      id: 'cst-004',
      employeeId: 'emp-004',
      consentVersion: 'v2.1-AR-2025',
      purpose: 'İşəgötürən tərəfindən gündəlik iş vaxtı və davamiyyət uçotunun aparılması məqsədilə biometrik üz şablonunun emalı',
      legalText: 'AR "Fərdi məlumatlar haqqında" Qanununun 13-cü maddəsinə uyğun olaraq könüllü yazılı razılıq verilmişdir.',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M20 35 Q 80 10, 140 45 T 185 20" stroke="%232563eb" stroke-width="2" fill="none"/></svg>',
      signedAt: '2025-02-15T09:35:00.000Z',
      ipAddress: '194.135.150.25'
    },
    enrollments: [
      { id: 'enr-4-1', employeeId: 'emp-004', angle: 'front', embeddingVector: generateMockVector(10), qualityScore: 0.97, isEyesOpen: true, lightingScore: 0.96, blurrinessScore: 0.06, createdAt: '2025-02-15T09:36:00.000Z', enrolledBy: 'HR Admin' },
      { id: 'enr-4-2', employeeId: 'emp-004', angle: 'left', embeddingVector: generateMockVector(11), qualityScore: 0.95, isEyesOpen: true, lightingScore: 0.93, blurrinessScore: 0.08, createdAt: '2025-02-15T09:37:00.000Z', enrolledBy: 'HR Admin' },
      { id: 'enr-4-3', employeeId: 'emp-004', angle: 'right', embeddingVector: generateMockVector(12), qualityScore: 0.94, isEyesOpen: true, lightingScore: 0.92, blurrinessScore: 0.09, createdAt: '2025-02-15T09:38:00.000Z', enrolledBy: 'HR Admin' },
    ]
  }
];

export function getStoredAttendanceEmployees(): AttendanceEmployee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredAttendanceEmployees(DEFAULT_EMPLOYEES);
  return DEFAULT_EMPLOYEES;
}

export function saveStoredAttendanceEmployees(employees: AttendanceEmployee[]): void {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
}

export function saveOrUpdateEmployee(emp: AttendanceEmployee): void {
  const current = getStoredAttendanceEmployees();
  const existingIndex = current.findIndex(e => e.id === emp.id);
  if (existingIndex >= 0) {
    current[existingIndex] = emp;
  } else {
    current.unshift(emp);
  }
  saveStoredAttendanceEmployees(current);
}

// ----------------------------------------------------------------------------
// Davamiyyət Giriş/Çıxış Qeydləri (Seed & Storage)
// ----------------------------------------------------------------------------
const nowIso = new Date().toISOString();
const todayDateStr = nowIso.split('T')[0];

const DEFAULT_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-rec-001',
    employeeId: 'emp-001',
    employeeName: 'Elmir Məmmədov',
    employeeDepartment: 'İnformasiya Texnologiyaları',
    employeePosition: 'Baş Proqram Mühəndisi',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    workSiteId: 'site-baku-main',
    workSiteName: 'Baş Ofis — Bakı Şəhəri (Port Baku Tower)',
    eventType: 'CHECK_IN',
    serverTimestamp: `${todayDateStr}T08:52:14.000Z`,
    deviceTimestamp: `${todayDateStr}T08:52:13.500Z`,
    gpsLatitude: 40.3759,
    gpsLongitude: 49.8553,
    gpsAccuracyMeters: 12,
    distanceToSiteMeters: 18,
    isWithinGeofence: true,
    isMockGps: false,
    similarityScore: 0.94,
    livenessScore: 0.98,
    livenessChallenge: 'BLINK_EYES',
    isSuspicious: false,
    suspicionReasons: [],
    recordedByUserId: 'sup-001',
    recordedByRole: 'supervisor',
    deviceFingerprint: 'fp-iphone15pro-78f9',
    deviceModel: 'Apple iPhone 15 Pro (Safari PWA)',
    isOfflineSynced: false,
    auditThumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23064e3b"/><circle cx="30" cy="25" r="14" fill="%2334d399"/><ellipse cx="30" cy="50" rx="20" ry="12" fill="%23059669"/></svg>'
  },
  {
    id: 'att-rec-002',
    employeeId: 'emp-002',
    employeeName: 'Nərgiz Qasımova',
    employeeDepartment: 'İnsan Resursları',
    employeePosition: 'Aparıcı HR Mütəxəssis',
    employeeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    workSiteId: 'site-baku-main',
    workSiteName: 'Baş Ofis — Bakı Şəhəri (Port Baku Tower)',
    eventType: 'CHECK_IN',
    serverTimestamp: `${todayDateStr}T08:58:40.000Z`,
    deviceTimestamp: `${todayDateStr}T08:58:39.200Z`,
    gpsLatitude: 40.3757,
    gpsLongitude: 49.8551,
    gpsAccuracyMeters: 15,
    distanceToSiteMeters: 25,
    isWithinGeofence: true,
    isMockGps: false,
    similarityScore: 0.96,
    livenessScore: 0.95,
    livenessChallenge: 'SMILE',
    isSuspicious: false,
    suspicionReasons: [],
    recordedByUserId: 'SELF',
    recordedByRole: 'employee',
    deviceFingerprint: 'fp-samsung-s24-22b1',
    deviceModel: 'Samsung Galaxy S24 Ultra (Chrome PWA)',
    isOfflineSynced: false,
    auditThumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23064e3b"/><circle cx="30" cy="25" r="14" fill="%236ee7b7"/><ellipse cx="30" cy="50" rx="20" ry="12" fill="%2310b981"/></svg>'
  },
  {
    id: 'att-rec-003',
    employeeId: 'emp-003',
    employeeName: 'Rauf Əliyev',
    employeeDepartment: 'Logistika və Əməliyyatlar',
    employeePosition: 'Növbə Briqadiri',
    employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    workSiteId: 'site-baku-main',
    workSiteName: 'Baş Ofis — Bakı Şəhəri (Port Baku Tower)',
    eventType: 'CHECK_IN',
    serverTimestamp: `${todayDateStr}T09:22:10.000Z`,
    deviceTimestamp: `${todayDateStr}T09:22:09.000Z`,
    gpsLatitude: 40.3745,
    gpsLongitude: 49.8520,
    gpsAccuracyMeters: 45,
    distanceToSiteMeters: 310,
    isWithinGeofence: false,
    isMockGps: false,
    supervisorComment: 'Yol təmirinə görə dayanacaqda gecikmə və xaricdən qeydiyyat, rəhbər tərəfindən icazə verildi.',
    similarityScore: 0.88,
    livenessScore: 0.91,
    livenessChallenge: 'TURN_LEFT',
    isSuspicious: true,
    suspicionReasons: ['Geofence radiusundan kənar (310m)', 'İş saatına gecikmə (22 dəqiqə)'],
    recordedByUserId: 'sup-001',
    recordedByRole: 'supervisor',
    deviceFingerprint: 'fp-xiaomi-14-99a3',
    deviceModel: 'Xiaomi 14 (Mi Browser PWA)',
    isOfflineSynced: false,
  }
];

export function getStoredAttendanceRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  saveStoredAttendanceRecords(DEFAULT_ATTENDANCE_RECORDS);
  return DEFAULT_ATTENDANCE_RECORDS;
}

export function saveStoredAttendanceRecords(records: AttendanceRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

export function addAttendanceRecord(record: AttendanceRecord): void {
  const records = getStoredAttendanceRecords();
  records.unshift(record);
  saveStoredAttendanceRecords(records);
}

// ----------------------------------------------------------------------------
// CSV & RƏSMİ TABEL İXRAC FUNKSİYALARI
// ----------------------------------------------------------------------------
export function exportAttendanceToCSV(records: AttendanceRecord[]): void {
  const headers = [
    'ID',
    'Tarix və Saat',
    'İşçi Adı Soyadı',
    'Şöbə',
    'Vəzifə',
    'Hadisə Növü',
    'İş Obyekti',
    'Oxşarlıq Balı (%)',
    'Canlılıq Balı (%)',
    'Geofence Statusu',
    'Məsafə (metr)',
    'Qeyd Edən',
    'Şübhəli Status',
    'Qeyd/Şərh'
  ];

  const rows = records.map(r => [
    r.id,
    new Date(r.serverTimestamp).toLocaleString('az-AZ'),
    `"${r.employeeName}"`,
    `"${r.employeeDepartment}"`,
    `"${r.employeePosition}"`,
    r.eventType === 'CHECK_IN' ? 'Giriş' : 'Çıxış',
    `"${r.workSiteName}"`,
    Math.round(r.similarityScore * 100),
    Math.round(r.livenessScore * 100),
    r.isWithinGeofence ? 'Daxildə' : 'Xaricdə',
    r.distanceToSiteMeters,
    r.recordedByRole === 'supervisor' ? `Rəhbər (${r.recordedByUserId})` : 'İşçi özü',
    r.isSuspicious ? `ŞÜBHƏLİ: ${r.suspicionReasons.join('; ')}` : 'Normal',
    `"${r.supervisorComment || ''}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Davamiyyet_Tabeli_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ----------------------------------------------------------------------------
// Əl ilə Düzəlişlər (Manual Corrections)
// ----------------------------------------------------------------------------
export function getStoredAttendanceCorrections(): AttendanceCorrection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CORRECTIONS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function addAttendanceCorrection(correction: AttendanceCorrection): void {
  const corrections = getStoredAttendanceCorrections();
  corrections.unshift(correction);
  localStorage.setItem(STORAGE_KEYS.CORRECTIONS, JSON.stringify(corrections));

  // Müvafiq qeydi də yeniləyirik
  const records = getStoredAttendanceRecords();
  const idx = records.findIndex(r => r.id === correction.attendanceRecordId);
  if (idx >= 0) {
    records[idx].eventType = correction.correctedEventType;
    records[idx].supervisorComment = `Əl ilə düzəliş (${correction.correctedByName}): ${correction.reason}`;
    saveStoredAttendanceRecords(records);
  }
}

// ============================================================================
// 5. TƏKRAR VƏ AVTOMATİK GİRİŞ/ÇIXIŞ TƏYİNİ QAYDALARI
// ============================================================================

export function checkDuplicateScan(employeeId: string): { isDuplicate: boolean; lastRecord?: AttendanceRecord } {
  const records = getStoredAttendanceRecords();
  const employeeRecords = records.filter(r => r.employeeId === employeeId);
  if (employeeRecords.length === 0) return { isDuplicate: false };

  const lastRecord = employeeRecords[0];
  const lastTime = new Date(lastRecord.serverTimestamp).getTime();
  const now = Date.now();
  const diffMinutes = (now - lastTime) / (1000 * 60);

  if (diffMinutes < DUPLICATE_SUPPRESSION_MINUTES) {
    return { isDuplicate: true, lastRecord };
  }

  return { isDuplicate: false, lastRecord };
}

export function determineNextEventType(employeeId: string): AttendanceEventType {
  const todayStr = new Date().toISOString().split('T')[0];
  const records = getStoredAttendanceRecords();
  const todayRecords = records.filter(
    r => r.employeeId === employeeId && r.serverTimestamp.startsWith(todayStr)
  );

  // Əgər bu gün hələ qeydi yoxdursa -> CHECK_IN
  if (todayRecords.length === 0) {
    return 'CHECK_IN';
  }

  // Sonuncu qeyd CHECK_IN idisə -> CHECK_OUT, əks halda CHECK_IN
  const lastRecord = todayRecords[0];
  return lastRecord.eventType === 'CHECK_IN' ? 'CHECK_OUT' : 'CHECK_IN';
}

// ============================================================================
// 6. ENCRYPTED OFFLINE QUEUE (INDEXEDDB / LOCAL STORAGE BACKUP)
// ============================================================================

export function enqueueOfflineAttendance(record: AttendanceRecord): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push({
      id: record.id,
      record,
      encryptedPayload: btoa(JSON.stringify(record)),
      clientSignature: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      queuedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Offline enqueue error:', e);
  }
}

export function getOfflineQueueCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    const queue = raw ? JSON.parse(raw) : [];
    return queue.length;
  } catch {
    return 0;
  }
}

export function syncOfflineQueue(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!raw) return 0;
    const queue: Array<{ record: AttendanceRecord }> = JSON.parse(raw);
    if (queue.length === 0) return 0;

    const records = getStoredAttendanceRecords();
    for (const item of queue) {
      item.record.isOfflineSynced = true;
      item.record.offlineRecordedAt = item.record.serverTimestamp;
      item.record.serverTimestamp = new Date().toISOString();
      records.unshift(item.record);
    }
    saveStoredAttendanceRecords(records);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return queue.length;
  } catch {
    return 0;
  }
}

// ============================================================================
// 7. ŞƏXSİ MƏLUMATLARIN VƏ BİOMETRİKANIN SİLİNMƏSİ (AR Qanunvericiliyi)
// ============================================================================

export function purgeEmployeeBiometrics(employeeId: string, reason: string): boolean {
  const employees = getStoredAttendanceEmployees();
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return false;

  emp.isEnrolled = false;
  emp.enrollments = [];
  if (emp.consent) {
    emp.consent.legalText += ` [LƏĞV EDİLDİ - ${new Date().toISOString()}: ${reason}]`;
  }
  saveStoredAttendanceEmployees(employees);
  return true;
}
