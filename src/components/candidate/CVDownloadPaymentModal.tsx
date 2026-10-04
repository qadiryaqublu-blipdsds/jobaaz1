import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  FileDown, 
  FileText, 
  Check, 
  Receipt, 
  ArrowRight,
  Zap,
  Award
} from 'lucide-react';
import { processCardPayment, formatCardNumber, detectCardBrand } from '../../services/paymentService';
import { User as UserType } from '../../types';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface CVDownloadPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  type: 'cv_creation' | 'cv_analysis';
  title?: string;
  subtitle?: string;
  candidateName?: string;
  currentUser?: UserType | null;
}

export const CVDownloadPaymentModal: React.FC<CVDownloadPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  type,
  title,
  subtitle,
  candidateName,
  currentUser
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(
    currentUser?.fullName || candidateName || 'Əli Məmmədov'
  );
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('28');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    id: string;
    amount: number;
    date: string;
    cardLast4?: string;
  } | null>(null);

  if (!isOpen) return null;

  const isCVCreation = type === 'cv_creation';
  const displayTitle = title || (isCVCreation ? 'Rəsmi CV Şablonu PDF Endirmə' : 'Rəsmi ATS Analiz Hesabatı PDF Endirmə');
  const displaySubtitle = subtitle || (
    isCVCreation 
      ? 'Seçdiyiniz peşəkar dizaynda, ATS standartlarına tam uyğun A4 formatlı PDF faylı.'
      : '10 meyar üzrə ATS qiymətləndirməsi, açar sözlər təhlili və fərdi inkişaf tövsiyələri.'
  );

  const cardBrand = detectCardBrand(cardNumber);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleFillTestCard = () => {
    setCardNumber('4128 5543 8921 4242');
    setCardHolder(currentUser?.fullName || candidateName || 'Nigar Əliyeva');
    setExpiryMonth('08');
    setExpiryYear('29');
    setCvv('789');
    setErrorMsg(null);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 16) {
      setErrorMsg('Kart nömrəsi 16 rəqəm olmalıdır.');
      return;
    }

    if (!cardHolder.trim() || cardHolder.trim().length < 3) {
      setErrorMsg('Kart üzərindəki ad və soyadı daxil edin.');
      return;
    }

    if (cvv.length < 3) {
      setErrorMsg('CVV təhlükəsizlik kodu 3 rəqəm olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      // Process standard 2.00 AZN payment via payment service
      const paymentResult = await processCardPayment(
        {
          cardNumber,
          cardHolder,
          expiryMonth,
          expiryYear,
          cvv,
          saveCard: false
        },
        2.00,
        'AZN'
      );

      if (!paymentResult.success) {
        setErrorMsg(paymentResult.message || 'Ödəniş baş tutmadı. Kart məlumatlarını yoxlayın.');
        setLoading(false);
        return;
      }

      // Record transaction
      const receipt = {
        id: paymentResult.transactionId || `TX-CV-${Date.now()}`,
        amount: 2.00,
        date: new Date().toLocaleString('az-AZ'),
        cardLast4: paymentResult.cardLast4 || cleanCard.slice(-4)
      };
      setReceiptData(receipt);
      setPaymentSuccess(true);
      setLoading(false);

      // Trigger automatic download callback after brief feedback
      setTimeout(() => {
        onPaymentSuccess();
      }, 900);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Ödəniş xətası baş verdi. Yenidən cəhd edin.');
    }
  };

  return (
    <div 
      id="cv-download-payment-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header Banner */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0 border-b border-indigo-900/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300 shadow-inner">
              {isCVCreation ? (
                <FileDown className="w-5 h-5 text-emerald-400" />
              ) : (
                <Award className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {displayTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  2.00 ₼
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                Jobia.az Təhlükəsiz Ödəniş Gateway
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">

          {/* Success State View */}
          {paymentSuccess && receiptData ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  Ödəniş Uğurla Tamamlandı!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                  2.00 AZN məbləğ uğurla qəbul edildi. PDF sənədiniz avtomatik endirilir...
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-600 max-w-sm mx-auto shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 font-bold text-slate-800">
                  <span>Qəbz №:</span>
                  <span className="font-mono text-indigo-700">{receiptData.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sənəd növü:</span>
                  <span className="font-semibold text-slate-900">
                    {isCVCreation ? 'Rəsmi CV (A4 PDF)' : 'ATS Analiz Hesabatı (PDF)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ödənilən məbləğ:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">2.00 ₼ (AZN)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tarix:</span>
                  <span>{receiptData.date}</span>
                </div>
                {receiptData.cardLast4 && (
                  <div className="flex items-center justify-between">
                    <span>Ödəniş üsulu:</span>
                    <span>Kart (•••• {receiptData.cardLast4})</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onPaymentSuccess();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>PDF-i İndi Aç və ya Yenidən Endir</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  Pəncərəni Bağla
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Service & Pricing Feature Box */}
              <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-emerald-50/40 rounded-2xl p-4 border border-indigo-100/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      {isCVCreation ? 'Premium CV İxracı' : 'Rəsmi Audit İxracı'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                      {isCVCreation ? 'A4 Vektor Formatlı Rəsmi CV Sənədi' : 'Tam ATS Auditi & Təkmilləşdirmə Hesabatı'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {displaySubtitle}
                    </p>
                  </div>

                  <div className="text-right shrink-0 bg-white px-3 py-2 rounded-xl border border-indigo-100 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Qiymət</div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-700 leading-tight">
                      2.00 <span className="text-xs font-bold text-slate-700">₼</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Birdəfəlik</div>
                  </div>
                </div>

                {/* Features checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-indigo-100/60 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Yüksək keyfiyyətli A4 PDF</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Filigransız (Watermarksız)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% ATS Vektor Şriftlər</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dərhal avtomatik endirmə</span>
                  </div>
                </div>
              </div>

              {/* Error Message if any */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Card Payment Form */}
              <form onSubmit={handleSubmitPayment} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>Bank Kartı Məlumatları</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Sınaq üçün test kart məlumatlarını avtomatik doldur"
                  >
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>Test Kartı Doldur</span>
                  </button>
                </div>

                {/* Card Number Input */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all pr-16"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {cardBrand}
                    </div>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kart Sahibinin Adı və Soyadı
                  </label>
                  <input
                    type="text"
                    placeholder="Məs: Əli Məmmədov"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all uppercase"
                    required
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Bitmə Tarixi (Ay / İl)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        className="w-full px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        className="w-full px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      >
                        {['25', '26', '27', '28', '29', '30', '31', '32'].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                      <span>CVV / CVC</span>
                      <span className="text-[10px] text-slate-400 font-normal">3 rəqəm</span>
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={3}
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-widest text-center focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Trust and Security Footer */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>256-bit SSL & 3D Secure</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <span>Visa</span>
                    <span>•</span>
                    <span>Mastercard</span>
                    <span>•</span>
                    <span>Birbank</span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Ödəniş Emal Olunur...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-emerald-200" />
                      <span>2.00 ₼ Ödə və PDF-i Endir</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Modal Bottom Logo Branding */}
        <ModalBottomLogo size="sm" />
      </div>
    </div>
  );
};

export default CVDownloadPaymentModal;
