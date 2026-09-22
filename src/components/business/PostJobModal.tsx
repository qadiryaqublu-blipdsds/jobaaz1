import React, { useState, useMemo } from 'react';
import { Vacancy, EmploymentType, ExperienceLevel, Company } from '../../types';
import { JOB_CATEGORIES, CITIES } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { 
  AZERBAIJAN_REGIONS, 
  getCoordinatesForCity 
} from '../../data/azerbaijanGeoData';
import { 
  X, 
  Sparkles, 
  Briefcase, 
  Plus, 
  Trash2, 
  RefreshCw,
  MapPin,
  CheckCircle2,
  Building2,
  Search,
  Check,
  ShieldCheck,
  Phone,
  MessageSquare,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { safeFetchJson } from '../../utils/apiHelper';

interface PostJobModalProps {
  company: Company;
  allCompanies?: Company[];
  isAdmin?: boolean;
  editingJob?: Vacancy | null;
  onClose: () => void;
  onSaveJob: (vacancy: Partial<Vacancy>) => void;
  onCreateCompany?: (company: Omit<Company, 'id'>) => Promise<Company>;
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

export const PostJobModal: React.FC<PostJobModalProps> = ({ 
  company, 
  allCompanies = [], 
  isAdmin = false, 
  editingJob, 
  onClose, 
  onSaveJob,
  onCreateCompany 
}) => {
  const { language } = useLanguage();
  const isEditing = !!editingJob;
  const editCount = editingJob?.editCount || 0;
  const isEditLimitReached = !isAdmin && isEditing && editCount >= (editingJob?.maxEditsAllowed || 1);

  // Active Target Company State (Admin can choose or create inline)
  const [selectedCompany, setSelectedCompany] = useState<Company>(() => {
    if (editingJob?.companyId) {
      const match = (allCompanies || []).find((c) => c.id === editingJob.companyId);
      if (match) return match;
    }
    // If admin, check if active company is valid or pick first verified company
    if (isAdmin && allCompanies.length > 0) {
      if (company && company.id && company.id !== 'comp-default') return company;
      return allCompanies[0];
    }
    return company;
  });

  // Admin Company Selection / Inline Creation States
  const [adminCompanyMode, setAdminCompanyMode] = useState<'select' | 'create'>('select');
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  // Inline New Company Form (for Admin)
  const [newCompName, setNewCompName] = useState('');
  const [newCompIndustry, setNewCompIndustry] = useState(COMMON_INDUSTRIES[0]);
  const [newCompCity, setNewCompCity] = useState('Bakı');
  const [newCompAddress, setNewCompAddress] = useState('');
  const [newCompPhone, setNewCompPhone] = useState('');
  const [newCompEmail, setNewCompEmail] = useState('');
  const [newCompWebsite, setNewCompWebsite] = useState('');
  const [newCompDescription, setNewCompDescription] = useState('');
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [companyCreatedSuccessNotice, setCompanyCreatedSuccessNotice] = useState<string | null>(null);

  // Filtered companies list for admin
  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery.trim()) return allCompanies;
    const q = companySearchQuery.toLowerCase().trim();
    return allCompanies.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.industry?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q)
    );
  }, [allCompanies, companySearchQuery]);

  // Core Job Fields
  const [title, setTitle] = useState(editingJob?.title || '');
  const [category, setCategory] = useState(editingJob?.category || JOB_CATEGORIES[0]);
  const [employmentType, setEmploymentType] = useState<EmploymentType>(editingJob?.employmentType || 'Tam ştat');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(editingJob?.experienceLevel || 'Orta (Mid-level, 1-3 il)');
  const [city, setCity] = useState(editingJob?.city || CITIES[0]);
  const [address, setAddress] = useState(editingJob?.address || '');
  const [metroStation, setMetroStation] = useState(editingJob?.metroStation || '');
  const [latitude, setLatitude] = useState<number>(editingJob?.latitude || 40.4093);
  const [longitude, setLongitude] = useState<number>(editingJob?.longitude || 49.8671);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [minSalary, setMinSalary] = useState<number>(editingJob?.minSalary || 1200);
  const [maxSalary, setMaxSalary] = useState<number>(editingJob?.maxSalary || 2000);
  const [hideSalary, setHideSalary] = useState(editingJob?.hideSalary ?? false);
  const [description, setDescription] = useState(editingJob?.description || '');
  const [responsibilities, setResponsibilities] = useState<string[]>(
    editingJob?.responsibilities && editingJob.responsibilities.length > 0
      ? editingJob.responsibilities
      : [
          'Vəzifə üzrə gündəlik əməliyyatların və tapşırıqların icrası',
          'Komanda ilə sıx koordinasiya və hesabatlılıq',
        ]
  );
  const [requirements, setRequirements] = useState<string[]>(
    editingJob?.requirements && editingJob.requirements.length > 0
      ? editingJob.requirements
      : [
          'Müvafiq sahədə ali təhsil və 2+ il iş təcrübəsi',
          'Analitik düşüncə və komandada işləmək bacarığı',
        ]
  );
  const [benefits, setBenefits] = useState<string[]>(
    editingJob?.benefits && editingJob.benefits.length > 0
      ? editingJob.benefits
      : [
          'Rəqabətli əmək haqqı və rüblük bonuslar',
          'Könüllü tibbi sığorta paketi və karyera inkişafı',
        ]
  );
  const [skills, setSkills] = useState<string[]>(
    editingJob?.skills && editingJob.skills.length > 0
      ? editingJob.skills
      : ['Komanda İşi', 'Problem Həlli']
  );
  const [contactPhone, setContactPhone] = useState(editingJob?.contactPhone || selectedCompany.phone || '');
  const [contactWhatsapp, setContactWhatsapp] = useState(editingJob?.contactWhatsapp || selectedCompany.phone || '');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiNotes, setAiNotes] = useState('');

  // Handle city change and automatically adjust coordinates
  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const coords = getCoordinatesForCity(newCity);
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    if (newCity !== 'Bakı') {
      setMetroStation('');
    }
  };

  // Detect GPS coordinates
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Brauzeriniz geolokasiya xüsusiyyətini dəstəkləmir.');
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
        setIsLocatingGPS(false);
      },
      (err) => {
        console.error(err);
        alert('Məkan icazəsi alınmadı. Koordinatları əl ilə və ya şəhər seçimi ilə təyin edə bilərsiniz.');
        setIsLocatingGPS(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // AI Job Description Generator
  const handleAIGenerateJob = async () => {
    if (!title.trim()) {
      alert('Zəhmət olmasa əvvəlcə vəzifə adını daxil edin (məs: Senior React Developer).');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await safeFetchJson<any>('/api/ai/generate-job-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          level: experienceLevel,
          employmentType,
          companyName: selectedCompany.name,
          keyPoints: aiNotes,
        }),
      });

      if (res.ok && res.data) {
        const data = res.data;
        if (data.description) setDescription(data.description);
        if (data.responsibilities && Array.isArray(data.responsibilities)) setResponsibilities(data.responsibilities);
        if (data.requirements && Array.isArray(data.requirements)) setRequirements(data.requirements);
        if (data.benefits && Array.isArray(data.benefits)) setBenefits(data.benefits);
        if (data.skills && Array.isArray(data.skills)) setSkills(data.skills);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Handle Admin inline company creation
  const handleCreateCompanyInline = async () => {
    if (!newCompName.trim()) {
      alert('Zəhmət olmasa şirkətin adını daxil edin.');
      return;
    }
    setIsCreatingCompany(true);
    try {
      const autoLogo = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newCompName.trim())}&backgroundColor=2563eb,3b82f6,1d4ed8&textColor=ffffff`;
      const compData: Omit<Company, 'id'> = {
        name: newCompName.trim(),
        logo: autoLogo,
        verified: true,
        verificationStatus: 'verified',
        industry: newCompIndustry,
        location: newCompAddress.trim() ? `${newCompCity}, ${newCompAddress.trim()}` : `${newCompCity}, Azərbaycan`,
        city: newCompCity,
        address: newCompAddress.trim() || undefined,
        phone: newCompPhone.trim() || undefined,
        email: newCompEmail.trim() || `${newCompName.toLowerCase().replace(/[^a-z0-9]/g, '')}@jobia.az`,
        website: newCompWebsite.trim() || undefined,
        description: newCompDescription.trim() || `${newCompName.trim()} rəsmi fəaliyyət göstərən müəssisədir.`,
        employeeCount: '10-50',
        activeJobsCount: 0,
      };

      let createdComp: Company;
      if (onCreateCompany) {
        createdComp = await onCreateCompany(compData);
      } else {
        createdComp = {
          ...compData,
          id: `comp-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
      }

      setSelectedCompany(createdComp);
      if (createdComp.phone) {
        setContactPhone(createdComp.phone);
        setContactWhatsapp(createdComp.phone);
      }
      setCompanyCreatedSuccessNotice(`"${createdComp.name}" şirkəti uğurla yaradıldı və seçildi!`);
      setAdminCompanyMode('select');
      setNewCompName('');
    } catch (e) {
      console.error(e);
      alert('Şirkət yaradılarkən xəta baş verdi.');
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const handleAddResponsibility = () => setResponsibilities([...responsibilities, '']);
  const handleAddRequirement = () => setRequirements([...requirements, '']);
  const handleAddBenefit = () => setBenefits([...benefits, '']);
  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditLimitReached) {
      alert('Bu vakansiya üzrə 1 dəfəlik redaktə hüququnuzdan artıq istifadə etmisiniz.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      alert('Zəhmət olmasa vəzifə başlığını və təsvirini doldurun.');
      return;
    }

    let targetCompany = selectedCompany;

    // If admin was typing in "Create New Company" mode and didn't hit sub-button, auto-create company now
    if (isAdmin && adminCompanyMode === 'create' && newCompName.trim()) {
      setIsCreatingCompany(true);
      try {
        const autoLogo = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newCompName.trim())}&backgroundColor=2563eb,3b82f6,1d4ed8&textColor=ffffff`;
        const compData: Omit<Company, 'id'> = {
          name: newCompName.trim(),
          logo: autoLogo,
          verified: true,
          verificationStatus: 'verified',
          industry: newCompIndustry,
          location: newCompAddress.trim() ? `${newCompCity}, ${newCompAddress.trim()}` : `${newCompCity}, Azərbaycan`,
          city: newCompCity,
          address: newCompAddress.trim() || undefined,
          phone: newCompPhone.trim() || undefined,
          email: newCompEmail.trim() || `${newCompName.toLowerCase().replace(/[^a-z0-9]/g, '')}@jobia.az`,
          website: newCompWebsite.trim() || undefined,
          description: newCompDescription.trim() || `${newCompName.trim()} rəsmi fəaliyyət göstərən müəssisədir.`,
          employeeCount: '10-50',
          activeJobsCount: 0,
        };
        if (onCreateCompany) {
          targetCompany = await onCreateCompany(compData);
        } else {
          targetCompany = { ...compData, id: `comp-${Date.now()}` };
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCreatingCompany(false);
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const deadlineDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    onSaveJob({
      id: editingJob?.id || `vac-${Date.now()}`,
      title: title.trim(),
      companyId: targetCompany.id,
      companyName: targetCompany.name,
      companyLogo: targetCompany.logo,
      companyVerified: targetCompany.verified ?? true,
      category,
      employmentType,
      experienceLevel,
      city,
      address: address.trim() || `${city}, Azərbaycan`,
      metroStation: metroStation || undefined,
      latitude: Number(latitude) || 40.4093,
      longitude: Number(longitude) || 49.8671,
      minSalary: Number(minSalary),
      maxSalary: Number(maxSalary),
      currency: 'AZN',
      hideSalary,
      description: description.trim(),
      responsibilities: responsibilities.filter((r) => r.trim().length > 0),
      requirements: requirements.filter((r) => r.trim().length > 0),
      benefits: benefits.filter((b) => b.trim().length > 0),
      skills,
      postedDate: editingJob?.postedDate || today,
      deadline: editingJob?.deadline || deadlineDate,
      isFeatured: editingJob?.isFeatured ?? false,
      isApproved: isAdmin ? true : false,
      status: isAdmin ? 'published' : 'pending_review',
      editCount: isEditing ? (editingJob.editCount || 0) + 1 : 0,
      maxEditsAllowed: 1,
      lastEditedAt: isEditing ? new Date().toISOString() : undefined,
      viewsCount: editingJob?.viewsCount || 1,
      applicantsCount: editingJob?.applicantsCount || 0,
      contactPhone: (contactPhone.trim() || targetCompany.phone || '').trim(),
      contactWhatsapp: (contactWhatsapp.trim() || targetCompany.phone || '').trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-5 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with High-Contrast Layout */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center font-bold shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {isEditing
                    ? language === 'en'
                      ? 'Edit Vacancy'
                      : language === 'ru'
                      ? 'Редактировать вакансию'
                      : 'Vakansiyanı Redaktə Et'
                    : language === 'en'
                    ? 'Post New Vacancy'
                    : language === 'ru'
                    ? 'Опубликовать новую вакансию'
                    : 'Yeni Vakansiya Elanı Yerləşdir'}
                </h2>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-500/25 text-blue-300 border border-blue-400/30 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                    İşəgötürən
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {isAdmin
                  ? 'Admin rejimi: Vakansiya üçün şirkət seçin və ya yeni şirkət yaradaraq dərhal aktiv yayımlayın.'
                  : `${selectedCompany.name} adından vakansiya paylaşımı`}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* SECTION 1: EMPLOYER / COMPANY SELECTION OR CREATION (CRITICAL FOR ADMIN) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/40 border border-blue-200/80 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  {language === 'en'
                    ? 'Target Employer / Company'
                    : language === 'ru'
                    ? 'Компания-работодатель'
                    : 'İşəgötürən Şirkət Təyini'}
                </span>
              </div>

              {/* Admin Mode Switcher: Choose from existing vs Create New Company */}
              {isAdmin && (
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setAdminCompanyMode('select')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      adminCompanyMode === 'select'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Mövcud Şirkətlər ({allCompanies.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminCompanyMode('create')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      adminCompanyMode === 'create'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Yeni Şirkət Yarat
                  </button>
                </div>
              )}
            </div>

            {/* Success notification if company just created */}
            {companyCreatedSuccessNotice && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2 font-medium text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{companyCreatedSuccessNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCompanyCreatedSuccessNotice(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* MODE A: ADMIN SELECT EXISTING COMPANY OR STANDARD BUSINESS VIEW */}
            {adminCompanyMode === 'select' ? (
              <div className="space-y-3">
                {/* Active Selected Company Card */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={selectedCompany.logo}
                      alt={selectedCompany.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {selectedCompany.name}
                        </span>
                        {selectedCompany.verified && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            Rəsmi Şirkət
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {selectedCompany.industry} • {selectedCompany.location || 'Bakı, Azərbaycan'}
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      {isCompanyDropdownOpen ? 'Seçimi Bağla' : 'Şirkəti Dəyiş'}
                    </button>
                  )}
                </div>

                {/* Searchable Dropdown / Selector for Admin */}
                {isAdmin && isCompanyDropdownOpen && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-3 space-y-2 animate-in fade-in duration-150">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={companySearchQuery}
                        onChange={(e) => setCompanySearchQuery(e.target.value)}
                        placeholder="Mövcud şirkətlər arasında axtar (SOCAR, Kapital Bank, Azercell...)"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-blue-600 font-medium"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1 divide-y divide-slate-100">
                      {filteredCompanies.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-xs">
                          Şirkət tapılmadı. Yuxarıdan "+ Yeni Şirkət Yarat" seçərək bu şirkəti əlavə edin.
                        </div>
                      ) : (
                        filteredCompanies.map((c) => {
                          const isSelected = c.id === selectedCompany.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedCompany(c);
                                if (c.phone) {
                                  setContactPhone(c.phone);
                                  setContactWhatsapp(c.phone);
                                }
                                setIsCompanyDropdownOpen(false);
                              }}
                              className={`w-full p-2 flex items-center justify-between rounded-lg transition-colors text-left cursor-pointer ${
                                isSelected ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={c.logo}
                                  alt={c.name}
                                  className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="truncate">
                                  <div className="font-bold text-xs flex items-center gap-1">
                                    <span>{c.name}</span>
                                    {c.verified && <CheckCircle2 className="w-3 h-3 text-blue-600 inline" />}
                                  </div>
                                  <span className="text-[10px] text-slate-400 truncate block">
                                    {c.industry}
                                  </span>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* MODE B: ADMIN CREATES NEW COMPANY INLINE */
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Yeni Şirkət Profili Yaradılması və Seçimi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Şirkətin Rəsmi Adı *
                    </label>
                    <input
                      type="text"
                      value={newCompName}
                      onChange={(e) => setNewCompName(e.target.value)}
                      placeholder="Məs: Trendyol Azerbaijan, Bravo Supermarket..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Fəaliyyət Sahəsi
                    </label>
                    <select
                      value={newCompIndustry}
                      onChange={(e) => setNewCompIndustry(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-blue-600 outline-none"
                    >
                      {COMMON_INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Şəhər
                    </label>
                    <input
                      type="text"
                      value={newCompCity}
                      onChange={(e) => setNewCompCity(e.target.value)}
                      placeholder="Bakı"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Baş Ofis Ünvanı
                    </label>
                    <input
                      type="text"
                      value={newCompAddress}
                      onChange={(e) => setNewCompAddress(e.target.value)}
                      placeholder="Nizami küç. 14, Baku"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Əlaqə Nömrəsi / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={newCompPhone}
                      onChange={(e) => setNewCompPhone(e.target.value)}
                      placeholder="+994 50 123 45 67"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Rəsmi E-poçt
                    </label>
                    <input
                      type="email"
                      value={newCompEmail}
                      onChange={(e) => setNewCompEmail(e.target.value)}
                      placeholder="hr@company.az"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500">
                    ✓ Şirkət yaradıldıqdan sonra dərhal bu vakansiyaya təyin olunacaq.
                  </p>
                  <button
                    type="button"
                    disabled={isCreatingCompany || !newCompName.trim()}
                    onClick={handleCreateCompanyInline}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{isCreatingCompany ? 'Yaradılır...' : 'Bu Şirkəti Yarat və Seç'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: CORE VACANCY INFORMATION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm border-b border-slate-100 pb-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Əsas Vakansiya Məlumatları</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">
                  Vəzifə Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Məs: Senior Frontend Developer, Baş Mühasib, Satış Meneceri..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-semibold text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Sahə / Kateqoriya
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-medium"
                >
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  İş Rejimi
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-medium"
                >
                  <option value="Tam ştat">Tam ştat (Full-time)</option>
                  <option value="Hibrid">Hibrid (Ofis + Uzaqdan)</option>
                  <option value="Uzaqdan (Remote)">Uzaqdan (Remote)</option>
                  <option value="Yarım ştat">Yarım ştat (Part-time)</option>
                  <option value="Təcrübə proqramı">Təcrübə proqramı (Internship)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Təcrübə Səviyyəsi
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-medium"
                >
                  <option value="Təcrübəsiz / Junior">Təcrübəsiz / Junior (0-1 il)</option>
                  <option value="Orta (Mid-level, 1-3 il)">Orta (Mid-level, 1-3 il)</option>
                  <option value="Baş (Senior, 3-5+ il)">Baş (Senior, 3-5+ il)</option>
                  <option value="Rəhbər / Lead">Rəhbər / Lead / Menecer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Şəhər / Region
                </label>
                <select
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-medium"
                >
                  {AZERBAIJAN_REGIONS.map((region) => (
                    <optgroup key={region.id} label={`📍 ${region.name}`}>
                      {region.cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <optgroup label="🌐 Digər">
                    <option value="Uzaqdan / Remote">Uzaqdan / Remote</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: SALARY & BENEFITS */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Əmək Haqqı (AZN)</span>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideSalary}
                  onChange={(e) => setHideSalary(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Müsahibə əsasında (Maaşı gizlət)</span>
              </label>
            </div>

            {!hideSalary && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Minimum Əmək Haqqı
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={minSalary}
                      onChange={(e) => setMinSalary(Number(e.target.value))}
                      placeholder="Min"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-600 font-bold text-slate-900"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      AZN
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Maksimum Əmək Haqqı
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={maxSalary}
                      onChange={(e) => setMaxSalary(Number(e.target.value))}
                      placeholder="Maks"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-600 font-bold text-slate-900"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      AZN
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: AI JOB DESCRIPTION GENERATOR HELPER */}
          <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-blue-600/10 p-3.5 sm:p-4 rounded-2xl border border-blue-200/80 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-blue-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    AI Vakansiya Mətni Köməkçisi
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Vəzifə adını daxil edin və tək toxunuşla peşəkar öhdəliklər, tələblər və üstünlüklər formalaşdırın.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isGeneratingAI || !title.trim()}
                onClick={handleAIGenerateJob}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Mətn Hazırlayır...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI ilə Avtomatik Yaz</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 5: DETAILED JOB DESCRIPTION */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Vakansiya Haqqında Ətraflı Təsvir *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Şirkət və komanda haqqında ümumi məlumat, vakansiyanın əsas məqsədləri..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-medium leading-relaxed"
            />
          </div>

          {/* SECTION 6: RESPONSIBILITIES, REQUIREMENTS & BENEFITS */}
          <div className="space-y-4">
            {/* Responsibilities */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800">
                  Vəzifə Öhdəlikləri ({responsibilities.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddResponsibility}
                  className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Öhdəlik Əlavə Et
                </button>
              </div>
              <div className="space-y-1.5">
                {responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => {
                        const next = [...responsibilities];
                        next[idx] = e.target.value;
                        setResponsibilities(next);
                      }}
                      placeholder={`Öhdəlik ${idx + 1}`}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setResponsibilities(responsibilities.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-600 p-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800">
                  Namizədə Tələblər ({requirements.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tələb Əlavə Et
                </button>
              </div>
              <div className="space-y-1.5">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => {
                        const next = [...requirements];
                        next[idx] = e.target.value;
                        setRequirements(next);
                      }}
                      placeholder={`Tələb ${idx + 1}`}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-600 p-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800">
                  Şirkətin Təqdim Etdiyi Üstünlüklər / Təminatlar ({benefits.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Üstünlük Əlavə Et
                </button>
              </div>
              <div className="space-y-1.5">
                {benefits.map((ben, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={ben}
                      onChange={(e) => {
                        const next = [...benefits];
                        next[idx] = e.target.value;
                        setBenefits(next);
                      }}
                      placeholder={`Üstünlük ${idx + 1}`}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-600 p-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 7: SKILLS TAGS */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800">
              Tələb Olunan Əsas Bacarıqlar (Teqlər)
            </label>
            <div className="flex gap-2">
              <input
                id="job-skill-input"
                type="text"
                placeholder="Məs: React, TypeScript, SQL, Layihə İdarəetməsi..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('job-skill-input') as HTMLInputElement;
                  if (input && input.value) {
                    handleAddSkill(input.value);
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer transition active:scale-95"
              >
                Əlavə Et
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-600 font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* SECTION 8: LOCATION & CONTACT DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Ünvan / Ofis Məkanı</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Məs: Nizami küç. 142, Landmark"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>Yaxın Metro Stansiyası</span>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isLocatingGPS}
                  className="text-blue-600 hover:text-blue-800 text-[11px] font-bold cursor-pointer"
                >
                  {isLocatingGPS ? 'GPS Axtarılır...' : '📍 GPS Təyin Et'}
                </button>
              </label>
              <input
                type="text"
                value={metroStation}
                onChange={(e) => setMetroStation(e.target.value)}
                placeholder="Məs: 28 May, Elmlər Akademiyası..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Əlaqə Telefon Nömrəsi</span>
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+994 50 123 45 67"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Əlaqə Nömrəsi</span>
              </label>
              <input
                type="text"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                placeholder="+994 50 123 45 67"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="text-[11px] text-slate-500">
              {isAdmin ? (
                <span className="flex items-center gap-1 text-blue-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin imtiyazı: Vakansiya dərhal təsdiqlənmiş və aktiv statusda paylaşılacaq.
                </span>
              ) : (
                <span>✓ Vakansiya yoxlanışdan dərhal sonra platformada yayımlanacaq.</span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
              >
                Ləğv et
              </button>
              <button
                type="submit"
                disabled={isEditLimitReached}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Briefcase className="w-4 h-4" />
                <span>
                  {isAdmin
                    ? 'Vakansiyanı Birbaşa Dərc Et (Aktiv Yayımla)'
                    : isEditing
                    ? 'Dəyişiklikləri Yadda Saxla'
                    : 'Vakansiyanı Təsdiqə Göndər'}
                </span>
              </button>
            </div>
          </div>
        </form>

        {/* Modal Bottom Logo */}
        <ModalBottomLogo
          tagline="Jobia.az İşəgötürən və Vakansiya İdarəetmə Mərkəzi"
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
