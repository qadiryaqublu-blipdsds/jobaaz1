import * as XLSX from 'xlsx';

export interface VacationPeriod {
  id: number;
  startDate: string;
  endDate: string;
  mode: 'range' | 'single';
  calDays: number;
  workDays: number;
}

export interface VacationParams {
  workedMonthsType: '12' | 'custom';
  customMonths: number;
  sal12: number; // İşlədiyi dövr üzrə vəzifə maaşı cəmi (₼)
  bon12: number; // Nəzərə alınan mükafatlar (₼)
  msal: number;  // Cari aylıq vəzifə maaşı (₼)
  wdays: number; // Cari aydakı iş günlərinin sayı (məs: 22)
}

export interface EmployeeVacationRecord {
  id: string;
  empCode?: string;
  empName: string;
  empPosition: string;
  department?: string;
  params: VacationParams;
  vacations: VacationPeriod[];
  calculatedAt?: string;
}

export interface CompanyVacationProfile {
  name: string;
  voen?: string;
  directorName?: string;
  directorTitle?: string;
  accountantName?: string;
  accountantTitle?: string;
  logo?: string;
  address?: string;
  phone?: string;
  orderNumber?: string;
  orderDate?: string;
}

export interface VacationItemResult {
  vacation: VacationPeriod;
  calAmt: number;
  workAmt: number;
  pay: number;
  usesCal: boolean;
}

export interface VacationCalculationResult {
  months: number;
  totalIncome: number;
  calDayRate: number;
  workDayRate: number;
  items: VacationItemResult[];
  grandTotal: number;
}

export function formatAZN(n: number): string {
  if (isNaN(n)) return '0.00 ₼';
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₼';
}

export function formatNum(n: number): number {
  return parseFloat(Number(n || 0).toFixed(2));
}

export function calcDates(start: string, end?: string): { calDays: number; workDays: number } {
  if (!start) return { calDays: 1, workDays: 1 };
  const s = new Date(start);
  const e = end ? new Date(end) : new Date(start);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) {
    return { calDays: 1, workDays: 1 };
  }
  const calDays = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
  let wd = 0;
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) wd++;
  }
  return { calDays, workDays: Math.max(0, wd) };
}

export function calculateVacationPay(
  params: VacationParams,
  vacations: VacationPeriod[]
): VacationCalculationResult {
  const months = params.workedMonthsType === '12' ? 12 : Math.min(11, Math.max(1, params.customMonths || 1));
  const sal12 = Number(params.sal12) || 0;
  const bon12 = Number(params.bon12) || 0;
  const msal = Number(params.msal) || 0;
  const wdays = Math.max(1, Number(params.wdays) || 22);

  const totalIncome = sal12 + bon12;
  const calDayRate = months > 0 ? totalIncome / months / 30.4 : 0;
  const workDayRate = wdays > 0 ? msal / wdays : 0;

  let grandTotal = 0;
  const items: VacationItemResult[] = (vacations || []).map((v) => {
    const calAmt = calDayRate * (v.calDays || 0);
    const workAmt = workDayRate * (v.workDays || 0);
    const pay = Math.max(calAmt, workAmt);
    grandTotal += pay;
    return {
      vacation: v,
      calAmt,
      workAmt,
      pay,
      usesCal: calAmt >= workAmt,
    };
  });

  return {
    months,
    totalIncome,
    calDayRate,
    workDayRate,
    items,
    grandTotal,
  };
}

/**
 * Converts a numeric amount into Azerbaijani words for official documentation.
 * e.g. 3485.52 => "Üç min dörd yüz səksən beş manat 52 qəpik"
 */
