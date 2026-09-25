import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateSeoulMinimal: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-seoul-minimal" className="bg-[#ffffff] text-slate-800 font-sans max-w-[800px] w-full mx-auto min-h-[1100px] text-left p-8 sm:p-12 border border-slate-200 shadow-sm flex flex-col space-y-6">
      {/* Seoul Minimal Clean Top Header */}
      <div className="flex flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex-1 min-w-0 space-y-1">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900 break-words">
            {personalInfo.fullName || 'Ad Soyad'}
          </h1>
          <p className="text-sm sm:text-base font-normal text-indigo-600 tracking-wide break-words">
            {personalInfo.jobTitle || 'UI/UX Designer / Product Specialist'}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 pt-2 font-light">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>· {personalInfo.phone}</span>}
            {personalInfo.address && <span>· {personalInfo.address}</span>}
            {personalInfo.linkedin && <span>· {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>}
            {personalInfo.portfolio && <span>· {personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>}
          </div>
        </div>

        {displayPhoto && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.fullName || 'Namizəd'}
            className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border border-slate-200 shadow-xs shrink-0`}
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {terms.summary}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-light">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <div className="space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {terms.experience}
          </div>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="grid grid-cols-12 gap-4 items-baseline">
                <div className="col-span-3 text-[11px] font-light text-slate-400">
                  {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                </div>
                <div className="col-span-9 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-medium text-slate-900">{exp.position}</span>
                    <span className="text-[11px] text-slate-500 font-light">{exp.company}</span>
                  </div>
                  {exp.description && (
                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line font-light">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {terms.education}
          </div>
          <div className="space-y-2.5">
            {education.map((edu) => (
              <div key={edu.id} className="grid grid-cols-12 gap-4 items-baseline">
                <div className="col-span-3 text-[11px] font-light text-slate-400">
                  {edu.startDate} – {edu.endDate}
                </div>
                <div className="col-span-9">
                  <div className="text-xs font-medium text-slate-900">{edu.institution}</div>
                  <div className="text-[11px] text-slate-500 font-light">{edu.degree} · {edu.fieldOfStudy}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Languages */}
      <div className="grid grid-cols-2 gap-6 pt-2">
        {skills && skills.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {terms.skills}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s.id} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-light">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {terms.languages}
            </div>
            <div className="space-y-1 text-[11px] font-light">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="text-slate-800">{l.language}</span>
                  <span className="text-slate-400">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
