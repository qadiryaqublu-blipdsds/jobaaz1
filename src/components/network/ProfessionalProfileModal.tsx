import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  UserPlus, 
  Check, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  ThumbsUp, 
  Share2, 
  Send,
  Building2,
  Users
} from 'lucide-react';
import { CandidateProfile, User, ProfessionalConnection, ProfessionalRecommendation } from '../../types';
import { OpenToWorkBadge } from './OpenToWorkBadge';
import { ModalBottomLogo } from '../ModalBottomLogo';
import { 
  toggleSkillEndorsementLocal, 
  getStoredSkillEndorsements, 
  addProfessionalRecommendation,
  getStoredRecommendations
} from '../../services/networkService';

interface ProfessionalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateProfile | null;
  currentUser: User | null;
  connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'connected';
  onConnect: (candidate: CandidateProfile) => void;
  onOpenChat?: (candidate: CandidateProfile) => void;
  onRequireAuth?: () => void;
}

export const ProfessionalProfileModal: React.FC<ProfessionalProfileModalProps> = ({
  isOpen,
  onClose,
  candidate,
  currentUser,
  connectionStatus,
  onConnect,
  onOpenChat,
  onRequireAuth,
}) => {
  if (!isOpen || !candidate) return null;

  // Local state for endorsements
  const [endorsementsStore, setEndorsementsStore] = useState(() => getStoredSkillEndorsements());
  const [recommendations, setRecommendations] = useState<ProfessionalRecommendation[]>(() => 
    getStoredRecommendations(candidate.id)
  );

  // Write recommendation sub-modal state
  const [isWritingRec, setIsWritingRec] = useState(false);
  const [recRelationship, setRecRelationship] = useState<'worked_together' | 'manager' | 'mentor' | 'client' | 'peer'>('worked_together');
  const [recText, setRecText] = useState('');
  const [recSuccess, setRecSuccess] = useState(false);

  const candidateSkills = candidate.skills || [];
  const candidateEndorsements = endorsementsStore[candidate.id] || {};

  const handleToggleEndorse = (skillName: string) => {
    if (!currentUser) {
      onRequireAuth?.();
      return;
    }
    if (currentUser.id === candidate.id || currentUser.id === candidate.userId) {
      return; // Cannot endorse own skill
    }

    const { newCount } = toggleSkillEndorsementLocal(
      {
        id: currentUser.id,
        name: currentUser.fullName,
        title: currentUser.jobTitle,
      },
      candidate.id,
      skillName
    );

    // Refresh state
    setEndorsementsStore(getStoredSkillEndorsements());
  };

  const handleSaveRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth?.();
      return;
    }
    if (!recText.trim()) return;

    const newRec = await addProfessionalRecommendation({
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorTitle: currentUser.jobTitle || 'Peşəkar mütəxəssis',
      authorAvatar: currentUser.avatarUrl,
      authorCompany: currentUser.companyName,
      recipientId: candidate.id,
      relationship: recRelationship,
      text: recText.trim(),
    });

    setRecommendations([newRec, ...recommendations]);
    setRecText('');
    setIsWritingRec(false);
    setRecSuccess(true);
    setTimeout(() => setRecSuccess(false), 4000);
  };

  const isOpenToWork = candidate.openToWork?.isOpen ?? candidate.isOpenToEmployers ?? true;
  const isHiring = Boolean(candidate.hiring?.isHiring);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cover Header Banner */}
        <div className="h-32 sm:h-40 bg-linear-to-r from-slate-800 via-indigo-900 to-slate-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Main Info */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <div className="flex items-end gap-4">
              <OpenToWorkBadge
                name={candidate.fullName}
                avatarUrl={candidate.profilePhoto}
                isOpenToWork={isOpenToWork}
                isHiring={isHiring}
                size="xl"
                className="shadow-xl"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              {/* Connect Button */}
              {connectionStatus === 'connected' ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-4 h-4" />
                  Əlaqədəsiniz ✓
                </span>
              ) : connectionStatus === 'pending_sent' ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-4 h-4 animate-spin text-amber-500" />
                  Sorğu göndərildi
                </span>
              ) : connectionStatus === 'pending_received' ? (
                <button
                  onClick={() => onConnect(candidate)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  Dəvəti qəbul et
                </button>
              ) : (
                <button
                  onClick={() => onConnect(candidate)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  Bağlantı qur
                </button>
              )}

              {/* Message Button */}
              <button
                onClick={() => onOpenChat?.(candidate)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Mesaj yaz
              </button>

              {/* Write Recommendation */}
              <button
                onClick={() => {
                  if (!currentUser) onRequireAuth?.();
                  else setIsWritingRec(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Tövsiyə yaz
              </button>
            </div>
          </div>

          {/* Headline & Badges */}
          <div className="space-y-1.5 mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{candidate.fullName}</h1>
              <span className="p-0.5 rounded-full bg-blue-500 text-white" title="Təsdiqlənmiş profil">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <p className="text-sm font-medium text-slate-700 leading-snug">
              {candidate.professionalTitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {candidate.location || 'Bakı, Azərbaycan'}
              </span>
              <span>•</span>
              <span className="font-semibold text-blue-600">
                {candidate.connectionsCount || 0}+ əlaqə
              </span>
              <span>•</span>
              <span className="text-slate-500">
                {candidate.openToWork?.workplaceTypes?.join(' / ') || 'Tam ştat'}
              </span>
            </div>
          </div>

          {/* Open to Work Banner (if active) */}
          {isOpenToWork && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 mb-6 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900">
                    🎯 Təkliflərə Açıq • Karyera imkanlarını nəzərdən keçirir
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-200 text-emerald-900 rounded-md">
                    Aktiv
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  Axtardığı vəzifələr: <strong className="font-semibold">{candidate.openToWork?.targetJobTitles?.join(', ') || candidate.professionalTitle}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Success Message Banner */}
          {recSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Tövsiyəniz uğurla əlavə edildi və profildə dərc olundu!
            </div>
          )}

          {/* Write Recommendation Form (inline expansion) */}
          {isWritingRec && (
            <form onSubmit={handleSaveRecommendation} className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  {candidate.fullName} üçün Peşəkar Tövsiyə Yaz
                </span>
                <button
                  type="button"
                  onClick={() => setIsWritingRec(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Münasibətiniz (Hansı vəzifədə birgə çalışmısınız?):
                </label>
                <select
                  value={recRelationship}
                  onChange={(e) => setRecRelationship(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="worked_together">Həmkar (Eyni komandada birgə işləmişik)</option>
                  <option value="manager">Rəhbər (Mən onun meneceri olmuşam)</option>
                  <option value="mentor">Mentor / Müəllim</option>
                  <option value="client">Müştəri / Sifarişçi</option>
                  <option value="peer">Peşəkar partnyor</option>
                </select>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={recText}
                  onChange={(e) => setRecText(e.target.value)}
                  placeholder="Məsələn: Kamran ilə 2 il birgə çalışmışıq, layihənin arxitekturasında və nəticəyə fokuslanmaqda çox bacarıqlıdır..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWritingRec(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Bağla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                >
                  Tövsiyəni dərc et
                </button>
              </div>
            </form>
          )}

          {/* Section: About */}
          {candidate.about && (
            <div className="mb-6 space-y-2">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Haqqında</h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {candidate.about}
              </p>
            </div>
          )}

          {/* Section: Skills & LinkedIn-Style Endorsements */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Bilik və Bacarıqlar (Təsdiqlər)
              </h2>
              <span className="text-[11px] text-slate-400">
                Bacarığı təsdiqləmək üçün üzərinə klikləyin
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {candidateSkills.map((skill) => {
                const skillInfo = candidateEndorsements[skill];
                const count = skillInfo?.count || 0;
                const isEndorsedByMe = Boolean(
                  currentUser && skillInfo?.endorsers?.some((e) => e.id === currentUser.id)
                );

                return (
                  <button
                    key={skill}
                    onClick={() => handleToggleEndorse(skill)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border ${
                      isEndorsedByMe
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{skill}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                        isEndorsedByMe
                          ? 'bg-blue-600 text-white'
                          : count > 0
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      {count > 0 ? `+${count}` : '+1 Təsdiqlə'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Experience */}
          {candidate.workExperience && candidate.workExperience.length > 0 && (
            <div className="mb-6 space-y-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                İş Təcrübəsi
              </h2>
              <div className="space-y-3">
                {candidate.workExperience.map((exp, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">{exp.position || exp.role}</div>
                      <div className="text-slate-600 font-medium">{exp.company} • {exp.period}</div>
                      {exp.description && (
                        <p className="text-slate-500 mt-1 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Tövsiyələr ({recommendations.length})
              </h2>
              <button
                onClick={() => {
                  if (!currentUser) onRequireAuth?.();
                  else setIsWritingRec(true);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                + Tövsiyə ver
              </button>
            </div>

            {recommendations.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Hələ heç bir tövsiyə yazılmayıb. İlk tövsiyəni siz verin!
              </p>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rec.authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rec.authorName)}`}
                        alt={rec.authorName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{rec.authorName}</div>
                        <div className="text-[11px] text-slate-500">{rec.authorTitle}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      "{rec.text}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ModalBottomLogo />
      </div>
    </div>
  );
};
