import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';
import { Award, TrendingUp, ShieldCheck } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplatePrestigeExecutive: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-prestige-executive" className="bg-white text-slate-900 font-serif w-full max-w-[800px] mx-auto min-h-[1050px] border border-slate-300">
      {/* Executive Dark Header */}
      <div className="bg-slate-950 text-white p-8 border-b-4 border-amber-600">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="flex-1 min-w-0 text-left space-y-2 font-sans">
            <h1 className="text-3xl font-black tracking-tight text-white font-serif break-words">
              {personalInfo.fullName || 'Ad Soyad'}
            </h1>
            <p className="text-base font-medium text-amber-400 break-words">
              {personalInfo.jobTitle || 'Baş İcraçı Direktor / İdarə Heyəti Üzvü'}
            </p>

            <div className="flex flex-wrap items-center justify-start gap-x-5 gap-y-1.5 text-xs text-slate-300 pt-2 font-sans break-all">
              {personalInfo.email && <span>✉️ {personalInfo.email}</span>}
              {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
              {personalInfo.address && <span>📍 {personalInfo.address}</span>}
              {personalInfo.linkedin && (
                <span>🔗 {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              )}
            </div>
          </div>

          {displayPhoto && (
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-amber-500 shadow-md shrink-0`}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>

      <div className="p-8 sm:p-10 space-y-6">
        {/* Executive Summary */}
        {personalInfo.summary && (
          <div className="border-l-4 border-slate-950 pl-4 py-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 font-sans">
              {terms.aboutMe || terms.summary}
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic font-serif">
              "{personalInfo.summary}"
            </p>
          </div>
        )}

        {/* Executive Experience */}
        {experiences && experiences.length > 0 && (
          <div>
            <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2 mb-4 font-sans">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
                {terms.experience}
              </h2>
            </div>
            <div className="space-y-5">
              {experiences.map((exp) => (
                <div key={exp.id} className="group">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 font-sans">
                    <div>
                      <span className="text-sm font-black text-slate-950">{exp.position}</span>
                      <span className="text-xs font-bold text-amber-800 ml-2">@ {exp.company}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                    </div>
                  </div>
                  {exp.location && <div className="text-xs text-slate-400 font-sans">{exp.location}</div>}
                  {exp.description && (
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mt-2 pl-3 font-sans border-l border-slate-200">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Executive Credentials */}
        <div className="grid grid-cols-2 gap-6 pt-2 font-sans">
          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-2 mb-3">
                {terms.education}
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="text-xs font-bold text-slate-900 break-words">{edu.degree}</div>
                    <div className="text-xs text-slate-600 break-words">{edu.institution}</div>
                    <div className="text-[11px] text-slate-400">{edu.startDate} – {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic Competencies / Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-2 mb-3">
                {terms.leadershipSkills || terms.skills}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s.id} className="px-2.5 py-1 rounded bg-slate-100 text-slate-900 text-xs font-bold border border-slate-300">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Projects / Deals / Transformations & Certificates */}
        <div className="grid grid-cols-2 gap-6 pt-2 font-sans">
          {projects && projects.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-2 mb-3">
                {terms.strategicProjects || terms.projects}
              </h2>
              <div className="space-y-2.5">
                {projects.map((p) => (
                  <div key={p.id}>
                    <div className="text-xs font-bold text-slate-900">{p.title}</div>
                    {p.description && <p className="text-[11px] text-slate-600 mt-0.5">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {certificates && certificates.length > 0 && (
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-2 mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  {terms.certificates}
                </h2>
                <div className="space-y-2 text-xs">
                  {certificates.map((c) => (
                    <div key={c.id}>
                      <span className="font-bold text-slate-900">{c.name}</span>
                      <div className="text-[11px] text-slate-500">{c.issuer} ({c.issueDate})</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {languages && languages.length > 0 && (
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-2 mb-2">
                  {terms.languages}
                </h2>
                <div className="space-y-1 text-xs">
                  {languages.map((l) => (
                    <div key={l.id} className="flex justify-between py-1 border-b border-slate-200">
                      <span className="font-semibold text-slate-800">{(l as any).language || (l as any).name}</span>
                      <span className="text-amber-800 font-bold text-[11px]">{(l as any).proficiency || (l as any).level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
