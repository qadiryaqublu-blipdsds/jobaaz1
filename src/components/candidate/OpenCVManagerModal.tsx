import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Eye, 
  CreditCard, 
  Copy, 
  ExternalLink, 
  AlertCircle, 
  Check, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  Search, 
  Trash2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  OpenCVRecord, 
  OPEN_CV_PACKAGES, 
  FEATURED_ADDON_PRICE, 
  OpenCVPackageType,
  getCandidateOpenCV,
  publishCandidateOpenCV,
  hideOrRevokeOpenCV,
  respondToOpenCVContactRequest
} from '../../services/openCVService';
import { CVData, User as AppUser } from '../../types';
import { safeAlert } from '../../utils/dialogHelper';

interface OpenCVManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AppUser | null;
  candidateCV?: CVData | null;
  onOpenCatalog?: () => void;
}

export const OpenCVManagerModal: React.FC<OpenCVManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  candidateCV,
  onOpenCatalog
}) => {
  if (!isOpen) return null;

  const candidateId = currentUser?.id || 'cand-current-user';
  const [existingRecord, setExistingRecord] = useState<OpenCVRecord | null>(null);

  // Form State
  const [nameFormat, setNameFormat] = useState<'full' | 'initial_only'>('initial_only');
  const [profession, setProfession] = useState(
    candidateCV?.personalInfo?.jobTitle || currentUser?.jobTitle || 'Peşəkar Mütəxəssis'
  );
  const [category, setCategory] = useState('İnformasiya Texnologiyaları');
  const [city, setCity] = useState(candidateCV?.personalInfo?.address || 'Bakı');
  const [experienceYears, setExperienceYears] = useState(
    candidateCV?.experiences?.length ? Math.max(1, candidateCV.experiences.length * 2) : 3
  );
  const [expectedSalary, setExpectedSalary] = useState<number | undefined>(
    currentUser?.expectedSalary || 1500
  );
  const [summary, setSummary] = useState(
    candidateCV?.personalInfo?.summary || 'Təcrübəli və nəticəyönümlü mütəxəssis.'
  );
  const [showPhoto, setShowPhoto] = useState(true);
  const [packageType, setPackageType] = useState<OpenCVPackageType>('standard');
  const [isFeatured, setIsFeatured] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const rec = getCandidateOpenCV(candidateId);
    if (rec) {
      setExistingRecord(rec);
      setNameFormat(rec.nameFormat);
      setProfession(rec.profession);
      setCategory(rec.category);
      setCity(rec.city);
      setExperienceYears(rec.experienceYears);
      setExpectedSalary(rec.expectedSalary);
      setSummary(rec.summary);
      setShowPhoto(rec.showPhoto);
      setPackageType(rec.packageType);
      setIsFeatured(rec.isFeatured);
    }
  }, [candidateId]);

  const selectedPackage = OPEN_CV_PACKAGES.find((p) => p.type === packageType) || OPEN_CV_PACKAGES[1];
  const totalPrice = selectedPackage.price + (isFeatured ? FEATURED_ADDON_PRICE : 0);

  const handlePublish = () => {
    if (!hasConsent && !existingRecord) {
      safeAlert('Zəhmət olmasa açıq yayım qaydaları və məxfilik şərtlərini təsdiqləyin.');
      return;
    }

    setIsPublishing(true);
    try {
      const skillsList = candidateCV?.skills?.map((s) => s.name) || ['Ümumi İdarəetmə', 'Analitika', 'Komanda İşi'];
      const languagesList = candidateCV?.languages?.map((l) => ({ language: l.name, level: l.level })) || [
        { language: 'Azərbaycan', level: 'Ana dili' }
      ];

      const record = publishCandidateOpenCV({
        candidateId,
        fullName: candidateCV?.personalInfo?.fullName || currentUser?.fullName || 'Namizəd',
        nameFormat,
        profession,
        category,
        city,
        experienceYears,
        expectedSalary,
        skills: skillsList,
        languages: languagesList,
        educationLevel: candidateCV?.education?.[0]?.institution || 'Ali təhsil',
        summary,
        showPhoto,
        photoUrl: candidateCV?.personalInfo?.photoUrl || currentUser?.avatarUrl,
        directPhone: candidateCV?.personalInfo?.phone || currentUser?.phone,
        directEmail: candidateCV?.personalInfo?.email || currentUser?.email,
        packageType,
        isFeatured,
        cvData: candidateCV || undefined
      });

      setExistingRecord(record);
      safeAlert('Açıq CV-niz uğurla yayımlandı və Google / Jobia.az kataloqunda aktivləşdirildi!');
    } catch (err: any) {
      safeAlert(err.message || 'Xəta baş verdi');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRevoke = () => {
    hideOrRevokeOpenCV(candidateId);
    setExistingRecord(null);
    safeAlert('Açıq CV-niz gizlədildi və axtarış sistemlərindən silinmə üçün işarələndi.');
  };

  const handleRespondToRequest = (requestId: string, action: 'accepted' | 'declined') => {
    if (existingRecord) {
      respondToOpenCVContactRequest(existingRecord.id, requestId, action);
      const updated = getCandidateOpenCV(candidateId);
      if (updated) setExistingRecord(updated);
      safeAlert(
        action === 'accepted'
          ? 'Sorğu qəbul edildi! Şirkətə əlaqə məlumatlarınız açıldı.'
          : 'Sorğu rədd edildi.'
      );
    }
  };

  const publicUrl = existingRecord ? `https://jobia.az/cv/${existingRecord.slug}` : `https://jobia.az/cv/numune-cv-101`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Açıq CV • Axtarış Sistemlərində Görünmə Xidməti</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Açıq CV İdarəetməsi və Google SEO Yayımlanması
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              İşəgötürənlər Google-da və ya Jobia kataloqunda sizin sahənizi axtardıqda (məs: "aqronom CV Bakı", "mühasib CV") birbaşa sizin peşəkar profilinizə çıxırlar.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Active Record Banner */}
        {existingRecord && existingRecord.status === 'active' && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">
                  CV-niz hal-hazırda rəsmi olaraq internetdə AÇIQDIR
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                Qalan müddət: {existingRecord.daysRemaining} gün
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-slate-600 truncate">{publicUrl}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={copyShareLink}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                </button>
                {onOpenCatalog && (
                  <button
                    onClick={() => { onClose(); onOpenCatalog(); }}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Kataloqda Bax</span>
                  </button>
                )}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                <span className="text-slate-500 text-[11px]">Baxış Sayı</span>
                <p className="text-sm font-bold text-slate-900">{existingRecord.viewsCount} nəfər</p>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                <span className="text-slate-500 text-[11px]">Gələn Əlaqə Sorğusu</span>
                <p className="text-sm font-bold text-emerald-600">
                  {existingRecord.contactRequests?.length || 0} şirkət
                </p>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 col-span-2 sm:col-span-1">
                <span className="text-slate-500 text-[11px]">Yayım Statusu</span>
                <p className="text-sm font-bold text-slate-900">
                  {existingRecord.isFeatured ? 'Önə Çıxarılmış' : 'Standart'}
                </p>
              </div>
            </div>

            {/* Inbound Contact Requests */}
            {existingRecord.contactRequests && existingRecord.contactRequests.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Şirkətlərdən Gələn İş Təklifləri və Əlaqə Sorğuları:</span>
                </h4>
                <div className="space-y-2">
                  {existingRecord.contactRequests.map((req) => (
                    <div key={req.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">{req.employerCompany}</strong>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'declined' ? 'bg-slate-100 text-slate-500' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status === 'accepted' ? 'Təsdiqləndi (Əlaqə Açıldı)' :
                           req.status === 'declined' ? 'İmtina Edildi' : 'Gözləmədə'}
                        </span>
                      </div>
                      <p className="text-slate-600 italic">"{req.message}"</p>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Təklif: {req.positionOffered}</span>
                        {req.salaryOffered && <span>Maaş: {req.salaryOffered}</span>}
                      </div>

                      {req.status === 'accepted' && (
                        <div className="bg-emerald-50 p-2 rounded-lg text-[11px] text-emerald-900 flex items-center gap-3">
                          <span className="flex items-center gap-1 font-semibold">
                            <Mail className="w-3 h-3" /> {req.employerEmail}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <Phone className="w-3 h-3" /> {req.employerPhone}
                          </span>
                        </div>
                      )}

                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleRespondToRequest(req.id, 'accepted')}
                            className="px-3 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer"
                          >
                            Əlaqəni Təsdiq Et
                          </button>
                          <button
                            onClick={() => handleRespondToRequest(req.id, 'declined')}
                            className="px-3 py-1 rounded bg-slate-100 text-slate-600 font-semibold text-[11px] hover:bg-slate-200 cursor-pointer"
                          >
                            İmtina Et
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <button
                onClick={handleRevoke}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Açıq Yayımı Dayandır və Gizlət</span>
              </button>
            </div>
          </div>
        )}

        {/* Configuration Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Məlumatlar və Məxfilik Tənzimləmələri
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Açıq Vəzifə Adı *</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Məs: Aqronom, Baş Mühasib, React Mühəndisi..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Şəhər / Region *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bakı, Gəncə, Sumqayıt..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Təcrübə (il) *</label>
              <input
                type="number"
                min={0}
                max={40}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Arzu olunan Əməkhaqqı (AZN)</label>
              <input
                type="number"
                step={50}
                value={expectedSalary || ''}
                onChange={(e) => setExpectedSalary(Number(e.target.value))}
                placeholder="Məs: 1800"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Privacy controls */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2.5 text-xs">
            <span className="font-bold text-slate-800 block">Məxfilik və Görünmə Seçimləri:</span>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="nameFormat"
                  checked={nameFormat === 'initial_only'}
                  onChange={() => setNameFormat('initial_only')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">
                  <strong>Ad və Soyadın baş hərfi (Tövsiyə olunur):</strong> Məs: "Ramil Q." (Məxfiliyiniz qorunur)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="nameFormat"
                  checked={nameFormat === 'full'}
                  onChange={() => setNameFormat('full')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">
                  <strong>Tam Ad və Soyad:</strong> Məs: "{candidateCV?.personalInfo?.fullName || currentUser?.fullName || 'Ramil Qasımov'}"
                </span>
              </label>
            </div>

            <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Telefon və E-poçt standart olaraq gizlidir (Yalnız sorğunu qəbul etdikdə açılır)</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                100% Təhlükəsiz
              </span>
            </div>
          </div>

          {/* SERP Preview (Google Snippet Preview) */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Axtarış Sistemində Necə Görünəcək (Önizləmə):</span>
            </span>
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs font-sans text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-semibold text-blue-700">jobia.az</span>
                <span>› cv › {profession.toLowerCase().replace(/\s+/g, '-')}-{city.toLowerCase()}</span>
              </div>
              <h4 className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer">
                {profession} {nameFormat === 'initial_only' ? 'Namizəd' : currentUser?.fullName || 'Namizəd'} CV - {city} | Jobia.az
              </h4>
              <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                {experienceYears} il peşəkar təcrübə, təsdiqlənmiş bacarıqlar. {city} şəhərində vakansiyalar üçün açıq profil. Birbaşa əlaqə sorğusu göndərin.
              </p>
            </div>
          </div>

          {/* Package Selection */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Yayım Müddəti və Paket Seçimi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {OPEN_CV_PACKAGES.map((pkg) => {
                const isSelected = packageType === pkg.type;
                return (
                  <div
                    key={pkg.type}
                    onClick={() => setPackageType(pkg.type)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{pkg.name}</span>
                      {pkg.isPopular && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                          Top
                        </span>
                      )}
                    </div>

                    <div className="text-lg font-black text-slate-900">
                      {pkg.price} <span className="text-xs font-normal text-slate-500">AZN</span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-tight">
                      {pkg.durationText}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Featured Add-on Toggle */}
            <div className="bg-gradient-to-r from-amber-50/80 to-amber-100/50 border border-amber-200 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <div>
                  <strong className="text-amber-950 font-bold block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Önə Çıxarılmış Profil (+{FEATURED_ADDON_PRICE} AZN)</span>
                  </strong>
                  <span className="text-amber-800 text-[11px]">
                    Kataloqda ən üst sırada qızılı nişanla görün və 4 qat daha çox işəgötürən baxışı əldə et.
                  </span>
                </div>
              </label>
              <span className="text-sm font-black text-amber-900 shrink-0">
                +{FEATURED_ADDON_PRICE} AZN
              </span>
            </div>
          </div>

          {/* Consent Checkbox */}
          {!existingRecord && (
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                required
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded mt-0.5 focus:ring-blue-500"
              />
              <span>
                CV-min seçdiyim məxfilik parametrləri ilə internetdə və Jobia kataloqunda açıq yayımlanmasına razılıq verirəm. 
                İstədiyim an bu razılığı geri götürə və yayımı dayandıra bilərəm.
              </span>
            </label>
          )}

          {/* Action and Checkout Footer */}
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              Yekun Ödəniş: <strong className="text-base font-black text-slate-900">{totalPrice} AZN</strong>
              <span className="text-[11px] text-slate-400 block">Qapalı bank kartı / Birkart / Tamkart ilə dərhal aktivləşir</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Bağla
              </button>
              <button
                type="button"
                disabled={isPublishing}
                onClick={handlePublish}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-blue-200" />
                <span>{isPublishing ? 'Yayımlanır...' : `${totalPrice} AZN Ödə və Açıq Yayımla`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
