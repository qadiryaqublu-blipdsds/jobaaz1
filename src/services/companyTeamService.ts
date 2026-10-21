/**
 * Company Multi-User, Role-Based Access Control (RBAC) & Team Audit Trail
 * Specification Section 5 & Section 82: Bir şirkət daxilində bir neçə istifadəçi
 */

export type CompanyRole = 
  | 'company_admin'       // Şirkət administratoru
  | 'hr_director'         // HR direktoru
  | 'hr_manager'          // HR meneceri
  | 'recruiter'           // Recruiter (İşə qəbul mütəxəssisi)
  | 'department_head'     // Şöbə rəhbəri
  | 'reports_viewer'      // Hesabat istifadəçisi
  | 'custom_limited';     // Məhdud fərdi istifadəçi

export interface GranularPermissions {
  canViewJobs: boolean;
  canCreateJobs: boolean;
  canEditJobs: boolean;
  canDeleteJobs: boolean;
  canViewApplicants: boolean;
  canChangeApplicantStatus: boolean;
  canScheduleInterviews: boolean;
  canCreateJobOffers: boolean;
  canApproveJobOffers: boolean;
  canAccessCVPool: boolean;
  canImportBulkCVs: boolean;
  canViewAnalytics: boolean;
  canExportReports: boolean;
  canManageTeam: boolean;
  canManageBilling: boolean;
}

export interface CompanyTeamMember {
  id: string;
  companyId: string;
  companyName: string;
  fullName: string;
  email: string;
  phone?: string;
  jobTitle: string; // e.g. "Baş HR Mütəxəssis", "İT Departament Rəhbəri"
  department: string;
  role: CompanyRole;
  permissions: GranularPermissions;
  status: 'active' | 'suspended' | 'invited';
  avatarUrl?: string;
  assignedJobIds?: string[];
  invitedBy?: string;
  createdAt: string;
  lastActiveAt?: string;
}

export interface CompanyAuditLogItem {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  userRole: CompanyRole;
  actionType: 
    | 'job_created'
    | 'job_updated'
    | 'job_status_changed'
    | 'applicant_status_changed'
    | 'interview_scheduled'
    | 'offer_created'
    | 'offer_approved'
    | 'cv_imported'
    | 'team_member_invited'
    | 'team_role_changed'
    | 'permissions_updated';
  entityId?: string;
  entityName?: string;
  details: string;
  timestamp: string;
}

