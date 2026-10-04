import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle2, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('jobia_pwa_dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = isIosDevice && !/crios|fxios/.test(userAgent);
    if (isSafari && !(window.navigator as any).standalone) {
      setIsIOS(true);
      setShowPrompt(true);
    }

    // Chrome / Edge / Android PWA install listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('jobia_pwa_dismissed', String(Date.now()));
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slide-up">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-700/80 shadow-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Jobia Mobil Tətbiqi</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-semibold border border-blue-400/30">PWA</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isIOS 
                  ? "Safari-də 'Paylaş' ➔ 'Ana Ekrana Əlavə Et' düyməsinə basın."
                  : "Saytı tətbiq kimi ana ekrana quraşdırın, offline işləyin."}
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Bağla"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {isIOS ? (
            <div className="w-full bg-slate-800/80 p-2 rounded-xl text-center text-xs font-medium text-slate-300 border border-slate-700 flex items-center justify-center gap-2">
              <Share className="w-3.5 h-3.5 text-blue-400" />
              <span>Paylaş ➔ Ana ekrana əlavə et</span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Quraşdır (1 Kliklə)</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Sonra
          </button>
        </div>
      </div>
    </div>
  );
};
