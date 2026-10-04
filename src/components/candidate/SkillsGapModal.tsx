import React, { useMemo } from 'react';
import { Vacancy, User } from '../../types';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  BookOpen, 
  X, 
  ArrowRight, 
  Zap, 
  DollarSign, 
  Briefcase, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { ModalPortal } from '../common/ModalPortal';

interface SkillsGapModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancy: Vacancy;
  currentUser?: User | null;
  onApply?: (vacancy: Vacancy) => void;
}

export const SkillsGapModal: React.FC<SkillsGapModalProps> = ({
  isOpen,
  onClose,
  vacancy,
  currentUser,
  onApply,
}) => {
  if (!isOpen) return null;

  // Extract skills from current user CV or profile
  const userSkills: string[] = useMemo(() => {
    const list: string[] = [];
    if (currentUser?.skills) list.push(...currentUser.skills);
    if (currentUser?.cvData?.skills) {
      currentUser.cvData.skills.forEach(s => {
        if (typeof s === 'string') list.push(s);
        else if ((s as any)?.name) list.push((s as any).name);
      });
    }
    // Fallback popular skills if user has none entered yet
    if (list.length === 0) {
      return ['MS Office', 'Komanda ilə iş', 'Ünsiyyət', 'Məsuliyyətlilik', 'Azərbaycan dili'];
    }
    return Array.from(new Set(list));
  }, [currentUser]);

  // Extract required skills from vacancy
  const requiredSkills: string[] = useMemo(() => {
    if (vacancy.skills && vacancy.skills.length > 0) return vacancy.skills;
    if (vacancy.requirements && vacancy.requirements.length > 0) {
      // Pick first 5-6 requirements as skills
      return vacancy.requirements.slice(0, 6);
    }
    return ['Sahə üzrə biliklər', 'Təcrübə', 'Komandada işləmək', 'MS Excel'];
  }, [vacancy]);

  // Match analysis
  const matchedSkills = useMemo(() => {
    return requiredSkills.filter(req => 
      userSkills.some(usr => 
        req.toLowerCase().includes(usr.toLowerCase()) || 
        usr.toLowerCase().includes(req.toLowerCase())
      )
    );
  }, [requiredSkills, userSkills]);

  const missingSkills = useMemo(() => {
    return requiredSkills.filter(req => !matchedSkills.includes(req));
  }, [requiredSkills, matchedSkills]);

  const matchPercent = useMemo(() => {
    if (requiredSkills.length === 0) return 80;
    const base = Math.round((matchedSkills.length / requiredSkills.length) * 100);
    // Smooth boundary
    return Math.max(25, Math.min(95, base === 0 ? 35 : base));
  }, [matchedSkills, requiredSkills]);

  // Projected salary boost
  const projectedBoost = missingSkills.length > 0 ? `+${missingSkills.length * 8 + 10}%` : '+15%';

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scale-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/90 flex items-center justify-center font-bold text-white shrink-0 border border-blue-400/30 shadow-xs">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Bacarıq Çatışmazlığı & Karyera İntellekti</h3>
                <p className="text-xs text-blue-200 mt-0.5 line-clamp-1">
                  «{vacancy.title}» • {vacancy.companyName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4 text-xs">
            {/* Top Score Banner */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-4 rounded-xl border border-blue-200/80 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">Profil Uyğunluq İndeksi</span>
                <div className="text-2xl font-black text-blue-950 flex items-center gap-2">
                  <span>{matchPercent}% Uyğundur</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                    matchPercent >= 70 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {matchPercent >= 70 ? 'Güclü Namizəd' : 'İnkişaf Potensialı'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Tələb olunan {requiredSkills.length} əsas bacarıqdan {matchedSkills.length}-nə birbaşa sahibsiniz.
                </p>
              </div>

              {/* Potential salary boost pill */}
              <div className="text-right shrink-0 bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block">Potensial Gəlir Artımı:</span>
                <span className="text-lg font-black text-emerald-600 flex items-center justify-end gap-0.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>{projectedBoost}</span>
                </span>
                <span className="text-[10px] text-slate-400">bacarıqları mənimsədikdə</span>
              </div>
            </div>

            {/* Matched vs Missing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Matched skills */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sahib Olduğunuz Bacarıqlar ({matchedSkills.length})</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.length > 0 ? (
                    matchedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                      >
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">Profilinizdə qeyd edilmiş bacarıq aşkar edilmədi.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills Gap */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Çatışmayan Kritik Bacarıqlar ({missingSkills.length})</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.length > 0 ? (
                    missingSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold"
                      >
                        + {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-700 text-xs font-semibold">Təbrik edirik! Bütün tələblərə tam cavab verirsiniz.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Practical Career Recommendation & Learning pathway */}
            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 space-y-2">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-700" />
                <span>Ekspert Karyera Tövsiyəsi:</span>
              </span>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                {missingSkills.length > 0 
                  ? `Bu vakansiyada şirkət əsasən «${missingSkills.slice(0, 2).join(', ')}» təcrübəsinə üstünlük verir. CV-nizdə bu istiqamətdəki layihələri, sınaq işlərini və ya sertifikatları qabartmağınız tövsiyə edilir.`
                  : 'Siz bu vəzifə üçün ideal namizədsiniz! Müsahibədə liderlik və layihə təcrübənizi vurğulayaraq bazar tavanında maaş tələb edə bilərsiniz.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Bağla
              </button>

              {onApply && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onApply(vacancy);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Bu Vakansiyaya Müraciət Et</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
