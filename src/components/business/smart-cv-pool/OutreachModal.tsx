import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Mail,
  Copy,
  Check,
  Calendar,
  MapPin,
  Clock,
  Building2,
  ExternalLink,
  Sparkles,
  Bell,
  Loader2
} from 'lucide-react';
import { SmartCandidate, Company } from '../../../types';
import { scheduleInterview } from '../../../services/interviewService';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: SmartCandidate;
  company: Company;
  targetJobTitle?: string;
}

export const OutreachModal: React.FC<OutreachModalProps> = ({
  isOpen,
  onClose,
  candidate,
  company,
  targetJobTitle,
}) => {
  const [templateType, setTemplateType] = useState<'interview_office' | 'interview_online' | 'assessment' | 'future_pool'>('interview_office');
  const [interviewDate, setInterviewDate] = useState(() => {
    const d = new Date(Date.now() + 2 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [interviewTime, setInterviewTime] = useState('11:00');
  const [interviewLocation, setInterviewLocation] = useState(company.location || 'Bakı, Şirkət baş ofisi');
  const [onlineMeetingLink, setOnlineMeetingLink] = useState('https://meet.google.com/abc-defg-hij');
  const [copied, setCopied] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  if (!isOpen) return null;

  const jobName = targetJobTitle || candidate.jobTitle || 'Mütəxəssis';
  const companyName = company.name || 'Şirkət';
  const candidateName = candidate.fullName || 'Hörmətli Namizəd';

  // Construct customized text based on selected template
  let messageSubject = '';
  let messageBody = '';

  if (templateType === 'interview_office') {
    messageSubject = `${companyName} — «${jobName}» Vəzifəsi üzrə Rəsmi Müsahibə Dəvəti`;
    messageBody = `Salam, ${candidateName}!

«${companyName}» şirkətindən Sizi salamlayırıq. 

Təqdim etdiyiniz CV və peşəkar təcrübəniz komandamız tərəfindən yüksək qiymətləndirilmişdir. Sizi şirkətimizdə açıq olan «${jobName}» vakansiyası üzrə ilk fərdi müsahibəyə dəvət etməkdən məmnunluq duyuruq.

📅 Görüş Tarixi: ${interviewDate}
⏰ Saat: ${interviewTime}
📍 Ünvan: ${interviewLocation}

Müsahibə zamanı vəzifə öhdəlikləri, layihələrimiz və gələcək əməkdaşlıq şərtləri ətraflı müzakirə ediləcəkdir. Görüş vaxtının Sizin üçün uyğunluğunu təsdiqləməyinizi xahiş edirik.

Uğurlar arzulayırıq!
Hörmətlə,
${companyName} İnsan Resursları Komandası
Əlaqə: ${company.phone || '+994 12 000 00 00'}`;
  } else if (templateType === 'interview_online') {
    messageSubject = `${companyName} — «${jobName}» Vəzifəsi üzrə Onlayn Video Müsahibə Dəvəti`;
    messageBody = `Salam, ${candidateName}!

«${companyName}» şirkətindən Sizi salamlayırıq. 

«${jobName}» vakansiyası üzrə müraciətiniz nəzərdən keçirilmiş və ilkin video müsahibə mərhələsinə keçidiniz təsdiqlənmişdir.

📅 Tarix: ${interviewDate}
⏰ Saat: ${interviewTime}
💻 Onlayn Görüş Linki: ${onlineMeetingLink}

Xahiş edirik görüşdən 5 dəqiqə əvvəl linkə qoşulub mikrofon və kameranızı yoxlayasınız. 

Hörmətlə,
${companyName} Rekrutinq Şöbəsi`;
  } else if (templateType === 'assessment') {
    messageSubject = `${companyName} — «${jobName}» Vəzifəsi üzrə Texniki/Praktiki Tapşırıq`;
    messageBody = `Salam, ${candidateName}!

«${companyName}» şirkətində «${jobName}» rolu üzrə namizədliyiniz müsbət qiymətləndirilmişdir. Növbəti seçim mərhələsi olaraq Sizə qısa praktiki keys təqdim edirik.

Tapşırığın son təqdimat tarixi: ${interviewDate}, saat 18:00-dək.

Suallarınız yarandıqda bizimlə əlaqə saxlaya bilərsiniz.
Hörmətlə,
${companyName}`;
  } else {
    messageSubject = `${companyName} — Kadr Bazasında Qeydiyyat və Təşəkkür`;
    messageBody = `Salam, ${candidateName}!

«${companyName}» şirkətinin vakansiyalarına göstərdiyiniz marağa görə təşəkkür edirik. 

Hazırkı mərhələdə profiliniz şirkətimizin Prioritet Kadr Bazasında qeydə alınmışdır. Yaxın gələcəkdə profilinizə uyğun yeni layihələr və vəzifələr açıldıqda ilk növbədə Sizinlə əlaqə saxlayacağıq.

Peşəkar fəaliyyətinizdə uğurlar arzulayırıq!
Hörmətlə,
${companyName}`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Mövzu: ${messageSubject}\n\n${messageBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clean phone number for WhatsApp
  const cleanPhone = (candidate.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('994') ? cleanPhone : '994' + cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(messageBody)}`
    : null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Namizədlə Əlaqə & Dəvət Şablonu
              </h2>
              <p className="text-xs text-slate-500">
                {candidate.fullName} ({candidate.jobTitle}) üçün fərdiləşdirilmiş dəvət
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setTemplateType('interview_office')}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                templateType === 'interview_office'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              🏢 Ofis Müsahibəsi
            </button>

            <button
              type="button"
              onClick={() => setTemplateType('interview_online')}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                templateType === 'interview_online'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              💻 Onlayn Müsahibə
            </button>

            <button
              type="button"
              onClick={() => setTemplateType('assessment')}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                templateType === 'assessment'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              📝 Praktiki Tapşırıq
            </button>

            <button
              type="button"
              onClick={() => setTemplateType('future_pool')}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                templateType === 'future_pool'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              🤝 Ehtiyat Baza
            </button>
          </div>

          {/* Dynamic Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Tarix:
              </label>
              <input
                type="date"
                value={interviewDate}
                onChange={e => setInterviewDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Saat:
              </label>
              <input
                type="time"
                value={interviewTime}
                onChange={e => setInterviewTime(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {templateType === 'interview_online' ? 'Video Link:' : 'Məkan / Ünvan:'}
              </label>
              <input
                type="text"
                value={templateType === 'interview_online' ? onlineMeetingLink : interviewLocation}
                onChange={e =>
                  templateType === 'interview_online'
                    ? setOnlineMeetingLink(e.target.value)
                    : setInterviewLocation(e.target.value)
                }
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Message Preview Body */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[45vh] overflow-y-auto">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">E-poçt Mövzusu:</div>
            <div className="p-2.5 rounded-xl bg-slate-100 font-bold text-slate-900 text-xs select-all">
              {messageSubject}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-500 mb-1">Mesaj Mətni:</div>
            <textarea
              readOnly
              rows={9}
              value={messageBody}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-sans text-xs text-slate-800 leading-relaxed resize-none outline-hidden select-all"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Mətni Kopyala</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(templateType === 'interview_office' || templateType === 'interview_online') && (
              <button
                type="button"
                disabled={isScheduling || scheduledSuccess}
                onClick={async () => {
                  setIsScheduling(true);
                  try {
                    await scheduleInterview({
                      companyId: company.id,
                      companyName: company.name || 'Şirkət',
                      candidateName: candidate.fullName,
                      candidateEmail: candidate.email,
                      candidatePhone: candidate.phone,
                      jobTitle: jobName,
                      interviewDate,
                      interviewTime,
                      interviewType: templateType === 'interview_online' ? 'online' : 'office',
                      locationOrLink: templateType === 'interview_online' ? onlineMeetingLink : interviewLocation,
                      notes: messageBody,
                      autoReminder24h: true,
                      status: 'scheduled',
                    });
                    setScheduledSuccess(true);
                    setTimeout(() => {
                      setScheduledSuccess(false);
                      onClose();
                    }, 1400);
                  } catch (err) {
                    console.error('Schedule error:', err);
                  } finally {
                    setIsScheduling(false);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                title="Müsahibəni təqvimə əlavə et və 24 saat qalmış avtomatik SMTP xatırlatmasını aktivləşdir"
              >
                {isScheduling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : scheduledSuccess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span>
                  {scheduledSuccess ? 'Təqvimə Əlavə Edildi!' : 'Təqvimə Sal & 24h SMTP'}
                </span>
              </button>
            )}

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp ilə Göndər</span>
              </a>
            )}

            <a
              href={`mailto:${candidate.email}?subject=${encodeURIComponent(messageSubject)}&body=${encodeURIComponent(messageBody)}`}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>E-poçtla Göndər</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
