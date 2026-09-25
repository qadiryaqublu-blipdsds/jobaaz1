import React from 'react';
import { CVData } from '../../types';
import { Terminal, Code, Cpu, Link, Briefcase, GraduationCap } from 'lucide-react';
import { getCVTerms, getPhotoClasses } from './cvDictionary';

interface TemplateProps {
  data: CVData;
}

export const TemplateTech: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);

  return (
    <div id="cv-preview-tech" className="bg-slate-900 text-slate-100 p-8 rounded-lg shadow-sm border border-slate-700 font-mono w-full max-w-[800px] mx-auto min-h-[1050px]">
      {/* Top terminal bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {personalInfo.photoUrl && (
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Candidate'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-cyan-500 shadow-md bg-slate-800 shrink-0`}
              referrerPolicy="no-referrer"
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-white tracking-tight break-words">{personalInfo.fullName || 'Full Name'}</h1>
            <p className="text-cyan-300 text-sm font-medium break-words">{personalInfo.jobTitle || 'Full-Stack Developer'}</p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 space-y-1 font-sans shrink-0 max-w-[240px]">
          {personalInfo.email && <div className="text-slate-300 truncate">{personalInfo.email}</div>}
          {personalInfo.phone && <div className="truncate">{personalInfo.phone}</div>}
          {personalInfo.address && <div className="truncate">{personalInfo.address}</div>}
          {personalInfo.github && <div className="text-cyan-400 truncate">{personalInfo.github.replace(/^https?:\/\//, '')}</div>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6 bg-slate-800/60 p-3.5 rounded-lg border border-slate-700 text-xs font-sans text-slate-300 leading-relaxed">
          <span className="text-cyan-400 font-mono font-bold block mb-1">// {terms.summary}</span>
          {personalInfo.summary}
        </div>
      )}

      {/* Skills Badges */}
      {skills && skills.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 uppercase font-bold tracking-wider mb-2">
            <Code className="w-3.5 h-3.5" />
            <span>{terms.techStack || 'Tech Stack & Skills'}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="text-[11px] bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded font-mono"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 uppercase font-bold tracking-wider mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{terms.experience}</span>
          </div>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="border-l-2 border-cyan-500/60 pl-3">
                <div className="flex justify-between items-baseline font-sans gap-2 min-w-0">
                  <span className="text-xs font-bold text-white flex-1 min-w-0 break-words">{exp.position}</span>
                  <span className="text-[10px] text-cyan-400 font-mono shrink-0 whitespace-nowrap">
                    {exp.startDate} ~ {exp.current ? terms.present : exp.endDate}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-sans mb-1 break-words">{exp.company}</div>
                {exp.description && (
                  <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line font-sans mt-1 break-words">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects & Education Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Projects */}
        {projects && projects.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 uppercase font-bold tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>{terms.projects}</span>
            </div>
            <div className="space-y-2.5">
              {projects.map((p) => (
                <div key={p.id} className="bg-slate-800/40 p-2.5 rounded border border-slate-700/60 text-xs font-sans">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{p.title}</span>
                    {p.link && <Link className="w-3 h-3 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Languages */}
        <div className="space-y-4 font-sans text-xs">
          {education && education.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 uppercase font-bold tracking-wider mb-2 font-mono">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{terms.education}</span>
              </div>
              {education.map((edu) => (
                <div key={edu.id} className="text-slate-300">
                  <div className="font-bold text-white">{edu.institution}</div>
                  <div className="text-[11px] text-slate-400">{edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">{edu.startDate} - {edu.endDate}</div>
                </div>
              ))}
            </div>
          )}

          {languages && languages.length > 0 && (
            <div>
              <div className="text-xs text-cyan-400 uppercase font-bold tracking-wider mb-1 font-mono">
                // {terms.languages}
              </div>
              <div className="space-y-1">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between text-[11px] text-slate-300">
                    <span>{l.language}</span>
                    <span className="text-slate-500 font-mono">{l.proficiency}</span>
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
