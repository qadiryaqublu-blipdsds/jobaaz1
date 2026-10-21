export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'fullname'
  | 'date'
  | 'time'
  | 'number'
  | 'currency'
  | 'email'
  | 'phone'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'file'
  | 'voice'
  | 'employee_prefill'
  | 'department_select'
  | 'supervisor_select'
  | 'confirmation'
  | 'signature';

export interface FormFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  helpText?: string;
  options?: string[]; // for select / multiselect
  conditionalOnFieldId?: string;
  conditionalExpectedValue?: string | boolean;
  validationRegex?: string;
  sectionName?: string;
  order: number;
}

export type DocumentClassificationType =
  | 'ariza' // Ərizə
  | 'bildiris' // Bildiriş
  | 'akt' // Akt
  | 'arayis' // Arayış
  | 'müraciet' // Müraciət
  | 'protokol' // Protokol
  | 'izahat' // İzahat
  | 'forma'; // Qiymətləndirmə / Sorğu forması

export interface DocumentLayoutConfig {
  documentType: DocumentClassificationType;
  headerRecipientText: string; // e.g. «"SOCAR Petroleum" QSC-nin Baş İcraçı Direktoruna»
  documentTitle: string; // e.g. «Ə R İ Z Ə»
  bodyTemplate: string; // Legal Azerbaijani text with {{field_name}} placeholders
  footerSignerTitle?: string; // e.g. «Ərizəçi», «Təhvil verən»
  includeSupervisorApproval?: boolean;
  includeStampBlock?: boolean;
  includeDocumentNumber?: boolean;
  footerNotes?: string;
}

export interface ApprovalWorkflowStep {
  stepNumber: number;
  roleName: 'supervisor' | 'hr_manager' | 'finance' | 'director' | 'employee';
  label: string;
  assignedUserId?: string;
  assignedUserName?: string;
  required: boolean;
}

export interface ApprovalWorkflowConfig {
  requiresSupervisorApproval: boolean;
  requiresDirectorApproval: boolean;
  requiresSignature: boolean;
  steps: ApprovalWorkflowStep[];
  automaticNotificationOnComplete: boolean;
}

export type TemplateCategoryType =
  | 'labor_relations' // 3.1. Əmək münasibətləri üzrə ərizələr
  | 'hr_management' // 3.2. İşəgötürən və HR idarəetməsi üzrə formalar
  | 'general_requests' // 3.3. Digər sənədlər və ümumi müraciətlər
  | 'company_custom'; // İşəgötürənin yaratdığı xüsusi sənədlər

