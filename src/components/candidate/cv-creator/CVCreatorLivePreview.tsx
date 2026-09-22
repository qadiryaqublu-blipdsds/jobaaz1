import React, { useRef, useState, useEffect } from 'react';
import { CVData, CVTemplateType } from '../../../types';
import { CVRenderer } from '../../cv-templates/CVRenderer';
import { CV_TEMPLATES, CVTemplateMeta } from '../../cv-templates/templateRegistry';
import { 
  Eye, 
  FileDown, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  Layers, 
  ChevronRight,
  Loader2
} from 'lucide-react';

interface CVCreatorLivePreviewProps {
  cvData: CVData;
  selectedTemplate: CVTemplateType;
  setSelectedTemplate: (template: CVTemplateType) => void;
  showPhoto: boolean;
  setShowPhoto: (show: boolean) => void;
  onGoToFullPreview: () => void;
  onGoToTemplates: () => void;
  onDownloadPDF: () => void;
  isDownloadingPdf: boolean;
}

export const CVCreatorLivePreview: React.FC<CVCreatorLivePreviewProps> = ({
  cvData,
  selectedTemplate,
  setSelectedTemplate,
  showPhoto,
  setShowPhoto,
  onGoToFullPreview,
  onGoToTemplates,
  onDownloadPDF,
  isDownloadingPdf
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomScale, setZoomScale] = useState<number>(0.58);
  const [zoomMode, setZoomMode] = useState<'fit' | '100%'>('fit');

  const currentTemplate = CV_TEMPLATES.find((t) => t.id === selectedTemplate) || CV_TEMPLATES[0];

  // Auto-calculate scale to fit container width smoothly
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || zoomMode !== 'fit') return;
      const width = containerRef.current.clientWidth;
      // Standard A4 document width is ~800px in the renderer
      const calculatedScale = Math.min(Math.max((width - 32) / 800, 0.42), 0.72);
      setZoomScale(calculatedScale);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [zoomMode]);

  return (
    <div className="space-y-3 sticky top-20">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-2">
        {/* Template Quick Switcher */}
        <div className="flex items-center gap-2 min-w-0">
          <div 
            className="w-3 h-3 rounded-full shrink-0" 
            style={{ backgroundColor: currentTemplate.colorTheme }} 
          />
          <button
            type="button"
            onClick={onGoToTemplates}
            className="group flex items-center gap-1 text-left truncate hover:opacity-80 transition-opacity"
            title="Şablonu dəyişmək üçün klikləyin"
          >
            <span className="text-xs font-bold text-slate-800 truncate">
              {currentTemplate.name}
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold group-hover:bg-emerald-100 transition-colors shrink-0">
              Dəyiş
            </span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <label className="flex items-center gap-1 cursor-pointer select-none text-[11px] text-slate-600 mr-1">
            <input
              type="checkbox"
              checked={showPhoto}
              onChange={(e) => setShowPhoto(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-emerald-600"
            />
            <span>Şəkil</span>
          </label>

          <button
            type="button"
            onClick={onGoToFullPreview}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
            title="Tam ekran baxışına keç"
          >
            <Maximize2 className="w-3 h-3 text-slate-500" />
            <span className="hidden xl:inline">Tam Baxış</span>
          </button>
        </div>
      </div>

      {/* Live Scaled A4 Document Canvas */}
      <div 
        ref={containerRef}
        className="bg-slate-200/90 rounded-2xl border border-slate-300/80 p-3 sm:p-4 overflow-y-auto max-h-[calc(100vh-140px)] shadow-inner flex flex-col items-center"
      >
        <div 
          style={{
            width: 800 * (zoomMode === '100%' ? 1 : zoomScale),
            height: 'auto',
            overflow: 'hidden'
          }}
          className="transition-all rounded-xl shadow-xl border border-slate-300 bg-white"
        >
          <div 
            style={{
              width: 800,
              transform: `scale(${zoomMode === '100%' ? 1 : zoomScale})`,
              transformOrigin: 'top left'
            }}
            className="bg-white"
          >
            <CVRenderer
              data={cvData}
              template={selectedTemplate}
              showPhoto={showPhoto}
              id="cv-live-creator-preview"
            />
          </div>
        </div>

        <div className="w-full text-center pt-3 text-[11px] font-medium text-slate-500 flex items-center justify-center gap-2">
          <span>Canlı A4 Sənəd Önbaxışı</span>
          <span>•</span>
          <button 
            onClick={onGoToFullPreview}
            className="text-emerald-700 hover:underline font-bold"
          >
            Tam ekranda aç →
          </button>
        </div>
      </div>
    </div>
  );
};
