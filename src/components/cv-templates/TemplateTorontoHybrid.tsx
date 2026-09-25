import React from 'react';
import { CVData } from '../../types';
import { getCVTerms, getPhotoClasses } from './cvDictionary';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, Briefcase, GraduationCap, CheckCircle2 } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  showPhoto?: boolean;
}

export const TemplateTorontoHybrid: React.FC<TemplateProps> = ({ data, showPhoto = true }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates, language } = data;
  const terms = getCVTerms(language);
  const displayPhoto = showPhoto && !!personalInfo.photoUrl;

  return (
    <div id="cv-preview-toronto-hybrid" className="bg-white text-slate-800 font-sans max-w-[800px] w-full mx-auto min-h-[1100px] text-left border border-slate-300 shadow-sm flex flex-row overflow-hidden">
      {/* Left Steel-Indigo Sidebar */}
      <div className="w-[280px] bg-[#1a2d42] text-slate-100 p-7 shrink-0 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Avatar & Core Identity */}
          <div className="text-center space-y-3">
            {displayPhoto ? (
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.fullName || 'Namizəd'}
                className={`${getPhotoClasses(personalInfo.photoSize, personalInfo.photoShape)} mx-auto border-2 border-sky-400 shadow-md bg-slate-800`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-sky-600 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-md">
                {personalInfo.fullName?.charAt(0) || 'T'}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight break-words">
                {personalInfo.fullName || 'Ad Soyad'}
              </h1>
              <p className="text-xs font-semibold text-sky-300 mt-1 uppercase tracking-wider break-words">
                {personalInfo.jobTitle || 'Vəzifə'}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-700/80">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-2">
              {terms.contact}
            </h3>
            {personalInfo.email && (
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{personalInfo.address}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2 min-w-0">
                <Linkedin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-2 min-w-0">
                <Github className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{personalInfo.github.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>

          {/* Skills with modern badge pills */}
          {skills && skills.length > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-slate-700/80">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                {terms.skills}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, idx) => (
                  <span
                    key={s.id || idx}
                    className="px-2 py-0.5 rounded bg-slate-800 text-sky-200 border border-slate-700 text-[11px] font-medium"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-700/80 text-xs">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                {terms.languages}
              </h3>
              <div className="space-y-1">
                {languages.map((l, idx) => (
                  <div key={l.id || idx} className="flex justify-between text-slate-300">
                    <span className="font-medium">{l.language}</span>
                    <span className="text-slate-400 text-[11px]">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Certifications in sidebar footer */}
        {certificates && certificates.length > 0 && (
          <div className="pt-3 border-t border-slate-700/80 text-xs text-slate-300 space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
              <Award className="w-3 h-3 text-sky-400" />
              <span>{terms.certificates}</span>
            </h3>
            {certificates.slice(0, 3).map((c, idx) => (
              <div key={c.id || idx} className="truncate text-[11px] text-slate-300">
                • {c.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Content Stream */}
      <div className="flex-1 p-8 space-y-6 bg-white overflow-hidden">
        {/* Executive Summary */}
        {personalInfo.summary && (
          <div className="space-y-1.5 pb-4 border-b border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a2d42]">
              {terms.aboutMe || terms.summary}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Professional Experience */}
        {experiences && experiences.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a2d42] flex items-center gap-2 border-b border-slate-200 pb-1">
              <Briefcase className="w-4 h-4 text-sky-600" />
              <span>{terms.experience}</span>
            </h2>
            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="space-y-1 text-xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <h3 className="text-sm font-bold text-slate-900">{exp.position || exp.role}</h3>
                    <span className="text-xs font-semibold text-sky-700">
                      {exp.period || `${exp.startDate} - ${exp.current ? terms.present : exp.endDate}`}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-600">
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line pt-0.5">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Projects Section */}
        <div className="space-y-5 pt-1">
          {education && education.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a2d42] flex items-center gap-2 border-b border-slate-200 pb-1">
                <GraduationCap className="w-4 h-4 text-sky-600" />
                <span>{terms.education}</span>
              </h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{edu.institution || edu.school}</span>
                      <span className="text-sky-700 font-semibold">
                        {edu.graduationYear || edu.endDate || (edu.current ? terms.present : '')}
                      </span>
                    </div>
                    <div className="text-slate-600 font-medium">
                      {edu.degree} {edu.fieldOfStudy && `— ${edu.fieldOfStudy}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects && projects.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a2d42] flex items-center gap-2 border-b border-slate-200 pb-1">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>{terms.projects}</span>
              </h2>
              <div className="space-y-2">
                {projects.map((proj, idx) => (
                  <div key={proj.id || idx} className="text-xs space-y-0.5">
                    <div className="font-bold text-slate-900">{proj.title}</div>
                    <p className="text-slate-600 line-clamp-2">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {proj.technologies.map((t, tIdx) => (
                          <span key={tIdx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
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
      </div>
    </div>
  );
};
