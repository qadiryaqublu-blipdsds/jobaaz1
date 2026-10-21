import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Building2, 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye, 
  Sparkles,
  Lock,
  History,
  ArrowRight,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { 
  CompanyTeamMember, 
  CompanyRole, 
  COMPANY_ROLE_METADATA, 
  getCompanyTeamMembers, 
  addCompanyTeamMember, 
  updateMemberStatus, 
  deleteMember,
  getCompanyAuditLogs,
  GranularPermissions
} from '../../services/companyTeamService';
import { Company, User } from '../../types';
import { safeAlert, safeConfirm } from '../../utils/dialogHelper';

interface CompanyTeamManagementTabProps {
  activeCompany: Company;
  currentUser?: User | null;
  onCompanySwitch?: (company: Company) => void;
  availableCompanies?: Company[];
}

export const CompanyTeamManagementTab: React.FC<CompanyTeamManagementTabProps> = ({
  activeCompany,
  currentUser,
  onCompanySwitch,
  availableCompanies = []
}) => {
  const [members, setMembers] = useState<CompanyTeamMember[]>(() =>
    getCompanyTeamMembers(activeCompany.id, activeCompany.name)
  );
  const [auditLogs, setAuditLogs] = useState(() => getCompanyAuditLogs(activeCompany.id));
  const [activeSubView, setActiveSubView] = useState<'members' | 'audit' | 'permissions'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  
  // Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('İnsan Resursları Departamenti');
  const [newRole, setNewRole] = useState<CompanyRole>('recruiter');

  // Simulated Active Role (Allows HR Admin to preview what a Recruiter or Dept Head sees)
  const [simulatedRole, setSimulatedRole] = useState<CompanyRole>('company_admin');

  const filteredMembers = members.filter((m) => {
    if (selectedRoleFilter !== 'all' && m.role !== selectedRoleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.jobTitle.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim() || !newJobTitle.trim()) {
      safeAlert('Zəhmət olmasa tələb olunan sahələri doldurun.');
      return;
    }

    try {
      const created = addCompanyTeamMember({
        companyId: activeCompany.id,
        companyName: activeCompany.name,
        fullName: newFullName,
        email: newEmail,
        phone: newPhone,
        jobTitle: newJobTitle,
        department: newDepartment,
        role: newRole,
        invitedBy: currentUser?.fullName || 'Şirkət Rəhbəri'
      });

      setMembers(getCompanyTeamMembers(activeCompany.id, activeCompany.name));
      setAuditLogs(getCompanyAuditLogs(activeCompany.id));
      setIsInviteModalOpen(false);

      // Reset form
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewJobTitle('');
      safeAlert(`"${created.fullName}" uğurla komandaya əlavə edildi və icazələri aktivləşdirildi.`);
    } catch (err: any) {
      safeAlert(err.message || 'Xəta baş verdi');
    }
  };

  const handleToggleStatus = (member: CompanyTeamMember) => {
    const nextStatus = member.status === 'active' ? 'suspended' : 'active';
    updateMemberStatus(activeCompany.id, member.id, nextStatus);
    setMembers(getCompanyTeamMembers(activeCompany.id, activeCompany.name));
  };

  const handleDelete = (member: CompanyTeamMember) => {
    if (safeConfirm(`"${member.fullName}" əməkdaşını şirkət komandasından silmək istədiyinizə əminsiniz?`)) {
      deleteMember(activeCompany.id, member.id);
      setMembers(getCompanyTeamMembers(activeCompany.id, activeCompany.name));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Company Context & Role Preview Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900">
                  {activeCompany.name} • Komanda və İstifadəçi Rolları
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  Çoxistifadəçili Sistem (RBAC)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Şirkət daxilində HR direktoru, rekruterlər və şöbə rəhbərlərinin hüquqlarının, vakansiya icazələrinin və fəaliyyət tarixçəsinin mərkəzləşdirilmiş idarəsi.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Yeni İstifadəçi Əlavə Et</span>
            </button>
          </div>
        </div>

        {/* Multi-Company Switcher if available */}
        {availableCompanies.length > 1 && onCompanySwitch && (
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>İdarə Edilən Müəssisələr Arasında Keçid:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {availableCompanies.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => onCompanySwitch(comp)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    comp.id === activeCompany.id
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {comp.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sub-view tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-xs font-bold">
          <button
            onClick={() => setActiveSubView('members')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubView === 'members'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            İstifadəçilər ({members.length})
          </button>
          <button
            onClick={() => setActiveSubView('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubView === 'audit'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fəaliyyət Tarixçəsi & Audit Log
          </button>
          <button
            onClick={() => setActiveSubView('permissions')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubView === 'permissions'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rollar & İcazələr Matrisi
          </button>
        </div>
      </div>

      {/* VIEW 1: TEAM MEMBERS LIST */}
      {activeSubView === 'members' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ad, e-poçt, vəzifə və ya şöbə üzrə axtarış..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">Bütün Rollar</option>
              <option value="company_admin">Şirkət Administratoru</option>
              <option value="hr_director">HR Direktoru</option>
              <option value="hr_manager">HR Meneceri</option>
              <option value="recruiter">Recruiter</option>
              <option value="department_head">Şöbə Rəhbəri</option>
              <option value="reports_viewer">Hesabat İstifadəçisi</option>
            </select>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Əməkdaş</th>
                    <th className="px-4 py-3">Vəzifə & Şöbə</th>
                    <th className="px-4 py-3">Təyin Edilmiş Rol</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Son Fəallıq</th>
                    <th className="px-4 py-3 text-right">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredMembers.map((member) => {
                    const roleMeta = COMPANY_ROLE_METADATA[member.role] || COMPANY_ROLE_METADATA.recruiter;
                    return (
                      <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.fullName}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {member.fullName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <strong className="text-slate-900 block font-bold">{member.fullName}</strong>
                              <span className="text-[11px] text-slate-500 font-normal">{member.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-slate-800 font-semibold block">{member.jobTitle}</span>
                          <span className="text-[11px] text-slate-500">{member.department}</span>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleMeta.badgeColor}`}>
                            {roleMeta.title}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatus(member)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              member.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {member.status === 'active' ? 'Aktiv' : 'Dayandırılıb'}
                          </button>
                        </td>

                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleDateString('az-AZ') : 'İlkin qeydiyyat'}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDelete(member)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AUDIT LOG */}
      {activeSubView === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-purple-600" />
              <span>Komanda Əməliyyatlarının Tarixçəsi (Fəaliyyət Jurnalı)</span>
            </h3>
            <span className="text-xs text-slate-500">
              Cəmi qeyd: <strong>{auditLogs.length}</strong>
            </span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 font-bold">{log.userName}</strong>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      {COMPANY_ROLE_METADATA[log.userRole]?.title || log.userRole}
                    </span>
                    {log.entityName && (
                      <span className="text-purple-700 font-semibold">• {log.entityName}</span>
                    )}
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>

                <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                  {new Date(log.timestamp).toLocaleDateString('az-AZ')} {new Date(log.timestamp).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: PERMISSIONS MATRIX */}
      {activeSubView === 'permissions' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs overflow-x-auto">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              İcazələr və Rollar Səlahiyyət Matrisi
            </h3>
            <p className="text-xs text-slate-500">
              Hər bir rolun platforma daxilində hansı funksiyaları icra edə biləcəyinin müqayisəli cədvəli.
            </p>
          </div>

          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="p-3">Səlahiyyət / Əməliyyat</th>
                <th className="p-3 text-center">Şirkət Admin</th>
                <th className="p-3 text-center">HR Direktor</th>
                <th className="p-3 text-center">HR Menecer</th>
                <th className="p-3 text-center">Recruiter</th>
                <th className="p-3 text-center">Şöbə Rəhbəri</th>
                <th className="p-3 text-center">Hesabat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="p-3 font-semibold text-slate-900">Vakansiya Yaratmaq və Dərc Etmək</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Namizədlərə Baxış və Status Dəyişmə</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-slate-300">Yalnız Baxış</td>
                <td className="p-3 text-center text-slate-300">✗</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Müsahibə Təyin Etmə və 24h Xatırlatma</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-slate-300">✗</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Rəsmi İş Təklifi (Job Offer) Təsdiqi</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Komanda Üzvlərini İdarə Etmək və Dəvət</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Paketlər və Ödəniş Balansını İdarə Etmə</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
                <td className="p-3 text-center text-slate-300">✗</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* INVITE TEAM MEMBER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <span>Yeni İstifadəçi Əlavə Et</span>
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Ad və Soyad *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Məs: Rauf Əliyev"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">İş E-poçtu *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="rauf@company.az"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Əlaqə Telefonu</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+994 50 123 45 67"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vəzifə Adı *</label>
                  <input
                    type="text"
                    required
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="Məs: HR Meneceri"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Şöbə / Departament</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="İnsan Resursları"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Təyin Ediləcək Rol *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as CompanyRole)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="company_admin">Şirkət Administratoru (Tam Hüquqlu)</option>
                  <option value="hr_director">HR Direktoru (Təsdiqlər & Analitika)</option>
                  <option value="hr_manager">HR Meneceri (Vakansiya & Müsahibələr)</option>
                  <option value="recruiter">Recruiter (Namizədlərlə İş)</option>
                  <option value="department_head">Şöbə Rəhbəri (Namizədlərə Rəy)</option>
                  <option value="reports_viewer">Hesabat İstifadəçisi (Yalnız Analitika)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {COMPANY_ROLE_METADATA[newRole]?.description}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  İstifadəçini Əlavə Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