export const COMPANY_ROLE_METADATA: Record<CompanyRole, { title: string; badgeColor: string; description: string; defaultPermissions: GranularPermissions }> = {
  company_admin: {
    title: 'Şirkət Administratoru',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Bütün şirkət funksiyaları, komanda üzvləri, icazələr, paketlər və ödənişlər üzərində tam səlahiyyət.',
    defaultPermissions: {
      canViewJobs: true, canCreateJobs: true, canEditJobs: true, canDeleteJobs: true,
      canViewApplicants: true, canChangeApplicantStatus: true, canScheduleInterviews: true,
      canCreateJobOffers: true, canApproveJobOffers: true, canAccessCVPool: true,
      canImportBulkCVs: true, canViewAnalytics: true, canExportReports: true,
      canManageTeam: true, canManageBilling: true
    }
  },
  hr_director: {
    title: 'HR Direktoru',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Vakansiyaların təsdiqi, namizədlər, işə qəbul prosesi və strateji analitik hesabatlar.',
    defaultPermissions: {
      canViewJobs: true, canCreateJobs: true, canEditJobs: true, canDeleteJobs: false,
      canViewApplicants: true, canChangeApplicantStatus: true, canScheduleInterviews: true,
      canCreateJobOffers: true, canApproveJobOffers: true, canAccessCVPool: true,
      canImportBulkCVs: true, canViewAnalytics: true, canExportReports: true,
      canManageTeam: false, canManageBilling: false
    }
  },
  hr_manager: {
    title: 'HR Meneceri',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Vakansiyaların yaradılması, CV bazasında axtarış, müraciətlər və müsahibə mərhələləri.',
    defaultPermissions: {
      canViewJobs: true, canCreateJobs: true, canEditJobs: true, canDeleteJobs: false,
      canViewApplicants: true, canChangeApplicantStatus: true, canScheduleInterviews: true,
      canCreateJobOffers: true, canApproveJobOffers: false, canAccessCVPool: true,
      canImportBulkCVs: true, canViewAnalytics: true, canExportReports: true,
      canManageTeam: false, canManageBilling: false
    }
  },
  recruiter: {
    title: 'Recruiter (İşə qəbul üzrə mütəxəssis)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Təyin olunmuş vakansiyalar üzrə namizədlərlə ilkin əlaqə, skrininq və müsahibələrin təşkili.',
    defaultPermissions: {
      canViewJobs: true, canCreateJobs: false, canEditJobs: false, canDeleteJobs: false,
      canViewApplicants: true, canChangeApplicantStatus: true, canScheduleInterviews: true,
      canCreateJobOffers: false, canApproveJobOffers: false, canAccessCVPool: true,
      canImportBulkCVs: false, canViewAnalytics: false, canExportReports: false,
      canManageTeam: false, canManageBilling: false
    }
  },
  department_head: {
    title: 'Şöbə Rəhbəri (Hiring Manager)',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Öz şöbəsinə aid vakansiyalara təqdim edilən namizədləri nəzərdən keçirmə və rəy bildirmə.',
    defaultPermissions: {
      canViewJobs: true, canCreateJobs: false, canEditJobs: false, canDeleteJobs: false,
      canViewApplicants: true, canChangeApplicantStatus: false, canScheduleInterviews: true,
      canCreateJobOffers: false, canApproveJobOffers: false, canAccessCVPool: false,
      canImportBulkCVs: false, canViewAnalytics: false, canExportReports: false,
      canManageTeam: false, canManageBilling: false
    }
  },
  reports_viewer: {
    title: 'Hesabat İstifadəçisi',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    description: 'İcazə verilmiş HR analitikası, Time-to-Fill qrafikləri və hesabatların ixracı (Yalnız baxış).',
    defaultPermissions: {
      canViewJobs: true, canCreateJobs: false, canEditJobs: false, canDeleteJobs: false,
      canViewApplicants: false, canChangeApplicantStatus: false, canScheduleInterviews: false,
      canCreateJobOffers: false, canApproveJobOffers: false, canAccessCVPool: false,
      canImportBulkCVs: false, canViewAnalytics: true, canExportReports: true,
      canManageTeam: false, canManageBilling: false
    }
  },
  custom_limited: {
    title: 'Məhdud Fərdi İstifadəçi',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Şirkət administratoru tərəfindən xüsusi seçilmiş konkret hüquq və səlahiyyətlər.',
    defaultPermissions: {
      canViewJobs: true, canCreateJobs: false, canEditJobs: false, canDeleteJobs: false,
      canViewApplicants: true, canChangeApplicantStatus: false, canScheduleInterviews: false,
      canCreateJobOffers: false, canApproveJobOffers: false, canAccessCVPool: false,
      canImportBulkCVs: false, canViewAnalytics: false, canExportReports: false,
      canManageTeam: false, canManageBilling: false
    }
  }
};

const TEAM_STORAGE_KEY_PREFIX = 'jobia_company_team_';
const AUDIT_STORAGE_KEY_PREFIX = 'jobia_company_audit_';

