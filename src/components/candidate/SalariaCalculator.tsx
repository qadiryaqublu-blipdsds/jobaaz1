import React, { useState } from 'react';
import { SalaryCalculatorView } from './SalaryCalculatorView';
import { VacationCalculatorView } from './VacationCalculatorView';
import { Calculator, Palmtree } from 'lucide-react';
import { User, Company } from '../../types';

interface SalariaCalculatorProps {
  initialAmount?: number;
  defaultSubTab?: 'salaria' | 'vacatia' | 'calculia';
  onExploreJobs?: () => void;
  currentUser?: User | null;
  companies?: Company[];
  activeCompany?: Company | null;
  onOpenAuthModal?: () => void;
}

export const SalariaCalculator: React.FC<SalariaCalculatorProps> = ({
  defaultSubTab = 'salaria',
  onExploreJobs,
  currentUser,
  companies = [],
  activeCompany,
  onOpenAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'salary' | 'vacation'>(
    defaultSubTab === 'vacatia' ? 'vacation' : 'salary'
  );

  return (
    <div className="space-y-6">
      {/* Top Switcher if directly accessed */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-2">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/90 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('salary')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'salary'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Maaşını hesabla</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vacation')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'vacation'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palmtree className="w-4 h-4" />
            <span>Məzuniyyətini hesabla</span>
          </button>
        </div>
      </div>

      {activeTab === 'salary' ? (
        <SalaryCalculatorView onExploreJobs={onExploreJobs} />
      ) : (
        <VacationCalculatorView 
          onExploreJobs={onExploreJobs} 
          currentUser={currentUser}
          companies={companies}
          activeCompany={activeCompany}
          onOpenAuthModal={onOpenAuthModal}
        />
      )}
    </div>
  );
};
