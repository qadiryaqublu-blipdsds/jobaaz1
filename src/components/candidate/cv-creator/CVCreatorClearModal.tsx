import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface CVCreatorClearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
}

export const CVCreatorClearModal: React.FC<CVCreatorClearModalProps> = ({
  isOpen,
  onClose,
  onConfirmClear
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">
            Bütün Məlumatları Təmizləmək İstəyirsiniz?
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Bu əməliyyat cari CV-dəki bütün şəxsi məlumatları, iş təcrübələrini, təhsil və bacarıqları sıfırlayacaq. Əməliyyat geri qaytarıla bilməz.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
          >
            Ləğv et
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmClear();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Bəli, Hamısını Sil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
