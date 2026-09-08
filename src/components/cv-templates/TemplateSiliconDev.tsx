import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateSiliconDev: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-silicon-dev" className="bg-white text-slate-900 font-sans max-w-[800px] w-full mx-auto min-h-[1100px] text-left border border-slate-200 shadow-sm overflow-hidden">
      {/* Dark Tech Header */}
      <div className="bg-[#0f172a] text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex-1 space-y-1">
            <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
              // Tech Stack & Engineering Profile
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {personalInfo.fullName || 'Ad Soyad'}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-300">
              {personalInfo.jobTitle || 'Senior Software Engineer'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 pt-2 font-mono">
              {personalInfo.email && <span className="hover:text-cyan-300">{personalInfo.email}</span>}
              {personalInfo.phone && <span>• {personalInfo.phone}</span>}
              {personalInfo.address && <span>• {personalInfo.address}</span>}
              {personalInfo.github && (
                <span className="text-cyan-400 font-semibold">
                  • gh:{personalInfo.github.replace(/^https?:\/\/github\.com\/?/, '')}
                </span>
              )}
              {personalInfo.linkedin && (
                <span className="text-blue-400">
                  • in:{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, '')}
                </span>
              )}
            </div>
          </div>

          {displayPhoto && (
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-cyan-400 shadow-lg`}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Summary */}
        {personalInfo.summary && (
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 mb-1.5 flex items-center gap-1.5">
              <span>$</span> <span>{terms.summary}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <span>$</span> <span>{terms.experience}</span>
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-3 border-l-2 border-slate-200 hover:border-cyan-500 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="text-sm font-bold text-slate-900">
                      {exp.position} <span className="font-semibold text-cyan-700">@{exp.company}</span>
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      {exp.startDate} → {exp.current ? terms.present : exp.endDate}
                    </div>
                  </div>
                  {exp.location && <div className="text-[11px] text-slate-400">{exp.location}</div>}
                  {exp.description && (
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mt-1.5">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects & Tech Showcase */}
        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <span>$</span> <span>{terms.projects}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map((proj) => (
                <div key={proj.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{proj.title}</span>
                    {proj.link && (
                      <span className="text-[10px] font-mono text-cyan-600 underline truncate max-w-[130px]">
                        {proj.link.replace(/^https?:\/\//, '')}
                      </span>
                    )}
                  </div>
                  {proj.description && <p className="text-xs text-slate-600 mt-1">{proj.description}</p>}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.technologies.map((tech, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-mono rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Education */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 mb-2 border-b border-slate-200 pb-1">
                <span>$</span> <span>{terms.skills}</span>
              </h2>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((sk) => (
                  <span
                    key={sk.id}
                    className="px-2 py-1 bg-cyan-50 text-cyan-950 border border-cyan-200/70 text-xs font-mono font-medium rounded-md"
                  >
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-700 mb-2 border-b border-slate-200 pb-1">
                <span>$</span> <span>{terms.education}</span>
              </h2>
              <div className="space-y-2 pt-1 text-xs">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution} {edu.fieldOfStudy ? `— ${edu.fieldOfStudy}` : ''}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{edu.startDate} – {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Languages & Certificates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          {languages && languages.length > 0 && (
            <div>
              <div className="text-xs font-mono font-bold text-slate-500 uppercase mb-1">{terms.languages}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {languages.map((l) => (
                  <span key={l.id} className="text-slate-700">
                    <strong className="text-slate-900">{l.language}:</strong> {l.proficiency}
                  </span>
                ))}
              </div>
            </div>
          )}

          {certificates && certificates.length > 0 && (
            <div>
              <div className="text-xs font-mono font-bold text-slate-500 uppercase mb-1">{terms.certificates}</div>
              <div className="space-y-1 text-xs">
                {certificates.map((c) => (
                  <div key={c.id} className="text-slate-700">
                    <span className="font-semibold text-slate-900">{c.name}</span> — {c.issuer}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
