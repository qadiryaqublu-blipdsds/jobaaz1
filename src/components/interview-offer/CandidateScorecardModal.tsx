import React, { useState } from 'react';
import { Application } from '../../types';
import { Star, X, Check, ShieldCheck, Award, MessageSquare, UserCheck, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { ModalPortal } from '../common/ModalPortal';

interface CandidateScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  onSaveScorecard: (scorecard: CandidateScorecardData) => void;
}

export interface CandidateScorecardData {
  applicationId: string;
  technicalRating: number;
  culturalRating: number;
  communicationRating: number;
  recommendation: 'HIRE' | 'HOLD' | 'REJECT';
  notes: string;
  reviewerName: string;
  updatedAt: string;
}

export const CandidateScorecardModal: React.FC<CandidateScorecardModalProps> = ({
  isOpen,
  onClose,
  application,
  onSaveScorecard,
}) => {
  const [techRating, setTechRating] = useState<number>(4);
  const [cultureRating, setCultureRating] = useState<number>(4);
  const [commRating, setCommRating] = useState<number>(4);
  const [recommendation, setRecommendation] = useState<'HIRE' | 'HOLD' | 'REJECT'>('HIRE');
  const [notes, setNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('Rekruter / Texniki Lider');

  if (!isOpen) return null;

  const renderStars = (currentVal: number, setVal: (v: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setVal(star)}
            className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
          >
            <Star
              className={`w-5 h-5 ${
                star <= currentVal
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-bold text-slate-700 ml-1.5">{currentVal} / 5</span>
      </div>
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveScorecard({
      applicationId: application.id,
      technicalRating: techRating,
      culturalRating: cultureRating,
      communicationRating: commRating,
      recommendation,
      notes,
      reviewerName,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scale-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shrink-0 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Komanda Daxili Qiymətləndirmə (Scorecard)</h3>
                <p className="text-xs text-purple-200 mt-0.5 line-clamp-1">
                  {application.candidateName} • {application.vacancyTitle}
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

          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs">
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Bu rəylər və qiymətləndirmə yalnız şirkətinizin komandasına məxsusdur; namizəd görmür.</span>
            </div>

            {/* Ratings */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Texniki Səriştə & Bacarıqlar</span>
                  <span className="text-[10px] text-slate-500">Praktiki tapşırıq və bilik səviyyəsi</span>
                </div>
                {renderStars(techRating, setTechRating)}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Komanda & Mədəniyyət Uyğunluğu</span>
                  <span className="text-[10px] text-slate-500">Dəyərlər, əməkdaşlıq və motivasiya</span>
                </div>
                {renderStars(cultureRating, setCultureRating)}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Ünsiyyət & Təqdimat Qabiliyyəti</span>
                  <span className="text-[10px] text-slate-500">Aydın fikir izahı və suallara cavab</span>
                </div>
                {renderStars(commRating, setCommRating)}
              </div>
            </div>

            {/* Hiring Decision Recommendation */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-xs">İşə Qəbul Tövsiyəniz (Final Rəy)</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRecommendation('HIRE')}
                  className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    recommendation === 'HIRE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  <span>Qəbul Edilsin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecommendation('HOLD')}
                  className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    recommendation === 'HOLD'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>Ehtiyatda Qalsın</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecommendation('REJECT')}
                  className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    recommendation === 'REJECT'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 text-rose-600" />
                  <span>Uyğun Deyil</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Daxili Qeydlər & İzah</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Namizədin güclü tərəfləri, müsahibədəki cavabları və ya çatışmayan cəhətləri..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Qiymətləndirən Şəxs / Vəzifə</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600 font-medium"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Ləğv et
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Rəyi Yadda Saxla</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};
