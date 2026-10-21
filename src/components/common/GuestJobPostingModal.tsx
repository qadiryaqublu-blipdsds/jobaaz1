import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Clock, 
  FileText, 
  AlertCircle,
  HelpCircle,
  UserCheck,
  Check
} from 'lucide-react';
import { Vacancy, ExperienceLevel } from '../../types';
import { safeAlert } from '../../utils/dialogHelper';

interface GuestJobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitGuestVacancy: (vacancyData: Partial<Vacancy>, contactInfo: { name: string; email: string; phone: string }) => void;
}

export const GuestJobPostingModal: React.FC<GuestJobPostingModalProps> = ({
  isOpen,
  onClose,
  onSubmitGuestVacancy
}) => {
  if (!isOpen) return null;

  // Form State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Maliyyə və Mühasibat');
  const [city, setCity] = useState('Bakı');
  const [workSchedule, setWorkSchedule] = useState('Tam ştat');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Orta (Mid-level, 1-3 il)');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedCode, setSubmittedCode] = useState('');

  // Sample pre-made templates for quick 1-click filling without AI
  const handleApplyTemplate = (type: string) => {
    if (type === 'muhasib') {
      setTitle('Mühasib / Baş Mühasib Köməkçisi');
      setCategory('Maliyyə və Mühasibat');
      setMinSalary('900');
      setMaxSalary('1400');
      setDescription(
        `• 1C 8.3 proqramında ilkin sənədlərin işlənməsi və daxil edilməsi\n• Bank köçürmələri və kassa əməliyyatlarının aparılması\n• Elektron qaimə-fakturaların (e-taxes.gov.az) hazırlanması və göndərilməsi\n• Debitor və kreditor borclarının üzləşdirilməsi`
      );
      setRequirements(
        `• Ali iqtisadi və ya maliyyə təhsili\n• 1C 8.3 və MS Excel bilikləri\n• Mühasibatlıq sahəsində ən azı 1-2 il iş təcrübəsi\n• Məsuliyyətli, operativ və dəqiq işləmə qabiliyyəti`
      );
    } else if (type === 'satis') {
      setTitle('Korporativ Satış Meneceri (B2B)');
      setCategory('Satış və Müştəri Xidmətləri');
      setMinSalary('1000');
      setMaxSalary('1800');
      setDescription(
        `• Potensial korporativ müştərilərin tapılması və əlaqələrin qurulması\n• Kommersiya təkliflərinin hazırlanması və təqdimatların keçirilməsi\n• Müqavilələrin bağlanması və satış hədəflərinin yerinə yetirilməsi\n• CRM sistemində müştəri bazasının idarə olunması`
      );
      setRequirements(
        `• B2B satış sahəsində ən azı 2 il uğurlu təcrübə\n• Yüksək danışıqlar aparma və inandırma bacarığı\n• Azərbaycan dilində səlis danışıq və yazı (Rus dili arzuolunandır)\n• Sürücülük vəsiqəsi və şəxsi avtomobil üstünlükdür`
      );
    } else if (type === 'aqro') {
      setTitle('Aqronom / Sahə Meneceri');
      setCategory('Kənd təsərrüfatı və Ekologiya');
      setMinSalary('1200');
      setMaxSalary('2000');
      setDescription(
        `• Sahələrdə aqrotexniki tədbirlərin planlaşdırılması və icrasına nəzarət\n• Damcı suvarma və gübrələmə cədvəlinin tərtibi\n• Bitki xəstəlik və zərərvericilərinə qarşı mühafizə tədbirlərinin təşkili\n• Məhsul yığımı və keyfiyyət analizi`
      );
      setRequirements(
        `• Aqronomiya və ya bitki mühafizəsi üzrə ali təhsil\n• Sahə şəraitində 2+ il aqronomluq təcrübəsi\n• Regionlarda ezamiyyətə və ya yaşamağa hazırlıq`
      );
    }
  };

  // AI Generation (Optional Hybrid approach)
  const handleAiGenerate = () => {
    if (!title.trim()) {
      safeAlert('Zəhmət olmasa əvvəlcə vəzifə adını daxil edin.');
      return;
    }
    setIsAiGenerating(true);
    setTimeout(() => {
      setDescription(
        `• ${title} üzrə gündəlik əməliyyatların planlaşdırılması və koordinasiyası\n• Şirkətin daxili standartlarına və AR Əmək Məcəlləsinə uyğun vəzifə öhdəliklərinin icrası\n• Rəhbərliyə həftəlik və aylıq icraat hesabatlarının təqdim olunması\n• Komanda ilə sıx əməkdaşlıq və proseslərin optimallaşdırılması`
      );
      setRequirements(
        `• Müvafiq sahə üzrə ali və ya orta ixtisas təhsili\n• ${experienceLevel} müvafiq peşəkar iş təcrübəsi\n• Yüksək məsuliyyət və detallara diqqət\n• Kompüter bilikləri və sahə üzrə ixtisaslaşmış proqram təminatı`
      );
      setIsAiGenerating(false);
    }, 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactEmail.trim() || !contactPhone.trim() || !title.trim()) {
      safeAlert('Zəhmət olmasa tələb olunan sahələri doldurun.');
      return;
    }

    const code = `JOBIA-NOAUTH-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedCode(code);

    const vacancyData: Partial<Vacancy> = {
      title,
      companyName,
      category,
      city,
      location: city,
      workplaceType: workSchedule === 'Distant' ? 'remote' : workSchedule === 'Hibrid' ? 'hybrid' : 'on-site',
      employmentType: (workSchedule === 'Distant' ? 'Uzaqdan (Remote)' : workSchedule) as any,
      experienceLevel,
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
      description: `${description}\n\nTələblər:\n${requirements}`,
      status: 'pending_review',
      postedDate: new Date().toISOString(),
      deadline,
      createdBy: contactEmail,
    };

    onSubmitGuestVacancy(vacancyData, {
      name: contactPerson,
      email: contactEmail,
      phone: contactPhone
    });

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Qeydiyyatsız Elan Yerləşdirmə</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Şirkətiniz Üçün Vakansiya Yayımlayın
            </h2>
            <p className="text-xs text-slate-500">
              Qeydiyyatdan keçmədən 2 dəqiqə ərzində elanınızı daxil edin. Yoxlamadan sonra elan dərhal minlərlə namizədin qarşısına çıxarılacaq.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-emerald-950">
                Vakansiyanız Təsdiq Gözləmə Mərhələsinə Qəbul Edildi!
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                Təqdim etdiyiniz elan moderatorlarımız tərəfindən ən geci 1-2 saat ərzində yoxlanılıb yayımlanacaqdır.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
              <span className="text-slate-500 text-[11px]">Vakansiyanın İzləmə Kodu:</span>
              <p className="font-mono font-bold text-slate-900 text-sm tracking-wider">{submittedCode}</p>
              <span className="text-slate-400 text-[11px] block">
                {contactEmail} ünvanına təsdiq bildirişi və elanı idarə etmək üçün keçid göndərildi.
              </span>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Step Indicators */}
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-1.5 ${step === 1 ? 'text-blue-600 font-black' : 'text-slate-400'}`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">1</span>
                <span>Şirkət & Əlaqə</span>
              </button>
              <span className="text-slate-300">›</span>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`flex items-center gap-1.5 ${step === 2 ? 'text-blue-600 font-black' : 'text-slate-400'}`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">2</span>
                <span>Vəzifə Şərtləri</span>
              </button>
              <span className="text-slate-300">›</span>
              <button
                type="button"
                onClick={() => setStep(3)}
                className={`flex items-center gap-1.5 ${step === 3 ? 'text-blue-600 font-black' : 'text-slate-400'}`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">3</span>
                <span>Tələblər & Təsdiq</span>
              </button>
            </div>

            {/* STEP 1: COMPANY & CONTACT */}
            {step === 1 && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Şirkətinizin Adı *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Məs: Paşa Holdinq, Bakcell, Agrovest..."
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Əlaqələndirici Şəxs (Ad, Soyad) *</label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Məs: Leyla Əliyeva"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">İş E-poçt Ünvanı *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="hr@company.az"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Əlaqə Telefonu *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+994 50 123 45 67"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!companyName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
                        safeAlert('Zəhmət olmasa tələb olunan sahələri doldurun.');
                        return;
                      }
                      setStep(2);
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Növbəti: Vəzifə Şərtləri ›
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: JOB DETAILS */}
            {step === 2 && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vəzifənin Adı *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Məs: Baş Mühasib, Satış Meneceri, Aqronom..."
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Sahə / Kateqoriya</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Maliyyə və Mühasibat">Maliyyə və Mühasibat</option>
                      <option value="İnformasiya Texnologiyaları">İnformasiya Texnologiyaları</option>
                      <option value="Satış və Müştəri Xidmətləri">Satış və Müştəri Xidmətləri</option>
                      <option value="Kənd təsərrüfatı və Ekologiya">Kənd təsərrüfatı və Ekologiya</option>
                      <option value="Nəqliyyat və Loqistika">Nəqliyyat və Loqistika</option>
                      <option value="İnzibati və İdarəetmə">İnzibati və İdarəetmə</option>
                      <option value="Digər">Digər</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Şəhər / İş Yeri</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bakı, Sumqayıt, Gəncə..."
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">İş Qrafiki</label>
                    <select
                      value={workSchedule}
                      onChange={(e) => setWorkSchedule(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Tam ştat">Tam ştat</option>
                      <option value="Yarım ştat">Yarım ştat</option>
                      <option value="Hibrid">Hibrid</option>
                      <option value="Distant">Distant (Remote)</option>
                      <option value="Növbəli">Növbəli qrafik</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Min. Maaş (AZN)</label>
                    <input
                      type="number"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      placeholder="Məs: 800"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Maks. Maaş (AZN)</label>
                    <input
                      type="number"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(e.target.value)}
                      placeholder="Məs: 1400"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    ‹ Geri
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!title.trim()) {
                        safeAlert('Zəhmət olmasa vəzifə adını daxil edin.');
                        return;
                      }
                      setStep(3);
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                  >
                    Növbəti: Tələblər & Təsvir ›
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DESCRIPTION, HYBRID TEMPLATES & SUBMISSION */}
            {step === 3 && (
              <div className="space-y-3 animate-fade-in">
                {/* 1-Click Fast Templates */}
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    ⚡ Tez Şablon Seçimi (1 Kliklə Doldur):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('muhasib')}
                      className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-[11px] font-semibold cursor-pointer"
                    >
                      Mühasib
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('satis')}
                      className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-[11px] font-semibold cursor-pointer"
                    >
                      B2B Satış Meneceri
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('aqro')}
                      className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-[11px] font-semibold cursor-pointer"
                    >
                      Aqronom
                    </button>
                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={isAiGenerating}
                      className="px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{isAiGenerating ? 'Yazılır...' : 'AI ilə Mətn Yaz'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vəzifə Öhdəlikləri *</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Əsas iş öhdəliklərini qeyd edin..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Namizədə Tələblər *</label>
                  <textarea
                    rows={4}
                    required
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Təhsil, təcrübə, dil və texniki bacarıq tələbləri..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tələb olunan Təcrübə</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Təcrübəsiz / Junior">Təcrübəsiz / Junior</option>
                      <option value="Orta (Mid-level, 1-3 il)">Orta (Mid-level, 1-3 il)</option>
                      <option value="Baş (Senior, 3-5+ il)">Baş (Senior, 3-5+ il)</option>
                      <option value="Rəhbər / Lead">Rəhbər / Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Son Müraciət Tarixi</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    ‹ Geri
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Vakansiyanı Yayıma Göndər</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
