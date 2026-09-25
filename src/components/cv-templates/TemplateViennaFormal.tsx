import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateViennaFormal: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-vienna-formal" className="bg-[#fcfbf9] text-stone-900 font-serif max-w-[800px] w-full mx-auto min-h-[1100px] text-left p-10 border-2 border-stone-800 shadow-sm flex flex-col">
      {/* Formal Double Border Header */}
      <div className="border-b-2 border-stone-900 pb-5 mb-6">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-normal tracking-wide text-stone-950 uppercase break-words">
              {personalInfo.fullName || 'Ad Soyad'}
            </h1>
            <p className="text-sm sm:text-base font-medium italic text-stone-700 mt-1 break-words">
              {personalInfo.jobTitle || 'Hüquq Məsləhətçisi / Baş İqtisadçı'}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 pt-3 font-sans">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>• {personalInfo.phone}</span>}
              {personalInfo.address && <span>• {personalInfo.address}</span>}
              {personalInfo.linkedin && <span>• {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>}
            </div>
          </div>

          {displayPhoto && (
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border border-stone-800 shadow-xs shrink-0`}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6 flex-1 text-xs font-sans">
        {/* Summary */}
        {personalInfo.summary && (
          <div>
            <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2">
              {terms.summary}
            </h2>
            <p className="text-xs text-stone-800 leading-relaxed text-justify font-serif">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <div>
            <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-3">
              {terms.experience}
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold text-stone-900 text-xs font-serif">{exp.position}</span>
                    <span className="text-[11px] text-stone-600 italic">
                      {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-stone-700">
                    {exp.company} {exp.location && `(${exp.location})`}
                  </div>
                  {exp.description && (
                    <p className="text-[11px] text-stone-800 leading-relaxed whitespace-pre-line pt-0.5">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Skills in 2 columns */}
        <div className="grid grid-cols-2 gap-6 pt-2">
          {education && education.length > 0 && (
            <div>
              <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2.5">
                {terms.education}
              </h2>
              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-bold text-stone-900 font-serif">{edu.institution}</div>
                    <div className="text-[11px] text-stone-700 italic">{edu.degree} – {edu.fieldOfStudy}</div>
                    <div className="text-[10px] text-stone-500">{edu.startDate} – {edu.endDate} {edu.gpa && `• GPA: ${edu.gpa}`}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            {skills && skills.length > 0 && (
              <div className="mb-4">
                <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2.5">
                  {terms.skills}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((sk) => (
                    <span
                      key={sk.id}
                      className="text-[10px] px-2 py-0.5 border border-stone-400 bg-stone-100 text-stone-800 font-medium"
                    >
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {languages && languages.length > 0 && (
              <div>
                <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2">
                  {terms.languages}
                </h2>
                <div className="space-y-1 text-[11px]">
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between">
                      <span className="font-medium text-stone-800">{l.language}:</span>
                      <span className="text-stone-600 italic">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Certificates */}
        {certificates && certificates.length > 0 && (
          <div className="pt-2">
            <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2">
              {terms.certificates}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {certificates.map((c) => (
                <div key={c.id} className="text-[11px]">
                  <span className="font-bold text-stone-900">{c.name}</span>
                  <span className="text-stone-600 block">{c.issuer} {c.issueDate && `(${c.issueDate})`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
