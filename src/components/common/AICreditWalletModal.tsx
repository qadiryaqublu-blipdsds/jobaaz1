import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CreditCard, 
  Coins, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  RefreshCw,
  AlertCircle,
  Percent,
  DollarSign
} from 'lucide-react';
import { 
  AI_CREDIT_TOPUP_PACKAGES, 
  DEFAULT_AI_PRICING, 
  getUserAICreditWallet, 
  topUpUserAICredits, 
  getAllAITransactions,
  AITransactionRecord
} from '../../services/aiCreditMarginService';
import { safeAlert } from '../../utils/dialogHelper';

interface AICreditWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
}

export const AICreditWalletModal: React.FC<AICreditWalletModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName
}) => {
  if (!isOpen) return null;

  const [wallet, setWallet] = useState(() => getUserAICreditWallet(userId));
  const [transactions, setTransactions] = useState<AITransactionRecord[]>(() => getAllAITransactions());
  const [selectedPackageId, setSelectedPackageId] = useState('pkg-150');
  const [activeTab, setActiveTab] = useState<'packages' | 'pricing' | 'history'>('packages');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const updated = topUpUserAICredits(userId, selectedPackageId);
      setWallet(updated);
      setTransactions(getAllAITransactions());
      setIsProcessing(false);
      safeAlert('Kredit balansı uğurla artırıldı!');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>Jobia AI Kredit Balansı & Şəffaf Qiymətləndirmə</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              AI Xidmətləri və Kredit Pulqabısı
            </h2>
            <p className="text-xs text-slate-500">
              Uğursuz nəticələrdə kreditlər avtomatik bərpa olunur. Bütün xidmətlər üzrə ilkin sınaq pulsuzdur.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-300 font-medium">Mövcud AI Kredit Balansınız:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-300">{wallet.balanceCredits}</span>
              <span className="text-sm font-semibold text-slate-300">kredit (~{(wallet.balanceCredits * 0.5).toFixed(2)} AZN)</span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              1 Kredit = 0.50 AZN ekvivalenti • İstifadə müddətsizdir
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('packages')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Balansı Artır
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'packages' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Kredit Paketləri
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pricing' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Əməliyyat Qiymətləri & Marja
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Əməliyyat Tarixçəsi ({transactions.length})
          </button>
        </div>

        {/* TAB 1: PACKAGES */}
        {activeTab === 'packages' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AI_CREDIT_TOPUP_PACKAGES.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-2 relative overflow-hidden ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {pkg.isPopular && (
                      <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Ən Çox Seçilən
                      </span>
                    )}

                    <div>
                      <strong className="text-sm font-black text-slate-900 block">
                        +{pkg.credits} AI Krediti
                      </strong>
                      <span className="text-[11px] font-bold text-emerald-600">{pkg.savingsText}</span>
                    </div>

                    <div className="text-xl font-black text-slate-900">
                      {pkg.priceAZN} <span className="text-xs font-normal text-slate-500">AZN</span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-tight">
                      {pkg.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Uğursuz əməliyyatlarda kreditlər 100% zəmanətlə geri qaytarılır</span>
              </span>

              <button
                disabled={isProcessing}
                onClick={handlePurchase}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? 'Ödənilir...' : 'Kreditləri Al'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PRICING & MARGIN BREAKDOWN */}
        {activeTab === 'pricing' && (
          <div className="space-y-3 text-xs overflow-x-auto">
            <p className="text-slate-500 text-[11px]">
              Platformanın AI vahid maya dəyəri, satış qiyməti və marja hesabatı (Texniki həll Bölmə 22):
            </p>

            <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">Xidmət / Əməliyyat</th>
                  <th className="p-2.5 text-center">Kredit</th>
                  <th className="p-2.5 text-center">Satış (AZN)</th>
                  <th className="p-2.5 text-center">AI Maya (AZN)</th>
                  <th className="p-2.5 text-center">Mənfəət Marjası</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {DEFAULT_AI_PRICING.map((op) => (
                  <tr key={op.key} className="hover:bg-slate-50/50">
                    <td className="p-2.5">
                      <strong className="text-slate-900 block">{op.name}</strong>
                      <span className="text-[10px] text-slate-400 font-normal">{op.description}</span>
                    </td>
                    <td className="p-2.5 text-center font-bold text-amber-600">
                      {op.creditsCost}
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900">
                      {op.salePriceAZN.toFixed(2)} ₼
                    </td>
                    <td className="p-2.5 text-center text-slate-500">
                      {op.realApiCostAZN.toFixed(2)} ₼
                    </td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">
                      %{op.marginPercent.toFixed(0)} (+{op.grossProfitAZN.toFixed(2)} ₼)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-2 text-xs">
            {transactions.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Hələ heç bir AI əməliyyatı qeydə alınmayıb.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 font-bold block">{tx.operationName}</strong>
                      <span className="text-[11px] text-slate-400">
                        {new Date(tx.timestamp).toLocaleDateString('az-AZ')} {new Date(tx.timestamp).toLocaleTimeString('az-AZ')}
                      </span>
                    </div>

                    <div className="text-right">
                      {tx.isFreeTrial ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          İlk Sınaq (Pulsuz)
                        </span>
                      ) : (
                        <span className="font-bold text-slate-900">
                          {tx.creditsDeducted > 0 ? `-${tx.creditsDeducted} Kredit` : `+${tx.amountAZN} AZN`}
                        </span>
                      )}
                      <span className="block text-[10px] text-slate-400 font-medium">
                        Status: {tx.status === 'success' ? 'Uğurlu' : tx.status === 'refunded' ? 'Bərpa edildi' : 'Xəta'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
