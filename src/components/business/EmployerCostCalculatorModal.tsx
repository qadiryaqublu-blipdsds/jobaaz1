import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calculator, 
  DollarSign, 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  Copy, 
  Check, 
  ArrowRight,
  Info
} from 'lucide-react';
import { calculateFromGross, calculateFromNet, SectorType } from '../../services/salaryCalculator';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface EmployerCostCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSalary?: number;
  onApplySalaryToOffer?: (grossSalary: number, netSalary: number) => void;
}

export const EmployerCostCalculatorModal: React.FC<EmployerCostCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialSalary = 2000,
  onApplySalaryToOffer,
}) => {
  const [calculationMode, setCalculationMode] = useState<'gross' | 'net'>('gross');
  const [salaryInput, setSalaryInput] = useState<number>(initialSalary);
  const [sector, setSector] = useState<SectorType>('private');
  const [hasCopied, setHasCopied] = useState(false);

  // Perform accurate calculations using our certified Azerbaijan 2026 Tax Engine
  const result = useMemo(() => {
    if (calculationMode === 'net') {
      return calculateFromNet(salaryInput, sector);
    }
    return calculateFromGross(salaryInput, sector);
  }, [salaryInput, sector, calculationMode]);

  const totalEmployerContributions = result.employerDsmf + result.employerHealthInsurance + result.employerUnemployment;

  if (!isOpen) return null;

  const handleCopySummary = () => {
    const text = `Jobia.az İşəgötürən Xərc Hesabatı (2026 AR Qanunvericiliyi):
- Gross Maaş: ${result.gross.toFixed(2)} AZN
- İşçinin Net Maaşı: ${result.net.toFixed(2)} AZN
- İşçidən Tutulmalar: Cəmi ${(result.totalEmployeeDeductions).toFixed(2)} AZN (Gəlir vergisi: ${result.incomeTax.toFixed(2)} AZN, DSMF: ${result.dsmf.toFixed(2)} AZN, İTS: ${result.healthInsurance.toFixed(2)} AZN, İşsizlik: ${result.unemployment.toFixed(2)} AZN)
- İşəgötürənin Əlavə Xərci: Cəmi ${totalEmployerContributions.toFixed(2)} AZN (DSMF: ${result.employerDsmf.toFixed(2)} AZN, İTS: ${result.employerHealthInsurance.toFixed(2)} AZN, İşsizlik: ${result.employerUnemployment.toFixed(2)} AZN)
- İşəgötürənə CƏMİ AYLİQ XƏRC: ${result.totalEmployerCost.toFixed(2)} AZN
- İşəgötürənə CƏMİ İLLİK XƏRC: ${(result.totalEmployerCost * 12).toFixed(2)} AZN`;

    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>İşəgötürən Maaş və Vergi Kalkulyatoru</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  2026 AR Vergi Məcəlləsi
                </span>
              </h3>
              <p className="text-xs text-blue-100">
                Namizədin net maaşı, şirkətin vergi/DSMF öhdəliyi və ümumi aylıq/illik xərc simulyasiyası
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form & Interactive Controls */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Input Direction */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Hesablama İstiqaməti</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalculationMode('gross')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    calculationMode === 'gross'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Gross (Müqavilə Maaşı)
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationMode('net')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    calculationMode === 'net'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Net (Ələ Çatan)
                </button>
              </div>
            </div>

            {/* Sector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Müəssisənin Fəaliyyət Sektoru</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSector('private')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sector === 'private'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Qeyri-Neft / Özəl
                </button>
                <button
                  type="button"
                  onClick={() => setSector('state')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sector === 'state'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Dövlət / Neft-Qaz
                </button>
              </div>
            </div>
          </div>

          {/* Salary Value Input & Slider */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Daxil Edilən Məbləğ ({calculationMode === 'gross' ? 'Gross' : 'Net'})</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="345"
                  max="50000"
                  step="50"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-32 py-1.5 px-3 text-right font-black text-sm rounded-lg border border-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-600 text-xs">AZN</span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="400"
              max="10000"
              step="50"
              value={salaryInput}
              onChange={(e) => setSalaryInput(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[800, 1200, 1800, 2500, 3500, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSalaryInput(preset)}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
                >
                  {preset} AZN
                </button>
              ))}
            </div>
          </div>

          {/* Big Summary Cards (Net vs Employer Total Cost) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Candidate Net */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl p-5 text-white shadow-sm space-y-1">
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider block">
                Namizədin Əlinə Çatacaq (Net Maaş)
              </span>
              <div className="text-3xl font-black tracking-tight">
                {result.net.toFixed(2)} <span className="text-lg font-normal">AZN</span>
              </div>
              <p className="text-[11px] text-emerald-100 pt-1">
                Gross: {result.gross.toFixed(2)} AZN • Vergi və sığorta çıxıldıqdan sonra
              </p>
            </div>

            {/* Employer Total Monthly Cost */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-xl p-5 text-white shadow-sm space-y-1">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">
                İşəgötürənə Cəmi Aylıq Xərc (Total Cost)
              </span>
              <div className="text-3xl font-black tracking-tight">
                {result.totalEmployerCost.toFixed(2)} <span className="text-lg font-normal">AZN</span>
              </div>
              <p className="text-[11px] text-blue-200 pt-1">
                İllik büdcə xərci: <strong className="font-bold text-white">{(result.totalEmployerCost * 12).toFixed(2)} AZN</strong>
              </p>
            </div>
          </div>

          {/* Breakdown Table: Employee Deductions vs Employer Extra Costs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Column A: İşçidən Tutulmalar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between">
                <span>İşçidən Tutulmalar</span>
                <span className="text-rose-600 font-black">-{result.totalEmployeeDeductions.toFixed(2)} AZN</span>
              </h4>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Gəlir Vergisi (İşçi):</span>
                  <span className="font-semibold text-slate-800">{result.incomeTax.toFixed(2)} AZN</span>
                </div>
                <div className="flex justify-between">
                  <span>DSMF (Sosial Sığorta - İşçi):</span>
                  <span className="font-semibold text-slate-800">{result.dsmf.toFixed(2)} AZN</span>
                </div>
                <div className="flex justify-between">
                  <span>İcbari Tibbi Sığorta (İTS - İşçi):</span>
                  <span className="font-semibold text-slate-800">{result.healthInsurance.toFixed(2)} AZN</span>
                </div>
                <div className="flex justify-between">
                  <span>İşsizlikdən Sığorta (İşçi - 0.5%):</span>
                  <span className="font-semibold text-slate-800">{result.unemployment.toFixed(2)} AZN</span>
                </div>
              </div>
            </div>

            {/* Column B: İşəgötürənin Əlavə Xərcləri */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between">
                <span>İşəgötürənin Əlavə Sığorta Xərci</span>
                <span className="text-blue-700 font-black">+{totalEmployerContributions.toFixed(2)} AZN</span>
              </h4>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>İşəgötürən DSMF ({sector === 'private' ? '15-22%' : '22%'}):</span>
                  <span className="font-semibold text-slate-800">{result.employerDsmf.toFixed(2)} AZN</span>
                </div>
                <div className="flex justify-between">
                  <span>İşəgötürən İTS (2%):</span>
                  <span className="font-semibold text-slate-800">{result.employerHealthInsurance.toFixed(2)} AZN</span>
                </div>
                <div className="flex justify-between">
                  <span>İşəgötürən İşsizlik (0.5%):</span>
                  <span className="font-semibold text-slate-800">{result.employerUnemployment.toFixed(2)} AZN</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-900 font-bold">
                  <span>Əlavə Yük Nisbəti:</span>
                  <span>+{((totalEmployerContributions / result.gross) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <ModalBottomLogo tagline="Jobia.az İşəgötürən Maliyyə & Əməkhaqqı Mərkəzi" size="xs" variant="slate" />
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Xülasəni Kopyala</span>
                </>
              )}
            </button>

            {onApplySalaryToOffer && (
              <button
                type="button"
                onClick={() => {
                  onApplySalaryToOffer(result.gross, result.net);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Təklifə Tətbiq Et ({result.gross.toFixed(0)} ₼)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
