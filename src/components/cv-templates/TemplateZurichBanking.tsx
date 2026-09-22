import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateZurichBanking: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-zurich-banking" className="bg-white text-slate-900 p-8 sm:p-10 font-serif max-w-[800px] w-full mx-auto min-h-[1100px] text-left border border-slate-200">
      {/* Swiss Corporate Header */}
      <div className="border-b-2 border-slate-900 pb-5 mb-6">
        <div className="flex flex-row items-center justify-between gap-5">
          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0a192f] uppercase break-words">
              {personalInfo.fullName || 'Ad Soyad'}
            </h1>
            <p className="text-base sm:text-lg font-bold text-amber-800 tracking-wide font-sans break-words">
              {personalInfo.jobTitle || 'Vəzifə'}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-2 font-sans font-medium">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>• {personalInfo.phone}</span>}
              {personalInfo.address && <span>• {personalInfo.address}</span>}
              {personalInfo.linkedin && (
                <span>• {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              )}
              {personalInfo.portfolio && (
                <span>• {personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
              )}
            </div>
          </div>

          {displayPhoto && (
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-slate-900 shadow-md shrink-0`}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6 font-sans">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#0a192f] border-b border-slate-300 pb-1 mb-2 font-serif">
            {terms.summary}
          </h2>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed text-justify whitespace-pre-line break-words">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#0a192f] border-b border-slate-300 pb-1 mb-3">
            {terms.experience}
          </h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="font-sans">
                <div className="flex flex-row items-baseline justify-between gap-2 min-w-0">
                  <div className="text-sm font-bold text-slate-950 font-serif flex-1 min-w-0 break-words">
                    {exp.position} <span className="font-normal font-sans text-amber-900">— {exp.company}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium shrink-0 whitespace-nowrap">
                    {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                  </div>
                </div>
                {exp.location && <div className="text-xs text-slate-400 font-sans italic break-words">{exp.location}</div>}
                {exp.description && (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mt-1.5 pl-3 border-l-2 border-amber-800/40 font-sans break-words">
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
          <h2 className="text-xs font-black uppercase tracking-widest text-[#0a192f] border-b border-slate-300 pb-1 mb-3">
            {terms.education}
          </h2>
          <div className="space-y-3 font-sans">
            {education.map((edu) => (
              <div key={edu.id} className="flex flex-row items-baseline justify-between gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 font-serif break-words">{edu.degree}</div>
                  <div className="text-xs text-slate-600 break-words">{edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</div>
                </div>
                <div className="text-xs text-slate-500 shrink-0 whitespace-nowrap">
                  {edu.startDate} – {edu.endDate} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Languages 2-Column Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6 font-sans">
        {/* Skills */}
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-[#0a192f] border-b border-slate-300 pb-1 mb-2 font-serif">
              {terms.skills}
            </h2>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((sk) => (
                <span
                  key={sk.id}
                  className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium rounded-xs"
                >
                  {sk.name} {sk.level ? `(${sk.level})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-[#0a192f] border-b border-slate-300 pb-1 mb-2 font-serif">
              {terms.languages}
            </h2>
            <div className="space-y-1 text-xs pt-1">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span className="font-semibold text-slate-900">{l.language}</span>
                  <span className="text-slate-500">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-6 font-sans">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#0a192f] border-b border-slate-300 pb-1 mb-3 font-serif">
            {terms.projects}
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-900 font-serif">{proj.title}</span>
                  {proj.link && (
                    <span className="text-[11px] text-amber-800 underline">{proj.link.replace(/^https?:\/\//, '')}</span>
                  )}
                </div>
                {proj.description && <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    İstifadə: {proj.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates && certificates.length > 0 && (
        <div className="font-sans">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#0a192f] border-b border-slate-300 pb-1 mb-2 font-serif">
            {terms.certificates}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {certificates.map((cert) => (
              <div key={cert.id} className="border-l-2 border-slate-400 pl-2">
                <div className="font-bold text-slate-900">{cert.name}</div>
                <div className="text-slate-500 text-[11px]">{cert.issuer} {cert.issueDate ? `(${cert.issueDate})` : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
