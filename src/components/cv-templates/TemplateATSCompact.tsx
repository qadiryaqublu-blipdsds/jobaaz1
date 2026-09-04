import React from 'react';
import { CVData } from '../../types';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateATSCompact: React.FC<TemplateProps> = ({ data, showPhoto = false }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates } = data;
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-ats" className="bg-white text-slate-900 p-8 rounded-lg shadow-sm border border-slate-300 font-sans max-w-[850px] mx-auto min-h-[1050px] text-left">
      {/* Standard ATS Header */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
        {displayPhoto && (
          <div className="flex justify-center mb-3">
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-800"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
          {personalInfo.fullName || 'Ad Soyad'}
        </h1>
        <p className="text-sm font-semibold text-slate-700 mt-0.5">
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
          {personalInfo.portfolio && (
            <>
              <span>|</span>
              <span>{personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
            </>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            Peşəkar Xülasə (Professional Summary)
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed text-justify">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {experiences && experiences.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2.5">
            İş Təcrübəsi (Work Experience)
          </h2>
          <div className="space-y-3.5">
            {experiences.map((exp) => (
              <div key={exp.id} className="text-xs">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{exp.position} — {exp.company}</span>
                  <span className="font-semibold text-slate-700 text-[11px]">
                    {exp.startDate} – {exp.current ? 'İndiyədək' : exp.endDate}
                  </span>
                </div>
                {exp.location && (
                  <div className="text-[11px] italic text-slate-600 mb-1">{exp.location}</div>
                )}
                <div className="text-[11px] text-slate-800 leading-relaxed whitespace-pre-line pl-1 space-y-0.5">
                  {exp.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            Təhsil (Education)
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.institution}</span> — {edu.degree}, {edu.fieldOfStudy}
                  {edu.gpa && <span className="text-slate-600 font-medium"> (GPA: {edu.gpa})</span>}
                </div>
                <div className="font-semibold text-slate-700 text-[11px] shrink-0">
                  {edu.startDate} – {edu.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            Bacarıqlar və Kompetensiyalar (Skills)
          </h2>
          <div className="text-xs text-slate-800 space-y-1">
            <div>
              <span className="font-bold text-slate-900">Texniki Bacarıqlar: </span>
              <span>
                {skills
                  .filter((s) => s.category === 'Texniki')
                  .map((s) => s.name)
                  .join(', ') || skills.slice(0, 6).map((s) => s.name).join(', ')}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Alətlər & Proqramlar: </span>
              <span>
                {skills
                  .filter((s) => s.category === 'Alət / Proqram')
                  .map((s) => s.name)
                  .join(', ') || 'Git, VS Code, MS Office'}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Fərdi / Soft Skills: </span>
              <span>
                {skills
                  .filter((s) => s.category === 'Soft skill')
                  .map((s) => s.name)
                  .join(', ') || 'Problem həlli, Komandada iş, Çeviklik'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">
            Dillər (Languages)
          </h2>
          <div className="text-xs text-slate-800">
            {languages.map((l) => `${l.language} (${l.proficiency})`).join(' • ')}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-2">
            Layihələr (Projects)
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
            Sertifikatlar (Certificates)
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
