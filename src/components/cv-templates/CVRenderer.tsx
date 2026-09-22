import React from 'react';
import { CVData, CVTemplateType } from '../../types';
import { TemplateEmerald } from './TemplateEmerald';
import { TemplateClassic } from './TemplateClassic';
import { TemplateMinimal } from './TemplateMinimal';
import { TemplateTech } from './TemplateTech';
import { TemplateExecutive } from './TemplateExecutive';
import { TemplateCreative } from './TemplateCreative';
import { TemplateATSCompact } from './TemplateATSCompact';
import { TemplateNordic } from './TemplateNordic';
import { TemplateHorizon } from './TemplateHorizon';
import { TemplateAcademic } from './TemplateAcademic';
import { TemplateMetro } from './TemplateMetro';
import { TemplateSimpleClean } from './TemplateSimpleClean';
import { TemplateEntryStudent } from './TemplateEntryStudent';
import { TemplatePrestigeExecutive } from './TemplatePrestigeExecutive';
import { TemplatePracticalDirect } from './TemplatePracticalDirect';
import { TemplateZurichBanking } from './TemplateZurichBanking';
import { TemplateSiliconDev } from './TemplateSiliconDev';
import { TemplateBerlinCreative } from './TemplateBerlinCreative';
import { TemplateTokyoMinimal } from './TemplateTokyoMinimal';
import { TemplateCambridgeScholar } from './TemplateCambridgeScholar';
import { TemplateScandinavianEdge } from './TemplateScandinavianEdge';

interface CVRendererProps {
  data: CVData;
  template: CVTemplateType;
  id?: string;
  showPhoto?: boolean;
}

export const CVRenderer: React.FC<CVRendererProps> = ({ 
  data, 
  template,
  id = 'cv-document-export',
  showPhoto = true
}) => {
  // If user requested to hide photo, clone data without photoUrl
  const effectiveData: CVData = showPhoto
    ? data
    : {
        ...data,
        personalInfo: {
          ...data.personalInfo,
          photoUrl: undefined
        }
      };

  const renderTemplate = () => {
    switch (template) {
      case 'simple-clean':
        return <TemplateSimpleClean data={effectiveData} showPhoto={showPhoto} />;
      case 'entry-student':
        return <TemplateEntryStudent data={effectiveData} showPhoto={showPhoto} />;
      case 'prestige-executive':
        return <TemplatePrestigeExecutive data={effectiveData} showPhoto={showPhoto} />;
      case 'practical-direct':
        return <TemplatePracticalDirect data={effectiveData} showPhoto={showPhoto} />;
      case 'zurich-banking':
        return <TemplateZurichBanking data={effectiveData} showPhoto={showPhoto} />;
      case 'silicon-dev':
        return <TemplateSiliconDev data={effectiveData} showPhoto={showPhoto} />;
      case 'berlin-creative':
        return <TemplateBerlinCreative data={effectiveData} showPhoto={showPhoto} />;
      case 'tokyo-minimal':
        return <TemplateTokyoMinimal data={effectiveData} showPhoto={showPhoto} />;
      case 'cambridge-scholar':
        return <TemplateCambridgeScholar data={effectiveData} showPhoto={showPhoto} />;
      case 'scandinavian-edge':
        return <TemplateScandinavianEdge data={effectiveData} showPhoto={showPhoto} />;
      case 'classic-corporate':
        return <TemplateClassic data={effectiveData} />;
      case 'minimal-indigo':
        return <TemplateMinimal data={effectiveData} />;
      case 'slate-tech':
        return <TemplateTech data={effectiveData} />;
      case 'executive-burgundy':
        return <TemplateExecutive data={effectiveData} showPhoto={showPhoto} />;
      case 'creative-coral':
        return <TemplateCreative data={effectiveData} showPhoto={showPhoto} />;
      case 'compact-ats':
        return <TemplateATSCompact data={effectiveData} showPhoto={showPhoto} />;
      case 'nordic-teal':
        return <TemplateNordic data={effectiveData} showPhoto={showPhoto} />;
      case 'horizon-blue':
        return <TemplateHorizon data={effectiveData} showPhoto={showPhoto} />;
      case 'academic-serif':
        return <TemplateAcademic data={effectiveData} showPhoto={showPhoto} />;
      case 'metro-violet':
        return <TemplateMetro data={effectiveData} showPhoto={showPhoto} />;
      case 'modern-emerald':
      default:
        return <TemplateEmerald data={effectiveData} />;
    }
  };

  return (
    <div 
      id={id} 
      className="w-[800px] min-w-[800px] max-w-[800px] bg-white text-left box-border print:p-0 print:border-none print:shadow-none mx-auto overflow-hidden text-slate-900"
    >
      {renderTemplate()}
    </div>
  );
};

