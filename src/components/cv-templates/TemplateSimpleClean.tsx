import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateSimpleClean: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-simple-clean" className="bg-white text-slate-900 p-8 sm:p-10 font-sans w-full max-w-[800px] mx-auto min-h-[1050px] text-left border border-slate-200">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-5 border-b border-slate-300 pb-5 mb-6">
        <div className="space-y-1 flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 break-words">
            {personalInfo.fullName || 'Ad Soyad'}
          </h1>
          <p className="text-base font-semibold text-slate-700 break-words">
            {personalInfo.jobTitle || 'Vəzifə'}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-2 font-medium break-all">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.address && <span>• {personalInfo.address}</span>}
            {personalInfo.linkedin && (
              <span>• {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
            )}
            {personalInfo.github && (
              <span>• {personalInfo.github.replace(/^https?:\/\//, '')}</span>
            )}
          </div>
        </div>

        {displayPhoto && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.fullName || 'Namizəd'}
            className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border border-slate-300 shadow-2xs shrink-0`}
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            {terms.summary}
          </h2>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line break-words">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-1">
            {terms.experience}
          </h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-row items-baseline justify-between gap-2 min-w-0">
                  <div className="text-sm font-bold text-slate-900 flex-1 min-w-0 break-words">
                    {exp.position} <span className="font-normal text-slate-600">— {exp.company}</span>
                  </div>
                  <div className="text-xs text-slate-500 shrink-0 whitespace-nowrap">
                    {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                  </div>
                </div>
                {exp.location && <div className="text-xs text-slate-400 break-words">{exp.location}</div>}
                {exp.description && (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mt-1.5 pl-2 border-l-2 border-slate-200 break-words">
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
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-1">
            {terms.education}
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex flex-row items-baseline justify-between gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 break-words">{edu.degree}</div>
                  <div className="text-xs text-slate-600 break-words">{edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</div>
                </div>
                <div className="text-xs text-slate-500 shrink-0 whitespace-nowrap">
                  {edu.startDate} – {edu.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Languages Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">
              {terms.skills}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s.id} className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-medium">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">
              {terms.languages}
            </h2>
            <div className="space-y-1 text-xs text-slate-700">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between">
                  <span className="font-semibold text-slate-800">{(lang as any).language || (lang as any).name}</span>
                  <span className="text-slate-500">{(lang as any).proficiency || (lang as any).level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">
            {terms.projects}
          </h2>
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id}>
                <span className="text-xs font-bold text-slate-900">{p.title}</span>
                {p.description && <p className="text-xs text-slate-600 mt-0.5">{p.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates && certificates.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">
            {terms.certificates}
          </h2>
          <div className="space-y-1.5 text-xs text-slate-700">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <span className="font-semibold">{cert.name} — <span className="font-normal text-slate-500">{cert.issuer}</span></span>
                <span className="text-slate-500">{cert.issueDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
