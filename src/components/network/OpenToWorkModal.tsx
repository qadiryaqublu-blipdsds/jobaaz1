import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Briefcase, MapPin, Eye, Shield } from 'lucide-react';
import { User, OpenToWorkPreferences } from '../../types';
import { OpenToWorkBadge } from './OpenToWorkBadge';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface OpenToWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSavePreferences: (prefs: OpenToWorkPreferences) => Promise<void> | void;
}

export const OpenToWorkModal: React.FC<OpenToWorkModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSavePreferences,
}) => {
  const existing = currentUser?.openToWork;

  const [isActive, setIsActive] = useState<boolean>(existing?.isOpen ?? true);
  const [targetTitles, setTargetTitles] = useState<string[]>(
    existing?.targetJobTitles && existing.targetJobTitles.length > 0
      ? existing.targetJobTitles
      : [currentUser?.jobTitle || 'Proqram Təminatı Mühəndisi']
  );
  const [newTitleInput, setNewTitleInput] = useState('');
  const [workplaceTypes, setWorkplaceTypes] = useState<('remote' | 'hybrid' | 'on-site')[]>(
    existing?.workplaceTypes || ['remote', 'hybrid']
  );
  const [availability, setAvailability] = useState<'immediately' | 'casually_looking' | 'two_weeks_notice'>(
    existing?.availability || 'immediately'
  );
  const [visibility, setVisibility] = useState<'all_members' | 'recruiters_only'>(
    existing?.visibility || 'all_members'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddTitle = () => {
    const trimmed = newTitleInput.trim();
    if (trimmed && !targetTitles.includes(trimmed)) {
      setTargetTitles([...targetTitles, trimmed]);
      setNewTitleInput('');
    }
  };

  const handleRemoveTitle = (title: string) => {
    setTargetTitles(targetTitles.filter((t) => t !== title));
  };

  const toggleWorkplace = (type: 'remote' | 'hybrid' | 'on-site') => {
    if (workplaceTypes.includes(type)) {
      if (workplaceTypes.length > 1) {
        setWorkplaceTypes(workplaceTypes.filter((t) => t !== type));
      }
    } else {
      setWorkplaceTypes([...workplaceTypes, type]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const prefs: OpenToWorkPreferences = {
        isOpen: isActive,
        targetJobTitles: targetTitles,
        workplaceTypes,
        availability,
        visibility,
        updatedAt: new Date().toISOString(),
      };
      await onSavePreferences(prefs);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Karyera Statusu və İş Axtarışı</h2>
              <p className="text-xs text-slate-500">İş təkliflərinə açıq olduğunuzu qeyd edin və şirkətlərin diqqətini cəlb edin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <OpenToWorkBadge
              name={currentUser?.fullName || 'İstifadəçi'}
              avatarUrl={currentUser?.avatarUrl}
              isOpenToWork={isActive && visibility === 'all_members'}
              size="lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{currentUser?.fullName || 'Profiliniz'}</span>
                {isActive && (
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    Aktivdir
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                {isActive
                  ? visibility === 'all_members'
                    ? 'Profilinizdə "🎯 Təkliflərə Açıq" nişanı bütün istifadəçilərə və işəgötürənlərə görünür.'
                    : 'Yalnız təsdiqlənmiş rekruter və şirkət rəhbərlərinə görünür.'
                  : 'Status qeyri-aktivdir. Heç bir axtarış nişanı görünməyəcək.'}
              </p>
            </div>
          </div>

          {/* Toggle Active */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white">
            <div>
              <span className="text-sm font-bold text-slate-800">İş təkliflərinə açığam</span>
              <p className="text-xs text-slate-500">Profiliniz işəgötürənlərin kadr axtarış siyahısında ön plana çıxacaq</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isActive ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {isActive && (
            <>
              {/* Target Job Titles */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  Hansı vəzifələri axtarırsınız?
                </label>
                <div className="flex flex-wrap gap-2">
                  {targetTitles.map((title) => (
                    <span
                      key={title}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {title}
                      <button
                        type="button"
                        onClick={() => handleRemoveTitle(title)}
                        className="text-emerald-500 hover:text-emerald-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTitleInput}
                    onChange={(e) => setNewTitleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTitle();
                      }
                    }}
                    placeholder="Məs: Senior Frontend Developer, Layihə Meneceri..."
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddTitle}
                    className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Əlavə et
                  </button>
                </div>
              </div>

              {/* Workplace Types */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  İş yeri növü
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'remote', label: 'Uzaqdan (Remote)' },
                    { id: 'hybrid', label: 'Hibrid' },
                    { id: 'on-site', label: 'Ofisdə (On-site)' },
                  ].map((item) => {
                    const isSelected = workplaceTypes.includes(item.id as any);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleWorkplace(item.id as any)}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nə vaxt başlamağa hazırsınız?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'immediately', label: 'Dərhal (Hazıram)' },
                    { id: 'two_weeks_notice', label: '2 həftəlik xəbərdarlıq' },
                    { id: 'casually_looking', label: 'Təkliflərə baxıram' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAvailability(item.id as any)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-colors cursor-pointer ${
                        availability === item.id
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  Kimlər görə bilsin?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibility('all_members')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      visibility === 'all_members'
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-slate-900">Bütün istifadəçilərə açıq</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Profilinizdə "🎯 Təkliflərə Açıq" nişanı görünür. Həm namizədlər, həm də işəgötürən şirkətlər görür.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('recruiters_only')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      visibility === 'recruiters_only'
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-3 h-3 text-slate-600" />
                      <span className="text-xs font-bold text-slate-900">Yalnız şirkət və rekruterlər</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Nişan kənar istifadəçilərə görünmür, yalnız rəsmi işəgötürənlər kadr axtarışında görür.
                    </p>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Yadda saxlanılır...' : 'Təsdiq et və Yadda Saxla'}
            </button>
          </div>
        </form>

        <ModalBottomLogo />
      </div>
    </div>
  );
};
