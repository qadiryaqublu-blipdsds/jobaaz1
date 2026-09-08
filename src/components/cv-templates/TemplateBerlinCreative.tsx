import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateBerlinCreative: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-berlin-creative" className="bg-white text-slate-900 font-sans max-w-[800px] w-full mx-auto min-h-[1100px] text-left border border-slate-200 shadow-sm flex flex-col sm:flex-row">
      {/* Left Colored Column */}
      <div className="w-full sm:w-[260px] bg-[#1e2022] text-slate-200 p-6 sm:p-7 shrink-0 space-y-6">
        {displayPhoto && (
          <div className="flex justify-center sm:justify-start">
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-orange-400 shadow-md`}
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-orange-400">
            {terms.contact}
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            {personalInfo.email && <div className="break-all">{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.address && <div>{personalInfo.address}</div>}
            {personalInfo.linkedin && <div className="break-all text-slate-400">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</div>}
            {personalInfo.portfolio && <div className="break-all text-orange-300 font-medium">{personalInfo.portfolio.replace(/^https?:\/\//, '')}</div>}
          </div>
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-widest text-orange-400">
              {terms.skills}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((sk) => (
                <span key={sk.id} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-xs">
                  {sk.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-widest text-orange-400">
              {terms.languages}
            </div>
            <div className="space-y-1 text-xs text-slate-300">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span>{l.language}</span>
                  <span className="text-slate-400">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        {certificates && certificates.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-widest text-orange-400">
              {terms.certificates}
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              {certificates.map((c) => (
                <div key={c.id}>
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-slate-400 text-[11px]">{c.issuer}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-6 sm:p-8 space-y-6">
        {/* Name and Title */}
        <div className="border-b-2 border-slate-900 pb-4">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 uppercase">
            {personalInfo.fullName || 'Ad Soyad'}
          </h1>
          <p className="text-base sm:text-lg font-bold text-orange-600 mt-0.5">
            {personalInfo.jobTitle || 'Creative Director'}
          </p>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              {terms.summary}
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-1">
              {terms.experience}
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="text-sm font-bold text-slate-900">
                      {exp.position} <span className="font-medium text-orange-600">— {exp.company}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                    </div>
                  </div>
                  {exp.location && <div className="text-xs text-slate-400">{exp.location}</div>}
                  {exp.description && (
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mt-1.5 pl-2 border-l-2 border-orange-200">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-1">
              {terms.projects}
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3 bg-orange-50/40 rounded-lg border border-orange-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{proj.title}</span>
                    {proj.link && (
                      <span className="text-xs text-orange-600 underline truncate max-w-[150px]">
                        {proj.link.replace(/^https?:\/\//, '')}
                      </span>
                    )}
                  </div>
                  {proj.description && <p className="text-xs text-slate-700 mt-1">{proj.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-1">
              {terms.education}
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-600"> — {edu.institution}</span>
                  </div>
                  <span className="text-slate-400 font-medium">{edu.startDate} – {edu.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
