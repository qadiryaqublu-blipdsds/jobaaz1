import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateScandinavianEdge: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-scandinavian-edge" className="bg-white text-slate-900 font-sans max-w-[800px] w-full mx-auto min-h-[1100px] text-left border border-slate-200 shadow-sm overflow-hidden">
      {/* Soft Nordic Green Header Banner */}
      <div className="bg-[#1b4332] text-white p-7 sm:p-9">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 flex-1">
            <span className="text-[10px] tracking-widest uppercase text-emerald-300 font-bold">
              Nordic Professional Format
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {personalInfo.fullName || 'Ad Soyad'}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-emerald-100">
              {personalInfo.jobTitle || 'Vəzifə'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-200/90 pt-2 font-medium">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>• {personalInfo.phone}</span>}
              {personalInfo.address && <span>• {personalInfo.address}</span>}
              {personalInfo.linkedin && <span>• {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>}
              {personalInfo.portfolio && <span>• {personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>}
            </div>
          </div>

          {displayPhoto && (
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-emerald-400/80 shadow-md`}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>

      <div className="p-7 sm:p-9 space-y-6">
        {/* Summary */}
        {personalInfo.summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1b4332] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span>{terms.summary}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-emerald-50/30 p-3.5 rounded-xl border border-emerald-100">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {experiences && experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1b4332] mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span>{terms.experience}</span>
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="pl-3 border-l-2 border-emerald-600/30">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="text-sm font-bold text-slate-900">
                      {exp.position} <span className="font-semibold text-emerald-800">— {exp.company}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto">
                      {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                    </span>
                  </div>
                  {exp.location && <div className="text-xs text-slate-400 mt-0.5">{exp.location}</div>}
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

        {/* Education & Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1b4332] mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                <span>{terms.education}</span>
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</div>
                    <div className="text-slate-400 text-[11px]">{edu.startDate} – {edu.endDate} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1b4332] mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                <span>{terms.skills}</span>
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((sk) => (
                  <span
                    key={sk.id}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs font-semibold rounded-lg"
                  >
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Projects, Languages & Certificates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
          {projects && projects.length > 0 && (
            <div className="sm:col-span-1">
              <div className="text-xs font-bold uppercase text-[#1b4332] mb-2">{terms.projects}</div>
              <div className="space-y-2 text-xs">
                {projects.slice(0, 2).map((p) => (
                  <div key={p.id}>
                    <div className="font-bold text-slate-900">{p.title}</div>
                    {p.description && <div className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{p.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages && languages.length > 0 && (
            <div className="sm:col-span-1">
              <div className="text-xs font-bold uppercase text-[#1b4332] mb-2">{terms.languages}</div>
              <div className="space-y-1 text-xs">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span className="font-semibold text-slate-800">{l.language}</span>
                    <span className="text-slate-500 text-[11px]">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certificates && certificates.length > 0 && (
            <div className="sm:col-span-1">
              <div className="text-xs font-bold uppercase text-[#1b4332] mb-2">{terms.certificates}</div>
              <div className="space-y-1.5 text-xs">
                {certificates.slice(0, 2).map((c) => (
                  <div key={c.id}>
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-slate-500 text-[11px]">{c.issuer}</div>
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
