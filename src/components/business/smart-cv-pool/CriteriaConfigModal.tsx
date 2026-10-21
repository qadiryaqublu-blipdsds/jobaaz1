import React, { useState } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  Briefcase,
  Target,
  ShieldAlert,
  SlidersHorizontal,
  Globe2,
  AlertCircle
} from 'lucide-react';
import {
  RecruitmentCriteria,
  RecruitmentCriteriaWeights,
  KnockoutCriteria,
  ScoringStrictnessMode
} from '../../../types';

interface CriteriaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: RecruitmentCriteria;
  onSaveCriteria: (criteria: RecruitmentCriteria) => void;
}

export const CriteriaConfigModal: React.FC<CriteriaConfigModalProps> = ({
  isOpen,
  onClose,
  criteria,
  onSaveCriteria,
}) => {
  const [form, setForm] = useState<RecruitmentCriteria>({
    ...criteria,
    weights: {
      skills: criteria.weights?.skills ?? 35,
      experience: criteria.weights?.experience ?? 20,
      jobTitleMatch: criteria.weights?.jobTitleMatch ?? 15,
      salary: criteria.weights?.salary ?? 10,
      education: criteria.weights?.education ?? 10,
      languages: criteria.weights?.languages ?? 5,
      location: criteria.weights?.location ?? 5,
    },
    knockout: criteria.knockout ?? {
      requireMinExperience: false,
      strictSalaryCap: false,
      requireEducationLevel: false,
      requireAllMandatorySkills: false,
    },
    strictnessMode: criteria.strictnessMode ?? 'balanced',
  });

  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  if (!isOpen) return null;

  const handleAddRequiredSkill = () => {
    if (!newRequiredSkill.trim()) return;
    if (!form.requiredSkills.includes(newRequiredSkill.trim())) {
      setForm({
        ...form,
        requiredSkills: [...form.requiredSkills, newRequiredSkill.trim()],
      });
    }
    setNewRequiredSkill('');
  };

  const handleRemoveRequiredSkill = (skill: string) => {
    setForm({
      ...form,
      requiredSkills: form.requiredSkills.filter(s => s !== skill),
    });
  };

  const handleAddPreferredSkill = () => {
    if (!newPreferredSkill.trim()) return;
    if (!form.preferredSkills.includes(newPreferredSkill.trim())) {
      setForm({
        ...form,
        preferredSkills: [...form.preferredSkills, newPreferredSkill.trim()],
      });
    }
    setNewPreferredSkill('');
  };

  const handleRemovePreferredSkill = (skill: string) => {
    setForm({
      ...form,
      preferredSkills: form.preferredSkills.filter(s => s !== skill),
    });
  };

  const handleAddLanguage = () => {
    if (!newLanguage.trim()) return;
    const current = (form.requiredLanguages || []).map(l => (typeof l === 'string' ? l : l.language));
    if (!current.includes(newLanguage.trim())) {
      setForm({
        ...form,
        requiredLanguages: [...(form.requiredLanguages || []), newLanguage.trim()],
      });
    }
    setNewLanguage('');
  };

  const handleRemoveLanguage = (langStr: string) => {
    setForm({
      ...form,
      requiredLanguages: (form.requiredLanguages || []).filter(l =>
        (typeof l === 'string' ? l : l.language) !== langStr
      ),
    });
  };

  const handleWeightChange = (key: keyof RecruitmentCriteriaWeights, value: number) => {
    setForm({
      ...form,
      weights: {
        ...form.weights,
        [key]: Math.max(0, Math.min(100, value)),
      },
    });
  };

  const handleKnockoutToggle = (key: keyof KnockoutCriteria) => {
    setForm({
      ...form,
      knockout: {
        ...form.knockout,
        [key]: !form.knockout?.[key],
      },
    });
  };

  const handleResetWeights = () => {
    setForm({
      ...form,
      weights: {
        skills: 35,
        experience: 20,
        jobTitleMatch: 15,
        salary: 10,
        education: 10,
        languages: 5,
        location: 5,
      },
    });
  };

  const totalWeights =
    (form.weights.skills || 0) +
    (form.weights.experience || 0) +
    (form.weights.jobTitleMatch || 0) +
    (form.weights.salary || 0) +
    (form.weights.education || 0) +
    (form.weights.languages || 0) +
    (form.weights.location || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCriteria(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Beynəlxalq ATS Skorinq Meyarları & Çəki Sazlaması
              </h2>
              <p className="text-xs text-slate-500">
                7-Faktorlu kadr uyğunluğu, sərtlik rejimi və kənarlaşdırma (Knockout) filtrləri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Job Title & Seniority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Hədəf Vəzifə Adı
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={form.targetJobTitle}
                  onChange={e => setForm({ ...form, targetJobTitle: e.target.value })}
                  placeholder="Məs. Senior Frontend Developer, Baş Mühasib"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Karyera Səviyyəsi
              </label>
              <select
                value={form.seniorityLevel || 'Any'}
                onChange={e => setForm({ ...form, seniorityLevel: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="Any">Fərq etmir</option>
                <option value="Junior">Junior (İlkin)</option>
                <option value="Middle">Middle (Orta)</option>
                <option value="Senior">Senior (Təcrübəli)</option>
                <option value="Lead">Lead / Rəhbər</option>
                <option value="Executive">Executive / Menecment</option>
              </select>
            </div>
          </div>

          {/* Strictness Mode Switcher */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Skorinq Sərtlik Rejimi (ATS Strictness Engine):
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setForm({ ...form, strictnessMode: 'lenient' })}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                  form.strictnessMode === 'lenient'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Yumşaq (+5% bonus)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, strictnessMode: 'balanced' })}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                  form.strictnessMode === 'balanced'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Standart (Balanslı)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, strictnessMode: 'strict' })}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                  form.strictnessMode === 'strict'
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Ciddi (FAANG / Bank)
              </button>
            </div>
          </div>

          {/* Numerical Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Minimum Təcrübə (İl)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={form.minExperienceYears}
                onChange={e => setForm({ ...form, minExperienceYears: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Maksimum Büdcə (AZN)
              </label>
              <input
                type="number"
                step="50"
                min="0"
                value={form.maxExpectedSalary}
                onChange={e => setForm({ ...form, maxExpectedSalary: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tələb Olunan Təhsil
              </label>
              <select
                value={form.requiredEducation || 'Fərq etmir'}
                onChange={e => setForm({ ...form, requiredEducation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="Fərq etmir">Fərq etmir</option>
                <option value="Orta">Orta təhsil</option>
                <option value="Bakalavr">Bakalavr</option>
                <option value="Magistr">Magistr</option>
                <option value="Doktorantura">Doktorantura</option>
              </select>
            </div>
          </div>

          {/* Required Mandatory Skills */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Əsas Məcburi Bacarıqlar (Must-Have Skills)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newRequiredSkill}
                onChange={e => setNewRequiredSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddRequiredSkill())}
                placeholder="Bacarıq yazın və Enter basın (məs. React, Python)"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddRequiredSkill}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Əlavə Et</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {form.requiredSkills.map(sk => (
                <span
                  key={sk}
                  className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequiredSkill(sk)}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              {form.requiredSkills.length === 0 && (
                <span className="text-xs text-slate-400 italic">Məcburi bacarıq daxil edilməyib</span>
              )}
            </div>
          </div>

          {/* Preferred / Bonus Skills */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Arzuolunan Əlavə Bacarıqlar (Nice-to-Have Skills)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newPreferredSkill}
                onChange={e => setNewPreferredSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddPreferredSkill())}
                placeholder="Məs. Docker, CI/CD, İngilis dili"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddPreferredSkill}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Əlavə Et</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {form.preferredSkills.map(sk => (
                <span
                  key={sk}
                  className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePreferredSkill(sk)}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              {form.preferredSkills.length === 0 && (
                <span className="text-xs text-slate-400 italic">Arzuolunan bacarıq daxil edilməyib</span>
              )}
            </div>
          </div>

          {/* Required Languages */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tələb Olunan Xarici Dillər (Languages)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newLanguage}
                onChange={e => setNewLanguage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                placeholder="Məs. İngilis dili, Rus dili, Türk dili"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddLanguage}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Əlavə Et</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {(form.requiredLanguages || []).map(l => {
                const langName = typeof l === 'string' ? l : l.language;
                return (
                  <span
                    key={langName}
                    className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Globe2 className="w-3 h-3 text-teal-600" />
                    <span>{langName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(langName)}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Knockout (Disqualification) Rules */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Sərt İmtina Qaydaları (Knockout Criteria):</span>
            </div>
            <p className="text-[11px] text-rose-700">
              Bu şərtlər ödənmədikdə namizəd avtomatik kənarlaşdırılır (Disqualified) və xüsusi xəbərdarlıq qeyd olunur.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-rose-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.knockout?.requireMinExperience ?? false}
                  onChange={() => handleKnockoutToggle('requireMinExperience')}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-bold text-slate-800">Minimum staj çatışmazsa kənarlaşdır</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-rose-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.knockout?.strictSalaryCap ?? false}
                  onChange={() => handleKnockoutToggle('strictSalaryCap')}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-bold text-slate-800">Maaş büdcəni aşarsa kənarlaşdır</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-rose-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.knockout?.requireEducationLevel ?? false}
                  onChange={() => handleKnockoutToggle('requireEducationLevel')}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-bold text-slate-800">Ali təhsil yoxdursa kənarlaşdır</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-rose-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.knockout?.requireAllMandatorySkills ?? false}
                  onChange={() => handleKnockoutToggle('requireAllMandatorySkills')}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="font-bold text-slate-800">Bütün vacib bacarıqlar mütləq olsun</span>
              </label>
            </div>
          </div>

          {/* 7-Factor Weights Tuning */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-800 tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>7-Faktorlu Skorinq Çəkiləri (Cəmi: {totalWeights}%)</span>
              </div>
              <button
                type="button"
                onClick={handleResetWeights}
                className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Standarta Qaytar</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* 1. Skills weight */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>1. Bacarıqlar Uyğunluğu:</span>
                  <span className="text-blue-600">{form.weights.skills}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70"
                  step="5"
                  value={form.weights.skills}
                  onChange={e => handleWeightChange('skills', parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* 2. Job Title / Role relevance */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>2. Vəzifə Adı & Semantik Uyğunluq:</span>
                  <span className="text-indigo-600">{form.weights.jobTitleMatch ?? 15}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={form.weights.jobTitleMatch ?? 15}
                  onChange={e => handleWeightChange('jobTitleMatch', parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* 3. Experience weight */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>3. İş Təcrübəsi (İllər):</span>
                  <span className="text-emerald-600">{form.weights.experience}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={form.weights.experience}
                  onChange={e => handleWeightChange('experience', parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* 4. Salary weight */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>4. Maaş Büdcəsi Uyğunluğu:</span>
                  <span className="text-amber-600">{form.weights.salary}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={form.weights.salary}
                  onChange={e => handleWeightChange('salary', parseInt(e.target.value, 10))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* 5. Education weight */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>5. Təhsil Səviyyəsi:</span>
                  <span className="text-purple-600">{form.weights.education}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={form.weights.education}
                  onChange={e => handleWeightChange('education', parseInt(e.target.value, 10))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* 6. Languages weight */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>6. Xarici Dil Bilikləri:</span>
                  <span className="text-teal-600">{form.weights.languages ?? 5}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="5"
                  value={form.weights.languages ?? 5}
                  onChange={e => handleWeightChange('languages', parseInt(e.target.value, 10))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              {/* 7. Location weight */}
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>7. Şəhər / Lokasiya:</span>
                  <span className="text-slate-600">{form.weights.location}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="5"
                  value={form.weights.location}
                  onChange={e => handleWeightChange('location', parseInt(e.target.value, 10))}
                  className="w-full accent-slate-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Ləğv Et
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Meyarları Saxla & Skorinqi Yenilə</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
