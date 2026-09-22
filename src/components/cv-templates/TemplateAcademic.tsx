import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateAcademic: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-academic" className="bg-white text-stone-900 p-8 rounded-lg shadow-sm border border-stone-300 font-serif w-full max-w-[800px] mx-auto min-h-[1050px]">
      {/* Centered Academic Header */}
      <div className="text-center pb-4 mb-6 border-b-2 border-stone-800">
        {displayPhoto && (
          <div className="flex justify-center mb-3">
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border border-stone-400 shadow-2xs bg-stone-100 shrink-0`}
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight uppercase text-stone-900 break-words">
          {personalInfo.fullName || 'Ad Soyad'}
        </h1>
        <p className="text-base italic text-stone-700 font-serif mt-0.5 break-words">
          {personalInfo.jobTitle || 'Akademik / Tədqiqatçı'}
        </p>

        {/* Linear Contact Info */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-stone-700 font-sans mt-3">
          {personalInfo.address && <span>{personalInfo.address}</span>}
          {personalInfo.phone && (
            <>
              <span>•</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo.email && (
            <>
              <span>•</span>
              <span>{personalInfo.email}</span>
            </>
          )}
          {personalInfo.linkedin && (
            <>
              <span>•</span>
              <span>{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
            </>
          )}
          {personalInfo.portfolio && (
            <>
              <span>•</span>
              <span>{personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2 font-sans">
            {terms.aboutMe || terms.summary}
          </h2>
          <p className="text-xs text-stone-800 leading-relaxed text-justify italic">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Education First in Academic CV */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-3 font-sans">
            {terms.academicEducation || terms.education}
          </h2>
          <div className="space-y-3 font-sans">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <div className="flex justify-between items-baseline gap-2 min-w-0 font-serif">
                  <h3 className="font-bold text-stone-950 text-sm flex-1 min-w-0 break-words">{edu.degree} — {edu.fieldOfStudy}</h3>
                  <span className="font-sans text-[11px] text-stone-600 shrink-0 whitespace-nowrap">{edu.startDate} – {edu.endDate}</span>
                </div>
                <div className="text-stone-700 italic text-[11px] break-words">
                  {edu.institution} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work / Professional Experience */}
      {experiences && experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-3 font-sans">
            {terms.experience}
          </h2>
          <div className="space-y-4 font-sans">
            {experiences.map((exp) => (
              <div key={exp.id} className="text-xs">
                <div className="flex justify-between items-baseline gap-2 min-w-0 font-serif">
                  <h3 className="font-bold text-stone-950 text-sm flex-1 min-w-0 break-words">{exp.position}</h3>
                  <span className="font-sans text-[11px] text-stone-600 shrink-0 whitespace-nowrap">
                    {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                  </span>
                </div>
                <div className="text-stone-700 font-medium italic text-[11px] mb-1 break-words">
                  {exp.company} {exp.location ? `, ${exp.location}` : ''}
                </div>
                <div className="text-stone-800 leading-relaxed whitespace-pre-line text-[11px] break-words">
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects & Publications */}
      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-3 font-sans">
            {terms.scientificProjects || terms.projects}
          </h2>
          <div className="space-y-2.5 font-sans">
            {projects.map((proj) => (
              <div key={proj.id} className="text-xs">
                <div className="font-bold text-stone-900 font-serif text-[12px]">
                  {proj.title}
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="ml-2 font-sans font-normal text-[10px] text-stone-600 underline">
                      [Keçid]
                    </a>
                  )}
                </div>
                <p className="text-stone-700 text-[11px] mt-0.5">{proj.description}</p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="text-[10px] text-stone-500 italic mt-0.5">
                    Metodologiya & Alətlər: {proj.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Languages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {/* Skills */}
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2">
              {terms.skills}
            </h2>
            <div className="text-xs text-stone-800 space-y-1">
              {skills.map((s) => (
                <div key={s.id} className="flex justify-between py-0.5 border-b border-stone-100">
                  <span>{s.name}</span>
                  <span className="text-stone-500 italic text-[10px]">{s.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages & Certificates */}
        <div className="space-y-4">
          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2">
                {terms.languages}
              </h2>
              <div className="text-xs text-stone-800 space-y-1">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between py-0.5 border-b border-stone-100">
                    <span>{l.language}</span>
                    <span className="text-stone-500 italic text-[10px]">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certificates && certificates.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2">
                {terms.honorsAndCertificates || terms.certificates}
              </h2>
              <div className="text-xs text-stone-800 space-y-1">
                {certificates.map((c) => (
                  <div key={c.id}>
                    • <span className="font-semibold">{c.name}</span> — {c.issuer} ({c.issueDate})
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
