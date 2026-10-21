import {
  FormTemplate,
  FormSubmission,
  SmartDocument,
  SmartFormsAuditLog,
  SignatureRecord,
  ApprovalStampInfo,
  FormSubmissionStatus,
  OrganizationSettings
} from '../../types/smartForms';
import { DEFAULT_SYSTEM_FORM_TEMPLATES } from './defaultTemplates';
import {
  saveSignatureRecordToFirestore,
  getSignatureRecordsByDocumentId,
  getAllSignatureRecordsFromFirestore
} from '../../services/firestoreService';

export {
  saveSignatureRecordToFirestore,
  getSignatureRecordsByDocumentId,
  getAllSignatureRecordsFromFirestore
};

const TEMPLATES_STORAGE_KEY = 'jobia_smart_form_templates';
const SUBMISSIONS_STORAGE_KEY = 'jobia_smart_form_submissions';
const DOCUMENTS_STORAGE_KEY = 'jobia_smart_form_documents';
const AUDITS_STORAGE_KEY = 'jobia_smart_form_audits';
const ORG_SETTINGS_KEY = 'jobia_smart_form_org_settings';

// ==========================================
// 1. TEMPLATES SERVICE
// ==========================================

export function getAllTemplates(organizationId: string = 'system'): FormTemplate[] {
  try {
    const saved = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    let customTemplates: FormTemplate[] = [];
    if (saved) {
      customTemplates = JSON.parse(saved);
    }
    // Merge system templates and custom organization templates
    const combined = [...DEFAULT_SYSTEM_FORM_TEMPLATES, ...customTemplates];
    return combined.filter(t => t.organizationId === 'system' || t.organizationId === organizationId);
  } catch {
    return DEFAULT_SYSTEM_FORM_TEMPLATES;
  }
}

export function saveCustomTemplate(template: FormTemplate): FormTemplate {
  try {
    const saved = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    let list: FormTemplate[] = saved ? JSON.parse(saved) : [];
    const index = list.findIndex(t => t.id === template.id);
    if (index >= 0) {
      list[index] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...template, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(list));
    logAuditEvent(
      template.organizationId,
      'current-user',
      'HR Administrator',
      `Şablon saxlanıldı: ${template.title}`,
      'template',
      template.id
    );
  } catch (err) {
    console.warn('Failed to save template to localStorage', err);
  }
  return template;
}

export function deleteCustomTemplate(templateId: string, organizationId: string): boolean {
  try {
    const saved = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!saved) return false;
    let list: FormTemplate[] = JSON.parse(saved);
    list = list.filter(t => t.id !== templateId);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(list));
    logAuditEvent(
      organizationId,
      'current-user',
      'HR Administrator',
      `Fərdi şablon silindi: ${templateId}`,
      'template',
      templateId
    );
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// 2. SUBMISSIONS SERVICE
// ==========================================

export function getSubmissions(organizationId?: string, userEmail?: string): FormSubmission[] {
  try {
    const saved = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!saved) return getInitialDemoSubmissions();
    const list: FormSubmission[] = JSON.parse(saved);
    if (!organizationId && !userEmail) return list;
    return list.filter(s => {
      const matchOrg = !organizationId || s.organizationId === organizationId || s.organizationId === 'demo-corp';
      const matchUser = !userEmail || s.submittedByEmail === userEmail;
      return matchOrg && matchUser;
    });
  } catch {
    return getInitialDemoSubmissions();
  }
}

export function createSubmission(
  submission: Omit<FormSubmission, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>
): FormSubmission {
  const id = 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();
  const newSub: FormSubmission = {
    ...submission,
    id,
    createdAt: now,
    updatedAt: now,
    statusHistory: [
      {
        status: submission.currentStatus,
        changedByUserId: submission.submittedByUserId,
        changedByName: submission.submittedByName,
        changedAt: now,
        comment: 'Forma doldurulub təqdim edildi',
      },
    ],
  };

  // Compile and prepare the document
  const createdDoc = generateDocumentFromSubmission(newSub);
  newSub.documentId = createdDoc.id;

  try {
    const current = getSubmissions();
    const updated = [newSub, ...current];
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    logAuditEvent(
      newSub.organizationId,
      newSub.submittedByUserId,
      newSub.submittedByName,
      `Yeni ərizə müraciəti təqdim edildi: ${newSub.templateTitle}`,
      'submission',
      newSub.id
    );
  } catch (err) {
    console.warn('Failed to save submission', err);
  }

  return newSub;
}

