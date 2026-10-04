import React, { useState } from 'react';
import { GigProfile } from '../../types';
import { buildGigWhatsAppLink } from '../../services/gigService';
import { 
  X, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Briefcase, 
  Clock, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  DollarSign, 
  Sparkles,
  Share2,
  Calendar,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface GigProfileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: GigProfile | null;
}

export const GigProfileDetailModal: React.FC<GigProfileDetailModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const { language } = useLanguage();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [senderName, setSenderName] = useState('');

  if (!isOpen || !profile) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(profile.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const whatsAppLink = buildGigWhatsAppLink(profile, senderName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Top Gradient Banner */}
        <div className="p-6 text-white relative bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-lg shrink-0">
              {profile.fullName.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-white">
                  {profile.type === 'tutor_instructor' ? '🎓 Kurs & Repetitor Müəllimi' : '⚡ Günlük / Saatlıq İcraçı'}
                </span>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-400 text-emerald-950 text-[11px] font-black shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Təsdiqlənmiş</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                {profile.fullName}
              </h2>
              <p className="text-sm text-white/90 font-semibold mt-0.5">
                {profile.title}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/80 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-white/70" />
                  {profile.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-white/70" />
                  {profile.experienceYears} il təcrübə
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {profile.rating.toFixed(1)} ({profile.reviewsCount} rəy)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Price & Availability Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            {profile.hourlyRate && (
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Saatlıq Qiymət</span>
                <span className="text-lg font-black text-slate-900 tabular-nums">
                  {profile.hourlyRate} {profile.currency}
                  <span className="text-xs font-normal text-slate-500"> /saat</span>
                </span>
              </div>
            )}

            {profile.dailyRate && (
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Günlük Tarif</span>
                <span className="text-lg font-black text-emerald-900 tabular-nums">
                  {profile.dailyRate} {profile.currency}
                  <span className="text-xs font-normal text-emerald-700"> /gün</span>
                </span>
              </div>
            )}

            {profile.monthlyRate && (
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Aylıq Paket</span>
                <span className="text-lg font-black text-emerald-950 tabular-nums">
                  {profile.monthlyRate} {profile.currency}
                  <span className="text-xs font-normal text-emerald-700"> /ay</span>
                </span>
              </div>
            )}

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Mövcudluq</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <Clock className="w-3.5 h-3.5" />
                {profile.availability === 'available_today' ? '⚡ Bugün Hazır' :
                 profile.availability === 'weekends' ? '📅 Həftəsonları' :
                 profile.availability === 'evenings' ? '🌙 Axşamlar' : '🕒 Çevik'}
              </span>
            </div>
          </div>

          {/* Badges */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((b, i) => (
                <span key={i} className="px-3 py-1 rounded-xl bg-amber-50 text-amber-950 border border-amber-200/80 text-xs font-bold shadow-2xs">
                  {b}
                </span>
              ))}
              {profile.trialLessonAvailable && (
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs font-black shadow-2xs">
                  🎁 Pulsuz Sınaq Dərsi Mövcuddur
                </span>
              )}
            </div>
          )}

          {/* Teaching Formats for Tutors */}
          {profile.type === 'tutor_instructor' && profile.formats && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Dərslərin Keçirilmə Formatı
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.formats.map((fmt) => (
                  <span key={fmt} className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs">
                    {fmt === 'online' ? '💻 Onlayn (Zoom / Google Meet)' :
                     fmt === 'in_person' ? '🏫 Əyani (Mərkəz və ya Məkan)' :
                     fmt === 'student_home' ? '🏠 Tələbənin Evində' : '📍 Müəllimin Ofisində'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio / Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Haqqında və Xidmət Təsviri
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
              {profile.bio}
            </p>
          </div>

          {/* Skills / Subjects */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {profile.type === 'tutor_instructor' ? 'Tədris Olunan Fənlər & Proqramlar' : 'İxtisas və Bacarıqlar'}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.subjectsOrSkills.map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/70 text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Education & Certifications */}
          {profile.educationOrCertifications && profile.educationOrCertifications.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Təhsil & Beynəlxalq Sertifikatlar
              </h3>
              <div className="space-y-1.5">
                {profile.educationOrCertifications.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {profile.reviews && profile.reviews.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Müştəri və Tələbə Rəyləri ({profile.reviews.length})
              </h3>
              <div className="space-y-2.5">
                {profile.reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{rev.authorName}</span>
                        {rev.authorRole && (
                          <span className="text-[11px] text-slate-500 ml-1.5">({rev.authorRole})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, r) => (
                          <Star key={r} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      "{rev.comment}"
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">{rev.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct WhatsApp Pre-fill Sender Box */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Sürətli WhatsApp Müraciəti (Adınızı qeyd edin)</span>
            </div>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Adınız və ya Şirkətiniz (Məs: Nurlan Məmmədov)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyPhone}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Phone className="w-4 h-4 text-slate-500" />}
            <span>{copiedPhone ? 'Nömrə Kopyalandı!' : profile.phone}</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href={`tel:${profile.phone}`}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Zəng Et</span>
            </a>

            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp ilə Əlaqə</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
