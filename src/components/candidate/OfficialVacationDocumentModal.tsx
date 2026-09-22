import React from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Building2, 
  CheckCircle2, 
  FileText,
  Calendar,
  ShieldCheck,
  User,
  Briefcase
} from 'lucide-react';
import { 
  EmployeeVacationRecord, 
  CompanyVacationProfile, 
  VacationCalculationResult, 
  formatAZN, 
  formatNum, 
  numberToAzWords, 
  exportSingleVacationExcel 
} from '../../services/vacationCalculatorService';

interface OfficialVacationDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeVacationRecord;
  company: CompanyVacationProfile;
  calculation: VacationCalculationResult;
  onPrint: () => void;
}

export const OfficialVacationDocumentModal: React.FC<OfficialVacationDocumentModalProps> = ({
  isOpen,
  onClose,
  employee,
  company,
  calculation,
  onPrint,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('az-AZ');
  const orderNum = company.orderNumber || `MEZ-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;

  const handleExportExcel = () => {
    exportSingleVacationExcel(employee, company, calculation);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:my-0 print:w-full">
        
        {/* Top Action Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                Rəsmi Məzuniyyət Haqq-Hesab Vərəqəsi
              </h2>
              <p className="text-[11px] text-slate-400">
                Direktor imzası, möhür yeri və AR Əmək Məcəlləsinə uyğun sənəd
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Excel formatında saxla"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="PDF kimi yadda saxla və ya A4 çap et"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF kimi Çap et</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official A4 Document Container */}
        <div 
          id="official-vacation-sheet"
          className="p-6 sm:p-10 overflow-y-auto print:overflow-visible print:p-8 space-y-6 text-slate-900 bg-white"
          style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
        >
          {/* Document Header / Company Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-10 h-10 object-contain rounded-md"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-md flex items-center justify-center font-sans font-black text-sm">
                      {company.name.slice(0, 2).toUpperCase() || 'AR'}
                    </div>
                  )}
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 uppercase font-sans">
                      {company.name || 'MÜƏSSİSƏ / ŞİRKƏT'}
                    </h1>
                    {company.voen && (
                      <p className="text-xs text-slate-600 font-sans">
                        VÖEN: <strong className="text-slate-900">{company.voen}</strong>
                      </p>
                    )}
                  </div>
                </div>
                {company.address && (
                  <p className="text-[11px] text-slate-500 font-sans pt-1">
                    Ünvan: {company.address} {company.phone ? `| Tel: ${company.phone}` : ''}
                  </p>
                )}
              </div>

              <div className="text-right space-y-0.5 font-sans">
                <span className="inline-block px-2.5 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider">
                  Rəsmi Sənəd
                </span>
                <p className="text-xs text-slate-700 font-medium">
                  Əmr / Vərəqə №: <strong>{orderNum}</strong>
                </p>
                <p className="text-xs text-slate-600">
                  Tərtib tarixi: <strong>{todayStr}</strong>
                </p>
              </div>
            </div>

            <div className="text-center mt-6">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-950 underline decoration-slate-400 underline-offset-4">
                Məzuniyyət Haqqının Hesablanması Vərəqəsi
              </h2>
              <p className="text-xs text-slate-600 font-sans mt-1">
                (Azərbaycan Respublikası Əmək Məcəlləsinin 140-cı maddəsinə uyğun olaraq)
              </p>
            </div>
          </div>

          {/* Section 1: Employee Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-lg border border-slate-200 font-sans">
            <div>
              <span className="text-slate-500 block text-[11px]">İşçinin Soyadı, Adı, Atasının adı:</span>
              <strong className="text-slate-900 text-sm">{employee.empName || '–'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Vəzifəsi:</span>
              <strong className="text-slate-900 text-sm">{employee.empPosition || '–'}</strong>
            </div>
            {employee.department && (
              <div>
                <span className="text-slate-500 block text-[11px]">Struktur Bölmə / Departament:</span>
                <span className="text-slate-900 font-semibold">{employee.department}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 block text-[11px]">Hesablama üçün nəzərə alınan dövr:</span>
              <span className="text-slate-900 font-semibold">{calculation.months} işlənmiş təqvim ayı</span>
            </div>
          </div>

          {/* Section 2: Salary & Base Metrics Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans mb-2 border-b border-slate-200 pb-1">
              1. Orta Əməkhaqqı Göstəriciləri
            </h3>
            <table className="w-full text-left text-xs border-collapse border border-slate-300 font-sans">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="p-2 border-r border-slate-300 w-2/3">
                    İşlədiyi dövr ({calculation.months} ay) üzrə cəmi vəzifə maaşı:
                  </td>
                  <td className="p-2 font-bold text-right border-r border-slate-300">
                    {formatAZN(employee.params.sal12)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 border-r border-slate-300">
                    Dövr üzrə nəzərə alınan mükafatlar və əlavə ödənişlər:
                  </td>
                  <td className="p-2 font-bold text-right border-r border-slate-300">
                    {formatAZN(employee.params.bon12)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50 font-bold">
                  <td className="p-2 border-r border-slate-300">
                    Cəmi qazanc (Vəzifə maaşı + Mükafatlar):
                  </td>
                  <td className="p-2 text-right text-emerald-800 border-r border-slate-300">
                    {formatAZN(calculation.totalIncome)}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 border-r border-slate-300">
                    Cari aydakı vəzifə maaşı / İş günlərinin sayı:
                  </td>
                  <td className="p-2 text-right border-r border-slate-300">
                    {formatAZN(employee.params.msal)} / {employee.params.wdays} iş günü
                  </td>
                </tr>
                <tr className="bg-slate-100/70">
                  <td className="p-2 border-r border-slate-300">
                    <strong>Müqayisəli günlük dərəcələr:</strong>
                    <div className="text-[11px] text-slate-500 font-normal">
                      Orta təqvim günü qazancı (Cəmi ÷ {calculation.months} ÷ 30.4) vs Orta iş günü qazancı (Maaş ÷ {employee.params.wdays})
                    </div>
                  </td>
                  <td className="p-2 text-right border-r border-slate-300 font-semibold">
                    <div>Təqvim: <strong className="text-slate-900">{formatAZN(calculation.calDayRate)}</strong></div>
                    <div>İş günü: <strong className="text-slate-900">{formatAZN(calculation.workDayRate)}</strong></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Vacation Periods & Calculations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans mb-2 border-b border-slate-200 pb-1">
              2. Məzuniyyət Müddətləri və Hesablanmış Məbləğlər
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300 font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                    <th className="p-2 border-r border-slate-300 text-center w-8">№</th>
                    <th className="p-2 border-r border-slate-300">Məzuniyyət Dövrü</th>
                    <th className="p-2 border-r border-slate-300 text-center">Təqvim Günü</th>
                    <th className="p-2 border-r border-slate-300 text-center">İş Günü</th>
                    <th className="p-2 border-r border-slate-300 text-right">Təqvim Hesabı (₼)</th>
                    <th className="p-2 border-r border-slate-300 text-right">İş Günü Hesabı (₼)</th>
                    <th className="p-2 border-r border-slate-300 text-center">Tətbiq Metodu</th>
                    <th className="p-2 text-right">Ödəniləcək Məbləğ</th>
                  </tr>
                </thead>
                <tbody>
                  {calculation.items.map((item, idx) => {
                    const isSingle = item.vacation.mode === 'single';
                    return (
                      <tr key={item.vacation.id || idx} className="border-b border-slate-200 hover:bg-slate-50/50">
                        <td className="p-2 border-r border-slate-300 text-center text-slate-500 font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-medium">
                          {isSingle ? (
                            <span>{item.vacation.startDate || '–'} (Tək gün)</span>
                          ) : (
                            <span>
                              {item.vacation.startDate || '–'} — {item.vacation.endDate || '–'}
                            </span>
                          )}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-semibold">
                          {item.vacation.calDays}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-semibold">
                          {item.vacation.workDays}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-right text-slate-600">
                          {formatAZN(item.calAmt)}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-right text-slate-600">
                          {formatAZN(item.workAmt)}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold text-[11px]">
                          <span className={`inline-block px-1.5 py-0.5 rounded ${
                            item.usesCal ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.usesCal ? 'Təqvim günü' : 'İş günü'}
                          </span>
                        </td>
                        <td className="p-2 text-right font-black text-slate-950">
                          {formatAZN(item.pay)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td colSpan={7} className="p-2.5 text-right uppercase tracking-wider text-slate-800">
                      Cəmi Ödəniləcək Məzuniyyət Haqqı:
                    </td>
                    <td className="p-2.5 text-right text-sm font-black text-emerald-800">
                      {formatAZN(calculation.grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Amount in words */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-lg font-sans text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-emerald-900 font-bold block">Məbləğ sözlə:</span>
              <span className="text-slate-800 font-medium italic text-sm">
                "{numberToAzWords(calculation.grandTotal)}"
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 block">Yekun məbləğ:</span>
              <span className="text-base font-black text-emerald-800">
                {formatAZN(calculation.grandTotal)}
              </span>
            </div>
          </div>

          {/* Legal Note */}
          <div className="text-[11px] text-slate-600 font-sans border-l-2 border-slate-400 pl-3 leading-relaxed">
            <p>
              <strong>Qeyd:</strong> Bu hesabat Azərbaycan Respublikasının Əmək Məcəlləsinin 140-cı maddəsinin tələblərinə uyğun olaraq tərtib edilmişdir. Məzuniyyət haqqı məzuniyyətin başlanmasına ən geci 3 gün qalmış işçiyə tam ödənilməlidir.
            </p>
          </div>

          {/* Section 4: OFFICIAL SIGNATURES & STAMP AREA (MÖHÜR VƏ İMZA YERİ) */}
          <div className="pt-8 border-t-2 border-slate-900 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-end">
              
              {/* 1. Direktor (Müəssisə Rəhbəri) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase">
                  Müəssisə Rəhbəri (Direktor)
                </div>
                <div className="text-xs text-slate-700">
                  {company.directorName || '_________________________________'}
                </div>
                <div className="border-b border-slate-800 pt-5"></div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>İmza: ____________</span>
                  <span>Tarix: ____/____/2026</span>
                </div>
              </div>

              {/* 2. Möhür Yeri (Company Stamp) */}
              <div className="flex flex-col items-center justify-center p-2">
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-center p-2 relative text-slate-400 select-none">
                  <span className="text-xs font-bold text-slate-500 tracking-wider">M. Y.</span>
                  <span className="text-[9px] text-slate-400 leading-tight mt-1">
                    Möhür üçün yer
                  </span>
                  {company.voen && (
                    <span className="text-[8px] text-slate-400 mt-1">
                      {company.voen}
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Baş Mühasib / HR */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase">
                  Baş Mühasib / HR Rəhbəri
                </div>
                <div className="text-xs text-slate-700">
                  {company.accountantName || '_________________________________'}
                </div>
                <div className="border-b border-slate-800 pt-5"></div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>İmza: ____________</span>
                  <span>Tarix: ____/____/2026</span>
                </div>
              </div>

            </div>

            {/* Employee Acknowledgment */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
              <div>
                <strong>İşçi ilə razılaşdırılma:</strong> Hesablama qaydası və məbləğlə tanış oldum.
              </div>
              <div className="flex items-center gap-6">
                <span>İşçinin imzası: ____________________</span>
                <span>Tarix: ____/____/2026</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