export function updateSubmissionStatus(
  submissionId: string,
  newStatus: FormSubmissionStatus,
  actorUserId: string,
  actorName: string,
  comment?: string,
  rejectionReason?: string
): FormSubmission | null {
  try {
    const current = getSubmissions();
    const index = current.findIndex(s => s.id === submissionId);
    if (index === -1) return null;

    const now = new Date().toISOString();
    const target = current[index];
    const updated: FormSubmission = {
      ...target,
      currentStatus: newStatus,
      rejectionReason: rejectionReason || target.rejectionReason,
      updatedAt: now,
      statusHistory: [
        ...target.statusHistory,
        {
          status: newStatus,
          changedByUserId: actorUserId,
          changedByName: actorName,
          changedAt: now,
          comment: comment || `Status dəyişdirildi: ${newStatus}`,
        },
      ],
    };

    current[index] = updated;
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(current));

    logAuditEvent(
      updated.organizationId,
      actorUserId,
      actorName,
      `Sənəd statusu yeniləndi: ${newStatus} (${updated.templateTitle})`,
      'approval',
      submissionId,
      { comment, rejectionReason }
    );

    // Update document status if exists
    updateDocumentStatus(submissionId, newStatus);

    return updated;
  } catch {
    return null;
  }
}

// ==========================================
// 3. DOCUMENTS & PDF COMPILER SERVICE
// ==========================================

export function compileDocumentContent(template: FormTemplate, formData: Record<string, any>, companyName: string): string {
  let body = template.documentLayout.bodyTemplate;
  // Replace tokens {{field_name}}
  for (const [key, value] of Object.entries(formData)) {
    const formatted = typeof value === 'boolean' ? (value ? 'Bəli' : 'Xeyr') : String(value ?? '');
    body = body.replace(new RegExp(`{{${key}}}`, 'g'), formatted);
  }
  // Replace standard header tokens
  body = body.replace(/{{company_name}}/g, companyName || 'Müəssisə');
  body = body.replace(/{{current_date}}/g, new Date().toLocaleDateString('az-AZ'));
  return body;
}

export function generateDocumentFromSubmission(submission: FormSubmission): SmartDocument {
  const templates = getAllTemplates();
  const template = templates.find(t => t.id === submission.templateId) || DEFAULT_SYSTEM_FORM_TEMPLATES[0];
  const settings = getOrganizationSettings(submission.organizationId);
  const companyName = settings.companyName || submission.organizationName || 'Jobia Müəssisəsi';

  const compiledContent = compileDocumentContent(template, submission.formData, companyName);
  const docNumber = getNextDocumentNumber(submission.organizationId);

  const docId = 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const smartDoc: SmartDocument = {
    id: docId,
    organizationId: submission.organizationId,
    organizationName: companyName,
    submissionId: submission.id,
    templateId: template.id,
    templateTitle: template.title,
    documentNumber: docNumber,
    title: `${template.title} — ${submission.submittedByName}`,
    documentType: template.documentLayout.documentType,
    compiledContent,
    contentHash: 'hash-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    signatures: [],
    status: submission.currentStatus,
    createdAt: submission.createdAt,
  };

  try {
    const saved = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    const list: SmartDocument[] = saved ? JSON.parse(saved) : [];
    const filtered = list.filter(d => d.submissionId !== submission.id);
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify([smartDoc, ...filtered]));
  } catch (err) {
    console.warn('Failed to save smart document', err);
  }

  return smartDoc;
}

export function getDocumentBySubmissionId(submissionId: string): SmartDocument | null {
  try {
    const saved = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!saved) return null;
    const list: SmartDocument[] = JSON.parse(saved);
    return list.find(d => d.submissionId === submissionId) || null;
  } catch {
    return null;
  }
}

export function getAllDocuments(organizationId?: string): SmartDocument[] {
  try {
    const saved = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!saved) return [];
    const list: SmartDocument[] = JSON.parse(saved);
    if (!organizationId) return list;
    return list.filter(d => d.organizationId === organizationId || d.organizationId === 'demo-corp');
  } catch {
    return [];
  }
}

