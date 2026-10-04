import React, { useState } from 'react';
import { Vacancy, CVData, User } from '../../types';
import { X, MessageCircle, Copy, Check, Send, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface WhatsAppQuickApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancy: Vacancy | null;
  userCV?: CVData;
  currentUser?: User | null;
  onShowToast?: (message: string) => void;
}

export const WhatsAppQuickApplyModal: React.FC<WhatsAppQuickApplyModalProps> = ({
  isOpen,
  onClose,
  vacancy,
  userCV,
  currentUser,
  onShowToast,
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !vacancy) return null;

  const candidateName = currentUser?.fullName || userCV?.personalInfo?.fullName || 'Namizəd';
  const candidatePhone = currentUser?.phone || userCV?.personalInfo?.phone || '';
  const candidateTitle = userCV?.personalInfo?.jobTitle || 'Mütəxəssis';

  // Target Phone: company contactPhone or companyWhatsApp, or fallback
  const rawPhone = vacancy.contactPhone || (vacancy as any).whatsappNumber || '994501234567';
  const cleanPhone = rawPhone.replace(/\D/g, '');

  const defaultMessage = language === 'en'
    ? `Hello! I am applying for the "${vacancy.title}" position at "${vacancy.companyName}" published on Jobia.az.\n\nMy Details:\n• Name: ${candidateName}\n• Role: ${candidateTitle}\n• Contact: ${candidatePhone || 'Via WhatsApp'}\n\nI would be glad to share my resume and discuss this opportunity. Thank you!`
    : language === 'ru'
    ? `Здравствуйте! Я откликаюсь на вакансию «${vacancy.title}» в компании «${vacancy.companyName}», опубликованную на Jobia.az.\n\nМои данные:\n• ФИО: ${candidateName}\n• Специальность: ${candidateTitle}\n• Телефон: ${candidatePhone || 'В WhatsApp'}\n\nБуду рад предоставить резюме и обсудить сотрудничество. Спасибо!`
    : `Salam! Jobia.az platformasında «${vacancy.companyName}» tərəfindən dərc edilmiş «${vacancy.title}» vakansiyası üzrə müraciət edirəm.\n\nNamizəd məlumatlarım:\n• Ad, Soyad: ${candidateName}\n• İxtisas: ${candidateTitle}\n• Əlaqə nömrəsi: ${candidatePhone || 'WhatsApp vasitəsilə'}\n\nCV faylımı və portfoliosumu təqdim etməyə hazıram. Diqqətiniz üçün təşəkkür edirəm!`;

  const [message, setMessage] = useState(defaultMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    if (onShowToast) onShowToast('WhatsApp müraciət mətni kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const targetUrl = `https://wa.me/${cleanPhone.startsWith('994') ? cleanPhone : '994' + cleanPhone.replace(/^0/, '')}?text=${encoded}`;
    window.open(targetUrl, '_blank');
    onClose();
    if (onShowToast) onShowToast('WhatsApp açılır...');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-emerald-50/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                <span>WhatsApp ilə Sürətli Müraciət</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500 text-white uppercase">1-Klik</span>
              </h3>
              <p className="text-xs text-slate-600">
                {vacancy.companyName} • {vacancy.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 text-xs text-slate-700">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hazır Peşəkar Müraciət Mətni:</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı' : 'Mətni Kopyala'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none bg-white text-slate-900 font-sans leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Müraciətiniz birbaşa işəgötürənin təsdiqlənmiş əlaqə nömrəsinə yönləndirilir.</span>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp ilə Aç və Göndər</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>

        <ModalBottomLogo
          tagline="Jobia.az Sürətli Əlaqə və Müraciət"
          variant="slate"
        />
      </div>
    </div>
  );
};
