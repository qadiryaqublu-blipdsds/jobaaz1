import React, { useState } from 'react';
import { 
  OpenCVRecord, 
  submitOpenCVContactRequest 
} from '../../services/openCVService';
import { 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Languages, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  ArrowLeft, 
  Share2, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Calendar, 
  DollarSign,
  Copy,
  Check
} from 'lucide-react';
import { safeAlert } from '../../utils/dialogHelper';

interface PublicCVSingleViewProps {
  cv: OpenCVRecord;
  onBack: () => void;
}

export const PublicCVSingleView: React.FC<PublicCVSingleViewProps> = ({ cv, onBack }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Contact form
  const [employerCompany, setEmployerCompany] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [employerEmail, setEmployerEmail] = useState('');
  const [employerPhone, setEmployerPhone] = useState('');
  const [positionOffered, setPositionOffered] = useState(cv.profession);
  const [salaryOffered, setSalaryOffered] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const shareUrl = `https://jobia.az/cv/${cv.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerCompany.trim() || !employerName.trim() || !employerEmail.trim()) {
      safeAlert('Zəhmət olmasa tələb olunan xanaları doldurun.');
      return;
    }

    setIsSubmitting(true);
    try {
      submitOpenCVContactRequest({
        openCvId: cv.id,
        employerName,
        employerCompany,
        employerEmail,
        employerPhone,
        positionOffered,
        salaryOffered,
        message: message || `${cv.displayName} üçün ${positionOffered} vəzifəsi təklif olunur.`
      });
      setSubmitSuccess(true);
    } catch (err: any) {
      safeAlert(err.message || 'Xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Açıq CV Kataloquna Qayıt</span>
        </button>

        <button
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'Link Kopyalandı' : 'Profil Linkini Paylaş'}</span>
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover / Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-6 py-8 text-white relative">
          {cv.isFeatured && (
            <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span>Önə Çıxarılmış Açıq CV</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {cv.showPhoto && cv.photoUrl ? (
              <img
                src={cv.photoUrl}
                alt={cv.displayName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-md bg-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-blue-600 border-2 border-white/20 text-white font-black text-3xl flex items-center justify-center shadow-md">
                {cv.displayName.charAt(0)}
              </div>
            )}

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black">{cv.displayName}</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Google İndekslənmiş Açıq CV
                </span>
              </div>

              <p className="text-base text-blue-200 font-bold">{cv.profession}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cv.city}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cv.experienceYears} il təcrübə</span>
                </span>
                {cv.expectedSalary && (
                  <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Maaş: {cv.expectedSalary} AZN</span>
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 sm:pt-0">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Əlaqə Saxla</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Peşəkar Xülasə */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
              Peşəkar Xülasə
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {cv.summary}
            </p>
          </div>

          {/* Bacarıqlar */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
              Əsas Bacarıqlar və Kompetensiyalar
            </h3>
            <div className="flex flex-wrap gap-2">
              {cv.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Təhsil və Dillər Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Təhsil Səviyyəsi</span>
              </span>
              <p className="text-sm font-bold text-slate-900">{cv.educationLevel}</p>
            </div>

            <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                <Languages className="w-4 h-4 text-indigo-600" />
                <span>Dil Bilikləri</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {cv.languages.map((l, idx) => (
                  <span key={idx} className="text-xs font-semibold text-slate-700">
                    {l.language} ({l.level}){idx < cv.languages.length - 1 ? ' •' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Məxfilik və Təhlükəsizlik Bildirişi */}
          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold">Məlumatların Qorunması Qaydası:</strong>
              <p className="text-amber-800 leading-relaxed">
                Namizədin telefon nömrəsi və e-poçt ünvanı kütləvi skreypinq və spamdan qorunmaq məqsədilə gizlidir. 
                "Əlaqə Saxla" düyməsi ilə göndərdiyiniz sorğu namizəd tərəfindən qəbul edildikdə birbaşa əlaqə koordinatları sizə təqdim ediləcəkdir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTACT MODAL */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {cv.displayName} üçün İş Təklifi və Əlaqə Sorğusu
              </h3>
              <button
                onClick={() => { setIsContactModalOpen(false); setSubmitSuccess(false); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Sorğunuz Göndərildi!</h4>
                <p className="text-xs text-emerald-700">
                  Namizəd sorğunuzu qəbul etdikdən sonra birbaşa əlaqə məlumatları sizə çatdırılacaqdır.
                </p>
                <button
                  onClick={() => { setIsContactModalOpen(false); setSubmitSuccess(false); }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Şirkətinizin Adı *</label>
                  <input
                    type="text"
                    required
                    value={employerCompany}
                    onChange={(e) => setEmployerCompany(e.target.value)}
                    placeholder="Məs: Paşa Bank, Azercell..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Əlaqələndirici Şəxs *</label>
                    <input
                      type="text"
                      required
                      value={employerName}
                      onChange={(e) => setEmployerName(e.target.value)}
                      placeholder="Ad, Soyad"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">E-poçt *</label>
                    <input
                      type="email"
                      required
                      value={employerEmail}
                      onChange={(e) => setEmployerEmail(e.target.value)}
                      placeholder="hr@company.az"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Əlaqə Telefonu</label>
                    <input
                      type="tel"
                      value={employerPhone}
                      onChange={(e) => setEmployerPhone(e.target.value)}
                      placeholder="+994 50 123 45 67"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nəzərdə Tutulan Maaş</label>
                    <input
                      type="text"
                      value={salaryOffered}
                      onChange={(e) => setSalaryOffered(e.target.value)}
                      placeholder="Məs: 2000 AZN"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Qısa Mesajınız</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Təklif etdiyiniz vəzifə və iş şəraiti haqqında məlumat..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                  >
                    {isSubmitting ? 'Göndərilir...' : 'Sorğunu Göndər'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