export interface FormTemplate {
  id: string;
  organizationId: string; // 'system' for standard public templates, or specific company ID
  organizationName?: string;
  title: string;
  description: string;
  category: TemplateCategoryType;
  subcategory?: string;
  language: 'az' | 'en' | 'ru';
  fields: FormFieldDefinition[];
  documentLayout: DocumentLayoutConfig;
  approvalWorkflow: ApprovalWorkflowConfig;
  version: number;
  status: 'draft' | 'published' | 'archived';
  isSystemTemplate: boolean;
  iconName?: string;
  estimatedMinutes?: number;
  tags?: string[];
  createdBy?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type FormSubmissionStatus =
  | 'draft' // Qaralama
  | 'filling' // Doldurulur
  | 'pending_review' // Yoxlama gözləyir
  | 'pending_approval' // Təsdiq gözləyir
  | 'revision_requested' // Düzəliş tələb olunur
  | 'pending_signature' // İmza gözləyir
  | 'signed' // İmzalanıb
  | 'rejected' // Rədd edilib
  | 'completed' // Tamamlanıb
  | 'archived'; // Arxivləşdirilib

export interface SubmissionStatusHistoryEntry {
  status: FormSubmissionStatus;
  changedByUserId: string;
  changedByName: string;
  changedAt: string;
  comment?: string;
}

export interface FormSubmission {
  id: string;
  organizationId: string;
  organizationName?: string;
  templateId: string;
  templateTitle: string;
  templateCategory: TemplateCategoryType;
  templateVersion: number;
  submittedByUserId: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedByPhone?: string;
  submittedByDepartment?: string;
  submittedByPosition?: string;
  subjectUserId?: string; // If filled on behalf of another employee
  subjectUserName?: string;
  formData: Record<string, any>;
  currentStatus: FormSubmissionStatus;
  statusHistory: SubmissionStatusHistoryEntry[];
  assignedApproverId?: string;
  assignedApproverName?: string;
  supervisorNotes?: string;
  rejectionReason?: string;
  signatureRecordId?: string;
  documentId?: string;
  completionMode: 'standard' | 'voice' | 'ai_interview' | 'simple_accessible' | 'assisted';
  createdAt: string;
  updatedAt: string;
}

export type FieldDataSource =
  | 'company_profile'
  | 'employee_profile'
  | 'candidate_cv'
  | 'application_data'
  | 'voice_transcript'
  | 'ocr_scan'
  | 'ai_synthesizer'
  | 'manual_entry';

export interface FieldMappingEntry {
  fieldId: string;
  source: FieldDataSource;
  sourcePath: string;
  confidence: number;
  mappedValue: any;
  hasConflict?: boolean;
  conflictDetails?: string;
  isVerified?: boolean;
}

export interface SignatureRecord {
  id: string;
  documentId: string;
  signerUserId: string;
  signerName: string;
  signerEmail?: string;
  signerPosition?: string;
  signerRole: 'employee' | 'supervisor' | 'hr_manager' | 'director';
  signatureMethod:
    | 'canvas_draw'
    | 'image_upload'
    | 'typed_script'
    | 'electronic_stamp'
    | 'e_consent_pin'
    | 'asn_e_imza'
    | 'sima_token';
  signatureTypeLevel?: 'visual_simple' | 'enhanced_electronic' | 'qualified_e_imza';
  signatureDataUrl: string; // Base64 png of visual signature
  signedAt: string;
  ipAddress?: string;
  deviceInfo?: string;
  verificationHash: string;
  verificationStatus: 'verified' | 'pending';
  consentDeclaration?: string;
  certificateSerial?: string;
  verificationCode?: string;
  // Two-step (2-factor) biometric audit details
  verificationPhotos?: string[]; // Live snapshot photos taken at the exact moment of signing
  isTwoFactorVerified?: boolean;
  biometricCaptureTimestamp?: string;
  voiceConfirmationNote?: string;
}

export interface ApprovalStampInfo {
  approvedByUserId: string;
  approvedByName: string;
  approvedByPosition: string;
  approvedAt: string;
  decision: 'approved' | 'rejected' | 'revision';
  stampText?: string;
  comments?: string;
}

export interface SmartDocument {
  id: string;
  organizationId: string;
  organizationName?: string;
  submissionId: string;
  templateId: string;
  templateTitle: string;
  documentNumber: string; // e.g. "№ HR-2026/041"
  title: string;
  documentType: DocumentClassificationType;
  compiledContent: string; // Ready legal text with all fields replaced
  pdfStoragePath?: string;
  pdfDataUrl?: string;
  contentHash: string;
  signatures: SignatureRecord[];
  approvalStamp?: ApprovalStampInfo;
  status: FormSubmissionStatus;
  createdAt: string;
  finalizedAt?: string;
}

export interface SmartFormsAuditLog {
  id: string;
  organizationId: string;
  actorUserId: string;
  actorName: string;
  action: string;
  entityType: 'template' | 'submission' | 'document' | 'signature' | 'approval';
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface OrganizationSettings {
  organizationId: string;
  companyName: string;
  voen?: string;
  logoUrl?: string;
  address?: string;
  directorName?: string;
  hrLeadName?: string;
  numberingPrefix?: string; // e.g. "HR" -> "№ HR-2026/001"
  nextSequenceNumber?: number;
  departments: string[];
  positions: string[];
  monetizationPlan: 'free' | 'pro' | 'business' | 'enterprise';
  aiMonthlyQuota: number;
  aiUsageThisMonth: number;
}
