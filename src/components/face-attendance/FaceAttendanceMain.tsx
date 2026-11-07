import React, { useState } from 'react';
import { Camera, LayoutDashboard, Smartphone, ShieldCheck } from 'lucide-react';
import { FaceAttendancePWA } from './FaceAttendancePWA';
import { AttendanceAdminDashboard } from './AttendanceAdminDashboard';

interface FaceAttendanceMainProps {
  initialMode?: 'admin' | 'pwa';
  onClose?: () => void;
  supervisorName?: string;
  supervisorId?: string;
}

export const FaceAttendanceMain: React.FC<FaceAttendanceMainProps> = ({
  initialMode = 'admin',
  onClose,
  supervisorName = 'Rəhbər / Növbə Müdiri',
  supervisorId = 'sup-current'
}) => {
  const [currentView, setCurrentView] = useState<'admin' | 'pwa'>(initialMode);

  return (
    <div className="space-y-4">
      {/* MODE TOGGLE SWITCH (HR / ADMIN vs PWA SCANNER) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">Biometrik Üz Tanıma ilə Davamiyyət</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                AR Əmək Məcəlləsi & Tabel
              </span>
            </div>
            <span className="text-xs text-slate-500 block">
              Kamera ilə canlı giriş-çıxış qeydiyyatı, Liveness yoxlaması, Geofence və rəsmi Tabel hesabatı
            </span>
          </div>
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrentView('admin')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentView === 'admin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>HR & Tabel Paneli</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('pwa')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentView === 'pwa'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera / Üz Tanıma (PWA)</span>
          </button>
        </div>
      </div>

      {/* VIEW RENDER */}
      {currentView === 'admin' ? (
        <AttendanceAdminDashboard
          onOpenPWAScanner={() => setCurrentView('pwa')}
        />
      ) : (
        <div className="max-w-2xl mx-auto">
          <FaceAttendancePWA
            onClose={() => setCurrentView('admin')}
            supervisorName={supervisorName}
            supervisorId={supervisorId}
            onNavigateToAdmin={() => setCurrentView('admin')}
          />
        </div>
      )}
    </div>
  );
};
