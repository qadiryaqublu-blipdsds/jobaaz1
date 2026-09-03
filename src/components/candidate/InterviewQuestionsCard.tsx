import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb, MessageSquare } from 'lucide-react';
import { InterviewQuestionItem } from '../../types';

interface InterviewQuestionsCardProps {
  questions?: InterviewQuestionItem[];
}

export const InterviewQuestionsCard: React.FC<InterviewQuestionsCardProps> = ({
  questions = [],
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Simulyasiya
          </span>
          <h3 className="text-lg font-bold text-slate-800">
            CV Əsasında Gözlənilən Müsahibə Sualları
          </h3>
        </div>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <MessageSquare className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-3">
        {questions.length > 0 ? (
          questions.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                          {item.category || 'Müsahibə Sualı'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {item.question}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400 mt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-slate-100 space-y-3 text-xs">
                    {/* Why asked */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        Rekruterin məqsədi nədir?
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        {item.whyAsked}
                      </p>
                    </div>

                    {/* Sample Answer Tips */}
                    <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-200/80 space-y-1">
                      <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                        Cavab verərkən diqqət yetirilməli məqamlar:
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        {item.sampleAnswerTips}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
            Müsahibə sualları hazırlanır və ya xüsusi sual aşkar edilmədi.
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewQuestionsCard;