export function numberToAzWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Sıfır manat 00 qəpik';
  const units = ['', 'bir', 'iki', 'üç', 'dörd', 'beş', 'altı', 'yeddi', 'səkkiz', 'doqquz'];
  const tens = ['', 'on', 'iyirmi', 'otuz', 'qırx', 'əlli', 'altmış', 'yetmiş', 'səksən', 'doxsan'];

  function convertGroup(n: number): string {
    let res = '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (h > 0) {
      if (h === 1) res += 'yüz ';
      else res += units[h] + ' yüz ';
    }
    if (t > 0) {
      res += tens[t] + ' ';
    }
    if (u > 0) {
      res += units[u] + ' ';
    }
    return res.trim();
  }

  const intPart = Math.floor(Math.abs(amount));
  const fracPart = Math.round((Math.abs(amount) - intPart) * 100);

  if (intPart === 0) {
    return `Sıfır manat ${fracPart.toString().padStart(2, '0')} qəpik`;
  }

  const millions = Math.floor(intPart / 1000000);
  const thousands = Math.floor((intPart % 1000000) / 1000);
  const remainder = intPart % 1000;

  let words = '';
  if (millions > 0) {
    if (millions === 1) words += 'bir milyon ';
    else words += convertGroup(millions) + ' milyon ';
  }
  if (thousands > 0) {
    if (thousands === 1) words += 'min ';
    else words += convertGroup(thousands) + ' min ';
  }
  if (remainder > 0) {
    words += convertGroup(remainder) + ' ';
  }

  words = words.trim();
  // Capitalize first letter
  const formatted = words.charAt(0).toUpperCase() + words.slice(1);
  return `${formatted} manat ${fracPart.toString().padStart(2, '0')} qəpik`;
}

/**
 * Exports single employee calculation to an Excel document.
 */
