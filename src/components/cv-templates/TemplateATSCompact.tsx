import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateATSCompact: React.FC<TemplateProps> = ({ data, showPhoto = false }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-ats" className="bg-white text-slate-900 p-8 rounded-lg shadow-sm border border-slate-300 font-sans w-full max-w-[800px] mx-auto min-h-[1050px] text-left">
      {/* Standard ATS Header */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
        {displayPhoto && (
          <div className="flex justify-center mb-3">
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-slate-800 shrink-0`}
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase break-words">
          {personalInfo.fullName || 'Ad Soyad'}
        </h1>
        <p className="text-sm font-semibold text-slate-700 mt-0.5 break-words">
          {personalInfo.jobTitle || 'Vəzifə'}
        </p>

        {/* Linear Contact Line for ATS */}
        <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-1 text-xs text-slate-700 mt-2 font-medium">
          {personalInfo.address && <span>{personalInfo.address}</span>}
          {personalInfo.phone && (
            <>
              <span>|</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo.email && (
            <>
              <span>|</span>
              <span>{personalInfo.email}</span>
            </>
          )}
          {personalInfo.linkedin && (
            <>
              <span>|</span>
              <span>{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
            </>
          )}
          {personalInfo.github && (
            <>
              <span>|</span>
              <span>{personalInfo.github.replace(/^https?:\/\//, '')}</span>
            </>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            {terms.summary}
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line text-justify">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience Section */}
      {experiences && experiences.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2.5">
            {terms.experience}
          </h2>
          <div className="space-y-3.5">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline gap-2 min-w-0 text-xs font-bold text-slate-900">
                  <span className="flex-1 min-w-0 break-words">{exp.position}</span>
                  <span className="font-semibold text-slate-700 text-[11px] shrink-0 whitespace-nowrap">
                    {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-700 mb-1 break-words">
                  {exp.company} {exp.location ? `| ${exp.location}` : ''}
                </div>
                {exp.description && (
                  <p className="text-xs text-slate-800 leading-normal whitespace-pre-line break-words">
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
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            {terms.education}
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <div className="flex justify-between items-baseline gap-2 min-w-0 font-bold text-slate-900">
                  <span className="flex-1 min-w-0 break-words">{edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</span>
                  <span className="font-normal text-slate-600 text-[11px] shrink-0 whitespace-nowrap">
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <div className="text-slate-700 break-words">
                  {edu.institution} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            {terms.skills}
          </h2>
          <div className="text-xs text-slate-800 leading-relaxed">
            {skills.map((s) => s.name).join(' • ')}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            {terms.languages}
          </h2>
          <div className="text-xs text-slate-800">
            {languages.map((l) => `${l.name || (l as any).language} (${l.level || (l as any).proficiency})`).join(' • ')}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            {terms.projects}
          </h2>
          <div className="space-y-2 text-xs">
            {projects.map((pr) => (
              <div key={pr.id}>
                <div className="font-bold text-slate-900">
                  {pr.title}
                  {pr.technologies && pr.technologies.length > 0 && (
                    <span className="font-normal text-slate-600 text-[11px]"> [{pr.technologies.join(', ')}]</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-700 leading-normal">{pr.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates && certificates.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            {terms.certificates}
          </h2>
          <div className="text-xs text-slate-800 space-y-0.5">
            {certificates.map((cert) => (
              <div key={cert.id}>
                • <span className="font-semibold text-slate-900">{cert.name}</span> — {cert.issuer} ({cert.issueDate})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
