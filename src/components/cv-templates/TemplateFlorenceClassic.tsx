import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateFlorenceClassic: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-florence-classic" className="bg-[#fdfcf7] text-stone-900 font-serif max-w-[800px] w-full mx-auto min-h-[1100px] text-left p-10 border-2 border-[#9c4126] shadow-sm flex flex-col space-y-6">
      {/* Renaissance Classical Header */}
      <div className="border-b-2 border-[#9c4126] pb-6">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-3xl sm:text-4xl font-normal tracking-wide text-stone-950 uppercase break-words">
              {personalInfo.fullName || 'Ad Soyad'}
            </h1>
            <p className="text-base sm:text-lg italic font-normal text-[#9c4126] break-words">
              {personalInfo.jobTitle || 'Tədqiqatçı & Filoloq / Həkim'}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-700 pt-2 font-sans">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>• {personalInfo.phone}</span>}
              {personalInfo.address && <span>• {personalInfo.address}</span>}
              {personalInfo.linkedin && (
                <span>• {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              )}
            </div>
          </div>

          {displayPhoto && (
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-[#9c4126] shadow-sm shrink-0`}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>

      {/* Classical Bio */}
      {personalInfo.summary && (
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#9c4126] font-sans">
            {terms.aboutMe || terms.summary}
          </h2>
          <p className="text-xs sm:text-sm text-stone-800 leading-relaxed italic">
            "{personalInfo.summary}"
          </p>
        </div>
      )}

      {/* Professional Experience */}
      {experiences && experiences.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#9c4126] font-sans border-b border-[#9c4126]/30 pb-1">
            {terms.experience}
          </h2>
          <div className="space-y-4 pt-1">
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="space-y-1 text-xs">
                <div className="flex justify-between items-baseline font-sans">
                  <span className="text-sm font-bold text-stone-950">{exp.position || exp.role}</span>
                  <span className="text-xs font-semibold text-[#9c4126]">
                    {exp.period || `${exp.startDate} - ${exp.current ? terms.present : exp.endDate}`}
                  </span>
                </div>
                <div className="italic text-stone-700">
                  {exp.company} {exp.location && `• ${exp.location}`}
                </div>
                {exp.description && (
                  <p className="text-stone-700 leading-relaxed font-sans pt-0.5 whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Projects Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {education && education.length > 0 && (
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#9c4126] font-sans border-b border-[#9c4126]/30 pb-1">
              {terms.education}
            </h2>
            <div className="space-y-2 text-xs">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="space-y-0.5">
                  <div className="flex justify-between font-sans font-bold text-stone-900">
                    <span>{edu.institution || edu.school}</span>
                    <span className="text-[#9c4126] font-normal text-[11px]">
                      {edu.graduationYear || edu.endDate || (edu.current ? terms.present : '')}
                    </span>
                  </div>
                  <div className="italic text-stone-700">
                    {edu.degree} {edu.fieldOfStudy && `— ${edu.fieldOfStudy}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#9c4126] font-sans border-b border-[#9c4126]/30 pb-1">
              {terms.projects}
            </h2>
            <div className="space-y-2 text-xs">
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="space-y-0.5">
                  <div className="font-bold text-stone-900 font-sans">{proj.title}</div>
                  <p className="text-stone-700 leading-relaxed line-clamp-2">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skills, Languages & Certifications */}
      <div className="border-t-2 border-[#9c4126]/30 pt-4 space-y-3 font-sans text-xs">
        {skills && skills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9c4126] mb-1.5">
              {terms.skills}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, idx) => (
                <span
                  key={s.id || idx}
                  className="px-2.5 py-0.5 rounded border border-[#9c4126]/20 bg-[#9c4126]/5 text-stone-900 text-xs font-medium"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {languages && languages.length > 0 && (
            <div>
              <h3 className="font-bold text-[#9c4126] uppercase tracking-wider text-[11px] mb-1">
                {terms.languages}
              </h3>
              <div className="space-y-0.5 text-stone-800">
                {languages.map((l, idx) => (
                  <div key={l.id || idx}>
                    <strong>{l.language}:</strong> {l.proficiency}
                  </div>
                ))}
              </div>
            </div>
          )}

          {certificates && certificates.length > 0 && (
            <div>
              <h3 className="font-bold text-[#9c4126] uppercase tracking-wider text-[11px] mb-1">
                {terms.certificates}
              </h3>
              <div className="space-y-0.5 text-stone-800">
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
