import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  X,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Building2,
  Briefcase,
  Layers,
  Search,
  CheckCircle2,
  Radio,
  Send,
  HelpCircle
} from 'lucide-react';
import { JobAlertSubscription, User } from '../../types';
import { 
  getJobAlertSubscription, 
  saveJobAlertSubscription, 
  createNotification 
} from '../../services/firestoreService';

export const ALL_JOB_CATEGORIES = [
  'İT və Proqramlaşdırma',
  'Maliyyə və Mühasibat',
  'Marketinq, Reklam və PR',
  'Satış və Müştəri Xidmətləri',
  'Mühəndislik və Tikinti',
  'Səhiyyə və Tibb',
  'Təhsil, Elm və Təlim',
  'Dizayn və Yaradıcılıq',
  'İnsan Resursları (HR)',
  'Hüquq və Konsaltinq',
  'Logistika və Nəqliyyat',
  'İstehsalat və Sənaye',
  'Otelçilik və Restoran (HoReCa)',
  'İnzibati və Ofis İşi',
  'Təhlükəsizlik və Mühafizə',
];

export const POPULAR_COMPANIES = [
  'PAŞA Holdinq MMC',
  'Kapital Bank ASC',
  'Azercell Telekom MMC',
  'SOCAR Downstream MMC',
  'Bravo Supermarketlər MMC',
  'ABB Bank ASC',
  'PashaPay MMC',
  'Veysəloğlu Şirkətlər Qrupu MMC',
  'İrşad Electronics MMC',
  'Silk Way West Airlines QSC',
  'PMD Projects MMC',
  'Baku Medical Plaza QSC',
  'IRES MMC',
  'Kollekta MMC',
  'International BOKT ASC',
];

interface JobAlertManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAlertsUpdated?: (sub: JobAlertSubscription) => void;
  onShowToast?: (message: string) => void;
}

