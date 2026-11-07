/**
 * Face Attendance & Biometric Access Types
 * AR "Fərdi məlumatlar haqqında" Qanununa və ISO 27001 standartlarına tam uyğundur.
 */

export type AttendanceEventType = 'CHECK_IN' | 'CHECK_OUT';

export type LivenessChallengeType = 
  | 'BLINK_EYES'     // Gözlərinizi qırpın
  | 'TURN_LEFT'      // Başınızı sola çevirin
  | 'TURN_RIGHT'     // Başınızı sağa çevirin
  | 'SMILE';         // Gülümsəyin

export type BiometricAngle = 'front' | 'left' | 'right';

export interface WorkSite {
  id: string;
  companyId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // default 200m
  timezone: string;
  isActive: boolean;
  createdAt: string;
}

export interface ShiftSchedule {
  id: string;
  workSiteId: string;
  name: string;
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  gracePeriodMinutes: number; // 15
  breakDurationMinutes: number;
  isNightShift: boolean;
}

export interface BiometricConsent {
  id: string;
  employeeId: string;
  consentVersion: string;
  purpose: string;
  legalText: string;
  signatureDataUrl: string; // E-imza
  signedAt: string;
  ipAddress: string;
}

export interface FaceEnrollment {
  id: string;
  employeeId: string;
  angle: BiometricAngle;
  embeddingVector: number[]; // 512-ölçülü normalizə olunmuş vektor
  qualityScore: number;      // 0.0 - 1.0
  isEyesOpen: boolean;
  lightingScore: number;
  blurrinessScore: number;
  createdAt: string;
  enrolledBy: string;
}

export interface AttendanceEmployee {
  id: string;
  companyId: string;
  workSiteId: string;
  shiftId?: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  pinCode: string; // FİN kod
  phone: string;
  email?: string;
  department: string;
  position: string;
  avatarUrl?: string;
  isEnrolled: boolean;
  status: 'active' | 'suspended' | 'terminated';
  enrollments?: FaceEnrollment[];
  consent?: BiometricConsent;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  employeePosition: string;
  employeeAvatar?: string;
  workSiteId: string;
  workSiteName: string;
  eventType: AttendanceEventType;
  serverTimestamp: string;
  deviceTimestamp: string;
  
  // GPS və Geofence
  gpsLatitude: number;
  gpsLongitude: number;
  gpsAccuracyMeters: number;
  distanceToSiteMeters: number;
  isWithinGeofence: boolean;
  isMockGps: boolean;
  supervisorComment?: string;
  
  // Biometrik skorlar
  similarityScore: number; // 0.0 - 1.0 (threshold 0.72)
  livenessScore: number;   // 0.0 - 1.0
  livenessChallenge: LivenessChallengeType;
  isSuspicious: boolean;
  suspicionReasons: string[];
  
  // Cihaz və sessiya
  recordedByUserId: string; // Rəhbər və ya 'SELF'
  recordedByRole: 'supervisor' | 'employee' | 'hr';
  deviceFingerprint: string;
  deviceModel: string;
  
  // Oflayn sinxronizasiya
  isOfflineSynced: boolean;
  offlineRecordedAt?: string;
  
  // Təhlükəsizlik audit snapshot (aşağı keyfiyyətli miniatür)
  auditThumbnailUrl?: string;
}

export interface AttendanceCorrection {
  id: string;
  attendanceRecordId: string;
  employeeId: string;
  employeeName: string;
  originalEventType?: AttendanceEventType;
  correctedEventType: AttendanceEventType;
  originalTime?: string;
  correctedTime: string;
  reason: string;
  correctedByUserId: string;
  correctedByName: string;
  createdAt: string;
}

export interface OfflineAttendanceQueueItem {
  id: string;
  record: AttendanceRecord;
  encryptedPayload: string;
  clientSignature: string;
  queuedAt: string;
}
