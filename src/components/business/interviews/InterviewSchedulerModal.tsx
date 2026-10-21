import React, { useState, useEffect } from 'react';
import { ScheduledInterview, Company, Application } from '../../../types';
import { scheduleInterview, sendInterviewReminder } from '../../../services/interviewService';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Send, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';

interface InterviewSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  candidateApp?: Application | null;
  existingInterview?: ScheduledInterview | null;
  onSaved?: (interview: ScheduledInterview) => void;
}

export const InterviewSchedulerModal: React.FC<InterviewSchedulerModalProps> = ({
  isOpen,
  onClose,
  company,
  candidateApp,
  existingInterview,
  onSaved,
}) => {
  // Candidate info
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // Interview timing
  const [interviewDate, setInterviewDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [interviewTime, setInterviewTime] = useState('11:00');
  const [interviewType, setInterviewType] = useState<'online' | 'office'>('online');
  const [locationOrLink, setLocationOrLink] = useState('https://meet.google.com/jobia-interview');
  
  // Interviewer
  const [interviewerName, setInterviewerName] = useState(company.hrContactName || 'İnsan Resursları Meneceri');
  const [interviewerRole, setInterviewerRole] = useState('HR & Talent Acquisition Lead');
  const [interviewerEmail, setInterviewerEmail] = useState(company.email || 'hr@jobia.az');
  const [notes, setNotes] = useState('');

  // 24h Automated reminder option
  const [autoReminder24h, setAutoReminder24h] = useState(true);
  const [sendImmediateConfirmation, setSendImmediateConfirmation] = useState(false);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (existingInterview) {
      setCandidateName(existingInterview.candidateName);
      setCandidateEmail(existingInterview.candidateEmail);
      setCandidatePhone(existingInterview.candidatePhone || '');
      setJobTitle(existingInterview.jobTitle);
      setInterviewDate(existingInterview.interviewDate);
      setInterviewTime(existingInterview.interviewTime);
      setInterviewType(existingInterview.interviewType);
      setLocationOrLink(existingInterview.locationOrLink);
      setInterviewerName(existingInterview.interviewerName || '');
      setInterviewerRole(existingInterview.interviewerRole || '');
      setInterviewerEmail(existingInterview.interviewerEmail || '');
      setNotes(existingInterview.notes || '');
      setAutoReminder24h(existingInterview.autoReminder24h);
    } else if (candidateApp) {
      setCandidateName(candidateApp.candidateName || '');
      setCandidateEmail(candidateApp.candidateEmail || '');
      setCandidatePhone(candidateApp.candidatePhone || '');
      setJobTitle(candidateApp.vacancyTitle || 'Vakansiya');
      setLocationOrLink('https://meet.google.com/pasha-interview-' + Math.random().toString(36).substring(2, 7));
    }
  }, [existingInterview, candidateApp, company]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim() || !interviewDate || !jobTitle.trim()) {
      setErrorMessage('Namizədin adı, e-poçt ünvanı, vəzifə və müsahibə tarixi mütləqdir.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload: Partial<ScheduledInterview> = {
        id: existingInterview?.id,
        companyId: company.id,
        companyName: company.name || 'Şirkət',
        candidateName: candidateName.trim(),
        candidateEmail: candidateEmail.trim().toLowerCase(),
        candidatePhone: candidatePhone.trim(),
        candidateAvatar: candidateApp?.candidatePhoto || candidateApp?.cvData?.personalInfo?.photoUrl || existingInterview?.candidateAvatar,
        applicationId: candidateApp?.id || existingInterview?.applicationId,
        vacancyId: candidateApp?.vacancyId || existingInterview?.vacancyId,
        jobTitle: jobTitle.trim(),
        interviewDate,
        interviewTime,
        interviewType,
        locationOrLink: locationOrLink.trim(),
        interviewerName: interviewerName.trim(),
        interviewerRole: interviewerRole.trim(),
        interviewerEmail: interviewerEmail.trim(),
        notes: notes.trim(),
        autoReminder24h,
        status: 'scheduled',
      };

      const result = await scheduleInterview(payload);
      if (!result.success || !result.interview) {
        throw new Error(result.error || 'Xəta baş verdi');
      }

      // If recruiter also selected immediate confirmation/test dispatch
      if (sendImmediateConfirmation) {
        await sendInterviewReminder(result.interview.id);
      }

      setSuccessMessage('Müsahibə uğurla təyin edildi! 24 saat qalmış namizədə avtomatik SMTP xatırlatması göndəriləcək.');
      if (onSaved) onSaved(result.interview);

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Yadda saxlanarkən xəta baş verdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {existingInterview ? 'Müsahibə Təqvimini Yenilə' : 'Yeni Müsahibə Təyin Et'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  24h SMTP Xatırlatma
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {company.name} • Namizəd üçün görüş vaxtı və avtomatlaşdırılmış xatırlatma tənzimləməsi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Candidate Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Namizədin Adı və Soyadı *</span>
              </label>
              <input
                type="text"
                required
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="məsələn: Leyla Əhmədova"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Namizədin E-poçtu (SMTP Xatırlatma Ünvanı) *</span>
              </label>
              <input
                type="email"
                required
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="namized@example.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Vakansiya / Vəzifə *</span>
              </label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="məsələn: Senior Frontend Developer"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Əlaqə Nömrəsi</span>
              </label>
              <input
                type="text"
                value={candidatePhone}
                onChange={(e) => setCandidatePhone(e.target.value)}
                placeholder="+994 50 123 45 67"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Date, Time & Format */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Görüş Zamanı və Formatı</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Müsahibə Tarixi *
                </label>
                <input
                  type="date"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Müsahibə Saatı *
                </label>
                <input
                  type="time"
                  required
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Müsahibə Növü
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setInterviewType('online');
                      if (locationOrLink.includes('Bakı')) {
                        setLocationOrLink('https://meet.google.com/jobia-interview');
                      }
                    }}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${
                      interviewType === 'online'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Video className="w-3 h-3" />
                    <span>Onlayn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInterviewType('office');
                      if (locationOrLink.includes('meet.google')) {
                        setLocationOrLink(company.location || 'Bakı ş., Şirkət baş ofisi');
                      }
                    }}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${
                      interviewType === 'office'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Ofisdə</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {interviewType === 'online' ? 'Google Meet / Zoom Görüş Linki *' : 'Şirkətin Dəqiq Ünvanı *'}
              </label>
              <input
                type="text"
                required
                value={locationOrLink}
                onChange={(e) => setLocationOrLink(e.target.value)}
                placeholder={interviewType === 'online' ? 'https://meet.google.com/...' : 'Bakı ş., Nizami küç. ...'}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Interviewer details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Müsahibəni Keçirən Şəxs
              </label>
              <input
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="Ad və Soyad"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Vəzifəsi
              </label>
              <input
                type="text"
                value={interviewerRole}
                onChange={(e) => setInterviewerRole(e.target.value)}
                placeholder="məsələn: HR Menecer"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                HR E-poçtu
              </label>
              <input
                type="email"
                value={interviewerEmail}
                onChange={(e) => setInterviewerEmail(e.target.value)}
                placeholder="hr@company.az"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Recruiter Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Daxili Qeydlər və ya Müsahibə Mövzusu
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Namizədin təcrübəsi, soruşulacaq suallar və ya xüsusi qeydlər..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* AUTOMATED 24-HOUR SMTP REMINDER TOGGLE CARD */}
          <div className="p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 rounded-xl border border-blue-200/80 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReminder24h}
                onChange={(e) => setAutoReminder24h(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  Müsahibədən 24 Saat Əvvəl Avtomatik Xatırlatma E-poçtu Göndərilsin (Mövcud SMTP ilə)
                </span>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Sistem arxa fonda təyin olunmuş müsahibə vaxtına düz 24 saat qalmış namizədin e-poçt ünvanına görüş linkini, vaxtını və hazırlıq tövsiyələrini əks etdirən rəsmi xatırlatma məktubunu avtomatik çatdıracaq.
                </p>
              </div>
            </label>

            <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-900 font-medium">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                SMTP serveri: <code className="bg-blue-100/80 px-1 py-0.5 rounded text-[10px] font-mono">SMTP_HOST / 587</code>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendImmediateConfirmation}
                  onChange={(e) => setSendImmediateConfirmation(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600"
                />
                <span className="text-[10px] font-semibold text-slate-700">İndi ilkin təsdiq e-poçtu da göndər</span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Ləğv et
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Yadda Saxlanılır...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{existingInterview ? 'Dəyişiklikləri Saxla' : 'Müsahibəni Təyin Et & 24h Aktivləşdir'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
