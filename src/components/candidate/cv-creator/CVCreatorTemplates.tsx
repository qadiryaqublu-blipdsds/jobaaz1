import React, { useState } from 'react';
import { CVTemplateType } from '../../../types';
import { CV_TEMPLATES, CVTemplateMeta } from '../../cv-templates/templateRegistry';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  Filter, 
  Layers, 
  Palette 
} from 'lucide-react';

interface CVCreatorTemplatesProps {
  selectedTemplate: CVTemplateType;
  setSelectedTemplate: (template: CVTemplateType) => void;
  showPhoto: boolean;
  setShowPhoto: (show: boolean) => void;
  onApplyAndEdit: () => void;
  onApplyAndPreview: () => void;
}

export const CVCreatorTemplates: React.FC<CVCreatorTemplatesProps> = ({
  selectedTemplate,
  setSelectedTemplate,
  showPhoto,
  setShowPhoto,
  onApplyAndEdit,
  onApplyAndPreview
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('Hamısı');

  const categories = [
    'Hamısı',
    'Sadə',
    'Rəhbər',
    'Xidmət & Texniki',
    'Modern',
    'Klassik',
    'ATS',
    'Kreativ',
    'Texnoloji',
    'Akademik'
  ];

  const filteredTemplates = CV_TEMPLATES.filter((tmpl) => {
    if (categoryFilter === 'Hamısı') return true;
    return tmpl.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Filters */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-600" />
              CV Şablonları & Dizayn Kolleksiyası
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hər bir şablon beynəlxalq HR standartlarına və ATS sistemlərinə tam uyğunlaşdırılıb. Məlumatlarınız itmədən şablonu dərhal dəyişə bilərsiniz.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs text-slate-500 font-medium">Foto Formatı:</span>
            <button
              type="button"
              onClick={() => setShowPhoto(!showPhoto)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showPhoto
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {showPhoto ? '📷 Şəkilli Dizayn' : '📄 Şəkilsiz (ATS / Anonim)'}
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.id;

          return (
            <div
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl.id)}
              className={`group relative rounded-2xl border-2 p-5 bg-white cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 ring-4 ring-emerald-500/10 shadow-md'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div>
                {/* Header & Meta */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: tmpl.colorTheme }}
                    />
                    <h3 className="font-bold text-sm text-slate-900 truncate">
                      {tmpl.name}
                    </h3>
                  </div>

                  {tmpl.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                      {tmpl.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {tmpl.description}
                </p>

                {/* Abstract Preview Wireframe */}
                <div className="relative aspect-4/3 rounded-xl bg-slate-50 border border-slate-200/90 p-3 overflow-hidden group-hover:bg-slate-100/60 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full shrink-0"
                        style={{ backgroundColor: tmpl.colorTheme }}
                      />
                      <div className="space-y-1 flex-1">
                        <div className="h-2 bg-slate-300 rounded w-1/2" />
                        <div className="h-1.5 bg-slate-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-0.5 bg-slate-200 w-full my-2" />
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-slate-300 rounded w-full" />
                      <div className="h-1.5 bg-slate-200 rounded w-4/5" />
                      <div className="h-1.5 bg-slate-200 rounded w-3/4" />
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 bg-emerald-900/15 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in-50">
                      <span className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Seçilib
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  {isSelected ? 'Cari aktiv şablon' : 'Kliklə seçin'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(tmpl.id);
                      onApplyAndEdit();
                    }}
                    className="font-bold text-slate-700 hover:text-emerald-700 transition-colors"
                  >
                    Redaktəyə keç
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(tmpl.id);
                      onApplyAndPreview();
                    }}
                    className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Önbaxış →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