export function exportSingleVacationExcel(
  emp: EmployeeVacationRecord,
  company: CompanyVacationProfile,
  res: VacationCalculationResult
): void {
  const today = new Date().toLocaleDateString('az-AZ');
  const rows: (string | number)[][] = [];

  rows.push([company.name || 'Müəssisə']);
  if (company.voen) rows.push(['VÖEN:', company.voen]);
  rows.push(['MƏZUNİYYƏT HAQQI HESABLANMASI CƏDVƏLİ']);
  if (company.orderNumber) rows.push(['Sənəd / Əmr №:', company.orderNumber]);
  rows.push(['Hesablama tarixi:', today]);
  rows.push([]);

  rows.push(['İŞÇİ MƏLUMATLARI']);
  rows.push(['İşçinin S.A.A.:', emp.empName || '–']);
  rows.push(['Vəzifəsi:', emp.empPosition || '–']);
  if (emp.department) rows.push(['Departament / Şöbə:', emp.department]);
  rows.push([]);

  rows.push(['HESABLAMA PARAMETRLƏRİ (AR Əmək Məcəlləsi Maddə 140)']);
  rows.push(['İşlədiyi ay sayı', res.months]);
  rows.push(['Vəzifə maaşı cəmi (₼)', formatNum(emp.params.sal12)]);
  rows.push(['Nəzərə alınan mükafatlar (₼)', formatNum(emp.params.bon12)]);
  rows.push(['Cəmi gəlir (₼)', formatNum(res.totalIncome)]);
  rows.push(['Aylıq vəzifə maaşı (₼)', formatNum(emp.params.msal)]);
  rows.push(['İş günlərinin sayı', emp.params.wdays]);
  rows.push(['Günlük orta TƏQVİM qazancı (₼)', formatNum(res.calDayRate)]);
  rows.push(['Günlük orta İŞ qazancı (₼)', formatNum(res.workDayRate)]);
  rows.push([]);

  rows.push(['MƏZUNİYYƏT DÖVRLƏRİ']);
  rows.push([
    '№',
    'Növ',
    'Başlama tarixi',
    'Bitmə tarixi',
    'Təqvim günü',
    'İş günü',
    'Təqvim üzrə (₼)',
    'İş günü üzrə (₼)',
    'Seçilən metod',
    'Ödəniləcək məbləğ (₼)'
  ]);

  res.items.forEach((item, i) => {
    rows.push([
      i + 1,
      item.vacation.mode === 'single' ? 'Tək gün' : 'Aralıq',
      item.vacation.startDate || '–',
      item.vacation.endDate || (item.vacation.mode === 'single' ? item.vacation.startDate : '–'),
      item.vacation.calDays,
      item.vacation.workDays,
      formatNum(item.calAmt),
      formatNum(item.workAmt),
      item.usesCal ? 'Təqvim günü' : 'İş günü',
      formatNum(item.pay)
    ]);
  });

  rows.push([]);
  rows.push(['', '', '', '', '', '', '', '', 'ÜMUMİ CƏM (₼):', formatNum(res.grandTotal)]);
  rows.push(['Sözlə:', numberToAzWords(res.grandTotal)]);
  rows.push([]);
  rows.push(['İMZALAR:']);
  rows.push(['Müəssisə Rəhbəri (Direktor):', company.directorName || '______________________', 'İmza: __________________']);
  rows.push(['Baş Mühasib:', company.accountantName || '______________________', 'İmza: __________________']);
  rows.push(['İşçi (Tanış oldum):', emp.empName || '______________________', 'İmza: __________________']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 13 }, { wch: 11 },
    { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 22 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Məzuniyyət');

  const safeName = (emp.empName || 'Mezuniyyet_Hesabi')
    .replace(/[\/\\?*[\]:']/g, '_')
    .substring(0, 40);
  XLSX.writeFile(wb, `${safeName}_mezuniyyet.xlsx`);
}

/**
 * Bulk / Multi-Employee Excel Export with full statistics and sign-off rows.
 */
export function exportBulkVacationsExcel(
  employees: EmployeeVacationRecord[],
  company: CompanyVacationProfile
): void {
  const today = new Date().toLocaleDateString('az-AZ');
  const rows: (string | number)[][] = [];

  rows.push([company.name || 'Müəssisə']);
  if (company.voen) rows.push(['VÖEN:', company.voen]);
  rows.push(['KÜTLƏVİ MƏZUNİYYƏT HAQQI VƏ ÖDƏNİŞLƏR SİYAHISI']);
  rows.push(['Tarix:', today]);
  if (company.orderNumber) rows.push(['Sərəncam / Əmr №:', company.orderNumber]);
  rows.push([]);

  rows.push([
    '№',
    'İşçinin S.A.A.',
    'Vəzifə',
    'Departament',
    'İşlənmiş Ay',
    'Dövr Maaşı Cəmi (₼)',
    'Mükafatlar (₼)',
    'Aylıq Maaş (₼)',
    'Cari İş Günləri',
    'Təqvim Qazancı (₼/gün)',
    'İş Qazancı (₼/gün)',
    'Məzuniyyət Tarixləri',
    'Cəmi Təqvim Günü',
    'Cəmi İş Günü',
    'Əsas Metod',
    'Ödəniləcək Məzuniyyət Haqqı (₼)'
  ]);

  let totalGrand = 0;
  let totalCalDays = 0;
  let totalWorkDays = 0;

  employees.forEach((emp, i) => {
    const res = calculateVacationPay(emp.params, emp.vacations);
    totalGrand += res.grandTotal;

    const sumCalDays = (emp.vacations || []).reduce((acc, v) => acc + (v.calDays || 0), 0);
    const sumWorkDays = (emp.vacations || []).reduce((acc, v) => acc + (v.workDays || 0), 0);
    totalCalDays += sumCalDays;
    totalWorkDays += sumWorkDays;

    const datesSummary = (emp.vacations || [])
      .map((v) => (v.startDate ? `${v.startDate} - ${v.endDate || v.startDate}` : '–'))
      .join('; ');

    const dominantMethod = res.items.some((it) => !it.usesCal) ? 'İş günü' : 'Təqvim günü';

    rows.push([
      i + 1,
      emp.empName || '–',
      emp.empPosition || '–',
      emp.department || '–',
      res.months,
      formatNum(emp.params.sal12),
      formatNum(emp.params.bon12),
      formatNum(emp.params.msal),
      emp.params.wdays,
      formatNum(res.calDayRate),
      formatNum(res.workDayRate),
      datesSummary || '–',
      sumCalDays,
      sumWorkDays,
      dominantMethod,
      formatNum(res.grandTotal)
    ]);
  });

  rows.push([]);
  rows.push([
    '', 'CƏMİ İŞÇİ:', employees.length, '', '', '', '', '', '', '', '',
    'ÜMUMİ GÜNLƏR:', totalCalDays, totalWorkDays,
    'YEKUN MƏZUNİYYƏT FONDU (₼):', formatNum(totalGrand)
  ]);
  rows.push(['Sözlə:', numberToAzWords(totalGrand)]);
  rows.push([]);
  rows.push([]);
  rows.push(['TƏSDİQ ETDİ:']);
  rows.push(['Müəssisə Rəhbəri / Direktor:', company.directorName || '________________________', 'İmza: ___________________', 'Tarix: ___ / ___ / 2026']);
  rows.push(['Baş Mühasib:', company.accountantName || '________________________', 'İmza: ___________________', 'Tarix: ___ / ___ / 2026']);
  rows.push(['M.Y. (Möhür yeri)']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 5 }, { wch: 28 }, { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 18 },
    { wch: 15 }, { wch: 15 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 30 },
    { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 26 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kütləvi Məzuniyyət');

  const compTitle = (company.name || 'Kutlevi').replace(/[\/\\?*[\]:']/g, '_').substring(0, 30);
  XLSX.writeFile(wb, `${compTitle}_Kutlevi_Mezuniyyet_${today.replace(/\./g, '-')}.xlsx`);
}

/**
 * Generates and downloads a pre-formatted Excel template for bulk import.
 */
export function downloadVacationExcelTemplate(): void {
  const rows: (string | number)[][] = [
    ['NÜMUNƏ: Məzuniyyət Hesablama Cədvəli (Bu faylı doldurub sistemə yükləyə bilərsiniz)'],
    [
      'İşçinin S.A.A.',
      'Vəzifə',
      'İşlənmiş Ay (1-12)',
      'Dövr Maaşı Cəmi (₼)',
      'Mükafatlar (₼)',
      'Aylıq Maaş (₼)',
      'Cari Ay İş Günləri',
      'Başlama Tarixi (YYYY-AA-GG)',
      'Bitmə Tarixi (YYYY-AA-GG)'
    ],
    ['Saleh Mirzəyev Araz oğlu', 'Mühasib', 12, 46110.65, 3485.52, 4877.00, 22, '2026-04-09', '2026-04-12'],
    ['Günel İsmayılova Rəşid qızı', 'Aparıcı Mütəxəssis', 12, 21600.00, 1500.00, 1800.00, 22, '2026-05-10', '2026-05-24'],
    ['Murad Quliyev Vəli oğlu', 'Marketoloq', 8, 9600.00, 500.00, 1200.00, 22, '2026-06-01', '2026-06-15']
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 28 }, { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 16 }, { wch: 16 },
    { wch: 18 }, { wch: 24 }, { wch: 24 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sablon');
  XLSX.writeFile(wb, 'Jobia_Mezuniyyet_Sablonu.xlsx');
}

/**
 * Parses an uploaded Excel file and extracts employee records.
 */
export async function parseVacationsFromExcel(file: File): Promise<EmployeeVacationRecord[]> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  if (!rawData || rawData.length < 2) return [];

  // Find header row
  let headerIndex = -1;
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const rowStr = (rawData[i] || []).join(' ').toLowerCase();
    if (rowStr.includes('maaş') || rowStr.includes('ad') || rowStr.includes('vəzifə') || rowStr.includes('vezife')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) headerIndex = 0;

  const records: EmployeeVacationRecord[] = [];

  for (let i = headerIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    const empName = String(row[0] || '').trim();
    if (!empName || empName.toLowerCase().startsWith('nümunə') || empName.toLowerCase().startsWith('cəmi')) {
      continue;
    }

    const empPosition = String(row[1] || 'Mütəxəssis').trim();
    const monthsVal = parseInt(String(row[2])) || 12;
    const sal12 = parseFloat(String(row[3])) || 0;
    const bon12 = parseFloat(String(row[4])) || 0;
    const msal = parseFloat(String(row[5])) || (sal12 / Math.max(1, monthsVal));
    const wdays = parseInt(String(row[6])) || 22;

    const startDate = String(row[7] || '').trim();
    const endDate = String(row[8] || startDate).trim();

    const dates = calcDates(startDate, endDate);

    records.push({
      id: `emp-vac-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      empName,
      empPosition,
      params: {
        workedMonthsType: monthsVal >= 12 ? '12' : 'custom',
        customMonths: Math.max(1, Math.min(11, monthsVal)),
        sal12,
        bon12,
        msal,
        wdays,
      },
      vacations: [
        {
          id: 1,
          startDate: startDate || new Date().toISOString().split('T')[0],
          endDate: endDate || '',
          mode: endDate && endDate !== startDate ? 'range' : 'single',
          calDays: dates.calDays,
          workDays: dates.workDays,
        }
      ]
    });
  }

  return records;
}
