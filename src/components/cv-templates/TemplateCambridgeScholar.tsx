import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateCambridgeScholar: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-cambridge-scholar" className="bg-white text-slate-900 p-8 sm:p-12 font-serif max-w-[800px] w-full mx-auto min-h-[1100px] text-left border border-slate-300 shadow-sm">
      {/* Centered Academic Header */}
      <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
        {displayPhoto && (
          <div className="flex justify-center mb-3">
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border border-slate-800 shadow-xs`}
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl font-normal tracking-wide text-slate-950 uppercase">
          {personalInfo.fullName || 'Ad Soyad'}
        </h1>
        <p className="text-sm font-semibold italic text-slate-700 mt-1">
          {personalInfo.jobTitle || 'Researcher & Academic Fellow'}
        </p>

        {/* Linear Academic Contact Details */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-slate-700 mt-2.5 font-sans">
          {personalInfo.address && <span>{personalInfo.address}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.email && <span>• {personalInfo.email}</span>}
          {personalInfo.linkedin && (
            <span>• {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
          )}
          {personalInfo.portfolio && (
            <span>• {personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
          )}
        </div>
      </div>

      {/* Summary / Research Statement */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
            {terms.summary}
          </h2>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed text-justify">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Education (Prioritized for Academic CVs) */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">
            {terms.academicEducation || terms.education}
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <div className="text-sm font-bold text-slate-950">{edu.degree}</div>
                  <div className="text-xs text-slate-700 italic">
                    {edu.institution} {edu.fieldOfStudy ? `— ${edu.fieldOfStudy}` : ''}
                  </div>
                </div>
                <div className="text-xs text-slate-600 font-sans">
                  {edu.startDate} – {edu.endDate} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience / Appointments */}
      {experiences && experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">
            {terms.experience}
          </h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div className="text-sm font-bold text-slate-950">
                    {exp.position} <span className="font-normal italic text-slate-700">— {exp.company}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-sans">
                    {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                  </div>
                </div>
                {exp.location && <div className="text-xs text-slate-500 font-sans italic">{exp.location}</div>}
                {exp.description && (
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line mt-1.5 pl-3 border-l border-slate-400">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects & Publications */}
      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">
            {terms.scientificProjects || terms.projects}
          </h2>
          <div className="space-y-2.5 text-xs">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-950">{proj.title}</span>
                  {proj.link && (
                    <span className="text-[11px] text-slate-600 underline font-sans">{proj.link.replace(/^https?:\/\//, '')}</span>
                  )}
                </div>
                {proj.description && <p className="text-slate-700 mt-0.5">{proj.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Honors & Certifications */}
      {certificates && certificates.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
            {terms.honorsAndCertificates || terms.certificates}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {certificates.map((c) => (
              <div key={c.id}>
                <span className="font-bold text-slate-900">{c.name}</span>
                <span className="text-slate-600 italic"> — {c.issuer} {c.issueDate ? `(${c.issueDate})` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Languages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-slate-300">
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-1.5">
              {terms.skills}
            </h2>
            <div className="text-xs text-slate-800 leading-relaxed font-sans">
              {skills.map(s => s.name).join(' • ')}
            </div>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-1.5">
              {terms.languages}
            </h2>
            <div className="space-y-1 text-xs font-sans">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span className="font-semibold text-slate-900">{l.language}</span>
                  <span className="text-slate-600">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
