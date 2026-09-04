import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserEmailPreferences, 
  EmailAlertFrequency 
} from '../../types';
import { 
  updateUserEmailPreferencesInFirestore 
} from '../../services/firestoreService';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  User as UserIcon, 
  Settings, 
  Mail, 
  Bell, 
  BellOff, 
  Zap, 
  Calendar, 
  Clock, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Briefcase, 
  DollarSign, 
  Send, 
  Eye, 
  Sliders, 
  CheckCircle2,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onOpenVerifyModal?: (user: User) => void;
  onOpenPricing?: () => void;
  initialTab?: 'profile' | 'settings' | 'security';
  onNavigateToTab?: (tab: any) => void;
}

const DEFAULT_PREFERENCES: UserEmailPreferences = {
  jobAlertFrequency: 'instant',
  categories: ['İnformasiya Texnologiyaları', 'Dizayn & Yaradıcılıq'],
  minSalary: 0,
  remoteOnly: false,
  minMatchScore: 70,
  applicationStatusUpdates: true,
  interviewAndOfferAlerts: true,
  newsletterDigest: false,
};

const AVAILABLE_CATEGORIES = [
  'İnformasiya Texnologiyaları',
  'Dizayn & Yaradıcılıq',
  'Marketinq & PR',
  'Maliyyə & Mühasibat',
  'Satış & Müştəri Xidmətləri',
  'İdarəetmə & HR',
  'Mühəndislik',
  'Təhsil & Təlim',
  'Səhiyyə & Tibb',
  'Logistika & Nəqliyyat',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onOpenVerifyModal,
  onOpenPricing,
  initialTab = 'settings',
  onNavigateToTab,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security'>(initialTab);

  // Email Preferences State
  const [preferences, setPreferences] = useState<UserEmailPreferences>(() => {
    return currentUser?.emailPreferences || DEFAULT_PREFERENCES;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  // Synchronize when currentUser changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (currentUser?.emailPreferences) {
        setPreferences(currentUser.emailPreferences);
      }
      setSaveSuccess(false);
      setTestSentMessage(null);
    }
  }, [isOpen, initialTab, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleFrequencySelect = (freq: EmailAlertFrequency) => {
    setPreferences((prev) => ({
      ...prev,
      jobAlertFrequency: freq,
    }));
  };

  const handleToggleCategory = (cat: string) => {
    setPreferences((prev) => {
      const exists = prev.categories.includes(cat);
      const updated = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: updated };
    });
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      const updatedPrefs = {
        ...preferences,
        updatedAt: new Date().toISOString(),
      };
      await updateUserEmailPreferencesInFirestore(currentUser.id, currentUser.email, updatedPrefs);

      const updatedUser: User = {
        ...currentUser,
        emailPreferences: updatedPrefs,
      };
      onUpdateUser(updatedUser);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save email preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestAlert = () => {
    setTestSentMessage(`✅ Nümunə "${preferences.jobAlertFrequency === 'daily' ? 'Gündəlik Xülasə' : preferences.jobAlertFrequency === 'weekly' ? 'Həftəlik Xülasə' : 'Anlıq Xəbərdarlıq'}" bildirişi ${currentUser.email} ünvanına simulyasiya edildi.`);
    setTimeout(() => setTestSentMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.fullName}`}
                alt={currentUser.fullName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-xs"
              />
              {currentUser.emailVerified ? (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" title="Təsdiqlənib" />
              ) : (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white" title="Təsdiqlənməyib" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {currentUser.fullName}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  currentUser.role === 'business'
                    ? 'bg-purple-100 text-purple-800'
                    : currentUser.role === 'admin'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {currentUser.role === 'business' ? 'İşəgötürən' : currentUser.role === 'admin' ? 'Admin' : 'Namizəd'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                <span>{currentUser.email}</span>
                {currentUser.emailVerified ? (
                  <span className="inline-flex items-center text-emerald-600 text-[11px] font-semibold">
                    <Check className="w-3 h-3 ml-0.5 inline" /> Təsdiqlənib
                  </span>
                ) : (
                  <span className="inline-flex items-center text-amber-600 text-[11px] font-semibold">
                    <AlertCircle className="w-3 h-3 ml-0.5 inline" /> Təsdiqlənməyib
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {!currentUser.emailVerified && onOpenVerifyModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVerifyModal(currentUser);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                E-poçtu Təsdiqlə ⚡
              </button>
            )}
            <button
              id="close-user-profile-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              title="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HORIZONTAL TAB SELECTOR */}
        <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
          <button
            id="user-profile-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Tənzimləmələr & Bildirişlər</span>
            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
              YENİ
            </span>
          </button>

          <button
            id="user-profile-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Hesab Məlumatları</span>
          </button>

          <button
            id="user-profile-tab-security"
            onClick={() => setActiveTab('security')}
            className={`py-3.5 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Təhlükəsizlik</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: SETTINGS & EMAIL PREFERENCES (REQUESTED MAIN FEATURE) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* SECTION: Notification Frequency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Vakansiya E-poçt Bildirişləri Tezliyi</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Yeni vakansiyalar paylaşıldıqda e-poçtunuza necə və hansı intervalla xəbərdarlıq göndərilsin?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  
                  {/* Option 1: Instant Alerts */}
                  <div
                    id="pref-freq-instant"
                    onClick={() => handleFrequencySelect('instant')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      preferences.jobAlertFrequency === 'instant'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          preferences.jobAlertFrequency === 'instant' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Anlıq Bildirişlər</div>
                          <div className="text-[10px] text-blue-700 font-semibold">Instant Alerts</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        Tövsiyə olunan
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                      Sizə uyğun yeni vakansiya dərc olunan kimi dərhal e-poçtunuza birbaşa müraciət linki ilə göndərilir.
                    </p>
                  </div>

                  {/* Option 2: Daily Digest */}
                  <div
                    id="pref-freq-daily"
                    onClick={() => handleFrequencySelect('daily')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      preferences.jobAlertFrequency === 'daily'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          preferences.jobAlertFrequency === 'daily' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Gündəlik Xülasə</div>
                          <div className="text-[10px] text-slate-500 font-medium">Daily Digest</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        Saat 09:00
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                      Hər səhər profilinizə və tələblərinizə ən çox uyğun gələn 5-10 seçilmiş vakansiyanın təmiz xülasəsi.
                    </p>
                  </div>

                  {/* Option 3: Weekly Digest */}
                  <div
                    id="pref-freq-weekly"
                    onClick={() => handleFrequencySelect('weekly')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      preferences.jobAlertFrequency === 'weekly'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          preferences.jobAlertFrequency === 'weekly' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Həftəlik Xülasə</div>
                          <div className="text-[10px] text-slate-500 font-medium">Weekly Digest</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        Bazar ertəsi
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
                      Həftədə bir dəfə bazarda ən yüksək maaşlı və reytinqli vakansiyaların həftəlik icmalı.
                    </p>
                  </div>

                  {/* Option 4: Disabled */}
                  <div
                    id="pref-freq-disabled"
                    onClick={() => handleFrequencySelect('disabled')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      preferences.jobAlertFrequency === 'disabled'
                        ? 'border-slate-600 bg-slate-100 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          preferences.jobAlertFrequency === 'disabled' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <BellOff className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Bildirişləri Dayandır</div>
                          <div className="text-[10px] text-slate-500 font-medium">Notifications Off</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
                      E-poçt vasitəsilə vakansiya təklifləri göndərilməyəcək. Yalnız saytdaxili bildirişlər aktiv qalacaq.
                    </p>
                  </div>

                </div>
              </div>

              {/* SECTION: Filtering Criteria (Shown when frequency != 'disabled') */}
              {preferences.jobAlertFrequency !== 'disabled' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900">Bildiriş Meyarları və Ağıllı Filtirlər</h4>
                  </div>

                  {/* Category Pills */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">
                      Maraqlandığınız Kateqoriyalar (Seçilmiş sahələr üzrə göndəriləcək):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_CATEGORIES.map((cat) => {
                        const isSelected = preferences.categories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleToggleCategory(cat)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            <span>{cat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Minimum Salary and Remote Filter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Minimum Maaş Şərti (AZN):
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="pref-min-salary-input"
                          type="number"
                          value={preferences.minSalary || ''}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            minSalary: e.target.value ? parseInt(e.target.value, 10) : 0,
                          })}
                          placeholder="Məs: 1000 (Boş buraxsanız hamısı)"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Yalnız bu məbləğdən yuxarı elanlar üzrə xəbərdarlıq göndəriləcək.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Ağıllı ATS Uyğunluq Həddi:
                      </label>
                      <select
                        id="pref-min-match-select"
                        value={preferences.minMatchScore || 70}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          minMatchScore: parseInt(e.target.value, 10),
                        })}
                        className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Bütün uyğun vakansiyalar (0%+)</option>
                        <option value={60}>Orta və yuxarı uyğunluq (60%+)</option>
                        <option value={75}>Yüksək dərəcəli uyğunluq (75%+)</option>
                        <option value={85}>Yalnız mükəmməl uyğunluq (85%+)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        AI tərəfindən hesablanan ATS balına əsasən filtrlənir.
                      </span>
                    </div>
                  </div>

                  {/* Remote only toggle */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-blue-600" />
                        <span>Yalnız Məsafədən (Remote) Vakansiyalar</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Ofisdən işləməyi tələb etməyən uzaqdan iş bildirişləri
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="pref-remote-toggle"
                        type="checkbox"
                        checked={preferences.remoteOnly || false}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          remoteOnly: e.target.checked,
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                </div>
              )}

              {/* SECTION: Lifecycle Alerts */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900">Müraciət və Təklif Bildirişləri</h4>
                
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Müraciət Statusu Dəyişiklikləri</div>
                      <p className="text-[11px] text-slate-500">İşəgötürən CV-nizə baxdıqda və ya statusu dəyişdikdə e-poçt alın</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="pref-status-toggle"
                        type="checkbox"
                        checked={preferences.applicationStatusUpdates}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          applicationStatusUpdates: e.target.checked,
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Müsahibə Dəvətləri & Rəsmi İş Təklifləri (Job Offer)</div>
                      <p className="text-[11px] text-slate-500">Şirkət sizə müsahibə və ya təklif göndərdikdə dərhal e-poçt xəbərdarlığı</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="pref-offers-toggle"
                        type="checkbox"
                        checked={preferences.interviewAndOfferAlerts}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          interviewAndOfferAlerts: e.target.checked,
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Karyera Məsləhətləri & Əmək Bazarı Hesabatı</div>
                      <p className="text-[11px] text-slate-500">Həftəlik əmək bazarı təhlili, maaş trendləri və faydalı HR məsləhətləri</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="pref-newsletter-toggle"
                        type="checkbox"
                        checked={preferences.newsletterDigest}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          newsletterDigest: e.target.checked,
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                </div>
              </div>

              {/* LIVE EMAIL PREVIEW & TEST DISPATCH BUTTON */}
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{showEmailPreview ? 'Nümunə E-poçtu Gizlət' : 'Nümunə E-poçta Bax'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTestAlert}
                    className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    <span>Test E-poçtu Göndər</span>
                  </button>
                </div>

                {testSentMessage && (
                  <span className="text-xs text-emerald-700 font-medium animate-fade-in">
                    {testSentMessage}
                  </span>
                )}
              </div>

              {/* EMAIL MOCK PREVIEW DRAWER */}
              {showEmailPreview && (
                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-inner space-y-3 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="text-xs text-slate-400">
                      Kimdən: <span className="text-white font-mono">Jobia.az Bildiriş Mərkəzi &lt;alerts@jobia.az&gt;</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold">
                      {preferences.jobAlertFrequency === 'daily' ? 'DAILY DIGEST' : preferences.jobAlertFrequency === 'weekly' ? 'WEEKLY DIGEST' : 'INSTANT ALERT'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-blue-300">
                    Mövzu: {preferences.jobAlertFrequency === 'daily'
                      ? `🌅 Günün ən yaxşı vakansiyaları (${currentUser.fullName.split(' ')[0]} üçün)`
                      : preferences.jobAlertFrequency === 'weekly'
                      ? `📊 Həftəlik seçilmiş vakansiya xülasəsi - Jobia.az`
                      : `🔔 Yeni uyğun vakansiya: "Senior Frontend Developer" - Paşa Bank`}
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs space-y-2">
                    <p className="text-slate-300 text-[11px]">
                      Salam {currentUser.fullName}, sizin profiliniz və tələbləriniz üzrə yeni vakansiya qeydə alındı:
                    </p>
                    <div className="bg-slate-900/90 p-2.5 rounded border border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-xs">Senior Frontend Developer (React / TS)</div>
                        <div className="text-[11px] text-slate-400">Paşa Bank • Bakı (Hibrid) • 3,200 - 4,500 AZN</div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-900/60 text-emerald-300 font-bold text-[10px] rounded">
                        94% Uyğunluq
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded text-[11px] font-bold">
                        Vakansiyanı Aç və Müraciət Et →
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Bu e-poçt Jobia.az profilinizin "Tənzimləmələr" bölməsindəki seçimlərinizə əsasən göndərilib.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PROFILE SUMMARY */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Tam Ad:</span>
                  <span className="text-sm font-bold text-slate-900">{currentUser.fullName}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">E-poçt:</span>
                  <span className="text-sm font-bold text-slate-900">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Telefon:</span>
                  <span className="text-sm font-bold text-slate-900">{currentUser.phone || 'Qeyd olunmayıb'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Şirkət / Təşkilat:</span>
                  <span className="text-sm font-bold text-slate-900">{currentUser.companyName || 'Fərdi namizəd'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Hesab Növü:</span>
                  <span className="text-sm font-bold capitalize text-slate-900">{currentUser.role}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Qeydiyyat Tarixi:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {currentUser.createdAt ? currentUser.createdAt.split('T')[0] : '2026'}
                  </span>
                </div>
              </div>

              {currentUser.role === 'candidate' && onNavigateToTab && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">Rəqəmsal CV Məlumatlarınızı Yeniləyin</h4>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      İş təcrübənizi, təhsilinizi və əsas bacarıqlarınızı CV Yaradıcıda redaktə edin.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToTab('cv-creator');
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    CV Redaktə Et →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY & ACCESS */}
          {activeTab === 'security' && (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">E-poçt Doğrulaması</div>
                    <p className="text-[11px] text-slate-500">Hesabınızın təhlükəsizliyi və rəsmi əlaqə üçün</p>
                  </div>
                  {currentUser.emailVerified ? (
                    <span className="text-xs font-bold text-emerald-700 px-2.5 py-1 bg-emerald-100 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Təsdiqlənib
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenVerifyModal) onOpenVerifyModal(currentUser);
                      }}
                      className="text-xs font-bold text-white px-3 py-1 bg-amber-500 hover:bg-amber-600 rounded-lg cursor-pointer"
                    >
                      Kodu Daxil Et ⚡
                    </button>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Şifrə və Giriş Təhlükəsizliyi</div>
                    <p className="text-[11px] text-slate-500">Firebase Auth ilə qorunan şifrələnmiş sessiya</p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 px-2.5 py-1 bg-slate-200/80 rounded-lg">
                    Aktiv Qorunur
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-fade-in">
                <Check className="w-4 h-4" /> Tənzimləmələr uğurla yadda saxlanıldı!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              id="cancel-user-profile-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-200/70 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Bağla
            </button>
            
            {activeTab === 'settings' && (
              <button
                id="save-email-preferences-btn"
                type="button"
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Saxlanılır...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tənzimləmələri Yadda Saxla</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <ModalBottomLogo />
      </div>
    </div>
  );
};

export default UserProfileModal;