export function attachSignatureToDocument(
  submissionId: string,
  signature: Omit<SignatureRecord, 'id' | 'signedAt' | 'verificationHash' | 'verificationStatus'>
): SmartDocument | null {
  try {
    const doc = getDocumentBySubmissionId(submissionId);
    if (!doc) return null;

    const signatureId = 'sig-' + Date.now();
    const signedAt = new Date().toISOString();
    const verificationHash = 'VERIFY-AZ-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const fullRecord: SignatureRecord = {
      ...signature,
      id: signatureId,
      documentId: doc.id,
      signedAt,
      verificationHash,
      verificationStatus: 'verified',
    };

    doc.signatures.push(fullRecord);
    doc.status = 'signed';

    // Asynchronously save to Firestore 'SignatureRecords' collection
    saveSignatureRecordToFirestore(fullRecord).catch(err => {
      console.warn('Notice: Background Firestore saveSignatureRecordToFirestore failed, local cache preserved:', err);
    });

    // Save document
    const saved = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (saved) {
      const list: SmartDocument[] = JSON.parse(saved);
      const idx = list.findIndex(d => d.id === doc.id);
      if (idx >= 0) list[idx] = doc;
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(list));
    }

    // Update submission
    updateSubmissionStatus(
      submissionId,
      'signed',
      signature.signerUserId,
      signature.signerName,
      `Sənəd rəqəmsal olaraq imzalandı (${signature.signatureMethod})`
    );

    logAuditEvent(
      doc.organizationId,
      signature.signerUserId,
      signature.signerName,
      `Sənəd imzalandı: ${doc.title} (${doc.documentNumber})`,
      'signature',
      doc.id,
      { hash: verificationHash }
    );

    return doc;
  } catch {
    return null;
  }
}

export function attachSupervisorStampToDocument(
  submissionId: string,
  stamp: ApprovalStampInfo
): SmartDocument | null {
  try {
    const doc = getDocumentBySubmissionId(submissionId);
    if (!doc) return null;

    doc.approvalStamp = stamp;
    if (stamp.decision === 'approved') {
      doc.status = 'completed';
      doc.finalizedAt = new Date().toISOString();
    } else if (stamp.decision === 'revision') {
      doc.status = 'revision_requested';
    } else {
      doc.status = 'rejected';
    }

    const saved = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (saved) {
      const list: SmartDocument[] = JSON.parse(saved);
      const idx = list.findIndex(d => d.id === doc.id);
      if (idx >= 0) list[idx] = doc;
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(list));
    }

    updateSubmissionStatus(
      submissionId,
      doc.status,
      stamp.approvedByUserId,
      stamp.approvedByName,
      `Rəhbərlik qərarı: ${stamp.decision.toUpperCase()} — ${stamp.comments || ''}`
    );

    return doc;
  } catch {
    return null;
  }
}

