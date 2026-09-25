import React, { useState, useMemo } from 'react';
import { 
  SectorType, 
  CalculationDirection, 
  calculateFromGross, 
  calculateFromNet, 
  formatAZN, 
  CalculiaBreakdown 
} from '../../services/salaryCalculator';
import { 
  Calculator, 
  Copy, 
  Check, 
  Briefcase, 
  Building2, 
  HelpCircle,
  TrendingUp,
  Receipt,
  ArrowRightLeft,
  ShieldCheck
} from 'lucide-react';

interface SalaryCalculatorViewProps {
  onExploreJobs?: () => void;
}

export const SalaryCalculatorView: React.FC<SalaryCalculatorViewProps> = ({ onExploreJobs }) => {
  const [direction, setDirection] = useState<CalculationDirection>('gross');
  const [amountInput, setAmountInput] = useState<string>('1500');
  const [sector, setSector] = useState<SectorType>('private');
  const [copied, setCopied] = useState(false);

  const numericAmount = parseFloat(amountInput) || 0;

  // Run calculation
  const result: CalculiaBreakdown = useMemo(() => {
    if (direction === 'gross') {
      return calculateFromGross(numericAmount, sector, 'main', 0, []);
    } else {
      return calculateFromNet(numericAmount, sector, 'main', 0, []);
    }
  }, [direction, numericAmount, sector]);

  const quickAmounts = [500, 1000, 1500, 2000, 3000, 5000];

  const handleCopySummary = () => {
    const extraEmployer = result.employerDsmf + result.employerHealthInsurance + result.employerUnemployment;
    const text = `📊 Maaş Hesabatı (Jobia.az)
Sektor: ${sector === 'private' ? 'Qeyri-dövlət (Qeyri-neft)' : 'Dövlət / Neft-qaz'}
${direction === 'gross' ? 'Ümumi (Gross) Maaş' : 'Tələb olunan Gross'}: ${formatAZN(result.gross)}
Xalis Ələ Çatan (Net) Maaş: ${formatAZN(result.net)}

İşçidən Tutulmalar:
- Gəlir Vergisi: ${formatAZN(result.incomeTax)}
- DSMF (Sosial sığorta): ${formatAZN(result.dsmf)}
- İcbari Tibbi Sığorta: ${formatAZN(result.healthInsurance)}
- İşsizlik Sığortası: ${formatAZN(result.unemployment)}
Cəmi Tutulma: ${formatAZN(result.totalEmployeeDeductions)}

İşəgötürənin Xərci:
- Ümumi Şirkət Xərci: ${formatAZN(result.totalEmployerCost)} (Əlavə xərc: +${formatAZN(extraEmployer)})`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Maaşını hesabla
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              AR Vergi Məcəlləsinə uyğun xalis (Net) və ümumi (Gross) əmək haqqı hesablayıcısı
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="self-start md:self-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          title="Hesabatı kopyala"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Kopyalandı!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-600" />
              <span>Nəticəni Kopyala</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Inputs (Left) and Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* Left Column: Input Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            
            {/* 1. Direction: Gross -> Net vs Net -> Gross */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                Hesablama növü
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDirection('gross')}
                  className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    direction === 'gross'
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Gross ➔ Net</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('net')}
                  className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    direction === 'net'
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Net ➔ Gross</span>
                </button>
              </div>
            </div>

            {/* 2. Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {direction === 'gross' ? 'Maaş məbləği (Gross)' : 'Ələ çatan məbləğ (Net)'}
                </label>
                <span className="text-xs font-bold text-slate-400">AZN (₼)</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="Məs: 1500"
                  className="w-full text-lg sm:text-xl font-black text-slate-900 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">
                  ₼
                </span>
              </div>

              {/* Quick Select Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Sürətli:</span>
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountInput(amt.toString())}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      numericAmount === amt
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {amt} ₼
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Sector Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                Fəaliyyət sektoru
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSector('private')}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    sector === 'private'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${sector === 'private' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Qeyri-dövlət & Qeyri-neft sektoru</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">
                        0% Vergi Güzəşti
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      8000 ₼-dək gəlir vergisindən azad edilmiş standart özəl şirkətlər
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSector('state')}
                  className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    sector === 'state'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${sector === 'state' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      Dövlət / Neft-qaz sektoru
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Dövlət büdcəsindən maliyyələşən müəssisələr və neft-qaz sahəsi (14% vergi)
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Hesablama Azərbaycan Respublikasının 2026-cı il üçün qüvvədə olan Vergi Məcəlləsi və Sosial Sığorta haqqında qanunvericiliyinə tam uyğundur.
              </span>
            </div>

          </div>
        </div>

        {/* Right Column: Clear Results */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Main Result Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-100">
                {direction === 'gross' ? 'Xalis Ələ Çatan Maaş (Net)' : 'Tələb Olunan Ümumi Maaş (Gross)'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">
                {direction === 'gross' ? 'Kartınıza yatan' : 'Müqavilə məbləği'}
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight flex items-baseline gap-1">
                <span>{direction === 'gross' ? formatAZN(result.net) : formatAZN(result.gross)}</span>
              </div>
              <div className="text-xs text-blue-100 mt-1 font-medium">
                {direction === 'gross' ? (
                  <>Müqavilə (Gross) məbləği: <span className="font-bold text-white">{formatAZN(result.gross)}</span></>
                ) : (
                  <>Xalis ələ çatan (Net) məbləğ: <span className="font-bold text-white">{formatAZN(result.net)}</span></>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                İşçidən Tutulmalar
              </span>
              <span className="text-xs font-black text-rose-600">
                -{formatAZN(result.totalEmployeeDeductions)}
              </span>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Gəlir Vergisi</span>
                <span className="font-bold text-slate-900">{formatAZN(result.incomeTax)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">DSMF (Sosial sığorta)</span>
                <span className="font-bold text-slate-900">{formatAZN(result.dsmf)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">İcbari Tibbi Sığorta (İTS)</span>
                <span className="font-bold text-slate-900">{formatAZN(result.healthInsurance)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">İşsizlikdən sığorta</span>
                <span className="font-bold text-slate-900">{formatAZN(result.unemployment)}</span>
              </div>
            </div>

            {/* Employer Cost Summary */}
            <div className="pt-3 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">İşəgötürənin Ümumi Xərci</div>
                  <div className="text-[10px] text-slate-500">
                    Gross + Şirkət sığortaları (+{formatAZN(result.employerDsmf + result.employerHealthInsurance + result.employerUnemployment)})
                  </div>
                </div>
                <div className="text-sm sm:text-base font-black text-slate-900">
                  {formatAZN(result.totalEmployerCost)}
                </div>
              </div>
            </div>

          </div>

          {/* Action button: Explore jobs */}
          {onExploreJobs && (
            <button
              type="button"
              onClick={onExploreJobs}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Bu maaş aralığında olan vakansiyalara bax</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
