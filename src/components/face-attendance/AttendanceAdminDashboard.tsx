import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  FileText, 
  Camera, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Building2, 
  Sparkles, 
  Lock, 
  Eye, 
  RotateCcw,
  Check,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { 
  AttendanceRecord, 
  AttendanceEmployee, 
  WorkSite, 
  AttendanceCorrection 
} from '../../types/attendance';
import { 
  getStoredAttendanceRecords, 
  getStoredAttendanceEmployees, 
  getStoredWorkSites, 
  exportAttendanceToCSV, 
  addAttendanceCorrection, 
  purgeEmployeeBiometrics,
  getStoredAttendanceCorrections
} from '../../services/faceAttendanceService';
import { FaceEnrollmentModal } from './FaceEnrollmentModal';
import { safeAlert, safeConfirm } from '../../utils/dialogHelper';

interface AttendanceAdminDashboardProps {
  onOpenPWAScanner: () => void;
}

export const AttendanceAdminDashboard: React.FC<AttendanceAdminDashboardProps> = ({
  onOpenPWAScanner
}) => {
  // State
  const [records, setRecords] = useState<AttendanceRecord[]>(() => getStoredAttendanceRecords());
  const [employees, setEmployees] = useState<AttendanceEmployee[]>(() => getStoredAttendanceEmployees());
  const sites = useMemo(() => getStoredWorkSites(), []);
  const [corrections, setCorrections] = useState<AttendanceCorrection[]>(() => getStoredAttendanceCorrections());

  // Filter States
  const [selectedTab, setSelectedTab] = useState<'daily' | 'suspicious' | 'employees' | 'corrections' | 'tabel'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('ALL');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('ALL');

  // Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<AttendanceEmployee | null>(null);

  // Correction Modal State
  const [selectedRecordForCorrection, setSelectedRecordForCorrection] = useState<AttendanceRecord | null>(null);
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctedEventType, setCorrectedEventType] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');

  // Audit Thumbnail Inspect Modal
  const [inspectAuditThumbnail, setInspectAuditThumbnail] = useState<{ url: string; name: string; score: number } | null>(null);

  // Departments List
  const departments = useMemo(() => {
    const set = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(set);
  }, [employees]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedSiteFilter !== 'ALL' && r.workSiteId !== selectedSiteFilter) return false;
      if (selectedDepartmentFilter !== 'ALL' && r.employeeDepartment !== selectedDepartmentFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = r.employeeName.toLowerCase().includes(query);
        const matchDept = r.employeeDepartment.toLowerCase().includes(query);
        if (!matchName && !matchDept) return false;
      }
      return true;
    });
  }, [records, selectedSiteFilter, selectedDepartmentFilter, searchQuery]);

  // Suspicious Records Only
  const suspiciousRecords = useMemo(() => {
    return filteredRecords.filter(r => r.isSuspicious);
  }, [filteredRecords]);

  // Daily Metrics
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.serverTimestamp.startsWith(todayStr));
    const uniqueCheckedIn = new Set(todayRecords.filter(r => r.eventType === 'CHECK_IN').map(r => r.employeeId));
    const suspiciousCount = todayRecords.filter(r => r.isSuspicious).length;

    return {
      totalEmployees: employees.length,
      presentToday: uniqueCheckedIn.size,
      absentToday: Math.max(0, employees.length - uniqueCheckedIn.size),
      suspiciousToday: suspiciousCount
    };
  }, [records, employees]);

  // Handle Manual Correction Submission
  const handleSaveCorrection = () => {
    if (!selectedRecordForCorrection) return;
    if (!correctionReason.trim()) {
      safeAlert('Düzəliş səbəbini daxil etmək məcburidir (Audit tələbi).');
      return;
    }

    const newCorrection: AttendanceCorrection = {
      id: `corr-${Date.now()}`,
      attendanceRecordId: selectedRecordForCorrection.id,
      employeeId: selectedRecordForCorrection.employeeId,
      employeeName: selectedRecordForCorrection.employeeName,
      originalEventType: selectedRecordForCorrection.eventType,
      correctedEventType,
      originalTime: selectedRecordForCorrection.serverTimestamp,
      correctedTime: new Date().toISOString(),
      reason: correctionReason,
      correctedByUserId: 'hr-director-01',
      correctedByName: 'HR Direktoru (Səlahiyyətli)',
      createdAt: new Date().toISOString()
    };

    addAttendanceCorrection(newCorrection);
    setRecords(getStoredAttendanceRecords());
    setCorrections(getStoredAttendanceCorrections());
    setSelectedRecordForCorrection(null);
    setCorrectionReason('');
    safeAlert('Davamiyyət qeydinə əl ilə düzəliş edildi və dəyişməz audit jurnalına yazıldı.');
  };

  // Handle Right to be Forgotten (Purge Biometrics)
  const handlePurgeBiometrics = (emp: AttendanceEmployee) => {
    const confirmPurge = safeConfirm(
      `DİQQƏT: ${emp.firstName} ${emp.lastName} üçün biometrik üz şablonunun və razılığın sistemdən birdəfəlik silinməsini təsdiq edirsiniz? (AR "Fərdi məlumatlar haqqında" Qanununun tələbi üzrə unudulma hüququ).`
    );
    if (!confirmPurge) return;

    purgeEmployeeBiometrics(emp.id, 'İşçinin öz hüquqi tələbi və ya əmək müqaviləsinə xitam');
    setEmployees(getStoredAttendanceEmployees());
    safeAlert(`${emp.firstName} ${emp.lastName} adlı işçinin biometrik vektorları bazadan silindi.`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER BANNER & ACTION BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>Üz Tanıma ilə Davamiyyət (Face Attendance) • Enterprise</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Davamiyyət İdarəetmə & Tabel Paneli</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Turniket və barmaq izi cihazlarını əvəz edən süni intellekt əsaslı aktiv liveness, geofence nəzarəti və dövlət standartlı tabel uçotu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenPWAScanner}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>Kamera / Skan Rejimini Aç</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingEmployee(null);
                setIsEnrollModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni İşçi Qeydiyyatı (Enroll)</span>
            </button>

            <button
              type="button"
              onClick={() => exportAttendanceToCSV(filteredRecords)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Excel/CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS & KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Cəmi Qeydiyyatlı İşçi</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.totalEmployees}</span>
            <span className="text-[11px] text-emerald-400 font-bold">100% biometrik aktiv</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Bu gün İşdə Olanlar</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{metrics.presentToday}</span>
            <span className="text-[11px] text-slate-400">işçi daxil olub</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Gəlməyənlər</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{metrics.absentToday}</span>
            <span className="text-[11px] text-slate-400">bu gün qeydi yoxdur</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Şübhəli Qeydlər</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-400">{metrics.suspiciousToday}</span>
            <span className="text-[11px] text-red-400/80 font-bold">yoxlama tələb edir</span>
          </div>
        </div>
      </div>

      {/* 3. TABS & FILTER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setSelectedTab('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedTab === 'daily'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gündəlik Qeydlər ({filteredRecords.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('suspicious')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedTab === 'suspicious'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Şübhəli Hallar</span>
            {suspiciousRecords.length > 0 && (
              <span className="px-1.5 py-0.2 bg-red-400 text-slate-950 font-black text-[10px] rounded-full">
                {suspiciousRecords.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('employees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedTab === 'employees'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            İşçi Reyestri & Razılıqlar ({employees.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('tabel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedTab === 'tabel'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rəsmi Tabel Görünüşü
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('corrections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedTab === 'corrections'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit & Əl Düzəlişləri ({corrections.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İşçi axtarışı..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 w-36 sm:w-48"
            />
          </div>

          {/* Work Site Select */}
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Bütün İş Obyektləri</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Department Select */}
          <select
            value={selectedDepartmentFilter}
            onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Bütün Şöbələr</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB: DAILY RECORDS */}
      {selectedTab === 'daily' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">İşçi</th>
                  <th className="py-3 px-4">Hadisə</th>
                  <th className="py-3 px-4">Zaman</th>
                  <th className="py-3 px-4">İş Obyekti</th>
                  <th className="py-3 px-4">Geofence & Məsafə</th>
                  <th className="py-3 px-4">Oxşarlıq & Liveness</th>
                  <th className="py-3 px-4">Qeyd Edən / Cihaz</th>
                  <th className="py-3 px-4 text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.employeeAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.employeeName)}`}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block">{r.employeeName}</span>
                          <span className="text-[10px] text-slate-400">{r.employeeDepartment} • {r.employeePosition}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                        r.eventType === 'CHECK_IN'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {r.eventType === 'CHECK_IN' ? '🟢 GİRİŞ' : '🔴 ÇIXIŞ'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      {new Date(r.serverTimestamp).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      <span className="block text-[10px] text-slate-500">
                        {new Date(r.serverTimestamp).toLocaleDateString('az-AZ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-200 block truncate max-w-[140px]">{r.workSiteName}</span>
                    </td>

                    <td className="py-3 px-4">
                      {r.isWithinGeofence ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Daxildə ({r.distanceToSiteMeters}m)</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Kənarda ({r.distanceToSiteMeters}m)</span>
                        </span>
                      )}
                      {r.supervisorComment && (
                        <span className="text-[10px] text-amber-200/70 block italic truncate max-w-[150px]">
                          "{r.supervisorComment}"
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${r.similarityScore >= 0.72 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {Math.round(r.similarityScore * 100)}%
                        </span>
                        <span className="text-[10px] text-slate-500">| L: {Math.round(r.livenessScore * 100)}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      <span className="block text-slate-300 font-semibold">
                        {r.recordedByRole === 'supervisor' ? `Rəhbər (${r.recordedByUserId})` : 'İşçi Özü (Self)'}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block max-w-[120px]">{r.deviceModel}</span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecordForCorrection(r);
                          setCorrectedEventType(r.eventType === 'CHECK_IN' ? 'CHECK_OUT' : 'CHECK_IN');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700 cursor-pointer"
                      >
                        Əl ilə Düzəliş
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SUSPICIOUS SCANS */}
      {selectedTab === 'suspicious' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-red-300">
              <ShieldAlert className="w-4 h-4" />
              <span>Anti-Spoofing və Təhlükəsizlik Filtrləri Tərəfindən Qeydə Alınmış Şübhəli Hallar</span>
            </div>
            <span className="text-[11px] text-red-300/80">Yalnız səlahiyyətli HR təsdiqi ilə qəbul edilə bilər</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suspiciousRecords.map((r) => (
              <div key={r.id} className="p-4 bg-slate-850 rounded-2xl border border-red-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.employeeAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.employeeName)}`}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-red-500/50"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{r.employeeName}</h4>
                      <p className="text-xs text-slate-400">{r.employeeDepartment} • {r.employeePosition}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/40">
                    ŞÜBHƏLİ
                  </span>
                </div>

                <div className="space-y-1 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-red-300 font-bold flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Səbəblər: {r.suspicionReasons.join(', ') || 'Aşağı oxşarlıq və ya geofence kənarı'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                    <span>Oxşarlıq balı: <strong className="text-amber-400">{Math.round(r.similarityScore * 100)}%</strong></span>
                    <span>Liveness: <strong className="text-slate-200">{Math.round(r.livenessScore * 100)}%</strong></span>
                    <span>Məsafə: <strong className="text-amber-400">{r.distanceToSiteMeters}m</strong></span>
                  </div>
                  {r.supervisorComment && (
                    <div className="text-[11px] text-amber-200 bg-amber-950/20 p-1.5 rounded border border-amber-500/20">
                      Rəhbər izahı: "{r.supervisorComment}"
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(r.serverTimestamp).toLocaleString('az-AZ')}
                  </span>
                  <div className="flex items-center gap-2">
                    {r.auditThumbnailUrl && (
                      <button
                        type="button"
                        onClick={() => setInspectAuditThumbnail({ url: r.auditThumbnailUrl!, name: r.employeeName, score: r.similarityScore })}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Audit Şəkli</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecordForCorrection(r);
                        setCorrectedEventType(r.eventType);
                      }}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Baxış & Düzəliş
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: EMPLOYEE REGISTRY & CONSENTS */}
      {selectedTab === 'employees' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">İşçi & FİN</th>
                  <th className="py-3 px-4">Şöbə & Vəzifə</th>
                  <th className="py-3 px-4">Təhkim Olunan Obyekt</th>
                  <th className="py-3 px-4">Biometrik Status</th>
                  <th className="py-3 px-4">Hüquqi Razılıq</th>
                  <th className="py-3 px-4 text-right">Hüquqi Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emp.firstName)}`}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block">{emp.firstName} {emp.lastName}</span>
                          <span className="text-[10px] font-mono text-blue-400">FİN: {emp.pinCode}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-white block font-semibold">{emp.department}</span>
                      <span className="text-[10px] text-slate-400">{emp.position}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-300 text-xs">
                        {sites.find(s => s.id === emp.workSiteId)?.name || 'Baş Ofis'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {emp.isEnrolled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          3/3 Bucaq Aktiv
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Qeydiyyatsız
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[11px]">
                      {emp.consent ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Elektron İmzalanıb ({emp.consent.consentVersion})</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">Razılıq Yoxdur</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEmployee(emp);
                            setIsEnrollModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-bold cursor-pointer"
                        >
                          Yenidən Skan
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handlePurgeBiometrics(emp)}
                          title="Unudulma Hüququ (Right to be Forgotten) - AR Qanunu"
                          className="p-1 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 border border-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: TABEL VIEW (RƏSMİ TABEL FORMATI) */}
      {selectedTab === 'tabel' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-black text-sm text-white">İş Vaxtının Uçotu Cədvəli (Dövlət Tabel Standartı T-13)</h3>
              <p className="text-xs text-slate-400">Azərbaycan Respublikası Əmək Məcəlləsinin 173-cü maddəsinə uyğun aylıq tabel</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Çap Et / PDF Yadda Saxla</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-800">
              <thead className="bg-slate-800 text-[10px] text-slate-400 font-bold uppercase">
                <tr>
                  <th className="p-2 border border-slate-700">№</th>
                  <th className="p-2 border border-slate-700">İşçinin S.A.A.</th>
                  <th className="p-2 border border-slate-700">FİN</th>
                  <th className="p-2 border border-slate-700">Vəzifə</th>
                  <th className="p-2 border border-slate-700 text-center">Giriş</th>
                  <th className="p-2 border border-slate-700 text-center">Çıxış</th>
                  <th className="p-2 border border-slate-700 text-center">İş Saatı</th>
                  <th className="p-2 border border-slate-700 text-center">Davamiyyət Qeydi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {employees.map((emp, idx) => {
                  const empRecords = records.filter(r => r.employeeId === emp.id);
                  const checkIn = empRecords.find(r => r.eventType === 'CHECK_IN');
                  const checkOut = empRecords.find(r => r.eventType === 'CHECK_OUT');

                  return (
                    <tr key={emp.id} className="hover:bg-slate-800/30">
                      <td className="p-2 border border-slate-800 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-2 border border-slate-800 font-bold text-white">{emp.firstName} {emp.lastName}</td>
                      <td className="p-2 border border-slate-800 font-mono text-slate-400">{emp.pinCode}</td>
                      <td className="p-2 border border-slate-800 text-slate-300">{emp.position}</td>
                      <td className="p-2 border border-slate-800 text-center font-mono text-emerald-400">
                        {checkIn ? new Date(checkIn.serverTimestamp).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="p-2 border border-slate-800 text-center font-mono text-amber-400">
                        {checkOut ? new Date(checkOut.serverTimestamp).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="p-2 border border-slate-800 text-center font-bold text-slate-200">
                        {checkIn ? '8.0 saat' : '0.0 saat'}
                      </td>
                      <td className="p-2 border border-slate-800 text-center">
                        {checkIn ? (
                          <span className="text-emerald-400 font-bold text-[10px]">İşdədir (İ)</span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Q/Y</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOGS & MANUAL CORRECTIONS */}
      {selectedTab === 'corrections' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white">Dəyişməz Audit Jurnalı (Immutable Audit Trail)</h3>
              <p className="text-xs text-slate-400">Bütün əl ilə düzəlişlər, səbəblər və rəhbər qeydləri arxivləşdirilir.</p>
            </div>
          </div>

          <div className="space-y-2">
            {corrections.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Hələ heç bir əl ilə düzəliş qeydə alınmayıb.</p>
            ) : (
              corrections.map((c) => (
                <div key={c.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{c.employeeName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{new Date(c.createdAt).toLocaleString('az-AZ')}</span>
                  </div>
                  <div className="text-slate-300">
                    Düzəliş növü: <span className="font-bold text-blue-400">{c.correctedEventType === 'CHECK_IN' ? 'Giriş' : 'Çıxış'}</span> • Səlahiyyətli şəxs: <strong>{c.correctedByName}</strong>
                  </div>
                  <div className="text-[11px] text-amber-300 bg-amber-950/20 p-2 rounded border border-amber-500/20">
                    Səbəb: "{c.reason}"
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. MODALS */}

      {/* ENROLLMENT MODAL */}
      <FaceEnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        existingEmployee={editingEmployee}
        onSuccess={() => {
          setEmployees(getStoredAttendanceEmployees());
        }}
      />

      {/* MANUAL CORRECTION MODAL */}
      {selectedRecordForCorrection && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Davamiyyətə Əl ilə Düzəliş</h3>
              <button
                onClick={() => setSelectedRecordForCorrection(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1 bg-slate-850 p-3 rounded-xl border border-slate-800">
              <div>İşçi: <strong>{selectedRecordForCorrection.employeeName}</strong></div>
              <div>Cari hadisə: <strong>{selectedRecordForCorrection.eventType === 'CHECK_IN' ? 'Giriş' : 'Çıxış'}</strong></div>
              <div>Vaxt: {new Date(selectedRecordForCorrection.serverTimestamp).toLocaleString('az-AZ')}</div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Düzəliş Hadisə Növü</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectedEventType('CHECK_IN')}
                  className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                    correctedEventType === 'CHECK_IN'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  GİRİŞ
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectedEventType('CHECK_OUT')}
                  className={`py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                    correctedEventType === 'CHECK_OUT'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  ÇIXIŞ
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Düzəliş Səbəbi * (Audit jurnalında saxlanılır)
              </label>
              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="Məs. İşçi ezamiyyətdə olub, rəhbər tərəfindən icazə verilib..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRecordForCorrection(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                İmtina
              </button>
              <button
                type="button"
                onClick={handleSaveCorrection}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer"
              >
                Düzəlişi Təsdiq Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT THUMBNAIL INSPECT MODAL */}
      {inspectAuditThumbnail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-100 shadow-2xl space-y-4 text-center">
            <h3 className="font-bold text-sm text-white">Təhlükəsizlik Audit Miniatürü</h3>
            <p className="text-xs text-slate-400">{inspectAuditThumbnail.name} • Oxşarlıq: {Math.round(inspectAuditThumbnail.score * 100)}%</p>
            <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden border-2 border-slate-700 bg-black flex items-center justify-center shadow-lg">
              <img src={inspectAuditThumbnail.url} alt="Audit" className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] text-slate-500">
              AR Qanunvericiliyinə uyğun olaraq aşağı keyfiyyətli miniatür yalnız mübahisəli halların araşdırılması üçün 30 gün müddətində saxlanılır.
            </p>
            <button
              type="button"
              onClick={() => setInspectAuditThumbnail(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