function updateDocumentStatus(submissionId: string, newStatus: FormSubmissionStatus) {
  try {
    const saved = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!saved) return;
    const list: SmartDocument[] = JSON.parse(saved);
    const idx = list.findIndex(d => d.submissionId === submissionId);
    if (idx >= 0) {
      list[idx].status = newStatus;
      if (newStatus === 'completed') {
        list[idx].finalizedAt = new Date().toISOString();
      }
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {}
}

// ==========================================
// 4. ORGANIZATION SETTINGS & NUMBERING
// ==========================================

export function getOrganizationSettings(organizationId: string = 'demo-corp'): OrganizationSettings {
  try {
    const saved = localStorage.getItem(ORG_SETTINGS_KEY + '_' + organizationId);
    if (saved) return JSON.parse(saved);
  } catch {}

  return {
    organizationId,
    companyName: 'AZERBAIJAN DIGITAL SOLUTIONS QSC',
    voen: '1400234561',
    logoUrl: '',
    address: 'Bakı şəhəri, Nizami küçəsi 142, Blok B',
    directorName: 'Məmmədov Rauf Kamran oğlu',
    hrLeadName: 'Həsənova Nigar Vaqif qızı',
    numberingPrefix: 'HR',
    nextSequenceNumber: 42,
    departments: [
      'İnformasiya Texnologiyaları',
      'İnsan Resursları və Kadrlar',
      'Maliyyə və Mühasibatlıq',
      'Satış və Biznesin İnkişafı',
      'Marketinq və İctimaiyyətlə Əlaqələr',
      'Hüquq və Komplayens',
      'İnzibati və Təsərrüfat'
    ],
    positions: [
      'Departament Rəhbəri',
      'Baş Mütəxəssis',
      'Aparıcı Mühəndis',
      'Kiçik Mütəxəssis',
      'HR Menecer',
      'Mühasib',
      'Layihə Rəhbəri'
    ],
    monetizationPlan: 'business',
    aiMonthlyQuota: 250,
    aiUsageThisMonth: 18,
  };
}

export function saveOrganizationSettings(settings: OrganizationSettings) {
  try {
    localStorage.setItem(ORG_SETTINGS_KEY + '_' + settings.organizationId, JSON.stringify(settings));
    logAuditEvent(
      settings.organizationId,
      'current-user',
      'HR Administrator',
      'Müəssisə sənəd parametrləri yeniləndi',
      'template',
      settings.organizationId
    );
  } catch {}
}

function getNextDocumentNumber(organizationId: string): string {
  const settings = getOrganizationSettings(organizationId);
  const seq = settings.nextSequenceNumber || 1;
  const year = new Date().getFullYear();
  const formattedSeq = String(seq).padStart(3, '0');
  const docNumber = `№ ${settings.numberingPrefix || 'HR'}-${year}/${formattedSeq}`;

  // Increment sequence
  settings.nextSequenceNumber = seq + 1;
  saveOrganizationSettings(settings);

  return docNumber;
}

// ==========================================
// 5. AUDIT LOGS SERVICE
// ==========================================

export function logAuditEvent(
  organizationId: string,
  actorUserId: string,
  actorName: string,
  action: string,
  entityType: 'template' | 'submission' | 'document' | 'signature' | 'approval',
  entityId: string,
  metadata?: Record<string, any>
) {
  const audit: SmartFormsAuditLog = {
    id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    organizationId,
    actorUserId,
    actorName,
    action,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
    metadata,
  };

  try {
    const saved = localStorage.getItem(AUDITS_STORAGE_KEY);
    const list: SmartFormsAuditLog[] = saved ? JSON.parse(saved) : [];
    localStorage.setItem(AUDITS_STORAGE_KEY, JSON.stringify([audit, ...list].slice(0, 500)));
  } catch {}
}

export function getAuditLogs(organizationId?: string): SmartFormsAuditLog[] {
  try {
    const saved = localStorage.getItem(AUDITS_STORAGE_KEY);
    if (!saved) return getInitialDemoAuditLogs();
    const list: SmartFormsAuditLog[] = JSON.parse(saved);
    if (!organizationId) return list;
    return list.filter(l => l.organizationId === organizationId || l.organizationId === 'demo-corp');
  } catch {
    return getInitialDemoAuditLogs();
  }
}

// ==========================================
// 6. INITIAL DEMO DATA FOR RICH OUT-OF-THE-BOX EXPERIENCE
// ==========================================

function getInitialDemoSubmissions(): FormSubmission[] {
  return [
    {
      id: 'sub-demo-1',
      organizationId: 'demo-corp',
      organizationName: 'AZERBAIJAN DIGITAL SOLUTIONS QSC',
      templateId: 'tmpl-labor-vacation-paid',
      templateTitle: 'Əmək Məzuniyyəti Ərizəsi',
      templateCategory: 'labor_relations',
      templateVersion: 1,
      submittedByUserId: 'usr-101',
      submittedByName: 'Fərid Qasımov',
      submittedByEmail: 'farid.gasimov@jobia.az',
      submittedByPhone: '+994 50 234 56 78',
      submittedByDepartment: 'İnformasiya Texnologiyaları',
      submittedByPosition: 'Senior React Developer',
      formData: {
        full_name: 'Qasımov Fərid Rəşad oğlu',
        department: 'İnformasiya Texnologiyaları',
        position: 'Senior React Developer',
        start_date: '2026-07-01',
        calendar_days: 14,
        substitute_person: 'Elvin Rzayev',
        contact_phone: '+994 50 234 56 78',
      },
      currentStatus: 'pending_approval',
      statusHistory: [
        {
          status: 'pending_approval',
          changedByUserId: 'usr-101',
          changedByName: 'Fərid Qasımov',
          changedAt: '2026-06-15T09:30:00Z',
          comment: 'Ərizə doldurulub rəhbərin təsdiqinə göndərildi',
        },
      ],
      completionMode: 'voice',
      createdAt: '2026-06-15T09:30:00Z',
      updatedAt: '2026-06-15T09:30:00Z',
    },
    {
      id: 'sub-demo-2',
      organizationId: 'demo-corp',
      organizationName: 'AZERBAIJAN DIGITAL SOLUTIONS QSC',
      templateId: 'tmpl-labor-salary-certificate',
      templateTitle: 'Əməkhaqqı və İş Yerindən Arayış Müraciəti',
      templateCategory: 'labor_relations',
      templateVersion: 1,
      submittedByUserId: 'usr-102',
      submittedByName: 'Aygün Həsənova',
      submittedByEmail: 'aygun.hasanova@jobia.az',
      submittedByDepartment: 'Maliyyə və Mühasibatlıq',
      submittedByPosition: 'Aparıcı Mühasib',
      formData: {
        full_name: 'Həsənova Aygün Elman qızı',
        position: 'Aparıcı Mühasib (Maliyyə şöbəsi)',
        institution_target: 'Kapital Bank ASC (İpoteka müraciəti)',
        certificate_type: 'İş yeri və son 6 aylıq gəlir arayışı',
        certificate_language: 'Azərbaycan dili',
        purpose_note: 'Mənzil krediti üçün rəsmi gəlir sənədi',
      },
      currentStatus: 'completed',
      statusHistory: [
        { status: 'pending_review', changedByUserId: 'usr-102', changedByName: 'Aygün Həsənova', changedAt: '2026-06-10T11:00:00Z' },
        { status: 'completed', changedByUserId: 'usr-hr', changedByName: 'HR Administrator', changedAt: '2026-06-10T14:15:00Z', comment: 'Rəsmi möhürlə təsdiqləndi və PDF təqdim olundu' },
      ],
      completionMode: 'standard',
      createdAt: '2026-06-10T11:00:00Z',
      updatedAt: '2026-06-10T14:15:00Z',
    },
    {
      id: 'sub-demo-3',
      organizationId: 'demo-corp',
      organizationName: 'AZERBAIJAN DIGITAL SOLUTIONS QSC',
      templateId: 'tmpl-labor-advance-payment',
      templateTitle: 'Əməkhaqqından Avans Verilməsi Müraciəti',
      templateCategory: 'labor_relations',
      templateVersion: 1,
      submittedByUserId: 'usr-103',
      submittedByName: 'Samir Əliyev',
      submittedByEmail: 'samir.aliyev@jobia.az',
      submittedByDepartment: 'Satış və Biznesin İnkişafı',
      submittedByPosition: 'Korporativ Satış Meneceri',
      formData: {
        full_name: 'Əliyev Samir Kamran oğlu',
        position: 'Satış Meneceri',
        advance_amount: 450,
        advance_reason: 'Təxirəsalınmaz ailə tibbi xərcləri',
      },
      currentStatus: 'signed',
      statusHistory: [
        { status: 'pending_approval', changedByUserId: 'usr-103', changedByName: 'Samir Əliyev', changedAt: '2026-06-12T15:00:00Z' },
        { status: 'signed', changedByUserId: 'usr-103', changedByName: 'Samir Əliyev', changedAt: '2026-06-13T10:00:00Z', comment: 'Elektron imza ilə təsdiqləndi' },
      ],
      completionMode: 'ai_interview',
      createdAt: '2026-06-12T15:00:00Z',
      updatedAt: '2026-06-13T10:00:00Z',
    },
  ];
}

function getInitialDemoAuditLogs(): SmartFormsAuditLog[] {
  return [
    {
      id: 'aud-demo-1',
      organizationId: 'demo-corp',
      actorUserId: 'usr-101',
      actorName: 'Fərid Qasımov',
      action: 'Yeni ərizə müraciəti təqdim edildi: Əmək Məzuniyyəti Ərizəsi',
      entityType: 'submission',
      entityId: 'sub-demo-1',
      timestamp: '2026-06-15T09:30:00Z',
    },
    {
      id: 'aud-demo-2',
      organizationId: 'demo-corp',
      actorUserId: 'usr-hr',
      actorName: 'Nigar Həsənova (HR)',
      action: 'Arayış təsdiqləndi və tamamlandı: № HR-2026/039',
      entityType: 'document',
      entityId: 'doc-demo-2',
      timestamp: '2026-06-10T14:15:00Z',
    },
  ];
}
