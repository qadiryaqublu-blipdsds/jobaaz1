import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateParisElegance: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-paris-elegance" className="bg-[#faf9f6] text-slate-800 font-serif max-w-[800px] w-full mx-auto min-h-[1100px] text-left p-10 sm:p-12 border border-stone-200 shadow-sm flex flex-col space-y-7">
      {/* Editorial Parisian Header */}
      <div className="flex flex-row items-center justify-between gap-8 pb-7 border-b border-stone-300">
        <div className="flex-1 min-w-0 space-y-2">
          <h1 className="text-4xl sm:text-5xl font-light tracking-wide text-stone-900 break-words">
            {personalInfo.fullName || 'Ad Soyad'}
          </h1>
          <p className="text-sm sm:text-base font-medium uppercase tracking-[0.2em] text-[#9b5168] font-sans break-words">
            {personalInfo.jobTitle || 'Kreativ Mütəxəssis & Art Menecer'}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 pt-2 font-sans font-light">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>/ {personalInfo.phone}</span>}
            {personalInfo.address && <span>/ {personalInfo.address}</span>}
            {personalInfo.linkedin && (
              <span>/ {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
            )}
            {personalInfo.portfolio && (
              <span className="text-[#9b5168] font-medium">/ {personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
            )}
          </div>
        </div>

        {displayPhoto && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.fullName || 'Namizəd'}
            className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border border-stone-400/80 shadow-sm shrink-0`}
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Editorial Profile Bio */}
      {personalInfo.summary && (
        <div className="space-y-1.5">
          <h2 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-stone-400">
            {terms.aboutMe || terms.summary}
          </h2>
          <p className="text-sm text-stone-700 leading-relaxed font-light italic">
            "{personalInfo.summary}"
          </p>
        </div>
      )}

      {/* Experience Flow */}
      {experiences && experiences.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-stone-400 border-b border-stone-200 pb-1">
            {terms.experience}
          </h2>
          <div className="space-y-5">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="space-y-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2 font-sans">
                  <h3 className="text-sm font-bold text-stone-900 tracking-tight">{exp.position || exp.role}</h3>
                  <span className="text-xs text-[#9b5168] font-medium">
                    {exp.period || `${exp.startDate} - ${exp.current ? terms.present : exp.endDate}`}
                  </span>
                </div>
                <div className="text-xs italic text-stone-500 font-serif">
                  {exp.company} {exp.location && `• ${exp.location}`}
                </div>
                {exp.description && (
                  <p className="text-xs text-stone-600 leading-relaxed font-sans font-light pt-0.5 whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Projects Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {education && education.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-stone-400 border-b border-stone-200 pb-1">
              {terms.education}
            </h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="space-y-0.5">
                  <div className="flex justify-between items-baseline font-sans text-xs">
                    <span className="font-bold text-stone-900">{edu.institution || edu.school}</span>
                    <span className="text-[#9b5168] text-[11px]">
                      {edu.graduationYear || edu.endDate || (edu.current ? terms.present : '')}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 font-serif italic">
                    {edu.degree} {edu.fieldOfStudy && `— ${edu.fieldOfStudy}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Projects */}
        {projects && projects.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-stone-400 border-b border-stone-200 pb-1">
              {terms.projects}
            </h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="space-y-0.5 font-sans">
                  <div className="text-xs font-bold text-stone-900">{proj.title}</div>
                  <p className="text-xs text-stone-600 font-light line-clamp-2">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skills & Languages Palette */}
      <div className="border-t border-stone-200 pt-5 space-y-4">
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-stone-400 mb-2">
              {terms.skills}
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span
                  key={s.id || idx}
                  className="px-2.5 py-1 bg-white border border-stone-300 text-stone-800 rounded font-sans text-xs font-medium"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-sans text-xs text-stone-600">
          {languages && languages.length > 0 && (
            <div>
              <span className="font-bold text-stone-800 uppercase tracking-wider text-[10px] block mb-1">
                {terms.languages}
              </span>
              <div className="space-y-0.5">
                {languages.map((l, idx) => (
                  <div key={l.id || idx}>
                    <strong className="text-stone-900">{l.language}:</strong> {l.proficiency}
                  </div>
                ))}
              </div>
            </div>
          )}

          {certificates && certificates.length > 0 && (
            <div>
              <span className="font-bold text-stone-800 uppercase tracking-wider text-[10px] block mb-1">
                {terms.certificates}
              </span>
              <div className="space-y-0.5">
                {certificates.slice(0, 3).map((c, idx) => (
                  <div key={c.id || idx} className="truncate">
                    • {c.name} ({c.issuer})
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
