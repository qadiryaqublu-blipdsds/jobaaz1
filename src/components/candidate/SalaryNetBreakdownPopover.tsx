import React, { useState } from 'react';
import { calculateGrossToNet } from '../../services/salaryCalculator';
import { Info, Calculator, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SalaryNetBreakdownPopoverProps {
  grossAmount: number;
  currency?: string;
  showNetText?: boolean;
  onOpenSalaria?: () => void;
  className?: string;
}

export const SalaryNetBreakdownPopover: React.FC<SalaryNetBreakdownPopoverProps> = ({
  grossAmount,
  currency = 'AZN',
  showNetText = true,
  onOpenSalaria,
  className = '',
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (!grossAmount || grossAmount <= 0) return null;

  const result = calculateGrossToNet(grossAmount, {
    sector: 'private_non_oil',
    taxBenefit: 0,
  });

  const netAmount = Math.round(result.net);
  const dsmf = result.employeeSocial.toFixed(1);
  const its = result.employeeMedical.toFixed(1);
  const unemployment = result.employeeUnemployment.toFixed(1);
  const incomeTax = result.incomeTax.toFixed(1);
  const totalDeductions = (result.gross - result.net).toFixed(1);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer group"
        title="Dövlət tutulmalarından sonra net xalis məbləğ"
      >
        <span className="font-semibold text-emerald-700 tabular-nums">
          ~{netAmount.toLocaleString()} {currency}
        </span>
        {showNetText && (
          <span className="text-[10px] text-emerald-800 font-medium">
            ({language === 'en' ? 'net' : language === 'ru' ? 'net' : 'net'})
          </span>
        )}
        <Info className="w-3 h-3 text-emerald-600/70 group-hover:text-emerald-700 transition-transform" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 bottom-full left-0 mb-2 w-64 bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-700 text-xs animate-fade-in pointer-events-auto"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'AR Tax & Social Breakdown' : language === 'ru' ? 'Расчет налогов АР' : 'AR Vergi və Sosial Hesablama'}</span>
            </span>
            <span className="text-[10px] text-slate-400">2026 Qanunvericilik</span>
          </div>

          <div className="py-2 space-y-1.5 text-[11px] font-mono tabular-nums text-slate-300">
            <div className="flex justify-between font-sans text-white font-bold">
              <span>{language === 'en' ? 'Gross Salary:' : language === 'ru' ? 'Оклад (Gross):' : 'Gross Əməkhaqqı:'}</span>
              <span>{grossAmount.toLocaleString()} {currency}</span>
            </div>

            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
              <span className="font-sans">DSMF (3% / 10%):</span>
              <span className="text-rose-400">-{dsmf} {currency}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span className="font-sans">İcbari Tibbi Sığorta (2%):</span>
              <span className="text-rose-400">-{its} {currency}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span className="font-sans">İşsizlikdən Sığorta (0.5%):</span>
              <span className="text-rose-400">-{unemployment} {currency}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span className="font-sans">Gəlir Vergisi (8000-dək 0%):</span>
              <span className={Number(incomeTax) > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {Number(incomeTax) > 0 ? `-${incomeTax} ${currency}` : '0 AZN (Güzəşt)'}
              </span>
            </div>

            <div className="flex justify-between font-sans text-emerald-400 font-bold pt-1.5 border-t border-slate-800 text-xs">
              <span>{language === 'en' ? 'Net (In Pocket):' : language === 'ru' ? 'Чистыми (Net):' : 'Net (Xalis):'}</span>
              <span>~{netAmount.toLocaleString()} {currency}</span>
            </div>
          </div>

          {onOpenSalaria && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenSalaria();
              }}
              className="mt-2 w-full py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Calculator className="w-3 h-3" />
              <span>{language === 'en' ? 'Open Salaria Full Calculator' : language === 'ru' ? 'Открыть калькулятор Salaria' : 'Salaria Kalkulyatorunda Dəqiqləşdir'}</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
