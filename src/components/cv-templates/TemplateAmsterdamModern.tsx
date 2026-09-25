import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateAmsterdamModern: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-amsterdam-modern" className="bg-[#f8fafc] text-slate-800 font-sans max-w-[800px] w-full mx-auto min-h-[1100px] text-left p-6 sm:p-8 border border-slate-300 shadow-xs flex flex-col space-y-5">
      {/* Modern Card Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-row items-center justify-between gap-5">
        <div className="flex-1 min-w-0 space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight break-words">
            {personalInfo.fullName || 'Ad Soyad'}
          </h1>
          <p className="text-base font-bold text-sky-600 break-words">
            {personalInfo.jobTitle || 'Tech Lead / Product Engineer'}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-2 font-medium">
            {personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-sky-500" />{personalInfo.email}</span>}
            {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-sky-500" />{personalInfo.phone}</span>}
            {personalInfo.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-sky-500" />{personalInfo.address}</span>}
            {personalInfo.linkedin && <span>in:{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, '')}</span>}
            {personalInfo.github && <span>gh:{personalInfo.github.replace(/^https?:\/\/github\.com\/?/, '')}</span>}
          </div>
        </div>

        {displayPhoto && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.fullName || 'Namizəd'}
            className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-sky-500 shadow-xs shrink-0`}
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Summary Box */}
      {personalInfo.summary && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-sky-700 mb-1">
            {terms.summary}
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-12 gap-5 flex-1">
        {/* Left: Experiences */}
        <div className="col-span-8 space-y-4">
          {experiences && experiences.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                {terms.experience}
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-xs font-bold text-slate-900">{exp.position}</span>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                        {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500">
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </div>
                    {exp.description && (
                      <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line pt-1">
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
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-3">
                {terms.projects}
              </h2>
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id}>
                    <div className="text-xs font-bold text-slate-900">{p.title}</div>
                    {p.description && <p className="text-[11px] text-slate-600 mt-0.5">{p.description}</p>}
                    {p.technologies && p.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.technologies.map((t, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Skills, Education, Languages */}
        <div className="col-span-4 space-y-4">
          {skills && skills.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-2.5">
                {terms.skills}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s.id}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-100"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-2.5">
                {terms.education}
              </h2>
              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-[11px] text-sky-700 font-medium">{edu.fieldOfStudy}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{edu.institution} • {edu.startDate}-{edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages && languages.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-2">
                {terms.languages}
              </h2>
              <div className="space-y-1.5 text-xs">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span className="font-medium text-slate-800">{l.language}</span>
                    <span className="text-[11px] text-slate-500">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certificates && certificates.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-2">
                {terms.certificates}
              </h2>
              <div className="space-y-2">
                {certificates.map((c) => (
                  <div key={c.id} className="text-[11px]">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className="text-slate-500 block text-[10px]">{c.issuer}</span>
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
