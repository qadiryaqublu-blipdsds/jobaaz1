import React, { useState } from 'react';
import { Application, Vacancy } from '../../types';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Phone, 
  Copy, 
  Check, 
  Send, 
  X, 
  Sparkles, 
  User, 
  Building2,
  ExternalLink,
  ShieldCheck,
  CalendarCheck2
} from 'lucide-react';
import { ModalPortal } from '../common/ModalPortal';

interface InterviewSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  onScheduleSuccess: (details: ScheduledInterviewDetails) => void;
}

export interface ScheduledInterviewDetails {
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  vacancyTitle: string;
  date: string;
  time: string;
  durationMinutes: number;
  platform: 'google_meet' | 'zoom' | 'phone' | 'in_person';
  meetingLink?: string;
  interviewerName: string;
  locationOrAgenda?: string;
}

export const InterviewSchedulerModal: React.FC<InterviewSchedulerModalProps> = ({
  isOpen,
  onClose,
  application,
  onScheduleSuccess,
}) => {
  // Default to tomorrow 11:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('11:00');
  const [duration, setDuration] = useState<number>(45);
  const [platform, setPlatform] = useState<'google_meet' | 'zoom' | 'phone' | 'in_person'>('google_meet');
  const [interviewerName, setInterviewerName] = useState('HR Departament');
  const [agenda, setAgenda] = useState('İlkin tanışlıq, texniki təcrübənin və komanda uyğunluğunun müzakirəsi.');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  // Auto-generate realistic Google Meet or video link
  const autoMeetingLink = platform === 'google_meet'
    ? `https://meet.google.com/jobia-${application.id.slice(0, 3)}-${application.id.slice(3, 6)}`
    : platform === 'zoom'
    ? `https://zoom.us/j/998${Math.floor(1000000 + Math.random() * 9000000)}`
    : '';

  const inviteText = `Hörmətli ${application.candidateName},
Sizi «${application.vacancyTitle}» vəzifəsi üzrə onlayn müsahibəyə dəvət edirik.

📅 Tarix: ${date}
⏰ Saat: ${time} (Müddət: ${duration} dəqiqə)
📍 Format: ${platform === 'google_meet' ? 'Google Meet Onlayn Video Zəng' : platform === 'zoom' ? 'Zoom Onlayn Video Zəng' : platform === 'phone' ? 'Telefon Müsahibəsi' : 'Şirkətin Baş Ofisində'}
${autoMeetingLink ? `🔗 Qoşulma Linki: ${autoMeetingLink}` : ''}
${agenda ? `📝 Gündəlik: ${agenda}` : ''}

Hörmətlə,
${application.companyName || 'Jobia HR Portalı'}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      onScheduleSuccess({
        applicationId: application.id,
        candidateName: application.candidateName,
        candidateEmail: application.candidateEmail,
        vacancyTitle: application.vacancyTitle,
        date,
        time,
        durationMinutes: duration,
        platform,
        meetingLink: autoMeetingLink,
        interviewerName,
        locationOrAgenda: agenda,
      });
      setIsSending(false);
      onClose();
    }, 400);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scale-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/80 flex items-center justify-center font-bold text-white shrink-0 border border-blue-400/30">
                <CalendarCheck2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Müsahibə Təyin Et & Dəvət Göndər</h3>
                <p className="text-xs text-blue-200 mt-0.5 line-clamp-1">
                  {application.candidateName} • {application.vacancyTitle}
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

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            {/* Platform Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-xs">Görüş Formatı & Platforma</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPlatform('google_meet')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    platform === 'google_meet'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Google Meet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('zoom')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    platform === 'zoom'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span>Zoom Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('in_person')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    platform === 'in_person'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Ofisdə Görüş</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform('phone')}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    platform === 'phone'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Phone className="w-4 h-4 text-green-600" />
                  <span>Telefon Zəngi</span>
                </button>
              </div>
            </div>

            {/* Date, Time and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Tarix</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Saat</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Müddət</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600 font-medium"
                >
                  <option value={15}>15 dəqiqə (Screening)</option>
                  <option value={30}>30 dəqiqə (Standart)</option>
                  <option value={45}>45 dəqiqə (Texniki)</option>
                  <option value={60}>60 dəqiqə (Dərin Müsahibə)</option>
                </select>
              </div>
            </div>

            {/* Generated Link Preview */}
            {autoMeetingLink && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1 text-blue-700">
                    <Sparkles className="w-3 h-3" />
                    <span>Avtomatik Yaradılmış Video Link:</span>
                  </span>
                  <a
                    href={autoMeetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <span>Test Et</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="font-mono text-slate-800 text-xs font-semibold select-all break-all">
                  {autoMeetingLink}
                </div>
              </div>
            )}

            {/* Agenda / Notes */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Müsahibənin Gündəliyi & Namizədə Qeyd</label>
              <textarea
                rows={2}
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="Müsahibədə müzakirə olunacaq əsas mövzular..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            {/* Live Message Preview Card */}
            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/80 space-y-1 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-blue-900">Namizədə Göndəriləcək Dəvət Mətni</span>
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopyalandı!' : 'Mətni Kopyala'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-3 italic">
                "{inviteText.slice(0, 160)}..."
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Ləğv et
              </button>

              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Təyin Edilir...' : 'Müsahibəni Təsdiqlə & Təyin Et'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};
