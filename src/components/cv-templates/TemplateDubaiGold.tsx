import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';
import { Mail, Phone, MapPin, Globe, Linkedin, Award, Briefcase, GraduationCap } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateDubaiGold: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-dubai-gold" className="bg-[#ffffff] text-slate-900 font-sans max-w-[800px] w-full mx-auto min-h-[1100px] text-left border border-amber-200/90 shadow-sm flex flex-col">
      {/* Luxury Gold & Navy Header */}
      <div className="bg-[#0b132b] text-white p-8 border-b-4 border-[#d4af37]">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="flex-1 min-w-0 space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white break-words">
              {personalInfo.fullName || 'Ad Soyad'}
            </h1>
            <p className="text-base sm:text-lg font-bold text-[#d4af37] tracking-wider uppercase break-words">
              {personalInfo.jobTitle || 'Regional Director / General Manager'}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-2 font-medium">
              {personalInfo.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                  {personalInfo.email}
                </span>
              )}
              {personalInfo.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                  {personalInfo.phone}
                </span>
              )}
              {personalInfo.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                  {personalInfo.address}
                </span>
              )}
              {personalInfo.linkedin && (
                <span className="flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5 text-[#d4af37]" />
                  {personalInfo.linkedin.replace(/^https?:\/\//, '')}
                </span>
              )}
            </div>
          </div>

          {displayPhoto && (
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} border-2 border-[#d4af37] shadow-lg shrink-0`}
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="p-8 grid grid-cols-12 gap-8 flex-1">
        {/* Left Column (Main: Summary & Experience) */}
        <div className="col-span-8 space-y-6">
          {/* Summary */}
          {personalInfo.summary && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#0b132b] border-b-2 border-[#d4af37] pb-1 mb-2.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                {terms.summary}
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experiences && experiences.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#0b132b] border-b-2 border-[#d4af37] pb-1 mb-3.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#d4af37]" />
                {terms.experience}
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-3.5 border-l-2 border-amber-300">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-xs font-bold text-slate-900">{exp.position}</span>
                      <span className="text-[10px] font-bold text-amber-800 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {exp.startDate} – {exp.current ? terms.present : exp.endDate}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 mb-1.5">
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </div>
                    {exp.description && (
                      <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line">
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
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#0b132b] border-b-2 border-[#d4af37] pb-1 mb-3">
                {terms.projects}
              </h2>
              <div className="space-y-2.5">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-amber-50/40 p-2.5 rounded-lg border border-amber-200/60">
                    <div className="text-xs font-bold text-slate-900">{proj.title}</div>
                    {proj.description && <p className="text-[11px] text-slate-700 mt-0.5">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div className="col-span-4 space-y-6 border-l border-amber-100 pl-6">
          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#0b132b] border-b-2 border-[#d4af37] pb-1 mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#d4af37]" />
                {terms.education}
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-[11px] text-amber-900 font-semibold">{edu.fieldOfStudy}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {edu.institution} • {edu.startDate} – {edu.endDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#0b132b] border-b-2 border-[#d4af37] pb-1 mb-3">
                {terms.skills}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((sk) => (
                  <span
                    key={sk.id}
                    className="text-[10px] font-bold px-2 py-1 rounded bg-[#0b132b] text-[#d4af37] border border-amber-400/30"
                  >
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#0b132b] border-b-2 border-[#d4af37] pb-1 mb-2.5">
                {terms.languages}
              </h2>
              <div className="space-y-1.5">
                {languages.map((l) => (
                  <div key={l.id} className="text-[11px] flex justify-between">
                    <span className="font-bold text-slate-800">{l.language}</span>
                    <span className="text-slate-500">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {certificates && certificates.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#0b132b] border-b-2 border-[#d4af37] pb-1 mb-2.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#d4af37]" />
                {terms.certificates}
              </h2>
              <div className="space-y-2">
                {certificates.map((c) => (
                  <div key={c.id} className="text-xs">
                    <div className="font-bold text-slate-900 text-[11px]">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.issuer} {c.issueDate && `• ${c.issueDate}`}</div>
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
