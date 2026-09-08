import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateTokyoMinimal: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-tokyo-minimal" className="bg-[#fafafa] text-slate-800 p-8 sm:p-12 font-sans max-w-[800px] w-full mx-auto min-h-[1100px] text-left border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1.5 flex-1">
          <div className="text-[10px] tracking-[0.25em] uppercase text-slate-400 font-bold">
            CURRICULUM VITAE
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
            {personalInfo.fullName || 'Ad Soyad'}
          </h1>
          <p className="text-sm font-medium text-slate-600 tracking-wide">
            {personalInfo.jobTitle || 'Product Strategist'}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-2 font-light">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>/ {personalInfo.phone}</span>}
            {personalInfo.address && <span>/ {personalInfo.address}</span>}
            {personalInfo.linkedin && (
              <span>/ {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
            )}
            {personalInfo.portfolio && (
              <span>/ {personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
            )}
          </div>
        </div>

        {displayPhoto && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.fullName || 'Namizəd'}
            className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border border-slate-300 shadow-xs filter grayscale hover:grayscale-0 transition-all`}
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      <div className="space-y-6 pt-6">
        {/* Summary */}
        {personalInfo.summary && (
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold mb-2">
              {terms.summary}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold mb-4 border-b border-slate-200 pb-1">
              {terms.experience}
            </div>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="group">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="text-sm font-medium text-slate-900">
                      {exp.position} <span className="text-slate-400 font-light">|</span> <span className="text-slate-600 font-normal">{exp.company}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-light">
                      {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                    </div>
                  </div>
                  {exp.location && <div className="text-[11px] text-slate-400 font-light">{exp.location}</div>}
                  {exp.description && (
                    <p className="text-xs text-slate-600 font-light leading-relaxed whitespace-pre-line mt-1.5">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold mb-3 border-b border-slate-200 pb-1">
              {terms.education}
            </div>
            <div className="space-y-2.5">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-medium text-slate-900">{edu.degree}</span>
                    <span className="text-slate-500 font-light"> — {edu.institution} {edu.fieldOfStudy ? `(${edu.fieldOfStudy})` : ''}</span>
                  </div>
                  <span className="text-slate-400 font-light">{edu.startDate} – {edu.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Languages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
          {skills && skills.length > 0 && (
            <div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold mb-2">
                {terms.skills}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((sk) => (
                  <span
                    key={sk.id}
                    className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-xs font-light rounded-xs"
                  >
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {languages && languages.length > 0 && (
            <div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold mb-2">
                {terms.languages}
              </div>
              <div className="space-y-1 text-xs font-light">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between border-b border-slate-100 pb-0.5">
                    <span className="text-slate-900">{l.language}</span>
                    <span className="text-slate-400">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Projects & Certs */}
        {(projects?.length || certificates?.length) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
            {projects && projects.length > 0 && (
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold mb-2">
                  {terms.projects}
                </div>
                <div className="space-y-2 text-xs">
                  {projects.map((p) => (
                    <div key={p.id}>
                      <div className="font-medium text-slate-800">{p.title}</div>
                      {p.description && <div className="text-slate-500 font-light mt-0.5">{p.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certificates && certificates.length > 0 && (
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold mb-2">
                  {terms.certificates}
                </div>
                <div className="space-y-2 text-xs">
                  {certificates.map((c) => (
                    <div key={c.id}>
                      <div className="font-medium text-slate-800">{c.name}</div>
                      <div className="text-slate-400 font-light text-[11px]">{c.issuer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
