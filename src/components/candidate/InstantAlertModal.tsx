import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  MessageCircle, 
  Phone, 
  DollarSign, 
  Briefcase,
  Share2
} from 'lucide-react';
import { ModalPortal } from '../common/ModalPortal';

interface InstantAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
  defaultSalary?: number;
}

export const InstantAlertModal: React.FC<InstantAlertModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'Frontend Developer',
  defaultSalary = 2000,
}) => {
  const [role, setRole] = useState(defaultRole);
  const [salary, setSalary] = useState(defaultSalary);
  const [phone, setPhone] = useState('+994 50 ');
  const [channel, setChannel] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [isSubscribed, setIsSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Salam Jobia! Mən «${role}» vəzifəsi üzrə minimum ${salary} AZN maaş təklif edən yeni vakansiyalar haqqında anlıq WhatsApp bildirişi almaq istəyirəm.`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scale-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shrink-0 shadow-xs">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Anlıq Vakansiya Bildirişi</h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  WhatsApp və ya Telegram ilə yeni elanları ilk siz görün.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4 text-xs">
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-4">
                {/* Channel selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Bildiriş Kanalı:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setChannel('whatsapp')}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        channel === 'whatsapp'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChannel('telegram')}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        channel === 'telegram'
                          ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Send className="w-4 h-4 text-blue-600" />
                      <span>Telegram Bot</span>
                    </button>
                  </div>
                </div>

                {/* Target Role */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Axtardığınız Vəzifə:</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="məs: Baş Mühasib, Frontend..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                {/* Minimum expected salary */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Minimum Əmək Haqqı (AZN):</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step={100}
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600 font-bold"
                    />
                  </div>
                </div>

                {/* Phone number */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Telefon Nömrəniz:</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Ləğv et
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold rounded-xl text-xs border border-emerald-200 flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp-da Aç</span>
                    </a>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Abunə Ol</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Success confirmation */
              <div className="text-center py-4 space-y-3 animate-scale-up">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-md border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Uğurla Abunə Oldunuz!</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                    «<strong>{role}</strong>» üzrə ≥ <strong>{salary} ₼</strong> maaşlı yeni elan çıxan kimi sizə anında WhatsApp bildirişi göndəriləcək.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
                  >
                    Tamamdır
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
