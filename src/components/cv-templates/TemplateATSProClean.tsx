import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateATSProClean: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-ats-pro-clean" className="bg-white text-slate-900 font-sans max-w-[800px] w-full mx-auto min-h-[1100px] text-left p-8 sm:p-10 border border-slate-300">
      {/* Centered ATS Master Header */}
      <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
        {displayPhoto && (
          <div className="flex justify-center mb-2">
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border border-slate-400 shrink-0`}
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 uppercase break-words">
          {personalInfo.fullName || 'Ad Soyad'}
        </h1>
        <p className="text-sm font-semibold text-slate-800 uppercase tracking-wider break-words">
          {personalInfo.jobTitle || 'Vəzifə'}
        </p>

        {/* ATS Pipe-Separated Single-Line Contact */}
        <div className="flex flex-wrap justify-center items-center gap-x-2 text-xs text-slate-700 pt-1 font-medium">
          {personalInfo.address && <span>{personalInfo.address}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo.email && <span>| {personalInfo.email}</span>}
          {personalInfo.linkedin && (
            <span>| {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
          )}
          {personalInfo.github && (
            <span>| {personalInfo.github.replace(/^https?:\/\//, '')}</span>
          )}
        </div>
      </div>

      <div className="pt-4 space-y-5">
        {/* Professional Summary */}
        {personalInfo.summary && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5">
              {terms.aboutMe || terms.summary}
            </h2>
            <p className="text-xs text-slate-800 leading-relaxed pt-1">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5">
              {terms.experience}
            </h2>
            <div className="space-y-3.5">
              {experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="space-y-1 text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-950">
                    <span className="text-sm font-bold">{exp.position || exp.role}</span>
                    <span className="text-slate-700 font-semibold">
                      {exp.period || `${exp.startDate} - ${exp.current ? terms.present : exp.endDate}`}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line pt-0.5">
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
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5">
              {terms.education}
            </h2>
            <div className="space-y-2 text-xs">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900">{edu.institution || edu.school}</span>
                    <span className="text-slate-700 ml-1">— {edu.degree} {edu.fieldOfStudy && `(${edu.fieldOfStudy})`}</span>
                  </div>
                  <span className="font-semibold text-slate-700">
                    {edu.graduationYear || edu.endDate || (edu.current ? terms.present : '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Projects */}
        {projects && projects.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5">
              {terms.projects}
            </h2>
            <div className="space-y-2 text-xs">
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="space-y-0.5">
                  <div className="font-bold text-slate-900">{proj.title}</div>
                  <p className="text-slate-700 leading-relaxed">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[11px] text-slate-600">
                      <strong>Texnologiyalar:</strong> {proj.technologies.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Skills */}
        {skills && skills.length > 0 && (
          <div className="space-y-1 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5">
              {terms.skills}
            </h2>
            <p className="text-slate-800 leading-relaxed pt-1">
              {skills.map((s) => s.name).join(' • ')}
            </p>
          </div>
        )}

        {/* Languages & Certifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          {languages && languages.length > 0 && (
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1 text-[11px]">
                {terms.languages}
              </h3>
              <div className="space-y-0.5 text-slate-700">
                {languages.map((l, idx) => (
                  <div key={l.id || idx}>
                    • <strong>{l.language}:</strong> {l.proficiency}
                  </div>
                ))}
              </div>
            </div>
          )}

          {certificates && certificates.length > 0 && (
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1 text-[11px]">
                {terms.certificates}
              </h3>
              <div className="space-y-0.5 text-slate-700">
                {certificates.map((c, idx) => (
                  <div key={c.id || idx} className="truncate">
                    • <strong>{c.name}</strong> ({c.issuer})
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
