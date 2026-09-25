import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';
import { GraduationCap, Award, BookOpen, UserCheck, Briefcase } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateEntryStudent: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-entry-student" className="bg-white text-slate-800 p-8 font-sans w-full max-w-[800px] mx-auto min-h-[1050px] border border-sky-100">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50/50 p-6 rounded-2xl border border-sky-200/60 mb-6">
        <div className="flex flex-row items-center gap-5">
          {displayPhoto && (
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-sky-400 shadow-sm shrink-0`}
              referrerPolicy="no-referrer"
            />
          )}
          <div className="flex-1 min-w-0 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
              {personalInfo.fullName || ''}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-sky-700 mt-0.5 break-words">
              {personalInfo.jobTitle || ''}
            </p>
            <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-1 text-xs text-slate-600 mt-3 break-all">
              {personalInfo.email && <span>✉️ {personalInfo.email}</span>}
              {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
              {personalInfo.address && <span>📍 {personalInfo.address}</span>}
              {personalInfo.linkedin && (
                <span>🔗 {personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              )}
              {personalInfo.github && (
                <span>💻 {personalInfo.github.replace(/^https?:\/\//, '')}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile summary */}
      {personalInfo.summary && (
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h2 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            {terms.summary}
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line break-words">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Main 2-column layout: Left (Education & Projects), Right (Experience & Skills) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (7 cols): Education & Projects first for juniors */}
        <div className="col-span-7 space-y-6">
          {/* Education First */}
          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b-2 border-sky-500 mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-sky-600" />
                {terms.education}
              </h2>
              <div className="space-y-3.5">
                {education.map((edu) => (
                  <div key={edu.id} className="relative pl-3 border-l-2 border-sky-300">
                    <div className="text-xs font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-xs font-medium text-sky-700">{edu.institution}</div>
                    <div className="text-[11px] text-slate-500">
                      {edu.startDate} – {edu.endDate} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience / Internship */}
          {experiences && experiences.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b-2 border-sky-500 mb-3 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-sky-600" />
                {terms.experience} / {terms.internshipPrograms}
              </h2>
              <div className="space-y-3.5">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-3 border-l-2 border-sky-200">
                    <div className="text-xs font-bold text-slate-900">{exp.position}</div>
                    <div className="text-xs text-sky-800 font-medium">{exp.company}</div>
                    <div className="text-[11px] text-slate-400 mb-1">
                      {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic & Personal Projects */}
          {projects && projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b-2 border-sky-500 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-sky-600" />
                {terms.projects}
              </h2>
              <div className="space-y-2.5">
                {projects.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                    <div className="text-xs font-bold text-slate-800">{p.title}</div>
                    {p.description && <p className="text-[11px] text-slate-600 mt-0.5">{p.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Skills, Languages, Certificates */}
        <div className="col-span-5 space-y-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="p-4 rounded-xl bg-sky-50/40 border border-sky-100">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                {terms.skills}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s.id} className="px-2.5 py-1 rounded-md bg-white border border-sky-200 text-sky-900 text-xs font-semibold shadow-2xs">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                {terms.languages}
              </h2>
              <div className="space-y-1.5 text-xs">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{(l as any).language || (l as any).name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                      {(l as any).proficiency || (l as any).level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {certificates && certificates.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                {terms.certificates}
              </h2>
              <div className="space-y-2 text-xs">
                {certificates.map((c) => (
                  <div key={c.id}>
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.issuer} ({c.issueDate})</div>
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
