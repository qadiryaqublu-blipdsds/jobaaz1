import React, { useState, useMemo, useEffect } from 'react';
import { 
  CalculationBasis, 
  SalaryCalculatorParams, 
  SalaryCalculationResult, 
  calculateGrossToNet, 
  calculateNetToGross, 
  money 
} from '../../services/salaryCalculator';
import { 
  Calculator, 
  Copy, 
  Check, 
  Briefcase, 
  Building2, 
  TrendingUp, 
  ArrowRightLeft, 
  ShieldCheck, 
  Info, 
  Receipt, 
  Sparkles,
  HelpCircle,
  Percent,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface SalaryCalculatorViewProps {
  onExploreJobs?: () => void;
}

export const SalaryCalculatorView: React.FC<SalaryCalculatorViewProps> = ({ onExploreJobs }) => {
  // 1. Core State
  const [basis, setBasis] = useState<CalculationBasis>('gross');
  const [salaryInput, setSalaryInput] = useState<string>('2000');
  const [sector, setSector] = useState<'private_non_oil' | 'private_oil' | 'public'>('private_non_oil');
  const [taxBenefit, setTaxBenefit] = useState<number>(0);
  const [lifeInsurance, setLifeInsurance] = useState<string>('0');
  
  // Toggles
  const [deductionEnabled, setDeductionEnabled] = useState<boolean>(false);
  const [deductionAmount, setDeductionAmount] = useState<string>('0');
  
  const [additionEnabled, setAdditionEnabled] = useState<boolean>(false);
  const [additionAmount, setAdditionAmount] = useState<string>('0');
  
  const [unionFee, setUnionFee] = useState<string>('0');

  // UI state
  const [copied, setCopied] = useState(false);

  // Quick select pills
  const quickAmounts = [500, 1000, 1500, 2000, 3000, 5000];

  const salaryNum = Math.max(0, parseFloat(salaryInput) || 0);

  // Calculate live result
  const result: SalaryCalculationResult = useMemo(() => {
    const params: SalaryCalculatorParams = {
      sector,
      taxBenefit,
      lifeInsurance: Math.max(0, parseFloat(lifeInsurance) || 0),
      deductionEnabled,
      deduction: deductionEnabled ? Math.max(0, parseFloat(deductionAmount) || 0) : 0,
      additionEnabled,
      addition: additionEnabled ? Math.max(0, parseFloat(additionAmount) || 0) : 0,
      unionFee: Math.max(0, parseFloat(unionFee) || 0),
    };

    if (basis === 'gross') {
      return calculateGrossToNet(salaryNum, params);
    } else {
      return calculateNetToGross(salaryNum, params);
    }
  }, [
    basis, 
    salaryNum, 
    sector, 
    taxBenefit, 
    lifeInsurance, 
    deductionEnabled, 
    deductionAmount, 
    additionEnabled, 
    additionAmount, 
    unionFee
  ]);

  // Copy full report summary
  const handleCopySummary = () => {
    const text = `📊 Əmək Haqqı Hesabatı (Jobia.az)
Hesablama Növü: ${basis === 'gross' ? 'Gross ➔ Net' : 'Net ➔ Gross'}
Sektor: ${
      sector === 'private_non_oil' 
        ? 'Özəl sektor – qeyri-neft/qaz' 
        : sector === 'private_oil' 
        ? 'Özəl sektor – neft/qaz' 
        : 'Dövlət sektoru'
    }
Müqavilə (Gross) Məbləği: ${money(result.gross)}
Vergiyə Cəlb Olunan Məbləğ: ${money(result.taxableIncome)} (Güzəşt: ${money(result.benefit)})
Xalis Ələ Çatan (Net) Maaş: ${money(result.net)}

İşçidən Tutulmalar:
- Gəlir Vergisi: ${money(result.incomeTax)}
- İşçi Sosial Sığorta: ${money(result.employeeSocial)}
- İşçi Tibbi Sığorta: ${money(result.employeeMedical)}
- İşsizlik Sığortası: ${money(result.employeeUnemployment)}
- Digər Tutulmalar: ${money(result.otherDeductions)}

İşəgötürənin Ümumi Xərci:
- İşəgötürən Sosial Sığorta: ${money(result.employerSocial)}
- İşəgötürən Tibbi Sığorta: ${money(result.employerMedical)}
- İşəgötürən İşsizlik Sığortası: ${money(result.employerUnemployment)}
Cəmi Şirkət Xərci: ${money(result.employerCost)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Keyboard Enter key trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Form reacts dynamically
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 text-slate-800 animate-fade-in font-sans">
      
      {/* Platform Standard Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              AR 2026 Vergi Qanunvericiliyi
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Əmək Haqqı Kalkulyatoru
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Gross → Net və Net → Gross əmək haqqı, vergi və sığorta haqlarının rəsmi hesablanması
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="self-start md:self-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Bütün hesabatı kopyala"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Hesabat Kopyalandı!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-600" />
              <span>Hesabatı Kopyala</span>
            </>
          )}
        </button>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ƏSAS MƏLUMATLAR (INPUT CONTROLS) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <span>Əsas məlumatlar</span>
            </h2>

            {/* 1. Radio Group: Gross -> Net vs Net -> Gross */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Hesablama növü
              </label>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setBasis('gross')}
                  className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    basis === 'gross'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Gross ➔ Net</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBasis('net')}
                  className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    basis === 'net'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Net ➔ Gross</span>
                </button>
              </div>
            </div>

            {/* 2. Salary Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {basis === 'gross' ? 'Gross əmək haqqı (AZN)' : 'İstənilən Net əmək haqqı (AZN)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  placeholder="Məs: 2000"
                  className="w-full text-xl sm:text-2xl font-black text-slate-900 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-inner"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
                  AZN
                </span>
              </div>

              {/* Quick Select Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Sürətli:</span>
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSalaryInput(amt.toString())}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      salaryNum === amt
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {amt} ₼
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Sektor Seçimi */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Sektor
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition cursor-pointer shadow-xs"
              >
                <option value="private_non_oil">Özəl sektor – qeyri-neft/qaz</option>
                <option value="private_oil">Özəl sektor – neft/qaz</option>
                <option value="public">Dövlət sektoru</option>
              </select>
            </div>

            {/* 4. Vergi Güzəşti */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Vergi güzəşti
              </label>
              <select
                value={taxBenefit}
                onChange={(e) => setTaxBenefit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition cursor-pointer shadow-xs"
              >
                <option value="0">Güzəşt yoxdur – 0 AZN</option>
                <option value="200">200 AZN</option>
                <option value="400">400 AZN</option>
                <option value="800">800 AZN</option>
              </select>
              <p className="text-[11px] text-slate-500 leading-snug">
                Güzəşt əmək haqqından çıxılır və qalan məbləğ gəlir vergisinin hesablanması üçün baza kimi götürülür.
              </p>
            </div>

            {/* 5. Həyatın yığım sığortası (HYS) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Həyatın yığım sığortası (HYS), AZN
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={lifeInsurance}
                onChange={(e) => setLifeInsurance(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition shadow-xs"
              />
              <p className="text-[11px] text-slate-500">
                HYS ayrıca tutulma kimi göstərilir.
              </p>
            </div>

            {/* 6. Maaş tutulması əlavə et (Switch) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between py-2">
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  Maaş tutulması əlavə et
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deductionEnabled}
                    onChange={(e) => setDeductionEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {deductionEnabled && (
                <div className="mt-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Tutulma məbləği (AZN)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(e.target.value)}
                    placeholder="Məs: 50"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:border-blue-600 outline-none"
                  />
                </div>
              )}
            </div>

            {/* 7. Maaş əlavəsi əlavə et (Switch) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between py-2">
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  Maaş əlavəsi əlavə et
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={additionEnabled}
                    onChange={(e) => setAdditionEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {additionEnabled && (
                <div className="mt-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Əlavə məbləğ (AZN)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={additionAmount}
                    onChange={(e) => setAdditionAmount(e.target.value)}
                    placeholder="Məs: 100"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:border-blue-600 outline-none"
                  />
                </div>
              )}
            </div>

            {/* 8. Həmkarlar ittifaqı haqqı */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Həmkarlar ittifaqı haqqı
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unionFee}
                onChange={(e) => setUnionFee(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition shadow-xs"
              />
              <p className="text-[11px] text-slate-500">
                Faktiki tutulacaq məbləği daxil edin.
              </p>
            </div>

            {/* Hesabla Button */}
            <button
              type="button"
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-98"
            >
              Hesabla
            </button>

          </div>
        </div>

        {/* RIGHT COLUMN: NƏTİCƏLƏR & DÜSTUR İZAHI */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Nəticə</span>
              </span>
              <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                {basis === 'gross' ? 'Gross ➔ Net' : 'Net ➔ Gross'}
              </span>
            </h2>

            {/* Big Primary Highlight Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                  {basis === 'gross' ? 'Hesablanmış Net əmək haqqı' : 'Tələb Olunan Gross əmək haqqı'}
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-400">
                  {basis === 'gross' ? money(result.net) : money(result.gross)}
                </div>
                <div className="text-xs text-slate-300 mt-2 flex items-center gap-2">
                  <span>Müqavilə (Gross): <strong className="text-white">{money(result.gross)}</strong></span>
                  <span>•</span>
                  <span>Xalis (Net): <strong className="text-white">{money(result.net)}</strong></span>
                </div>
              </div>
            </div>

            {/* 8 Items Result Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition">
                <div className="text-xs text-slate-500 font-medium mb-1">Gross əmək haqqı</div>
                <div className="text-base sm:text-lg font-black text-slate-900">
                  {money(result.gross)}
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition">
                <div className="text-xs text-slate-500 font-medium mb-1">Vergiyə cəlb olunan məbləğ</div>
                <div className="text-base sm:text-lg font-black text-slate-900">
                  {money(result.taxableIncome)}
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition">
                <div className="text-xs text-slate-500 font-medium mb-1">Gəlir vergisi</div>
                <div className="text-base sm:text-lg font-black text-rose-600">
                  {money(result.incomeTax)}
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition">
                <div className="text-xs text-slate-500 font-medium mb-1">İşçi sosial sığorta</div>
                <div className="text-base sm:text-lg font-black text-rose-600">
                  {money(result.employeeSocial)}
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition">
                <div className="text-xs text-slate-500 font-medium mb-1">İşçi tibbi sığorta</div>
                <div className="text-base sm:text-lg font-black text-rose-600">
                  {money(result.employeeMedical)}
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition">
                <div className="text-xs text-slate-500 font-medium mb-1">İşsizlik sığortası</div>
                <div className="text-base sm:text-lg font-black text-rose-600">
                  {money(result.employeeUnemployment)}
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition">
                <div className="text-xs text-slate-500 font-medium mb-1">Digər tutulmalar</div>
                <div className="text-base sm:text-lg font-black text-amber-600">
                  {money(result.otherDeductions)}
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-xl p-3.5 bg-blue-50/50 hover:bg-blue-50 transition border-blue-200">
                <div className="text-xs text-blue-700 font-bold mb-1">İşəgötürənin ümumi xərci</div>
                <div className="text-base sm:text-lg font-black text-blue-900">
                  {money(result.employerCost)}
                </div>
              </div>
            </div>

            {/* İşəgötürən üzrə ödənişlər section */}
            <div className="pt-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>İşəgötürən üzrə ödənişlər</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium">İşəgötürən sosial sığorta</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {money(result.employerSocial)}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium">İşəgötürən tibbi sığorta</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {money(result.employerMedical)}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="text-[11px] text-slate-500 font-medium">İşəgötürən işsizlik sığortası</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {money(result.employerUnemployment)}
                  </div>
                </div>
              </div>
            </div>

            {/* İzahlı Düstur Bloku (Formula Breakdown) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs leading-relaxed text-slate-700">
              <div>Gross əmək haqqı: <strong>{money(result.gross)}</strong></div>
              <div>− Güzəşt: <strong>{money(result.benefit)}</strong></div>
              <div className="font-bold text-slate-900 pt-0.5">= Vergiyə cəlb olunan məbləğ: {money(result.taxableIncome)}</div>
              <div className="my-2 border-t border-slate-200" />
              <div>Gəlir vergisi: <span className="text-rose-600 font-bold">{money(result.incomeTax)}</span></div>
              <div>İşçi sosial sığorta: <span className="text-rose-600 font-bold">{money(result.employeeSocial)}</span></div>
              <div>İşçi tibbi sığorta: <span className="text-rose-600 font-bold">{money(result.employeeMedical)}</span></div>
              <div>İşçi işsizlik sığortası: <span className="text-rose-600 font-bold">{money(result.employeeUnemployment)}</span></div>
              {result.otherDeductions > 0 && (
                <div>Digər tutulmalar: <span className="text-amber-600 font-bold">{money(result.otherDeductions)}</span></div>
              )}
              <div className="mt-2 pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                Net əmək haqqı: <span className="text-emerald-600">{money(result.net)}</span>
              </div>
            </div>

            {/* Tamamlandı Message */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Hesablama tamamlandı. Güzəşt yalnız gəlir vergisinin hesablandığı vergiyə cəlb olunan gəlirin müəyyən edilməsində nəzərə alınıb.
              </span>
            </div>

            {/* Explore Jobs Action */}
            {onExploreJobs && (
              <button
                type="button"
                onClick={onExploreJobs}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Bu maaş aralığında olan vakansiyalara bax</span>
              </button>
            )}

          </div>
        </div>

      </div>

      {/* FULL-WIDTH CARD: GÜZƏŞTİN HESABLANMA MƏNTİQİ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span>Güzəştin hesablanma məntiqi</span>
        </h2>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm leading-relaxed text-slate-700">
          <p>
            <strong>Gross əmək haqqı</strong> − <strong>Vergi güzəşti</strong> = <strong>Vergiyə cəlb olunan gəlir</strong>
          </p>
          <p className="mt-2 text-slate-600">
            Vergiyə cəlb olunan gəlir → Gəlir vergisi hesablanır
          </p>
          <p className="mt-2 text-slate-500 text-xs">
            Digər sosial sığorta və tibbi sığorta tutulmaları öz qanuni bazası üzrə ayrıca hesablanır.
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Nümunə:</strong> Gross əmək haqqı <strong>2,000 AZN</strong> və güzəşt <strong>200 AZN</strong>-dirsə, gəlir vergisinin bazası <strong>1,800 AZN</strong> olur.
          </div>
        </div>
      </div>

    </div>
  );
};
