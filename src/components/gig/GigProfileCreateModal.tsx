import React, { useState } from 'react';
import { GigProfile, GigProfileType, GigAvailability, TutorTeachingFormat } from '../../types';
import { saveGigProfile } from '../../services/gigService';
import { X, Sparkles, UserCheck, Check, DollarSign, MapPin, Phone, MessageCircle, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface GigProfileCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: (profile: GigProfile) => void;
  initialType?: GigProfileType;
}

export const GigProfileCreateModal: React.FC<GigProfileCreateModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated,
  initialType = 'casual_worker',
}) => {
  const { language } = useLanguage();
  const [profileType, setProfileType] = useState<GigProfileType>(initialType);

  // Form states
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('Bakı');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [dailyRate, setDailyRate] = useState<number | ''>('');
  const [monthlyRate, setMonthlyRate] = useState<number | ''>('');
  const [phone, setPhone] = useState('+994 ');
  const [whatsapp, setWhatsapp] = useState('');
  const [availability, setAvailability] = useState<GigAvailability>('available_today');
  const [formats, setFormats] = useState<TutorTeachingFormat[]>(['online', 'in_person']);
  const [trialLesson, setTrialLesson] = useState(true);
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [skillsInput, setSkillsInput] = useState('');
  const [bio, setBio] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleToggleFormat = (fmt: TutorTeachingFormat) => {
    if (formats.includes(fmt)) {
      setFormats(formats.filter((f) => f !== fmt));
    } else {
      setFormats([...formats, fmt]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !title.trim() || !phone.trim()) {
      setErrorMsg('Zəhmət olmasa Ad, Peşə/İxtisas və Əlaqə nömrəsini daxil edin.');
      return;
    }

    const cleanWhatsapp = whatsapp.trim() ? whatsapp.replace(/\D/g, '') : phone.replace(/\D/g, '');

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newProfile: GigProfile = {
      id: `gig-user-${Date.now()}`,
      type: profileType,
      fullName: fullName.trim(),
      title: title.trim(),
      category: category.trim() || (profileType === 'tutor_instructor' ? 'Təhsil & Repetitorluq' : 'Tədbir & Xidmət'),
      phone: phone.trim(),
      whatsapp: cleanWhatsapp || '994500000000',
      location: location.trim(),
      rating: 5.0,
      reviewsCount: 1,
      hourlyRate: hourlyRate !== '' ? Number(hourlyRate) : undefined,
      dailyRate: dailyRate !== '' ? Number(dailyRate) : undefined,
      monthlyRate: monthlyRate !== '' ? Number(monthlyRate) : undefined,
      currency: 'AZN',
      availability,
      formats: profileType === 'tutor_instructor' ? formats : undefined,
      trialLessonAvailable: profileType === 'tutor_instructor' ? trialLesson : undefined,
      subjectsOrSkills: parsedSkills.length > 0 ? parsedSkills : (profileType === 'tutor_instructor' ? ['Fərdi dərslər', 'İmtahana hazırlıq'] : ['Təcrübəli']),
      experienceYears: Number(experienceYears) || 1,
      bio: bio.trim() || `${title} üzrə xidmət təklif edirəm. Təcrübəli və məsuliyyətliyəm.`,
      verified: true,
      completedGigsCount: 1,
      badges: profileType === 'tutor_instructor' 
        ? ['🎓 Təsdiqlənmiş Müəllim', trialLesson ? '✨ Sınaq Dərsi Var' : '⭐ Yeni Müəllim']
        : ['⚡ Bugün Hazır', '🛡️ Təsdiqlənmiş İfaçı'],
      createdAt: new Date().toISOString().split('T')[0],
    };

    saveGigProfile(newProfile);
    onProfileCreated(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                {language === 'en' 
                  ? 'Create Hourly Worker or Tutor Profile' 
                  : language === 'ru' 
                  ? 'Создать профиль специалиста или преподавателя' 
                  : 'Saatlıq İcraçı və ya Kurs Müəllimi Profili Yarat'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
                {language === 'en'
                  ? 'Get discovered by individuals and companies across Azerbaijan with direct WhatsApp hiring'
                  : 'Birbaşa WhatsApp və zənglə sifarişlər qəbul edin, tələbələr və ya günlük işəgötürənlər sizi tapsın'}
              </p>
            </div>
          </div>

          {/* Profile Type Toggle Segment */}
          <div className="mt-5 grid grid-cols-2 gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => setProfileType('casual_worker')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                profileType === 'casual_worker'
                  ? 'bg-white text-emerald-950 shadow-md scale-[1.01]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>⚡ Günlük / Saatlıq İşçi</span>
            </button>
            <button
              type="button"
              onClick={() => setProfileType('tutor_instructor')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                profileType === 'tutor_instructor'
                  ? 'bg-white text-emerald-950 shadow-md scale-[1.01]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🎓 Kurs Müəllimi / Repetitor</span>
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ad və Soyadınız *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Məs: Rəşad Quliyev"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {profileType === 'tutor_instructor' ? 'Tədris Sahəsi / Müəllimlik İxtisası *' : 'Peşə / İxtisas Başlığı *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  profileType === 'tutor_instructor'
                    ? 'Məs: İngilis dili & IELTS Təlimçisi'
                    : 'Məs: Tədbir Ofisiantı & Barmen'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kateqoriya
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-600"
              >
                {profileType === 'tutor_instructor' ? (
                  <>
                    <option value="Xarici Dillər">Xarici Dillər</option>
                    <option value="İT & Rəqəmsal Texnologiyalar">İT & Rəqəmsal Texnologiyalar</option>
                    <option value="Məktəb & İmtahana Hazırlıq">Məktəb & İmtahan (DİM / Buraxılış)</option>
                    <option value="Dövlət Qulluğu & Karyera">Dövlət Qulluğu & Karyera</option>
                    <option value="Musiqi & İncəsənət">Musiqi & İncəsənət</option>
                    <option value="Magistratura & Məntiq">Magistratura & Məntiq</option>
                    <option value="Digər Təlimlər">Digər Təlimlər</option>
                  </>
                ) : (
                  <>
                    <option value="Tədbir & HoReCa">Tədbir, Otel & Restoran (HoReCa)</option>
                    <option value="Usta & Təmir">Usta & Təmir (Elektrik, Santexnik və s.)</option>
                    <option value="Kuryer & Çatdırılma">Kuryer & Çatdırılma</option>
                    <option value="Tədbir & Marketinq">Promouter & Hostes</option>
                    <option value="Foto & Video">Fotoqrafiya & Videoqrafiya</option>
                    <option value="Təmizlik & Xidmət">Təmizlik & Ev Xidməti</option>
                    <option value="Sürücü & Daşıma">Sürücü & Yük Daşıma</option>
                    <option value="Digər Xidmətlər">Digər Xidmətlər</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Şəhər / Ərazi
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Məs: Bakı, Yasamal"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                İş Təcrübəsi (İl)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Qiymət və Tarifləriniz (AZN)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Saatlıq Tarif (₼/saat)</span>
                <input
                  type="number"
                  placeholder="Məs: 15"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              {profileType === 'casual_worker' ? (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Günlük Tarif (₼/gün)</span>
                  <input
                    type="number"
                    placeholder="Məs: 60"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              ) : (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Aylıq Paket (₼/ay)</span>
                  <input
                    type="number"
                    placeholder="Məs: 140"
                    value={monthlyRate}
                    onChange={(e) => setMonthlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Mövcudluq / Cədvəl</span>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as GigAvailability)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-emerald-600"
                >
                  <option value="available_today">⚡ Bugün Hazır</option>
                  <option value="flexible">🕒 Çevik Qrafik</option>
                  <option value="weekends">📅 Həftəsonları</option>
                  <option value="evenings">🌙 Axşam Saatları</option>
                  <option value="busy">🔴 Məşğul</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tutor Specific Options */}
          {profileType === 'tutor_instructor' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-3">
              <span className="text-xs font-bold text-emerald-950 block">
                Tədris Formatları və Tələbə Şərtləri
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'online' as const, label: '💻 Onlayn (Zoom/Meet)' },
                  { id: 'in_person' as const, label: '🏫 Əyani (Məkan)' },
                  { id: 'student_home' as const, label: '🏠 Tələbənin evində' },
                  { id: 'tutor_place' as const, label: '📍 Müəllimin ofisində' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => handleToggleFormat(fmt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      formats.includes(fmt.id)
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100/50'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={trialLesson}
                  onChange={(e) => setTrialLesson(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-emerald-900">
                  🎁 Pulsuz və ya endirimli 30 dəqiqəlik sınaq dərsi təklif edirəm
                </span>
              </label>
            </div>
          )}

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Əlaqə Telefonu *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+994 50 123 45 67"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Nömrəsi (Sifarişlər üçün)
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Məs: 0501234567"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {profileType === 'tutor_instructor' ? 'Tədris Etdiyiniz Fənlər və ya İmtahanlar (Vergüllə ayırın)' : 'Əsas Bacarıqlarınız və Xidmətləriniz (Vergüllə ayırın)'}
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder={
                profileType === 'tutor_instructor'
                  ? 'IELTS, General English, Danışıq Klubu, Qrammatika'
                  : 'Banket xidməti, Protokol, Barista, Qonaq qarşılama'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Haqqınızda / Təcrübəniz və Təklif Etdiyiniz Üstünlüklər
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={
                profileType === 'tutor_instructor'
                  ? 'Tələbələrinizin nailiyyətləri, tədris metodologiyanız və dərslərin necə keçirilməsi haqqında...'
                  : 'Gördüyünüz işlər, təcrübəniz, dəqiqliyiniz və müştəriyə verəcəyiniz zəmanət haqqında...'
              }
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Profili Dərc Et (+ Pulsuz)</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
