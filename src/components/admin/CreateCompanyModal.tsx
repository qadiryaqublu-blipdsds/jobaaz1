import React, { useState } from 'react';
import { Company } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Sparkles,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCompany: (companyData: Omit<Company, 'id'>) => Promise<Company>;
  onCompanyCreated?: (createdCompany: Company) => void;
}

const COMMON_INDUSTRIES = [
  'İnformasiya Texnologiyaları və Proqramlaşdırma',
  'Bankçılıq, Maliyyə və Mühasibat',
  'Telekommunikasiya və Rabitə',
  'Pərakəndə Satış və E-ticarət',
  'Tikinti və Memarlıq',
  'Logistika, Nəqliyyat və Anbar',
  'Təhsil və Təlim Mərkəzləri',
  'Səhiyyə, Tibb və Əczaçılıq',
  'Restoran, Otelçilik və Turizm',
  'Marketinq, PR və Reklam',
  'İstehsalat və Sənaye',
  'Hüquq və Konsaltinq',
  'Dövlət və QHT Sektoru',
  'Digər Sahələr'
];

export const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  isOpen,
  onClose,
  onCreateCompany,
  onCompanyCreated,
}) => {
  const { language } = useLanguage();

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState(COMMON_INDUSTRIES[0]);
  const [city, setCity] = useState('Bakı');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [employeeCount, setEmployeeCount] = useState('10-50');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Auto-generate nice avatar if user hasn't supplied custom logo URL
  const effectiveLogo = logoUrl.trim() || (name.trim() 
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=2563eb,3b82f6,1d4ed8&textColor=ffffff` 
    : 'https://api.dicebear.com/7.x/initials/svg?seed=Company');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(language === 'en' ? 'Please enter company name.' : language === 'ru' ? 'Укажите название компании.' : 'Zəhmət olmasa şirkət adını daxil edin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCompanyData: Omit<Company, 'id'> = {
        name: name.trim(),
        logo: effectiveLogo,
        verified: isVerified,
        verificationStatus: isVerified ? 'verified' : 'pending',
        industry,
        location: address.trim() ? `${city}, ${address.trim()}` : `${city}, Azərbaycan`,
        city,
        address: address.trim() || undefined,
        website: website.trim() || undefined,
        email: email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@jobia.az`,
        phone: phone.trim() || undefined,
        description: description.trim() || `${name.trim()} rəsmi fəaliyyət göstərən müəssisədir.`,
        employeeCount,
        activeJobsCount: 0,
      };

      const created = await onCreateCompany(newCompanyData);
      if (onCompanyCreated) {
        onCompanyCreated(created);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Şirkət yaradılarkən xəta baş verdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {language === 'en'
                    ? 'Register New Company (Admin)'
                    : language === 'ru'
                    ? 'Создать новую компанию (Админ)'
                    : 'Yeni Şirkət Qeydiyyatı (Admin)'}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {language === 'en'
                  ? 'Add a company profile to post verified vacancies on their behalf'
                  : language === 'ru'
                  ? 'Добавьте профиль компании для публикации вакансий от её имени'
                  : 'Şirkət profili yaradın və bu şirkət adından rəsmi vakansiyalar paylaşın'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Company Name & Live Logo Preview Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={effectiveLogo}
                alt={name || 'Logo Preview'}
                className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm bg-white"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-blue-600 rounded-full text-white shadow-xs" title="Loqo önbaxışı">
                <Sparkles className="w-3 h-3" />
              </span>
            </div>
            <div className="flex-1 w-full space-y-2">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {language === 'en' ? 'Company Name *' : language === 'ru' ? 'Название компании *' : 'Şirkətin Rəsmi Adı *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Məs: SOCAR, Kapital Bank, Trendyol, Azercell..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm font-semibold text-slate-900 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {language === 'en'
                  ? 'A professional monogram logo will automatically be generated if no image link is specified.'
                  : language === 'ru'
                  ? 'Если ссылка на логотип не указана, будет автоматически сгенерирована монограмма.'
                  : 'Xüsusi loqo linki daxil edilmədikdə şirkətin adına uyğun avtomatik brend loqosu yaradılır.'}
              </p>
            </div>
          </div>

          {/* Industry & Employee Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'en' ? 'Industry / Sector *' : language === 'ru' ? 'Сфера / Отрасль *' : 'Fəaliyyət Sahəsi / Sektor *'}
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-medium text-xs"
              >
                {COMMON_INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'en' ? 'Employee Count' : language === 'ru' ? 'Количество сотрудников' : 'İşçi Sayı'}</span>
              </label>
              <select
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-medium text-xs"
              >
                <option value="1-10">1-10 işçi (Startap / Kiçik biznes)</option>
                <option value="10-50">10-50 işçi (Orta müəssisə)</option>
                <option value="50-200">50-200 işçi (Böyük şirkət)</option>
                <option value="200-500">200-500 işçi (Korporasiya)</option>
                <option value="500+">500+ işçi (Beynəlxalq / Holdinq)</option>
              </select>
            </div>
          </div>

          {/* City & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'en' ? 'City' : language === 'ru' ? 'Город' : 'Şəhər'}</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bakı, Gəncə, Sumqayıt..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'en' ? 'Street / Address' : language === 'ru' ? 'Улица / Адрес' : 'Küçə / Baş Ofis Ünvanı'}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Məs: Nizami küç. 142, Landmark Plaza"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none text-xs font-medium"
              />
            </div>
          </div>

          {/* Contact Details: Email, Phone, Website */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'en' ? 'Email' : language === 'ru' ? 'Email' : 'Rəsmi E-poçt'}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hr@company.az"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'en' ? 'Phone / WhatsApp' : language === 'ru' ? 'Телефон' : 'Əlaqə Nömrəsi'}</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+994 50 123 45 67"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'en' ? 'Website' : language === 'ru' ? 'Сайт' : 'Veb-sayt'}</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.az"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none text-xs font-medium"
              />
            </div>
          </div>

          {/* Custom Logo URL option */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'en' ? 'Custom Logo URL (Optional)' : language === 'ru' ? 'Ссылка на логотип (опционально)' : 'Xüsusi Loqo Linki (İstəyə bağlı)'}</span>
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none text-xs font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              {language === 'en' ? 'About Company' : language === 'ru' ? 'О компании' : 'Şirkət Haqqında Qısa Məlumat'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Şirkətin missiyası, fəaliyyət istiqamətləri və nailiyyətləri..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none text-xs font-medium"
            />
          </div>

          {/* Verification Badge Toggle */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 text-xs">
                  {language === 'en' ? 'Rəsmi Təsdiq Nişanı (Verified Badge)' : language === 'ru' ? 'Знак верификации (Verified)' : 'Rəsmi Təsdiq Nişanı (Verified)'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Admin tərəfindən yaradılan şirkət dərhal rəsmi təsdiqlənmiş status alır.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              id="create-company-verified-toggle"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (language === 'en' ? 'Saving...' : language === 'ru' ? 'Сохранение...' : 'Yadda saxlanılır...')
                  : (language === 'en' ? 'Save and Add Company' : language === 'ru' ? 'Сохранить компанию' : 'Şirkəti Yadda Saxla və Əlavə Et')}
              </span>
            </button>
          </div>
        </form>

        {/* Modal Bottom Logo */}
        <ModalBottomLogo
          tagline="Jobia.az Şirkətlər və Biznes İdarəetmə Reyestri"
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
