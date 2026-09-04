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
    <div id={id} className="w-full bg-white print:p-0">
      {renderTemplate()}
    </div>
  );
};