export const JobAlertManagerModal: React.FC<JobAlertManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAlertsUpdated,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'companies'>('categories');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [companyInput, setCompanyInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const userId = currentUser?.id || 'candidate-guest-session';

  // Load candidate subscription on modal open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    getJobAlertSubscription(userId).then((sub) => {
      if (!isMounted) return;
      if (sub) {
        setIsActive(sub.isActive !== false);
        setSelectedCategories(sub.categories || []);
        setSelectedCompanies(sub.companies || []);
      } else {
        // Defaults: pre-select 1-2 popular categories for convenience
        setIsActive(true);
        setSelectedCategories(['İT və Proqramlaşdırma', 'Maliyyə və Mühasibat']);
        setSelectedCompanies(['Kapital Bank ASC', 'PAŞA Holdinq MMC']);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const filteredCategories = ALL_JOB_CATEGORIES.filter((c) =>
    c.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const addCompany = (companyName: string) => {
    const trimmed = companyName.trim();
    if (!trimmed) return;
    if (selectedCompanies.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      onShowToast?.(`"${trimmed}" artıq izlənilən şirkətlər siyahınızdadır.`);
      setCompanyInput('');
      return;
    }
    setSelectedCompanies((prev) => [...prev, trimmed]);
    setCompanyInput('');
  };

  const removeCompany = (companyName: string) => {
    setSelectedCompanies((prev) => prev.filter((c) => c !== companyName));
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories([...ALL_JOB_CATEGORIES]);
  };

  const handleClearAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const sub: JobAlertSubscription = {
      id: `alert-${userId}`,
      userId,
      userEmail: currentUser?.email,
      userName: currentUser?.fullName,
      categories: selectedCategories,
      companies: selectedCompanies,
      isActive,
      frequency: 'instant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveJobAlertSubscription(sub);
      onAlertsUpdated?.(sub);
      onShowToast?.('İzləmə bildirişləri tənzimləmələriniz uğurla yadda saxlanıldı!');
      onClose();
    } catch (e) {
      console.warn('Save alert error:', e);
      onShowToast?.('Tənzimləmələr yadda saxlanılarkən xəta baş verdi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerTestNotification = async () => {
    setIsTesting(true);
    const sampleCategory = selectedCategories[0] || 'İT və Proqramlaşdırma';
    const sampleCompany = selectedCompanies[0] || 'PAŞA Holdinq MMC';

    try {
      await createNotification({
        userId,
        title: `Yeni Uyğun Vakansiya: Baş Mütəxəssis (${sampleCompany})`,
        message: `İzlədiyiniz "${sampleCategory}" kateqoriyası və "${sampleCompany}" üzrə yeni təsdiqlənmiş vakansiya dərci zamanı bu cür canlı bildiriş alacaqsınız.`,
        type: 'new_matching_vacancy',
        data: {
          test: true,
          category: sampleCategory,
          companyName: sampleCompany,
        },
      });
      onShowToast?.('Canlı test bildirişi uğurla göndərildi! Yuxarı sağ küncdəki bildirişə baxa bilərsiniz.');
    } catch (e) {
      console.warn('Test notif error:', e);
    } finally {
      setIsTesting(false);
    }
  };

  const totalSubscribed = selectedCategories.length + selectedCompanies.length;

  return (
    <div
      id="candidate-job-alert-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="candidate-job-alert-modal"
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Vakansiya və Şirkət İzləmə Sistemi
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] font-extrabold uppercase">
                  Job Alerts
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Yeni təsdiqlənmiş və dərc edilən uyğun vakansiyalardan anında xəbərdar olun
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Active Switch & Subscribed Counter Banner */}
        <div className="px-4 sm:px-5 py-3 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {isActive ? 'Sayt daxili (in-app) bildirişlər aktivdir' : 'İzləmə bildirişləri müvəqqəti dayandırılıb'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isActive
                  ? 'Təsdiqlənmiş yeni vakansiya dərc edildikdə dərhal canlı bildiriş veriləcək'
                  : 'Aktivləşdirərək yeni vakansiyalardan xəbərdar olun'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
              {totalSubscribed} kriteriya izlənilir
            </span>
            <button
              type="button"
              onClick={handleTriggerTestNotification}
              disabled={isTesting}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
              title="Sistemdə bildirişin necə göründüyünü test edin"
            >
              <Send className="w-3 h-3" />
              <span>{isTesting ? 'Göndərilir...' : 'Test Et'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 sm:px-5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>İzlənilən Kateqoriyalar</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              selectedCategories.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {selectedCategories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('companies')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'companies'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>İzlənilən Şirkətlər</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              selectedCompanies.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {selectedCompanies.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 scrollbar-thin">
          {activeTab === 'categories' ? (
            <div className="space-y-3">
              {/* Category Search & Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Kateqoriya axtar..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSelectAllCategories}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllCategories}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-semibold cursor-pointer"
                  >
                    Təmizlə
                  </button>
                </div>
              </div>

              {/* Category Checkboxes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1 scrollbar-thin">
                {filteredCategories.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <div
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 select-none ${
                        isChecked
                          ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center transition-colors shrink-0 ${
                            isChecked ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-semibold truncate">{cat}</span>
                      </div>
                      {isChecked && (
                        <span className="text-[10px] font-bold text-blue-600 uppercase shrink-0">
                          İzlənilir
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredCategories.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  "{categorySearch}" adına uyğun kateqoriya tapılmadı.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add Custom Company Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>İzləmək istədiyiniz şirkətin adı</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCompany(companyInput);
                      }
                    }}
                    placeholder="Məsələn: PAŞA Holdinq, Kapital Bank, Azercell..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => addCompany(companyInput)}
                    disabled={!companyInput.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Əlavə Et</span>
                  </button>
                </div>
              </div>

              {/* Subscribed Companies List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Aktiv İzlədiyiniz Şirkətlər ({selectedCompanies.length})
                  </span>
                  {selectedCompanies.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedCompanies([])}
                      className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                    >
                      Bütün şirkətləri sil
                    </button>
                  )}
                </div>

                {selectedCompanies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 min-h-[50px]">
                    {selectedCompanies.map((company) => (
                      <span
                        key={company}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 text-xs font-semibold shadow-2xs group"
                      >
                        <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{company}</span>
                        <button
                          type="button"
                          onClick={() => removeCompany(company)}
                          className="text-slate-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition-colors"
                          title="İzləməni dayandır"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 text-xs">
                    Hələ heç bir şirkət izləmə siyahınıza əlavə edilməyib. Aşağıdakı siyahıdan seçə və ya yuxarıda adını yaza bilərsiniz.
                  </div>
                )}
              </div>

              {/* Popular Companies Quick-Add Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">
                  ⚡ Populyar və Təsdiqlənmiş Şirkətlər (Bir toxunuşla əlavə et):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 scrollbar-thin">
                  {POPULAR_COMPANIES.map((company) => {
                    const isAdded = selectedCompanies.some(
                      (c) => c.toLowerCase() === company.toLowerCase()
                    );
                    return (
                      <button
                        key={company}
                        type="button"
                        onClick={() => (isAdded ? removeCompany(company) : addCompany(company))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                          isAdded
                            ? 'bg-blue-600 text-white shadow-2xs font-bold'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isAdded ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Plus className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{company}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            <span className="font-bold text-slate-700">{totalSubscribed}</span> kriteriya üzrə avtomatik bildirişlər
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Bağla
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Yadda saxlanılır...' : 'Tənzimləmələri Yadda Saxla'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
