import React from 'react';
import { Application, ApplicationStatus, JobOffer, User } from '../../types';
import { 
  CheckCircle2, 
  Building2, 
  Calendar, 
  MessageSquare, 
  Eye, 
  Briefcase,
  Award,
  ChevronRight,
  LogIn,
  UserPlus,
  Sparkles
} from 'lucide-react';
import { JobiaSectionFooter } from '../JobiaSectionFooter';

interface MyApplicationsProps {
  applications: Application[];
  offers?: JobOffer[];
  onOpenCVModal: (app: Application) => void;
  onExploreJobs: () => void;
  onViewOffer?: (offer: JobOffer) => void;
  currentUser?: User | null;
  onOpenAuthModal?: (mode?: 'login' | 'register', role?: 'candidate' | 'business') => void;
}

export const MyApplications: React.FC<MyApplicationsProps> = ({
  applications,
  offers = [],
  onOpenCVModal,
  onExploreJobs,
  onViewOffer,
  currentUser,
  onOpenAuthModal,
}) => {
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Müsahibəyə dəvət':
        return 'bg-purple-100 text-purple-800 border-purple-200 font-semibold';
      case 'Təklif verildi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      case 'Qəbul edildi':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      case 'Baxıldı':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'İmtina edildi':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Müraciət edildi':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <span>Mənim Vakansiya Müraciətlərim ({applications.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser 
              ? 'Göndərdiyiniz CV-lər, şirkətlərin baxış statusları, müsahibə bildirişləri və rəsmi iş təklifləri.'
              : 'Yalnız sizin bu cihazdan göndərdiyiniz müraciətlər burada əks olunur.'}
          </p>
        </div>

        <button
          onClick={onExploreJobs}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Yeni Vakansiyalar Axtar</span>
        </button>
      </div>

      {/* Guest Notice if unauthenticated but has local guest applications */}
      {!currentUser && applications.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Bu müraciətlər cari cihazınızda qeydiyyatsız göndərilib. Məlumatları itirməmək və işəgötürənlərin cavablarını bütün cihazlardan izləmək üçün daxil olun.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAuthModal?.('login', 'candidate')}
              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Daxil Ol
            </button>
            <button
              onClick={() => onOpenAuthModal?.('register', 'candidate')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
            >
              Qeydiyyat
            </button>
          </div>
        </div>
      )}

      {/* Empty State: Differentiated for Unauthenticated Guest vs Authenticated User */}
      {applications.length === 0 ? (
        !currentUser ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-sm max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-100 shadow-2xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">Mənim Müraciətlərim Bölməsi</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                Göndərdiyiniz CV sənədlərini, şirkətlərin baxış statusunu, müsahibə dəvətlərini və rəsmi elektron iş təkliflərini izləmək üçün daxil olun və ya qeydiyyatdan keçin.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => onOpenAuthModal?.('login', 'candidate')}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Daxil Ol</span>
              </button>
              <button
                onClick={() => onOpenAuthModal?.('register', 'candidate')}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Yeni Qeydiyyat</span>
              </button>
              <button
                onClick={onExploreJobs}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Vakansiyalara Bax
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Hələ heç bir vakansiyaya müraciət etməmisiniz</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Vakansiyalar bölməsinə keçid edərək sizə uyğun iş elanlarına 1 kliklə CV-nizi göndərə bilərsiniz.
            </p>
            <button
              onClick={onExploreJobs}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors inline-block shadow-sm cursor-pointer"
            >
              Vakansiyalara Bax
            </button>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const appOffer = offers.find(
              (o) => o.applicationId === app.id || o.candidateEmail === app.candidateEmail
            );

            return (
              <div
                key={app.id}
                className={`bg-white p-5 rounded-xl border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  appOffer ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={app.companyLogo}
                    alt={app.companyName}
                    className="w-11 h-11 rounded-lg object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{app.vacancyTitle}</h3>
                      {appOffer && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>RƏSMİ İŞ TƏKLİFİ ({appOffer.status})</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {app.companyName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Müraciət tarixi: {app.appliedDate}
                      </span>
                    </div>

                    {/* Recruiter feedback notes if any */}
                    {app.recruiterNotes && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 mt-2 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-slate-900">İşəgötürənin Qeydi:</span>
                          <span className="text-[11px] text-slate-600">{app.recruiterNotes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Details */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>

                  <div className="flex items-center gap-2">
                    {appOffer && onViewOffer && (
                      <button
                        onClick={() => onViewOffer(appOffer)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Təklifə Bax və Cavabla</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenCVModal(app)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Göndərilən CV</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Animated Section Footer with Job Intelligence & Automation */}
      <JobiaSectionFooter 
        extraTagline="Müraciət etdiyiniz vakansiyaların statusunu canlı izləyin və rəsmi təklifləri qəbul edin"
        showBackToTop={true}
      />
    </div>
  );
};
