import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileDown, 
  CheckCircle2, 
  X, 
  Loader2, 
  Sparkles,
  ArrowDownToLine
} from 'lucide-react';

export interface PDFDownloadFeedbackProps {
  isDownloading: boolean;
  progressPercent: number;
  progressStatus: string;
  showToast: boolean;
  fileName?: string;
  onDismissToast?: () => void;
  toastDuration?: number; // default 4000ms
}

export const PDFDownloadProgressToast: React.FC<PDFDownloadFeedbackProps> = ({
  isDownloading,
  progressPercent,
  progressStatus,
  showToast,
  fileName,
  onDismissToast,
  toastDuration = 4000
}) => {
  // Auto-dismiss toast after duration
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => {
      onDismissToast?.();
    }, toastDuration);
    return () => clearTimeout(timer);
  }, [showToast, toastDuration, onDismissToast]);

  const displayFileName = fileName 
    ? (fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`)
    : 'CV_jobia_az.pdf';

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[9999] pointer-events-none flex flex-col items-end gap-3 max-w-[calc(100vw-32px)] sm:max-w-md w-full">
      <AnimatePresence mode="wait">
        {/* 1. ACTIVE DOWNLOADING PROGRESS CARD */}
        {isDownloading && (
          <motion.div
            key="pdf-download-progress-bar"
            id="pdf-download-progress-bar"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="pointer-events-auto w-full bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-700/80 ring-1 ring-white/10"
          >
            {/* Header: Icon + Title + Percentage */}
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <ArrowDownToLine className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    PDF formatında hazırlanır...
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-[240px]">
                    {displayFileName}
                  </p>
                </div>
              </div>

              {/* Numerical Percentage */}
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
                <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                <span className="text-xs font-black text-emerald-400 tabular-nums">
                  {Math.max(5, Math.min(100, Math.round(progressPercent)))}%
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div 
                className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/60 relative shadow-inner"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 relative"
                  style={{ width: `${Math.max(6, Math.min(100, progressPercent))}%` }}
                  transition={{ ease: 'easeOut', duration: 0.25 }}
                >
                  {/* Subtle animated light highlight/shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
                </motion.div>
              </div>

              {/* Real-time status text */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate pr-2">
                  {progressStatus || 'A4 sənəd tərtib edilir...'}
                </span>
                <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                  {progressPercent >= 95 ? 'Yekunlaşır' : 'Zəhmət olmasa gözləyin'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. SUCCESS TOAST NOTIFICATION WITH ANIMATION */}
        {showToast && !isDownloading && (
          <motion.div
            key="pdf-download-success-toast"
            id="pdf-download-success-toast"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ type: 'spring', damping: 24, stiffness: 350 }}
            className="pointer-events-auto w-full bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-emerald-500/40 ring-1 ring-emerald-500/20 overflow-hidden relative"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left checkmark badge */}
              <div className="flex items-start gap-3 min-w-0">
                <motion.div 
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                  className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </motion.div>

                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      CV Uğurla Yükləndi!
                    </h4>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 line-clamp-1 break-all">
                    <span className="font-semibold text-emerald-400">{displayFileName}</span> kompüterinizə / cihazınıza endirildi.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <span>A4 Beynəlxalq format • Çapa və iş müraciətinə hazır</span>
                  </p>
                </div>
              </div>

              {/* Close button */}
              {onDismissToast && (
                <button
                  type="button"
                  onClick={onDismissToast}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Bağla"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Animated auto-dismiss duration line at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: toastDuration / 1000, ease: 'linear' }}
                className="h-full bg-emerald-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
