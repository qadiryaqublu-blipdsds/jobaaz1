import React, { useState, useMemo } from 'react';
import { 
  OpenCVRecord, 
  getStoredOpenCVs, 
  submitOpenCVContactRequest, 
  incrementOpenCVViews 
} from '../../services/openCVService';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  Award, 
  Sparkles, 
  Eye, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ExternalLink, 
  MessageSquare, 
  X, 
  Send, 
  Lock, 
  ShieldCheck, 
  DollarSign, 
  Share2, 
  GraduationCap, 
  Languages, 
  Calendar, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { safeAlert } from '../../utils/dialogHelper';

interface OpenCVCatalogViewProps {
  onOpenCandidateManager?: () => void;
  onSelectOpenCV?: (cv: OpenCVRecord) => void;
}

export const OpenCVCatalogView: React.FC<OpenCVCatalogViewProps> = ({
  onOpenCandidateManager,
  onSelectOpenCV
}) => {
  const [records, setRecords] = useState<OpenCVRecord[]>(() => getStoredOpenCVs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minExp, setMinExp] = useState<number>(0);
  const [selectedCVForContact, setSelectedCVForContact] = useState<OpenCVRecord | null>(null);

  // Contact Request Form State
  const [employerName, setEmployerName] = useState('');
  const [employerCompany, setEmployerCompany] = useState('');
  const [employerEmail, setEmployerEmail] = useState('');
  const [employerPhone, setEmployerPhone] = useState('');
  const [positionOffered, setPositionOffered] = useState('');
  const [salaryOffered, setSalaryOffered] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Available filters
  const cities = useMemo(() => {
    const list = Array.from(new Set(records.map((r) => r.city).filter(Boolean)));
    return ['all', ...list];
  }, [records]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(records.map((r) => r.category).filter(Boolean)));
    return ['all', ...list];
  }, [records]);

  // Filtered & Sorted: Featured CVs always appear first, then newest
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => r.status === 'active')
      .filter((r) => {
        if (selectedCity !== 'all' && r.city !== selectedCity) return false;
        if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
        if (r.experienceYears < minExp) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = r.profession.toLowerCase().includes(q);
          const matchName = r.displayName.toLowerCase().includes(q);
          const matchSkills = r.skills.some((s) => s.toLowerCase().includes(q));
          const matchCity = r.city.toLowerCase().includes(q);
          if (!matchTitle && !matchName && !matchSkills && !matchCity) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [records, selectedCity, selectedCategory, minExp, searchQuery]);

  const handleOpenContactModal = (cv: OpenCVRecord) => {
    incrementOpenCVViews(cv.id);
    setSelectedCVForContact(cv);
    setPositionOffered(cv.profession);
    setContactSuccess(false);
  };

  const handleSubmitContactRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCVForContact) return;
    if (!employerName.trim() || !employerCompany.trim() || !employerEmail.trim() || !employerPhone.trim()) {
      safeAlert('Zəhmət olmasa bütün əlaqə məlumatlarını doldurun.');
      return;
    }

    setIsSubmittingContact(true);
    try {
      submitOpenCVContactRequest({
        openCvId: selectedCVForContact.id,
        employerName,
        employerCompany,
        employerEmail,
        employerPhone,
        positionOffered,
        salaryOffered,
        message: contactMessage || `Hörmətli ${selectedCVForContact.displayName}, ${employerCompany} şirkətində ${positionOffered} vəzifəsi üçün sizin təcrübənizi nəzərdən keçirmək istərdik.`
      });

      setContactSuccess(true);
      // Refresh list to update counts
      setRecords(getStoredOpenCVs());
    } catch (err: any) {
      safeAlert(err.message || 'Sorğu göndərilərkən xəta baş verdi.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>jobia.az • Açıq CV Kataloqu və SEO Reyestri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Azərbaycanın Açıq və Təsdiqlənmiş CV Kataloqu
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Namizədlərin Google və beynəlxalq axtarış sistemlərində tapıla bilən rəsmi açıq CV profilləri. 
            İşəgötürənlər üçün birbaşa əlaqə sorğusu, təsdiqlənmiş bacarıqlar və spamdan mühafizə olunan təhlükəsiz ünsiyyət.
          </p>
          {onOpenCandidateManager && (
            <div className="pt-2">
              <button
                onClick={onOpenCandidateManager}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Öz CV-mi Açıq Yayımla (Ödənişli Xidmət)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Peşə, bacarıq, vəzifə və ya ad axtarın (məs: Aqronom, Mühasib, React, Bakı)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Bütün Şəhərlər</option>
              {cities.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Bütün Sahələr</option>
              {categories.filter((cat) => cat !== 'all').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={minExp}
              onChange={(e) => setMinExp(Number(e.target.value))}
              className="px-3 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value={0}>Təcrübə (Hamısı)</option>
              <option value={1}>1+ il</option>
              <option value={3}>3+ il</option>
              <option value={5}>5+ il</option>
              <option value={8}>8+ il</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Tapılan Açıq CV sayı: <strong className="text-slate-900 font-bold">{filteredRecords.length}</strong> namizəd
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Telefon və e-poçt namizədin razılığı ilə açılır</span>
          </span>
        </div>
      </div>

      {/* CV Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Uyğun Açıq CV tapılmadı</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Axtarış sözünü dəyişin və ya filtrləri sıfırlayaraq digər sahələrdəki açıq profilləri nəzərdən keçirin.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCity('all'); setSelectedCategory('all'); setMinExp(0); }}
            className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
          >
            Filtrləri Sıfırla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredRecords.map((cv) => (
            <div
              key={cv.id}
              className={`bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-md relative overflow-hidden ${
                cv.isFeatured
                  ? 'border-amber-300 bg-gradient-to-b from-amber-50/20 via-white to-white ring-1 ring-amber-300/60'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {/* Featured Badge */}
              {cv.isFeatured && (
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 flex items-center justify-between shadow-xs">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>Önə Çıxarılmış Açıq CV</span>
                  </span>
                  <span className="text-amber-100 text-[9px] font-medium">Top Reytinq</span>
                </div>
              )}

              <div className="p-4 sm:p-5 space-y-3.5">
                {/* Header with Photo & Basic Info */}
                <div className="flex items-start gap-3">
                  {cv.showPhoto && cv.photoUrl ? (
                    <img
                      src={cv.photoUrl}
                      alt={cv.displayName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                      {cv.displayName.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {cv.displayName}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Açıq Profil
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-blue-600 mt-0.5 line-clamp-1">
                      {cv.profession}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{cv.city}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>{cv.experienceYears} il təcrübə</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expected Salary */}
                {cv.expectedSalary ? (
                  <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-slate-500">Maaş gözləntisi:</span>
                    <strong className="text-slate-900 font-bold">{cv.expectedSalary} AZN / ay</strong>
                  </div>
                ) : null}

                {/* Summary snippet */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {cv.summary}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5">
                  {cv.skills.slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                  {cv.skills.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400">
                      +{cv.skills.length - 4}
                    </span>
                  )}
                </div>

                {/* Languages & Education */}
                <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                    <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{cv.educationLevel}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>{cv.viewsCount} baxış</span>
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-3 sm:px-5 sm:py-3 bg-slate-50 border-t border-slate-200/80 flex items-center gap-2">
                <button
                  onClick={() => handleOpenContactModal(cv)}
                  className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Əlaqə Saxla</span>
                </button>

                {onSelectOpenCV && (
                  <button
                    onClick={() => {
                      incrementOpenCVViews(cv.id);
                      onSelectOpenCV(cv);
                    }}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Tam CV Profilinə Bax"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTACT REQUEST MODAL */}
      {selectedCVForContact && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Təhlükəsiz Əlaqə Sorğusu</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedCVForContact.displayName} ilə Əlaqə Saxla
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCVForContact.profession} ({selectedCVForContact.city})
                </p>
              </div>
              <button
                onClick={() => setSelectedCVForContact(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {contactSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-emerald-900">
                  Əlaqə sorğunuz namizədə uğurla çatdırıldı!
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed max-w-sm mx-auto">
                  Namizəd sorğunuzu şəxsi kabinetində təsdiqlədikdən sonra birbaşa əlaqə məlumatları (telefon və e-poçt) sizə açılacaqdır.
                </p>
                <button
                  onClick={() => setSelectedCVForContact(null)}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Bağla
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitContactRequest} className="space-y-3 text-xs">
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-800 text-[11px] flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Spamdan mühafizə məqsədilə namizədin telefon nömrəsi standart olaraq gizlidir. Sorğunuz qəbul edildikdə birbaşa əlaqə açılır.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Şirkətinizin Adı *</label>
                    <input
                      type="text"
                      required
                      value={employerCompany}
                      onChange={(e) => setEmployerCompany(e.target.value)}
                      placeholder="Məs: Paşa Holdinq, Bravo..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Əlaqələndirici Şəxs (Ad, Soyad) *</label>
                    <input
                      type="text"
                      required
                      value={employerName}
                      onChange={(e) => setEmployerName(e.target.value)}
                      placeholder="Məs: Kamran Əliyev"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">İş E-poçtunuz *</label>
                    <input
                      type="email"
                      required
                      value={employerEmail}
                      onChange={(e) => setEmployerEmail(e.target.value)}
                      placeholder="hr@company.az"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Əlaqə Telefonu *</label>
                    <input
                      type="tel"
                      required
                      value={employerPhone}
                      onChange={(e) => setEmployerPhone(e.target.value)}
                      placeholder="+994 50 123 45 67"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Təklif Edilən Vəzifə</label>
                    <input
                      type="text"
                      value={positionOffered}
                      onChange={(e) => setPositionOffered(e.target.value)}
                      placeholder="Məs: Baş Aqronom"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nəzərdə Tutulan Maaş (AZN)</label>
                    <input
                      type="text"
                      value={salaryOffered}
                      onChange={(e) => setSalaryOffered(e.target.value)}
                      placeholder="Məs: 2000 - 2500 AZN"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Namizədə Qısa Mesajınız</label>
                  <textarea
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Vakansiyanın detalları və namizədin profili ilə maraqlanma səbəbinizi qeyd edin..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCVForContact(null)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingContact ? 'Göndərilir...' : 'Əlaqə Sorğusu Göndər'}</span>
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