export function getCompanyTeamMembers(companyId: string, companyName?: string): CompanyTeamMember[] {
  try {
    const raw = localStorage.getItem(`${TEAM_STORAGE_KEY_PREFIX}${companyId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // Initial authentic multi-user seed for demo
  const initialMembers: CompanyTeamMember[] = [
    {
      id: `member-${companyId}-admin`,
      companyId,
      companyName: companyName || 'Müəssisə',
      fullName: 'Aynur Məmmədova',
      email: 'aynur.m@company.az',
      phone: '+994 50 211 44 55',
      jobTitle: 'İnsan Resursları Direktoru',
      department: 'İnsan Resursları Departamenti',
      role: 'company_admin',
      permissions: COMPANY_ROLE_METADATA.company_admin.defaultPermissions,
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-08-01T09:00:00Z',
      lastActiveAt: '2026-10-21T07:45:00Z'
    },
    {
      id: `member-${companyId}-recruiter`,
      companyId,
      companyName: companyName || 'Müəssisə',
      fullName: 'Tural Əliyev',
      email: 'tural.recruiter@company.az',
      phone: '+994 55 890 12 34',
      jobTitle: 'Baş Rekruter / Talent Acquisition',
      department: 'İnsan Resursları Departamenti',
      role: 'recruiter',
      permissions: COMPANY_ROLE_METADATA.recruiter.defaultPermissions,
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-08-15T11:00:00Z',
      lastActiveAt: '2026-10-21T06:30:00Z'
    },
    {
      id: `member-${companyId}-head`,
      companyId,
      companyName: companyName || 'Müəssisə',
      fullName: 'Samir Cəfərov',
      email: 'samir.it@company.az',
      phone: '+994 70 345 67 89',
      jobTitle: 'İnformasiya Texnologiyaları Rəhbəri',
      department: 'İT və Proqram Təminatı',
      role: 'department_head',
      permissions: COMPANY_ROLE_METADATA.department_head.defaultPermissions,
      status: 'active',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-09-01T14:20:00Z',
      lastActiveAt: '2026-10-20T16:10:00Z'
    }
  ];

  saveCompanyTeamMembers(companyId, initialMembers);
  return initialMembers;
}

export function saveCompanyTeamMembers(companyId: string, members: CompanyTeamMember[]): void {
  try {
    localStorage.setItem(`${TEAM_STORAGE_KEY_PREFIX}${companyId}`, JSON.stringify(members));
  } catch (err) {
    console.warn('Failed to save company team members', err);
  }
}

export function addCompanyTeamMember(params: {
  companyId: string;
  companyName: string;
  fullName: string;
  email: string;
  phone?: string;
  jobTitle: string;
  department: string;
  role: CompanyRole;
  customPermissions?: Partial<GranularPermissions>;
  invitedBy?: string;
}): CompanyTeamMember {
  const members = getCompanyTeamMembers(params.companyId, params.companyName);
  
  const roleMeta = COMPANY_ROLE_METADATA[params.role] || COMPANY_ROLE_METADATA.recruiter;
  const permissions: GranularPermissions = {
    ...roleMeta.defaultPermissions,
    ...(params.customPermissions || {})
  };

  const newMember: CompanyTeamMember = {
    id: `member-${Date.now()}`,
    companyId: params.companyId,
    companyName: params.companyName,
    fullName: params.fullName,
    email: params.email,
    phone: params.phone,
    jobTitle: params.jobTitle,
    department: params.department,
    role: params.role,
    permissions,
    status: 'active',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.fullName)}`,
    invitedBy: params.invitedBy,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  members.push(newMember);
  saveCompanyTeamMembers(params.companyId, members);

  // Record audit trail
  logCompanyAuditAction({
    companyId: params.companyId,
    userId: params.invitedBy || 'admin',
    userName: params.invitedBy ? 'Admin' : 'Şirkət Rəhbəri',
    userRole: 'company_admin',
    actionType: 'team_member_invited',
    entityId: newMember.id,
    entityName: newMember.fullName,
    details: `Yeni komanda üzvü əlavə edildi: ${newMember.fullName} (${roleMeta.title}, ${newMember.department})`
  });

  return newMember;
}

export function updateMemberStatus(companyId: string, memberId: string, newStatus: 'active' | 'suspended'): void {
  const members = getCompanyTeamMembers(companyId);
  const target = members.find((m) => m.id === memberId);
  if (target) {
    target.status = newStatus;
    saveCompanyTeamMembers(companyId, members);
  }
}

export function deleteMember(companyId: string, memberId: string): void {
  const members = getCompanyTeamMembers(companyId);
  const filtered = members.filter((m) => m.id !== memberId);
  saveCompanyTeamMembers(companyId, filtered);
}

export function getCompanyAuditLogs(companyId: string): CompanyAuditLogItem[] {
  try {
    const raw = localStorage.getItem(`${AUDIT_STORAGE_KEY_PREFIX}${companyId}`);
    if (raw) return JSON.parse(raw);
  } catch {}

  const defaultLogs: CompanyAuditLogItem[] = [
    {
      id: 'audit-01',
      companyId,
      userId: 'user-01',
      userName: 'Aynur Məmmədova',
      userRole: 'company_admin',
      actionType: 'job_created',
      entityName: 'Senior React Mühəndisi',
      details: 'Vakansiya yaradıldı və yayıma göndərildi (Maaş: 3000 - 3800 AZN)',
      timestamp: '2026-10-20T11:40:00Z'
    },
    {
      id: 'audit-02',
      companyId,
      userId: 'user-02',
      userName: 'Tural Əliyev',
      userRole: 'recruiter',
      actionType: 'applicant_status_changed',
      entityName: 'Kamran Məmmədli',
      details: 'Namizədin statusu "Baxıldı" mərhələsindən "Müsahibəyə dəvət" statusuna keçirildi',
      timestamp: '2026-10-20T14:15:00Z'
    },
    {
      id: 'audit-03',
      companyId,
      userId: 'user-01',
      userName: 'Aynur Məmmədova',
      userRole: 'company_admin',
      actionType: 'offer_created',
      entityName: 'Fərid Əsədov',
      details: 'Rəsmi A4 PDF İş Təklifi (Job Offer) sənədi hazırlandı və təsdiqə göndərildi',
      timestamp: '2026-10-21T06:50:00Z'
    }
  ];

  return defaultLogs;
}

export function logCompanyAuditAction(params: Omit<CompanyAuditLogItem, 'id' | 'timestamp'>): CompanyAuditLogItem {
  const item: CompanyAuditLogItem = {
    ...params,
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString()
  };

  try {
    const logs = getCompanyAuditLogs(params.companyId);
    logs.unshift(item);
    localStorage.setItem(`${AUDIT_STORAGE_KEY_PREFIX}${params.companyId}`, JSON.stringify(logs.slice(0, 300)));
  } catch (err) {
    console.warn('Failed to log company audit action', err);
  }

  return item;
}
