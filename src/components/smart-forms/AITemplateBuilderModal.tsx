import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Plus,
  Trash2,
  Check,
  FileText,
  Loader2,
  Wand2,
  HelpCircle,
  Eye,
  Settings
} from 'lucide-react';
import { FormTemplate, FormFieldDefinition } from '../../types/smartForms';
import { generateTemplateFromNaturalPrompt } from './aiSmartFormExtractors';
import { saveCustomTemplate } from './smartFormsService';

export interface AITemplateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated: (template: FormTemplate) => void;
  organizationId?: string;
  organizationName?: string;
}

export const AITemplateBuilderModal: React.FC<AITemplateBuilderModalProps> = ({
  isOpen,
  onClose,
  onTemplateCreated,
  organizationId = 'company-user',
  organizationName = 'Müəssisə',
}) => {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<FormTemplate | null>(null);

  const samplePrompts = [
    'Yeni işçi üçün şəxsi məlumat forması hazırla. Ad, soyad, ata adı, FİN, əlaqə nömrəsi, yaşayış ünvanı, vəzifə, şöbə, işə başlama tarixi və bank məlumatları üçün sahələr əlavə et. Məcburi sahələri müəyyənləşdir və sonda əməkdaşın və HR menecerinin imza bölməsini yerləşdir.',
    'Növbəti əsas məzuniyyət ərizəsi şablonu yarat. Başlama tarixi, gün sayı, əvəz edən əməkdaş və əməkdaş imzası sahələri olsun.',
    'İT avadanlıqlarının təhvil-təslim aktı şablonu qur. Noutbuk modeli, seriya nömrəsi, texniki vəziyyəti və iki tərəfli imza bloku əlavə et.',
    'Maddi məsuliyyət müqaviləsi və öhdəlik forması hazırla. Əməkdaşın vəzifəsi və imza sahəsi olsun.'
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateTemplateFromNaturalPrompt(
        textToUse,
        organizationId,
        organizationName
      );
      setGeneratedTemplate(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndPublish = () => {
    if (!generatedTemplate) return;
    const saved = saveCustomTemplate(generatedTemplate);
    onTemplateCreated(saved);
    onClose();
  };

  const handleAddField = () => {
    if (!generatedTemplate) return;
    const newField: FormFieldDefinition = {
      id: `f-${Date.now()}`,
      name: `field_${Date.now()}`,
      label: 'Yeni Sahə',
      type: 'text',
      required: false,
      order: generatedTemplate.fields.length + 1
    };
    setGeneratedTemplate({
      ...generatedTemplate,
      fields: [...generatedTemplate.fields, newField]
    });
  };

  const handleRemoveField = (id: string) => {
    if (!generatedTemplate) return;
    setGeneratedTemplate({
      ...generatedTemplate,
      fields: generatedTemplate.fields.filter(f => f.id !== id)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                AI Əsaslı Forma və Şablon Konstruktoru
              </h2>
              <p className="text-xs text-slate-300">
                Adi dildə tapşırıq verin — AI sənəd strukturunu və sahələri dərhal qursun.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {!generatedTemplate ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Şablon üçün AI-yə təlimatınızı yazın:
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Məs: Yeni işçi üçün şəxsi məlumat forması hazırla. Ad, soyad, ata adı, FİN, əlaqə nömrəsi, yaşayış ünvanı, vəzifə, şöbə, işə başlama tarixi və bank məlumatları üçün sahələr əlavə et..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm font-medium leading-relaxed"
                />
              </div>

              {/* Sample Prompts */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Hazır nümunə təlimatlar (Klikləyin):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(p);
                        handleGenerate(p);
                      }}
                      className="text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-xs text-slate-700 font-medium transition-all cursor-pointer group"
                    >
                      <span className="line-clamp-2">{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!prompt.trim() || isGenerating}
                  onClick={() => handleGenerate()}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                    prompt.trim() && !isGenerating
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-98'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI Şablonu Tərtib Edir...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Şablonu Generasiya Et</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Generated Template Review & Field Customization */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Şablon Uğurla Yaradıldı: {generatedTemplate.title}</span>
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {generatedTemplate.fields.length} forma sahəsi və təsdiq iş axını təyin edildi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneratedTemplate(null)}
                  className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  Yenidən Yaz
                </button>
              </div>

              {/* Title & Description Edit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Şablonun Başlığı:</label>
                  <input
                    type="text"
                    value={generatedTemplate.title}
                    onChange={(e) => setGeneratedTemplate({ ...generatedTemplate, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sənədin Növü:</label>
                  <input
                    type="text"
                    value={generatedTemplate.documentLayout.documentTitle}
                    onChange={(e) =>
                      setGeneratedTemplate({
                        ...generatedTemplate,
                        documentLayout: { ...generatedTemplate.documentLayout, documentTitle: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Fields List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Forma Sahələri ({generatedTemplate.fields.length}):
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Sahə Əlavə Et</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {generatedTemplate.fields.map((f, idx) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={f.label}
                          onChange={(e) => {
                            const updated = [...generatedTemplate.fields];
                            updated[idx].label = e.target.value;
                            setGeneratedTemplate({ ...generatedTemplate, fields: updated });
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                        />
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                          {f.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={f.required}
                            onChange={(e) => {
                              const updated = [...generatedTemplate.fields];
                              updated[idx].required = e.target.checked;
                              setGeneratedTemplate({ ...generatedTemplate, fields: updated });
                            }}
                            className="rounded text-blue-600"
                          />
                          <span className="text-[10px] text-slate-600">Məcburi</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveField(f.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Text Template */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sənədin Əsas Mətn Şablonu:
                </label>
                <textarea
                  rows={3}
                  value={generatedTemplate.documentLayout.bodyTemplate}
                  onChange={(e) =>
                    setGeneratedTemplate({
                      ...generatedTemplate,
                      documentLayout: { ...generatedTemplate.documentLayout, bodyTemplate: e.target.value }
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  Ləğv Et
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPublish}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>Şablonu Təsdiqlə və Kitabxanaya Yadda Saxla</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
