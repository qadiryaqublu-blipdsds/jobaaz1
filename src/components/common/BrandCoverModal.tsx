import React, { useState } from 'react';
import { X, Download, Copy, Check, Eye, Share2, Sparkles, ShieldCheck } from 'lucide-react';

interface BrandCoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandCoverModal: React.FC<BrandCoverModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const coverUrl = '/og-cover.png';
  const svgUrl = '/og-cover.svg';

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const metaTagsSnippet = `<meta property="og:title" content="jobia.az - Müasir Vakansiya və Ağıllı Karyera Portalı" />
<meta property="og:description" content="jobia.az - Azərbaycanın müasir vakansiya, ağıllı CV və tam HR işə qəbul platforması." />
<meta property="og:image" content="https://jobia.az/og-cover.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://jobia.az/og-cover.png" />`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Rəsmi Üz Qabığı &amp; Sosial Paylaşım Kartı
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  1200 × 630 px
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                jobia.az platformasının OpenGraph və Twitter üçün rəsmi vizual üz qabığı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Main Visual Image Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Eye className="w-4 h-4 text-emerald-400" />
                Tam Ölçülü Vizual Önizləmə (Ultra HD 1200x630)
              </span>
              <span className="text-[11px] text-slate-500">
                Format: PNG (Lossless) &amp; Scalable Vector SVG
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner group">
              <img 
                src={coverUrl} 
                alt="jobia.az Üz Qabığı"
                className="w-full h-auto aspect-16/9 object-cover rounded-xl"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                <a
                  href={coverUrl}
                  download="jobia-og-cover.png"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG Yüklə (1200x630)
                </a>
                <a
                  href={svgUrl}
                  download="jobia-og-cover.svg"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  SVG Yüklə
                </a>
              </div>
            </div>
          </div>

          {/* WhatsApp / Telegram / LinkedIn Social Feed Simulation */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Sosial Şəbəkələrdə Paylaşım Görünüşü (WhatsApp / LinkedIn / Twitter)
            </h4>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 max-w-lg space-y-2">
              <div className="rounded-lg overflow-hidden border border-slate-800">
                <img src={coverUrl} alt="Snippet" className="w-full aspect-16/9 object-cover" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                  jobia.az
                </div>
                <div className="text-sm font-bold text-white line-clamp-1">
                  jobia.az - Müasir Vakansiya və Ağıllı Karyera Portalı
                </div>
                <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  Azərbaycanın müasir vakansiya, ağıllı CV, tam HR işə qəbul və Enterprise Recruiting Analytics platforması.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Copy Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                HTML OpenGraph Meta Kodları
              </label>
              <button
                onClick={() => handleCopy(metaTagsSnippet, 'meta')}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                {copiedType === 'meta' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Kopyalandı!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Kodu Kopyala
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-emerald-300/90 border border-slate-800 overflow-x-auto leading-relaxed">
              {metaTagsSnippet}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>index.html və serverdə aktivdir</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
