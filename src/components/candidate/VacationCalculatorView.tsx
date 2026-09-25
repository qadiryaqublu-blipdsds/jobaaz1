import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Palmtree, 
  FileText, 
  Printer, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Building2, 
  Users, 
  Check, 
  Copy, 
  Calendar, 
  ShieldCheck, 
  Briefcase,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  LogIn,
  ArrowRight
} from 'lucide-react';
import { User, Company } from '../../types';
import { 
  VacationPeriod, 
  VacationParams, 
  EmployeeVacationRecord, 
  CompanyVacationProfile, 
  VacationCalculationResult,
  formatAZN, 
  formatNum, 
  calcDates, 
  calculateVacationPay, 
  numberToAzWords,
  exportSingleVacationExcel,
  exportBulkVacationsExcel,
  downloadVacationExcelTemplate,
  parseVacationsFromExcel
} from '../../services/vacationCalculatorService';
import { OfficialVacationDocumentModal } from './OfficialVacationDocumentModal';

interface VacationCalculatorViewProps {
  onExploreJobs?: () => void;
  currentUser?: User | null;
  companies?: Company[];
  activeCompany?: Company | null;
  onOpenAuthModal?: () => void;
}

export const VacationCalculatorView: React.FC<VacationCalculatorViewProps> = ({
  onExploreJobs,
  currentUser,
  companies = [],
  activeCompany,
  onOpenAuthModal,
}) => {
  // Mode: Single employee vs Bulk / Multi-employee calculation
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single');
  const [isOfficialDocModalOpen, setIsOfficialDocModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Company Profile state (bound to logged-in user or customizable on the fly)
  const [companyProfile, setCompanyProfile] = useState<CompanyVacationProfile>(() => {
    const saved = localStorage.getItem('jobia_vacation_company_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      name: activeCompany?.name || (currentUser?.role === 'business' ? (currentUser.companyName || currentUser.fullName) : 'ABC MMC'),
      voen: '1401234561',
      directorName: 'Məmmədov Rəşad İlham oğlu',
      directorTitle: 'Müəssisə Rəhbəri (Direktor)',
      accountantName: 'Quliyeva Nərgiz Əli qızı',
      accountantTitle: 'Baş Mühasib',
      logo: activeCompany?.logo || '',
      address: activeCompany?.location || 'Bakı ş., Nizami küç. 45',
      phone: '+994 (12) 498-00-00',
      orderNumber: `MEZ-2026/04`,
      orderDate: new Date().toISOString().split('T')[0],
    };
  });

  // Sync company profile if activeCompany or currentUser changes
  useEffect(() => {
    if (activeCompany) {
      setCompanyProfile((prev) => ({
        ...prev,
        name: activeCompany.name || prev.name,
        logo: activeCompany.logo || prev.logo,
        address: activeCompany.location || prev.address,
      }));
    }
  }, [activeCompany]);

  const handleUpdateCompanyField = (field: keyof CompanyVacationProfile, val: string) => {
    const updated = { ...companyProfile, [field]: val };
    setCompanyProfile(updated);
    try {
      localStorage.setItem('jobia_vacation_company_profile', JSON.stringify(updated));
    } catch {}
  };

  // ===================== SINGLE EMPLOYEE STATE =====================
  const [empName, setEmpName] = useState('Saleh Mirzəyev Araz oğlu');
  const [empPosition, setEmpPosition] = useState('Mühasib');
  const [department, setDepartment] = useState('Maliyyə və Mühasibatlıq');
  
  const [workedMonthsType, setWorkedMonthsType] = useState<'12' | 'custom'>('12');
  const [customMonths, setCustomMonths] = useState(6);
  const [sal12, setSal12] = useState<string>('46110.65');
  const [bon12, setBon12] = useState<string>('3485.52');
  const [msal, setMsal] = useState<string>('4877');
  const [wdays, setWdays] = useState<string>('22');

  const [vacations, setVacations] = useState<VacationPeriod[]>([
    { id: 1, startDate: '2026-04-09', endDate: '2026-04-12', mode: 'range', calDays: 4, workDays: 2 },
    { id: 2, startDate: '2026-04-21', endDate: '', mode: 'single', calDays: 1, workDays: 1 },
    { id: 3, startDate: '2026-04-28', endDate: '', mode: 'single', calDays: 1, workDays: 1 },
  ]);
  const [nextVacId, setNextVacId] = useState(4);

  // ===================== MULTI-EMPLOYEE (BULK) STATE =====================
  const [bulkEmployees, setBulkEmployees] = useState<EmployeeVacationRecord[]>(() => {
    const saved = localStorage.getItem('jobia_vacation_bulk_roster');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'emp-1',
        empName: 'Saleh Mirzəyev Araz oğlu',
        empPosition: 'Mühasib',
        department: 'Maliyyə',
        params: {
          workedMonthsType: '12',
          customMonths: 12,
          sal12: 46110.65,
          bon12: 3485.52,
          msal: 4877,
          wdays: 22,
        },
        vacations: [
          { id: 1, startDate: '2026-04-09', endDate: '2026-04-12', mode: 'range', calDays: 4, workDays: 2 },
          { id: 2, startDate: '2026-04-21', endDate: '', mode: 'single', calDays: 1, workDays: 1 },
        ]
      },
      {
        id: 'emp-2',
        empName: 'Aytən Qasımova Namiq qızı',
        empPosition: 'Aparıcı Mütəxəssis',
        department: 'Kadrlar Şöbəsi',
        params: {
          workedMonthsType: '12',
          customMonths: 12,
          sal12: 24000,
          bon12: 1200,
          msal: 2000,
          wdays: 22,
        },
        vacations: [
          { id: 1, startDate: '2026-05-15', endDate: '2026-05-28', mode: 'range', calDays: 14, workDays: 10 }
        ]
      },
      {
        id: 'emp-3',
        empName: 'Elmir Həsənov Fuad oğlu',
        empPosition: 'Proqram Təminatçısı',
        department: 'İT Departamenti',
        params: {
          workedMonthsType: 'custom',
          customMonths: 7,
          sal12: 14700,
          bon12: 800,
          msal: 2100,
          wdays: 22,
        },
        vacations: [
          { id: 1, startDate: '2026-06-01', endDate: '2026-06-10', mode: 'range', calDays: 10, workDays: 7 }
        ]
      }
    ];
  });

  // Save bulk list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jobia_vacation_bulk_roster', JSON.stringify(bulkEmployees));
    } catch {}
  }, [bulkEmployees]);

  // Single calculation results
  const singleParams: VacationParams = useMemo(() => ({
    workedMonthsType,
    customMonths,
    sal12: parseFloat(sal12) || 0,
    bon12: parseFloat(bon12) || 0,
    msal: parseFloat(msal) || 0,
    wdays: Math.max(1, parseInt(wdays) || 22),
  }), [workedMonthsType, customMonths, sal12, bon12, msal, wdays]);

  const singleCalculation: VacationCalculationResult = useMemo(() => {
    return calculateVacationPay(singleParams, vacations);
  }, [singleParams, vacations]);

  // Current single employee record object
  const singleEmployeeRecord: EmployeeVacationRecord = useMemo(() => ({
    id: 'emp-single-curr',
    empName,
    empPosition,
    department,
    params: singleParams,
    vacations,
  }), [empName, empPosition, department, singleParams, vacations]);

  // Bulk summary calculation
  const bulkSummary = useMemo(() => {
    let totalPayroll = 0;
    let totalCalDays = 0;
    let totalWorkDays = 0;

    bulkEmployees.forEach((emp) => {
      const res = calculateVacationPay(emp.params, emp.vacations);
      totalPayroll += res.grandTotal;
      (emp.vacations || []).forEach((v) => {
        totalCalDays += v.calDays || 0;
        totalWorkDays += v.workDays || 0;
      });
    });

    return {
      count: bulkEmployees.length,
      totalPayroll,
      totalCalDays,
      totalWorkDays,
    };
  }, [bulkEmployees]);

  // Vacation items modification handlers
  const handleAddVacation = () => {
    const today = new Date().toISOString().split('T')[0];
    setVacations((prev) => [
      ...prev,
      { id: nextVacId, startDate: today, endDate: '', mode: 'range', calDays: 1, workDays: 1 }
    ]);
    setNextVacId((prev) => prev + 1);
  };

  const handleRemoveVacation = (id: number) => {
    setVacations((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVacDateChange = (id: number, field: 'startDate' | 'endDate', val: string) => {
    setVacations((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const newStart = field === 'startDate' ? val : v.startDate;
        const newEnd = field === 'endDate' ? val : (v.mode === 'single' ? '' : v.endDate);
        const { calDays, workDays } = calcDates(newStart, newEnd);
        return {
          ...v,
          startDate: newStart,
          endDate: v.mode === 'single' ? '' : newEnd,
          calDays,
          workDays,
        };
      })
    );
  };

  const handleVacModeChange = (id: number, mode: 'range' | 'single') => {
    setVacations((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const newEnd = mode === 'single' ? '' : v.endDate;
        const { calDays, workDays } = calcDates(v.startDate, newEnd);
        return {
          ...v,
          mode,
          endDate: newEnd,
          calDays,
          workDays,
        };
      })
    );
  };

  const handleVacManualDaysChange = (id: number, field: 'calDays' | 'workDays', val: number) => {
    setVacations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: Math.max(0, val) } : v))
    );
  };

  // Bulk mode handlers
  const handleAddBulkEmployee = () => {
    const today = new Date().toISOString().split('T')[0];
    const newEmp: EmployeeVacationRecord = {
      id: `emp-bulk-${Date.now()}`,
      empName: '',
      empPosition: 'Mütəxəssis',
      department: 'Ümumi',
      params: {
        workedMonthsType: '12',
        customMonths: 12,
        sal12: 12000,
        bon12: 500,
        msal: 1000,
        wdays: 22,
      },
      vacations: [
        { id: 1, startDate: today, endDate: today, mode: 'range', calDays: 1, workDays: 1 }
      ]
    };
    setBulkEmployees((prev) => [...prev, newEmp]);
  };

  const handleRemoveBulkEmployee = (id: string) => {
    setBulkEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateBulkEmpField = (
    id: string, 
    field: string, 
    val: any
  ) => {
    setBulkEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== id) return emp;
        if (field in emp.params) {
          return {
            ...emp,
            params: {
              ...emp.params,
              [field]: val,
            }
          };
        }
        return { ...emp, [field]: val };
      })
    );
  };

  const handleUpdateBulkEmpVacation = (
    empId: string,
    startDate: string,
    endDate: string
  ) => {
    const { calDays, workDays } = calcDates(startDate, endDate);
    setBulkEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        return {
          ...emp,
          vacations: [
            {
              id: 1,
              startDate,
              endDate,
              mode: endDate && endDate !== startDate ? 'range' : 'single',
              calDays,
              workDays,
            }
          ]
        };
      })
    );
  };

  const handleBulkUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Excel faylı emal edilir...');
      const records = await parseVacationsFromExcel(file);
      if (records.length === 0) {
        setUploadStatus('Faylda heç bir işçi sətri tapılmadı və ya format uyğun deyil.');
        return;
      }
      setBulkEmployees((prev) => [...prev, ...(records as EmployeeVacationRecord[])]);
      setUploadStatus(`Uğurla ${records.length} işçi cədvələ əlavə edildi!`);
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err) {
      console.error(err);
      setUploadStatus('Fayl oxunarkən xəta baş verdi. Xahiş edirik şablona uyğun fayl yükləyin.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Copy summary text to clipboard
  const handleCopySummary = () => {
    const summaryText = `🌴 Məzuniyyət Haqqı Hesabatı (${companyProfile.name})
İşçi: ${empName || '–'} (${empPosition || '–'})
İşlədiyi dövr: ${singleCalculation.months} ay
Cəmi gəlir: ${formatAZN(singleCalculation.totalIncome)}
Günlük orta Təqvim qazancı: ${formatAZN(singleCalculation.calDayRate)}
Günlük orta İş qazancı: ${formatAZN(singleCalculation.workDayRate)}

Məzuniyyətlər:
${vacations.map((v, i) => {
  const item = singleCalculation.items[i];
  return `${i + 1}. ${v.startDate} ${v.endDate ? '— ' + v.endDate : ''}: ${v.calDays} t.gün / ${v.workDays} iş günü = ${formatAZN(item?.pay || 0)} (${item?.usesCal ? 'Təqvim' : 'İş'})`;
}).join('\n')}

YEKUN ÖDƏNİLƏCƏK MƏBLƏĞ: ${formatAZN(singleCalculation.grandTotal)}
Sözlə: ${numberToAzWords(singleCalculation.grandTotal)}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger system print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 animate-fade-in text-slate-800">
      
      {/* Hidden File Input for Excel Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <Palmtree className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Məzuniyyət Haqqı Kalkulyatoru
              </h1>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold rounded-md uppercase">
                AR Əmək Məcəlləsi Maddə 140
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Tək və kütləvi işçi hesablaması, direktor imzası və möhürlü rəsmi PDF/Excel sənədlər
            </p>
          </div>
        </div>

        {/* Mode Switcher: Tək İşçi vs Kütləvi */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveMode('single')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'single'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Fərdi Hesablama</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('bulk')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'bulk'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Kütləvi Hesablama ({bulkEmployees.length})</span>
          </button>
        </div>
      </div>

      {/* COMPANY / EMPLOYER INTEGRATION CARD */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  İşəgötürən Müəssisə Rekvizitləri
                </span>
                {currentUser?.role === 'business' ? (
                  <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded">
                    Sistemə daxil olub
                  </span>
                ) : (
                  <span className="px-2 py-0.2 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold rounded">
                    Rəsmi Sənəd Rejimi
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-white mt-0.5">
                {companyProfile.name} {companyProfile.voen ? `(VÖEN: ${companyProfile.voen})` : ''}
              </p>
            </div>
          </div>

          {/* Company Quick Inputs or Register/Login Button */}
          <div className="flex flex-wrap items-center gap-2">
            {!currentUser && onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Şirkət Kimi Qeydiyyatdan Keç / Daxil Ol</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={companyProfile.name}
                onChange={(e) => handleUpdateCompanyField('name', e.target.value)}
                placeholder="Şirkət adı"
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none w-36 sm:w-44"
                title="Şirkətin rəsmi adı"
              />
              <input
                type="text"
                value={companyProfile.directorName || ''}
                onChange={(e) => handleUpdateCompanyField('directorName', e.target.value)}
                placeholder="Direktorun S.A.A."
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none w-36 sm:w-48"
                title="İmza atacaq direktorun adı"
              />
            </div>
          </div>

        </div>
      </div>

      {/* ======================= MODE 1: SINGLE EMPLOYEE VIEW ======================= */}
      {activeMode === 'single' && (
        <div className="space-y-6">
          
          {/* Rules Explanation Box (from user code) */}
          <div className="bg-white border-l-4 border-emerald-700 p-4 rounded-xl shadow-2xs border border-slate-200">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              <strong className="text-slate-900">AR Əmək Məcəlləsi Qaydası:</strong> Orta təqvim qazancı = Cəmi gəlir ÷ İşlənmiş ay sayı ÷ 30.4 &nbsp;|&nbsp; Orta iş günü qazancı = Aylıq maaş ÷ İş günü sayı &nbsp;|&nbsp; <strong>Hansı böyükdürsə, məzuniyyət günləri üçün o ödənilir.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form Inputs */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    İşçi və Əməkhaqqı Parametrləri
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Maddə 140
                  </span>
                </div>

                {/* Worker Name and Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      İşçinin adı, soyadı, atasının adı
                    </label>
                    <input
                      type="text"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      placeholder="Saleh Mirzəyev Araz oğlu"
                      className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Vəzifəsi
                    </label>
                    <input
                      type="text"
                      value={empPosition}
                      onChange={(e) => setEmpPosition(e.target.value)}
                      placeholder="Mühasib"
                      className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Worked months toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      İşçi neçə ay işləyib?
                    </label>
                    <select
                      value={workedMonthsType}
                      onChange={(e) => setWorkedMonthsType(e.target.value as '12' | 'custom')}
                      className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition-all cursor-pointer"
                    >
                      <option value="12">12 ay (tam il)</option>
                      <option value="custom">12 aydan az (1–11 ay)</option>
                    </select>
                  </div>

                  {workedMonthsType === 'custom' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        İşlədiyi ay sayı (1–11)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="11"
                        value={customMonths}
                        onChange={(e) => setCustomMonths(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Salaries & Days inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      İşlədiyi dövr üzrə vəzifə maaşı cəmi (₼)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={sal12}
                      onChange={(e) => setSal12(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Nəzərə alınan mükafatlar (₼)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={bon12}
                      onChange={(e) => setBon12(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Aylıq vəzifə maaşı (cari ay, ₼)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={msal}
                      onChange={(e) => setMsal(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Cari aydakı iş günlərinin sayı
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={wdays}
                      onChange={(e) => setWdays(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>
                </div>

              </div>

              {/* 3 Metrics Cards (from user design) */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cəmi gəlir</p>
                  <p className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
                    {formatAZN(singleCalculation.totalIncome)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{singleCalculation.months} ay üzrə</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Günlük Təqvim</p>
                  <p className="text-base sm:text-lg font-black text-emerald-700 mt-1 truncate">
                    {formatAZN(singleCalculation.calDayRate)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">÷ {singleCalculation.months} ÷ 30.4</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Günlük İş Qazancı</p>
                  <p className="text-base sm:text-lg font-black text-blue-700 mt-1 truncate">
                    {formatAZN(singleCalculation.workDayRate)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Maaş ÷ {singleParams.wdays} gün</p>
                </div>
              </div>

            </div>

            {/* Right Column: Vacation Periods List & Actions */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Məzuniyyət Dövrləri ({vacations.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVacation}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Məzuniyyət əlavə et</span>
                  </button>
                </div>

                {/* Vacation Items Roster */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {vacations.map((v, idx) => {
                    const itemRes = singleCalculation.items[idx];
                    const isSingle = v.mode === 'single';

                    return (
                      <div
                        key={v.id}
                        className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 relative space-y-3 transition-all hover:border-slate-300"
                      >
                        {/* Remove button */}
                        {vacations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVacation(v.id)}
                            className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                            title="Məzuniyyəti sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Top Inputs: Mode & Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pr-6">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Növ</label>
                            <select
                              value={v.mode}
                              onChange={(e) => handleVacModeChange(v.id, e.target.value as 'range' | 'single')}
                              className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg outline-none"
                            >
                              <option value="range">Aralıq (Müddət)</option>
                              <option value="single">Tək gün</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                              {isSingle ? 'Tarix' : 'Başlama tarixi'}
                            </label>
                            <input
                              type="date"
                              value={v.startDate}
                              onChange={(e) => handleVacDateChange(v.id, 'startDate', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg outline-none"
                            />
                          </div>

                          {!isSingle && (
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                Bitmə tarixi
                              </label>
                              <input
                                type="date"
                                value={v.endDate}
                                onChange={(e) => handleVacDateChange(v.id, 'endDate', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg outline-none"
                              />
                            </div>
                          )}
                        </div>

                        {/* Days Breakdown & Rate Calculations */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-medium">Təqvim günü</span>
                            <input
                              type="number"
                              min="1"
                              value={v.calDays}
                              onChange={(e) => handleVacManualDaysChange(v.id, 'calDays', parseInt(e.target.value) || 1)}
                              className="w-full text-xs font-bold text-slate-800 outline-none"
                            />
                          </div>

                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-medium">İş günü</span>
                            <input
                              type="number"
                              min="0"
                              value={v.workDays}
                              onChange={(e) => handleVacManualDaysChange(v.id, 'workDays', parseInt(e.target.value) || 0)}
                              className="w-full text-xs font-bold text-slate-800 outline-none"
                            />
                          </div>

                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-medium">Təqvim üzrə</span>
                            <span className="text-xs font-bold text-slate-700 block truncate">
                              {formatAZN(itemRes?.calAmt || 0)}
                            </span>
                          </div>

                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-medium">İş günü üzrə</span>
                            <span className="text-xs font-bold text-slate-700 block truncate">
                              {formatAZN(itemRes?.workAmt || 0)}
                            </span>
                          </div>
                        </div>

                        {/* Footer: Selected method badge & payable amount */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-medium">Tətbiq olunan metod:</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              itemRes?.usesCal ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {itemRes?.usesCal ? 'Təqvim günü əsasında' : 'İş günü əsasında'}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-black text-sm text-slate-900">
                              {formatAZN(itemRes?.pay || 0)}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Grand Total Banner */}
                <div className="bg-emerald-700 text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs text-emerald-100 font-semibold block">
                      Ümumilikdə ödəniləcək məbləğ
                    </span>
                    <span className="text-[11px] text-emerald-200 italic mt-0.5 block max-w-xs sm:max-w-md truncate">
                      "{numberToAzWords(singleCalculation.grandTotal)}"
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      {formatAZN(singleCalculation.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Actions: Excel export, PDF Modal view, Copy, Print */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => exportSingleVacationExcel(singleEmployeeRecord, companyProfile, singleCalculation)}
                    className="w-full px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="Excel faylı kimi saxla"
                  >
                    <Download className="w-4 h-4" />
                    <span>Excel kimi saxla</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOfficialDocModalOpen(true)}
                    className="w-full px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="Direktor imzası və möhürlü rəsmi sənədə bax və PDF kimi yüklə"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Rəsmi Sənəd / PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                    title="Nəticəni kopyala"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================= MODE 2: MULTI-EMPLOYEE (BULK) VIEW ======================= */}
      {activeMode === 'bulk' && (
        <div className="space-y-6">
          
          {/* Bulk Summary Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cəmi İşçi</span>
              <p className="text-xl font-black text-slate-900 mt-1">{bulkSummary.count} nəfər</p>
              <span className="text-[11px] text-slate-400">Kollektiv siyahı</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cəmi Məzuniyyət Günü</span>
              <p className="text-xl font-black text-emerald-700 mt-1">{bulkSummary.totalCalDays} gün</p>
              <span className="text-[11px] text-slate-400">{bulkSummary.totalWorkDays} iş günü</span>
            </div>

            <div className="col-span-2 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white rounded-xl p-3.5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
                  Ümumi Məzuniyyət Fondu
                </span>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">
                  {formatAZN(bulkSummary.totalPayroll)}
                </p>
                <span className="text-[11px] text-emerald-200 italic block truncate max-w-sm">
                  "{numberToAzWords(bulkSummary.totalPayroll)}"
                </span>
              </div>
              <button
                type="button"
                onClick={() => exportBulkVacationsExcel(bulkEmployees, companyProfile)}
                className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Kütləvi Excel Endir</span>
              </button>
            </div>
          </div>

          {/* Action Tools: Download Template, Upload Excel, Add Row */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleAddBulkEmployee}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni İşçi Əlavə et</span>
              </button>

              <button
                type="button"
                onClick={handleBulkUploadClick}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Excel-dən İşçi Siyahısını Yüklə</span>
              </button>

              <button
                type="button"
                onClick={downloadVacationExcelTemplate}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                <span>Nümunə Şablon (.xlsx)</span>
              </button>
            </div>

            {uploadStatus && (
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{uploadStatus}</span>
              </div>
            )}
          </div>

          {/* Bulk Employees Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3 text-center w-8">№</th>
                    <th className="p-3 min-w-[180px]">İşçinin S.A.A.</th>
                    <th className="p-3 min-w-[130px]">Vəzifə</th>
                    <th className="p-3 w-20 text-center">Ay</th>
                    <th className="p-3 min-w-[110px]">Dövr Maaşı (₼)</th>
                    <th className="p-3 min-w-[90px]">Mükafat (₼)</th>
                    <th className="p-3 min-w-[100px]">Aylıq Maaş</th>
                    <th className="p-3 min-w-[180px]">Məzuniyyət Tarixi</th>
                    <th className="p-3 text-center">Günlər</th>
                    <th className="p-3 text-right min-w-[120px]">Məzuniyyət Haqqı</th>
                    <th className="p-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bulkEmployees.map((emp, idx) => {
                    const res = calculateVacationPay(emp.params, emp.vacations);
                    const mainVac = emp.vacations[0] || { startDate: '', endDate: '', calDays: 1, workDays: 1 };

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        
                        <td className="p-2">
                          <input
                            type="text"
                            value={emp.empName}
                            onChange={(e) => handleUpdateBulkEmpField(emp.id, 'empName', e.target.value)}
                            placeholder="Ad, Soyad, Ata adı"
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white rounded font-semibold text-xs outline-none"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            value={emp.empPosition}
                            onChange={(e) => handleUpdateBulkEmpField(emp.id, 'empPosition', e.target.value)}
                            placeholder="Vəzifə"
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white rounded text-xs outline-none"
                          />
                        </td>

                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={emp.params.workedMonthsType === '12' ? 12 : emp.params.customMonths}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 12;
                              handleUpdateBulkEmpField(emp.id, 'workedMonthsType', val >= 12 ? '12' : 'custom');
                              handleUpdateBulkEmpField(emp.id, 'customMonths', val);
                            }}
                            className="w-12 text-center px-1 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white rounded font-bold text-xs outline-none"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            step="10"
                            value={emp.params.sal12}
                            onChange={(e) => handleUpdateBulkEmpField(emp.id, 'sal12', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white rounded font-semibold text-xs outline-none"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            step="10"
                            value={emp.params.bon12}
                            onChange={(e) => handleUpdateBulkEmpField(emp.id, 'bon12', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white rounded text-xs outline-none"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            step="10"
                            value={emp.params.msal}
                            onChange={(e) => handleUpdateBulkEmpField(emp.id, 'msal', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white rounded text-xs outline-none"
                          />
                        </td>

                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              value={mainVac.startDate}
                              onChange={(e) => handleUpdateBulkEmpVacation(emp.id, e.target.value, mainVac.endDate)}
                              className="px-1.5 py-1 text-[11px] bg-white border border-slate-200 rounded outline-none w-28"
                            />
                            <span className="text-slate-400 text-xs">—</span>
                            <input
                              type="date"
                              value={mainVac.endDate}
                              onChange={(e) => handleUpdateBulkEmpVacation(emp.id, mainVac.startDate, e.target.value)}
                              className="px-1.5 py-1 text-[11px] bg-white border border-slate-200 rounded outline-none w-28"
                            />
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <span className="font-bold text-slate-800">{mainVac.calDays} t.gün</span>
                          <span className="block text-[10px] text-slate-400">{mainVac.workDays} iş g.</span>
                        </td>

                        <td className="p-3 text-right">
                          <span className="font-black text-sm text-emerald-800 block">
                            {formatAZN(res.grandTotal)}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveBulkEmployee(emp.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Sətiri sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={8} className="p-3 text-right uppercase tracking-wider text-slate-700">
                      Cəmi Məzuniyyət Fondu ({bulkEmployees.length} işçi):
                    </td>
                    <td className="p-3 text-center text-slate-800">
                      {bulkSummary.totalCalDays} t.gün
                    </td>
                    <td className="p-3 text-right text-sm font-black text-emerald-800">
                      {formatAZN(bulkSummary.totalPayroll)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Official Vacation Document Modal (PDF preview, Director Signature, Stamp, Print) */}
      <OfficialVacationDocumentModal
        isOpen={isOfficialDocModalOpen}
        onClose={() => setIsOfficialDocModalOpen(false)}
        employee={singleEmployeeRecord}
        company={companyProfile}
        calculation={singleCalculation}
        onPrint={handlePrint}
      />

    </div>
  );
};
