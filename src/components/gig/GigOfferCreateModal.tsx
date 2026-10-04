import React, { useState } from 'react';
import { GigOffer } from '../../types';
import { addGigOffer } from '../../services/gigService';
import { X, Send, Megaphone, MapPin, DollarSign, Calendar, Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface GigOfferCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOfferCreated: (offer: GigOffer) => void;
}

export const GigOfferCreateModal: React.FC<GigOfferCreateModalProps> = ({
  isOpen,
  onClose,
  onOfferCreated,
}) => {
  const { language } = useLanguage();
  const [offerType, setOfferType] = useState<'need_casual_worker' | 'need_tutor'>('need_casual_worker');
  const [title, setTitle] = useState('');
  const [posterName, setPosterName] = useState('');
  const [posterPhone, setPosterPhone] = useState('+994 ');
  const [posterWhatsapp, setPosterWhatsapp] = useState('');
  const [category, setCategory] = useState('');
  const [rateOffered, setRateOffered] = useState('');
  const [location, setLocation] = useState('Bakı');
  const [dateOrSchedule, setDateOrSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !posterName.trim() || !posterPhone.trim()) {
      setErrorMsg('Zəhmət olmasa Elan Başlığı, Adınız və Əlaqə Nömrəsini daxil edin.');
      return;
    }

    const cleanWhatsapp = posterWhatsapp.trim() ? posterWhatsapp.replace(/\D/g, '') : posterPhone.replace(/\D/g, '');

    const newOffer: GigOffer = {
      id: `offer-${Date.now()}`,
      posterName: posterName.trim(),
      posterPhone: posterPhone.trim(),
      posterWhatsapp: cleanWhatsapp || '994500000000',
      type: offerType,
      title: title.trim(),
      category: category.trim() || (offerType === 'need_tutor' ? 'Təhsil & Repetitorluq' : 'Tədbir & Xidmət'),
      rateOffered: rateOffered.trim() || (offerType === 'need_tutor' ? 'Razılaşma ilə' : '50 ₼/gün'),
      location: location.trim(),
      dateOrSchedule: dateOrSchedule.trim() || 'Dərhal / Razılaşma ilə',
      description: description.trim() || 'Tələblər barədə ətraflı məlumat üçün zəng edin və ya WhatsApp ilə yazın.',
      status: 'open',
      applicantsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    addGigOffer(newOffer);
    onOfferCreated(newOffer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                {language === 'en'
                  ? 'Post a Gig / Need Worker or Tutor'
                  : 'Sifariş / Tələb Elanı Yerləşdir'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
                Günlük işçi, saatlıq köməkçi və ya repetitor axtarışınızı dərhal elan edin
              </p>
            </div>
          </div>

          {/* Toggle Type */}
          <div className="mt-4 grid grid-cols-2 gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => setOfferType('need_casual_worker')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                offerType === 'need_casual_worker'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              ⚡ Günlük / Saatlıq İşçi Lazımdır
            </button>
            <button
              type="button"
              onClick={() => setOfferType('need_tutor')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                offerType === 'need_tutor'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              🎓 Müəllim / Repetitor Axtarıram
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {offerType === 'need_tutor'
                ? 'Hansı fənn və ya imtahan üzrə repetitor axtarırsınız? *'
                : 'Nə üçün və neçə nəfər saatlıq/günlük işçi lazımdır? *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                offerType === 'need_tutor'
                  ? 'Məs: 10-cu sinif üçün fərdi Riyaziyyat və Həndəsə repetitoru'
                  : 'Məs: Şənbə günü ziyafət üçün 3 nəfər təcrübəli ofisiant'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adınız və ya Şirkət / Müəssisə Adı *
              </label>
              <input
                type="text"
                required
                value={posterName}
                onChange={(e) => setPosterName(e.target.value)}
                placeholder="Məs: Fərid Əliyev və ya Baku Events"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Təklif Etdiyiniz Ödəniş (Məbləğ)
              </label>
              <input
                type="text"
                value={rateOffered}
                onChange={(e) => setRateOffered(e.target.value)}
                placeholder={offerType === 'need_tutor' ? 'Məs: 140 ₼/ay və ya 20 ₼/saat' : 'Məs: 60 ₼/gün (Nahar daxil)'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-emerald-950 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Şəhər / Ünvan / Format
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Məs: Bakı, Sea Breeze və ya Onlayn"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                İş Tarixi və ya Dərs Cədvəli
              </label>
              <input
                type="text"
                value={dateOrSchedule}
                onChange={(e) => setDateOrSchedule(e.target.value)}
                placeholder="Məs: Bu Şənbə, 16:00-23:00 və ya Həftədə 2 dəfə"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telefon Nömrəsi *
              </label>
              <input
                type="text"
                required
                value={posterPhone}
                onChange={(e) => setPosterPhone(e.target.value)}
                placeholder="+994 50 123 45 67"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Nömrəsi (Müraciətlər üçün)
              </label>
              <input
                type="text"
                value={posterWhatsapp}
                onChange={(e) => setPosterWhatsapp(e.target.value)}
                placeholder="Məs: 0501234567"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ətraflı Qeyd və Tələblər
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Görüləcək işin təsviri, geyim forması, saatlar və ya müəllimdən gözlənilən təcrübə..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Elanı Pulsuz Yerləşdir</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
